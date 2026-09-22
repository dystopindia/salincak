import { kayit, sahip, ekle, harca } from '../cekirdek/kayit.js';
import { jokerSesi } from '../cekirdek/ses.js';

// Jokerler kalıcı istatistik değil, SEÇİM. Hepsi ya tek kullanımlık ya
// süreli: "bir pompa daha mı, şimdi mi atlıyorum" kararını yok etmesinler
// diye (CLAUDE.md §5). Kalıcı olsalardı oyun beceriden ekonomiye kayardı.

export const JOKER = [
  { id:'can',      ad:'Can',           fiyat:140, simge:'♥',
    not:'Son salıncaktan devam et, skorun kalır.' },
  { id:'zincir',   ad:'Sağlam zincir', fiyat:70,  simge:'⛓', sure:14,
    not:'14 sn zincir yorulmaz.' },
  { id:'miknatis', ad:'Mıknatıs',      fiyat:50,  simge:'✦', sure:22,
    not:'22 sn paralar sana gelir.' },
  { id:'odak',     ad:'Odak',          fiyat:90,  simge:'◐', sure:9,
    not:'9 sn zaman yavaşlar.' }
];

export const jokerBul = id => JOKER.find(j => j.id===id);

export function satinAl(id){
  const j = jokerBul(id);
  if(!j || !harca(j.fiyat)) return false;
  ekle(id, 1);
  jokerSesi();
  return true;
}

// --- tur içi durum ---------------------------------------------------
// d.jok = { zincir:kalanSaniye, miknatis:..., odak:... }, d.canKullanildi

export const aktif = (d,id) => !!(d.jok && d.jok[id] > 0);

export function jokerAdim(d, dt){
  if(!d.jok) return;
  for(const k in d.jok) if(d.jok[k] > 0) d.jok[k] = Math.max(0, d.jok[k]-dt);
}

// Süreli jokeri tur içinde harcar. Zaten açıksa süreyi uzatmıyor —
// üst üste basıp stoklamayı önlüyor.
export function jokerKullan(d, id){
  const j = jokerBul(id);
  if(!j || !j.sure || sahip(id) < 1 || aktif(d,id)) return false;
  kayit.joker[id]--;
  d.jok[id] = j.sure;
  d.jokerKullanildi = true;
  jokerSesi();
  return true;
}

// Ölümde canı harcayıp turu sürdürür. Skor korunur, mesafe ikramiyesi
// yalnız gerçek bitişte veriliyor.
export function canHarca(d){
  if(sahip('can') < 1) return false;
  kayit.joker.can--;
  d.canSayisi = (d.canSayisi||0) + 1;
  d.jokerKullanildi = true;
  return true;
}
