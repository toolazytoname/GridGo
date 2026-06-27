import { useState } from 'react'
import { Modal } from './Modal'
import { useUIStore } from '../store/ui'
import { useTasksStore, okrColorClass } from '../store/tasks'
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
  const [newTitle, setNewTitle] = useState('')
  const [newCat, setNewCat] = useState<OkrCategory>('product')

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
                <span className={`gg-okr-dot ${okrColorClass[o.category as OkrCategory]}`}>{o.title[0]}</span>
                <span className="gg-okr-row-title">{o.title}</span>
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
          />
          <div className="gg-okr-cat-row">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                type="button"
                className={`gg-okr-cat-pill ${newCat === c.key ? 'gg-okr-cat-pill-active' : ''}`}
                onClick={() => setNewCat(c.key)}
              >
                <span className={`gg-okr-dot ${c.cls}`}>{c.label.slice(-1)}</span>
                {c.label}
              </button>
            ))}
          </div>
          <button type="button" className="gg-btn gg-btn-primary" disabled={!newTitle.trim()}>
            添加 OKR
          </button>
        </div>
      </div>
    </Modal>
  )
}
