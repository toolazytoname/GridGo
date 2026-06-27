import { useState } from 'react'
import { Modal } from './Modal'
import { useUIStore } from '../store/ui'
import { signInWithEmail, signInWithGithub } from '@gridgo/api'

type Mode = 'github' | 'email'

export function AuthModal() {
  const open = useUIStore((s) => s.authOpen)
  const close = useUIStore((s) => s.closeAuth)
  const [mode, setMode] = useState<Mode>('github')
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  const handleGithub = async () => {
    setBusy(true)
    const { error } = await signInWithGithub()
    setBusy(false)
    if (error) setMsg({ kind: 'err', text: error.message })
  }

  const handleEmail = async () => {
    if (!email.trim()) return
    setBusy(true)
    const { error } = await signInWithEmail(email.trim())
    setBusy(false)
    setMsg(error ? { kind: 'err', text: error.message } : { kind: 'ok', text: '魔法链接已发到你的邮箱' })
  }

  return (
    <Modal open={open} onClose={close}>
      <div className="gg-modal-head">
        <h3 className="gg-modal-title">登录 / 注册</h3>
        <button type="button" className="gg-modal-close" onClick={close} aria-label="关闭">×</button>
      </div>
      <div className="gg-modal-body">
        <div className="gg-subtabs gg-subtabs-full">
          <button type="button" className={`gg-subtab ${mode === 'github' ? 'gg-subtab-active' : ''}`} onClick={() => setMode('github')}>GitHub</button>
          <button type="button" className={`gg-subtab ${mode === 'email' ? 'gg-subtab-active' : ''}`} onClick={() => setMode('email')}>邮箱</button>
        </div>

        {mode === 'github' ? (
          <div className="gg-auth-pane">
            <p className="gg-auth-hint">用 GitHub 账号一键登录，资料自动填充。</p>
            <button type="button" className="gg-btn gg-btn-gh" onClick={handleGithub} disabled={busy}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12c0 5.3 3.4 9.8 8.2 11.4.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.8.1-.8.1-.8 1.3.1 1.9 1.3 1.9 1.3 1.1 1.9 2.9 1.4 3.6 1 .1-.8.4-1.4.8-1.7-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.3-3.2-.1-.3-.6-1.5.1-3.2 0 0 1-.3 3.3 1.2.9-.3 2-.4 3-.4s2 .1 3 .4c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.2 2.9.1 3.2.8.8 1.3 1.9 1.3 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6C20.6 21.8 24 17.3 24 12c0-6.6-5.4-12-12-12z"/></svg>
              使用 GitHub 登录
            </button>
          </div>
        ) : (
          <div className="gg-auth-pane">
            <p className="gg-auth-hint">输入邮箱，我们会发一个魔法链接给你。</p>
            <input
              type="email"
              className="gg-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="button" className="gg-btn gg-btn-primary" onClick={handleEmail} disabled={busy || !email.trim()}>
              发送链接
            </button>
          </div>
        )}

        {msg && <div className={`gg-msg gg-msg-${msg.kind}`}>{msg.text}</div>}
      </div>
    </Modal>
  )
}
