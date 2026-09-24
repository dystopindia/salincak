// Parkur engellerinin çizimi (oyun/engel.js). Resimleri gelene kadar kodla:
// bölge başına iki renk — gövde ve kapak. Kapak açık renk, çünkü oyuncunun
// okuması gereken tek şey "nereye basılır"; gövde koyu, sahnenin önünde
// silüet gibi. Gece gövde bölgenin ön plan rengine doğru kararıyor
// (resimli iskeletlerin gece perdesiyle aynı fikir, §6.16).
import { X, W } from '../cekirdek/tuval.js';
import { ekr, PM } from '../cekirdek/kamera.js';
import { renkKar, kis } from '../cekirdek/matematik.js';
import { BOL } from '../oyun/tanimlar.js';

const BLOK_RENK = [
  ['#5B4A8C', '#F2B33D'],   // park: oyun parkı moru, kehribar kenar
  ['#4A3A2A', '#8DB35E'],   // orman: kütük, yosun
  ['#8A6FB0', '#F5D0E0'],   // bulutlar
  ['#39405A', '#9FB4D8'],   // yörünge: metal
  ['#2E5C70', '#BFF0F0'],   // buz
];

export function engelCiz(d, b, gece){
  if(!d.engel.length) return;
  const [gRenk, kRenk] = BLOK_RENK[b] || BLOK_RENK[0];
  const govde = renkKar(gRenk, BOL[b].on, gece*.5);
  const kapak = renkKar(kRenk, BOL[b].on, gece*.25);
  const kenar = BOL[b].on;
  for(const e of d.engel){
    const a=ekr(e.x0, e.ust), z=ekr(e.x1, 0);
    if(z.sx < -20) continue;
    if(a.sx > W+20) break;
    if(e.tip==='blok') blok(e, a, z, govde, kapak, kenar);
    else trambolin(d, e, govde, kapak, kenar);
  }
}

function blok(e, a, z, govde, kapak, kenar){
  const alt=ekr(e.x0, e.alt).sy, w=z.sx-a.sx, h=alt-a.sy;
  X.fillStyle=govde; X.fillRect(a.sx, a.sy, w, h);
  // tahta/levha çizgileri: 1.1 m'de bir, dünya konumuna bağlı (kaymasın)
  X.strokeStyle='rgba(0,0,0,.18)'; X.lineWidth=1.5;
  X.beginPath();
  for(let x=Math.ceil(e.x0/1.1)*1.1; x<e.x1-.2; x+=1.1){
    const p=ekr(x,0).sx; X.moveTo(p, a.sy+PM*.2); X.lineTo(p, alt);
  }
  X.stroke();
  X.strokeStyle=kenar; X.lineWidth=2; X.strokeRect(a.sx, a.sy, w, h);
  // kapak: basılacak yüzey, gövdeden biraz taşan açık bant
  const k=Math.max(4, PM*.16);
  X.fillStyle=kapak; X.fillRect(a.sx-2, a.sy-1, w+4, k);
  X.strokeStyle=kenar; X.lineWidth=1.5; X.strokeRect(a.sx-2, a.sy-1, w+4, k);
}

function trambolin(d, e, govde, kapak, kenar){
  // Değince mat çöküyor ve geri geliyor (.22 s) — sekmenin görünür karşılığı.
  const dip = d.sekE===e ? .3*kis(1-(d.t-d.sekT)/.22, 0, 1) : 0;
  const s0=ekr(e.x0, e.ust), s1=ekr(e.x1, e.ust);
  const yer=ekr(e.x0, 0).sy;
  // bacaklar
  X.strokeStyle=govde; X.lineWidth=Math.max(3, PM*.09); X.lineCap='round';
  X.beginPath();
  X.moveTo(s0.sx+PM*.2, s0.sy); X.lineTo(s0.sx+PM*.05, yer);
  X.moveTo(s1.sx-PM*.2, s1.sy); X.lineTo(s1.sx-PM*.05, yer);
  X.stroke();
  // yaylar: çerçeveden mata kısa çizgiler
  const mat = s0.sy + PM*(.08+dip);
  X.strokeStyle='rgba(233,229,242,.45)'; X.lineWidth=1;
  X.beginPath();
  for(let i=1;i<8;i++){ const x=s0.sx+(s1.sx-s0.sx)*i/8; X.moveTo(x, s0.sy); X.lineTo(x, mat-(Math.abs(i-4)/4)*PM*dip*.8); }
  X.stroke();
  // mat: ortası çöken koyu kumaş, üstünde açık bir iz (dinlenirken de
  // "burası seker" okunsun — ilk sürümde ince koyu çizgi kayboluyordu)
  const orta=(s0.sx+s1.sx)/2;
  X.fillStyle='#15121F';
  X.beginPath(); X.moveTo(s0.sx+PM*.1, s0.sy);
  X.quadraticCurveTo(orta, mat+PM*dip*2, s1.sx-PM*.1, s1.sy);
  X.quadraticCurveTo(orta, s0.sy+PM*.1, s0.sx+PM*.1, s0.sy); X.fill();
  X.strokeStyle='rgba(121,217,172,.55)'; X.lineWidth=1.5;
  X.beginPath(); X.moveTo(s0.sx+PM*.25, s0.sy+PM*.05);
  X.quadraticCurveTo(orta, mat+PM*dip*1.6, s1.sx-PM*.25, s1.sy+PM*.05); X.stroke();
  // çerçeve: kalın, uçları yuvarlak
  X.strokeStyle=kenar; X.lineWidth=Math.max(6, PM*.17);
  X.beginPath(); X.moveTo(s0.sx, s0.sy); X.lineTo(s1.sx, s1.sy); X.stroke();
  X.strokeStyle=kapak; X.lineWidth=Math.max(4, PM*.12);
  X.beginPath(); X.moveTo(s0.sx, s0.sy); X.lineTo(s1.sx, s1.sy); X.stroke();
  X.lineCap='butt';
  // süper sekme: kısa bir halka
  if(d.sekE===e && d.sekSuper && d.t-d.sekT<.35){
    const q=(d.t-d.sekT)/.35;
    X.strokeStyle='rgba(121,217,172,'+(1-q)+')'; X.lineWidth=2;
    X.beginPath(); X.ellipse((s0.sx+s1.sx)/2, s0.sy, (s1.sx-s0.sx)*(.5+q*.5), PM*(.2+q*.4), 0, 0, 6.3); X.stroke();
  }
}
