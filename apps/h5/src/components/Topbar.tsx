import { useUIStore } from '../store/ui'
import { Logo } from './Logo'

export function Topbar() {
  const openOkrMgr = useUIStore((s) => s.openOkrMgr)

  return (
    <header className="gg-topbar">
      <a className="gg-topbar-logo" href="#/" aria-label="格行 GridGo">
        <Logo size={26} />
        <span className="gg-topbar-wordmark">
          <b>格行</b>
          <i>·</i>
          <em>GridGo</em>
        </span>
      </a>

      <button type="button" className="gg-okr-selector" onClick={openOkrMgr} title="管理 OKR">
        <span>我的 OKR</span>
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
          <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      <div className="gg-topbar-spacer" />

      <button type="button" className="gg-topbar-btn" title="搜索" aria-label="搜索">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="11" cy="11" r="7" />
          <path d="M16 16l4 4" strokeLinecap="round" />
        </svg>
      </button>
      <button type="button" className="gg-topbar-btn" title="通知" aria-label="通知">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6 8a6 6 0 1112 0c0 5 2 6 2 6H4s2-1 2-6z" />
          <path d="M10 19a2 2 0 004 0" />
        </svg>
      </button>
      <button type="button" className="gg-topbar-btn" title="分享" aria-label="分享">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7" />
          <path d="M16 6l-4-4-4 4" />
          <path d="M12 2v14" />
        </svg>
      </button>
      <button type="button" className="gg-topbar-avatar" title="林小白" aria-label="账号">林</button>
    </header>
  )
}
