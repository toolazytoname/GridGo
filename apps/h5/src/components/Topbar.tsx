import { useUIStore } from '../store/ui'
import { Logo } from './Logo'
import { useTasksStore } from '../store/tasks'
import { getCurrentUser, onAuthChange, type User } from '@gridgo/api'
import { useEffect, useState } from 'react'

export function Topbar() {
  const openOkrMgr = useUIStore((s) => s.openOkrMgr)
  const openAuth = useUIStore((s) => s.openAuth)
  const isAuthed = useTasksStore((s) => s.isAuthed)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    getCurrentUser().then(setUser)
    const { data: sub } = onAuthChange(setUser)
    return () => sub.subscription.unsubscribe()
  }, [])

  const avatarLetter =
    user?.user_metadata?.display_name?.[0] ??
    user?.user_metadata?.preferred_username?.[0] ??
    user?.email?.[0]?.toUpperCase() ??
    '?'

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
        <svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className="gg-topbar-spacer" />

      <button type="button" className="gg-topbar-btn" onClick={() => alert('搜索 TODO')} title="搜索" aria-label="搜索">
        <svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="7" cy="7" r="5" />
          <path d="M14 14l-3.5-3.5" strokeLinecap="round" />
        </svg>
      </button>
      <button type="button" className="gg-topbar-btn" onClick={() => alert('通知 TODO')} title="通知" aria-label="通知">
        <svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M8 2a4 4 0 0 0-4 4v3l-1.5 2.5h11L12 9V6a4 4 0 0 0-4-4z" />
          <path d="M6.5 13a1.5 1.5 0 0 0 3 0" />
        </svg>
      </button>
      <button type="button" className="gg-topbar-share" onClick={() => alert('分享 TODO')} title="分享当前内容" aria-label="分享">
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      </button>

      {isAuthed ? (
        <div className="gg-topbar-avatar" title={user?.email ?? '账号'} onClick={openAuth} role="button" tabIndex={0}>
          {avatarLetter}
        </div>
      ) : (
        <button type="button" className="gg-login-cta" onClick={openAuth}>
          登录 / 注册
        </button>
      )}
    </header>
  )
}
