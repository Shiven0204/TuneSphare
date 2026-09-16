import { usePlayer } from "../../context/PlayerContext.jsx";

function SongCard({ song }) {
    const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();
    const isActive = currentSong?.id === song.id;
    const handleSelect = () => {
        if (isActive) togglePlay();
        else playSong(song);
    };

    return (
        <button
            className={`song-card${isActive ? " active-song" : ""}`}
            type="button"
            onClick={handleSelect}
            aria-label={`${isActive && isPlaying ? "Pause" : "Play"} ${song.title}`}
        >
            <div className="song-card-artwork">
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
            <div className="song-card-copy">
                <h3>{song.title}</h3>
                <p>{song.artist}</p>
                <span>{song.album || song.genre || "Album unavailable"}</span>
            </div>
        </button>
    );
}

export default SongCard;
