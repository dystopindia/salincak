// Modüller arası paylaşılan tek değişken küme. Nesne olarak veriliyor ki
// içe aktaran her modül aynı referansa yazabilsin.
//
//   D        : aktif oyun (kur() üretir), yoksa null
//   hal      : 'menu' | 'oyun' | 'son'

// rekor burada değil, kayit.js'te: turlar arası kalıcı olması gerekiyor
// ve tek kaynak olmalı, yoksa iki yer birbirinden habersiz kalıyor.
export const durum = {
  D: null,
  hal: 'menu',
  sonTohum: 'ruya',
  sonSkor: 0,
  secKar: 0
};
