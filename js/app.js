import { songs } from "./data/songs.js";
import {
  getLikedSongs,
  saveLikedSongs,
  getRecentlyPlayed,
  saveRecentlyPlayed,
} from "./storage/storage.js";
import { searchSongs } from "./search/search.js";
import { createPlayer } from "./player/player.js";
import { createUI } from "./ui/ui.js";
import { createQueue } from "./queue/queue.js";
import { createPlaybackMode } from "./player/playback-mode.js";
import { initializeKeyboardControls } from "./keyboard/keyboard.js";

const MAX_RECENT_SONGS = 5;
const THEME_STORAGE_KEY = "tunesphare-theme";

function initializeTheme() {
  const root = document.documentElement;
  const themeToggle = document.querySelector(".theme-toggle");
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const initialTheme = storedTheme === "light" ? "light" : "dark";

  function setTheme(theme) {
    const isLight = theme === "light";
    root.dataset.theme = theme;
    themeToggle?.setAttribute("aria-pressed", String(isLight));
    themeToggle?.setAttribute(
      "aria-label",
      isLight ? "Switch to dark theme" : "Switch to light theme"
    );
    themeToggle?.setAttribute(
      "title",
      isLight ? "Use dark theme" : "Use light theme"
    );
    if (themeToggle) {
      themeToggle.querySelector(".theme-toggle-icon").textContent = isLight
        ? "◐"
        : "☼";
      themeToggle.querySelector(".theme-toggle-label").textContent = isLight
        ? "Dark"
        : "Light";
    }
  }

  setTheme(initialTheme);
  themeToggle?.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "light" ? "dark" : "light";
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    setTheme(nextTheme);
  });
}

