// Giriş noktası: sabit adımlı fizik + her karede bir çizim.
import './cekirdek/tuval.js';
import { durum } from './oyun/durum.js';
import { adim, yavaslamaFaktoru } from './oyun/fizik.js';
import { baglaGirdi } from './oyun/girdi.js';
import { ciz } from './ciz/sahne.js';
import { sonIsle } from './ciz/sonisleme.js';
import { hudG } from './ui/hud.js';
import { kimlikKur, dukkanKur, ayarlarKur } from './ui/ekranlar.js';
import { kayit, yukle } from './cekirdek/kayit.js';
import { aktif } from './oyun/joker.js';
import { ogreticiBittiMi } from './oyun/ogretici.js';
import { ogreticiBitir } from './oyun/akis.js';
import { bolgeNo, ADIM } from './oyun/tanimlar.js';
import { hayaletAdim } from './oyun/hayalet.js';
import { hedefAdim } from './oyun/hedef.js';
import { vitrinAdim } from './oyun/vitrin.js';
import { kameraAt } from './cekirdek/kamera.js';
import { sesiKapat, muzikAc, muzikAdim, titresimAc } from './cekirdek/ses.js';

// ADIM (fizik adımı, 1/240) oyun/tanimlar.js'te: hayalet kaydı da onu
// zaman birimi olarak kullanıyor, tek kaynak olmalı.
const AZAMI = .05;       // sekme sonrası dev dt'yi yut

let onceki = performance.now(), bir = 0, sonHal = '';

function dongu(su){
  const dt = Math.min(AZAMI, (su-onceki)/1000);
  onceki = su;

  // Menüde eski tur değil vitrin çiziliyor (oyun/vitrin.js): seçili
  // karakter parkta sallanıyor. Menüye girerken kamera oraya ATLIYOR.
  if(durum.hal==='menu'){
    const v = vitrinAdim(dt);
    if(sonHal!=='menu') kameraAt(v.sal[0].x, 0);
    ciz(v, dt); sonIsle(v);
  }
  sonHal = durum.hal;

  const d = durum.D;
  if(d && durum.hal!=='menu'){
    if(durum.hal==='oyun'){
      // İki bağımsız kaynak zamanı yavaşlatabilir: Odak jokeri (süreli,
      // oyuncunun seçimi) ve yakalama-anı yavaşlaması (otomatik, kısa).
      // İkisi de fizik dt'sini küçültüyor, çizim gerçek dt ile sürüyor
      // (uzuvlar ve kamera akıcı kalsın) — en kısıtlayıcı olan kazanıyor.
      const yavas = Math.min(aktif(d,'odak') ? .42 : 1, yavaslamaFaktoru(d));
      bir += dt*yavas;
      // Hayalet oyuncuyla ADIM ADIM kilitli: aynı döngüde, aynı sayıda.
      // Gerçek saniye değil oyun zamanı karşılaştırılıyor — yavaşlatma
      // ikisini birden etkiliyor, yani yarış dürüst kalıyor.
      while(bir > ADIM){
        if(d.faz!=='bitti') adim(d, ADIM);
        hayaletAdim();
        bir -= ADIM;
      }
      // Hedefler kare başına bir kez: fizik adımı başına bakmaya gerek yok,
      // yüklemler tur istatistiklerine bakıyor ve bir kare gecikme hissedilmez.
      // Tur bu karede bittiyse hal artık 'son' — o durumda bitir() içindeki
      // hedefBitis bakıyor.
      if(durum.hal==='oyun') hedefAdim(d);
      hudG(d);
      if(d.ogretici && ogreticiBittiMi(d)) ogreticiBitir(false);
    }
    // 'duraklat' hâlinde çizim de duruyor — ekran son karede donuyor,
    // dondurulmuş bir karenin üstünde kamera/uzuvların akmaya devam etmesi
    // "duraklatılmış" hissini bozardı.
    // Son işleme (WebGL bloom + derece) her çizilen karenin hemen ardından;
    // kapalıysa ya da WebGL yoksa hiçbir şey yapmadan dönüyor (ciz/sonisleme.js).
    if(durum.hal!=='duraklat'){ ciz(d, dt); sonIsle(d); }
  }
  // Müzik oyunda ve duraklatmada çalıyor, menü/bitişte sönüyor. Bölge
  // değişince cümle de değişiyor (ses.js, ölçü başında).
  muzikAdim(d && (durum.hal==='oyun'||durum.hal==='duraklat') ? bolgeNo(d.i) : -1);
  requestAnimationFrame(dongu);
}

// hata ayıklama kancası: konsoldan durum.D ile canlı oyuna bakabilirsin
window.salincak = durum;

yukle();
sesiKapat(!kayit.ses);          // kalıcı tercih burada uygulanıyor
muzikAc(kayit.muzik);
titresimAc(kayit.titresim);
kimlikKur();
dukkanKur();
ayarlarKur();
baglaGirdi();
requestAnimationFrame(dongu);
