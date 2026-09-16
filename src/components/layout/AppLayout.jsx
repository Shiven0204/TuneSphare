import { useState } from "react";
import MobileNav from "./MobileNav.jsx";
import Sidebar from "./Sidebar.jsx";
import TopBar from "./TopBar.jsx";
import PlayerPlaceholder from "../player/PlayerPlaceholder.jsx";

function AppLayout({ children }) {
    const [isNavigationOpen, setIsNavigationOpen] = useState(false);
    const closeNavigation = () => setIsNavigationOpen(false);

    return (
        <div className="app-layout">
            <Sidebar isOpen={isNavigationOpen} onClose={closeNavigation} />
            <MobileNav isOpen={isNavigationOpen} onClose={closeNavigation} />
            <div className="page-area">
                <TopBar onMenuOpen={() => setIsNavigationOpen(true)} />
                <main className="main-content">{children}</main>
            </div>
            <PlayerPlaceholder />
        </div>
    );
}

export default AppLayout;
