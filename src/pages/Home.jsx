import { songs } from "../data/songs.js";
import SongList from "../components/song/SongList.jsx";

function Home() {
    return (
        <section className="home-library" id="home" aria-labelledby="home-title">
            <div className="home-library-heading">
                <div>
                    <span className="eyebrow">Your listening space</span>
                    <h2 id="home-title">Music library</h2>
                </div>
                <span className="song-count">{songs.length} songs</span>
            </div>
            <SongList songs={songs} />
        </section>
    );
}

export default Home;
