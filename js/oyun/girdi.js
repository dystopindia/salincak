import { durum } from './durum.js';
import { bildir, pompaUygula, atlaUygula } from './fizik.js';
import { basla, baslaTus, gunlukBasla, rastgeleTohum, ogreticiBasla, ogreticiBitir, menuyeDon, devamEt, duraklatVer, surdur } from './akis.js';
import { pompaSesi } from '../cekirdek/ses.js';
import { kaydet } from './hayalet.js';
import { K } from '../cekirdek/tuval.js';
import * as E from '../cekirdek/dom.js';

// Tek eylem: BAS. Basılı tutma yok, çömelme otomatik.
// Yanlış zamanda basmak cezalandırılmaz, sadece işe yaramaz.
//
// Kuralın kendisi fizik.pompaUygula'da; burada yalnız OLAY işleniyor:
// geri bildirim yazısı, ses ve hayalet kaydı. Hayalet aynı geçişi
// sessizce, bu katmandan hiç geçmeden uyguluyor.
export function pompala(){
  if(durum.hal!=='oyun' || !durum.D) return;
  const d=durum.D, q=pompaUygula(d);
  if(q<0) return;                      // etkisiz basış: kaydedilmiyor
  d.ogret++;
  kaydet(d,0);
  if(q>.72)     bildir(d,'tam zamanında','#79D9AC');
  else if(q>.4) bildir(d,'idare eder','#F2B33D');
  else          bildir(d,'dipte basmalısın','#D3506F');
  pompaSesi(q);
}

// Sallanırken atlar, havadayken uzanır.
export function atlaTus(){
  if(durum.hal!=='oyun' || !durum.D) return;
  if(atlaUygula(durum.D)) kaydet(durum.D,1);
}

export function baglaGirdi(){
  addEventListener('keydown', e=>{
    if(e.repeat) return;
    if(e.code==='Space'||e.code==='ArrowUp'){ e.preventDefault(); pompala(); }
    if(e.code==='KeyJ'||e.code==='ArrowRight') atlaTus();
    if(durum.hal==='son'){
      if(e.code==='KeyR') basla(durum.sonTohum, durum.secKar, durum.gunlukMu);
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
  // "Tekrar dene" aynı tohumu yeniden kuruyor — hayalet tam da burada
  // anlam kazanıyor. Günün turundaysan orada kalıyorsun.
  E.bTekrar.onclick = ()=> basla(durum.sonTohum, durum.secKar, durum.gunlukMu);
  E.bMenu.onclick   = menuyeDon;
  E.bDevam.onclick  = devamEt;
  E.bDuraklat.onclick     = e=>{ e.stopPropagation(); duraklatVer(); };
  E.bSurdur.onclick       = surdur;
  E.bDuraklatMenu.onclick = menuyeDon;
  E.bOgretici.onclick     = ogreticiBasla;
  E.bGunluk.onclick       = gunlukBasla;
  E.bOgretGec.onclick     = e=>{ e.stopPropagation(); ogreticiBitir(true); };
  E.bOgretBasla.onclick   = ()=> basla(rastgeleTohum(), durum.secKar, false);
  E.bOgretMenu.onclick    = menuyeDon;
}
