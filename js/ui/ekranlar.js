import * as E from '../cekirdek/dom.js';
import { KAR, BOL, bolgeNo } from '../oyun/tanimlar.js';
import { durum } from '../oyun/durum.js';
import { JOKER, satinAl } from '../oyun/joker.js';
import { kayit, sahip, sakla } from '../cekirdek/kayit.js';
import { gunTazele } from '../oyun/gunluk.js';
import { efektKapat } from '../ciz/sonisleme.js';
import { RESIM } from '../ciz/resimler.js';
import { HEDEF, IZLER, hedefTamam, hedefSayisi, izAcik, seciliIz, izSec } from '../oyun/hedef.js';
import { tikSesi, acikMi, sesiKapat, muzikAc, muzikAcikMi } from '../cekirdek/ses.js';

export function goster(...ler){ ler.forEach(x=>x.classList.remove('gizli')); }
export function gizle (...ler){ ler.forEach(x=>x.classList.add('gizli')); }

// Karakter seçme kartları — KAR listesinden üretiliyor, HTML'de sabit yok.
// Portre oyundaki atlasın kendisi (ciz/resimler.js), 'otur' pozu CSS arka
// planıyla kırpılıyor: ikinci bir resim dosyası yok, tek dosyalık pakette de
// aynı data URI'yi kullanıyor. Kırpma yüzdeyle — kutunun boyu CSS'te,
// kısa ekran kuralı yalnız yüksekliği değiştiriyor. Resmi olmayan karakter
// portresiz kalıyor (kart yine çalışıyor).
function portre(id){
  const r=RESIM[id]; if(!r) return '';
  const P=Object.values(r.pozlar), p=r.pozlar.otur;
  const W=Math.max(...P.map(q=>q.x+q.w)), H=Math.max(...P.map(q=>q.y+q.h));
  const yuzde=(a,b)=> b>0 ? (a/b*100).toFixed(3)+'%' : '0%';
  return '<i class="por" style="background-image:url(&quot;'+r.dosya+'&quot;);'+
    'background-size:'+(W/p.w*100).toFixed(3)+'% '+(H/p.h*100).toFixed(3)+'%;'+
    'background-position:'+yuzde(p.x,W-p.w)+' '+yuzde(p.y,H-p.h)+';'+
    'aspect-ratio:'+p.w+'/'+p.h+';opacity:'+r.alfa+'"></i>';
}

export function kimlikKur(){
  KAR.forEach((k,i)=>{
    const b=document.createElement('button');
    b.innerHTML=portre(k.id)+'<b>'+k.ad+'</b><span>'+k.not+'</span>';
    if(RESIM[k.id]) b.className='resimli';
    b.onclick=()=>{ durum.secKar=i; tikSesi();
      [...E.kimlik.children].forEach((c,j)=>c.classList.toggle('sec', j===i)); };
    E.kimlik.appendChild(b);
  });
  E.kimlik.children[0].classList.add('sec');
}

// --- dükkân ve paneller ----------------------------------------------
// Menüde iki panel var (jokerler, ayarlar) ve ikisi de aynı sekme
// satırından açılıyor. Ayrı ekran yok: kesintisiz akış CLAUDE.md'nin
// tercihi. Biri açılınca öteki kapanıyor — aynı anda iki kutu açık
// kalırsa menü yine uzuyor, sadeleştirmenin amacı kaçıyor.
const PANEL = [];

export function dukkanKur(){
  E.dukkan.innerHTML='';
  JOKER.forEach(j=>{
    const k=document.createElement('div');
    k.className='jk';
    k.innerHTML='<span class="sim">'+j.simge+'</span>'+
      '<span><b>'+j.ad+'</b><small>'+j.not+'</small>'+
      '<span class="adet" data-adet="'+j.id+'"></span></span>'+
      '<button data-al="'+j.id+'">'+j.fiyat+' ◆</button>';
    k.querySelector('button').onclick=()=>{ if(satinAl(j.id)) cuzdanTazele(); };
    E.dukkan.appendChild(k);
  });
  PANEL.push({dgm:E.bDukkan, kutu:E.dukkan}, {dgm:E.bHedefler, kutu:E.hedeflerPanel},
             {dgm:E.bAyarlar, kutu:E.ayarlarPanel});
  PANEL.forEach(p=> p.dgm.onclick=()=> panelAc(p));
  cuzdanTazele();
}

