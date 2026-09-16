import { usePlayer } from "../../context/PlayerContext.jsx";
import NowPlaying from "./NowPlaying.jsx";
import PlayerControls from "./PlayerControls.jsx";
import ProgressBar from "./ProgressBar.jsx";
import VolumeControl from "./VolumeControl.jsx";

function MusicPlayer() {
    const { playbackState } = usePlayer();

    return (
        <footer className="player-bar" data-playback-state={playbackState} aria-label="Music player" aria-busy={playbackState === "loading" || playbackState === "buffering"}>
            <NowPlaying />
            <div className="player-center">
                <PlayerControls />
                <ProgressBar />
            </div>
            <VolumeControl />
        </footer>
    );
}

export default MusicPlayer;
