// pages/gantt/gantt.js
import * as api from '../../utils/supabase.js'

Page({
  data: {
    sub: 'quarter',
    monthLabels: [],
    pcts: [0, 33, 66],
    rows: [],          // { title, okr, bars: [{left, width, label, q}] }
    summary: { okr: 0, doing: 0, urgent: 0 },
    isAuthed: false,
    isDemo: false,
  },

  onShow() {
    const session = wx.getStorageSync('gridgo-session')
    if (session?.access_token) {
      this.setData({ isAuthed: true })
      this.loadData(session.access_token)
    } else {
      this.loadDemo()
    }
  },

  loadDemo() {
    const now = new Date()
    const months = [now.getMonth() + 1, now.getMonth() + 2, now.getMonth() + 3]
    const sample = [
      { id: 'o1', title: '产品增长 · Q3 月活提升 30%', category: 'product', tasks: [
        { id: 's1', title: 'Q3 OKR 评审材料', due_date: 0 },
        { id: 's2', title: '核心功能重构联调', due_date: 14 },
        { id: 's3', title: '用户访谈 3 位', due_date: 50 },
      ] },
      { id: 'o2', title: '健康管理 · 养成运动习惯', category: 'health', tasks: [
        { id: 's4', title: '每周跑步 3 次', due_date: 5 },
      ] },
    ]
    this.rebuild(months, sample, true)
  },

  async loadData(token) {
    try {
      const tasks = await api.listTasks(token)
      const okrs = await api.listOkrs(token)
      const okrMap = {}
      okrs.forEach((o) => { okrMap[o.id] = o })
      const grouped = okrs.map((o) => ({ ...o, tasks: tasks.filter((t) => t.okr_id === o.id) }))
      const now = new Date()
      const months = [now.getMonth() + 1, now.getMonth() + 2, now.getMonth() + 3]
      this.rebuild(months, grouped, false)
    } catch (e) { console.error(e) }
  },

  rebuild(months, okrs, isDemo) {
    const totalDays = 90
    const todayPct = Math.min(95, Math.max(0, (new Date().getDate() / 30) * 33))
    const rows = okrs.map((o) => {
      const bars = (o.tasks || []).map((t) => {
        const d = t.due_date ? new Date(t.due_date) : new Date()
        const dayOfYear = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000)
        const left = Math.min(95, (dayOfYear / 365) * 100)
        return { ...t, left, width: 8 }
      })
      return { ...o, bars }
    })
    const summary = {
      okr: okrs.length,
      doing: okrs.reduce((s, o) => s + (o.tasks || []).filter((t) => !t.done).length, 0),
      urgent: okrs.reduce((s, o) => s + (o.tasks || []).filter((t) => t.due_date && new Date(t.due_date) - new Date() < 7*86400000).length, 0),
    }
    this.setData({ monthLabels: months, rows, summary, isDemo })
  },

  onSubTap(e) {
    this.setData({ sub: e.currentTarget.dataset.sub })
  },
})
