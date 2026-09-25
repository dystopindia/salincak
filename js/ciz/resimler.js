// ÜRETİLMİŞ — sprite.py yazıyor, elle düzenleme. Bkz. CLAUDE.md §6.16.
// Karakterler — dosya: atlas; depo: atlasın ekran boyutuna oranı; el:
// yumrukların dönme noktasından yatay uzaklığı (ekran px), zincirler
// buradan geçiyor; ox/oy: pozun dönme noktası, atlas px.
export const RESIM = {
  cocuk: { dosya:'resim/cocuk.webp', depo:2.25, el:11.2, alfa:1,
    pozlar:{ otur:{x:0,y:0,w:75,h:101,ox:42.6,oy:84.5}, ayakta:{x:77,y:0,w:75,h:115,ox:44.4,oy:112.5}, ucus:{x:154,y:0,w:79,h:96,ox:45.7,oy:52.3}, uzan:{x:235,y:0,w:93,h:107,ox:41.8,oy:55.2}, kosu1:{x:330,y:0,w:81,h:107,ox:51.6,oy:107.0}, kosu2:{x:413,y:0,w:84,h:101,ox:53.5,oy:100.7}, kosu3:{x:499,y:0,w:84,h:107,ox:54.5,oy:106.5}, kosu4:{x:585,y:0,w:83,h:105,ox:53.8,oy:105.1}, zipla:{x:670,y:0,w:99,h:111,ox:54.6,oy:55.4}, inis:{x:771,y:0,w:100,h:101,ox:59.0,oy:101.2} } },
  kedi: { dosya:'resim/kedi.webp', depo:2.25, el:12.0, alfa:1,
    pozlar:{ otur:{x:0,y:0,w:81,h:95,ox:47.1,oy:83.0}, ayakta:{x:83,y:0,w:80,h:105,ox:46.3,oy:103.9}, ucus:{x:165,y:0,w:73,h:89,ox:44.0,oy:48.7}, uzan:{x:240,y:0,w:96,h:98,ox:52.5,oy:50.7}, kosu1:{x:338,y:0,w:95,h:97,ox:62.0,oy:96.5}, kosu2:{x:435,y:0,w:90,h:92,ox:60.7,oy:92.2}, kosu3:{x:527,y:0,w:96,h:95,ox:61.5,oy:95.2}, kosu4:{x:625,y:0,w:92,h:94,ox:61.8,oy:93.4}, zipla:{x:719,y:0,w:101,h:94,ox:61.3,oy:46.9}, inis:{x:822,y:0,w:102,h:85,ox:69.0,oy:84.7} } },
  astronot: { dosya:'resim/astronot.webp', depo:2.25, el:12.1, alfa:1,
    pozlar:{ otur:{x:0,y:0,w:75,h:103,ox:41.0,oy:82.4}, ayakta:{x:77,y:0,w:70,h:111,ox:37.8,oy:110.3}, ucus:{x:149,y:0,w:72,h:95,ox:41.2,oy:53.7}, uzan:{x:223,y:0,w:92,h:103,ox:46.9,oy:53.7}, kosu1:{x:317,y:0,w:75,h:100,ox:43.1,oy:99.7}, kosu2:{x:394,y:0,w:71,h:99,ox:40.5,oy:98.5}, kosu3:{x:467,y:0,w:74,h:100,ox:43.1,oy:99.9}, kosu4:{x:543,y:0,w:73,h:101,ox:42.9,oy:101.1}, zipla:{x:618,y:0,w:95,h:91,ox:53.4,oy:45.4}, inis:{x:715,y:0,w:93,h:93,ox:50.7,oy:93.0} } },
  hayalet: { dosya:'resim/hayalet.webp', depo:2.25, el:12.0, alfa:0.82,
    pozlar:{ otur:{x:0,y:0,w:71,h:94,ox:38.2,oy:87.3}, ayakta:{x:73,y:0,w:69,h:100,ox:35.6,oy:97.6}, ucus:{x:144,y:0,w:60,h:90,ox:30.5,oy:46.7}, uzan:{x:206,y:0,w:90,h:93,ox:40.4,oy:48.5}, kosu1:{x:298,y:0,w:80,h:89,ox:51.7,oy:89.0}, kosu2:{x:380,y:0,w:79,h:91,ox:50.7,oy:90.6}, kosu3:{x:461,y:0,w:82,h:88,ox:54.3,oy:87.9}, kosu4:{x:545,y:0,w:84,h:89,ox:55.7,oy:88.3}, zipla:{x:631,y:0,w:74,h:103,ox:34.6,oy:51.5}, inis:{x:707,y:0,w:100,h:69,ox:55.3,oy:68.5} } }
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

// Parkur parçaları (§12): blok 9 dilim — kapak: üst şerit yüksekliği, sol/sag:
// uç parçaların genişliği; pxm: atlas px / dünya metresi. tramb: dinlenen ve
// basılmış hâl, aynı tabanda; ust: sekme yüzeyinin tepeden uzaklığı.
export const PARKUR_RESIM = {
  0: { dosya:'resim/park-parkur.webp', pxm:79.1,
    blok:{x:0,y:0,w:679,h:103,kapak:39.2,sol:26.4,sag:26.8,alt:7.7,yuzey:3.6},
    tramb:[{x:0,y:105,w:321,h:110},{x:323,y:105,w:321,h:110}], ust:16.6 },
  1: { dosya:'resim/orman-parkur.webp', pxm:81.8,
    blok:{x:0,y:0,w:601,h:118,kapak:59.6,sol:90.4,sag:90.4,alt:7.0,yuzey:22.8},
    tramb:[{x:0,y:120,w:250,h:166},{x:252,y:120,w:250,h:166}], ust:5.0 },
  2: { dosya:'resim/bulutlar-parkur.webp', pxm:126.2,
    blok:{x:0,y:0,w:664,h:122,kapak:62.4,sol:83.2,sag:83.2,alt:7.1,yuzey:5.6},
    tramb:[{x:0,y:124,w:238,h:100},{x:240,y:124,w:238,h:100}], ust:8.0 },
  3: { dosya:'resim/yorunge-parkur.webp', pxm:68.4,
    blok:{x:0,y:0,w:639,h:106,kapak:37.2,sol:67.2,sag:64.8,alt:8.3,yuzey:6.4},
    tramb:[{x:0,y:108,w:234,h:100},{x:236,y:108,w:234,h:100}], ust:20.1 },
  4: { dosya:'resim/buz-parkur.webp', pxm:92.4,
    blok:{x:0,y:0,w:655,h:135,kapak:60.8,sol:52.0,sag:52.4,alt:8.9,yuzey:19.2},
    tramb:[{x:0,y:137,w:279,h:131},{x:281,y:137,w:279,h:131}], ust:24.1 }
};
