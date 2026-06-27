export function Logo({ size = 26 }: { size?: number }) {
  // 设计稿的 G 字标：single stroke 路径，匹配 UI/app.html line 873
  return (
    <svg className="gg-topbar-mark" viewBox="0 0 200 200" width={size} height={size} aria-hidden="true">
      <path
        d="M 100 100 L 169 100 L 169 140 A 80 80 0 1 1 169 60"
        fill="none"
        stroke="currentColor"
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
