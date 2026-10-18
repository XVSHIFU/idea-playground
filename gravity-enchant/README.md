# 重力附魔 · Gravity Enchanting

给方块附上重力魔咒，让整个房间的物件朝你指定的方向塌落——方向即规则，连锁即解法。

Three.js 等距正交 Toon 渲染的滑块解谜小游戏，浅色薄荷清晨视觉风格。

## 运行

由于使用 ES Module 与 importmap，`file://` 直开会被浏览器拦截，请在本仓库根目录启动任一静态服务器：

```bash
# 任选其一（在仓库根目录，即 gravity-enchant 的上一级）
npx serve .
python -m http.server 8000
```

然后访问 `http://localhost:8000/gravity-enchant/`。

依赖仅 three@0.160.0（CDN importmap）与 `../shared.js`，无需构建。

## 玩法

- **WASD / 方向键 / 底部箭头按钮**：选择重力方向，所有箱子塌落直到撞墙/相撞。
- **⬜ 石箱**可撞碎裂纹墙；**◉ 压力机关**被压住会鸣响；**✦ 符印**全部被同时压住即胜利。
- **Z** 倒带（不返还魔咒次数）；**空格** 重置本关；**R** 随机密室换种子；**Esc** 关闭浮层。
- 每关魔咒次数有限：附魔台的火苗高度/颜色、塌落音高、房间光晕都会随剩余次数衰减。
- 8 个手工关卡（经 BFS 求解器验证可解）+ 程序生成「随机密室」（PRNG 种子可复现，生成后经 BFS 验证保证有解，最佳成绩存 localStorage）。

## 文件

- `index.html` — 游戏全部内容（单文件入口）
- `verify_levels.mjs` — 开发用关卡可解性验证脚本（`node verify_levels.mjs`）
