// ÜRETİLMİŞ — sprite.py yazıyor, elle düzenleme. Bkz. CLAUDE.md §6.16.
// Karakterler — dosya: atlas; depo: atlasın ekran boyutuna oranı; el:
// yumrukların dönme noktasından yatay uzaklığı (ekran px), zincirler
// buradan geçiyor; ox/oy: pozun dönme noktası, atlas px.
export const RESIM = {
  cocuk: { dosya:'resim/cocuk.png', depo:2.25, el:11.2, alfa:1,
    pozlar:{ otur:{x:0,y:0,w:75,h:101,ox:42.6,oy:84.5}, ayakta:{x:77,y:0,w:75,h:115,ox:44.4,oy:112.5}, ucus:{x:154,y:0,w:79,h:96,ox:45.7,oy:52.3}, uzan:{x:235,y:0,w:93,h:107,ox:41.8,oy:55.2} } },
  kedi: { dosya:'resim/kedi.png', depo:2.25, el:12.0, alfa:1,
    pozlar:{ otur:{x:0,y:0,w:81,h:95,ox:47.1,oy:83.0}, ayakta:{x:83,y:0,w:80,h:105,ox:46.3,oy:103.9}, ucus:{x:165,y:0,w:73,h:89,ox:44.0,oy:48.7}, uzan:{x:240,y:0,w:96,h:98,ox:52.5,oy:50.7} } },
  astronot: { dosya:'resim/astronot.png', depo:2.25, el:12.1, alfa:1,
    pozlar:{ otur:{x:0,y:0,w:75,h:103,ox:41.0,oy:82.4}, ayakta:{x:77,y:0,w:70,h:111,ox:37.8,oy:110.3}, ucus:{x:149,y:0,w:72,h:95,ox:41.2,oy:53.7}, uzan:{x:223,y:0,w:92,h:103,ox:46.9,oy:53.7} } },
  hayalet: { dosya:'resim/hayalet.png', depo:2.25, el:12.0, alfa:0.82,
    pozlar:{ otur:{x:0,y:0,w:71,h:94,ox:38.2,oy:87.3}, ayakta:{x:73,y:0,w:69,h:100,ox:35.6,oy:97.6}, ucus:{x:144,y:0,w:60,h:90,ox:30.5,oy:46.7}, uzan:{x:206,y:0,w:90,h:93,ox:40.4,oy:48.5} } }
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
  0: { uzak:{dosya:'resim/park-uzak.webp',w:1957,h:261,alt:'#6e8d91'}, orta:{dosya:'resim/park-orta.webp',w:1493,h:293,alt:'#375266'}, on:{dosya:'resim/park-on.webp',w:1209,h:119,alt:'#1b1638'} },
  1: { uzak:{dosya:'resim/orman-uzak.webp',w:2042,h:260,alt:'#649492'}, orta:{dosya:'resim/orman-orta.webp',w:1389,h:322,alt:'#1c5050'}, on:{dosya:'resim/orman-on.webp',w:1253,h:130,alt:'#081913'} },
  2: { uzak:{dosya:'resim/bulutlar-uzak.webp',w:1900,h:333,alt:'#e6c9ef'}, orta:{dosya:'resim/bulutlar-orta.webp',w:1464,h:286,alt:'#b47ad5'}, on:{dosya:'resim/bulutlar-on.webp',w:1090,h:127,alt:'#1d1639'} },
  3: { uzak:{dosya:'resim/yorunge-uzak.webp',w:2151,h:280,alt:'#6278ba'}, orta:{dosya:'resim/yorunge-orta.webp',w:1506,h:267,alt:'#3f4d6d'}, on:{dosya:'resim/yorunge-on.webp',w:1218,h:142,alt:'#0e0f28'} },
  4: { uzak:{dosya:'resim/buz-uzak.webp',w:1767,h:255,alt:'#79c8f4'}, orta:{dosya:'resim/buz-orta.webp',w:1444,h:258,alt:'#057ed1'}, on:{dosya:'resim/buz-on.webp',w:1204,h:140,alt:'#10163c'} }
};
