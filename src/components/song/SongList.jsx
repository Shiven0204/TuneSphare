import SongRow from "./SongRow.jsx";

function SongList({ songs = [], emptyMessage = "No songs are available in the library yet." }) {
    if (songs.length === 0) {
        return (
            <p className="song-list-empty" role="status">
                {emptyMessage}
            </p>
        );
    }

    return (
        <div className="song-list" aria-label="Song library">
            {songs.map((song, index) => (
                <SongRow key={song.id} song={song} index={index} />
            ))}
        </div>
    );
}

export default SongList;
