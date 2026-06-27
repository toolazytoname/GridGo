# GridGo BACKLOG

> Plan agent 的唯一事实源。每个 feature 由 Dev sub-agent 实现、Test sub-agent 评分、合入 develop。
>
> 状态机：`ready` → `in-progress` → `done` | `blocked`
> 阈值 ≥ 80 才算 done。

## 设计稿对照（**scope 已收紧到主 App**）

| 区域 | 设计稿文件 | Tab | 已拆 feature |
|---|---|---|---|
| **主 App** | **UI/app.html** | **5 Tab** | **F-001..F-024（活跃）** |
| 移动端 | UI/mobile-ios.html, mobile-android.html | — | F-025..F-028（deferred） |
| 落地页 | UI/landing.html | — | F-029..F-031（deferred） |
| 小组件 | UI/widgets.html | — | F-032..F-034（deferred） |

> **本阶段**只做 app.html 的 5 Tab + 弹窗 + Auth。其它范围暂搁置。

---

## P0：基础设施（必须先有）

### F-001: monorepo 脚手架 + Vercel 部署 H5
- 验收：apps/h5 `pnpm dev` 起 5173，`pnpm build` 出 dist/h5，Vercel 用 root=apps/h5 部署成功
- 依赖：无
- 状态：**done** (2026-06-27 · v0.1.0 · build 160KB→51KB gz · 56 modules)

### F-002: 设计 token + 跨端基础样式
- 验收：packages/ui/styles/tokens.css 含完整 OKLCH 变量；apps/h5 引用后页面 1:1 还原
- 设计稿参考：UI/app.html `:root` 段
- 依赖：F-001
- 状态：**done** (2026-06-27)

### F-003: Supabase schema + RLS
- 验收：本地 `supabase start` 起；4 张主表（profiles/okrs/key_results/tasks）+ 3 张辅助（subtasks/achievements/calendar_events）；RLS 启用
- 依赖：F-001
- 状态：ready

### F-004: Supabase Auth（GitHub OAuth + 邮箱魔法链接）
- 验收：登录按钮点开走 GitHub OAuth，登录后 supabase.auth.getUser() 拿到用户
- 依赖：F-003
- 状态：ready

### F-005: 测试 + 评分框架
- 验收：vitest 跑通示例；playwright 能截图；score.mjs 能聚合 visual/test/llm 三项；阈值 80
- 依赖：F-001
- 状态：ready

### F-006: 主循环编排（loop.mjs 接 sub-agent）
- 验收：pnpm loop 跑一轮：选 feature → dev → test → score → 合 develop → 触发下一轮
- 依赖：F-005
- 状态：ready

### F-007: CI：GitHub Actions + Vercel + develop/main 保护
- 验收：push develop 触发 Actions 跑 vitest+playwright+score；main 受保护（需 PR + 1 review）
- 依赖：F-006
- 状态：ready

---

## P1：核心 Tab（apps/h5）

### F-010: 顶栏 Topbar（品牌 + OKR 选择器 + 搜索/通知/分享 + 头像）
- 验收：UI/app.html 877-893 行；`grid-template` 撑开，OKR 选择器点开 OKR Manager
- 设计稿：UI/app.html
- 依赖：F-002, F-004
- 状态：**done** (2026-06-27)

### F-011: 底栏 Tab Bar（5 个 Tab + 激活态）
- 验收：UI/app.html 1799-1821 行；激活态顶部 2.5px 蓝条 + 颜色切到 accent
- 设计稿：UI/app.html
- 依赖：F-002
- 状态：**done** (2026-06-27)

### F-012: 四象限 Eisenhower 矩阵（全部/今日/本周 子 Tab）
- 验收：UI/app.html 905-1023 行；2x2 网格，每格可加任务；勾选状态；OKR 色点
- 设计稿：UI/app.html 905-1023；UI/app-matrix-fixed.png
- 依赖：F-003, F-010, F-011
- 状态：**done** (2026-06-27) — 静态 seed 数据，Supabase 接入下轮

### F-013: 列表 Tab（OKR 树：进行中 / 已完成 子 Tab）
- 验收：UI/app.html 1025-1354 行；OKR > KR > 子任务 树；搜索框；空状态/完成态
- 设计稿：UI/app.html
- 依赖：F-012
- 状态：ready

### F-014: 日历 Tab（月 / 周 / 日 三视图）
- 验收：UI/app.html 1429-1658 行；月视图网格，周视图 7 列，日视图时段
- 设计稿：UI/app.html 1429-1658
- 依赖：F-012
- 状态：ready

