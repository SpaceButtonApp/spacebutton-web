// Bakes the SpaceButton logo directly into the delivered image/video file via
// a Cloudinary overlay transformation, so the watermark survives a direct
// "Save image"/"Save video" or the in-app download button — a CSS overlay
// never would, since the browser/download just gets whatever the src URL
// actually points to.
//
// This references a logo asset already uploaded into the Cloudinary account
// (public_id "spacebutton/watermark_logo", provisioned by listing_service on
// startup — see cloudinary_service.py::upload_watermark_logo). Uses a plain
// `l_<public_id>` overlay, NOT `l_fetch:` — this account has the `fetch`
// delivery type disabled ("Images of type fetch are restricted in this
// account"), which is what broke every listing photo/video the first time
// this was attempted.

const WATERMARK_PUBLIC_ID = 'spacebutton:watermark_logo' // '/' -> ':' for overlay layer syntax

function insertTransformation(url: string, transformation: string): string {
  const marker = '/upload/'
  const idx = url.indexOf(marker)
  if (!url.includes('res.cloudinary.com') || idx === -1) return url

  const insertAt = idx + marker.length
  return `${url.slice(0, insertAt)}${transformation}/${url.slice(insertAt)}`
}

/**
 * Bakes the SpaceButton logo into a Cloudinary delivery URL, centered and
 * scaled to the media's width. Non-Cloudinary URLs (fallback/placeholder
 * images) pass through unchanged.
 */
export function withCloudinaryWatermark(url: string | undefined | null): string {
  if (!url) return url ?? ''
  return insertTransformation(url, `l_${WATERMARK_PUBLIC_ID},g_center,w_0.4,fl_relative,o_65/fl_layer_apply`)
}

/**
 * Forces Cloudinary to respond with Content-Disposition: attachment, so a
 * plain <a href> click triggers a real file download instead of navigating
 * to/previewing the media.
 */
export function withDownloadFlag(url: string | undefined | null): string {
  if (!url) return url ?? ''
  return insertTransformation(url, 'fl_attachment')
}
