import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export type { SupabaseClient }

let _client: SupabaseClient | null = null

/**
 * 浏览器/小程序用 — 只用 anon key。RLS 在数据库层把关。
 */
export function getSupabase(): SupabaseClient {
  if (_client) return _client
  const url = import.meta.env?.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const key = import.meta.env?.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error('[gridgo/api] SUPABASE_URL / SUPABASE_ANON_KEY 未设置。请检查 .env 或 Vercel 环境变量。')
  }
  _client = createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true },
  })
  return _client
}
