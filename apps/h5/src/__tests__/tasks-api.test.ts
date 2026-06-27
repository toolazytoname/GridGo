import { describe, it, expect, beforeEach, vi } from 'vitest'

// 必须在导入 store 之前 mock
vi.mock('@gridgo/api', () => ({
  listTasks: vi.fn().mockResolvedValue([
    {
      id: 'remote-1', user_id: 'u1', okr_id: null, key_result_id: null, parent_task_id: null,
      title: '远端任务 A', notes: null, quadrant: 'q2', priority: 'med',
      due_date: '2026-07-01', estimate_min: 30, done: false, done_at: null,
      sort_order: 0, created_at: '2026-07-01T00:00:00Z', updated_at: '2026-07-01T00:00:00Z',
    },
  ]),
  createTask: vi.fn().mockImplementation(async (t) => ({
    id: 'remote-new', user_id: 'u1', okr_id: null, key_result_id: null, parent_task_id: null,
    done: false, done_at: null, sort_order: 999,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    ...t,
  })),
  toggleTask: vi.fn().mockResolvedValue(undefined),
  getCurrentUser: vi.fn().mockResolvedValue({ id: 'u1', email: 'test@test' } as any),
  onAuthChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: () => {} } } }),
  signOut: vi.fn(),
}))

import { useTasksStore } from '../store/tasks'

describe('tasks store with mocked Supabase', () => {
  beforeEach(() => {
    useTasksStore.setState({ tasks: [], loading: false, isAuthed: false })
  })

  it('reload fetches tasks from Supabase', async () => {
    useTasksStore.setState({ isAuthed: true })
    await useTasksStore.getState().reload()
    const tasks = useTasksStore.getState().tasks
    expect(tasks.length).toBe(1)
    expect(tasks[0].title).toBe('远端任务 A')
  })

  it('toggle calls Supabase when authed', async () => {
    useTasksStore.setState({
      isAuthed: true,
      tasks: [{
        id: 'x', user_id: 'u1', okr_id: null, key_result_id: null, parent_task_id: null,
        title: 'X', notes: null, quadrant: 'q2', priority: 'med',
        due_date: null, estimate_min: null, done: false, done_at: null,
        sort_order: 0, created_at: '', updated_at: '',
      }],
    })
    await useTasksStore.getState().toggle('x')
    expect(useTasksStore.getState().tasks[0].done).toBe(true)
  })

  it('add calls Supabase createTask when authed', async () => {
    useTasksStore.setState({ isAuthed: true, tasks: [] })
    await useTasksStore.getState().add({
      title: '新加', notes: null, quadrant: 'q2', priority: 'med',
      due_date: null, estimate_min: null, okr_id: null,
    })
    const tasks = useTasksStore.getState().tasks
    expect(tasks.length).toBe(1)
    expect(tasks[0].id).toBe('remote-new')
  })
})
