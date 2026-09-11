export function initializeKeyboardControls({ player, modes, ui }) {
  const actionKeys = new Set([" ", "n", "p", "m", "s", "r", "q"]);

  function isTypingTarget(target) {
    return (
      target instanceof Element &&
      (target.matches("input, textarea, select") ||
        target.isContentEditable ||
        target.closest("button, a, [role='slider']"))
    );
  }

  function handleKeydown(event) {
    if (event.ctrlKey || event.altKey || event.metaKey) return;
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    if (key === "Escape" && ui.closeOverlays()) {
      event.preventDefault();
      return;
    }
    if (isTypingTarget(event.target)) return;
    if (event.repeat && actionKeys.has(key)) return;

    switch (key) {
      case " ":
        event.preventDefault();
        player.togglePlayPause();
        break;
      case "n":
        event.preventDefault();
        player.nextTrack();
        break;
      case "p":
        event.preventDefault();
        player.previousTrack();
        break;
      case "m":
        event.preventDefault();
        player.toggleMute();
        break;
      case "s":
        event.preventDefault();
        modes.toggleShuffle();
        break;
      case "r":
        event.preventDefault();
        modes.cycleRepeat();
        break;
      case "q":
        event.preventDefault();
        ui.focusQueue();
        break;
      case "ArrowLeft":
        event.preventDefault();
        player.seekBy(-5);
        break;
      case "ArrowRight":
        event.preventDefault();
        player.seekBy(5);
        break;
      case "ArrowUp":
        event.preventDefault();
        player.adjustVolume(0.05);
        break;
      case "ArrowDown":
        event.preventDefault();
        player.adjustVolume(-0.05);
        break;
      case "Home":
        event.preventDefault();
        player.seekTo(0);
        break;
      case "End":
        event.preventDefault();
        player.seekToEnd();
        break;
      default:
        break;
    }
  }

  document.addEventListener("keydown", handleKeydown);
  return () => document.removeEventListener("keydown", handleKeydown);
}
