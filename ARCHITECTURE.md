# ARCHITECTURE.md

## Overview

RadarForge is a Vite React single-page app. The left panel contains editing controls. The right panel contains a live canvas preview built with Apache ECharts plus a DOM-managed portrait/image area. Export composes the ECharts canvas and portrait area into PNG or WebM outputs.

## Core Directories

```text
src/
  components/        React UI components.
  config/            Product configuration: themes, ratios, templates, color palette, shared template tokens.
  utils/             Chart options, export composition, JSON project I/O.
  App.jsx            Main state container and workflow orchestration.
  index.css          Global and component utility styling.
remotion/
  Root.jsx           Remotion composition registration and dynamic metadata.
  index.jsx          Remotion entry passed to Studio/render commands.
  compositions/      Video compositions.
  components/        Reusable video scene, character reveal, map-score transition, map/series summary, and SVG radar pieces.
  utils/             Props adapter, animation helpers, radar geometry.
  types/             Documented V1 render props shape.
scripts/             Node render commands for single/batch Remotion MP4 export and batch JSON/PNG asset generation.
batch-input/         Example CSV inputs for batch JSON/PNG asset generation.
examples/            Render-ready JSON input examples.
vite.config.js       Vite config and development-only local export middleware.
exports/             Development export output folder for PNG/JSON/WebM files.
renders/output/      Remotion MP4 output folder for render scripts.
.agents/skills/      Project-level Codex Skills for repeatable creator workflows.
```

## Components

- `TitleControls.jsx`
  - Edits the top match-score title as four manual fields: left team, left score, right score, and right team.

- `PortraitControls.jsx`
  - Edits KDA text and the pipe-separated hero icon list used by the right-side info area.
  - Notes that the right-side displayed person name comes from the active person's editable name in `PeopleEditor.jsx`.
  - Selects the hero icon layout template: original 2x3 grid or one larger centered icon.
  - Selects the 虎扑评分 layout template: classic compact score or the newer JRs-style rating card with an image slot.
  - Provides a `0.0-10.0` 虎扑评分 selector for the active person.
  - Provides left-panel image import and image clear actions.

- `BattlePowerControls.jsx`
  - Edits the small upper-left battle-power badge with a selectable `#1-#10` rank and freeform battle-power text.

- `CanvasControls.jsx`
  - Selects `9:16`, `1:1`, or `16:9`.
  - Ratios in `src/config/canvasRatios.js` also define fixed video export sizes.

- `AnimationControls.jsx`
  - Edits animation duration and triggers replay.

- `PeopleEditor.jsx`
  - Manages 1-5 people, active person, names, and colors.

- `DimensionEditor.jsx`
  - Manages dimensions and the active person's scores.
  - Dimension labels are global; scores belong to people.

- `ThemePicker.jsx`
  - Selects one of the configured visual themes, including the five newer color-background schemes for current creator-cover styles.

- `TemplateLibrary.jsx`
  - Applies configured project presets from `src/config/templates.js`.

- `JsonControls.jsx`
  - Saves current project JSON and imports JSON.

- `RadarPreview.jsx`
  - Owns the preview layout, toolbar, PNG/video export controls, ECharts component, right-side image import zone, inline 虎扑评分 selector, and image remove control.

## State Model

`App.jsx` is currently the main state owner.

Important state:

