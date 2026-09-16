import AppLayout from "./components/layout/AppLayout.jsx";
import Home from "./pages/Home.jsx";
import { PlayerProvider } from "./context/PlayerContext.jsx";
import { PlaybackModeProvider } from "./context/PlaybackModeContext.jsx";
import { QueueProvider } from "./context/QueueContext.jsx";
import { songs } from "./data/songs.js";
import "./styles/layout.css";

function App() {
    return (
        <QueueProvider songs={songs}>
            <PlaybackModeProvider>
                <PlayerProvider songs={songs}>
                    <AppLayout>
                        <Home />
                    </AppLayout>
                </PlayerProvider>
            </PlaybackModeProvider>
        </QueueProvider>
    );
}

export default App;
