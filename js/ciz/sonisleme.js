import { K } from '../cekirdek/tuval.js';
import { lerp } from '../cekirdek/matematik.js';
import { BOL } from '../oyun/tanimlar.js';
import { kayit } from '../cekirdek/kayit.js';
import { gunEvresi, bolgeKarisimi } from './zaman.js';

// WebGL son işleme: bloom + biyom başına renk derecelendirmesi.
//
// MEVCUT 2D ÇİZİMİN ÜSTÜNE bir katman, yerine değil. Sahne her karede eskisi
// gibi 2D tuvale çiziliyor; burada o tuval bir dokuya kopyalanıp shader'dan
// geçiriliyor ve üstteki ikinci bir tuvale (GL) basılıyor. Çizim kodunun tek
// satırı değişmedi — bu yüzden geri alınabilir: WebGL yoksa, bağlam düşerse
// ya da oyuncu ayarlardan kapatırsa 2D tuval olduğu gibi görünmeye devam
// ediyor. Bağımlılık yok, düz WebGL 1.
//
// Neden 2D'de yapılamıyordu: canvas 2D'nin piksel başına efekti yok. Işığı
// 'lighter' ile taklit ediyorduk ve iki kez patladı — seri alevi (§8) ve
// rüzgâr çizgileri (§6.14) gündüz gökte beyaza doyup kayboldu. Bloom gerçek
// bir parıltı: parlak pikselleri ayıklayıp bulanıklaştırıp geri ekliyor.
//
// Tuval düzeni: GL tuvali 2D tuvalin ÜSTÜNDE, pointer-events:none. 2D tuval
// opacity:0 ile yerinde duruyor — dokunuşları HÂLÂ o alıyor (girdi.js ona
// bağlı; opacity:0 olan öğe olay alır, visibility:hidden olan almaz).

// --- biyom başına derece ------------------------------------------------
// golge/isik: karanlık ve aydınlık tonlara ÇARPAN (split toning). 1'e yakın
// tutuluyor: derece bir İMA, palet değişimi değil — mevsim boyasında
// öğrenilen ders (§6.11: %18-42 karışım bölgeyi değişmiş gibi gösterdi).
// bloom: parıltı gücü. Uzayda yüksek (lambalar ve yıldızlar karanlıkta),
// orman'da düşük (sisli, yumuşak).
const DERECE = [
  { golge:[.97,.93,1.07], isik:[1.07,1.00,.90], doy:1.08, kon:1.06, bloom:1.00 },  // park: mor gölge, kehribar ışık
  { golge:[.92,1.03,1.00], isik:[1.05,1.02,.92], doy:.94,  kon:1.04, bloom:.85 },  // orman: yeşil-deniz gölge, sıcak ışık
  { golge:[1.05,.95,1.07], isik:[1.06,.98,1.03], doy:1.05, kon:.96,  bloom:1.10 }, // bulutlar: eflatun, havadar
  { golge:[.90,.96,1.13], isik:[1.00,1.02,1.08], doy:.92,  kon:1.12, bloom:1.30 }, // yörünge: soğuk, sert
  { golge:[.92,1.02,1.10], isik:[.98,1.06,1.08], doy:.95,  kon:1.10, bloom:1.20 }, // buz: camgöbeği
];

// Bloom eşiği GÜNDÜZE bağlı. Eşik sabit olsaydı gündüz açık gökyüzü
// (en parlak kanalı ~.9) de "parlak" sayılıp bütün ekranı yıkardı. Parıltı
// bir gece olgusu — lambaların ışığı da gündüz zaten sönüyor (§6.11).
// Ayarlar tek nesnede: konsoldan canlı denenebilsin (window.salincak gibi
// bir hata ayıklama kolaylığı). Sayılar önce/sonra ekran görüntüleriyle
// seçildi, üç deneme:
//   eşik .50, güç 1.0  → fark neredeyse görünmüyordu (çeyrek çözünürlükte
//                        bulanıklaşınca parıltının enerjisi fazla yayılıyor)
//   eşik .42, güç 2.2  → parıltı var ama aydınlık tepeler de eşiğin üstünde:
//                        orta bant bütünüyle puslandı, kontrast kayboldu
//   eşik .62, güç 2.4  → yalnız ışık kaynakları (lamba, para, ay, alev) ışıyor
// genis: sekizde bir çözünürlükteki bulanıklık kaç kez — 2 daha yumuşak hale.
export const EFEKT = { esikGece:.62, esikGun:.90, gucGece:2.4, gucGun:.60, genis:2 };

