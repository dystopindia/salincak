import { X } from '../cekirdek/tuval.js';
import { ekr, PM } from '../cekirdek/kamera.js';
import { RESIM, ISKELET } from './resimler.js';
import { renkKar } from '../cekirdek/matematik.js';
import { BOL } from '../oyun/tanimlar.js';

// Resimli karakterler (sprite). Resmi olan karakter resimle, olmayan eskisi
// gibi kodla çiziliyor (karakter.js) — karakterler tek tek geçebilsin diye.
// Resim yüklenene kadar (ya da yüklenemezse) de kod çizimi kullanılıyor:
// oyun hiçbir zaman boş bir figürle açılmıyor.
//
// Resimler dışarıda çizdirildi (ChatGPT), sprite.py ile kırpılıp ölçeklendi.
// Poz başına bir DÖNME NOKTASI var (resimler.js, ox/oy): salıncakta oturma
// noktası ya da ayak tabanı, havada gövde ortası. Figür eskisi gibi bu nokta
// etrafında −θ ile dönüyor (§1).

const RES = {};
for(const id in RESIM){
  const r = RESIM[id], img = new Image();
  const giris = { ...r, img, hazir:false, ton:new Map() };
  img.onload = ()=>{ giris.hazir = true; };
  img.src = r.dosya;
  RES[id] = giris;
}

export const spriteVar = k => !!(k && RES[k.id] && RES[k.id].hazir);
// Parkur pozları (kosu1-4, zipla, inis) karakter karakter geliyor; olmayan
// karakter koşuyu eski yoldan çiziyor (ayakta pozu sekerek, sahne.js).
export const pozVar = (k, poz) => spriteVar(k) && !!RES[k.id].pozlar[poz];

// Zincirlerin oturak ekseninde geçtiği yer (ekran px). Kod çizimi için null:
// salincak.zincirCiz eski metrik aralığı (ZAYRIM) kullanıyor.
export const elAraligi = k => spriteVar(k) ? RES[k.id].el : null;

// Kenar ışığı için pozun lamba renginde düz silüeti. Her karede üretmek
// yerine renk başına bir kez (5 bölge × 4 poz = en çok 20 küçük tuval).
function siluet(r, poz, renk){
  const anahtar = poz + renk;
  let t = r.ton.get(anahtar);
  if(t) return t;
  const p = r.pozlar[poz];
  t = document.createElement('canvas');
  t.width = p.w; t.height = p.h;
  const c = t.getContext('2d');
  c.drawImage(r.img, p.x, p.y, p.w, p.h, 0, 0, p.w, p.h);
  c.globalCompositeOperation = 'source-in';
  c.fillStyle = renk; c.fillRect(0, 0, p.w, p.h);
  r.ton.set(anahtar, t);
  return t;
}

// poz: 'otur' | 'ayakta' | 'ucus' | 'uzan'.  isik: kenarIsik() ya da null.
export function spriteCiz(sx, sy, aci, poz, k, isik){
  const r = RES[k.id], p = r.pozlar[poz] || r.pozlar.otur, o = 1/r.depo;
  const x0 = -p.ox*o, y0 = -p.oy*o, w = p.w*o, h = p.h*o;
  // alfa: karakterin kendi saydamlığı (hayalet .82). Çarpılıyor, ezmiyor:
  // rakip hayalet (§10) karakteri zaten soluk çiziyor, ikisi üst üste biner.
  const a0 = X.globalAlpha * (r.alfa ?? 1);
  // Kenar ışığı: kod çizimindekiyle aynı fikir (karakter.js) — lambaya
  // doğru kaydırılmış düz renkli kopya altta, yalnız ışığa bakan kenardan sızıyor.
  if(isik && isik.g > .04){
    const kay = 2.0 + isik.g*1.6;
    X.save();
    X.globalAlpha = Math.min(.95, isik.g) * a0; X.globalCompositeOperation = 'lighter';
    X.translate(sx + isik.x*kay, sy + isik.y*kay); X.rotate(aci);
    X.drawImage(siluet(r, poz, isik.renk), x0, y0, w, h);
    X.restore();
  }
  X.save();
  X.globalAlpha = a0;
  X.translate(sx, sy); X.rotate(aci);
  X.imageSmoothingQuality = 'high';
  X.drawImage(r.img, p.x, p.y, p.w, p.h, x0, y0, w, h);
  X.restore();
}

