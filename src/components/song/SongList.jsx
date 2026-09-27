import SongRow from "./SongRow.jsx";

function SongList({
    songs = [],
    emptyMessage = "No songs available.",
    label = "Song library",
}) {
    if (songs.length === 0) {
        return (
            <div className="song-list-empty" role="status">
                {typeof emptyMessage === "string" ? <p>{emptyMessage}</p> : emptyMessage}
            </div>
        );
    }

    return (
        <div className="song-list" aria-label={label}>
            {songs.map((song, index) => (
                <SongRow key={song.id} song={song} index={index} />
            ))}
        </div>
    );
}

export default SongList;
