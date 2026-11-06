// Random Library background sync. Spicetify loads this whenever Spotify runs, so saved albums
// and followed artists reach the Spicetify Library server even while the app page is closed.
// The app's own Sync Now and Refresh buttons push through window.RandomLibrarySync as well.
(function randomLibrarySync() {
  const STORAGE_WEB_SYNC_URL = "spicetify-library:url";
  const STORAGE_SETTINGS = "random-library:settings";
  const STORAGE_ALBUM_META = "random-library:album-meta";
  const DEFAULT_GROUP_COLORS = { album: "#8b5cf6", ep: "#38bdf8", single: "#10b981" };
  const DEBOUNCE_MS = 1000;
  const PAGE_SIZE = 50;

  let lastBody = "";
  let timer = null;
  let running = false;
  let rerun = false;

  function storageGet(key) {
    try {
      return Spicetify.LocalStorage.get(key);
    } catch {
      return null;
    }
  }

  function getWebSyncUrl() {
    return (storageGet(STORAGE_WEB_SYNC_URL) || "").trim().replace(/\/+$/, "");
  }

  function withDefaultColors(colors) {
    return {
      album: colors.album || DEFAULT_GROUP_COLORS.album,
      ep: colors.ep || DEFAULT_GROUP_COLORS.ep,
      single: colors.single || DEFAULT_GROUP_COLORS.single,
    };
  }

  // Same precedence as the app: Random Library's own colors when unlinked, else Release List's
  function getGroupColors() {
    try {
      const local = JSON.parse(storageGet(STORAGE_SETTINGS) || "{}") || {};
      if (local.syncWithReleaseList === false && local.groupColors) return withDefaultColors(local.groupColors);
      const releaseList = JSON.parse(storageGet("release-list:settings") || "{}") || {};
      if (releaseList.groupColors) return withDefaultColors(releaseList.groupColors);
      if (local.groupColors) return withDefaultColors(local.groupColors);
    } catch {}
    return DEFAULT_GROUP_COLORS;
  }

  function loadAlbumMeta() {
    const meta = new Map();
    try {
      const raw = JSON.parse(storageGet(STORAGE_ALBUM_META) || "{}");
      for (const [uri, [releaseDate, trackCount]] of Object.entries(raw)) meta.set(uri, { releaseDate, trackCount });
    } catch {}
    return meta;
  }

  function classifyRelease(item) {
    const hint = String(item.album_group || "").toLowerCase();
    if (hint.includes("single") || hint.includes("ep")) return "single";
    if (hint.includes("album")) return "album";
    const group = String(item.album_type || item.albumType || item.type || item.__typename || "album").toLowerCase();
    return group.includes("single") || group.includes("ep") ? "single" : "album";
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

  async function fetchLibrary(filter, accept) {
    const items = [];
    const seen = new Set();
    let offset = 0;
    let total = Infinity;
    while (offset < total) {
      const res = await Spicetify.Platform.LibraryAPI.getContents({ filters: [filter], sortOrder: "RECENTLY_ADDED", limit: PAGE_SIZE, offset });
      if (!res?.items?.length) break;
      for (const item of res.items) {
        if (!item.uri || seen.has(item.uri) || !accept(item)) continue;
        seen.add(item.uri);
        items.push(item);
      }
      total = res.totalLength ?? res.total ?? items.length;
      offset += PAGE_SIZE;
    }
    return items;
  }

  async function fetchSavedAlbums() {
    const items = await fetchLibrary("0", (item) => item.uri.startsWith("spotify:album:"));
    return items.map((item) => {
      const first = item.artists?.[0];
      return {
        uri: item.uri,
        name: item.name,
        artist: item.artists?.map((a) => a.name).join(", ") ?? "Unknown Artist",
        artistNames: item.artists?.map((a) => a.name).filter(Boolean) ?? [],
        artistUri: first?.uri || item.artistUri || (first?.id ? `spotify:artist:${first.id}` : ""),
        imageUrl: item.images?.[0]?.url ?? item.imgUrl ?? "",
        type: classifyRelease(item),
        releaseDate: extractReleaseDateStr(item),
      };
    });
  }

  async function fetchFollowedArtists() {
    const items = await fetchLibrary("1", (item) => item.uri.startsWith("spotify:artist:"));
    return items.map((item) => ({ uri: item.uri, name: item.name, imageUrl: item.images?.[0]?.url ?? item.imgUrl ?? "" }));
  }

  // PUT /api/library on Spicetify Library; the shape is shared with SYNCS in its server.js
  async function push(albums, artists, notify = false) {
    const baseUrl = getWebSyncUrl();
    if (!baseUrl || !albums?.length) {
      if (notify) Spicetify.showNotification?.(baseUrl ? "No saved albums to sync." : "Set a Web Sync address first.", true);
      return;
    }
    if (!artists) artists = await fetchFollowedArtists();

    const meta = loadAlbumMeta();
    const body = JSON.stringify({
      albums: albums.map((a) => ({
        uri: a.uri,
        name: a.name,
        artist: a.artist,
        artistNames: a.artistNames || [],
        artistUri: a.artistUri || "",
        imageUrl: a.imageUrl || "",
        type: a.type || "album",
        releaseDate: meta.get(a.uri)?.releaseDate || a.releaseDate || "",
        trackCount: meta.get(a.uri)?.trackCount || 0,
      })),
      artists: artists.map((a) => ({ uri: a.uri, name: a.name, imageUrl: a.imageUrl || "" })),
      groupColors: getGroupColors(),
    });
    if (!notify && body === lastBody) return;

    try {
      const res = await fetch(`${baseUrl}/api/library`, { method: "PUT", headers: { "Content-Type": "application/json" }, body });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      lastBody = body;
      if (notify) Spicetify.showNotification?.(`Synced ${albums.length} albums and ${artists.length} artists to the web.`);
    } catch (err) {
      console.warn("[Random Library] Web sync failed:", err);
      if (notify) Spicetify.showNotification?.(`Web sync failed: ${err.message || err}`, true);
    }
  }

  async function syncNow() {
    if (running) {
      rerun = true;
      return;
    }
    running = true;
    try {
      do {
        rerun = false;
        if (!getWebSyncUrl()) return;
        const [albums, artists] = await Promise.all([fetchSavedAlbums(), fetchFollowedArtists()]);
        await push(albums, artists);
      } while (rerun);
    } catch (err) {
      console.warn("[Random Library] Background sync failed:", err);
    } finally {
      running = false;
    }
  }

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(syncNow, DEBOUNCE_MS);
  }

  window.RandomLibrarySync = { push, syncNow: schedule };

  (async function start() {
    while (!Spicetify?.Platform?.LibraryAPI?.getEvents) await new Promise((resolve) => setTimeout(resolve, 300));
    Spicetify.Platform.LibraryAPI.getEvents().addListener("update", (event) => {
      const list = event?.data?.list;
      if (!list || list === "albums" || list === "artists") schedule();
    });
    // Catch up on changes made on other devices while Spotify was closed
    schedule();
  })();
})();
