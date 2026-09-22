// Canvas ve boyutlandırma. W/H canlı bağlantı olarak dışa veriliyor:
// içe aktaran modüller güncel değeri okur, ama yazamaz.

export const K = document.getElementById('c');
export const X = K.getContext('2d');

export let W=0, H=0;

export const sakin = matchMedia('(prefers-reduced-motion: reduce)').matches;

export function boyutla(){
  const d = Math.min(devicePixelRatio||1, 2);
  W = innerWidth; H = innerHeight;
  K.width = W*d; K.height = H*d;
  X.setTransform(d,0,0,d,0,0);
}

addEventListener('resize', boyutla);
boyutla();
