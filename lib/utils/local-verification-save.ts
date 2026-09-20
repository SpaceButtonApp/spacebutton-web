'use client'

// Saves approved verification images (ID document + selfie) directly to a
// local folder on the admin's machine, using the File System Access API.
// Chromium-only (Chrome/Edge) — there's no cross-browser equivalent that can
// write to an arbitrary local path without a user gesture each time.

const DB_NAME = 'sb-admin-local-save'
const STORE_NAME = 'handles'
const HANDLE_KEY = 'verification-folder'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function getStoredHandle(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const db = await openDb()
    return await new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const req = tx.objectStore(STORE_NAME).get(HANDLE_KEY)
      req.onsuccess = () => resolve((req.result as FileSystemDirectoryHandle) ?? null)
      req.onerror = () => resolve(null)
    })
  } catch {
    return null
  }
}

async function storeHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  try {
    const db = await openDb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).put(handle, HANDLE_KEY)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } catch {
    /* ignore — permission just won't persist across reloads */
  }
}

export function isLocalSaveSupported(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window
}

export type ConnectResult =
  | { ok: true }
  | { ok: false; reason: 'unsupported' | 'cancelled' | 'error'; message?: string }

/**
 * Connects the VERIFICATION folder. Must be called straight from a click
 * handler — both the folder picker and re-granting permission on a
 * previously chosen folder require a fresh user gesture.
 */
export async function connectVerificationFolder(): Promise<ConnectResult> {
  if (!isLocalSaveSupported()) return { ok: false, reason: 'unsupported' }

  // A folder chosen in an earlier session usually just needs its permission
  // re-granted (one click) rather than being picked all over again.
  const stored = await getStoredHandle()
  if (stored) {
    try {
      // @ts-expect-error — requestPermission isn't in the standard TS DOM lib yet
      const perm = await stored.requestPermission({ mode: 'readwrite' })
      if (perm === 'granted') return { ok: true }
    } catch {
      /* folder was moved/deleted or access was blocked — fall through and pick again */
    }
  }

  try {
    // @ts-expect-error — File System Access API, not yet in lib.dom.d.ts
    const handle: FileSystemDirectoryHandle = await window.showDirectoryPicker({
      mode: 'readwrite',
      startIn: 'desktop',
    })
    await storeHandle(handle)
    return { ok: true }
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') return { ok: false, reason: 'cancelled' }
    if (e instanceof DOMException && e.name === 'SecurityError') {
      return {
        ok: false,
        reason: 'error',
        message: 'The browser needs a fresh click to open the folder picker — click "Connect local VERIFICATION folder", then approve again.',
      }
    }
    return {
      ok: false,
      reason: 'error',
      message: e instanceof Error ? `Could not connect the folder (${e.name}: ${e.message})` : 'Could not connect the folder.',
    }
  }
}

export function connectFailureMessage(result: Extract<ConnectResult, { ok: false }>): string {
  if (result.reason === 'unsupported') {
    return "This browser can't connect a folder — the images download to your Downloads folder instead."
  }
  if (result.reason === 'cancelled') {
    return 'Folder not connected — click "Connect local VERIFICATION folder" and approve again.'
  }
  return result.message ?? 'Could not connect the folder.'
}

async function getGrantedHandle(requestIfNeeded: boolean): Promise<FileSystemDirectoryHandle | null> {
  const handle = await getStoredHandle()
  if (!handle) return null
  try {
    // @ts-expect-error — queryPermission isn't in the standard TS DOM lib yet
    const perm = await handle.queryPermission({ mode: 'readwrite' })
    if (perm === 'granted') return handle
    // requestPermission needs a user gesture, so it can only be attempted from
    // a click — never from a passive check like the on-mount one below.
    if (!requestIfNeeded) return null
    // @ts-expect-error — requestPermission isn't in the standard TS DOM lib yet
    const req = await handle.requestPermission({ mode: 'readwrite' })
    return req === 'granted' ? handle : null
  } catch {
    return null
  }
}

export async function isVerificationFolderConnected(): Promise<boolean> {
  return (await getGrantedHandle(false)) !== null
}

function sanitizeFolderName(name: string): string {
  const cleaned = name.trim().replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, ' ').slice(0, 100)
  return cleaned || 'Unknown User'
}

function extFromUrl(url: string, fallback: string): string {
  const match = url.split('?')[0].match(/\.([a-zA-Z0-9]+)$/)
  return match ? match[1] : fallback
}

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/heic': 'heic',
  'image/heif': 'heif',
}

