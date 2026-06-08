# CHANGELOG.md

## 2026-06-08

### Changed

- Changed Remotion's default team-logo and map paths from missing PNG/generic paths to existing JPG assets.
- Changed inferred round-event icon lookup to prefer JPG, then JPEG, then PNG while preserving explicit PNG support.
- Added a JPG copy of the existing `time_blue` round-event icon while retaining the original PNG compatibility asset.
- Updated the hero-icon path placeholder and image-path documentation to use JPG-first examples.

### Verified

- `npm run lint` passes.
- `npm run build` passes with the existing Vite chunk-size warning.
- `npx remotion still remotion/index.jsx MapSummaryCard exports/map-summary-card-jpg-priority-check.png --frame=90` renders successfully without image 404 errors.

## 2026-06-06

### Added

- Added `scripts/generate-series-summary-assets.mjs` and `npm run generate:series-summary` to aggregate the five EDG vs XLG maps into ten series player JSON files.
- Added `examples/edg-xlg-full-episode-with-summary.manifest.json`, containing five normal map segments followed by the complete Summary transition, series card, and ten series player radars.
- Added `SeriesSummaryCard` for whole-series summaries with final score, team totals, and responsive 1-5 map result cards.
- Added `summary.type: "series"` support inside episode `maps[]`, preserving `MapScoreTransition → SeriesSummaryCard → player radar items`.
- Added series-summary validation, missing image/logo fallbacks, and standalone/full-episode examples.

### Changed

- Updated the batch composition to select `SeriesSummaryCard` only for series summaries while leaving normal `MapSummaryCard` and legacy manifests unchanged.

### Verified

- Validated the generated production manifest as 6 map entries, 60 player radar items, 72 total segments, and 349 seconds.
- Confirmed all ten `exports/summary_*.json` paths exist and the final sequence is `Summary transition → SeriesSummaryCard → ten player radars`.
- Rendered 1-map, 3-map, 5-map, and missing-image summary stills successfully.
- Rendered `examples/series-summary-episode-demo.manifest.json` as six ordered segments totaling 27 seconds, including a player radar after the series summary.
- `npm run lint` passes.
- `npm run build` passes with the existing Vite chunk-size warning.

### Changed

- Fixed field-based player JSON normalization for Remotion render scripts so the six fixed radar fields now produce per-dimension `score` / `min` / `max` objects and matching `scores` / `values` arrays instead of falling back to `0-100` ranges or Remotion demo defaults.
- Updated Remotion battle-rank normalization to accept numeric ranks such as `6` and render them as `#6`, preserving each player JSON's own `battleRank` and `battlePower`.
- Preserved raw radar values in Remotion labels instead of rounding decimal scores to one place.
- Preserved normalized match-score fields across Remotion metadata and component re-normalization so render outputs keep the JSON's own team names and scores.
- Documented the field-based JSON min/max render behavior in README and architecture notes.

### Verified

- Node normalization checks confirmed `exports/map1_Rarga.json` renders `battleRank #1`, `battlePower 100`, and six per-axis min/max ranges.
- Node normalization checks confirmed `exports/map1_Smoggy.json` renders `battleRank #6`, `battlePower 45`, and 战斗评分 `202` scales to `0.3278` on its `143-323` axis.
- `npm run generate:png -- exports/map1_Rarga.json` and `npm run generate:png -- exports/map1_Smoggy.json` generated stills with JSON-specific battle badges, match score, raw labels, and per-axis radar scaling.
- `npm run render:full -- /tmp/radarforge-rarga-smoggy.manifest.json renders/output/rarga-smoggy-render-check.mp4` rendered a two-player full-video sequence successfully.
- `npm run lint` passes.
- `npm run build` passes with the existing Vite chunk-size warning.

## 2026-06-05

### Changed

- Added `examples/edg-xlg-full-episode.manifest.json`, a path-based five-map EDG vs XLG episode manifest generated from the embedded source manifest with 50 player radar JSON references.
- Fixed two referenced assets used by the new manifest: `exports/map2_NoMan.json` now points to an existing hero icon, and the Map 4 summary image path points to the existing `public/image/maps/隐士修所.jpg` asset.
- Documented the new full EDG vs XLG episode manifest path in README.
- Updated Remotion `CharacterReveal` image handling so portrait images, hero icons, and JRs rating screenshots resolve local public paths through `staticFile()` while preserving Data URL and HTTP URL support.
- Documented the `image/hupu/test.jpg` public-relative path rule for JRs rating screenshots in README and architecture notes.
- Added render-script normalization for field-based player JSON so files with the six fixed `*_score` radar fields automatically receive compatible `dimensions` and `scores` arrays without removing the original `*_min`/`*_max` fields.
- Removed the visible round-events legend from `MapSummaryCard` so the summary page no longer explains which icon color or number means what.

### Verified

- Node validation confirmed `examples/edg-xlg-full-episode.manifest.json` expands to 5 maps, 50 player radar segments, 60 total sequence segments, and 290 seconds.
- Asset checks confirmed all 175 logo, map, character, hero, and JRs screenshot references used by the new full manifest exist under `public/`.
- Demo image path check confirmed the current full-episode manifest's portrait, hero icon, and JRs screenshot assets exist under `public/`.
- `npm run render:full -- examples/full-episode-json-demo.manifest.json renders/output/full-episode-json-demo.mp4` completed successfully after the Remotion local image path fix.
- Node validation confirmed `exports/map1_Rarga.json` now normalizes to the six expected radar dimensions and scores.
- `npm run lint` passes.
- `npm run build` passes with the existing Vite chunk-size warning.

### Changed

- Updated `MapSummaryCard` round-events rendering so winning cells use red attack-side or blue defense-side method icons, while losing cells show two-digit round numbers instead of `loss` icons.
- Added `leftStartingSide`/`rightStartingSide` summary props plus optional per-event `winnerSide` and `winnerColor` overrides for side-color inference, with manifest validation for the new fields.
- Updated the round-events demo JSON and documentation for the new colored icon naming convention.

### Verified

- `npm run lint` passes.
- `npm run build` passes with the existing Vite chunk-size warning.
- Generated Remotion stills for 19, 24, and 30 round-event layouts plus an explicit empty `roundEvents` layout.
- `npm run render:full -- examples/full-episode-json-demo.manifest.json renders/output/full-episode-json-demo-roundevents-check.mp4` rendered the 23-second episode successfully.

### Changed

- Defined episode manifest JSON as the primary complete-video input for `render:full`, preserving each map's `items` order as the final player radar playback order instead of sorting by score.
- Updated `RadarBatchSequenceLandscape` map normalization so maps can render any available combination of `transition`, `summary`, and player radar items in the order `MapScoreTransition → MapSummaryCard → player radar JSONs`.
- Added pre-render episode manifest validation for manifest existence, `maps` shape, per-map content, transition/summary scores and durations, item JSON paths, and supported `roundEvents` winner/method values.
- Changed empty or missing map `items` to emit a CLI warning and skip player radar segments when a map still has a transition or summary.
- Added `examples/full-episode-json-demo.manifest.json` for a direct `MapScoreTransition → MapSummaryCard → 3 player radars` render test.
- Restored `examples/full-episode-json-demo.manifest.json` map `items` to JSON file path strings so it matches the episode manifest contract and passes pre-render validation.
- Updated generated map player JSON files and the embedded episode example so JRs rating screenshots use `image/hupu/test.jpg` instead of the missing root-level `test.jpg` path.
- Updated `examples/full-episode-json-demo.manifest.json` to reference currently present `exports/map1_*.json` files.
- Documented the episode manifest JSON workflow, validation rules, direct render command, compatibility notes, and CSV deferral in README, architecture, and roadmap.

