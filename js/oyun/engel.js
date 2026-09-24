// Parkur engelleri: blok (üstünde koşulur) ve trambolin (seker). Salıncak
// dışındaki her şey burada; fizik.js yalnız çağırıyor. Bkz. CLAUDE.md §12.
//
// Engel verisi d.engel dizisinde, x'e göre sıralı:
//   { tip:'blok',      x0, x1, ust, alt }   alt=0 → yerden yükselen sütun
//   { tip:'trambolin', x0, x1, ust }        bacakları yere ya da bloğa basar
// Sonsuz modda dizi boş — o yüzden normal oyunun fiziği hiç değişmedi ve
// hayalet kayıtları (FIZIK_SURUM) geçerli kaldı.
//
// Konum kuralı: koşarken d.py AYAK tabanı (bloğun üstü), uçarken GÖVDE
// ortası (salıncaktan fırlayınca olduğu gibi). Geçişte AYAK kadar kaydırılıyor;
// karakter 'ayakta' pozunda ayaktan, 'ucus' pozunda ortadan çiziliyor, yani
// ekranda sıçrama yok.

// --- ayarlar ---------------------------------------------------------
// Koşu Canabalt ve Super Mario Run gibi OTOMATİK: oyunun tek dokunuşlu
// kontrolü korunuyor, telefonda sanal yön tuşu yok. Hız bir KAYNAK: bloğa
// yüksek hızla inen o hızı taşıyor, sonra yavaşça taban hıza iniyor —
// iyi sallanmanın ödülü blokta da sürüyor.
export const AYAK = .55;          // gövde ortası ile ayak tabanı arası (m)
const KOSU_HIZ = 4.4;             // taban koşu hızı (m/s) — 5.0 oyuncuya "bir tık hızlı" geldi
const KOSU_AZAMI = 8.5;           // inişte taşınabilecek en yüksek hız
const KOSU_ASAGI = .9;            // fazla hızın sönümü (1/s)
const ZIPLA = 6.3;                // zıplama dikey hızı: parkta ~2 m yükselir
const EN = .18;                   // gövde yarı genişliği (çarpışma)

// Affetme payları (Celeste, Super Mario Run). Görünmezler ama hissedilirler:
// telefonda parmak ekrandan ~1 kare geç okunur, kenardan "geç" basan
// oyuncunun basışı ona göre bloğun ÜSTÜNDE olmuştu.
const COYOTE = .11;               // kenardan düştükten sonra zıplama hâlâ geçerli
const TAMPON = .13;               // inmeden hemen önce basış: inince zıpla
const BASAMAK = .5;               // bu yüksekliğe kadar basamak kendiliğinden çıkılır
const KENAR_POP = .38;            // bloğun üst kenarına bu kadar kısa kalan tırmanır

// Trambolin: düşme hızını çeviriyor. Değme anında (± pencere) dokunursan
// "süper sekme": vuruşu zamanlamak ayrı bir beceri, tek dokunuşla.
const SEKME = .92;                // geri verilen hız oranı
const SEKME_EN_AZ = 7.5;          // yavaş düşse bile en az bu kadar fırlatır
const SUPER = 1.22;               // zamanlı dokunuşun çarpanı
const SUPER_SONRA = .10;          // değdikten sonra da bu kadar süre geçerli

const blokMu = e => e.tip==='blok';

// x'te ayak altındaki en yüksek blok üstü (yukarıdan en fazla `tavan`a kadar).
function ayakAlti(d, x, tavan){
  let en=null;
  for(const e of d.engel){
    if(e.x0 > x+EN) break;
    if(!blokMu(e) || e.x1 < x-EN || e.ust > tavan) continue;
    if(!en || e.ust > en.ust) en=e;
  }
  return en;
}

function inis(d, e){
  d.faz='kosu'; d.py=e.ust; d.vy=0; d.don=0; d.uzanma=0;
  d.vx=Math.min(KOSU_AZAMI, Math.max(KOSU_HIZ*.6, d.vx));
  d.kenarT=-9; d.sebep=''; d.atlamaYorgun=0;
  d.kontrol=e;                      // parkurda düşersen buradan devam
  d.inisT=d.t;
  if(d.t-(d.tamponT??-9) < TAMPON){ d.tamponT=-9; zipla(d); }
}

function zipla(d){
  d.faz='ucus'; d.py+=AYAK; d.vy=ZIPLA; d.vx=Math.max(d.vx, KOSU_HIZ*.8);
  d.don=0; d.uzanma=0; d.kenarT=-9; d.ucusT=d.t; d.kaynak='blok';
}

