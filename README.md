# GridGo · 格行

> 一格一事，循格而行 — 跨端个人 OKR / 任务管理 App。

## 当前状态

**v0.1.0 — 脚手架**。还没有功能，正在等 Vercel 接入。

进度看 [BACKLOG.md](./BACKLOG.md) 和 TaskList。
sub-agent 协作约定看 [AGENTS.md](./AGENTS.md)。

## 技术栈

- 跨端：Taro 4 + React 18 + TypeScript
- 状态：Zustand
- 样式：UnoCSS + 设计 token（packages/ui）
- 后端：Supabase（PG + Auth + Realtime）
- 部署：Vercel（H5）
- 测试：Vitest + Playwright

## 仓库结构

```
gridgo/
├── apps/
│   ├── h5/         # Taro-H5 → Vercel
│   ├── miniprogram/# 未来：微信/抖音/支付宝
│   └── mobile/     # 未来：iOS/Android (Taro-RN 或 Capacitor)
├── packages/
│   ├── ui/         # 设计 token + 跨端组件
│   ├── types/      # 共享 TS 类型
│   ├── api/        # Supabase 客户端封装
│   ├── store/      # Zustand stores
│   └── scoring/    # 评分 + 主循环脚本
├── supabase/       # migrations + edge functions
├── UI/             # ⚠️ 设计稿（不要修改）
├── BACKLOG.md
├── AGENTS.md
└── README.md
```

## 本地开发

```bash
pnpm install
pnpm dev               # 起 H5 @ http://localhost:5173
pnpm build             # 出 dist/h5
pnpm test              # 单测
pnpm test:e2e          # Playwright
pnpm loop              # 跑一轮 dev → test → score 循环
```

## 部署

- **H5 (Vercel)**：连接 GitHub repo，root=`apps/h5`，framework=Other，构建命令=`pnpm install && pnpm build`，输出目录=`apps/h5/dist/h5`
- **Supabase**：`supabase start` 本地；`supabase db push` 推远程
- **小程序**：构建产物用对应开发者工具上传（不能 CI 自动）

## 主循环

`packages/scoring/loop.mjs` 驱动：
1. Plan agent 读 BACKLOG，挑下一个 `status: ready` 的 feature
2. 启 Dev sub-agent（隔离上下文）→ 写代码 + 测 + 提 PR
3. 启 3 个并行 Test sub-agent → 视觉 diff / 自动化 / LLM 评审
4. 评分聚合：视觉 40 + 测试 35 + LLM 25，阈值 80
5. ≥80 合 develop，<80 把扣分清单回 Dev 重做（≤3 次）
6. 合 develop 后立刻触发下一轮

事件驱动（不是定时器）。连续 3 个 BLOCKED 停机。
