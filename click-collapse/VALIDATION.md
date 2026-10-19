# 验收记录

## 当前已执行

- 仓库根规范、README、接入文档和 Pages 工作流已阅读。
- 使用既有 Git 仓库的独立 worktree，不碰原工作区的未提交内容。
- `npm run check`、`npm test`（7/7）、`npm run build` 通过。
- 24 关 × 两条固定步输入 × 四个整体朝向，共 192 条同引擎物理回放全部成功。可见锚点和前后展开梁包含在最终回放中。
- CDN：固定版本 Three.js 0.160.0 / cannon-es 0.20.0 返回 HTTP 200。

## 环境阻塞，不算通过

`npm run verify:pages` 无法启动：当前 Playwright 所需 Chromium 缺失，安装下载返回无效压缩包。改用已有 Chromium 134 时，受限环境禁止其创建 Unix socket；申请启动权限也被自动审批策略拒绝。没有修改仓库检查脚本来掩盖失败。

因此本地桌面/触屏真实交互、GPU draw call、帧率、主循环 JS p95、截图路线尚未验收。将使用发布后的线上浏览器补查，并记录实际结果；没有把物理回放或静态构建冒充浏览器通过。
