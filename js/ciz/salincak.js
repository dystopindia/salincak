import { X } from '../cekirdek/tuval.js';
import { ekr, PM } from '../cekirdek/kamera.js';
import { kis, lerp } from '../cekirdek/matematik.js';
import { oturX, oturY } from '../oyun/fizik.js';

// A ayakları ve üst kiriş
export function iskelet(s,aktif){
  X.lineCap='round';
  X.strokeStyle=aktif?'#4A4278':'#332E5C'; X.lineWidth=4;
  for(const q of [-1,1]){
    const a=ekr(s.x+q*1.5,0), b=ekr(s.x+q*.35,s.py), c=ekr(s.x+q*2.4,0);
    X.beginPath(); X.moveTo(a.sx,a.sy); X.lineTo(b.sx,b.sy);
    X.moveTo(c.sx,c.sy); X.lineTo(b.sx,b.sy); X.stroke();
  }
  const l=ekr(s.x-.35,s.py), r=ekr(s.x+.35,s.py);
  X.strokeStyle=aktif?'#5A5190':'#3B3568'; X.lineWidth=5;
  X.beginPath(); X.moveTo(l.sx-24,l.sy); X.lineTo(r.sx+24,r.sy); X.stroke();
}

// Zincir düz bir çizgi DEĞİL, art arda dönen halkalardan oluşuyor — her
// halka bir öncekine göre 90° dönük, gerçek bir zincirin iç içe geçmesi
// gibi. Yorgunluk arttıkça halkalar UZAYIP İNCELİYOR: kırılmaya yaklaşan
// bir zincirin gerilmiş görünümü, §5'teki yorgunluk mekaniğine görsel
// karşılık. Uzaktaki (aktif olmayan) salıncaklarda halka boyu sabit ve
// kaba tutuluyor — göz zaten üstünde olduğun zincire bakıyor, arka
// plandakine ince detay harcamaya gerek yok.
const HALKA_TABAN=7.0, HALKA_GERGIN=10.5, HALKA_UZAK=12.5, HALKA_ORAN=.56;

function zincirTeli(pv,ot,halkaBoy,renk,kalinlik){
  const dx=ot.sx-pv.sx, dy=ot.sy-pv.sy, boy=Math.hypot(dx,dy)||1;
  const aci=Math.atan2(dy,dx);
  const N=Math.max(3,Math.round(boy/(halkaBoy*.62)));
  const adim=boy/N, ca=Math.cos(aci), sa=Math.sin(aci);
  X.strokeStyle=renk; X.lineWidth=kalinlik;
  for(let i=0;i<=N;i++){
    const t=i*adim;
    X.save(); X.translate(pv.sx+ca*t,pv.sy+sa*t); X.rotate(aci+(i%2?Math.PI/2:0));
    X.beginPath(); X.ellipse(0,0,halkaBoy*.5,halkaBoy*.5*HALKA_ORAN,0,0,6.3); X.stroke();
    X.restore();
  }
}

// Zincir + oturak. İki zincir çiziliyor, tek çizgi değil: oturak zaten
// 24 px'lik yatay bir çubuk olarak çiziliyor, yani görüş açısı tam
// yandan değil. Karakterin elleri de bu iki zincirin üstüne oturuyor
// (karakter.js/kol).
const ZAYRIM = .157;                                   // yarı açıklık (m)

// elPx: resimli karakterin yumruk aralığı (sprite.elAraligi, ekran px) ya
// da null. Resimdeki yumruklar başın iki yanında, eski metrik aralıktan
// (±0.157 m = telefonda ±3-5 px) çok daha geniş; zincirler onların içinden
// geçmezse "zinciri tutuyor" görüntüsü bozulur. Resimli aralık oturak
// çubuğunun ucuna (±12 px) denk geliyor — gerçek salıncakta da zincir oraya bağlı.
export function zincirCiz(s,aktif,elPx=null){
  const pv=ekr(s.x,s.py), ot=ekr(oturX(s),oturY(s)), k=kis(s.yorgun,0,1);
  // ayrım yönü oturak çubuğunun ekseni: rotate(-θ) altında yerel x
  const ay=elPx!=null ? elPx : ZAYRIM*PM;
  const dx=Math.cos(s.th)*ay, dy=-Math.sin(s.th)*ay;
  const renk=aktif?'rgb('+Math.round(90+121*k)+',81,'+Math.round(144-33*k)+')':'#453E75';
  const kalinlik=aktif?1.8-k*.6:1.2;
  const halkaBoy=aktif?lerp(HALKA_TABAN,HALKA_GERGIN,k):HALKA_UZAK;
  for(const q of [-1,1]){
    zincirTeli({sx:pv.sx+q*dx,sy:pv.sy+q*dy},{sx:ot.sx+q*dx,sy:ot.sy+q*dy}, halkaBoy, renk, kalinlik);
  }
  X.save(); X.translate(ot.sx,ot.sy); X.rotate(-s.th);   // −θ: canvas saat yönü, dünya y'si yukarı
  X.fillStyle=aktif?'#F2B33D':'#7A6E9E'; X.fillRect(-12,0,24,4); X.restore();
}
