// Deneme parkuru: salıncak → blok → tribün → trambolin → salıncak.
// Elle dizilmiş, öğretici gibi (oyun/ogretici.js): ölüm yok, skor yok,
// her parçanın bir dersi var. Amaç yeni hareketlerin HİSSİNİ telefonda
// sınamak; sonsuz moda girmeden önce. Bkz. CLAUDE.md §12.
//
// Dizilim Nintendo'nun dört adımıyla (tanıt → geliştir → bük → bağla):
// blok önce GENİŞ ve alçak (iniş güvenli, koşuyu tanı), sonra aralıklı
// ikinci blok (zıplamayı tanı), sonra kendiliğinden çıkılan basamaklar
// (tribün), sonra trambolin (düşüş yerine fırlatma — büküm), en son yine
// salıncak (bildiğin hareketle bağla).
import { kur } from './dunya.js';
import { salincak } from './ogretici.js';

const P_SAL = [
  { x:0,    py:4.8, Lu:2.7 },
  { x:49.0, py:5.4, Lu:2.6 },               // bloğun kenarından zıplayınca tutunulan
  { x:55.5, py:4.9, Lu:2.7 },               // son boşluk: salıncaktan salıncağa
];

// ust: üst yüzey yüksekliği (m); alt=0 → yerden yükselen sütun.
// Tek kural her yerde geçerli: KENARDA DOKUN. İlk dizilimde trambolin
// tribünün hemen dibindeydi — kenardan zıplayan onu aşıp ölüyordu, yani
// bir önceki adımda öğrettiğimiz hareket burada cezalandırılıyordu. Ölçüm
// (bot, 1/240 adım): tepe bloğun HER yerinden zıplayış tramboline iniyor,
// zıplamadan düşen önüne düşüyor.
const P_ENGEL = [
  { tip:'blok', x0:4.9,  x1:12.0, ust:1.5, alt:0 },     // geniş, alçak: ~1.3 rad yeter
  { tip:'blok', x0:14.6, x1:19.0, ust:2.0, alt:0 },     // 2.6 m boşluk: zıpla
  { tip:'blok', x0:19.0, x1:20.2, ust:2.45, alt:0 },    // tribün: üç basamak,
  { tip:'blok', x0:20.2, x1:21.4, ust:2.9, alt:0 },     // her biri 0.45 m —
  { tip:'blok', x0:21.4, x1:24.0, ust:3.35, alt:0 },    // kendiliğinden çıkılır
  { tip:'trambolin', x0:29.1, x1:32.6, ust:.75 },       // tepeden zıpla, sek
  { tip:'blok', x0:35.0, x1:43.0, ust:2.2, alt:0 },     // normal de süper de buraya iner
];

export const P_ADIMLAR = [
  { metin:'Salıncakta pompala, sonra bloğa ATLA.' },
  { metin:'Blokta kendiliğinden koşarsın. Kenara gelince DOKUN: zıplarsın.' },
  { metin:'Basamakları kendiliğinden çıkarsın. Tepeden trambolinin üstüne ZIPLA.' },
  { metin:'Trambolin fırlatır. DEĞDİĞİ ANDA dokunursan daha yükseğe sekersin.' },
  { metin:'Kenardan salıncağa ZIPLA. Havada bir daha dokunursan uzanırsın.' },
  { metin:'Tutundun! Son boşluk — bildiğin gibi: pompala, atla.' },
];

// Adım, durumun saf bir fonksiyonu (öğreticideki gibi).
function parkurAdim(d){
  if(d.i>=1) return 5;
  if(d.faz==='salinim') return 0;
  if(d.px<14) return 1;
  if(d.kaynak!=='trambolin' && d.px<26) return 2;
  if(d.px<34.5) return 3;
  return 4;
}

export const PARKUR = { ad:'parkur', adimlar:P_ADIMLAR, adim:parkurAdim, bitti: d => d.i>=P_SAL.length-1 };

export function parkurKur(karIdx){
  const d=kur('parkur', karIdx);
  d.sal=[]; P_SAL.forEach((t,i)=> d.sal.push(salincak(t, d.sal[i-1], d.r)));
  d.sal[0].th=.62; d.sal[0].gen=.62;
  d.engel=P_ENGEL.map(e=>({...e}));
  d.ruzgar=.3;                          // his testi: rüzgâr karışmasın
  d.ogretici={ dusme:0, ders:PARKUR };
  return d;
}
