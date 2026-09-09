// Forces Cloudinary to respond with Content-Disposition: attachment, so a
// plain <a href> click triggers a real file download instead of navigating
// to/previewing the media — works for both images and videos, and avoids
// the CORS issues a client-side fetch()-to-blob approach would hit.

export function withDownloadFlag(url: string | undefined | null): string {
  if (!url) return url ?? ''
  const marker = '/upload/'
  const idx = url.indexOf(marker)
  if (!url.includes('res.cloudinary.com') || idx === -1) return url

  const insertAt = idx + marker.length
  return `${url.slice(0, insertAt)}fl_attachment/${url.slice(insertAt)}`
}