function formatTime(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return "--:--";
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function initApp() {
  initializeTheme();
  let currentView = "all";
  let likedSongIds = getValidSongIds(getLikedSongs());
  let recentlyPlayedIds = getValidSongIds(getRecentlyPlayed());
  const durationMap = {};

  const ui = createUI(songs);
  let player = null;

  function getValidSongIds(songIds) {
    return [...new Set(songIds)].filter((songId) =>
      songs.some((song) => song.id === songId)
    );
  }

  function getSongById(songId) {
    return songs.find((song) => song.id === songId);
  }

  function getHomeData() {
    const trending = [...songs]
      .sort(
        (first, second) => (second.popularity || 0) - (first.popularity || 0)
      )
      .slice(0, 8);
    const artistMap = new Map();
    const genreMap = new Map();
    songs.forEach((song) => {
      const artistName =
        String(song.artist || "Unknown artist").trim() || "Unknown artist";
      const genreName = String(song.genre || "Other").trim() || "Other";
      const artist = artistMap.get(artistName) || {
        name: artistName,
        score: 0,
        trackCount: 0,
      };
      artist.score += Number(song.popularity) || 0;
      artist.trackCount += 1;
      artistMap.set(artistName, artist);
      const genre = genreMap.get(genreName) || {
        name: genreName,
        trackCount: 0,
      };
      genre.trackCount += 1;
      genreMap.set(genreName, genre);
    });
    const artists = [...artistMap.values()]
      .sort(
        (first, second) =>
          second.score - first.score || first.name.localeCompare(second.name)
      )
      .map((artist) => ({
        ...artist,
        image: artist.name
          .split(/\s+/)
          .filter(Boolean)
          .map((word) => word[0])
          .join("")
          .slice(0, 2)
          .toUpperCase(),
      }));
    const genres = [...genreMap.values()].sort((first, second) =>
      first.name.localeCompare(second.name)
    );
    return {
      recent: recentlyPlayedIds.map(getSongById).filter(Boolean),
      trending,
      artists,
      genres,
    };
  }

  const queue = createQueue(songs, {
    onChange: (queueIds) => ui.renderQueue(queueIds, getSongById),
  });
  const modes = createPlaybackMode();

  function getViewSongs() {
    if (currentView === "liked") {
      return likedSongIds.map(getSongById).filter(Boolean);
    }
    if (currentView === "recent") {
      return recentlyPlayedIds.map(getSongById).filter(Boolean);
    }
    return songs;
  }

  function getCollectionMessage(view, hasSearchTerm) {
    if (hasSearchTerm) return "No songs found. Try another song or artist.";
    if (view === "liked")
      return "No liked songs yet. Start liking songs to build your collection.";
    if (view === "recent")
      return "No recently played songs. Start listening to build your history.";
    return "No songs found. Try another song or artist.";
  }

  function renderCurrentView() {
    const query = ui.searchInput ? ui.searchInput.value : "";
    const hasSearchTerm = query.trim().length > 0;
    const visibleSongs = searchSongs(getViewSongs(), query);

    ui.showView(currentView);
    if (currentView === "library") {
      const liked = searchSongs(
        likedSongIds.map(getSongById).filter(Boolean),
        query
      );
      const recent = searchSongs(
        recentlyPlayedIds.map(getSongById).filter(Boolean),
        query
      );
      const all = searchSongs(songs, query);
      ui.renderLibrary(
        {
          liked,
          recent,
          all,
          likedMessage: hasSearchTerm
            ? "No songs found. Try another song or artist."
            : "No liked songs yet. Start liking songs to build your collection.",
          recentMessage: hasSearchTerm
            ? "No songs found. Try another song or artist."
            : "No recently played songs. Start listening to build your history.",
        },
        likedSongIds,
        durationMap
      );
    } else {
      if (currentView === "all") {
        ui.renderHome(getHomeData(), likedSongIds, durationMap);
      }
      ui.renderSongs(
        visibleSongs,
        getCollectionMessage(currentView, hasSearchTerm),
        likedSongIds,
        durationMap
      );
    }

    if (player) {
      const currentSong = player.getCurrentSong();
      ui.updateActiveSong(
        currentSong ? currentSong.id : null,
        player.isPlaying()
      );
    }
  }

  function toggleLike(songId) {
    const song = getSongById(songId);
    if (!song) return;

    const isCurrentlyLiked = likedSongIds.includes(songId);
    likedSongIds = isCurrentlyLiked
      ? likedSongIds.filter((id) => id !== songId)
      : [...likedSongIds, songId];

    saveLikedSongs(likedSongIds);

    if (currentView === "library" || currentView === "liked") {
      renderCurrentView();
    } else {
      ui.updateTrackLikeState(songId, !isCurrentlyLiked, song.title);
    }
    ui.showStatus(`${song.title} ${isCurrentlyLiked ? "unliked" : "liked"}`);
  }

  function addToRecentlyPlayed(songId) {
    if (!getSongById(songId)) return;
    recentlyPlayedIds = [
      songId,
      ...recentlyPlayedIds.filter((id) => id !== songId),
    ].slice(0, MAX_RECENT_SONGS);
    saveRecentlyPlayed(recentlyPlayedIds);
    if (currentView === "library" || currentView === "recent") {
      renderCurrentView();
    }
    if (currentView === "all")
      ui.renderHome(getHomeData(), likedSongIds, durationMap);
  }

  player = createPlayer(songs, {
    queue,
    modes,
    onModeChange: (state) => ui.updatePlaybackModes(state),
    onStatus: (message, isError) => ui.showStatus(message, isError),
    onPlay: (song) => {
      addToRecentlyPlayed(song.id);
      ui.updateActiveSong(song.id, true);
    },
    onPause: () => {
      const song = player.getCurrentSong();
      ui.updateActiveSong(song ? song.id : null, false);
    },
  });
  initializeKeyboardControls({ player, modes, ui });

  function addSongToQueue(songId) {
    const song = getSongById(songId);
    if (!song) return;
    if (player.getCurrentSong()?.id === songId) {
      ui.showQueueFeedback("Currently playing");
      return;
    }
    if (!queue.addToQueue(songId)) {
      ui.showQueueFeedback("Already in queue");
      return;
    }
    ui.showQueueFeedback(`${song.title} added to queue`);
  }

  function handleTrackActivation(songId) {
    const targetSong = getSongById(songId);
    if (!targetSong) return;

    const currentSong = player.getCurrentSong();
    if (currentSong && currentSong.id === songId) {
      player.togglePlayPause();
    } else {
      const index = songs.indexOf(targetSong);
      if (index !== -1) {
        player.loadSong(index, true);
      }
    }
  }

  // Preload song metadata asynchronously to display real durations
  songs.forEach((song) => {
    const tempAudio = new Audio();
    tempAudio.preload = "metadata";
    tempAudio.addEventListener("loadedmetadata", () => {
      if (Number.isFinite(tempAudio.duration)) {
        durationMap[song.id] = formatTime(tempAudio.duration);
        ui.updateTrackDurations(durationMap);
      }
    });
    tempAudio.src = song.source;
  });

  document.addEventListener("click", (event) => {
    const likeButton = event.target.closest(".like-button");
    if (likeButton) {
      event.stopPropagation();
      toggleLike(Number(likeButton.dataset.songId));
      return;
    }

    const homeFilter = event.target.closest("[data-home-filter]");
    if (homeFilter) {
      const libraryLink = document.querySelector(
        '.nav-link[data-view="library"]'
      );
      currentView = "library";
      if (ui.searchInput)
        ui.searchInput.value = homeFilter.dataset.homeFilter || "";
      if (libraryLink) ui.setActiveNavigation(libraryLink);
      renderCurrentView();
      return;
    }

    const queueButton = event.target.closest(".queue-button");
    if (queueButton) {
      event.stopPropagation();
      addSongToQueue(Number(queueButton.dataset.songId));
      return;
    }

    const queueRemove = event.target.closest(".queue-remove");
    if (queueRemove) {
      const song = getSongById(Number(queueRemove.dataset.queueSongId));
      if (queue.removeFromQueue(Number(queueRemove.dataset.queueSongId))) {
        ui.showStatus(`${song?.title || "Track"} removed from queue`);
      }
      return;
    }

    const queueSong = event.target.closest(".queue-song");
    if (queueSong) {
      player.playSongById(Number(queueSong.dataset.queueSongId));
      return;
    }

    const trackPlayButton = event.target.closest(".track-play");
    if (trackPlayButton) {
      event.stopPropagation();
      handleTrackActivation(Number(trackPlayButton.dataset.songId));
      return;
    }

    const trackRow = event.target.closest(".track-row");
    if (trackRow) {
      handleTrackActivation(Number(trackRow.dataset.songId));
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const trackRow = event.target.closest(".track-row");
    if (!trackRow || event.target.closest("button")) return;
    event.preventDefault();
    handleTrackActivation(Number(trackRow.dataset.songId));
  });

  const searchForm = document.querySelector(".search-form");
  if (ui.searchInput) {
    ui.searchInput.addEventListener("input", renderCurrentView);
  }
  if (searchForm) {
    searchForm.addEventListener("submit", (event) => event.preventDefault());
  }
  document.querySelector(".clear-queue")?.addEventListener("click", () => {
    if (queue.clearQueue()) ui.showStatus("Queue cleared");
  });

  const sidebar = document.querySelector("#sidebar");
  const openButton = document.querySelector("[data-nav-open]");
  const closeButton = document.querySelector("[data-nav-close]");
  const navigationLinks = document.querySelectorAll(".nav-link");

  function setNavigationState(isOpen) {
    if (!sidebar || !openButton) return;
    sidebar.classList.toggle("is-open", isOpen);
    openButton.setAttribute("aria-expanded", String(isOpen));
  }

  if (openButton) {
    openButton.addEventListener("click", () => setNavigationState(true));
  }
  if (closeButton) {
    closeButton.addEventListener("click", () => setNavigationState(false));
  }

  navigationLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      if (link.dataset.view) {
        event.preventDefault();
        currentView = link.dataset.view;
        ui.setActiveNavigation(link);
        renderCurrentView();
      }
      setNavigationState(false);
    });
  });

  renderCurrentView();
  ui.renderQueue(queue.getQueue(), getSongById);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
