// @ts-check
// NAME: Random Library
// AUTHOR: david
// DESCRIPTION: Displays your saved albums & followed artists in a fast, shuffled, filterable grid.

const { React } = Spicetify;
const { useState, useEffect, useCallback, useMemo, useRef } = React;

if (typeof document !== "undefined" && !document.getElementById("random-library-keyframes")) {
  const styleEl = document.createElement("style");
  styleEl.id = "random-library-keyframes";
  styleEl.textContent = `
    @keyframes rl-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .rl-grid {
      display: grid !important;
      grid-template-columns: repeat(auto-fill, minmax(max(var(--grid-column-min-width, 170px), 140px), 1fr)) !important;
      gap: var(--grid-gap, 20px) !important;
    }

    @media (min-width: 2200px) {
      .rl-grid {
        grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)) !important;
        gap: 28px !important;
      }
    }
    @media (min-width: 1700px) and (max-width: 2199px) {
      .rl-grid {
        grid-template-columns: repeat(auto-fill, minmax(195px, 1fr)) !important;
        gap: 24px !important;
      }
    }
    @media (min-width: 1200px) and (max-width: 1699px) {
      .rl-grid {
        grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)) !important;
        gap: 20px !important;
      }
    }
    @media (min-width: 800px) and (max-width: 1199px) {
      .rl-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)) !important;
        gap: 16px !important;
      }
    }
    @media (max-width: 799px) {
      .rl-grid {
        grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)) !important;
        gap: 12px !important;
      }
    }

    /* High-Performance Card (Identical to Release List) */
    .rl-card {
      position: relative;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 8px;
      padding: 14px;
      transition: background 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
      display: flex;
      flex-direction: column;
      cursor: pointer;
      overflow: hidden;
      user-select: none;
    }
    .rl-card:hover {
      background: rgba(255, 255, 255, 0.09);
      border-color: rgba(255, 255, 255, 0.16);
      transform: translateY(-3px);
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.45);
    }

    .rl-card-artwork-wrapper {
      position: relative;
      width: 100%;
      padding-bottom: 100%;
      border-radius: 6px;
      overflow: hidden;
      margin-bottom: 12px;
      background: #181818;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
    }
    .rl-card-artwork {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.25s ease;
    }
    .rl-card:hover .rl-card-artwork {
      transform: scale(1.03);
    }

    .rl-card-avatar-wrapper {
      position: relative;
      width: 100%;
      padding-bottom: 100%;
      border-radius: 50%;
      overflow: hidden;
      margin-bottom: 12px;
      background: #181818;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
    }
    .rl-card-avatar-wrapper img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.25s ease;
    }
    .rl-card:hover .rl-card-avatar-wrapper img {
      transform: scale(1.03);
    }

    .rl-play-btn {
      position: absolute;
      right: 10px;
      bottom: 10px;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: #1ed760;
      color: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transform: translateY(8px);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 8px 18px rgba(0, 0, 0, 0.5);
      border: none;
      cursor: pointer;
      z-index: 5;
    }
    .rl-card:hover .rl-play-btn {
      opacity: 1;
      transform: translateY(0);
    }
    .rl-play-btn:hover {
      transform: scale(1.08) !important;
      background: #1fdf64 !important;
    }

    .rl-in-library-badge {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--spice-button, #1ed760);
      color: #121212;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
      z-index: 4;
    }

    /* Reactive Interactive Card & Control Elements */
    .rl-card-title {
      font-size: 14px;
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: #ffffff;
      cursor: pointer;
      width: fit-content;
      max-width: 100%;
      transition: text-decoration 0.12s ease;
    }
    .rl-card-title:hover {
      text-decoration: underline !important;
    }

    .rl-card-artist {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.7);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      cursor: pointer;
      display: inline-block;
      width: fit-content;
      max-width: 100%;
      transition: color 0.15s ease, text-decoration 0.15s ease;
    }
    .rl-card-artist:hover {
      color: #ffffff !important;
      text-decoration: underline !important;
    }

    .rl-edition-badge {
      transition: transform 0.15s ease, filter 0.15s ease, box-shadow 0.15s ease !important;
    }
    .rl-edition-badge:hover {
      transform: scale(1.08) !important;
      filter: brightness(1.25) !important;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5) !important;
    }

    .rl-edition-item {
      transition: background 0.12s ease, color 0.12s ease !important;
    }
    .rl-edition-item:hover {
      background: rgba(255, 255, 255, 0.18) !important;
      color: #ffffff !important;
    }

    .rl-filter-pill {
      transition: all 0.15s ease !important;
    }
    .rl-filter-pill:hover:not(.active) {
      background: rgba(255, 255, 255, 0.16) !important;
      border-color: rgba(255, 255, 255, 0.25) !important;
      color: #ffffff !important;
      transform: translateY(-1px);
    }

    .rl-mode-btn {
      transition: all 0.15s ease !important;
    }
    .rl-mode-btn:hover:not(.active) {
      background: rgba(255, 255, 255, 0.12) !important;
      color: #ffffff !important;
    }

    .rl-banner-artist-link:hover {
      text-decoration: underline !important;
    }

    /* Modal Layout (Matching Release List) */
    .rl-modal-backdrop {
      position: fixed !important;
      inset: 0 !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      background: rgba(0, 0, 0, 0.82) !important;
      backdrop-filter: blur(8px) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      z-index: 999999 !important;
      animation: rl-fade-in 0.18s ease;
      margin: 0 !important;
      padding: 0 !important;
      box-sizing: border-box !important;
      color: var(--spice-text, #ffffff);
      font-family: var(--font-family, spotify-circular, Helvetica, Arial, sans-serif);
    }
    .rl-modal-card {
      background: #181818 !important;
      border: 1px solid rgba(255, 255, 255, 0.14) !important;
      border-radius: 12px !important;
      width: 90% !important;
      max-width: 580px !important;
      max-height: 85vh !important;
      display: flex !important;
      flex-direction: column !important;
      box-shadow: 0 24px 56px rgba(0, 0, 0, 0.85) !important;
      overflow: hidden !important;
      animation: rl-slide-down 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      margin: auto !important;
      box-sizing: border-box !important;
    }
    .rl-modal-body {
      padding: 20px 24px;
      overflow-y: auto;
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-height: calc(85vh - 135px);
      box-sizing: border-box;
    }

    /* Color picker & settings controls */
    .rl-color-picker {
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
      width: 34px;
      height: 32px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 6px;
      cursor: pointer;
      background: transparent;
      padding: 0;
      flex-shrink: 0;
      outline: none;
    }
    .rl-color-picker::-webkit-color-swatch-wrapper {
      padding: 2px;
    }
    .rl-color-picker::-webkit-color-swatch {
      border: none;
      border-radius: 4px;
    }
    .rl-color-hex {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 6px;
      color: #ffffff;
      font-size: 13px;
      font-family: monospace;
      padding: 6px 10px;
      width: 86px;
      outline: none;
      box-sizing: border-box;
    }
    .rl-color-hex:focus {
      border-color: #1ed760;
    }
  `;
  document.head.appendChild(styleEl);
}

// ---------------------------------------------------------------------------
// 1. Spotify URI & ID Helper
// ---------------------------------------------------------------------------
function getSpotifyId(uriOrId) {
  if (!uriOrId) return "";
  const str = String(uriOrId);
  return str.includes(":") ? str.split(":").pop() : str;
}

// ---------------------------------------------------------------------------
// 2. Fisher-Yates shuffle
// ---------------------------------------------------------------------------
function fisherYatesShuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ---------------------------------------------------------------------------
// 1b. Shared Release List Integration & Design Helpers (ReleaseListDB)
// ---------------------------------------------------------------------------
const DEFAULT_GROUP_COLORS = {
  album: "#8b5cf6",
  single: "#10b981",
};

function getContrastYIQ(hexcolor) {
  const hex = (hexcolor || "#000000").replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16) || 0;
  const g = parseInt(hex.substr(2, 2), 16) || 0;
  const b = parseInt(hex.substr(4, 2), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
}

const STORAGE_SETTINGS = "random-library:settings";

function getStoredSettings() {
  try {
    const raw = Spicetify.LocalStorage.get(STORAGE_SETTINGS);
    if (raw) return JSON.parse(raw) || {};
  } catch {}
  return {};
}

function saveStoredSettings(settings) {
  try {
    Spicetify.LocalStorage.set(STORAGE_SETTINGS, JSON.stringify(settings));
  } catch {}
}

function getGroupColors() {
  try {
    const local = getStoredSettings();
    if (local?.syncWithReleaseList === false && local?.groupColors) {
      return {
        album: local.groupColors.album || DEFAULT_GROUP_COLORS.album,
        single: local.groupColors.single || DEFAULT_GROUP_COLORS.single,
      };
    }
    const raw = Spicetify.LocalStorage?.get?.("release-list:settings");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.groupColors) {
        return {
          album: parsed.groupColors.album || DEFAULT_GROUP_COLORS.album,
          single: parsed.groupColors.single || DEFAULT_GROUP_COLORS.single,
        };
      }
    }
    if (local?.groupColors) {
      return {
        album: local.groupColors.album || DEFAULT_GROUP_COLORS.album,
        single: local.groupColors.single || DEFAULT_GROUP_COLORS.single,
      };
    }
  } catch {}
  return DEFAULT_GROUP_COLORS;
}

const badgeCache = new Map();

function getTypeBadge(type, groupColors = null) {
  const colors = groupColors || getGroupColors();
  const cacheKey = `${type}_${colors.album}_${colors.single}`;
  if (badgeCache.has(cacheKey)) return badgeCache.get(cacheKey);

  let badge;
  if (type === "single") {
    const bg = colors.single || DEFAULT_GROUP_COLORS.single;
    badge = {
      label: "SINGLE / EP",
      bg,
      fg: getContrastYIQ(bg),
    };
  } else {
    const bg = colors.album || DEFAULT_GROUP_COLORS.album;
    badge = {
      label: "ALBUM",
      bg,
      fg: getContrastYIQ(bg),
    };
  }
  badgeCache.set(cacheKey, badge);
  return badge;
}

function extractReleaseDateStr(item) {
  if (!item) return "";
  const d =
    item.release_date ||
    item.releaseDate ||
    item.publishDate ||
    item.date ||
    item.album?.release_date ||
    item.album?.releaseDate ||
    item.album?.publishDate ||
    item.album?.date;
  if (typeof d === "string") return d.split("T")[0];
  if (typeof d === "number") {
    if (d > 1000 && d < 3000) return String(d);
    try {
      const ms = d > 1e11 ? d : d * 1000;
      const dt = new Date(ms);
      if (!isNaN(dt.getTime())) return dt.toISOString().split("T")[0];
    } catch {}
  }
  if (d && typeof d === "object") {
    if (d.isoString) return String(d.isoString).split("T")[0];
    if (d.year) {
      const y = String(d.year);
      const m = d.month ? String(d.month).padStart(2, "0") : "";
      const day = d.day ? String(d.day).padStart(2, "0") : "";
      if (m && day) return `${y}-${m}-${day}`;
      if (m) return `${y}-${m}`;
      return y;
    }
  }
  const y = item.year || item.publishedYear || item.releaseYear || item.album?.year;
  if (y) return String(y);
  return "";
}


// ---------------------------------------------------------------------------
// 2. Release Classification Logic (Albums & Singles/EPs Only)
// ---------------------------------------------------------------------------
function classifyRelease(item, fallbackGroup = "") {
  const groupHint = String(item.album_group || fallbackGroup || "").toLowerCase();
  if (groupHint.includes("single") || groupHint.includes("ep")) return "single";
  if (groupHint.includes("album")) return "album";

  const rawGroup = String(
    item.album_type ||
    item.albumType ||
    item.type ||
    item.__typename ||
    "album"
  ).toLowerCase();

  if (rawGroup.includes("single") || rawGroup.includes("ep")) return "single";
  return "album";
}

// Normalized album title for fuzzy deduplication & cross-edition saved matching
function normalizeAlbumTitle(title) {
  if (!title) return "";
  return String(title)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents (e.g. é -> e)
    .toLowerCase()
    .replace(/['"’“”`]/g, "") // remove smart quotes & apostrophes
    // Strip parenthetical/bracketed edition variations (including years/numbers before edition keywords)
    .replace(/\s*[\(\[\{][^\)\]\}]*(deluxe|expanded|anniversary|remaster|special|bonus|clean|explicit|edition|re-?issue|reissue|mono|stereo|version|cut|box set|collector|live)[^\)\]\}]*[\)\]\}]/gi, "")
    // Strip trailing dashes with edition descriptions e.g. " - 2017 Remaster", " - Deluxe Edition"
    .replace(/\s*-\s*.*(deluxe|expanded|anniversary|remaster|special|bonus|clean|explicit|edition|re-?issue|reissue|mono|stereo|version|cut|box set|collector).*/gi, "")
    // Strip standalone year tag at end like (2017) or [2021]
    .replace(/\s*[\(\[\{]\d{4}[\)\]\}]/g, "")
    // Preserve Unicode letters and numbers across languages (e.g. Chinese/Japanese "猫猫", Cyrillic, etc.)
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Normalize text for resilient search matching (strips accents & diacritics, lowercases)
function normalizeSearchString(str) {
  if (!str) return "";
  return String(str)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\$/g, "s") // handle $ as 's' (e.g. $uicideboy$ -> suicideboys, Ke$ha -> kesha, A$AP -> asap)
    .trim();
}

