import { kis, lerp } from '../cekirdek/matematik.js';
import { BOL, bolgeNo, LFARK, LHIZ0, SLACK } from './tanimlar.js';
import { salincakGerek } from './dunya.js';
import { bitir } from './akis.js';
import { paraTopla } from './para.js';
import { tutunSesi, paraSesi, olumSesi, seriSesi } from '../cekirdek/ses.js';
import { aktif, jokerAdim } from './joker.js';

// θ: düşey aşağıdan sapma. θ=0 asılı duruş.
export const oturX = s => s.x + s.L*Math.sin(s.th);
export const oturY = s => s.py - s.L*Math.cos(s.th);

// Oturağın dünya hızı: radyal (Ld) + teğetsel (L·ω) bileşen.
export function hizv(s){
  const c=Math.cos(s.th), n=Math.sin(s.th);
  return { x:(s.Ld||0)*n + s.L*s.om*c, y:-(s.Ld||0)*c + s.L*s.om*n };
}

export const ruzg = d => d.ruzgar*(.75+.25*Math.sin(d.t*.7+d.rfaz))*BOL[bolgeNo(d.i)].ruz*d.k.ruz;
export const yer  = d => BOL[bolgeNo(d.i)].g;

export const tutunmaR = d => 1.05*d.k.tut*(d.uzanma>0 ? 1.7 : 1);

// Yakalama anında yavaşlatma: tutunmaya kala zaman yavaşlıyor.
// Mesafeye değil TAHMİNİ VARIŞ SÜRESİNE (mesafe/hız) bakıyor — sabit bir
// mesafe eşiği hızlı ve yavaş atlayışlarda farklı hissederdi, ETA her
// hızda aynı "az kaldı" anını yakalıyor. Yumuşak geçiş (lerp) demeden
// kesilmesin diye; sert kesim zamanın aniden donması gibi hissettirir.
//
// İlk sürüm ESIK=.22 idi ve fark edilmiyordu: yakalama menzili (~1.05 m)
// tipik uçuş hızında (~6 m/s) zaten ETA≈.17 s'ye denk geliyor, yani
// "yavaşlama" başladığında zaten yakalama anındaydın — öncesi/sonrası
// karşılaştıracak zaman kalmıyordu. Pencereyi genişletip tabanı düşürdüm.
const YAVAS_ESIK = .34, YAVAS_TABAN = .26;
export function yavaslamaFaktoru(d){
  if(d.faz!=='ucus') return 1;
  const h=d.sal[d.i+1];
  if(!h) return 1;
  const dx=oturX(h)-d.px, dy=oturY(h)-d.py, dist=Math.hypot(dx,dy);
  const hiz=Math.hypot(d.vx,d.vy)||.001;
  const eta=dist/hiz;
  if(eta>=YAVAS_ESIK) return 1;
  return lerp(YAVAS_TABAN, 1, eta/YAVAS_ESIK);
}

// Pompa verimi: yüksek genlikte pompa daha az iş yapıyor.
//
// Sebep fizikte: E = mgL(1−cosA), yani dA/dE = 1/(mgL·sinA) ve A tepeye
// yaklaşırken sinA→0 — AYNI enerji artışı orada çok daha büyük bir açı
// sıçraması veriyor. Sabit LFARK ile merdiven 1.32 → 1.74 → 2.56 gidiyordu:
// son basamak 0.82 rad. Oyuncu 2.1 isteyip 2.56'ya fırlıyor, bazen de
// SLACK'i (2.95) aşıp tepeden düşüyordu — ara değer seçmek imkânsızdı.
// Verim eğrisiyle basamaklar ~0.3-0.4'e iniyor: 1.63 → 1.99 → 2.34 → 2.75.
//
// LFARK'a DOKUNMUYOR (§2): düşük genlikte verim 1, yani turun başındaki
// tempo (3-4 basışta havalanma) aynı kalıyor.
const POMPA_TAM = 1.0, POMPA_KISIK = 2.2, POMPA_TABAN = .35;
export const pompaVerimi = gen =>
  gen<=POMPA_TAM ? 1 : lerp(1, POMPA_TABAN, kis((gen-POMPA_TAM)/(POMPA_KISIK-POMPA_TAM),0,1));

export function bildir(d,m,c){ d.mesaj=m; d.mesajT=d.t; d.mesajRenk=c; }

