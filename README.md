# 小创意游乐场 · Idea Playground

一个主入口，进入各自独立的小创意。可以在本机一键启动，也可以构建为 GitHub Pages 静态网站。

仓库：<https://github.com/XVSHIFU/idea-playground>。尚未部署时，下方命令可以先在本地使用；预期 Pages 地址为 <https://xvshifu.github.io/idea-playground/>，是否上线以 Actions 部署结果为准。

## 本机打开与关闭

需要 Node.js 22+。双击根目录 `启动.cmd`，访问 <http://127.0.0.1:4200>。点击作品后按需启动对应本机端口；不用逐个启动项目，也不用安装依赖。双击 `停止.cmd` 关闭主入口及由它启动的服务；仅关闭浏览器不会停止服务。独立启动的作品服务不受影响。

也可以执行 `npm start`，结束时按 Ctrl+C。用 `idea-playground.code-workspace` 打开总工作区，各作品原有工作区也保留。

## 目录

```text
idea-playground/
  idea-hub/                主入口、作品清单、截图及本机服务
  link-creatures/          链接生物
  cache-city/              缓存之城
  background-gods/         后台诸神
  mirror-7/                错误地球档案馆
  protocol-zoo/            协议动物园
  grammar-time-board/     昨天今天明天
  clay-auction/            越抢越变形的拍卖会
  syntax-path/             句法小径，已登记为隐藏草稿
  panel-adapt-check/       原有检查工具，不作为作品发布
  tools/                  构建、接入初始化与验证工具
  docs/                   接入约定
  .github/workflows/      构建与 Pages 部署
  dist/                   自动生成的站点，不提交 Git
```

原有两份 `.plan.md` 和《构思笔记-小实验五则》保留在根目录。开发文档随仓库保存；Pages 构建只复制明确登记的网页资源。

## 构建与预览线上版本

```sh
npm run check
npm test
npm run build
npm run preview
```

访问 <http://127.0.0.1:4201/idea-playground/>。预览刻意使用仓库子路径，检查上线后的路径兼容性。以上命令仅使用 Node 标准库，不需要 npm install。`build` 会重建 `dist/`，不要手改生成文件。

Pages 版直接读取静态 `catalog.json`，从 `projects/<id>/` 打开作品，不启动本机进程。用户不需要安装 Node，你的电脑也无需保持开机。

浏览器存档仍在访问者自己的设备中，本机和线上存档不会自动互通。当前多人作品是同屏轮流操作，没有新增远程联机。

## 添加新创意

```sh
npm run project:new -- paper-moon --name "纸月亮"
```

生成独立目录、HTML/CSS/JS 起点、工作区、README、`integration.json`，并登记为隐藏草稿。完成作品后填写简介、首次操作提示与公开文件清单，再启用：

```sh
npm run project:add -- paper-moon --enable
npm run check
npm run build
```

重启本地主入口即可刷新清单。已有项目也可放到根目录，提供 `integration.json` 后运行 `project:add`。不带 `--enable` 会将该项目登记为草稿。完整字段、资源边界与其他会话交接模板见 [接入说明](docs/ADDING_PROJECTS.md)。

## GitHub Pages 发布

1. 将源码推送到 `main`。
2. 在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
3. 查看 **Actions → Build and publish playground**。如果首次推送时尚未设置 Pages，完成设置后手动 Run workflow 或重新运行失败任务。

工作流会校验清单、运行入口工具测试、构建 `dist`，成功后部署。PR 只构建，不发布。配置采用 [GitHub Pages 官方自定义工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。

远端设定为 `https://github.com/XVSHIFU/idea-playground.git` 时，首次推送命令是：

```sh
git push -u origin main
```

## 开发检查

浏览器检查仅开发时需要 Playwright：`npm ci` 后执行 `npm run verify:pages`。本机默认使用 Edge；Linux 可先执行 `npx playwright install --with-deps chromium`，再设置 `BROWSER_CHANNEL=chromium`。验证器也可通过 `PLAYWRIGHT_PATH` 使用已有安装。

各作品原有测试仍在其目录。根测试聚焦入口、接入、构建及资源范围，不替代各作品的玩法验证。

## 迁移说明

本仓库由原 TEMP 中的项目归拢而来，作品相邻关系和本机端口保留。原 `background-gods/.git` 是尚无提交的独立 Git 初始化目录，已完整保存在本地 `.local-backups/background-gods.git`，不上传；源码由根仓库统一跟踪。旧文档中的 TEMP 绝对路径可能描述迁移前的位置，当前以本 README 和相对路径为准。

未默认添加整库开源许可证；第三方字体及其现有许可随原项目保留。
