---
name: 小创意游乐场
description: 用真实作品画面组织本机小创意入口。
colors:
  primary: "#344cda"
  primary-dark: "#263bad"
  ink: "#242b3b"
  muted: "#606a7c"
  background: "#f5f6f8"
  sidebar: "#f0f2f6"
  line: "#dce0e7"
  white: "#ffffff"
typography:
  display:
    fontFamily: "Segoe UI, Microsoft YaHei, sans-serif"
    fontSize: "clamp(30px, 3.1vw, 46px)"
    fontWeight: 750
    lineHeight: 1.35
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Segoe UI, Microsoft YaHei, sans-serif"
    fontSize: "15px"
    lineHeight: 1.65
  project-title:
    fontSize: "19px"
    fontWeight: 650
  description:
    fontSize: "12px"
    lineHeight: 1.85
  small:
    fontSize: "11px"
rounded:
  control: "8px"
  preview: "10px"
  surface: "14px"
spacing:
  small: "8px"
  medium: "16px"
  section: "24px"
  desktop-inset: "48px"
components:
  random-link:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "14px 20px"
  random-link-hover:
    backgroundColor: "{colors.primary}"
---

## Overview

以清楚的分类、真实作品截图和直接进入操作组成私人启动台。入口保留自己的浅灰与蓝色界面，各作品的画面保持原样。

## Colors

正文用 ink，说明用 muted；primary 标记入口、选中分类与推荐区域。分隔线使用 line。预览底色来自各作品目录记录，不能代替真实截图。

## Typography

中文界面使用本机 UI 字体。标题按宽度缩放，手机主标题为 31px、最窄屏为 27px。手机作品标题 16px、最窄屏 15px。功能文字最小 11px；正文不使用过紧行距。

## Layout

最大宽度 1800px。桌面侧栏 220px，内容左右内距 48px；1100px 以下侧栏 185px、内容内距 30px。700px 以下导航置顶并横向滚动，内容内距 22px；360px 以下为 16px。作品网格桌面三列，1100px 以下两列。推荐区为紧凑横条：桌面截图列宽 300px、高 190px，1100px 以下列宽 230px；手机仅保留简介和入口，作品截图仍可在下方目录查看。

## Elevation & Depth

页面使用平面色块与细分隔线。阴影只用于截图：推荐图为 `0 12px 30px #13254420`，作品图为 `0 4px 12px #24304b12`。

## Shapes

控件 8px、预览 10px、推荐区域 14px 圆角。作品标题和说明置于截图下方，不再包一层背景容器。

## Components

分类按钮具有明确选中态和 `aria-pressed`。搜索使用透明背景与下划线。作品在新标签页打开；空搜索结果提供清除入口，加载失败提供重试，缺失截图回退到作品名。键盘焦点用 3px `#d77535` 外框，偏移 5px。悬停图片轻微移动或缩放，减少动态效果设置关闭这些变化。

## Do's and Don'ts

- 使用真实作品名称、画面和可用入口；预览图变化时更新来源记录。
- 保持入口和各作品的导航、存储作用域独立。
- 不把端口、开发状态和接入配置塞进正常游玩流程；仅在失败时给出恢复信息。
