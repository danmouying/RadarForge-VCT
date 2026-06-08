import { bundle } from '@remotion/bundler'
import { renderMedia, selectComposition } from '@remotion/renderer'
import { existsSync } from 'node:fs'
import { mkdir, readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  normalizeRadarBatchProps,
  summarizeRadarVideoProps,
  validateRadarVideoProps,
} from '../remotion/utils/dataAdapter.js'

export const PROJECT_ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const ROUND_EVENT_METHODS = new Set(['elimination', 'defuse', 'detonation', 'time'])
const ROUND_EVENT_SIDES = new Set(['attack', 'attacking', 'atk', 'defense', 'defensive', 'def'])
const ROUND_EVENT_COLORS = new Set(['red', 'blue'])
const STRUCTURED_PLAYER_DIMENSIONS = ['Rating', '战斗评分', '回合均伤', '首杀能力', 'KAST', '助攻贡献']

export const renderConfig = {
  entryPoint: path.join(PROJECT_ROOT, 'remotion/index.jsx'),
  compositionId: 'RadarRevealLandscape',
  batchSequenceCompositionId: 'RadarBatchSequenceLandscape',
  inputDir: path.join(PROJECT_ROOT, 'exports'),
  outputDir: path.join(PROJECT_ROOT, 'renders/output'),
  defaultFullVideoOutput: path.join(PROJECT_ROOT, 'renders/output/full-video.mp4'),
  codec: 'h264',
  concurrency: 1,
}

let cachedServeUrl = null

export async function createRemotionBundle() {
  if (cachedServeUrl) return cachedServeUrl

  let lastBundleLoggedPercent = -1
  cachedServeUrl = await bundle({
    entryPoint: renderConfig.entryPoint,
    onProgress: (progress) => {
      const percent = normalizeProgressPercent(progress)
      if (percent >= lastBundleLoggedPercent + 25 || percent === 100) {
        lastBundleLoggedPercent = percent
        console.log(`Remotion bundle: ${percent}%`)
      }
    },
  })

  return cachedServeUrl
}

export async function readJsonProps(jsonFilePath) {
  const absolutePath = path.resolve(jsonFilePath)
  const raw = await readFile(absolutePath, 'utf8')
  return normalizePlayerJsonProps(JSON.parse(raw))
}

function normalizePlayerJsonProps(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return input

  const hasRadarArrays =
    Array.isArray(input.dimensions) ||
    Array.isArray(input.scores) ||
    Array.isArray(input.values) ||
    Array.isArray(input.data)

  if (hasRadarArrays) return input

  const hasStructuredScores = STRUCTURED_PLAYER_DIMENSIONS.every((name) =>
    Object.hasOwn(input, `${name}_score`),
  )

  if (!hasStructuredScores) return input

  return {
    ...input,
    dimensions: STRUCTURED_PLAYER_DIMENSIONS.map((name) => ({
      name,
      score: Number(input[`${name}_score`]),
      min: Number(input[`${name}_min`]),
      max: Number(input[`${name}_max`]),
    })),
    scores: STRUCTURED_PLAYER_DIMENSIONS.map((name) => Number(input[`${name}_score`])),
    values: STRUCTURED_PLAYER_DIMENSIONS.map((name) => Number(input[`${name}_score`])),
  }
}

export async function readManifest(manifestFilePath) {
  const absolutePath = path.resolve(manifestFilePath)
  if (!existsSync(absolutePath)) {
    throw new Error(`manifest 文件不存在：${absolutePath}`)
  }

  const manifest = await readJsonProps(absolutePath)
  const hasItems = Array.isArray(manifest.items) && manifest.items.length > 0
  const hasMaps = Array.isArray(manifest.maps) && manifest.maps.length > 0
  const warnings = []

  if (manifest.maps !== undefined && !Array.isArray(manifest.maps)) {
    throw new Error('manifest.maps 必须是数组')
  }

  if (manifest.items !== undefined && !Array.isArray(manifest.items)) {
    throw new Error('manifest.items 必须是数组')
  }

  if (!hasItems && !hasMaps) {
    throw new Error('manifest 必须包含非空 items 数组，或非空 maps 数组')
  }

  return {
    path: absolutePath,
    title: manifest.title || '',
    items: hasItems ? manifest.items.map((item, index) => {
      if (typeof item !== 'string' || !item.trim()) {
        throw new Error(`manifest 第 ${index + 1} 个 items 条目必须是 JSON 文件路径字符串`)
      }

      const itemPath = path.resolve(PROJECT_ROOT, item)
      if (!existsSync(itemPath)) {
        throw new Error(`manifest items[${index + 1}] 文件不存在：${itemPath}`)
      }

      return itemPath
    }) : [],
    maps: hasMaps ? manifest.maps.map((map, mapIndex) => normalizeManifestMap(map, mapIndex, warnings)) : [],
    warnings,
  }
}