### F-015: 甘特图 Tab（本季度 / 全年）
- 验收：UI/app.html 1356-1427 行；横轴时间，纵轴任务，OKR 着色
- 设计稿：UI/app.html 1356-1427
- 依赖：F-012
- 状态：ready

### F-016: 我的 Tab（Profile + 统计 + OKR 入口 + 设置）
- 验收：UI/app.html 1660-1746 行；头像/数据条/快捷卡片/设置分组
- 设计稿：UI/app.html 1660-1746
- 依赖：F-004
- 状态：ready

---

## P2：弹窗与编辑

### F-020: 添加/编辑任务 Modal
- 验收：UI/app.html 1823+ 行；标题、所属 OKR、象限、优先级、日期、时长、备注
- 设计稿：UI/app-task-detail.png
- 依赖：F-012
- 状态：ready

### F-021: OKR Manager 弹窗
- 验收：UI/app.html 1835+ 行；增删 OKR，选 OKR（o1-o4 颜色），编辑 KR
- 设计稿：UI/app-okr-mgr.png
- 依赖：F-003
- 状态：ready

### F-022: 任务详情/编辑 Modal（查看 ↔ 编辑切换）
- 验收：UI/app.html 1917+ 行；只读模式：标题/OKR/日期/子任务/备注；编辑模式同 F-020
- 设计稿：UI/app-task-detail.png
- 依赖：F-020
- 状态：ready

### F-023: 登录/注册 Modal
- 验收：UI/app.html 2031+ 行；GitHub OAuth 按钮 + 邮箱登录 tab
- 设计稿：UI/app.html
- 依赖：F-004
- 状态：ready

### F-024: 分享弹窗（生成只读链接 + QR）
- 验收：UI/app.html 1747+ 行；选日历/甘特生成 ?shared=URL；预览卡
- 设计稿：UI/app.html
- 依赖：F-014, F-015
- 状态：ready

---

## P3：移动端适配

### F-025: iOS 端原生壳（Capacitor / Taro-RN 优先 Capacitor）
- 验收：safe-area 完整；左上角返回手势；刘海屏 padding
- 设计稿：UI/mobile-ios.html
- 依赖：F-016
- 状态：ready

### F-026: Android 端原生壳
- 验收：同上 + Material 3 主题色覆盖
- 设计稿：UI/mobile-android.html
- 依赖：F-025
- 状态：ready

### F-027: 移动端底部 Tab + 顶栏
- 验收：移动端断点 <768 切换到底部 5 Tab；桌端 >768 用侧边栏
- 设计稿：UI/mobile-ios.html, mobile-android.html
- 依赖：F-011
- 状态：ready

### F-028: 推送通知（每日 09:00 提醒 + 截止前 24h）
- 验收：本地通知 + Web Push（iOS Safari 不支持 PWA push，Android Chrome 支持）
- 设计稿：UI/app.html 设置中"通知提醒"
- 依赖：F-025
- 状态：ready

---

## P4：增长面

### F-029: 落地页（marketing）
- 验收：UI/landing.html；hero + features + 下载 CTA
- 设计稿：UI/landing.html
- 依赖：F-001
- 状态：ready

### F-030: SEO + 站点地图
- 验收：sitemap.xml + robots.txt + Open Graph 元信息
- 依赖：F-029
- 状态：ready

### F-031: 落地页 → App 转化埋点
- 验收：注册转化漏斗（hero 滚动深度、CTA 点击、注册完成）
- 依赖：F-029, F-004
- 状态：ready

### F-032: 主屏小组件（iOS Widget）
- 验收：UI/widgets.html；Today 4 个 widget：今日任务/本周聚焦/连胜/今日 OKR
- 设计稿：UI/widgets.html
- 依赖：F-025
- 状态：ready

### F-033: 微信小程序构建产物
- 验收：`pnpm build:mp-weixin` 产出可上传到微信开发者工具的 dist
- 依赖：F-016
- 状态：ready

### F-034: 抖音/支付宝小程序构建产物
- 验收：同上
- 依赖：F-033
- 状态：ready

---

## 完成定义（DoD）

每条 feature 视为 done 当且仅当：

1. **代码**：合入 develop 分支（不在 main，不在 feature 分支长期留）
2. **单测**：覆盖关键路径，vitest 通过
3. **E2E**：playwright 跑核心流程通过
4. **视觉**：截图 diff < 20% 不匹配区域（或 ≥80 分）
5. **代码质量**：LLM 评审 ≥80 分；无 linter error
6. **BACKLOG.md**：状态改为 `done`，附上最终总分
