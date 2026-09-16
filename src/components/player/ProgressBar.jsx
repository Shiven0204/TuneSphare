import { useId } from "react";
import { usePlayer } from "../../context/PlayerContext.jsx";

function formatTime(value, fallback = "0:00") {
    if (!Number.isFinite(value) || value < 0) return fallback;
    const minutes = Math.floor(value / 60);
    const seconds = Math.floor(value % 60);
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function ProgressBar() {
    const progressId = useId();
    const { currentTime, duration, seek } = usePlayer();
    const percentage = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

    function handleChange(event) {
        if (duration > 0) seek(Number(event.target.value));
    }

    return (
        <div className="progress-row">
            <span>{formatTime(currentTime)}</span>
            <label className="sr-only" htmlFor={progressId}>Track progress</label>
            <input
                className="progress-slider"
                id={progressId}
                type="range"
                min="0"
                max={duration || 0}
                step="0.1"
                value={duration > 0 ? currentTime : 0}
                onChange={handleChange}
                disabled={!duration}
                aria-valuetext={`${formatTime(currentTime)} of ${duration ? formatTime(duration) : "duration unavailable"}`}
                style={{ "--progress-percent": `${percentage}%` }}
            />
            <span>{formatTime(duration, "--:--")}</span>
        </div>
    );
}

export { formatTime };
export default ProgressBar;
