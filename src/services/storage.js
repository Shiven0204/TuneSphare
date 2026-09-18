const STORAGE_KEYS = Object.freeze({
  likedSongs: "tunesphare-liked-songs",
  recentlyPlayed: "tunesphare-recently-played",
});

const LEGACY_NUMERIC_IDS = Object.freeze({
  1: "barsaat",
  2: "bairan",
  3: "tu-zaroori",
});

function getStoredData(key, fallback = null) {
  try {
    const storedValue = window.localStorage.getItem(key);
    if (storedValue === null) return fallback;
    return JSON.parse(storedValue);
  } catch {
    return fallback;
  }
}

function setStoredData(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function removeStoredData(key) {
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function getStoredSongIds(key, songs) {
  const validIds = new Set(songs.map((song) => song.id));
  const storedIds = getStoredData(key, []);
  if (!Array.isArray(storedIds)) return [];

  return [...new Set(storedIds)]
    .map((songId) => LEGACY_NUMERIC_IDS[songId] || songId)
    .filter((songId) => validIds.has(songId));
}

export {
  STORAGE_KEYS,
  getStoredData,
  setStoredData,
  removeStoredData,
  getStoredSongIds,
};
