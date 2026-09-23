// ÜRETİLMİŞ — sprite.py yazıyor, elle düzenleme. Bkz. CLAUDE.md §6.16.
// dosya: atlas; depo: atlasın ekran boyutuna oranı; el: yumrukların
// dönme noktasından yatay uzaklığı (ekran px) — zincirler buradan geçiyor.
// ox/oy: pozun dönme noktası, atlas px.
export const RESIM = {
  cocuk: { dosya:'resim/cocuk.png', depo:2.25, el:11.2,
    pozlar:{ otur:{x:0,y:0,w:75,h:101,ox:42.6,oy:84.5}, ayakta:{x:77,y:0,w:75,h:115,ox:44.4,oy:112.5}, ucus:{x:154,y:0,w:79,h:96,ox:45.7,oy:52.3}, uzan:{x:235,y:0,w:93,h:107,ox:41.8,oy:55.2} } }
};
