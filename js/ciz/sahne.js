import { X, W, sakin } from '../cekirdek/tuval.js';
import { ekr, izle, kamX, PM, olcek } from '../cekirdek/kamera.js';
import { kis } from '../cekirdek/matematik.js';
import { bolgeNo } from '../oyun/tanimlar.js';
import { oturX, oturY, yorunge, tutunmaR, yer, ruzg } from '../oyun/fizik.js';
import { gok } from './gokyuzu.js';
import { zemin } from './zemin.js';
import { uzak, orta, on } from './katmanlar.js';
import { iskelet, zincirCiz } from './salincak.js';
import { karakter } from './karakter.js';
import { isiklar, kenarIsik } from './isik.js';
import { uzuv } from './uzuv.js';
import { paraCiz, paraPop } from './para.js';
import { parcaciklarCiz } from './zaman.js';
import { vinyet, gren } from './rotus.js';

export function ciz(d, dt=1/60){
  olcek();          // ölçek ekran boyutuna bağlı; resize sırasına güvenme
  const p = d.faz==='salinim'
    ? { x:oturX(d.sal[d.i]), y:oturY(d.sal[d.i]) }
    : { x:d.px, y:d.py };
  izle(p.x, p.y);

  // bölge karışımı: mevcut salıncaktan sonrakine olan yol boyunca
  const s0=d.sal[d.i], s1=d.sal[d.i+1]||s0;
  const t=kis((p.x-s0.x)/Math.max(1,s1.x-s0.x),0,1);
  const b1=bolgeNo(d.i), b2=bolgeNo(Math.min(d.i+1,d.sal.length-1));

  X.save();
  if(d.sars>0 && !sakin) X.translate((Math.random()-.5)*11*d.sars,(Math.random()-.5)*11*d.sars);

  // Arkadan öne: gök → uzak → orta → zemin → oyun → ön plan.
  // Her katman öncekini örtüyor; derinlik bu sıralamadan geliyor.
  const bz = t>.5 ? b2 : b1;
  gok(d, b1===b2?0:t, b1, b2);
  uzak(d,bz);
  orta(d,bz);
  zemin(d,bz);

  // görünürdeki salıncaklar
  for(let j=Math.max(0,d.i-2); j<d.sal.length; j++){
    const s=d.sal[j];
    if(s.x < kamX-W/(PM*2)-4) continue;
    if(s.x > kamX+W/(PM*2)+4) break;
    iskelet(s, j===d.i);
    zincirCiz(s, j===d.i && d.faz==='salinim');
  }

  isiklar(d,bz);     // 'lighter' — altındaki her şeyi aydınlatıyor
  paraCiz(d);        // ışıktan sonra: havuz altında kalırsa yıkanıp kayboluyor

  // hedef halkası: bir sonraki oturağın tutunma yarıçapı
  if(d.faz==='ucus'||d.faz==='salinim'){
    const h=d.sal[d.i+1];
    if(h){
      const q=ekr(oturX(h),oturY(h)), R=tutunmaR(d)*PM;
      const yakin = d.faz==='ucus'
        ? kis(1-Math.hypot(d.px-oturX(h),d.py-oturY(h))/(R/PM*2.6),0,1)
        : .25;
      X.strokeStyle='rgba(121,217,172,'+(.18+.6*yakin)+')';
      X.lineWidth=d.uzanma>0?3:1.6; X.setLineDash([5,6]);
      X.beginPath(); X.arc(q.sx,q.sy,R,0,6.3); X.stroke(); X.setLineDash([]);
    }
  }

  if(d.faz==='salinim'){
    const s=d.sal[d.i];

    // dip bölgesi: "burada bas" göstergesi, yaklaştıkça parlar
    const yakin=1-Math.min(1,Math.abs(s.th)/Math.max(.2,s.gen));
    const R=(s.Lu+s.Lk)/2, ac=Math.min(.42,Math.max(.16,s.gen*.36));
    X.beginPath();
    for(let i=0;i<=20;i++){
      const a=-ac+2*ac*i/20, q=ekr(s.x+R*Math.sin(a), s.py-R*Math.cos(a));
      i?X.lineTo(q.sx,q.sy):X.moveTo(q.sx,q.sy);
    }
    X.strokeStyle=s.poz==='cokuk'
      ? 'rgba(121,217,172,'+(.18+.5*yakin*yakin)+')'
      : 'rgba(233,229,242,.09)';
    X.lineWidth=5; X.stroke();

    // şimdi atlarsan nereye
    const yol=yorunge(d,42);
    X.setLineDash([2,7]); X.strokeStyle='rgba(233,229,242,.35)'; X.lineWidth=1.5;
    X.beginPath(); yol.forEach((q,i)=>{const e=ekr(q.x,q.y); i?X.lineTo(e.sx,e.sy):X.moveTo(e.sx,e.sy);});
    X.stroke(); X.setLineDash([]);

    const o=ekr(oturX(s),oturY(s));
    karakter(o.sx,o.sy,-s.th,s.poz==='ayakta',d.k,kenarIsik(d,oturX(s),oturY(s)));
    uzuv(d,dt,o.sx,o.sy,-s.th,yer(d),ruzg(d));   // karakterden SONRA, yoksa gövdenin altında kalıyor
  } else {
    const q=ekr(p.x,p.y);
    if(d.uzanma>0){
      X.strokeStyle='rgba(121,217,172,.5)'; X.lineWidth=2;
      X.beginPath(); X.arc(q.sx,q.sy,tutunmaR(d)*PM,0,6.3); X.stroke();
    }
    karakter(q.sx,q.sy,d.don,true,d.k,kenarIsik(d,p.x,p.y));
    uzuv(d,dt,q.sx,q.sy,d.don,yer(d),ruzg(d));
  }

  // uçuşan geri bildirim yazısı
  const yas=d.t-d.mesajT;
  if(yas<1.1){
    const o=ekr(p.x,p.y);
    X.globalAlpha=1-yas/1.1; X.fillStyle=d.mesajRenk;
    X.font='600 14px system-ui'; X.textAlign='center';
    X.fillText(d.mesaj,o.sx,o.sy-48-yas*16);
    X.textAlign='left'; X.globalAlpha=1;
  }
  { const o=ekr(p.x,p.y); paraPop(d,o.sx,o.sy); }

  on(d,bz);          // ön plan karakterin de üstünde
  parcaciklarCiz(d);  // kar/yaprak/taç yaprağı — her şeyin en önünde süzülüyor
  X.restore();

  // Ekran uzayında son iki rötuş: X.restore()'dan SONRA, kamera
  // sarsıntısıyla kaymasınlar diye.
  vinyet();
  gren(d);
}
