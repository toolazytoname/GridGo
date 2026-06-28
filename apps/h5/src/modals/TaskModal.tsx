import { useState, useEffect } from 'react'
import { Modal } from './Modal'
import { useUIStore } from '../store/ui'
import { useTasksStore } from '../store/tasks'
import { useOkrStore } from '../store/okrs'
import type { Task, Quadrant, OkrCategory } from '@gridgo/types'

const QUADRANTS: { key: Quadrant; label: string }[] = [
  { key: 'q1', label: '紧急 × 重要' },
  { key: 'q2', label: '重要 × 不紧急' },
  { key: 'q3', label: '紧急 × 不重要' },
  { key: 'q4', label: '都不紧急 / 不重要' },
]

const CAT_LETTER: Record<OkrCategory, string> = {
  product: 'P', health: 'H', skill: 'S', finance: '$',
}

interface TaskModalProps {
  mode: 'add' | 'view' | 'edit'
  taskId?: string
}

export function TaskModal({ mode, taskId }: TaskModalProps) {
  const open = useUIStore((s) => s.taskModalOpen)
  const close = useUIStore((s) => s.closeTaskModal)
  const okrs = useTasksStore((s) => s.okrs)
  const allTasks = useTasksStore((s) => s.tasks)
  const addTask = useTasksStore((s) => s.add)
  const toggle = useTasksStore((s) => s.toggle)
  const subTasks = useOkrStore((s) => s.subTasks)

  const [viewMode, setViewMode] = useState<'view' | 'edit'>(mode === 'edit' ? 'edit' : 'view')

  // add 模式 state
  const [title, setTitle] = useState('')
  const [quadrant, setQuadrant] = useState<Quadrant>('q2')
  const [priority, setPriority] = useState<'low' | 'med' | 'high' | null>('med')
  const [okrId, setOkrId] = useState<string | null>(null)
  const [due, setDue] = useState('')
  const [estimate, setEstimate] = useState<number | ''>('')

  // 重置 add 模式
  useEffect(() => {
    if (open && mode === 'add') {
      setTitle(''); setQuadrant('q2'); setPriority('med'); setOkrId(null); setDue(''); setEstimate('')
      setViewMode('view')
    }
  }, [open, mode])

  if (!open) return null

  // 找 task（view/edit 模式）
  const task = mode !== 'add' && taskId ? allTasks.find((t) => t.id === taskId) : null
  const okr = task?.okr_id ? okrs.find((o) => o.id === task.okr_id) : null
  const childSubs = task ? subTasks.filter((s) => s.task_id === task.id) : []

  const handleAdd = async () => {
    if (!title.trim()) return
    await addTask({
      title: title.trim(),
      notes: null,
      quadrant,
      priority,
      due_date: due || null,
      estimate_min: estimate === '' ? null : Number(estimate),
      okr_id: okrId,
    })
    setTitle(''); setDue(''); setEstimate('')
    close()
  }

  return (
    <Modal open={open} onClose={close} wide>
      {mode === 'add' ? (
        <AddForm
          title={title} setTitle={setTitle}
          quadrant={quadrant} setQuadrant={setQuadrant}
          priority={priority} setPriority={setPriority}
          okrId={okrId} setOkrId={setOkrId}
          due={due} setDue={setDue}
          estimate={estimate} setEstimate={setEstimate}
          okrs={okrs}
          onCancel={close}
          onSubmit={handleAdd}
        />
      ) : task ? (
        viewMode === 'view' ? (
          <ViewMode task={task} okr={okr} subs={childSubs} onClose={close} onEdit={() => setViewMode('edit')} onToggle={() => toggle(task.id)} />
        ) : (
          <EditMode task={task} onClose={close} onCancel={() => setViewMode('view')} />
        )
      ) : null}
    </Modal>
  )
}

function AddForm({ title, setTitle, quadrant, setQuadrant, priority, setPriority, okrId, setOkrId, due, setDue, estimate, setEstimate, okrs, onCancel, onSubmit }: any) {
  return (
    <>
      <div className="gg-modal-head">
        <h3 className="gg-modal-title">添加任务</h3>
        <button type="button" className="gg-modal-close" onClick={onCancel} aria-label="关闭">×</button>
      </div>
      <div className="gg-modal-body gg-form">
        <label className="gg-field">
          <span className="gg-field-label">标题</span>
          <input type="text" className="gg-input" placeholder="给任务起个清晰的名字…" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
        </label>
        <label className="gg-field">
          <span className="gg-field-label">所属 OKR</span>
          <select className="gg-input" value={okrId ?? ''} onChange={(e) => setOkrId(e.target.value || null)}>
            <option value="">未指定</option>
            {okrs.map((o: any) => <option key={o.id} value={o.id}>{o.title}</option>)}
          </select>
        </label>
        <div className="gg-field">
          <span className="gg-field-label">四象限</span>
          <div className="gg-chip-row">
            {QUADRANTS.map((q) => (
              <button key={q.key} type="button" className={`gg-chip gg-chip-${q.key} ${quadrant === q.key ? 'gg-chip-active' : ''}`} onClick={() => setQuadrant(q.key)}>{q.label}</button>
            ))}
          </div>
        </div>
        <div className="gg-field">
          <span className="gg-field-label">优先级</span>
          <div className="gg-chip-row">
            <button type="button" className={`gg-chip ${priority === 'low' ? 'gg-chip-active' : ''}`} onClick={() => setPriority('low')}>低</button>
            <button type="button" className={`gg-chip ${priority === 'med' ? 'gg-chip-active' : ''}`} onClick={() => setPriority('med')}>中</button>
            <button type="button" className={`gg-chip ${priority === 'high' ? 'gg-chip-active' : ''}`} onClick={() => setPriority('high')}>高</button>
            <button type="button" className={`gg-chip ${priority === null ? 'gg-chip-active' : ''}`} onClick={() => setPriority(null)}>无</button>
          </div>
        </div>
        <div className="gg-field-row">
          <label className="gg-field">
            <span className="gg-field-label">截止日期</span>
            <input type="date" className="gg-input" value={due} onChange={(e) => setDue(e.target.value)} />
          </label>
          <label className="gg-field">
            <span className="gg-field-label">预估时长 (分钟)</span>
            <input type="number" className="gg-input" min="5" step="5" value={estimate} onChange={(e) => setEstimate(e.target.value === '' ? '' : Number(e.target.value))} />
          </label>
        </div>
      </div>
      <div className="gg-modal-foot">
        <button type="button" className="gg-btn" onClick={onCancel}>取消</button>
        <button type="button" className="gg-btn gg-btn-primary" disabled={!title.trim()} onClick={onSubmit}>添加</button>
      </div>
    </>
  )
}

