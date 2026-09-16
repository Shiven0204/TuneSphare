import { usePlayer } from "../../context/PlayerContext.jsx";

function PlayerControls() {
    const { currentSong, isPlaying, togglePlay, previous, next } = usePlayer();
    const isDisabled = !currentSong;

    return (
        <div className="player-controls" aria-label="Playback controls">
            <div className="control-buttons">
                <button className="icon-button" type="button" onClick={previous} disabled={isDisabled} aria-label="Previous track">
                    <span aria-hidden="true">◀◀</span>
                </button>
                <button className="play-button" type="button" onClick={togglePlay} disabled={isDisabled} aria-label={isPlaying ? "Pause track" : "Play track"}>
                    <span aria-hidden="true">{isPlaying ? "❚❚" : "▶"}</span>
                </button>
                <button className="icon-button" type="button" onClick={next} disabled={isDisabled} aria-label="Next track">
                    <span aria-hidden="true">▶▶</span>
                </button>
            </div>
        </div>
    );
}

export default PlayerControls;
