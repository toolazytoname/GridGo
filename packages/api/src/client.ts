import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

/**
 * 浏览器/小程序用 — 只用 anon key。RLS 在数据库层把关。
 * Vite 通过 import.meta.env 注入；fallback 走 process.env 兼容 SSR / Edge。
 */
export function getSupabase(): SupabaseClient {
  if (_client) return _client
  const url =
    (import.meta as any).env?.VITE_SUPABASE_URL ||
    (typeof process !== 'undefined' ? process.env?.SUPABASE_URL : undefined)
  const key =
    (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
    (typeof process !== 'undefined' ? process.env?.SUPABASE_ANON_KEY : undefined)
  if (!url || !key) {
    throw new Error('[gridgo/api] SUPABASE_URL / SUPABASE_ANON_KEY 未设置')
  }
  _client = createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, storage: window.localStorage },
  })
  return _client
}