// Verification images are private Cloudinary assets served via signed URLs
// that carry no file extension, so the extension has to come from the
// downloaded file's actual type rather than the URL.
async function fetchImage(baseName: string, url: string): Promise<{ blob: Blob; ext: string }> {
  let blob: Blob
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    blob = await res.blob()
  } catch (e) {
    const detail = e instanceof Error ? e.message : 'unknown error'
    throw new Error(`${baseName} could not be downloaded (${detail})`)
  }
  return { blob, ext: EXT_BY_MIME[blob.type.toLowerCase()] ?? extFromUrl(url, 'jpg') }
}

async function saveUrlToFile(dirHandle: FileSystemDirectoryHandle, baseName: string, url: string): Promise<void> {
  const { blob, ext } = await fetchImage(baseName, url)
  const fileHandle = await dirHandle.getFileHandle(`${baseName}.${ext}`, { create: true })
  const writable = await fileHandle.createWritable()
  await writable.write(blob)
  await writable.close()
}

export type SaveVerificationResult =
  | { ok: true; method: 'folder'; folderName: string }
  | { ok: true; method: 'download'; fileNames: string[] }
  | { ok: false; reason: 'not-connected' | 'error'; message?: string }

function triggerDownload(blob: Blob, fileName: string): void {
  const objectUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = objectUrl
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Give the browser time to start reading the blob before releasing it.
  setTimeout(() => URL.revokeObjectURL(objectUrl), 30_000)
}

/**
 * Fallback for browsers without the File System Access API (Firefox, Safari):
 * they can't write into a folder the admin picks, so the images are downloaded
 * to the browser's normal download location instead, with the user's name in
 * each filename so the pair stays together and easy to file away.
 */
async function downloadVerificationImages(
  userName: string,
  idImageUrl?: string,
  selfieImageUrl?: string,
): Promise<SaveVerificationResult> {
  const base = sanitizeFolderName(userName)
  const items: { baseName: string; url: string }[] = []
  if (idImageUrl) items.push({ baseName: 'id-document', url: idImageUrl })
  if (selfieImageUrl) items.push({ baseName: 'selfie', url: selfieImageUrl })

  const fileNames: string[] = []
  const failures: string[] = []
  for (const item of items) {
    try {
      const { blob, ext } = await fetchImage(item.baseName, item.url)
      const fileName = `${base} - ${item.baseName}.${ext}`
      triggerDownload(blob, fileName)
      fileNames.push(fileName)
      // Browsers can drop back-to-back downloads fired in the same tick.
      await new Promise((resolve) => setTimeout(resolve, 400))
    } catch (e) {
      failures.push(e instanceof Error ? e.message : 'unknown error')
    }
  }

  if (failures.length > 0) {
    return { ok: false, reason: 'error', message: `Some images did not download: ${failures.join('; ')}` }
  }
  return { ok: true, method: 'download', fileNames }
}

/**
 * Saves both images locally. With the File System Access API (Chrome/Edge)
 * they go into `<connected folder>/<sanitized user name>/`; otherwise
 * (Firefox/Safari) they are downloaded. Call once both the ID document and
 * selfie are approved.
 */
export async function saveVerificationImagesLocally(
  userName: string,
  idImageUrl?: string,
  selfieImageUrl?: string,
): Promise<SaveVerificationResult> {
  if (!isLocalSaveSupported()) return downloadVerificationImages(userName, idImageUrl, selfieImageUrl)

  // Query-only: asking for permission needs a fresh click, which this (often
  // post-network-request) call can't rely on. The caller's "Connect" / "Save
  // images now" buttons are what re-grant access.
  const rootHandle = await getGrantedHandle(false)
  if (!rootHandle) {
    return {
      ok: false,
      reason: 'not-connected',
      message: 'Folder access has lapsed — click "Connect local VERIFICATION folder", then "Save images now".',
    }
  }

  const folderName = sanitizeFolderName(userName)
  try {
    const userDir: FileSystemDirectoryHandle = await rootHandle.getDirectoryHandle(folderName, { create: true })

    const tasks: Promise<void>[] = []
    if (idImageUrl) tasks.push(saveUrlToFile(userDir, 'id-document', idImageUrl))
    if (selfieImageUrl) tasks.push(saveUrlToFile(userDir, 'selfie', selfieImageUrl))
    // allSettled so one failing image can't hide that the other one saved
    const results = await Promise.allSettled(tasks)
    const failures = results
      .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
      .map((r) => (r.reason instanceof Error ? r.reason.message : 'unknown error'))
    if (failures.length > 0) {
      return { ok: false, reason: 'error', message: `Some images did not save: ${failures.join('; ')}` }
    }

    return { ok: true, method: 'folder', folderName }
  } catch (e) {
    return {
      ok: false,
      reason: 'error',
      message: e instanceof Error ? `Could not write to the folder (${e.name}: ${e.message})` : 'Could not write to the folder.',
    }
  }
}