// --- salıncak iskeletleri ------------------------------------------------
// Beş bölge, beş kostüm (BOL sırasıyla); her salıncak kendi bölgesininkini
// giyiyor (s.bol — üretildiği andaki bölge). Zincir ve oturak KODDA kalıyor:
// sallanıyorlar, dönüyorlar ve yoruldukça halkaları uzayıp inceliyor (§6.12)
// — o uzama "kopmak üzere" uyarısı, resme dönerse kaybolurdu.
const isk = { img:new Image(), hazir:false, perde:null };
isk.img.onload = ()=>{ isk.perde = gecePerdeleri(); isk.hazir = true; };
isk.img.src = ISKELET.dosya;

// Yatay daraltma. Resimde ayak açıklığı pivot yüksekliğinin 1.16 katı:
// 4.9 m'lik bir salıncakta ~5.7 m — en dar boşluk 5 m (§6), yan yana iki
// salıncağın ayakları üst üste biniyordu (ilk ekran görüntüsünde oldu).
// .78 ile ~0.9 kat: eski çizimdeki ±2.4 m. Bacaklar biraz dikleşiyor, bu
// stilde göze batmıyor.
const ISK_EN = .78;

// Gece perdesi: resim gündüz renkleriyle çizildi, gece sahnesine olduğu
// gibi konunca yapıştırılmış gibi duruyor ve karakteri, paraları, yörünge
// çizgisini bastırıyordu (eski iskelet bilerek koyu, silüet gibiydi).
// Her kareye kendi bölgesinin gece tonunda düz bir silüet; gece bunun
// alfasıyla üstüne biniyor. FENER HARİÇ: silüetten fenerin çevresi
// oyuluyor — ışık kaynağı kararmamalı, bloom (§6.15) onu yakalamalı.
const GECE_KOYU = .62, FENER_YARICAP = 34;
function gecePerdeleri(){
  return ISKELET.kareler.map((k, i)=>{
    const t = document.createElement('canvas');
    t.width = k.w; t.height = k.h;
    const c = t.getContext('2d');
    c.drawImage(isk.img, k.x, k.y, k.w, k.h, 0, 0, k.w, k.h);
    c.globalCompositeOperation = 'source-in';
    const B = BOL[i % BOL.length];
    c.fillStyle = renkKar(B.on, B.gok[1], .5);
    c.fillRect(0, 0, k.w, k.h);
    c.globalCompositeOperation = 'destination-out';
    const g = c.createRadialGradient(k.fx, k.fy, 0, k.fx, k.fy, FENER_YARICAP);
    g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(.6, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g; c.beginPath(); c.arc(k.fx, k.fy, FENER_YARICAP, 0, 6.3); c.fill();
    return t;
  });
}

export const iskeletVar = () => isk.hazir;
const iskNo = s => (s.bol|0) % ISKELET.kareler.length;
const iskKare = s => ISKELET.kareler[iskNo(s)];

// DÜNYA ölçeğinde: resimdeki kiriş-zemin yüksekliği salıncağın pivot
// yüksekliğine (s.py, 4.4-5.4 m) eşitleniyor — karakter gibi sabit piksel
// DEĞİL, salıncak dünyanın parçası. Yüksekliği farklı salıncaklar orantılı
// büyüyüp küçülüyor; ayak açıklığı (~pivot yüksekliği) eski çizimdeki
// ±2.4 m ile aynı, 5 m'lik en dar boşlukta bile komşuyla çakışmıyor.
// gece: 0 öğle, 1 gece yarısı (sahne.ciz'den; gökyüzüyle aynı eğri).
export function iskeletCiz(s, gece=0){
  const k = iskKare(s), u = s.py*PM/(k.ty - k.py), ux = u*ISK_EN, p = ekr(s.x, s.py);
  const x = p.sx - k.px*ux, y = p.sy - k.py*u, w = k.w*ux, h = k.h*u;
  X.drawImage(isk.img, k.x, k.y, k.w, k.h, x, y, w, h);
  if(gece > .02){
    X.globalAlpha = gece*GECE_KOYU;
    X.drawImage(isk.perde[iskNo(s)], x, y, w, h);
    X.globalAlpha = 1;
  }
}

// Resimdeki fenerin dünya konumu — ışık havuzu ve kenar ışığı oradan
// yayılsın (isik.lambaKonum). Resim yoksa null: eski sabit konum.
export function iskeletFener(s){
  if(!isk.hazir) return null;
  const k = iskKare(s), m = s.py/(k.ty - k.py);
  return { x: s.x + (k.fx - k.px)*m*ISK_EN, y: s.py - (k.fy - k.py)*m };
}
