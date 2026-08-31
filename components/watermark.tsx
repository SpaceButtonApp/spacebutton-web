const SIZES = {
  sm: { icon: 'w-4 h-auto', text: 'text-xs', gap: 'gap-1.5' },
  md: { icon: 'w-6 h-auto', text: 'text-base', gap: 'gap-2' },
  lg: { icon: 'w-9 h-auto', text: 'text-2xl', gap: 'gap-3' },
} as const

/**
 * SpaceButton logo + wordmark watermark over property media (photos + videos).
 * Centered by default; pass `position` to move it clear of other centered
 * overlays (e.g. video playback controls) in a given layout.
 */
export function Watermark({
  size = 'md',
  position = 'inset-0 flex items-center justify-center',
}: {
  size?: keyof typeof SIZES
  position?: string
}) {
  const s = SIZES[size]
  return (
    <div className={`absolute ${position} pointer-events-none select-none z-[1]`}>
      <div className={`flex items-center ${s.gap} opacity-60 drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]`}>
        <img src="/logo.png" alt="" aria-hidden="true" draggable={false} className={s.icon} />
        <span className={`${s.text} font-bold tracking-widest text-white uppercase`}>SpaceButton</span>
      </div>
    </div>
  )
}
