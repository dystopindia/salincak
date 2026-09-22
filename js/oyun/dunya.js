import { rng, th32 } from '../cekirdek/matematik.js';
import { KAR, bolgeNo, LFARK } from './tanimlar.js';
import { paraUret } from './para.js';

// Salıncaklar tembel üretilir: oyuncu ilerledikçe listeye eklenir.
// Üretim yalnızca d.r'yi (tohumlu rng) kullanır, yani sıra deterministik.
export function salincakUret(d,i){
  const r=d.r;
  // Boşluk yerçekimiyle ÖLÇEKLENMİYOR. İlk sürüm √(9.81/g) ile çarpıyordu
  // ("düşük g'de menzil uzar" varsayımıyla) ama sarkaçtan fırlatmada menzil
  // g'den bağımsız: v² ∝ g, menzil ∝ v²/g. Sonuç yörüngede 11.8 m'lik,
  // ~2.9 rad (SLACK sınırı) isteyen, fiilen geçilemez bir ilk boşluktu.
  const acilim=Math.min(9.4, 5.0+i*.34+r()*1.4);
  const onceki=d.sal[i-1];
  const Lu=2.45+r()*.5;
  const x = onceki ? onceki.x+acilim : 0;
  const py = 4.4+r()*1.0;
  // Paralar bu salıncağa GİDEN boşlukta. Aynı r() akışından geliyorlar,
  // yani tohum aynıysa para dizilimi de aynı.
  const para = paraUret(r, onceki, x, py, Lu);
  return {
    para, x,
    py,
    Lu, Lk: Lu-LFARK, L: Lu,
    dayanim: 34-Math.min(4,i*.2)+r()*2,
    th: (r()*2-1)*.18, om:(r()*2-1)*.25,
    yorgun:0, poz:'cokuk', pompaT:-9, gen:.2,
    bol: bolgeNo(i), acilim
  };
}

export function salincakGerek(d,n){
  while(d.sal.length<=n) d.sal.push(salincakUret(d,d.sal.length));
}

export function kur(tohum,karIdx){
  const r=rng(th32(tohum)), k=KAR[karIdx];
  const d={ tohum, r, k, faz:'salinim', i:0, sal:[],
    skor:0, mesafe:0, enUzak:0, t:0, sars:0, ogret:0,
    para:0, jok:{}, canSayisi:0, jokerKullanildi:false, paraT:-9,
    ruzgar:(r()*2-1)*2.2, rfaz:r()*6.28,
    mesaj:'',mesajT:-9,mesajRenk:'#79D9AC', bolgeT:-9, sonBolge:-1,
    px:0,py:0,vx:0,vy:0,don:0, uzanma:0, seri:0, seriT:-9, enSeri:0, sebep:'' };
  salincakGerek(d,3);
  // İlk salıncak durgun başlamıyor. th=.18 ile tam genliğe ulaşmak 8-10
  // basış alıyordu ve ilk 25 saniye ölü zamandı. .62 ile 3-4 basış yetiyor;
  // pompalama dinamiği (LFARK/LHIZ) hiç değişmedi, yalnız başlangıç hali.
  d.sal[0].th=.62; d.sal[0].om=0; d.sal[0].gen=.62;
  return d;
}
