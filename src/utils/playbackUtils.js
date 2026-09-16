export function chooseNextSong(songs, currentIndex, { shuffle = false } = {}) {
  if (!songs.length) return null;
  if (!shuffle) return songs[(currentIndex + 1) % songs.length];

  const candidates = songs.filter((song, index) => index !== currentIndex);
  if (!candidates.length) return songs[currentIndex] || songs[0];
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export function choosePreviousSong(songs, currentIndex) {
  if (!songs.length || currentIndex < 0) return null;
  return songs[(currentIndex - 1 + songs.length) % songs.length];
}
