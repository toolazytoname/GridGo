// pages/list/list.js
import * as api from '../../utils/supabase.js'

Page({
  data: {
    sub: 'all',
    okrs: [],
    expandedOkrs: {},
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
      this.loadDemo()
    }
  },

  loadDemo() {
    const sample = {
      okrs: [
        { id: 'o1', title: '产品增长 · Q3 月活提升 30%', category: 'product', progress: 0.67 },
        { id: 'o2', title: '健康管理 · 养成运动习惯', category: 'health', progress: 0.45 },
        { id: 'o3', title: '技能提升 · TS 进阶', category: 'skill', progress: 0.78 },
      ],
      tasks: [
        { id: 's1', title: '完成核心功能重构', okr_id: 'o1', quadrant: 'q1', done: false },
        { id: 's2', title: '编写技术方案文档', okr_id: 'o1', done: false },
        { id: 's3', title: '上线 A/B 测试框架', okr_id: 'o1', quadrant: 'q1', done: false },
        { id: 's4', title: '每周跑步 3 次', okr_id: 'o2', quadrant: 'q2', done: false },
        { id: 's5', title: '每日饮水 8 杯', okr_id: 'o2', done: false },
        { id: 's6', title: '22:30 前入睡', okr_id: 'o2', done: false },
        { id: 's7', title: '完成类型基础课程', okr_id: 'o3', done: true },
      ],
    }
    this.rebuild(sample.okrs, sample.tasks, true)
  },

  async loadData(token) {
    try {
      const tasks = await api.listTasks(token)
      const okrs = await api.listOkrs(token)
      this.rebuild(okrs, tasks, false)
    } catch (e) { console.error(e) }
  },

  rebuild(okrs, tasks, isDemo) {
    const expandedOkrs = {}
    okrs.forEach((o) => { expandedOkrs[o.id] = true })
    this.setData({ okrs, rawTasks: tasks, expandedOkrs, isDemo })
  },

  onSubTap(e) {
    this.setData({ sub: e.currentTarget.dataset.sub })
  },

  onToggleOkr(e) {
    const id = e.currentTarget.dataset.id
    const expandedOkrs = { ...this.data.expandedOkrs }
    expandedOkrs[id] = !expandedOkrs[id]
    this.setData({ expandedOkrs })
  },

  onToggleTask(e) {
    const id = e.currentTarget.dataset.id
    if (this.data.isDemo) return
    const session = wx.getStorageSync('gridgo-session')
    if (!session?.access_token) return
    const task = this.data.rawTasks.find((t) => t.id === id)
    if (!task) return
    api.toggleTask(session.access_token, id, !task.done).then(() => this.loadData(session.access_token))
  },
})
