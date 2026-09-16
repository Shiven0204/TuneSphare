import { songs } from "../data/songs.js";
import SongList from "../components/song/SongList.jsx";
import { useLikes } from "../context/LikeContext.jsx";
import { useRecentlyPlayed } from "../context/RecentlyPlayedContext.jsx";

function Home() {
    const { likedSongs, clearLikes } = useLikes();
    const { recentlyPlayedSongs, clearRecentlyPlayed } = useRecentlyPlayed();

    return (
        <div className="home-library" id="home">
            <section className="library-section" aria-labelledby="home-title">
                <div className="home-library-heading">
                    <div>
                        <span className="eyebrow">Your listening space</span>
                        <h2 id="home-title">Music library</h2>
                    </div>
                    <span className="song-count">{songs.length} songs</span>
                </div>
                <SongList songs={songs} />
            </section>

            <section className="library-section" id="liked-songs" aria-labelledby="liked-title">
                <div className="section-heading-react">
                    <div>
                        <span className="eyebrow">Your collection</span>
                        <h2 id="liked-title">Liked Songs</h2>
                    </div>
                    <button className="text-button" type="button" onClick={clearLikes} disabled={!likedSongs.length}>
                        Clear
                    </button>
                </div>
                <SongList songs={likedSongs} emptyMessage="You haven't liked any songs yet." />
            </section>

            <section className="library-section" id="recently-played" aria-labelledby="recent-title">
                <div className="section-heading-react">
                    <div>
                        <span className="eyebrow">Your listening history</span>
                        <h2 id="recent-title">Recently Played</h2>
                    </div>
                    <button className="text-button" type="button" onClick={clearRecentlyPlayed} disabled={!recentlyPlayedSongs.length}>
                        Clear
                    </button>
                </div>
                <SongList songs={recentlyPlayedSongs} emptyMessage="Your recently played songs will appear here." />
            </section>
        </div>
    );
}

export default Home;
