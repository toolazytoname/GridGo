import { useState } from 'react'
import { useTasksStore } from '../store/tasks'
import { useOkrStore } from '../store/okrs'
import type { OkrCategory, Task, Okr } from '@gridgo/types'

type GanttSub = 'month' | 'quarter' | 'year'

const CAT_LETTER: Record<OkrCategory, string> = {
  product: 'P', health: 'H', skill: 'S', finance: '$',
}

export function GanttView() {
  const [sub, setSub] = useState<GanttSub>('quarter')
  const tasks = useTasksStore((s) => s.tasks)
  const okrs = useOkrStore((s) => s.okrs)

  return (
    <div className="gg-view">
      <div className="gg-subtabs" role="tablist" aria-label="甘特图视图">
        {(['month', 'quarter', 'year'] as GanttSub[]).map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={sub === k}
            className={`gg-subtab ${sub === k ? 'gg-subtab-active' : ''}`}
            onClick={() => setSub(k)}
          >
            {k === 'month' ? '本月' : k === 'quarter' ? '本季度' : '全年'}
          </button>
        ))}
      </div>

      {sub === 'month' && <GanttMonth tasks={tasks} okrs={okrs} />}
      {sub === 'quarter' && <GanttQuarter tasks={tasks} okrs={okrs} />}
      {sub === 'year' && <GanttYear okrs={okrs} />}
    </div>
  )
}

function GanttMonth({ tasks, okrs }: { tasks: Task[]; okrs: Okr[] }) {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const totalDays = Math.round((monthEnd.getTime() - monthStart.getTime()) / 86400000)
  const weekCount = Math.ceil(totalDays / 7)
  const weekMarkers = Array.from({ length: weekCount }, (_, i) => {
    const d = new Date(monthStart)
    d.setDate(monthStart.getDate() + i * 7)
    return { label: `${d.getMonth() + 1}/${d.getDate()}`, pct: ((i * 7) / totalDays) * 100 }
  })

  return (
    <div className="gg-gantt">
      <div className="gg-gantt-header">
        <div className="gg-gantt-task-label">任务</div>
        <div className="gg-gantt-bars">
          {weekMarkers.map((m, i) => (
            <div key={i} className="gg-gantt-month" style={{ left: `${m.pct}%` }}>{m.label}</div>
          ))}
        </div>
      </div>
      {okrs.map((o) => {
        const items = tasks.filter((t) => t.okr_id === o.id && t.due_date)
        if (items.length === 0) return null
        return (
          <div key={o.id} className="gg-gantt-okr">
            <div className="gg-gantt-okr-head">
              <span className={`gg-okr-dot-lg gg-okr-dot-${o.category}`}>{CAT_LETTER[o.category]}</span>
              {o.title}
            </div>
            {items.map((t) => <GanttBarRow key={t.id} t={t} okr={o} rangeStart={monthStart} totalDays={totalDays} />)}
          </div>
        )
      })}
    </div>
  )
}

function GanttQuarter({ tasks, okrs }: { tasks: Task[]; okrs: Okr[] }) {
  const now = new Date()
  // 用"今天往后 3 个月"作为本季度范围
  const qStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const qEnd = new Date(qStart)
  qEnd.setMonth(qStart.getMonth() + 3)
  const totalDays = Math.round((qEnd.getTime() - qStart.getTime()) / 86400000)
  const monthLabels = [
    `${qStart.getMonth() + 1}月`,
    `${(qStart.getMonth() + 1) % 12 + 1}月`,
    `${(qStart.getMonth() + 2) % 12 + 1}月`,
  ]
  const monthPcts = [0, 33.33, 66.66]
  const doing = tasks.filter((t) => !t.done && t.due_date).length
  const urgent = tasks.filter((t) => t.due_date && new Date(t.due_date).getTime() < Date.now() + 7 * 86400000).length

  return (
    <div className="gg-gantt">
      <div className="gg-gantt-header">
        <div className="gg-gantt-task-label">任务</div>
        <div className="gg-gantt-bars">
          {monthLabels.map((m, i) => (
            <div key={i} className="gg-gantt-month" style={{ left: `${monthPcts[i] + 16.66}%` }}>{m}</div>
          ))}
          <div className="gg-gantt-grid-line" style={{ left: 0 }} />
          <div className="gg-gantt-grid-line" style={{ left: '50%' }} />
          <div className="gg-gantt-grid-line" style={{ left: '100%' }} />
          <div className="gg-gantt-today" style={{ left: `${((Date.now() - qStart.getTime()) / 86400000 / totalDays) * 100}%` }} />
        </div>
      </div>
      <div className="gg-gantt-summary-cards">
        <div className="gg-gantt-summary">
          <div className="gg-gantt-summary-num">{okrs.length}</div>
          <div className="gg-gantt-summary-label">OKR 目标</div>
        </div>
        <div className="gg-gantt-summary">
          <div className="gg-gantt-summary-num good">{doing}</div>
          <div className="gg-gantt-summary-label">任务进行中</div>
        </div>
        <div className="gg-gantt-summary">
          <div className="gg-gantt-summary-num warn">{urgent}</div>
          <div className="gg-gantt-summary-label">即将截止</div>
        </div>
      </div>
      {okrs.map((o) => {
        const items = tasks.filter((t) => t.okr_id === o.id && t.due_date)
        if (items.length === 0) return null
        return (
          <div key={o.id} className="gg-gantt-okr">
            <div className="gg-gantt-okr-head">
              <span className={`gg-okr-dot-lg gg-okr-dot-${o.category}`}>{CAT_LETTER[o.category]}</span>
              {o.title}
            </div>
            {items.map((t) => <GanttBarRow key={t.id} t={t} okr={o} rangeStart={qStart} totalDays={totalDays} showDuration />)}
          </div>
        )
      })}
    </div>
  )
}

