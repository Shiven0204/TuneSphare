function Home() {
    return (
        <section className="home-placeholder" id="home" aria-labelledby="home-title">
            <span className="eyebrow">Your listening space</span>
            <h2 id="home-title">Home</h2>
            <p>The React home experience will be built here next.</p>
            <div className="home-placeholder-grid" aria-label="Upcoming home sections">
                <div>Recently Played</div>
                <div>Trending Tracks</div>
                <div>Top Artists</div>
                <div>Genres</div>
            </div>
        </section>
    );
}

export default Home;
