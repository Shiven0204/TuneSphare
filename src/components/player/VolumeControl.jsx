import { useId } from "react";
import { usePlayer } from "../../context/PlayerContext.jsx";

function VolumeControl() {
    const volumeId = useId();
    const { volume, isMuted, setVolume, toggleMute } = usePlayer();
    const displayedVolume = isMuted ? 0 : Math.round(volume * 100);

    return (
        <div className="player-options">
            <button className="volume-icon" type="button" onClick={toggleMute} aria-label={isMuted || volume === 0 ? "Unmute" : "Mute"}>
                <span aria-hidden="true">{isMuted || volume === 0 ? "🔇" : "🔊"}</span>
            </button>
            <label className="sr-only" htmlFor={volumeId}>Volume</label>
            <input id={volumeId} type="range" min="0" max="100" value={displayedVolume} onChange={(event) => setVolume(Number(event.target.value) / 100)} aria-valuetext={`${displayedVolume}% volume`} />
        </div>
    );
}

export default VolumeControl;