- `title`: legacy project title used for import/export filenames and old JSON compatibility; it is no longer edited or rendered as a visible chart title.
- `themeId`: selected theme id.
- `canvasRatioId`: selected canvas ratio id.
- `animationDuration`: replay duration in milliseconds.
- `dimensions`: array of `{ id, name, min, max }`; legacy name-only dimensions normalize to `min=0` and `max=100`.
- `people`: source array of `{ id, name, color, scores, portraitImage, hupuRating, hupuRatingTemplate, hupuRatingImage }`.
- `people[].kda`, `people[].heroIcons`, `heroIconLayout`, `hupuRatingTemplate`, and `hupuRatingImage`: optional metadata for the right-side KDA block, hero icon area, and rating presentation. `heroIconLayout` defaults to `grid`; `hupuRatingTemplate` defaults to `classic`.
- `matchLeftTeam`, `matchLeftScore`, `matchRightScore`, and `matchRightTeam`: top match-score title fields. Legacy `teamName` remains readable and is written as a compatibility display string such as `EDG 2:1 JDG`.
- `battleRank` and `battlePower`: editable metadata for the small white battle-power badge rendered in the radar area's upper-left empty space and saved in project JSON. CSV generation can also populate these fields for Remotion renders.
- `previewPeople`: animated display copy of `people`.
- `activePersonId`: selected person for editing and highlighted comparison rendering.
- `portraitImage`: Data URL for the imported right-side image.
- `people[].portraitImage`: per-person Data URL for the imported right-side image; `portraitImage` remains as a legacy/global fallback for older project JSON.
- `portraitTitle`: legacy project metadata for old JSON compatibility; it is no longer edited or rendered as a visible right-side title.
- `portraitAnimationProgress`: `0-1` display progress for the person image entry effect.
- `exportStatus`: short status text shown in the preview toolbar.
- `videoDuration`: selected WebM export length in seconds.
- `isVideoExporting`: disables video controls while browser recording is active.

The model still keeps scores on `people[]` for multi-person editing, while dimensions carry shared axis ranges. Generated single-person JSON also mirrors the active score into `dimensions[].score` for easier CSV/Remotion inspection.

## ECharts

`src/utils/chartOptions.js` builds the ECharts option object.

Key behavior:

- Radar indicators are created from `dimensions`, including per-axis `min` and `max`.
- Indicator labels include the active person's current score as lower-priority text.
- The chart canvas does not render a main project title. The legacy title is retained for file naming, JSON snapshots, and series metadata.
- The radar is centered left of the portrait area with a slightly higher visual center so 16:9 exports feel balanced.
- Scores above a dimension's `max` extend past the outer ring instead of being clipped. Over-cap values receive brighter score text and a controlled line glow while the radar data boundary remains marker-free.
- Radar filled areas render at `0.8` opacity so all configured themes keep the requested strong internal fill.
- Multi-person mode maps each person to one radar data item, with per-person color.
- The active person receives stronger line emphasis.
- Legend appears only when there is more than one person.
- ECharts animation is disabled; replay is controlled manually in React by updating `previewPeople`.

## Animation

`App.jsx` handles replay with `requestAnimationFrame`.

Flow:

1. Cancel any existing animation frame.
2. Copy current `people` as target data.
3. Set all `previewPeople` scores to zero.
4. Interpolate every score from zero to target using cubic easing.
5. Update `previewPeople`, which updates the ECharts option.
6. Update `portraitAnimationProgress`, which drives the right-side person image opacity, scale, and vertical offset.

This ensures lines, points, and filled polygon areas expand together.

The person image entry uses the same replay trigger. On reset it starts at progress `0`, then eases to `1` over about `1100ms`, clamped to the `500-1500ms` range so the image appears during the early radar generation instead of before or after it.

## Portrait/Image Import

The right-side image area lives in `RadarPreview.jsx`.

Behavior:

