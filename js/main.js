// Giriş noktası: sabit adımlı fizik + her karede bir çizim.
import './cekirdek/tuval.js';
import { durum } from './oyun/durum.js';
import { adim, yavaslamaFaktoru } from './oyun/fizik.js';
import { baglaGirdi } from './oyun/girdi.js';
import { ciz } from './ciz/sahne.js';
import { hudG } from './ui/hud.js';
import { kimlikKur, dukkanKur, ayarlarKur } from './ui/ekranlar.js';
import { kayit, yukle } from './cekirdek/kayit.js';
import { aktif } from './oyun/joker.js';
import { ogreticiBittiMi } from './oyun/ogretici.js';
import { ogreticiBitir } from './oyun/akis.js';
import { bolgeNo } from './oyun/tanimlar.js';
import { sesiKapat, muzikAc, muzikAdim } from './cekirdek/ses.js';

const ADIM = 1/240;      // fizik adımı — parametrik rezonans küçük dt istiyor
const AZAMI = .05;       // sekme sonrası dev dt'yi yut

let onceki = performance.now(), bir = 0;

function dongu(su){
  const dt = Math.min(AZAMI, (su-onceki)/1000);
  onceki = su;

  const d = durum.D;
  if(d){
    if(durum.hal==='oyun'){
      // İki bağımsız kaynak zamanı yavaşlatabilir: Odak jokeri (süreli,
      // oyuncunun seçimi) ve yakalama-anı yavaşlaması (otomatik, kısa).
      // İkisi de fizik dt'sini küçültüyor, çizim gerçek dt ile sürüyor
      // (uzuvlar ve kamera akıcı kalsın) — en kısıtlayıcı olan kazanıyor.
      const yavas = Math.min(aktif(d,'odak') ? .42 : 1, yavaslamaFaktoru(d));
      bir += dt*yavas;
      while(bir > ADIM){ if(d.faz!=='bitti') adim(d, ADIM); bir -= ADIM; }
      hudG(d);
      if(d.ogretici && ogreticiBittiMi(d)) ogreticiBitir(false);
    }
    // 'duraklat' hâlinde çizim de duruyor — ekran son karede donuyor,
    // dondurulmuş bir karenin üstünde kamera/uzuvların akmaya devam etmesi
    // "duraklatılmış" hissini bozardı.
    if(durum.hal!=='duraklat') ciz(d, dt);
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
kimlikKur();
dukkanKur();
ayarlarKur();
baglaGirdi();
requestAnimationFrame(dongu);
