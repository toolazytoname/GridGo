import { useState, useMemo } from 'react'
import { useTasksStore, okrColorClass } from '../store/tasks'
import { useUIStore } from '../store/ui'
import type { Task, OkrCategory } from '@gridgo/types'

type SubTab = 'doing' | 'done'

export function ListView() {
  const [sub, setSub] = useState<SubTab>('doing')
  const [q, setQ] = useState('')
  const tasks = useTasksStore((s) => s.tasks)
  const okrs = useTasksStore((s) => s.okrs)
  const toggle = useTasksStore((s) => s.toggle)
  const openTaskModal = useUIStore((s) => s.openTaskModal)

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return tasks
      .filter((t) => (sub === 'done' ? t.done : !t.done))
      .filter((t) => !term || t.title.toLowerCase().includes(term))
  }, [tasks, sub, q])

  const tasksByOkr = useMemo(() => {
    const out: Record<string, Task[]> = {}
    for (const t of filtered) {
      const key = t.okr_id ?? '__none__'
      ;(out[key] ||= []).push(t)
    }
    return out
  }, [filtered])

  return (
    <div className="gg-view">
      <div className="gg-subtabs" role="tablist">
        {(['doing', 'done'] as SubTab[]).map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={sub === k}
            className={`gg-subtab ${sub === k ? 'gg-subtab-active' : ''}`}
            onClick={() => setSub(k)}
          >
            {k === 'doing' ? '进行中' : '已完成'}
          </button>
        ))}
      </div>

      <div className="gg-list-header">
        <span className="gg-list-count">
          {sub === 'done' ? `${filtered.length} 项 · 满满成就感 🎉` : `${filtered.length} 项未完成`}
        </span>
      </div>

      <div className="gg-list-search">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="11" cy="11" r="7" />
          <path d="M16 16l4 4" strokeLinecap="round" />
        </svg>
        <input
          className="gg-list-search-input"
          type="text"
          placeholder={sub === 'done' ? '搜索已完成的任务…' : '搜索进行中的任务…'}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {filtered.length === 0 && (
        <div className="gg-placeholder">
          <div className="gg-placeholder-title">{sub === 'done' ? '还没有完成的任务' : '没有进行中的任务'}</div>
          {!q && sub === 'doing' && (
            <button type="button" className="gg-btn gg-btn-primary" onClick={openTaskModal}>
              + 添加一个任务
            </button>
          )}
        </div>
      )}

      {okrs.map((o) => {
        const items = tasksByOkr[o.id] ?? []
        if (items.length === 0) return null
        return (
          <section key={o.id} className="gg-list-okr">
            <div className="gg-list-okr-head">
              <span className={`gg-okr-dot ${okrColorClass[o.category as OkrCategory]}`}>{o.title[0]}</span>
              <span className="gg-list-okr-title">{o.title}</span>
            </div>
            <div className="gg-list-okr-body">
              {items.map((t) => (
                <div
                  key={t.id}
                  className={`gg-list-task ${t.done ? 'gg-list-task-done' : ''}`}
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
                    {t.due_date && <div className="gg-eq-task-meta">{t.due_date}</div>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )
      })}

      {tasksByOkr['__none__']?.length > 0 && (
        <section className="gg-list-okr">
          <div className="gg-list-okr-head">
            <span className="gg-okr-dot" style={{ background: 'var(--gg-muted)' }}>?</span>
            <span className="gg-list-okr-title">未分类</span>
          </div>
          <div className="gg-list-okr-body">
            {tasksByOkr['__none__'].map((t) => (
              <div
                key={t.id}
                className={`gg-list-task ${t.done ? 'gg-list-task-done' : ''}`}
                onClick={() => toggle(t.id)}
              >
                <div className={`gg-eq-check ${t.done ? 'gg-eq-check-on' : ''}`} />
                <div className="gg-eq-task-body">
                  <div className={`gg-eq-task-title ${t.done ? 'done' : ''}`}>{t.title}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