- The portrait area is a finished-preview container without visible helper borders.
- Only the image slot is a clickable `<label>` with an `input[type="file"]` accepting `image/*`; the rating block is not an image import target.
- Imported images are read as Data URLs in `App.jsx` and stored on the active person as `people[].portraitImage`.
- The legacy top-level `portraitImage` is still read and written for older project compatibility, but active per-person images take precedence.
- The preview displays the image with `object-fit: cover` plus a slight zoom, matching the safe-zone bounds while making portrait content larger. In the 16:9 right-side layout, the top match-score bar is taller with larger team and score text, and the main portrait image slot is wider/taller while staying below the title. For the JRs + single-hero layout, the rating image/card now sits 20px lower than the prior bottom baseline, the JRs screenshot slot preserves the `1178x327` reference aspect ratio and uses `contain` so imported wide screenshots remain fully visible, the single hero icon keeps its prior lower baseline, and the KDA/name row is raised 24px from that icon-derived baseline. The identity row height is enlarged so the active person name and KDA text have enough vertical room, and PNG export reads the actual name/KDA element positions so the exported still matches the visible web layout.
- The live preview wraps the image in a person-entry stage that fades in, scales from about `0.94` to `1`, and rises by about `16px` during replay/video export.
- The active person's name remains editable in `PeopleEditor.jsx` and is rendered above the KDA value in the existing right-side KDA row, not over the imported image. The identity row uses extra vertical height, a slightly larger player-name font, and separate downward text-only offsets for the name and KDA so enlarged names remain fully visible in web preview, PNG export, and Remotion output without moving the hero icons or rating block.
- The right-side portrait area no longer renders a separate portrait title or main title in web preview, PNG export, or Remotion output.
- `hupuRating` is read from the active person or top-level project metadata and rendered under the portrait image in preview, PNG export, and Remotion MP4. In the web editor it can be selected directly as `0.0-10.0` in `0.1` steps from either the left controls or the preview rating block. `hupuRatingTemplate` selects between the legacy compact `classic` score block and the newer `jrs` card; the JRs card stays in the lower rating row, is wider than the default safe-zone, renders `虎扑JRs评分` and the score in one same-size centered heading row with short black divider lines on both sides, keeps the left divider visually shorter than the right divider, plus an importable white inner image slot stored as `hupuRatingImage`.
- The top bar renders the match-score title from four fields: left team, left score, right score, and right team. The score colon is anchored to the horizontal center of the canvas, the two score numbers sit symmetrically around it, and the team names sit to the left/right. The approved color is Burgundy red `#800020` with Hanyu white `#F9F7EA` text. Old JSON with only `teamName` remains valid and is parsed when it looks like `EDG 2:1 JDG`; otherwise the old string becomes the left-side team label.
- `kda` and `heroIcons` are read from the active person first, then top-level project metadata. The right-side finished preview renders the active person name above the KDA value without a visible `KDA` label. The player name, KDA, and 虎扑/JRs rating text are intentionally larger than radar axis labels so the right-side identity block reads clearly in 1920x1080 Remotion output. `heroIconLayout` selects the hero icon template: `grid` keeps a compact 2-row by 3-column square slot grid between the KDA value and 虎扑评分, with looser spacing from the KDA row and rating area, while `single` renders the first available hero icon as one larger centered image. In the JRs single-icon path, the rating card is pinned from the bottom and the hero/KDA/name stack is positioned upward from that anchor. The grid and single layouts use separate offsets so six-slot grid adjustments do not move the single centered-image template. In `grid`, the portrait image and KDA row can be nudged independently from the grid icons and rating block, which keeps icon/rating alignment stable during upper portrait/KDA micro-adjustments. The portrait image, KDA row, and hero icon block can also be nudged independently from the 虎扑评分 block so the rating row stays anchored during upper-stack micro-adjustments. In `grid`, a single icon from CSV/text input is placed in the second row's center slot, while multiple icons fill left-to-right and top-to-bottom.
- Each web hero icon slot is a clickable image import target. Slot imports are stored as six-position arrays so a manually imported image stays in the clicked slot; CSV/text input remains compact pipe-separated data and is laid out by the slot rules.
- The portrait area and image slot avoid visible helper borders in the finished preview/export.
- A remove button clears the active person's `portraitImage`.
- Legacy `portraitTitle`, top-level `portraitImage`, and per-person `portraitImage` values remain readable/writable in JSON snapshots for compatibility.

## PNG Export

`src/utils/exportPreview.js` composes the export. `composePreviewCanvas` is the shared frame primitive; `composePreviewPng` wraps it and returns a PNG Data URL.

Flow:

1. Locate the ECharts canvas inside `.preview-canvas`.
2. Create an offscreen canvas at 3x pixel scale.
3. Paint the theme background.
4. Draw the ECharts canvas at its displayed position.
5. Locate `.safe-zone`.
6. Locate the image slot and KDA/person-name row inside `.safe-zone`.
7. If a portrait image exists, load it and draw it with cover-crop behavior plus a slight zoom inside the image slot.
8. Apply the current `portraitAnimationProgress` to the image alpha, scale, and vertical offset when composing frames.
9. Draw the compact portrait image, active person name above KDA, selected hero icon layout, selected 虎扑评分 template, upper-left battle-power badge, and finally the top team bar so the match-score title remains above large portrait images.
10. Return a PNG Data URL.

