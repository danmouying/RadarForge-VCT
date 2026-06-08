---
name: radarforge-episode
description: Use this skill when the user asks to generate one complete RadarForge episode/video from a CSV, batch-generate radar charts, use CSV data to make a full video, or says phrases like "生成一期视频", "批量生成雷达图", "用 CSV 生成完整视频", "RadarForge 出片". The required input is a CSV file path; character images may be JPG, JPEG, or PNG files under image/. Codex should run the one-command episode workflow automatically instead of asking the user to type terminal commands.
---

# RadarForge Episode

## Trigger

Use this skill for RadarForge requests such as:

- 生成一期视频
- 批量生成雷达图
- 用 CSV 生成完整视频
- RadarForge 出片
- 使用 RadarForge 生成一期视频，CSV 是 `batch-input/xxx.csv`

## Required Input

The user must provide one CSV path, usually under `batch-input/`, for example:

```bash
batch-input/one-piece-four-emperors.csv
```

If the CSV path is missing, ask for it briefly. Do not ask the user to run terminal commands.

Character image files referenced by `characterImage` may be `.jpg`, `.jpeg`, or `.png`. The common setup is to place them under `image/` and reference paths like:

```text
image/player-a.jpg
image/player-b.jpeg
image/player-c.png
```

## Workflow

From the project root, run the one-command workflow yourself:

```bash
npm run build:episode -- batch-input/xxx.csv
```

The script is responsible for:

1. Checking that the CSV exists.
2. Checking that required CSV fields exist: `series`, `title`, `subtitle`, `characterName`, `characterImage`, `theme`, `duration`.
3. Treating all later numeric columns as radar dimensions.
4. Checking that each `characterImage` path exists, including JPG/JPEG/PNG files under `image/`.
5. Generating `exports/<characterName>.json`.
6. Generating `exports/<characterName>.png`.
7. Generating `batch-input/<csv-name>.manifest.json` in CSV row order.
8. Rendering the `RadarBatchSequenceLandscape` Remotion composition.
9. Writing the complete MP4 to `renders/output/<csv-name>.mp4`.

## Error Handling

If the command fails, report the concrete reason from the script output:

- CSV missing or unreadable.
- Required CSV field missing.
- Character image missing, including wrong extension such as CSV pointing to `.png` while the real file is `.jpg`.
- Row validation failed, such as non-numeric dimension score or unsupported duration.
- JSON generation failed.
- PNG generation failed.
- Manifest generation failed.
- Remotion render failed.

Do not hide partial output. Tell the user which generated files exist and which step failed.

## Final Report

After a successful run, report:

- CSV path used.
- JSON files generated in `exports/`.
- PNG files generated in `exports/`.
- Manifest path in `batch-input/`.
- Final MP4 path in `renders/output/`.
- Whether the render succeeded.

Keep the report short and practical.
