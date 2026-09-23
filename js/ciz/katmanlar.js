import { X, W, H } from '../cekirdek/tuval.js';
import { ekrK, kamX, KATMAN, PM } from '../cekirdek/kamera.js';
import { nz, kis, renkKar, renkA, parlaklik } from '../cekirdek/matematik.js';
import { BOL } from '../oyun/tanimlar.js';
import { ruzg } from '../oyun/fizik.js';
import { mevsimGoster, mevsimBoya, gunEvresi } from './zaman.js';
import { boyaliVar, boyaliCiz } from './boyali.js';

// Atmosferik perspektif iki eksende: zemin→ufuk sis karışımı + parlaklık.
// Sonuç sırası (açıktan koyuya): en uzak · uzak sırt · gökyüzü · zemin ·
// orta ağaçlar · ön plan. Orta katman zeminden KOYU olduğu için silüet
// gibi okunuyor; yalnız sisle ayırmaya çalışmak park bölgesinde işe
// yaramıyordu.
const sis = (b,m,p,mevsim) => mevsimBoya(parlaklik(renkKar(BOL[b].yer, BOL[b].gok[2], m), p), mevsim);
const ENUZAK = [.95, 1.30], UZAK = [.85, 1.18], ORTA = [.40, .62];

// Her biyomun kendi ikinci uzak düzlemi var (k=.07-.10): en yavaş kayan,
// sise en yakın, en açık renkli. Üç sabit katmanın (uzak/orta/ön) dışında
// ama aynı kuralla: ölçek değişmiyor, yalnız kayma hızı ve taban.
const K_ENUZAK = .08;

// Katmanın o an gördüğü dünya aralığı. Kamera k kadar kaydığı için
// görünür pencere de kamX*k etrafında.
function pencere(k,adim){
  const yari=(W/PM)*.62+adim*2;      // kamera ortada değil (ekr/ODAK), iki yanı da kapsa
  return { sol: Math.floor((kamX*k-yari)/adim)*adim, sag: kamX*k+yari };
}

// Arka katmanlar ekranın altına kadar doldurulur: orta katman uzağı,
// zemin de ortayı örter. Doğru sıralama derinliği bedavaya getiriyor.
const kapat = () => { X.lineTo(W+40,H+40); X.lineTo(-40,H+40); X.closePath(); X.fill(); };
const ac    = () => { X.beginPath(); X.moveTo(-40,H+40); };

// --- silüet biçimleri -------------------------------------------------

// yumuşak tepe sırtı
function sirt(k,adim,taban,yuk,kay){
  const {sol,sag}=pencere(k,adim); ac();
  for(let x=sol;x<=sag;x+=adim){
    const i=Math.round(x/adim)+kay;
    const h=yuk*(.35+.65*(nz(i)*.65+nz(i*2.1+7)*.35));
    const p=ekrK(x,taban+h,k); X.lineTo(p.sx,p.sy);
  }
  kapat();
}

// yuvarlak tepeli ağaçlar (park)
function taclar(k,adim,taban,yuk,kay){
  const {sol,sag}=pencere(k,adim); ac();
  for(let x=sol;x<=sag;x+=adim){
    const i=Math.round(x/adim)+kay;
    const r=yuk*(.45+.55*nz(i));
    const c=ekrK(x,taban,k);              // taban sabit → taçlar aynı hizadan yükselir
    X.arc(c.sx,c.sy,r*PM,Math.PI,0);
  }
  kapat();
}

// iğne yapraklı (orman)
function cam(k,adim,taban,yuk,kay){
  const {sol,sag}=pencere(k,adim); ac();
  for(let x=sol;x<=sag;x+=adim){
    const i=Math.round(x/adim)+kay;
    const h=yuk*(.45+.55*nz(i)), g=adim*(.42+.2*nz(i*3.3));
    const a=ekrK(x-g,taban,k), t=ekrK(x,taban+h,k), b=ekrK(x+g,taban,k);
    X.lineTo(a.sx,a.sy); X.lineTo(t.sx,t.sy); X.lineTo(b.sx,b.sy);
  }
  kapat();
}

// üst üste binen bulut kümeleri
function kume(k,adim,taban,yuk,kay){
  const {sol,sag}=pencere(k,adim); ac();
  for(let x=sol;x<=sag;x+=adim){
    const i=Math.round(x/adim)+kay;
    const r=yuk*(.45+.55*nz(i)), c=ekrK(x,taban+r*.35,k);
    X.ellipse(c.sx,c.sy,r*PM*1.5,r*PM,0,Math.PI,0);
  }
  kapat();
}