// Fast search matcher that compiles query once for high-performance batch filtering
function createSearchMatcher(rawQuery) {
  if (!rawQuery || !rawQuery.trim()) return () => true;
  const q = rawQuery.trim();
  const normQuery = normalizeSearchString(q);
  if (!normQuery) return () => true;

  const strippedQuery = normQuery.replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
  const compactQuery = normQuery.replace(/[^\p{L}\p{N}]/gu, "");

  return function matches(text) {
    if (!text) return false;
    const normText = normalizeSearchString(text);
    if (normText.includes(normQuery)) return true;

    if (strippedQuery) {
      const strippedText = normText.replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
      if (strippedText.includes(strippedQuery)) return true;
    }

    if (compactQuery) {
      const compactText = normText.replace(/[^\p{L}\p{N}]/gu, "");
      if (compactText.includes(compactQuery)) return true;
    }

    return false;
  };
}

// Resilient search matcher supporting special characters, punctuation, and diacritics
function matchesSearchQuery(text, query) {
  if (!query) return true;
  return createSearchMatcher(query)(text);
}

// Extract edition metadata for alternative edition detection & badge tags
function getEditionInfo(name) {
  const lower = String(name || "").toLowerCase();
  const isDeluxe = /deluxe|director'?s cut|expanded|complete|special edition|bonus/.test(lower);
  const isRemaster = /remaster|anniversary|re-?issue|mix/.test(lower);

  let label = "Standard";
  if (/director'?s cut/i.test(name)) label = "Director's Cut";
  else if (/deluxe/i.test(name)) label = "Deluxe";
  else if (/expanded/i.test(name)) label = "Expanded";
  else if (/anniversary/i.test(name)) label = "Anniversary";
  else if (/remaster/i.test(name)) label = "Remaster";
  else if (/collector/i.test(name)) label = "Collector's";
  else if (/special edition/i.test(name)) label = "Special Edition";
  else if (/\blive\b/i.test(name)) label = "Live";
  else if (/clean/i.test(name)) label = "Clean";
  else if (/explicit/i.test(name)) label = "Explicit";

  return { isDeluxe, isRemaster, label };
}

// ---------------------------------------------------------------------------
// 3. Saved Albums Fetcher (Instant Local Database)
// ---------------------------------------------------------------------------
async function fetchAllSavedAlbums(onProgress) {
  const albums = [];
  const limit = 50;
  let offset = 0;
  let total = Infinity;
  const seenUris = new Set();

  while (offset < total) {
    const response = await Spicetify.Platform.LibraryAPI.getContents({
      filters: ["0"], // Library filter
      sortOrder: "RECENTLY_ADDED",
      limit,
      offset,
    });

    if (!response || !response.items) break;

    for (const item of response.items) {
      // Exclude playlists, shows, episodes, artists - ONLY accept saved albums/singles (spotify:album: URIs)
      if (!item.uri || !item.uri.startsWith("spotify:album:")) continue;
      if (seenUris.has(item.uri)) continue;
      seenUris.add(item.uri);

      const firstArtist = item.artists?.[0];
      const artistUri = firstArtist?.uri || item.artistUri || (firstArtist?.id ? `spotify:artist:${firstArtist.id}` : "");
      const rawDate = extractReleaseDateStr(item);
      const releaseYear = rawDate ? rawDate.slice(0, 4) : "";

      albums.push({
        uri: item.uri,
        name: item.name,
        artist: item.artists?.map((a) => a.name).join(", ") ?? "Unknown Artist",
        artistUri: artistUri,
        imageUrl: item.images?.[0]?.url ?? item.imgUrl ?? "",
        type: classifyRelease(item),
        year: releaseYear,
        releaseDate: rawDate,
      });
    }

    total = response.totalLength ?? response.total ?? albums.length;
    offset += limit;
    onProgress?.(albums.length, total);
  }



  return albums;
}

// ---------------------------------------------------------------------------
// 3b. Export Saved Albums Helper & Spicetify Global/Profile Menu Integration
// ---------------------------------------------------------------------------
async function exportSavedAlbums(format = "json") {
  try {
    let albums = savedAlbumCache;
    if (!albums || albums.length === 0) {
      Spicetify.showNotification?.("Fetching saved albums for export\u2026");
      albums = await fetchAllSavedAlbums();
      savedAlbumCache = albums;
    }

    if (!albums || albums.length === 0) {
      Spicetify.showNotification?.("No saved albums found to export.");
      return;
    }

    const cleanAlbums = albums.map((a) => ({
      uri: a.uri,
      name: a.name,
      artist: a.artist,
      year: a.year || "",
      type: a.type || "album",
      imageUrl: a.imageUrl || "",
    }));

    let content, filename, mimeType;
    if (format === "csv") {
      let csv = "\uFEFFArtist,Album,Year,Type,URI,ImageURL\n";
      for (const a of cleanAlbums) {
        const artist = `"${String(a.artist || "").replace(/"/g, '""')}"`;
        const name = `"${String(a.name || "").replace(/"/g, '""')}"`;
        const year = `"${String(a.year || "").replace(/"/g, '""')}"`;
        const type = `"${String(a.type || "").replace(/"/g, '""')}"`;
        const uri = `"${String(a.uri || "").replace(/"/g, '""')}"`;
        const img = `"${String(a.imageUrl || "").replace(/"/g, '""')}"`;
        csv += `${artist},${name},${year},${type},${uri},${img}\n`;
      }
      content = csv;
      filename = "spotify_saved_albums.csv";
      mimeType = "text/csv;charset=utf-8;";
    } else {
      content = JSON.stringify(cleanAlbums, null, 2);
      filename = "spotify_saved_albums.json";
      mimeType = "application/json";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1500);

    Spicetify.showNotification?.(`Exported ${cleanAlbums.length} saved albums to ${filename}!`);
  } catch (err) {
    console.error("[Random Library] Failed to export saved albums:", err);
    Spicetify.showNotification?.(`Export failed: ${err.message || err}`);
  }
}

let exportMenuRegistered = false;

function registerExportMenu() {
  if (exportMenuRegistered) return;
  if (typeof Spicetify === "undefined" || !Spicetify.Menu) return;

  try {
    const jsonItem = new Spicetify.Menu.Item(
      "Export as JSON (.json)",
      false,
      () => exportSavedAlbums("json")
    );
    const csvItem = new Spicetify.Menu.Item(
      "Export as CSV (.csv)",
      false,
      () => exportSavedAlbums("csv")
    );

    if (Spicetify.Menu.SubMenu) {
      const subMenu = new Spicetify.Menu.SubMenu("Export Saved Albums", [jsonItem, csvItem]);
      subMenu.register();
    } else {
      jsonItem.register();
      csvItem.register();
    }
    exportMenuRegistered = true;
  } catch (e) {
    console.warn("[Random Library] Could not register export menu:", e);
  }
}

// Initialize export menu in Spicetify Profile Menu
(function initExportMenu() {
  if (typeof Spicetify !== "undefined" && Spicetify.Menu && (Spicetify.Menu.SubMenu || Spicetify.Menu.Item)) {
    registerExportMenu();
  } else {
    setTimeout(initExportMenu, 500);
  }
})();

// ---------------------------------------------------------------------------
// 4. Followed Artists Fetcher (Instant Local Database)
// ---------------------------------------------------------------------------
async function fetchAllFollowedArtists(onProgress) {
  const artists = [];
  const limit = 50;
  let offset = 0;
  let total = Infinity;
  const seenIds = new Set();

  while (offset < total) {
    const response = await Spicetify.Platform.LibraryAPI.getContents({
      filters: ["1"], // "1" = Artists in library
      sortOrder: "RECENTLY_ADDED",
      limit,
      offset,
    });

    if (!response || !response.items || response.items.length === 0) break;

    for (const item of response.items) {
      const id = item.uri ? item.uri.split(":").pop() : item.id;
      if (id && !seenIds.has(id)) {
        seenIds.add(id);
        artists.push({
          id,
          uri: item.uri || `spotify:artist:${id}`,
          name: item.name,
          imageUrl: item.images?.[0]?.url ?? item.imgUrl ?? "",
        });
      }
    }

    total = response.totalLength ?? response.total ?? artists.length;
    offset += limit;
    onProgress?.(artists.length, total);
  }

  return artists;
}

// ---------------------------------------------------------------------------
// 5. On-Demand Artist Discography Fetcher (Web API + Search + Cosmos + GraphQL)
// ---------------------------------------------------------------------------
const artistDiscographyCache = new Map();

// Helper to obtain Spotify access token across various desktop CEF / Spicetify versions
async function getSpotifyAccessToken() {
  try {
    const authState = Spicetify.Platform?.AuthorizationAPI?.getState?.();
    if (authState?.token?.accessToken) return authState.token.accessToken;
    if (authState?.accessToken) return authState.accessToken;
    if (Spicetify.Platform?.AuthorizationAPI?._tokenProvider?._lastToken) {
      return Spicetify.Platform.AuthorizationAPI._tokenProvider._lastToken;
    }
    if (Spicetify.Platform?.Session?.accessToken) {
      return Spicetify.Platform.Session.accessToken;
    }
    if (typeof Spicetify.Platform?.AuthorizationAPI?.getAccessToken === "function") {
      const res = await Spicetify.Platform.AuthorizationAPI.getAccessToken();
      if (res) return typeof res === "string" ? res : res.accessToken || res.token || "";
    }
    if (typeof Spicetify.Platform?.Session?.getAccessToken === "function") {
      const res = await Spicetify.Platform.Session.getAccessToken();
      if (res) return typeof res === "string" ? res : res.accessToken || res.token || "";
    }
    if (typeof Spicetify.Platform?.UserAPI?.getAccessToken === "function") {
      const res = await Spicetify.Platform.UserAPI.getAccessToken();
      if (res) return typeof res === "string" ? res : res.accessToken || res.token || "";
    }
  } catch (err) {
    console.warn("[Random Library] Access token fetch error:", err);
  }
  return "";
}

// Resilient Web API requester: tries Bearer fetch, with automatic fallback to CosmosAsync
async function fetchWebApiJson(url, token) {
  let lastErr = null;
  if (token) {
    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        return await res.json();
      }
      if (res.status === 429) {
        const retryAfter = parseInt(res.headers.get("Retry-After") || "2", 10);
        await new Promise((r) => setTimeout(r, retryAfter * 1000));
        const retryRes = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (retryRes.ok) return await retryRes.json();
        throw new Error(`HTTP 429: Rate limited by Spotify Web API (Retry-After: ${retryAfter}s)`);
      }
      lastErr = new Error(`HTTP ${res.status}: ${res.statusText || "Web API request failed"}`);
    } catch (e) {
      lastErr = e;
    }
  }
  if (Spicetify.CosmosAsync?.get) {
    try {
      return await Spicetify.CosmosAsync.get(url);
    } catch (e) {
      if (!lastErr) lastErr = e;
    }
  }
  if (lastErr) throw lastErr;
  return null;
}



