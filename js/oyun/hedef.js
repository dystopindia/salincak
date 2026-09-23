import { kayit, sakla, kazan } from '../cekirdek/kayit.js';
import { hayalet } from './hayalet.js';
import { jokerSesi } from '../cekirdek/ses.js';

// Ustalık hedefleri: beceriye YÖN veriyorlar ("şunu dene") ve kilitli uçuş
// izlerini açıyorlar.
//
// Her hedef, tur durumunun SAF bir yüklemi. Olayın kendisi (kaç salıncak
// atlandı, uzanıldı mı, çubuk ne kadar doluydu) fizik.yakala'da tur
// istatistiği olarak tutuluyor; burada yalnız o sayılara bakılıyor. Ayrı
// sayaç, olay dinleyicisi yok — öğreticideki ogreticiAdim ile aynı fikir.
//
// Kurallar:
// - JOKERLİ turda hedef sayılmıyor. "Zinciri kırmızıya sokmadan 15 salıncak"
//   Sağlam zincir jokeriyle bedava olurdu; mıknatıs para hedefini, can
//   ölümü siler. Bitiş ekranının "skor saf değil" kuralı ve hayaletin
//   jokersiz kaydı (§10) ile aynı dürüstlük.
// - Öğreticide ve hayalet dünyasında hiç çalışmıyor.
// - Ödül para: kalıcı bir güç değil (jokerler gibi, §7.5). Üç hedef ayrıca
//   bir uçuş izi açıyor — yalnız görünüm, fiziğe dokunmuyor.
// - HEDEF ULAŞILABİLİR OLMALI. Önerilen "tek atlayışta 3 salıncak" (iki
//   salıncak atlamak) ölçüldü ve fiziksel olarak İMKÂNSIZ: 40 tohumda en
//   kısa üç boşluk 17.7 m, tepeden düşme sınırında (2.94 rad) menzil
//   10.4 m + uzanma yarıçapı 1.8 m = 12.2 m. Bir salıncak atlamak ise
//   (en kısa 11.2 m) yalnız o sınırın dibinde mümkün — tam bir ustalık işi.
//   Yeni bir hedef eklerken önce ölç.

export const HEDEF = [
  { id:'orman',   ad:'Ormana ulaş',                                  odul:30,  kosul:d=>d.i>=4 },
  { id:'uzan3',   ad:'Bir turda 3 kez uzanarak yakala',              odul:30,  kosul:d=>d.uzanmaSayisi>=3 },
  { id:'seri3',   ad:'×3 seri yap',                                  odul:40,  kosul:d=>d.enSeri>=3 },
  { id:'para40',  ad:'Bir turda 40 ◆ kazan',                         odul:50,  kosul:d=>d.para>=40 },
  { id:'bulut',   ad:'Bulutlara ulaş',                               odul:60,  kosul:d=>d.i>=9 },
  { id:'irtifa',  ad:'İrtifadan tek seferde 9 ◆ al',                 odul:60,  kosul:d=>d.enIrtifa>=9 },
  { id:'temkin',  ad:'15 salıncak üst üste zinciri kırmızıya sokma', odul:80,  kosul:d=>d.enTemkin>=15 },
  { id:'seri5',   ad:'×5 seri yap',                                  odul:100, kosul:d=>d.enSeri>=5 },
  { id:'ikili',   ad:'Bir salıncağı atlayıp öbürüne tutun',          odul:120, kosul:d=>d.enAtlanan>=1 },
  { id:'yorunge', ad:'Yörüngeye ulaş',                               odul:120, kosul:d=>d.i>=15 },
  { id:'seri8',   ad:'×8 seri yap',                                  odul:150, kosul:d=>d.enSeri>=8 },
  { id:'buz',     ad:'Buz kuşağına ulaş',                            odul:200, kosul:d=>d.i>=22 },
  // Tur sonunda bakılanlar: hayaleti geçmek ancak turun sonunda belli,
  // gün serisi de bitişte (gunSonuc) ilerliyor.
  { id:'hayalet', ad:'Kendi hayaletini geç',                         odul:80,  bitis:true,
    kosul:d=>!!hayalet() && !!d.yeniHayalet },
  { id:'gun3',    ad:'Günün turunu 3 gün üst üste oyna',             odul:100, bitis:true,
    kosul:()=>kayit.gunluk.seri>=3 },
];

// Uçuş izleri: ilki hep açık, diğerlerini bir hedef açıyor. Eşleşmeler
// tema: alev ↔ seri sayacının alevi, kuyruklu yıldız ↔ yüksek uçuş,
// yıldız tozu ↔ uzay.
export const IZLER = [
  { id:'yok',    ad:'İz yok',          hedef:null },
  { id:'alev',   ad:'Alev',            hedef:'seri5' },
  { id:'kuyruk', ad:'Kuyruklu yıldız', hedef:'irtifa' },
  { id:'toz',    ad:'Yıldız tozu',     hedef:'yorunge' },
];

export const hedefTamam = id => kayit.hedef[id]===true;
export const hedefSayisi = () => HEDEF.filter(h=>hedefTamam(h.id)).length;
export const izAcik = z => !z.hedef || hedefTamam(z.hedef);

// Seçili iz açık değilse (elle düzenlenmiş kayıt, kaldırılmış bir iz)
// hiçbir şey çizilmesin — ciz/iz.js bunu soruyor.
export function seciliIz(){
  const z = IZLER.find(z=>z.id===kayit.iz);
  return z && izAcik(z) ? z.id : 'yok';
}
export function izSec(id){
  const z = IZLER.find(z=>z.id===id);
  if(!z || !izAcik(z)) return false;
  kayit.iz = id; sakla(); return true;
}

const gecerli = d => d && !d.ogretici && !d.hayaletMi && !d.jokerKullanildi;

function odullendir(d, h){
  kayit.hedef[h.id] = true;
  kazan(h.odul);                       // bankaya doğrudan; kazan() saklıyor
  const iz = IZLER.find(z=>z.hedef===h.id);
  d.yeniHedefler.push({ ad:h.ad, odul:h.odul, iz: iz ? iz.ad : null });
  jokerSesi();                         // "olumlu" ton — ses oyun/ katmanından (§6.10)
}

// Her karede, yalnız oyun sürerken (main.js). Tamamlanmışlar atlanıyor.
export function hedefAdim(d){
  if(!gecerli(d)) return;
  for(const h of HEDEF) if(!h.bitis && !hedefTamam(h.id) && h.kosul(d)) odullendir(d,h);
}

// Tur bitti: bitiş hedefleri + ölüm karesinde tamamlanmış olabilecekler
// (bitir() fizik adımının içinden çağrılıyor, o karenin hedefAdim'i hiç
// çalışmıyor — hal zaten 'son').
export function hedefBitis(d){
  if(!gecerli(d)) return;
  for(const h of HEDEF) if(!hedefTamam(h.id) && h.kosul(d)) odullendir(d,h);
}
