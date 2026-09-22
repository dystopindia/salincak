// Web Audio ile sentezlenmiş sesler — hiç dosya yok, tamamı osilatör.
// kayit.js gibi burada duruyor: alt yapı ama oyuna özgü isimler taşıyor
// (pompaSesi, tutunSesi...). oyun/ modülleri bunu doğrudan çağırabiliyor
// (ciz/ ve ui/ hiç çağırmıyor — disiplin bu, ses de bir "yan etki").
//
// AudioContext yalnızca kullanıcı jestiyle (dokunma/tuş) açılıyor; ilk
// çağrı zaten girdi.js'in pointerdown/keydown dinleyicisi içinden geliyor,
// yani tarayıcının otomatik oynatma kısıtlamasına takılmıyor.

let ctx = null;
let sessiz = false;

function baglam(){
  if(sessiz) return null;
  if(!ctx){
    try{ ctx = new (window.AudioContext||window.webkitAudioContext)(); }
    catch(e){ sessiz=true; return null; }
  }
  if(ctx.state==='suspended') ctx.resume().catch(()=>{});
  return ctx;
}

export function acikMi(){ return !sessiz; }
export function sesiKapat(kapali){ sessiz = kapali; if(kapali && ctx) gicirtiGuncelle(0); }

// Tek bir ton: hızlı atak, üstel sönüm. gecikme ile art arda notalar
// setTimeout değil AudioContext'in kendi zamanlamasıyla planlanıyor —
// sekmeli/perde arkası tarayıcıda jitter yapmıyor.
function ton(c, freq, sure, tip, kazanc, gecikme=0, kaymaFreq=null){
  const t0=c.currentTime+gecikme;
  const osc=c.createOscillator(), g=c.createGain();
  osc.type=tip;
  osc.frequency.setValueAtTime(freq,t0);
  if(kaymaFreq) osc.frequency.exponentialRampToValueAtTime(kaymaFreq,t0+sure);
  g.gain.setValueAtTime(0,t0);
  g.gain.linearRampToValueAtTime(kazanc,t0+.008);
  g.gain.exponentialRampToValueAtTime(.0001,t0+sure);
  osc.connect(g); g.connect(c.destination);
  osc.start(t0); osc.stop(t0+sure+.03);
}

// Dipte doğru zamanlı basış — perde geri bildirimin kalitesiyle (q) yükseliyor.
export function pompaSesi(q){
  const c=baglam(); if(!c) return;
  ton(c, 85+q*55, .14, 'triangle', .12+q*.07);
}

// Tutunma: iki nota. Bonuslu yakalayışta (uzanarak / birden fazla salıncak)
// ikinci nota daha yüksek — kulakla da "büyük yakalayış" fark edilsin.
export function tutunSesi(bonuslu){
  const c=baglam(); if(!c) return;
  ton(c, 640, .08, 'sine', .13, 0);
  ton(c, bonuslu?1020:840, .13, 'sine', .12, .045);
}

// Para: kısa iki notalı "cin" — arpej yukarı.
export function paraSesi(){
  const c=baglam(); if(!c) return;
  ton(c, 1046, .06, 'square', .045, 0);
  ton(c, 1568, .09, 'square', .04, .035);
}

// Ölüm: alçalan kayma, uzun sönüm.
export function olumSesi(){
  const c=baglam(); if(!c) return;
  ton(c, 200, .55, 'sawtooth', .11, 0, 50);
}

// Joker: satın alma / aktivasyon / devam etme — hepsi aynı "olumlu" ton.
export function jokerSesi(){
  const c=baglam(); if(!c) return;
  ton(c, 500, .09, 'sine', .09, 0);
  ton(c, 750, .13, 'sine', .09, .06);
}

// Menü tıklaması: çok kısa, çok kısık — dikkat çekmesin.
export function tikSesi(){
  const c=baglam(); if(!c) return;
  ton(c, 320, .04, 'square', .035);
}