async function fetchArtistReleases(artistUri, artistName = "") {
  if (!artistUri) return [];
  if (artistDiscographyCache.has(artistUri)) {
    return artistDiscographyCache.get(artistUri);
  }

  const releases = [];
  const artistId = artistUri.split(":").pop();
  const seenUris = new Set();

  const addRelease = (rel) => {
    if (rel?.uri && !seenUris.has(rel.uri)) {
      seenUris.add(rel.uri);
      releases.push(rel);
    }
  };

  // Layer 1: Native Desktop GraphQL - queryArtistDiscographyAll (Spotify Native, instant & reliable)
  if (Spicetify.GraphQL?.Request) {
    try {
      const discographyDef =
        Spicetify.GraphQL.Definitions?.queryArtistDiscographyAll || {
          name: "queryArtistDiscographyAll",
          operation: "query",
          sha256Hash: "9380995a9d4663cbcb5113fef3c6aabf70ae6d407ba61793fd01e2a1dd6929b0",
          value: null,
        };

      let offset = 0;
      const limit = 100;
      let total = Infinity;

      while (offset < total && offset < 500) {
        const { data, errors } = await Spicetify.GraphQL.Request(discographyDef, {
          uri: artistUri,
          offset,
          limit,
        });

        if (errors && (!data || !data.artistUnion)) {
          console.warn("[Random Library] GraphQL discography query errors:", errors);
          break;
        }

        const discogAll = data?.artistUnion?.discography?.all;
        const groups = discogAll?.items || [];
        if (groups.length === 0) break;

        total = discogAll?.totalCount ?? groups.length;

        for (const group of groups) {
          const releaseList = group.releases?.items || (group.uri ? [group] : []);
          for (const item of releaseList) {
            if (!item?.uri) continue;
            const rawType = item.type || item.albumType || group.type || group.albumType || "album";
            const t = String(rawType).toUpperCase();
            if (t.includes("COMPILATION") || t.includes("APPEARS_ON")) continue;
            const normType = (t.includes("SINGLE") || t.includes("EP")) ? "single" : "album";

            const artistsList = item.artists?.items
              ? item.artists.items.map((a) => a.profile?.name || a.name).filter(Boolean).join(", ")
              : (Array.isArray(item.artists) ? item.artists.map((a) => a.name).filter(Boolean).join(", ") : "");

            const coverUrl =
              item.coverArt?.sources?.reduce((max, src) => (src.width > max.width ? src : max), { width: 0, url: "" })?.url ||
              item.images?.[0]?.url ||
              item.imgUrl ||
              "";

            const dateStr =
              item.date?.isoString?.split("T")?.[0] ||
              (item.date?.year ? String(item.date.year) : "") ||
              extractReleaseDateStr(item) ||
              "";

            addRelease({
              uri: item.uri,
              name: item.name,
              artist: artistsList || artistName,
              imageUrl: coverUrl,
              type: normType,
              releaseDate: dateStr,
            });
          }
        }

        if (groups.length < limit || offset + groups.length >= total) break;
        offset += limit;
      }
    } catch (gqlErr) {
      console.warn("[Random Library] GraphQL discography fetch failed, trying fallbacks:", gqlErr);
    }
  }

  // Layer 2: Spicetify GraphQL Overview Fallback
  if (releases.length === 0 && Spicetify.GraphQL?.Request) {
    try {
      const overviewDef =
        Spicetify.GraphQL.Definitions?.queryArtistOverview || {
          name: "queryArtistOverview",
          operation: "query",
          sha256Hash: "ae0e2958a4ab645b35ca19ac04d0495ae12d9c5d7b7286217674801a9aab281a",
          value: null,
        };

      const { data } = await Spicetify.GraphQL.Request(overviewDef, {
        uri: artistUri,
        locale: Spicetify.Locale?.getLocale?.() || "en",
      });

      const discog = data?.artistUnion?.discography;
      if (discog) {
        const groups = [
          ...(discog.albums?.items || []),
          ...(discog.singles?.items || []),
          ...(discog.all?.items || []),
          ...(discog.popularReleasesAlbums?.items || []),
        ];

        for (const group of groups) {
          const releaseList = group.releases?.items || (group.uri ? [group] : []);
          for (const item of releaseList) {
            if (!item?.uri) continue;
            const rawType = item.type || item.albumType || group.type || group.albumType || "album";
            const t = String(rawType).toUpperCase();
            if (t.includes("COMPILATION") || t.includes("APPEARS_ON")) continue;
            const normType = (t.includes("SINGLE") || t.includes("EP")) ? "single" : "album";

            const artistsList = item.artists?.items
              ? item.artists.items.map((a) => a.profile?.name || a.name).filter(Boolean).join(", ")
              : (Array.isArray(item.artists) ? item.artists.map((a) => a.name).filter(Boolean).join(", ") : "");

            const coverUrl =
              item.coverArt?.sources?.reduce((max, src) => (src.width > max.width ? src : max), { width: 0, url: "" })?.url ||
              item.images?.[0]?.url ||
              item.imgUrl ||
              "";

            const dateStr =
              item.date?.isoString?.split("T")?.[0] ||
              (item.date?.year ? String(item.date.year) : "") ||
              extractReleaseDateStr(item) ||
              "";

            addRelease({
              uri: item.uri,
              name: item.name,
              artist: artistsList || artistName,
              imageUrl: coverUrl,
              type: normType,
              releaseDate: dateStr,
            });
          }
        }
      }
    } catch (err) {
      console.warn("[Random Library] GraphQL overview fallback error:", err);
    }
  }

  // Layer 3: Cosmos hm:// protocol Fallback (Spotify Desktop Native)
  if (releases.length === 0 && Spicetify.CosmosAsync?.get) {
    try {
      const res = await Spicetify.CosmosAsync.get(`hm://artist/v1/${artistId}/desktop?format=json`);
      if (res?.releases) {
        const addCosmosReleases = (list, groupType) => {
          if (!list) return;
          for (const item of list) {
            const imageHash = item.cover?.uri ? item.cover.uri.split(":").pop() : null;
            addRelease({
              uri: item.uri,
              name: item.name,
              artist: item.artists?.map((a) => a.name).join(", ") || artistName || res.name || "",
              imageUrl: imageHash ? `https://i.scdn.co/image/${imageHash}` : "",
              type: classifyRelease({ ...item, album_group: groupType }, groupType),
              releaseDate: extractReleaseDateStr(item),
            });
          }
        };

        addCosmosReleases(res.releases.albums?.releases, "album");
        addCosmosReleases(res.releases.singles?.releases, "single");
      }
    } catch (err) {
      console.warn("[Random Library] Cosmos discography fallback error:", err);
    }
  }

  // Layer 4: Spotify Web API Fallback (last resort)
  if (releases.length === 0) {
    try {
      const token = await getSpotifyAccessToken();
      if (token) {
        for (const group of ["album", "single"]) {
          try {
            const nextUrl = `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=${group}&limit=50`;
            const data = await fetchWebApiJson(nextUrl, token);
            if (data?.items) {
              for (const item of data.items) {
                addRelease({
                  uri: item.uri,
                  name: item.name,
                  artist: item.artists?.map((a) => a.name).join(", ") || artistName,
                  imageUrl: item.images?.[0]?.url || item.images?.[1]?.url || "",
                  type: classifyRelease(item, group),
                  releaseDate: item.release_date || item.releaseDate || "",
                });
              }
            }
          } catch {}
        }
      }
    } catch (err) {
      console.warn("[Random Library] Web API catalog fetch fallback error:", err);
    }
  }

  artistDiscographyCache.set(artistUri, releases);
  return releases;
}

// Module-level caches
let savedAlbumCache = null;
let savedShuffledCache = null;
let followedArtistCache = null;
let followedArtistShuffledCache = null;

const STORAGE_ACTIVE_MODE = "random-library:active-mode";
const STORAGE_SELECTED_ARTIST = "random-library:selected-artist";
const STORAGE_RELEASE_FILTER = "random-library:release-filter";
const STORAGE_HISTORY_STACK = "random-library:history-stack";
const STORAGE_HISTORY_INDEX = "random-library:history-index";

// ---------------------------------------------------------------------------
// 6. Styles & Design Tokens (Spotify Native Aesthetic)
// ---------------------------------------------------------------------------
const STYLES = {
  page: {
    padding: "48px 32px 32px",
    maxWidth: "100%",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px",
    gap: "16px",
    flexWrap: "wrap",
  },
  titleGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  title: {
    fontSize: "26px",
    fontWeight: "800",
    color: "var(--spice-text)",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: "13px",
    color: "var(--spice-subtext)",
  },
  headerControls: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  modeToggleGroup: {
    display: "inline-flex",
    background: "rgba(255, 255, 255, 0.07)",
    borderRadius: "500px",
    padding: "3px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  modeBtn: (active) => ({
    background: active ? "var(--spice-text)" : "transparent",
    color: active ? "var(--spice-main, #121212)" : "var(--spice-subtext)",
    border: "none",
    borderRadius: "500px",
    padding: "6px 14px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.15s ease",
  }),
  shuffleBtn: {
    background: "var(--spice-button, #1ed760)",
    color: "var(--spice-text, #000)",
    border: "none",
    borderRadius: "500px",
    padding: "8px 20px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "transform 0.1s ease, filter 0.2s ease",
  },
  actionBtn: {
    background: "rgba(255, 255, 255, 0.1)",
    color: "var(--spice-text)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: "500px",
    padding: "8px 16px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "background 0.2s ease, transform 0.1s ease",
  },
  historyNavGroup: {
    display: "inline-flex",
    alignItems: "center",
    gap: "2px",
    background: "rgba(255,255,255,0.06)",
    borderRadius: "500px",
    padding: "2px",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  historyBtn: (enabled) => ({
    background: "transparent",
    color: enabled ? "var(--spice-text)" : "rgba(255,255,255,0.25)",
    border: "none",
    borderRadius: "500px",
    width: "28px",
    height: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: enabled ? "pointer" : "default",
    transition: "background 0.15s ease, color 0.15s ease",
  }),
  backBtn: {
    background: "transparent",
    color: "var(--spice-subtext)",
    border: "none",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 0",
  },
  artistBanner: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "28px",
    padding: "16px 20px",
    background: "rgba(255,255,255,0.04)",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  artistBannerAvatar: {
    width: "72px",
    height: "72px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  artistBannerName: {
    fontSize: "22px",
    fontWeight: "800",
    color: "var(--spice-text)",
  },
  artistBannerSub: {
    fontSize: "13px",
    color: "var(--spice-subtext)",
    marginTop: "2px",
  },
  filterSection: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    marginBottom: "24px",
  },
  filterPillRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },
  pill: (active) => ({
    background: active ? "var(--spice-text)" : "rgba(255,255,255,0.08)",
    color: active ? "var(--spice-main, #121212)" : "var(--spice-text)",
    border: active ? "1px solid var(--spice-text)" : "1px solid rgba(255,255,255,0.1)",
    borderRadius: "500px",
    padding: "6px 14px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.15s ease",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  }),
  pillCount: (active) => ({
    fontSize: "10px",
    opacity: active ? 0.7 : 0.5,
    fontWeight: "600",
  }),
  controlsRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
    width: "100%",
  },
  searchWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    minWidth: "260px",
    maxWidth: "460px",
    flex: "1 1 280px",
  },
  searchIcon: {
    position: "absolute",
    left: "12px",
    color: "var(--spice-subtext)",
    pointerEvents: "none",
    zIndex: 2,
  },
  searchInput: {
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "500px",
    color: "var(--spice-text)",
    fontSize: "13px",
    padding: "8px 16px 8px 34px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    textOverflow: "ellipsis",
    transition: "border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease",
  },
  selectWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  selectChevron: {
    position: "absolute",
    right: "10px",
    color: "var(--spice-subtext)",
    pointerEvents: "none",
  },
  select: {
    appearance: "none",
    background: "var(--spice-card, #282828)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "500px",
    color: "var(--spice-text)",
    fontSize: "13px",
    padding: "7px 28px 7px 12px",
    outline: "none",
    cursor: "pointer",
    colorScheme: "dark",
  },
  clearBtn: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "500px",
    color: "var(--spice-subtext)",
    fontSize: "12px",
    padding: "6px 12px",
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(max(var(--grid-column-min-width, 170px), 140px), 1fr))",
    gap: "var(--grid-gap, 20px)",
  },
  card: {
    cursor: "pointer",
    position: "relative",
    borderRadius: "8px",
    padding: "12px",
    background: "rgba(255,255,255,0.03)",
    transition: "background 0.2s ease, transform 0.15s ease",
  },
  imageWrapper: {
    position: "relative",
    width: "100%",
    paddingBottom: "100%",
    marginBottom: "10px",
    borderRadius: "6px",
    overflow: "hidden",
  },
  artistAvatarWrapper: {
    position: "relative",
    width: "100%",
    paddingBottom: "100%",
    marginBottom: "10px",
    borderRadius: "50%",
    overflow: "hidden",
  },
  image: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  badge: (type) => ({
    fontSize: "10px",
    fontWeight: "800",
    textTransform: "uppercase",
    padding: "2px 6px",
    borderRadius: "4px",
    letterSpacing: "0.5px",
    color: "#fff",
    background:
      type === "single"
        ? "#1db954"
        : "rgba(255, 255, 255, 0.15)",
  }),
  editionInlineChip: (label) => {
    const isDeluxe = /deluxe|director'?s cut|expanded|complete|special/i.test(label);
    const isRemaster = /remaster|anniversary|re-?issue/i.test(label);
    return {
      display: "inline-flex",
      alignItems: "center",
      fontSize: "9px",
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      padding: "1px 5px",
      borderRadius: "3px",
      marginLeft: "6px",
      verticalAlign: "middle",
      background: isDeluxe
        ? "linear-gradient(135deg, rgba(138, 35, 135, 0.4), rgba(233, 64, 87, 0.4))"
        : isRemaster
        ? "rgba(0, 168, 255, 0.3)"
        : "rgba(255, 255, 255, 0.15)",
      color: isDeluxe ? "#ff758c" : isRemaster ? "#70a1ff" : "var(--spice-subtext)",
      border: isDeluxe
        ? "1px solid rgba(233, 64, 87, 0.5)"
        : isRemaster
        ? "1px solid rgba(0, 168, 255, 0.5)"
        : "1px solid rgba(255, 255, 255, 0.2)",
    };
  },
  editionBadge: (isUpgrade) => ({
    fontSize: "10px",
    fontWeight: "800",
    textTransform: "uppercase",
    padding: "2px 6px",
    borderRadius: "4px",
    letterSpacing: "0.5px",
    color: "#fff",
    background: isUpgrade
      ? "linear-gradient(135deg, #8a2387, #e94057, #f27121)"
      : "rgba(255, 255, 255, 0.12)",
    border: isUpgrade ? "1px solid rgba(255,255,255,0.3)" : "1px solid rgba(255,255,255,0.15)",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    cursor: "pointer",
    transition: "transform 0.15s ease, background 0.15s ease",
  }),
  editionDropdown: {
    position: "absolute",
    bottom: "28px",
    left: "0",
    right: "0",
    background: "rgba(20, 20, 20, 0.96)",
    backdropFilter: "blur(14px)",
    borderRadius: "8px",
    border: "1px solid rgba(255, 255, 255, 0.18)",
    padding: "6px",
    boxShadow: "0 10px 28px rgba(0, 0, 0, 0.85)",
    zIndex: 20,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    maxHeight: "170px",
    overflowY: "auto",
  },
  editionItem: (isActive) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "6px 8px",
    borderRadius: "4px",
    background: isActive ? "rgba(255, 255, 255, 0.12)" : "transparent",
    color: "var(--spice-text)",
    fontSize: "11px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.1s ease",
    textAlign: "left",
    border: "none",
    width: "100%",
  }),
  albumName: {
    fontSize: "14px",
    fontWeight: "700",
    color: "var(--spice-text)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  artistName: {
    fontSize: "12px",
    color: "var(--spice-subtext)",
    marginTop: "2px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  artistCardName: {
    fontSize: "14px",
    fontWeight: "700",
    color: "var(--spice-text)",
    textAlign: "center",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    marginTop: "6px",
  },
  artistLabel: {
    fontSize: "12px",
    color: "var(--spice-subtext)",
    textAlign: "center",
    marginTop: "2px",
  },
  playBtn: {
    position: "absolute",
    bottom: "8px",
    right: "8px",
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    background: "#1ed760",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 12px rgba(0,0,0,.4)",
    transition: "transform 0.2s ease, opacity 0.2s ease",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "45vh",
    gap: "16px",
    color: "var(--spice-subtext)",
  },
};

