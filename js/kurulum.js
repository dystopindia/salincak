// Ana ekrana kurulum (PWA). Oyunun kendisine hiç karışmıyor: servis
// çalışanını kaydediyor ve tarayıcı "kurulabilir" derse menüdeki düğmeyi
// gösteriyor. derle.py bu dosyayı tek dosyalık sürüme KATMIYOR — orada
// ayrı bir sw.js yok, kayıt 404 verirdi.
import { bKur } from './cekirdek/dom.js';
import { tikSesi } from './cekirdek/ses.js';

// file:// ile açıldığında servis çalışanı yok (ve gerekmiyor: dosya zaten
// yerelde). https ya da localhost şart — tarayıcı kuralı.
//
// Yerel geliştirmede KAYIT YOK (?sw ile zorlanabilir): sw.js derlemede
// üretiliyor ve ön belleği `ignoreSearch` ile arıyor — düzenlenen bir
// modül, `?v=` eklense bile, son derlemedeki eski haliyle geliyordu.
// Bir oturumda üç kez "düzelttim ama değişmedi" diye zaman yedi.
const yerel = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) && !/[?&]sw\b/.test(location.search);
if('serviceWorker' in navigator && location.protocol.startsWith('http') && !yerel){
  addEventListener('load', ()=> navigator.serviceWorker.register('sw.js').catch(()=>{}));
}

// beforeinstallprompt yalnız kurulabilir durumda ve yalnız bir kez geliyor;
// olayı saklayıp düğmeye basılınca kullanıyoruz. Safari bu olayı hiç
// göndermiyor (orada Paylaş > Ana Ekrana Ekle elle yapılıyor), o yüzden
// düğme varsayılan olarak gizli.
let istem=null;
addEventListener('beforeinstallprompt', e=>{
  e.preventDefault(); istem=e;
  if(bKur) bKur.classList.remove('gizli');
});
addEventListener('appinstalled', ()=>{ istem=null; if(bKur) bKur.classList.add('gizli'); });

if(bKur) bKur.onclick=async()=>{
  if(!istem) return;
  tikSesi();
  istem.prompt();
  await istem.userChoice;
  istem=null; bKur.classList.add('gizli');   // istem tek kullanımlık
};
