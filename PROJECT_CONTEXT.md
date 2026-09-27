# PROJECT_CONTEXT.md — TuneSphare

> A snapshot of **everything already built** in this project, written so you (or an
> AI assistant) can quickly understand the current state without re-reading the
> whole codebase. Last analyzed: **2026-09-27**, git HEAD `e8b16e9` on `main`.

---

## 1. Project Overview

**TuneSphare** is a local, browser-based music player (no backend) built as a
single-page app. It plays MP3 files served from the project's `public/` folder
and persists user data (likes, history) in `localStorage`.

- **Originally named `EchoVerse`** — renamed to `TuneSphare` on 2026-09-13, with
  an automatic `localStorage` migration from the `echoverse-*` keys to the
  `tunesphare-*` namespace (see §7).
- **Remote:** `https://github.com/Shiven0204/EchoVerse.git` (repo URL still says EchoVerse).
- **19 commits** total, from 2026-08-31 to 2026-09-18.

### Current phase
Two parallel codebases exist:

1. **`src/` — React app (ACTIVE).** `index.html` only mounts `/src/main.jsx`.
   This is what actually runs under `npm run dev`.
2. **`js/` + `css/` — Vanilla implementation (LEGACY REFERENCE, NOT LOADED).**
   A fully-featured older version. `index.html` no longer references it, so it
   is dead code kept as a migration reference. It is **more complete than the
   React version in several areas** (see §6 for the gap list).

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| UI | React 19.1.1 (function components + hooks, `StrictMode`) |
| Build | Vite 7.1.3 + `@vitejs/plugin-react` 5.0.2 |
| Language | JavaScript (ESM), JSX — **no TypeScript** |
| Styling | Plain CSS (`src/styles/globals.css` + `layout.css`), no framework |
| Audio | HTML5 `<audio>` element driven by React context |
| Persistence | `localStorage` only (no backend, no DB) |
| Data | Static JSON manifest `public/data/songs.json` |
| Routing | **None** — no react-router; sidebar links are `#hash` anchors |
| Tests / Lint | **None** — no test runner, no ESLint/Prettier config |

### npm scripts (`package.json`)
```bash
npm run dev            # Vite dev server
npm run build          # vite build → dist/
npm run preview        # vite preview
npm run generate:songs # node scripts/generate-songs.js (regenerates the song manifest)
```

### `vite.config.js`
- React plugin.
- `server.watch.ignored: ["**/public/music/**"]` so large MP3 files don't
  trigger dev-server reloads.

---

## 3. Data Pipeline (Song Library)

```
public/music/*.mp3            (source audio files)
public/images/covers/*.jpg    (cover art)
        |
        v  npm run generate:songs
scripts/generate-songs.js     scans folders, derives IDs/titles/covers
        |
        v
public/data/songs.json        static manifest  <-- fetched by the React app
        |
        v
src/services/songService.js   fetch("/data/songs.json") + validateSongs()
        |
        v
src/hooks/useSongs.js         { songs, status: loading|success|error, error }
        |
        v
src/App.jsx                   passes `songs` down to all Context providers
```

**`scripts/generate-songs.js` behavior:**
- Reads `public/music/` for `.mp3 .wav .ogg .m4a .aac` files (skips dotfiles),
  sorts them alphabetically.
- Generates a slug ID from the title (NFKD-normalized, deduped with `-2`, `-3` suffixes).
- Derives a display title from the filename (strips `(320 Kbps)`, takes the last
  ` - ` segment, strips `(From ...)`, title-cases).
- Matches a cover from `public/images/covers/` by fuzzy ID comparison; `cover` is `null` if none.
- URL-encodes `source`/`cover` paths (while keeping `& , ( )` readable).
- Writes pretty-printed `public/data/songs.json` and logs each found song.

