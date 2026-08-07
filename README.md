# OfferTrack

> A private, local-first desktop job application tracker.
> 一个完全本地运行的个人求职 / 秋招进度管理桌面工具。

OfferTrack 用于记录投递、招聘流程、笔试和面试安排、复盘笔记，以及每个职位对应的简历版本。它不会上传你的求职记录到服务器，所有数据都存储在你自己的设备上。

## Download

请前往 GitHub 仓库的 **Releases** 页面下载对应安装包：

| 系统 | 下载文件 |
| --- | --- |
| Windows x64 | `OfferTrack-Setup-x.x.x.exe` |
| macOS Apple Silicon（M1 / M2 / M3 / M4 / M5） | `OfferTrack-x.x.x-arm64.dmg` |
| macOS Intel | `OfferTrack-x.x.x-x64.dmg` |

目前暂不提供 Linux、Android 或 iOS 版本。

### 未签名应用提示

- Windows：首次运行未签名安装包时，Microsoft Defender SmartScreen 可能提示保护信息。请确认来源是本仓库的 Release 后，选择 **More info → Run anyway**。
- macOS：未签名、未 notarize 的应用可能被 Gatekeeper 拦截。请在 Finder 中右键应用选择 **Open**，或在 **System Settings → Privacy & Security** 选择 **Open Anyway**。

这些是操作系统的正常安全提示；OfferTrack 不会尝试绕过它们。

## Privacy

OfferTrack does not upload your job application records to a server.

Your data is stored locally on your own device. 桌面版数据库和简历附件位于 Electron 的用户数据目录：Windows 通常为 `%APPDATA%/OfferTrack`，macOS 通常为 `~/Library/Application Support/OfferTrack`。实际位置由系统安全地提供给应用，不会硬编码用户目录。

## Features

- 投递记录：公司、职位、地点、渠道、链接、状态与备注
- 每份投递独立的自定义招聘阶段，可排序、安排时间和记录复盘
- 笔试、测评、面试的日历视图与 Upcoming 提醒
- 每个职位单独上传并保存简历版本
- Dashboard 总览、状态筛选、搜索与排序
- 本地 JSON 数据备份、恢复与数据目录打开入口
- SQLite 本地持久化；无账号、无云同步、无遥测

## Development

需要 Node.js 20 或更新版本：

```bash
npm install
npm run dev
```

开发版数据库位于 `prisma/dev.db`。如需加载**可删除的演示数据**，运行 `npm run db:seed`；它会先清空开发数据库，请勿在个人数据上运行。

## Desktop build

桌面版以 Electron 承载现有的 Next.js UI，并在首次启动时自动创建用户自己的 SQLite 数据库，无需用户运行 Prisma 命令。

```bash
# 本机预览桌面应用
npm run desktop:dev

# Windows x64 安装包
npm run dist:win

# macOS x64 + arm64 DMG（请在 macOS 或 GitHub Actions macOS runner 中运行）
npm run dist:mac
```

产物写入 `release/`，不会提交到 Git。macOS 安装包必须在 macOS runner 上构建和验证；Windows 不能可靠地生产或验证 macOS DMG。

## Release

推送标签会触发 GitHub Actions，以 Windows 与 macOS runner 分别构建并发布安装包：

```bash
git tag v1.0.0
git push origin v1.0.0
```

## Project data and Git

`.env`、本地数据库、SQLite journal、上传简历、`node_modules`、`.next`、`dist` 与 `release` 都已被 `.gitignore` 排除。请勿提交真实求职记录、备份文件或任何 Secret。