export async function listInputJsonFiles(inputDir = renderConfig.inputDir) {
  const entries = await readdir(inputDir, { withFileTypes: true })

  return entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.json'))
    .map((entry) => path.join(inputDir, entry.name))
    .sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'))
}

export async function renderJsonFile(jsonFilePath, options = {}) {
  const absoluteJsonPath = path.resolve(jsonFilePath)
  const inputProps = await readJsonProps(absoluteJsonPath)
  const validation = validateRadarVideoProps(inputProps)

  if (!validation.ok) {
    throw new Error(`JSON 数据验证失败：${validation.errors.join('；')}`)
  }

  const serveUrl = options.serveUrl ?? (await createRemotionBundle())
  let outputLocation = await createOutputPath(inputProps, absoluteJsonPath)
  const summary = summarizeRadarVideoProps(inputProps)

  logRenderInput({
    prefix: options.logPrefix,
    jsonFilePath: absoluteJsonPath,
    outputLocation,
    summary,
  })

  const composition = await selectComposition({
    serveUrl,
    id: renderConfig.compositionId,
    inputProps,
    logLevel: 'warn',
  })

  try {
    await renderMediaToOutput({ serveUrl, composition, inputProps, outputLocation })
  } catch (error) {
    if (!isLikelyOutputPathError(error)) throw error

    outputLocation = await createOutputPath(inputProps, absoluteJsonPath, {
      preferJsonFileName: true,
    })
    console.warn(`  输出文件名不可用，改用 JSON 文件名重试：${outputLocation}`)
    await renderMediaToOutput({ serveUrl, composition, inputProps, outputLocation })
  }

  return {
    input: absoluteJsonPath,
    output: outputLocation,
    summary,
  }
}

export async function loadFullVideoInput(manifestFilePath) {
  if (manifestFilePath) {
    const manifest = await readManifest(manifestFilePath)
    return {
      title: manifest.title,
      jsonFiles: manifest.items,
      maps: manifest.maps,
      sourceLabel: manifest.path,
      warnings: manifest.warnings,
    }
  }

  return {
    title: 'RadarForge 完整雷达视频',
    jsonFiles: await listInputJsonFiles(),
    maps: [],
    sourceLabel: path.join(renderConfig.inputDir, '*.json'),
    warnings: [],
  }
}

export async function buildFullVideoProps({ title, jsonFiles, maps = [] }) {
  if (Array.isArray(maps) && maps.length > 0) {
    const normalizedMaps = []

    for (const [mapIndex, map] of maps.entries()) {
      const items = []

      for (const jsonFile of map.items) {
        const absoluteJsonPath = path.resolve(jsonFile)
        const inputProps = await readJsonProps(absoluteJsonPath)
        const validation = validateRadarVideoProps(inputProps)

        if (!validation.ok) {
          throw new Error(`${absoluteJsonPath} 数据验证失败：${validation.errors.join('；')}`)
        }

        items.push({
          ...inputProps,
          __jsonPath: absoluteJsonPath,
        })
      }

      normalizedMaps.push({
        ...map,
        mapIndex,
        items,
      })
    }

    return {
      title: title || 'RadarForge 完整雷达视频',
      maps: normalizedMaps,
    }
  }

  const items = []

  for (const jsonFile of jsonFiles) {
    const absoluteJsonPath = path.resolve(jsonFile)
    const inputProps = await readJsonProps(absoluteJsonPath)
    const validation = validateRadarVideoProps(inputProps)

    if (!validation.ok) {
      throw new Error(`${absoluteJsonPath} 数据验证失败：${validation.errors.join('；')}`)
    }

    items.push({
      ...inputProps,
      __jsonPath: absoluteJsonPath,
    })
  }

  return {
    title: title || 'RadarForge 完整雷达视频',
    items,
  }
}

