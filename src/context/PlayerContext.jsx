import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePlaybackMode } from "./PlaybackModeContext.jsx";
import { useQueue } from "./QueueContext.jsx";

const PlayerContext = createContext(null);
const DEFAULT_VOLUME = 0.68;
const MAX_HISTORY = 30;

function PlayerProvider({ songs, children }) {
    const audioRef = useRef(null);
    const nextAutoplayRef = useRef(false);
    const previousVolumeRef = useRef(DEFAULT_VOLUME);
    const historyRef = useRef([]);
    const { queueIds, removeFromQueue } = useQueue();
    const { shuffle, repeat } = usePlaybackMode();
    const [currentSong, setCurrentSong] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolumeState] = useState(DEFAULT_VOLUME);
    const [isMuted, setIsMuted] = useState(false);
    const [playbackState, setPlaybackState] = useState("idle");
    const [error, setError] = useState("");

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !currentSong) return;

        audio.pause();
        audio.src = currentSong.source || "";
        audio.load();
        setCurrentTime(0);
        setDuration(0);
        setError(currentSong.source ? "" : "This track has no audio source.");
        setPlaybackState(currentSong.source ? "loading" : "error");

        if (nextAutoplayRef.current && currentSong.source) {
            nextAutoplayRef.current = false;
            audio.play().catch((playError) => {
                if (playError.name !== "AbortError") {
                    setIsPlaying(false);
                    setPlaybackState("error");
                    setError("Unable to play this track.");
                }
            });
        }

        return () => audio.pause();
    }, [currentSong]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.volume = volume;
        audio.muted = isMuted;
    }, [isMuted, volume]);

    function rememberCurrentSong() {
        if (!currentSong) return;
        historyRef.current = [
            currentSong.id,
            ...historyRef.current.filter((songId) => songId !== currentSong.id),
        ].slice(0, MAX_HISTORY);
    }

    function transitionToSong(song, shouldPlay = true, { fromQueue = false, remember = true } = {}) {
        if (!song) return;
        if (remember && currentSong?.id !== song.id) rememberCurrentSong();
        if (fromQueue) removeFromQueue(song.id);
        nextAutoplayRef.current = shouldPlay;
        setCurrentIndex(songs.findIndex((candidate) => candidate.id === song.id));
        setCurrentSong(song);
    }

    function playSong(song, options = {}) {
        const validSong = songs.find((candidate) => candidate.id === song?.id);
        if (!validSong) return;
        if (currentSong?.id === validSong.id) {
            play();
            return;
        }
        transitionToSong(validSong, true, options);
    }

    function play() {
        const audio = audioRef.current;
        if (!audio || !currentSong) return;
        setError("");
        setPlaybackState("loading");
        audio.play().catch((playError) => {
            if (playError.name !== "AbortError") {
                setIsPlaying(false);
                setPlaybackState("error");
                setError("Unable to play this track.");
            }
        });
    }

    function pause() {
        audioRef.current?.pause();
    }

    function togglePlay() {
        if (!currentSong) return;
        if (audioRef.current?.paused) play();
        else pause();
    }

    function chooseRandomSong() {
        const candidates = songs.filter((song) => song.id !== currentSong?.id);
        return candidates.length ? candidates[Math.floor(Math.random() * candidates.length)] : currentSong;
    }

    function chooseLibraryNext() {
        if (shuffle) return chooseRandomSong();
        return songs[(currentIndex + 1) % songs.length] || null;
    }

    function next({ automatic = false } = {}) {
        // Queue items are upcoming tracks; once consumed, repeat/shuffle govern the library.
        const queuedSong = songs.find((song) => song.id === queueIds[0]);
        if (queuedSong) {
            transitionToSong(queuedSong, true, { fromQueue: true });
            return;
        }

        if (!songs.length || currentIndex < 0) return;
        if (automatic && repeat === "one") {
            const audio = audioRef.current;
            if (audio) {
                audio.currentTime = 0;
                audio.play().catch(() => { });
            }
            return;
        }
        if (automatic && repeat === "off" && !shuffle && currentIndex === songs.length - 1) {
            setIsPlaying(false);
            setPlaybackState("paused");
            return;
        }
        transitionToSong(chooseLibraryNext(), true);
    }

    function previous() {
        const previousId = historyRef.current.shift();
        const previousSong = songs.find((song) => song.id === previousId);
        if (previousSong) {
            transitionToSong(previousSong, true, { remember: false });
            return;
        }
        const previousIndex = (currentIndex - 1 + songs.length) % songs.length;
        transitionToSong(songs[previousIndex], true, { remember: false });
    }

    function seek(time) {
        const audio = audioRef.current;
        if (!audio || !Number.isFinite(audio.duration)) return;
        const safeTime = Math.min(Math.max(Number(time) || 0, 0), audio.duration);
        audio.currentTime = safeTime;
        setCurrentTime(safeTime);
    }

    function setVolume(value) {
        const safeVolume = Math.min(Math.max(Number(value) || 0, 0), 1);
        if (safeVolume > 0) previousVolumeRef.current = safeVolume;
        setVolumeState(safeVolume);
        setIsMuted(safeVolume === 0);
    }

    function toggleMute() {
        if (isMuted || volume === 0) {
            setVolumeState(previousVolumeRef.current || DEFAULT_VOLUME);
            setIsMuted(false);
            return;
        }
        previousVolumeRef.current = volume;
        setIsMuted(true);
    }

    function handleEnded() {
        next({ automatic: true });
    }

    function handleTimeUpdate(event) {
        setCurrentTime(Number.isFinite(event.currentTarget.currentTime) ? event.currentTarget.currentTime : 0);
    }

    function handleLoadedMetadata(event) {
        const nextDuration = event.currentTarget.duration;
        setDuration(Number.isFinite(nextDuration) ? nextDuration : 0);
        setPlaybackState(event.currentTarget.paused ? "paused" : "playing");
    }

    function handlePlay() {
        setIsPlaying(true);
        setPlaybackState("playing");
        setError("");
    }

    function handlePause() {
        setIsPlaying(false);
        setPlaybackState((state) => (state === "error" ? state : "paused"));
    }

    function handleWaiting() {
        setPlaybackState("buffering");
    }

    function handlePlaying() {
        setIsPlaying(true);
        setPlaybackState("playing");
    }

    function handleCanPlay() {
        setPlaybackState((state) => (state === "buffering" || state === "loading" ? "paused" : state));
    }

    function handleError(event) {
        if (event.currentTarget.error?.code === 1) return;
        setIsPlaying(false);
        setPlaybackState("error");
        setError("This track could not be loaded.");
    }

    const value = {
        audioRef,
        currentSong,
        currentIndex,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        playbackState,
        error,
        playSong,
        play,
        pause,
        togglePlay,
        next,
        previous,
        seek,
        setVolume,
        toggleMute,
        audioProps: {
            onTimeUpdate: handleTimeUpdate,
            onLoadedMetadata: handleLoadedMetadata,
            onPlay: handlePlay,
            onPause: handlePause,
            onEnded: handleEnded,
            onWaiting: handleWaiting,
            onPlaying: handlePlaying,
            onCanPlay: handleCanPlay,
            onError: handleError,
        },
    };

    return (
        <PlayerContext.Provider value={value}>
            <audio ref={audioRef} preload="metadata" {...value.audioProps} />
            {children}
        </PlayerContext.Provider>
    );
}

function usePlayer() {
    const context = useContext(PlayerContext);
    if (!context) throw new Error("usePlayer must be used within a PlayerProvider");
    return context;
}

export { PlayerProvider, usePlayer };