// Koşu adımı. Hız taban hıza yaklaşıyor, basamaklar kendiliğinden,
// duvar durduruyor, kenardan boşluğa çıkınca uçuşa geçiliyor.
export function kosuAdim(d, dt){
  d.vx += (KOSU_HIZ - d.vx) * Math.min(1, dt*(d.vx>KOSU_HIZ ? KOSU_ASAGI : 3));
  const x0=d.px, x1=d.px+d.vx*dt;
  // duvar: önündeki blok basamaktan yüksekse
  for(const e of d.engel){
    if(e.x0 > x1+EN) break;
    if(blokMu(e) && e.x0 >= x0+EN-1e-6 && e.x0 <= x1+EN && e.ust > d.py+BASAMAK && e.alt < d.py+1.2){
      d.px=e.x0-EN; d.vx=0; return;
    }
  }
  d.px=x1;
  const z=ayakAlti(d, d.px, d.py+BASAMAK);
  if(z && z.ust >= d.py-BASAMAK){ d.py=z.ust; d.kontrol=z; }
  else { d.faz='ucus'; d.py+=AYAK; d.vy=0; d.kenarT=d.t; d.ucusT=d.t; d.kaynak='blok'; }
  d.mesafe=Math.max(d.mesafe, d.px);
}

// Uçuş/düşüşte engellerle temas. Konum zaten ilerletildi; (ex, ey) önceki
// gövde ortası. Bir şeye değdiyse true.
export function ucusEngel(d, ex, ey){
  const ayak=d.py-AYAK, eAyak=ey-AYAK;
  for(const e of d.engel){
    if(e.x0 > d.px+EN+1) break;
    if(e.x1 < d.px-EN-1) continue;
    const icinde = d.px > e.x0-EN && d.px < e.x1+EN;
    if(e.tip==='trambolin'){
      if(icinde && d.vy<0 && eAyak>=e.ust && ayak<=e.ust){
        let v=Math.max(-d.vy*SEKME, SEKME_EN_AZ);
        const zamanli = d.t-(d.tamponT??-9) < TAMPON;
        if(zamanli){ v*=SUPER; d.tamponT=-9; }
        d.vy=v; d.py=e.ust+AYAK; d.sekT=d.t; d.sekE=e; d.sekSuper=zamanli;
        d.faz='ucus'; d.don=0; d.ucusT=d.t; d.kaynak='trambolin'; d.sebep='';
        return true;
      }
      continue;
    }
    // Gövde kutusu (ayaktan başa ~2·AYAK) blokla kesişiyor mu?
    if(!icinde || ayak >= e.ust || d.py+AYAK <= e.alt) continue;
    // Nereden geldiğine göre, sırayla:
    // 1) üstten iniş
    if(eAyak >= e.ust-1e-6 && d.vy<=0){ inis(d,e); return true; }
    // 2) üst kenara az kalmış: tırman (corner correction) — kısa kalan
    //    atlayış duvara çarpıp düşmesin, kenara tutunup çıksın
    if(e.ust-ayak <= KENAR_POP && d.vx>0){ inis(d,e); return true; }
    // 3) yandan çarpma: dur, düşmeye devam
    if(ex+EN <= e.x0+1e-6){ d.px=e.x0-EN; d.vx=Math.min(0,d.vx); d.uzanma=0; return true; }
    if(ex-EN >= e.x1-1e-6){ d.px=e.x1+EN; d.vx=Math.max(0,d.vx); return true; }
    // 4) alttan kafa
    if(ey+AYAK <= e.alt+1e-6){ d.py=e.alt-AYAK; d.vy=Math.min(0,d.vy); return true; }
    // 5) içeride kalmış (bir adımda derin girdi): üste çıkar
    inis(d,e); return true;
  }
  return false;
}

// Dokunuş: koşarken zıpla; kenardan yeni düştüysen (coyote) yine zıpla;
// trambolinden yeni sektiysen süper sekme. Hiçbiri değilse inince zıplamak
// için hatırla (tampon) ve false dön — uçuştaki uzanma fizik.js'te.
export function engelDokun(d){
  if(d.faz==='kosu'){ zipla(d); return true; }
  if(d.faz!=='ucus') return false;
  if(d.t-(d.kenarT??-9) < COYOTE){ d.py-=AYAK; zipla(d); return true; }
  if(d.t-(d.sekT??-9) < SUPER_SONRA && !d.sekSuper){ d.vy*=SUPER; d.sekSuper=true; return true; }
  d.tamponT=d.t;
  // İnişe/sekmeye hazırlanan dokunuş uzanma DEĞİL: altında yakın bir yüzey
  // varken uzanma pozu ve yakalama çemberi yalnız gürültü (ilk denemede
  // trambolinin tam üstünde kol açıp çember çiziyordu).
  return d.vy<0 && yuzeyYakin(d);
}

const YAKIN = 1.3;       // m — bu kadar yukarıdaki düşüşte dokunuş = tampon
function yuzeyYakin(d){
  const ayak=d.py-AYAK;
  for(const e of d.engel){
    if(e.x0 > d.px+1) break;
    if(e.x1 < d.px-1) continue;
    if(ayak>=e.ust && ayak-e.ust < YAKIN) return true;
  }
  return false;
}

// Noktalı "şimdi atlarsan" yolu bir engele değince orada bitsin.
export function yolEngel(d, x, y, ex, ey){
  for(const e of d.engel){
    if(e.x0 > x+EN) break;
    if(x < e.x0-EN || x > e.x1+EN) continue;
    const ust=e.ust+AYAK;
    if(ey>=ust && y<=ust) return true;
    if(blokMu(e) && y<ust && y>e.alt) return true;
  }
  return false;
}
