import { useEffect, useState } from "react";
import { usePlayer } from "../../context/PlayerContext.jsx";

function NowPlaying() {
    const { currentSong, playbackState, error } = usePlayer();
    const [hasArtworkError, setHasArtworkError] = useState(false);
    useEffect(() => setHasArtworkError(false), [currentSong?.id]);
    const title = currentSong?.title || "Nothing playing";
    const artist = currentSong?.artist || "Choose a song to begin";
    const status = error || (playbackState === "idle" ? "Player ready" : playbackState);

    return (
        <div className="now-playing">
            <div className="player-art" aria-label={currentSong ? `Album artwork for ${title}` : "No album artwork"}>
                {currentSong?.cover && !hasArtworkError ? (
                    <img src={currentSong.cover} alt={`Album cover for ${title}`} onError={() => setHasArtworkError(true)} />
                ) : (
                    <span aria-hidden="true">TS</span>
                )}
            </div>
            <div className="now-playing-copy">
                <strong>{title}</strong>
                <span>{artist}</span>
                <small role={error ? "alert" : "status"} aria-live="polite">{status}</small>
            </div>
        </div>
    );
}

export default NowPlaying;
