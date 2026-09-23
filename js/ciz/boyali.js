import { X, W, H, sakin } from '../cekirdek/tuval.js';
import { ekrK, kamX, KATMAN, PM } from '../cekirdek/kamera.js';
import { kis, lerp, renkKar, parlaklik } from '../cekirdek/matematik.js';
import { BOL } from '../oyun/tanimlar.js';
import { ruzg } from '../oyun/fizik.js';
import { BOYALI } from './resimler.js';

// Boyalı arka plan katmanları: dışarıda çizdirilmiş (ChatGPT), sprite.py ile
// kırpılıp kenarları harmanlanmış resimler. Resmi olan bölge resimle,
// olmayan eskisi gibi kodla çiziliyor (katmanlar.js) — bölgeler tek tek
// geçebilsin diye. Şimdilik yalnız park.
//
// Kodun yaptığı üç şey, resmin yapamadığı:
// 1. TEKRAR. Dünya sonsuz; resim kendi genişliği kadar aralıkla yan yana
//    diziliyor. Ölçek katmana göre DEĞİŞMİYOR (§6.5): uzaklık hissi yavaş
//    kaymadan ve sisten, resmin kendi perspektifinden geliyor.
// 2. GECE. Resim gündüz çizildi; üstüne bölgenin gece tonunda düz bir
//    silüet, gündüz eğrisiyle binen alfayla. Sis de aynı yolla: uzak katman
//    gündüz de hafif puslu (atmosferik perspektif, §6.5'teki sıra: uzak en
//    açık, ön en koyu).
// 3. RÜZGÂR. Ön plan otları kodda rüzgâra yatıyordu (§6.14, dört okumadan
//    biri); resim sabit olduğu için katman tabanından yukarı doğru artan bir
//    kaydırmayla (shear) EĞİLİYOR — otlar yine rüzgâra yatıyor.
//
// Yerler ve boylar burada (tasarım kararı), resmin özellikleri resimler.js'te.
// yuk: resmin (kırpılmış) dünya yüksekliği, taban: alt kenarının dünya y'si.
// Sayılar yatay telefonda (740×360) ekran görüntüsüyle seçildi.
const YER = {
  0: {
    uzak: { k:KATMAN.uzak, yuk:3.7, taban:1.4,  perde:[.28,.78], sis:.85, isik:1.18 },
    orta: { k:KATMAN.orta, yuk:3.3, taban:.05,  perde:[.10,.70], sis:.40, isik:.62 },
    on:   { k:KATMAN.on,   yuk:1.5, taban:-2.6, perde:[.40,.86], on:true },
  },
};

const BOYA = {};
for(const b in BOYALI){
  BOYA[b] = {};
  for(const ad in BOYALI[b]){
    const r = BOYALI[b][ad], img = new Image();
    const g = { ...r, img, hazir:false, perde:null, renk:null };
    img.onload = ()=>{ g.perde = perdeKur(g, +b, ad); g.hazir = true; };
    img.src = r.dosya;
    BOYA[b][ad] = g;
  }
}

// Perde rengi: kod katmanının kullandığı sisli renkle AYNI (katmanlar.sis:
// zemin↔ufuk karışımı + parlaklık). Böylece resimli ve resimsiz bölgeler
// gece aynı tonlara iniyor. Ön plan bölgenin ön rengine (neredeyse siyah).
function perdeRenk(b, ad){
  const B = BOL[b], y = YER[b][ad];
  return y.on ? B.on : parlaklik(renkKar(B.yer, B.gok[2], y.sis), y.isik);
}
function perdeKur(g, b, ad){
  g.renk = perdeRenk(b, ad);
  const t = document.createElement('canvas');
  t.width = g.w; t.height = g.h;
  const c = t.getContext('2d');
  c.drawImage(g.img, 0, 0);
  c.globalCompositeOperation = 'source-in';
  c.fillStyle = g.renk; c.fillRect(0, 0, g.w, g.h);
  return t;
}

export const boyaliVar = (b, ad) => !!(BOYA[b] && BOYA[b][ad] && BOYA[b][ad].hazir);

// gece: 0 öğle, 1 gece yarısı.
export function boyaliCiz(b, ad, gece, d){
  const g = BOYA[b][ad], y = YER[b][ad], k = y.k;
  const a = lerp(y.perde[0], y.perde[1], gece);
  const mpp = y.yuk / g.h, tg = g.w * mpp;            // tekrar genişliği (m)
  const ust = ekrK(0, y.taban + y.yuk, k).sy, alt = ekrK(0, y.taban, k).sy;
  const h = alt - ust, wEkran = tg*PM;
  const yari = (W/PM)*.62 + tg;
  const bas = Math.floor((kamX*k - yari)/tg)*tg, son = kamX*k + yari;

  X.save();
  if(y.on){
    // Rüzgâr eğimi: tabandan yukarı doğru x kayması (yatma boyla artıyor,
    // uzun ot daha çok eğilir). Kod çizimindeki egim/salin ile aynı eğri.
    const ruz = ruzg(d), siddet = Math.min(1, Math.abs(ruz)/2.2);
    const salin = sakin ? 0 : Math.sin(d.t*2.1)*.05*siddet;
    const egim = kis(ruz*.15, -.62, .62) + salin;
    X.translate(0, alt);
    X.transform(1, 0, -egim*.55, 1, 0, 0);
    X.translate(0, -alt);
  }
  for(let x=bas; x<=son; x+=tg){
    const sx = ekrK(x, 0, k).sx;
    X.drawImage(g.img, sx, ust, wEkran + 1, h);          // +1: tekrarlar arası kıl payı boşluk olmasın
    if(a > .01){ X.globalAlpha = a; X.drawImage(g.perde, sx, ust, wEkran + 1, h); X.globalAlpha = 1; }
  }
  X.restore();
  // Altı ekranın dibine kadar taban rengiyle (perde karışmış haliyle).
  X.fillStyle = renkKar(g.alt, g.renk, a);
  X.fillRect(-40, alt - .5, W + 80, H - alt + 41);
}
