// Sonsuz modda parkur parçaları: salıncaklar arasına ara sıra bir "ritim
// grubu" (Smith ve ark., Launchpad; Spelunky'nin parça şablonları — §12.1).
// Tamamen rastgele blok değil: dört şablon, sırayla açılıyor, her ölçüsü
// FİZİKTEN hesaplanıyor (bölgenin yerçekimi, koşu hızı, rüzgâr payı) —
// yörüngede aynı zıplama parktakinin ~1.6 katı uzağa gidiyor, elle
// dizilmiş sabit ölçüler orada tutmazdı.
//
//   tek      : salıncak → blok → salıncak
//   ikili    : salıncak → blok · boşluk · blok → salıncak
//   tribun   : salıncak → blok → basamaklar → salıncak
//   trambolin: salıncak → blok → basamaklar → trambolin → blok → salıncak
//
// Tek kural her yerde: KENARDA DOKUN. Her geçiş, kenardan (taban hızda) ve
// biraz erkenden ya da hızlı (inişten taşınan hız) zıplayanı da tutacak
// genişlikte. Deneme parkurunda (§12.3) ölçülen iki hata burada kuralla
// önleniyor: trambolin zıplayışa göre yerleşiyor (dibe değil), sekmenin
// ardından hem normal hem süper sekmeyi tutan geniş bir blok geliyor.
//
// Üretim salincakUret'in r() akışından — aynı tohum aynı parçalar (§0).
// Dünya üretimini değiştirdiği için FIZIK_SURUM 3 (hayalet kayıtları).
import { BOL, bolgeNo } from './tanimlar.js';
import { AYAK, KOSU_HIZ, KOSU_AZAMI, ZIPLA, SEKME_VX } from './engel.js';

const VX_HIZLI = KOSU_AZAMI;       // salıncaktan hızlı inip hemen zıplayan
const TRAMB_UST = .75;
const BASAMAK_Y = .45, BASAMAK_EN = 1.2;

// Uçuşu fizik.js'teki AYNI formülle adım adım yürüt (sürtünme + rüzgâr
// ivmesi) ve gövde ortası `hedef` yüksekliğine İNERKEN nerede olduğunu dön.
// İlk sürüm sabit yatay hız varsayıyordu (vx·t): yerçekimi düşükken uçuş
// uzuyor ve sürtünme yatay hızın ~%30'unu yiyor — yörüngede tepeden
// zıplayan tramboline 30 cm yetişemedi.
function ucus(x, y, vx, vy, g, hedef, ivme){
  const dt = 1/120;
  for(let n=0; n<2400; n++){
    const su = .016*Math.hypot(vx, vy);
    vx += (ivme - vx*su)*dt; vy += (-g - vy*su)*dt;
    x += vx*dt; y += vy*dt;
    if(vy < 0 && y <= hedef) return { x, vx, vy };
  }
  return null;
}

// Bir geçişin iniş aralığı: verilen hızların ve rüzgâr uçlarının hepsinde
// en yakın ve en uzak iniş (x, kalkış noktasına göre). Rüzgâr bu dünyanın
// rüzgârı: ruzg = ruzgar·(.75+.25·sin)·bölge — sinüs yüzünden .5-1 kat.
// Karakter çarpanı (hayalet ×2.3) katılmıyor: dünya karakterden bağımsız
// olmalı (günün turu herkes için aynı); savrulmak hayaletin bedeli (§7).
function aralik(y0, vy, hedef, g, vxler, ivmeler){
  let az = Infinity, cok = -Infinity, son = null;
  for(const vx of vxler) for(const iv of ivmeler){
    const u = ucus(0, y0, vx, vy, g, hedef, iv);
    if(!u) return null;
    az = Math.min(az, u.x); cok = Math.max(cok, u.x); son = u;
  }
  return { az, cok, son };
}

// Hangi şablonlar açık: önce basit olanlar (tanıt → geliştir → bük).
function sablonlar(i){
  if(i < 5)  return ['tek', 'ikili'];
  if(i < 8)  return ['tek', 'ikili', 'tribun'];
  return ['ikili', 'tribun', 'trambolin', 'trambolin'];
}

// Bu boşluğa parça girsin mi. Parkta ilk iki salıncak saf salınım (oyunun
// kendisi önce), iki parça arka arkaya gelmiyor.
export function parcaMi(d, i, onceki, r){
  if(d.ogretici || !onceki || i < 2 || onceki.parca) return false;
  return r() < (i < 6 ? .45 : .3);
}

