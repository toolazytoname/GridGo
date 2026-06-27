import { create } from 'zustand'
import type { Task, OkrCategory, Quadrant } from '@gridgo/types'

const todayISO = () => new Date().toISOString().slice(0, 10)
const weekFromNowISO = () => {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  return d.toISOString().slice(0, 10)
}

const seed = (): Task[] => [
  // Q1: 紧急 × 重要
  { id: 't1', user_id: 'u1', okr_id: 'o1', key_result_id: null, parent_task_id: null, title: 'Q3 OKR 评审材料', notes: null, quadrant: 'q1', priority: 'high', due_date: todayISO(), estimate_min: 120, done: false, done_at: null, sort_order: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 't2', user_id: 'u1', okr_id: 'o1', key_result_id: null, parent_task_id: null, title: '核心功能重构联调', notes: null, quadrant: 'q1', priority: 'high', due_date: weekFromNowISO(), estimate_min: 480, done: false, done_at: null, sort_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 't3', user_id: 'u1', okr_id: null, key_result_id: null, parent_task_id: null, title: '客户紧急需求修复', notes: null, quadrant: 'q1', priority: 'high', due_date: todayISO(), estimate_min: 120, done: false, done_at: null, sort_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  // Q2: 重要 × 不紧急
  { id: 't4', user_id: 'u1', okr_id: 'o2', key_result_id: null, parent_task_id: null, title: '每周跑步 3 次', notes: null, quadrant: 'q2', priority: 'med', due_date: weekFromNowISO(), estimate_min: 30, done: false, done_at: null, sort_order: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 't5', user_id: 'u1', okr_id: 'o3', key_result_id: null, parent_task_id: null, title: 'TS 进阶章节阅读', notes: null, quadrant: 'q2', priority: 'med', due_date: weekFromNowISO(), estimate_min: 60, done: false, done_at: null, sort_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 't6', user_id: 'u1', okr_id: null, key_result_id: null, parent_task_id: null, title: '用户访谈 3 位', notes: null, quadrant: 'q2', priority: 'med', due_date: weekFromNowISO(), estimate_min: 90, done: false, done_at: null, sort_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 't7', user_id: 'u1', okr_id: null, key_result_id: null, parent_task_id: null, title: '周报撰写', notes: null, quadrant: 'q2', priority: null, due_date: null, estimate_min: null, done: true, done_at: new Date().toISOString(), sort_order: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  // Q3: 紧急 × 不重要
  { id: 't8', user_id: 'u1', okr_id: null, key_result_id: null, parent_task_id: null, title: '处理积压邮件', notes: null, quadrant: 'q3', priority: 'low', due_date: null, estimate_min: 30, done: false, done_at: null, sort_order: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 't9', user_id: 'u1', okr_id: null, key_result_id: null, parent_task_id: null, title: '部分会议记录同步', notes: null, quadrant: 'q3', priority: 'low', due_date: null, estimate_min: 15, done: false, done_at: null, sort_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  // Q4: 都不
  { id: 't10', user_id: 'u1', okr_id: null, key_result_id: null, parent_task_id: null, title: '整理浏览器收藏夹', notes: null, quadrant: 'q4', priority: 'low', due_date: null, estimate_min: 60, done: false, done_at: null, sort_order: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 't11', user_id: 'u1', okr_id: null, key_result_id: null, parent_task_id: null, title: '刷社交媒体', notes: null, quadrant: 'q4', priority: null, due_date: null, estimate_min: 30, done: false, done_at: null, sort_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
]

interface TasksState {
  tasks: Task[]
  okrs: { id: string; title: string; category: OkrCategory }[]
  toggle: (id: string) => void
  add: (t: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'sort_order' | 'done' | 'done_at' | 'parent_task_id' | 'key_result_id'>) => void
}

export const useTasksStore = create<TasksState>((set) => ({
  tasks: seed(),
  okrs: [
    { id: 'o1', title: '产品增长 · Q3 月活 +30%', category: 'product' },
    { id: 'o2', title: '健康管理 · 每周运动', category: 'health' },
    { id: 'o3', title: '技能提升 · TS 进阶', category: 'skill' },
    { id: 'o4', title: '财务健康 · 应急基金', category: 'finance' },
  ],
  toggle: (id) =>
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === id ? { ...t, done: !t.done, done_at: !t.done ? new Date().toISOString() : null } : t,
      ),
    })),
  add: (t) =>
    set((s) => ({
      tasks: [
        ...s.tasks,
        {
          ...t,
          id: `t${Date.now()}`,
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
    })),
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
