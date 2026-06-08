# RadarForge

RadarForge 是一个面向自媒体内容创作的雷达图生成工具，基于 React、Tailwind CSS 和 Apache ECharts。

## 启动命令

```bash
npm install
npm run dev -- --host 0.0.0.0
```

本机访问：

```text
http://localhost:5173/
```

生产构建检查：

```bash
npm run lint
npm run build
```

## Remotion MP4 渲染

打开 Remotion Studio：

```bash
npm run remotion:studio
```

Composition id：

```text
MapSummaryCard
SeriesSummaryCard
MapScoreTransition
RadarRevealLandscape
RadarBatchSequenceLandscape
```

当前 16:9 雷达视频以 Remotion 的 `RadarRevealLandscape` 终帧作为视觉基准：顶部 Burgundy 红比分条继续加高，队名和比分同步放大；雷达数据边界只保留折线、不显示圆点，让填充区域成为视觉重心；右侧人物图更大，JRs 评分图片按 `1178x327` 参考比例完整展示并整体下移，单英雄头像保持下方基准，人物名/KDA 行上移并增大身份块高度。人物名使用更大字号并带独立文字下移，KDA 也单独下移，身份块高度增量大于字号增量，以保证大字号名字完整露出，同时不移动英雄图标和评分块，并同步到网页预览、PNG 导出和 Remotion 输出。

使用示例 JSON 渲染 1920x1080 MP4：

```bash
npm run remotion:render:demo
```

等价的完整命令：

```bash
npx remotion render remotion/index.jsx RadarRevealLandscape exports/radar-landscape-demo.mp4 --props=examples/radar-landscape-demo.json
```

示例 JSON 位于：

```text
examples/radar-landscape-demo.json
```

单独预览比分过渡屏：

```bash
npm run remotion:studio -- --props=examples/map-score-transition-demo.json
```

在 Remotion Studio 左侧选择 `MapScoreTransition`。

直接渲染比分过渡屏 MP4：

```bash
npx remotion render remotion/index.jsx MapScoreTransition renders/output/map-score-transition-demo.mp4 --props=examples/map-score-transition-demo.json
```

比分过渡屏示例 inputProps：

```json
{
  "leftTeamName": "EDG",
  "rightTeamName": "JDG",
  "leftTeamLogo": "image/team-logos/EDG.jpg",
  "rightTeamLogo": "image/team-logos/XLG.jpg",
  "leftScore": 1,
  "rightScore": 0,
  "mapName": "Fracture",
  "label": "Map 1",
  "duration": 4,
  "theme": "esports"
}
```

当前过渡屏顶部只渲染一个红色胶囊标题，推荐用 `label` 写 `Map 1`、`Map 2`、`Map 3`。`mapName` 可继续保留在 props 里作为备注数据，但不会显示成第二个胶囊。

单独预览地图总览页：

```bash
npm run remotion:studio -- --props=examples/map-summary-card-demo.json
```

在 Remotion Studio 左侧选择 `MapSummaryCard`。

直接渲染地图总览页 MP4：

```bash
npx remotion render remotion/index.jsx MapSummaryCard renders/output/map-summary-card-demo.mp4 --props=examples/map-summary-card-demo.json
```

地图总览页示例 inputProps：

```json
{
  "leftTeamName": "EDG",
  "rightTeamName": "XLG",
  "leftTeamLogo": "image/team-logos/EDG.jpg",
  "rightTeamLogo": "image/team-logos/XLG.jpg",
  "leftStartingSide": "defense",
  "rightStartingSide": "attack",
  "leftMapScore": 6,
  "rightMapScore": 13,
  "mapName": "Fracture",
  "mapImage": "image/maps/map1.jpg",
  "summaryTitle": "深海明珠",
  "summaryText": "",
  "roundEvents": [
    { "round": 1, "winner": "XLG", "method": "elimination" },
    { "round": 2, "winner": "EDG", "method": "defuse" },
    { "round": 3, "winner": "XLG", "method": "detonation" },
    { "round": 4, "winner": "XLG", "method": "elimination" }
  ],
  "leftTeamStats": {
    "kda": "56/79/32",
    "acs": 171,
    "adr": 112.8,
    "kast": "64%"
  },
  "rightTeamStats": {
    "kda": "79/56/40",
    "acs": 225,
    "adr": 148.6,
    "kast": "77%"
  },
  "duration": 4,
  "theme": "white-red"
}
```

