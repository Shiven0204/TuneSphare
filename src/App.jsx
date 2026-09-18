import AppLayout from "./components/layout/AppLayout.jsx";
import Home from "./pages/Home.jsx";
import { PlayerProvider } from "./context/PlayerContext.jsx";
import { PlaybackModeProvider } from "./context/PlaybackModeContext.jsx";
import { QueueProvider } from "./context/QueueContext.jsx";
import { LikeProvider } from "./context/LikeContext.jsx";
import { RecentlyPlayedProvider } from "./context/RecentlyPlayedContext.jsx";
import useSongs from "./hooks/useSongs.js";
import "./styles/layout.css";

function App() {
    const { songs, status, error } = useSongs();

    if (status === "loading") {
        return <main className="app-state" role="status">Loading your music...</main>;
    }

    if (status === "error") {
        return <main className="app-state app-state-error" role="alert">{error}</main>;
    }

    return (
        <QueueProvider songs={songs}>
            <PlaybackModeProvider>
                <LikeProvider songs={songs}>
                    <RecentlyPlayedProvider songs={songs}>
                        <PlayerProvider songs={songs}>
                            <AppLayout>
                                <Home songs={songs} />
                            </AppLayout>
                        </PlayerProvider>
                    </RecentlyPlayedProvider>
                </LikeProvider>
            </PlaybackModeProvider>
        </QueueProvider>
    );
}

export default App;