**Current manifest content (4 songs):** `bairan`, `barsaat`, `tu-zaroori`,
`zinda` — all with `artist: "Unknown Artist"`, `album: "Unknown Album"`,
`genre: "Unknown"`, `popularity: 0` (auto-generated metadata; only 3 have covers,
`zinda` has `cover: null`).

> **Media folders are inconsistent:** `public/music/` (4 MP3s — used by the
> generator) vs. root `music/` (8 MP3s, 4 of them untracked in git — legacy,
> unused by the React app). Rich hand-written metadata (artists, albums,
> genres, popularity) exists only in the legacy `js/data/songs.js` and
> `src/data/songs.js` (3 songs, numeric IDs).

---

## 4. React Application — What Is Built (`src/`)

### Entry & composition
- `src/main.jsx` → `createRoot(#root)` with `StrictMode`.
- `src/App.jsx` → loads songs, shows loading/error states, then nests providers:
  `QueueProvider → PlaybackModeProvider → LikeProvider → RecentlyPlayedProvider → PlayerProvider → AppLayout(Home)`.

### Contexts (state layer) — `src/context/`

| File | State / API | Persistence |
|---|---|---|
| `PlayerContext.jsx` | Single `<audio>` element (rendered inside provider); `currentSong`, `currentIndex`, `isPlaying`, `currentTime`, `duration`, `volume` (default 0.68), `isMuted`, `playbackState` (`idle/loading/playing/paused/buffering/error`), `error`. Actions: `playSong, play, pause, togglePlay, next, previous, seek, setVolume, toggleMute`. Internal play-history (max 30), queue-aware Next, shuffle/random selection, repeat off/all/one, auto-advance on `ended`, full `audioProps` event handlers. | in-memory |
| `QueueContext.jsx` | `queueIds` / `queuedSongs` / `queueCount`; `addToQueue` (valid + no duplicates), `removeFromQueue`, `clearQueue`, `takeNext`, `isInQueue`. | **not persisted** (in-memory) |
| `PlaybackModeContext.jsx` | `shuffle` bool, `repeat` = `off|all|one`, `toggleShuffle`, `cycleRepeat`. | **not persisted** (in-memory) |
| `LikeContext.jsx` | `likedSongIds`, `likedSongs`, `toggleLike`, `isLiked`, `clearLikes`; prunes IDs that no longer exist in the library. | `localStorage` `tunesphare-liked-songs` |
| `RecentlyPlayedContext.jsx` | `recentlyPlayedIds` (max 10), `recentlyPlayedSongs`, `addRecentlyPlayed`, `clearRecentlyPlayed`. | `localStorage` `tunesphare-recently-played` |

### Hooks — `src/hooks/`
`useSongs.js` (fetch manifest) plus thin re-exports: `usePlayer`, `useQueue`,
`useLikes`, `usePlaybackMode`, `useRecentlyPlayed`.

### Services — `src/services/`
- `songService.js` — `fetchSongs()` + `validateSongs()` (requires array; each
  item needs `id`, `title`, `source`).
- `storage.js` — `STORAGE_KEYS`, safe get/set/remove with try/catch,
  `getStoredSongIds()` (dedupe + validate + **legacy numeric-ID mapping**
  `1→barsaat, 2→bairan, 3→tu-zaroori`).

### Components — `src/components/`

**Layout** (`layout/`)
- `AppLayout.jsx` — shell: Sidebar + MobileNav backdrop + TopBar + main +
  QueuePanel + MusicPlayer; holds `isNavigationOpen` and `isQueueOpen` state.
- `Sidebar.jsx` — brand, nav links (Home `#home`, Library `#library`,
  Liked Songs `#liked-songs`, Recently Played `#recently-played`), close button.
- `TopBar.jsx` — mobile menu button, title, **disabled** "Keyboard shortcuts"
  button, **disabled** theme toggle, search form (input exists but is **not
  wired to any filtering**).
- `MobileNav.jsx` — backdrop button that closes the drawer.

