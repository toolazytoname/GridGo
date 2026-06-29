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

加 2 个：
- `WX_APPID` = `wx7e05af3fba31d828`
- `WX_PRIVATE_KEY` = `9c561358ccb67ca610a6f2dbbb5b5706`

> ⚠️ **隐私**：这些值已 gitignore 到 `apps/mp/.env.wechat`，**不要再 commit** 到 repo。只通过 GitHub web 界面粘贴。

### 2. 推送代码触发
```bash
git push origin develop   # 自动 build + 上传 + 设开发版
```

## 流程
1. push 到 develop
2. GitHub Actions 跑 `.github/workflows/mp-ci.yml`
3. install pnpm + miniprogram-ci
4. build（minify wxml/wxss/js）
5. upload code 到 WeChat 平台
6. 设成开发版（开发版扫码就是最新）
7. 输出体验版二维码链接

## 扫码测试
- 微信开发者工具 → 添加项目 → 公众号测试号 → 用 appid
- 或：访问 `https://api.weixin.qq.com/wxa/getwxacodeunlimit?...` 拿体验版二维码

## 文件
- `.github/workflows/mp-ci.yml` — GitHub Actions workflow
- `apps/mp/CI.md` — 本文档

## 安全
- secret 只在 GitHub repo settings，不在 repo 文件
- 本地 `.env.wechat` 已 gitignore（mode 600）
- 不开 IP 白名单（默认安全）— secret 够防滥用
