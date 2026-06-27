// 共享类型。Sub-agent 写代码时优先看这里有没有现成的。

export type OkrCategory = 'product' | 'health' | 'skill' | 'finance'
export type Quadrant = 'q1' | 'q2' | 'q3' | 'q4' // Eisenhower

export interface Profile {
  id: string
  display_name: string
  role: string | null
  bio: string | null
  avatar_color: string
  created_at: string
  updated_at: string
}

export interface Okr {
  id: string
  user_id: string
  title: string
  description: string | null
  category: OkrCategory
  quarter: string
  progress: number
  archived: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface KeyResult {
  id: string
  okr_id: string
  title: string
  progress: number
  due_date: string | null
  done: boolean
  sort_order: number
  created_at: string
}

export interface SubTask {
  id: string
  task_id: string
  title: string
  done: boolean
  estimate_min: number | null
  sort_order: number
}

export interface Task {
  id: string
  user_id: string
  okr_id: string | null
  key_result_id: string | null
  parent_task_id: string | null
  title: string
  notes: string | null
  quadrant: Quadrant | null
  priority: 'low' | 'med' | 'high' | null
  due_date: string | null
  estimate_min: number | null
  done: boolean
  done_at: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface CalendarEvent {
  id: string
  user_id: string
  task_id: string | null
  title: string
  start_at: string
  end_at: string | null
  quadrant: Quadrant | null
  created_at: string
}

export interface Achievement {
  id: string
  user_id: string
  key: string
  title: string
  description: string | null
  unlocked_at: string
}
