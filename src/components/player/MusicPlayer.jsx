import { usePlayer } from "../../context/PlayerContext.jsx";
import NowPlaying from "./NowPlaying.jsx";
import PlayerControls from "./PlayerControls.jsx";
import ProgressBar from "./ProgressBar.jsx";
import VolumeControl from "./VolumeControl.jsx";
import QueueToggle from "../queue/QueueToggle.jsx";

function MusicPlayer({ onOpenQueue }) {
    const { playbackState } = usePlayer();

    return (
        <footer className="player-bar" data-playback-state={playbackState} aria-label="Music player" aria-busy={playbackState === "loading" || playbackState === "buffering"}>
            <NowPlaying />
            <div className="player-center">
                <PlayerControls />
                <ProgressBar />
            </div>
            <div className="player-options">
                <VolumeControl />
                <QueueToggle onOpen={onOpenQueue} />
            </div>
        </footer>
    );
}

export default MusicPlayer;
