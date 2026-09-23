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

// İrtifa ödemesi (fizik.irtifaParasi): tutunma anında OYUNCUNUN ALTINDA.
// Üstü dolu: mesaj yazısı sy-48, +1 ◆ sy-56, seri alevi sy-52'den yukarı.
// Aşağı doğru süzülüyor — yukarı çıkan yazılardan ayrışsın, "düşen para".
export function irtifaPop(d, sx, sy){
  const yas = d.t - d.irtifaT;
  if(!(d.irtifa>0) || yas < 0 || yas > 1.3) return;
  const buyu = yas < .18 ? 1 + (1-yas/.18)*.45 : 1;
  X.globalAlpha = yas < 1 ? 1 : 1-(yas-1)/.3;
  X.textAlign='center';
  X.font = '800 '+Math.round(17*buyu)+'px system-ui';
  X.lineWidth = 3.4; X.strokeStyle = 'rgba(12,8,24,.85)';
  const y = sy + 34 + yas*14;
  X.strokeText('+'+d.irtifa+' ◆', sx, y); X.fillStyle = RENK; X.fillText('+'+d.irtifa+' ◆', sx, y);
  X.font = '600 11px system-ui';
  X.strokeText('irtifa', sx, y+15); X.fillStyle = '#F5D78A'; X.fillText('irtifa', sx, y+15);
  X.textAlign='left'; X.globalAlpha=1;
}
