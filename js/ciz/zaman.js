import { X, W, H } from '../cekirdek/tuval.js';
import { kamX, PM } from '../cekirdek/kamera.js';
import { nz, lerp, kis, renkKar, parlaklik } from '../cekirdek/matematik.js';
import { BOL, bolgeNo } from '../oyun/tanimlar.js';
import { oturX, ruzg } from '../oyun/fizik.js';

// Gündüz-gece ve hava, tamamen bu dosyada — oyun/ hiç haberi yok, hiçbir
// yeni alan eklemedi. Yalnız BOYAMA, dünya üretimini etkilemiyor.

const GUN_CEVRIM = 70;         // metre — bir tam gündüz-gece döngüsü
const SAFAK = '#FF9860';       // şafak/akşam ufuk sıcaklığı — hiçbir bölgenin
                                // paletinde olmayan, dışarıdan gelen ışık

// gunGuc: 0 gece yarısı, 1 öğle — kosinüsle yumuşak. sicaklik: 0 gece
// yarısı/öğle, 1 şafak/akşam — aynı fazın türevi, yani tam gün/gece
// dönüşüm noktalarında ekstra sabit sayı gerekmeden kendiliğinden tepede.
export function gunEvresi(d, gunEtki=1){
  const faz = 2*Math.PI*((d.mesafe/GUN_CEVRIM)%1);
  return {
    faz,
    gunGuc: (1-Math.cos(faz))/2 * gunEtki,
    sicaklik: Math.abs(Math.sin(faz)) * gunEtki
  };
}

// Bir bölgenin gökyüzü paletini o anki saate göre boyar. Gündüz versiyonu
// dışarıdan mavi bir referansla değil, GECE RENGİNİ PARLATARAK türüyor —
// böylece park'ın gündüzü mor-mavi, orman'ınki yeşilimsi kalıyor; katman
// renklerinin zemin↔ufuktan türediği §6.5'teki mantıkla aynı disiplin.
export function gokRenkleri(d,b){
  const gece = BOL[b].gok;
  const { gunGuc, sicaklik } = gunEvresi(d, BOL[b].gunEtki);
  const renkler = gece.map(r => renkKar(r, renkKar(parlaklik(r,3.1),'#FFFFFF',.30), gunGuc));
  if(sicaklik>.02){
    renkler[2] = renkKar(renkler[2], SAFAK, sicaklik*.5);   // ufuk en sıcak
    renkler[1] = renkKar(renkler[1], SAFAK, sicaklik*.2);
  }
  return renkler;
}

// --- hava (mevsim) -------------------------------------------------------
// İlk sürümde hava tohumdan türüyordu (th32(tohum)%4) — "aynı tohum aynı
// dünya" ilkesini kopyalamıştı. Ama hava hiçbir zaman skoru etkilemiyor,
// yalnız boyama; deterministik olması GEREKMİYORDU. Sonuç: varsayılan
// "ruya" tohumuyla oynayan biri hep AYNI havayı görüyordu — oyuncunun
// fark ettiği buydu. Artık her yeni turda gerçekten rastgele (Math.random,
// d.r DEĞİL) ve her BİYOMA (bolgeNo) ayrı, kendi hava durumu atanıyor;
// park güneşliyken orman karlı olabiliyor. Aynı tohumla tekrar oynasan
// bile hava yeniden çekiliyor — bu bilinçli, "aynı tohum" sözü skor için
// geçerli, hava için değil.
//
// karistir küçük tutulmalı: koyu gece paletiyle doygun bir renk yüksek
// oranda karışınca çamura döner (ilk denemede .18-.42 aralığı böyle
// oldu — mevsim değil, sanki bölge rengi değişmiş gibi göründü). Hava
// burada bir İMA, bir palet değişimi değil.
export const MEVSIM = [
  { ad:'ilkbahar', renk:'#F6C9DC', karistir:.06,
    parcacik:{ sekil:'daire', renk:'#FBD3E6', boy:.14, hiz:.50, yogunluk:.35 } },
  { ad:'güneşli',  renk:null,      karistir:0,  parcacik:null },
  { ad:'sonbahar', renk:'#D97B3E', karistir:.11,
    parcacik:{ sekil:'daire', renk:'#E08838', boy:.20, hiz:.80, yogunluk:.55 } },
  { ad:'karlı',    renk:'#DCEFF7', karistir:.15,
    parcacik:{ sekil:'daire', renk:'#F5FAFF', boy:.15, hiz:.32, yogunluk:.80 } },
  { ad:'yağmurlu', renk:'#7E93A6', karistir:.14,
    parcacik:{ sekil:'cizgi', renk:'#BFD4E6', boy:.42, hiz:1.3, yogunluk:.85, kalinlik:1.3 } },
];

