# 小创意游乐场
<!-- impeccable:product-schema 1 -->

## Platform
web

## Users
项目所有者希望在一个主入口浏览并进入本项目已有的小创意。

## Product Purpose
集中发现与启动已有作品。各项目保持独立，入口不重写玩法。

## Stack
沿用相邻项目的 Node.js 标准库与原生 HTML/CSS/JS；没有新增运行依赖。

## Operating Context
独立目录与编辑器工作区，现已归入上级 idea-playground 总仓库。保留本机一键启动；另外提供用户要求的 GitHub Pages 静态构建。

## Capabilities and Constraints
当前七个启用作品、一个隐藏草稿；统一浏览、分类、搜索、随机选择、新标签页进入。保持已有项目的本机端口，以保留浏览器存储作用域。线上版本使用相对路径与静态清单，不依赖本机服务。不嵌入 iframe；原项目由各会话独立维护。

## Evidence on Hand
相邻六个项目的 README、HTML 入口与静态服务器。grammar-time-board 的网页版本在接入期间补齐，目前已实际打开并验证入口资源；缺少 app.js 时仍可回退到 print.html。

## Product Principles
- 入口负责发现与接入，玩法由作品负责。
- 只展示真实可用的入口，失败要给出恢复办法。
- 新项目用一条目录记录接入。
