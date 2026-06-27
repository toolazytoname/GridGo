# AGENTS.md — Sub-Agent 协作约定

> 给所有 sub-agent（Dev / Test / Plan）的硬性规则。读这份文件是开工前必做。

## 0. 启动前必读

每个 sub-agent 启动时，**只**接收以下信息（避免主对话上下文污染）：

- `BACKLOG.md` 当前全文
- `packages/types/src/index.ts`（数据契约）
- `packages/ui/styles/tokens.css`（设计 token）
- 该 feature 的 spec（由 Plan agent 从 BACKLOG 提取）
- 上次尝试的扣分清单（如果是重试）

**不要**把主对话历史传给 sub-agent。

## 1. Dev Sub-Agent 规则

### 工作流
1. 读 BACKLOG.md 中自己的 feature 条目
2. 读设计稿对应 section（在 UI/ 下）
3. 在 feature 分支工作（`feature/F-XXX`），**不要直接动 develop**
4. 写代码 + 单测
5. `pnpm --filter @gridgo/h5 test` 通过
6. `pnpm --filter @gridgo/h5 typecheck` 通过
7. `pnpm --filter @gridgo/h5 lint` 通过
8. 提 PR 到 develop：`feature/F-XXX` → `develop`
9. 写 `feature/F-XXX.done.md`（≤300 字：做了什么 / 怎么测 / 已知限制）

### 编码规约
- TypeScript strict，禁用 `any`（用 `unknown` + 类型守卫）
- 组件 ≤150 行；超过就拆
- 优先用 `@gridgo/ui` 的 token，**禁止硬编码颜色/字体/间距**
- 数据访问必须走 `@gridgo/api`（直接 supabase 客户端禁止散落在 components 里）
- 表单必须有 loading / error / empty 三态
- 写 1-2 个最关键的 unit test，不追求覆盖率

### 提交规约
- commit message 格式：`F-XXX: <动词> <对象>`，例：`F-012: 实现四象限矩阵 + 任务勾选`
- 每个 feature 一次 PR，PR 描述里 link 设计的 section

## 2. Test Sub-Agent 规则

启 3 个并行 sub-agent：

### 2.1 视觉回归（visual.json）
- 跑 `pnpm --filter @gridgo/h5 test:e2e` 生成截图
- 与设计稿 `UI/<section>.png` 做像素 diff
- 评分 0-100（diff 像素占比越低越高）
- 输出 `{ score, notes: "差异点说明" }`

### 2.2 自动化测试（test.json）
- 跑 vitest
- 评分 = 0.5 × 覆盖率(0-100) + 0.5 × 通过率(0-100)
- 输出 `{ score, coverage, passed, failed, notes }`

### 2.3 LLM 代码评审（llm.json）
- 读 diff，读 BACKLOG 的 DoD
- 评分维度（各 0-25，加总 0-100）：
  - **正确性**：是否实现验收标准
  - **健壮性**：错误处理 / 边界情况
  - **可读性**：命名 / 注释 / 结构
  - **复用**：用了现有 token / type / 组件
- 输出 `{ score, breakdown, notes: "改进建议清单" }`

## 3. Score Aggregator

由 `packages/scoring/score.mjs` 计算：
- total = visual × 0.4 + test × 0.35 + llm × 0.25
- total ≥ 80 → pass → 合 develop → 触发下一轮
- total < 80 → fail → 把 deductions 列表回传 Dev sub-agent 重做

## 4. 安全网

- 单 feature 重试 ≤ 3 次
- 3 次仍 < 80 → 标记 `blocked`，写入 `BLOCKED.log`
- 连续 3 个 feature 触发 `blocked` → 停机，ping 用户

## 5. 不要做的事

- ❌ 不要改 main 分支
- ❌ 不要在 main 上 force push
- ❌ 不要硬编码设计 token（必须从 packages/ui 引用）
- ❌ 不要把 supabase service_role key 写进前端代码
- ❌ 不要在 PR 里塞无关改动（lint 顺手修可以，但单独 commit）
- ❌ 不要在 BACKLOG.md 里手动改 status（合 PR 时由 Plan agent 改）
- ❌ 不要在 UI/ 目录写任何东西（那是设计稿）
- ❌ 不要在 sub-agent 之间共享临时文件（每个 agent 自己的 scratch 放 `.scratch/<feature-id>/`）
