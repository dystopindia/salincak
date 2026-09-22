import { X } from '../cekirdek/tuval.js';
import { parlaklik } from '../cekirdek/matematik.js';

// Yerel çerçeve: kalça (0,0), y AŞAĞI, birim ≈ px. aci DAİMA −θ ile gelir
// (bkz. CLAUDE.md §1). +θ verirsen figür ipin ters tarafına yatar.
//
// Figür çubuk adam değil: gövde dolu bir biçim, uzuvlar kalın yuvarlak uçlu
// darbeler. Arkadaki kol/bacak koyu tonda çizilip önündekiler üstüne
// bindiriliyor — tek numarayla hacim hissi.

const KAFA = -23, KAFA_R = 5.8, OMUZ = -15;

// Figürün tamamı tek renk olduğu için kafa, kol ve gövde üst üste binince
// tek bir lekeye yapışıyordu. Her parça önce KOYU bir kenarla, sonra açık
// renkle çiziliyor: kenar yolun dışında kalan yarısı kadar görünüyor ve
// parçaları birbirinden ayırıyor. 40 px'lik bir figürü okunur kılan şey bu.
const KENAR = 2.6;

function ciftli(yol,renk,golge,kal){
  X.strokeStyle=golge; X.lineWidth=kal+KENAR*1.4; yol();
  X.strokeStyle=renk;  X.lineWidth=kal;           yol();
}
function dolgu(yol,renk,golge){
  yol(); X.strokeStyle=golge; X.lineWidth=KENAR; X.stroke();
  X.fillStyle=renk; X.fill();
}

function bacak(ayakta,t){
  return ()=>{ X.beginPath();
    if(ayakta){ X.moveTo(t*2,-1); X.lineTo(t*3.2,9.5); X.lineTo(t<0?-5:3.6,19); }
    else      { X.moveTo(t*2,-1); X.lineTo(9+t*1.2,6); X.lineTo(4.2+t*1.4,15); }
    X.stroke(); };
}
function ayakYol(ayakta,t){
  return ()=>{ X.beginPath();
    if(ayakta){ const x=t<0?-5:3.6; X.moveTo(x,19.4); X.lineTo(x-4,20); }
    else      { X.moveTo(4.2+t*1.4,15); X.lineTo(8.4+t*1.4,16.5); }
    X.stroke(); };
}
// Omuz → dirsek → zinciri kavrayan el. İki şey önemli:
// (1) ön kol kafadan SONRA çiziliyor, önce çizilirse kafanın altında kalıyor;
// (2) el kafanın YANINDAN geçiyor (x=±6.6 > kafa yarıçapı 5.8), üstünden
//     geçerse kol kafayı ikiye bölüyor ve figür başlıklı bir lekeye dönüyor.
// x=±6.6 px ≈ ±0.157 m, yani zincirCiz'in çizdiği iki zincirin tam üstü.
function kol(t){
  return ()=>{ X.beginPath();
    X.moveTo(t*3.4,-13.5); X.lineTo(t*7.6,-20); X.lineTo(t*6.6,-30);
    X.stroke(); };
}
function govdeYol(){
  X.beginPath();
  X.moveTo(-5.0,OMUZ); X.quadraticCurveTo(-5.6,-7.5,-4.0,1);
  X.lineTo(4.0,1);     X.quadraticCurveTo(5.6,-7.5, 5.0,OMUZ);
  X.closePath();
}

function detay(k,c,golge){
  if(k.id==='cocuk'){
    X.lineCap='round';
    ciftli(()=>{ X.beginPath(); X.moveTo(.5,KAFA-5.2);
      X.quadraticCurveTo(3.6,KAFA-10,1,KAFA-9.4); X.stroke(); }, c, golge, 2.0);
  }
  if(k.id==='kedi'){
    dolgu(()=>{ X.beginPath();
      X.moveTo(-5.0,KAFA-2.6); X.lineTo(-3.8,KAFA-8.4); X.lineTo(-1.0,KAFA-4.6); X.closePath();
      X.moveTo( 5.0,KAFA-2.6); X.lineTo( 3.8,KAFA-8.4); X.lineTo( 1.0,KAFA-4.6); X.closePath();
    }, c, golge);
  }
  if(k.id==='astronot'){
    X.strokeStyle=golge; X.lineWidth=4.6;
    X.beginPath(); X.arc(0,KAFA,8.1,0,6.3); X.stroke();
    X.strokeStyle=c; X.lineWidth=2.2; X.stroke();
    X.fillStyle='rgba(242,179,61,.32)';
    X.beginPath(); X.arc(1.3,KAFA,5.0,0,6.3); X.fill();
  }
}

