// Seed data: 完整 OKR 树（OKR > KR > Task > SubTask）
import type { Okr, KeyResult, Task, SubTask, OkrCategory, Quadrant } from '@gridgo/types'

const today = () => new Date().toISOString().slice(0, 10)
const wk = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

export const SEED_OKRS: (Okr & { category: OkrCategory })[] = [
  { id: 'o1', user_id: 'u1', title: '产品增长 · Q3 月活提升 30%', description: null, category: 'product', quarter: '2026-Q3', progress: 0.67, archived: false, sort_order: 0, created_at: today(), updated_at: today() },
  { id: 'o2', user_id: 'u1', title: '健康管理 · 养成运动习惯', description: null, category: 'health', quarter: '2026-Q3', progress: 0.45, archived: false, sort_order: 1, created_at: today(), updated_at: today() },
  { id: 'o3', user_id: 'u1', title: '技能提升 · TS 进阶 + TS 实战', description: null, category: 'skill', quarter: '2026-Q3', progress: 0.78, archived: false, sort_order: 2, created_at: today(), updated_at: today() },
  { id: 'o4', user_id: 'u1', title: '财务健康 · 应急基金 5 万', description: null, category: 'finance', quarter: '2026-Q3', progress: 0.30, archived: false, sort_order: 3, created_at: today(), updated_at: today() },
]

export const SEED_KRS: KeyResult[] = [
  // o1
  { id: 'k11', okr_id: 'o1', title: '完成核心功能重构', progress: 0.4, due_date: wk(2), done: false, sort_order: 0, created_at: today() },
  { id: 'k12', okr_id: 'o1', title: '上线 A/B 测试框架', progress: 0.5, due_date: wk(5), done: false, sort_order: 1, created_at: today() },
  { id: 'k13', okr_id: 'o1', title: '用户访谈 10 位', progress: 0.3, due_date: wk(7), done: false, sort_order: 2, created_at: today() },
  // o2
  { id: 'k21', okr_id: 'o2', title: '每周跑步 3 次', progress: 0.66, due_date: wk(3), done: false, sort_order: 0, created_at: today() },
  { id: 'k22', okr_id: 'o2', title: '每日饮水 8 杯', progress: 0.4, due_date: null, done: false, sort_order: 1, created_at: today() },
  { id: 'k23', okr_id: 'o2', title: '22:30 前入睡', progress: 0.5, due_date: null, done: false, sort_order: 2, created_at: today() },
  // o3
  { id: 'k31', okr_id: 'o3', title: '完成类型基础课程', progress: 1.0, due_date: today(), done: true, sort_order: 0, created_at: today() },
  { id: 'k32', okr_id: 'o3', title: '完成泛型与 utility types', progress: 0.6, due_date: wk(45), done: false, sort_order: 1, created_at: today() },
]

