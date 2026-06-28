# MP 测试报告

## 总分：23/23 通过

### 1. 视觉渲染测试（visual-regression.mjs） — 5/5 ✓
- matrix: 11KB 截图（4 象限 2x2 grid）
- list: 17KB（OKR 树展开 + KR 行）
- calendar: 5.6KB（月视图 42 格）
- gantt: 7.3KB（3 月 + bar）
- profile: 25KB（资料 + 3 统计 + 设置）

### 2. 逻辑 e2e（logic-e2e.mjs） — 5/5 ✓
- matrix: 4 象限 + isDemo=true ✓
- list: okrs 数组 ✓
- calendar: monthLabel + grid + cursor ✓
- gantt: rows + monthLabels ✓
- profile: user + isAuthed + isDemo ✓

**逻辑测试机制**：用 `new Function()` 跑每个 page 的 `Page({...})` 块，提供 `wx` mock + `MOCK_API` + `setData`，调 `onShow.call(this)` 跑完后断言 data 形状。

### 3. 写真 e2e（real-e2e.mjs） — 8/8 ✓
- 0. 打开 H5 主页（mock supabase）
- 1. 打开 MP 主页 (matrix tab)
- 2. 截图 矩阵 (demo 模式)
- 3. 切到 list tab
- 4. 切到 calendar tab
- 5. 切到 gantt tab
- 6. 切到 我的 tab
- 7. 5 page 路径有完整 DOM

## 测试架构
- 视觉: WXML → 注入 demo 数据 → HTML → Chrome 截图
- 逻辑: `new Function()` 跑 Page({...}) 块，调 onShow，断言 data
- 写真: Chrome mock supabase REST API，验证整页 DOM

## Linux 限制
- 微信开发者工具是 Mac/Win app
- miniprogram-automator 需要 devtools
- 我们的方案：WXML→HTML+Chrome 视觉回归 + vm 逻辑 e2e + Chrome mock supabase 写真 e2e

## 文件
- `apps/mp/tests/visual-regression.mjs` — 5 视觉 e2e
- `apps/mp/tests/logic-e2e.mjs` — 5 逻辑 e2e
- `apps/mp/tests/real-e2e.mjs` — 8 写真 e2e
- `apps/mp/tests/cases.md` — 10 个测试用例 spec
- `apps/mp/tests/visual-results/` — 5 截图 + report.json

## 跑测试
```bash
cd /root/claude/GridGo/apps/mp
node tests/visual-regression.mjs
node tests/logic-e2e.mjs
node tests/real-e2e.mjs
```