队标文件请放在：

```text
public/image/team-logos/
```

Remotion props 中仍然填写不带 `public/` 的路径，例如 `image/team-logos/EDG.jpg`。素材路径默认推荐 JPG/JPEG，PNG 仍可直接使用。队标会以 `object-fit: contain` 显示；如果文件缺失，会显示队伍缩写占位，不影响过渡屏渲染。

地图总览页图片请放在：

```text
public/image/maps/
```

Remotion props 中填写不带 `public/` 的路径，例如 `image/maps/fracture.jpg`。如果地图图片缺失，会显示白红风格的地图名占位，不影响完整视频渲染。

地图总览页的回合事件图标请放在：

```text
public/image/round-events/
```

默认图标路径约定：

```text
image/round-events/elimination_red.jpg
image/round-events/elimination_blue.jpg
image/round-events/defuse_red.jpg
image/round-events/defuse_blue.jpg
image/round-events/detonation_red.jpg
image/round-events/detonation_blue.jpg
image/round-events/time_red.jpg
image/round-events/time_blue.jpg
```

同名 PNG 也可使用，例如 `image/round-events/time_blue.png`。未显式填写 `icon` 时，MapSummaryCard 按 JPG、JPEG、PNG 的顺序查找图标。`roundEvents` 是可选字段，最多读取 30 回合。每一项写 `{ "round": 1, "winner": "XLG", "method": "elimination" }`；`method` 支持 `elimination`、`defuse`、`detonation`、`time`。MapSummaryCard 会在比分下方、地图图片上方渲染两行回合事件表，胜方显示方法图标，负方显示两位数回合编号，例如 `01`、`07`、`24`。图标按攻防方使用 `image/round-events/<method>_red.jpg` 或 `image/round-events/<method>_blue.jpg`，红色表示进攻方获胜，蓝色表示防守方获胜，不再使用 `loss` 图标。`leftStartingSide`/`rightStartingSide` 可写 `attack` 或 `defense`，默认左队防守、右队进攻；第 13 回合换边，第 25 回合起按简单交替规则推导。单个事件可用 `winnerSide` 或 `winnerColor` 覆盖自动推导。13、18、24、30 回合都会自动调整单元格和图标尺寸并保持水平居中。事件格优先渲染本地图标图片并使用 `object-fit: contain`，图片缺失时显示方法简写 fallback。

单独预览整场总结页：

```bash
npm run remotion:studio -- --props=examples/series-summary-card-demo.json
```

在 Remotion Studio 左侧选择 `SeriesSummaryCard`。`SeriesSummaryCard` 只用于 `summary.type: "series"`，不显示 `roundEvents`，而是读取 `mapResults` 展示 1-5 张地图。布局会按数量自动切换为居中单图、两列、三列、2x2 或上三下二。地图图片缺失时显示地图名，队标缺失时显示队名缩写，不会中断渲染。

## 如何生成 MP4 视频

默认 JSON 输入目录：

```text
/Users/danmou/Desktop/codex/雷达图/exports
```

默认 MP4 输出目录：

```text
/Users/danmou/Desktop/codex/雷达图/renders/output
```

单个 JSON 渲染：

```bash
npm run render:one -- /Users/danmou/Desktop/codex/雷达图/exports/example.json
```

批量渲染 `exports/` 下所有 JSON：

```bash
npm run render:batch
```

批量渲染会按顺序处理：

```text
/Users/danmou/Desktop/codex/雷达图/exports/*.json
```

每个 JSON 会生成一个 MP4。文件名会优先取 JSON 里的 `characterName`、`name`、`playerName`、人物对象名称或 `title`，没有合适字段时使用 JSON 文件名；如果同名 MP4 已存在，会自动生成 `-2`、`-3` 这样的序号。

一键生成完整连续 MP4：

```bash
npm run render:full -- batch-input/one-piece-four-emperors.manifest.json
```

默认输出：

```text
renders/output/full-video.mp4
```

自定义输出名：

```bash
npm run render:full -- batch-input/one-piece-four-emperors.manifest.json renders/output/海贼王四皇能力雷达图.mp4
```

manifest 示例：

```json
{
  "title": "海贼王四皇能力雷达图",
  "items": [
    "exports/路飞.json",
    "exports/凯多.json",
    "exports/香克斯.json",
    "exports/黑胡子.json"
  ]
}
```

