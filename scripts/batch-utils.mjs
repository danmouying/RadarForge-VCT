import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { peoplePalette } from '../src/config/peoplePalette.js'
import { themes } from '../src/config/themes.js'
import { createProjectSnapshot } from '../src/utils/projectIO.js'
import {
  normalizeHeroIconLayout,
  normalizeHeroIcons,
  normalizeHupuRating,
  normalizeHupuRatingTemplate,
} from '../src/utils/portraitMeta.js'
import { normalizeMatchInfo, formatMatchTitle } from '../src/utils/matchInfo.js'
import { sanitizeFileBaseName } from './render-utils.mjs'

export const PROJECT_ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
export const EXPORTS_DIR = path.join(PROJECT_ROOT, 'exports')

export const fixedCsvFields = [
  'series',
  'title',
  'subtitle',
  'characterName',
  'characterImage',
  'theme',
  'duration',
  'hupuRating',
  'teamName',
  'matchLeftTeam',
  'matchLeftScore',
  'matchRightScore',
  'matchRightTeam',
  'battleRank',
  'battlePower',
  'kda',
  'heroIcons',
  'heroIconLayout',
  'hupuRatingTemplate',
  'hupuRatingImage',
]

const fixedCsvFieldSet = new Set(fixedCsvFields)
const optionalCsvFields = new Set([
  'hupuRating',
  'teamName',
  'matchLeftTeam',
  'matchLeftScore',
  'matchRightScore',
  'matchRightTeam',
  'battleRank',
  'battlePower',
  'kda',
  'heroIcons',
  'heroIconLayout',
  'hupuRatingTemplate',
  'hupuRatingImage',
])
const requiredCsvFields = fixedCsvFields.filter((field) => !optionalCsvFields.has(field))
const allowedDurations = new Set([5, 8, 10])

export async function loadCsvRows(inputFilePath) {
  const absolutePath = path.resolve(inputFilePath)
  const raw = await readFile(absolutePath, 'utf8')
  const rows = parseCsv(raw.trimStart().replace(/^\uFEFF/, ''))

  if (rows.length < 2) {
    throw new Error('CSV 至少需要 1 行表头和 1 行人物数据')
  }

  const headers = rows[0].map((header) => header.trim())
  const missingFields = requiredCsvFields.filter((field) => !headers.includes(field))

  if (missingFields.length > 0) {
    throw new Error(`CSV 缺少固定字段：${missingFields.join(', ')}`)
  }

  const records = rows.slice(1).map((cells, index) => ({
    rowNumber: index + 2,
    cells,
    data: Object.fromEntries(headers.map((header, cellIndex) => [header, cells[cellIndex]?.trim() ?? ''])),
  }))

  return {
    inputFilePath: absolutePath,
    headers,
    records: records.filter((record) => hasAnyValue(record.cells)),
  }
}

