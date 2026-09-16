import { usePlayer } from "../../context/PlayerContext.jsx";
import { useQueue } from "../../context/QueueContext.jsx";

function QueueItem({ song }) {
    const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();
    const { removeFromQueue } = useQueue();
    const isActive = currentSong?.id === song.id;

    function handlePlay() {
        if (isActive) togglePlay();
        else playSong(song, { fromQueue: true });
    }

    return (
        <div className={`queue-item${isActive ? " is-active" : ""}`}>
            <button className="queue-song" type="button" onClick={handlePlay} aria-label={`${isActive && isPlaying ? "Pause" : "Play"} ${song.title} from queue`}>
                <span className="queue-position" aria-hidden="true">•</span>
                <span className="queue-copy">
                    <strong>{song.title}</strong>
                    <span>{song.artist}</span>
                </span>
            </button>
            <button className="queue-remove" type="button" onClick={() => removeFromQueue(song.id)} aria-label={`Remove ${song.title} from queue`}>
                <span aria-hidden="true">×</span>
            </button>
        </div>
    );
}

export default QueueItem;
