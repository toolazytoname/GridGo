import { useState } from 'react'
import { Modal } from './Modal'
import { useUIStore } from '../store/ui'
import { useTasksStore, okrColorClass } from '../store/tasks'
import * as api from '@gridgo/api'
import type { OkrCategory } from '@gridgo/types'

const CATEGORIES: { key: OkrCategory; label: string; cls: string }[] = [
  { key: 'product', label: '产品增长 P', cls: 'o1' },
  { key: 'health', label: '健康管理 H', cls: 'o2' },
  { key: 'skill', label: '技能提升 S', cls: 'o3' },
  { key: 'finance', label: '财务健康 $', cls: 'o4' },
]

export function OkrManager() {
  const open = useUIStore((s) => s.okrMgrOpen)
  const close = useUIStore((s) => s.closeOkrMgr)
  const okrs = useTasksStore((s) => s.okrs)
  const tasks = useTasksStore((s) => s.tasks)
  const reload = useTasksStore((s) => s.reload)
  const [newTitle, setNewTitle] = useState('')
  const [newCat, setNewCat] = useState<OkrCategory>('product')
  const [busy, setBusy] = useState(false)

  const handleAdd = async () => {
    if (!newTitle.trim() || busy) return
    setBusy(true)
    try {
      const created = await api.createOkr({ title: newTitle.trim(), category: newCat, quarter: '2026-Q3', progress: 0 })
      if (created) {
        setNewTitle('')
        await reload()
      } else {
        alert('添加 OKR 失败')
      }
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除？此 OKR 下的任务也会失联。')) return
    const ok = await api.deleteOkr(id)
    if (ok) await reload()
    else alert('删除失败')
  }

  return (
    <Modal open={open} onClose={close} wide>
      <div className="gg-modal-head">
        <h3 className="gg-modal-title">OKR 管理</h3>
        <button type="button" className="gg-modal-close" onClick={close} aria-label="关闭">×</button>
      </div>
      <div className="gg-modal-body">
        {okrs.map((o) => {
          const krs = tasks.filter((t) => t.okr_id === o.id)
          return (
            <div key={o.id} className="gg-okr-row">
              <div className="gg-okr-row-head">
                <span className={`gg-okr-dot gg-okr-dot-lg ${okrColorClass[o.category as OkrCategory]}`}>{(o.title || '?').charAt(0)}</span>
                <span className="gg-okr-row-title">{o.title}</span>
                <button type="button" className="gg-okr-act-btn danger" onClick={() => handleDelete(o.id)} title="删除">
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 4h8M5 4V2h4v2M4 4l1 8h4l1-8" />
                  </svg>
                </button>
              </div>
              <div className="gg-okr-row-meta">{krs.length} 个关键结果 / 任务</div>
            </div>
          )
        })}

        <div className="gg-okr-add">
          <div className="gg-okr-add-title">+ 添加新 OKR</div>
          <input
            type="text"
            className="gg-input"
            placeholder="例如：写作能力 · 月更 4 篇"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }}
          />
          <div className="gg-okr-cat-row">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                type="button"
                className={`gg-okr-cat-pill ${newCat === c.key ? 'gg-okr-cat-pill-active' : ''}`}
                onClick={() => setNewCat(c.key)}
              >
                <span className={`gg-okr-dot gg-okr-dot-${c.cls}`}>{(c.label.match(/[PH\$S]$/)?.[0]) ?? c.key[0].toUpperCase()}</span>
                {c.label}
              </button>
            ))}
          </div>
          <button type="button" className="gg-btn gg-btn-primary" disabled={!newTitle.trim() || busy} onClick={handleAdd}>
            {busy ? '...' : '添加 OKR'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
