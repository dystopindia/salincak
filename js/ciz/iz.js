import { X, sakin } from '../cekirdek/tuval.js';
import { ekr } from '../cekirdek/kamera.js';
import { nz, kis, renkA, renkKar } from '../cekirdek/matematik.js';
import { yer } from '../oyun/fizik.js';
import { seciliIz } from '../oyun/hedef.js';

// Uçuş izleri — ustalık hedefleriyle açılan görünüm (oyun/hedef.js).
//
// DURUM TUTMUYOR. Bir iz için geçmiş konumları saklamak gerekir sanılır;
// gerekmiyor, çünkü uçuş balistik: şimdiki (p, v)'den geriye doğru
//     p(t−τ) = p − v·τ − ½·g·τ²·ŷ
// ile havadaki yol tam olarak yeniden kuruluyor (rüzgâr ve sürtünme bu
// kısa τ'da ihmal edilecek kadar küçük). Dizi yok, tahsisat yok — seri
// sayacı ve hava parçacıklarıyla aynı disiplin. τ, atlama anından
// (d.ucusT) öteye gitmiyor: yoksa iz salıncağın arkasına, hiç uçulmamış
// havaya uzanırdı.
//
// 'lighter' YOK (§8): gündüz gökte beyaza doyup kayboluyor.

const NOKTA = 16;

function geri(d, g, tau){
  return ekr(d.px - d.vx*tau, d.py - d.vy*tau - .5*g*tau*tau);
}

export function izCiz(d){
  if(d.faz!=='ucus') return;
  const tur = seciliIz();
  if(tur==='yok') return;
  const g = yer(d), ucus = Math.max(0, d.t - d.ucusT);
  X.save(); X.lineCap='round';
  if(tur==='alev')        alev(d, g, Math.min(.30, ucus));
  else if(tur==='kuyruk') kuyruk(d, g, Math.min(.46, ucus));
  else if(tur==='toz')    toz(d, g, ucus);
  X.restore();
}

// Alev: seri sayacının paletiyle kalınlaşan-incelen bir şerit.
function alev(d, g, T){
  if(T<=.01) return;
  let onceki = geri(d, g, 0);
  for(let k=1;k<=NOKTA;k++){
    const u = k/NOKTA, p = geri(d, g, u*T);
    const titre = sakin ? 1 : .8 + .2*Math.sin(d.t*24 + k*1.7);
    X.strokeStyle = renkA(renkKar(u<.35?'#FFE9A8':'#F2B33D', '#FF4E1C', u), (1-u)*.85);
    X.lineWidth = (9*(1-u) + 1)*titre;
    X.beginPath(); X.moveTo(onceki.sx, onceki.sy); X.lineTo(p.sx, p.sy); X.stroke();
    onceki = p;
  }
}

// Kuyruklu yıldız: uzun, ince, soğuk bir kuyruk ve başta yumuşak bir hale.
function kuyruk(d, g, T){
  const bas = geri(d, g, 0);
  const h = X.createRadialGradient(bas.sx, bas.sy, 0, bas.sx, bas.sy, 16);
  h.addColorStop(0, 'rgba(220,245,255,.55)'); h.addColorStop(1, 'rgba(160,220,255,0)');
  X.fillStyle = h; X.beginPath(); X.arc(bas.sx, bas.sy, 16, 0, 6.3); X.fill();
  if(T<=.01) return;
  let onceki = bas;
  for(let k=1;k<=NOKTA;k++){
    const u = k/NOKTA, p = geri(d, g, u*T);
    X.strokeStyle = renkA(renkKar('#F4FBFF', '#7FC8F0', u), (1-u)*(1-u)*.9);
    X.lineWidth = 5*(1-u) + .6;
    X.beginPath(); X.moveTo(onceki.sx, onceki.sy); X.lineTo(p.sx, p.sy); X.stroke();
    onceki = p;
  }
}

// Yıldız tozu: öbür ikisinden farklı olarak DÜNYAYA bırakılıyor. Her toz
// tanesi bir yayılma ANINA bağlı (e = ⌊t/Δ⌋·Δ − jΔ), konumu oyuncunun o
// anda bulunduğu nokta — yani oyuncu uzaklaşırken tane yerinde kalıp
// sönüyor. Anı τ'ya değil yayılma zamanına bağlamak şart: τ'ya bağlasaydık
// tozlar oyuncuyla birlikte sürüklenen bir kuyruk olurdu.
const TOZ_ARA = .022, TOZ_OMUR = .55;
function toz(d, g, ucus){
  const son = Math.floor(d.t/TOZ_ARA);
  for(let j=0;j<TOZ_OMUR/TOZ_ARA;j++){
    const e = (son-j)*TOZ_ARA, tau = d.t - e;
    if(tau > ucus || tau > TOZ_OMUR) break;
    const tohum = son-j;                             // tanenin kimliği: yayılma anı
    const p = geri(d, g, tau);
    const yas = tau/TOZ_OMUR;
    const sx = p.sx + (nz(tohum*3.1)-.5)*16*yas*2, sy = p.sy + (nz(tohum*7.3)-.5)*16*yas*2 + yas*10;
    const pirilti = sakin ? .8 : .55 + .45*Math.sin(d.t*14 + tohum*2.1);
    const r = (1.2 + nz(tohum*5.7)*1.8) * (1-yas*.6);
    X.fillStyle = renkA(nz(tohum*1.9)<.5 ? '#FFF6D8' : '#CFE8FF', (1-yas)*pirilti);
    X.beginPath(); X.arc(sx, sy, r, 0, 6.3); X.fill();
  }
}
