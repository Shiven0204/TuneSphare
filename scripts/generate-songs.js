import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SUPPORTED_AUDIO_EXTENSIONS = new Set([
  ".mp3",
  ".wav",
  ".ogg",
  ".m4a",
  ".aac",
]);
const COVER_EXTENSIONS = [".webp", ".jpg", ".jpeg", ".png"];
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const musicDirectory = path.join(projectRoot, "public", "music");
const coversDirectory = path.join(projectRoot, "public", "images", "covers");
const manifestDirectory = path.join(projectRoot, "public", "data");
const manifestPath = path.join(manifestDirectory, "songs.json");

function normalizeId(value) {
  return (
    value
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "song"
  );
}

function getTitleStem(filename) {
  const basename = path.basename(filename, path.extname(filename));
  const withoutQuality = basename.replace(/\s*\(\s*\d+\s*kbps\s*\)\s*$/i, "");
  const segments = withoutQuality.split(/\s+-\s+/).filter(Boolean);
  const titleSegment = segments.at(-1) || withoutQuality;
  return titleSegment.replace(/\s*\(\s*from\b.*$/i, "").trim();
}

function createTitle(filename) {
  return (
    getTitleStem(filename)
      .replace(/[-_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (character) => character.toUpperCase()) ||
    "Untitled Song"
  );
}

function encodePublicUrl(directory, filename) {
  const encodedFilename = encodeURIComponent(filename)
    .replace(/%26/g, "&")
    .replace(/%2C/g, ",")
    .replace(/%28/g, "(")
    .replace(/%29/g, ")");
  return `/${directory}/${encodedFilename}`;
}

async function findCover(songId, coverNames) {
  const matchingCover = coverNames
    .map((filename) => ({
      filename,
      id: normalizeId(path.basename(filename, path.extname(filename))),
    }))
    .find(
      ({ id }) => id === songId || id.includes(songId) || songId.includes(id)
    )?.filename;
  return matchingCover ? encodePublicUrl("images/covers", matchingCover) : null;
}

function createSongFromFile(filename, id, cover) {
  return {
    id,
    title: createTitle(filename),
    artist: "Unknown Artist",
    album: "Unknown Album",
    genre: "Unknown",
    popularity: 0,
    source: encodePublicUrl("music", filename),
    cover,
  };
}

async function generateManifest() {
  const entries = await fs.readdir(musicDirectory, { withFileTypes: true });
  const audioFiles = entries
    .filter((entry) => entry.isFile() && !entry.name.startsWith("."))
    .filter((entry) =>
      SUPPORTED_AUDIO_EXTENSIONS.has(path.extname(entry.name).toLowerCase())
    )
    .map((entry) => entry.name)
    .sort((first, second) =>
      first.localeCompare(second, undefined, { sensitivity: "base" })
    );
  const coverEntries = await fs
    .readdir(coversDirectory, { withFileTypes: true })
    .catch(() => []);
  const coverNames = coverEntries
    .filter(
      (entry) =>
        entry.isFile() &&
        COVER_EXTENSIONS.includes(path.extname(entry.name).toLowerCase())
    )
    .map((entry) => entry.name);
  const usedIds = new Set();
  const songs = audioFiles.map((filename) => {
    const baseId = normalizeId(getTitleStem(filename));
    let id = baseId;
    let suffix = 2;
    while (usedIds.has(id)) id = `${baseId}-${suffix++}`;
    usedIds.add(id);
    return { filename, id };
  });
  const manifest = await Promise.all(
    songs.map(async ({ filename, id }) =>
      createSongFromFile(filename, id, await findCover(id, coverNames))
    )
  );

  await fs.mkdir(manifestDirectory, { recursive: true });
  await fs.writeFile(
    manifestPath,
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8"
  );

  console.log("TuneSphare Song Manifest Generator\n");
  console.log(`Music directory: ${path.relative(projectRoot, musicDirectory)}`);
  console.log(`Songs found: ${manifest.length}\n`);
  manifest.forEach((song) => console.log(`✓ ${song.title}`));
  console.log(`\nGenerated:\n${path.relative(projectRoot, manifestPath)}`);
}

generateManifest().catch((error) => {
  console.error(`Unable to generate song manifest: ${error.message}`);
  process.exitCode = 1;
});
