import { getSupabase } from './index'
import type { Task } from '@gridgo/types'

export async function listTasks(): Promise<Task[]> {
  const { data, error } = await getSupabase()
    .from('tasks')
    .select('*')
    .order('done', { ascending: true })
    .order('sort_order', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []) as Task[]
}

export async function createTask(t: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'sort_order' | 'done' | 'done_at' | 'parent_task_id' | 'key_result_id'>): Promise<Task> {
  const { data: { user } } = await getSupabase().auth.getUser()
  if (!user) throw new Error('未登录')
  const { data, error } = await getSupabase()
    .from('tasks')
    .insert({ ...t, user_id: user.id })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Task
}

export async function toggleTask(id: string, done: boolean): Promise<void> {
  const { error } = await getSupabase()
    .from('tasks')
    .update({ done, done_at: done ? new Date().toISOString() : null })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await getSupabase().from('tasks').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
