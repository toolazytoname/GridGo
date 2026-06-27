import { useState } from 'react'
import { Modal } from './Modal'
import { useUIStore } from '../store/ui'
import { useTasksStore } from '../store/tasks'
import type { Quadrant } from '@gridgo/types'

const QUADRANTS: { key: Quadrant; label: string }[] = [
  { key: 'q1', label: '紧急 × 重要' },
  { key: 'q2', label: '重要 × 不紧急' },
  { key: 'q3', label: '紧急 × 不重要' },
  { key: 'q4', label: '都不' },
]

const PRIORITIES: { key: 'low' | 'med' | 'high'; label: string }[] = [
  { key: 'low', label: '低' },
  { key: 'med', label: '中' },
  { key: 'high', label: '高' },
]

export function TaskModal() {
  const open = useUIStore((s) => s.taskModalOpen)
  const close = useUIStore((s) => s.closeTaskModal)
  const okrs = useTasksStore((s) => s.okrs)
  const add = useTasksStore((s) => s.add)

  const [title, setTitle] = useState('')
  const [quadrant, setQuadrant] = useState<Quadrant>('q2')
  const [priority, setPriority] = useState<'low' | 'med' | 'high' | null>('med')
  const [okrId, setOkrId] = useState<string | null>(null)
  const [due, setDue] = useState('')
  const [estimate, setEstimate] = useState<number | ''>('')

  const submit = async () => {
    if (!title.trim()) return
    await add({
      title: title.trim(),
      notes: null,
      quadrant,
      priority,
      due_date: due || null,
      estimate_min: estimate === '' ? null : Number(estimate),
      okr_id: okrId,
    })
    setTitle('')
    setDue('')
    setEstimate('')
    close()
  }

  return (
    <Modal open={open} onClose={close}>
      <div className="gg-modal-head">
        <h3 className="gg-modal-title">添加任务</h3>
        <button type="button" className="gg-modal-close" onClick={close} aria-label="关闭">×</button>
      </div>
      <div className="gg-modal-body gg-form">
        <label className="gg-field">
          <span className="gg-field-label">标题</span>
          <input
            type="text"
            className="gg-input"
            placeholder="给任务起个清晰的名字…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </label>

        <label className="gg-field">
          <span className="gg-field-label">所属 OKR</span>
          <select className="gg-input" value={okrId ?? ''} onChange={(e) => setOkrId(e.target.value || null)}>
            <option value="">未指定</option>
            {okrs.map((o) => (
              <option key={o.id} value={o.id}>{o.title}</option>
            ))}
          </select>
        </label>

        <div className="gg-field">
          <span className="gg-field-label">四象限</span>
          <div className="gg-chip-row">
            {QUADRANTS.map((q) => (
              <button
                key={q.key}
                type="button"
                className={`gg-chip gg-chip-${q.key} ${quadrant === q.key ? 'gg-chip-active' : ''}`}
                onClick={() => setQuadrant(q.key)}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        <div className="gg-field">
          <span className="gg-field-label">优先级</span>
          <div className="gg-chip-row">
            {PRIORITIES.map((p) => (
              <button
                key={p.key}
                type="button"
                className={`gg-chip ${priority === p.key ? 'gg-chip-active' : ''}`}
                onClick={() => setPriority(p.key)}
              >
                {p.label}
              </button>
            ))}
            <button
              type="button"
              className={`gg-chip ${priority === null ? 'gg-chip-active' : ''}`}
              onClick={() => setPriority(null)}
            >
              无
            </button>
          </div>
        </div>

        <div className="gg-field-row">
          <label className="gg-field">
            <span className="gg-field-label">截止日期</span>
            <input type="date" className="gg-input" value={due} onChange={(e) => setDue(e.target.value)} />
          </label>
          <label className="gg-field">
            <span className="gg-field-label">预估时长 (分钟)</span>
            <input
              type="number"
              className="gg-input"
              min="5"
              step="5"
              value={estimate}
              onChange={(e) => setEstimate(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </label>
        </div>
      </div>
      <div className="gg-modal-foot">
        <button type="button" className="gg-btn" onClick={close}>取消</button>
        <button type="button" className="gg-btn gg-btn-primary" disabled={!title.trim()} onClick={submit}>
          添加
        </button>
      </div>
    </Modal>
  )
}