export async function renderFullVideo({ inputProps, outputLocation, serveUrl: providedServeUrl }) {
  await mkdir(path.dirname(outputLocation), { recursive: true })

  const serveUrl = providedServeUrl ?? (await createRemotionBundle())
  const composition = await selectComposition({
    serveUrl,
    id: renderConfig.batchSequenceCompositionId,
    inputProps,
    logLevel: 'warn',
  })

  await renderMediaToOutput({
    serveUrl,
    composition,
    inputProps,
    outputLocation,
    overwrite: true,
  })

  return {
    output: outputLocation,
    composition,
    summary: summarizeRadarFullVideoProps(inputProps),
  }
}

export function summarizeRadarFullVideoProps(inputProps) {
  const normalized = normalizeRadarBatchProps(inputProps)

  return {
    count: normalized.items.length,
    sequenceCount: normalized.sequenceItems.length,
    mapCount: Array.isArray(inputProps.maps) ? inputProps.maps.length : 0,
    totalSeconds: normalized.totalDurationInFrames / 30,
    totalFrames: normalized.totalDurationInFrames,
    sequenceItems: normalized.sequenceItems.map((item, index) => ({
      index: index + 1,
      type: item.type,
      label: item.label || '',
      summaryTitle: item.summaryTitle || '',
      mapName: item.mapName || '',
      characterName: item.characterName || '',
      duration: item.duration,
      frames: item.durationInFrames,
      rankingScore: item.rankingScore,
      mapIndex: item.mapIndex,
    })),
    items: normalized.items.map((item, index) => ({
      index: index + 1,
      characterName: item.characterName,
      duration: item.duration,
      frames: item.durationInFrames,
      rankingScore: item.rankingScore,
      jsonPath: findInputJsonPath(inputProps, item),
    })),
  }
}

function normalizeManifestMap(map, mapIndex, warnings) {
  if (!map || typeof map !== 'object') {
    throw new Error(`manifest 第 ${mapIndex + 1} 个 maps 条目必须是对象`)
  }

  const transitionSource = map.transition || map.mapScore || map.scoreTransition
  const summarySource = map.summary && typeof map.summary === 'object' ? map.summary : undefined
  const hasItems = Array.isArray(map.items) && map.items.length > 0

  if (!transitionSource && !summarySource && !hasItems) {
    throw new Error(`manifest 第 ${mapIndex + 1} 个 maps 条目必须至少包含 transition、summary 或 items 之一`)
  }

  if (map.items !== undefined && !Array.isArray(map.items)) {
    throw new Error(`manifest maps[${mapIndex + 1}].items 必须是数组`)
  }

  if (!hasItems) {
    warnings.push(`manifest maps[${mapIndex + 1}].items 为空或缺失，将跳过该地图的选手雷达图片段`)
  }

  if (transitionSource) {
    validateManifestTransition(transitionSource, mapIndex)
  }

  if (summarySource) {
    validateManifestSummary(summarySource, transitionSource, mapIndex)
  }

  return {
    ...map,
    transition: transitionSource,
    summary: summarySource,
    items: (Array.isArray(map.items) ? map.items : []).map((item, itemIndex) => {
      if (typeof item !== 'string' || !item.trim()) {
        throw new Error(`manifest maps[${mapIndex + 1}].items[${itemIndex + 1}] 必须是 JSON 文件路径字符串`)
      }

      const itemPath = path.resolve(PROJECT_ROOT, item)
      if (!existsSync(itemPath)) {
        throw new Error(`manifest maps[${mapIndex + 1}].items[${itemIndex + 1}] 文件不存在：${itemPath}`)
      }

      return itemPath
    }),
  }
}

function validateManifestTransition(transition, mapIndex) {
  if (!transition || typeof transition !== 'object') {
    throw new Error(`manifest maps[${mapIndex + 1}].transition 必须是对象`)
  }

  const prefix = `manifest maps[${mapIndex + 1}].transition`
  requireNonEmptyString(transition.leftTeamName, `${prefix}.leftTeamName`)
  requireNonEmptyString(transition.rightTeamName, `${prefix}.rightTeamName`)
  requireFiniteScore(transition.leftScore, `${prefix}.leftScore`)
  requireFiniteScore(transition.rightScore, `${prefix}.rightScore`)
  requirePositiveDuration(transition.duration, `${prefix}.duration`)
}

