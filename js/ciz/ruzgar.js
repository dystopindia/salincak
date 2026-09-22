import { X, W, H, sakin } from '../cekirdek/tuval.js';
import { ekr, kamX } from '../cekirdek/kamera.js';
import { nz, kis, renkKar } from '../cekirdek/matematik.js';
import { BOL, bolgeNo } from '../oyun/tanimlar.js';
import { ruzg } from '../oyun/fizik.js';
import { gunEvresi } from './zaman.js';

// Rüzgâr çizgileri: havanın kendisi.
//
// Rüzgâr baştan beri MEKANİK olarak önemliydi (uçuşta vx'i itiyor, ormanda
// ×1.35, bulutlarda ×1.9, hayalette ×2.3) ama ekranda yalnız HUD'da bir
// sayıydı. Sayı okunmuyordu: oyuncu havadayken hedefe bakıyor, köşedeki
// "→ 2.1"e değil. Sonuç, savrulmanın sürpriz gibi hissedilmesiydi.
// Buradaki çizgiler o sayının dünyadaki karşılığı — YÖN ve ŞİDDET aynı
// `ruzg(d)` değerinden geliyor, süs değil okuma.
//
// Durum tutmuyor: konum d.t ve nz(i)'den türüyor (ciz/seri.js ve
// ciz/zaman.js ile aynı disiplin — 60 Hz'de çizilen süs çöp üretmemeli)
// ve d.r'ye dokunmuyor (§0).

const RUZ_N = 32;
const RUZ_ESIK = .30;              // altında hava durgun sayılıyor, hiç çizilmiyor
const RUZ_DOLU = 2.8;              // tam güç (hayalet + bulutlar bunu aşabiliyor)

export function ruzgarCiz(d){
  const r = ruzg(d);
  const guc = kis((Math.abs(r)-RUZ_ESIK)/(RUZ_DOLU-RUZ_ESIK), 0, 1);
  if(guc <= 0) return;
  const yon = r>=0 ? 1 : -1;

  const b = bolgeNo(d.i);
  // Gündüz açık gökte beyaz çizgi kayboluyor — seri sayacındaki tuzağın
  // (§8) aynısı. Renk gündüze doğru bölgenin ön plan tonuna kayıyor:
  // gece açık bir iz, gündüz dumanlı bir iz, ikisi de okunuyor.
  const { gunGuc } = gunEvresi(d, BOL[b].gunEtki);
  const renk = renkKar('#F4F1FF', BOL[b].on, gunGuc*.70);

  // Zeminin altına rüzgâr çizilmiyor: toprağın içinden geçen bir çizgi
  // hemen hata gibi okunuyor.
  const alt = Math.min(H, ekr(kamX,0).sy - 6);
  if(alt < 30) return;
  const genis = W + 260;

  X.save();
  X.lineCap = 'round';
  X.strokeStyle = renk;
  for(let i=0;i<RUZ_N;i++){
    const k = .38 + nz(i*2.9)*.62;              // derinlik: hız, kalınlık, alfa
    const hiz = (.20 + .95*guc) * k;            // ekran genişliği / saniye
    const u = sakin ? nz(i*7.7) : (((nz(i*7.7) + d.t*hiz*yon) % 1) + 1) % 1;
    const sx = u*genis - 130;
    // Üst yarıya doğru yığılıyor (üs 1.25): zemine yakın silüetlerin
    // üstünde duran soluk yatay çizgi hareketsiz bakıldığında leke gibi
    // okunuyor, gökyüzünde ise hava gibi.
    const sy = Math.pow(nz(i*5.3+3),1.25)*alt + Math.sin(d.t*(.8+k) + i*2.3)*6*k;
    const boy = (26 + 150*guc) * k;             // şiddet arttıkça iz uzuyor
    // Gündüz biraz daha koyu VE daha belirgin: açık gökte aynı alfa
    // gece kadar okunmuyor (aynı sebep seri.js'te 'lighter'ı elettirdi).
    // Eşiğin hemen üstünde çizgiler BİRDEN belirmesin: guc*4 ile son
    // rötuşta yumuşak açılıyorlar (öğreticide rüzgâr .4, tam bu sınırda).
    X.globalAlpha = (.08 + .30*guc) * k * (1 + gunGuc*.30) * Math.min(1, guc*4);
    X.lineWidth = 1.0 + 1.8*k;
    // Kuyruk arkada: baş sx'te, iz gidilen yönün tersine uzanıyor. Düz
    // çizgi ray gibi duruyordu, hafif bir kavis onu havaya çeviriyor.
    X.beginPath();
    X.moveTo(sx - yon*boy, sy + Math.sin(d.t*1.6+i)*3);
    X.quadraticCurveTo(sx - yon*boy*.5, sy + Math.sin(d.t*2.1+i*1.7)*7*k, sx, sy);
    X.stroke();
  }
  X.globalAlpha = 1;
  X.restore();
}