**Player** (`player/`)
- `MusicPlayer.jsx` — footer bar; `data-playback-state` attribute + `aria-busy`
  for loading/buffering; composes the four parts below + `QueueToggle`.
- `NowPlaying.jsx` — artwork with `onError` fallback, title/artist, live status
  line (`role=status`/`alert`).
- `PlayerControls.jsx` — Shuffle, Previous, Play/Pause, Next, Repeat buttons
  with `aria-pressed` and active styling; disabled when nothing is loaded.
- `ProgressBar.jsx` — controlled `<input type="range">` seek slider,
  `formatTime` helper (exported), `aria-valuetext`, `--progress-percent` CSS var.
- `VolumeControl.jsx` — mute/unmute button + volume slider (0–100).
- `PlayerPlaceholder.jsx` — **unused** legacy placeholder (never imported).

**Queue** (`queue/`)
- `QueueButton.jsx` — add-to-queue per song row (disables + shows check when queued).
- `QueueItem.jsx` — play-from-queue (removes item from queue) + remove button.
- `QueuePanel.jsx` — slide-in "Up next" panel with count, Clear, close, empty state.
- `QueueToggle.jsx` — button in the player bar that opens the panel.

**Songs** (`song/`)
- `SongList.jsx` — maps songs to rows, empty-state message.
- `SongRow.jsx` — number, artwork (with `onError` fallback), title/artist/album/
  genre, whole-row play/pause toggle, `aria-current` for active track,
  `LikeButton` + `QueueButton`.
- `SongCard.jsx` — card variant of a playable song (currently not used by Home).
- `LikeButton.jsx` — heart toggle with `aria-pressed`, `stopPropagation`.

### Pages — `src/pages/`
- `Home.jsx` — three sections, each with `SongList`:
  1. **Music library** (all songs + count),
  2. **Liked Songs** (`#liked-songs`, Clear button),
  3. **Recently Played** (`#recently-played`, Clear button).

### Styles — `src/styles/`
- `globals.css` (58 lines) — reset, dark base colors, focus-visible outlines,
  `.sr-only`, disabled styles.
- `layout.css` (1016 lines) — full app styling: sidebar, topbar, song
  list/rows/cards, player bar with `data-playback-state` states, queue panel,
  responsive breakpoints (theme toggle + shortcuts button hidden on mobile).

### Utilities / data
- `src/utils/playbackUtils.js` — `chooseNextSong` / `choosePreviousSong`
  pure helpers (present, but `PlayerContext` implements its own logic).
- `src/data/songs.js` — **legacy hardcoded 3-song catalog with numeric IDs**
  (not imported by the running app; kept as reference).

---

## 5. Legacy Vanilla Implementation (NOT loaded — reference only)

Located in `js/` and `css/`, ~2,300 lines total. `index.html` no longer loads
it, but it documents behavior that the React app has **not** yet caught up with.

```
js/
├── app.js               (375) init, theme, views, event delegation, nav
├── data/songs.js        (33)  rich 3-song catalog (artists, albums, genres, popularity)
├── keyboard/keyboard.js (79)  global shortcut handling + input guards
├── player/player.js     (490) audio engine, volume, throttled seek bar, states
├── player/playback-mode.js(39) persisted shuffle/repeat
├── queue/queue.js       (55)  ordered queue ops
├── search/search.js     (10)  pure search/filter function
├── storage/storage.js   (100) localStorage incl. EchoVerse→TuneSphare migration
└── ui/ui.js             (423) DOM rendering, targeted updates, status messages
css/style.css            (889) design tokens, light/dark themes, all components
css/responsive.css       (135) breakpoints
```

### Features implemented in Vanilla but missing/not wired in React
1. **Search & real-time filtering** (React TopBar input has no handler).
2. **Light/dark theme toggle** persisted in `tunesphare-theme`
   (React toggle button exists but is `disabled`).
