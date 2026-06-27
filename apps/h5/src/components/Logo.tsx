export function Logo({ size = 26 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" className="gg-logo">
      <rect x="2" y="2" width="9" height="9" rx="2" fill="currentColor" opacity="0.85" />
      <rect x="13" y="2" width="9" height="9" rx="2" fill="currentColor" opacity="0.45" />
      <rect x="2" y="13" width="9" height="9" rx="2" fill="currentColor" opacity="0.45" />
      <rect x="13" y="13" width="9" height="9" rx="2" fill="currentColor" />
    </svg>
  )
}
