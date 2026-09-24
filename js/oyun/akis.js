import { durum } from './durum.js';
import { kur } from './dunya.js';
import { ogreticiKur, ogreticiDus } from './ogretici.js';
import { parkurKur } from './parkur.js';
import { kayit, kazan, sakla, sahip } from '../cekirdek/kayit.js';
import { canHarca } from './joker.js';
import { hayaletBasla, hayaletTemizle, hayaletSakla } from './hayalet.js';
import { gunTazele, gunSonuc, gunTohumu } from './gunluk.js';
import { hedefBitis } from './hedef.js';
import { jokerSesi, gicirtiGuncelle, tikSesi, muzikHazirla } from '../cekirdek/ses.js';
import * as E from '../cekirdek/dom.js';
import { goster, gizle, sonEkrani, cuzdanTazele } from '../ui/ekranlar.js';

// Tohum artık oyuncuya gösterilmiyor: her yeni tur rastgele bir tohumla
// başlıyor, "Tekrar dene" aynı tohumu (aynı düzeni) yeniden kuruyor.
// Determinizm içeride duruyor — aynı düzeni tekrar denemek Geometry Dash
// tarzı sürekli modun özü — ama menüde seçilecek bir şey değil.
const TOHUMLAR=['ruya','gece','lamba','zincir','bulut','uydu','park','sis','kum','ucus'];
export const rastgeleTohum = () =>
  TOHUMLAR[Math.floor(Math.random()*TOHUMLAR.length)]+Math.floor(100+Math.random()*900);

// Sürekli mod: ölünce SUREKLI_GECIKME sonra otomatik "Aynı tohumla tekrar"
// tetikleniyor — Geometry Dash'teki gibi aynı düzeni tekrar tekrar deneme.
// Skoru okumaya vakit kalsın diye anında değil, kısa bir gecikmeyle.
// Oyuncu bu sürede HERHANGİ bir düğmeye basarsa (devam/tekrar/yeni/menü)
// zamanlayıcı iptal oluyor — otomatik olan, elle seçilen bir eylemi
// asla ezmemeli.
const SUREKLI_GECIKME = 1400;
let surekliZamanlayici = null;
export function surekliIptal(){
  if(surekliZamanlayici){ clearTimeout(surekliZamanlayici); surekliZamanlayici=null; }
}

// Bitişte mesafe ikramiyesi. d.skor'a YAZMIYOR: can kullanılıp tura devam
// edilirse mesafe büyümeye devam ediyor ve ikramiye yeniden hesaplanmalı.
// d.skor'a eklenseydi her ölümde bir kez daha eklenirdi.
export const nihaiSkor = d => d.skor + Math.round(d.mesafe*4);

export function basla(tohum, karIdx, gunlukMu=false){
  surekliIptal(); muzikHazirla();
  durum.sonTohum=tohum; durum.secKar=karIdx; durum.gunlukMu=gunlukMu;
  const d=kur(tohum,karIdx);
  // Basış kaydı burada açılıyor: kur() dünyayı kuruyor, turun "kaydediliyor
  // olması" ise akışın kararı. Öğreticide hiç açılmıyor (ogreticiKur).
  d.giris=[]; d.sonGirisAdim=0; d.gunluk=gunlukMu;
  durum.D=d; durum.hal='oyun';
  hayaletBasla(tohum, gunlukMu);      // aynı tohumun kaydı varsa yarış başlıyor
  E.hud.classList.toggle('gunluk', gunlukMu);
  E.hud.classList.remove('ogretici');
  gizle(E.menu, E.son, E.ogretBitti); goster(E.hud);
}

// Günün turu: tohum tarihten geliyor (oyun/gunluk.js). Ayrı bir mod değil,
// yalnız tohumu seçilmiş bir tur — kurallar birebir aynı.
export function gunlukBasla(){
  gunTazele();
  basla(gunTohumu(kayit.gunluk.gun), durum.secKar, true);
}

// Menüdeki "Başla": ilk açılışta öğretici, sonra doğrudan yeni tur.
export function baslaTus(){
  if(kayit.ogretici) basla(rastgeleTohum(), durum.secKar);
  else ogreticiBasla();
}

export function ogreticiBasla(){ dersBasla(ogreticiKur(durum.secKar), 'öğreticiyi geç'); }

// Deneme parkuru (oyun/parkur.js): öğreticiyle aynı altyapı — ölüm yok,
// skor yok, altyazılı. Bitince kayit.ogretici'ye dokunmuyor.
export function parkurBasla(){ dersBasla(parkurKur(durum.secKar), 'parkuru bırak'); }

function dersBasla(d, gecYazi){
  surekliIptal(); muzikHazirla(); hayaletTemizle();
  durum.D=d; durum.hal='oyun';
  E.bOgretGec.textContent=gecYazi;
  E.hud.classList.add('ogretici');
  gizle(E.menu, E.son, E.ogretBitti); goster(E.hud);
}

