function validateSongs(payload) {
  if (!Array.isArray(payload)) {
    throw new Error("Song manifest must contain an array.");
  }

  return payload.filter(
    (song) =>
      song &&
      (typeof song.id === "string" || typeof song.id === "number") &&
      typeof song.title === "string" &&
      typeof song.source === "string"
  );
}

async function fetchSongs() {
  const response = await fetch("/data/songs.json");
  if (!response.ok) {
    throw new Error(
      `Song manifest request failed with status ${response.status}.`
    );
  }

  const payload = await response.json();
  return validateSongs(payload);
}

export { fetchSongs, validateSongs };