3. **Global keyboard shortcuts** — Space, N/P, M, S, R, Q, Esc, arrows,
   Home/End + shortcuts help dialog (React button exists but is `disabled`).
4. **Persisted queue** (`tunesphare-queue`) — React queue resets on reload.
5. **Persisted shuffle/repeat** (`tunesphare-shuffle`, `tunesphare-repeat-mode`).
6. **Home discovery sections** — Trending Tracks (by `popularity`), Top Artists,
   Top Genres with cards that deep-link into search.
7. **Multiple views** (All / Library / Liked / Recently Played) with active-nav
   switching, rather than single-page anchors.
8. **Status/toast messages** for like/queue actions (`ui.showStatus`).
9. **Vanilla EchoVerse→TuneSphare storage migration** (`tunesphare-storage-migrated`
   flag) — the React `storage.js` does *not* run this migration; it only maps
   legacy numeric IDs.

---

## 6. Feature Status Matrix

| Feature | Vanilla (`js/`) | React (`src/`) |
|---|---|---|
| Responsive dashboard layout, sidebar, mobile drawer | yes | yes |
| Song library list w/ artwork + fallbacks | yes | yes |
| Play/Pause/Next/Previous, auto-advance | yes | yes |
| Progress seek slider + volume/mute | yes (rAF-throttled drag) | yes (range input) |
| Playback state feedback (loading/buffering/error) | yes | yes |
| Like songs (persisted) | yes | yes |
| Recently played (persisted) | yes (max 5) | yes (max 10) |
| Queue add/remove/clear/play-from-queue | yes | yes (not persisted) |
| Shuffle + Repeat off/all/one | yes | yes (not persisted) |
| Search / filtering | yes | **no** (input present, not wired) |
| Keyboard shortcuts + help dialog | yes | **no** (button disabled) |
| Light/dark theme toggle | yes | **no** (button disabled) |
| Trending / Top Artists / Top Genres home sections | yes | **no** |
| View switching (Library/Liked/etc. nav) | yes | partial (anchor links only) |
| Action status messages (toasts) | yes | **no** |
| Song manifest generator (`generate:songs`) | no | yes |
| Fetch songs from JSON manifest | no (static import) | yes |

---

## 7. localStorage Keys

| Key | Purpose | Written by |
|---|---|---|
| `tunesphare-liked-songs` | Liked song IDs | React + Vanilla |
| `tunesphare-recently-played` | Recently played IDs | React + Vanilla |
| `tunesphare-queue` | Queue IDs | Vanilla only |
| `tunesphare-shuffle` | Shuffle on/off | Vanilla only |
| `tunesphare-repeat-mode` | `off|all|one` | Vanilla only |
| `tunesphare-theme` | `light|dark` | Vanilla only |
| `tunesphare-storage-migrated` | One-time migration flag | Vanilla only |
| `echoverse-*` | Pre-rename legacy data | migrated → `tunesphare-*` |

React additionally maps legacy **numeric** IDs (`1,2,3`) to string slugs
(`barsaat, bairan, tu-zaroori`) when reading stored song IDs.

---

## 8. Assets & Static Files

- `public/music/` — 4 MP3s (generator source of truth).
- `public/images/covers/` — `barsaat.jpg`, `bairan.jpg`, `tu-zaroori.jpg`.
- `public/data/songs.json` — generated manifest (committed).
- `music/` — 8 MP3s at project root (legacy; 4 untracked in git).
- `assets/images/` — `logo.png`, `default-album.jpg`; `assets/icons/` (empty).
- `.kilo/worktrees/opalescent-island/` — untracked local snapshot of the project
  from the Kilo coding tool; a stale duplicate of `src/`, `js/`, `css/`, etc.
  Not part of the app (should probably be gitignored/removed).
- `.gitignore` — OS files, `.vscode` (keeps extensions.json), `*.log`,
  `node_modules/`, `dist/`.

---

## 9. Git History (what was built when)

