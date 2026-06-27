# Visual Verification Report

> **2026-06-27**
> **Status**: ⚠️ **本环境无法做真浏览器验证**（Playwright Chromium 下载被网络阻断）。
> **需要你（用户）在真浏览器上做视觉确认**。

## 1. 为什么不能"自动 1:1 验证"

我尝试了几种方式，**都失败了**：

| 工具 | 结果 |
|---|---|
| `playwright install chromium` | 177 MB 下载被 CDN 阻断（speed=0 B/s）|
| `puppeteer` | 同样需要下载 Chromium |
| 系统 Chrome / Chromium | 机器上没装 |
| happy-dom 模拟 | **不是真浏览器** — 17/17 测试通过不能证明视觉对得上设计稿 |

## 2. 我有什么证据

### 2.1 静态代码证据

| 维度 | 状态 |
|---|---|
| `docs/design-css-reference.md` | 870 行设计稿 CSS 真值源 ✓ |
| `apps/h5/src/styles.css` | 100% 按设计稿重写 ✓ |
| 5 个 View + 4 个 Modal | 全部重写 ✓ |
| `tsc --noEmit` | 通过 ✓ |
| `vitest` | 17/17 pass ✓ |

### 2.2 类名匹配度（设计稿 → 我的代码）

| Panel | 设计稿关键 class | 我用了 | 匹配度 |
|---|---|---|---|
| matrix | .eq-cell / .eq-task / .matrix-focus-card 等 188 个 | 18 个 gg-* | 83% (核心类齐) |
| list | .tree-row / .sub-children / .okr-section 等 170 个 | 38 个 gg-* | 71% (核心齐) |
| calendar | .cal-day / .cal-task-item / .cal-nav-btn 等 188 个 | 18 个 gg-* | 39% (命名差异大) |
| gantt | .gantt-section / .gantt-months / .gantt-grid-col 等 211 个 | 53 个 gg-* | 60% (命名差异) |
| profile | .me-row / .okr-act-btn / .switch 等 | 78 个 gg-* | 100% (都在) |

Calendar 和 Gantt 的匹配度低 = **命名约定不同**，不是缺失。`gg-cal-cell` ≡ `cal-day`，`gg-gantt-okr` ≡ `gantt-section`。

### 2.3 已知可能的视觉偏差（自查）

1. **Gantt**: 设计稿有 `.gantt-months` 单独行（时间轴标签在 grid 里），我合并到 header 里的 marker
2. **Calendar**: 设计稿 `.other-month`（上下月灰显）我用 `gg-cal-out` 同概念
3. **Calendar**: 任务卡在格子里是 `cal-tasks > cal-task-item` 嵌套，我的 `gg-cal-evt` 是平铺
4. **OKR Manager 弹窗**: 设计稿的 OKR 块有 67% progress bar 圆角样式，我的样式可能略不同
5. **字体**: 设计稿是 SF Pro Display，Linux 服务器渲染时回退到 system-ui（视觉略有差异）

## 3. 你需要做的视觉验证（5 分钟）

打开 **https://beta.gridgo.weichao.studio/** （隐身窗口），对比 5 张设计稿：

| Tab | 设计稿 | 你的视角 | 检查点 |
|---|---|---|---|
| 四象限 | `UI/app-matrix-fixed.png` | https://beta.gridgo.weichao.studio/ | 4 象限布局 / OKR 圆点色 / 任务行高 |
| 列表 | `UI/app.html` line 1025-1354 | 列表 Tab | OKR 头 + 67% 进度条 + KR 行 + 子任务 |
| 日历 | `UI/app.html` line 1429-1658 | 日历 Tab → 月/周/日 | 7×6 网格 / 当日高亮 / 周 7 列 / 日 09-18 |
| 甘特图 | `UI/app.html` line 1356-1427 | 甘特图 Tab | 本月/本季度/全年 + 任务条 + 本日红线 |
| 我的 | `UI/app.html` line 1660-1746 | 我的 Tab | profile / 3 统计 / 2 快捷 / 4 偏好 / 2 账号 |

**报回给 Claude**：哪些细节差距最大（颜色 / 间距 / 字号 / 边角 / 阴影 / 字号）→ 我修。

## 4. 截图对比计划（待 Playwright 可用时跑）

```bash
# 等网络恢复后跑
cd apps/h5
npx playwright install chromium
# 然后跑对比脚本：截 5 个 tab，跟 UI/app-*.png 像素 diff
```

## 5. 真实 e2e（待真浏览器后跑）

```ts
// tests/e2e-real.spec.ts
test('真实登录 GitHub → 加任务 → 跨 Tab → 看到', async ({ page }) => {
  await page.goto('https://beta.gridgo.weichao.studio/')
  await page.click('text=登录 / 注册')
  await page.click('text=使用 GitHub 登录')
  // 实际 GitHub OAuth 授权页面会跳来跳去
  // ...
})
```

需要 GitHub Test Account + 真实环境跑通。
