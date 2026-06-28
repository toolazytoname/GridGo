// pages/auth/auth.js - 登录/注册
import * as api from '../../utils/supabase.js'

Page({
  data: {
    mode: 'login',
    email: '',
    password: '',
    password2: '',
    busy: false,
    msg: null,
  },

  onModeTap(e) {
    this.setData({ mode: e.currentTarget.dataset.mode, msg: null, password: '', password2: '' })
  },

  onInput(e) {
    this.setData({ [e.currentTarget.dataset.field]: e.detail.value })
  },

  async onSubmit() {
    const { mode, email, password, password2 } = this.data
    if (!email || !password) {
      this.setData({ msg: { kind: 'err', text: '请输入邮箱和密码' } }); return
    }
    if (password.length < 6) {
      this.setData({ msg: { kind: 'err', text: '密码至少 6 位' } }); return
    }
    if (mode === 'register' && password !== password2) {
      this.setData({ msg: { kind: 'err', text: '两次密码不一致' } }); return
    }
    this.setData({ busy: true, msg: null })
    try {
      const data = mode === 'login' ? await api.signIn(email, password) : await api.signUp(email, password)
      if (data.error || data.msg) {
        this.setData({ msg: { kind: 'err', text: (data.error?.message || data.msg || '失败') } })
        return
      }
      if (mode === 'register') {
        this.setData({ msg: { kind: 'ok', text: '注册成功！请去邮箱点链接完成验证' } })
        return
      }
      // 登录成功
      wx.setStorageSync('gridgo-session', data)
      wx.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 600)
    } catch (e) {
      this.setData({ msg: { kind: 'err', text: e.message || JSON.stringify(e) } })
    } finally {
      this.setData({ busy: false })
    }
  },
})
