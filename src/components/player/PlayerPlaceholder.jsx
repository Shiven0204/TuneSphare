const placeholderControls = [
    ["Previous track", "◀◀"],
    ["Play track", "▶"],
    ["Next track", "▶▶"],
];

function PlayerPlaceholder() {
    return (
        <footer className="player-bar player-placeholder" aria-label="Music player placeholder">
            <div className="now-playing">
                <div className="player-art" aria-hidden="true">TS</div>
                <div className="now-playing-copy">
                    <strong>Nothing playing</strong>
                    <span>Choose a song to begin</span>
                    <small>Player coming later</small>
                </div>
            </div>

            <div className="player-controls" aria-label="Playback controls">
                <div className="control-buttons">
                    {placeholderControls.map(([label, icon]) => (
                        <button className={label === "Play track" ? "play-button" : "icon-button"} type="button" disabled aria-label={label} key={label}>
                            <span aria-hidden="true">{icon}</span>
                        </button>
                    ))}
                </div>
                <div className="progress-row">
                    <span>0:00</span>
                    <div className="progress-track" aria-hidden="true"><div className="progress-value" /></div>
                    <span>--:--</span>
                </div>
            </div>

            <div className="player-options">
                <span className="volume-icon" aria-hidden="true">🔊</span>
                <label className="sr-only" htmlFor="placeholder-volume">Volume</label>
                <input id="placeholder-volume" type="range" min="0" max="100" defaultValue="68" disabled />
            </div>
        </footer>
    );
}

export default PlayerPlaceholder;
