---
name: 越抢越变形的拍卖会
description: 共用台面，分色塑形，按回合交接操作。
colors:
  primary: "#344e40"
  ink: "#293d32"
  muted: "#62644c"
  paper: "#eee6c9"
  stage: "#f5efd9"
  line: "#c7bea0"
  clay-red: "#cd624c"
  clay-blue: "#527bb5"
  clay-green: "#62876a"
typography:
  body:
    fontFamily: "Microsoft YaHei UI, PingFang SC, sans-serif"
    fontSize: "14px"
    lineHeight: 1.6
  title:
    fontFamily: "Microsoft YaHei UI, PingFang SC, sans-serif"
    fontSize: "23px"
    fontWeight: 600
    lineHeight: 1.3
rounded:
  input: "5px"
  button: "7px"
spacing:
  small: "8px"
  medium: "16px"
  large: "26px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#fff9e5"
    rounded: "{rounded.button}"
    padding: "14px 16px"
---

# Design System: 越抢越变形的拍卖会

## Overview

**Creative North Star: "共用的黏土台面"**

围桌操作的工具界面，公共作品占主要空间。人物颜色用于追溯贡献，深绿用于操作，浅色台面承托作品。界面文字说明操作与状态，不把开发过程放进玩法。

## Colors

纸面、台面和分隔线形成浅色层次。三个黏土颜色始终绑定甲、乙、丙的席位，不因领先或退出改色。文字与主要动作保持深绿。

## Typography

使用本机中文 UI 字体以保证离线可用。标题建立清楚层级，辅助文字至少 11px；参与者名字、愿望支持换行。数量和角度采用等宽数字。

## Layout

最大宽度 1480px，桌面两列，公共作品在左，310px 操作区在右。700px 以下改为单列，作品在操作区之前；参与者保持三列以便比较余料。作品固定 800 × 570 坐标，缩放不改变游戏几何。

## Elevation & Depth

界面靠背景和细线分区。只有泥条使用向下的柔影与顶部细高光，说明重叠顺序；不代表物理承重。

## Shapes

控件小圆角，泥条采用圆端点与圆转角。材料点的不规则圆角与剩余数量一一对应；花费后的空轮廓保留原位置。

## Components

出价为实心深绿按钮，不合法时禁用并说明原因。预制形状提供文字和几何图标；选中状态用边框表示。退出需要就地再次确认。时间轴回看时暂停添加，明确提供「回到现在」。焦点使用蓝色 3px 外描边。遵循减少动态效果偏好。

## Do's and Don'ts

- Do 保留作品各层与来源颜色，回看时只改变可见数量。
- Do 在真实中文、长名字和手机宽度下检查换行。
- Don't 用示例作品充当已经发生的回合。
- Don't 将二维图形表现描述为真实黏土物理模拟。
