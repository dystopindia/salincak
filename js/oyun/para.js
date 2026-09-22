import { kis } from '../cekirdek/matematik.js';

// Paralar boşluğun ortasında, atlayış yayının üstünde duruyor. Yerleri
// tohumdan türüyor (d.r), yani aynı tohum aynı para dizilimini veriyor.
//
// Tasarım: paralar İYİ YÖRÜNGEYİ ödüllendiriyor. Kordonun üstünde bir
// kavis üzerindeler; hepsini toplamak, bir sonraki salıncağa tam
// yükseklikten girmek demek. Alçak ve korkak bir atlayış alttan geçiyor.

export const PARA_R = .52;          // toplama yarıçapı (m)
export const MIKNATIS_R = 3.6;      // mıknatıs açıkken çekim yarıçapı (m)

// Çekim hızı. İlk sürüm 9 m/s tavanlıydı ve kenardan (m≈R) çekilen bir para
// oyuncuyu geçmeden önce yetişemiyordu — bir uçuş genelde 0.5-1 s sürüyor,
// 2 m'den gelen bir para o sürede yolun yarısını bile alamıyordu. Artık
// doğrusal değil: aralığın İÇİNDEKİ paralar (m<İÇ_YARI) neredeyse anında
// yapışıyor, dışarıdakiler de eskisinin iki katı hızla geliyor.
const MIKNATIS_HIZ = 20, MIKNATIS_IC = MIKNATIS_R*.4;

// salincakUret içinden çağrılıyor: i. salıncağa GİDEN boşluğun paraları.
export function paraUret(r, onceki, x, py, L){
  if(!onceki) return [];
  const ax = onceki.x, ay = onceki.py - onceki.Lu;   // önceki oturak
  const bx = x,        by = py - L;                  // yeni oturak
  const n = 3 + Math.floor(r()*3);                   // 3..5
  const tepe = 1.3 + r()*2.3;                        // kordonun üstündeki kavis (m)
  const kay = (r()*2-1)*.35;
  const par = [];
  for(let j=0;j<n;j++){
    const t = (j+1)/(n+1);
    par.push({
      x: ax + (bx-ax)*t,
      y: ay + (by-ay)*t + 4*tepe*t*(1-t) + kay,
      alindi: false
    });
  }
  return par;
}

// Görünürdeki salıncakların paralarını gezer. Çizim tarafı da bunu kullanıyor.
export function yakinParalar(d, geri=2, ileri=3){
  const liste=[];
  for(let j=Math.max(0,d.i-geri); j<Math.min(d.sal.length, d.i+ileri+1); j++){
    const p=d.sal[j].para;
    if(p) for(const q of p) liste.push(q);
  }
  return liste;
}

// fizik.adim'dan çağrılıyor — saniyede 240 kez. Bu yüzden yakinParalar()
// gibi dizi ayırmıyor, salıncaklar üzerinde doğrudan geziyor: aksi halde
// saniyede 240 çöp dizi üretip mobilde GC'yi tetikliyor.
// rng'ye DOKUNMUYOR — determinizm korunuyor.
export function paraTopla(d, x, y, dt, miknatis){
  const R = PARA_R * (miknatis ? 1.35 : 1);
  const son = Math.min(d.sal.length, d.i+4);
  let alinan = 0;
  for(let j=Math.max(0,d.i-2); j<son; j++){
    const par = d.sal[j].para;
    if(!par) continue;
    for(let n=0;n<par.length;n++){
      const q = par[n];
      if(q.alindi) continue;
      const dx = x-q.x, dy = y-q.y, m = Math.hypot(dx,dy);
      if(miknatis && m < MIKNATIS_R){        // paralar oyuncuya doğru sürükleniyor
        const guc = m<MIKNATIS_IC ? 1 : kis(1-(m-MIKNATIS_IC)/(MIKNATIS_R-MIKNATIS_IC), .35, 1);
        const c = guc * MIKNATIS_HIZ * dt / Math.max(m,.001);
        q.x += dx*c; q.y += dy*c;
      }
      if(m < R){ q.alindi = true; alinan++; }
    }
  }
  return alinan;
}
