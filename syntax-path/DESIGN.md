---
name: 句法小径
description: 暖纸色的句法关系建筑工作台
colors:
  paper: "#f4f1e8"
  surface: "#fbf9f3"
  ink: "#293b34"
  muted: "#59665e"
  line: "#d5d8ca"
  green: "#496951"
  green-light: "#e3e9d8"
  orange: "#bd4c27"
typography:
  display:
    fontFamily: '"Noto Serif CJK SC","Source Han Serif SC","Songti SC","SimSun",serif'
    fontSize: "clamp(38px,4.2vw,60px)"
    fontWeight: 400
    lineHeight: 1.23
    letterSpacing: "-.03em"
  sentence:
    fontFamily: '"Noto Serif CJK SC","Source Han Serif SC","Songti SC","SimSun",serif'
    fontSize: "clamp(23px,2.35vw,34px)"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: ".015em"
  title:
    fontFamily: '"Noto Serif CJK SC","Source Han Serif SC","Songti SC","SimSun",serif'
    fontSize: "29px"
    fontWeight: 400
    lineHeight: 1.3
  body:
    fontFamily: '"Microsoft YaHei","PingFang SC",sans-serif'
    fontSize: "15px"
    lineHeight: 1.7
  label:
    fontFamily: '"Microsoft YaHei","PingFang SC",sans-serif'
    fontSize: "12px"
rounded:
  field: "0"
  bead: "50%"
spacing:
  field-block: "12px"
  field-inline: "14px"
  primary-block: "10px"
  primary-inline: "17px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    padding: "10px 17px"
  model-selected:
    backgroundColor: "{colors.green}"
    padding: "9px 16px"
  model-unselected:
    textColor: "{colors.ink}"
    padding: "9px 16px"
  note-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "12px 14px"
  workbench:
    backgroundColor: "{colors.surface}"
---

# Design System: 句法小径

## Overview

**Creative North Star: "暖纸色建筑工作台"**

暖纸色建筑工作台以主廊、侧室、折痕与门槛呈现句法关系。苔绿标记关联范围，橙色小珠与轨迹标记行走；薄边框与纸面明暗维持安静、可读的实验气质。

本文记录当前 HTML/CSS/JavaScript 的实现选择，不代表新增的用户偏好承诺。字体依赖本机 CJK 字体回退，页面没有远程字体或运行依赖。

**Key Characteristics:**

- 纸面层次与建筑折面
- 绿色关系范围、橙色位置和轨迹
- 桌面横廊、手机纵廊

## Colors

苔绿与暖橙在纸色中承担关系和行动两种职责。规范色值位于前言，对应源码的同名 CSS 自定义属性。

- Primary：green 用于结构选择、修饰语和进度；green-light 用于原句关联范围。
- Secondary：orange 用于当前位置、已走轨迹、焦点轮廓和一般按钮悬停。
- Neutral：paper 是页面底色；surface 是工作台与记录纸面；ink 是正文与主按钮；muted 是辅助说明；line 是细分隔线。
- 房间折面、范围底色与按钮悬停另有局部颜色，以 styles.css 为准，不扩展为未经使用的品牌色。

## Typography

标题、原句和房间主标签使用前言中的 CJK 衬线回退；正文与控件使用中文无衬线回退。结构 A/B 的字母和指南序号使用 Georgia。浏览器按本机字体可用性选择，不保证跨设备字形完全一致。

主标题在 800px 以下改为 42px、600px 以下改为 43px。原句在手机为 25px；当前位置标题在中屏为 25px、手机为 27px。辅助 HTML 文本通常为 12px。

现有限制：SVG 副标签设为 12 个用户坐标单位，会随整幅图缩放；手机实际渲染字号可能小于 12px。当前位置说明与分组读法提供图外文字补充，这不等于已解决图内小字问题。

## Layout

页面最大宽度 1504px，默认左右留白 56px；1100px 以下为 30px，600px 以下为 20px。工作台包含原句、结构切换、图形与行走面板、分组读法。

桌面图形右侧面板宽 264px，1100px 以下为 235px；800px 以下面板落在图形下方，600px 以下进一步成为单列。下方指南与笔记在手机成为单列。

图形在宽于 600px 时使用横向主廊（viewBox 1000 × 500），手机使用纵向主廊与右侧侧室（480 × 700）；这是重排而非仅缩小桌面图。1600px 以上仅增加开场区域上下留白。

## Elevation & Depth

无投影。纸面底色、细边框、房间顶部和侧面明暗产生层次；折起纸面时，房间有上移 12 个坐标单位的折面深度。关系范围用半透明底色与虚线轮廓表示。

## Shapes

工作台、按钮和记录框以直角矩形为主。小珠与图例位置点为圆形；SVG 关系范围使用 4 个坐标单位的圆角。路径端点和连接采用圆接处理，折痕采用虚线。

## Components

- 主按钮：深墨底、纸白字，最小高度 48px；悬停改变底色。行走动画期间暂时禁用前进与后退，首步后退不可用。
- 结构切换：最小高度 44px，选中态苔绿实底、白字；未选中态细边框，状态通过 aria-pressed 表达。手机并排等宽。
- 笔记切换：细底线与绿色选中边线；记录框为纸白直角矩形，可纵向调整大小；下拉框为透明底细边框。
- 工作台：单个连续纸面，以内部细线分区，不依靠投影。
- 关系图：橙色珠子用 650ms 的 easeOutCubic（1 − (1 − t)³）移动；门叶源码过渡为 550ms cubic-bezier(.16,1,.3,1)，开启角度 −65°。减少动态效果时跳过珠子动画、关闭门叶过渡和页面平滑滚动。
- 焦点：可交互元素使用 3px 橙色轮廓，偏移 4px。禁用按钮透明度为 .38。默认按钮悬停为橙色文字，选中结构和主按钮有各自覆盖样式。
- 打印：隐藏操作控件，保留纸面图、说明与笔记，使用白色页面背景。

## Do's and Don'ts

- Do 保持关系范围、当前位置与走过轨迹的语义配色。
- Do 同时保留 SVG 图形、文字位置说明与原句分组读法。
- Do 在减少动态效果设置下直接更新小珠位置，并关闭门叶过渡。
- Don't 将系统字体回退描述为已内嵌字体。
- Don't 声称 SVG 缩放后的所有文字均达到 12px。
- Don't 将候选分组的视觉展示描述为句法分析或学习效果的验证。
