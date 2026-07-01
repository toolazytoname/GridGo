# 微信小程序 CI/CD 配置指南

## 方案
**GitHub Actions + miniprogram-ci** — 最省事方案

### 为什么是它
- **不需要我们的服务器公网 IP** — miniprogram-ci 走 WeChat 平台 API（云）
- **IP 白名单默认关** — 不开启的话用 secret key 就能上传（已经够安全）
- **每次 push 自动 build + 上传 + 设开发版**
- **二维码扫码就是最新测试版**

## 一次性配置（用户手动）

### 1. 添加 GitHub repo secrets
进 https://github.com/toolazytoname/GridGo/settings/secrets/actions/new

加 **3 个** secret（**字面值不要 commit**）：

| Secret | 值 | 来源 |
|---|---|---|
| `WX_APPID` | `wx7e05af3fba31d828` | `project.config.json` |
| `WX_PRIVATE_KEY` | PEM 格式 RSA 私钥 | [mp.weixin.qq.com](https://mp.weixin.qq.com) → 开发管理 → 开发设置 → 小程序代码上传 → 生成密钥（下载 .key 文件，**整文件内容**原样粘贴，含 `-----BEGIN RSA PRIVATE KEY-----` 头尾） |
| `WX_APP_SECRET` | 32 位 hex 字符串 | 同上 → 公众号开发信息 → AppSecret（重置后才会显示） |

> ⚠️ **两个 key 长得像但用途不同**：
> - `WX_PRIVATE_KEY` = **PEM 私钥**（多行，`-----BEGIN` 头）→ 给 miniprogram-ci 上传代码
> - `WX_APP_SECRET` = **32 位 hex**（一行）→ 给 WeChat API 取 `access_token` 生成体验二维码
>
> 把 AppSecret 填进 `WX_PRIVATE_KEY` 会报 `20002` 错误。

### 2. 推送代码触发
```bash
git push origin develop   # 自动 build + 上传 + 生成体验二维码
```

## 流程
1. push 到 develop（或手动 Run workflow）
2. GitHub Actions 跑 `.github/workflows/mp-ci.yml`
3. install pnpm + miniprogram-ci
4. **build**（minify wxml/wxss/js）— 用 `WX_PRIVATE_KEY`（PEM）
5. **upload** 到 WeChat 平台，设成开发版 — 同样用 `WX_PRIVATE_KEY`
6. **取 access_token**（用 `WX_APP_SECRET`）→ 生成体验版二维码
7. 上传 `qrcode.png` 作为 artifact

> 二维码那一步如果 `WX_APP_SECRET` 没设 / 错了，会打印警告并跳过；**不影响** build + upload。

## 扫码测试
- 微信扫 artifact 里的 `qrcode.png` → 进体验版
- 首次需要管理员在 mp.weixin.qq.com → 成员管理 → 添加体验成员
- 之后再 push，体验成员无需重新扫码，自动更新

## 文件
- `.github/workflows/mp-ci.yml` — GitHub Actions workflow
- `apps/mp/CI.md` — 本文档

## 安全
- secret 只在 GitHub repo settings，不在 repo 文件
- 本地 `.keys/` 和 `.env.wechat` 已 gitignore（mode 600）
- 不开 IP 白名单（默认安全）— secret 够防滥用
