// utils/supabase.js - 微信小程序直连 Supabase REST API
// 避免 supabase-js 在 wx 环境下的 fetch 适配问题

const SUPABASE_URL = 'https://etecmcnuxochcydednky.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_uGfQj7Bf4_jJ1dLvOVEG7w_yNTHGJN0'

// 通用 wx.request Promise 包装
function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: SUPABASE_URL + path,
      method,
      data: body,
      header: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + (token || SUPABASE_ANON_KEY),
        'Content-Type': 'application/json',
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(res.data)
        else reject(res)
      },
      fail: reject,
    })
  })
}

// Auth
export async function signIn(email, password) {
  return request('POST', '/auth/v1/token?grant_type=password', { email, password })
}

export async function signUp(email, password) {
  return request('POST', '/auth/v1/signup', { email, password })
}

export async function signOut(token) {
  return request('POST', '/auth/v1/logout', {}, token)
}

export async function getUser(token) {
  return request('GET', '/auth/v1/user', null, token)
}

// Task CRUD
async function listTasksWithToken(token) {
  return request('GET', '/rest/v1/tasks?select=*&order=done.asc,sort_order.asc', null, token)
}
export async function listTasks(token) {
  return listTasksWithToken(token)
}

export async function createTask(token, task) {
  return request('POST', '/rest/v1/tasks', task, token)
}

export async function updateTask(token, id, patch) {
  return request('PATCH', '/rest/v1/tasks?id=eq.' + id, patch, token)
}

export async function deleteTask(token, id) {
  return request('DELETE', '/rest/v1/tasks?id=eq.' + id, null, token)
}

export async function toggleTask(token, id, done) {
  return updateTask(token, id, { done, done_at: done ? new Date().toISOString() : null })
}

// OKR CRUD
export async function listOkrs(token) {
  return request('GET', '/rest/v1/okrs?select=*&order=sort_order.asc', null, token)
}

export async function createOkr(token, okr) {
  return request('POST', '/rest/v1/okrs', okr, token)
}

export async function deleteOkr(token, id) {
  return request('DELETE', '/rest/v1/okrs?id=eq.' + id, null, token)
}