function panelAc(hedef){
  tikSesi();
  const ac = hedef.kutu.classList.contains('gizli');
  PANEL.forEach(p=>{ p.kutu.classList.add('gizli'); p.dgm.setAttribute('aria-pressed','false'); });
  if(ac){ hedef.kutu.classList.remove('gizli'); hedef.dgm.setAttribute('aria-pressed','true'); }
}

export function cuzdanTazele(){
  E.mPara.textContent = kayit.para;
  E.mRekor.textContent = kayit.rekor || '—';
  // Gün değişmişse burada yakalanıyor: menü her açıldığında çağrılıyor,
  // aynı günse gunTazele hemen dönüyor.
  gunTazele();
  const G = kayit.gunluk;
  E.mGunluk.textContent = (G.enIyi ? 'bugünkü en iyin '+G.enIyi : 'bugün henüz oynamadın')
    + (G.seri>1 ? ' · '+G.seri+' gün üst üste' : '');
  hedefTazele();
  JOKER.forEach(j=>{
    const a = sahip(j.id);
    const et = E.dukkan.querySelector('[data-adet="'+j.id+'"]');
    if(et) et.textContent = a ? 'elinde '+a : '';
    const b = E.dukkan.querySelector('[data-al="'+j.id+'"]');
    if(b) b.disabled = kayit.para < j.fiyat;
  });
}

// Hedefler paneli: liste yeniden çiziliyor (14 satır, menü açılışında
// bir kez — ucuz). Sekme etiketi ilerlemeyi gösteriyor: "Hedefler 3/14".
function hedefTazele(){
  E.bHedefler.textContent = 'Hedefler '+hedefSayisi()+'/'+HEDEF.length;
  E.hedefListe.innerHTML = HEDEF.map(h=>{
    const iz = IZLER.find(z=>z.hedef===h.id);
    return '<div class="hd'+(hedefTamam(h.id)?' tamam':'')+'"><span class="isaret">'+
      (hedefTamam(h.id)?'✓':'○')+'</span><span>'+h.ad+
      (iz ? '<small>'+iz.ad.toLowerCase()+' izini açar</small>' : '')+
      '</span><b>'+h.odul+' ◆</b></div>';
  }).join('');
  const sec = seciliIz();
  E.izler.innerHTML='';
  IZLER.forEach(z=>{
    const b=document.createElement('button');
    const acik=izAcik(z);
    b.disabled=!acik; b.setAttribute('aria-pressed', z.id===sec?'true':'false');
    const kilit = acik ? '' : HEDEF.find(h=>h.id===z.hedef).ad;
    b.innerHTML = z.ad + (kilit ? '<small>kilitli</small>' : '');
    if(kilit) b.title = 'Açmak için: '+kilit;
    b.onclick=()=>{ if(izSec(z.id)){ tikSesi(); hedefTazele(); } };
    E.izler.appendChild(b);
  });
}

