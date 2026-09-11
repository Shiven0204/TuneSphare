function formatTime(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return "0:00";
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function createPlayer(songs, { onPlay, onPause, queue, modes, onModeChange }) {
  const audio = document.getElementById("audio-player");
  const titleElement = document.querySelector(".now-playing-copy strong");
  const artistElement = document.querySelector(".now-playing-copy span");
  const artworkElement = document.querySelector(".player-art");
  const playButton = document.querySelector(".play-button");
  const currentTimeElement = document.querySelector(".time-current");
  const durationElement = document.querySelector(".time-total");
  const progressValue = document.querySelector(".progress-value");
  const progressTrack = document.querySelector(".progress-track");
  const volumeSlider = document.getElementById("volume");
  const volumeIcon = document.querySelector(".volume-icon");
  const previousButton = document.querySelector(
    '.control-buttons .icon-button[aria-label="Previous track"]'
  );
  const nextButton = document.querySelector(
    '.control-buttons .icon-button[aria-label="Next track"]'
  );

  let currentSongIndex = 0;
  let previousVolume = 0.68;
  let isDraggingProgress = false;
  let dragFraction = 0;
  let rafId = null;
  let shuffleRemaining = [];
  let queueCycle = [];
  let queueCycleRemaining = [];
  let playbackHistory = [];

  function updateProgress() {
    if (!audio) return;

    // Do not overwrite visual progress while dragging
    if (isDraggingProgress) return;

    const currentTime = audio.currentTime || 0;
    const duration = audio.duration || 0;
    const percentage = duration ? (currentTime / duration) * 100 : 0;

    if (currentTimeElement)
      currentTimeElement.textContent = formatTime(currentTime);
    if (durationElement) durationElement.textContent = formatTime(duration);
    if (progressValue) {
      progressValue.style.width = `${percentage}%`;
    }
    if (progressTrack) {
      const roundedVal = Math.round(percentage);
      progressTrack.setAttribute("aria-valuenow", String(roundedVal));
      progressTrack.setAttribute(
        "aria-valuetext",
        `${formatTime(currentTime)} of ${formatTime(duration)}`
      );
    }
  }

  function updateVolume() {
    if (!audio || !volumeSlider || !volumeIcon) return;
    const percentage = audio.muted ? 0 : Math.round(audio.volume * 100);
    volumeSlider.value = String(percentage);
    volumeIcon.textContent = audio.muted || percentage === 0 ? "🔇" : "🔊";
    volumeIcon.setAttribute(
      "aria-label",
      audio.muted || percentage === 0 ? "Unmute" : "Mute"
    );
  }

  function updatePlayButton(isPlaying) {
    if (!playButton) return;
    playButton.textContent = isPlaying ? "❚❚" : "▶";
    playButton.setAttribute(
      "aria-label",
      isPlaying ? "Pause track" : "Play track"
    );
  }

  function updateSongInfo(song) {
    if (titleElement) titleElement.textContent = song.title;
    if (artistElement) artistElement.textContent = song.artist;
    if (artworkElement) {
      artworkElement.style.backgroundImage = `url('${song.cover}')`;
      artworkElement.style.backgroundSize = "cover";
      artworkElement.style.backgroundPosition = "center";
      const label = artworkElement.querySelector("span");
      if (label) label.textContent = song.title.slice(0, 2).toUpperCase();
    }
  }

  function reportPlaybackError(error) {
    if (error.name !== "AbortError") console.error("Playback failed:", error);
    updatePlayButton(false);
  }

  function playCurrentSong() {
    if (!audio) return;
    audio
      .play()
      .then(() => updatePlayButton(true))
      .catch(reportPlaybackError);
  }

  function pauseCurrentSong() {
    if (!audio) return;
    audio.pause();
    updatePlayButton(false);
  }

  function togglePlayPause() {
    if (!audio) return;
    if (audio.paused) {
      playCurrentSong();
    } else {
      pauseCurrentSong();
    }
  }

  function loadSong(index, shouldPlay = false) {
    if (!songs[index]) return;
    currentSongIndex = index;
    audio.pause();
    audio.src = songs[index].source;
    updateSongInfo(songs[index]);
    updateProgress();
    if (shouldPlay) {
      playCurrentSong();
    }
  }

  function isPlaying() {
    return Boolean(audio && !audio.paused);
  }

  function calculateDragFraction(event) {
    if (!progressTrack) return 0;
    const bounds = progressTrack.getBoundingClientRect();
    return Math.min(
      Math.max((event.clientX - bounds.left) / bounds.width, 0),
      1
    );
  }

  function updateVisualSeek() {
    if (!progressValue || !currentTimeElement || !audio) return;
    const duration = audio.duration || 0;
    const previewTime = dragFraction * duration;

    progressValue.style.width = `${dragFraction * 100}%`;
    currentTimeElement.textContent = formatTime(previewTime);
    if (progressTrack) {
      progressTrack.setAttribute(
        "aria-valuenow",
        String(Math.round(dragFraction * 100))
      );
      progressTrack.setAttribute(
        "aria-valuetext",
        `${formatTime(previewTime)} of ${formatTime(duration)}`
      );
    }
  }

  function commitSeek(fraction) {
    if (!audio || !Number.isFinite(audio.duration)) return;
    audio.currentTime = fraction * audio.duration;
    updateProgress();
  }

  function handleKeyboardSeek(event) {
    if (!audio || !Number.isFinite(audio.duration)) return;
    const step = 5; // 5 seconds
    let targetTime = audio.currentTime;

    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      targetTime = Math.max(0, audio.currentTime - step);
    } else if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      targetTime = Math.min(audio.duration, audio.currentTime + step);
    } else if (event.key === "Home") {
      event.preventDefault();
      targetTime = 0;
    } else if (event.key === "End") {
      event.preventDefault();
      targetTime = audio.duration;
    } else {
      return;
    }

    audio.currentTime = targetTime;
    updateProgress();
  }

  function rememberCurrentSong() {
    const currentSong = songs[currentSongIndex];
    if (!currentSong || playbackHistory.at(-1) === currentSong.id) return;
    playbackHistory.push(currentSong.id);
    if (playbackHistory.length > 30) playbackHistory.shift();
  }

  function chooseRandomSongId(songIds, excludedId) {
    const candidates = songIds.filter((songId) => songId !== excludedId);
    if (candidates.length === 0) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  function getLibraryNextId() {
    const state = modes?.getState() || { shuffle: false, repeat: "off" };
    if (state.shuffle) {
      if (shuffleRemaining.length === 0) {
        shuffleRemaining = songs.map((song) => song.id);
      }
      const nextId = chooseRandomSongId(shuffleRemaining, songs[currentSongIndex].id);
      if (nextId === null) return songs[currentSongIndex].id;
      shuffleRemaining = shuffleRemaining.filter((songId) => songId !== nextId);
      return nextId;
    }
    return songs[(currentSongIndex + 1) % songs.length].id;
  }

  function getQueueNextId(state) {
    const queuedIds = queue?.getQueue() || [];
    if (queuedIds.length === 0) return null;
    if (state.repeat === "all") {
      const currentQueueIds = queuedIds;
      if (queueCycle.join() !== currentQueueIds.join()) {
        queueCycle = [...currentQueueIds];
        queueCycleRemaining = [...currentQueueIds];
      }
      if (queueCycleRemaining.length === 0) queueCycleRemaining = [...queueCycle];
      const nextId = state.shuffle
        ? chooseRandomSongId(queueCycleRemaining, songs[currentSongIndex].id)
        : queueCycleRemaining[0];
      queueCycleRemaining = queueCycleRemaining.filter((songId) => songId !== nextId);
      return nextId;
    }
    const nextId = state.shuffle
      ? chooseRandomSongId(queuedIds, songs[currentSongIndex].id)
      : queuedIds[0];
    return nextId;
  }

  function getNextPlaybackTrack({ automatic = false } = {}) {
    const state = modes?.getState() || { shuffle: false, repeat: "off" };
    if (automatic && state.repeat === "one") return songs[currentSongIndex];

    const queueSongId = getQueueNextId(state);
    if (queueSongId !== null) {
      if (state.repeat !== "all") queue?.removeFromQueue(queueSongId);
      return songs.find((song) => song.id === queueSongId) || null;
    }

    if (automatic && state.repeat === "off" && !state.shuffle) {
      return songs[(currentSongIndex + 1) % songs.length];
    }
    return songs.find((song) => song.id === getLibraryNextId()) || null;
  }

  function playNext({ automatic = false } = {}) {
    const nextSong = getNextPlaybackTrack({ automatic });
    if (!nextSong) return;
    rememberCurrentSong();
    loadSong(songs.indexOf(nextSong), true);
  }

  function goToNextSong() {
    playNext({ automatic: false });
  }

  function handleEnded() {
    playNext({ automatic: true });
  }

  function goToPreviousSong() {
    const state = modes?.getState() || { shuffle: false };
    if (state.shuffle && playbackHistory.length > 0) {
      const previousId = playbackHistory.pop();
      const previousSong = songs.find((song) => song.id === previousId);
      if (previousSong) {
        loadSong(songs.indexOf(previousSong), true);
        return;
      }
    }
    loadSong((currentSongIndex - 1 + songs.length) % songs.length, isPlaying());
  }

  function handleModeChange(state) {
    shuffleRemaining = [];
    queueCycle = [];
    queueCycleRemaining = [];
    onModeChange?.(state);
  }

  if (audio) {
    audio.volume = previousVolume;
    audio.addEventListener("play", () => {
      updatePlayButton(true);
      onPlay(songs[currentSongIndex]);
    });
    audio.addEventListener("pause", () => {
      updatePlayButton(false);
      onPause();
    });
    audio.addEventListener("loadedmetadata", updateProgress);
    audio.addEventListener("canplay", updateProgress);
    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", handleEnded);
  }

  if (playButton) {
    playButton.addEventListener("click", togglePlayPause);
  }
  if (previousButton) {
    previousButton.addEventListener("click", goToPreviousSong);
  }
  if (nextButton) {
    nextButton.addEventListener("click", goToNextSong);
  }

  const shuffleButton = document.querySelector(".shuffle-button");
  const repeatButton = document.querySelector(".repeat-button");
  if (shuffleButton) shuffleButton.addEventListener("click", () => modes?.toggleShuffle());
  if (repeatButton) repeatButton.addEventListener("click", () => modes?.cycleRepeat());
  modes?.subscribe(handleModeChange);
  handleModeChange(modes?.getState() || { shuffle: false, repeat: "off" });

  if (volumeSlider && audio) {
    volumeSlider.addEventListener("input", (event) => {
      const value = Number(event.target.value) / 100;
      previousVolume = value;
      audio.volume = value;
      audio.muted = value === 0;
      updateVolume();
    });
  }

  if (volumeIcon && audio) {
    volumeIcon.addEventListener("click", () => {
      if (audio.muted) {
        audio.muted = false;
        audio.volume = previousVolume || 0.68;
      } else {
        previousVolume = audio.volume || previousVolume;
        audio.muted = true;
        audio.volume = 0;
      }
      updateVolume();
    });
  }

  if (progressTrack) {
    progressTrack.addEventListener("click", (event) => {
      if (isDraggingProgress) return;
      const fraction = calculateDragFraction(event);
      commitSeek(fraction);
    });

    progressTrack.addEventListener("pointerdown", (event) => {
      isDraggingProgress = true;
      dragFraction = calculateDragFraction(event);
      if (progressTrack.setPointerCapture) {
        try {
          progressTrack.setPointerCapture(event.pointerId);
        } catch (_) {}
      }
      updateVisualSeek();
    });

    progressTrack.addEventListener("keydown", handleKeyboardSeek);
  }

  window.addEventListener("pointermove", (event) => {
    if (!isDraggingProgress) return;
    dragFraction = calculateDragFraction(event);

    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(updateVisualSeek);
  });

  window.addEventListener("pointerup", (event) => {
    if (!isDraggingProgress) return;
    isDraggingProgress = false;
    if (rafId) cancelAnimationFrame(rafId);
    commitSeek(dragFraction);
  });

  updateVolume();
  loadSong(currentSongIndex);

  return {
    loadSong,
    playCurrentSong,
    pauseCurrentSong,
    togglePlayPause,
    isPlaying,
    getCurrentSong: () => songs[currentSongIndex],
    getCurrentIndex: () => currentSongIndex,
    getNextPlaybackTrack,
    playSongById: (songId) => {
      const song = queue?.playQueuedSong(songId);
      if (!song) return false;
      loadSong(songs.indexOf(song), true);
      return true;
    },
  };
}