| Date | Commit | Work |
|---|---|---|
| 2026-08-31 | `d31eb64` | Initial EchoVerse music discovery interface |
| 2026-08-31 | `efd1632` | Navigation + song data refactor |
| 2026-09-05 | `d7da05f` | Modular ES-module architecture (`js/*`) |
| 2026-09-11 | `f941201` | Core CSS/JS architecture + assets |
| 2026-09-12 | `c665a64` | Queue system + playback modes |
| 2026-09-12 | `6fb29f8` | Shuffle/Repeat modes + UI (Stage A2.2) |
| 2026-09-12 | `666143b` | Global keyboard controls + shortcuts dialog (A2.3) |
| 2026-09-12 | `eb8f0bf` | Player UI playback-state feedback (A2.4) |
| 2026-09-12 | `88cd07e` | Home expansion: recently played, trending, top artists/genres (A2.5) |
| 2026-09-13 | `9d7b735` | Removed Liked/Recently-Played links from vanilla sidebar |
| 2026-09-13 | `2d95db4` | **Rename EchoVerse → TuneSphare + storage migration** |
| 2026-09-14 | `2f08d31` | Light/dark theme toggle |
| 2026-09-15 | `b953523` | **Vite + React project initialized**, music/cover images added |
| 2026-09-16 | `578a26d` | React layout components + styles |
| 2026-09-16 | `6e2ce07` | React song card/list components |
| 2026-09-16 | `b387ccc` | React player context + player components |
| 2026-09-16 | `87e074c` | React queue + playback-mode contexts |
| 2026-09-17 | `46dd2a9` | React like + recently-played contexts & UI |
| 2026-09-18 | `e8b16e9` | `generate-songs.js` manifest generator + JSON fetch |

### README phase history (vanilla era)
Phase 1 UI foundation → Phase 2 playback → Phase 3 library/search →
Phase 4 persistence → Phase 5 ES-module refactor → Stage A1 cleanup/a11y →
A2.1 queue → A2.2 shuffle/repeat → A2.3 keyboard → A2.4 player UX →
A2.5 home expansion. **React migration is the current, in-progress phase.**

---

## 10. Roadmap (from README — not yet done)

- **Stage A3** — User-created custom playlists.
- **Stage B** — Web Audio API equalizer/visualizer.
- **Stage C** — Backend/API integration & completing the React migration.

### Practical "next steps" implied by the current gaps
1. Wire the React search input (port `js/search/search.js`).
2. Port the theme toggle (React button is disabled; vanilla logic is ready).
3. Port keyboard shortcuts + help dialog (React button is disabled).
4. Persist queue, shuffle, and repeat in React (vanilla already defines keys).
5. Port Trending / Top Artists / Top Genres sections to the React Home page.
6. Restore rich song metadata (artists/albums/genres/popularity) — current
   generated manifest says "Unknown" for everything and `popularity: 0`.
7. Decide the fate of root `music/` vs `public/music/`, and of the legacy
   `js/`, `css/`, `src/data/songs.js`, `PlayerPlaceholder.jsx` dead code.
8. Add ESLint + tests (none exist today).

---

## 11. Assumptions & Quirks to Be Aware Of

- **README is partially outdated**: it claims the vanilla implementation
  "remains in `index.html`", but `index.html` now only mounts the React app.
  The vanilla `js/`/`css/` files are orphaned (never loaded).
- The React app is **single-page**: sidebar nav uses `#hash` anchors
  (`#library` has no matching section yet — Home renders `#home`,
  `#liked-songs`, `#recently-played`).
- `SongCard.jsx`, `PlayerPlaceholder.jsx`, `src/data/songs.js`,
  `src/utils/playbackUtils.js` are currently unused by the running app.
- Because the generated manifest has `popularity: 0` and "Unknown" metadata,
  any popularity/genre/artist features will show placeholder values until the
  manifest (or the generator) gets richer metadata.
- No environment variables, no API keys, no backend — everything is local.

