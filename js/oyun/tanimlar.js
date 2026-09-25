// Dengelenmiş sabitler. Buradaki sayıları değiştirmeden önce CLAUDE.md'nin
// 2., 6. ve 7. bölümlerini oku — her biri bir başka şeyi dengeliyor.

export const KAR=[
  {id:'cocuk',   ad:'Uykulu çocuk', not:'Her şeyi ortalama yapar. İlk turlar için.',        pompa:1,    tut:1,    zincir:1,    ruz:1},
  {id:'kedi',    ad:'Kedi',         not:'Zayıf pompalar, ama havada her şeye tutunur.',      pompa:.85,  tut:1.55, zincir:1.15, ruz:1},
  {id:'astronot',ad:'Astronot',     not:'Sert pompalar. Ağırdır, zincirler onu sevmez.',     pompa:1.32, tut:.88,  zincir:.68,  ruz:.75},
  {id:'hayalet', ad:'Hayalet',      not:'Zinciri neredeyse hiç yormaz, ama rüzgârda savrulur.', pompa:.9, tut:1.1, zincir:1.6,  ruz:2.3}
];

// on: ön plan silüet rengi. lamba: o bölgedeki lamba ışığının rengi. Uzak ve orta katman renkleri elle tutulmuyor;
// katmanlar.js onları yer↔gok[2] arasından türetiyor, böylece üç katman
// her bölgede kendiliğinden ayrışıyor (atmosferik perspektif).
// gunEtki: gündüz-gece döngüsünün bu bölgede ne kadar hissedildiği (bkz.
// ciz/zaman.js). Yörüngede zaten yıldızların içindesin, tam gündüz tuhaf
// kaçardı — o yüzden orada çok bastırılmış.
// no/not: bölge kartı (hud) ve sınır tabelası (zemin) — bölüm başlığı gibi
// okunsun diye Roma rakamı + tek satırlık bir söz.
export const BOL=[
  {ad:'park',     no:'I',   not:'kimse itmiyor seni',   g:9.81, gok:['#141A44','#1E2154','#3A2F5C'], yer:'#241E44', ruz:1,    on:'#0B0820', lamba:'#F2B33D', gunEtki:1},
  {ad:'orman',    no:'II',  not:'rüzgâr sertleşir',     g:9.81, gok:['#0B1B2C','#123043','#1B4A40'], yer:'#0E2A24', ruz:1.35, on:'#04100D', lamba:'#F2A63D', gunEtki:1},
  {ad:'bulutlar', no:'III', not:'hafiflersin, savrulursun', g:8.8, gok:['#1A1038','#3B2461','#6B3F6E'], yer:'#4A3570', ruz:1.9, on:'#160D28', lamba:'#F5AFC6', gunEtki:.85},
  {ad:'yörünge',  no:'IV',  not:'uzun uçuş, sessiz rüzgâr', g:6.2, gok:['#02030A','#080B20','#141334'], yer:'#0C0C22', ruz:.5, on:'#02020A', lamba:'#9FD8F2', gunEtki:.3},
  {ad:'buz kuşağı', no:'V', not:'kuyruklu yıldızların yolu', g:5.2, gok:['#03070E','#07141F','#123240'], yer:'#0A1A24', ruz:.35, on:'#02090E', lamba:'#A8F0E0', gunEtki:.2}
];

// Bölge eşikleri: i bu sayıdan küçükse o bölge. Son eşikten sonra bölgeler
// DÖNGÜYE giriyor — park hariç (1..4), her DONGU_BOY salıncakta bir.
//
// Neden döngü: oyuncu 1000 m ilerleyip "biyom değişmiyor" dedi ve haklıydı;
// eski `i<15 ? 2 : 3` ifadesi 16. salıncaktan sonra sonsuza kadar yörüngede
// bırakıyordu. Oyun sonsuz olduğu için bölge listesi de sonsuz davranmalı.
// Park döngüye girmiyor: o başlangıcın yeri, uzayın ortasında bir parka
// dönmek hata gibi okunur (orman/bulutlar/yörünge/buz zaten soyut).
const ESIK = [4, 9, 15, 22, 30];
const DONGU_BOY = 8;

export function bolgeNo(i){
  for(let b=0;b<ESIK.length;b++) if(i<ESIK[b]) return b;
  return 1 + Math.floor((i-ESIK[ESIK.length-1])/DONGU_BOY) % (BOL.length-1);
}

// Kaçıncı tur: bölge kartı tekrar "orman" dediğinde bunun bir hata değil
// bir döngü olduğu anlaşılsın diye (hud.js "· 2. tur" ekliyor).
export const turNo = i =>
  i < ESIK[ESIK.length-1] ? 1
  : 2 + Math.floor((i-ESIK[ESIK.length-1]) / (DONGU_BOY*(BOL.length-1)));

// Fizik adımı. main.js'in yereli değil, ORTAK sabit: hayalet kaydı
// "kaçıncı adımda basıldı" diye tutuluyor (oyun/hayalet.js), yani adım
// büyüklüğü iki yerden birden okunuyor ve tek kaynak olmak zorunda.
export const ADIM = 1/240;

// Fizik sürümü: hayalet kaydı basışları saklıyor, konumları değil — yani
// fizik değişirse ESKİ bir kayıt yeni fizikte başka bir yola gider ve
// hayalet oyuncunun hiç oynamadığı bir tur oynar. Kayıt bu sayıyla
// damgalanıyor, tutmayan kayıt gösterilmiyor. SALINIMI ya da UÇUŞU
// etkileyen her değişiklikte artır (skor kuralı değişikliği gerekmez:
// geri oynatma skoru zaten yeniden hesaplıyor).
//   1: ilk sürüm   2: tutunmada genlik enerjiden (fizik.genlik)
export const FIZIK_SURUM = 3;     // 3: sonsuz modda parkur parçaları (dünya üretimi değişti)

export const LFARK = .55;    // toplam ip boyu değişimi (m) — büyütme, oyun kontrolsüzleşir
export const LHIZ0 = 1.35;   // L' üst sınırı (m/s) — ani L' pompalamayı patlatır
export const SLACK = 2.95;   // bu açının ötesinde zincir boşalır (rad)
