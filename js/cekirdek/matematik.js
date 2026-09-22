// Saf yardımcılar. Hiçbir şeye bağımlı değil, hiçbir yan etkisi yok.

export const kis  = (v,a,b)=> v<a?a : v>b?b : v;
export const lerp = (a,b,t)=> a+(b-a)*t;

// FNV-1a: tohum metnini 32 bit sayıya indirger.
export function th32(s){
  let h=2166136261>>>0;
  for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); }
  return h>>>0;
}

// mulberry32. Aynı tohum = aynı dünya; oyunun karşılaştırılabilirliği buna dayanıyor.
export function rng(a){
  return function(){
    a|=0; a=a+0x6D2B79F5|0;
    let t=Math.imul(a^a>>>15, 1|a);
    t = t+Math.imul(t^t>>>7, 61|t) ^ t;
    return ((t^t>>>14)>>>0)/4294967296;
  };
}

// Çizim gürültüsü. Katman şekilleri buradan üretiliyor — d.r'yi ASLA
// kullanma, çizim tohumlu diziyi tüketirse dünya deterministik olmaktan çıkar.
export const nz = i => { const s=Math.sin(i*12.9898+78.233)*43758.5453; return s-Math.floor(s); };

// --- renk ------------------------------------------------------------
// Hepsi '#rrggbb' alır ve '#rrggbb' döndürür. Ortak temsil şart: renkKar
// eskiden 'rgb(...)' döndürüyordu; parlaklik onu hex sanıp NaN üretti ve
// canvas geçersiz fillStyle'ı sessizce yutup bir öncekini kullandı.
const oku = r => [1,3,5].map(i=>parseInt(r.slice(i,i+2),16));
const yaz = c => '#'+c.map(v=>Math.round(kis(v,0,255)).toString(16).padStart(2,'0')).join('');

// İki rengi karıştırır (t=0 → a, t=1 → b). Bölge geçişlerinde gökyüzü için.
export function renkKar(a,b,t){
  const A=oku(a), B=oku(b);
  return yaz([0,1,2].map(i=>lerp(A[i],B[i],t)));
}

// Hex'i saydam rgba'ya çevirir. Işık gradyanları için.
export const renkA = (renk,a) => 'rgba('+oku(renk).join(',')+','+a+')';

// Rengi karartır/açar (1 = değişmez). Sis tek başına derinlik vermiyor:
// bazı bölgelerde zemin ve ufuk rengi birbirine çok yakın kalıyor.
export const parlaklik = (renk,k) => yaz(oku(renk).map(v=>v*k));