// --- shader'lar ------------------------------------------------------------
const VS = `attribute vec2 p; varying vec2 uv;
void main(){ uv=p*.5+.5; gl_Position=vec4(p,0.,1.); }`;

// Parlak geçiş: 4 dokunuşla küçültürken (titreşmesin) eşiğin üstünü ayıklar.
// Yumuşak diz: eşikte keskin bir kesim, hareketli bir lambanın parıltısını
// kare kare açıp kapatırdı.
const FS_PARLAK = `precision mediump float;
uniform sampler2D t; uniform vec2 px; uniform float esik; varying vec2 uv;
void main(){
  vec3 c=( texture2D(t,uv+px*vec2(-1.,-1.)).rgb + texture2D(t,uv+px*vec2(1.,-1.)).rgb
         + texture2D(t,uv+px*vec2(-1.,1.)).rgb  + texture2D(t,uv+px*vec2(1.,1.)).rgb )*.25;
  float l=max(c.r,max(c.g,c.b)), diz=.18;
  float y=clamp(l-esik+diz,0.,2.*diz); y=y*y/(4.*diz);
  gl_FragColor=vec4(c*max(y,l-esik)/max(l,1e-4),1.);
}`;

// Ayrılabilir Gauss, 9 dokunuş = doğrusal süzgeçle 5 okuma.
const FS_BULANIK = `precision mediump float;
uniform sampler2D t; uniform vec2 yon; varying vec2 uv;
void main(){
  vec3 c=texture2D(t,uv).rgb*.2270270270;
  c+=(texture2D(t,uv+yon*1.3846153846).rgb+texture2D(t,uv-yon*1.3846153846).rgb)*.3162162162;
  c+=(texture2D(t,uv+yon*3.2307692308).rgb+texture2D(t,uv-yon*3.2307692308).rgb)*.0702702703;
  gl_FragColor=vec4(c,1.);
}`;

const FS_KUCULT = `precision mediump float;
uniform sampler2D t; uniform vec2 px; varying vec2 uv;
void main(){
  gl_FragColor=vec4(( texture2D(t,uv+px*vec2(-.5,-.5)).rgb + texture2D(t,uv+px*vec2(.5,-.5)).rgb
                    + texture2D(t,uv+px*vec2(-.5,.5)).rgb  + texture2D(t,uv+px*vec2(.5,.5)).rgb )*.25,1.);
}`;

// Birleştirme. Bloom "screen" ile ekleniyor, toplama değil: 1'i hiç aşmıyor,
// zaten parlak olan yerleri beyaza yakmıyor. Sonra derece: ton, doygunluk,
// kontrast. Kontrastın ekseni .4 — koyu bir oyun, orta gri ekseni gölgeleri
// ezerdi.
const FS_SON = `precision mediump float;
uniform sampler2D sahne, yakin, uzak;
uniform float guc, doy, kon; uniform vec3 golge, isik; varying vec2 uv;
void main(){
  vec3 c=texture2D(sahne,uv).rgb;
  vec3 b=(texture2D(yakin,uv).rgb*.55+texture2D(uzak,uv).rgb*.85)*guc;
  c=1.-(1.-c)*(1.-clamp(b,0.,1.));
  float l=dot(c,vec3(.2126,.7152,.0722));
  c*=mix(golge,isik,smoothstep(.08,.8,l));
  l=dot(c,vec3(.2126,.7152,.0722));
  c=mix(vec3(l),c,doy);
  c=(c-.4)*kon+.4;
  gl_FragColor=vec4(clamp(c,0.,1.),1.);
}`;

// --- durum -----------------------------------------------------------------
let GL = null, glTuval = null, bozuk = false, gorunur = false;

// Bekçi: efekt açıkken kareler SÜREKLİ yavaşsa bu oturum için kapat.
// Ölçüm (Intel Iris Xe, 1480×720 = 2× yoğunluklu yatay telefonun piksel
// sayısı): 2D tuvali dokuya yüklemek ~2.9 ms, geçişler ~1.2 ms. Telefon
// GPU'su 2-4 kat yavaş olabilir — sınırda. Kare arası 24 ms'yi (≈41 fps)
// aşarsa süre birikiyor, hızlı karelerde yarı hızla sönüyor; 4 s birikince
// kapanıyor. Anlık takılmalar (çöp toplama, bildirim) böylece tetiklemiyor.
// Kalıcı DEĞİL: ayar açık kalıyor, sonraki açılışta yeniden deneniyor.
// Yavaşlığın sebebi efekt olmayabilir (2D de yavaş olabilir) — ama efekt
// süs, oyun değil; kuşkuda kapatmak doğru taraf.
const BEKCI_ARA = 24, BEKCI_SURE = 4000;
let bekciT = 0, yavasBirikim = 0, oturumKapali = false;
let prParlak, prBulanik, prKucult, prSon, sahneDoku = null;
let ceyrekA, ceyrekB, sekizA, sekizB, boyW = 0, boyH = 0;