// şehir silüeti (park, en uzak): çoğu alçak blok, arada bir kule
function sehir(k,adim,taban,yuk,kay){
  const {sol,sag}=pencere(k,adim); ac();
  for(let x=sol;x<=sag;x+=adim){
    const i=Math.round(x/adim)+kay;
    const h=yuk*(.22+.78*nz(i)*nz(i*1.3+3)), g=adim*(.28+.2*nz(i*2.1));
    const a=ekrK(x-g,taban,k), b=ekrK(x-g,taban+h,k), c=ekrK(x+g,taban+h,k), e=ekrK(x+g,taban,k);
    X.lineTo(a.sx,a.sy); X.lineTo(b.sx,b.sy); X.lineTo(c.sx,c.sy); X.lineTo(e.sx,e.sy);
  }
  kapat();
}

// Şehrin pencereleri: gece yanıyor, gündüz sönüyor. Bina ölçüleriyle aynı
// nz() dizisinden türüyor, yani hep aynı binada aynı pencereler.
function pencereler(k,adim,taban,yuk,kay,renk,guc){
  if(guc<=.02) return;
  const {sol,sag}=pencere(k,adim);
  X.fillStyle=renkA(renk,.55*guc);
  for(let x=sol;x<=sag;x+=adim){
    const i=Math.round(x/adim)+kay;
    const h=yuk*(.22+.78*nz(i)*nz(i*1.3+3)), g=adim*(.28+.2*nz(i*2.1));
    const n=Math.floor(nz(i*4.7)*4*h/yuk);
    for(let j=0;j<n;j++){
      const p=ekrK(x-g*.6+nz(i*9+j*3)*g*1.2, taban+.15+nz(i*5+j*7)*(h-.3), k);
      X.fillRect(p.sx-1,p.sy-1.5,2,3);
    }
  }
}

// Dönme dolap: parkın tek "işareti". Düzlem uzayında sabit bir noktada
// duruyor (park zaten 25 m sürüyor, kaymadan bir kez geçiyor); d.t ile
// ağır ağır dönüyor.
function donmeDolap(k,cx,cy,r,t){
  const c=ekrK(cx,cy,k), R=r*PM;
  X.lineWidth=Math.max(1,PM*.035); X.lineCap='round';
  X.beginPath(); X.arc(c.sx,c.sy,R,0,6.3); X.stroke();
  X.beginPath();
  for(let i=0;i<8;i++){
    const a=t*.12+i*Math.PI/4;
    X.moveTo(c.sx,c.sy); X.lineTo(c.sx+Math.cos(a)*R,c.sy+Math.sin(a)*R);
  }
  X.stroke();
  for(let i=0;i<8;i++){                       // kabinler
    const a=t*.12+i*Math.PI/4;
    X.beginPath(); X.arc(c.sx+Math.cos(a)*R,c.sy+Math.sin(a)*R,R*.09,0,6.3); X.fill();
  }
  const z=ekrK(cx,cy-r-.9,k);                 // A ayakları
  X.beginPath(); X.moveTo(z.sx-R*.55,z.sy); X.lineTo(c.sx,c.sy); X.lineTo(z.sx+R*.55,z.sy); X.stroke();
}

// Sis bandı: uzak sırtın eteğini gökyüzü rengine eritiyor — ormanın
// derinliği bu tek gradyandan geliyor.
function sisBandi(k,alt,ust,renk){
  const a=ekrK(0,alt,k), u=ekrK(0,ust,k);
  const g=X.createLinearGradient(0,u.sy,0,a.sy);
  g.addColorStop(0,renkA(renk,0)); g.addColorStop(1,renkA(renk,.55));
  X.fillStyle=g; X.fillRect(0,u.sy,W,a.sy-u.sy);
}

