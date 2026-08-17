'use client'

import { useEffect, useState } from 'react'
import { Smartphone, X } from 'lucide-react'

const APP_STORE_URL = 'https://apps.apple.com/ng/app/spacebutton/id6767217574'
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.spacebutton.app&pcampaignid=web_share'
const DISMISS_KEY = 'sb-app-download-banner-dismissed'

export function AppDownloadBanner() {
  const [storeLink, setStoreLink] = useState(PLAY_STORE_URL)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY) === '1') return
    setVisible(true)
    const ua = window.navigator.userAgent
    if (/iPad|iPhone|iPod/.test(ua)) {
      setStoreLink(APP_STORE_URL)
    } else if (/android/i.test(ua)) {
      setStoreLink(PLAY_STORE_URL)
    }
  }, [])

  function dismiss() {
    setVisible(false)
    localStorage.setItem(DISMISS_KEY, '1')
  }

  if (!visible) return null

  return (
    <div className="flex items-center justify-between gap-3 bg-primary/10 border border-primary/20 rounded-2xl px-4 py-3 mb-5">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
          <Smartphone className="w-4 h-4 text-primary" />
        </div>
        <p className="text-sm text-foreground truncate">
          Get the app for a faster, easier experience.
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <a
          href={storeLink}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-2 bg-primary text-primary-foreground rounded-full text-xs font-semibold whitespace-nowrap"
        >
          Download
        </a>
        <button onClick={dismiss} aria-label="Dismiss" className="p-1.5 rounded-full hover:bg-primary/10 text-muted-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
