// 任务 store — 真实数据走 Supabase，匿名时回退到 seed
import { create } from 'zustand'
import type { Task, OkrCategory, Quadrant } from '@gridgo/types'
import * as api from '@gridgo/api'
import { onAuthChange, getCurrentUser } from '@gridgo/api'
import { SEED_TASKS } from './tree'

interface TasksState {
  tasks: Task[]
  okrs: { id: string; title: string; category: OkrCategory }[]
  loading: boolean
  isAuthed: boolean
  isDemo: boolean
  loadDemo: () => void
  clearDemo: () => void
  toggle: (id: string) => Promise<void>
  add: (t: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'sort_order' | 'done' | 'done_at' | 'parent_task_id' | 'key_result_id'>) => Promise<void>
  updateTask: (id: string, patch: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  reload: () => Promise<void>
  init: () => void
}

const SEED_OKRS = [
  { id: 'o1', title: '产品增长 · Q3 月活 +30%', category: 'product' as OkrCategory },
  { id: 'o2', title: '健康管理 · 每周运动', category: 'health' as OkrCategory },
  { id: 'o3', title: '技能提升 · TS 进阶', category: 'skill' as OkrCategory },
  { id: 'o4', title: '财务健康 · 应急基金', category: 'finance' as OkrCategory },
]

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: SEED_TASKS,
  okrs: SEED_OKRS,
  loading: false,
  isAuthed: false,
  isDemo: true,

  init: () => {
    onAuthChange(async (user) => {
      if (user) {
        set({ isAuthed: true, isDemo: false })
        await get().reload()
      } else {
        // 未登录：保留 demo 数据，只标 isAuthed = false
        set({ isAuthed: false, isDemo: true })
      }
    })
    getCurrentUser().then(async (user) => {
      if (user) {
        set({ isAuthed: true, isDemo: false })
        await get().reload()
      } else {
        set({ isDemo: true })
      }
    })
  },

  loadDemo: () => {
    // 显式 demo 模式：用户主动点击才加载样例
    set({ isDemo: true, tasks: SEED_TASKS, okrs: SEED_OKRS })
  },

  clearDemo: () => {
    set({ isDemo: false, tasks: [], okrs: [] })
  },

  reload: async () => {
    set({ loading: true })
    try {
      const tasks = await api.listTasks()
      const okrs = await api.listOkrs()
      set({ tasks, okrs, loading: false })
    } catch (e) {
      console.error('[tasks] reload failed:', e)
      set({ loading: false })
    }
  },

  toggle: async (id) => {
    const before = get().tasks.find((t) => t.id === id)
    if (!before) return
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === id ? { ...t, done: !t.done, done_at: !t.done ? new Date().toISOString() : null } : t,
      ),
    }))
    if (get().isAuthed) {
      try {
        await api.toggleTask(id, !before.done)
      } catch (e) {
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: before.done, done_at: before.done_at } : t)),
        }))
        console.error('[tasks] toggle failed:', e)
      }
    }
  },

  add: async (t) => {
    if (get().isAuthed) {
      try {
        const created = await api.createTask(t)
        set((s) => ({ tasks: [...s.tasks, created] }))
      } catch (e) {
        console.error('[tasks] add failed:', e)
      }
    } else {
      const id = `t${Date.now()}`
      set((s) => ({
        tasks: [
          ...s.tasks,
          {
            ...t,
            id,
            user_id: 'u1',
            parent_task_id: null,
            key_result_id: null,
            done: false,
            done_at: null,
            sort_order: s.tasks.length,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      }))
    }
  },

  updateTask: async (id, patch) => {
    if (!get().isAuthed) {
      set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) }))
      return
    }
    try {
      const updated = await api.updateTask(id, patch)
      set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? updated : t)) }))
    } catch (e) {
      console.error('[tasks] updateTask failed:', e)
      throw e
    }
  },

  deleteTask: async (id) => {
    if (get().isAuthed) {
      try {
        await api.deleteTask(id)
      } catch (e) {
        console.error('[tasks] deleteTask failed:', e)
        throw e
      }
    }
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }))
  },
}))

async function seedForNewUser() {
  const now = new Date()
  const today = now.toISOString().slice(0, 10)
  const week = new Date(now.getTime() + 5 * 86400000).toISOString().slice(0, 10)
  const month = new Date(now.getTime() + 10 * 86400000).toISOString().slice(0, 10)

  // 4 OKR
  const okrDefs = [
    { category: 'product' as const, title: '产品增长 · Q3 月活提升 30%', progress: 0.5 },
    { category: 'health' as const, title: '健康管理 · 养成运动习惯', progress: 0.45 },
    { category: 'skill' as const, title: '技能提升 · TS 进阶 + TS 实战', progress: 0.78 },
    { category: 'finance' as const, title: '财务健康 · 应急基金 5 万', progress: 0.30 },
  ]
  const createdOkrs: { id: string; category: OkrCategory }[] = []
  for (const o of okrDefs) {
    const r = await api.createOkr?.({ title: o.title, category: o.category, quarter: '2026-Q3', progress: o.progress })
    if (r) createdOkrs.push({ id: r.id, category: o.category })
  }
  // 8 task
  const taskDefs: Array<{ title: string; quadrant: Task['quadrant']; priority: Task['priority']; due_date: string; estimate_min: number; notes: null; okr_id: string | null; _okrIdx?: number }> = [
    { _okrIdx: 0, title: 'Q3 OKR 评审材料', quadrant: 'q1', priority: 'high', due_date: today, estimate_min: 120, notes: null, okr_id: '' },
    { _okrIdx: 0, title: '核心功能重构联调', quadrant: 'q1', priority: 'high', due_date: week, estimate_min: 480, notes: null, okr_id: '' },
    { title: '客户紧急需求修复', quadrant: 'q1', priority: 'high', due_date: today, estimate_min: 120, notes: null, okr_id: '' },
    { _okrIdx: 1, title: '每周跑步 3 次', quadrant: 'q2', priority: 'med', due_date: week, estimate_min: 30, notes: null, okr_id: '' },
    { _okrIdx: 2, title: 'TS 进阶章节阅读', quadrant: 'q2', priority: 'med', due_date: week, estimate_min: 60, notes: null, okr_id: '' },
    { _okrIdx: 0, title: '用户访谈 3 位', quadrant: 'q2', priority: 'med', due_date: week, estimate_min: 90, notes: null, okr_id: '' },
    { title: '处理积压邮件', quadrant: 'q3', priority: 'low', due_date: month, estimate_min: 30, notes: null, okr_id: '' },
    { title: '整理浏览器收藏夹', quadrant: 'q4', priority: 'low', due_date: month, estimate_min: 60, notes: null, okr_id: '' },
  ]
  const out: Task[] = []
  for (const t of taskDefs) {
    const { _okrIdx, ...taskData } = t
    const okr = _okrIdx !== undefined ? createdOkrs[_okrIdx] : null
    const created = await api.createTask({ ...taskData, okr_id: okr?.id ?? null })
    if (created) out.push(created)
  }
  return out
}

export const quadrantLabel: Record<Quadrant, string> = {
  q1: '紧急 × 重要',
  q2: '重要 × 不紧急',
  q3: '紧急 × 不重要',
  q4: '都不',
}

export const okrColorClass: Record<OkrCategory, string> = {
  product: 'o1',
  health: 'o2',
  skill: 'o3',
  finance: 'o4',
}