### Verified

- Node summary check confirmed `examples/full-episode-json-demo.manifest.json` expands to `MapScoreTransition → MapSummaryCard → nobody → Jieni7 → ZmjjKK` with 5 total segments and 23 seconds.
- Node summary check confirmed the restored demo manifest expands to `MapScoreTransition → MapSummaryCard → Smoggy → Lysoar → ZmjjKK` with 5 total segments and 23 seconds.
- Search confirmed no remaining `hupuRatingImage: "test.jpg"` entries in `examples/` or `exports/`, and `public/image/hupu/test.jpg` exists.
- Node summary check confirmed the current demo manifest expands with the existing `exports/map1_*.json` files and totals 23 seconds.
- Temporary manifest checks confirmed empty map `items` emit a warning and invalid `roundEvents` winner/method data fails before rendering.
- `npm run lint` passes.
- `npm run build` passes with the existing Vite chunk-size warning.
- `npm run render:full -- examples/full-episode-json-demo.manifest.json renders/output/full-episode-json-demo.mp4` rendered the complete 23-second episode MP4 successfully.

### Changed

- Updated `MapSummaryCard` round-events cells to render local image icons first, with PNG/JPG/JPEG fallbacks, centered `object-fit: contain` sizing, shallow gray placeholders on load failure, and no default K/D/B/T/X letters.
- Added a compact round-events icon legend under the two-row events table while preserving the current white-red layout.
- Widened the `MapSummaryCard` team stat panels and adjusted KDA stat rows so values such as `56/79/32` and `79/56/40` render fully without ellipsis truncation.

### Added

- Added optional `roundEvents` support to `MapSummaryCard`, rendering a centered two-row round event table between the map score and map image with winner method icons and loss icons.
- Added default round-event icon path normalization for `image/round-events/elimination.png`, `defuse.png`, `detonation.png`, `time.png`, and `loss.png`, with text fallbacks when icon files are not present.
- Added `examples/map-summary-card-demo.json` and updated map-summary manifest examples with `roundEvents` data.

### Changed

- Adjusted the `MapSummaryCard` layout so side team panels sit farther outward, the map image sits lower, and the score-to-map middle region can hold 13-30 centered round cells without wrapping.
- Documented the `roundEvents` manifest field, icon directory, MapSummaryCard behavior, and workflow compatibility in README, architecture, roadmap, and render prop notes.

### Verified

- JSON parsing confirmed the new map-summary example and episode manifests remain valid, with 19/21/24 round-event examples.
- `npm run lint` passes.
- `npm run build` passes with the existing Vite chunk-size warning.
- `npx remotion still remotion/index.jsx MapSummaryCard exports/map-summary-card-demo.png --props=examples/map-summary-card-demo.json --frame=90` generated the 19-round MapSummaryCard still.
- `npx remotion still remotion/index.jsx MapSummaryCard exports/map-summary-card-30-round-check.png --props=/tmp/map-summary-card-30-rounds.json --frame=90` generated a 30-round layout stress still.
- Local dev server responded at `http://localhost:5173/` with HTTP 200.

## 2026-06-04

### Changed

- Updated the Deep Sea Pearl `MapSummaryCard` header so the centered title renders larger, heavier, and black, with a thicker red divider line below it.
- Refined the Deep Sea Pearl `MapSummaryCard` layout with a centered red title, red header divider, no upper-right map-name pill, no score-side team labels, no score underline, no summary paragraph, and no bottom red map-image stripe while keeping those fields available as metadata.
- Reverted the latest Deep Sea Pearl `MapSummaryCard` refinement, restoring the prior left-aligned title with red accent, upper-right map-name pill, score-side team labels, summary paragraph, red guide lines, and visible card/image outlines.

### Verified

- `npm run lint` passes after the Deep Sea Pearl map-summary header style update.
- `npm run build` passes with the existing Vite chunk-size warning.
- `npx remotion still remotion/index.jsx MapSummaryCard exports/map-summary-card-demo.png --props=examples/map-summary-card-demo.json --frame=90` regenerated the map-summary still with the black larger title and thicker red divider.
- Local dev server responded at `http://localhost:5173/` with HTTP 200 after the header style update.
- `npm run lint` passes after the Deep Sea Pearl map-summary layout refinement.
- `npm run build` passes with the existing Vite chunk-size warning.
- `npx remotion still remotion/index.jsx MapSummaryCard exports/map-summary-card-demo.png --props=examples/map-summary-card-demo.json --frame=90` regenerated the refined Deep Sea Pearl still.
- `npm run lint` passes after reverting the map-summary refinement.
- `npm run build` passes with the existing Vite chunk-size warning.
- `npx remotion still remotion/index.jsx MapSummaryCard exports/map-summary-card-demo.png --props=examples/map-summary-card-demo.json --frame=90` regenerated the restored map-summary still.

### Added

- Added the Remotion `MapSummaryCard` composition for a 16:9 white-red map overview page with map score, summary text, map image, team logos, and KDA/ACS/ADR/KAST stat cards.
- Added optional `summary` support to episode `maps[]` manifests so `RadarBatchSequenceLandscape` can render `MapScoreTransition → MapSummaryCard → radar items` for maps that provide summary data.
- Added `examples/map-summary-card-demo.json`, extended `examples/map-score-episode-demo.manifest.json` with per-map summary blocks, and reserved `public/image/maps/` for map images.

### Changed

- Revised `MapSummaryCard` toward a pure-white visual treatment by removing the pale pink wash, pink stat fills, and heavier shadows while keeping only restrained red accents.
- Updated full-video render logging and Remotion prop types to include map-summary sequence items while preserving legacy `items[]` and existing `maps[]` manifests that omit `summary`.
- Documented the MapSummaryCard preview/render commands, manifest shape, image path rules, and workflow compatibility in README and architecture/roadmap notes.

## 2026-06-03

### Added

- Added episode `maps[]` manifest support for `RadarBatchSequenceLandscape`, inserting a `MapScoreTransition` before each map and then rendering that map's radar JSON list from low score to high score.
- Added `examples/map-score-episode-demo.manifest.json` as a three-map manifest template with per-map transition props and player JSON lists.

### Changed

- Updated `render:full` manifest loading and logging so legacy `items[]` manifests remain compatible while new map manifests show the complete transition/radar sequence.
- Moved only the active person name text and KDA text down another 10px across web preview, PNG export, and Remotion output while leaving the portrait image, hero icons, and rating blocks in place.
- Enlarged the right-side identity row height again, increased the active person name font size, moved the person name down 5px, and moved KDA down 10px across web preview, PNG export, and Remotion output so larger names remain fully visible.
- Raised the active person name/KDA row by 24px in the JRs + single-hero layout and enlarged the fixed identity block height across web preview, web PNG export, and Remotion output so larger player names are not clipped by the KDA area.
- Fixed the JRs 虎扑评分 screenshot slot to preserve the `1178x327` reference aspect ratio and render imported wide screenshots with `contain` across web preview, PNG export, and Remotion output.
- Moved the JRs rating card 20px lower and the single-hero KDA/name/icon stack 15px lower from the prior baseline.
- Removed circular radar data point markers from the web ECharts preview and Remotion SVG output so only the radar boundary line remains.
- Documented the new JRs screenshot ratio, lower right-side stack, and marker-free radar baseline in `AGENTS.md`, `ARCHITECTURE.md`, and `README.md`.

