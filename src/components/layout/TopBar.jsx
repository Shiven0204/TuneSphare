function TopBar({ onMenuOpen }) {
    return (
        <header className="topbar">
            <button
                className="icon-button menu-button"
                type="button"
                aria-label="Open navigation"
                aria-controls="sidebar-navigation"
                onClick={onMenuOpen}
            >
                <span aria-hidden="true">☰</span>
            </button>

            <div className="title-block">
                <span className="eyebrow">TuneSphare</span>
                <h1>Local songs</h1>
            </div>

            <button className="shortcuts-button" type="button" disabled aria-label="Keyboard shortcuts coming later">
                <span aria-hidden="true">?</span>
                <span>Keyboard shortcuts</span>
            </button>

            <button className="theme-toggle" type="button" disabled aria-label="Theme control coming later">
                <span className="theme-toggle-icon" aria-hidden="true">☼</span>
                <span className="theme-toggle-label">Light</span>
            </button>

            <form className="search-form" role="search" onSubmit={(event) => event.preventDefault()}>
                <span className="search-icon" aria-hidden="true">⌕</span>
                <label className="sr-only" htmlFor="song-search">Search songs</label>
                <input id="song-search" type="search" placeholder="Search songs or artists" autoComplete="off" />
            </form>
        </header>
    );
}

export default TopBar;