`render:full` 会按 manifest 的 `items` 顺序渲染，而不是按文件系统顺序。每个 JSON 默认展示 5 秒；如果 JSON 内有 `duration` 字段，会优先使用该值。未传 manifest 时会读取 `exports/*.json` 并按文件名排序。命令会打印读取数量、每段人物名、秒数、帧数、总时长和最终输出路径。

字段版选手 JSON 可不预先写 `dimensions` / `scores` / `values` 数组，只要包含固定六项 `Rating_score`、`战斗评分_score`、`回合均伤_score`、`首杀能力_score`、`KAST_score`、`助攻贡献_score`，并为每项提供对应的 `_min` / `_max`。渲染脚本会自动生成带 `score` / `min` / `max` 的维度对象，以及匹配的 `scores` / `values` 数组。Remotion 雷达图按每个维度自己的范围缩放，但标签继续显示原始分数，例如战斗评分显示 `202` 而不是归一化值。

完整视频的当前主输入方式是 episode manifest JSON。一个 manifest 可以包含整期标题、每张地图的比分过渡页、地图总览页、回合事件和选手雷达图 JSON 路径。`render:full` 会按 manifest 中的顺序生成一个连续 MP4。

episode manifest 示例：

```json
{
  "title": "EDG vs XLG 地图雷达图合集",
  "maps": [
    {
      "transition": {
        "leftTeamName": "EDG",
        "rightTeamName": "XLG",
        "leftTeamLogo": "image/team-logos/EDG.jpg",
        "rightTeamLogo": "image/team-logos/XLG.jpg",
        "leftScore": 1,
        "rightScore": 0,
        "mapName": "Fracture",
        "label": "Map 1",
        "duration": 4,
        "theme": "esports"
      },
      "summary": {
        "leftTeamName": "EDG",
        "rightTeamName": "XLG",
        "leftTeamLogo": "image/team-logos/EDG.jpg",
        "rightTeamLogo": "image/team-logos/XLG.jpg",
        "leftStartingSide": "defense",
        "rightStartingSide": "attack",
        "leftMapScore": 11,
        "rightMapScore": 13,
        "mapName": "Fracture",
        "mapImage": "image/maps/fracture.jpg",
        "summaryTitle": "Fracture 地图总览",
        "summaryText": "XLG 在进攻端建立优势，Rarga 与 WsLeo 发挥突出，EDG 未能有效限制对手节奏。",
        "roundEvents": [
          { "round": 1, "winner": "XLG", "method": "elimination" },
          { "round": 2, "winner": "EDG", "method": "defuse" },
          { "round": 3, "winner": "XLG", "method": "detonation" },
          { "round": 4, "winner": "XLG", "method": "elimination" }
        ],
        "leftTeamStats": {
          "kda": "56/69/32",
          "acs": 188,
          "adr": 121.4,
          "kast": "68%"
        },
        "rightTeamStats": {
          "kda": "69/56/41",
          "acs": 224,
          "adr": 145.7,
          "kast": "76%"
        },
        "duration": 4,
        "theme": "white-red"
      },
      "items": [
        "exports/Smoggy.json",
        "exports/Lysoar.json",
        "exports/ZmjjKK.json"
      ]
    }
  ]
}
```

完整三图模板位于：

```text
examples/map-score-episode-demo.manifest.json
```

EDG vs XLG 五图完整 episode manifest 位于：

```text
examples/edg-xlg-full-episode.manifest.json
```

追加整场 Summary 段落和 10 名整场选手雷达图后的完整 manifest 位于：

```text
examples/edg-xlg-full-episode-with-summary.manifest.json
```

重新聚合五图数据并生成 `exports/summary_*.json` 与完整 manifest：

```bash
npm run generate:series-summary
```

完整单图测试模板位于：

```text
examples/full-episode-json-demo.manifest.json
```

直接渲染完整 episode manifest：

```bash
cd /Users/danmou/Desktop/codex/雷达图
npm run render:full -- examples/full-episode-json-demo.manifest.json renders/output/full-episode-json-demo.mp4
```

`maps[]` 模式下，每一图会按以下顺序播放：

```text
MapScoreTransition → MapSummaryCard → player radar 1 → player radar 2 → player radar 3
```