### Verified

- Node summary check confirmed `examples/map-score-episode-demo.manifest.json` expands to 3 maps, 9 radar segments, and 12 total sequence segments in the expected transition-then-radar order.
- Node summary check confirmed the existing `batch-input/vctcn_edg_xlg_gf_map1_fracture_jpg_test.manifest.json` legacy `items[]` manifest still expands to radar-only segments with no inserted transitions.
- `npm run render:full -- examples/map-score-episode-demo.manifest.json renders/output/map-score-episode-demo.mp4` rendered the full map-score episode MP4 successfully.
- `npm run lint` passes after the episode manifest integration.
- `npm run build` passes with the existing Vite chunk-size warning.
- `npm run lint` passes after the person-name/KDA text-only downshift.
- `npm run build` passes with the existing Vite chunk-size warning.
- Local dev server responded at `http://localhost:5173/`, and source checks confirmed web preview offsets at `translateY(15px)` / `translateY(20px)` plus Remotion tokens `playerNameOffsetY: 15` / `kdaOffsetY: 20`.
- `npm run lint` passes after the identity-row height and typography adjustment.
- `npm run build` passes with the existing Vite chunk-size warning.
- Browser verification at `http://localhost:5174/` confirmed the ECharts canvas renders, the identity row has no detected name/KDA overflow, and PNG export saved `exports/账号内容能力雷达图-1780455256527.png`.
- `npm run generate:png -- examples/radar-landscape-demo.json` regenerated `exports/radar-landscape-demo.png` with the updated Remotion identity-row tokens.
- `npm run lint` passes.
- `npm run build` passes with the existing Vite chunk-size warning.
- `npm run generate:png -- /tmp/radarforge-jrs-layout-check.json` generated `exports/radarforge-jrs-layout-check.png` with the full-width JRs screenshot visible and no radar point markers.
- Chrome headless opened `http://localhost:5173/` and wrote `exports/web-jrs-layout-page-check.png`, confirming the app loads and the web radar canvas renders without circular point markers.

## 2026-06-02

### Changed

- Widened/tallened the 16:9 top match-score bar treatment across web preview, PNG export, and Remotion output with larger team and score text.
- Enlarged the right-side portrait and single hero icon treatment, pinned the JRs rating image/card to about 15px above the canvas bottom, shifted that rating group left by 10px, and restacked the single hero icon, KDA, and person name above it with fixed spacing across web preview, PNG export, and Remotion output.
- Documented the updated 16:9 title and right-side JRs/single-hero layout baseline in AGENTS, ARCHITECTURE, and README.

### Changed

- Rebased the 16:9 web/PNG/Remotion visual tuning on the Remotion landscape output: slimmer radar data lines and point marks, a taller top match-score bar with larger team/score text, looser right-side portrait/KDA/hero/rating spacing, and larger player/KDA/虎扑/JRs typography.
- Documented the Remotion-first 16:9 visual baseline and updated the long-term layout guardrails for the top bar, radar emphasis, and right-side identity/rating stack.

### Verified

- `npm run lint` passes.
- `npm run build` passes with the existing Vite chunk-size warning.
- `npm run generate:png -- examples/radar-landscape-demo.json` generated `exports/radar-landscape-demo.png` with the updated Remotion baseline.
- `npm run generate:png -- exports/Jieni7.json` generated `exports/Jieni7.png`, confirming the screenshot-like Jieni7 layout has a taller title bar, slimmer radar marks, larger right-side text, and more separated portrait/KDA/hero/JRs regions.
- `npm run dev -- --host 0.0.0.0` started at `http://localhost:5173/`; Chrome headless generated `exports/web-layout-check.png`, confirming the web app loads and the ECharts radar canvas renders.

### Changed

- Updated the `radarforge-episode` Skill and README one-command episode instructions to explicitly allow character images as JPG/JPEG/PNG files under `image/`.

### Changed

- Renamed the clearly identifiable character image with `MADA` on the jersey to `image/character/mada.jpg`; left uncertain character images unchanged to avoid incorrect ID names.
- Changed the standalone Remotion `MapScoreTransition` header from two pills (`MAP SCORE` plus map name) to a single red `Map n` label pill, defaulting to `Map 1`.
- Slowed the `MapScoreTransition` entry animation by about one second and removed the decorative outer frame and horizontal background lines so the transition uses a pure-white background.
- Reverted the previous six-slot grid icon downshift so the default 2x3 hero icon grid returns to its prior position.
- Moved only the portrait image and active person name/KDA row down by 10px in default 2x3 grid mode, leaving the grid icons, rating block, and `single` centered hero icon template unchanged across web preview, PNG export, and Remotion output.

### Verified

- `npm run lint` passes.
- `npm run build` passes with the existing Vite chunk-size warning.
- `npx remotion still remotion/index.jsx MapScoreTransition exports/map-score-transition-map1-clean-check.png --props=examples/map-score-transition-demo.json --frame=66` generated a pure-white `Map 1` check still with no outer frame or horizontal guide lines.
- `npx remotion render remotion/index.jsx MapScoreTransition renders/output/map-score-transition-demo.mp4 --props=examples/map-score-transition-demo.json` rendered the updated 4-second transition MP4 successfully.
- `npm run lint` passes.
- `npm run build` passes with the existing Vite chunk-size warning.
- `npm run generate:png -- /tmp/radarforge-grid-check.json` generated `exports/radarforge-grid-check.png` with the six-slot grid restored and only the grid-mode portrait/KDA row lowered.
- `npm run generate:png -- /tmp/radarforge-single-jrs-check.json` generated `exports/radarforge-single-jrs-check.png`, confirming the `single` centered hero icon path still renders.

## 2026-06-01

### Changed

- Moved only the default 2x3 hero icon grid down by 10px across web preview, PNG export, and Remotion output while leaving the `single` centered hero icon template unchanged.

### Verified

- `npm run lint` passes.
- `npm run build` passes with the existing Vite chunk-size warning.
- `npm run generate:png -- /tmp/radarforge-grid-check.json` generated `exports/radarforge-grid-check.png` with the lowered six-slot grid.

### Added

- Added the standalone Remotion `MapScoreTransition` composition for a 1920x1080, 30 FPS map-score transition screen with team logos, team names, score, optional map name, optional label, logo placeholders, and a 3-second default animation.
- Added `examples/map-score-transition-demo.json` and the `public/image/team-logos/` asset directory placeholder for Remotion static team-logo files.

### Changed

- Documented the new map-score transition props, logo directory, preview command, and MP4 render command in `README.md`, `ARCHITECTURE.md`, and `ROADMAP.md` without wiring it into the existing radar reveal or batch episode flow.

## 2026-05-31

### Changed

- Documented the finalized JRs rating-card alignment rules in `AGENTS.md`, including card right shift, centered heading, shorter left divider, and independently shifted inner image slot.
- Recentered the JRs 虎扑评分 heading and moved only the JRs card image slot another 10px to the right across web preview, PNG export, and Remotion output.
- Shifted the JRs 虎扑评分 card 10px to the right while preserving its card width and shortened only the left black divider line across web preview, PNG export, and Remotion output.
- Moved the right-side portrait image, active person name/KDA row, and hero icon block up by 5px while keeping the 虎扑评分/JRs rating block anchored.
- Moved the right-side active person name/KDA row up by 5px in the web preview and PNG export composition.
- Repositioned the `single` hero icon layout so the single icon starts about 5px below the KDA row instead of overlapping the person name/KDA text.
- Synchronized the single-icon offset into Remotion landscape tokens so generated PNG/MP4 output follows the web preview.

