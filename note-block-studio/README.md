# NOTE BLOCK · 音符方块

A light, tactile Minecraft-inspired 3D music workstation. Built with locally vendored Three.js r128 and the Web Audio API. No server, CDN, account integration, or runtime dependency installation is required.

## 在小创意游乐场中打开

在仓库根运行 `npm start`，访问 <http://127.0.0.1:4200>，选择「音符方块」。主入口会按需启动作品（端口 4303）；原生 ESM 模块需要通过 HTTP 打开。

线上构建：在仓库根运行 `npm run build`，再运行 `npm run preview`，访问 <http://127.0.0.1:4201/idea-playground/>。本项目输出到 `projects/note-block-studio/`，支持 GitHub Pages 仓库子路径。无需另外安装音频或 Three.js 依赖。

修改接入信息后，在仓库根运行 `npm run project:add -- note-block-studio --enable`。单独检查项目语法：`npm --prefix note-block-studio run check`。

存档键为 `note-block-studio-v1`，仅存于访问者浏览器；不同域名间可通过导出、导入 JSON 迁移。

## Play

- A 16-step × 8-track stage: time goes left to right; material selects the instrument.
- Click an empty cell to place a note. Click an existing note to select and hear it.
- Drag a note to move it. Occupied destinations swap notes rather than erase them.
- Right-click, the eraser, or Delete removes notes. Undo/redo restores edits.
- Mouse wheel over a note adjusts its pitch. Use the inspector on touch screens.
- Space plays/pauses. Stop returns to step one. Tempo, swing, mute, solo, velocity, volume, reverb, and metronome are functional.
- Rotate mode supports dragging; blank-area wheel zooms; top view and camera reset are available.
- The expandable 2D grid supports arrow navigation, Enter, and Delete and remains usable if WebGL is unavailable.
- Three original example loops, browser-local autosave, validated JSON import/export, and stereo WAV export (four loops plus reverb tail).

## Sound and visuals

All eight original note-block one-shot samples were retrieved from the user-specified MCSounds site. Textures and inventory icons were retrieved from Minecraft Wiki. Each source URL and hash is recorded in `assets/sources.json`; game assets remain the property of their rights holders. The app is an unofficial creative project, not affiliated with Mojang or Microsoft. Three.js is included under its MIT license (`vendor/THREE-LICENSE.txt`).

The renderer uses pixel textures, gently rounded geometry, instanced floor/note meshes, soft shadows, native per-face grass/log/stone/sand/glass/gold/clay/glowstone materials and small front-face pitch indicators, spring motion, pooled deletion fragments, and floating musical notes. Device pixel ratio is capped at 1.75. Hidden tabs pause playback and suspend visual updates. Reduced-motion preferences suppress note springs and floating effects.

Audio is scheduled against `AudioContext.currentTime` using a short lookahead. Visual triggers consume the same timestamped queue. Actual audio-visual latency and frame rate have not been measured. If an original sample cannot load/decode, a synthesized instrument is substituted and the sound status reports partial availability.

## Files and checks

`index.html`, `style.css`, `app.js`, `world.js`, `audio.js`, `blocks.js`, and `model.js` are the complete buildless application. JavaScript is native ESM. `integration.json` declares the public resources copied by the playground build into `dist/projects/note-block-studio/`.

`npm run check` verifies all application module syntax. Development checks additionally verified all preset dimensions, swing preserving bar duration, pitch stepping, rejection of malformed imports, static resource paths, DOM references, and the validity of all eight Ogg samples.

Visual/browser QA could not run in the supplied environment: the managed preview supervisor failed with `bwrap: Can't mount proc on /newroot/proc: Operation not permitted`. The application was not altered to bypass this infrastructure restriction. Mobile layout, actual audio output, pointer hit targets, and rendering performance remain unverified in a real browser.

## 2026-10-18 material correction

Placed notes now render as the selected lane’s original material block, with separate grass top/side/bottom and log bark/end-grain UVs. The uniform brown note-box body and opaque cap have been removed. Glass retains its source alpha. Placement ghosts and the inspector show the same block family. Cubes remain upright while springing, and lighting no longer applies a pastel wash to their textures. Existing saved compositions and instrument mappings remain compatible.

The material correction passed syntax checks, per-face UV/normal checks for all eight materials, original cube dimension checks, all 128 cell ray hits, and all 128 drag target checks. No browser rendering claim is made.

## Playground integration checks

The repository catalog check, all seven hub/build tests, application syntax checks, and static build pass. All 42 runtime files are preserved from the deployed project and are available under the GitHub Pages project subpath. `npm run verify:pages` was attempted, but its browser checks could not start because this environment has no installed Playwright Chromium executable. No generated `dist` output, test artifacts, or hosting account metadata is included in this source integration.
