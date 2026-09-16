import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { STORAGE_KEYS, getStoredSongIds, setStoredData } from "../services/storage.js";

const LikeContext = createContext(null);

function LikeProvider({ songs, children }) {
    const [likedSongIds, setLikedSongIds] = useState(() =>
        getStoredSongIds(STORAGE_KEYS.likedSongs, songs)
    );

    useEffect(() => {
        setLikedSongIds((currentIds) =>
            currentIds.filter((songId) => songs.some((song) => song.id === songId))
        );
    }, [songs]);

    useEffect(() => {
        setStoredData(STORAGE_KEYS.likedSongs, likedSongIds);
    }, [likedSongIds]);

    const likedSongs = useMemo(
        () => likedSongIds.map((songId) => songs.find((song) => song.id === songId)).filter(Boolean),
        [likedSongIds, songs]
    );

    function toggleLike(songId) {
        if (!songs.some((song) => song.id === songId)) return;
        setLikedSongIds((currentIds) =>
            currentIds.includes(songId)
                ? currentIds.filter((id) => id !== songId)
                : [...currentIds, songId]
        );
    }

    function clearLikes() {
        setLikedSongIds([]);
    }

    const value = {
        likedSongIds,
        likedSongs,
        toggleLike,
        isLiked: (songId) => likedSongIds.includes(songId),
        clearLikes,
    };

    return <LikeContext.Provider value={value}>{children}</LikeContext.Provider>;
}

function useLikes() {
    const context = useContext(LikeContext);
    if (!context) throw new Error("useLikes must be used within a LikeProvider");
    return context;
}

export { LikeProvider, useLikes };