// --- eylemler: saf durum geçişleri -----------------------------------
// Bunlar eskiden girdi.js'in içindeydi. Oraya AİT DEĞİLLER: girdi.js olay
// katmanı (hangi tuş, hangi dokunuş), bu ikisi ise oyunun kuralı. Ayrılma
// hayalet için şart oldu — geri oynatma aynı geçişi uygulamak zorunda,
// kopyalanmış bir ikinci sürüm er ya da geç asıldan ayrışırdı ve hayalet
// sessizce yanlış yere giderdi.
//
// İkisi de "işe yaradı mı" bilgisini döndürüyor: yalnız GERÇEKTEN etki
// eden basışlar kaydediliyor (bkz. oyun/hayalet.js) — yanlış zamanda
// basmak zaten cezasız ve etkisiz (§3), kaydı şişirmesinin anlamı yok.

// Dönüş: basışın kalitesi q (0..1), etkisizse −1.
export function pompaUygula(d){
  if(d.faz!=='salinim') return -1;
  const s=d.sal[d.i];
  if(s.poz==='ayakta') return -1;
  s.poz='ayakta'; s.pompaT=d.t;
  return 1-Math.min(1, Math.abs(s.th)/Math.max(.2,s.gen));
}

// Sallanırken atlar, havadayken uzanır. Düşerken hiçbir şey yapmıyor.
export function atlaUygula(d){
  if(d.faz==='salinim'){
    const s=d.sal[d.i], v=hizv(s);
    d.faz='ucus'; d.px=oturX(s); d.py=oturY(s); d.vx=v.x; d.vy=v.y; d.don=0; d.uzanma=0;
    s.poz='cokuk';
    return true;
  }
  if(d.faz==='ucus'){ d.uzanma=.38; return true; }
  return false;
}

// Şimdi atlarsan izleyeceğin yol — çizim bunu noktalı gösteriyor.
export function yorunge(d,adet){
  const s=d.sal[d.i], v=hizv(s), g=yer(d), yol=[];
  let x=oturX(s), y=oturY(s), vx=v.x, vy=v.y;
  for(let i=0;i<adet;i++){ const dt=.05;
    vx+=ruzg(d)*.35*dt; vy-=g*dt; x+=vx*dt; y+=vy*dt;
    yol.push({x,y}); if(y<0)break; }
  return yol;
}

// Tutunma: hızın yalnızca TEĞETSEL bileşeni korunur, radyal bileşen
// ipin gerilmesiyle kaybolur. Oyunun gizli becerisi bu.
export function yakala(d){
  const R=tutunmaR(d);
  for(let j=d.i+1;j<d.sal.length;j++){
    const s=d.sal[j];
    if(s.x-d.px>14) break;
    const dx=d.px-oturX(s), dy=d.py-oturY(s), m=Math.hypot(dx,dy);
    if(m<R){
      s.th=Math.atan2(d.px-s.x, s.py-d.py);
      s.L=kis(Math.hypot(d.px-s.x, s.py-d.py), s.Lk, s.Lu);
      const t={x:Math.cos(s.th), y:Math.sin(s.th)};
      s.om=(d.vx*t.x+d.vy*t.y)/s.L;
      s.yorgun=0; s.poz='cokuk'; s.pompaT=-9; s.gen=Math.max(.2,Math.abs(s.th));
      const atlanan=j-d.i-1;
      let c = d.uzanma>0 ? 1.6 : 1;
      if(atlanan>0) c*=1.9+atlanan*.6;
      // Seri: ardışık HARİKA geçişler. Harika = uzanarak yakalamak (havada
      // bilinçli ikinci dokunuş) ya da bir salıncağı atlayıp öteye tutunmak.
      // Düz tutunma seriyi sıfırlıyor — seri "yaptım" değil "üst üste
      // yaptım" demek. Skor çarpanı zaten buna bağlıydı (§8), yeni olan
      // görünür olması: ciz/seri.js alevli sayacı çiziyor.
      const harika = d.uzanma>0 || atlanan>0;
      d.seri = harika ? d.seri+1 : 0;
      if(harika){ d.seriT=d.t; d.enSeri=Math.max(d.enSeri||0, d.seri); }
      c *= 1+Math.min(.8,d.seri*.12);
      d.skor += Math.round((s.x-d.sal[d.i].x)*12*c);
      d.i=j; d.faz='salinim'; salincakGerek(d,d.i+3);
      bildir(d, atlanan>0 ? (atlanan+1)+' salıncak birden!' :
        d.uzanma>0 ? 'uzanarak yakaladın ×'+c.toFixed(1) : 'tutundun',
        atlanan>0?'#F2B33D':d.uzanma>0?'#79D9AC':'#E9E5F2');
      tutunSesi(atlanan>0 || d.uzanma>0);
      if(harika && d.seri>1) seriSesi(d.seri);
      return true;
    }
  }
  return false;
}