function validateManifestSummary(summary, transition, mapIndex) {
  if (!summary || typeof summary !== 'object') {
    throw new Error(`manifest maps[${mapIndex + 1}].summary 必须是对象`)
  }

  const prefix = `manifest maps[${mapIndex + 1}].summary`
  const leftTeamName = firstNonEmptyString([summary.leftTeamName, transition?.leftTeamName])
  const rightTeamName = firstNonEmptyString([summary.rightTeamName, transition?.rightTeamName])

  if (summary.type === 'series') {
    requireFiniteScore(summary.leftScore ?? summary.leftMapScore, `${prefix}.leftScore`)
    requireFiniteScore(summary.rightScore ?? summary.rightMapScore, `${prefix}.rightScore`)
    validateSeriesMapResults(summary.mapResults, prefix)
  } else {
    requireNonEmptyString(summary.mapName, `${prefix}.mapName`)
    requireFiniteScore(summary.leftMapScore ?? summary.leftScore, `${prefix}.leftMapScore`)
    requireFiniteScore(summary.rightMapScore ?? summary.rightScore, `${prefix}.rightMapScore`)
  }
  requirePositiveDuration(summary.duration, `${prefix}.duration`)

  if (summary.leftStartingSide !== undefined && !ROUND_EVENT_SIDES.has(String(summary.leftStartingSide || '').toLowerCase())) {
    throw new Error(`${prefix}.leftStartingSide 必须是 attack/attacking/ATK 或 defense/defensive/DEF`)
  }

  if (summary.rightStartingSide !== undefined && !ROUND_EVENT_SIDES.has(String(summary.rightStartingSide || '').toLowerCase())) {
    throw new Error(`${prefix}.rightStartingSide 必须是 attack/attacking/ATK 或 defense/defensive/DEF`)
  }

  if (summary.type === 'series') {
    if (summary.roundEvents !== undefined) {
      throw new Error(`${prefix}.roundEvents 不适用于 type: "series"，请使用 mapResults`)
    }
    return
  }

  if (Array.isArray(summary.roundEvents)) {
    summary.roundEvents.forEach((event, eventIndex) => {
      const eventPrefix = `${prefix}.roundEvents[${eventIndex + 1}]`
      if (!event || typeof event !== 'object') {
        throw new Error(`${eventPrefix} 必须是对象`)
      }

      if (event.winner !== leftTeamName && event.winner !== rightTeamName) {
        throw new Error(`${eventPrefix}.winner 必须等于 ${leftTeamName} 或 ${rightTeamName}`)
      }

      if (!ROUND_EVENT_METHODS.has(String(event.method || '').toLowerCase())) {
        throw new Error(`${eventPrefix}.method 必须是 elimination、defuse、detonation 或 time`)
      }

      if (event.winnerSide !== undefined && !ROUND_EVENT_SIDES.has(String(event.winnerSide || '').toLowerCase())) {
        throw new Error(`${eventPrefix}.winnerSide 必须是 attack/attacking/ATK 或 defense/defensive/DEF`)
      }

      if (event.winnerColor !== undefined && !ROUND_EVENT_COLORS.has(String(event.winnerColor || '').toLowerCase())) {
        throw new Error(`${eventPrefix}.winnerColor 必须是 red 或 blue`)
      }
    })
  } else if (summary.roundEvents !== undefined) {
    throw new Error(`${prefix}.roundEvents 必须是数组`)
  }
}

function validateSeriesMapResults(mapResults, prefix) {
  if (!Array.isArray(mapResults)) {
    throw new Error(`${prefix}.mapResults 必须是数组`)
  }
  if (mapResults.length < 1 || mapResults.length > 5) {
    throw new Error(`${prefix}.mapResults 必须包含 1 到 5 张地图`)
  }

  mapResults.forEach((result, resultIndex) => {
    const resultPrefix = `${prefix}.mapResults[${resultIndex + 1}]`
    if (!result || typeof result !== 'object') {
      throw new Error(`${resultPrefix} 必须是对象`)
    }
    requireNonEmptyString(result.mapName, `${resultPrefix}.mapName`)
    requireFiniteScore(result.leftMapScore ?? result.leftScore, `${resultPrefix}.leftMapScore`)
    requireFiniteScore(result.rightMapScore ?? result.rightScore, `${resultPrefix}.rightMapScore`)
  })
}