// onceki: parçadan önceki salıncak. Salıncak B'nin yüksekliği ve ip boyu
// (py, Lu) zaten çekilmiş; dönüş: engeller, B'nin x'i, bloklardaki paralar.
export function parcaUret(d, i, onceki, py, Lu, r){
  // Fizik ÖNCEKİ salıncağın (A) bölgesinden: parça boyunca d.i = i−1 ve
  // fizik.yer/ruzg bölgeyi d.i'den alıyor. İlk sürüm B'ninkini kullandı —
  // bulutlar→yörünge sınırında g'yi 8.8 yerine 6.2 sanıp atlayışları ~%40
  // uzun hesapladı; ölümlerin çoğu tam o sınırdaydı.
  const bn = bolgeNo(i-1), B = BOL[bn], g = B.g;
  const taban = d.ruzgar*B.ruz*.35;                 // bu dünyanın rüzgâr ivmesi
  const ivmeler = [taban*.5, taban];
  let tur = sablonlar(i)[Math.floor(r()*sablonlar(i).length)];
  const engel = [], para = [];
  const blok = (x0, x1, ust)=>{ const e={ tip:'blok', x0, x1, ust, alt:0, bol:bn }; engel.push(e); return e; };
  const zip = (h0, h1, vxler)=> aralik(h0+AYAK, ZIPLA, h1+AYAK, g, vxler, ivmeler);

  // 1) İlk blok: salıncaktan iniş. Sarkaçtan fırlatma menzili g'den bağımsız
  //    (§6), yani bu ölçü bölgeyle değişmiyor; ~1.3 rad'lık atlayış yetiyor.
  const h1 = 1.3 + r()*.6;
  const x0 = onceki.x + 4.4 + r()*.7;
  let son = blok(x0, x0 + 6.5 + r()*2.5, h1);
  // koşu ödülü: blok üstünde bir sıra para (ayak hizasında toplanıyor)
  for(let k=0;k<3;k++) para.push({ x: x0 + 1.6 + k*1.1, y: h1 + .35, alindi:false });

  if(tur === 'ikili'){
    const h2 = Math.min(2.6, Math.max(1.0, h1 + r() - .5));
    const a = zip(h1, h2, [KOSU_HIZ, VX_HIZLI]);
    const bos = a.az*.45;                                  // erken zıplayan da iner
    son = blok(son.x1 + bos, son.x1 + Math.max(bos + 4.5, a.cok + .15 + .8), h2);
  }

  if(tur === 'tribun' || tur === 'trambolin'){
    const n = 2 + Math.floor(r()*2);
    let x = son.x1, h = son.ust;
    for(let k=0;k<n;k++){ h += BASAMAK_Y; son = blok(x, x + BASAMAK_EN, h); x += BASAMAK_EN; }
    son.x1 = son.x0 + 2.6;                                 // tepe biraz geniş
  }

  if(tur === 'trambolin'){
    // Zıplayışa göre: tepe bloğun her yerinden (taban hız) ve kenardan biraz
    // hızlı zıplayan tramboline insin; rüzgârın iki ucunda da. Zıplamadan
    // düşen önüne düşer — kural "kenarda dokun".
    const hT = son.ust, a = zip(hT, TRAMB_UST, [KOSU_HIZ, KOSU_HIZ*1.12]);
    const t0 = son.x0 + .2 + a.az - .15;
    const t1 = Math.min(t0 + 5.5, son.x1 + .2 + a.cok + .15);
    engel.push({ tip:'trambolin', x0:t0, x1:t1, ust:TRAMB_UST, bol:bn });
    // Sekme (engel.js ile aynı): düşme hızı çevriliyor, yatay en az SEKME_VX.
    // Normal ve süper sekmenin ikisi de, trambolinin her noktasından, sonraki
    // bloğa insin; kısa kalan trambolinin üstüne düşüp yeniden seker.
    // Kısa uç: en düşük sekme (7.5, engel.js SEKME_EN_AZ) ve en yavaş yatay
    // hız. İlk sürüm buna gerçek düşüşten hesaplanan (daha yüksek) sekmeyi
    // koymuştu — yörüngede 7.5 ile seken, sonraki bloğun yanına çarptı.
    const vyc = Math.abs(a.son.vy), vx = Math.max(a.son.vx, SEKME_VX);
    const vb = Math.max(.92*vyc, 7.5), hC = 1.6 + r()*.6;
    const n = aralik(TRAMB_UST+AYAK, 7.5, hC+AYAK, g, [SEKME_VX], ivmeler);
    const sp = aralik(TRAMB_UST+AYAK, vb*1.22, hC+AYAK, g, [SEKME_VX, Math.max(vx, KOSU_HIZ)], ivmeler);
    const c0 = Math.max(t1 + .3, t0 + n.az - .5);
    son = blok(c0, Math.max(c0 + 5, t1 + sp.cok + 1), hC);
  }

  // 2) Sonraki salıncak: son bloğun kenarından (.5 m önce, taban hız,
  //    ortalama rüzgâr) zıplayan inerken oturağın hizasından geçsin —
  //    uzanmayla pencere genişliyor (deneme parkurunda ~1.75 m).
  const u = ucus(son.x1 - .5, son.ust + AYAK, KOSU_HIZ, ZIPLA, g, py - Lu + .15, taban*.75);
  return { engel, para, x: u ? u.x : son.x1 + 5.5 };
}
