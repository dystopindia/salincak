import { X, sakin } from '../cekirdek/tuval.js';
import { nz, kis, renkKar, renkA } from '../cekirdek/matematik.js';

// Seri sayacı: oyuncunun üstünde yanan alev + "×N".
//
// Seri fizik tarafında tutuluyor (fizik.yakala: ardışık uzanarak yakalama
// ya da salıncak atlama); burası yalnız BOYAMA — oyun durumuna dokunmuyor,
// §0'daki tek yönlü bağımlılık kuralı.
//
// Parçacıkların durumu YOK: konum d.t'den ve nz(i)'den türüyor, yani dizi
// tutmuyoruz, tahsisat yok. Aynı disiplin hava parçacıklarında da var
// (ciz/zaman.js) — 60 Hz'de çizilen süs, çöp üretmemeli.

const ALEV_N = 14;
const CEKIRDEK = '#FFE9A8';                   // en sıcak iç
const SOGUK = '#F2B33D', SICAK = '#FF4E1C';   // seri 1 → seri 5+

// Kaç seride tam güce ulaşıyor: oyuncunun istediği "5 kere art arda".
const TAM = 5;

export function seriCiz(d, sx, sy){
  const n = d.seri|0;
  if(n < 1) return;

  const guc = kis(n/TAM, .22, 1);
  const yas = d.t - (d.seriT ?? -9);
  // Artış anında kısa bir patlama: sayı büyüyüp yerine oturuyor, alev
  // bir an için daha yükseliyor.
  const pop = yas < .38 ? 1 + (1-yas/.38)*(1-yas/.38)*.75 : 1;
  const renk = renkKar(SOGUK, SICAK, kis((n-1)/(TAM-1),0,1));

  // Mesaj yazısı sy-48'de uçuyor (sahne.ciz); alev ondan YUKARIDA durmalı,
  // yoksa 'uzanarak yakaladın' ile sayı üst üste biniyor.
  const taban = sy - 52;
  const boy = (30 + 34*guc) * pop;

  // 'lighter' DEĞİL: gündüz gökyüzünde eklemeli karışım beyaza doyup
  // alevi görünmez yapıyordu. Düz alfa hem gece hem gündüz okunuyor.
  X.save();
  for(let i=0;i<ALEV_N;i++){
    // her parçacık kendi hızında yukarı akıp başa sarıyor
    const hiz = .9 + nz(i*3.1)*.7;
    const u = sakin ? nz(i*7.7) : ((d.t*hiz + nz(i*7.7)) % 1);
    const yanma = 1-u;                         // yukarıda sönüyor
    const salin = Math.sin(d.t*3.2 + i*1.9) * (3 + 5*u) * guc;
    const px = sx + (nz(i*5.3)-.5)*14*guc + salin;
    const py = taban - u*boy;
    const r = (3.0 + 4.4*guc) * yanma * pop;
    if(r <= .2) continue;
    const g = X.createRadialGradient(px,py,0,px,py,r*2.4);
    g.addColorStop(0, renkA(u<.35?CEKIRDEK:renk, .80*yanma*guc));
    g.addColorStop(.55, renkA(renk, .42*yanma*guc));
    g.addColorStop(1, renkA(renk, 0));
    X.fillStyle = g;
    X.beginPath(); X.arc(px,py,r*2.4,0,6.3); X.fill();
  }
  // Sayı: alevin tam ortasında, koyu kenarla — alev üstünde okunabilsin.
  const yazi = '×'+n;
  const boyut = Math.round((16 + 8*guc) * pop);
  X.font = '800 '+boyut+'px system-ui';
  X.textAlign = 'center'; X.textBaseline = 'middle';
  X.lineWidth = 3.8; X.strokeStyle = 'rgba(12,8,24,.85)';
  X.strokeText(yazi, sx, taban - boy*.42);
  X.fillStyle = n>=TAM ? CEKIRDEK : renkKar('#FFF1CF', renk, .45);
  X.fillText(yazi, sx, taban - boy*.42);
  X.textAlign='left'; X.textBaseline='alphabetic';
  X.restore();
}
