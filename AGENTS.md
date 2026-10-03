# 小创意游乐场协作约定

- 本仓库是一组独立网页作品与统一入口。先读根 README，接入约定见 `docs/ADDING_PROJECTS.md`，不必逐个通读其他项目源码。
- 在具体项目目录开发，保留其 `.code-workspace`。不要新建嵌套 `.git`；所有源码由根仓库跟踪。
- `idea-hub/projects.json` 是入口与构建使用的清单。新项目用 `npm run project:new -- <id> --name "名称"` 创建；默认草稿，不出现在目录与部署产物中。
- 更新项目的 `integration.json` 后，运行 `npm run project:add -- <id> --enable` 登记。预览图可选，缺图显示名称，不用虚构截图。
- 网页资源使用相对路径；不得依赖本机端口、绝对磁盘路径、远端密钥或 Node 服务。需要后端时先明确接入方案。
- 浏览器存储、BroadcastChannel、Web Locks 使用项目独有前缀；Pages 上的项目共享域名，不能假定路径隔离存储。
- `files` 和 `publicDirectories` 只允许真正可公开的资源。不要登记服务脚本、测试、环境文件、开发记录或依赖目录。
- 接入和构建逻辑修改后运行 `npm run check`、`npm test`、`npm run build`；修改网页路径或多页导航时运行 `npm run verify:pages`。不为简单文案改动全跑各作品玩法测试。
- 提交前检查 `git diff --cached`，不提交本地备份、运行日志、依赖、测试截图和 `dist`。未获发布指令前，不执行推送或 Pages 设置变更。
- 当前只读参考用户知识库 `E:/AI-AGENT/project-practice-kb/README.md`；不存在该路径的环境直接遵循本仓库说明，不将个人路径当依赖。
