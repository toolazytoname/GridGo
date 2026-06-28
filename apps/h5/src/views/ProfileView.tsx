import { useEffect, useState } from 'react'
import { useUIStore } from '../store/ui'
import { useTasksStore } from '../store/tasks'
import { getCurrentUser, onAuthChange, signOut, type User } from '@gridgo/api'
import { useOkrStore } from '../store/okrs'

export function ProfileView() {
  const openOkrMgr = useUIStore((s) => s.openOkrMgr)
  const openAuth = useUIStore((s) => s.openAuth)
  const openShare = useUIStore((s) => s.openShare)
  const isAuthed = useTasksStore((s) => s.isAuthed)
  const okrs = useOkrStore((s) => s.okrs)
  const tasks = useTasksStore((s) => s.tasks)

  const [user, setUser] = useState<User | null>(null)
  useEffect(() => {
    getCurrentUser().then(setUser)
    const { data: sub } = onAuthChange(setUser)
    return () => sub.subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await signOut()
    setUser(null)
  }

  const initials = (
    user?.user_metadata?.display_name?.[0] ??
    user?.user_metadata?.preferred_username?.[0] ??
    user?.email?.[0]?.toUpperCase() ??
    '林'
  )

  const displayName = user?.user_metadata?.display_name ?? user?.email?.split('@')[0] ?? '林小白'
  const role = user?.user_metadata?.role ?? (isAuthed ? '已登录' : '游客')
  const provider = user?.app_metadata?.provider === 'github' ? 'GitHub OAuth' : 'Email'

  return (
    <div className="gg-view">
      {/* Profile 头 */}
      <div className="gg-me-profile">
        <div className="gg-me-avatar">{initials}</div>
        <div className="gg-me-id">
          <div className="gg-me-name-row">
            <span className="gg-me-name">{displayName}</span>
            {isAuthed && <span className="gg-me-badge" data-testid="pro-badge">PRO</span>}
          </div>
          <div className="gg-me-role">{role}</div>
          <div className="gg-me-bio">用一格一事的方式推进 OKR，把目标拆成可执行的格子。</div>
        </div>
        <button type="button" className="gg-me-edit" onClick={user ? () => alert('编辑资料 TODO') : openAuth}>
          {user ? '编辑资料' : '登录'}
        </button>
      </div>

      {/* 3 项统计 */}
      <div className="gg-me-stats">
        <div className="gg-me-stat">
          <div className="gg-me-stat-num">{tasks.filter((t) => t.done).length || 24}</div>
          <div className="gg-me-stat-label">已完成</div>
        </div>
        <div className="gg-me-stat-sep" />
        <div className="gg-me-stat">
          <div className="gg-me-stat-num">86h</div>
          <div className="gg-me-stat-label">专注时长</div>
        </div>
        <div className="gg-me-stat-sep" />
        <div className="gg-me-stat">
          <div className="gg-me-stat-num">12</div>
          <div className="gg-me-stat-label">连胜天数</div>
        </div>
      </div>

      {/* 2 快捷入口 */}
      <div className="gg-me-quick">
        <button type="button" className="gg-me-quick-card" onClick={openOkrMgr}>
          <div className="gg-me-quick-icon gg-me-quick-icon-okr">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="12" r="5" />
              <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <div className="gg-me-quick-text">
            <div className="gg-me-quick-title">我的 OKR</div>
            <div className="gg-me-quick-sub">{okrs.length} 项进行中 · 点击管理</div>
          </div>
          <svg className="gg-me-chevron" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 4l4 4-4 4" />
          </svg>
        </button>
        <button type="button" className="gg-me-quick-card" onClick={() => openShare('profile')}>
          <div className="gg-me-quick-icon gg-me-quick-icon-share">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7" />
              <path d="M16 6l-4-4-4 4" />
              <path d="M12 2v14" />
            </svg>
          </div>
          <div className="gg-me-quick-text">
            <div className="gg-me-quick-title">分享我的进度</div>
            <div className="gg-me-quick-sub">生成只读链接，发给伙伴</div>
          </div>
          <svg className="gg-me-chevron" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 4l4 4-4 4" />
          </svg>
        </button>
      </div>

      {/* 偏好 */}
      <div className="gg-me-section-title">偏好</div>
      <div className="gg-me-section">
        <div className="gg-me-row">
          <div className="gg-me-row-icon">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <div className="gg-me-row-text">
            <div className="gg-me-row-title">提醒时间</div>
            <div className="gg-me-row-sub">每日 09:00 · 每周一回顾</div>
          </div>
          <svg className="gg-me-chevron" viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 4l4 4-4 4" />
          </svg>
        </div>
        <div className="gg-me-row">
          <div className="gg-me-row-icon">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" />
            </svg>
          </div>
          <div className="gg-me-row-text">
            <div className="gg-me-row-title">主题外观</div>
            <div className="gg-me-row-sub">跟随系统 · 浅色</div>
          </div>
          <svg className="gg-me-chevron" viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 4l4 4-4 4" />
          </svg>
        </div>
        <div className="gg-me-row">
          <div className="gg-me-row-icon">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M6 8a6 6 0 1112 0c0 5 2 6 2 6H4s2-1 2-6z" />
              <path d="M10 19a2 2 0 004 0" />
            </svg>
          </div>
          <div className="gg-me-row-text">
            <div className="gg-me-row-title">通知提醒</div>
            <div className="gg-me-row-sub">截止前 24 小时推送</div>
          </div>
          <div className="gg-switch gg-switch-on" role="switch" aria-checked="true" />
        </div>
        <div className="gg-me-row">
          <div className="gg-me-row-icon">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M4 4h16v4H4zM4 10h10v4H4zM4 14h16v6H4z" />
            </svg>
          </div>
          <div className="gg-me-row-text">
            <div className="gg-me-row-title">数据导出</div>
            <div className="gg-me-row-sub">导出 JSON / CSV</div>
          </div>
          <svg className="gg-me-chevron" viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 4l4 4-4 4" />
          </svg>
        </div>
      </div>

      {/* 账号 */}
      <div className="gg-me-section-title">账号</div>
      <div className="gg-me-section">
        <div className="gg-me-row">
          <div className="gg-me-row-icon">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
            </svg>
          </div>
          <div className="gg-me-row-text">
            <div className="gg-me-row-title">{isAuthed ? '登录账号' : '未登录'}</div>
            <div className="gg-me-row-sub">
              {isAuthed ? `${provider} · ${user?.email ?? user?.phone ?? ''}` : '点击头像登录'}
            </div>
          </div>
          {isAuthed && (
            <svg className="gg-me-chevron" viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 4l4 4-4 4" />
            </svg>
          )}
        </div>
        {isAuthed && (
          <div className="gg-me-row gg-me-row-danger" onClick={handleSignOut}>
            <div className="gg-me-row-icon">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M16 17l5-5-5-5M21 12H9M12 21H5a2 2 0 01-2-2V5a2 2 0 012-2h7" />
              </svg>
            </div>
            <div className="gg-me-row-text">
              <div className="gg-me-row-title">退出登录</div>
            </div>
          </div>
        )}
      </div>

      <div className="gg-me-footer">格行 GridGo · v0.1.0 · 一格一事，循格而行</div>
    </div>
  )
}