`App.jsx` then:

- Sends the PNG Data URL to `/api/export-png`.
- Triggers a browser download.
- Shows the saved path or fallback download message.

`vite.config.js` implements `/api/export-png` for development and writes files into `exports/`.

## Video Export

`src/utils/exportVideo.js` implements V1 browser-side video export using `MediaRecorder` and a dedicated recording canvas.

Flow:

1. `App.jsx` resets `previewPeople` scores and `portraitAnimationProgress` to zero.
2. `recordPreviewWebm` creates a recording canvas at the current ratio's fixed export size: `1080x1920`, `1080x1080`, or `1920x1080`.
3. `MediaRecorder` captures that canvas stream at 30 FPS.
4. The app replays the radar animation using the current `animationDuration`, matching the normal preview replay speed.
5. While the animation runs, the recorder repeatedly composes the current preview frame into the recording canvas, including the current person image entry progress.
6. The final frame remains visible for the rest of the selected video duration.
7. A WebM Blob is downloaded in the browser.
8. In development, `App.jsx` sends the WebM Data URL to `/api/export-video`, and `vite.config.js` writes it into `exports/`.

The V1 implementation exports WebM because browser-native MP4 encoding is not consistently available. Video recording uses higher bitrate for 1080p-class output. The recording layer returns format metadata and is isolated behind `recordPreviewWebm`, leaving room for future MP4 conversion or server-side frame rendering.

## Remotion MP4 Render

`remotion/` contains the first formal MP4 rendering module. It is independent from the browser WebM exporter and does not remove or replace existing in-app video export.

Composition:

- `RadarRevealLandscape`
  - 1920x1080.
  - 30 FPS.
  - Duration is derived from render props and clamped to `5`, `8`, or `10` seconds.
  - V1 renders one target person.
  - The final frame is visually aligned to the existing web editor 16:9 template rather than using a separate video-poster style.
- `RadarBatchSequenceLandscape`
  - 1920x1080.
  - 30 FPS.
  - Renders one continuous landscape MP4 from multiple JSON inputs.
  - Uses Remotion `Series.Sequence` so each transition or JSON owns a contiguous segment and segments connect directly with no FFmpeg concat step.
  - Total duration is the sum of all item durations. Each item defaults to 5 seconds and uses its own JSON `duration` when present.
  - Legacy `items` manifests still render only radar scenes in the listed order.
  - Episode manifest JSON is the primary input for complete videos. Normal maps render `MapScoreTransition → MapSummaryCard → player radar JSONs`.
  - A special Summary map with `summary.type === "series"` renders `MapScoreTransition → SeriesSummaryCard → series player radar JSONs`; its `items` use the same radar loading and duration logic as normal maps.
  - Map `items` are no longer sorted inside `maps[]`; the manifest path list is treated as the final edit order. Missing or empty map `items` are skipped by the CLI with a warning when a transition or summary is still present.
- `MapScoreTransition`
  - 1920x1080.
  - 30 FPS.
  - Defaults to 3 seconds and can be overridden with `duration`.
  - Renders a standalone pure-white score transition screen for use before each map/radar segment.
  - Accepts `leftTeamName`, `rightTeamName`, `leftTeamLogo`, `rightTeamLogo`, `leftScore`, `rightScore`, optional `mapName`, optional `label`, optional `duration`, and `theme`.
  - The visible header uses one red pill from `label`, recommended as `Map 1`, `Map 2`, or `Map 3`; `mapName` remains accepted as metadata but is not rendered as a second pill.
  - Team logo props use Remotion static-file paths such as `image/team-logos/EDG.jpg`, which resolve to files under `public/image/team-logos/`; JPG/JPEG is the documented default while explicit PNG paths remain valid.
  - Missing logo files do not block rendering; the logo card falls back to the team abbreviation.