Summary 也作为 `maps[]` 的特殊条目存在，而不是根级孤立最终页：

```text
MapScoreTransition → SeriesSummaryCard → series player radar 1 → series player radar 2 → ...
```

当 `summary.type === "series"` 时使用 `SeriesSummaryCard`，否则继续使用普通 `MapSummaryCard`。Summary 条目的 `items` 与普通地图走同一套 JSON 读取、校验和时长计算逻辑，因此整场选手雷达图会继续在总结页后播放。完整示例位于 `examples/series-summary-episode-demo.manifest.json`。

有 `transition` 就播放 `MapScoreTransition`；有 `summary` 就播放 `MapSummaryCard`；有 `items` 就按 manifest 路径列表的原顺序播放选手雷达图，不再自动按分数排序。旧版只有顶层 `items[]` 的 manifest 仍然保持原来的顺序和行为。

如果某张地图提供了可选 `summary` 字段，`render:full` 会在比分过渡页后插入 `MapSummaryCard`。该页使用纯白背景、居中的加大加粗黑色标题和加粗红色标题分界线、黑/深灰文字、浅灰边线和少量红色强调；`roundEvents` 会显示为比分下方居中的两行回合事件表；`mapName`、队名和 `summaryText` 会继续作为 manifest 元数据保留，但不会显示为右上角胶囊、比分两侧队名或比分下方正文。

```text
MapScoreTransition → MapSummaryCard → player radar JSON 1 → player radar JSON 2 → ...
```

未提供 `summary` 的旧 map manifest 仍然按 `MapScoreTransition → player radar` 顺序渲染；未提供 `roundEvents` 的 summary 也会正常渲染。某张地图的 `items` 为空或缺失时，只要这张地图还有 `transition` 或 `summary`，CLI 会输出 warning 并跳过选手雷达图片段，不会破坏整条完整视频渲染。

渲染前 manifest 校验会检查：

- manifest 文件是否存在。
- `maps` 是否是数组。
- 每个 map 是否至少包含 `transition`、`summary` 或 `items` 之一。
- `transition` 的队名、比分和 `duration` 是否有效。
- `summary` 的地图名、小比分和 `duration` 是否有效。
- `summary.type: "series"` 的整场比分、`duration` 和 1-5 项 `mapResults` 是否有效。
- `items` 中的选手 JSON 路径是否存在。
- `roundEvents[].winner` 是否等于该 summary/transition 的左队或右队。
- `roundEvents[].method` 是否属于 `elimination`、`defuse`、`detonation`、`time`。
- 可选的 `leftStartingSide`、`rightStartingSide`、`roundEvents[].winnerSide` 是否属于 attack/defense 别名，`winnerColor` 是否为 red/blue。

该流程不影响原有单张雷达图渲染、`exports/*.json` 批量渲染、`MapScoreTransition` 单独预览、`MapSummaryCard` 单独预览，也不引入 CSV 自动化。

如果渲染失败，请先检查：

- JSON 文件是否是合法 JSON。
- JSON 是否仍是 RadarForge 导出的项目结构，或 Remotion 示例结构。
- JSON 内的图片 Data URL 是否完整。
- 终端是否能正常运行 `npm run build` 和 `npm run remotion:studio`。

## Codex 一句话生成一期视频

项目内置 Codex Skill：

```text
.agents/skills/radarforge-episode/SKILL.md
```

以后你只需要准备：

```text
image/                 人物 JPG/JPEG/PNG 图片
batch-input/xxx.csv    批量数据表
```

然后在 Codex 里说：

```text
使用 RadarForge 生成一期视频，CSV 是 batch-input/xxx.csv
```

Codex 应该自动使用 `radarforge-episode` Skill，并自己运行：

```bash
npm run build:episode -- batch-input/xxx.csv
```

你不需要自己打开终端输入命令。

这个一键流程会检查 CSV 和 `characterImage` 图片路径。`characterImage` 可以指向 `image/` 下的 `.jpg`、`.jpeg` 或 `.png` 文件，例如 `image/player-a.jpg`。流程会生成 `exports/*.json`、`exports/*.png`、`batch-input/*.manifest.json`，并调用 Remotion 的 `RadarBatchSequenceLandscape` 输出完整 MP4 到：

```text
renders/output/<csv-name>.mp4
```

示例：

