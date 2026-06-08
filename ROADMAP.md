# ROADMAP.md

## Current Product State

RadarForge currently supports first-version creator workflows:

- Top match-score title with editable left/right team and score fields.
- Small editable battle-power badge in the radar area's upper-left empty space, with selectable rank and custom battle-power text included in PNG export, project JSON, CSV assets, and Remotion output.
- Editable dimensions, with add/remove support.
- Per-dimension score ranges with `min`/`max`, while legacy `0-100` data remains compatible.
- Over-cap radar rendering when a score exceeds its dimension max, with stronger glow/point emphasis in web preview, PNG stills, and Remotion MP4.
- Realtime ECharts radar preview.
- Center-out replay animation with adjustable duration.
- Ten visual themes:
  - White background red radar style.
  - Dark esports style.
  - Clean blue-white style.
  - Fresh green-gold style.
  - Warm orange-purple night style.
  - Liquid glass cyan-purple style.
  - Aurora dark teal-purple style.
  - Dopamine pink-blue style.
  - Neo-brutal yellow-green style.
  - Calm mint-coral style.
- Canvas ratios:
  - `9:16` vertical.
  - `1:1` square.
  - `16:9` landscape.
- Right-side portrait/image area with centered match-score top bar (`left team + left score : right score + right team`), separated compact image/person-name+KDA/hero icon/虎扑评分 regions, selectable 2x3 hero icon grid or single centered hero icon template, selectable classic/JRs 虎扑评分 templates with an importable JRs card image slot, direct `0.0-10.0` rating selection, editable per-person names shown above KDA, per-person direct image import, per-slot hero icon image import, remove action, and PNG/video export inclusion.
- Person image entry animation during replay/video export, using fade-in, slight scale-up, and upward movement synchronized with the radar generation.
- People comparison mode supporting `1-5` people.
- Per-person name, color, scores, portrait image, and optional `hupuRating`, `hupuRatingTemplate`, `hupuRatingImage`, `kda`, `heroIcons`, and `heroIconLayout`.
- Built-in templates:
  - Esports player.
  - Anime fighter.
  - Basketball player.
  - Football player.
  - Historical figure.
  - Custom template.
- PNG export of the current canvas only, saved to `exports/` in development.
- WebM animation video export of the current canvas, with 5s, 8s, and 10s duration presets, a final hold frame, and fixed 1080p-class output sizes.
- Remotion MP4 render V1 as a separate formal video path:
  - `RadarRevealLandscape` composition.
  - 1920x1080, 30 FPS, 5s/8s/10s duration support.
  - Single-person landscape reveal aligned to the existing 16:9 web preview template, with team name bar, upper-left battle-power badge, person image generation, KDA, hero icons, 虎扑评分, SVG radar expansion, custom ranges, and over-cap emphasis.
  - Shared landscape template tokens for the Remotion final frame so the video path can keep converging with the web canvas.
  - Example render props in `examples/radar-landscape-demo.json`.
  - Node render scripts for one JSON or batch rendering all `exports/*.json` into `renders/output/*.mp4`.
  - Render scripts validate each JSON before rendering and log the file path, selected person, dimensions, scores, and MP4 output path so batch jobs can verify that every video uses its own data.
- Remotion full-video sequence render:
  - `RadarBatchSequenceLandscape` composition.
  - 1920x1080, 30 FPS, 16:9 landscape output.
  - `npm run render:full -- <manifest> [output.mp4]` reads multiple JSON files in manifest order and renders one continuous MP4.
  - Without a manifest, `render:full` reads all `exports/*.json` files sorted by filename.
  - Each character segment defaults to 5 seconds and honors per-JSON `duration` when present.
  - Episode manifest JSON is the current final full-video input format. Manifests can describe `maps[]`; each map may include `transition`, `summary`, and `items`, then renders in manifest order as `MapScoreTransition → MapSummaryCard → player radar JSONs`.
  - `maps[]` also supports a special Summary segment. When `summary.type === "series"`, the same `transition → summary → items` flow renders `MapScoreTransition → SeriesSummaryCard → series player radar JSONs`.
  - `SeriesSummaryCard` shows the final series score, both teams' KDA/ACS/ADR/KAST totals, and a responsive 1-5 map result gallery without `roundEvents`.
  - The EDG vs XLG production example now includes five normal maps plus a generated Summary segment with ten aggregated series player JSONs.
  - `render:full` validates episode manifests before rendering, including map structure, transition/summary duration and scores, item JSON paths, and `roundEvents` winner/method values. Empty map `items` are skipped with a warning.
- Remotion map-score transition preset:
  - `MapScoreTransition` composition.
  - 1920x1080, 30 FPS, 16:9 landscape output.
  - Shows left/right team logos, team names, score, and one visible `Map n` label before a radar segment on a pure-white background.
  - Team logos are read through Remotion `staticFile()` from `public/image/team-logos/` while props use paths like `image/team-logos/edg.png`.
  - Missing logos fall back to team abbreviation placeholders.
