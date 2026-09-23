// Tek yerde toplanan element referansları. Kod hiçbir yerde örtük
// window.<id> globaline güvenmiyor.

const el = id => document.getElementById(id);

export const hud  = el('hud');
export const menu = el('menu');
export const son  = el('son');

export const hSkor  = el('hSkor');
export const hSal   = el('hSal');
export const hMes   = el('hMes');
export const hRuz   = el('hRuz');
export const hRek   = el('hRek');
export const hRekOlcu = el('hRekOlcu');
export const hFark  = el('hFark');
export const hIrtifa = el('hIrtifa');
export const hHedef = el('hHedef');
export const hHedefAd = el('hHedefAd');
export const hHedefOdul = el('hHedefOdul');
export const hBar   = el('hBar');
export const hGic   = el('hGic');
export const hBolge = el('hBolge');
export const hIp    = el('hIp');
export const hPara  = el('hPara');
export const hJok   = el('hJok');
export const hOgret      = el('hOgret');
export const hOgretNo    = el('hOgretNo');
export const hOgretMetin = el('hOgretMetin');
export const bOgretGec   = el('bOgretGec');

export const ogretBitti  = el('ogretBitti');
export const bOgretBasla = el('bOgretBasla');
export const bOgretMenu  = el('bOgretMenu');
export const bOgretici   = el('bOgretici');
export const bGunluk     = el('bGunluk');
export const bHedefler   = el('bHedefler');
export const hedeflerPanel = el('hedeflerPanel');
export const hedefListe  = el('hedefListe');
export const izler       = el('izler');
export const mGunluk     = el('mGunluk');

export const kimlik = el('kimlik');
export const dukkan  = el('dukkan');
export const mPara   = el('mPara');
export const mRekor  = el('mRekor');
export const bDukkan = el('bDukkan');
export const bKur    = el('bKur');
export const bDevam  = el('bDevam');

export const bDuraklat     = el('bDuraklat');
export const duraklat      = el('duraklat');
export const dSkor         = el('dSkor');
export const bSurdur       = el('bSurdur');
export const bDuraklatMenu = el('bDuraklatMenu');
export const bAyarlar      = el('bAyarlar');
export const ayarlarPanel  = el('ayarlarPanel');

export const sBas  = el('sBas');
export const sSkor = el('sSkor');
export const sDok  = el('sDok');
export const surekliGosterge = el('surekliGosterge');

export const bAtla   = el('bAtla');
export const bBasla  = el('bBasla');
export const bTekrar = el('bTekrar');
export const bMenu   = el('bMenu');
