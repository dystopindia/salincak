import { X } from '../cekirdek/tuval.js';
import { ekr, PM } from '../cekirdek/kamera.js';
import { renkA } from '../cekirdek/matematik.js';
import { yakinParalar } from '../oyun/para.js';

const RENK = '#F2B33D';

// Dönen bir madeni para: yatayda cos ile eziliyor. Gerçek 3B'ye gerek yok,
// bu ölçekte dönme hissini veren tek şey genişliğin nefes alması.
export function paraCiz(d){
  const r = .3*PM;
  for(const q of yakinParalar(d)){
    if(q.alindi) continue;
    const p = ekr(q.x, q.y + Math.sin(d.t*2 + q.x)*.05);
    const w = Math.abs(Math.cos(d.t*2.4 + q.x*.7));
    const en = r*(.28 + .72*w);

    X.globalCompositeOperation='lighter';
    const g = X.createRadialGradient(p.sx,p.sy,0,p.sx,p.sy,r*2.6);
    g.addColorStop(0, renkA(RENK,.34)); g.addColorStop(1, renkA(RENK,0));
    X.fillStyle=g; X.beginPath(); X.arc(p.sx,p.sy,r*2.6,0,6.3); X.fill();
    X.globalCompositeOperation='source-over';

    X.fillStyle=RENK;
    X.beginPath(); X.ellipse(p.sx,p.sy,en,r,0,0,6.3); X.fill();
    if(w>.45){                                  // yandan bakınca iç halka kaybolsun
      X.strokeStyle='rgba(35,25,3,.5)'; X.lineWidth=1.4;
      X.beginPath(); X.ellipse(p.sx,p.sy,en*.5,r*.5,0,0,6.3); X.stroke();
    }
  }
}

// Toplama anında oyuncunun üstünde kısa bir bildirim.
export function paraPop(d, sx, sy){
  const yas = d.t - d.paraT;
  if(yas < 0 || yas > .6) return;
  X.globalAlpha = 1 - yas/.6;
  X.fillStyle = RENK; X.font='600 13px system-ui'; X.textAlign='center';
  X.fillText('+1 \u25C6', sx, sy - 56 - yas*22);
  X.textAlign='left'; X.globalAlpha=1;
}
