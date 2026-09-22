// derle.py tarafindan uretildi — elle duzenleme, derlemede uzerine yazilir.
// Dosya listesi derle.py'deki SIRA'dan turetiliyor.
const SURUM = 'salincak-fd70e3de51';
const DOSYALAR = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/ana.css',
  'ikon/ikon-192.png',
  'ikon/ikon-512.png',
  'ikon/apple-180.png',
  'js/kurulum.js',
  'js/cekirdek/matematik.js',
  'js/cekirdek/tuval.js',
  'js/cekirdek/dom.js',
  'js/cekirdek/kayit.js',
  'js/cekirdek/kamera.js',
  'js/cekirdek/ses.js',
  'js/oyun/tanimlar.js',
  'js/oyun/durum.js',
  'js/oyun/joker.js',
  'js/oyun/para.js',
  'js/oyun/dunya.js',
  'js/oyun/ogretici.js',
  'js/oyun/gunluk.js',
  'js/ui/ekranlar.js',
  'js/oyun/akis.js',
  'js/oyun/fizik.js',
  'js/oyun/hayalet.js',
  'js/oyun/girdi.js',
  'js/ciz/zaman.js',
  'js/ciz/katmanlar.js',
  'js/ciz/gokyuzu.js',
  'js/ciz/zemin.js',
  'js/ciz/salincak.js',
  'js/ciz/karakter.js',
  'js/ciz/isik.js',
  'js/ciz/uzuv.js',
  'js/ciz/para.js',
  'js/ciz/seri.js',
  'js/ciz/ruzgar.js',
  'js/ciz/rotus.js',
  'js/ciz/sahne.js',
  'js/ui/hud.js',
  'js/main.js',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SURUM).then(c => c.addAll(DOSYALAR)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(a => Promise.all(a.filter(k => k !== SURUM).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Gezinme (sayfa acilisi): once ag, olmazsa onbellek — boylece cevrimici
// oyuncu her zaman guncel surumu goruyor, cevrimdisi olan yine aciyor.
// Diger dosyalar: once onbellek (hepsi zaten on belleklendi, ag beklemek
// bosuna gecikme).
self.addEventListener('fetch', e => {
  const istek = e.request;
  if (istek.method !== 'GET' || new URL(istek.url).origin !== location.origin) return;
  if (istek.mode === 'navigate') {
    e.respondWith(fetch(istek).catch(() => caches.match('index.html')));
    return;
  }
  // ignoreSearch: ?v=... gibi bir sorgu ekiyle istenen bir modul yoksa
  // onbellek isabetsiz kalir ve cevrimdisi acilis sessizce bozulur.
  e.respondWith(caches.match(istek, { ignoreSearch: true }).then(v => v || fetch(istek)));
});
