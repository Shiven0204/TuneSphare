import { useQueue } from "../../context/QueueContext.jsx";
import QueueItem from "./QueueItem.jsx";

function QueuePanel({ isOpen, onClose }) {
    const { queuedSongs, queueCount, clearQueue } = useQueue();

    if (!isOpen) return null;

    return (
        <aside className="queue-panel" aria-label="Up next queue">
            <div className="queue-panel-heading">
                <div>
                    <span className="eyebrow">Up next</span>
                    <h2>Queue ({queueCount})</h2>
                </div>
                <div className="queue-panel-actions">
                    <button className="text-button" type="button" onClick={clearQueue} disabled={!queueCount}>Clear</button>
                    <button className="icon-button" type="button" onClick={onClose} aria-label="Close queue">×</button>
                </div>
            </div>
            {queuedSongs.length ? (
                <div className="queue-list">
                    {queuedSongs.map((song) => <QueueItem key={song.id} song={song} />)}
                </div>
            ) : (
                <p className="queue-empty" role="status">Your queue is empty. Add songs to play them next.</p>
            )}
        </aside>
    );
}

export default QueuePanel;
