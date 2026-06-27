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
  toggle: (id: string) => Promise<void>
  add: (t: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'sort_order' | 'done' | 'done_at' | 'parent_task_id' | 'key_result_id'>) => Promise<void>
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

  init: () => {
    onAuthChange(async (user) => {
      if (user) {
        set({ isAuthed: true })
        await get().reload()
      } else {
        set({ isAuthed: false, tasks: SEED_TASKS, okrs: SEED_OKRS })
      }
    })
    getCurrentUser().then(async (user) => {
      if (user) {
        set({ isAuthed: true })
        await get().reload()
      }
    })
  },

  reload: async () => {
    set({ loading: true })
    try {
      const tasks = await api.listTasks()
      set({ tasks, loading: false })
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
}))

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
