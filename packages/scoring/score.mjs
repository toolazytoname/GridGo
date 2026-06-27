// 单 feature 评分聚合：视觉 40 + 测试 35 + LLM 25，阈值 80
// 用法: node packages/scoring/score.mjs <feature-id>

import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

const WEIGHTS = { visual: 0.4, test: 0.35, llm: 0.25 }
const THRESHOLD = 80

export async function score(featureId) {
  const root = path.resolve(process.cwd())
  const reportDir = path.join(root, '.scoring', featureId)
  const visual = await readJson(path.join(reportDir, 'visual.json'))
  const test = await readJson(path.join(reportDir, 'test.json'))
  const llm = await readJson(path.join(reportDir, 'llm.json'))

  const total = Math.round(
    (visual?.score ?? 0) * WEIGHTS.visual +
    (test?.score ?? 0) * WEIGHTS.test +
    (llm?.score ?? 0) * WEIGHTS.llm,
  )

  const pass = total >= THRESHOLD
  const deductions = []
  if ((visual?.score ?? 0) < 80) deductions.push(`视觉差 ${(visual?.score ?? 0)}/100：${visual?.notes ?? '无说明'}`)
  if ((test?.score ?? 0) < 80) deductions.push(`测试差 ${(test?.score ?? 0)}/100：${test?.notes ?? '无说明'}`)
  if ((llm?.score ?? 0) < 80) deductions.push(`代码差 ${(llm?.score ?? 0)}/100：${llm?.notes ?? '无说明'}`)

  return { featureId, total, threshold: THRESHOLD, pass, breakdown: { visual, test, llm }, deductions }
}

async function readJson(p) {
  if (!existsSync(p)) return null
  try { return JSON.parse(await readFile(p, 'utf8')) } catch { return null }
}

// CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const id = process.argv[2]
  if (!id) { console.error('用法: node score.mjs <feature-id>'); process.exit(2) }
  const r = await score(id)
  console.log(JSON.stringify(r, null, 2))
  process.exit(r.pass ? 0 : 1)
}
