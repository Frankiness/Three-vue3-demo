import TWEEN from '@tweenjs/tween.js';

export function setTweens(start, end, duration = 1500) {
  let tween = new TWEEN.Tween(start).to(end, duration).easing(TWEEN.Easing.Quadratic.InOut);
  tween.onUpdate();
  tween.start();
}
