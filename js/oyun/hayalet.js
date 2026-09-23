import { kayit, sakla } from '../cekirdek/kayit.js';
import { ADIM, FIZIK_SURUM } from './tanimlar.js';
import { kur } from './dunya.js';
import { adim, pompaUygula, atlaUygula } from './fizik.js';
import { sesBastir } from '../cekirdek/ses.js';

// Rekor hayaleti — kendi en iyi turunla yarışmak.
//
// Neden bu oyunda neredeyse bedava: fizik zaten DETERMİNİSTİK (aynı tohum
// aynı dünya, §0) ve SABİT ADIMLI (ADIM=1/240). Yani bir turu yeniden
// oynatmak için kare kare konum saklamaya gerek yok — yalnız "kaçıncı
// adımda neye basıldı" yetiyor, gerisini aynı denklemler üretiyor.
// Saniyede ~4 basış × birkaç yüz salıncak: birkaç kilobayt.
//
// ÜÇ ŞART, üçü de bozulursa hayalet sessizce yanlış yere gider:
//
// 1. ADIM SAYISI zaman birimi, saniye değil. Odak jokeri ve yakalama
//    yavaşlaması kare başına düşen adım sayısını değiştiriyor ama adımın
//    kendisi sabit; hayalet oyuncuyla ADIM ADIM kilitli ilerliyor, yani
//    "aynı oyun zamanında neredeydim" karşılaştırması dürüst kalıyor.
// 2. Aynı eylem kodu. Geri oynatma fizik.pompaUygula/atlaUygula'yı
//    çağırıyor — girdi.js'in kopyası değil, asıl kuralın kendisi.
// 3. JOKERSİZ tur. Jokerler fizikle oynuyor (zincir yorulmuyor, zaman
//    yavaşlıyor) ve tur içinde elle basılıyor; kaydedilmedikleri için
//    jokerli bir turun kaydı geri oynatıldığında tutmaz. Zaten bitiş
//    ekranı da jokerli turu "skor saf değil" diye işaretliyor (§7.5),
//    aynı dürüstlük kuralı burada da geçerli.
//
// HAYALET YALNIZ AYNI TOHUMDA ANLAMLI. Başka bir dünyanın kaydını geri
// oynatmak boş havada debelenen bir figür üretir. Bu yüzden kayıt tohumla
// birlikte saklanıyor ve tohum tutmazsa hiç gösterilmiyor: serbest turda
// hayalet "Tekrar dene"de ve sürekli modda ortaya çıkıyor (ikisi de aynı
// tohumu yeniden kuruyor), günün turunda ise her zaman.

const AZAMI_GIRIS = 6000;      // ~15 dk'lık bir tur; üstünü kaydetmiyoruz

// --- kayıt --------------------------------------------------------------
// Basışlar (adım FARKI, tip) olarak tek sayıya paketleniyor: fark*2+tip.
// Fark saklamak mutlak adım numarasından çok daha kısa metin üretiyor
// (localStorage'a JSON olarak gidiyor) ve çözmesi tek toplama.
export function kaydet(d, tip){
  if(!d.giris) return;
  d.giris.push((d.adimNo - d.sonGirisAdim)*2 + tip);
  d.sonGirisAdim = d.adimNo;
  if(d.giris.length > AZAMI_GIRIS) d.giris = null;     // taşan tur kaydedilmiyor
}

function yuva(gunlukMu){ return gunlukMu ? kayit.gunluk.hayalet : kayit.hayalet; }

// Tur bitti: jokersiz ve daha iyiyse hayalet olarak saklanıyor.
// Dönüş: yeni bir hayalet yazıldı mı (bitiş ekranı bunu söylüyor).
export function hayaletSakla(d, skor){
  if(d.ogretici || d.jokerKullanildi) return false;
  if(!d.giris || d.giris.length < 2) return false;
  const eski = yuva(d.gunluk);
  // Başka bir fizik sürümünün kaydı yokmuş gibi sayılıyor: skoru
  // karşılaştırılamaz, geri oynatılamaz.
  if(eski && eski.fs===FIZIK_SURUM && eski.tohum===d.tohum && eski.skor>=skor) return false;
  const yeni = { tohum:d.tohum, kar:d.karIdx, skor, mesafe:d.mesafe,
                 bitis:d.adimNo, giris:d.giris, fs:FIZIK_SURUM };
  if(d.gunluk) kayit.gunluk.hayalet = yeni; else kayit.hayalet = yeni;
  sakla();
  return true;
}

// --- geri oynatma -------------------------------------------------------
let HAY = null;

export function hayalet(){ return HAY; }
export function hayaletTemizle(){ HAY = null; }

// Farkları mutlak adım numaralarına çözüyor. Bir kez, tur başında:
// her adımda toplama yapmak yerine dizi hazır dursun.
function girisCoz(giris){
  const n = giris.length;
  const adimlar = new Int32Array(n), tipler = new Uint8Array(n);
  let a = 0;
  for(let i=0;i<n;i++){ a += giris[i]>>1; adimlar[i]=a; tipler[i]=giris[i]&1; }
  return { adimlar, tipler };
}

export function hayaletBasla(tohum, gunlukMu){
  HAY = null;
  if(!kayit.hayaletAcik) return;
  const k = yuva(gunlukMu);
  if(!k || !k.giris || k.giris.length<2 || k.tohum!==tohum || k.fs!==FIZIK_SURUM) return;
  const h = kur(tohum, k.kar);
  h.hayaletMi = true;                  // akis.bitir ve çizim bunu okuyor
  h.giris = null;                      // hayalet kendi turunu KAYDETMİYOR
  const { adimlar, tipler } = girisCoz(k.giris);
  h.adimlar = adimlar; h.tipler = tipler; h.p = 0;
  // Kaydın ÜSTVERİSİ ayrı adlarla duruyor: h.skor / h.mesafe hayaletin
  // KENDİ turunun canlı değerleri ve adim() onları yazıyor. İlk sürüm
  // h.skor'a kayıttaki nihai skoru koyuyordu — hayalet turu o sayının
  // üstüne eklemeye başladı, skor iki katına çıktı.
  h.bitis = k.bitis; h.kayitSkor = k.skor; h.kayitMesafe = k.mesafe;
  h.bitti = false; h.solma = 0; h.gecildi = false;
  HAY = h;
}

// Oyuncunun HER fizik adımında bir kez, aynı döngüden çağrılıyor (main.js).
// Kilit buradan geliyor: iki dünya aynı sayıda adım atıyor.
export function hayaletAdim(){
  const h = HAY; if(!h) return;
  if(h.bitti){ h.solma += ADIM; return; }

  // Kayıttaki basışlar, ait oldukları adımdan ÖNCE uygulanıyor — oyuncunun
  // basışı da kare başında, o kareye ait adımlardan önce işleniyor.
  while(h.p < h.adimlar.length && h.adimlar[h.p] <= h.adimNo){
    if(h.tipler[h.p]) atlaUygula(h); else pompaUygula(h);
    h.p++;
  }
  // Geri oynatma sessiz: fizik tutunma/para/ölüm sesini doğrudan çağırıyor.
  sesBastir(true);
  adim(h, ADIM);
  sesBastir(false);
  if(h.faz==='bitti' || h.faz==='dusus' || h.adimNo>=h.bitis) h.bitti = true;
}
