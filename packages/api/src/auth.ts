import { getSupabase } from './index'
import type { User } from '@supabase/supabase-js'

export interface AuthError { message: string }

/**
 * 邮箱魔法链接登录。supabase 会发一封邮件，用户点链接完成登录。
 * 需要在 Supabase Dashboard → Auth → Providers → Email 启用。
 */
export async function signInWithEmail(email: string): Promise<{ error: AuthError | null }> {
  const { error } = await getSupabase().auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin },
  })
  return error ? { error: { message: error.message } } : { error: null }
}

/**
 * GitHub OAuth 登录。需要：
 *  1. GitHub 创建 OAuth App
 *     https://github.com/settings/developers → New OAuth App
 *     Authorization callback URL: https://etecmcnuxochcydednky.supabase.co/auth/v1/callback
 *  2. 把 client_id / client_secret 填到 Supabase Dashboard → Auth → Providers → GitHub
 *  3. 在 supabase/config.toml 把 [auth.external.github] enabled 设为 true
 */
export async function signInWithGithub(): Promise<{ error: AuthError | null }> {
  const { error } = await getSupabase().auth.signInWithOAuth({
    provider: 'github',
    options: { redirectTo: window.location.origin },
  })
  return error ? { error: { message: error.message } } : { error: null }
}

export async function signOut(): Promise<{ error: AuthError | null }> {
  const { error } = await getSupabase().auth.signOut()
  return error ? { error: { message: error.message } } : { error: null }
}

export async function getCurrentUser(): Promise<User | null> {
  const { data } = await getSupabase().auth.getUser()
  return data.user
}

export function onAuthChange(cb: (user: User | null) => void) {
  return getSupabase().auth.onAuthStateChange((_event, session) => {
    cb(session?.user ?? null)
  })
}
