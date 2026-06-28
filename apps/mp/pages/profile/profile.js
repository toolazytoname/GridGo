// pages/profile/profile.js
import * as api from '../../utils/supabase.js'

Page({
  data: {
    user: null,
    isAuthed: false,
    isDemo: false,
    doneCount: 0,
  },

  onShow() {
    const session = wx.getStorageSync('gridgo-session')
    if (session?.access_token) {
      this.setData({ isAuthed: true, isDemo: false, user: session.user })
      this.loadData(session.access_token)
    } else {
      this.setData({ isAuthed: false, isDemo: true, user: { email: 'demo@gridgo.test', user_metadata: {} } })
    }
  },

  async loadData(token) {
    try {
      const tasks = await api.listTasks(token)
      this.setData({ doneCount: tasks.filter((t) => t.done).length })
    } catch (e) { console.error(e) }
  },

  onLogin() {
    wx.navigateTo({ url: '/pages/auth/auth' })
  },

  onSignOut() {
    wx.removeStorageSync('gridgo-session')
    this.setData({ isAuthed: false, isDemo: true, user: null })
    wx.showToast({ title: '已退出', icon: 'success' })
  },

  onEditProfile() {
    wx.showToast({ title: '编辑资料开发中', icon: 'none' })
  },

  onOpenOkr() {
    wx.navigateTo({ url: '/pages/okr-mgr/okr-mgr' })
  },
})