// --- zincir gıcırtısı ---------------------------------------------
// Yorgunluk arttıkça sürekli çalan tek bir osilatör. Tek seferlik ton
// değil: kazancı ve perdesi her karede kısılıp/yükseltiliyor, düğüm bir
// kez kuruluyor. k: HUD çubuğuyla aynı 0..1 yorgunluk değeri.
let gOsc=null, gGain=null, gSuzgec=null;

function gicirtiKur(c){
  gOsc=c.createOscillator(); gOsc.type='sawtooth'; gOsc.frequency.value=65;
  gSuzgec=c.createBiquadFilter(); gSuzgec.type='bandpass';
  gSuzgec.frequency.value=420; gSuzgec.Q.value=7;
  gGain=c.createGain(); gGain.gain.value=0;
  gOsc.connect(gSuzgec); gSuzgec.connect(gGain); gGain.connect(c.destination);
  gOsc.start();
}

export function gicirtiGuncelle(k){
  const c=baglam(); if(!c){ return; }
  if(!gOsc) gicirtiKur(c);
  const hedef = k>.6 ? (k-.6)/.4*.045 : 0;
  gGain.gain.linearRampToValueAtTime(hedef, c.currentTime+.09);
  gOsc.frequency.linearRampToValueAtTime(55+k*150, c.currentTime+.09);
}

// --- arka plan müziği ----------------------------------------------
// Bölge başına kısa bir cümle (16 adım, yarım ton ofsetleri, null=sus) +
// altta iki osilatörlü bir pad. Notalar AudioContext saatiyle 0.65 s
// ileriye planlanıyor (ton()'daki ilkeyle aynı: setTimeout değil).
// Cümle her karede değil, yalnız planlama penceresi boşaldıkça ilerliyor —
// muzikAdim() 60 Hz çağrılsa da nota üretimi tempoya bağlı.
//
// Bölge değişince cümle bir sonraki ÖLÇÜ başında (4 adım) değişiyor, pad
// kökü 2.5 s'de kayıyor — geçiş kartla aynı anda ama kulakta bir kesinti
// değil, bir modülasyon.
const MUZIK = [
  { kok:261.63, adim:.50, tini:'triangle', suzgec:1500,          // park: majör, oyunbaz
    cumle:[0,4,7,4, 2,7,11,7, 0,4,9,7, 2,5,7,4] },
  { kok:220.00, adim:.56, tini:'triangle', suzgec:1100,          // orman: minör, ağır
    cumle:[0,3,7,null, 5,3,0,null, 7,10,7,3, 5,3,0,null] },
  { kok:329.63, adim:.42, tini:'sine',     suzgec:1900,          // bulutlar: lidyen, havadar
    cumle:[0,2,6,7, 11,7,6,2, 0,2,6,9, 7,6,2,null] },
  { kok:146.83, adim:.72, tini:'sine',     suzgec:900,           // yörünge: seyrek, derin
    cumle:[0,null,7,null, 10,null,7,null, 3,null,5,null, 0,null,null,null] },
  { kok:174.61, adim:.64, tini:'sine',     suzgec:1300,          // buz kuşağı: soğuk, çınlayan
    cumle:[0,7,null,12, 10,null,7,null, 5,12,null,10, 7,null,3,null] },
];
const MUZIK_BUS = .55;

let mBus=null, mPad=null, mSonraki=0, mAdim=0, mBolge=-1, mAcik=true;

export function muzikAcikMi(){ return mAcik; }
export function muzikAc(ac){ mAcik=ac; }

// Menüdeki "Başla" tıklaması da bir kullanıcı jesti: bağlamı burada açmak
// müziğin ilk pompayı beklemeden, tur başlar başlamaz girmesini sağlıyor.
export function muzikHazirla(){ baglam(); }