// Ateşböcekleri (orman, orta düzlem): 2.5 m'lik hücrelerde konumu nz'den,
// yanıp sönmesi d.t'den. Yalnız gece (gunGuc küçükken).
function atesbocekleri(k,t,guc,renk){
  if(guc<=.05) return;
  const adim=2.5, {sol,sag}=pencere(k,adim);
  X.globalCompositeOperation='lighter';
  for(let x=sol;x<=sag;x+=adim){
    const i=Math.round(x/adim)+31;
    if(nz(i*3.3)<.45) continue;
    const p=ekrK(x+nz(i)*adim, .9+nz(i*1.7)*2.4+Math.sin(t*.8+i)*.25, k);
    const a=(.25+.75*Math.abs(Math.sin(t*1.6+i*2.3)))*guc;
    const g=X.createRadialGradient(p.sx,p.sy,0,p.sx,p.sy,9);
    g.addColorStop(0,renkA(renk,.7*a)); g.addColorStop(1,renkA(renk,0));
    X.fillStyle=g; X.beginPath(); X.arc(p.sx,p.sy,9,0,6.3); X.fill();
    X.fillStyle=renkA('#FFF6C8',a); X.fillRect(p.sx-1,p.sy-1,2,2);
  }
  X.globalCompositeOperation='source-over';
}

// Kuş sürüsü (bulutlar, en uzak): 9 m'lik hücrelerde üçlü "V"ler, ağır
// ağır geriye akıyor.
function kuslar(k,t,renk){
  const adim=9, {sol,sag}=pencere(k,adim);
  X.strokeStyle=renk; X.lineWidth=1.6; X.lineCap='round';
  for(let x=sol;x<=sag;x+=adim){
    const i=Math.round(x/adim)+13;
    if(nz(i*5.1)<.4) continue;
    for(let j=0;j<3;j++){
      const p=ekrK(x+nz(i+j)*adim-t*.35, 4.6+nz(i*1.7+j)*2.0+Math.sin(t*1.1+i+j)*.12, k);
      const w=4+nz(i*2+j)*3, f=Math.sin(t*4+i+j*1.3)*2;
      X.beginPath(); X.moveTo(p.sx-w,p.sy+f); X.lineTo(p.sx,p.sy-1); X.lineTo(p.sx+w,p.sy+f); X.stroke();
    }
  }
}

// Sivri buz sırtı (buz kuşağı, uzak): kırık kristal siluet.
function buzSirti(k,adim,taban,yuk,kay){
  const {sol,sag}=pencere(k,adim); ac();
  for(let x=sol;x<=sag;x+=adim){
    const i=Math.round(x/adim)+kay;
    const h=yuk*(.30+.70*nz(i)), e=adim*(.30+.25*nz(i*2.7));
    const a=ekrK(x-adim*.5,taban,k), t=ekrK(x+e,taban+h,k), b=ekrK(x+adim*.5,taban+h*.22,k);
    X.lineTo(a.sx,a.sy); X.lineTo(t.sx,t.sy); X.lineTo(b.sx,b.sy);
  }
  kapat();
}

// Kuyruklu yıldızlar: çekirdek + arkaya uzanan sönen kuyruk. Düzlem
// boyunca TEKRARLIYOR — ilk sürümde tek bir tane sabit noktadaydı ve
// k=.06'lık düzlemde oyuncu ona hiç denk gelmiyordu (bölge 70 m sürüyor,
// düzlemde yalnız ~4 m). Katman silüetlerindeki hücre mantığının aynısı.
function kuyrukluYildizlar(k,t,renk){
  const adim=7, {sol,sag}=pencere(k,adim);
  for(let x=sol;x<=sag;x+=adim){
    const i=Math.round(x/adim)+87;
    if(nz(i*4.1)<.55) continue;
    kuyrukluYildiz(k, x+nz(i)*4, 4.2+nz(i*1.9)*2.4, t, renk);
  }
}

function kuyrukluYildiz(k,cx,cy,t,renk){
  const p=ekrK(cx,cy,k), R=PM*.10;
  if(p.sx<-260||p.sx>W+120) return;
  X.globalCompositeOperation='lighter';
  for(let i=1;i<=18;i++){                     // kuyruk: sağa-yukarı incelerek
    const u=i/18, q=ekrK(cx+u*2.6, cy+u*.8+Math.sin(t*.4+i*.3)*.04, k);
    X.fillStyle=renkA(renk,.10*(1-u));
    X.beginPath(); X.arc(q.sx,q.sy,R*(1.2-u*.9),0,6.3); X.fill();
  }
  const g=X.createRadialGradient(p.sx,p.sy,0,p.sx,p.sy,R*3.2);
  g.addColorStop(0,renkA(renk,.42)); g.addColorStop(1,renkA(renk,0));
  X.fillStyle=g; X.beginPath(); X.arc(p.sx,p.sy,R*3.2,0,6.3); X.fill();
  X.globalCompositeOperation='source-over';
  X.fillStyle='#EAFBFF'; X.beginPath(); X.arc(p.sx,p.sy,R*.55,0,6.3); X.fill();
}

