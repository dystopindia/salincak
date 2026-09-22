import { X } from '../cekirdek/tuval.js';
import { ekr, dunya, PM } from '../cekirdek/kamera.js';
import { yerel, CAPA } from './karakter.js';

// Verlet zincir: atkı / kuyruk / hortum. Tamamen süs — oyun durumuna
// dokunmuyor, dünya koordinatında çalışıyor (ekran uzayında yapılırsa
// kamera kaydırması zinciri boşuna savuruyor).
//
// capa: karakterin YEREL çerçevesindeki bağlanma noktası.
const AYAR = {
  cocuk:    { capa:CAPA.boyun, n:5, boy:.18, yer:.78, kal:4.4, renk:'#D3506F', suru:.13 },
  kedi:     { capa:CAPA.kalca, n:6, boy:.15, yer:.30, kal:5.0, renk:'#F5EFE2', suru:.09 },
  astronot: { capa:CAPA.kalca, n:5, boy:.17, yer:.50, kal:3.2, renk:'#8F88C0', suru:.12 },
  // Hayaletin yerçekimi .10 iken zincir hiç sarkmıyor, kalın beyaz bir
  // sopaya dönüşüyordu: az yerçekimi + az sürünme = düz kalan bir çubuk.
  hayalet:  { capa:CAPA.etek,  n:5, boy:.13, yer:.42, kal:2.4, renk:'rgba(233,229,242,.45)', suru:.17 }
};

const ALT_ADIM = 1/60;           // sabit alt adım: değişken dt'de verlet patlıyor
let P=null, sonD=null, sonK=null;

function zincirKur(a,c){
  P=[]; for(let i=0;i<a.n;i++) P.push({x:c.x, y:c.y-i*a.boy, px:c.x, py:c.y-i*a.boy});
}

function coz(a,c,g,ruzgar){
  P[0].x=c.x; P[0].y=c.y;
  for(let i=1;i<P.length;i++){
    const p=P[i], vx=(p.x-p.px)*(1-a.suru), vy=(p.y-p.py)*(1-a.suru);
    p.px=p.x; p.py=p.y;
    p.x += vx + ruzgar*.06*ALT_ADIM*ALT_ADIM*60;
    p.y += vy - g*a.yer*ALT_ADIM*ALT_ADIM;
  }
  for(let it=0;it<5;it++){
    P[0].x=c.x; P[0].y=c.y;
    for(let i=1;i<P.length;i++){
      const A=P[i-1], B=P[i];
      const dx=B.x-A.x, dy=B.y-A.y, m=Math.hypot(dx,dy)||1e-6, f=(m-a.boy)/m;
      if(i===1){ B.x-=dx*f; B.y-=dy*f; }
      else { A.x+=dx*f*.5; A.y+=dy*f*.5; B.x-=dx*f*.5; B.y-=dy*f*.5; }
    }
  }
}

// sx,sy,aci: karakterin çizim çerçevesi. dt: kare süresi.
export function uzuv(d,dt,sx,sy,aci,g,ruzgar){
  const a=AYAR[d.k.id]; if(!a) return;
  const y=yerel(sx,sy,aci,a.capa[0],a.capa[1]);
  const c=dunya(y.sx,y.sy);

  // Yeni oyun ya da karakter değişimi → yeniden zincirKur. Ayrıca tutunmada
  // karakter ışınlandığı için zincir kopmuşsa (çapadan çok uzaksa) sıfırla.
  const uzun=a.boy*a.n*3;
  if(P===null || d!==sonD || d.k.id!==sonK ||
     Math.hypot(P[P.length-1].x-c.x, P[P.length-1].y-c.y)>uzun){
    zincirKur(a,c); sonD=d; sonK=d.k.id;
  }

  for(let n=Math.max(1,Math.min(3,Math.round(dt/ALT_ADIM)));n>0;n--) coz(a,c,g,ruzgar);

  X.strokeStyle=a.renk; X.lineCap='round'; X.lineJoin='round';
  for(let i=1;i<P.length;i++){
    X.lineWidth=a.kal*(1-(i-1)/P.length*.62);
    const A=ekr(P[i-1].x,P[i-1].y), B=ekr(P[i].x,P[i].y);
    X.beginPath(); X.moveTo(A.sx,A.sy); X.lineTo(B.sx,B.sy); X.stroke();
  }
}
