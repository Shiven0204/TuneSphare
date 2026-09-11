import { getQueueSongs, saveQueueSongs } from "../storage/storage.js";

export function createQueue(songs, { onChange } = {}) {
  const validIds = new Set(songs.map((song) => song.id));
  let queue = getQueueSongs().filter((songId) => validIds.has(songId));
  saveQueueSongs(queue);

  function getQueue() {
    return [...queue];
  }

  function notify() {
    saveQueueSongs(queue);
    onChange?.(getQueue());
  }

  function addToQueue(songId) {
    if (!validIds.has(songId) || queue.includes(songId)) return false;
    queue.push(songId);
    notify();
    return true;
  }

  function removeFromQueue(songId) {
    const nextQueue = queue.filter((id) => id !== songId);
    if (nextQueue.length === queue.length) return false;
    queue = nextQueue;
    notify();
    return true;
  }

  function clearQueue() {
    if (queue.length === 0) return false;
    queue = [];
    notify();
    return true;
  }

  function isInQueue(songId) {
    return queue.includes(songId);
  }

  function playQueuedSong(songId) {
    if (!isInQueue(songId)) return null;
    removeFromQueue(songId);
    return songs.find((song) => song.id === songId) || null;
  }

  function takeNext() {
    const songId = queue.shift();
    if (songId === undefined) return null;
    notify();
    return songs.find((song) => song.id === songId) || null;
  }

  return {
    getQueue,
    addToQueue,
    removeFromQueue,
    clearQueue,
    isInQueue,
    playQueuedSong,
    takeNext,
  };
}