function requireNonEmptyString(value, label) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${label} 必须是非空字符串`)
  }
}

function requireFiniteScore(value, label) {
  const number = Number(value)
  if (!Number.isFinite(number)) {
    throw new Error(`${label} 必须是有效比分数字`)
  }
}

function requirePositiveDuration(value, label) {
  const number = Number(value)
  if (!Number.isFinite(number) || number <= 0) {
    throw new Error(`${label} 必须是大于 0 的秒数`)
  }
}

function findInputJsonPath(inputProps, normalizedItem) {
  if (Array.isArray(inputProps.items)) {
    return inputProps.items.find((item) => item?.characterName === normalizedItem.characterName)?.__jsonPath || ''
  }

  if (Array.isArray(inputProps.maps)) {
    const map = inputProps.maps[normalizedItem.mapIndex]
    return map?.items?.find((item) => {
      const summary = summarizeRadarVideoProps(item)
      return summary.characterName === normalizedItem.characterName
    })?.__jsonPath || ''
  }

  return ''
}

export async function createOutputPath(inputProps, jsonFilePath, options = {}) {
  await mkdir(renderConfig.outputDir, { recursive: true })

  const fallbackBaseName = path.parse(jsonFilePath).name
  const candidateName = options.preferJsonFileName ? fallbackBaseName : pickOutputBaseName(inputProps)
  const safeBaseName = sanitizeFileBaseName(candidateName) || sanitizeFileBaseName(fallbackBaseName) || 'radar-video'

  return uniqueOutputPath(path.join(renderConfig.outputDir, `${safeBaseName}.mp4`))
}

export function pickOutputBaseName(inputProps = {}) {
  const person = Array.isArray(inputProps.people) ? inputProps.people[0] : null
  const character = Array.isArray(inputProps.characters) ? inputProps.characters[0] : null

  return firstNonEmptyString([
    inputProps.characterName,
    inputProps.name,
    inputProps.playerName,
    inputProps.person?.name,
    person?.name,
    character?.name,
    character?.playerName,
    inputProps.character?.name,
    inputProps.title,
  ])
}

export function sanitizeFileBaseName(value) {
  if (!value) return ''

  const safe = String(value)
    .normalize('NFKC')
    .replace(/[\\/:"*?<>|\u0000-\u001f]/g, '')
    .replace(/[^\p{L}\p{N}_-]+/gu, '-')
    .replace(/-+/g, '-')
    .replace(/^[-_.]+|[-_.]+$/g, '')
    .slice(0, 80)

  return safe || ''
}

function firstNonEmptyString(values) {
  return values.find((value) => typeof value === 'string' && value.trim())?.trim() ?? ''
}

function uniqueOutputPath(initialPath) {
  if (!existsSync(initialPath)) return initialPath

  const directory = path.dirname(initialPath)
  const extension = path.extname(initialPath)
  const baseName = path.basename(initialPath, extension)

  let index = 2
  while (true) {
    const nextPath = path.join(directory, `${baseName}-${index}${extension}`)
    if (!existsSync(nextPath)) return nextPath
    index += 1
  }
}

async function renderMediaToOutput({ serveUrl, composition, inputProps, outputLocation, overwrite = false }) {
  let lastLoggedPercent = -1

  await renderMedia({
    serveUrl,
    composition,
    inputProps,
    codec: renderConfig.codec,
    outputLocation,
    overwrite,
    concurrency: renderConfig.concurrency,
    logLevel: 'warn',
    onProgress: ({ progress }) => {
      const percent = Math.floor(progress * 100)
      if (percent >= lastLoggedPercent + 25 || percent === 100) {
        lastLoggedPercent = percent
        console.log(`  渲染进度 ${percent}%`)
      }
    },
  })
}

function logRenderInput({ prefix, jsonFilePath, outputLocation, summary }) {
  const label = prefix ? `${prefix} ` : ''

  console.log(`${label}渲染文件：${jsonFilePath}`)
  console.log(`人物：${summary.characterName}`)
  console.log(`维度：${summary.dimensions.join(', ')}`)
  console.log(`分数：${summary.values.join(', ')}`)
  console.log(`输出：${outputLocation}`)
}

function isLikelyOutputPathError(error) {
  const message = `${error?.code || ''} ${error?.message || ''}`.toLowerCase()
  return ['enoent', 'einval', 'eacces', 'filename', 'output', 'path'].some((token) => message.includes(token))
}

function normalizeProgressPercent(progress) {
  const number = Number(progress)
  if (!Number.isFinite(number)) return 0
  const percent = number <= 1 ? number * 100 : number
  return Math.min(100, Math.max(0, Math.round(percent)))
}
