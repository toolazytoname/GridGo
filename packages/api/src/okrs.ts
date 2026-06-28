import { getSupabase } from './client'
import type { Okr, OkrCategory } from '@gridgo/types'

export async function listOkrs(): Promise<Okr[]> {
  const { data, error } = await getSupabase()
    .from('okrs')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []) as Okr[]
}

export async function createOkr(o: { title: string; category: OkrCategory; quarter?: string; progress?: number }): Promise<Okr | null> {
  const { data: { user } } = await getSupabase().auth.getUser()
  if (!user) throw new Error('未登录')
  const { data, error } = await getSupabase()
    .from('okrs')
    .insert({
      user_id: user.id,
      title: o.title,
      category: o.category,
      quarter: o.quarter ?? '2026-Q3',
      progress: o.progress ?? 0,
      sort_order: Date.now() % 10000,
    })
    .select()
    .single()
  if (error) { console.error('[okrs] create failed:', error); return null }
  return data as Okr
}

export async function updateOkr(id: string, patch: Partial<Okr>): Promise<Okr | null> {
  const { data, error } = await getSupabase()
    .from('okrs')
    .update(patch)
    .eq('id', id)
    .select()
    .single()
  if (error) { console.error('[okrs] update failed:', error); return null }
  return data as Okr
}

export async function deleteOkr(id: string): Promise<boolean> {
  const { error } = await getSupabase().from('okrs').delete().eq('id', id)
  if (error) { console.error('[okrs] delete failed:', error); return false }
  return true
}