```bash
npm run build:episode -- batch-input/one-piece-four-emperors.csv
```

该命令会打印当前 CSV 路径、读取人物数、每个人物名、图片是否存在、JSON/PNG 路径、manifest 路径、最终 MP4 路径、总时长和是否成功。

## 批量生成 JSON 和 PNG

示例 CSV：

```text
batch-input/one-piece-four-emperors.csv
```

CSV 固定字段：

```text
series,title,subtitle,characterName,characterImage,theme,duration,hupuRating,teamName,matchLeftTeam,matchLeftScore,matchRightScore,matchRightTeam,battleRank,battlePower,kda,heroIcons,heroIconLayout,hupuRatingTemplate,hupuRatingImage
```

`teamName`、`matchLeftTeam`、`matchLeftScore`、`matchRightScore`、`matchRightTeam`、`battleRank`、`battlePower`、`kda`、`heroIcons`、`heroIconLayout`、`hupuRatingTemplate`、`hupuRatingImage` 是可选字段，旧版 CSV 不写也能继续生成。`title` 和 `subtitle` 会作为兼容元数据保留，但不再渲染为画面主标题或人物区标题。顶部标题优先使用四个比赛字段，例如 `EDG,2,1,JDG` 会渲染为 `EDG 2:1 JDG`，且冒号居中；旧的 `teamName` 仍兼容，能解析 `EDG 2:1 JDG` 这样的字符串。`battleRank` 支持 `#1-#10`，`battlePower` 会显示在左上角白底战力表里。人物名来自 `characterName` 或项目里的 `people[].name`，会显示在右侧 KDA 上方，并可在网页的“多人对比”里手动填写。`heroIcons` 使用竖线分隔，最多显示前 6 张。`heroIconLayout` 支持 `grid` 和 `single`，不写时默认 `grid`；`grid` 对应右侧两行三列头像槽位，如果只提供 1 张，会默认放在第二行中间；`single` 会把第一张有效头像作为一张更大的居中图片。`hupuRatingTemplate` 支持 `classic` 和 `jrs`，不写时默认 `classic`；`hupuRatingImage` 是 JRs 评分卡白色内框里的图片路径，Remotion 渲染时应写 `public/` 目录下的相对路径，例如 `image/hupu/test.jpg`：

```text
image/rumble.jpg|image/ahri.jpg|image/jax.jpg|image/ornn.jpg|image/jinx.jpg|image/leona.jpg
```

维度列推荐使用 `*_score / *_min / *_max` 结构。`score` 可以超过 `max`，雷达图会画到外圈之外并高亮爆表点；旧版“一个维度一列分数”的 CSV 仍然兼容，默认 `min=0`、`max=100`。

```csv
series,title,subtitle,characterName,characterImage,theme,duration,hupuRating,teamName,matchLeftTeam,matchLeftScore,matchRightScore,matchRightTeam,battleRank,battlePower,kda,heroIcons,heroIconLayout,hupuRatingTemplate,hupuRatingImage,攻击力_score,攻击力_min,攻击力_max,防御力_score,防御力_min,防御力_max,速度_score,速度_min,速度_max,霸气_score,霸气_min,霸气_max,续航_score,续航_min,续航_max,战斗智商_score,战斗智商_min,战斗智商_max
海贼王,,香克斯,香克斯,image/shanks.jpg,white-red,5,9.8,,EDG,2,1,JDG,#2,1031,12/1/8,image/luffy.jpg|image/kaido.jpg|image/shanks.jpg|image/teach.jpg,single,jrs,image/hupu-card.jpg,96,0,100,82,0,100,92,0,100,126,0,100,88,0,100,94,0,100
```

新增布局示例位于：

```text
batch-input/team-kda-heroicons-example.csv
```

生成的 JSON 会保留 `people[].scores` 以兼容旧链路，同时在单人批量资产中写入维度对象：

```json
{
  "name": "霸气",
  "score": 126,
  "min": 0,
  "max": 100
}
```

一键生成每行人物对应的 JSON 和 PNG：

```bash
npm run generate:assets -- batch-input/one-piece-four-emperors.csv
```

一键生成 JSON、PNG、manifest 和完整 MP4：

```bash
npm run build:episode -- batch-input/one-piece-four-emperors.csv
```

只生成 JSON：

```bash
npm run generate:json -- batch-input/one-piece-four-emperors.csv
```