// Dönen buz kütleleri (buz kuşağı, orta düzlem): köşeli, aydınlık —
// yörüngedeki enkazla aynı disiplin, siyah gökte koyu silüet okunmuyor.
function buzKutleleri(k,t,renk){
  const adim=3.6, {sol,sag}=pencere(k,adim);
  X.fillStyle=renk; X.strokeStyle=renkA('#EAFBFF',.5); X.lineWidth=1;
  for(let x=sol;x<=sag;x+=adim){
    const i=Math.round(x/adim)+41;
    if(nz(i*2.3)<.3) continue;
    const p=ekrK(x+nz(i)*2, 1.1+nz(i*1.7)*6.2, k), r=PM*(.10+nz(i*3.1)*.22), a=t*.25+i;
    X.beginPath();
    for(let j=0;j<5;j++){
      const ac2=a+j*1.257, rr=r*(.62+nz(i+j)*.55);
      const px=p.sx+Math.cos(ac2)*rr, py=p.sy+Math.sin(ac2)*rr;
      j?X.lineTo(px,py):X.moveTo(px,py);
    }
    X.closePath(); X.fill(); X.stroke();
  }
}

// Uydu (yörünge, orta düzlem): gövde + iki panel, ağır ağır dönüyor.
function uydu(k,x,y,t,renk){
  const p=ekrK(x,y,k), s=PM*.22;
  X.save(); X.translate(p.sx,p.sy); X.rotate(t*.18+x);
  X.fillStyle=renk;
  X.fillRect(-s*.5,-s*.4,s,s*.8);
  X.fillRect(-s*2.6,-s*.22,s*1.8,s*.44); X.fillRect(s*.8,-s*.22,s*1.8,s*.44);
  X.strokeStyle=renk; X.lineWidth=1; X.beginPath(); X.moveTo(0,-s*.4); X.lineTo(0,-s*1.1); X.stroke();
  X.restore();
}

// --- katmanlar --------------------------------------------------------

