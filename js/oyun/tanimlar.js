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
  {ad:'yörünge',  no:'IV',  not:'uzun uçuş, sessiz rüzgâr', g:6.2, gok:['#02030A','#080B20','#141334'], yer:'#0C0C22', ruz:.5, on:'#02020A', lamba:'#9FD8F2', gunEtki:.3}
];

export const bolgeNo = i => i<4 ? 0 : i<9 ? 1 : i<15 ? 2 : 3;

export const LFARK = .55;    // toplam ip boyu değişimi (m) — büyütme, oyun kontrolsüzleşir
export const LHIZ0 = 1.35;   // L' üst sınırı (m/s) — ani L' pompalamayı patlatır
export const SLACK = 2.95;   // bu açının ötesinde zincir boşalır (rad)