### Verified

- `npm run lint` passes.
- `npm run build` passes with the existing Vite chunk-size warning.
- `npm run generate:png -- /tmp/radarforge-single-jrs-check.json` generated `exports/radarforge-single-jrs-check.png` with the JRs heading recentered and the inner image slot shifted right.

## 2026-05-30

### Changed

- Lowered the 16:9 right-side portrait/KDA/hero-icon stack so large portraits stay clear of the top match-score title.
- Reduced the default 2x3 hero icon slot size and tightened the classic 虎扑评分 typography and label-to-score spacing across web preview, PNG export, and Remotion output.
- Changed PNG composition order so the top match-score bar is drawn last and remains above imported portrait imagery.

### Verified

- `npm run lint` passes.
- `npm run build` passes with the existing Vite chunk-size warning.
- `npm run dev -- --host 0.0.0.0` started at `http://localhost:5174/` because `5173` was already in use, and a headless Chrome screenshot confirmed the app loads and the ECharts radar canvas renders.
- `npm run generate:png -- /Users/danmou/Desktop/codex/雷达图/exports/Casting.json` regenerated `exports/Casting.png` with the lowered portrait stack, smaller 2x3 hero icons, tighter classic 虎扑评分 block, and visible top match-score bar.

### Added

- Added a compact white battle-power badge in the radar area's upper-left empty space, with editable rank and battle-power fields in the web editor.
- Persisted `battleRank` and `battlePower` in project JSON and included the badge in web PNG export.
- Synchronized the battle-power badge into Remotion still/MP4 rendering and CSV-generated assets, and documented the cross-surface rule in `AGENTS.md`.

### Verified

- `npm run lint` passes.
- `npm run build` passes with the existing Vite chunk-size warning.
- Headless Chrome at `http://localhost:5174/` confirmed the ECharts canvas renders, changed the badge to `#2` and `战斗力 1031`, and exported `exports/账号内容能力雷达图-1780151163860.png`.
- `npm run generate:png -- examples/radar-landscape-demo.json` regenerated `exports/radar-landscape-demo.png` with the Remotion battle-power badge.

### Changed

- Moved the default 2x3 hero icon grid downward so it no longer overlaps the name/KDA row and sits about 10px above the classic 虎扑评分 block across web preview, PNG export, and Remotion output.
- Removed the visible main-title and right-side portrait-title controls from the web editor while keeping legacy `title` and `portraitTitle` JSON compatibility.
- Documented that the manually editable person name from `PeopleEditor.jsx` is the rendered right-side name above KDA across web preview, PNG export, and Remotion output.

### Verified

- Browser verification at `http://localhost:5173/` confirmed the six-slot hero grid now leaves 6px after the KDA row and 10px before the classic 虎扑评分 block.
- `npm run generate:png -- /Users/danmou/Desktop/codex/雷达图/exports/Casting.json` regenerated Remotion PNG output with the lowered six-slot hero grid and copied it to `exports/hero-grid-lower-10px-check.png`.
- `npm run lint` passes.
- `npm run build` passes with the existing Vite chunk-size warning.
- `npm run generate:png -- /Users/danmou/Desktop/codex/雷达图/exports/Casting.json` regenerated Remotion PNG output with no main title or portrait title and copied it to `exports/titleless-person-name-remotion-check.png`.
- Browser verification at `http://localhost:5173/` confirmed the web editor no longer shows `主标题` or `人物区标题`, the person name input remains editable, and the right-side name above KDA updates from that field.

## 2026-05-29

### Changed

- Added the active person name above the right-side KDA value in the existing KDA row across web preview, PNG export, and Remotion output, with smaller matched typography so the right-side block does not move downward.
- Renamed the 26 Valorant hero portrait files in `image/` to English agent names for path-safe CSV/JSON references.

## 2026-05-28

### Added

- Replaced the top team-name bar with an editable match-score title made from left team, left score, right score, and right team fields.
- Added match-score persistence in project JSON, CSV-generated assets, PNG composition, and Remotion output while keeping legacy `teamName` compatibility.
- Added the approved match-score title constraints to `AGENTS.md` and updated the Remotion demo JSON with `EDG 2:1 JDG` fields.

### Changed

- Changed the approved top match-score title bar from warm off-white to Klein blue `#002FA7` with pure white text across web preview, PNG export, and Remotion output.
- Promoted the Burgundy red `#800020` and Hanyu white `#F9F7EA` top match-score title color from trial to the approved web preview and Remotion/PNG output style.
- Centered the match-score colon on the canvas center line and tightened the score spacing so the default top title reads like `EDG 2:1 JDG`.
- Synchronized the Remotion demo path so `npm run generate:png -- examples/radar-landscape-demo.json` renders the match-score title.
- Raised the single centered hero icon layout slightly in web preview and Remotion output so it no longer overlaps the JRs rating heading.
- Enlarged the main right-side portrait image slot in web preview and Remotion output by extending it slightly upward and closer to the KDA row.
- Extended the main right-side portrait image slot again by the same approximate amount, while moving the KDA stack down enough to preserve spacing.
- Moved the whole right-side portrait/KDA/hero-icon/JRs-rating group up by 10px without changing its internal spacing.
- Documented the approved right-side 16:9 portrait/KDA/hero-icon/JRs-rating layout constraints in `AGENTS.md` for future implementation work.

### Verified

- `npm run generate:png -- examples/radar-landscape-demo.json` regenerated `exports/radar-landscape-demo.png` with the Klein-blue Remotion top bar.
- `npm run generate:png -- examples/radar-landscape-demo.json` regenerated `exports/radar-landscape-demo.png`, then copied it to `exports/match-title-burgundy-hanyu-check.png` for visual review of the Burgundy/Hanyu color trial.
- Function check confirmed the Remotion team-bar token is `background: "#800020"` and `color: "#F9F7EA"`.
- Documentation check confirmed `AGENTS.md` and `ARCHITECTURE.md` now describe Burgundy red `#800020` and Hanyu white `#F9F7EA` as the approved top title colors.
- Headless Chrome generated `exports/match-title-klein-web-check.png` and confirmed the web top bar is `rgb(0, 47, 167)`, text is `rgb(255, 255, 255)`, and the colon remains centered.
- `npm run lint` passes after the match-score title change.
- `npm run build` passes with the existing Vite chunk-size warning after the match-score title change.
- Headless Chrome generated `exports/match-title-check-tight.png` and confirmed the score colon center equals the preview canvas center.
- `npm run generate:png -- examples/radar-landscape-demo.json` generated `exports/radar-landscape-demo.png` with the Remotion match-score title.
- `npm run lint` passes.
- `npm run build` passes with the existing Vite chunk-size warning.
- Headless Chrome verification confirmed the single hero icon now leaves about 50px before the JRs rating heading while the widened rating card remains inside the 16:9 preview canvas.
- Headless Chrome verification confirmed the main portrait image slot is now 153px high, starts 10px higher, and leaves about 5px before the KDA row.
- Headless Chrome verification confirmed the repeated portrait expansion makes the slot 173px high, starts another 10px higher, and leaves about 8px before the KDA row.
- Headless Chrome verification confirmed the whole right-side group moved up by 10px, with the portrait-to-KDA, KDA-to-icon, and icon-to-rating gaps preserved.
- Documentation check confirmed `AGENTS.md` now includes the approved right-side layout constraints and cross-surface alignment expectations.

## 2026-05-27

### Added

