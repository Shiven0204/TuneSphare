import { createContext, useContext, useEffect, useRef, useState } from "react";

const PlayerContext = createContext(null);
const DEFAULT_VOLUME = 0.68;

function PlayerProvider({ songs, children }) {
    const audioRef = useRef(null);
    const nextAutoplayRef = useRef(false);
    const previousVolumeRef = useRef(DEFAULT_VOLUME);
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

        return () => {
            audio.pause();
        };
    }, [currentSong]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.volume = volume;
        audio.muted = isMuted;
    }, [isMuted, volume]);

    function playSong(song) {
        const index = songs.findIndex((candidate) => candidate.id === song?.id);
        if (index === -1) return;

        if (currentSong?.id === song.id) {
            nextAutoplayRef.current = true;
            audioRef.current?.play().catch(() => { });
            return;
        }

        nextAutoplayRef.current = true;
        setCurrentIndex(index);
        setCurrentSong(songs[index]);
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

    function moveToSong(index, shouldPlay = true) {
        if (!songs.length) return;
        const nextIndex = (index + songs.length) % songs.length;
        nextAutoplayRef.current = shouldPlay;
        setCurrentIndex(nextIndex);
        setCurrentSong(songs[nextIndex]);
    }

    function next() {
        moveToSong(currentIndex < 0 ? 0 : currentIndex + 1);
    }

    function previous() {
        if (currentIndex < 0) return;
        moveToSong(currentIndex - 1, true);
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
            const restoredVolume = previousVolumeRef.current || DEFAULT_VOLUME;
            setVolumeState(restoredVolume);
            setIsMuted(false);
            return;
        }
        previousVolumeRef.current = volume;
        setIsMuted(true);
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

    function handleEnded() {
        moveToSong(currentIndex + 1, true);
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
