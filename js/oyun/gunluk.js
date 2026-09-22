import { kayit, sakla } from '../cekirdek/kayit.js';

// Günün turu: tohum TARİHTEN türüyor, yani o gün oynayan herkes ve her
// cihaz aynı dünyayı görüyor. Deterministik üretici bunu zaten bedavaya
// veriyordu (§0) — tohum girişi oyuncuya kapatılmıştı ama makine duruyor.
//
// AYRI BİR MOD DEĞİL. Kurallar, karakterler, jokerler, skor: hepsi aynı.
// Değişen tek şey tohumun rastgele değil tarihten gelmesi — "tek bir mod
// olsun" kararı (§0) bu yüzden bozulmuyor: menüde ikinci bir başlatma
// düğmesi var, ikinci bir oyun yok.
//
// SUNUCU YOK, yani skor tablosu da yok: yarış hep kendinle. Bunu peşinen
// kabul ediyoruz — karşılığında hayalet (oyun/hayalet.js) gerçek bir rakip
// oluyor, çünkü sabit tohumda dünkü turun bugün de geçerli.
//
// Yerel tarih kullanılıyor, UTC değil: oyuncunun günü kendi saatiyle
// başlasın. UTC olsaydı gün Türkiye'de öğleden sonra değişirdi.

export function bugun(t = new Date()){
  const p = n => (n<10?'0':'')+n;
  return t.getFullYear()+'-'+p(t.getMonth()+1)+'-'+p(t.getDate());
}

export const gunTohumu = g => 'gun'+g.replace(/-/g,'');

const dun = () => bugun(new Date(Date.now()-86400000));

// Gün değiştiyse: bugünün en iyisi ve hayaleti sıfır. Seri (üst üste
// oynanan gün) ancak DÜN oynandıysa sürüyor. Menü her açıldığında ve tur
// başlarken çağrılıyor — ucuz, gün aynıysa hemen dönüyor.
export function gunTazele(){
  const g = bugun();
  if(kayit.gunluk.gun === g) return;
  kayit.gunluk.gun = g;
  kayit.gunluk.enIyi = 0;
  kayit.gunluk.hayalet = null;      // dünkü hayalet dünkü dünyanın
  if(kayit.gunluk.sonGun !== dun()) kayit.gunluk.seri = 0;
  sakla();
}

// Tur bittiğinde: seriyi ilerlet, bugünün en iyisini güncelle.
// Dönüş: bugünün rekoru kırıldı mı.
export function gunSonuc(skor){
  gunTazele();
  const G = kayit.gunluk;
  if(G.sonGun !== G.gun){ G.sonGun = G.gun; G.seri = (G.seri||0)+1; }
  const yeni = skor > G.enIyi;
  if(yeni) G.enIyi = skor;
  sakla();
  return yeni;
}
