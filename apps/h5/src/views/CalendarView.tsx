import { useState, useMemo } from 'react'
import { useTasksStore } from '../store/tasks'

export function CalendarView() {
  const tasks = useTasksStore((s) => s.tasks)
  const [cursor, setCursor] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })

  const monthLabel = useMemo(() => `${cursor.getFullYear()} 年 ${cursor.getMonth() + 1} 月`, [cursor])

  const grid = useMemo(() => {
    const firstDay = new Date(cursor)
    const start = new Date(firstDay)
    start.setDate(1 - firstDay.getDay())
    const cells: Date[] = []
    for (let i = 0; i < 42; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      cells.push(d)
    }
    return cells
  }, [cursor])

  const tasksByDate = useMemo(() => {
    const out: Record<string, typeof tasks> = {}
    for (const t of tasks) {
      if (!t.due_date) continue
      ;(out[t.due_date] ||= []).push(t)
    }
    return out
  }, [tasks])

  const today = new Date()
  const todayKey = today.toISOString().slice(0, 10)

  return (
    <div className="gg-view">
      <div className="gg-cal-header">
        <button type="button" className="gg-cal-nav" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} aria-label="上个月">
          ‹
        </button>
        <span className="gg-cal-month">{monthLabel}</span>
        <button type="button" className="gg-cal-nav" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} aria-label="下个月">
          ›
        </button>
      </div>

      <div className="gg-cal-grid">
        {['日', '一', '二', '三', '四', '五', '六'].map((d) => (
          <div key={d} className="gg-cal-dow">{d}</div>
        ))}
        {grid.map((d) => {
          const key = d.toISOString().slice(0, 10)
          const items = tasksByDate[key] ?? []
          const inMonth = d.getMonth() === cursor.getMonth()
          const isToday = key === todayKey
          return (
            <div
              key={key}
              className={`gg-cal-cell ${inMonth ? '' : 'gg-cal-out'} ${isToday ? 'gg-cal-today' : ''}`}
            >
              <span className="gg-cal-num">{d.getDate()}</span>
              {items.slice(0, 3).map((t) => (
                <div key={t.id} className={`gg-cal-evt gg-cal-evt-${t.quadrant ?? 'q4'}`} title={t.title}>
                  {t.title}
                </div>
              ))}
              {items.length > 3 && <div className="gg-cal-more">+{items.length - 3}</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