export const SEED_TASKS: Task[] = [
  // 跟 KR 关联的 task（出现在四象限 / 列表里）
  { id: 't1', user_id: 'u1', okr_id: 'o1', key_result_id: 'k11', parent_task_id: null, title: 'Q3 OKR 评审材料', notes: null, quadrant: 'q1', priority: 'high', due_date: today(), estimate_min: 120, done: false, done_at: null, sort_order: 0, created_at: today(), updated_at: today() },
  { id: 't2', user_id: 'u1', okr_id: 'o1', key_result_id: 'k11', parent_task_id: null, title: '核心功能重构联调', notes: null, quadrant: 'q1', priority: 'high', due_date: wk(2), estimate_min: 480, done: false, done_at: null, sort_order: 1, created_at: today(), updated_at: today() },
  { id: 't3', user_id: 'u1', okr_id: null, key_result_id: null, parent_task_id: null, title: '客户紧急需求修复', notes: null, quadrant: 'q1', priority: 'high', due_date: today(), estimate_min: 120, done: false, done_at: null, sort_order: 2, created_at: today(), updated_at: today() },
  { id: 't4', user_id: 'u1', okr_id: 'o2', key_result_id: 'k21', parent_task_id: null, title: '每周跑步 3 次', notes: null, quadrant: 'q2', priority: 'med', due_date: wk(3), estimate_min: 30, done: false, done_at: null, sort_order: 0, created_at: today(), updated_at: today() },
  { id: 't5', user_id: 'u1', okr_id: 'o3', key_result_id: 'k32', parent_task_id: null, title: 'TS 进阶章节阅读', notes: null, quadrant: 'q2', priority: 'med', due_date: wk(5), estimate_min: 60, done: false, done_at: null, sort_order: 1, created_at: today(), updated_at: today() },
  { id: 't6', user_id: 'u1', okr_id: 'o1', key_result_id: 'k13', parent_task_id: null, title: '用户访谈 3 位', notes: null, quadrant: 'q2', priority: 'med', due_date: wk(7), estimate_min: 90, done: false, done_at: null, sort_order: 2, created_at: today(), updated_at: today() },
  { id: 't7', user_id: 'u1', okr_id: null, key_result_id: null, parent_task_id: null, title: '周报撰写', notes: null, quadrant: 'q2', priority: null, due_date: null, estimate_min: null, done: true, done_at: today(), sort_order: 3, created_at: today(), updated_at: today() },
  { id: 't8', user_id: 'u1', okr_id: null, key_result_id: null, parent_task_id: null, title: '处理积压邮件', notes: null, quadrant: 'q3', priority: 'low', due_date: null, estimate_min: 30, done: false, done_at: null, sort_order: 0, created_at: today(), updated_at: today() },
  { id: 't9', user_id: 'u1', okr_id: null, key_result_id: null, parent_task_id: null, title: '部分会议记录同步', notes: null, quadrant: 'q3', priority: 'low', due_date: null, estimate_min: 15, done: false, done_at: null, sort_order: 1, created_at: today(), updated_at: today() },
  { id: 't10', user_id: 'u1', okr_id: null, key_result_id: null, parent_task_id: null, title: '整理浏览器收藏夹', notes: null, quadrant: 'q4', priority: 'low', due_date: null, estimate_min: 60, done: false, done_at: null, sort_order: 0, created_at: today(), updated_at: today() },
  { id: 't11', user_id: 'u1', okr_id: null, key_result_id: null, parent_task_id: null, title: '刷社交媒体', notes: null, quadrant: 'q4', priority: null, due_date: null, estimate_min: 30, done: false, done_at: null, sort_order: 1, created_at: today(), updated_at: today() },
]

export const SEED_SUBTASKS: SubTask[] = [
  // KR k11 子任务
  { id: 's111', task_id: 't2', title: '编写技术方案文档', done: false, estimate_min: 120, sort_order: 0 },
  { id: 's112', task_id: 't2', title: '评审技术方案', done: true, estimate_min: 60, sort_order: 1 },
  { id: 's113', task_id: 't2', title: '分配开发任务', done: false, estimate_min: 30, sort_order: 2 },
  // KR k12
  { id: 's121', task_id: 't6', title: '选型 A/B 测试平台', done: true, estimate_min: null, sort_order: 0 },
  { id: 's122', task_id: 't6', title: '接入埋点系统', done: false, estimate_min: 240, sort_order: 1 },
  { id: 's123', task_id: 't6', title: '配置实验组/对照组', done: false, estimate_min: 120, sort_order: 2 },
  { id: 's124', task_id: 't6', title: '部署上线', done: false, estimate_min: null, sort_order: 3 },
  // KR k13
  { id: 's131', task_id: 't6', title: '邀约用户名单', done: true, estimate_min: null, sort_order: 0 },
  { id: 's132', task_id: 't6', title: '进行访谈（目标 10 位）', done: false, estimate_min: null, sort_order: 1 },
  // KR k21
  { id: 's211', task_id: 't4', title: '周一 跑步 5km', done: true, estimate_min: null, sort_order: 0 },
  { id: 's212', task_id: 't4', title: '周三 跑步 5km', done: true, estimate_min: null, sort_order: 1 },
  { id: 's213', task_id: 't4', title: '周六 跑步 5km', done: false, estimate_min: null, sort_order: 2 },
  // k22 饮水
  { id: 's221', task_id: 't8', title: '早上 4 杯', done: false, estimate_min: null, sort_order: 0 },
  { id: 's222', task_id: 't8', title: '下午 4 杯', done: false, estimate_min: null, sort_order: 1 },
  // k23 睡眠
  { id: 's231', task_id: 't9', title: '设定睡眠提醒 22:30', done: true, estimate_min: null, sort_order: 0 },
]

// tag 标签映射：q1=紧急重要 / q2=重要 / q3=紧急不重要 / q4=不重要
export const quadrantTag: Record<Quadrant, string> = {
  q1: '紧急重要',
  q2: '重要',
  q3: '紧急不重要',
  q4: '不重要',
}