function muzikKur(c){
  mBus=c.createGain(); mBus.gain.value=0; mBus.connect(c.destination);
  const suzgec=c.createBiquadFilter(), g=c.createGain(), lfo=c.createOscillator(), lfoG=c.createGain();
  suzgec.type='lowpass'; suzgec.frequency.value=620; suzgec.Q.value=.6;
  g.gain.value=.022; lfo.frequency.value=.07; lfoG.gain.value=.007;
  lfo.connect(lfoG); lfoG.connect(g.gain); g.connect(suzgec); suzgec.connect(mBus);
  const kok=c.createOscillator(), bes=c.createOscillator();
  kok.type='triangle'; bes.type='sine';
  kok.frequency.value=MUZIK[0].kok/2; bes.frequency.value=MUZIK[0].kok*1.5/2;
  kok.connect(g); bes.connect(g); kok.start(); bes.start(); lfo.start();
  mPad={kok,bes};
}

function padHedef(c,kokHz){
  const t=c.currentTime;
  for(const [o,f] of [[mPad.kok,kokHz/2],[mPad.bes,kokHz*1.5/2]]){
    o.frequency.cancelScheduledValues(t);
    o.frequency.setValueAtTime(o.frequency.value,t);
    o.frequency.exponentialRampToValueAtTime(f,t+2.5);
  }
}

function nota(c,freq,t,sure,tini,suzgecHz,kazanc){
  const osc=c.createOscillator(), g=c.createGain(), s=c.createBiquadFilter();
  osc.type=tini; osc.frequency.setValueAtTime(freq,t);
  s.type='lowpass'; s.frequency.value=suzgecHz;
  g.gain.setValueAtTime(.0001,t);
  g.gain.exponentialRampToValueAtTime(kazanc,t+.03);
  g.gain.exponentialRampToValueAtTime(.0001,t+sure);
  osc.connect(s); s.connect(g); g.connect(mBus);
  osc.start(t); osc.stop(t+sure+.05);
}

// bolge: 0-3 çalar, -1 susturur (menü/bitiş — yumuşak sönümle).
// Her karede çağrılıyor; bağlam daha açılmadıysa hiçbir şey yapmıyor.
export function muzikAdim(bolge){
  const c=ctx; if(!c) return;
  if(!mBus) muzikKur(c);
  const calsin = bolge>=0 && !sessiz && mAcik;
  mBus.gain.setTargetAtTime(calsin?MUZIK_BUS:0, c.currentTime, .35);
  if(!calsin || c.state!=='running') return;
  if(mBolge<0 || (bolge!==mBolge && mAdim%4===0)){ mBolge=bolge; padHedef(c,MUZIK[bolge].kok); }
  const M=MUZIK[mBolge];
  if(mSonraki < c.currentTime-.8) mSonraki=c.currentTime+.08;   // sekme dönüşü: geriden yetişmeye çalışma
  while(mSonraki < c.currentTime+.65){
    const n=M.cumle[mAdim%M.cumle.length];
    if(n!==null){
      const f=M.kok*Math.pow(2,n/12), vurgu=mAdim%4===0;
      nota(c, f, mSonraki, M.adim*1.7, M.tini, M.suzgec, vurgu?.05:.034);
      if(mAdim%8===6) nota(c, f*2, mSonraki+.05, M.adim*1.2, 'sine', M.suzgec*1.5, .014);  // seyrek çan
    }
    mSonraki+=M.adim; mAdim++;
  }
}

// Sekme arka plana gidince bağlam askıya alınıyor: pad ve gıcırtı
// osilatörleri de susuyor, planlanan notalar birikmiyor. Dönüşte
// baglam() zaten resume ediyor; mSonraki geride kaldıysa yukarıda
// sıfırlanıyor.
document.addEventListener('visibilitychange', ()=>{
  if(!ctx) return;
  if(document.hidden) ctx.suspend().catch(()=>{});
  else if(!sessiz) ctx.resume().catch(()=>{});
});
