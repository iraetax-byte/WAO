// js/ui/track-intro.js
// Karaoke-style "Now playing" popup.

import { $ } from "../utils/dom.js";
import { playTrackIntro } from "../sfx.js";

let introEl = null;
let titleEl = null;
let timeoutId = null;

export function initTrackIntroUI() {
  introEl = $("#track-intro");
  titleEl = introEl ? introEl.querySelector(".track-intro-title") : null;
}

/**
 * Show "Now playing" for given track.
 * track = { title, artist }
 */
export function showTrackIntro(track) {
  if (!introEl || !titleEl) {
    initTrackIntroUI();
  }
  if (!introEl || !titleEl) return;

  const label = track.artist
    ? `${track.artist} – ${track.title}`
    : track.title;

  titleEl.textContent = label;

  introEl.classList.remove("hidden");
  introEl.classList.add("visible");

  playTrackIntro();

  if (timeoutId) clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    introEl.classList.remove("visible");
    introEl.classList.add("hidden");
  }, 3500);
}