import { useMemo } from 'react'
import { useUIStore, type MatrixSubTab } from '../store/ui'
import { useTasksStore, okrColorClass } from '../store/tasks'
import type { Quadrant, Task } from '@gridgo/types'

const QUADRANTS: { key: Quadrant; label: string; sub: string }[] = [
  { key: 'q1', label: '紧急 × 重要', sub: '立刻做' },
  { key: 'q2', label: '重要 × 不紧急', sub: '计划做' },
  { key: 'q3', label: '紧急 × 不重要', sub: '快速处理' },
  { key: 'q4', label: '都不紧急 / 不重要', sub: '减少做' },
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

export function MatrixView() {
  const sub = useUIStore((s) => s.matrixSub)
  const setSub = useUIStore((s) => s.setMatrixSub)
  const openTaskModal = useUIStore((s) => s.openTaskModal)
  const tasks = useTasksStore((s) => s.tasks)
  const okrs = useTasksStore((s) => s.okrs)
  const toggle = useTasksStore((s) => s.toggle)

  const filtered = useMemo(() => {
    if (sub === 'today') return tasks.filter((t) => isToday(t.due_date))
    if (sub === 'week') return tasks.filter((t) => isThisWeek(t.due_date))
    return tasks
  }, [tasks, sub])

  const grouped: Record<Quadrant, Task[]> = { q1: [], q2: [], q3: [], q4: [] }
  for (const t of filtered) {
    if (t.quadrant) grouped[t.quadrant].push(t)
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

      <h2 className="gg-view-title">
        四象限 <span className="gg-view-title-sub">·  {formatDate(new Date())}</span>
      </h2>

      {sub === 'week' && (
        <div className="gg-focus-card">
          <span className="gg-focus-label">本周聚焦</span>
          <div className="gg-focus-body">
            聚焦 <b>产品增长 OKR</b> 的核心功能重构与 A/B 测试上线。
            建议每日 14:00 - 18:00 深度工作块专注于此。健康维度保持 3 次跑步（已达成 2/3）。
          </div>
        </div>
      )}

      <div className="gg-matrix">
        {QUADRANTS.map((q) => {
          const items = grouped[q.key]
          return (
            <div key={q.key} className={`gg-eq-cell gg-eq-${q.key}`}>
              <div className="gg-eq-header">
                <span className="gg-eq-label">{q.label}</span>
                <span className="gg-eq-count">{items.length}</span>
              </div>
              <div className="gg-eq-tasks">
                {items.map((t) => {
                  const okr = okrs.find((o) => o.id === t.okr_id)
                  return (
                    <div
                      key={t.id}
                      className={`gg-eq-task ${t.done ? 'gg-eq-task-done' : ''}`}
                      onClick={() => toggle(t.id)}
                    >
                      <div className={`gg-eq-check ${t.done ? 'gg-eq-check-on' : ''}`}>
                        {t.done && (
                          <svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 8l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <div className="gg-eq-task-body">
                        <div className={`gg-eq-task-title ${t.done ? 'done' : ''}`}>{t.title}</div>
                        {(okr || t.due_date) && (
                          <div className="gg-eq-task-meta">
                            {okr && (
                              <span className={`gg-okr-dot ${okrColorClass[okr.category]}`} title={okr.title}>
                                {okr.title[0]}
                              </span>
                            )}
                            {okr && <span style={{ marginLeft: 4 }}>{okr.title.split('·')[1]?.trim() ?? okr.title}</span>}
                            {t.due_date && !okr && <span>{t.due_date}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                <button type="button" className="gg-eq-add" onClick={openTaskModal}>
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

function formatDate(d: Date) {
  const m = d.getMonth() + 1
  const day = d.getDate()
  const wk = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]
  return `${m} 月 ${day} 日 · 周${wk}`
}
