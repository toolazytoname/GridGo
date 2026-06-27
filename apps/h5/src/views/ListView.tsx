import { useState, useMemo } from 'react'
import { useTasksStore, okrColorClass } from '../store/tasks'
import { useOkrStore } from '../store/okrs'
import { useUIStore } from '../store/ui'
import type { Quadrant, OkrCategory } from '@gridgo/types'

type SubTab = 'all' | 'doing' | 'done'

export function ListView() {
  const [sub, setSub] = useState<SubTab>('all')
  const [q, setQ] = useState('')
  const [expandedOkrs, setExpandedOkrs] = useState<Set<string>>(new Set(['o1', 'o2', 'o3']))
  const [expandedKrs, setExpandedKrs] = useState<Set<string>>(new Set(['k11', 'k12']))

  const tasks = useTasksStore((s) => s.tasks)
  const toggleTask = useTasksStore((s) => s.toggle)

  const treeOkrs = useOkrStore((s) => s.okrs)
  const krs = useOkrStore((s) => s.krs)
  const subTasks = useOkrStore((s) => s.subTasks)
  const toggleSub = useOkrStore((s) => s.toggleSub)

  const openTaskModal = useUIStore((s) => s.openTaskModal)

  const toggleOkr = (id: string) => {
    setExpandedOkrs((s) => {
      const ns = new Set(s)
      ns.has(id) ? ns.delete(id) : ns.add(id)
      return ns
    })
  }
  const toggleKrExp = (id: string) => {
    setExpandedKrs((s) => {
      const ns = new Set(s)
      ns.has(id) ? ns.delete(id) : ns.add(id)
      return ns
    })
  }

  const filteredTasks = useMemo(() => {
    const term = q.trim().toLowerCase()
    return tasks
      .filter((t) => (sub === 'done' ? t.done : sub === 'doing' ? !t.done : true))
      .filter((t) => !term || t.title.toLowerCase().includes(term))
  }, [tasks, sub, q])

  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="gg-view">
      <div className="gg-subtabs" role="tablist">
        {(['all', 'doing', 'done'] as SubTab[]).map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={sub === k}
            className={`gg-subtab ${sub === k ? 'gg-subtab-active' : ''}`}
            onClick={() => setSub(k)}
          >
            {k === 'all' ? '全部' : k === 'doing' ? '进行中' : '已完成'}
          </button>
        ))}
      </div>

      <div className="gg-list-search">
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="7" cy="7" r="5" />
          <path d="M14 14l-3.5-3.5" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          placeholder="搜索任务、OKR、关键词…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="gg-okr-tree">
        {treeOkrs.map((o) => {
          const isOpen = expandedOkrs.has(o.id)
          const okrKrs = krs.filter((k) => k.okr_id === o.id)
          const okrTasks = filteredTasks.filter((t) => t.okr_id === o.id)
          const okrKrsWithTasks = okrKrs.map((kr) => ({
            kr,
            task: okrTasks.find((t) => t.key_result_id === kr.id),
            subs: subTasks.filter((s) => okrTasks.find((t) => t.id === s.task_id && t.key_result_id === kr.id)?.id === s.task_id),
          }))
          const pct = Math.round(o.progress * 100)
          return (
            <div key={o.id} className="gg-okr-item">
              <div className="gg-okr-header" onClick={() => toggleOkr(o.id)}>
                <div className={`gg-okr-expand ${isOpen ? 'gg-okr-expand-open' : ''}`}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 2l4 4-4 4" strokeLinecap="round" />
                  </svg>
                </div>
                <span className={`gg-okr-dot gg-okr-dot-lg ${okrColorClass[o.category as OkrCategory]}`}>
                  {o.title.replace(/^.+?·\s*/, '').trim()[0] || o.title[0]}
                </span>
                <span className="gg-okr-title">{o.title}</span>
                <div className="gg-okr-progress-bar">
                  <div className="gg-okr-progress-fill" style={{ width: `${pct}%` }} />
                </div>
                <span className="gg-okr-progress-label">{pct}%</span>
              </div>
              {isOpen && (
                <div className="gg-okr-body gg-okr-body-open">
                  {okrKrsWithTasks.map(({ kr, task, subs }) => {
                    const isKrOpen = expandedKrs.has(kr.id)
                    const tag = task?.quadrant ? tagClass(task.quadrant as Quadrant) : null
                    return (
                      <div key={kr.id}>
                        <div className="gg-tree-row" onClick={() => toggleKrExp(kr.id)}>
                          <div className={`gg-tree-expand ${isKrOpen ? 'gg-tree-expand-open' : ''}`}>
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M4 2l4 4-4 4" strokeLinecap="round" />
                            </svg>
                          </div>
                          {task && (
                            <div
                              className={`gg-tree-check ${task.done ? 'gg-tree-check-on' : ''}`}
                              onClick={(e) => { e.stopPropagation(); toggleTask(task.id) }}
                            >
                              {task.done && (
                                <svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M3 8l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </div>
                          )}
                          <span className={`gg-tree-label ${task?.done ? 'done' : ''}`}>{kr.title}</span>
                          <div className="gg-tree-meta">
                            {tag && <span className={`gg-tree-tag ${tag.cls}`}>{tag.label}</span>}
                            {kr.due_date && <span className="gg-tree-date">{formatDate(kr.due_date, today)}</span>}
                          </div>
                        </div>
                        {isKrOpen && subs.length > 0 && (
                          <div className="gg-sub-children gg-sub-children-open">
                            {subs.map((s) => (
                              <div key={s.id} className="gg-sub-row" onClick={() => toggleSub(s.id)}>
                                <div className="gg-sub-dot" />
                                <div className={`gg-sub-check ${s.done ? 'done' : ''}`}>
                                  {s.done && (
                                    <svg viewBox="0 0 16 16" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="2.5">
                                      <path d="M3 8l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  )}
                                </div>
                                <span className={`gg-sub-label ${s.done ? 'done' : ''}`}>{s.title}</span>
                                <span className="gg-sub-meta">{s.done ? '已完成' : s.estimate_min ? `${s.estimate_min}min` : '待完成'}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {okrTasks.filter((t) => !t.key_result_id).map((t) => (
                    <div key={t.id} className="gg-tree-row" onClick={() => toggleTask(t.id)}>
                      <div className="gg-tree-expand" style={{ visibility: 'hidden' }} />
                      <div className={`gg-tree-check ${t.done ? 'gg-tree-check-on' : ''}`}>
                        {t.done && (
                          <svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 8l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span className={`gg-tree-label ${t.done ? 'done' : ''}`}>{t.title}</span>
                      <div className="gg-tree-meta">
                        {t.quadrant && <span className={`gg-tree-tag ${tagClass(t.quadrant as Quadrant)?.cls}`}>{tagClass(t.quadrant as Quadrant)?.label}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {filteredTasks.filter((t) => !t.okr_id).length > 0 && (
          <div className="gg-okr-item">
            <div className="gg-okr-header">
              <div className="gg-okr-expand gg-okr-expand-open">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 2l4 4-4 4" strokeLinecap="round" />
                </svg>
              </div>
              <span className="gg-okr-dot gg-okr-dot-lg" style={{ background: 'var(--gg-muted)' }}>?</span>
              <span className="gg-okr-title">未分类</span>
            </div>
            <div className="gg-okr-body gg-okr-body-open">
              {filteredTasks.filter((t) => !t.okr_id).map((t) => (
                <div key={t.id} className="gg-tree-row" onClick={() => toggleTask(t.id)}>
                  <div className="gg-tree-expand" style={{ visibility: 'hidden' }} />
                  <div className={`gg-tree-check ${t.done ? 'gg-tree-check-on' : ''}`}>
                    {t.done && (
                      <svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 8l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span className={`gg-tree-label ${t.done ? 'done' : ''}`}>{t.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {filteredTasks.length === 0 && (
        <div className="gg-placeholder">
          <div className="gg-placeholder-title">没有匹配的任务</div>
          {sub === 'doing' && (
            <button type="button" className="gg-btn gg-btn-primary" onClick={openTaskModal}>
              + 添加一个任务
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function formatDate(iso: string, today: string): string {
  if (iso === today) return '今天'
  const d = new Date(iso)
  const now = new Date()
  const diff = Math.round((d.getTime() - now.getTime()) / 86400000)
  if (diff === 1) return '明天'
  if (diff === -1) return '昨天'
  if (diff > 1 && diff < 7) return `${diff} 天后`
  if (diff < 0 && diff > -7) return `${-diff} 天前`
  if (diff >= 7) return `${Math.ceil(diff / 7)} 周后`
  return iso.slice(5)
}

function tagClass(q: Quadrant) {
  return { q1: { cls: 'q1', label: '紧急重要' }, q2: { cls: 'q2', label: '重要' }, q3: { cls: 'q3', label: '紧急不重要' }, q4: { cls: 'q4', label: '不重要' } }[q] ?? null
}
