import { X } from '../cekirdek/tuval.js';
import { ekr, kamX, PM } from '../cekirdek/kamera.js';
import { kis, renkA } from '../cekirdek/matematik.js';
import { BOL, bolgeNo } from '../oyun/tanimlar.js';
import { gunEvresi } from './zaman.js';
import { iskeletVar, iskeletFener } from './sprite.js';

// Her salıncağın kirişinin sağ ucunda bir lamba asılı. Hem estetik hem
// işlevsel: karanlıkta bir sonraki salıncağın yerini bu işaretliyor.
// İskelet resmi varsa fener resmin içinde (kirişin ucundan ~2 m sağda,
// ~1 m aşağıda); ışık havuzu ve kenar ışığı tam oradan yayılmalı.
export const lambaKonum = s => iskeletFener(s) || { x: s.x+.78, y: s.py-.22 };

const MENZIL = 4.6;          // ışık havuzunun yarıçapı (m)
const KENAR_MENZIL  = 5.2;          // kenar ışığının etki mesafesi (m)

function fener(L,renk){
  const p=ekr(L.x,L.y), k=ekr(L.x,L.y+.22);
  X.strokeStyle='#3B3568'; X.lineWidth=2;                 // askı
  X.beginPath(); X.moveTo(k.sx,k.sy); X.lineTo(p.sx,p.sy-5); X.stroke();
  X.fillStyle=renk;                                        // fener
  X.beginPath(); X.moveTo(p.sx-5,p.sy-4); X.lineTo(p.sx+5,p.sy-4);
  X.lineTo(p.sx+3.5,p.sy+4); X.lineTo(p.sx-3.5,p.sy+4); X.closePath(); X.fill();
}

// 'lighter' ekleyici karıştırma: altındaki her şeyi aydınlatıyor, bu yüzden
// salıncaklardan SONRA çiziliyor. Karakter bunun da üstünde — ona ışık
// kenar ışığıyla (bkz. kenarIsik) veriliyor, yoksa yıkanıp gidiyor.
export function isiklar(d,b){
  const renk=BOL[b].lamba, R=MENZIL*PM;
  // Fenerin GÖVDESİ her zaman tam görünür (askı iskeletin bir parçası);
  // yalnız yaydığı IŞIK gündüz soluyor — güneşin yanında bir lamba da
  // gerçekte böyle görünür. Taban .18: tam öğlede bile hafif bir iz kalsın,
  // yoksa gün ortasında salıncak "lambasız" görünür (§6.6'nın kuralını bozar).
  const { gunGuc } = gunEvresi(d, BOL[b].gunEtki);
  const yogunluk = .18 + .82*(1-gunGuc);
  for(let j=Math.max(0,d.i-2); j<d.sal.length; j++){
    const s=d.sal[j];
    if(s.x < kamX-MENZIL-6) continue;
    if(s.x > kamX+MENZIL+16) break;
    const L=lambaKonum(s);
    if(!iskeletVar()) fener(L,renk);        // resimde fener zaten çizili

    const p=ekr(L.x,L.y);
    X.globalCompositeOperation='lighter';
    const g=X.createRadialGradient(p.sx,p.sy,0,p.sx,p.sy,R);
    g.addColorStop(0,   renkA(renk,.30*yogunluk));
    g.addColorStop(.28, renkA(renk,.11*yogunluk));
    g.addColorStop(1,   renkA(renk,0));
    X.fillStyle=g; X.beginPath(); X.arc(p.sx,p.sy,R,0,6.3); X.fill();

    const z=ekr(L.x,0);                                    // zemindeki havuz
    const zg=X.createRadialGradient(z.sx,z.sy,0,z.sx,z.sy,R*.8);
    zg.addColorStop(0, renkA(renk,.13*yogunluk)); zg.addColorStop(1, renkA(renk,0));
    X.fillStyle=zg; X.save(); X.translate(z.sx,z.sy); X.scale(1,.28);
    X.beginPath(); X.arc(0,0,R*.8,0,6.3); X.fill(); X.restore();
    X.globalCompositeOperation='source-over';
  }
}

// Karaktere en yakın lambadan gelen ışık: ekran uzayında birim yön + güç.
// karakter() bunu figürü ışığa doğru kaydırıp bir kez daha çizmek için
// kullanıyor; alttaki kopya yalnızca ışık tarafından sızıyor.
export function kenarIsik(d,wx,wy){
  let en=null, enM=1e9;
  for(let j=Math.max(0,d.i-2); j<Math.min(d.sal.length,d.i+4); j++){
    const L=lambaKonum(d.sal[j]), m=Math.hypot(L.x-wx,L.y-wy);
    if(m<enM){ enM=m; en=L; }
  }
  const guc=en ? kis(1-enM/KENAR_MENZIL,0,1) : 0;
  if(guc<=0) return null;
  const b0=bolgeNo(d.i);
  const { gunGuc } = gunEvresi(d, BOL[b0].gunEtki);
  const yogunluk = .18 + .82*(1-gunGuc);          // isiklar()'daki ile aynı egri
  const a=ekr(wx,wy), h=ekr(en.x,en.y);
  const dx=h.sx-a.sx, dy=h.sy-a.sy, m=Math.hypot(dx,dy)||1;
  return { x:dx/m, y:dy/m, g:guc*.9*yogunluk, renk:BOL[b0].lamba };
}
