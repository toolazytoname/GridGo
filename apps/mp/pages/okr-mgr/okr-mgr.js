// pages/okr-mgr/okr-mgr.js
import * as api from '../../utils/supabase.js'

const CATEGORIES = [
  { key: 'product', label: '产品 P' },
  { key: 'health', label: '健康 H' },
  { key: 'skill', label: '技能 S' },
  { key: 'finance', label: '财务 $' },
]

Page({
  data: {
    okrs: [],
    newTitle: '',
    newCat: 'product',
    busy: false,
  },

  onShow() {
    this.load()
  },

  async load() {
    const session = wx.getStorageSync('gridgo-session')
    if (!session?.access_token) return
    try {
      const { data } = await api.listOkrs(session.access_token)
      this.setData({ okrs: data })
    } catch (e) { console.error(e) }
  },

  onTitleInput(e) {
    this.setData({ newTitle: e.detail.value })
  },

  onCatTap(e) {
    this.setData({ newCat: e.currentTarget.dataset.cat })
  },

  async onAdd() {
    const title = this.data.newTitle.trim()
    if (!title) return
    this.setData({ busy: true })
    const session = wx.getStorageSync('gridgo-session')
    try {
      await api.createOkr(session.access_token, { title, category: this.data.newCat, quarter: '2026-Q3', progress: 0, sort_order: Date.now() % 10000 })
      this.setData({ newTitle: '' })
      await this.load()
    } catch (e) {
      wx.showToast({ title: '添加失败: ' + e.message, icon: 'none' })
    } finally {
      this.setData({ busy: false })
    }
  },

  async onDelete(e) {
    const id = e.currentTarget.dataset.id
    const ok = await wx.showModal({ title: '确定删除？', content: '此 OKR 下的任务关联会失联' })
    if (!ok.confirm) return
    const session = wx.getStorageSync('gridgo-session')
    try {
      await api.deleteOkr(session.access_token, id)
      await this.load()
    } catch (e) {
      wx.showToast({ title: '删除失败', icon: 'none' })
    }
  },
})
