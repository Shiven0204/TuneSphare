import AppLayout from "./components/layout/AppLayout.jsx";
import Home from "./pages/Home.jsx";
import { PlayerProvider } from "./context/PlayerContext.jsx";
import { PlaybackModeProvider } from "./context/PlaybackModeContext.jsx";
import { QueueProvider } from "./context/QueueContext.jsx";
import { LikeProvider } from "./context/LikeContext.jsx";
import { RecentlyPlayedProvider } from "./context/RecentlyPlayedContext.jsx";
import { songs } from "./data/songs.js";
import "./styles/layout.css";

function App() {
    return (
        <QueueProvider songs={songs}>
            <PlaybackModeProvider>
                <LikeProvider songs={songs}>
                    <RecentlyPlayedProvider songs={songs}>
                        <PlayerProvider songs={songs}>
                            <AppLayout>
                                <Home />
                            </AppLayout>
                        </PlayerProvider>
                    </RecentlyPlayedProvider>
                </LikeProvider>
            </PlaybackModeProvider>
        </QueueProvider>
    );
}

export default App;
