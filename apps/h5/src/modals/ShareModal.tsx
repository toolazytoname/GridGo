import { useState } from 'react'
import { Modal } from './Modal'

type ShareKind = 'calendar' | 'gantt' | 'profile'
type ShareTarget = 'wechat' | 'moments' | 'twitter' | 'email' | 'link'

const SHARE_KINDS: { key: ShareKind; label: string; sub: string }[] = [
  { key: 'calendar', label: '日历', sub: '展示月度任务和重要日期' },
  { key: 'gantt', label: '甘特图', sub: '展示季度规划和进度' },
  { key: 'profile', label: '个人主页', sub: '展示个人 OKR 和成就' },
]

const TARGETS: { key: ShareTarget; label: string; bg: string; svg: JSX.Element }[] = [
  {
    key: 'wechat',
    label: '微信',
    bg: '#07C160',
    svg: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
        <path d="M8.5 4C5 4 2.5 6.2 2.5 9c0 1.6.9 3 2.3 4l-.6 2.1 2.2-1.1c.6.15 1.3.25 2 .3" stroke="#07C160" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21.5 14.5c0-2.5-2.2-4.5-5-4.5s-5 2-5 4.5 2.2 4.5 5 4.5c.5 0 1-.05 1.5-.15L20 20l-.55-1.5c1.25-.9 2.05-2.2 2.05-4z" stroke="#07C160" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="5.5" cy="8.5" r=".7" fill="#07C160" />
        <circle cx="8" cy="8.5" r=".7" fill="#07C160" />
        <circle cx="14" cy="14" r=".7" fill="#07C160" />
        <circle cx="16.5" cy="14" r=".7" fill="#07C160" />
      </svg>
    ),
  },
  {
    key: 'moments',
    label: '朋友圈',
    bg: '#1296DB',
    svg: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
        <rect x="2.5" y="6" width="19" height="14" rx="2.5" stroke="#1296DB" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M7 6l1.5-2h7L17 6" stroke="#1296DB" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="13" r="3.5" stroke="#1296DB" strokeWidth="1.7" />
        <circle cx="17.5" cy="9" r=".8" fill="#1296DB" />
      </svg>
    ),
  },
  {
    key: 'twitter',
    label: 'Twitter',
    bg: '#1DA1F2',
    svg: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#1DA1F2" strokeWidth="1.5">
        <path d="M22 5.8c-.7.3-1.5.5-2.4.6.9-.5 1.5-1.3 1.8-2.3-.8.5-1.7.8-2.6 1A4.1 4.1 0 0011.8 9c0 .3 0 .6.1.9C8.3 9.7 5.1 8 3 5.5c-.4.6-.6 1.3-.6 2.2 0 1.5.7 2.7 1.8 3.5-.7 0-1.3-.2-1.8-.5v.1c0 2 1.4 3.7 3.3 4-.4.1-.7.2-1.1.2-.3 0-.5 0-.8-.1.5 1.7 2 2.9 3.8 2.9A8.2 8.2 0 012 19.5c1.8 1.1 3.9 1.8 6.1 1.8 7.3 0 11.3-6 11.3-11.3v-.5c.8-.6 1.5-1.3 2-2.1z" />
      </svg>
    ),
  },
  {
    key: 'email',
    label: '邮件',
    bg: '#4A5560',
    svg: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
        <rect x="2.5" y="5" width="19" height="14" rx="2.5" stroke="#4A5560" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M3 7l9 6.5L21 7" stroke="#4A5560" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

interface ShareModalProps {
  open: boolean
  onClose: () => void
  kind?: ShareKind
}

export function ShareModal({ open, onClose, kind: initialKind }: ShareModalProps) {
  const [kind, setKind] = useState<ShareKind>(initialKind ?? 'calendar')
  const [hideUndone, setHideUndone] = useState(false)
  const [showDetails, setShowDetails] = useState(true)
  const [showOkr, setShowOkr] = useState(true)
  const [copied, setCopied] = useState<ShareTarget | null>(null)

  const fakeToken = Math.random().toString(36).slice(2, 14)
  const url = `https://gridgo.weichao.studio/?shared=${kind}&t=${fakeToken}`
  const previewTitle = kind === 'calendar' ? '林小白 的 7 月进度' : kind === 'gantt' ? '林小白 的 Q3 规划' : '林小白 的个人主页'

  const copy = async (target: ShareTarget = 'link') => {
    try {
      await navigator.clipboard.writeText(url)
    } catch {}
    setCopied(target)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="gg-modal-head">
        <h3 className="gg-modal-title">分享{initialKind === 'profile' ? '我的主页' : initialKind === 'gantt' ? '甘特图' : '日历'}</h3>
        <button type="button" className="gg-modal-close" onClick={onClose} aria-label="关闭">×</button>
      </div>
      <div className="gg-modal-body">
        {/* 内容选择 */}
        <div className="gg-field">
          <span className="gg-field-label">选择要分享的内容</span>
          <div className="gg-chip-row">
            {SHARE_KINDS.map((k) => (
              <button key={k.key} type="button" className={`gg-chip ${kind === k.key ? 'gg-chip-active' : ''}`} onClick={() => setKind(k.key)}>
                {k.label}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 11, color: 'var(--gg-muted)', marginTop: 4 }}>
            {SHARE_KINDS.find((k) => k.key === kind)?.sub}
          </div>
        </div>

        {/* 预览卡 */}
        <div className="gg-share-cover">
          <div className="gg-share-cover-eyebrow">
            <svg viewBox="0 0 12 12" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="3" width="8" height="7" rx="1" />
              <path d="M4 2v2M8 2v2" />
            </svg>
            <span>{SHARE_KINDS.find((k) => k.key === kind)?.label}视图</span>
          </div>
          <div className="gg-share-cover-title">{previewTitle}</div>
          <div className="gg-share-cover-meta">
            <svg viewBox="0 0 12 12" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="6" cy="6" r="4.5" />
              <path d="M6 3.5V6l1.5 1" />
            </svg>
            <span>获取链接的人可查看只读视图</span>
          </div>
        </div>

        {/* 链接 */}
        <div className="gg-share-link-row">
          <input className="gg-share-link-input" value={url} readOnly />
          <button type="button" className="gg-share-link-copy" onClick={() => copy('link')}>
            {copied === 'link' ? '已复制' : '复制链接'}
          </button>
        </div>

        {/* 分享到 */}
        <div className="gg-share-section-label">分享到</div>
        <div className="gg-share-grid">
          {TARGETS.map((t) => (
            <div key={t.key} className="gg-share-target" onClick={() => copy(t.key)}>
              <div className="gg-share-target-icon">{t.svg}</div>
              <div className="gg-share-target-label">{t.label}</div>
            </div>
          ))}
        </div>

        {/* 隐私设置 */}
        <div className="gg-share-section-label">隐私设置</div>
        <div className="gg-share-visibility">
          <div className="gg-share-vis-row">
            <div>
              <div className="gg-share-vis-label">隐藏未完成任务</div>
              <div className="gg-share-vis-sub">只展示已完成的项</div>
            </div>
            <div className={`gg-switch ${hideUndone ? 'gg-switch-on' : ''}`} role="switch" aria-checked={hideUndone} onClick={() => setHideUndone(!hideUndone)} />
          </div>
          <div className="gg-share-vis-row">
            <div>
              <div className="gg-share-vis-label">显示任务详情</div>
              <div className="gg-share-vis-sub">包含描述和子任务</div>
            </div>
            <div className={`gg-switch ${showDetails ? 'gg-switch-on' : ''}`} role="switch" aria-checked={showDetails} onClick={() => setShowDetails(!showDetails)} />
          </div>
          <div className="gg-share-vis-row">
            <div>
              <div className="gg-share-vis-label">显示 OKR 标签</div>
              <div className="gg-share-vis-sub">展示任务所属目标</div>
            </div>
            <div className={`gg-switch ${showOkr ? 'gg-switch-on' : ''}`} role="switch" aria-checked={showOkr} onClick={() => setShowOkr(!showOkr)} />
          </div>
        </div>
      </div>
    </Modal>
  )
}