export function uzak(d,b){
  const k=KATMAN.uzak, mevsim=mevsimGoster(d), B=BOL[b];
  const { gunGuc } = gunEvresi(d, B.gunEtki);
  const gece=1-gunGuc;
  const enUzak=sis(b,...ENUZAK,mevsim), uzakR=sis(b,...UZAK,mevsim);

  // Boyalı katman varsa (ciz/boyali.js): resim tepe sırtının ve şehrin
  // yerine geçiyor. Dönen dolap kodda kalıyor — resmin ARKASINDA, şehrin
  // üstünden görünüyor; resim sabit, dolap dönüyor.
  if(b===0 && boyaliVar(0,'uzak')){
    X.strokeStyle=enUzak; X.fillStyle=enUzak;
    donmeDolap(K_ENUZAK,2.0,5.1,1.7,d.t);
    boyaliCiz(0,'uzak',gece,d);
  }
  else if(b===0){                          // park: şehir ufku + dönme dolap, önünde tepe sırtı
    X.fillStyle=enUzak;
    sehir(K_ENUZAK,1.1,2.3,3.4,500);
    pencereler(K_ENUZAK,1.1,2.3,3.4,500,B.lamba,gece);
    X.strokeStyle=enUzak; X.fillStyle=enUzak;
    donmeDolap(K_ENUZAK,2.0,5.1,1.7,d.t);      // x=2: ay (kamX+7.5) ile üst üste binmesin
    X.fillStyle=uzakR; sirt(k,2.6,1.5,3.0,0);
  }
  else if(b===1){                          // orman: iki sırt, arada sis
    X.fillStyle=enUzak; sirt(K_ENUZAK,2.8,2.4,3.6,900);
    sisBandi(K_ENUZAK,2.4,3.9,B.gok[2]);
    X.fillStyle=uzakR; sirt(k,2.2,1.7,4.2,140);
  }
  else if(b===2){                          // bulutlar: yüksek bulut bankı, kuşlar, alçak bank
    X.fillStyle=enUzak; kume(K_ENUZAK,4.2,3.4,2.4,700);
    kuslar(.11,d.t,renkA('#0D0820',.6));
    X.fillStyle=uzakR; kume(k,3.4,1.9,2.6,260);
  }
  else if(b===4){                          // buz kuşağı: kuyruklu yıldız + buz sırtı
    X.globalCompositeOperation='lighter';
    for(const [x,y,r,renk,a] of [[6,5.8,6,'#2B6F8F',.26],[-4,6.6,4.5,'#3D7F8F',.18]]){
      const p=ekrK(x,y,.05), R=r*PM;
      const gg=X.createRadialGradient(p.sx,p.sy,0,p.sx,p.sy,R);
      gg.addColorStop(0,renkA(renk,a*gece)); gg.addColorStop(1,renkA(renk,0));
      X.fillStyle=gg; X.beginPath(); X.arc(p.sx,p.sy,R,0,6.3); X.fill();
    }
    X.globalCompositeOperation='source-over';
    kuyrukluYildizlar(.06,d.t,B.lamba);
    X.fillStyle=enUzak; buzSirti(K_ENUZAK,3.0,2.2,3.2,1300);
    X.fillStyle=uzakR;  buzSirti(k,2.4,1.5,3.6,420);
  }
  else {                                   // yörünge: nebula, uzak ay, gezegen kavsi + atmosfer
    X.globalCompositeOperation='lighter';
    for(const [x,y,r,renk,a] of [[3,6.4,6.5,'#6A3D8F',.30],[16,4.6,5,'#2B6F8F',.24],[-6,7.2,4.5,'#8F3D6A',.20]]){
      const p=ekrK(x,y,.05), R=r*PM;
      const g=X.createRadialGradient(p.sx,p.sy,0,p.sx,p.sy,R);
      g.addColorStop(0,renkA(renk,a*gece)); g.addColorStop(1,renkA(renk,0));
      X.fillStyle=g; X.beginPath(); X.arc(p.sx,p.sy,R,0,6.3); X.fill();
    }
    X.globalCompositeOperation='source-over';
    const c=ekrK(kamX*k,-46,k), R=52*PM;
    for(let i=3;i>=1;i--){                 // atmosfer: dışa doğru sönen üç halka
      X.strokeStyle=renkA(B.lamba,.09*i); X.lineWidth=PM*.14*(4-i);
      X.beginPath(); X.arc(c.sx,c.sy,R+PM*.07*(4-i)*(4-i),0,6.3); X.stroke();
    }
    X.fillStyle=uzakR; X.beginPath(); X.arc(c.sx,c.sy,R,0,6.3); X.fill();
  }
}

export function orta(d,b){
  const k=KATMAN.orta, mevsim=mevsimGoster(d), B=BOL[b];
  const renk=sis(b,...ORTA,mevsim);
  X.fillStyle=renk;
  if(b===0 && boyaliVar(0,'orta')){ boyaliCiz(0,'orta',1-gunEvresi(d,B.gunEtki).gunGuc,d); return; }
  if(b===0){                               // park: ağaç taçları, önünde çit
    taclar(k,2.0,.35,1.6,40);
    const {sol,sag}=pencere(k,.55), cit=parlaklik(renk,1.55);
    X.fillStyle=cit; X.strokeStyle=cit; X.lineWidth=Math.max(1,PM*.03);
    const r1=ekrK(0,.55,k), r2=ekrK(0,.72,k);
    X.beginPath(); X.moveTo(-40,r1.sy); X.lineTo(W+40,r1.sy); X.moveTo(-40,r2.sy); X.lineTo(W+40,r2.sy); X.stroke();
    for(let x=sol;x<=sag;x+=.55){
      const a=ekrK(x,.35,k), u=ekrK(x,.85,k);
      X.fillRect(a.sx-PM*.03,u.sy,PM*.06,a.sy-u.sy);
    }
  }
  else if(b===1){                          // orman: çamlar + ateşböcekleri
    cam(k,1.35,.5,3.1,90);
    const { gunGuc } = gunEvresi(d, B.gunEtki);
    atesbocekleri(k,d.t,1-gunGuc,'#D8F07A');
  }
  else if(b===2) kume(k,2.4,.7,1.7,310);
  else if(b===4) buzKutleleri(k,d.t,renkA('#BFE6F0',.55));
  else {                                   // yörünge: sürüklenen enkaz + uydular
    // Siyah gökte koyu silüet okunmuyor (enkaz ilk sürümden beri görünmezdi);
    // burada nesneler aydınlık, gök koyu.
    const acik=renkA('#9FB4D8',.55); X.fillStyle=acik;
    const {sol,sag}=pencere(k,3.2);
    for(let x=sol;x<=sag;x+=3.2){
      const i=Math.round(x/3.2)+55, p=ekrK(x,1.2+nz(i)*7,k), r=(2+nz(i*1.7)*5);
      X.beginPath(); X.moveTo(p.sx,p.sy-r); X.lineTo(p.sx+r,p.sy); X.lineTo(p.sx,p.sy+r*.8);
      X.lineTo(p.sx-r*.9,p.sy); X.closePath(); X.fill();
    }
    const u=pencere(k,14);
    for(let x=u.sol;x<=u.sag;x+=14){
      const i=Math.round(x/14)+77;
      if(nz(i*2.9)<.35) continue;
      uydu(k,x+nz(i)*10,3.5+nz(i*1.3)*3,d.t,acik);
    }
  }
}

