const navigationItems = [
    { label: "Home", icon: "⌂", href: "#home", active: true },
    { label: "Library", icon: "▣", href: "#library" },
    { label: "Liked Songs", icon: "♡", href: "#liked-songs" },
    { label: "Recently Played", icon: "◷", href: "#recently-played" },
];

function Sidebar({ isOpen = false, onClose }) {
    return (
        <aside id="sidebar-navigation" className={`sidebar${isOpen ? " is-open" : ""}`} aria-label="Sidebar navigation">
            <div className="brand-row">
                <a className="brand" href="#home" aria-label="TuneSphare home" onClick={onClose}>
                    <span className="brand-mark" aria-hidden="true">TS</span>
                    <span>TuneSphare</span>
                </a>
                <button className="icon-button sidebar-close" type="button" aria-label="Close navigation" onClick={onClose}>
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>

            <nav className="primary-nav" aria-label="Primary navigation">
                <p className="nav-label">Explore</p>
                {navigationItems.map((item) => (
                    <a
                        className={`nav-link${item.active ? " is-active" : ""}`}
                        href={item.href}
                        key={item.label}
                        aria-current={item.active ? "page" : undefined}
                        onClick={onClose}
                    >
                        <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                        <span>{item.label}</span>
                    </a>
                ))}
            </nav>

            <div className="sidebar-note">
                <span className="note-dot" aria-hidden="true" />
                <div>
                    <strong>Local music</strong>
                    <span>React layout foundation.</span>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;