从单个 JSON 生成对应 PNG：

```bash
npm run generate:png -- /Users/danmou/Desktop/codex/雷达图/exports/凯多.json
```

输出位置：

```text
/Users/danmou/Desktop/codex/雷达图/exports
```

文件名优先使用 `characterName`，会清理特殊符号；同名文件已存在时自动追加 `-2`、`-3`。如果某行缺少 `characterName`、维度分数为空/非数字、分数低于 `min`、`max <= min`，或 `theme`/`duration` 不符合当前支持范围，脚本会打印对应行号和原因，并继续处理其他行。

生成的 JSON 沿用 RadarForge 项目快照结构，可直接继续运行：

```bash
npm run render:batch
```

## 功能

- 自定义主标题、维度名称、分数区间和可爆表分数。
- 支持 9:16、1:1、16:9 三种画布比例。
- 支持 1-5 人数据；2 人及以上会显示对比图例。
- 支持动画时长调节和重新播放。
- 支持 5 套视觉主题。
- 支持 PNG 导出，只导出当前画布内容。
- 支持动画视频导出，提供 5 秒、8 秒、10 秒 WebM 录制，并按画布比例输出 1080p 级尺寸。
- 支持左上角白底战力表，网页中可选择 `#1-#10` 排名并填写战斗力，保存 JSON、CSV 生成、PNG 导出和 Remotion MP4 时会保留。
- 支持人物图片下方的虎扑评分字段，来自 CSV/JSON 的 `hupuRating`，也可以在网页中直接选择 `0.0-10.0`，步进 `0.1`；`hupuRatingTemplate` 可选择旧版纯评分或新版 JRs 评分卡，`hupuRatingImage`/网页点击白色内框可导入评分卡图片。
- 支持顶部战队比分栏 `matchLeftTeam`/`matchLeftScore`/`matchRightScore`/`matchRightTeam`（兼容旧 `teamName`）、人物图下方 KDA `kda`、两行三列最多 6 个英雄头像 `heroIcons`，以及 `grid`/`single` 英雄头像模板，并同步到网页预览、PNG 和 Remotion MP4。
- 支持独立 Remotion MP4 渲染模块，提供 16:9 单人物雷达图动画、自定义区间和爆表高亮。
- 支持独立 Remotion 比分过渡屏 `MapScoreTransition`，用于每张地图/每一小局雷达图开始前展示双方队标和当前比分。
- 支持 Remotion 直接把多个 JSON 雷达图片段连续渲染成一个完整 16:9 MP4。
- 支持从 CSV 一键生成 JSON、PNG、manifest 和完整 Remotion MP4。
- 支持项目级 Codex Skill，通过一句自然语言请求触发完整出片流程。
- 支持保存 JSON、导入 JSON。
- 内置模板库：电竞选手、动漫战斗角色、篮球球员、足球球员、历史人物、自定义模板。

## 导出位置

开发环境下，PNG、JSON、WebM 视频和 Remotion MP4 示例产物会额外保存到项目根目录：

```text
exports/
```

浏览器也会同时触发下载。若浏览器下载没有明显提示，请优先查看 `exports/`。

Remotion 批量脚本生成的 MP4 会保存到：

```text
renders/output/
```

## 目录结构

```text
src/
  components/        UI 组件
  config/            主题、模板、比例、人物色板配置
  utils/             PNG 合成导出、JSON 读写工具
  App.jsx            应用状态与业务编排
  index.css          全局样式与工具样式
remotion/            Remotion MP4 视频渲染模块
public/image/team-logos/
                     Remotion 比分过渡屏队标
scripts/             单个/批量 Remotion MP4 渲染脚本
batch-input/         批量 CSV 示例输入
examples/            Remotion 示例输入 JSON
vite.config.js       Vite 配置与本地导出接口
exports/             开发环境导出产物
renders/output/      Remotion 脚本输出 MP4
.agents/skills/      项目级 Codex Skills
```

## 主要依赖

- `react` / `react-dom`：应用框架。
- `echarts` / `echarts-for-react`：雷达图渲染。
- `tailwindcss` / `@tailwindcss/vite`：样式系统。
- `lucide-react`：界面图标。
- `remotion` / `@remotion/cli`：独立 MP4 视频渲染。
- `@remotion/bundler` / `@remotion/renderer`：Node 脚本批量生成 MP4。
