import { useQueue } from "../../context/QueueContext.jsx";

function QueueButton({ song }) {
    const { addToQueue, isInQueue } = useQueue();
    const queued = isInQueue(song.id);

    function handleClick() {
        addToQueue(song.id);
    }

    return (
        <button
            className="queue-button"
            type="button"
            onClick={handleClick}
            disabled={queued}
            aria-label={queued ? `${song.title} is already in queue` : `Add ${song.title} to queue`}
            aria-pressed={queued}
        >
            <span aria-hidden="true">{queued ? "✓" : "+"}</span>
        </button>
    );
}

export default QueueButton;
