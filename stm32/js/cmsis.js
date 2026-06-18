import { getMicro } from "./micro.js";

const DB_NAME = "stm32-cmsis-cache";
const DB_VERSION = 2;
const STORE = "extracted";
const CORE_VERSION = "5.9.0";

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function readCachedFiles(key) {
  return openDb().then((db) => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  }));
}

function writeCachedFiles(key, files) {
  return openDb().then((db) => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(files, key);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  }));
}

function shouldExtract(spec, name) {
  return spec.mount === "cmsis_core"
    ? name.startsWith("CMSIS/Core/Include/")
    : name.startsWith("Include/") || name.startsWith("Source/Templates/");
}

async function fetchArchive(spec, log) {
  log(`Downloading ${spec.mount}`);
  const res = await fetch(spec.url);
  if (!res.ok) throw new Error(`Failed to fetch ${spec.url}: ${res.status}`);
  return res.arrayBuffer();
}

async function loadRepo(spec, log) {
  const cached = await readCachedFiles(spec.key);
  if (cached) {
    log(`Using cached extracted ${spec.mount}`);
    return cached;
  }

  const bytes = await fetchArchive(spec, log);
  log(`Extracting ${spec.mount}`);
  const zip = await JSZip.loadAsync(bytes);
  const files = {};
  let count = 0;
  let skipped = 0;

  for (const entry of Object.values(zip.files)) {
    if (entry.dir) continue;

    const name = entry.name.replace(/^[^/]+\//, "");
    if (!name || !shouldExtract(spec, name)) {
      skipped++;
      continue;
    }

    files[`${spec.mount}/${name}`] = await entry.async("text");
    count++;
    if (count % 100 === 0) log(`Extracted ${count} files from ${spec.mount}`);
  }

  await writeCachedFiles(spec.key, files);
  log(`Cached ${count} extracted files for ${spec.mount} (${skipped} skipped)`);
  return files;
}

function repoSpecs(micro, board) {
  const m = getMicro(micro, board);
  if (!m) throw new Error(`Unsupported MCU: ${micro || "(none)"}`);

  return [
    {
      key: `ARM-software/CMSIS_5@${CORE_VERSION}`,
      mount: "cmsis_core",
      url: `cmsis/CMSIS_5-${CORE_VERSION}.zip`,
    },
    {
      key: `STMicroelectronics/cmsis_device_${m.series}@${m.cmsis_repo_version}`,
      mount: `cmsis_${m.series}`,
      url: `cmsis/cmsis_device_${m.series}-${m.cmsis_repo_version}.zip`,
    },
  ];
}

export async function mountCmsis(micro, board, { log = () => {} } = {}) {
  const mounted = {};
  for (const spec of repoSpecs(micro, board)) {
    const files = await loadRepo(spec, log);
    Object.assign(mounted, files);
    log(`Mounted ${Object.keys(files).length} files under ${spec.mount}/`);
  }
  return mounted;
}
