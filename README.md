# TuneSphare

A modern local music web application built with HTML5, CSS3, and vanilla JavaScript.

The project was renamed from EchoVerse to TuneSphare. Existing LocalStorage data
is migrated automatically to the new TuneSphare storage namespace.

## Current Phase

Stage A2.5 — Home Page Expansion

## Technologies

- HTML5
- CSS3 (Vanilla design tokens, flexbox & CSS grid)
- JavaScript (Native ES Modules)
- HTML5 Audio API
- LocalStorage

## Current Features

- Responsive music streaming UI dashboard
- Sidebar navigation & mobile navigation drawer
- Track search & real-time filtering across titles, artists, albums, and genres
- Local music playback (Play/Pause, Next, Previous, Auto-advance)
- Throttled seek-bar dragging with `requestAnimationFrame` and ARIA accessibility
- Dedicated album artwork for all tracks
- Real-time audio metadata duration loading
- Like/unlike tracks with targeted in-place DOM updates
- Persistent liked songs and recently played history in LocalStorage
- Ordered up-next queue with add, remove, clear, and play-from-queue actions
- Queue-aware Next button and automatic end-of-track playback
- Persistent queue song IDs with invalid and duplicate entries removed on startup
- Global keyboard controls for playback, seeking, volume, Queue, Shuffle, and Repeat
- Keyboard shortcut help dialog with focus restoration and text-input protection
- A2.3 global shortcuts: Space, N/P, M, S, R, Q, Escape, seek, volume, Home, and End
- Shuffle playback with bounded no-immediate-repeat cycles
- Repeat Off, Repeat All, and Repeat One modes
- Queue-aware mode selection without mutating the persisted queue order
- Persisted playback modes with keyboard-accessible controls
- Enhanced Now Playing artwork, metadata, duration, and playback-state feedback
- Loading, buffering, and user-facing audio error states
- Targeted like, queue, and playback status announcements
- Reduced-motion-aware player state animation and responsive player controls
- A2.4 polished Now Playing state with loading, buffering, and playback-error feedback
- Stable album artwork fallback, synchronized time/progress, and improved volume/mute UX
- Targeted like/queue status feedback with reduced-motion-aware state animation

### A2.5 — Home Page Expansion

The Home dashboard now includes LocalStorage-backed Recently Played tracks,
curated Trending Tracks from explicit song popularity metadata, and derived Top
Artists and Genres. Artist and genre cards reuse
the existing library search flow, while all track actions continue to use the
single player, queue, and like systems. The expanded Home page is responsive at
desktop, tablet, and mobile widths with semantic controls, live states, artwork
fallbacks, keyboard focus support, and accessible labels.

## Stage A1 Accomplishments

- **Track Play/Pause Fix**: Direct play button (`▶`/`❚❚`) and row activation logic cleanly toggles pause/play on current active song without restarting track position.
- **Targeted DOM Updates**: Liking a track updates only the target row's heart icon, `aria-pressed`, and class state, eliminating full collection re-renders and scroll resets.
- **Smooth Seek-Bar Dragging**: Throttled pointer drag visual progress using `requestAnimationFrame`, committing audio `currentTime` on release to prevent stuttering/crackling.
- **Seek-Bar Accessibility**: Added `role="slider"`, `tabindex="0"`, `aria-valuenow`, `aria-valuetext`, and `ArrowLeft`/`ArrowRight`/`Home`/`End` keyboard seeking support.
- **Dead CSS Purge**: Audited and removed 350+ lines of legacy unused CSS rules (`.welcome-panel`, `.featured-grid`, `.playlist-card`, `.profile-button`, etc.).
- **Async Real Durations**: Asynchronously preloads track metadata to display formatted `M:SS` song durations instead of `--:--`.
- **Initialization TDZ Fix**: Re-architected startup flow into a clean `initApp()` controller function.
- **Dedicated Album Artwork**: Assigned unique album cover artwork for `Barsaat`, `Bairan`, and `Tu Zaroori`.

### JavaScript Architecture

```text
js/
├── app.js            # Controlled application initialization & event handlers
├── data/songs.js     # Master song metadata and audio/cover source paths
├── player/player.js  # Audio player engine, volume, seek bar & playback
├── player/playback-mode.js # Persisted Shuffle and Repeat mode state
├── keyboard/keyboard.js # Centralized global shortcut handling and input guards
├── search/search.js  # Pure function search and filtering logic
├── storage/storage.js # LocalStorage read/write for library, queue, and modes
├── ui/ui.js           # Dynamic DOM rendering, targeted state updates & navigation
└── queue/queue.js     # Ordered queue state and queue operations
```

## How to Run Locally

Run TuneSphare through a local HTTP development server because ES modules require standard HTTP origin context:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000` in your web browser.

### A2.3 — Keyboard Controls

Global shortcuts are available when focus is outside an input, select, textarea,
editable element, link, button, or playback slider:

- **Space** — Play / Pause
- **N / P** — Next / Previous track
- **M** — Mute / Unmute
- **S / R** — Toggle Shuffle / cycle Repeat
- **Q / Esc** — Focus Queue / close the active help overlay or return Queue focus
- **Left / Right** — Seek backward / forward
- **Up / Down** — Decrease / increase volume
- **Home / End** — Seek to the start / end of the current track

Modifier combinations remain available to the browser, repeated action keys are
ignored, and the shortcut reference is available from the Keyboard shortcuts
button. Existing touch and pointer controls remain available.

### A2.4 — Advanced Player UX

The final Vanilla JavaScript polish adds synchronized Now Playing artwork and
metadata, explicit Playing, Paused, Loading, Buffering, and Playback Error
states, stable progress and duration updates, accessible volume/mute behavior,
and concise live feedback for likes and queue actions. Artwork has a safe
fallback, transitions update together, and high-frequency progress updates
avoid redundant DOM writes. The player, queue, dialog, and controls remain
usable at desktop, tablet, and mobile widths, with reduced-motion support.

## Phase History

- **Phase 1** — UI foundation & dashboard layout
- **Phase 2** — Music playback & player controls
- **Phase 3** — Dynamic music library, search, and filtering
- **Phase 4** — LocalStorage & user library persistence
- **Phase 5** — Native ES module architecture refactoring
- **Stage A1** — Codebase cleanup, targeted DOM updates, seek-bar throttling & accessibility polish
- **Stage A2.1** — Queue management
- **Stage A2.2** — Shuffle and Repeat playback modes
- **Stage A2.3** — Keyboard controls and global shortcuts
- **Stage A2.4** — Advanced Player UX and final Vanilla JavaScript polish
- **Stage A2.5** — Home Page Expansion, derived discovery sections, responsive footer, and accessibility polish

## Future Roadmap

- **Stage A3** — User-created custom playlists
- **Stage B** — Web Audio API equalizer visualizer
- **Stage C** — Backend / API integration & React migration