function ViewMode({ task, okr, subs, onClose, onEdit, onToggle }: { task: Task; okr: any; subs: any[]; onClose: () => void; onEdit: () => void; onToggle: () => void }) {
  return (
    <>
      <div className="gg-modal-head">
        <div className="gg-task-pill-row">
          <span className="gg-task-pill">{task.quadrant ? `紧急${task.quadrant === 'q1' || task.quadrant === 'q3' ? '' : '不'}重要` : '任务'}</span>
          <span className={`gg-task-status ${task.done ? 'gg-task-status-done' : ''}`}>
            <span className="gg-task-dot" /> {task.done ? '已完成' : '进行中'}
          </span>
        </div>
        <button type="button" className="gg-modal-close" onClick={onClose} aria-label="关闭">×</button>
      </div>
      <div className="gg-modal-body">
        <div className="gg-task-title-lg">{task.title}</div>
        <div className="gg-task-meta-list">
          {okr && (
            <div className="gg-task-meta-row">
              <div className="gg-task-meta-label">所属 OKR</div>
              <div className="gg-task-meta-val">
                <span className={`gg-okr-dot-lg gg-okr-dot-${okr.category}`}>{CAT_LETTER[okr.category as OkrCategory]}</span>
                {okr.title}
              </div>
            </div>
          )}
          {task.due_date && (
            <div className="gg-task-meta-row">
              <div className="gg-task-meta-label">截止日期</div>
              <div className="gg-task-meta-val">{task.due_date}</div>
            </div>
          )}
          {task.estimate_min && (
            <div className="gg-task-meta-row">
              <div className="gg-task-meta-label">预计耗时</div>
              <div className="gg-task-meta-val">{task.estimate_min} 分钟</div>
            </div>
          )}
          <div className="gg-task-meta-row">
            <div className="gg-task-meta-label">创建于</div>
            <div className="gg-task-meta-val">{task.created_at?.slice(0, 10)}</div>
          </div>
        </div>
        {task.notes && <div className="gg-task-desc">{task.notes}</div>}
        {subs.length > 0 && (
          <div className="gg-task-children">
            <div className="gg-task-children-head">子任务 <span className="gg-task-children-count">{subs.length} 项</span></div>
            {subs.map((s) => (
              <div key={s.id} className="gg-sub-row" onClick={() => useOkrStore.getState().toggleSub(s.id)}>
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
      <div className="gg-modal-foot">
        <button type="button" className="gg-btn gg-btn-danger" onClick={() => { if (confirm('删除此任务？')) { /* TODO: deleteTask(task.id); */ onClose() } }}>删除</button>
        <div style={{ flex: 1 }} />
        <button type="button" className="gg-btn" onClick={onToggle}>{task.done ? '标记未完成' : '标记完成'}</button>
        <button type="button" className="gg-btn gg-btn-primary" onClick={onEdit}>编辑</button>
      </div>
    </>
  )
}

function EditMode({ task, onClose, onCancel }: { task: Task; onClose: () => void; onCancel: () => void }) {
  return (
    <>
      <div className="gg-modal-head">
        <h3 className="gg-modal-title">编辑任务</h3>
        <button type="button" className="gg-modal-close" onClick={onClose} aria-label="关闭">×</button>
      </div>
      <div className="gg-modal-body gg-form">
        <div className="gg-task-title-edit-placeholder">编辑模式（保存到 Supabase 暂未接）</div>
        <div className="gg-field">
          <span className="gg-field-label">任务名称</span>
          <input type="text" className="gg-input" defaultValue={task.title} />
        </div>
        <div className="gg-field">
          <span className="gg-field-label">象限</span>
          <div className="gg-chip-row">
            {QUADRANTS.map((q) => (
              <button key={q.key} type="button" className={`gg-chip gg-chip-${q.key} ${task.quadrant === q.key ? 'gg-chip-active' : ''}`}>{q.label}</button>
            ))}
          </div>
        </div>
        <div className="gg-field-row">
          <div className="gg-field">
            <span className="gg-field-label">截止日期</span>
            <input type="date" className="gg-input" defaultValue={task.due_date ?? ''} />
          </div>
          <div className="gg-field">
            <span className="gg-field-label">预计耗时 (分钟)</span>
            <input type="number" className="gg-input" defaultValue={task.estimate_min ?? ''} />
          </div>
        </div>
      </div>
      <div className="gg-modal-foot">
        <button type="button" className="gg-btn" onClick={onCancel}>取消</button>
        <button type="button" className="gg-btn gg-btn-primary" onClick={onClose}>保存</button>
      </div>
    </>
  )
}
