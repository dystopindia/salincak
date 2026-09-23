// ÜRETİLMİŞ — sprite.py yazıyor, elle düzenleme. Bkz. CLAUDE.md §6.16.
// Karakterler — dosya: atlas; depo: atlasın ekran boyutuna oranı; el:
// yumrukların dönme noktasından yatay uzaklığı (ekran px), zincirler
// buradan geçiyor; ox/oy: pozun dönme noktası, atlas px.
export const RESIM = {
  cocuk: { dosya:'resim/cocuk.png', depo:2.25, el:11.2,
    pozlar:{ otur:{x:0,y:0,w:75,h:101,ox:42.6,oy:84.5}, ayakta:{x:77,y:0,w:75,h:115,ox:44.4,oy:112.5}, ucus:{x:154,y:0,w:79,h:96,ox:45.7,oy:52.3}, uzan:{x:235,y:0,w:93,h:107,ox:41.8,oy:55.2} } }
};

// Salıncak iskeletleri, BOL sırasıyla. px/py: pivot (zincirlerin asıldığı
// yer), ty: ayak tabanı, fx/fy: fener camı — karenin içinde, atlas px.
export const ISKELET = { dosya:'resim/iskelet.webp',
  kareler:[
    {x:0,y:0,w:288,h:296,px:142.8,py:49.7,ty:294.0,fx:240.8,fy:102.9},
    {x:290,y:0,w:290,h:296,px:144.9,py:52.5,ty:293.3,fx:244.3,fy:100.1},
    {x:582,y:0,w:286,h:296,px:142.8,py:51.8,ty:294.7,fx:239.4,fy:106.4},
    {x:870,y:0,w:282,h:296,px:140.7,py:51.1,ty:293.3,fx:242.2,fy:102.2},
    {x:1154,y:0,w:287,h:296,px:142.8,py:50.4,ty:293.3,fx:241.5,fy:102.2} ] };

// Boyalı arka plan katmanları, bölge numarasıyla. Kenarları harmanlanmış,
// yatayda kesintisiz tekrar ediyor. alt: taban rengi (altı bununla doluyor).
export const BOYALI = {
  0: { uzak:{dosya:'resim/park-uzak.webp',w:2132,h:261,alt:'#6e8d91'}, orta:{dosya:'resim/park-orta.webp',w:1492,h:293,alt:'#375266'}, on:{dosya:'resim/park-on.webp',w:1279,h:119,alt:'#1b1638'} }
};
