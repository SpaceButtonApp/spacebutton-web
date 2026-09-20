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
    return "This browser can't save to a local folder — open the admin dashboard in Chrome or Edge."
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
async function saveUrlToFile(dirHandle: FileSystemDirectoryHandle, baseName: string, url: string): Promise<void> {
  let blob: Blob
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    blob = await res.blob()
  } catch (e) {
    const detail = e instanceof Error ? e.message : 'unknown error'
    throw new Error(`${baseName} could not be downloaded (${detail})`)
  }

  const ext = EXT_BY_MIME[blob.type.toLowerCase()] ?? extFromUrl(url, 'jpg')
  const fileHandle = await dirHandle.getFileHandle(`${baseName}.${ext}`, { create: true })
  const writable = await fileHandle.createWritable()
  await writable.write(blob)
  await writable.close()
}

export type SaveVerificationResult =
  | { ok: true; folderName: string }
  | { ok: false; reason: 'not-supported' | 'not-connected' | 'error'; message?: string }

/**
 * Saves both images into `<connected folder>/<sanitized user name>/`.
 * Call this once both the ID document and selfie are approved.
 */
export async function saveVerificationImagesLocally(
  userName: string,
  idImageUrl?: string,
  selfieImageUrl?: string,
): Promise<SaveVerificationResult> {
  if (!isLocalSaveSupported()) {
    return { ok: false, reason: 'not-supported', message: connectFailureMessage({ ok: false, reason: 'unsupported' }) }
  }

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

    return { ok: true, folderName }
  } catch (e) {
    return {
      ok: false,
      reason: 'error',
      message: e instanceof Error ? `Could not write to the folder (${e.name}: ${e.message})` : 'Could not write to the folder.',
    }
  }
}