- `MapSummaryCard`
  - 1920x1080, 30 FPS.
  - Renders an optional white-red map overview card between a map score transition and that map's radar scenes.
  - Accepts left/right team names, logos, per-map score, map name/image, optional `roundEvents`, one optional summary paragraph, and KDA/ACS/ADR/KAST team stats.
  - Uses a pure white background, centered large bold black title with a thicker red header divider, black/dark-gray body text, shallow gray borders, restrained red accents, and simple fade/slide/scale animation so it stays visually aligned with the `white-red` radar style instead of the dark esports transition style.
  - Keeps `mapName`, `leftTeamName`, `rightTeamName`, and `summaryText` readable as metadata, but the finished card no longer renders the upper-right map-name pill, score-side team labels, score underline, summary paragraph, or bottom map-image red stripe.
  - Renders `roundEvents` as a centered two-row table between the large score and map image. Each column is one round; the winning team row shows that round's method icon and the losing row shows a two-digit round number. Method icons use red attack-side or blue defense-side assets, inferred from `leftStartingSide`/`rightStartingSide` and round number unless an event provides `winnerSide` or `winnerColor`. The layout dynamically shrinks cell size, icon size, and gaps for longer maps, supports up to 30 rounds without wrapping, and keeps the table centered for shorter 13/18/24-round inputs.
  - Round-event icons resolve from `public/image/round-events/`. When an event does not provide an explicit icon path, local assets are tried in JPG, JPEG, then PNG order, using names such as `image/round-events/elimination_red.jpg`, `defuse_blue.jpg`, and `time_blue.png`. Explicit JPG/JPEG/PNG paths remain supported. Cells render image elements with `object-fit: contain`; if all icon variants fail, the winning cell renders a compact method-letter fallback while the losing cell still renders the two-digit round number.
  - Side team stats render KDA/ACS/ADR/KAST cards, with the KDA value given a wider non-ellipsis value area so strings like `56/79/32` and `79/56/40` remain complete.
  - Map images resolve through Remotion `staticFile()` from `public/image/maps/`; missing images fall back to a light white-red map-name placeholder.
- `SeriesSummaryCard`
  - 1920x1080, 30 FPS.
  - Renders only for `summary.type === "series"` and does not read or display `roundEvents`.
  - Shows the final series score, team logos, KDA/ACS/ADR/KAST totals, and 1-5 `mapResults`.
  - Layouts are one centered card, two columns, three columns, 2x2, or centered three-over-two. Missing images use team initials or map-name placeholders.

Data flow:

1. Remotion receives JSON props from `--props`.
2. `remotion/utils/dataAdapter.js` normalizes either the new render shape, an episode `maps[]` manifest, or an existing RadarForge project snapshot.
3. In a RadarForge snapshot, V1 uses the active/target person when possible and otherwise the first `people[]` entry. It reads `dimensions[].name/min/max/score`, `people[].name`, `people[].scores` / `people[].values` / `people[].data`, `people[].color`, `people[].portraitImage`, top-level `portraitImage`, `hupuRating`, `hupuRatingTemplate`, `hupuRatingImage`, match-score fields, legacy `teamName`, `battleRank`, `battlePower`, `kda`, `heroIcons`, `heroIconLayout`, legacy `title`, legacy `portraitTitle`, and `themeId`; only the person name, not the legacy title fields, is rendered in the right-side info stack.
4. Theme IDs reuse `src/config/themes.js` so video colors stay close to the web preview.
5. The adapter deliberately prefers person-level values for RadarForge project JSON because Remotion `defaultProps` are shallow-merged with incoming props; this prevents demo `values` from overriding exported `people[].scores`.
6. `validateRadarVideoProps()` checks required dimensions, values, matching lengths, numeric scores, and a readable person name before the Node render scripts call Remotion.
7. `scripts/render-utils.mjs` also normalizes field-based player JSON from CSV-style exports: if a player file has no `dimensions`, `scores`, `values`, or `data` arrays but includes the six fixed `*_score` radar fields (`Rating`, `战斗评分`, `回合均伤`, `首杀能力`, `KAST`, `助攻贡献`), it adds compatible `dimensions` objects with each field's original `score`, `min`, and `max`, plus matching `scores` and `values` arrays so Remotion default props cannot override the player data. Remotion then scales every axis with `(score - min) / (max - min)` while the labels keep the raw score values.
8. `normalizeRadarBatchProps()` converts legacy `items[]` or episode `maps[]` into `sequenceItems[]`. The batch composition renders `transition`, normal `summary`, `series-summary`, and `radar` items with their dedicated components.
9. In `maps[]` mode, the fixed order remains `transition → summary → items`. `normalizeMapSummaryProps()` handles map summaries and round events; `normalizeSeriesSummaryProps()` handles final series score, team totals, and up to five map results. Old manifests remain compatible.
10. `src/config/templateTokens.js` stores the 1920x1080 landscape radar and portrait layout constants used by Remotion, mirroring the web preview's 16:9 canvas proportions.

