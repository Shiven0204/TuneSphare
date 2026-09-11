function getSongInitials(song) {
  return song.title
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function createUI(songs) {
  const mainSongSection = document.querySelector(".popular-section");
  const libraryOverview = document.querySelector(".library-overview");
  const trackList = document.querySelector(".track-list");
  const libraryLikedList = document.querySelector(".library-liked-list");
  const libraryRecentList = document.querySelector(".library-recent-list");
  const libraryAllList = document.querySelector(".library-all-list");
  const searchInput = document.querySelector("#song-search");
  const navigationLinks = document.querySelectorAll(".nav-link");
  const queuePanel = document.querySelector(".queue-panel");
  const shortcutsButton = document.querySelector(".shortcuts-button");
  const shortcutsDialog = document.querySelector(".shortcuts-dialog");
  const shortcutsClose = document.querySelector(".shortcuts-close");
  let queueReturnFocus = null;
  let dialogReturnFocus = null;

  function createTrackRow(song, songIndex, likedSongIds, durationMap = {}) {
    const trackRow = document.createElement("article");
    const trackNumber = document.createElement("span");
    const miniArt = document.createElement("div");
    const artworkLabel = document.createElement("span");
    const trackInfo = document.createElement("div");
    const title = document.createElement("h3");
    const artist = document.createElement("p");
    const trackMeta = document.createElement("span");
    const likeButton = document.createElement("button");
    const playButton = document.createElement("button");
    const queueButton = document.createElement("button");
    const isLiked = likedSongIds.includes(song.id);

    trackRow.className = "track-row";
    trackRow.dataset.songId = String(song.id);
    trackRow.tabIndex = 0;
    trackNumber.className = "track-number";
    trackNumber.textContent = String(songIndex + 1).padStart(2, "0");
    miniArt.className = "mini-art";
    miniArt.style.backgroundImage = `url('${song.cover}')`;
    miniArt.style.backgroundSize = "cover";
    miniArt.style.backgroundPosition = "center";
    artworkLabel.textContent = getSongInitials(song);
    miniArt.append(artworkLabel);
    trackInfo.className = "track-info";
    title.textContent = song.title;
    artist.textContent = song.artist;
    trackInfo.append(title, artist);
    trackMeta.className = "track-meta";
    trackMeta.textContent = durationMap[song.id] || "--:--";
    likeButton.className = "icon-button like-button";
    likeButton.type = "button";
    likeButton.dataset.songId = String(song.id);
    likeButton.setAttribute("aria-pressed", String(isLiked));
    likeButton.setAttribute(
      "aria-label",
      isLiked ? `Unlike ${song.title}` : `Like ${song.title}`
    );
    likeButton.textContent = isLiked ? "♥" : "♡";
    likeButton.classList.toggle("is-liked", isLiked);
    playButton.className = "icon-button track-play";
    playButton.type = "button";
    playButton.dataset.songId = String(song.id);
    playButton.setAttribute("aria-label", `Play ${song.title}`);
    playButton.textContent = "▶";
    queueButton.className = "icon-button queue-button";
    queueButton.type = "button";
    queueButton.dataset.songId = String(song.id);
    queueButton.setAttribute("aria-label", `Add ${song.title} to queue`);
    queueButton.textContent = "+";

    trackRow.append(
      trackNumber,
      miniArt,
      trackInfo,
      trackMeta,
      likeButton,
      playButton,
      queueButton
    );
    return trackRow;
  }

  function renderCollection(
    container,
    collection,
    emptyMessage,
    likedSongIds,
    durationMap = {}
  ) {
    if (!container) return;
    container.replaceChildren();
    if (collection.length === 0) {
      const emptyState = document.createElement("p");
      emptyState.className = "empty-state";
      emptyState.textContent = emptyMessage;
      container.append(emptyState);
      return;
    }
    collection.forEach((song) =>
      container.append(
        createTrackRow(song, songs.indexOf(song), likedSongIds, durationMap)
      )
    );
  }

  function renderSongs(collection, emptyMessage, likedSongIds, durationMap) {
    renderCollection(
      trackList,
      collection,
      emptyMessage,
      likedSongIds,
      durationMap
    );
  }

  function renderLibrary(collections, likedSongIds, durationMap) {
    renderCollection(
      libraryLikedList,
      collections.liked,
      collections.likedMessage,
      likedSongIds,
      durationMap
    );
    renderCollection(
      libraryRecentList,
      collections.recent,
      collections.recentMessage,
      likedSongIds,
      durationMap
    );
    renderCollection(
      libraryAllList,
      collections.all,
      "No songs found.",
      likedSongIds,
      durationMap
    );
  }

  function updateTrackLikeState(songId, isLiked, songTitle = "") {
    const likeButtons = document.querySelectorAll(
      `.like-button[data-song-id="${songId}"]`
    );
    likeButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(isLiked));
      button.classList.toggle("is-liked", isLiked);
      button.textContent = isLiked ? "♥" : "♡";
      if (songTitle) {
        button.setAttribute(
          "aria-label",
          isLiked ? `Unlike ${songTitle}` : `Like ${songTitle}`
        );
      }
    });
  }

  function updateTrackDurations(durationMap) {
    document.querySelectorAll(".track-row").forEach((row) => {
      const songId = Number(row.dataset.songId);
      const metaSpan = row.querySelector(".track-meta");
      if (metaSpan && durationMap[songId]) {
        metaSpan.textContent = durationMap[songId];
      }
    });
  }

  function renderQueue(queueSongs, getSongById) {
    const queueList = document.querySelector(".queue-list");
    const queueCount = document.querySelector(".queue-count");
    if (!queueList) return;
    queueList.replaceChildren();
    if (queueCount) queueCount.textContent = `Queue (${queueSongs.length})`;
    if (queueSongs.length === 0) {
      const emptyState = document.createElement("p");
      emptyState.className = "queue-empty";
      emptyState.textContent =
        "Your queue is empty. Add songs to play them next.";
      queueList.append(emptyState);
      return;
    }
    queueSongs.forEach((songId, index) => {
      const song = getSongById(songId);
      if (!song) return;
      const item = document.createElement("article");
      const songButton = document.createElement("button");
      const removeButton = document.createElement("button");
      item.className = "queue-item";
      songButton.className = "queue-song";
      songButton.type = "button";
      songButton.dataset.queueSongId = String(song.id);
      songButton.setAttribute("aria-label", `Play ${song.title} from queue`);
      songButton.innerHTML = `<span class="queue-position">${
        index + 1
      }</span><span class="queue-copy"><strong></strong><span></span></span>`;
      songButton.querySelector("strong").textContent = song.title;
      songButton.querySelector(".queue-copy span").textContent = song.artist;
      removeButton.className = "icon-button queue-remove";
      removeButton.type = "button";
      removeButton.dataset.queueSongId = String(song.id);
      removeButton.setAttribute(
        "aria-label",
        `Remove ${song.title} from queue`
      );
      removeButton.textContent = "×";
      item.append(songButton, removeButton);
      queueList.append(item);
    });
  }

  function showQueueFeedback(message) {
    const feedback = document.querySelector(".queue-feedback");
    if (feedback) feedback.textContent = message;
  }

  function focusQueue() {
    if (!queuePanel) return;
    queueReturnFocus = document.activeElement?.matches("body")
      ? document.querySelector(".shortcuts-button")
      : document.activeElement;
    queuePanel.focus();
  }

  function closeQueue() {
    if (!queuePanel?.contains(document.activeElement)) return false;
    const returnTarget = queueReturnFocus;
    queueReturnFocus = null;
    returnTarget?.focus?.();
    return true;
  }

  function openShortcutHelp() {
    if (!shortcutsDialog) return;
    dialogReturnFocus = document.activeElement;
    if (!shortcutsDialog.open) shortcutsDialog.showModal();
    shortcutsClose?.focus();
  }

  function closeShortcutHelp() {
    if (!shortcutsDialog?.open) return false;
    shortcutsDialog.close();
    const returnTarget = dialogReturnFocus;
    dialogReturnFocus = null;
    returnTarget?.focus?.();
    return true;
  }

  function closeOverlays() {
    return closeShortcutHelp() || closeQueue();
  }

  shortcutsButton?.addEventListener("click", openShortcutHelp);
  shortcutsClose?.addEventListener("click", closeShortcutHelp);
  shortcutsDialog?.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeShortcutHelp();
  });
  shortcutsDialog?.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    closeShortcutHelp();
  });

  function updatePlaybackModes({ shuffle, repeat }) {
    const shuffleButton = document.querySelector(".shuffle-button");
    const repeatButton = document.querySelector(".repeat-button");
    if (shuffleButton) {
      shuffleButton.setAttribute("aria-pressed", String(shuffle));
      shuffleButton.setAttribute(
        "aria-label",
        `Shuffle ${shuffle ? "on" : "off"}`
      );
      shuffleButton.title = `Shuffle ${shuffle ? "on" : "off"}`;
      shuffleButton.classList.toggle("is-active", shuffle);
    }
    if (repeatButton) {
      const repeatLabel =
        repeat === "all" ? "all" : repeat === "one" ? "one" : "off";
      repeatButton.setAttribute("aria-pressed", String(repeat !== "off"));
      repeatButton.setAttribute("aria-label", `Repeat ${repeatLabel}`);
      repeatButton.title = `Repeat ${repeatLabel}`;
      repeatButton.dataset.repeatMode = repeat;
      repeatButton.classList.toggle("is-active", repeat !== "off");
    }
  }

  function updateActiveSong(currentSongId, isPlaying) {
    document.querySelectorAll(".track-row").forEach((row) => {
      const songId = Number(row.dataset.songId);
      const isThisSongActive = songId === currentSongId;
      const activeAndPlaying = isThisSongActive && isPlaying;

      row.classList.toggle("active-song", isThisSongActive);
      row.setAttribute("aria-current", isThisSongActive ? "true" : "false");

      const playBtn = row.querySelector(".track-play");
      if (playBtn) {
        const songTitle =
          row.querySelector(".track-info h3")?.textContent || "track";
        playBtn.textContent = activeAndPlaying ? "❚❚" : "▶";
        playBtn.setAttribute(
          "aria-label",
          activeAndPlaying ? `Pause ${songTitle}` : `Play ${songTitle}`
        );
      }
    });
  }

  function showView(view) {
    const isLibrary = view === "library";
    if (mainSongSection) mainSongSection.hidden = isLibrary;
    if (libraryOverview) libraryOverview.hidden = !isLibrary;
  }

  function setActiveNavigation(activeLink) {
    navigationLinks.forEach((link) =>
      link.classList.toggle("is-active", link === activeLink)
    );
  }

  return {
    get searchInput() {
      return searchInput;
    },
    renderSongs,
    renderLibrary,
    updateTrackLikeState,
    updateTrackDurations,
    renderQueue,
    showQueueFeedback,
    updatePlaybackModes,
    focusQueue,
    closeOverlays,
    updateActiveSong,
    showView,
    setActiveNavigation,
  };
}
