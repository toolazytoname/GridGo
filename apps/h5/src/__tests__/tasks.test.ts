import { describe, it, expect, beforeEach } from 'vitest'
import { useTasksStore } from '../store/tasks'

describe('useTasksStore', () => {
  beforeEach(() => {
    useTasksStore.setState({ tasks: useTasksStore.getState().tasks.map((t) => ({ ...t, done: false, done_at: null })) })
  })

  it('seeds with at least one task in each quadrant', () => {
    const tasks = useTasksStore.getState().tasks
    const quadrants = new Set(tasks.map((t) => t.quadrant).filter(Boolean))
    expect(quadrants.size).toBe(4)
  })

  it('toggle flips done', () => {
    const before = useTasksStore.getState().tasks.find((t) => t.id === 't1')!
    expect(before.done).toBe(false)
    useTasksStore.getState().toggle('t1')
    const after = useTasksStore.getState().tasks.find((t) => t.id === 't1')!
    expect(after.done).toBe(true)
    expect(after.done_at).toBeTruthy()
    useTasksStore.getState().toggle('t1')
    const restored = useTasksStore.getState().tasks.find((t) => t.id === 't1')!
    expect(restored.done).toBe(false)
    expect(restored.done_at).toBeNull()
  })

  it('add appends a new task with id and timestamps', () => {
    const before = useTasksStore.getState().tasks.length
    useTasksStore.getState().add({
      title: '新加的任务',
      notes: null,
      quadrant: 'q2',
      priority: 'med',
      due_date: null,
      estimate_min: null,
      okr_id: 'o1',
    })
    const after = useTasksStore.getState().tasks
    expect(after.length).toBe(before + 1)
    expect(after[after.length - 1].title).toBe('新加的任务')
    expect(after[after.length - 1].id).toBeTruthy()
    expect(after[after.length - 1].created_at).toBeTruthy()
  })
})