export async function buildAssetFromCsvRecord({
  record,
  headers,
  inputFilePath,
  outputDir = EXPORTS_DIR,
  uniqueOutput = true,
}) {
  const validation = validateCsvRecord(record, headers)

  if (!validation.ok) {
    return {
      ok: false,
      rowNumber: record.rowNumber,
      name: record.data.characterName || `row-${record.rowNumber}`,
      errors: validation.errors,
    }
  }

  const { data } = record
  const characterName = data.characterName.trim()
  const dimensions = validation.dimensions.map((dimension) => ({ ...dimension }))
  const scores = validation.dimensions.map((dimension) => dimension.score)
  const themeId = normalizeThemeId(data.theme)
  const duration = normalizeDuration(data.duration)
  const portraitImage = await resolveImageAsDataUrl(data.characterImage, inputFilePath)
  const hupuRatingImage = await resolveImageAsDataUrl(data.hupuRatingImage, inputFilePath)
  const heroIconResult = await resolveHeroIconsAsDataUrls(data.heroIcons, inputFilePath)
  const matchInfo = normalizeMatchInfo(data)
  const baseName = sanitizeFileBaseName(characterName) || `row-${record.rowNumber}`
  const jsonPath = uniqueOutput ? uniqueOutputPath(path.join(outputDir, `${baseName}.json`)) : path.join(outputDir, `${baseName}.json`)
  const resolvedBaseName = path.basename(jsonPath, '.json')
  const pngPath = path.join(outputDir, `${resolvedBaseName}.png`)

  const snapshot = createProjectSnapshot({
    title: data.title || `${characterName}能力雷达图`,
    themeId,
    canvasRatioId: '16:9',
    animationDuration: duration * 1000,
    dimensions,
    people: [
      {
        name: characterName,
        color: peoplePalette[0],
        scores,
        portraitImage,
        hupuRating: normalizeHupuRating(data.hupuRating),
        kda: data.kda || '',
        heroIcons: heroIconResult.icons,
        heroIconLayout: normalizeHeroIconLayout(data.heroIconLayout),
        hupuRatingTemplate: normalizeHupuRatingTemplate(data.hupuRatingTemplate),
        hupuRatingImage,
      },
    ],
    portraitTitle: data.subtitle || characterName,
    portraitImage,
    hupuRating: normalizeHupuRating(data.hupuRating),
    matchInfo,
    battleRank: data.battleRank,
    battlePower: data.battlePower,
    kda: data.kda || '',
    heroIcons: heroIconResult.icons,
    heroIconLayout: normalizeHeroIconLayout(data.heroIconLayout),
    hupuRatingTemplate: normalizeHupuRatingTemplate(data.hupuRatingTemplate),
    hupuRatingImage,
  })

  return {
    ok: true,
    rowNumber: record.rowNumber,
    name: characterName,
    jsonPath,
    pngPath,
    data: {
      ...snapshot,
      series: data.series || '',
      subtitle: data.subtitle || '',
      characterName,
      characterImage: portraitImage,
      theme: themeId,
      duration,
      hupuRating: normalizeHupuRating(data.hupuRating),
      teamName: formatMatchTitle(matchInfo),
      matchLeftTeam: matchInfo.leftTeam,
      matchLeftScore: matchInfo.leftScore,
      matchRightScore: matchInfo.rightScore,
      matchRightTeam: matchInfo.rightTeam,
      battleRank: snapshot.battleRank,
      battlePower: snapshot.battlePower,
      kda: data.kda || '',
      heroIcons: heroIconResult.icons,
      heroIconLayout: normalizeHeroIconLayout(data.heroIconLayout),
      hupuRatingTemplate: normalizeHupuRatingTemplate(data.hupuRatingTemplate),
      hupuRatingImage,
    },
    warnings: [
      ...(portraitImage || !data.characterImage ? [] : [`人物图片未找到：${data.characterImage}`]),
      ...(hupuRatingImage || !data.hupuRatingImage ? [] : [`虎扑JRs评分图片未找到：${data.hupuRatingImage}`]),
      ...heroIconResult.warnings,
    ],
  }
}

export async function writeProjectJson(asset) {
  await mkdir(path.dirname(asset.jsonPath), { recursive: true })
  await writeFile(asset.jsonPath, `${JSON.stringify(asset.data, null, 2)}\n`, 'utf8')
}

export function validateCsvRecord(record, headers) {
  const errors = []
  const data = record.data
  const characterName = data.characterName?.trim()
  const dimensionGroups = collectDimensionGroups(headers)
  const legacyDimensionFields = headers.filter((header) => !fixedCsvFieldSet.has(header) && !isStructuredDimensionField(header))
  const usesStructuredDimensions = dimensionGroups.length > 0
  const dimensions = usesStructuredDimensions
    ? dimensionGroups.map(({ name }) => ({
        name,
        score: Number(data[`${name}_score`]),
        min: normalizeDimensionBound(data[`${name}_min`], 0),
        max: normalizeDimensionBound(data[`${name}_max`], 100),
      }))
    : legacyDimensionFields.map((name) => ({
        name,
        score: Number(data[name]),
        min: 0,
        max: 100,
      }))

  if (!characterName) {
    errors.push('characterName 不能为空')
  }

  if (dimensions.length === 0) {
    errors.push('至少需要 1 个数字维度列')
  }

  for (const dimension of dimensions) {
    const rawValue = usesStructuredDimensions ? data[`${dimension.name}_score`] : data[dimension.name]
    const number = Number(rawValue)

    if (rawValue === '' || !Number.isFinite(number)) {
      errors.push(`维度「${dimension.name}」的分数不是数字：${rawValue || '空值'}`)
    } else if (number < dimension.min) {
      errors.push(`维度「${dimension.name}」的分数低于 min：${rawValue} < ${dimension.min}`)
    }

    if (!Number.isFinite(dimension.min) || !Number.isFinite(dimension.max)) {
      errors.push(`维度「${dimension.name}」的 min/max 不是数字`)
    } else if (dimension.max <= dimension.min) {
      errors.push(`维度「${dimension.name}」的 max 必须大于 min：${dimension.min} / ${dimension.max}`)
    }
  }

  const themeId = data.theme?.trim()
  if (themeId && !themes.some((theme) => theme.id === themeId)) {
    errors.push(`theme 不存在：${themeId}，可用值：${themes.map((theme) => theme.id).join(', ')}`)
  }

  const duration = data.duration?.trim()
  if (duration && !allowedDurations.has(Number(duration))) {
    errors.push('duration 目前只支持 5、8、10 秒，以兼容 Remotion 预设')
  }

  return {
    ok: errors.length === 0,
    errors,
    dimensionFields: dimensions.map((dimension) => dimension.name),
    dimensions,
  }
}

