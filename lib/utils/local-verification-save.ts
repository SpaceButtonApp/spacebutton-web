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

/** Prompts the admin to pick the VERIFICATION folder once; persists the handle. */
export async function connectVerificationFolder(): Promise<boolean> {
  if (!isLocalSaveSupported()) return false
  try {
    // @ts-expect-error — File System Access API, not yet in lib.dom.d.ts
    const handle: FileSystemDirectoryHandle = await window.showDirectoryPicker({
      mode: 'readwrite',
      startIn: 'desktop',
    })
    await storeHandle(handle)
    return true
  } catch {
    return false // user cancelled the picker, or it's unsupported
  }
}

async function getGrantedHandle(): Promise<FileSystemDirectoryHandle | null> {
  const handle = await getStoredHandle()
  if (!handle) return null
  try {
    // @ts-expect-error — queryPermission isn't in the standard TS DOM lib yet
    const perm = await handle.queryPermission({ mode: 'readwrite' })
    if (perm === 'granted') return handle
    // @ts-expect-error — requestPermission isn't in the standard TS DOM lib yet
    const req = await handle.requestPermission({ mode: 'readwrite' })
    return req === 'granted' ? handle : null
  } catch {
    return null
  }
}

export async function isVerificationFolderConnected(): Promise<boolean> {
  return (await getGrantedHandle()) !== null
}

function sanitizeFolderName(name: string): string {
  const cleaned = name.trim().replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, ' ').slice(0, 100)
  return cleaned || 'Unknown User'
}

function extFromUrl(url: string, fallback: string): string {
  const match = url.split('?')[0].match(/\.([a-zA-Z0-9]+)$/)
  return match ? match[1] : fallback
}

async function saveUrlToFile(dirHandle: FileSystemDirectoryHandle, filename: string, url: string): Promise<void> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to download ${filename} (HTTP ${res.status})`)
  const blob = await res.blob()
  const fileHandle = await dirHandle.getFileHandle(filename, { create: true })
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
  if (!isLocalSaveSupported()) return { ok: false, reason: 'not-supported' }

  const rootHandle = await getGrantedHandle()
  if (!rootHandle) return { ok: false, reason: 'not-connected' }

  const folderName = sanitizeFolderName(userName)
  try {
    const userDir: FileSystemDirectoryHandle = await rootHandle.getDirectoryHandle(folderName, { create: true })

    const tasks: Promise<void>[] = []
    if (idImageUrl) tasks.push(saveUrlToFile(userDir, `id-document.${extFromUrl(idImageUrl, 'jpg')}`, idImageUrl))
    if (selfieImageUrl) tasks.push(saveUrlToFile(userDir, `selfie.${extFromUrl(selfieImageUrl, 'jpg')}`, selfieImageUrl))
    await Promise.all(tasks)

    return { ok: true, folderName }
  } catch (e) {
    return { ok: false, reason: 'error', message: e instanceof Error ? e.message : 'Unknown error' }
  }
}