- Added a selectable `hupuRatingTemplate` with the existing compact 虎扑评分 block as `classic` and a new dark `jrs` card styled after the JRs评分 reference.
- Persisted the rating template in JSON snapshots, CSV-generated assets, and Remotion props so web preview, PNG export, and MP4 output stay aligned.

### Changed

- Changed the JRs 虎扑评分 template into an image-card layout: removed the leading numeric prefix from the title, moved the card upward, and replaced the text comment area with an importable white image slot.
- Reduced the JRs template's black treatment to a thin top divider so it no longer covers the image area above.
- Moved the JRs black divider into the heading row as short left/right lines and made the score the same size as `虎扑JRs评分`.
- Pinned the JRs rating/image card to the bottom rating row by removing its upward transform so it no longer overlaps the hero icon image above.
- Widened the JRs rating/image card in web preview and Remotion so the bottom score image area has more horizontal room.
- Widened the JRs rating/image card again by allowing the web card to extend slightly beyond the right safe-zone and increasing the Remotion width token.
- Moved the widened JRs rating/image card slightly upward while preserving spacing from the hero icon area, and increased the Remotion width token again.
- Applied a final width increase to the JRs rating/image card in web preview and raised the Remotion width token so exported/generated images do not look narrower than the live preview.
- Applied one more final width increase to the JRs rating/image card, shifted it left to stay inside the 16:9 canvas, and raised the Remotion width token to keep generated PNG/MP4 output visually aligned.
- Updated the right-side portrait controls with a 虎扑评分模板 selector while keeping the score itself directly selectable from `0.0-10.0`.
- Added `hupuRatingImage` to project snapshots, CSV assets, PNG composition, and Remotion output so the card image follows web/export/video surfaces.

### Verified

- `npm run lint` passes.
- `npm run build` passes with the existing Vite chunk-size warning.
- `npm run dev -- --host 0.0.0.0` started at `http://localhost:5174/` because `5173` was already in use, and `curl -I http://localhost:5174/` returned `200 OK`.
- Headless Chrome verification confirmed the app loads, the ECharts canvas renders, and selecting `single` plus `jrs` shows the new JRs评分 card without clipping.
- Headless Chrome verification confirmed the updated JRs card sits in the requested higher region, removes the `1031` prefix, and exposes a file input inside the white image slot.
- Headless Chrome verification confirmed the JRs template now uses a transparent background with only a `3px` black top divider and keeps the image slot white.
- Headless Chrome verification confirmed the JRs heading now places `虎扑JRs评分` and the score on one row with matching `13px` type, no top border, and divider lines only on the left/right sides of the heading row.
- Headless Chrome verification confirmed the JRs card now has no upward transform, aligns to the bottom rating row, and leaves about 62px between the hero icon and the rating card.
- Headless Chrome verification confirmed the widened JRs rating area now uses 288px of the 296px right safe-zone width, with a 277px image slot.
- Headless Chrome verification confirmed the second width increase gives the JRs rating area 340px and the inner image slot 327px while staying inside the 926px preview canvas.
- Headless Chrome verification confirmed the latest adjustment gives the JRs rating area 381px, the inner image slot 365px, keeps it inside the preview canvas, and preserves a 40px gap from the hero icon area above.
- Headless Chrome verification confirmed the final widened JRs rating area is 441px, the inner image slot is 423px, the right edge remains inside the 926px preview canvas, and the hero icon area above remains uncovered.
- Function checks confirmed project JSON snapshots and Remotion normalization preserve `hupuRatingTemplate: "jrs"`.
- Function checks confirmed project JSON snapshots and Remotion normalization preserve `hupuRatingImage`.

### Changed

- Synchronized the approved 52px web single centered hero icon template to Remotion by setting the 1920x1080 `singleIconSize` token to `94`.
- Updated `AGENTS.md` so future right-side hero icon layout work treats the default 2x3 grid and `single` centered-image template as aligned web/PNG/Remotion surfaces.

### Verified

- `npm run lint` passes.
- `npm run build` passes with the existing Vite chunk-size warning.
- Function check confirmed the Remotion `singleIconSize` token is `94` while the web single-icon CSS remains `52px`.

## 2026-05-26

### Added

- Added a selectable hero icon layout template with the original 2x3 grid preserved as the default and a new single centered hero icon option.
- Persisted `heroIconLayout` in JSON snapshots, CSV-generated assets, and Remotion props so web preview, PNG export, and MP4 output use the same template.

### Changed

- Updated the portrait controls with a compact hero icon template selector and documented the optional CSV `heroIconLayout` field.
- Reduced the web preview/web PNG single centered hero icon slot from `92px` to `72px` for inspection before synchronizing the video template.
- Reduced the web preview/web PNG single centered hero icon slot again from `72px` to `52px`; Remotion/video output remains unsynchronized pending approval.

### Verified

- `npm run lint` passes.
- `npm run build` passes with the existing Vite chunk-size warning.
- `npm run dev -- --host 0.0.0.0` started at `http://localhost:5173/`; Chrome verification confirmed the app loads, the ECharts canvas renders, the default six-slot grid remains visible, and the new hero icon template selector is present.
- Function checks confirmed compact one-icon data still maps to the second-row center grid slot and `heroIconLayout: "single"` persists into project snapshots.
- Generated `exports/账号内容能力雷达图-1779809351625.png` from the web PNG export with `image/kaido.png` loaded in the smaller single centered hero icon slot.
- `npm run lint` passes after the single-icon preview size adjustment.
- `npm run lint` passes after the 52px single-icon adjustment.
- `npm run build` passes with the existing Vite chunk-size warning after the 52px single-icon adjustment.

## 2026-05-25

### Changed

- Changed single-image `heroIcons` layout so compact CSV/text input now places the image in the second row's center slot across web preview, PNG export, and Remotion output.
- Synchronized the approved raised 2x3 hero icon slot grid into Remotion output and kept single-icon center-slot behavior across web, PNG, and MP4 paths.
- Made each web hero icon square a direct image import target while preserving compact pipe-separated CSV/text input behavior.
- Raised the web preview and web PNG 2x3 hero icon slot grid slightly while keeping Remotion unchanged for approval.
- Changed the web preview and web PNG hero icon area to a 2x3 square slot grid, with a single image placed in the first-row center slot and multiple images filling left-to-right before Remotion synchronization.
- Removed the visible `KDA` label from the right-side finished preview/export block and reduced the KDA value typography across web preview, PNG composition, and Remotion output.
- Reverted the latest portrait image/KDA upward-offset change across web preview, Remotion template tokens, and the Remotion character reveal so the prior right-side layout is restored.
- Moved the whole right-side portrait-to-rating group downward so the bottom of 虎扑评分 better aligns with the radar chart's bottom score text, without changing the internal spacing.
- Nudged the portrait image down so imported heads are not clipped, shrank the KDA and 虎扑评分 numeric text again, and tightened the reserved gap between KDA and rating so the rating remains inside the info area.
- Brightened the team-name bar to near-white, restored it to full width, moved the portrait/KDA block upward, reduced KDA and 虎扑评分 typography, and preserved a blank middle row between KDA and rating for future content.
- Narrowed the team-name bar and changed it from red/white to a pale cream background with black text across web preview, PNG export, and Remotion templates.
- Moved the live radar chart, right-side portrait, KDA, hero icon area, and 虎扑评分 downward to reduce bottom whitespace while keeping sizes and data fields unchanged.
- Updated the matching Remotion landscape template vertical positions so PNG/MP4 output stays aligned with the web preview.

### Verified

