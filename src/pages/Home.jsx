import { useMemo } from "react";
import SongList from "../components/song/SongList.jsx";
import { useLikes } from "../context/LikeContext.jsx";
import { useRecentlyPlayed } from "../context/RecentlyPlayedContext.jsx";
import { filterSongs, normalizeSearchText } from "../utils/searchUtils.js";

function Home({ songs, searchQuery = "" }) {
    const { likedSongs, clearLikes } = useLikes();
    const { recentlyPlayedSongs, clearRecentlyPlayed } = useRecentlyPlayed();
    const isSearchActive = Boolean(normalizeSearchText(searchQuery));
    const filteredSongs = useMemo(() => filterSongs(songs, searchQuery), [songs, searchQuery]);
    const displayQuery = searchQuery.trim();
    const libraryEmptyMessage = isSearchActive ? (
        <>
            <p>{`No songs found for "${displayQuery}".`}</p>
            <p>Try searching for another song, artist, album, or genre.</p>
        </>
    ) : (
        <p>No songs available.</p>
    );

    return (
        <div className="home-library" id="home">
            <section className="library-section" aria-labelledby="home-title">
                <div className="home-library-heading">
                    <div>
                        <span className="eyebrow">{isSearchActive ? "Matching your search" : "Your listening space"}</span>
                        <h2 id="home-title">{isSearchActive ? "Search Results" : "Music library"}</h2>
                    </div>
                    <span className="song-count" role="status">
                        {isSearchActive
                            ? `${filteredSongs.length} songs`
                            : `${songs.length} songs`}
                    </span>
                </div>
                <SongList
                    songs={filteredSongs}
                    label={isSearchActive ? "Search results" : "Song library"}
                    emptyMessage={libraryEmptyMessage}
                />
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
                <SongList songs={likedSongs} label="Liked songs" emptyMessage="You haven't liked any songs yet." />
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
                <SongList
                    songs={recentlyPlayedSongs}
                    label="Recently played songs"
                    emptyMessage="Your recently played songs will appear here."
                />
            </section>
        </div>
    );
}

export default Home;
