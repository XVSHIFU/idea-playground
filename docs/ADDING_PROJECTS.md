# 新作品初始化与接入

## 从零开始

在仓库根运行 `npm run project:new -- paper-moon --name "纸月亮"`。英文 id 用小写字母、数字和连字符，目录不可重名。工具分配 4300–4399 中未被清单占用的端口，并创建隐藏草稿；实际端口若被其他程序占用，本地入口会提示，不会结束无关进程。

开发时可以直接打开生成的 `index.html` 检查基础互动，或使用自己的静态预览工具。需要模块时必须通过 HTTP 预览。各目录只保留自己的代码；公共接入约定集中在本页。

## integration.json

```json
{
  "id": "paper-moon",
  "name": "纸月亮",
  "category": "互动实验",
  "description": "用一句话说明可以体验什么。",
  "hint": "说明第一次可以做的一个动作。",
  "label": "折叠 · 光影",
  "color": "#e5eaf5",
  "directory": "../paper-moon",
  "port": 4300,
  "entry": "index.html",
  "required": ["index.html", "style.css", "app.js"],
  "files": ["index.html", "style.css", "app.js"],
  "publicDirectories": [],
  "identity": "纸月亮",
  "enabled": false
}
```

`directory` 相对于 `idea-hub`，必须对应根目录同名作品。`identity` 是 HTML 初始 title 中的一段作品专属文字，用于本机端口已占用时识别已有服务。

`files` 精确列出允许公开的文件；`publicDirectories` 递归公开其所有文件，适合专门的图片、字体、音频目录。不要把仓库根、依赖目录、测试、服务器、环境文件放进去。第三方资源的许可证也要随资源保留。

`required` 全部存在才使用 `entry`。可另设 `fallback` 和 `fallbackLabel`，如完整网页未就绪时打开现成纸笔材料。没有完整入口或可用回退时，启用校验会失败。网页已存在但功能是否完成，仍需维护者实际验证。

`integration.json` 是项目交接资料，主入口真正读取的是 `idea-hub/projects.json`。修改后运行登记命令同步，避免维护两份互相矛盾的描述：

```sh
npm run project:add -- paper-moon --enable
```

不带 `--enable` 表示登记为草稿，会从本机目录和发布产物中排除。已有项目如果只是修正描述，仍需带 `--enable` 保持启用。

## 网页兼容要求

- 资源和站内链接使用 `./style.css`、`assets/photo.png`、`../index.html` 等相对路径。不能假定部署在域名根目录。
- Pages 不运行 Node 后端，不使用 `/api/...`、localhost URL 或磁盘路径作为在线依赖。
- 不嵌入 iframe，作品在新标签页独立打开。可以给作品加相对返回链接，但不要依赖 opener。
- 存储键、频道名、锁名以项目 id 为前缀；同一 GitHub Pages 域名共享这些命名空间。不要调用 `localStorage.clear()` 清除其他作品存档。
- 不读取密钥或账户配置。确实需要后端、联网 API 或联机房间时，先提供具体方案，不直接套用静态接入。

## 预览图

已启用作品需要实际页面截图。首次使用先在仓库根执行 `npm ci`。Windows 默认使用 Edge，其他系统可执行 `npx playwright install chromium` 安装截图用的浏览器。

```sh
npm run preview:capture                       # 补齐已启用作品缺少的预览
npm run preview:capture -- paper-moon         # 更新指定作品的预览
```

命令会构建并临时启动 Pages 预览，用独立浏览器会话截图。截图放在 `idea-hub/public/previews/<id>.png`，来源记录写入 `idea-hub/.impeccable/preview-origins.json`，两者一起提交。截图后运行 `npm run build` 将新图打包进 `dist`。`npm run check` 会报告已启用但缺图的作品。

## 验证与提交

```sh
npm run check
npm test
npm run build
npm run preview
```

在 `/idea-playground/` 下检查新入口、图像、字体、子页面、分享链接、刷新和存档恢复；路径调整后再运行 `npm run verify:pages`。校验只证明资源与接入正常，不证明游戏平衡或可玩性。

检查 Git 差异后再提交源码与目录记录，不提交 `dist`、`node_modules`、测试截图和 `.runtime`。推送 `main` 后会触发 Pages 发布。

## 发给其他会话

> 当前总仓库是 idea-playground，请在根目录的独立项目文件夹开发，先读根 AGENTS.md 和 docs/ADDING_PROJECTS.md。可用 `npm run project:new -- <英文id> --name "作品名"` 初始化隐藏草稿。完成时提供一句话简介、不剧透的首次动作、入口文件、必需资源与公开资源清单、静态托管限制、存储和标签页要求以及实际验证结果。更新 integration.json 后执行 `npm run project:add -- <id> --enable`，再用 `npm run preview:capture` 补齐截图。不要新建嵌套 Git 仓库，不修改其他作品，不自行推送或发布。