function glShader(tip, kaynak){
  const s = GL.createShader(tip);
  GL.shaderSource(s, kaynak); GL.compileShader(s);
  if(!GL.getShaderParameter(s, GL.COMPILE_STATUS)) throw new Error(GL.getShaderInfoLog(s));
  return s;
}
function glProgram(fs){
  const p = GL.createProgram();
  GL.attachShader(p, glShader(GL.VERTEX_SHADER, VS));
  GL.attachShader(p, glShader(GL.FRAGMENT_SHADER, fs));
  GL.bindAttribLocation(p, 0, 'p');
  GL.linkProgram(p);
  if(!GL.getProgramParameter(p, GL.LINK_STATUS)) throw new Error(GL.getProgramInfoLog(p));
  const yer = {};
  return { p, u: ad => (ad in yer) ? yer[ad] : (yer[ad] = GL.getUniformLocation(p, ad)) };
}
function glDoku(w, h){
  const t = GL.createTexture();
  GL.bindTexture(GL.TEXTURE_2D, t);
  GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
  GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
  GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);   // 2'nin kuvveti
  GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);   // olmayan boyut için şart
  if(w) GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, w, h, 0, GL.RGBA, GL.UNSIGNED_BYTE, null);
  return t;
}
function glHedef(w, h){
  const t = glDoku(w, h), f = GL.createFramebuffer();
  GL.bindFramebuffer(GL.FRAMEBUFFER, f);
  GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, t, 0);
  return { t, f, w, h };
}

function glKur(){
  try{
    glTuval = document.createElement('canvas');
    glTuval.id = 'gl';
    K.after(glTuval);
    GL = glTuval.getContext('webgl', { alpha:false, antialias:false, depth:false,
                                       stencil:false, premultipliedAlpha:false });
    if(!GL) throw new Error('WebGL yok');
    // Bağlam düşerse (sekme arka planda, sürücü sıfırlandı) 2D'ye dön;
    // geri gelirse kaynakları yeniden kur.
    glTuval.addEventListener('webglcontextlost', e=>{ e.preventDefault(); bozuk=true; glGizle(); });
    glTuval.addEventListener('webglcontextrestored', ()=>{ kaynakKur(); bozuk=false; });
    kaynakKur();
    return true;
  }catch(e){
    bozuk = true; GL = null;
    if(glTuval){ glTuval.remove(); glTuval = null; }
    return false;
  }
}

function kaynakKur(){
  prParlak = glProgram(FS_PARLAK); prBulanik = glProgram(FS_BULANIK);
  prKucult = glProgram(FS_KUCULT); prSon = glProgram(FS_SON);
  const b = GL.createBuffer();
  GL.bindBuffer(GL.ARRAY_BUFFER, b);
  GL.bufferData(GL.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), GL.STATIC_DRAW);  // tek üçgen ekranı örter
  GL.enableVertexAttribArray(0);
  GL.vertexAttribPointer(0, 2, GL.FLOAT, false, 0, 0);
  // 2D tuvalin ilk satırı üst kenar; GL'de v=0 alt kenar.
  GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);
  sahneDoku = glDoku(0, 0);
  boyW = boyH = 0;                                   // hedefler ilk karede boyutlanıyor
}

function glBoyutla(w, h){
  if(w===boyW && h===boyH) return;
  for(const x of [ceyrekA, ceyrekB, sekizA, sekizB]) if(x){ GL.deleteTexture(x.t); GL.deleteFramebuffer(x.f); }
  const q = [Math.max(1,Math.ceil(w/4)), Math.max(1,Math.ceil(h/4))];
  const e = [Math.max(1,Math.ceil(w/8)), Math.max(1,Math.ceil(h/8))];
  ceyrekA = glHedef(q[0], q[1]); ceyrekB = glHedef(q[0], q[1]);
  sekizA = glHedef(e[0], e[1]);  sekizB = glHedef(e[0], e[1]);
  glTuval.width = w; glTuval.height = h;
  boyW = w; boyH = h;
}

