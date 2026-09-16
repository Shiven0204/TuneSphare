import { usePlayer } from "../../context/PlayerContext.jsx";

function SongRow({ song, index }) {
    const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();
    const isActive = currentSong?.id === song.id;
    const handleSelect = () => {
        if (isActive) togglePlay();
        else playSong(song);
    };

    return (
        <button
            className={`song-row${isActive ? " active-song" : ""}`}
            type="button"
            onClick={handleSelect}
            aria-label={`${isActive && isPlaying ? "Pause" : "Play"} ${song.title}`}
            aria-current={isActive ? "true" : undefined}
        >
            <span className="song-row-number" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
            </span>
            <div className="song-row-artwork">
                {song.cover ? (
                    <>
                        <img
                            src={song.cover}
                            alt={`Album cover for ${song.title}`}
                            onError={(event) => {
                                event.currentTarget.hidden = true;
                                event.currentTarget.nextElementSibling.hidden = false;
                            }}
                        />
                        <span hidden aria-hidden="true">TS</span>
                    </>
                ) : (
                    <span aria-hidden="true">TS</span>
                )}
            </div>
            <div className="song-row-copy">
                <h3>{song.title}</h3>
                <p>{song.artist}</p>
            </div>
            <span className="song-row-album">{song.album || "Album unavailable"}</span>
            <span className="song-row-genre">{song.genre || "Genre unavailable"}</span>
        </button>
    );
}

export default SongRow;
