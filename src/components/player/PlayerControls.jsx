import { usePlayer } from "../../context/PlayerContext.jsx";
import { usePlaybackMode } from "../../context/PlaybackModeContext.jsx";

function PlayerControls() {
    const { currentSong, isPlaying, togglePlay, previous, next } = usePlayer();
    const { shuffle, repeat, toggleShuffle, cycleRepeat } = usePlaybackMode();
    const isDisabled = !currentSong;

    return (
        <div className="player-controls" aria-label="Playback controls">
            <div className="control-buttons">
                <button className={`icon-button mode-button${shuffle ? " is-active" : ""}`} type="button" onClick={toggleShuffle} aria-label={`Shuffle ${shuffle ? "on" : "off"}`} aria-pressed={shuffle}>
                    <span aria-hidden="true">⤨</span>
                </button>
                <button className="icon-button" type="button" onClick={previous} disabled={isDisabled} aria-label="Previous track">
                    <span aria-hidden="true">◀◀</span>
                </button>
                <button className="play-button" type="button" onClick={togglePlay} disabled={isDisabled} aria-label={isPlaying ? "Pause track" : "Play track"}>
                    <span aria-hidden="true">{isPlaying ? "❚❚" : "▶"}</span>
                </button>
                <button className="icon-button" type="button" onClick={next} disabled={isDisabled} aria-label="Next track">
                    <span aria-hidden="true">▶▶</span>
                </button>
                <button className={`icon-button mode-button${repeat !== "off" ? " is-active" : ""}`} type="button" onClick={cycleRepeat} aria-label={`Repeat ${repeat}`} aria-pressed={repeat !== "off"}>
                    <span aria-hidden="true">{repeat === "one" ? "↻1" : "↻"}</span>
                </button>
            </div>
        </div>
    );
}

export default PlayerControls;