function glGec(pr, h, dokular){
  GL.bindFramebuffer(GL.FRAMEBUFFER, h ? h.f : null);
  GL.viewport(0, 0, h ? h.w : boyW, h ? h.h : boyH);
  GL.useProgram(pr.p);
  dokular.forEach(([ad, t], i)=>{
    GL.activeTexture(GL.TEXTURE0 + i); GL.bindTexture(GL.TEXTURE_2D, t); GL.uniform1i(pr.u(ad), i);
  });
  GL.drawArrays(GL.TRIANGLES, 0, 3);
}

function bulaniklastir(a, b){
  GL.useProgram(prBulanik.p);
  GL.uniform2f(prBulanik.u('yon'), 1/a.w, 0); glGec(prBulanik, b, [['t', a.t]]);
  GL.useProgram(prBulanik.p);
  GL.uniform2f(prBulanik.u('yon'), 0, 1/a.h); glGec(prBulanik, a, [['t', b.t]]);
}

function glGoster(){ if(!gorunur){ document.body.classList.add('efekt'); gorunur = true; } }
function glGizle(){ if(gorunur){ document.body.classList.remove('efekt'); gorunur = false; } }

export const efektVarMi = () => !!GL && !bozuk && !oturumKapali;

function bekci(){
  const simdi = performance.now(), ara = simdi - bekciT;
  bekciT = simdi;
  if(ara <= 0 || ara > 250) return;               // sekme değişimi, ilk kare
  if(ara > BEKCI_ARA) yavasBirikim += ara;
  else yavasBirikim = Math.max(0, yavasBirikim - ara*.5);
  if(yavasBirikim > BEKCI_SURE) oturumKapali = true;
}

// Her çizilen karede, sahne.ciz'den hemen sonra (main.js).
export function sonIsle(d){
  if(!kayit.efekt || bozuk || oturumKapali){ glGizle(); return; }
  bekci();
  if(oturumKapali){ glGizle(); return; }         // bu karede tetiklendiyse bu kareyi de 2D göster
  if(!GL && !glKur()){ glGizle(); return; }
  const w = K.width, h = K.height;
  if(!w || !h) return;
  glBoyutla(w, h);

  // Biyom geçişi: gökyüzü ve hava ile aynı b1/b2/t (zaman.bolgeKarisimi).
  const { b1, b2, t } = bolgeKarisimi(d);
  const A = DERECE[b1] || DERECE[0], B = DERECE[b2] || DERECE[0];
  const gun = lerp(gunEvresi(d, BOL[b1].gunEtki).gunGuc, gunEvresi(d, BOL[b2].gunEtki).gunGuc, t);

  GL.activeTexture(GL.TEXTURE0);
  GL.bindTexture(GL.TEXTURE_2D, sahneDoku);
  GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, K);

  GL.useProgram(prParlak.p);
  GL.uniform2f(prParlak.u('px'), 1/w, 1/h);
  GL.uniform1f(prParlak.u('esik'), lerp(EFEKT.esikGece, EFEKT.esikGun, gun));
  glGec(prParlak, ceyrekA, [['t', sahneDoku]]);
  bulaniklastir(ceyrekA, ceyrekB);                  // yakın, dar parıltı

  GL.useProgram(prKucult.p);
  GL.uniform2f(prKucult.u('px'), 1/ceyrekA.w, 1/ceyrekA.h);
  glGec(prKucult, sekizA, [['t', ceyrekA.t]]);
  for(let k=0;k<EFEKT.genis;k++) bulaniklastir(sekizA, sekizB);   // uzak, geniş hale

  GL.useProgram(prSon.p);
  GL.uniform1f(prSon.u('guc'), lerp(A.bloom, B.bloom, t) * lerp(EFEKT.gucGece, EFEKT.gucGun, gun));
  GL.uniform1f(prSon.u('doy'), lerp(A.doy, B.doy, t));
  GL.uniform1f(prSon.u('kon'), lerp(A.kon, B.kon, t));
  GL.uniform3f(prSon.u('golge'), ...A.golge.map((v,i)=>lerp(v, B.golge[i], t)));
  GL.uniform3f(prSon.u('isik'),  ...A.isik.map((v,i)=>lerp(v, B.isik[i], t)));
  glGec(prSon, null, [['sahne', sahneDoku], ['yakin', ceyrekA.t], ['uzak', sekizA.t]]);

  glGoster();          // ilk başarılı kareden SONRA: öncesinde boş GL tuvali menüyü karartırdı
}

// Ayarlardan kapatılınca 2D tuval hemen görünsün (bir sonraki kareyi beklemeden).
export function efektKapat(){ glGizle(); }
