const STORAGE_KEYS = Object.freeze({
  likedSongs: "echoverse-liked-songs",
  recentlyPlayed: "echoverse-recently-played",
  queue: "echoverse-queue",
  shuffle: "echoverse-shuffle",
  repeatMode: "echoverse-repeat-mode",
});

function readIds(storageKey) {
  try {
    const storedValue = localStorage.getItem(storageKey);
    const parsedValue = storedValue ? JSON.parse(storedValue) : [];

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return [...new Set(parsedValue)].map(Number).filter(Number.isFinite);
  } catch (error) {
    return [];
  }
}

function saveIds(storageKey, songIds) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(songIds));
  } catch (error) {
    // Storage can be unavailable in restricted browser contexts.
  }
}

function readValue(storageKey, fallback) {
  try {
    const value = localStorage.getItem(storageKey);
    return value === null ? fallback : value;
  } catch (error) {
    return fallback;
  }
}

function saveValue(storageKey, value) {
  try {
    localStorage.setItem(storageKey, value);
  } catch (error) {
    // Storage can be unavailable in restricted browser contexts.
  }
}

export function getLikedSongs() {
  return readIds(STORAGE_KEYS.likedSongs);
}

export function saveLikedSongs(songIds) {
  saveIds(STORAGE_KEYS.likedSongs, songIds);
}

export function getRecentlyPlayed() {
  return readIds(STORAGE_KEYS.recentlyPlayed);
}

export function saveRecentlyPlayed(songIds) {
  saveIds(STORAGE_KEYS.recentlyPlayed, songIds);
}

export function getQueueSongs() {
  return readIds(STORAGE_KEYS.queue);
}

export function saveQueueSongs(songIds) {
  saveIds(STORAGE_KEYS.queue, songIds);
}

export function getShuffleMode() {
  return readValue(STORAGE_KEYS.shuffle, "false") === "true";
}

export function saveShuffleMode(isEnabled) {
  saveValue(STORAGE_KEYS.shuffle, String(Boolean(isEnabled)));
}

export function getRepeatMode() {
  const mode = readValue(STORAGE_KEYS.repeatMode, "off");
  return ["off", "all", "one"].includes(mode) ? mode : "off";
}

export function saveRepeatMode(mode) {
  if (["off", "all", "one"].includes(mode)) {
    saveValue(STORAGE_KEYS.repeatMode, mode);
  }
}
