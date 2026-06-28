import { getSupabase } from './index'
import type { User } from '@supabase/supabase-js'

export interface AuthError { message: string }

/**
 * 邮箱 + 密码登录（Supabase 已开 autoconfirm 不需邮件确认）
 */
export async function signInWithPassword(email: string, password: string): Promise<{ error: AuthError | null }> {
  const { error } = await getSupabase().auth.signInWithPassword({ email, password })
  return error ? { error: { message: error.message } } : { error: null }
}

/**
 * 邮箱 + 密码注册（autoconfirm 开 = 不用邮件确认）
 */
export async function signUpWithPassword(email: string, password: string): Promise<{ error: AuthError | null }> {
  const { error } = await getSupabase().auth.signUp({
    email,
    password,
    options: { emailRedirectTo: window.location.origin },
  })
  return error ? { error: { message: error.message } } : { error: null }
}

/**
 * 邮箱魔法链接登录（备用，保留兼容）
 */
export async function signInWithEmail(email: string): Promise<{ error: AuthError | null }> {
  const { error } = await getSupabase().auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin },
  })
  return error ? { error: { message: error.message } } : { error: null }
}

/**
 * GitHub OAuth
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
