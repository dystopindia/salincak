// Menünün arkasındaki canlı sahne: seçili karakter parkta, boş bir salıncak
// yanında sallanıyor. Oyun değil, VİTRİN — fizik adımlanmıyor, salınım
// kinematik (θ = A·sin ωt). Gerçek fizikle sürseydi pompayı bir bot yapmak,
// rüzgârı, yorgunluğu, bitir()'i ayıklamak gerekirdi; vitrin yalnız çizim
// kodunun beklediği alanları dolduruyor ve sahne.ciz'den olduğu gibi geçiyor.
//
// Yerleşim ekrana göre: menü kartı ortada (en fazla 430 px), vitrin
// salıncağı soldaki boşluğun, boş salıncak sağdakinin ortasında. Portrede
// boşluk yok — sahne kartın arkasında, perdenin altında soluk kalıyor.
import { W, sakin } from '../cekirdek/tuval.js';
import { PM } from '../cekirdek/kamera.js';
import { kis } from '../cekirdek/matematik.js';
import { KAR, LFARK } from './tanimlar.js';
import { kur } from './dunya.js';
import { durum } from './durum.js';

// css/ana.css .kart genişliği; orada değişirse burada da değişmeli.
const KART_EN = 430;
// Genlik (rad): pompalama görünecek kadar canlı ama sakin.
const GENLIK = .82;
// Azaltılmış hareket isteyen cihazda: hafif bir sallanma, pompa yok.
const GENLIK_SAKIN = .22;
// Sahte mesafe hızı (m/s): gündüz-gece döngüsü 90 saniyede bir dönüyor.
const GUN_HIZ = 70/90;
const ODAK_OYUN = .34;

let V = null;

// Kartın iki yanındaki boşluk (px). Sahne ve kamera ikisi de buna bakıyor.
function yan(){ return Math.max(0, (W - Math.min(KART_EN, W-40)) / 2); }

// Vitrinde kamera odağı: sol boşluğun ortası (ekran genişliği oranı).
export function vitrinOdak(){
  const y=yan();
  return y < 90 ? ODAK_OYUN : kis(y/2/W, .06, ODAK_OYUN);
}

export function vitrin(){
  if(!V){
    V = kur('vitrin', durum.secKar);
    V.vitrin = true;
    V.mesafe = 60;             // akşamüstü: ilk görüntü fenerlerin yandığı saat
    V.ruzgar = .5;             // otlar hafif sallanıyor, rüzgâr çizgisi yok
    V.sal.length = 2;
    for(const s of V.sal) s.para = [];
  }
  return V;
}

export function vitrinAdim(dt){
  const v = vitrin();
  if(v.karIdx !== durum.secKar){ v.karIdx = durum.secKar; v.k = KAR[durum.secKar]; }
  v.t += dt;
  v.mesafe += dt*GUN_HIZ;

  // Oyuncunun salıncağı: dipte ayağa kalkıyor, uçlarda çömeliyor — gerçek
  // pompalamanın hareketi (§2), yalnız enerji sabit.
  const s = v.sal[0], w = Math.sqrt(9.81/s.Lu), A = sakin ? GENLIK_SAKIN : GENLIK;
  s.th = A*Math.sin(w*v.t);
  s.om = A*w*Math.cos(w*v.t);
  s.gen = A;
  s.poz = !sakin && Math.abs(s.th) < A*.45 ? 'ayakta' : 'cokuk';
  const hedef = s.poz==='ayakta' ? s.Lu-LFARK : s.Lu;
  s.L += (hedef-s.L)*Math.min(1, dt*6.5);

  // Boş salıncak: sağ boşluğun ortasında, rüzgârla hafifçe sallanıyor.
  const b = v.sal[1], y = yan();
  b.x = y < 90 ? s.x + 9 : (W - y/2 - W*vitrinOdak())/PM;
  b.th = .16*Math.sin(.9*v.t + 1.3); b.om = .144*Math.cos(.9*v.t + 1.3);
  b.poz = 'cokuk'; b.L = b.Lu;
  return v;
}
