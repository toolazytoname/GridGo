import { useState } from 'react'
import { Modal } from './Modal'

type ShareKind = 'calendar' | 'gantt' | 'profile'

const SHARE_KINDS: { key: ShareKind; label: string; sub: string }[] = [
  { key: 'calendar', label: '日历', sub: '展示月度任务和重要日期' },
  { key: 'gantt', label: '甘特图', sub: '展示季度规划和进度' },
  { key: 'profile', label: '个人主页', sub: '展示个人 OKR 和成就' },
]

interface ShareModalProps {
  open: boolean
  onClose: () => void
  kind?: ShareKind
}

export function ShareModal({ open, onClose, kind: initialKind }: ShareModalProps) {
  const [kind, setKind] = useState<ShareKind>(initialKind ?? 'calendar')
  const [copied, setCopied] = useState(false)
  const fakeToken = Math.random().toString(36).slice(2, 14)
  const url = `https://gridgo.weichao.studio/?shared=${kind}&t=${fakeToken}`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="gg-modal-head">
        <h3 className="gg-modal-title">分享我的进度</h3>
        <button type="button" className="gg-modal-close" onClick={onClose} aria-label="关闭">×</button>
      </div>
      <div className="gg-modal-body">
        <div className="gg-form">
          <div className="gg-field">
            <span className="gg-field-label">选择要分享的内容</span>
            <div className="gg-chip-row">
              {SHARE_KINDS.map((k) => (
                <button
                  key={k.key}
                  type="button"
                  className={`gg-chip ${kind === k.key ? 'gg-chip-active' : ''}`}
                  onClick={() => setKind(k.key)}
                >
                  {k.label}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 11, color: 'var(--gg-muted)', marginTop: 4 }}>
              {SHARE_KINDS.find((k) => k.key === kind)?.sub}
            </div>
          </div>

          <div className="gg-share-panel-preview">
            <div className="gg-share-panel-preview-hint">只读链接 · 任何持有链接的人可查看</div>
            <div style={{ fontSize: 12, color: 'var(--gg-fg)', marginTop: 6, wordBreak: 'break-all' }}>{url}</div>
          </div>
        </div>
      </div>
      <div className="gg-modal-foot">
        <button type="button" className="gg-btn" onClick={onClose}>取消</button>
        <button type="button" className="gg-btn gg-btn-primary" onClick={copy}>
          {copied ? '已复制 ✓' : '复制链接'}
        </button>
      </div>
    </Modal>
  )
}