- `npm run lint` passes.
- `npm run build` passes with the existing Vite chunk-size warning.
- Function check confirmed one compact `heroIcons` value maps to `[null,null,null,null,"one.png",null]`.
- `npm run dev -- --host 0.0.0.0` started at `http://localhost:5174/` because `5173` was already in use; Chrome verification confirmed the app loads, the radar canvas renders, and all six hero icon slots remain file import targets.
- `npm run lint` passes.
- `npm run build` passes with the existing Vite chunk-size warning.
- `npm run generate:png -- /Users/danmou/Desktop/codex/雷达图/exports/Casting.json` regenerated `exports/Casting.png` with the synchronized 2x3 Remotion hero icon grid.
- Browser verification at `http://localhost:5173/` confirmed all six hero icon slots have `image/*` file inputs.
- Web PNG export regenerated the one-image and five-image hero grid checks after raising the grid.
- Web PNG export generated `exports/hero-grid-one-check-1779714697091.png` for the one-image centered-slot check and `exports/hero-grid-five-check-1779714697529.png` for the five-image layout check.
- Browser verification at `http://localhost:5173/` found the right-side KDA block has no label span and the value text renders at `20px`.
- `npm run generate:png -- /Users/danmou/Desktop/codex/雷达图/exports/Casting.json` regenerated `exports/Casting.png` with the KDA label removed from Remotion output.
- `npm run generate:png -- /Users/danmou/Desktop/codex/雷达图/exports/Casting.json` regenerated `exports/Casting.png` after the revert.
- `npm run generate:png -- /Users/danmou/Desktop/codex/雷达图/exports/Casting.json` regenerated `exports/Casting.png` with the lower radar and right-side info positions.
- Re-inspected `exports/Casting.png`; the team-name bar is narrower, pale cream, and uses black text.

### Added

- Added `teamName`, `kda`, and `heroIcons` project fields with old CSV/JSON compatibility.
- Added a full-width red team-name bar, compact right-side portrait image, KDA block, two-row hero icon grid, and retained 虎扑评分 block in the web preview, PNG template, and Remotion single/full-video templates.
- Added `batch-input/team-kda-heroicons-example.csv` to document the new pipe-separated `heroIcons` CSV format.

### Changed

- Updated CSV asset generation to parse optional `teamName`, `kda`, and pipe-separated `heroIcons`, resolve local hero icon paths into Data URLs, and write the fields into generated JSON.
- Updated Remotion data normalization and type notes so `RadarRevealLandscape` and `RadarBatchSequenceLandscape` consume the new right-side metadata consistently.
- Updated README, ROADMAP, and ARCHITECTURE for the new layout, fields, CSV rules, and rendering flow.

### Verified

- `npm run lint` passes.
- `npm run build` passes with the existing Vite chunk-size warning.
- `npm run generate:assets -- batch-input/team-kda-heroicons-example.csv` generated `exports/Casting.json` and `exports/Casting.png`.
- Visually inspected `exports/Casting.png`; the top red `BRO` bar, compact portrait, KDA `1/3/3`, two rows of hero icons, and 虎扑评分 `4.6` are present.
- `npm run render:one -- /Users/danmou/Desktop/codex/雷达图/exports/Casting.json` rendered `renders/output/Casting-2.mp4`.
- `npm run build:episode -- batch-input/team-kda-heroicons-example.csv` regenerated JSON/PNG/manifest and rendered `renders/output/team-kda-heroicons-example.mp4`.
- `npm run generate:assets -- batch-input/hupu-rating-ranged-example.csv` succeeded without the new optional fields, confirming old CSV compatibility.
- `npm run generate:png -- examples/radar-landscape-demo.json` succeeded, confirming old JSON compatibility.
- `npm run dev -- --host 0.0.0.0` started at `http://localhost:5173/`, and `curl -I http://localhost:5173/` returned `200 OK`.

## 2026-05-24

### Changed

- Added direct web editing for 虎扑评分 with `0.0-10.0` selection in `0.1` steps from both the left portrait controls and the preview rating block.
- Narrowed the right-side image import click target to the portrait image slot so clicking the 虎扑评分 area no longer opens the file picker.

### Verified

- `npm run lint` passes.
- `npm run build` passes with the existing Vite chunk-size warning.

### Added

- Added structured CSV dimensions with `*_score`, `*_min`, and `*_max` columns, plus optional `hupuRating`.
- Added ranged dimension JSON objects with `name`, `score`, `min`, and `max` while preserving `people[].scores` for existing projects.
- Added over-cap radar rendering for scores above `max` in ECharts preview, generated PNG stills, and Remotion SVG video templates.
- Added a bottom 虎扑评分 block under the portrait image in preview, PNG export, and Remotion MP4.

### Changed

- Updated the 16:9 landscape layout so the radar sits slightly higher, the portrait image is smaller, and the rating block has dedicated space.
- Updated `batch-input/one-piece-four-emperors.csv` to demonstrate `hupuRating`, structured dimension columns, and over-cap values for 凯多/香克斯.
- Updated README, ROADMAP, and ARCHITECTURE for the new CSV rules, JSON shape, layout, and rendering behavior.

### Verified

- `npm run lint` passes.
- `npm run build` passes with the existing Vite chunk-size warning.
- `npm run generate:assets -- batch-input/one-piece-four-emperors.csv` generated 4 JSON files and 4 PNG files with the new structure.
- Inspected `exports/香克斯-2.png`; the radar is higher, the portrait is smaller, 虎扑评分 displays as `9.8`, and `霸气 126` extends beyond the outer ring with stronger emphasis.
- `npm run render:one -- /Users/danmou/Desktop/codex/雷达图/exports/香克斯-2.json` rendered `renders/output/香克斯.mp4`.
- `npm run build:episode -- batch-input/one-piece-four-emperors.csv` regenerated deterministic JSON/PNG/manifest files and rendered `renders/output/one-piece-four-emperors.mp4`.
- `npm run render:full -- batch-input/one-piece-four-emperors.manifest.json renders/output/one-piece-four-emperors-full-check.mp4` rendered a full sequence MP4.
- Legacy CSV without `hupuRating` or `min/max` generated JSON/PNG successfully with default `0-100` ranges.
- Legacy Remotion JSON `examples/radar-landscape-demo.json` generated a 1920x1080 PNG successfully.

## 2026-05-23

### Added

- Added project-level Codex Skill `radarforge-episode` for natural-language RadarForge episode generation from a CSV path.
- Added `scripts/build-episode.ts` and `npm run build:episode -- <csv>` for one-command CSV validation, image checks, JSON/PNG generation, manifest creation, and full Remotion MP4 rendering.
- Added deterministic episode outputs: `exports/<characterName>.json`, `exports/<characterName>.png`, `batch-input/<csv-name>.manifest.json`, and `renders/output/<csv-name>.mp4`.

### Changed

- Updated batch asset generation internals so the episode workflow can choose deterministic output paths while existing batch commands keep unique filename behavior.
- Updated README, ROADMAP, and ARCHITECTURE for the Codex Skill and one-command episode workflow.

### Verified

- `npm run build:episode -- batch-input/one-piece-four-emperors.csv` generated JSON and PNG files for 凯多、香克斯、路飞、黑胡子.
- The generated `batch-input/one-piece-four-emperors.manifest.json` lists items in CSV order: 凯多、香克斯、路飞、黑胡子.
- The full video rendered successfully to `renders/output/one-piece-four-emperors.mp4` with a 20 second total duration.
- Rendered midpoint check frames for the full-video composition at frames 75, 225, 375, and 525 into `renders/output/one-piece-four-emperors-check/`, confirming the CSV-order sequence.
- `npm run lint` passes.
- `npm run build` passes with the existing Vite chunk-size warning.

