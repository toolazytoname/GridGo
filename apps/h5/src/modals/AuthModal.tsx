import { useState } from 'react'
import { Modal } from './Modal'
import { useUIStore } from '../store/ui'
import { signInWithPassword, signUpWithPassword, signInWithGithub } from '@gridgo/api'

type Mode = 'login' | 'register'

export function AuthModal() {
  const open = useUIStore((s) => s.authOpen)
  const close = useUIStore((s) => s.closeAuth)
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  const reset = () => {
    setEmail(''); setPassword(''); setPassword2(''); setMsg(null)
  }

  const switchMode = (m: Mode) => { setMode(m); reset() }

  const handleEmail = async () => {
    setMsg(null)
    const e = email.trim()
    if (!e) { setMsg({ kind: 'err', text: '请输入邮箱' }); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) { setMsg({ kind: 'err', text: '邮箱格式不对' }); return }
    if (password.length < 6) { setMsg({ kind: 'err', text: '密码至少 6 位' }); return }
    if (mode === 'register' && password !== password2) {
      setMsg({ kind: 'err', text: '两次密码不一致' })
      return
    }
    setBusy(true)
    const fn = mode === 'login' ? signInWithPassword : signUpWithPassword
    const { error } = await fn(e, password)
    setBusy(false)
    if (error) {
      const msg = error.message.includes('Invalid login') ? '邮箱或密码错误' : error.message
      setMsg({ kind: 'err', text: msg })
    } else if (mode === 'register') {
      // 注册成功：autoconfirm 关了所以不会自动登录，提示去邮箱验证
      setMsg({ kind: 'ok', text: '注册成功！请去邮箱点链接完成验证，验证后再登录。' })
      setPassword(''); setPassword2('')
    } else {
      setMsg({ kind: 'ok', text: '登录成功' })
      setTimeout(() => close(), 400)
    }
  }

  const handleGithub = async () => {
    setBusy(true)
    const { error } = await signInWithGithub()
    setBusy(false)
    if (error) setMsg({ kind: 'err', text: error.message })
  }

  return (
    <Modal open={open} onClose={close}>
      <div className="gg-modal-head">
        <h3 className="gg-modal-title">{mode === 'login' ? '登录' : '注册'}</h3>
        <button type="button" className="gg-modal-close" onClick={close} aria-label="关闭">×</button>
      </div>
      <div className="gg-modal-body">
        <div className="gg-subtabs gg-subtabs-full" role="tablist">
          <button type="button" className={`gg-subtab ${mode === 'login' ? 'gg-subtab-active' : ''}`} onClick={() => switchMode('login')}>登录</button>
          <button type="button" className={`gg-subtab ${mode === 'register' ? 'gg-subtab-active' : ''}`} onClick={() => switchMode('register')}>注册</button>
        </div>

        <div className="gg-form">
          <div className="gg-field">
            <span className="gg-field-label">邮箱</span>
            <input
              type="email"
              className="gg-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="gg-field">
            <span className="gg-field-label">密码</span>
            <div className="gg-pwd-row">
              <input
                type={showPwd ? 'text' : 'password'}
                className="gg-input"
                placeholder="至少 6 位"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                onKeyDown={(e) => { if (e.key === 'Enter') handleEmail() }}
              />
              <button type="button" className="gg-pwd-toggle" onClick={() => setShowPwd(!showPwd)} title={showPwd ? '隐藏' : '显示'}>
                {showPwd ? '🙈' : '👁'}
              </button>
            </div>
          </div>
          {mode === 'register' && (
            <div className="gg-field">
              <span className="gg-field-label">确认密码</span>
              <input
                type={showPwd ? 'text' : 'password'}
                className="gg-input"
                placeholder="再输一次"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                autoComplete="new-password"
                onKeyDown={(e) => { if (e.key === 'Enter') handleEmail() }}
              />
            </div>
          )}
          <button type="button" className="gg-btn gg-btn-primary gg-btn-block" onClick={handleEmail} disabled={busy}>
            {busy ? '...' : mode === 'login' ? '登录' : '注册'}
          </button>
          {msg && (
            <div className={`gg-msg gg-msg-${msg.kind}`}>
              {msg.text}
              {mode === 'register' && msg.kind === 'ok' && (
                <div style={{ marginTop: 8, fontSize: 11, opacity: 0.85 }}>
                  没收到邮件？检查垃圾箱，或 <button type="button" onClick={() => switchMode('login')} style={{ background: 'none', border: 0, color: 'var(--gg-accent)', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>直接登录</button>
                </div>
              )}
            </div>
          )}
          <div className="gg-auth-divider"><span>或</span></div>
          <button type="button" className="gg-btn gg-btn-gh gg-btn-block" onClick={handleGithub} disabled={busy}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12c0 5.3 3.4 9.8 8.2 11.4.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.8.1-.8.1-.8 1.3.1 1.9 1.3 1.9 1.3 1.1 1.9 2.9 1.4 3.6 1 .1-.8.4-1.4.8-1.7-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.3-3.2-.1-.3-.6-1.5.1-3.2 0 0 1-.3 3.3 1.2.9-.3 2-.4 3-.4s2 .1 3 .4c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.2 2.9.1 3.2.8.8 1.3 1.9 1.3 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6C20.6 21.8 24 17.3 24 12c0-6.6-5.4-12-12-12z"/></svg>
            使用 GitHub 登录
          </button>
        </div>
      </div>
    </Modal>
  )
}
