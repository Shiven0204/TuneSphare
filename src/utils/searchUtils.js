export function normalizeSearchText(value) {
    return String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}

export function filterSongs(songs, query) {
    const normalizedQuery = normalizeSearchText(query);

    if (!normalizedQuery) {
        return songs;
    }

    return songs.filter((song) =>
        [song.title, song.artist, song.album, song.genre]
            .some((field) => normalizeSearchText(field).includes(normalizedQuery))
    );
}