export function adim(d,dt){
  // Adım sayacı: hayalet kaydının zaman birimi bu. Gerçek saniye DEĞİL —
  // Odak jokeri ve yakalama yavaşlaması kare başına düşen adım sayısını
  // değiştiriyor (main.js), ama adımın kendisi hep ADIM kadar. İki turu
  // adım sayısıyla karşılaştırmak, o yüzden tek dürüst ölçü.
  d.adimNo++;
  d.t+=dt; d.sars=Math.max(0,d.sars-dt*3);
  if(d.uzanma>0) d.uzanma-=dt;
  jokerAdim(d,dt);
  const g=yer(d);

  // Para toplama: hem sallanırken hem uçarken. rng'ye dokunmuyor.
  const px = d.faz==='salinim' ? oturX(d.sal[d.i]) : d.px;
  const py = d.faz==='salinim' ? oturY(d.sal[d.i]) : d.py;
  const alinan = paraTopla(d, px, py, dt, aktif(d,'miknatis'));
  if(alinan){ d.para += alinan; d.skor += alinan*8; d.paraT = d.t; paraSesi(); }

  // boştaki salıncaklar kendi kendine sallanır
  for(let j=Math.max(0,d.i-1); j<d.sal.length; j++){
    if(j===d.i && d.faz==='salinim') continue;
    const s=d.sal[j];
    s.om += (-(g/s.L)*Math.sin(s.th) - .35*s.om)*dt;
    s.th += s.om*dt;
    s.L += ((s.Lu-s.L))*3*dt;
  }

  if(d.faz==='salinim'){
    const s=d.sal[d.i];
    // çömelme otomatik: uçta (|ω|<.30) ya da 1.4 s sonra, en az .25 s bekleyerek
    if(s.poz==='ayakta' && (Math.abs(s.om)<.30||d.t-s.pompaT>1.4) && d.t-s.pompaT>.25) s.poz='cokuk';

    // L' ASLA ani olmamalı — yumuşak yaklaşma. (hedef-L)/dt yazarsan oyun patlar.
    const gezi=LFARK*d.k.pompa*pompaVerimi(s.gen), hedef = s.poz==='ayakta' ? s.Lu-gezi : s.Lu;
    s.Ld = kis((hedef-s.L)*6.5, -LHIZ0*d.k.pompa, LHIZ0*d.k.pompa);
    s.L  = kis(s.L+s.Ld*dt, s.Lu-gezi, s.Lu);

    // ω' = −(g/L)sinθ − 2(L'/L)ω − cω + rüzgâr·0.05·cosθ
    const once=s.om;
    s.om += (-(g/s.L)*Math.sin(s.th) - 2*(s.Ld/s.L)*s.om - .035*s.om + ruzg(d)*.05*Math.cos(s.th))*dt;
    s.th += s.om*dt;
    if(once*s.om<0) s.gen=Math.abs(s.th);

    // zincir yorgunluğu — her salıncakta sıfırlanır, kalıcı yapma.
    // Katsayı için bkz. CLAUDE.md §5: çubuk pompa başına değil, YÜKSEKTE
    // GEÇİRİLEN SANİYE başına doluyor. .30 iken 2.4 rad'da 3.6 saniyede,
    // 2.6 rad'da 1.6 saniyede kopuyordu — ormanda gereken genlik zaten
    // 2.0-2.5 olduğu için oyuncu nişan alacak vakit bulamadan ölüyordu.
    const T=g*Math.cos(s.th)+s.L*s.om*s.om;
    if(T>s.dayanim && !aktif(d,'zincir')) s.yorgun += (T-s.dayanim)*dt*.14/d.k.zincir;
    if(s.yorgun>=1){ d.sars=1; d.px=oturX(s); d.py=oturY(s);
      const v=hizv(s); d.vx=v.x; d.vy=v.y; d.faz='dusus'; d.sebep='kopma'; return; }
    if(Math.abs(s.th)>SLACK){ d.px=oturX(s); d.py=oturY(s); d.vx=0; d.vy=0;
      d.faz='dusus'; d.sebep='bosluk'; return; }
    d.mesafe=Math.max(d.mesafe, oturX(s));

  } else if(d.faz==='ucus'||d.faz==='dusus'){
    const su=.016*Math.hypot(d.vx,d.vy);
    d.vx += (ruzg(d)*.35 - d.vx*su)*dt;
    d.vy += (-g - d.vy*su)*dt;
    d.px += d.vx*dt; d.py += d.vy*dt;
    d.don += (d.vx>=0?1:-1)*dt*3.2;
    d.mesafe=Math.max(d.mesafe,d.px);
    if(d.faz==='ucus' && yakala(d)) return;
    if(d.py<=0){ d.py=0; d.sars=1; if(!d.sebep) d.sebep='dusme'; olumSesi(); return bitir(d); }
  }
}
