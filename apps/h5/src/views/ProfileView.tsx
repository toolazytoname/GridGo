import { useState } from 'react'
import { useOkrStore } from '../store/okrs'
import { useTasksStore } from '../store/tasks'
import { useUIStore } from '../store/ui'
import type { OkrCategory } from '@gridgo/types'

type SubTab = 'data' | 'badge' | 'review' | 'share'

const SUBS: { key: SubTab; label: string }[] = [
  { key: 'data', label: '数据' },
  { key: 'badge', label: '勋章' },
  { key: 'review', label: '复盘' },
  { key: 'share', label: '分享' },
]

const CAT_LABELS: Record<OkrCategory, string> = {
  product: 'P', health: 'H', skill: 'S', finance: '$',
}

export function ProfileView() {
  const [sub, setSub] = useState<SubTab>('data')
  const okrs = useOkrStore((s) => s.okrs)
  const tasks = useTasksStore((s) => s.tasks)
  const openShare = useUIStore((s) => s.openShare)
  const openOkrMgr = useUIStore((s) => s.openOkrMgr)

  const doneCount = tasks.filter((t) => t.done).length
  const doingOkrCount = okrs.filter((o) => o.progress < 1).length
  const focusMin = tasks.reduce((s, t) => s + (t.estimate_min ?? 0), 0)
  const focusH = (focusMin / 60).toFixed(0)
  const okrCompleted = okrs.filter((o) => o.progress >= 1).length
  const targetOkr = okrs.length
  const streak = 12

  return (
    <div className="gg-view">
      {/* 子 Tab */}
      <div className="gg-subtabs gg-subtabs-underline" role="tablist">
        {SUBS.map((k) => (
          <button
            key={k.key}
            type="button"
            role="tab"
            aria-selected={sub === k.key}
            className={`gg-subtab-underline ${sub === k.key ? 'gg-subtab-underline-active' : ''}`}
            onClick={() => setSub(k.key)}
          >
            {k.label}
          </button>
        ))}
      </div>

      {sub === 'data' && (
        <>
          {/* 大数字 12 + 14 连胜格 */}
          <div className="gg-ach-hero">
            <div className="gg-ach-big-num">{streak}</div>
            <div className="gg-ach-big-label">天连续完成任务</div>
            <div className="gg-ach-streak">
              {Array.from({ length: 14 }, (_, i) => {
                const isToday = i === 10
                const isPast = i < 10
                return (
                  <div
                    key={i}
                    className={`gg-ach-streak-box ${isPast ? 'gg-ach-streak-done' : ''} ${isToday ? 'gg-ach-streak-today' : ''}`}
                  />
                )
              })}
            </div>
          </div>

          {/* 4 卡片 2x2 */}
          <div className="gg-ach-cards">
            <div className="gg-ach-card">
              <div className="gg-ach-card-icon">
                <span>🎯</span>
              </div>
              <div className="gg-ach-card-num">{doneCount}</div>
              <div className="gg-ach-card-label">完成任务</div>
            </div>
            <div className="gg-ach-card">
              <div className="gg-ach-card-icon">
                <span>📚</span>
              </div>
              <div className="gg-ach-card-num">{doingOkrCount}</div>
              <div className="gg-ach-card-label">OKR 进行中</div>
            </div>
            <div className="gg-ach-card">
              <div className="gg-ach-card-icon">
                <span>⏱</span>
              </div>
              <div className="gg-ach-card-num">{focusH}h</div>
              <div className="gg-ach-card-label">专注时间</div>
            </div>
            <div className="gg-ach-card">
              <div className="gg-ach-card-icon">
                <span>🏆</span>
              </div>
              <div className="gg-ach-card-num">{okrCompleted}</div>
              <div className="gg-ach-card-label">目标完成</div>
            </div>
          </div>

          {/* OKR 进度条 */}
          {okrs.length > 0 && (
            <div className="gg-ach-okr">
              {okrs.slice(0, 1).map((o) => {
                const pct = Math.round(o.progress * 100)
                return (
                  <div key={o.id} className="gg-ach-okr-row">
                    <span className={`gg-okr-dot ${'o1'}`} style={{ flexShrink: 0 }} />
                    <span className="gg-ach-okr-name">{o.title}</span>
                    <span className="gg-ach-okr-pct">{pct}%</span>
                  </div>
                )
              })}
            </div>
          )}

          {/* 快捷入口 */}
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
                <div className="gg-me-quick-sub">{doingOkrCount} 项进行中 · 点击管理</div>
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
        </>
      )}

      {sub === 'badge' && (
        <div className="gg-placeholder" style={{ minHeight: 320 }}>
          <div className="gg-placeholder-title">勋章</div>
          <div className="gg-placeholder-sub">下一个 milestone：完成 15 天连胜 → 解锁「专注者」勋章</div>
        </div>
      )}
      {sub === 'review' && (
        <div className="gg-placeholder" style={{ minHeight: 320 }}>
          <div className="gg-placeholder-title">复盘</div>
          <div className="gg-placeholder-sub">周复盘 / 月复盘 待实现</div>
        </div>
      )}
      {sub === 'share' && (
        <div className="gg-placeholder" style={{ minHeight: 320 }}>
          <div className="gg-placeholder-title">分享</div>
          <div className="gg-placeholder-sub">点右下角分享按钮生成只读链接</div>
        </div>
      )}

      <div className="gg-me-footer">格行 GridGo · v0.1.0 · 一格一事，循格而行</div>
    </div>
  )
}

// unused but referenced by other code
void CAT_LABELS
