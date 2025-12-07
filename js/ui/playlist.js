// js/ui/playlist.js
// Playlist modal + custom file loader for WÃO JOÃO

import { $, el } from "../utils/dom.js";
import { PLAYLIST } from "../config/playlist.js";

let backdropEl = null;
let listEl = null;
let closeBtn = null;
let fileInputEl = null;

let onSelectTrackCb = null;
let isOpen = false;

/**
 * Initialize playlist UI.
 * @param {Object} opts
 * @param {Function} opts.onSelectTrack - callback(track)
 */
export function initPlaylistUI({ onSelectTrack } = {}) {
  onSelectTrackCb = onSelectTrack;

  backdropEl = $("#track-selector-backdrop");
  listEl = $("#track-list");
  closeBtn = $("#track-selector-close");
  fileInputEl = $("#custom-track-input");

  if (!backdropEl || !listEl) return;

  buildTrackList();

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      closeTrackSelector();
    });
  }

  if (backdropEl) {
    backdropEl.addEventListener("click", (ev) => {
      if (ev.target === backdropEl) {
        closeTrackSelector();
      }
    });
  }

  if (fileInputEl) {
    fileInputEl.addEventListener("change", handleCustomFile);
  }
}

/**
 * Build list: all playlist tracks + "Load from file…".
 */
function buildTrackList() {
  listEl.innerHTML = "";

  PLAYLIST.forEach((track) => {
    const item = el("li", "track-item");
    item.innerHTML = `
      <button type="button" class="track-item-btn">
        <span class="track-item-title">${track.title}</span>
        <span class="track-item-meta">${track.artist || ""}</span>
      </button>
    `;
    item.querySelector("button").addEventListener("click", () => {
      selectTrack(track);
    });
    listEl.appendChild(item);
  });

  // Custom file option
  const customItem = el("li", "track-item track-item-custom");
  customItem.innerHTML = `
    <button type="button" class="track-item-btn">
      <span class="track-item-title">Load from file…</span>
      <span class="track-item-meta">Choose an audio file on this device</span>
    </button>
  `;
  customItem.querySelector("button").addEventListener("click", () => {
    if (fileInputEl) {
      fileInputEl.value = "";
      fileInputEl.click();
    }
  });
  listEl.appendChild(customItem);
}

export function openTrackSelector() {
  if (!backdropEl) return;
  backdropEl.classList.add("visible");
  backdropEl.classList.remove("hidden");
  isOpen = true;
}

function closeTrackSelector() {
  if (!backdropEl) return;
  backdropEl.classList.remove("visible");
  backdropEl.classList.add("hidden");
  isOpen = false;
}

function selectTrack(track) {
  if (onSelectTrackCb) {
    onSelectTrackCb(track);
  }
  closeTrackSelector();
}

/**
 * Handle custom file selection.
 */
function handleCustomFile(ev) {
  const file = ev.target.files && ev.target.files[0];
  if (!file) return;

  const objectUrl = URL.createObjectURL(file);

  const customTrack = {
    id: `custom-${Date.now()}`,
    title: file.name.replace(/\.[^/.]+$/, ""),
    artist: "Local file",
    bpm: null,
    file: objectUrl
  };

  if (onSelectTrackCb) {
    onSelectTrackCb(customTrack);
  }
  closeTrackSelector();
}