import { createContext, useContext, useState } from "react";

const PlaybackModeContext = createContext(null);
const REPEAT_MODES = ["off", "all", "one"];

function PlaybackModeProvider({ children }) {
    const [shuffle, setShuffle] = useState(false);
    const [repeat, setRepeat] = useState("off");

    function toggleShuffle() {
        setShuffle((enabled) => !enabled);
    }

    function cycleRepeat() {
        setRepeat((mode) => REPEAT_MODES[(REPEAT_MODES.indexOf(mode) + 1) % REPEAT_MODES.length]);
    }

    return (
        <PlaybackModeContext.Provider value={{ shuffle, repeat, toggleShuffle, cycleRepeat }}>
            {children}
        </PlaybackModeContext.Provider>
    );
}

function usePlaybackMode() {
    const context = useContext(PlaybackModeContext);
    if (!context) throw new Error("usePlaybackMode must be used within a PlaybackModeProvider");
    return context;
}

export { PlaybackModeProvider, usePlaybackMode };
