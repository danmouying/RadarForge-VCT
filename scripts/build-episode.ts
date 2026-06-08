import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  EXPORTS_DIR,
  PROJECT_ROOT,
  buildAssetFromCsvRecord,
  fixedCsvFields,
  formatRelativePath,
  loadCsvRows,
  writeProjectJson,
} from './batch-utils.mjs'
import { generatePngFromJson } from './generate-png-from-json.mjs'
import {
  buildFullVideoProps,
  createRemotionBundle,
  renderConfig,
  renderFullVideo,
  sanitizeFileBaseName,
  summarizeRadarFullVideoProps,
} from './render-utils.mjs'

const inputFilePath = process.argv[2]

export async function buildEpisode(csvFilePath) {
  const absoluteCsvPath = path.resolve(csvFilePath)

  if (!existsSync(absoluteCsvPath)) {
    throw new Error(`CSV 文件不存在：${absoluteCsvPath}`)
  }

  const { headers, records, inputFilePath: loadedCsvPath } = await loadCsvRows(absoluteCsvPath)
  const csvBaseName = path.basename(loadedCsvPath, path.extname(loadedCsvPath))
  const manifestPath = path.join(path.dirname(loadedCsvPath), `${csvBaseName}.manifest.json`)
  const videoPath = path.join(renderConfig.outputDir, `${sanitizeFileBaseName(csvBaseName) || 'episode'}.mp4`)

  console.log(`当前 CSV 路径：${loadedCsvPath}`)
  console.log(`读取了 ${records.length} 个人物`)

  assertRequiredHeaders(headers)
  assertCharacterImages(records, loadedCsvPath)

  await mkdir(EXPORTS_DIR, { recursive: true })
  await mkdir(renderConfig.outputDir, { recursive: true })

  const serveUrl = await createRemotionBundle()
  const assets = []

  for (const [index, record] of records.entries()) {
    const characterName = record.data.characterName?.trim() || `row-${record.rowNumber}`
    const imageStatus = resolveCharacterImage(record.data.characterImage, loadedCsvPath)

    console.log('')
    console.log(`[${index + 1}/${records.length}] characterName：${characterName}`)
    console.log(`characterImage：${record.data.characterImage}`)
    console.log(`characterImage 是否存在：${imageStatus.exists ? '是' : '否'}`)

    const asset = await buildAssetFromCsvRecord({
      record,
      headers,
      inputFilePath: loadedCsvPath,
      outputDir: EXPORTS_DIR,
      uniqueOutput: false,
    })

    if (!asset.ok) {
      throw new Error(`第 ${asset.rowNumber} 行 ${asset.name} 数据校验失败：${asset.errors.join('；')}`)
    }

    await writeProjectJson(asset)
    console.log(`JSON 路径：${formatRelativePath(asset.jsonPath)}`)

    try {
      await generatePngFromJson(asset.jsonPath, {
        serveUrl,
        outputPath: asset.pngPath,
      })
      asset.pngOk = true
      console.log(`PNG 路径：${formatRelativePath(asset.pngPath)}`)
    } catch (error) {
      throw new Error(`第 ${asset.rowNumber} 行 ${asset.name} PNG 生成失败：${error?.message || String(error)}`)
    }

    assets.push(asset)
  }

  const manifest = {
    title: pickManifestTitle(records, csvBaseName),
    sourceCsv: formatRelativePath(loadedCsvPath),
    generatedAt: new Date().toISOString(),
    items: assets.map((asset) => formatRelativePath(asset.jsonPath)),
  }

  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
  console.log('')
  console.log(`manifest 路径：${formatRelativePath(manifestPath)}`)

  const fullVideoProps = await buildFullVideoProps({
    title: manifest.title,
    jsonFiles: assets.map((asset) => asset.jsonPath),
  })
  const summary = summarizeRadarFullVideoProps(fullVideoProps)

  console.log('完整视频顺序：')
  for (const item of summary.items) {
    console.log(`${item.index}. ${item.characterName} - ${formatSeconds(item.duration)}s - ${item.frames} frames`)
  }
  console.log(`总时长：${formatSeconds(summary.totalSeconds)}s`)
  console.log(`最终 MP4 输出路径：${formatRelativePath(videoPath)}`)

  await renderFullVideo({
    inputProps: fullVideoProps,
    outputLocation: videoPath,
    serveUrl,
  })

  return {
    manifestPath,
    videoPath,
    assets,
    totalSeconds: summary.totalSeconds,
  }
}

