// js/utils/animator.js
// RequestAnimationFrame-based animation helper.

import { Easing } from "./easing.js";

export function animate({
  from = 0,
  to = 1,
  duration = 600,
  easing = Easing.easeInOutQuad,
  onUpdate = () => {},
  onComplete = () => {}
}) {
  const start = performance.now();

  function frame(now) {
    const elapsed = now - start;
    const t = Math.min(1, elapsed / duration);
    const eased = easing(t);

    onUpdate(from + (to - from) * eased);

    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      onComplete();
    }
  }

  requestAnimationFrame(frame);
}

/**
 * Looping drift animation — used for João and the floating panel.
 */
export function driftAnimation({
  element,
  amount = 4,
  duration = 4000
}) {
  let direction = 1;

  function loop() {
    animate({
      from: -amount * direction,
      to: amount * direction,
      duration,
      easing: Easing.easeInOutQuad,
      onUpdate: (v) => {
        element.style.transform = `translateY(${v}px)`;
      },
      onComplete: () => {
        direction *= -1;
        loop();
      }
    });
  }

  loop();
}