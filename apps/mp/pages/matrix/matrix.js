// pages/matrix/matrix.js
import * as api from '../../utils/supabase.js'

const QUADRANTS = [
  { key: 'q1', label: '紧急 × 重要' },
  { key: 'q2', label: '重要 × 不紧急' },
  { key: 'q3', label: '紧急 × 不重要' },
  { key: 'q4', label: '都不紧急 / 不重要' },
]

Page({
  data: {
    sub: 'all',
    quadrants: QUADRANTS.map((q) => ({ ...q, tasks: [], count: 0 })),
    rawTasks: [],
    isAuthed: false,
    isDemo: false,
  },

  onShow() {
    const session = wx.getStorageSync('gridgo-session')
    if (session?.access_token) {
      this.setData({ isAuthed: true })
      this.loadData(session.access_token)
    } else {
      this.setData({ isAuthed: false })
      this.loadDemo()
    }
  },

  onPullDownRefresh() {
    if (this.data.isAuthed) {
      const session = wx.getStorageSync('gridgo-session')
      this.loadData(session.access_token)
    } else {
      this.loadDemo()
    }
    wx.stopPullDownRefresh()
  },

  loadDemo() {
    const today = new Date()
    const fmt = (d) => d.toISOString().slice(0, 10)
    const week = new Date(today.getTime() + 5 * 86400000)
    const sample = [
      { id: 's1', title: 'Q3 OKR 评审材料', quadrant: 'q1', due_date: fmt(today), estimate_min: 120, okr_id: 'o1', done: false, okrTitle: '产品增长' },
      { id: 's2', title: '核心功能重构联调', quadrant: 'q1', due_date: fmt(week), estimate_min: 480, okr_id: 'o1', done: false, okrTitle: '产品增长' },
      { id: 's3', title: '客户紧急需求修复', quadrant: 'q1', due_date: fmt(today), estimate_min: 120, okr_id: '', done: false, okrTitle: '' },
      { id: 's4', title: '每周跑步 3 次', quadrant: 'q2', due_date: fmt(week), estimate_min: 30, okr_id: 'o2', done: false, okrTitle: '健康管理' },
      { id: 's5', title: 'TS 进阶章节阅读', quadrant: 'q2', due_date: fmt(week), estimate_min: 60, okr_id: 'o3', done: false, okrTitle: '技能提升' },
      { id: 's6', title: '处理积压邮件', quadrant: 'q3', estimate_min: 30, okr_id: '', done: false, okrTitle: '' },
      { id: 's7', title: '整理浏览器收藏夹', quadrant: 'q4', estimate_min: 60, okr_id: '', done: false, okrTitle: '' },
    ]
    this.rebuild(sample, true)
  },

  async loadData(token) {
    try {
      const tasks = await api.listTasks(token)
      const okrs = await api.listOkrs(token)
      const okrMap = {}
      okrs.forEach((o) => { okrMap[o.id] = o.title })
      const merged = tasks.map((t) => ({ ...t, okrTitle: okrMap[t.okr_id] || '' }))
      this.rebuild(merged, false)
    } catch (e) {
      console.error('load error', e)
    }
  },

  rebuild(tasks, isDemo) {
    const quadrants = QUADRANTS.map((q) => {
      const items = tasks.filter((t) => t.quadrant === q.key)
      return { ...q, count: items.length, tasks: items }
    })
    this.setData({ quadrants, isDemo, rawTasks: tasks })
  },

  onSubTap(e) {
    this.setData({ sub: e.currentTarget.dataset.sub })
  },

  async onToggle(e) {
    const id = e.currentTarget.dataset.id
    const task = this.data.rawTasks.find((t) => t.id === id)
    if (!task) return
    const next = !task.done
    // 乐观更新
    const rawTasks = this.data.rawTasks.map((t) => t.id === id ? { ...t, done: next } : t)
    this.rebuild(rawTasks, this.data.isDemo)
    if (this.data.isAuthed) {
      const session = wx.getStorageSync('gridgo-session')
      try { await api.toggleTask(session.access_token, id, next) }
      catch (e) { console.error(e) }
    }
  },

  onAddTask() {
    wx.showToast({ title: '添加任务开发中', icon: 'none' })
  },
})
