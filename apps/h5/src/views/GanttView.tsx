import { useTasksStore, okrColorClass } from '../store/tasks'
import type { OkrCategory } from '@gridgo/types'

export function GanttView() {
  const tasks = useTasksStore((s) => s.tasks)
  const okrs = useTasksStore((s) => s.okrs)

  const now = new Date()
  const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
  const quarterEnd = new Date(quarterStart)
  quarterEnd.setMonth(quarterStart.getMonth() + 3)
  const totalDays = Math.round((quarterEnd.getTime() - quarterStart.getTime()) / 86400000)

  const monthMarkers = Array.from({ length: 3 }, (_, i) => {
    const d = new Date(quarterStart)
    d.setMonth(quarterStart.getMonth() + i)
    const offset = Math.round((d.getTime() - quarterStart.getTime()) / 86400000)
    return { label: `${d.getMonth() + 1}月`, pct: (offset / totalDays) * 100 }
  })

  return (
    <div className="gg-view">
      <h2 className="gg-view-title">
        甘特图 <span className="gg-view-title-sub">·  本季度</span>
      </h2>

      <div className="gg-gantt">
        <div className="gg-gantt-header">
          <div className="gg-gantt-task-label">任务</div>
          <div className="gg-gantt-bars">
            {monthMarkers.map((m, i) => (
              <div key={i} className="gg-gantt-month" style={{ left: `${m.pct}%` }}>
                {m.label}
              </div>
            ))}
            <div className="gg-gantt-grid-line" style={{ left: 0 }} />
            <div className="gg-gantt-grid-line" style={{ left: '50%' }} />
            <div className="gg-gantt-grid-line" style={{ left: '100%' }} />
            <div className="gg-gantt-today" style={{ left: `${((Date.now() - quarterStart.getTime()) / 86400000 / totalDays) * 100}%` }} />
          </div>
        </div>

        {okrs.map((o) => {
          const items = tasks.filter((t) => t.okr_id === o.id && t.due_date)
          if (items.length === 0) return null
          return (
            <div key={o.id} className="gg-gantt-okr">
              <div className="gg-gantt-okr-head">
                <span className={`gg-okr-dot ${okrColorClass[o.category as OkrCategory]}`}>{o.title[0]}</span>
                {o.title}
              </div>
              {items.map((t) => {
                if (!t.due_date) return null
                const start = new Date(t.due_date)
                start.setDate(start.getDate() - 3) // 任务前 3 天开始显示
                const offset = Math.max(0, (start.getTime() - quarterStart.getTime()) / 86400000)
                const length = 4
                const left = Math.min(100, (offset / totalDays) * 100)
                const width = Math.max(2, (length / totalDays) * 100)
                return (
                  <div key={t.id} className="gg-gantt-row">
                    <div className="gg-gantt-task-label">{t.title}</div>
                    <div className="gg-gantt-bar-container">
                      <div className={`gg-gantt-bar ${okrColorClass[o.category as OkrCategory]}`} style={{ left: `${left}%`, width: `${width}%` }}>
                        <span>{t.due_date.slice(5)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}

        {tasks.filter((t) => !t.okr_id && t.due_date).length > 0 && (
          <div className="gg-gantt-okr">
            <div className="gg-gantt-okr-head">未分类</div>
            {tasks.filter((t) => !t.okr_id && t.due_date).map((t) => (
              <div key={t.id} className="gg-gantt-row">
                <div className="gg-gantt-task-label">{t.title}</div>
                <div className="gg-gantt-bar-container">
                  <div className="gg-gantt-bar" style={{ left: '20%', width: '8%', background: 'var(--gg-muted)' }}>
                    <span>{t.due_date!.slice(5)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
