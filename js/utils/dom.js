// js/utils/dom.js
// DOM helpers: shortcuts + simple animations

export const $ = (selector, parent = document) =>
  parent.querySelector(selector);

export const $$ = (selector, parent = document) =>
  [...parent.querySelectorAll(selector)];

/**
 * Pequeño pulso de escala para el disco u otros elementos.
 */
export function pulse(el) {
  if (!el) return;
  el.classList.add("pulse-once");
  setTimeout(() => {
    el.classList.remove("pulse-once");
  }, 300);
}

/**
 * Crear elemento fácilmente.
 */
export function el(tag, className = "", html = "") {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (html) e.innerHTML = html;
  return e;
}