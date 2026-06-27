import { useState, useMemo } from 'react'
import { useTasksStore, okrColorClass } from '../store/tasks'
import type { Quadrant, OkrCategory, Task } from '@gridgo/types'

type CalSub = 'month' | 'week' | 'day'

const DAY_LABELS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
const DAY_LABELS_MON = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

function dateKey(d: Date) {
  return d.toISOString().slice(0, 10)
}

function toMonday(d: Date) {
  const r = new Date(d)
  const day = r.getDay()
  const diff = day === 0 ? -6 : 1 - day
  r.setDate(r.getDate() + diff)
  r.setHours(0, 0, 0, 0)
  return r
}

export function CalendarView() {
  const [sub, setSub] = useState<CalSub>('month')
  const [cursor, setCursor] = useState(() => new Date())
  const tasks = useTasksStore((s) => s.tasks)
  const okrs = useTasksStore((s) => s.okrs)
  const toggle = useTasksStore((s) => s.toggle)

  const tasksByDate = useMemo(() => {
    const out: Record<string, Task[]> = {}
    for (const t of tasks) {
      if (!t.due_date) continue
      ;(out[t.due_date] ||= []).push(t)
    }
    return out
  }, [tasks])

  const nav = (delta: number) => {
    const c = new Date(cursor)
    if (sub === 'month') c.setMonth(c.getMonth() + delta)
    else if (sub === 'week') c.setDate(c.getDate() + delta * 7)
    else c.setDate(c.getDate() + delta)
    setCursor(c)
  }

  const okrById = (id: string | null) => okrs.find((o) => o.id === id)

  return (
    <div className="gg-view">
      <div className="gg-subtabs" role="tablist" aria-label="日历视图">
        {(['month', 'week', 'day'] as CalSub[]).map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={sub === k}
            className={`gg-subtab ${sub === k ? 'gg-subtab-active' : ''}`}
            onClick={() => setSub(k)}
          >
            {k === 'month' ? '月' : k === 'week' ? '周' : '日'}
          </button>
        ))}
      </div>

      <div className="gg-cal-header">
        <div className="gg-cal-nav" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button type="button" className="gg-cal-nav-btn" onClick={() => nav(-1)} aria-label="上一段">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 2L4 7l5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span className="gg-cal-month">
            {sub === 'month' && `${cursor.getFullYear()} 年 ${cursor.getMonth() + 1} 月`}
            {sub === 'week' && formatWeek(cursor)}
            {sub === 'day' && formatDay(cursor)}
          </span>
          <button type="button" className="gg-cal-nav-btn" onClick={() => nav(1)} aria-label="下一段">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 2l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {sub === 'month' && <MonthView cursor={cursor} tasksByDate={tasksByDate} onToggle={toggle} okrById={okrById} />}
      {sub === 'week' && <WeekView cursor={cursor} tasksByDate={tasksByDate} onToggle={toggle} okrById={okrById as any} />}
      {sub === 'day' && <DayView cursor={cursor} tasks={tasks} onToggle={toggle} okrById={okrById} />}
    </div>
  )
}

function MonthView({ cursor, tasksByDate, onToggle, okrById }: { cursor: Date; tasksByDate: Record<string, Task[]>; onToggle: (id: string) => void; okrById: (id: string | null) => { id: string; title: string; category: OkrCategory } | undefined }) {
  const firstDay = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
  const start = new Date(firstDay)
  start.setDate(1 - firstDay.getDay())
  const cells: Date[] = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    cells.push(d)
  }
  const today = dateKey(new Date())
  return (
    <div className="gg-cal-grid">
      {DAY_LABELS.map((d) => <div key={d} className="gg-cal-dow">{d}</div>)}
      {cells.map((d) => {
        const key = dateKey(d)
        const items = tasksByDate[key] ?? []
        const inMonth = d.getMonth() === cursor.getMonth()
        const isToday = key === today
        return (
          <div key={key} className={`gg-cal-cell ${inMonth ? '' : 'gg-cal-out'} ${isToday ? 'gg-cal-today' : ''}`}>
            <span className="gg-cal-num">{d.getDate()}</span>
            {items.slice(0, 3).map((t) => {
              const okr = okrById(t.okr_id)
              return (
                <div key={t.id} className={`gg-cal-evt ${t.quadrant ?? 'q4'}`} onClick={() => onToggle(t.id)} title={t.title}>
                  {okr && <span className={`gg-cal-task-dot ${okrColorClass[okr.category]}`} />}
                  {t.title}
                </div>
              )
            })}
            {items.length > 3 && <div className="gg-cal-more">+{items.length - 3}</div>}
          </div>
        )
      })}
    </div>
  )
}