function assertRequiredHeaders(headers) {
  const missingFields = fixedCsvFields
    .filter(
      (field) =>
        ![
          'hupuRating',
          'teamName',
          'matchLeftTeam',
          'matchLeftScore',
          'matchRightScore',
          'matchRightTeam',
          'kda',
          'heroIcons',
          'heroIconLayout',
          'hupuRatingTemplate',
          'hupuRatingImage',
        ].includes(field),
    )
    .filter((field) => !headers.includes(field))
  if (missingFields.length > 0) {
    throw new Error(`CSV 字段缺失：${missingFields.join(', ')}`)
  }
}

function assertCharacterImages(records, csvFilePath) {
  const missingImages = []

  for (const record of records) {
    const characterName = record.data.characterName?.trim() || `第 ${record.rowNumber} 行`
    const imageInput = record.data.characterImage?.trim()
    const resolved = resolveCharacterImage(imageInput, csvFilePath)

    console.log(`人物：${characterName}`)
    console.log(`图片路径：${imageInput || '空'}`)
    console.log(`图片是否存在：${resolved.exists ? '是' : '否'}`)

    if (!imageInput) {
      missingImages.push(`第 ${record.rowNumber} 行 ${characterName}：characterImage 不能为空`)
    } else if (!resolved.exists) {
      missingImages.push(`第 ${record.rowNumber} 行 ${characterName}：找不到图片 ${imageInput}`)
    }
  }

  if (missingImages.length > 0) {
    throw new Error(`图片检查失败：\n${missingImages.join('\n')}`)
  }
}

function resolveCharacterImage(imageInput, csvFilePath) {
  const imagePath = imageInput?.trim()
  if (!imagePath) return { exists: false, path: '' }
  if (imagePath.startsWith('data:image/') || /^https?:\/\//i.test(imagePath)) {
    return { exists: true, path: imagePath }
  }

  const candidates = [
    path.resolve(path.dirname(csvFilePath), imagePath),
    path.resolve(PROJECT_ROOT, imagePath),
  ]
  const found = candidates.find((candidate) => existsSync(candidate))

  return {
    exists: Boolean(found),
    path: found || candidates[0],
  }
}

function pickManifestTitle(records, csvBaseName) {
  const title = records.find((record) => record.data.title?.trim())?.data.title?.trim()
  if (title) return title

  const series = records.find((record) => record.data.series?.trim())?.data.series?.trim()
  if (series) return `${series}完整雷达视频`

  return csvBaseName
}

function formatSeconds(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return '0'
  return Number.isInteger(number) ? String(number) : number.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
}

async function main() {
  if (!inputFilePath) {
    console.error('请提供 CSV 文件路径，例如：')
    console.error('npm run build:episode -- batch-input/one-piece-four-emperors.csv')
    process.exit(1)
  }

  try {
    const startedAt = Date.now()
    const episode = await buildEpisode(inputFilePath)
    const elapsedSeconds = (Date.now() - startedAt) / 1000

    console.log('')
    console.log('RadarForge 一期视频生成完成')
    console.log(`manifest 路径：${formatRelativePath(episode.manifestPath)}`)
    console.log(`最终 MP4 输出路径：${formatRelativePath(episode.videoPath)}`)
    console.log(`总时长：${formatSeconds(episode.totalSeconds)}s`)
    console.log(`耗时：${formatSeconds(elapsedSeconds)}s`)
    console.log('是否成功：是')
  } catch (error) {
    console.error('')
    console.error('RadarForge 一期视频生成失败')
    console.error(error?.stack || error?.message || String(error))
    console.error('是否成功：否')
    process.exit(1)
  }
}

if (fileURLToPath(import.meta.url) === path.resolve(process.argv[1] || '')) {
  await main()
}