function GanttYear({ okrs }: { okrs: Okr[] }) {
  const now = new Date()
  const quarterLabels = ['Q1', 'Q2', 'Q3', 'Q4']
  const quarterPcts = [12.5, 37.5, 62.5, 87.5]
  const currentQ = Math.floor(now.getMonth() / 3)

  return (
    <div className="gg-gantt">
      <div className="gg-gantt-header">
        <div className="gg-gantt-task-label">OKR</div>
        <div className="gg-gantt-bars">
          {quarterLabels.map((q, i) => (
            <div key={i} className="gg-gantt-month" style={{ left: `${quarterPcts[i]}%` }}>{q}</div>
          ))}
          {quarterPcts.map((p, i) => (
            <div key={`g-${i}`} className="gg-gantt-grid-line" style={{ left: `${p - 12.5}%` }} />
          ))}
        </div>
      </div>
      <div className="gg-gantt-summary-cards">
        <div className="gg-gantt-summary">
          <div className="gg-gantt-summary-num good">{currentQ}</div>
          <div className="gg-gantt-summary-label">已完成季度</div>
        </div>
        <div className="gg-gantt-summary">
          <div className="gg-gantt-summary-num">1</div>
          <div className="gg-gantt-summary-label">进行中</div>
        </div>
        <div className="gg-gantt-summary">
          <div className="gg-gantt-summary-num">{4 - currentQ - 1}</div>
          <div className="gg-gantt-summary-label">未来季度</div>
        </div>
      </div>
      {okrs.map((o) => {
        const start = o.category === 'finance' ? 50 : 0
        const width = o.category === 'finance' ? 50 : 100
        const cat = o.category
        return (
          <div key={o.id} className="gg-gantt-row">
            <div className="gg-gantt-task-label">
              <span className={`gg-okr-dot-lg gg-okr-dot-${cat}`} style={{ marginRight: 4, verticalAlign: 'middle' }}>{CAT_LETTER[cat]}</span>
              {o.title.split('·')[0]?.trim() || o.title}
            </div>
            <div className="gg-gantt-bar-container">
              <div className={`gg-gantt-bar gg-okr-dot-${cat}`} style={{ left: `${start}%`, width: `${width}%` }}>
                {width === 100 ? '全年' : 'H2 启动'}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function GanttBarRow({ t, okr, rangeStart, totalDays, showDuration }: { t: Task; okr: Okr; rangeStart: Date; totalDays: number; showDuration?: boolean }) {
  if (!t.due_date) return null
  const start = new Date(t.due_date)
  start.setDate(start.getDate() - 3) // 任务前 3 天开始
  const offset = Math.max(0, (start.getTime() - rangeStart.getTime()) / 86400000)
  const left = Math.min(95, (offset / totalDays) * 100)
  const width = showDuration ? Math.max(8, 12) : Math.max(2, 4)
  const cat = okr.category
  return (
    <div className="gg-gantt-row">
      <div className="gg-gantt-task-label">{t.title}</div>
      <div className="gg-gantt-bar-container">
        <div className={`gg-gantt-bar gg-okr-dot-${cat}`} style={{ left: `${left}%`, width: `${width}%` }}>
          <span>{t.due_date.slice(5)}</span>
        </div>
      </div>
    </div>
  )
}
