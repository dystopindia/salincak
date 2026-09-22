import { X, W, H, sakin } from '../cekirdek/tuval.js';

// Vinyet ve gren — ekran uzayında, kameradan/dünyadan bağımsız iki son
// rötuş. sahne.ciz() bunları X.restore()'dan SONRA çağırıyor: kamera
// sarsıntısıyla kaymasınlar, her zaman ekranın kendi kenarında/dokusunda
// kalsınlar.

// --- vinyet -------------------------------------------------------------
// Kenarları hafifçe karartıp gözü ortaya, yani karaktere çekiyor. Bölgeye
// ya da saate göre değişmiyor — amacı sabit bir çerçeve hissi, değişken
// bir efekt değil.
export function vinyet(){
  const cx=W/2, cy=H/2;
  const r1=Math.min(W,H)*.44, r2=Math.hypot(cx,cy)*1.05;
  const g=X.createRadialGradient(cx,cy,r1,cx,cy,r2);
  g.addColorStop(0,'rgba(3,3,12,0)');
  g.addColorStop(1,'rgba(3,3,12,.5)');
  X.fillStyle=g; X.fillRect(0,0,W,H);
}

// --- gren ---------------------------------------------------------------
// Gradyanların (özellikle gökyüzü ve ışık havuzları) bant bant görünmesini
// kırıyor. Her karede yeniden ÜRETMÜYOR — 96×96'lık bir doku bir kez
// çiziliyor, `createPattern` ile döşeniyor; her kare yalnız bu dokunun
// başlangıç noktasını hafifçe kaydırıyor, gerçek film greni gibi kıpırdasın.
let doku=null;
function dokuKur(){
  const c=document.createElement('canvas'); c.width=96; c.height=96;
  const gx=c.getContext('2d');
  const veri=gx.createImageData(96,96);
  for(let i=0;i<96*96;i++){
    const v=Math.random()*255;
    veri.data[i*4]=v; veri.data[i*4+1]=v; veri.data[i*4+2]=v;
    veri.data[i*4+3]=Math.random()*46;
  }
  gx.putImageData(veri,0,0);
  doku=X.createPattern(c,'repeat');
}

export function gren(d){
  if(!doku) dokuKur();
  X.save();
  X.globalAlpha=.05;
  const kx = sakin ? 0 : (d.t*37)%96, ky = sakin ? 0 : (d.t*23)%96;
  X.translate(kx,ky);                      // yalnız desenin baş noktası kayıyor
  X.fillStyle=doku;
  X.fillRect(-100,-100,W+200,H+200);        // kaymadan bağımsız, ekranı bolca aşan sabit alan
  X.restore();
}
