interface VerifiedBadgeProps {
  size?: number
  className?: string
}

export function VerifiedBadge({ size = 20, className }: VerifiedBadgeProps) {
  // 16-point starburst: alternating outer (r=10) and inner (r=6.5) points
  // center (12,12), start at top
  const cx = 12, cy = 12, ro = 10, ri = 6.5, n = 16
  const pts = Array.from({ length: n }, (_, i) => {
    const angle = (i * Math.PI * 2) / n - Math.PI / 2
    const r = i % 2 === 0 ? ro : ri
    return `${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`
  }).join(' ')

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-label="Verified"
    >
      <polygon points={pts} fill="#1D9BF0" />
      <path
        d="M8 12.5L10.5 15L16 9"
        stroke="#000000"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