// Ön plan her şeyin ÜSTÜNE çizilir. Zemin çizgisinin ALTINDA, ekranın alt
// kenarındaki şeritte duruyor (taban -2.4 m): mesafe cetvelini kapatmıyor,
// karaktere hiç değmiyor. k=1.3 olduğu için zeminden hızlı kayıyor —
// paralaksın gözle en kolay okunduğu katman bu.
const ON_TABAN = -2.4;

export function on(d,b){
  const k=KATMAN.on, adim=.9, mevsim=mevsimGoster(d);
  const {sol,sag}=pencere(k,adim);
  X.fillStyle=mevsimBoya(BOL[b].on,mevsim);

  // Ön plan rüzgârı gösteren ikinci işaret (birincisi ciz/ruzgar.js):
  // otlar rüzgârın yönüne yatıyor, iplikler o yöne savruluyor. Aynı
  // `ruzg(d)` değerinden geliyor — çizgilerle hep aynı yöne bakıyorlar.
  const ruz=ruzg(d), siddet=Math.min(1,Math.abs(ruz)/2.2);
  // Boyalı ön plan rüzgâra yatmayı kendisi yapıyor (boyali.js, eğim).
  if(b===0 && boyaliVar(0,'on')){ boyaliCiz(0,'on',1-gunEvresi(d,BOL[b].gunEtki).gunGuc,d); return; }

  if(b>=2){                                 // savrulan iplikler (bulutlar ve ötesi)
    X.strokeStyle=BOL[b].on; X.globalAlpha=.55; X.lineWidth=2.5; X.lineCap='round';
    const yonu=ruz>=0?1:-1;
    for(let x=sol;x<=sag;x+=adim*2.5){
      const i=Math.round(x/adim)+7;
      if(nz(i*5.1)<.4) continue;
      const a=ekrK(x,ON_TABAN+.5+nz(i)*1.1,k);
      const boy=(20+nz(i*2)*46)*(.45+.75*siddet);
      X.beginPath(); X.moveTo(a.sx,a.sy);
      X.lineTo(a.sx+yonu*boy,a.sy+7+nz(i*3)*12); X.stroke();
    }
    X.globalAlpha=1; return;
  }

  X.globalAlpha=.94;
  const egim=kis(ruz*.15,-.62,.62);
  for(let x=sol;x<=sag;x+=adim){             // ot tutamları — %55'i çiziliyor
    const i=Math.round(x/adim)+21;
    if(nz(i*5.1)<.45) continue;
    for(let j=0;j<3;j++){
      const n=nz(i*7+j*13);
      // Yatma boyla çarpılıyor: uzun ot daha çok eğiliyor, dipten değil
      // uçtan bükülüyor. Salınım rüzgâr şiddetiyle orantılı — durgun
      // havada ot kıpırdamıyor.
      const salin=Math.sin(d.t*2.1+i*.7+j)*.07*siddet;
      const h=.7+n*.8, e=(nz(i*2.4+j*5)-.5)*.55+(egim+salin)*h, kx=x+(j-1)*.16;
      const a=ekrK(kx-.1,ON_TABAN,k), t=ekrK(kx+e,ON_TABAN+h,k), c=ekrK(kx+.1,ON_TABAN,k);
      X.beginPath(); X.moveTo(a.sx,a.sy);
      X.quadraticCurveTo((a.sx+t.sx)/2-3,(a.sy+t.sy)/2,t.sx,t.sy);
      X.quadraticCurveTo((c.sx+t.sx)/2+3,(c.sy+t.sy)/2,c.sx,c.sy);
      X.closePath(); X.fill();
    }
  }
  X.globalAlpha=1;
}
