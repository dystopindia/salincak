import { W, H } from './tuval.js';
import { kis } from './matematik.js';

// Dünya: x sağa, y YUKARI, zemin y=0, birim metre.
// Ekran: y aşağı. Dönüşüm SADECE burada; başka hiçbir yerde elle çevrim yok.

// Ölçek ekrana göre. Sabit 42 px/m'de dar bir telefon ekranında yalnız ~9 m
// dünya görünüyor, sonraki salıncak ekranın dışında kalıyordu.
//
// Gereken ileri görüş: en geniş boşluk 9.4 m DEĞİL — o üst sınır
// √(9.81/g) ölçeklemesinden ÖNCEki değer; yörüngede (g=6.2) 1.26 ile
// çarpılıp 11.8 m'ye çıkıyor. Oturağın salınımı için ~1.7 m pay ekleyince
// 13.5 m gerekiyor. ODAK=.34 ile ekranın %66'sı ileride olduğundan
// 13.5/.66 ≈ 20.5 m'lik bir görüş genişliği yetiyor.
const GORUS_EN = 20.5, GORUS_BOY = 9.6;
export let PM = 42;                 // piksel / metre — her karede tazeleniyor
// Taban 16: portre telefonda 20.5 m görüşü kısıtlamasın (20'de kırpılıyordu
// ve en geniş boşlukta hedef halkası ekranın kenarına yapışıyordu).
// Tavan 46: geniş masaüstü ekranında figür devleşmesin.
export function olcek(){ PM = kis(Math.min(W/GORUS_EN, H/GORUS_BOY), 16, 46); }

export let kamX=0, kamY=0;

// Oyuncu ekranın ortasında değil, %34'ünde duruyor. İleriyi görmek geriyi
// görmekten çok daha önemli: arkada yalnız üstünde durduğun salıncağı
// görmen yeterli (~3 m), ileride ise bir sonrakini görmen şart (13.5 m).
let ODAK = .34;
// Menü vitrini (oyun/vitrin.js) odağı sola alıyor: kartın yanındaki boşluğa.
export function odakKur(o){ ODAK = o; }

export const ekr = (x,y) => ({
  sx: W*ODAK + (x-kamX)*PM,
  sy: H*.78  - (y-kamY)*PM
});

// Paralaks: k derinliğindeki katman kamerayı k kadar taşır. k=1 oyun düzlemi.
// Ölçek DEĞİŞMEZ; uzaklık hissi yavaş kayma + sis + yüksek taban ile veriliyor.
export const ekrK = (x,y,k) => ({
  sx: W*ODAK + (x-kamX*k)*PM,
  sy: H*.78  - (y-kamY*k)*PM
});

export const KATMAN = { uzak:.15, orta:.45, on:1.3 };

// ekr()'in tersi. Karakterin yerel çerçevesindeki bir noktayı (atkının
// boyun çapası gibi) dünya koordinatına döndürmek için.
export const dunya = (sx,sy) => ({ x: kamX + (sx-W*ODAK)/PM, y: kamY + (H*.78-sy)/PM });

// Kamera hedefi yumuşak takip eder; dikeyde 4 m'ye kadar hiç kıpırdamaz.
// Takipsiz yerleştirme: menüye dönünce kamera 500 m geriye süpürülmesin.
export function kameraAt(x,y){ kamX = x; kamY = Math.max(0,y-4.0); }

export function izle(x,y){
  kamX += (x-kamX)*.10;
  kamY += (Math.max(0,y-4.0)-kamY)*.07;
}

olcek();
