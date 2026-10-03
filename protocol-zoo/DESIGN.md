---
name: 协议动物园
description: 一张安静的通信观察台，信号比解释更重要。
colors:
  paper: "#e9eee8"
  panel: "#f8f8f1"
  ink: "#29352c"
  muted: "#52604e"
  line: "#cdd1c1"
  accent: "#425b35"
  wash: "#e1e6d5"
  rust: "#955239"
typography:
  display:
    fontFamily: "KaiTi, STKaiti, Noto Serif CJK SC, serif"
    fontSize: "48px"
    fontWeight: 500
    lineHeight: 1.2
  body:
    fontFamily: "Microsoft YaHei, PingFang SC, sans-serif"
    fontSize: "14px"
    lineHeight: 1.65
  data:
    fontFamily: "Consolas, SFMono-Regular, monospace"
    fontSize: "16px"
rounded:
  control: "3px"
  dialog: "4px"
spacing:
  small: "8px"
  medium: "18px"
  large: "24px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "#ffffff"
    rounded: "{rounded.control}"
---

## Overview
实现选择：通信观察台。浅灰绿色背景、暖白记录面、橄榄绿信号强调。以真实字节、顺序和时间为主体，没有角色形象或情绪仪表。纯离线运行使用本机字体，跨平台字形可能不同。

## Colors
色值与 style.css 的 :root 变量一致。次要文字加深至 #52604e，保证浅色表面及悬停状态的可读性。

## Typography
楷体标题提供安静的人文语气；正文使用中文无衬线；字节和时间使用等宽字体。辅助文字不小于 12px，数据为 16px。移动端标题为 34px。

## Layout
主体最大宽度 1280px。桌面通信记录与 285px 手记栏并排；650px 以下单列。通信记录独立滚动，输入区域保持在其下方。状态控制位于工作区之后。

## Elevation & Depth
使用细线分隔与表面色差，不使用阴影。只有重置确认使用原生 dialog 及遮罩。

## Shapes
方正布局，控件微圆角。无插画、卡片矩阵或虚构统计数据。

## Components
主动信号使用浅绿底色和文字标记，不能只依靠颜色识别。输入显示具体错误及修正方式。按钮覆盖禁用、悬停、键盘焦点状态。主动信号到达有一次揭示动画，并尊重 reduced-motion。保留用户向上阅读的位置；有新记录时提供回到底部按钮。

## Do's and Don'ts
保留机制的可观察性，不替生物解释意图。保持对比度与 12px 辅助文字下限。不使用在线字体、图片或服务依赖。
