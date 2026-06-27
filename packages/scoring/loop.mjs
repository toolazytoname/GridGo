// 主循环：Plan → Dev → Test → Score → 合并 develop → 触发下一轮
// 由 sub-agent 在 shell 里跑（pnpm loop 或 node packages/scoring/loop.mjs）
//
// 设计：
// - 读 BACKLOG.md 选下一个 status: ready 的 feature
// - 启 dev sub-agent（隔离上下文）
// - dev 完后启 test sub-agent（视觉/单测/E2E/LLM 评审）
// - 聚合评分；<80 回到 dev 带着扣分清单（最多 3 次）
// - ≥80 写回 BACKLOG.md 为 done，触发下一轮
// - 安全网：连续 3 个 BLOCKED 停机

import { readFile, writeFile, readdir } from 'node:fs/promises'
import { existsSync, appendFileSync } from 'node:fs'
import path from 'node:path'

const MAX_RETRIES_PER_FEATURE = 3
const MAX_CONSECUTIVE_BLOCKED = 3

export async function runOnce() {
  const backlogPath = path.resolve(process.cwd(), 'BACKLOG.md')
  if (!existsSync(backlogPath)) throw new Error('BACKLOG.md 缺失')
  const text = await readFile(backlogPath, 'utf8')

  // 极简解析：找第一个 status: ready 的 feature
  const feature = pickNextFeature(text)
  if (!feature) {
    log('所有 feature 已 done 或无 ready 状态。')
    return { done: true }
  }
  log(`选 feature: ${feature.id} — ${feature.title}`)

  for (let attempt = 1; attempt <= MAX_RETRIES_PER_FEATURE; attempt++) {
    log(`  attempt ${attempt}/${MAX_RETRIES_PER_FEATURE}`)

    // 这里 sub-agent 通过 Agent tool 启 dev / test。
    // 当 loop 脚本被 sub-agent 包装时，下面这两个 stub 会被替换为实际 agent 调用。
    const devResult = await runDevAgent(feature, attempt)
    if (devResult.blocked) {
      markBlocked(feature, devResult.reason)
      return { feature: feature.id, status: 'BLOCKED' }
    }

    const score = await runTestAgentsAndScore(feature)
    if (score.pass) {
      markDone(feature, score)
      log(`  ✅ ${feature.id} done, total=${score.total}`)
      return { feature: feature.id, status: 'done', total: score.total }
    }
    log(`  ❌ score ${score.total} < 80, deductions: ${score.deductions.join(' | ')}`)
    feature.lastDeductions = score.deductions
  }

  markBlocked(feature, `重试 ${MAX_RETRIES_PER_FEATURE} 次未达阈值`)
  return { feature: feature.id, status: 'BLOCKED' }
}

function pickNextFeature(text) {
  // 待 BACKLOG.md 格式稳定后用真正的 parser；现在先按约定找首个 status: ready 行
  const blocks = text.split(/^## /m).slice(1)
  for (const b of blocks) {
    const id = b.match(/^F-(\d+)/m)?.[0]
    const status = b.match(/^- status: (.+)$/m)?.[1]
    const title = b.match(/^F-\d+: (.+)$/m)?.[1] ?? id
    if (status?.trim() === 'ready' && id) {
      return { id, title, raw: b }
    }
  }
  return null
}

async function runDevAgent(feature, attempt) {
  // stub — 真正的 loop 运行时由 Claude 子进程替代
  log(`    [stub] dev sub-agent 处理 ${feature.id}，attempt=${attempt}`)
  return { blocked: false }
}

async function runTestAgentsAndScore(feature) {
  log(`    [stub] test sub-agents + 评分 ${feature.id}`)
  return { pass: true, total: 100, deductions: [] }
}

function markDone(feature, score) {
  log(`  mark done: ${feature.id}`)
  // 真正的实现里要原子地更新 BACKLOG.md
}

function markBlocked(feature, reason) {
  appendFileSync(
    path.resolve(process.cwd(), 'BLOCKED.log'),
    `${new Date().toISOString()}\t${feature.id}\t${reason}\n`,
  )
}

function log(s) {
  console.log(`[loop] ${s}`)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const r = await runOnce()
  console.log(JSON.stringify(r, null, 2))
}
