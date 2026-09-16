import { useQueue } from "../../context/QueueContext.jsx";

function QueueToggle({ onOpen }) {
    const { queueCount } = useQueue();
    return (
        <button className="queue-toggle" type="button" onClick={onOpen} aria-label={`Open queue${queueCount ? `, ${queueCount} song${queueCount === 1 ? "" : "s"}` : ""}`} aria-haspopup="dialog">
            <span aria-hidden="true">☷</span>
            <span className="queue-toggle-label">Queue{queueCount ? ` (${queueCount})` : ""}</span>
        </button>
    );
}

export default QueueToggle;
