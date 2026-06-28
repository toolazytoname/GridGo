import { useMemo } from 'react'
import { useUIStore, type MatrixSubTab } from '../store/ui'
import { useTasksStore } from '../store/tasks'
import type { Quadrant, Task } from '@gridgo/types'

const QUADRANTS: { key: Quadrant; label: string }[] = [
  { key: 'q1', label: '紧急 × 重要' },
  { key: 'q2', label: '重要 × 不紧急' },
  { key: 'q3', label: '紧急 × 不重要' },
  { key: 'q4', label: '都不紧急 / 不重要' },
]

function isToday(iso: string | null) {
  if (!iso) return false
  return iso === new Date().toISOString().slice(0, 10)
}
function isThisWeek(iso: string | null) {
  if (!iso) return false
  const d = new Date(iso)
  const now = new Date()
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  start.setDate(now.getDate() - now.getDay())
  const end = new Date(start)
  end.setDate(start.getDate() + 7)
  return d >= start && d < end
}
function formatDate(d: Date) {
  const m = d.getMonth() + 1
  const day = d.getDate()
  const wk = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]
  return `${m} 月 ${day} 日 · 周${wk}`
}

function formatDateShort(iso: string): string {
  const today = new Date()
  const d = new Date(iso)
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000)
  if (diff === 0) return '今天'
  if (diff === 1) return '明天'
  if (diff === -1) return '昨天'
  if (diff > 1 && diff < 7) return `${diff} 天后`
  if (diff < 0 && diff > -7) return `${-diff} 天前`
  if (d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()) return `${d.getDate()} 日`
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function formatMeta(task: Task): string {
  const today = new Date().toISOString().slice(0, 10)
  const datePart = task.due_date
    ? task.due_date === today ? '今天截止' : formatDateShort(task.due_date)
    : null
  const timePart = task.estimate_min ? `${task.estimate_min} 分钟` : null
  if (datePart && timePart) return `${datePart} · ${timePart}`
  if (datePart) return datePart
  if (timePart) return timePart
  return ''
}

export function MatrixView() {
  const sub = useUIStore((s) => s.matrixSub)
  const setSub = useUIStore((s) => s.setMatrixSub)
  const openTaskModal = useUIStore((s) => s.openTaskModal)
  const tasks = useTasksStore((s) => s.tasks)
  const okrs = useTasksStore((s) => s.okrs)

  const filtered = useMemo(() => {
    if (sub === 'today') return tasks.filter((t) => isToday(t.due_date))
    if (sub === 'week') return tasks.filter((t) => isThisWeek(t.due_date))
    return tasks
  }, [tasks, sub])

  const grouped: Record<Quadrant, Task[]> = { q1: [], q2: [], q3: [], q4: [] }
  for (const t of filtered) {
    if (t.quadrant) grouped[t.quadrant].push(t)
  }

  const totalCount = filtered.length
  const doingCount = filtered.filter((t) => !t.done).length

  // 空态：没有任何任务
  if (tasks.length === 0) {
    return (
      <div className="gg-view">
        <div className="gg-empty-state">
          <div className="gg-empty-state-icon">📋</div>
          <div className="gg-empty-state-title">还没有任务</div>
          <div className="gg-empty-state-sub">添加你的第一个任务，按紧急和重要程度分到 4 个象限</div>
          <button type="button" className="gg-btn gg-btn-primary" onClick={openTaskModal}>
            + 添加第一个任务
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="gg-view">
      <div className="gg-subtabs" role="tablist" aria-label="四象限视图">
        {(['all', 'today', 'week'] as MatrixSubTab[]).map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={sub === k}
            className={`gg-subtab ${sub === k ? 'gg-subtab-active' : ''}`}
            onClick={() => setSub(k)}
          >
            {k === 'all' ? '全部' : k === 'today' ? '今日' : '本周'}
          </button>
        ))}
      </div>

      <div className="gg-matrix-header">
        <h2>
          四象限 <span className="gg-matrix-header-date">· {formatDate(new Date())}</span>
        </h2>
        <div className="gg-matrix-header-summary">
          <b>{totalCount}</b> 项待办 · <b>{doingCount}</b> 项进行中
        </div>
      </div>

      {sub === 'week' && (
        <div className="gg-matrix-focus-card">
          <div className="gg-matrix-focus-head">
            <svg className="gg-matrix-focus-icon" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="8" r="6" />
              <circle cx="8" cy="8" r="2.5" fill="currentColor" stroke="none" />
            </svg>
            <span>本周聚焦</span>
          </div>
          <div className="gg-matrix-focus-body">
            聚焦 <b>产品增长 OKR</b> 的核心功能重构与 A/B 测试上线。建议每日 14:00 - 18:00 深度工作块专注于此。健康维度保持 3 次跑步（已达成 2/3）。
          </div>
        </div>
      )}

      <div className="gg-eisenhower-grid">
        {QUADRANTS.map((q) => {
          const items = grouped[q.key]
          return (
            <div key={q.key} className={`gg-eq-cell ${q.key}`}>
              <div className="gg-eq-header">
                <span className="gg-eq-label">{q.label}</span>
                <span className="gg-eq-count">{items.length}</span>
              </div>
              <div className="gg-eq-tasks">
                {items.map((t) => {
                  const okr = okrs.find((o) => o.id === t.okr_id)
                  const meta = formatMeta(t)
                  return (
                    <div key={t.id} className="gg-eq-task" onClick={() => useUIStore.getState().openTaskModal('view', t.id)}>
                      <div className={`gg-eq-check ${t.done ? 'gg-eq-check-on' : ''}`}>
                        {t.done && (
                          <svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 8l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <div className="gg-eq-task-body">
                        <div className={`gg-eq-task-title ${t.done ? 'done' : ''}`}>{t.title}</div>
                        {(okr || meta) && (
                          <div className="gg-eq-task-meta">
                            {okr && (
                              <span className={`gg-okr-dot-lg gg-okr-dot-${okr.category}`}>
                                {okr.category === 'product' ? 'P' : okr.category === 'health' ? 'H' : okr.category === 'skill' ? 'S' : '$'}
                              </span>
                            )}
                            {okr && <span className="gg-eq-task-meta-label">{okr.title.split('·')[0]?.trim() || okr.title}</span>}
                            {!okr && meta && <span>{meta}</span>}
                            {okr && meta && <span className="gg-eq-task-meta-sep">·</span>}
                            {okr && meta && <span>{meta}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                <button type="button" className="gg-eq-add" onClick={() => openTaskModal()}>
                  + 添加任务
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