// ---------------------------------------------------------------------------
// 7. Components
// ---------------------------------------------------------------------------

const AlbumCard = React.memo(function AlbumCard({ album, isSaved = false, groupColors = null }) {
  const [showEditions, setShowEditions] = useState(false);

  function handleClick(e) {
    if (e.target.closest("button") || e.target.closest(".rl-play-btn") || e.target.closest(".rl-card-artist") || e.target.closest(".rl-edition-badge") || showEditions) return;
    const albumId = album.uri.split(":").pop();
    Spicetify.Platform.History.push("/album/" + albumId);
  }

  function handlePlay(e) {
    e.stopPropagation();
    Spicetify.Player.playUri(album.uri);
  }

  function handleEditionClick(e, ed) {
    e.stopPropagation();
    setShowEditions(false);
    const albumId = ed.uri.split(":").pop();
    Spicetify.Platform.History.push("/album/" + albumId);
  }

  const hasEditions = Boolean(album.editions && album.editions.length > 1);
  const colors = groupColors || getGroupColors();
  const typeBadge = getTypeBadge(album.type || "album", colors);

  return React.createElement(
    "div",
    {
      className: "rl-card",
      onClick: handleClick,
      onMouseLeave: () => setShowEditions(false),
      title: `${album.name} – ${album.artist}${isSaved ? " (In Library)" : ""}`,
    },
    // Artwork container (clean, matching release-list)
    React.createElement(
      "div",
      { className: "rl-card-artwork-wrapper" },
      album.imageUrl
        ? React.createElement("img", {
            className: "rl-card-artwork",
            src: album.imageUrl,
            alt: album.name,
            loading: "lazy",
            decoding: "async",
          })
        : React.createElement("div", {
            style: { width: "100%", height: "100%", background: "#181818" },
          }),
      // In-Library Checkmark Badge (top right)
      isSaved &&
        React.createElement(
          "div",
          {
            className: "rl-in-library-badge",
            title: "In your Library",
          },
          React.createElement(
            "svg",
            { width: "13", height: "13", viewBox: "0 0 16 16", fill: "currentColor" },
            React.createElement("path", {
              d: "M13.985 2.383L5.674 12.14 1.34 7.805l1.414-1.414 2.92 2.92 6.897-8.106 1.414 1.178z",
            })
          )
        ),
      // Play Button on hover (bottom right)
      React.createElement(
        "button",
        {
          className: "rl-play-btn",
          onClick: handlePlay,
          title: "Play " + album.name,
          "aria-label": "Play " + album.name,
        },
        React.createElement(
          "svg",
          { width: "20", height: "20", viewBox: "0 0 24 24", fill: "currentColor" },
          React.createElement("polygon", { points: "5,3 19,12 5,21" })
        )
      )
    ),
    // Metadata block (matching release-list)
    React.createElement(
      "div",
      { style: { display: "flex", flexDirection: "column", gap: 4, position: "relative" } },
      // Title
      React.createElement(
        "div",
        {
          className: "rl-card-title",
          title: album.name,
        },
        album.name
      ),
      // Artist
      React.createElement(
        "div",
        {
          className: "rl-card-artist",
          onClick: (e) => {
            e.stopPropagation();
            let artistUri = album.artistUri;
            if (!artistUri && followedArtistCache && followedArtistCache.length > 0) {
              const match = followedArtistCache.find(
                (a) => a.name && a.name.toLowerCase() === (album.artist || "").toLowerCase()
              );
              if (match) artistUri = match.uri;
            }

            if (artistUri) {
              const id = artistUri.split(":").pop();
              Spicetify.Platform.History.push("/artist/" + id);
            } else if (album.artist) {
              Spicetify.Platform.History.push("/search/" + encodeURIComponent(album.artist));
            }
          },
          title: `Go to ${album.artist || "Artist"}'s Spotify page`,
        },
        album.artist
      ),
      // Bottom Row: Type badge + Editions button (left) and Year (right)
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 6,
          },
        },
        React.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          // Type Badge with exact Release List colors and typography
          React.createElement(
            "span",
            {
              style: {
                fontSize: 10,
                fontWeight: 800,
                padding: "2px 6px",
                borderRadius: 4,
                backgroundColor: typeBadge.bg,
                color: typeBadge.fg,
                letterSpacing: "0.5px",
              },
            },
            typeBadge.label
          ),
          // Edition Switcher Button
          hasEditions &&
            React.createElement(
              "button",
              {
                className: "rl-edition-badge",
                style: STYLES.editionBadge(album.hasUpgradeAvailable),
                onClick: (e) => {
                  e.stopPropagation();
                  setShowEditions((prev) => !prev);
                },
                title: "Click to view and switch editions",
              },
              React.createElement(
                "svg",
                { width: "10", height: "10", viewBox: "0 0 24 24", fill: "currentColor" },
                React.createElement("path", { d: "M13 2L3 14h9l-1 8 10-12h-9l1-8z" })
              ),
              album.hasUpgradeAvailable ? "Deluxe" : `${album.editions.length} Eds ▾`
            )
        )
      ),
      // Edition Dropdown (shown when opened)
      showEditions &&
        hasEditions &&
        React.createElement(
          "div",
          {
            style: STYLES.editionDropdown,
            onClick: (e) => e.stopPropagation(),
          },
          React.createElement(
            "div",
            {
              style: {
                fontSize: "10px",
                color: "var(--spice-subtext)",
                padding: "2px 4px 4px 4px",
                fontWeight: "800",
                letterSpacing: "0.5px",
              },
            },
            "AVAILABLE EDITIONS"
          ),
          album.editions.map((ed) => {
            const isCurrent = ed.uri === album.uri;
            return React.createElement(
              "button",
              {
                key: ed.uri,
                className: "rl-edition-item",
                style: STYLES.editionItem(isCurrent),
                onClick: (e) => handleEditionClick(e, ed),
                title: `Open ${ed.name}`,
              },
              React.createElement(
                "span",
                {
                  style: {
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    marginRight: "6px",
                  },
                },
                ed.name
              ),
              ed.isSaved &&
                React.createElement(
                  "span",
                  { style: { color: "#1ed760", fontSize: "11px", fontWeight: "bold" }, title: "In Library" },
                  "✓"
                )
            );
          })
        )
    )
  );
});

const ArtistCard = React.memo(function ArtistCard({ artist, onClick }) {
  function handlePlay(e) {
    e.stopPropagation();
    Spicetify.Player.playUri(artist.uri);
  }

  function handleOpenSpotifyPage(e) {
    e.stopPropagation();
    const id = artist.uri ? artist.uri.split(":").pop() : artist.id;
    if (id) {
      Spicetify.Platform.History.push("/artist/" + id);
    }
  }

  return React.createElement(
    "div",
    {
      className: "rl-card",
      onClick: (e) => {
        if (e.target.closest("button") || e.target.closest(".rl-play-btn") || e.target.closest(".rl-card-artist")) return;
        onClick(artist);
      },
      title: `${artist.name} (Click to open discography in Random Library)`,
    },
    React.createElement(
      "div",
      { className: "rl-card-avatar-wrapper" },
      artist.imageUrl
        ? React.createElement("img", {
            src: artist.imageUrl,
            alt: artist.name,
            loading: "lazy",
            decoding: "async",
          })
        : React.createElement("div", {
            style: { width: "100%", height: "100%", background: "#181818" },
          }),
      React.createElement(
        "button",
        {
          className: "rl-play-btn",
          onClick: handlePlay,
          title: "Play " + artist.name,
          "aria-label": "Play " + artist.name,
        },
        React.createElement(
          "svg",
          { width: "20", height: "20", viewBox: "0 0 24 24", fill: "currentColor" },
          React.createElement("polygon", { points: "5,3 19,12 5,21" })
        )
      )
    ),
    React.createElement(
      "div",
      { style: { display: "flex", flexDirection: "column", gap: 4, alignItems: "center" } },
      React.createElement(
        "div",
        {
          className: "rl-card-title",
          style: { width: "100%", textAlign: "center" },
          title: artist.name,
        },
        artist.name
      ),
      React.createElement(
        "div",
        {
          className: "rl-card-artist",
          style: { width: "auto", textAlign: "center", fontSize: 12, color: "rgba(255, 255, 255, 0.5)" },
          onClick: handleOpenSpotifyPage,
          title: `Open ${artist.name}'s official Spotify profile`,
        },
        "Artist"
      )
    )
  );
});

function FilterPills({ activeFilter, onFilterChange, typeCounts }) {
  const filters = [
    { key: "all", label: "All" },
    { key: "saved", label: "In Library", iconCheck: true },
    { key: "album", label: "Albums" },
    { key: "single", label: "Singles & EPs" },
    { key: "has_editions", label: "Alternative Editions", icon: true },
  ];

  return React.createElement(
    "div",
    { style: STYLES.filterPillRow },
    filters.map((f) => {
      const active = activeFilter === f.key;
      const count = typeCounts[f.key] ?? 0;
      const isZero = count === 0;

      return React.createElement(
        "button",
        {
          key: f.key,
          className: `rl-filter-pill ${active ? "active" : ""}`,
          style: {
            ...STYLES.pill(active),
            ...(isZero && !active ? { opacity: 0.55 } : {}),
            ...(f.key === "saved" && !active
              ? {
                  border: isZero ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(30, 215, 96, 0.4)",
                  background: isZero ? "transparent" : "rgba(30, 215, 96, 0.08)",
                  color: isZero ? "var(--spice-subtext)" : "#1ed760",
                }
              : {}),
            ...(f.key === "has_editions" && !active
              ? {
                  border: isZero ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(233, 64, 87, 0.4)",
                  background: isZero ? "transparent" : "rgba(233, 64, 87, 0.08)",
                  color: isZero ? "var(--spice-subtext)" : "#ff758c",
                }
              : {}),
          },
          onClick: () => onFilterChange(f.key),
          title: `${f.label} (${count})`,
        },
        f.icon && React.createElement(
          "svg",
          { width: "12", height: "12", viewBox: "0 0 24 24", fill: "currentColor" },
          React.createElement("path", { d: "M13 2L3 14h9l-1 8 10-12h-9l1-8z" })
        ),
        f.iconCheck && React.createElement(
          "svg",
          {
            width: "12",
            height: "12",
            viewBox: "0 0 16 16",
            fill: "currentColor",
            style: { marginRight: "4px" },
          },
          React.createElement("path", {
            d: "M13.985 2.383L5.674 12.14 1.34 7.805l1.414-1.414 2.92 2.92 6.897-8.106 1.414 1.178z",
          })
        ),
        f.label,
        React.createElement("span", { style: STYLES.pillCount(active) }, count)
      );
    })
  );
}

