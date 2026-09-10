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

    trackRow.append(
      trackNumber,
      miniArt,
      trackInfo,
      trackMeta,
      likeButton,
      playButton
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
    updateActiveSong,
    showView,
    setActiveNavigation,
  };
}