### Added

- Added the `RadarBatchSequenceLandscape` Remotion composition for rendering multiple character JSON files into one continuous 1920x1080 MP4.
- Added reusable `RadarRevealScene.jsx` so the single-person and full-video compositions share the same radar/person visual template.
- Added `scripts/render-full.mjs` and `npm run render:full -- <manifest> [output.mp4]`.
- Added `batch-input/one-piece-four-emperors.manifest.json` as a manifest-order full-video example.

### Changed

- Updated Remotion metadata normalization with batch props and per-item frame calculation.
- Updated render utilities with manifest loading, full-video props building, full-video render execution, and segment summary logging.
- Updated README, ROADMAP, and ARCHITECTURE for the new full-video sequence workflow.

### Verified

- `npm run lint` passes.
- `npm run build` passes with the existing Vite chunk-size warning.
- `npm run render:full -- batch-input/one-piece-four-emperors.manifest.json` rendered one MP4 at `renders/output/full-video.mp4`.
- macOS metadata reports `renders/output/full-video.mp4` as 1920x1080 and about 20.01 seconds.
- Rendered still checks at frames 75, 225, 375, and 525 show 路飞、凯多、香克斯、黑胡子 respectively; the four PNG hashes differ, confirming the sequence is not reusing one person's data.

## 2026-05-21

### Added

- Added a batch asset generation workflow:
  - `npm run generate:assets -- <csv>` reads one CSV row per character and writes matching JSON plus PNG files into `exports/`.
  - `npm run generate:json -- <csv>` writes only RadarForge-compatible JSON files.
  - `npm run generate:png -- <json>` renders one JSON to a 1920x1080 PNG through the Remotion final frame.
- Added `scripts/batch-utils.mjs`, `scripts/generate-assets.mjs`, `scripts/generate-json-from-csv.mjs`, and `scripts/generate-png-from-json.mjs`.
- Added `batch-input/example-characters.csv` with three One Piece sample rows.

### Changed

- Updated README, ROADMAP, and ARCHITECTURE documentation for the CSV fields, output paths, row validation rules, JSON shape, PNG rendering path, and Remotion batch handoff.

### Verified

- `npm run generate:assets -- batch-input/example-characters.csv` generated 3 JSON files and 3 PNG files in `exports/`.
- Checked generated JSON values for `凯多`, `香克斯`, and `黑胡子`; their dimensions and score arrays match the CSV rows and differ from each other.
- Checked generated PNG files with `file`; each is a 1920x1080 PNG.
- `npm run render:batch` processed 8 JSON files, including the 3 new generated JSON files, and produced MP4 files for `黑胡子`, `凯多`, and `香克斯` without failures.
- `npm run lint` passes.
- `npm run build` passes with the existing Vite chunk-size warning.

### Changed

- Removed the overlaid active-person name tag from the right-side portrait/image area while keeping person names editable in the data model and controls.
- Updated PNG/WebM composition and the Remotion portrait reveal so exported images and videos also omit that portrait name tag.

### Verified

- `npm run lint` passes.
- `npm run build` passes with the existing Vite chunk-size warning.
- Browser check at `http://localhost:5173/` confirms the ECharts canvas renders and the right-side safe zone no longer contains a `.safe-zone-name` element or the `对象 A` label.

### Fixed

- Fixed Remotion MP4 renders incorrectly reusing demo/default radar values for RadarForge project JSON. The adapter now prefers person-level `people[].scores`, `people[].values`, or `people[].data` for project/multi-person JSON so Remotion's shallow-merged `defaultProps.values` cannot override exported data.
- Added `validateRadarVideoProps()` checks before Node renders so invalid JSON fails clearly instead of silently generating fallback/demo videos.
- Added render logs for single and batch MP4 scripts showing each JSON path, selected person, dimensions, scores, and output MP4 path.
- Expanded JSON field mapping support for `characters[]`, `person`, `character`, `values`, `scores`, and `data` shapes.

### Verified

- `npm run lint` passes.
- `npm run build` passes with the existing Vite chunk-size warning.
- `npm run render:one -- /Users/danmou/Desktop/codex/雷达图/exports/账号内容能力雷达图-1779357009485.json` logged scores `85, 77, 76, 1, 75, 59` and generated `/Users/danmou/Desktop/codex/雷达图/renders/output/对象-A-6.mp4`.
- `npm run render:one -- /Users/danmou/Desktop/codex/雷达图/exports/账号内容能力雷达图-1779357138649.json` logged scores `70, 90, 55, 40, 83, 85` and generated `/Users/danmou/Desktop/codex/雷达图/renders/output/对象-A-7.mp4`.
- Rendered final-frame PNG checks for those two JSON files produced different SHA-256 hashes, confirming different final radar shapes through the Remotion composition.
- `npm run render:batch` processed 5 JSON files, logged distinct score arrays for each, and generated `/Users/danmou/Desktop/codex/雷达图/renders/output/对象-A-8.mp4` through `/Users/danmou/Desktop/codex/雷达图/renders/output/对象-A-12.mp4`.

### Added

- Added Node-based Remotion MP4 render scripts:
  - `npm run render:one -- <json-file-path>` for one explicit JSON.
  - `npm run render:batch` for serial rendering of all `exports/*.json`.
  - Centralized render configuration in `scripts/render-utils.mjs`.
- Added default Remotion script output directory at `renders/output/`.
- Added explicit `@remotion/bundler` and `@remotion/renderer` dependencies for the Node render API path.

### Changed

- Updated README usage docs with a dedicated MP4 generation workflow, default JSON input directory, default MP4 output directory, and failure checks.
- Updated architecture documentation with the render script flow, output filename rules, and batch failure behavior.
- Updated roadmap status so Remotion MP4 generation now includes CLI, Studio, and Node single/batch scripts while the web editor button remains future work.

### Verified

- `npm run render:one -- /Users/danmou/Desktop/codex/雷达图/exports/radar-landscape-demo.json` generated `/Users/danmou/Desktop/codex/雷达图/renders/output/选手-A.mp4` during verification.
- `npm run render:batch` continued after a temporary invalid JSON failure and still generated `/Users/danmou/Desktop/codex/雷达图/renders/output/选手-A-2.mp4`.
- `npm run render:batch` with two valid JSON files completed successfully and generated `/Users/danmou/Desktop/codex/雷达图/renders/output/选手-A-3.mp4` and `/Users/danmou/Desktop/codex/雷达图/renders/output/选手-A-4.mp4`.

## 2026-05-20

### Added

- Added the first independent Remotion MP4 rendering module:
  - New `RadarRevealLandscape` composition.
  - 1920x1080 landscape output at 30 FPS.
  - 5s, 8s, and 10s duration support through render props.
  - Single-person character image reveal and radar chart expansion timeline.
- Added a Remotion JSON adapter that can read either V1 render props or the existing RadarForge project JSON shape.
- Added SVG radar rendering for Remotion with variable dimensions, `0-100` values, theme colors, grid fade-in, center-out polygon generation, and future multi-person room.
- Added `examples/radar-landscape-demo.json` for direct MP4 render testing.
- Added `remotion:studio` and `remotion:render:demo` npm scripts.
- Added Remotion dependencies: `remotion` and `@remotion/cli`.

### Changed