// Settings Modal Component
function SettingsModal({ onClose, groupColors, onGroupColorsChange }) {
  const [localColors, setLocalColors] = useState(groupColors);
  const [syncWithReleaseList, setSyncWithReleaseList] = useState(() => {
    const s = getStoredSettings();
    return s.syncWithReleaseList !== false;
  });
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleColorChange = (key, val) => {
    const updated = { ...localColors, [key]: val };
    setLocalColors(updated);
    onGroupColorsChange(updated);
    saveStoredSettings({
      syncWithReleaseList: false,
      groupColors: updated,
    });
    setSyncWithReleaseList(false);
  };

  const handleToggleSync = (val) => {
    setSyncWithReleaseList(val);
    if (val) {
      const rlColors = getGroupColors();
      setLocalColors(rlColors);
      onGroupColorsChange(rlColors);
      saveStoredSettings({
        syncWithReleaseList: true,
        groupColors: rlColors,
      });
    } else {
      saveStoredSettings({
        syncWithReleaseList: false,
        groupColors: localColors,
      });
    }
  };

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      Spicetify.LocalStorage.remove("random-library:cache:albums");
      Spicetify.LocalStorage.remove("random-library:cache:artists");
      Spicetify.showNotification?.("Local cache cleared!");
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch {
      setIsClearing(false);
    }
  };

  const modalNode = React.createElement(
    "div",
    {
      className: "rl-modal-backdrop",
      onClick: (e) => {
        if (e.target === e.currentTarget) onClose();
      },
    },
    React.createElement(
      "div",
      { className: "rl-modal-card" },
      // Header
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 22px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            background: "#202020",
            flexShrink: 0,
          },
        },
        React.createElement("h2", { style: { margin: 0, fontSize: 18, fontWeight: 700 } }, "Random Library Settings"),
        React.createElement(
          "button",
          {
            onClick: onClose,
            style: {
              background: "transparent",
              border: "none",
              color: "rgba(255,255,255,0.7)",
              fontSize: "18px",
              cursor: "pointer",
              padding: "4px 8px",
              borderRadius: "4px",
            },
          },
          "\u2715"
        )
      ),
      // Body
      React.createElement(
        "div",
        { className: "rl-modal-body" },
        // Section 1: Badge Colors Customization
        React.createElement(
          "div",
          { style: { display: "flex", flexDirection: "column", gap: 14 } },
          React.createElement("h3", { style: { margin: 0, fontSize: 15, fontWeight: 700, color: "#fff" } }, "Badge Colors"),
          React.createElement(
            "p",
            { style: { margin: 0, fontSize: 12, color: "rgba(255,255,255,0.6)" } },
            "Customize the badge pill colors for albums and singles/EPs across cards."
          ),
          // Sync toggle
          React.createElement(
            "label",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 13,
                cursor: "pointer",
                padding: "8px 12px",
                background: "rgba(255,255,255,0.04)",
                borderRadius: 6,
                border: "1px solid rgba(255,255,255,0.08)",
              },
            },
            React.createElement("input", {
              type: "checkbox",
              checked: syncWithReleaseList,
              onChange: (e) => handleToggleSync(e.target.checked),
              style: { cursor: "pointer" },
            }),
            React.createElement("span", null, "Sync badge colors with Release List settings")
          ),
          // Color Pickers
          React.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: 10, opacity: syncWithReleaseList ? 0.6 : 1 } },
            // Album color
            React.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 6,
                },
              },
              React.createElement(
                "div",
                { style: { display: "flex", alignItems: "center", gap: 10 } },
                React.createElement(
                  "span",
                  {
                    style: {
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "2px 6px",
                      borderRadius: 4,
                      backgroundColor: localColors.album,
                      color: getContrastYIQ(localColors.album),
                      letterSpacing: "0.5px",
                    },
                  },
                  "ALBUM"
                ),
                React.createElement("span", { style: { fontSize: 13, fontWeight: 600 } }, "Albums")
              ),
              React.createElement(
                "div",
                { style: { display: "flex", alignItems: "center", gap: 8 } },
                React.createElement("input", {
                  type: "color",
                  className: "rl-color-picker",
                  value: localColors.album,
                  disabled: syncWithReleaseList,
                  onChange: (e) => handleColorChange("album", e.target.value),
                }),
                React.createElement("input", {
                  type: "text",
                  className: "rl-color-hex",
                  value: localColors.album,
                  disabled: syncWithReleaseList,
                  onChange: (e) => handleColorChange("album", e.target.value),
                })
              )
            ),
            // Single / EP color
            React.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 6,
                },
              },
              React.createElement(
                "div",
                { style: { display: "flex", alignItems: "center", gap: 10 } },
                React.createElement(
                  "span",
                  {
                    style: {
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "2px 6px",
                      borderRadius: 4,
                      backgroundColor: localColors.single,
                      color: getContrastYIQ(localColors.single),
                      letterSpacing: "0.5px",
                    },
                  },
                  "SINGLE / EP"
                ),
                React.createElement("span", { style: { fontSize: 13, fontWeight: 600 } }, "Singles & EPs")
              ),
              React.createElement(
                "div",
                { style: { display: "flex", alignItems: "center", gap: 8 } },
                React.createElement("input", {
                  type: "color",
                  className: "rl-color-picker",
                  value: localColors.single,
                  disabled: syncWithReleaseList,
                  onChange: (e) => handleColorChange("single", e.target.value),
                }),
                React.createElement("input", {
                  type: "text",
                  className: "rl-color-hex",
                  value: localColors.single,
                  disabled: syncWithReleaseList,
                  onChange: (e) => handleColorChange("single", e.target.value),
                })
              )
            )
          )
        ),
        // Section 2: Cache Management
        React.createElement(
          "div",
          {
            style: {
              display: "flex",
              flexDirection: "column",
              gap: 12,
              borderTop: "1px solid rgba(255,255,255,0.08)",
              paddingTop: 16,
            },
          },
          React.createElement("h3", { style: { margin: 0, fontSize: 15, fontWeight: 700, color: "#fff" } }, "Cache Management"),
          React.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                background: "rgba(255,255,255,0.04)",
                borderRadius: 6,
              },
            },
            React.createElement(
              "div",
              null,
              React.createElement("div", { style: { fontSize: 13, fontWeight: 600 } }, "Reset Local Cache"),
              React.createElement(
                "div",
                { style: { fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 } },
                "Clear cached library data and followed artists"
              )
            ),
            React.createElement(
              "button",
              {
                className: "rl-action-btn",
                style: {
                  ...STYLES.actionBtn,
                  fontSize: 12,
                  padding: "6px 14px",
                  borderColor: "rgba(239, 68, 68, 0.4)",
                  color: "#ef4444",
                },
                onClick: handleClearCache,
                disabled: isClearing,
              },
              isClearing ? "Clearing..." : "Clear Cache"
            )
          )
        )
      ),
      // Footer
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            justifyContent: "flex-end",
            padding: "12px 22px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            background: "#1c1c1c",
            flexShrink: 0,
          },
        },
        React.createElement(
          "button",
          {
            className: "rl-filter-pill active",
            style: {
              background: "#1ed760",
              color: "#000",
              border: "none",
              borderRadius: "500px",
              padding: "7px 18px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
            },
            onClick: onClose,
          },
          "Done"
        )
      )
    )
  );

  const reactDOM = Spicetify.ReactDOM || (typeof ReactDOM !== "undefined" ? ReactDOM : null);
  if (reactDOM && typeof reactDOM.createPortal === "function" && typeof document !== "undefined" && document.body) {
    return reactDOM.createPortal(modalNode, document.body);
  }
  return modalNode;
}

// Module-level caches for search, sort, and navigation history persistence
let cachedMainSearchQuery = "";
let cachedArtistSearchQuery = "";
let cachedSortBy = "shuffle";
let cachedHistoryStack = null;
let cachedHistoryIndex = null;

const INITIAL_BATCH_SIZE = 60;
const LOAD_MORE_STEP = 60;

