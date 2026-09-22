import { durum } from './durum.js';
import { hizv, oturX, oturY, bildir } from './fizik.js';
import { basla, baslaTus, rastgeleTohum, ogreticiBasla, ogreticiBitir, menuyeDon, devamEt, duraklatVer, surdur } from './akis.js';
import { pompaSesi } from '../cekirdek/ses.js';
import { K } from '../cekirdek/tuval.js';
import * as E from '../cekirdek/dom.js';

// Tek eylem: BAS. Basılı tutma yok, çömelme otomatik.
// Yanlış zamanda basmak cezalandırılmaz, sadece işe yaramaz.
export function pompala(){
  if(durum.hal!=='oyun' || !durum.D || durum.D.faz!=='salinim') return;
  const d=durum.D, s=d.sal[d.i];
  if(s.poz==='ayakta') return;
  s.poz='ayakta'; s.pompaT=d.t; d.ogret++;
  const q=1-Math.min(1, Math.abs(s.th)/Math.max(.2,s.gen));
  if(q>.72)     bildir(d,'tam zamanında','#79D9AC');
  else if(q>.4) bildir(d,'idare eder','#F2B33D');
  else          bildir(d,'dipte basmalısın','#D3506F');
  pompaSesi(q);
}

// Sallanırken atlar, havadayken uzanır.
export function atlaTus(){
  if(durum.hal!=='oyun' || !durum.D) return;
  const d=durum.D;
  if(d.faz==='salinim'){
    const s=d.sal[d.i], v=hizv(s);
    d.faz='ucus'; d.px=oturX(s); d.py=oturY(s); d.vx=v.x; d.vy=v.y; d.don=0; d.uzanma=0;
    s.poz='cokuk';
  } else if(d.faz==='ucus'){
    d.uzanma=.38;
  }
}

export function baglaGirdi(){
  addEventListener('keydown', e=>{
    if(e.repeat) return;
    if(e.code==='Space'||e.code==='ArrowUp'){ e.preventDefault(); pompala(); }
    if(e.code==='KeyJ'||e.code==='ArrowRight') atlaTus();
    if(durum.hal==='son'){
      if(e.code==='KeyR') basla(durum.sonTohum, durum.secKar);
      if(e.code==='KeyC') devamEt();
    }
    // Escape/P: oyunda duraklat, duraklattaysa sürdür. Menü/bitiş
    // ekranında bir işe yaramaz — orada zaten "oyun" akmıyor.
    if(e.code==='Escape'||e.code==='KeyP'){
      if(durum.hal==='oyun') duraklatVer();
      else if(durum.hal==='duraklat') surdur();
    }
  });

  // Mobilde tek parmakla oynanabilsin diye ekrana dokunmak bağlama göre
  // davranıyor: sallanırken pompalar, uçarken uzanır. Atlamak hâlâ ayrı ve
  // bilinçli bir eylem (düğme / J) — tasarımın özü o.
  K.addEventListener('pointerdown', e=>{
    e.preventDefault();
    if(durum.D && durum.hal==='oyun' && durum.D.faz==='ucus') atlaTus();
    else pompala();
  });
  E.bAtla.addEventListener('pointerdown', e=>{ e.preventDefault(); e.stopPropagation(); atlaTus(); });

  E.bBasla.onclick  = baslaTus;
  E.bTekrar.onclick = ()=> basla(durum.sonTohum, durum.secKar);
  E.bMenu.onclick   = menuyeDon;
  E.bDevam.onclick  = devamEt;
  E.bDuraklat.onclick     = e=>{ e.stopPropagation(); duraklatVer(); };
  E.bSurdur.onclick       = surdur;
  E.bDuraklatMenu.onclick = menuyeDon;
  E.bOgretici.onclick     = ogreticiBasla;
  E.bOgretGec.onclick     = e=>{ e.stopPropagation(); ogreticiBitir(true); };
  E.bOgretBasla.onclick   = ()=> basla(rastgeleTohum(), durum.secKar);
  E.bOgretMenu.onclick    = menuyeDon;
}
