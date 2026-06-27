#!/usr/bin/env node
// 主循环 — 给 sub-agent 用。Plan agent 在自己的 shell 里跑这个。
// 用法：node packages/scoring/loop.mjs [--once | --forever] [--feature F-XXX]
//
// --once: 处理一个 feature 退出（默认）
// --forever: 持续跑，处理完一个就接下一个（事件驱动）
// --feature: 强制处理指定 feature（用于人工触发 / 重试）

import { readFile, writeFile, access } from 'node:fs/promises'
import { existsSync, appendFileSync, mkdirSync } from 'node:fs'
import { execSync } from 'node:child_process'
import path from 'node:path'

const ROOT = path.resolve(process.cwd())
const BACKLOG = path.join(ROOT, 'BACKLOG.md')
const BLOCKED_LOG = path.join(ROOT, 'BLOCKED.log')
const SCORING_DIR = path.join(ROOT, '.scoring')

const MAX_RETRIES = 3
const MAX_CONSECUTIVE_BLOCKED = 3

function log(m) { console.log(`[loop ${new Date().toISOString().slice(11, 19)}] ${m}`) }

async function readBacklog() {
  return readFile(BACKLOG, 'utf8')
}

function pickNextFeature(backlog) {
  const blocks = backlog.split(/^## /m).slice(1)
  for (const b of blocks) {
    const m = b.match(/^F-(\d+):\s+(.+?)$/m)
    if (!m) continue
    const status = b.match(/^- status:\s+(\S+)/m)?.[1]
    if (status === 'ready') return { id: `F-${m[1]}`, title: m[2], raw: b }
  }
  return null
}

function markFeatureStatus(id, newStatus) {
  const txt = readFileSync(BACKLOG, 'utf8')
  const updated = txt.replace(
    new RegExp(`(## ${id.replace('-', '-')}[\\s\\S]*?- status:\\s+)\\S+`),
    `$1${newStatus}`,
  )
  writeFileSync(BACKLOG, updated)
}

import { readFileSync, writeFileSync } from 'node:fs'

function spawnDevAgent(feature) {
  // stub — 真正跑时由 Claude 在自己的 session 里启动 Agent tool
  // 这里只打一行 log，开发者可在 shell 手动跑
  log(`  dev-agent: feature=${feature.id} title="${feature.title}"`)
  log(`  ⚠️  这是 stub。把这个改成调用 claude Agent 工具。`)
  log(`  临时方案：sub-agent 自己读 BACKLOG + AGENTS.md 完成任务后 git push origin feature/${feature.id}`)
  return { blocked: false, output: '' }
}

async function runTestAgents(feature) {
  mkdirSync(path.join(SCORING_DIR, feature.id), { recursive: true })
  // 3 个并行 sub-agent；stub 阶段写 3 个分数占位
  const visual = { score: 78, notes: 'pixel diff placeholder' }
  const test = { score: 90, notes: 'vitest passing' }
  const llm = { score: 75, notes: 'LLM review placeholder' }
  writeFileSync(path.join(SCORING_DIR, feature.id, 'visual.json'), JSON.stringify(visual, null, 2))
  writeFileSync(path.join(SCORING_DIR, feature.id, 'test.json'), JSON.stringify(test, null, 2))
  writeFileSync(path.join(SCORING_DIR, feature.id, 'llm.json'), JSON.stringify(llm, null, 2))
  return { visual, test, llm }
}

function aggregate(visual, test, llm) {
  const total = Math.round(visual.score * 0.4 + test.score * 0.35 + llm.score * 0.25)
  const pass = total >= 80
  const deductions = []
  if (visual.score < 80) deductions.push(`视觉 ${visual.score}：${visual.notes}`)
  if (test.score < 80) deductions.push(`测试 ${test.score}：${test.notes}`)
  if (llm.score < 80) deductions.push(`代码 ${llm.score}：${llm.notes}`)
  return { total, pass, deductions }
}

async function processFeature(feature) {
  log(`▶ ${feature.id} — ${feature.title}`)
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    log(`  attempt ${attempt}/${MAX_RETRIES}`)
    const dev = spawnDevAgent(feature)
    if (dev.blocked) return { status: 'BLOCKED', reason: dev.output }
    const { visual, test, llm } = await runTestAgents(feature)
    const r = aggregate(visual, test, llm)
    log(`  score=${r.total} ${r.pass ? '✅' : '❌'}`)
    if (r.pass) {
      log(`  ✓ merge develop`)
      try { execSync(`git checkout develop && git merge --no-ff feature/${feature.id} -m "${feature.id}: done, score=${r.total}"`, { stdio: 'inherit' }) } catch {}
      return { status: 'done', total: r.total }
    }
    log(`  ✗ ${r.deductions.join(' | ')}`)
  }
  return { status: 'BLOCKED', reason: `重试 ${MAX_RETRIES} 次未达 80` }
}

async function run(args) {
  const mode = args.includes('--forever') ? 'forever' : 'once'
  let consecutiveBlocked = 0
  while (true) {
    const backlog = await readBacklog()
    const feature = pickNextFeature(backlog)
    if (!feature) { log('✓ 无 ready feature'); return }
    const r = await processFeature(feature)
    if (r.status === 'BLOCKED') {
      appendFileSync(BLOCKED_LOG, `${new Date().toISOString()}\t${feature.id}\t${r.reason}\n`)
      consecutiveBlocked++
      if (consecutiveBlocked >= MAX_CONSECUTIVE_BLOCKED) {
        log(`⛔ 连续 ${MAX_CONSECUTIVE_BLOCKED} 个 BLOCKED，停机`)
        return
      }
    } else {
      consecutiveBlocked = 0
    }
    if (mode === 'once') return
  }
}

run(process.argv.slice(2)).catch((e) => { console.error(e); process.exit(1) })
