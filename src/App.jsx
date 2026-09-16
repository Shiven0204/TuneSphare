import AppLayout from "./components/layout/AppLayout.jsx";
import Home from "./pages/Home.jsx";
import { PlayerProvider } from "./context/PlayerContext.jsx";
import { songs } from "./data/songs.js";
import "./styles/layout.css";

function App() {
    return (
        <PlayerProvider songs={songs}>
            <AppLayout>
                <Home />
            </AppLayout>
        </PlayerProvider>
    );
}

export default App;