function collectDimensionGroups(headers) {
  const groups = new Map()

  for (const header of headers) {
    const match = /^(.*)_(score|min|max)$/.exec(header)
    if (!match || fixedCsvFieldSet.has(header)) continue
    const [, name, part] = match
    if (!name) continue
    const group = groups.get(name) ?? { name, parts: new Set() }
    group.parts.add(part)
    groups.set(name, group)
  }

  return [...groups.values()].filter((group) => group.parts.has('score'))
}

function isStructuredDimensionField(header) {
  return /^(.*)_(score|min|max)$/.test(header)
}

function normalizeDimensionBound(value, fallback) {
  if (value === '') return fallback
  const number = Number(value)
  return Number.isFinite(number) ? number : Number.NaN
}

export function summarizeBatch(results) {
  return {
    jsonCount: results.filter((result) => result.jsonPath).length,
    pngCount: results.filter((result) => result.pngPath && result.pngOk).length,
    failureCount: results.filter((result) => !result.ok).length,
    failures: results.filter((result) => !result.ok),
  }
}

export function formatRelativePath(filePath) {
  return path.relative(PROJECT_ROOT, filePath) || '.'
}

export function uniqueOutputPath(initialPath) {
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

function parseCsv(raw) {
  const rows = []
  let row = []
  let cell = ''
  let insideQuotes = false

  for (let index = 0; index < raw.length; index += 1) {
    const character = raw[index]
    const nextCharacter = raw[index + 1]

    if (character === '"') {
      if (insideQuotes && nextCharacter === '"') {
        cell += '"'
        index += 1
      } else {
        insideQuotes = !insideQuotes
      }
      continue
    }

    if (character === ',' && !insideQuotes) {
      row.push(cell)
      cell = ''
      continue
    }

    if ((character === '\n' || character === '\r') && !insideQuotes) {
      if (character === '\r' && nextCharacter === '\n') index += 1
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
      continue
    }

    cell += character
  }

  row.push(cell)
  rows.push(row)

  return rows.filter((csvRow) => hasAnyValue(csvRow))
}

function hasAnyValue(values) {
  return values.some((value) => value.trim())
}

function normalizeThemeId(themeInput) {
  const themeId = themeInput?.trim()
  return themes.some((theme) => theme.id === themeId) ? themeId : 'esports'
}

function normalizeDuration(durationInput) {
  const duration = Number(durationInput)
  return allowedDurations.has(duration) ? duration : 8
}

async function resolveImageAsDataUrl(imageInput, inputFilePath) {
  const imagePath = imageInput?.trim()
  if (!imagePath) return ''
  if (imagePath.startsWith('data:image/')) return imagePath
  if (/^https?:\/\//i.test(imagePath)) return imagePath

  const candidates = [
    path.resolve(path.dirname(inputFilePath), imagePath),
    path.resolve(PROJECT_ROOT, imagePath),
  ]
  const filePath = candidates.find((candidate) => existsSync(candidate))

  if (!filePath) return ''

  const buffer = await readFile(filePath)
  return `data:${mimeTypeForPath(filePath)};base64,${buffer.toString('base64')}`
}

async function resolveHeroIconsAsDataUrls(heroIconsInput, inputFilePath) {
  const iconPaths = normalizeHeroIcons(heroIconsInput)
  const icons = []
  const warnings = []

  for (const iconPath of iconPaths) {
    if (!iconPath) continue
    const dataUrl = await resolveImageAsDataUrl(iconPath, inputFilePath)
    if (dataUrl) {
      icons.push(dataUrl)
    } else {
      warnings.push(`英雄头像未找到：${iconPath}`)
    }
  }

  return { icons, warnings }
}

function mimeTypeForPath(filePath) {
  const extension = path.extname(filePath).toLowerCase()
  if (extension === '.jpg' || extension === '.jpeg') return 'image/jpeg'
  if (extension === '.webp') return 'image/webp'
  if (extension === '.gif') return 'image/gif'
  return 'image/png'
}
