import { X } from '../cekirdek/tuval.js';
import { RESIM } from './resimler.js';

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
  // Kenar ışığı: kod çizimindekiyle aynı fikir (karakter.js) — lambaya
  // doğru kaydırılmış düz renkli kopya altta, yalnız ışığa bakan kenardan sızıyor.
  if(isik && isik.g > .04){
    const kay = 2.0 + isik.g*1.6;
    X.save();
    X.globalAlpha = Math.min(.95, isik.g); X.globalCompositeOperation = 'lighter';
    X.translate(sx + isik.x*kay, sy + isik.y*kay); X.rotate(aci);
    X.drawImage(siluet(r, poz, isik.renk), x0, y0, w, h);
    X.restore();
  }
  X.save();
  X.translate(sx, sy); X.rotate(aci);
  X.imageSmoothingQuality = 'high';
  X.drawImage(r.img, p.x, p.y, p.w, p.h, x0, y0, w, h);
  X.restore();
}
