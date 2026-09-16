import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { STORAGE_KEYS, getStoredSongIds, setStoredData } from "../services/storage.js";

const RecentlyPlayedContext = createContext(null);
const MAX_RECENTLY_PLAYED = 10;

function RecentlyPlayedProvider({ songs, children }) {
    const [recentlyPlayedIds, setRecentlyPlayedIds] = useState(() =>
        getStoredSongIds(STORAGE_KEYS.recentlyPlayed, songs).slice(0, MAX_RECENTLY_PLAYED)
    );

    useEffect(() => {
        setRecentlyPlayedIds((currentIds) =>
            currentIds.filter((songId) => songs.some((song) => song.id === songId))
        );
    }, [songs]);

    useEffect(() => {
        setStoredData(STORAGE_KEYS.recentlyPlayed, recentlyPlayedIds);
    }, [recentlyPlayedIds]);

    const recentlyPlayedSongs = useMemo(
        () => recentlyPlayedIds.map((songId) => songs.find((song) => song.id === songId)).filter(Boolean),
        [recentlyPlayedIds, songs]
    );

    function addRecentlyPlayed(songId) {
        if (!songs.some((song) => song.id === songId)) return;
        setRecentlyPlayedIds((currentIds) => [
            songId,
            ...currentIds.filter((id) => id !== songId),
        ].slice(0, MAX_RECENTLY_PLAYED));
    }

    function clearRecentlyPlayed() {
        setRecentlyPlayedIds([]);
    }

    const value = {
        recentlyPlayedIds,
        recentlyPlayedSongs,
        addRecentlyPlayed,
        clearRecentlyPlayed,
    };

    return <RecentlyPlayedContext.Provider value={value}>{children}</RecentlyPlayedContext.Provider>;
}

function useRecentlyPlayed() {
    const context = useContext(RecentlyPlayedContext);
    if (!context) throw new Error("useRecentlyPlayed must be used within a RecentlyPlayedProvider");
    return context;
}

export { RecentlyPlayedProvider, useRecentlyPlayed };
