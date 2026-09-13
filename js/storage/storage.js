const STORAGE_KEYS = Object.freeze({
  likedSongs: "tunesphare-liked-songs",
  recentlyPlayed: "tunesphare-recently-played",
  queue: "tunesphare-queue",
  shuffle: "tunesphare-shuffle",
  repeatMode: "tunesphare-repeat-mode",
});

const LEGACY_STORAGE_KEYS = Object.freeze({
  likedSongs: "echoverse-liked-songs",
  recentlyPlayed: "echoverse-recently-played",
  queue: "echoverse-queue",
  shuffle: "echoverse-shuffle",
  repeatMode: "echoverse-repeat-mode",
});

const STORAGE_MIGRATION_KEY = "tunesphare-storage-migrated";

function migrateLegacyStorage() {
  try {
    if (localStorage.getItem(STORAGE_MIGRATION_KEY) === "1") return;

    Object.keys(STORAGE_KEYS).forEach((storageName) => {
      const newKey = STORAGE_KEYS[storageName];
      const oldKey = LEGACY_STORAGE_KEYS[storageName];
      const newValue = localStorage.getItem(newKey);
      const oldValue = localStorage.getItem(oldKey);

      if (newValue === null && oldValue !== null) {
        localStorage.setItem(newKey, oldValue);
      }
    });

    localStorage.setItem(STORAGE_MIGRATION_KEY, "1");
  } catch (error) {
    // Storage can be unavailable or restricted in the current browser context.
  }
}

migrateLegacyStorage();

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