- Remotion map-summary card preset:
  - `MapSummaryCard` composition.
  - 1920x1080, 30 FPS, 16:9 landscape output.
  - Uses the `white-red` visual system with a centered bold black title, thicker red divider, clean map score, centered two-row round-events table, map image, team logos, and KDA/ACS/ADR/KAST team stat cards; map-name and summary-text props remain metadata for manifests.
  - The optional `roundEvents` field supports up to 30 rounds in `maps[].summary`, using winner/method data plus attack-red and defense-blue `public/image/round-events/` assets. Winning cells show method icons, losing cells show two-digit round numbers, and optional `winnerSide`/`winnerColor` fields can override automatic side-color inference.
  - The side team stat cards keep KDA values fully visible, such as `56/79/32`, without ellipsis truncation.
  - Episode `maps[]` manifests can include an optional `summary` field. When present, full-video sequence rendering inserts `MapSummaryCard` after `MapScoreTransition` and before that map's radar segments.
- Remotion series-summary card preset:
  - `SeriesSummaryCard` composition.
  - 1920x1080, 30 FPS, white-red visual system.
  - Used only by `maps[].summary.type: "series"` and keeps Summary inside the normal map sequence instead of appending a root-level final page.
  - `mapResults` supports 1-5 maps with centered layouts; missing map images and team logos use text placeholders.
- JSON save/import for project data.
- Batch asset generation from CSV:
  - `npm run generate:assets -- <csv>` creates one RadarForge-compatible JSON and one 1920x1080 PNG per row in `exports/`.
  - `npm run generate:json -- <csv>` creates only JSON files.
  - `npm run generate:png -- <json>` renders a PNG still from one JSON through the Remotion composition.
  - Fixed CSV fields describe series/title/subtitle/person/image/theme/duration/hupuRating/teamName or match-score fields/battleRank/battlePower/kda/heroIcons/heroIconLayout/hupuRatingTemplate/hupuRatingImage; structured `*_score`, `*_min`, and `*_max` columns become ranged radar dimensions.
  - Generated JSON can be consumed directly by the existing `npm run render:batch` MP4 workflow.
- One-command episode generation from CSV:
  - `npm run build:episode -- <csv>` validates the CSV and local character images, writes deterministic JSON/PNG files into `exports/`, creates a CSV-order manifest beside the CSV, and renders one complete `RadarBatchSequenceLandscape` MP4 into `renders/output/`.
  - Project-level Codex Skill `radarforge-episode` lets the user request a full episode in natural language without manually typing terminal commands.

## Current Priority

The app is usable as a local content creation tool. The near-term priority is to harden creator workflows before adding heavier production features.

## Next Priorities

1. Improve portrait/image controls.
   - Optional image positioning controls: cover/contain, x/y focus, scale.
   - Support transparent PNG portrait assets gracefully.
   - Add structured secondary image slots for team badges, faction logos, or creator marks.
   - Add replace/remove affordances for individual hero icon slots after direct slot import.

2. Improve chart editing.
   - Drag to reorder dimensions.
   - Batch paste dimensions/scores inside the web editor.
   - Per-person duplicate action.
   - Better validation and reset actions.

3. Improve export quality.
   - Fixed export resolution presets for 1080x1920, 1080x1080, 1920x1080.
   - Continue removing any export-only helper chrome that distracts from finished assets.
   - Optional watermark/signature.

4. Improve video export.
  - Add a web-editor action that can trigger the Remotion single/batch/episode render workflow from the UI.
  - Add Remotion presets for vertical and square video outputs.
  - Add multi-person comparison support in the Remotion SVG radar layer.
  - Add optional intro and outro presets for full-video sequence rendering.
  - Expand `MapSummaryCard` beyond round-events and KDA/ACS/ADR/KAST with FK/FD, half-side score, pistol round summaries, and multikill stats.
  - Add CSV-to-full-episode automation only after the episode manifest JSON workflow stays stable in production use.
  - Higher-fidelity timeline controls and frame rendering hooks.

5. Expand template library.
   - More sports and character presets.
   - Template metadata, preview thumbnails, and categories.
   - User-saved local templates.

## Known Risks / Watch Items

- ECharts is the largest bundle contributor; build emits a chunk-size warning.
- Project JSON can contain Data URL portrait images, which may make saved JSON large.
- Batch CSV image paths are embedded as Data URLs when local files are found; very large source images will make generated JSON larger.
- The Vite local export middleware is development-oriented; production deployment needs a different persistence strategy.
- Remotion V1 renders MP4 from CLI, Studio, or the new Node batch scripts; it is not yet wired into the web editor UI.
