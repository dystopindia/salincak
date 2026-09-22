import { kur } from './dunya.js';
import { paraUret } from './para.js';
import { LFARK } from './tanimlar.js';

// Öğretici: elle dizilmiş 5 salıncaklık kısa bir tur. Prosedürel dünya
// değil — her adımın bir dersi var ve boşluklar o derse göre seçildi.
// Ölüm yok: düşünce aynı salıncaktan devam. Skor, para, rekor yazılmıyor.
//
// Hepsi park içinde kalıyor (bolgeNo(i)<4 → park), çünkü çizim tarafı
// bölgeyi salıncak İNDEKSİNDEN türetiyor; 4. salıncağa tutunulduğu anda
// öğretici zaten bitmiş oluyor.
const SAL = [
  { x:0,    py:4.8, Lu:2.7 },
  { x:5.2,  py:4.9, Lu:2.7 },               // 5.2 m — ~1.3 rad yeter
  { x:10.8, py:4.7, Lu:2.6 },               // 5.6 m — uzanma dersi
  { x:18.2, py:5.0, Lu:2.75 },              // 7.4 m — ~1.9 rad ister: zincir çubuğu dolar
  { x:24.4, py:4.8, Lu:2.7, para:true },    // 6.2 m — paralar iyi yörüngeyi ödüllendirir
];

// Adım, oyun durumunun saf bir fonksiyonu — ayrıca tutulan bir sayaç yok.
// Düşünce genlik sıfırlandığı için 0. adıma kendiliğinden dönüyor.
export const ADIMLAR = [
  { metin:'Salıncak DİBE inerken dokun ya da boşluğa bas. Tepede basmak işe yaramaz.' },
  { metin:'Bu kadar yeter. Noktalı yol halkaya değince ATLA.' },
  { metin:'Atladıktan sonra havada BİR KEZ DAHA dokun: uzanırsın, menzil artar.' },
  { metin:'Bu boşluk geniş. Yüksekteyken her pompa ZİNCİRİ yorar — çubuğa bak, dolarsa kopar.' },
  { metin:'Paralar iyi yörüngeyi ödüllendirir: yüksekten gir, hepsini al.' },
];

export function ogreticiAdim(d){
  if(d.i===0) return d.sal[0].gen<1.25 ? 0 : 1;
  return Math.min(4, d.i+1);
}

export const ogreticiBittiMi = d => d.i>=SAL.length-1;

function salincak(t, onceki, r){
  return {
    para: t.para ? paraUret(r, onceki, t.x, t.py, t.Lu) : [],
    x:t.x, py:t.py, Lu:t.Lu, Lk:t.Lu-LFARK, L:t.Lu,
    dayanim:35, th:0, om:0, yorgun:0, poz:'cokuk', pompaT:-9, gen:.2,
    bol:0, acilim: onceki ? t.x-onceki.x : 0
  };
}

export function ogreticiKur(karIdx){
  const d=kur('ogretici', karIdx);
  d.sal=[]; SAL.forEach((t,i)=> d.sal.push(salincak(t, d.sal[i-1], d.r)));
  d.sal[0].th=.62; d.sal[0].gen=.62;
  d.ruzgar=.4;                          // ders sırasında rüzgâr dikkat dağıtmasın
  d.ogretici={ dusme:0 };
  return d;
}

// Düşüş: akis.bitir yerine burası. Can jokerinin devamEt'iyle aynı
// sıfırlama — ama bedava ve sınırsız.
export function ogreticiDus(d){
  const s=d.sal[d.i];
  s.yorgun=0; s.poz='cokuk'; s.pompaT=-9; s.L=s.Lu;
  s.th=.55; s.om=0; s.gen=.55;
  d.faz='salinim'; d.uzanma=0; d.seri=0; d.sars=0;
  d.mesaj = d.sebep==='kopma' ? 'zincir koptu — fazla pompaladın' : 'düştün — aynı yerden devam';
  d.mesajT=d.t; d.mesajRenk='#F2B33D';
  d.sebep=''; d.ogretici.dusme++;
}
