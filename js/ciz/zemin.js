import { X, W, H } from '../cekirdek/tuval.js';
import { ekr, kamX, PM } from '../cekirdek/kamera.js';
import { renkA } from '../cekirdek/matematik.js';
import { BOL, bolgeNo } from '../oyun/tanimlar.js';
import { mevsimGoster, mevsimBoya } from './zaman.js';

// Bölge sınırında, iki salıncağın tam ortasında bir tabela: "II · orman".
// Oyun düzleminde (k=1), yani dünyaya ait — HUD'daki bölge kartı geçince
// unutuluyor, tabela geriye bakınca hâlâ orada. Katmanlar da tam bu
// noktada (t=.5) eski bölgeden yenisine geçiyor (sahne.ciz, bz); tabela
// o kesintiyi "burası sınır" diye işaretliyor. Öğreticide yok: oradaki
// 5 salıncak indeks olarak orman'a taşsa da hepsi park.
function tabela(d){
  if(d.ogretici) return;
  for(let j=Math.max(1,d.i-2); j<d.sal.length; j++){
    const s=d.sal[j];
    if(s.x-s.acilim > kamX+W/(PM*2)+4) break;
    const b=bolgeNo(j);
    if(b===bolgeNo(j-1)) continue;
    const x=s.x-s.acilim*.5, dip=ekr(x,0), tepe=ekr(x,1.25), B=BOL[b];
    X.fillStyle='#4A4278';
    X.fillRect(dip.sx-Math.max(1,PM*.035), tepe.sy, Math.max(2,PM*.07), dip.sy-tepe.sy);
    X.save(); X.translate(tepe.sx,tepe.sy); X.rotate(-.05);
    X.fillStyle='#252150'; X.strokeStyle=renkA(B.lamba,.85); X.lineWidth=1.5;
    X.beginPath(); X.roundRect(-46,-13,92,26,5); X.fill(); X.stroke();
    X.fillStyle='#E9E5F2'; X.font='600 11px system-ui'; X.textAlign='center'; X.textBaseline='middle';
    X.fillText(B.no+' · '+B.ad, 0, 1);
    X.textAlign='left'; X.textBaseline='alphabetic';
    X.restore();
  }
}

export function zemin(d,b){
  const y0=ekr(0,0).sy, B=BOL[b];

  // tepeler/ağaçlar artık katmanlar.js'te — burası yalnızca oyun düzlemi.
  X.fillStyle=mevsimBoya(B.yer, mevsimGoster(d)); X.fillRect(0,y0,W,H-y0);
  tabela(d);

  if(b===2){ // bulut katmanı
    X.fillStyle='rgba(233,229,242,.10)';
    for(let i=0;i<14;i++){
      const wx=Math.floor(kamX/8)*8+(i-7)*5.5, p=ekr(wx,.4);
      X.beginPath(); X.ellipse(p.sx,p.sy,70,17,0,0,6.3); X.fill();
    }
  }
  if(b===4){ // buz kuşağı: zeminde parlayan kırıntılar
    for(let i=0;i<26;i++){
      const wx=Math.floor(kamX/4)*4+(i-13)*3.1, p=ekr(wx+ (i%3)*.7, .06+(i%4)*.05);
      X.fillStyle='rgba(200,240,250,'+(.06+(i%5)*.03)+')';
      X.beginPath(); X.ellipse(p.sx,p.sy,10+(i%4)*7,2.5,0,0,6.3); X.fill();
    }
  }
  if(b===3){ // yörünge: kaçış çizgileri
    X.strokeStyle='rgba(233,229,242,.09)'; X.lineWidth=1;
    for(let i=0;i<20;i++){
      const wx=Math.floor(kamX/5)*5+(i-10)*5, p=ekr(wx,0);
      X.beginPath(); X.moveTo(p.sx,p.sy); X.lineTo(p.sx+40,p.sy+60); X.stroke();
    }
  }

  // 10 m'de bir mesafe cetveli
  X.fillStyle='rgba(233,229,242,.26)'; X.font='10px system-ui';
  const bas=Math.floor((kamX-16)/10)*10;
  for(let m=bas;m<kamX+20;m+=10){
    const p=ekr(m,0);
    if(p.sx<-20||p.sx>W+20) continue;
    X.fillRect(p.sx,y0,1,7); X.fillText(m+'m',p.sx+3,y0+17);
  }
}