// ---------------------------------------------------------------------------
// 8. Main Application Component
// ---------------------------------------------------------------------------
function RandomLibraryApp() {
  const [showSettings, setShowSettings] = useState(false);
  const [groupColors, setGroupColors] = useState(() => getGroupColors());

  const sentinelRef = useRef(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH_SIZE);

  const [mode, setMode] = useState(() => {
    return Spicetify.LocalStorage.get(STORAGE_ACTIVE_MODE) || "albums";
  });

  const [savedAlbums, setSavedAlbums] = useState(savedAlbumCache || []);
  const [savedShuffled, setSavedShuffled] = useState(savedShuffledCache || []);

  const [followedArtists, setFollowedArtists] = useState(followedArtistCache || []);
  const [followedArtistsShuffled, setFollowedArtistsShuffled] = useState(followedArtistShuffledCache || []);

  // Persisted selected artist (restores exact artist when navigating back!)
  const [selectedArtist, setSelectedArtist] = useState(() => {
    try {
      const stored = Spicetify.LocalStorage.get(STORAGE_SELECTED_ARTIST);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // In-app History Stack (persisted across app navigation and restarts!)
  const [historyStack, setHistoryStack] = useState(() => {
    if (cachedHistoryStack !== null) return cachedHistoryStack;
    try {
      const stored = Spicetify.LocalStorage.get(STORAGE_HISTORY_STACK);
      const parsed = stored ? JSON.parse(stored) : null;
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedHistoryStack = parsed;
        return parsed;
      }
    } catch {}
    try {
      const stored = Spicetify.LocalStorage.get(STORAGE_SELECTED_ARTIST);
      const parsed = stored ? JSON.parse(stored) : null;
      const initial = parsed ? [parsed] : [];
      cachedHistoryStack = initial;
      return initial;
    } catch {
      return [];
    }
  });

  const [historyIndex, setHistoryIndex] = useState(() => {
    if (cachedHistoryIndex !== null) return cachedHistoryIndex;
    try {
      const stored = Spicetify.LocalStorage.get(STORAGE_HISTORY_INDEX);
      if (stored !== null && stored !== undefined && stored !== "") {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed)) {
          cachedHistoryIndex = parsed;
          return parsed;
        }
      }
    } catch {}
    try {
      const stored = Spicetify.LocalStorage.get(STORAGE_SELECTED_ARTIST);
      const idx = stored ? 0 : -1;
      cachedHistoryIndex = idx;
      return idx;
    } catch {
      return -1;
    }
  });

  const [artistReleases, setArtistReleases] = useState([]);
  const [artistReleasesLoading, setArtistReleasesLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Persisted release filter (persists across random artist rolls!)
  const [releaseFilter, setReleaseFilter] = useState(() => {
    return Spicetify.LocalStorage.get(STORAGE_RELEASE_FILTER) || "all";
  });

  // Separate search states for main page vs. inside artist discography (persisted)
  const [mainSearchQuery, setMainSearchQuery] = useState(() => cachedMainSearchQuery);
  const [debouncedMainQuery, setDebouncedMainQuery] = useState(() => cachedMainSearchQuery);
  const [artistSearchQuery, setArtistSearchQuery] = useState(() => cachedArtistSearchQuery);
  const [debouncedArtistQuery, setDebouncedArtistQuery] = useState(() => cachedArtistSearchQuery);
  const [sortBy, setSortBy] = useState(() => {
    if (cachedSortBy === "date-desc" || cachedSortBy === "date-asc") {
      cachedSortBy = "shuffle";
      return "shuffle";
    }
    return cachedSortBy;
  });
  const [refreshing, setRefreshing] = useState(false);

  // Reset visibleCount whenever user navigates or filters change
  useEffect(() => {
    setVisibleCount(INITIAL_BATCH_SIZE);
  }, [mode, selectedArtist, sortBy, debouncedMainQuery, debouncedArtistQuery, releaseFilter]);

  useEffect(() => {
    cachedMainSearchQuery = mainSearchQuery;
    const timer = setTimeout(() => setDebouncedMainQuery(mainSearchQuery), 150);
    return () => clearTimeout(timer);
  }, [mainSearchQuery]);

  useEffect(() => {
    cachedArtistSearchQuery = artistSearchQuery;
    const timer = setTimeout(() => setDebouncedArtistQuery(artistSearchQuery), 150);
    return () => clearTimeout(timer);
  }, [artistSearchQuery]);

  const handleFilterChange = useCallback((newFilter) => {
    setReleaseFilter(newFilter);
    Spicetify.LocalStorage.set(STORAGE_RELEASE_FILTER, newFilter);
  }, []);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setSelectedArtist(null);
    Spicetify.LocalStorage.remove(STORAGE_SELECTED_ARTIST);
    setArtistSearchQuery("");
    cachedArtistSearchQuery = "";
    Spicetify.LocalStorage.set(STORAGE_ACTIVE_MODE, newMode);
  };

  // Manual Refresh / Sync Button Handler
  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);

    // Clear caches & in-app history stack
    savedAlbumCache = null;
    savedShuffledCache = null;
    followedArtistCache = null;
    followedArtistShuffledCache = null;
    artistDiscographyCache.clear();

    if (selectedArtist) {
      setHistoryStack([selectedArtist]);
      setHistoryIndex(0);
      cachedHistoryStack = [selectedArtist];
      cachedHistoryIndex = 0;
      try {
        Spicetify.LocalStorage.set(STORAGE_HISTORY_STACK, JSON.stringify([selectedArtist]));
        Spicetify.LocalStorage.set(STORAGE_HISTORY_INDEX, "0");
      } catch {}
    } else {
      setHistoryStack([]);
      setHistoryIndex(-1);
      cachedHistoryStack = [];
      cachedHistoryIndex = -1;
      try {
        Spicetify.LocalStorage.remove(STORAGE_HISTORY_STACK);
        Spicetify.LocalStorage.remove(STORAGE_HISTORY_INDEX);
      } catch {}
    }

    try {
      const [albums, artists] = await Promise.all([
        fetchAllSavedAlbums(),
        fetchAllFollowedArtists(),
      ]);

      savedAlbumCache = albums;
      const shufAlbums = fisherYatesShuffle(albums);
      savedShuffledCache = shufAlbums;
      setSavedAlbums(albums);
      setSavedShuffled(shufAlbums);

      followedArtistCache = artists;
      const shufArtists = fisherYatesShuffle(artists);
      followedArtistShuffledCache = shufArtists;
      setFollowedArtists(artists);
      setFollowedArtistsShuffled(shufArtists);

      if (selectedArtist) {
        setArtistReleasesLoading(true);
        try {
          const freshReleases = await fetchArtistReleases(selectedArtist.uri, selectedArtist.name);
          setArtistReleases(freshReleases);
        } catch (err) {
          console.error("[Random Library] Error fetching artist releases on refresh:", err);
        } finally {
          setArtistReleasesLoading(false);
        }
      }
    } catch (err) {
      console.error("[Random Library] Error during refresh:", err);
    } finally {
      setTimeout(() => setRefreshing(false), 350);
    }
  }, [refreshing, selectedArtist]);

  // Open Artist Discography View (tracks in-app history stack for instant back/forward navigation)
  const handleOpenArtist = useCallback(async (artist, recordHistory = true, preserveQuery = false) => {
    setSelectedArtist(artist);
    if (!preserveQuery) {
      setArtistSearchQuery("");
      cachedArtistSearchQuery = "";
    }
    setArtistReleasesLoading(true);
    Spicetify.LocalStorage.set(STORAGE_SELECTED_ARTIST, JSON.stringify(artist));

    if (recordHistory) {
      setHistoryStack((prev) => {
        const upToCurrent = prev.slice(0, historyIndex + 1);
        if (upToCurrent.length > 0 && upToCurrent[upToCurrent.length - 1].uri === artist.uri) {
          return upToCurrent;
        }
        const next = [...upToCurrent, artist];
        const nextIdx = next.length - 1;
        setHistoryIndex(nextIdx);
        cachedHistoryStack = next;
        cachedHistoryIndex = nextIdx;
        try {
          Spicetify.LocalStorage.set(STORAGE_HISTORY_STACK, JSON.stringify(next));
          Spicetify.LocalStorage.set(STORAGE_HISTORY_INDEX, String(nextIdx));
        } catch {}
        return next;
      });
    }

    try {
      const releases = await fetchArtistReleases(artist.uri, artist.name);
      setArtistReleases(releases);
    } catch (err) {
      console.error("[Random Library] Error opening artist discography:", err);
    } finally {
      setArtistReleasesLoading(false);
    }
  }, [historyIndex]);

  const handleCloseArtist = useCallback(() => {
    setSelectedArtist(null);
    setArtistSearchQuery("");
    cachedArtistSearchQuery = "";
    Spicetify.LocalStorage.remove(STORAGE_SELECTED_ARTIST);
  }, []);

  // In-App History Back & Forward Navigation Controls
  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex >= 0 && historyIndex < historyStack.length - 1;

  const handleHistoryBack = useCallback(() => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      const target = historyStack[prevIdx];
      setHistoryIndex(prevIdx);
      cachedHistoryIndex = prevIdx;
      try {
        Spicetify.LocalStorage.set(STORAGE_HISTORY_INDEX, String(prevIdx));
      } catch {}
      handleOpenArtist(target, false);
    }
  }, [historyIndex, historyStack, handleOpenArtist]);

  const handleHistoryForward = useCallback(() => {
    if (historyIndex < historyStack.length - 1) {
      const nextIdx = historyIndex + 1;
      const target = historyStack[nextIdx];
      setHistoryIndex(nextIdx);
      cachedHistoryIndex = nextIdx;
      try {
        Spicetify.LocalStorage.set(STORAGE_HISTORY_INDEX, String(nextIdx));
      } catch {}
      handleOpenArtist(target, false);
    }
  }, [historyIndex, historyStack, handleOpenArtist]);

  // Restore active artist on boot if present without clearing search query
  useEffect(() => {
    if (selectedArtist) {
      handleOpenArtist(selectedArtist, false, true);
    }
  }, []);

  // Load Saved Library
  const loadSavedLibrary = useCallback(async () => {
    try {
      if (savedAlbumCache && savedAlbumCache.length > 0) {
        setSavedAlbums(savedAlbumCache);
        if (!savedShuffledCache) {
          savedShuffledCache = fisherYatesShuffle(savedAlbumCache);
        }
        setSavedShuffled(savedShuffledCache);
        return;
      }
      const data = await fetchAllSavedAlbums();
      savedAlbumCache = data;
      setSavedAlbums(data);

      const restored = fisherYatesShuffle(data);
      savedShuffledCache = restored;
      setSavedShuffled(restored);
    } catch (err) {
      console.error("[Random Library] Failed to load saved library:", err);
    }
  }, []);

  // Load Followed Artists
  const loadFollowedArtists = useCallback(async () => {
    try {
      if (followedArtistCache && followedArtistCache.length > 0) {
        setFollowedArtists(followedArtistCache);
        if (!followedArtistShuffledCache) {
          followedArtistShuffledCache = fisherYatesShuffle(followedArtistCache);
        }
        setFollowedArtistsShuffled(followedArtistShuffledCache);
        return;
      }
      const data = await fetchAllFollowedArtists();
      followedArtistCache = data;
      setFollowedArtists(data);

      const restored = fisherYatesShuffle(data);
      followedArtistShuffledCache = restored;
      setFollowedArtistsShuffled(restored);
    } catch (err) {
      console.error("[Random Library] Failed to load followed artists:", err);
    }
  }, []);

  useEffect(() => {
    registerExportMenu();
    Promise.all([loadSavedLibrary(), loadFollowedArtists()])
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [loadSavedLibrary, loadFollowedArtists]);

  // Random Artist Pick (persists active release filter & pushes to history!)
  const handlePickRandomArtist = useCallback(() => {
    if (!followedArtists || followedArtists.length === 0) return;
    const randomArtist = followedArtists[Math.floor(Math.random() * followedArtists.length)];
    handleOpenArtist(randomArtist, true);
  }, [followedArtists, handleOpenArtist]);

  // Random Album Pick (picks and opens a random saved album!)
  const handlePickRandomAlbum = useCallback(() => {
    if (!savedAlbums || savedAlbums.length === 0) return;
    const randomAlbum = savedAlbums[Math.floor(Math.random() * savedAlbums.length)];
    const albumId = getSpotifyId(randomAlbum.uri);
    if (albumId) Spicetify.Platform.History.push("/album/" + albumId);
  }, [savedAlbums]);

  // Reshuffle
  const handleReshuffle = useCallback(() => {
    if (mode === "albums") {
      const fresh = fisherYatesShuffle(savedAlbums);
      savedShuffledCache = fresh;
      setSavedShuffled(fresh);
    } else {
      const fresh = fisherYatesShuffle(followedArtists);
      followedArtistShuffledCache = fresh;
      setFollowedArtistsShuffled(fresh);
    }
  }, [mode, savedAlbums, followedArtists]);

  // Filter & Sort: Albums Mode
  const displayedSavedAlbums = useMemo(() => {
    let list = sortBy === "shuffle" ? [...savedShuffled] : [...savedAlbums];

    if (sortBy === "name-asc") list.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === "name-desc") list.sort((a, b) => b.name.localeCompare(a.name));
    else if (sortBy === "artist-asc") list.sort((a, b) => a.artist.localeCompare(b.artist));
    else if (sortBy === "artist-desc") list.sort((a, b) => b.artist.localeCompare(a.artist));

    if (debouncedMainQuery.trim()) {
      const matcher = createSearchMatcher(debouncedMainQuery);
      list = list.filter((a) => matcher(a.name) || matcher(a.artist));
    }

    return list;
  }, [savedShuffled, savedAlbums, sortBy, debouncedMainQuery]);

  // Filter & Sort: Artists Mode
  const displayedArtists = useMemo(() => {
    let list = sortBy === "shuffle" ? [...followedArtistsShuffled] : [...followedArtists];

    if (sortBy === "artist-asc" || sortBy === "name-asc") list.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === "artist-desc" || sortBy === "name-desc") list.sort((a, b) => b.name.localeCompare(a.name));

    if (debouncedMainQuery.trim()) {
      const matcher = createSearchMatcher(debouncedMainQuery);
      list = list.filter((a) => matcher(a.name));
    }

    return list;
  }, [followedArtistsShuffled, followedArtists, sortBy, debouncedMainQuery]);

  // Fast lookup set of saved album URIs and normalized titles for fuzzy cross-edition saved matching
  const savedUriSet = useMemo(() => {
    return new Set(savedAlbums.map((a) => a.uri));
  }, [savedAlbums]);

  const savedNameSet = useMemo(() => {
    const set = new Set();
    for (const a of savedAlbums) {
      const norm = normalizeAlbumTitle(a.name);
      const normArtist = normalizeAlbumTitle(a.artist);
      if (norm && normArtist) {
        set.add(`${normArtist}:${norm}`);
      }
    }
    return set;
  }, [savedAlbums]);

  // Exact unmodified saved album names scoped to artist
  const savedExactNameSet = useMemo(() => {
    const set = new Set();
    for (const a of savedAlbums) {
      const normArtist = normalizeAlbumTitle(a.artist);
      if (a.name && normArtist) {
        set.add(`${normArtist}:${a.name.toLowerCase().trim()}`);
      }
    }
    return set;
  }, [savedAlbums]);

  const isAlbumSaved = useCallback(
    (album) => {
      if (!album) return false;
      if (savedUriSet.has(album.uri)) return true;
      const norm = normalizeAlbumTitle(album.name);
      const normArtist = normalizeAlbumTitle(album.artist || (selectedArtist ? selectedArtist.name : ""));
      if (norm && normArtist) {
        return savedNameSet.has(`${normArtist}:${norm}`);
      }
      return false;
    },
    [savedUriSet, savedNameSet, selectedArtist]
  );

  // Deduplicate releases in artist discography, prioritize saved version, or newest/expanded edition
  const deduplicatedArtistReleases = useMemo(() => {
    const map = new Map();

    for (const album of artistReleases) {
      const norm = normalizeAlbumTitle(album.name) || album.name.toLowerCase().trim();
      const key = norm;
      const normArtist = normalizeAlbumTitle(album.artist || (selectedArtist ? selectedArtist.name : ""));
      const isExactEditionSaved = savedUriSet.has(album.uri) || (
        normArtist ? savedExactNameSet.has(`${normArtist}:${album.name.toLowerCase().trim()}`) : false
      );
      const edition = getEditionInfo(album.name);

      const entry = {
        uri: album.uri,
        name: album.name,
        imageUrl: album.imageUrl,
        type: album.type || "album",
        releaseDate: album.releaseDate || "",
        editionLabel: edition.label,
        isDeluxe: edition.isDeluxe,
        isRemaster: edition.isRemaster,
        isSaved: isExactEditionSaved,
      };

      const existing = map.get(key);
      if (!existing) {
        map.set(key, {
          ...album,
          baseTitle: norm,
          editions: [entry],
        });
      } else {
        if (!existing.editions.some((e) => e.uri === album.uri)) {
          existing.editions.push(entry);
        }
        if (existing.type !== "album" && album.type === "album") {
          existing.type = "album";
        }
      }
    }

    return Array.from(map.values()).map((album) => {
      const editions = album.editions || [];
      const hasEditions = editions.length > 1;

      // 1. Check if user has an edition saved in their library
      const savedEdition = editions.find((e) => e.isSaved);

      // 2. Select primary edition:
      // - If in library: use the saved edition
      // - If not in library: prefer Deluxe/Expanded > Remaster > Newest Release Date
      let selectedEdition;
      if (savedEdition) {
        selectedEdition = savedEdition;
      } else {
        const sorted = [...editions].sort((a, b) => {
          if (a.isDeluxe !== b.isDeluxe) return a.isDeluxe ? -1 : 1;
          if (a.isRemaster !== b.isRemaster) return a.isRemaster ? -1 : 1;
          const dateA = String(a.releaseDate || "");
          const dateB = String(b.releaseDate || "");
          return dateB.localeCompare(dateA);
        });
        selectedEdition = sorted[0] || album;
      }

      const hasDeluxeEdition = editions.some((e) => e.isDeluxe || e.isRemaster);
      const savedIsDeluxe = savedEdition && (savedEdition.isDeluxe || savedEdition.isRemaster);
      // Upgrade is true when multiple editions exist, you have an edition saved, but it's not the deluxe version
      const hasUpgrade = hasEditions && Boolean(savedEdition) && !savedIsDeluxe && hasDeluxeEdition;

      return {
        ...album,
        uri: selectedEdition.uri,
        name: selectedEdition.name,
        imageUrl: selectedEdition.imageUrl || album.imageUrl,
        isSaved: Boolean(savedEdition),
        hasAlternativeEditions: hasEditions,
        hasUpgradeAvailable: hasUpgrade,
        editions,
      };
    }).sort((a, b) => {
      const dateA = String(a.releaseDate || a.year || "");
      const dateB = String(b.releaseDate || b.year || "");
      return dateB.localeCompare(dateA);
    });
  }, [artistReleases, savedUriSet, savedExactNameSet]);

  // Filter & Sort: Discography View
  const typeCounts = useMemo(() => {
    const counts = { all: deduplicatedArtistReleases.length, saved: 0, has_editions: 0 };
    for (const a of deduplicatedArtistReleases) {
      const t = a.type || "album";
      counts[t] = (counts[t] || 0) + 1;
      if (a.isSaved) {
        counts.saved = (counts.saved || 0) + 1;
      }
      if (a.hasAlternativeEditions) {
        counts.has_editions = (counts.has_editions || 0) + 1;
      }
    }
    return counts;
  }, [deduplicatedArtistReleases]);

  const displayedArtistReleases = useMemo(() => {
    let list = [...deduplicatedArtistReleases];

    if (releaseFilter === "saved") {
      list = list.filter((a) => a.isSaved);
    } else if (releaseFilter === "has_editions") {
      list = list.filter((a) => a.hasAlternativeEditions);
    } else if (releaseFilter !== "all") {
      list = list.filter((a) => a.type === releaseFilter);
    }

    if (debouncedArtistQuery.trim()) {
      const matcher = createSearchMatcher(debouncedArtistQuery);
      list = list.filter((a) => matcher(a.name));
    }

    return list;
  }, [deduplicatedArtistReleases, releaseFilter, debouncedArtistQuery]);

  // Sliced visible items for high-performance rendering (60 at a time)
  const visibleSavedAlbums = useMemo(() => {
    return displayedSavedAlbums.slice(0, visibleCount);
  }, [displayedSavedAlbums, visibleCount]);

  const visibleArtists = useMemo(() => {
    return displayedArtists.slice(0, visibleCount);
  }, [displayedArtists, visibleCount]);

  const visibleArtistReleases = useMemo(() => {
    return displayedArtistReleases.slice(0, visibleCount);
  }, [displayedArtistReleases, visibleCount]);

  const currentTotalCount = selectedArtist
    ? displayedArtistReleases.length
    : mode === "albums"
    ? displayedSavedAlbums.length
    : displayedArtists.length;

  const currentVisibleCount = selectedArtist
    ? visibleArtistReleases.length
    : mode === "albums"
    ? visibleSavedAlbums.length
    : visibleArtists.length;

  // IntersectionObserver for seamless infinite scrolling near bottom
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => {
            if (prev < currentTotalCount) {
              return Math.min(prev + LOAD_MORE_STEP, currentTotalCount);
            }
            return prev;
          });
        }
      },
      { rootMargin: "600px" }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [currentTotalCount]);

  const renderPaginationFooter = () => {
    if (currentTotalCount === 0) return null;
    return React.createElement(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
          marginTop: "32px",
          marginBottom: "32px",
        },
      },
      // Sentinel element for IntersectionObserver
      visibleCount < currentTotalCount &&
        React.createElement("div", { ref: sentinelRef, style: { height: 1, width: "100%" } }),

      // Status Count Counter
      React.createElement(
        "div",
        { style: { fontSize: "13px", color: "var(--spice-subtext, rgba(255, 255, 255, 0.6))", fontWeight: 500 } },
        `Showing ${currentVisibleCount} of ${currentTotalCount} ${
          selectedArtist ? "releases" : mode === "albums" ? "saved albums" : "artists"
        }`
      ),

      // Manual Load More / Show All Buttons
      visibleCount < currentTotalCount &&
        React.createElement(
          "div",
          { style: { display: "flex", gap: "10px" } },
          React.createElement(
            "button",
            {
              className: "rl-filter-pill active",
              style: {
                background: "#1ed760",
                color: "#000",
                border: "none",
                borderRadius: "500px",
                padding: "8px 22px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
              },
              onClick: () =>
                setVisibleCount((prev) => Math.min(prev + LOAD_MORE_STEP, currentTotalCount)),
            },
            `Load More (+${Math.min(LOAD_MORE_STEP, currentTotalCount - visibleCount)})`
          ),
          React.createElement(
            "button",
            {
              className: "rl-filter-pill",
              style: {
                background: "rgba(255, 255, 255, 0.08)",
                color: "#fff",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "500px",
                padding: "8px 18px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              },
              onClick: () => setVisibleCount(currentTotalCount),
            },
            "Show All"
          )
        )
    );
  };

  const hasArtistFilters = artistSearchQuery.trim() !== "" || releaseFilter !== "all";
  const hasMainFilters = mainSearchQuery.trim() !== "" || sortBy !== "shuffle";

  function handleClearArtistFilters() {
    setArtistSearchQuery("");
    cachedArtistSearchQuery = "";
    handleFilterChange("all");
  }

  function handleClearMainFilters() {
    setMainSearchQuery("");
    cachedMainSearchQuery = "";
    setSortBy("shuffle");
    cachedSortBy = "shuffle";
  }

  if (loading) {
    return React.createElement(
      "div",
      { style: STYLES.loadingContainer },
      React.createElement("div", { style: { fontSize: "16px" } }, "Loading your library\u2026")
    );
  }

  if (error) {
    return React.createElement(
      "div",
      { style: { ...STYLES.loadingContainer, color: "#f15e6c" } },
      "Error: " + error
    );
  }

  const renderSettingsBtn = () =>
    React.createElement(
      "button",
      {
        className: "rl-action-btn",
        style: STYLES.actionBtn,
        onClick: () => setShowSettings(true),
        title: "Random Library Settings",
        "aria-label": "Settings",
      },
      React.createElement(
        "svg",
        { width: "15", height: "15", viewBox: "0 0 24 24", fill: "currentColor" },
        React.createElement("path", {
          d: "M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z",
        })
      ),
      "Settings"
    );

  return React.createElement(
    "div",
    { style: STYLES.page },

    // Header
    React.createElement(
      "div",
      { style: STYLES.header },
      // Left: Title, Subtitle, and Standardized Mode Toggles (Anchored)
      React.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" } },
        React.createElement(
          "div",
          { style: STYLES.titleGroup },
          React.createElement("div", { style: STYLES.title }, "Random Library"),
          React.createElement(
            "div",
            { style: STYLES.subtitle },
            selectedArtist
              ? `${displayedArtistReleases.length} releases for ${selectedArtist.name}`
              : mode === "albums"
              ? `${displayedSavedAlbums.length} saved albums ${sortBy === "shuffle" ? "shuffled" : "listed"}`
              : `${displayedArtists.length} followed artists ${sortBy === "shuffle" ? "shuffled" : "listed"}`
          )
        ),
        // Standardized Mode switch pills
        React.createElement(
          "div",
          { style: STYLES.modeToggleGroup },
          React.createElement(
            "button",
            {
              className: `rl-mode-btn ${mode === "albums" ? "active" : ""}`,
              style: STYLES.modeBtn(mode === "albums"),
              onClick: () => handleModeChange("albums"),
            },
            "Albums"
          ),
          React.createElement(
            "button",
            {
              className: `rl-mode-btn ${mode === "artists" ? "active" : ""}`,
              style: STYLES.modeBtn(mode === "artists"),
              onClick: () => handleModeChange("artists"),
            },
            "Artists"
          )
        )
      ),

      // Right: Action buttons (Symmetric)
      React.createElement(
        "div",
        { style: STYLES.headerControls },
        // Random Album Button (in Albums mode)
        mode === "albums" && React.createElement(
          "button",
          {
            style: STYLES.actionBtn,
            onClick: handlePickRandomAlbum,
          },
          React.createElement(
            "svg",
            { width: "16", height: "16", viewBox: "0 0 24 24", fill: "currentColor" },
            React.createElement("path", {
              d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z",
            })
          ),
          "Random Album"
        ),

        // Random Artist Button (in Artists mode) with in-app History navigation
        mode === "artists" && React.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: "6px" } },
          historyStack.length > 1 && React.createElement(
            "div",
            { style: STYLES.historyNavGroup },
            React.createElement(
              "button",
              {
                style: STYLES.historyBtn(canGoBack),
                onClick: handleHistoryBack,
                disabled: !canGoBack,
                title: canGoBack ? `Previous: ${historyStack[historyIndex - 1]?.name}` : "No previous history",
                "aria-label": "Previous Artist",
              },
              React.createElement(
                "svg",
                { width: "16", height: "16", viewBox: "0 0 24 24", fill: "currentColor" },
                React.createElement("path", { d: "M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" })
              )
            ),
            React.createElement(
              "button",
              {
                style: STYLES.historyBtn(canGoForward),
                onClick: handleHistoryForward,
                disabled: !canGoForward,
                title: canGoForward ? `Next: ${historyStack[historyIndex + 1]?.name}` : "No forward history",
                "aria-label": "Next Artist",
              },
              React.createElement(
                "svg",
                { width: "16", height: "16", viewBox: "0 0 24 24", fill: "currentColor" },
                React.createElement("path", { d: "M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" })
              )
            )
          ),
          React.createElement(
            "button",
            {
              style: STYLES.actionBtn,
              onClick: handlePickRandomArtist,
            },
            React.createElement(
              "svg",
              { width: "16", height: "16", viewBox: "0 0 24 24", fill: "currentColor" },
              React.createElement("path", {
                d: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
              })
            ),
            "Random Artist"
          )
        ),

        // Refresh / Sync button
        React.createElement(
          "button",
          {
            className: "rl-action-btn",
            style: {
              ...STYLES.actionBtn,
              opacity: refreshing ? 0.6 : 1,
              cursor: refreshing ? "default" : "pointer",
            },
            onClick: handleRefresh,
            disabled: refreshing,
            title: "Sync latest library & artist changes",
            "aria-label": "Refresh Library",
          },
          React.createElement(
            "svg",
            {
              width: "14",
              height: "14",
              viewBox: "0 0 24 24",
              fill: "currentColor",
              style: {
                animation: refreshing ? "rl-spin 0.8s linear infinite" : "none",
                display: "block",
              },
            },
            React.createElement("path", {
              d: "M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z",
            })
          ),
          refreshing ? "Syncing\u2026" : "Refresh"
        ),

        // Shuffle button
        React.createElement(
          "button",
          {
            style: STYLES.shuffleBtn,
            onClick: handleReshuffle,
            onMouseDown: (e) => { e.currentTarget.style.transform = "scale(0.95)"; },
            onMouseUp: (e) => { e.currentTarget.style.transform = "scale(1)"; },
            onMouseLeave: (e) => { e.currentTarget.style.transform = "scale(1)"; },
          },
          React.createElement(
            "svg",
            { width: "16", height: "16", viewBox: "0 0 16 16", fill: "currentColor" },
            React.createElement("path", {
              d: "M4.5 6.8l.7-.8C4.1 4.7 2.5 4 .9 4v1c1.3 0 2.6.6 3.5 1.6l.1.2zm7.5 4.7c-1.2 0-2.3-.5-3.2-1.3l-.6.8c1 1 2.4 1.5 3.8 1.5V14l3.5-2-3.5-2v1.5zm0-6V7l3.5-2L12 3v1.5c-1.6 0-3.2.7-4.2 2l-3.4 3.9c-.9 1-2.2 1.6-3.5 1.6v1c1.6 0 3.2-.7 4.2-2l3.4-3.9c.9-1 2.2-1.6 3.5-1.6z",
            })
          ),
          "Shuffle"
        )
      )
    ),

    // -----------------------------------------------------------------------
    // VIEW 1: Specific Artist Discography (When an artist is selected)
    // -----------------------------------------------------------------------
    selectedArtist && React.createElement(
      "div",
      null,
      // Top navigation bar with Back button and In-app History Navigation
      React.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" } },
        React.createElement(
          "button",
          {
            style: STYLES.backBtn,
            onClick: handleCloseArtist,
          },
          React.createElement(
            "svg",
            { width: "16", height: "16", viewBox: "0 0 24 24", fill: "currentColor" },
            React.createElement("path", { d: "M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" })
          ),
          "Back to Artists"
        ),
        historyStack.length > 1 && React.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: "8px" } },
          React.createElement(
            "span",
            { style: { fontSize: "11px", color: "var(--spice-subtext)", fontWeight: "600" } },
            `${historyIndex + 1} of ${historyStack.length}`
          ),
          React.createElement(
            "div",
            { style: STYLES.historyNavGroup },
            React.createElement(
              "button",
              {
                style: STYLES.historyBtn(canGoBack),
                onClick: handleHistoryBack,
                disabled: !canGoBack,
                title: canGoBack ? `Previous: ${historyStack[historyIndex - 1]?.name}` : "No previous artist",
                "aria-label": "Previous Artist",
              },
              React.createElement(
                "svg",
                { width: "16", height: "16", viewBox: "0 0 24 24", fill: "currentColor" },
                React.createElement("path", { d: "M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" })
              )
            ),
            React.createElement(
              "button",
              {
                style: STYLES.historyBtn(canGoForward),
                onClick: handleHistoryForward,
                disabled: !canGoForward,
                title: canGoForward ? `Next: ${historyStack[historyIndex + 1]?.name}` : "No forward history",
                "aria-label": "Next Artist",
              },
              React.createElement(
                "svg",
                { width: "16", height: "16", viewBox: "0 0 24 24", fill: "currentColor" },
                React.createElement("path", { d: "M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" })
              )
            )
          )
        )
      ),

      // Artist Banner
      React.createElement(
        "div",
        { style: STYLES.artistBanner },
        selectedArtist.imageUrl && React.createElement("img", {
          src: selectedArtist.imageUrl,
          alt: selectedArtist.name,
          style: { ...STYLES.artistBannerAvatar, cursor: "pointer" },
          onClick: () => {
            const id = selectedArtist.uri ? selectedArtist.uri.split(":").pop() : selectedArtist.id;
            if (id) Spicetify.Platform.History.push("/artist/" + id);
          },
          title: `Go to ${selectedArtist.name}'s Spotify profile`,
        }),
        React.createElement(
          "div",
          { style: { flex: 1 } },
          React.createElement(
            "div",
            {
              className: "rl-banner-artist-link",
              style: { ...STYLES.artistBannerName, cursor: "pointer", display: "inline-block" },
              onClick: () => {
                const id = selectedArtist.uri ? selectedArtist.uri.split(":").pop() : selectedArtist.id;
                if (id) Spicetify.Platform.History.push("/artist/" + id);
              },
              onMouseEnter: (e) => (e.currentTarget.style.textDecoration = "underline"),
              onMouseLeave: (e) => (e.currentTarget.style.textDecoration = "none"),
              title: `Go to ${selectedArtist.name}'s Spotify profile`,
            },
            selectedArtist.name
          ),
          React.createElement(
            "div",
            { style: STYLES.artistBannerSub },
            `${displayedArtistReleases.length} releases available`
          )
        ),
        React.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" } },
          React.createElement(
            "button",
            {
              style: STYLES.actionBtn,
              onClick: () => {
                const id = selectedArtist.uri ? selectedArtist.uri.split(":").pop() : selectedArtist.id;
                if (id) Spicetify.Platform.History.push("/artist/" + id);
              },
              title: `Open ${selectedArtist.name}'s official Spotify profile`,
            },
            React.createElement(
              "svg",
              { width: "16", height: "16", viewBox: "0 0 24 24", fill: "currentColor" },
              React.createElement("path", {
                d: "M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z",
              })
            ),
            "Artist Page"
          ),
          React.createElement(
            "button",
            {
              style: STYLES.shuffleBtn,
              onClick: () => Spicetify.Player.playUri(selectedArtist.uri),
            },
            "Play Artist"
          ),
          renderSettingsBtn()
        )
      ),

      // Filter Section for Artist Discography
      React.createElement(
        "div",
        { style: STYLES.filterSection },
        React.createElement(FilterPills, {
          activeFilter: releaseFilter,
          onFilterChange: handleFilterChange,
          typeCounts,
        }),
        React.createElement(
          "div",
          { style: STYLES.controlsRow },
          React.createElement(
            "div",
            { style: { display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", flex: "1 1 auto" } },
            React.createElement(
              "div",
              { style: STYLES.searchWrapper },
              React.createElement(
                "svg",
                { style: STYLES.searchIcon, width: "14", height: "14", viewBox: "0 0 24 24", fill: "currentColor" },
                React.createElement("path", {
                  d: "M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z",
                })
              ),
              React.createElement("input", {
                type: "text",
                placeholder: `Search in ${selectedArtist.name} releases\u2026`,
                value: artistSearchQuery,
                onChange: (e) => setArtistSearchQuery(e.target.value),
                style: STYLES.searchInput,
              })
            ),
            hasArtistFilters && React.createElement(
              "button",
              { style: STYLES.clearBtn, onClick: handleClearArtistFilters },
              "Clear filters"
            )
          )
        )
      ),

      // Loading state for discography
      artistReleasesLoading && React.createElement(
        "div",
        { style: STYLES.loadingContainer },
        "Loading artist discography\u2026"
      ),

      // Discography Grid
      !artistReleasesLoading && displayedArtistReleases.length > 0 && React.createElement(
        "div",
        { style: STYLES.grid, className: "rl-grid main-gridContainer-gridContainer" },
        visibleArtistReleases.map((album) =>
          React.createElement(AlbumCard, {
            key: album.uri,
            album,
            isSaved: Boolean(album.isSaved || isAlbumSaved(album)),
            groupColors,
          })
        )
      ),

      !artistReleasesLoading && renderPaginationFooter(),

      !artistReleasesLoading && displayedArtistReleases.length === 0 && React.createElement(
        "div",
        { style: STYLES.loadingContainer },
        "No releases match your filter."
      )
    ),

    // -----------------------------------------------------------------------
    // VIEW 2: Artists Grid (When no artist is selected)
    // -----------------------------------------------------------------------
    !selectedArtist && mode === "artists" && React.createElement(
      "div",
      null,
      // Search & Sort bar
      React.createElement(
        "div",
        { style: STYLES.filterSection },
        React.createElement(
          "div",
          { style: STYLES.controlsRow },
          React.createElement(
            "div",
            { style: { display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", flex: "1 1 auto" } },
            React.createElement(
              "div",
              { style: STYLES.searchWrapper },
              React.createElement(
                "svg",
                { style: STYLES.searchIcon, width: "14", height: "14", viewBox: "0 0 24 24", fill: "currentColor" },
                React.createElement("path", {
                  d: "M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z",
                })
              ),
              React.createElement("input", {
                type: "text",
                placeholder: "Search followed artists\u2026",
                value: mainSearchQuery,
                onChange: (e) => setMainSearchQuery(e.target.value),
                style: STYLES.searchInput,
              })
            ),

            React.createElement(
              "div",
              { style: STYLES.selectWrapper },
              React.createElement(
                "select",
                {
                  value: sortBy,
                  onChange: (e) => {
                    setSortBy(e.target.value);
                    cachedSortBy = e.target.value;
                  },
                  style: STYLES.select,
                },
                React.createElement("option", { value: "shuffle" }, "Shuffled"),
                React.createElement("option", { value: "artist-asc" }, "Artist A\u2013Z"),
                React.createElement("option", { value: "artist-desc" }, "Artist Z\u2013A")
              ),
              React.createElement(
                "svg",
                { style: STYLES.selectChevron, width: "12", height: "12", viewBox: "0 0 24 24", fill: "currentColor" },
                React.createElement("path", { d: "M7 10l5 5 5-5z" })
              )
            ),

            hasMainFilters && React.createElement(
              "button",
              { style: STYLES.clearBtn, onClick: handleClearMainFilters },
              "Clear filters"
            )
          ),
          renderSettingsBtn()
        )
      ),

      // Artists Grid
      displayedArtists.length > 0 && React.createElement(
        "div",
        { style: STYLES.grid, className: "rl-grid main-gridContainer-gridContainer" },
        visibleArtists.map((artist) =>
          React.createElement(ArtistCard, {
            key: artist.uri || artist.id,
            artist,
            onClick: handleOpenArtist,
          })
        )
      ),

      renderPaginationFooter(),

      displayedArtists.length === 0 && React.createElement(
        "div",
        { style: STYLES.loadingContainer },
        "No followed artists found matching your search."
      )
    ),

    // -----------------------------------------------------------------------
    // VIEW 3: Albums Grid
    // -----------------------------------------------------------------------
    !selectedArtist && mode === "albums" && React.createElement(
      "div",
      null,
      // Search & Sort bar
      React.createElement(
        "div",
        { style: STYLES.filterSection },
        React.createElement(
          "div",
          { style: STYLES.controlsRow },
          React.createElement(
            "div",
            { style: { display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", flex: "1 1 auto" } },
            React.createElement(
              "div",
              { style: STYLES.searchWrapper },
              React.createElement(
                "svg",
                { style: STYLES.searchIcon, width: "14", height: "14", viewBox: "0 0 24 24", fill: "currentColor" },
                React.createElement("path", {
                  d: "M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z",
                })
              ),
              React.createElement("input", {
                type: "text",
                placeholder: "Search albums or artists\u2026",
                value: mainSearchQuery,
                onChange: (e) => setMainSearchQuery(e.target.value),
                style: STYLES.searchInput,
              })
            ),

            React.createElement(
              "div",
              { style: STYLES.selectWrapper },
              React.createElement(
                "select",
                {
                  value: sortBy,
                  onChange: (e) => {
                    setSortBy(e.target.value);
                    cachedSortBy = e.target.value;
                  },
                  style: STYLES.select,
                },
                React.createElement("option", { value: "shuffle" }, "Shuffled"),
                React.createElement("option", { value: "name-asc" }, "Album A\u2013Z"),
                React.createElement("option", { value: "name-desc" }, "Album Z\u2013A"),
                React.createElement("option", { value: "artist-asc" }, "Artist A\u2013Z"),
                React.createElement("option", { value: "artist-desc" }, "Artist Z\u2013A")
              ),
              React.createElement(
                "svg",
                { style: STYLES.selectChevron, width: "12", height: "12", viewBox: "0 0 24 24", fill: "currentColor" },
                React.createElement("path", { d: "M7 10l5 5 5-5z" })
              )
            ),

            hasMainFilters && React.createElement(
              "button",
              { style: STYLES.clearBtn, onClick: handleClearMainFilters },
              "Clear filters"
            )
          ),
          renderSettingsBtn()
        )
      ),

      // Albums Grid
      displayedSavedAlbums.length > 0 && React.createElement(
        "div",
        { style: STYLES.grid, className: "rl-grid main-gridContainer-gridContainer" },
        visibleSavedAlbums.map((album) =>
          React.createElement(AlbumCard, {
            key: album.uri,
            album,
            isSaved: true,
            groupColors,
          })
        )
      ),

      renderPaginationFooter(),

      displayedSavedAlbums.length === 0 && React.createElement(
        "div",
        { style: STYLES.loadingContainer },
        "No saved albums match your search."
      )
    ),

    // Settings Modal Portal (rendered at top level so it works from any view)
    showSettings &&
      React.createElement(SettingsModal, {
        onClose: () => setShowSettings(false),
        groupColors,
        onGroupColorsChange: (newColors) => setGroupColors(newColors),
      })
  );
}

// ---------------------------------------------------------------------------
// Entry Point
// ---------------------------------------------------------------------------
function render() {
  return React.createElement(RandomLibraryApp);
}
