function SongCard({ song }) {
    return (
        <article className="song-card">
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
        </article>
    );
}

export default SongCard;