Rendering approach:

- The radar chart is drawn with React + SVG rather than ECharts.
- SVG was chosen for deterministic frame rendering, precise center-out point interpolation, cleaner MP4 output, and easier future timeline control.
- `RadarRevealScene.jsx` is the shared scene primitive for both `RadarRevealLandscape` and `RadarBatchSequenceLandscape`.
- `RadarChartSvg.jsx` supports variable dimension counts, custom `min/max` ranges, over-cap values, theme/person colors, grid/axis fade-in, and filled polygon reveal. Its center, radius, labels, and clockwise/counterclockwise ordering are tuned to match the ECharts-based web preview, while the Remotion baseline keeps the data boundary marker-free so the filled radar interior remains the visual focus.
- `CharacterReveal.jsx` handles the web-template right info area: compact cover-fit image with the same zoom/focus, active person name above KDA, the same selectable 2x3 raised hero icon grid or single centered hero icon template, and bottom classic/JRs 虎扑评分 template. Remotion local image props for portrait images, hero icons, and JRs rating screenshots resolve through `staticFile()` so manifest/JSON paths such as `image/hupu/test.jpg` map to `public/image/hupu/test.jpg`; Data URLs and HTTP URLs remain usable. The Remotion landscape tokens are the layout baseline for the top match-score bar and right-side portrait/KDA/hero/rating spacing; web preview and PNG export are synchronized from that visual direction. `RadarRevealScene.jsx` also renders the centered match-score top bar, the upper-left battle-power badge, and no separate main title or portrait title.
- `MapScoreTransition.tsx` can run standalone or inside `RadarBatchSequenceLandscape`. It uses its own `duration` prop for fade timing so embedded transitions fade out before the next radar segment even when the full composition is much longer. It uses Remotion frame interpolation for a 0-0.5s scene fade, slower 0.3-1.8s team logo slide/scale-in, 1.8-2.2s score pop, hold, and final 0.3s fade-out. The background is intentionally pure white with no outer frame or horizontal guide lines. It does not change the standalone `RadarRevealLandscape` single-person render path.

Commands:

```bash
npm run remotion:studio
npm run remotion:render:demo
npx remotion render remotion/index.jsx MapScoreTransition renders/output/map-score-transition-demo.mp4 --props=examples/map-score-transition-demo.json
npm run render:full -- examples/map-score-episode-demo.manifest.json renders/output/map-score-episode-demo.mp4
npm run build:episode -- batch-input/one-piece-four-emperors.csv
npm run render:one -- /Users/danmou/Desktop/codex/雷达图/exports/example.json
npm run render:batch
npm run render:full -- batch-input/one-piece-four-emperors.manifest.json
```

The demo render reads `examples/radar-landscape-demo.json` and outputs `exports/radar-landscape-demo.mp4`.

Render scripts:

- `scripts/build-episode.ts`
  - One-command CSV-to-full-video workflow, invoked by `npm run build:episode -- <csv>`.
  - Verifies the CSV exists, validates required fields, checks every `characterImage` local path before generation, and treats non-fixed numeric columns as radar dimensions.
  - Generates deterministic `exports/<characterName>.json` and `exports/<characterName>.png` files for the current run, overwriting same-name episode assets so the manifest points at predictable paths.
  - Writes `batch-input/<csv-name>.manifest.json` in CSV row order.
  - Builds `RadarBatchSequenceLandscape` props directly from the generated JSON files and renders `renders/output/<csv-name>.mp4`.
  - Logs the CSV path, character count, per-character image/JSON/PNG paths, manifest path, MP4 path, total duration, and success/failure status.