// Sıra hacmi veren şey: sırt ünitesi → arka uzuvlar (koyu) → gövde →
// ön bacak → kafa → ön kol.
function sekil(k,ayakta,c,duz){
  const golge = duz ? c : parlaklik(c,.28);
  const arka  = duz ? c : parlaklik(c,.60);
  X.lineCap='round'; X.lineJoin='round';

  if(k.id==='astronot') dolgu(()=>{ X.beginPath();
    X.moveTo(-9.2,-16.5); X.lineTo(-4.6,-17.5); X.lineTo(-4.6,-4); X.lineTo(-9.2,-5);
    X.closePath(); }, duz?c:parlaklik(c,.74), golge);

  ciftli(bacak(ayakta,-1), arka, golge, 4.4);
  ciftli(ayakYol(ayakta,-1), arka, golge, 3.2);
  ciftli(kol(-1), arka, golge, 3.4);

  dolgu(govdeYol, c, golge);
  dolgu(()=>{ X.beginPath(); X.ellipse(0,OMUZ+.6,5.2,2.3,0,0,6.3); }, c, golge);

  ciftli(bacak(ayakta,1), c, golge, 4.6);
  ciftli(ayakYol(ayakta,1), c, golge, 3.4);

  dolgu(()=>{ X.beginPath(); X.arc(0,KAFA,KAFA_R,0,6.3); }, c, golge);
  detay(k, duz?c:c, golge);

  ciftli(kol(1), c, golge, 3.6);
}

function hayaletSekil(c){
  X.fillStyle=c; X.strokeStyle=c;
  X.beginPath();
  X.moveTo(-10,-4); X.quadraticCurveTo(-11.5,-27,0,-27);
  X.quadraticCurveTo(11.5,-27,10,-4);
  for(let i=0;i<5;i++) X.quadraticCurveTo(8-i*4, i%2?4:12, 6-i*4, 7);
  X.closePath(); X.fill();
}

// isik: { x, y, g, renk } — ekran uzayında birim yön + güç. null olabilir.
export function karakter(sx,sy,aci,ayakta,k,isik){
  const c = k.id==='hayalet' ? 'rgba(233,229,242,.78)' : '#F5EFE2';
  const ciz = duz => {
    if(k.id==='hayalet') hayaletSekil(duz?isik.renk:c);
    else sekil(k,ayakta,duz?isik.renk:c,duz);
  };

  // Kenar ışığı: figürün ışığa doğru kaydırılmış bir kopyası altta kalıyor,
  // yalnız lambaya bakan kenardan sızıyor. Ayrı bir gradyandan ucuz.
  if(isik && isik.g>.04){
    const o=2.0+isik.g*1.6;
    X.save(); X.globalAlpha=Math.min(.95,isik.g); X.globalCompositeOperation='lighter';
    X.translate(sx+isik.x*o, sy+isik.y*o); X.rotate(aci); ciz(true); X.restore();
  }

  X.save(); X.translate(sx,sy); X.rotate(aci); ciz(false);
  if(k.id==='hayalet'){                                     // gözler
    X.fillStyle='#2A2A5E';
    X.beginPath(); X.arc(-3.4,-18,2,0,6.3); X.arc(3.4,-18,2,0,6.3); X.fill();
  }
  X.restore();
}

// Uzuv (atkı/kuyruk) çapasının yerel noktasını ekran koordinatına çevirir.
export function yerel(sx,sy,aci,lx,ly){
  const c=Math.cos(aci), s=Math.sin(aci);
  return { sx: sx+lx*c-ly*s, sy: sy+lx*s+ly*c };
}
// Uzuv çapaları. Boyun çapası ORTADAN kaydırılmış: tam ortada olursa atkı
// gövdenin önüne düşüp bir tahta gibi duruyor, kenarda omzun üstünden akıyor.
export const CAPA = { boyun:[-2.6,-17], kalca:[-3.2,-2], etek:[-5.5,3] };
