import * as E from '../cekirdek/dom.js';
import { kis } from '../cekirdek/matematik.js';
import { BOL, bolgeNo } from '../oyun/tanimlar.js';
import { ruzg } from '../oyun/fizik.js';
import { JOKER, aktif, jokerKullan } from '../oyun/joker.js';
import { kayit, sahip } from '../cekirdek/kayit.js';
import { gicirtiGuncelle } from '../cekirdek/ses.js';
import { durum } from '../oyun/durum.js';
import { ADIMLAR, ogreticiAdim } from '../oyun/ogretici.js';

const SURELI = JOKER.filter(j => j.sure);
let dugme = null;

// Tur içi joker çubuğu bir kez kuruluyor; her karede yalnız durumu tazeleniyor.
function jokerKur(){
  dugme = {};
  SURELI.forEach(j=>{
    const b=document.createElement('button');
    b.type='button';
    b.innerHTML='<span class="s">'+j.simge+'</span><span class="n"></span>';
    b.title=j.ad+' — '+j.not;
    b.addEventListener('pointerdown', e=>{
      e.preventDefault(); e.stopPropagation();
      jokerKullan(durum.D, j.id);
    });
    E.hJok.appendChild(b);
    dugme[j.id]=b;
  });
}

export function hudG(d){
  const s=d.sal[d.i];
  E.hSkor.textContent=d.skor;
  E.hSal.textContent=d.i+1;
  E.hPara.textContent=d.para;
  E.hMes.innerHTML=d.mesafe.toFixed(0)+'<small> m</small>';

  const r=ruzg(d);
  E.hRuz.textContent=(r>=0?'→ ':'← ')+Math.abs(r).toFixed(1);
  E.hRek.textContent=kayit.rekor||'—';

  const k=kis(s.yorgun,0,1);
  E.hBar.style.width=(k*100)+'%';
  E.hBar.style.background = aktif(d,'zincir') ? '#79D9AC'
                          : k>.75?'#D3506F' : k>.45?'#F2B33D' : '#79D9AC';
  E.hGic.style.opacity = k>.6 ? (.5+.5*Math.sin(d.t*9)) : 0;
  gicirtiGuncelle(aktif(d,'zincir') ? 0 : k);   // joker açıkken görsel çubuk yeşil kalıyor, ses de sussun

  E.hIp.style.opacity = d.ogret>7 ? 0 : 1;
  E.hIp.textContent = d.faz==='salinim' ? 'yeşil bölgeden geçerken bas' : 'J ile uzan';

  // Öğretici altyazısı: adım durumdan türüyor (bkz. oyun/ogretici.js),
  // burada yalnız yazılıyor. Metin değişince kısa bir belirme animasyonu.
  if(d.ogretici){
    const a=ogreticiAdim(d), m=ADIMLAR[a].metin;
    if(E.hOgretMetin.textContent!==m){
      E.hOgretMetin.textContent=m; E.hOgretNo.textContent=(a+1)+'/'+ADIMLAR.length;
      E.hOgret.classList.remove('belir'); void E.hOgret.offsetWidth; E.hOgret.classList.add('belir');
    }
  }

  if(!dugme) jokerKur();
  SURELI.forEach(j=>{
    const b=dugme[j.id], a=sahip(j.id), acik=aktif(d,j.id);
    b.hidden = (a<1 && !acik) || !!d.ogretici;     // elinde yoksa yer kaplamasın; öğreticide hiç yok
    b.classList.toggle('acik', acik);
    b.querySelector('.n').textContent = acik ? Math.ceil(d.jok[j.id])+'s' : a;
  });

  // bölge kartı: bölüm başlığı gibi — rakam, ad, tek satır söz. 3 s kalıyor.
  const b=bolgeNo(d.i);
  if(b!==d.sonBolge){
    d.sonBolge=b; d.bolgeT=d.t;
    const B=BOL[b];
    E.hBolge.innerHTML='<small>'+B.no+'</small><b>'+B.ad+'</b><i>'+B.not+'</i>';
  }
  const y=d.t-d.bolgeT;
  E.hBolge.style.opacity = y<3 ? (y<.5 ? y/.5 : kis((3-y)/.9,0,1)) : 0;
}