// Anahtarlar İKİ yerde: menünün ayarlar paneli + duraklat ekranı. İkisi de
// aynı [data-*] seçicileriyle burada tek seferde bağlanıyor, `yansit()`
// ikisini de aynı anda tazeliyor (biri diğerinden habersiz kalmasın).
export function ayarlarKur(){
  const yansit=()=>{
    document.querySelectorAll('[data-ses]').forEach(b=>
      b.setAttribute('aria-pressed', acikMi()?'true':'false'));
    document.querySelectorAll('[data-muzik]').forEach(b=>
      b.setAttribute('aria-pressed', muzikAcikMi()?'true':'false'));
    document.querySelectorAll('[data-surekli]').forEach(b=>
      b.setAttribute('aria-pressed', kayit.surekli?'true':'false'));
    document.querySelectorAll('[data-hayalet]').forEach(b=>
      b.setAttribute('aria-pressed', kayit.hayaletAcik?'true':'false'));
    document.querySelectorAll('[data-efekt]').forEach(b=>
      b.setAttribute('aria-pressed', kayit.efekt?'true':'false'));
  };
  document.querySelectorAll('[data-ses]').forEach(b=>{
    b.onclick=()=>{
      const ac = !acikMi();
      sesiKapat(!ac); kayit.ses=ac; sakla(); yansit();
      if(ac) tikSesi();              // yalnız açarken duyulabilir bir onay
    };
  });
  document.querySelectorAll('[data-muzik]').forEach(b=>{
    b.onclick=()=>{
      const ac = !muzikAcikMi();
      muzikAc(ac); kayit.muzik=ac; sakla(); yansit(); tikSesi();
    };
  });
  document.querySelectorAll('[data-surekli]').forEach(b=>{
    b.onclick=()=>{ kayit.surekli=!kayit.surekli; sakla(); yansit(); tikSesi(); };
  });
  document.querySelectorAll('[data-hayalet]').forEach(b=>{
    b.onclick=()=>{ kayit.hayaletAcik=!kayit.hayaletAcik; sakla(); yansit(); tikSesi(); };
  });
  // Işık efektleri: kapatınca 2D tuval hemen görünür (duraklat ekranında
  // bir sonraki kare hiç çizilmeyebilir); açınca ilk çizilen karede geri gelir.
  document.querySelectorAll('[data-efekt]').forEach(b=>{
    b.onclick=()=>{ kayit.efekt=!kayit.efekt; sakla(); if(!kayit.efekt) efektKapat(); yansit(); tikSesi(); };
  });
  yansit();
}

export function sonEkrani(d, canVar){
  const seb = d.sebep==='kopma'  ? 'zincir koptu'
            : d.sebep==='bosluk' ? 'tepede zincir boşaldı'
            : 'yere düştün';
  E.sBas.textContent = d.gunluk ? 'günün turu · skor' : 'skor';
  E.sSkor.textContent=durum.sonSkor;
  E.sDok.innerHTML =
    (d.gunluk ? '<div><span>bugünkü en iyin</span><b'+(d.gunlukRekor?' class="iyi"':'')+'>'+
                kayit.gunluk.enIyi+'</b></div>'+
                (kayit.gunluk.seri>1 ? '<div><span>üst üste gün</span><b>'+kayit.gunluk.seri+'</b></div>' : '')
              : '')+
    (d.yeniHayalet ? '<div><span>hayalet</span><b class="iyi">yeni kayıt</b></div>' : '')+
    '<div><span>salıncak</span><b>'+(d.i+1)+'</b></div>'+
    '<div><span>mesafe</span><b>'+d.mesafe.toFixed(0)+' m</b></div>'+
    // Para iki kaynaktan: yoldaki paralar + irtifa ödülü. İkisi de bankaya
    // yatıyor; ayrı gösteriliyor ki kumarın getirisi görünsün.
    '<div><span>topladığın para</span><b>'+(d.para-d.irtifaToplam)+' ◆</b></div>'+
    (d.irtifaToplam>0 ? '<div><span>irtifa ödülü</span><b class="iyi">+'+d.irtifaToplam+' ◆</b></div>' : '')+
    (d.yeniHedefler.length ? '<div><span>yeni hedef</span><b class="iyi">'+d.yeniHedefler.length+
      ' · +'+d.yeniHedefler.reduce((a,h)=>a+h.odul,0)+' ◆</b></div>' : '')+
    (d.enSeri>1 ? '<div><span>en uzun seri</span><b class="iyi">×'+d.enSeri+'</b></div>' : '')+
    '<div><span>ulaştığın bölge</span><b>'+BOL[bolgeNo(d.i)].ad+'</b></div>'+
    '<div><span>'+seb+'</span><b class="kotu">son</b></div>'+
    (d.jokerKullanildi
      ? '<div><span>joker kullanıldı</span><b class="kotu">skor saf değil</b></div>' : '')+
    '<div><span>karakter</span><b>'+d.k.ad.toLowerCase()+'</b></div>';
  E.bDevam.classList.toggle('gizli', !canVar);
  E.surekliGosterge.classList.toggle('gizli', !kayit.surekli);
  goster(E.son); gizle(E.hud);
}
