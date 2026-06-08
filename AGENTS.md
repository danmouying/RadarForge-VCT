# AGENTS.md

## Project Goal

RadarForge is a local-first React web app for creating polished radar-chart visuals for self-media and short-form content production. The app should stay practical for creators: fast editing, clear preview, reliable PNG/JSON export, and an architecture that can later support video export and richer template libraries.

## Tech Stack

- React 19 with Vite.
- Tailwind CSS v4 through `@tailwindcss/vite`.
- Apache ECharts via `echarts` and `echarts-for-react`.
- `lucide-react` for UI icons.
- Vite development middleware in `vite.config.js` for local PNG/JSON saves into `exports/`.

## Before Starting Any Development

For every new development task, read these files before changing code:

1. `ROADMAP.md` for current product priorities and feature status.
2. `ARCHITECTURE.md` for state shape, component boundaries, ECharts, and export flow.
3. `CHANGELOG.md` for recent implementation history and known context.

Also read `AGENTS.md` when joining the project, after context compaction, or when working rules may have changed. Read `README.md` when startup, usage, dependencies, or export paths matter.

If a user's new request conflicts with `ROADMAP.md`, explain the conflict before implementation and recommend a practical implementation plan.

When the user asks to generate a full RadarForge episode/video from a CSV, use the project-level Skill at `.agents/skills/radarforge-episode/SKILL.md` and run the one-command workflow yourself instead of asking the user to type terminal commands.

## Code Conventions

- Prefer small, focused components in `src/components/`.
- Keep product configuration in `src/config/` rather than hardcoding options in JSX.
- Keep reusable non-UI logic in `src/utils/`.
- Preserve the current data model:
  - `dimensions`: dimension labels only.
  - `people`: person name, color, and score arrays.
  - `previewPeople`: animated display copy of `people`.
  - `portraitTitle`: legacy title metadata for old JSON compatibility; do not reintroduce it as a visible right-side title unless explicitly requested.
  - `portraitImage`: Data URL for the right-side portrait area.