- `scripts/render-utils.mjs`
  - Centralizes the Remotion entry point, composition id, default JSON input directory, MP4 output directory, codec, and current serial-render concurrency.
  - Uses `@remotion/bundler` to bundle `remotion/index.jsx`.
  - Uses `selectComposition()` and `renderMedia()` from `@remotion/renderer`.
  - Reads RadarForge JSON directly, validates it with `validateRadarVideoProps()`, passes that exact JSON object as `inputProps`, and relies on `remotion/utils/dataAdapter.js` through the composition metadata path, preserving existing JSON compatibility.
  - Logs the current JSON path, selected person name, dimensions, scores, and output MP4 path before each render.
  - Generates safe MP4 names from `characterName`, `name`, `playerName`, `person.name`, `people[0].name`, `characters[0].name`, `character.name`, `title`, or the JSON file name, then appends `-2`, `-3`, and so on for conflicts.
- `scripts/render-one.mjs`
  - Renders one explicit JSON file to `/Users/danmou/Desktop/codex/雷达图/renders/output`.
  - Fails fast with a clear validation error instead of rendering fallback data when the provided JSON is incomplete.
- `scripts/render-batch.mjs`
  - Scans `/Users/danmou/Desktop/codex/雷达图/exports/*.json`.
  - Renders files serially to `/Users/danmou/Desktop/codex/雷达图/renders/output`.
  - Records individual failures and continues with the remaining files before printing a summary.
- `scripts/render-full.mjs`
  - Reads an optional manifest such as `batch-input/one-piece-four-emperors.manifest.json` or `examples/map-score-episode-demo.manifest.json`.
  - Legacy manifest `items` are resolved relative to the project root and rendered in that exact order.
  - Episode manifest `maps[]` entries can provide `transition` props, optional `summary` props, optional `roundEvents`, and a map-local `items` JSON list; the script reads the JSON files, validates them, and preserves the item order from the manifest.
  - Manifest validation keeps the normal map score/round-event rules. Series summaries require final scores, positive duration, and 1-5 valid `mapResults`; `roundEvents` is rejected for `type: "series"`.
  - Without a manifest, scans `exports/*.json` and sorts by filename.
  - Builds one Remotion props object with all JSON payloads, selects `RadarBatchSequenceLandscape`, and renders one MP4 to `renders/output/full-video.mp4` unless a custom output path is provided.
  - Logs the number of characters, each segment's name/duration/frame count, total duration, and output path before rendering.
- `scripts/generate-series-summary-assets.mjs`
  - Reads the five-map `examples/edg-xlg-full-episode.manifest.json` and its 50 player JSON files.
  - Generates ten `exports/summary_<player>.json` files by summing KDA/FK/assist contribution, weighting Rating/ACS/ADR/KAST by map round count, and recalculating the series battle-power ranking.
  - Writes `examples/edg-xlg-full-episode-with-summary.manifest.json` with a sixth `maps[]` entry containing `Summary transition → SeriesSummaryCard → ten series player radar items`.

## JSON Save / Import

`src/utils/projectIO.js` creates and downloads project snapshots.

Snapshots include:

- Version and timestamp.
- Title.
- Theme id.
- Canvas ratio id.
- Animation duration.
- Portrait title.
- Portrait image Data URL.
- `teamName` compatibility text, `matchLeftTeam`, `matchLeftScore`, `matchRightScore`, `matchRightTeam`, `kda`, normalized `heroIcons` arrays, `heroIconLayout`, `hupuRatingTemplate`, and `hupuRatingImage`.
- Dimensions with `name`, `min`, `max`, and a single-person `score` mirror for generated JSON.
- People and scores.
- Top-level and per-person `hupuRating`, `hupuRatingTemplate`, `hupuRatingImage`, `kda`, `heroIcons`, and `heroIconLayout`.
- Per-person portrait images, plus the top-level portrait image fallback for older snapshots.

`vite.config.js` implements `/api/export-json` for development and writes files into `exports/`.

## Batch Asset Generation

`scripts/` also contains the local-first batch asset pipeline:

