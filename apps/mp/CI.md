# 微信小程序 CI/CD 配置指南

## 方案
**GitHub Actions + miniprogram-ci preview** — 一条命令搞定 build + 上传 + QR

### 为什么是它
- **不需要我们的服务器公网 IP** — miniprogram-ci 走 WeChat 平台 API（云）
- **不需要 AppSecret** — `preview` 用 private key 直连 WeChat 拿 QR
- **IP 白名单默认关** — 不开启的话用 secret key 就能上传（已经够安全）
- **每次 push 自动 build + 上传 + 生成 dev preview QR**

## 一次性配置（用户手动）

### 1. 添加 GitHub repo secrets
进 https://github.com/toolazytoname/GridGo/settings/secrets/actions/new

加 **2 个** secret（**字面值不要 commit**）：

| Secret | 值 | 来源 |
|---|---|---|
| `WX_APPID` | `wx7e05af3fba31d828` | `project.config.json` |
| `WX_PRIVATE_KEY` | PEM 格式 RSA 私钥 | [mp.weixin.qq.com](https://mp.weixin.qq.com) → 开发管理 → 开发设置 → 小程序代码上传 → 生成密钥（下载 .key 文件，**整文件内容**原样粘贴，含 `-----BEGIN RSA PRIVATE KEY-----` 头尾） |

> ⚠️ 只用 **2 个** secret。`WX_PRIVATE_KEY` 必须是 PEM 格式（多行，`-----BEGIN` 开头），
> 不是 32 位 hex 的 AppSecret。把 AppSecret 填进去会报 `20002` 错误。

### 2. 推送代码触发
```bash
git push origin develop   # 自动 build + 上传 + 生成 dev preview QR
```

## 流程
1. push 到 develop（或手动 Run workflow）
2. GitHub Actions 跑 `.github/workflows/mp-ci.yml`
3. install pnpm + miniprogram-ci
4. `miniprogram-ci preview` 一次跑完：
   - 编译（minify wxml/wxss/js）
   - 上传代码到 WeChat 平台
   - 生成 dev preview QR（输出到 `qrcode.png`）
5. 上传 `qrcode.png` 作为 artifact

## 扫码测试
**方式 A — 微信开发者工具（推荐）**：
1. 微信开发者工具 → 添加项目 → 用 appid `wx7e05af3fba31d828`
2. 工具顶部「二维码」按钮 → 扫 artifact 里的 `qrcode.png` → 进 dev preview

**方式 B — 真机**：
- 微信扫 `qrcode.png` → 也能进 dev preview（需要 appid 在 mp 平台配置过）

> dev preview = 开发者测试版，不是体验版。要让"体验成员"扫码进体验版，
> 需要另配 AppSecret + `getwxacodeunlimit`，可以加一个 step 在此基础上扩展。

## 文件
- `.github/workflows/mp-ci.yml` — GitHub Actions workflow
- `apps/mp/CI.md` — 本文档

## 安全
- secret 只在 GitHub repo settings，不在 repo 文件
- 本地 `.keys/` 和 `.env.wechat` 已 gitignore（mode 600）
- 不开 IP 白名单（默认安全）— secret 够防滥用
