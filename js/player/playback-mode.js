import {
  getRepeatMode,
  getShuffleMode,
  saveRepeatMode,
  saveShuffleMode,
} from "../storage/storage.js";

const REPEAT_MODES = ["off", "all", "one"];

export function createPlaybackMode({ onChange } = {}) {
  let shuffle = getShuffleMode();
  let repeat = getRepeatMode();
  const listeners = new Set();

  function notify() {
    onChange?.({ shuffle, repeat });
    listeners.forEach((listener) => listener({ shuffle, repeat }));
  }

  function setShuffle(isEnabled) {
    shuffle = Boolean(isEnabled);
    saveShuffleMode(shuffle);
    notify();
  }

  function toggleShuffle() {
    setShuffle(!shuffle);
  }

  function cycleRepeat() {
    repeat =
      REPEAT_MODES[(REPEAT_MODES.indexOf(repeat) + 1) % REPEAT_MODES.length];
    saveRepeatMode(repeat);
    notify();
  }

  function getState() {
    return { shuffle, repeat };
  }

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  notify();
  return { getState, setShuffle, toggleShuffle, cycleRepeat, subscribe };
}