// Tamamlandı ya da geçildi: bir daha kendiliğinden açılmıyor, menüden
// istenirse yine oynanabiliyor.
export function ogreticiBitir(gecildi){
  const parkur = durum.D && durum.D.ogretici && durum.D.ogretici.ders.ad==='parkur';
  durum.sonDers = parkur ? 'parkur' : 'ogretici';
  if(!parkur){ kayit.ogretici=true; sakla(); }
  durum.hal='son';
  gicirtiGuncelle(0);
  if(gecildi){ menuyeDon(); return; }
  tikSesi();
  if(parkur){
    const n=durum.D.ogretici.dusme;
    E.oBaslik.textContent='Parkur bitti.';
    E.oMetin.textContent = (n ? n+' kez düştün. ' : 'Hiç düşmeden! ')+
      'Bu bir deneme: blok, basamak ve trambolin nasıl hissettirdi?';
    E.bOgretBasla.textContent='Tekrar dene';
  } else {
    E.oBaslik.textContent='Hazırsın.';
    E.oMetin.textContent='Bundan sonrası gerçek: park bitene kadar bir salıncaktan diğerine. Zincir çubuğuna göz kulak ol.';
    E.bOgretBasla.textContent='Sallanmaya başla';
  }
  gizle(E.hud); goster(E.ogretBitti);
}

export function menuyeDon(){
  surekliIptal(); hayaletTemizle();
  durum.hal='menu';
  gizle(E.son, E.duraklat, E.ogretBitti, E.hud); goster(E.menu);
  // Bir tur oynanıp para kazanıldıktan sonra menüye dönüldüğünde cüzdan ve
  // dükkânın satın alma düğmeleri tazelenmezse eski (yetersiz bakiye)
  // durumunda donuk kalıyordu — para banka'ya doğru yatıyordu ama ekranda
  // hiç görünmüyordu, sanki "kayboluyormuş" gibi hissettiriyordu.
  cuzdanTazele();
}

// Duraklatma 'oyun' dışında yeni bir hal: fizik adımlamıyor, çizim de
// dondurulmuş kare üstünde kalıyor (main.js). Yalnız 'oyun' hâlindeyken
// açılabilir — 'son' ekranındayken zaten oyun bitmiştir.
export function duraklatVer(){
  if(durum.hal!=='oyun' || !durum.D) return;
  durum.hal='duraklat';
  gicirtiGuncelle(0);                 // dondurulmuş kare sessiz kalsın
  const d=durum.D;
  E.dSkor.innerHTML =
    '<div><span>skor</span><b>'+d.skor+'</b></div>'+
    '<div><span>mesafe</span><b>'+d.mesafe.toFixed(0)+' m</b></div>';
  gizle(E.hud); goster(E.duraklat);
}

export function surdur(){
  if(durum.hal!=='duraklat') return;
  durum.hal='oyun';
  gizle(E.duraklat); goster(E.hud);
}

export function bitir(d){
  // Hayalet dünyası da fizik.adim'dan geçiyor ve yere değince buraya
  // geliyor. İlk sürümde bu satır YOKTU: kayıtlı tur bir boşluğa düşerek
  // bittiyse (en sık ölüm), hayalet yere değdiği anda OYUNCUNUN turu
  // bitiyordu — durum.hal='son', skor hayaletinki. Zincir kopması ya da
  // tepeden düşmeyle biten kayıtlarda hayalet düşüş fazında durduğu için
  // (hayalet.js) yere hiç değmiyordu; testler yalnız onları kapsamıştı.
  // Kural: bu fonksiyon GLOBAL durumu değiştiriyor, yalnız oyuncunun
  // dünyası için çalışmalı.
  if(d.hayaletMi){ d.faz='bitti'; return; }
  if(d.ogretici){ ogreticiDus(d); return; }   // öğreticide ölüm yok
  d.faz='bitti'; durum.hal='son';
  const nihai = nihaiSkor(d);
  durum.sonSkor = nihai;
  if(nihai > kayit.rekor) kayit.rekor = nihai;

  // Hayalet ve günlük kayıt: ikisi de skoru bildikten SONRA, çünkü ikisi de
  // "daha iyi mi" diye bakıyor. hayaletSakla jokerli turu kendisi eliyor.
  d.yeniHayalet = hayaletSakla(d, nihai);
  d.gunlukRekor = d.gunluk ? gunSonuc(nihai) : false;
  hedefBitis(d);                      // ikisine de bakıyor: hayaleti geçtin mi, gün serisi

  // Toplanan para bankaya. Can kullanılıp tur sürerse aynı paralar ikinci
  // kez yatmasın diye yalnız fark yatırılıyor.
  const fark = d.para - (d.paraYatirilan||0);
  if(fark > 0){ d.paraYatirilan = d.para; kazan(fark); }
  kayit.omur.tur++; sakla();

  gicirtiGuncelle(0);                 // menüye/bitişe dönüldü, gıcırtı sussun
  sonEkrani(d, sahip('can') > 0);

  if(kayit.surekli){
    surekliIptal();
    surekliZamanlayici = setTimeout(()=> basla(d.tohum, durum.secKar, d.gunluk), SUREKLI_GECIKME);
  }
}

// Can harcayıp son salıncaktan devam. Skor ve toplanan para korunuyor;
// zincir yorgunluğu sıfırlanıyor (zaten her salıncakta sıfırlanıyor).
export function devamEt(){
  const d = durum.D;
  if(!d || durum.hal!=='son' || !canHarca(d)) return;
  surekliIptal();
  const s = d.sal[d.i];
  s.yorgun=0; s.poz='cokuk'; s.pompaT=-9; s.L=s.Lu;
  s.th = .55*(s.th<0?-1:1); s.om = 0; s.gen = .55;
  d.faz='salinim'; d.sebep=''; d.uzanma=0; d.seri=0; d.sars=0;
  d.mesaj='devam!'; d.mesajT=d.t; d.mesajRenk='#79D9AC';
  durum.hal='oyun';
  sakla();
  jokerSesi();
  gizle(E.son); goster(E.hud);
}
