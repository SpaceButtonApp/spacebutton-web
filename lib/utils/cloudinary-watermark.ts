// Bakes the SpaceButton logo directly into the delivered image/video file via
// a Cloudinary URL transformation, so the watermark survives a direct
// "Save image"/"Save video" — a CSS overlay never does, since the browser
// downloads whatever the src URL actually points to.

const WATERMARK_LOGO_URL = 'https://spacebutton.net/logo.png'

function base64UrlEncode(input: string): string {
  const base64 =
    typeof window !== 'undefined'
      ? btoa(input)
      : Buffer.from(input, 'utf-8').toString('base64')
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * Inserts a remote-fetched logo overlay into a Cloudinary delivery URL.
 * Non-Cloudinary URLs (fallback/placeholder images) pass through unchanged.
 */
export function withCloudinaryWatermark(url: string | undefined | null): string {
  if (!url) return url ?? ''
  const marker = '/upload/'
  const idx = url.indexOf(marker)
  if (!url.includes('res.cloudinary.com') || idx === -1) return url

  const insertAt = idx + marker.length
  const encodedLogo = base64UrlEncode(WATERMARK_LOGO_URL)
  const transformation = `l_fetch:${encodedLogo},g_center,w_0.4,fl_relative,o_55/fl_layer_apply`
  return `${url.slice(0, insertAt)}${transformation}/${url.slice(insertAt)}`
}
