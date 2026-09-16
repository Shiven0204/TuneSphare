import { createContext, useContext, useMemo, useState } from "react";

const QueueContext = createContext(null);

function QueueProvider({ songs, children }) {
    const validIds = useMemo(() => new Set(songs.map((song) => song.id)), [songs]);
    const [queueIds, setQueueIds] = useState([]);

    function addToQueue(songId) {
        if (!validIds.has(songId)) return false;
        if (queueIds.includes(songId)) return false;
        setQueueIds([...queueIds, songId]);
        return true;
    }

    function removeFromQueue(songId) {
        if (!queueIds.includes(songId)) return false;
        setQueueIds(queueIds.filter((id) => id !== songId));
        return true;
    }

    function clearQueue() {
        setQueueIds([]);
    }

    function takeNext() {
        const nextId = queueIds[0] ?? null;
        if (nextId !== null) setQueueIds(queueIds.slice(1));
        return nextId;
    }

    const queuedSongs = queueIds
        .map((songId) => songs.find((song) => song.id === songId))
        .filter(Boolean);

    const value = {
        queueIds,
        queuedSongs,
        queueCount: queuedSongs.length,
        addToQueue,
        removeFromQueue,
        clearQueue,
        takeNext,
        isInQueue: (songId) => queueIds.includes(songId),
    };

    return <QueueContext.Provider value={value}>{children}</QueueContext.Provider>;
}

function useQueue() {
    const context = useContext(QueueContext);
    if (!context) throw new Error("useQueue must be used within a QueueProvider");
    return context;
}

export { QueueProvider, useQueue };