// Her biyoma (bolgeNo 0..3) bir hava indeksi. Yeni bir tur (yeni `d`)
// görülür görülmez yeniden çekiliyor — bkz. yukarıdaki not.
let sonHavaD=null, bolgeHavasi=[];
function havaYenile(d){
  if(d===sonHavaD) return;
  sonHavaD=d;
  bolgeHavasi = BOL.map(()=>Math.floor(Math.random()*MEVSIM.length));
}

// Konumdan bölge karışımını türetir — sahne.ciz()'in gökyüzü için yaptığı
// hesabın aynısı, burada TEKRAR edilmesinin sebebi ciz/ modüllerinin
// birbirine parametre yerine `d`'den bağımsız türetmesi (bkz. §6.5:
// katmanlar.js/zemin.js de bolgeNo(d.i)'yi kendileri çağırıyor).
export function bolgeKarisimi(d){
  const p = d.faz==='salinim' ? oturX(d.sal[d.i]) : d.px;
  const s0=d.sal[d.i], s1=d.sal[d.i+1]||s0;
  const t=kis((p-s0.x)/Math.max(1,s1.x-s0.x),0,1);
  return { b1:bolgeNo(d.i), b2:bolgeNo(Math.min(d.i+1,d.sal.length-1)), t };
}

// karistir=0 olan (güneşli) tarafta renk null olsa da sorun değil: karıştırma
// oranı zaten 0 olduğu için renkKar sonucu etkilemiyor.
export function mevsimGoster(d){
  havaYenile(d);
  const { b1, b2, t } = bolgeKarisimi(d);
  const a=MEVSIM[bolgeHavasi[b1]], b=MEVSIM[bolgeHavasi[b2]];
  return {
    karistir: lerp(a.karistir, b.karistir, t),
    renk: renkKar(a.renk||'#808080', b.renk||'#808080', t),
    parcacik: t<.5 ? a.parcacik : b.parcacik
  };
}

// Bir rengi mevcut hava tonuna doğru karıştırır — katmanlar.js ve
// zemin.js'in tek satırlık ortak çağrısı.
export function mevsimBoya(renk, mevsim){
  return mevsim.karistir>0 ? renkKar(renk, mevsim.renk, mevsim.karistir) : renk;
}

// --- hava parçacıkları --------------------------------------------------
// Ekran uzayında: kar/yaprak/yağmur dünya konumuna değil, kameraya göre
// düşüyor — gerçek kar da öyle hissettirir. d.t ile sürekli düşüp
// sarmalıyor (mod), d.tohum'dan bağımsız — kaç tanesi göründüğü yalnız
// havaya bağlı, yeniden oynatmada aynı olması gerekmiyor (saf süs).
export function parcaciklarCiz(d){
  const { parcacik:p } = mevsimGoster(d);
  if(!p) return;
  const N = Math.round(46*p.yogunluk);
  // Kar/yaprak/yağmur RÜZGÂRLA sürükleniyor. Eskiden hepsi dümdüz aşağı
  // düşüyordu; ekranda esen bir rüzgâr varken düşey düşen kar, rüzgârın
  // olmadığını söylüyordu. Sürüklenme yatayda da sarmalanmalı (mod),
  // yoksa parçacıklar birkaç saniyede ekrandan çıkıp geri gelmiyor.
  const r = ruzg(d), kay = r*PM*2.6*d.t;
  const sar = W+120;
  const yatay = i => ((((nz(i*3.7)*sar + kay) % sar) + sar) % sar) - 60;
  X.globalAlpha=1;
  if(p.sekil==='cizgi'){                        // yağmur: hızlı, ince çizgiler
    X.strokeStyle=p.renk; X.lineCap='round'; X.lineWidth=p.kalinlik||1.2;
    const uzunluk=p.boy*PM;
    // Damlanın izi hareketinin yönünde yatıyor: rüzgâr sağa eserken alt uç
    // sağda. Eğik yağmur, rüzgârı anlatan en kestirme işaret.
    const egim = kis(-.22 + r*.34, -1.4, 1.4);
    for(let i=0;i<N;i++){
      const sx=yatay(i)+Math.sin(d.t*.3+i*1.7)*6;
      const sy=((nz(i*5.1+11)*(H+80)+d.t*p.hiz*PM*22)%(H+80))-40;
      X.globalAlpha=.20+nz(i*1.3)*.28;
      X.beginPath(); X.moveTo(sx,sy); X.lineTo(sx+uzunluk*egim,sy+uzunluk); X.stroke();
    }
  } else {                                       // kar/yaprak/çiçek: düşen daireler
    X.fillStyle=p.renk;
    for(let i=0;i<N;i++){
      const sx=yatay(i)+Math.sin(d.t*.5+i*1.7)*16;
      const sy=((nz(i*5.1+11)*(H+80)+d.t*p.hiz*PM*22)%(H+80))-40;
      const r2=p.boy*PM*(.55+nz(i*2.3)*.9);
      X.globalAlpha=.28+nz(i*1.3)*.4;
      X.beginPath(); X.arc(sx,sy,r2*.5,0,6.3); X.fill();
    }
  }
  X.globalAlpha=1;
}
