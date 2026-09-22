import { X, W, H } from '../cekirdek/tuval.js';
import { ekr, kamX } from '../cekirdek/kamera.js';
import { kis, renkKar } from '../cekirdek/matematik.js';
import { BOL } from '../oyun/tanimlar.js';
import { gokRenkleri, gunEvresi } from './zaman.js';

// karisim: b1'den b2'ye geçiş oranı (0..1). Bölge sınırında yumuşak geçiş.
export function gok(d,karisim,b1,b2){
  const renk1=gokRenkleri(d,b1), renk2=gokRenkleri(d,b2);
  const g=X.createLinearGradient(0,0,0,H);
  for(let i=0;i<3;i++) g.addColorStop(i*.5, renkKar(renk1[i], renk2[i], karisim));
  X.fillStyle=g; X.fillRect(0,0,W,H);

  // Yıldız/ay/güneş hepsi tek bir gunGuc'a bakıyor — bölge derinliği
  // (Math.max(b1,b2)) zaten yıldız yoğunluğu için kullanılan ölçüt, aynı
  // yanlılığı burada da sürdürüyoruz.
  const bDerin = Math.max(b1,b2);
  const { gunGuc } = gunEvresi(d, BOL[bDerin].gunEtki);

  // yıldızlar: bulutlar bölgesinden itibaren, gündüz söner
  const a=kis((bDerin-1)/2,0,1)*.85*(1-gunGuc);
  if(a>0){
    X.fillStyle='#E9E5F2';
    for(let i=0;i<70;i++){
      const sx=(i*137.5+kamX*3)%W, sy=(i*79.3)%(H*.62);
      X.globalAlpha=a*(.35+.65*Math.abs(Math.sin(d.t*.6+i)));
      X.fillRect(sx,sy, i%7?1:2, i%7?1:2);
    }
    X.globalAlpha=1;
  }

  // Gök cismi oyuncunun 7.5 m ÖNÜNDE ve 6.4 m yukarıda. İlk sürüm (kamX−9, 16)
  // koyuyordu: ODAK=.34 ile ekranın solunda yalnız ~6.5 m var, yukarıda da
  // en fazla ~7.5-11 m (H/PM ≥ 9.6, üstü .78'i) — ay ve güneş hiçbir
  // ekranda hiç görünmemişti. İleride olması tesadüf değil: gidilen yönü
  // işaret ediyor.
  const gokcisim = ekr(kamX+7.5,6.4);

  // ay: hilal, ikinci daireyi keserek — gece ağırlıklı
  const ayA=(1-gunGuc)*.8;
  if(ayA>.01){
    X.fillStyle='#F4EFD8'; X.globalAlpha=ayA;
    X.beginPath(); X.arc(gokcisim.sx,gokcisim.sy,15,0,6.3); X.fill();
    X.globalCompositeOperation='destination-out';
    X.beginPath(); X.arc(gokcisim.sx-8,gokcisim.sy-5,13,0,6.3); X.fill();
    X.globalCompositeOperation='source-over'; X.globalAlpha=1;
  }

  // güneş: yumuşak halo + disk — gündüz ağırlıklı, ayla aynı konumda
  // çapraz solduruluyor (biri sönerken öbürü tam o an beliriyor)
  const gunA=gunGuc*.85;
  if(gunA>.01){
    X.globalCompositeOperation='lighter';
    const hg=X.createRadialGradient(gokcisim.sx,gokcisim.sy,0,gokcisim.sx,gokcisim.sy,44);
    hg.addColorStop(0,'rgba(255,224,168,'+(gunA*.55)+')');
    hg.addColorStop(1,'rgba(255,224,168,0)');
    X.fillStyle=hg; X.beginPath(); X.arc(gokcisim.sx,gokcisim.sy,44,0,6.3); X.fill();
    X.globalCompositeOperation='source-over';
    X.fillStyle='rgba(255,238,208,'+gunA+')';
    X.beginPath(); X.arc(gokcisim.sx,gokcisim.sy,14,0,6.3); X.fill();
  }
}
