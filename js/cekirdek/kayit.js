// Tarayıcıda kalan tek şey. Para ekonomisi ancak turlar arası kalıcıysa
// anlamlı: tur içinde topladığın parayla tur içinde bir şey alamıyorsun.
//
// localStorage gizli sekmede ve bazı ayarlarda patlıyor; her erişim
// try/catch içinde ve okuma başarısız olursa oyun sıfırdan başlıyor.

const ANAHTAR = 'salincak.v1';

export const kayit = {
  para: 0,          // biriken toplam
  rekor: 0,
  ses: true,         // ayarlar panelindeki anahtar buradan kalıcı
  muzik: true,       // arka plan müziği (efektlerden ayrı kapatılabilir)
  surekli: false,    // ölünce otomatik yeniden başlasın mı (Geometry Dash tarzı)
  ogretici: false,   // öğretici bir kez tamamlandı ya da geçildi mi
  hayaletAcik: true, // rekor hayaleti gösterilsin mi (ayarlar anahtarı)
  efekt: true,       // WebGL ışık efektleri (ciz/sonisleme.js) — yavaş telefonda kapatılabilsin
  hedef: {},         // tamamlanan ustalık hedefleri: { hedefId: true } (oyun/hedef.js)
  iz: 'yok',         // seçili uçuş izi (ciz/iz.js); açık olup olmadığını hedef.js bilir
  joker: {},        // { jokerId: adet }
  omur: { tur:0, para:0 },
  // Serbest turun hayaleti: { tohum, kar, skor, mesafe, bitis, giris[] }.
  // Tohumla birlikte saklanıyor çünkü başka bir dünyanın kaydı anlamsız
  // (bkz. oyun/hayalet.js). Yalnız TEK slot var: son oynanan tohumun en
  // iyisi. Geçmiş tüm tohumları biriktirmek localStorage'ı şişirirdi ve
  // hiçbiri bir daha kurulmayacak dünyalar olurdu.
  hayalet: null,
  // Günün turu: tohum tarihten türüyor (oyun/gunluk.js). enIyi ve hayalet
  // gün değişince sıfırlanıyor, seri (üst üste oynanan gün) sürüyor.
  gunluk: { gun:'', enIyi:0, seri:0, sonGun:'', hayalet:null }
};

// Hayalet kaydının biçimi: sayı dizisi + tohum. Bozuk/eski bir kayıt
// oyunu patlatmamalı, sessizce atılmalı — localStorage elle de düzenlenir.
function hayaletOku(o){
  if(!o || typeof o!=='object') return null;
  if(typeof o.tohum!=='string' || !Array.isArray(o.giris)) return null;
  if(!o.giris.length || !o.giris.every(v => typeof v==='number' && v>=0)) return null;
  return { tohum:o.tohum, kar:Math.max(0,o.kar|0), skor:Math.max(0,o.skor|0),
           mesafe:+o.mesafe||0, bitis:Math.max(0,o.bitis|0), giris:o.giris,
           fs:o.fs|0 };     // fizik sürümü; eski kayıtta yok → 0, gösterilmez
}

export function yukle(){
  try{
    const ham = localStorage.getItem(ANAHTAR);
    if(!ham) return;
    const o = JSON.parse(ham);
    if(typeof o.para === 'number')  kayit.para  = Math.max(0, o.para|0);
    if(typeof o.rekor === 'number') kayit.rekor = Math.max(0, o.rekor|0);
    if(typeof o.ses === 'boolean')  kayit.ses   = o.ses;
    if(typeof o.muzik === 'boolean') kayit.muzik = o.muzik;
    if(typeof o.surekli === 'boolean') kayit.surekli = o.surekli;
    if(typeof o.ogretici === 'boolean') kayit.ogretici = o.ogretici;
    if(typeof o.hayaletAcik === 'boolean') kayit.hayaletAcik = o.hayaletAcik;
    if(typeof o.efekt === 'boolean') kayit.efekt = o.efekt;
    if(o.hedef && typeof o.hedef === 'object')
      for(const k in o.hedef) if(o.hedef[k]===true) kayit.hedef[k]=true;
    if(typeof o.iz === 'string') kayit.iz = o.iz;
    kayit.hayalet = hayaletOku(o.hayalet);
    if(o.gunluk && typeof o.gunluk === 'object'){
      kayit.gunluk.gun   = typeof o.gunluk.gun==='string' ? o.gunluk.gun : '';
      kayit.gunluk.sonGun= typeof o.gunluk.sonGun==='string' ? o.gunluk.sonGun : '';
      kayit.gunluk.enIyi = Math.max(0, o.gunluk.enIyi|0);
      kayit.gunluk.seri  = Math.max(0, o.gunluk.seri|0);
      kayit.gunluk.hayalet = hayaletOku(o.gunluk.hayalet);
    }
    if(o.joker && typeof o.joker === 'object'){
      for(const k in o.joker) if(typeof o.joker[k]==='number') kayit.joker[k]=Math.max(0,o.joker[k]|0);
    }
    if(o.omur && typeof o.omur === 'object'){
      kayit.omur.tur  = Math.max(0, o.omur.tur|0);
      kayit.omur.para = Math.max(0, o.omur.para|0);
    }
  }catch(e){ /* okunamadı: sıfırdan */ }
}

export function sakla(){
  try{ localStorage.setItem(ANAHTAR, JSON.stringify(kayit)); }
  catch(e){ /* yazılamadı: oyun yine de oynanır */ }
}

export const sahip = id => kayit.joker[id] || 0;

export function ekle(id, adet){
  kayit.joker[id] = sahip(id) + adet;
  sakla();
}

export function harca(miktar){
  if(kayit.para < miktar) return false;
  kayit.para -= miktar; sakla(); return true;
}

export function kazan(miktar){
  kayit.para += miktar; kayit.omur.para += miktar; sakla();
}