- Updated documentation to describe the separate Remotion MP4 path while keeping the existing browser WebM export intact.
- Realigned the Remotion 16:9 template to the existing RadarForge web preview visual style:
  - Removed the separate video-poster title block, decorative gradients, framed cards, and MP4 footer.
  - Matched the white/red `example.json` project output to the web canvas layout with a left radar and right portrait area.
  - Updated SVG radar orientation, center, radius, labels, score typography, fill opacity, and per-person color usage.
  - Updated the Remotion portrait reveal to mirror the web safe-zone title/image/name layout.
  - Added shared 1920x1080 landscape template tokens in `src/config/templateTokens.js`.
- Changed the Remotion data adapter so RadarForge project snapshots prefer `themeId`, `portraitTitle`, and `people[].color` over merged demo defaults.

### Verified

- `npm run lint` passes.
- `npm run build` passes with the existing ECharts chunk-size warning.
- Remotion Studio opens at `http://localhost:3000` and lists `RadarRevealLandscape`.
- Demo MP4 render succeeded at `/Users/danmou/Desktop/codex/雷达图/exports/radar-landscape-demo.mp4`.
- macOS metadata reports the demo MP4 as `1920x1080` and `8` seconds.
- Main RadarForge app loads at `http://localhost:5174/` because port 5173 was already in use.
- Browser check confirms the existing app still renders one ECharts canvas.
- Rendered the aligned final hold frame at `/Users/danmou/Desktop/codex/雷达图/exports/radar-template-aligned-final-hold-frame.png`.
- Rendered the aligned MP4 from `target/example.json` at `/Users/danmou/Desktop/codex/雷达图/exports/radar-template-aligned-example.mp4`.

## 2026-05-19

### Added

- Added five current-style visual themes for radar color/background variants:
  - Liquid glass cyan-purple.
  - Aurora dark teal-purple.
  - Dopamine pink-blue.
  - Neo-brutal yellow-green.
  - Calm mint-coral.
- Added per-person portrait image storage so the fixed right-side person area follows the active person and can later grow into structured badge/logo slots.
- Added person image entry animation for replay and WebM export:
  - Starts from opacity `0`, scale `0.94`, and `16px` lower.
  - Eases to opacity `1`, scale `1`, and normal position over about `1100ms`.
  - Resets automatically before video recording so exported WebM files preserve the generation effect.
- Added an active-person name label over the portrait image, fading with the same entry progress.

### Changed

- Reverted the MP4-first video export experiment and restored video export to the previous WebM-only flow.
- Removed ffmpeg.wasm browser transcoding dependencies and the MP4 format badge from the preview toolbar.
- Changed all configured radar theme fill colors and ECharts radar area rendering to use `0.8` internal opacity.
- Updated PNG/WebM canvas composition to draw the portrait image according to the current entry animation progress.
- Changed animation minimum duration from `400ms` to `500ms` so the portrait entry can reliably complete inside the requested `0.5-1.5s` window.
- Removed the large ECharts title from the exported/previewed radar canvas while keeping the title state for file names and project JSON.
- Enlarged and shifted the radar chart leftward to reduce empty space in landscape exports.
- Removed visible portrait-area and image-slot helper borders from the live preview and PNG/video composition path.
- Moved the portrait title band upward and slightly enlarged imported portrait images through matching preview/export zoom.
- Nudged the portrait title closer to the top edge in both the live preview and export composition.

### Verified

- `npm run lint` passes.
- `npm run build` passes with the existing ECharts chunk-size warning.
- WebM-only export verification produced `/Users/danmou/Desktop/codex/雷达图/exports/账号内容能力雷达图-1779205693783.webm`.
- Local app loads at `http://localhost:5175/` because ports 5173 and 5174 were already in use.
- Browser replay check confirms `portraitAnimationProgress` advances during the opening animation and reaches `1.000`.
- WebM export produced `/Users/danmou/Desktop/codex/雷达图/exports/账号内容能力雷达图-1779201895302.webm`.
- PNG export produced `/Users/danmou/Desktop/codex/雷达图/exports/账号内容能力雷达图-1779200041441.png`.
- Browser check confirms the portrait title now starts at the preview canvas top edge.

## 2026-05-18

### Added

- Created RadarForge as a React + Vite + Tailwind CSS app.
- Added animation video export V1:
  - WebM export through browser `MediaRecorder`.
  - 5s, 8s, and 10s duration presets.
  - Automatic radar reset and replay during recording.
  - Current canvas-only recording with about 1 second final hold.
  - Development-only local WebM saving to `exports/`.
- Added Apache ECharts radar preview through `echarts-for-react`.
- Added editable title and subtitle.
- Added editable radar dimensions with add/remove support.
- Added score editing with `0-100` clamping.
- Added five visual themes:
  - White background red radar style.
  - Dark esports style.
  - Clean blue-white style.
  - Fresh green-gold style.
  - Warm orange-purple night style.
- Added center-out radar replay animation controlled by React state.
- Added animation duration control and replay action.
- Added canvas ratios:
  - `9:16`
  - `1:1`
  - `16:9`
- Added right-side portrait/image area.
- Added direct portrait image import via file input.
- Added portrait image remove action.
- Added editable portrait-area title through a left-panel `人物图文` control.
- Added PNG export that includes radar chart, right-side portrait area, border, and title.
- Added development-only local PNG saving to `exports/`.
- Added multi-person comparison mode supporting up to 5 people.
- Added per-person names, colors, and score arrays.
- Added JSON save/import for project state.
- Added development-only local JSON saving to `exports/`.
- Added template library:
  - Esports player.
  - Anime fighter.
  - Basketball player.
  - Football player.
  - Historical figure.
  - Custom template.
- Added project documentation:
  - `AGENTS.md`
  - `ROADMAP.md`
  - `ARCHITECTURE.md`
  - `CHANGELOG.md`

### Changed

- Refactored product options into `src/config/`.
- Refactored PNG composition into `src/utils/exportPreview.js`.
- Changed preview composition so PNG and video export share the same canvas-frame rendering primitive.
- Changed WebM video export timing so radar expansion matches the normal preview animation duration and the remaining video time holds the final frame.
- Changed WebM video export to render fixed 1080p-class outputs by ratio and use a higher bitrate for clearer video.
- Refactored JSON helpers into `src/utils/projectIO.js`.
- Changed dimension data model so dimensions store labels only and people store score arrays.
- Changed ECharts update animation to manual `requestAnimationFrame` interpolation so the polygon edges and fill expand together.
- Changed score labels from high-emphasis badges to lower-priority auxiliary text.
- Changed the portrait area to be larger, top-aligned, and title-protected above imported images.
- Changed the portrait area into separate title and image regions so imported images no longer overlap the text.
- Removed the radar chart subtitle from the editor, preview, templates, and project JSON snapshots.
- Updated README with actual project usage, directories, export location, and dependencies.

### Fixed

- Fixed silent/unclear PNG export by saving files to `exports/` and showing paths in the UI.
- Fixed PNG export so only the current canvas is exported, not the toolbar or full app.
- Fixed 9:16 canvas display/export ratio being distorted by height constraints.
- Fixed radar fill opacity to be visually stronger for content graphics.
- Fixed right-side safe-zone export layering so image, border, and title are drawn in the correct order.
- Fixed imported portrait images visually covering the portrait-area title by moving the title upward and adding a light readability scrim.
- Fixed PNG export composition to draw the separated portrait title band and image slot consistently with the live preview.

### Verified

- `npm run lint` passes.
- `npm run build` passes.
- Local app loads at `http://localhost:5173/`.
- PNG export has produced files in `exports/`.
- JSON save has produced files in `exports/`.
