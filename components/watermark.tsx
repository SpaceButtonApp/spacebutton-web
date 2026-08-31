const SIZES = {
  sm: 'w-6',
  md: 'w-9',
  lg: 'w-14',
} as const

/**
 * SpaceButton logo watermark overlaid on property media (photos + videos).
 * Defaults to the bottom-right corner; pass `position` to avoid other
 * badges already occupying that corner in a given layout.
 */
export function Watermark({
  size = 'md',
  position = 'bottom-2 right-2',
}: {
  size?: keyof typeof SIZES
  position?: string
}) {
  return (
    <img
      src="/logo.png"
      alt=""
      aria-hidden="true"
      draggable={false}
      className={`absolute ${position} ${SIZES[size]} h-auto opacity-70 pointer-events-none select-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)] z-[1]`}
    />
  )
}