- `scripts/batch-utils.mjs`
  - Reads CSV files, validates required fields, detects structured radar dimensions from `*_score`, `*_min`, and `*_max` columns, falls back to legacy non-fixed numeric columns, normalizes theme and duration values, resolves local portrait and hero icon image paths into Data URLs, creates RadarForge project snapshots through `createProjectSnapshot()`, sanitizes file names, and avoids name collisions with `-2`, `-3`, and later suffixes.
- `scripts/generate-json-from-csv.mjs`
  - Implements `npm run generate:json -- <csv>`.
  - Writes one RadarForge-compatible JSON per valid row into `exports/`.
  - Logs row-level validation errors without writing invalid rows.
- `scripts/generate-png-from-json.mjs`
  - Implements `npm run generate:png -- <json>`.
  - Uses the same Remotion bundle, `RadarRevealLandscape` composition, and JSON adapter as the MP4 renderer.
  - Renders the final frame as a 1920x1080 PNG into `exports/`, matching the JSON file base name.
- `scripts/generate-assets.mjs`
  - Implements `npm run generate:assets -- <csv>`.
  - Writes JSON first, then renders the corresponding PNG from that same JSON.
  - Continues after row-level failures and prints JSON/PNG success counts, failed rows, reasons, and the output directory.

CSV input uses these fixed fields:

```text
series,title,subtitle,characterName,characterImage,theme,duration,hupuRating,teamName,matchLeftTeam,matchLeftScore,matchRightScore,matchRightTeam,kda,heroIcons,heroIconLayout,hupuRatingTemplate,hupuRatingImage
```

Structured dimension columns use `<dimension>_score`, `<dimension>_min`, and `<dimension>_max`, for example `霸气_score,霸气_min,霸气_max`. Missing `min/max` default to `0/100` for compatibility. Legacy CSVs that only provide one numeric column per dimension still work and are normalized to `0-100`. Scores may exceed `max` to create an over-cap visual. `subtitle` maps to the current `portraitTitle`/Remotion subtitle area. `teamName`, `matchLeftTeam`, `matchLeftScore`, `matchRightScore`, `matchRightTeam`, `kda`, `heroIcons`, `heroIconLayout`, `hupuRatingTemplate`, and `hupuRatingImage` are optional for old CSV compatibility. The match-score fields take priority; legacy `teamName` can still be parsed from strings like `EDG 2:1 JDG`. `heroIcons` uses pipe-separated paths such as `image/rumble.jpg|image/ahri.jpg`, is truncated to 6 icons, and uses the second-row center slot when only one icon is provided in the default `grid` layout. JPG/JPEG is preferred in examples, while PNG remains accepted. `heroIconLayout` accepts `grid` or `single`; invalid or empty values fall back to `grid`. `hupuRatingTemplate` accepts `classic` or `jrs`; invalid or empty values fall back to `classic`. `hupuRatingImage` resolves a local image path into the JRs card's white inner slot. `theme` maps to `themeId`; unknown theme IDs fail validation. `duration` accepts the current Remotion presets `5`, `8`, or `10`.

Generated JSON preserves the existing RadarForge snapshot structure:

- `version`, `exportedAt`, `title`, `themeId`, `canvasRatioId`, `animationDuration`, `portraitTitle`, `portraitImage`.
- `dimensions: [{ name, score, min, max }]`.
- `people: [{ name, color, scores, portraitImage, hupuRating, hupuRatingTemplate, hupuRatingImage, kda, heroIcons, heroIconLayout }]`.

The batch scripts add compatible metadata fields such as `series`, `subtitle`, `characterName`, `characterImage`, `theme`, `duration`, `hupuRating`, `hupuRatingTemplate`, `hupuRatingImage`, legacy `teamName`, match-score fields, `kda`, `heroIcons`, and `heroIconLayout` so Remotion output names, duration, rating template, rating-card image, match bar, KDA, hero icon layout, and image props remain explicit. The existing `render:batch` command scans these generated `exports/*.json` files without a separate conversion step.

## Styling

`src/index.css` contains the app's component-level CSS on top of Tailwind import.

Design principles:

- Compact production tool layout.
- No landing page.
- restrained panels with 8px radius.
- Stable fixed-format preview canvas using CSS `aspect-ratio`.
- Right-side image area is part of the export canvas, not a separate overlay outside export.