function WeekView({ cursor, tasksByDate, onToggle }: { cursor: Date; tasksByDate: Record<string, Task[]>; onToggle: (id: string) => void; okrById: (id: string | null) => { id: string; title: string; category: OkrCategory } | undefined }) {
  const monday = toMonday(cursor)
  const today = dateKey(new Date())
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
  return (
    <div className="gg-week-grid">
      {days.map((d, i) => {
        const key = dateKey(d)
        const items = tasksByDate[key] ?? []
        const isToday = key === today
        return (
          <div key={key} className={`gg-week-col ${isToday ? 'today' : ''}`}>
            <div className="gg-week-day-label">{DAY_LABELS_MON[i]}</div>
            <div className="gg-week-day-num">{d.getDate()}</div>
            {items.map((t) => (
              <div key={t.id} className={`gg-week-event ${t.quadrant ?? 'q4'}`} onClick={() => onToggle(t.id)} title={t.title}>
                {t.title}
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

function DayView({ cursor, tasks, onToggle, okrById }: { cursor: Date; tasks: Task[]; onToggle: (id: string) => void; okrById: (id: string | null) => { id: string; title: string; category: OkrCategory } | undefined }) {
  const key = dateKey(cursor)
  const items = tasks.filter((t) => t.due_date === key)
  // 把 task 按时间分配到 hour（如果没有 hour 数据，就放在 09:00）
  const byHour: Record<number, Task[]> = {}
  for (const t of items) {
    const h = t.due_date && t.due_date.length > 10 ? 9 : 9 // 简化：都放 09:00
    ;(byHour[h] ||= []).push(t)
  }
  const hours = Array.from({ length: 10 }, (_, i) => i + 9) // 09 - 18
  return (
    <div className="gg-day-view">
      {hours.map((h) => {
        const evs = byHour[h] ?? []
        return (
          <div key={h} className="gg-day-time-row">
            <div className="gg-day-hour">{String(h).padStart(2, '0')}:00</div>
            <div className="gg-day-events">
              {evs.map((t) => (
                <div key={t.id} className={`gg-day-event ${t.quadrant ?? 'q4'}`} onClick={() => onToggle(t.id)}>
                  <b>{t.title}</b>
                  <span>{okrById(t.okr_id)?.title.split('·')[0]?.trim() ?? (t.estimate_min ? `${t.estimate_min}min` : '')}</span>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function formatWeek(d: Date) {
  const mon = toMonday(d)
  const sun = new Date(mon)
  sun.setDate(mon.getDate() + 6)
  return `${mon.getMonth() + 1}/${mon.getDate()} - ${sun.getMonth() + 1}/${sun.getDate()}`
}

function formatDay(d: Date) {
  const m = d.getMonth() + 1
  const day = d.getDate()
  const wk = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]
  return `${m} 月 ${day} 日 · 周${wk}`
}

function _tagQuadrant(q: Quadrant): OkrCategory {
  return q === 'q1' ? 'product' : q === 'q2' ? 'health' : q === 'q3' ? 'skill' : 'finance'
}
void _tagQuadrant
