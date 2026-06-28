// pages/calendar/calendar.js
import * as api from '../../utils/supabase.js'

Page({
  data: {
    sub: 'month',
    cursor: { year: 2026, month: 5 },  // 0-indexed
    grid: [],
    monthLabel: '',
    dows: ['日', '一', '二', '三', '四', '五', '六'],
    rawTasks: [],
    isAuthed: false,
    isDemo: false,
  },

  onShow() {
    const now = new Date()
    this.setData({ cursor: { year: now.getFullYear(), month: now.getMonth() } })
    const session = wx.getStorageSync('gridgo-session')
    if (session?.access_token) {
      this.setData({ isAuthed: true })
      this.loadData(session.access_token)
    } else {
      this.loadDemo()
    }
  },

  loadDemo() {
    const today = new Date()
    const fmt = (d) => d.toISOString().slice(0, 10)
    const sample = [
      { id: 's1', title: 'Q3 OKR 评审材料', due_date: fmt(today), quadrant: 'q1' },
      { id: 's2', title: '客户紧急需求修复', due_date: fmt(today), quadrant: 'q1' },
      { id: 's3', title: '核心功能重构联调', due_date: fmt(new Date(today.getTime() + 2*86400000)), quadrant: 'q1' },
      { id: 's4', title: '每周跑步 3 次', due_date: fmt(new Date(today.getTime() + 3*86400000)), quadrant: 'q2' },
      { id: 's5', title: 'TS 进阶章节阅读', due_date: fmt(new Date(today.getTime() + 4*86400000)), quadrant: 'q2' },
    ]
    this.rebuild(sample, true)
  },

  async loadData(token) {
    try {
      const tasks = await api.listTasks(token)
      this.rebuild(tasks, false)
    } catch (e) { console.error(e) }
  },

  rebuild(tasks, isDemo) {
    const { year, month } = this.data.cursor
    this.setData({ monthLabel: `${year} 年 ${month + 1} 月` })
    const first = new Date(year, month, 1)
    const startWeekday = first.getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const prevMonthDays = new Date(year, month, 0).getDate()
    const cells = []
    // 上月
    for (let i = startWeekday - 1; i >= 0; i--) {
      cells.push({ day: prevMonthDays - i, out: true, date: null })
    }
    // 当月
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d)
      const dateStr = date.toISOString().slice(0, 10)
      const tasksOnDay = tasks.filter((t) => t.due_date === dateStr)
      cells.push({ day: d, out: false, date: dateStr, events: tasksOnDay.slice(0, 3) })
    }
    // 下月（补到 42 格）
    let nextDay = 1
    while (cells.length < 42) {
      cells.push({ day: nextDay++, out: true, date: null })
    }
    const today = new Date().toISOString().slice(0, 10)
    cells.forEach((c) => { if (c.date === today) c.today = true })
    this.setData({ grid: cells, rawTasks: tasks, isDemo })
  },

  onSubTap(e) {
    this.setData({ sub: e.currentTarget.dataset.sub })
  },

  onPrev() {
    let { year, month } = this.data.cursor
    month--
    if (month < 0) { month = 11; year-- }
    this.setData({ cursor: { year, month } })
    this.rebuild(this.data.rawTasks, this.data.isDemo)
  },

  onNext() {
    let { year, month } = this.data.cursor
    month++
    if (month > 11) { month = 0; year++ }
    this.setData({ cursor: { year, month } })
    this.rebuild(this.data.rawTasks, this.data.isDemo)
  },
})