- Do not put unrelated refactors into feature work.
- When the user asks to revert only the latest or specified change, manually undo only those touched code/documentation hunks and preserve unrelated prior work.
- Keep UI controls compact and creator-tool oriented. Avoid marketing page patterns.
- When changing chart behavior, update `src/utils/chartOptions.js`.
- When changing PNG/JSON export behavior, update `src/utils/exportPreview.js`, `src/utils/projectIO.js`, or `vite.config.js` as appropriate.
- When changing the top match-score title, keep the web preview, web PNG export, project JSON, CSV generation, Remotion output, and README/ARCHITECTURE documentation aligned.
- The approved top title format is left team + left score + centered colon + right score + right team, for example `EDG 2:1 JDG`. Each of the four data fields must remain manually editable, the colon must stay centered on the canvas, the score numbers must stay symmetric around it, and team names should sit to the left/right rather than forming one centered text string. The approved top title bar uses Burgundy red `#800020` with Hanyu white `#F9F7EA` text. Legacy `teamName` compatibility should remain readable.
- The 16:9 Remotion final frame is the visual baseline for the web preview and PNG export. Keep the radar data boundary as a clean line without circular point markers so the filled radar interior remains the visual focus.
- The approved upper-left battle-power badge is a compact white card in the radar area's empty upper-left space. It renders `战力表`, a manually selectable rank such as `#1`/`#2`/`#3`, and manually editable battle-power text. Keep web preview, web PNG export, project JSON, CSV generation, Remotion output, and README/ARCHITECTURE documentation aligned when changing it.
- When changing the right-side portrait/KDA/hero icon/rating layout, keep web preview, web PNG export, Remotion output, and CSV/JSON documentation aligned unless the user explicitly asks to stage one surface first.
- Do not render or add controls for a separate main title or right-side portrait title in the finished canvas. Legacy `title` and `portraitTitle` can remain readable/writable metadata for filenames and JSON compatibility, but the visible canvas should rely on the top match-score bar plus the editable active person name above KDA.
- The hero icon area supports the default 2x3 slot grid and the `single` centered-image template. Each web grid slot should remain directly image-importable, single compact `heroIcons` input should place the image in the second row's center slot for the grid template, and the `single` template should render the first available hero icon centered at the synced web/Remotion size.
- Current approved 16:9 right-side layout:
  - The portrait/KDA/hero-icon stack must stay below the top match-score bar so a large portrait cannot cover the title.
  - The top match-score bar should stay full-width and taller than the early compact version, with enlarged team names and score text while preserving the centered colon and symmetric score positions.
  - The main portrait image slot should stay enlarged in both width and height, extending upward and downward while preserving a small visible gap before the identity stack.
  - The active person name must be manually editable through the person name field and render above the KDA value in the existing KDA row across web preview, PNG export, and Remotion output.
  - The active person name, KDA, and 虎扑/JRs rating text should be visually larger than the left-side radar axis labels.
  - The person name, KDA value, single centered hero icon, and JRs rating card should keep their internal spacing when the whole group moves.
  - The default 2x3 hero icon grid should use compact square slots and sit below the name/KDA row with enough breathing room before the classic 虎扑评分/JRs rating block; keep this aligned across web preview, PNG export, and Remotion output.
  - Moving the default 2x3 hero icon grid must not move or retune the `single` centered-image template; the two layouts have separate offsets.
  - In the default 2x3 hero icon grid mode, the portrait image and active person name/KDA row can be nudged separately from the hero grid; changing that upper portrait/KDA position must not move the grid icons, rating block, or `single` centered-image template.
  - The classic 虎扑评分 block should use compact typography with a tight label-to-score gap.
  - In the JRs + `single` hero icon template, the JRs rating card should sit 20px lower than the prior 15px-bottom baseline, the rating image slot should preserve the `1178x327` reference aspect ratio and show the full imported screenshot, the single hero icon should keep the prior lower baseline, and the KDA/name row should sit 24px higher than that icon-derived baseline so the active person name remains visible below the portrait image. The identity row must be tall enough for the enlarged person name and KDA text so neither line is clipped.
  - The JRs rating card should remain wide, transparent outside the inner white image slot, with `虎扑JRs评分` and the score on one same-size heading row and short black divider lines on both sides.
  - The JRs rating card can be shifted right as a whole without changing its width; do not shrink the card when only horizontal position is requested.
  - The JRs heading text and score should stay visually centered in the heading row after divider-line tweaks.
  - The JRs left black divider line should remain visually shorter than the right divider line; shorten the divider itself, not the whole rating card or heading row.
  - The JRs inner white image slot can be nudged independently from the heading row, and the current approved offset places it slightly farther right than the heading.
  - Keep the JRs card image slot directly importable, render imported JRs screenshots with `contain` rather than cropping, and keep the web preview, PNG export, Remotion output, and generated PNG/MP4 token sizes visually aligned.

## Testing And Verification

Run these after functional changes:

```bash
npm run lint
npm run build
```

For UI or export changes, also run the app and verify in browser:

```bash
npm run dev -- --host 0.0.0.0
```

Minimum manual checks for major changes:

- App loads at `http://localhost:5173/`.
- ECharts radar canvas renders.
- Editing match-score fields, person name, dimensions, and scores updates preview.
- Editing battle-power rank and value updates the upper-left badge and PNG export.
- Canvas ratios `9:16`, `1:1`, and `16:9` display correctly.
- Animation replay works and respects duration.
- PNG export creates a file in `exports/`.
- JSON save creates a file in `exports/`.
- Template apply does not break dimensions, people, or chart rendering.
- If portrait import is touched, verify the right-side image area still accepts image files and PNG export includes the image.

## Documentation Rule

After every completed development task:

- Update `ROADMAP.md` if a roadmap item was completed, removed, reprioritized, or newly discovered.
- Update `ARCHITECTURE.md` if project structure, component responsibilities, state management, ECharts behavior, JSON handling, PNG export, local export middleware, or other core flows changed.
- Always append an entry to `CHANGELOG.md`, no matter how small the task was.

If the change affects workflow instructions or testing expectations, update `AGENTS.md` too.

## Result Reporting Rule

Every development result report to the user should briefly state:

- What was completed in this task.
- Which documentation files were updated.
- The single most recommended next step for the project.
