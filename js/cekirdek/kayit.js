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
  joker: {},        // { jokerId: adet }
  omur: { tur:0, para:0 }
};

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
