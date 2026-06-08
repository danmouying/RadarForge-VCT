import { themes } from '../../src/config/themes.js'
import {
  normalizeHeroIconLayout,
  normalizeHeroIcons,
  normalizeHupuRating,
  normalizeHupuRatingTemplate,
} from '../../src/utils/portraitMeta.js'
import { normalizeMatchInfo } from '../../src/utils/matchInfo.js'

const DURATION_PRESETS = [5, 8, 10]
const FPS = 30
const DEFAULT_MAP_SCORE_DURATION = 4
const DEFAULT_MAP_SUMMARY_DURATION = 4
const MAX_ROUND_EVENTS = 30
const MAX_SERIES_MAP_RESULTS = 5
const ROUND_EVENT_METHODS = new Set(['elimination', 'defuse', 'detonation', 'time'])
const FALLBACK_DIMENSIONS = ['维度一', '维度二', '维度三']
const FALLBACK_VALUES = [86, 78, 82]

export function normalizeRadarVideoProps(input = {}, options = {}) {
  const source = input ?? {}
  const data = extractRadarVideoData(source)
  const { person } = data
  const dimensions = data.dimensions.length >= 3 ? data.dimensions.slice(0, 12) : FALLBACK_DIMENSIONS.map((name) => ({ name, min: 0, max: 100 }))
  const rawValues = Array.isArray(data.rawValues) && data.rawValues.length > 0 ? data.rawValues : FALLBACK_VALUES
  const isProjectSnapshot = isRadarForgeSnapshot(source)
  const theme = normalizeTheme(isProjectSnapshot ? source.themeId ?? source.theme : source.theme ?? source.themeId)
  const duration = normalizeDuration(source.duration ?? source.videoDuration, options)
  const matchInfo = normalizeMatchInfo({
    ...(source.matchInfo || {}),
    ...source,
    teamName: person?.teamName || source.teamName,
  })
  const characterImage =
    source.characterImage ||
    source.portraitImage ||
    person?.portraitImage ||
    source.character?.image ||
    ''

  return {
    title: source.title || 'RadarForge 能力雷达视频',
    subtitle: isProjectSnapshot
      ? source.portraitTitle || source.subtitle || '人物亮点'
      : source.subtitle || source.portraitTitle || '能力数据生成动画',
    theme,
    duration,
    characterName: data.characterName || '对象 A',
    characterTag: source.characterTag || source.tag || source.role || '角色',
    characterColor: isProjectSnapshot
      ? person?.color || source.characterColor || theme.chartLine
      : source.characterColor || person?.color || theme.chartLine,
    characterImage,
    hupuRating: normalizeHupuRating(person?.hupuRating ?? source.hupuRating ?? ''),
    teamName: person?.teamName || source.teamName || '',
    matchInfo,
    battleRank: normalizeBattleRank(source.battleRank),
    battlePower: normalizeBattlePower(source.battlePower),
    kda: person?.kda || source.kda || '',
    heroIcons: normalizeHeroIcons(person?.heroIcons ?? source.heroIcons),
    heroIconLayout: normalizeHeroIconLayout(person?.heroIconLayout ?? source.heroIconLayout),
    hupuRatingTemplate: normalizeHupuRatingTemplate(
      person?.hupuRatingTemplate ?? source.hupuRatingTemplate,
    ),
    hupuRatingImage:
      person?.hupuRatingImage ||
      source.hupuRatingImage ||
      '',
    dimensions,
    values: dimensions.map((dimension, index) => clampScore(rawValues[index] ?? dimension.score ?? 0, dimension.min)),
  }
}

function normalizeBattleRank(value) {
  const rank = typeof value === 'string' ? value.trim() : String(value ?? '').trim()
  const normalizedRank = rank.startsWith('#') ? rank : `#${rank}`
  return /^#(?:10|[1-9])$/.test(normalizedRank) ? normalizedRank : '#1'
}

function normalizeBattlePower(value) {
  const power = typeof value === 'string' ? value.trim() : String(value ?? '').trim()
  return power || '9876'
}

export function normalizeRadarBatchProps(input = {}) {
  const source = input ?? {}
  const mapsSource = Array.isArray(source.maps) ? source.maps : []
  const mapSequenceItems = mapsSource.flatMap((map, mapIndex) => normalizeEpisodeMap(map, mapIndex))
  if (mapSequenceItems.length > 0) {
    return {
      title: source.title || 'RadarForge 完整雷达视频',
      maps: mapsSource,
      items: mapSequenceItems.filter((item) => item.type === 'radar'),
      sequenceItems: mapSequenceItems,
      totalDurationInFrames: mapSequenceItems.reduce((total, item) => total + item.durationInFrames, 0),
    }
  }

  const itemsSource = Array.isArray(source.items) ? source.items : []
  const normalizedItems = itemsSource.map((item) => {
    const normalized = normalizeRadarVideoProps(item, {
      allowAnyDuration: true,
      defaultDuration: 5,
    })

    return {
      ...normalized,
      durationInFrames: secondsToFrames(normalized.duration),
    }
  })

  const items =
    normalizedItems.length > 0
      ? normalizedItems
      : [
          {
            ...normalizeRadarVideoProps(source, {
              allowAnyDuration: true,
              defaultDuration: 5,
            }),
          },
        ].map((item) => ({
          ...item,
          durationInFrames: secondsToFrames(item.duration),
        }))

  return {
    title: source.title || 'RadarForge 完整雷达视频',
    items,
    sequenceItems: items.map((item) => ({ ...item, type: 'radar' })),
    totalDurationInFrames: items.reduce((total, item) => total + item.durationInFrames, 0),
  }
}

function normalizeEpisodeMap(map = {}, mapIndex = 0) {
  const itemsSource = Array.isArray(map.items) ? map.items : []
  const radarItems = itemsSource.map((item, itemIndex) => {
    const normalized = normalizeRadarVideoProps(item, {
      allowAnyDuration: true,
      defaultDuration: 5,
    })

    return {
      ...normalized,
      type: 'radar',
      mapIndex,
      sourceIndex: itemIndex,
      rankingScore: getRankingScore(item, normalized),
      durationInFrames: secondsToFrames(normalized.duration),
    }
  })

  const transitionSource = map.transition || map.mapScore || map.scoreTransition
  const transition = transitionSource
    ? normalizeMapScoreTransitionProps(
        {
          label: `Map ${mapIndex + 1}`,
          ...transitionSource,
        },
        mapIndex,
      )
    : null
  const summarySource = map.summary && typeof map.summary === 'object' ? map.summary : null
  const isSeriesSummary = summarySource?.type === 'series'
  const summary = summarySource
    ? isSeriesSummary
      ? normalizeSeriesSummaryProps(
          {
            leftTeamName: transition?.leftTeamName,
            rightTeamName: transition?.rightTeamName,
            leftTeamLogo: transition?.leftTeamLogo,
            rightTeamLogo: transition?.rightTeamLogo,
            leftScore: transition?.leftScore,
            rightScore: transition?.rightScore,
            theme: 'white-red',
            ...summarySource,
          },
          mapIndex,
        )
      : normalizeMapSummaryProps(
        {
          leftTeamName: transition?.leftTeamName,
          rightTeamName: transition?.rightTeamName,
          leftTeamLogo: transition?.leftTeamLogo,
          rightTeamLogo: transition?.rightTeamLogo,
          leftMapScore: transition?.leftScore,
          rightMapScore: transition?.rightScore,
          mapName: transition?.mapName,
          theme: 'white-red',
          ...summarySource,
        },
        mapIndex,
      )
    : null

  const sequenceItems = []

  if (transition) {
    sequenceItems.push({
      ...transition,
      type: 'transition',
      mapIndex,
      durationInFrames: secondsToFrames(transition.duration),
    })
  }

  if (summary) {
    sequenceItems.push({
      ...summary,
      type: isSeriesSummary ? 'series-summary' : 'summary',
      mapIndex,
      durationInFrames: secondsToFrames(summary.duration),
    })
  }

  return [...sequenceItems, ...radarItems]
}

function normalizeMapScoreTransitionProps(input = {}, mapIndex = 0) {
  return {
    leftTeamName: normalizeText(input.leftTeamName, 'EDG'),
    rightTeamName: normalizeText(input.rightTeamName, 'JDG'),
    leftTeamLogo: normalizeText(input.leftTeamLogo, ''),
    rightTeamLogo: normalizeText(input.rightTeamLogo, ''),
    leftScore: normalizeScoreText(input.leftScore, 0),
    rightScore: normalizeScoreText(input.rightScore, 0),
    mapName: normalizeText(input.mapName, ''),
    label: normalizeText(input.label, `Map ${mapIndex + 1}`),
    duration: normalizeMapScoreDuration(input.duration),
    theme: normalizeText(input.theme, 'esports'),
  }
}

export function normalizeMapSummaryProps(input = {}, mapIndex = 0) {
  const mapName = normalizeText(input.mapName, '')

  return {
    leftTeamName: normalizeText(input.leftTeamName, 'EDG'),
    rightTeamName: normalizeText(input.rightTeamName, 'JDG'),
    leftTeamLogo: normalizeText(input.leftTeamLogo, ''),
    rightTeamLogo: normalizeText(input.rightTeamLogo, ''),
    leftMapScore: normalizeScoreText(input.leftMapScore ?? input.leftScore, 0),
    rightMapScore: normalizeScoreText(input.rightMapScore ?? input.rightScore, 0),
    mapName,
    mapImage: normalizeText(input.mapImage, ''),
    summaryTitle: normalizeText(input.summaryTitle, `${mapName || `Map ${mapIndex + 1}`} 地图总览`),
    summaryText: normalizeText(input.summaryText, '本图双方围绕关键区域持续拉扯，团队节奏与个人发挥共同决定地图走势。'),
    leftStartingSide: normalizeRoundSide(input.leftStartingSide, 'defense'),
    rightStartingSide: normalizeRoundSide(input.rightStartingSide, 'attack'),
    roundEvents: normalizeRoundEvents(input.roundEvents),
    leftTeamStats: normalizeTeamStats(input.leftTeamStats),
    rightTeamStats: normalizeTeamStats(input.rightTeamStats),
    duration: normalizeMapSummaryDuration(input.duration),
    theme: normalizeText(input.theme, 'white-red'),
  }
}

export function normalizeSeriesSummaryProps(input = {}, mapIndex = 0) {
  return {
    type: 'series',
    label: normalizeText(input.label, 'Summary'),
    leftTeamName: normalizeText(input.leftTeamName, 'EDG'),
    rightTeamName: normalizeText(input.rightTeamName, 'JDG'),
    leftTeamLogo: normalizeText(input.leftTeamLogo, ''),
    rightTeamLogo: normalizeText(input.rightTeamLogo, ''),
    leftScore: normalizeScoreText(input.leftScore ?? input.leftMapScore, 0),
    rightScore: normalizeScoreText(input.rightScore ?? input.rightMapScore, 0),
    summaryTitle: normalizeText(input.summaryTitle, '整场总结'),
    summaryText: normalizeText(input.summaryText, ''),
    leftTeamStats: normalizeTeamStats(input.leftTeamStats),
    rightTeamStats: normalizeTeamStats(input.rightTeamStats),
    mapResults: normalizeSeriesMapResults(input.mapResults),
    duration: normalizeMapSummaryDuration(input.duration),
    theme: normalizeText(input.theme, 'white-red'),
    mapIndex,
  }
}

function normalizeSeriesMapResults(input = []) {
  if (!Array.isArray(input)) return []

  return input.slice(0, MAX_SERIES_MAP_RESULTS).map((result, index) => {
    const source = result && typeof result === 'object' ? result : {}

    return {
      label: normalizeText(source.label, `Map ${index + 1}`),
      mapName: normalizeText(source.mapName, `Map ${index + 1}`),
      mapImage: normalizeText(source.mapImage, ''),
      leftMapScore: normalizeScoreText(source.leftMapScore ?? source.leftScore, 0),
      rightMapScore: normalizeScoreText(source.rightMapScore ?? source.rightScore, 0),
    }
  })
}

function normalizeRoundEvents(input = []) {
  if (!Array.isArray(input)) return []

  return input
    .slice(0, MAX_ROUND_EVENTS)
    .map((event, index) => {
      const source = event && typeof event === 'object' ? event : {}
      const round = normalizeRoundNumber(source.round, index + 1)
      const method = normalizeRoundMethod(source.method)

      return {
        round,
        winner: normalizeText(source.winner, ''),
        method,
        icon: normalizeText(source.icon || source.methodIcon, ''),
        winnerSide: normalizeRoundSide(source.winnerSide, ''),
        winnerColor: normalizeRoundColor(source.winnerColor, ''),
      }
    })
    .filter((event) => event.round > 0 && event.winner)
}

function normalizeRoundNumber(value, fallback) {
  const number = Number(value)
  if (!Number.isFinite(number) || number <= 0) return fallback
  return Math.round(number)
}

function normalizeRoundMethod(value) {
  const method = normalizeText(value, 'elimination').toLowerCase()
  return ROUND_EVENT_METHODS.has(method) ? method : 'elimination'
}

function normalizeRoundSide(value, fallback) {
  const side = normalizeText(value, fallback).toLowerCase()
  if (side === 'attack' || side === 'attacking' || side === 'atk') return 'attack'
  if (side === 'defense' || side === 'defensive' || side === 'def') return 'defense'
  return fallback
}

function normalizeRoundColor(value, fallback) {
  const color = normalizeText(value, fallback).toLowerCase()
  if (color === 'red' || color === 'attack' || color === 'attacking' || color === 'atk') return 'red'
  if (color === 'blue' || color === 'defense' || color === 'defensive' || color === 'def') return 'blue'
  return fallback
}

function normalizeTeamStats(input = {}) {
  const source = input && typeof input === 'object' ? input : {}

  return {
    kda: normalizeText(source.kda, '-'),
    acs: normalizeStatValue(source.acs),
    adr: normalizeStatValue(source.adr),
    kast: normalizeText(source.kast, '-'),
  }
}

function getRankingScore(source = {}, normalized = null) {
  const directScore = firstFiniteNumber([
    source.rankScore,
    source.rankingScore,
    source.score,
    source.rating,
    source.hupuRating,
    source.person?.rankScore,
    source.person?.score,
    source.person?.rating,
    source.person?.hupuRating,
    Array.isArray(source.people) ? source.people[0]?.rankScore : undefined,
    Array.isArray(source.people) ? source.people[0]?.score : undefined,
    Array.isArray(source.people) ? source.people[0]?.rating : undefined,
    Array.isArray(source.people) ? source.people[0]?.hupuRating : undefined,
  ])
  if (Number.isFinite(directScore)) return directScore

  const values = normalized?.values ?? normalizeRadarVideoProps(source, {
    allowAnyDuration: true,
    defaultDuration: 5,
  }).values
  if (!Array.isArray(values) || values.length === 0) return 0

  const numericValues = values.map((value) => Number(value)).filter(Number.isFinite)
  if (numericValues.length === 0) return 0
  return numericValues.reduce((total, value) => total + value, 0) / numericValues.length
}

export function extractRadarVideoData(input = {}) {
  const source = input ?? {}
  const person = getTargetPerson(source)
  const hasPersonCollection =
    Array.isArray(source.people) ||
    Array.isArray(source.characters) ||
    Boolean(source.person) ||
    Boolean(source.character)
  const preferPersonData = isRadarForgeSnapshot(source) || hasPersonCollection

  return {
    person,
    dimensions: readDimensionData(source.dimensions),
    rawValues: readValues(source, person, preferPersonData) ?? readDimensionScores(source.dimensions),
    characterName: readCharacterName(source, person, preferPersonData),
  }
}

export function validateRadarVideoProps(input = {}) {
  const data = extractRadarVideoData(input)
  const errors = []

  if (!Array.isArray(input?.dimensions)) {
    errors.push('dimensions 必须存在且为数组')
  } else if (data.dimensions.length === 0) {
    errors.push('dimensions 至少需要 1 个有效名称')
  }

  if (!Array.isArray(data.rawValues)) {
    errors.push('values / scores / data 必须存在且为数组')
  } else if (data.rawValues.length === 0) {
    errors.push('values / scores / data 至少需要 1 个分数')
  }

  if (
    Array.isArray(data.rawValues) &&
    data.dimensions.length > 0 &&
    data.rawValues.length > 0 &&
    data.dimensions.length !== data.rawValues.length
  ) {
    errors.push(`维度数量 (${data.dimensions.length}) 必须等于分数数量 (${data.rawValues.length})`)
  }

  if (Array.isArray(data.rawValues)) {
    data.rawValues.forEach((value, index) => {
      if (!Number.isFinite(Number(value))) {
        errors.push(`第 ${index + 1} 个分数不是数字：${String(value)}`)
      }
    })
  }

  if (!data.characterName) {
    errors.push('无法读取人物名称，请提供 characterName / name / playerName / people[].name / characters[].name')
  }

  return {
    ok: errors.length === 0,
    errors,
    summary: {
      characterName: data.characterName || '',
    dimensions: data.dimensions.map((dimension) => dimension.name),
      values: Array.isArray(data.rawValues) ? data.rawValues.map((value) => Number(value)) : [],
    },
  }
}

export function summarizeRadarVideoProps(input = {}) {
  const normalized = normalizeRadarVideoProps(input)

  return {
    characterName: normalized.characterName,
    dimensions: normalized.dimensions.map((dimension) => dimension.name),
    values: normalized.values,
  }
}

function getTargetPerson(source) {
  if (source.person && typeof source.person === 'object') return source.person
  if (source.character && typeof source.character === 'object') return source.character

  const people = Array.isArray(source.people)
    ? source.people
    : Array.isArray(source.characters)
      ? source.characters
      : []

  if (people.length > 0) {
    const targetName = source.characterName || source.activePersonName || source.playerName
    const targetId = source.activePersonId || source.personId || source.characterId

    if (targetId) {
      return people.find((person) => person?.id === targetId) ?? people[0]
    }

    if (targetName) {
      return people.find((person) => person?.name === targetName || person?.playerName === targetName) ?? people[0]
    }

    return people[0]
  }

  return null
}

function isRadarForgeSnapshot(source) {
  return Boolean(
    source.version ||
      source.themeId ||
      source.canvasRatioId ||
      source.portraitTitle ||
      Array.isArray(source.people),
  )
}

function readValues(source, person, preferPersonData) {
  const personValues = person?.values ?? person?.scores ?? person?.data
  const sourceValues = source.values ?? source.scores ?? source.data

  if (preferPersonData) return Array.isArray(personValues) ? personValues : sourceValues
  return Array.isArray(sourceValues) ? sourceValues : personValues
}

function readDimensionScores(dimensions) {
  if (!Array.isArray(dimensions)) return undefined
  const scores = dimensions.map((dimension) => (typeof dimension === 'object' ? dimension?.score : undefined))
  return scores.some((score) => Number.isFinite(Number(score))) ? scores : undefined
}

function readCharacterName(source, person, preferPersonData) {
  const personName = person?.name || person?.playerName || person?.characterName
  const sourceName = source.characterName || source.name || source.playerName || source.character?.name
  return String(preferPersonData ? personName || sourceName || '' : sourceName || personName || '').trim()
}

function readDimensionData(dimensions) {
  if (!Array.isArray(dimensions)) return []

  return dimensions
    .map((dimension, index) => {
      if (typeof dimension === 'string') {
        return { name: dimension.trim(), min: 0, max: 100 }
      }
      const min = normalizeNumber(dimension?.min, 0)
      return {
        name: String(dimension?.name || dimension?.label || dimension?.title || `维度 ${index + 1}`).trim(),
        score: normalizeNumber(dimension?.score, undefined),
        min,
        max: normalizeMax(dimension?.max, min),
      }
    })
    .filter((dimension) => dimension.name)
}

function normalizeDuration(duration, options = {}) {
  const seconds = Number(duration)
  if (options.allowAnyDuration && Number.isFinite(seconds) && seconds > 0) {
    return Math.min(60, Math.max(1, seconds))
  }
  if (DURATION_PRESETS.includes(seconds)) return seconds
  return options.defaultDuration ?? 8
}

function secondsToFrames(seconds) {
  return Math.max(1, Math.round(seconds * FPS))
}

function normalizeTheme(themeInput) {
  const sourceTheme =
    typeof themeInput === 'object' && themeInput
      ? themeInput
      : themes.find((theme) => theme.id === themeInput) ?? themes[1] ?? themes[0]

  const isDark = isDarkColor(sourceTheme.canvas)

  return {
    id: sourceTheme.id || 'custom',
    canvas: sourceTheme.canvas || '#090b14',
    panel: sourceTheme.panel || '#111521',
    panelSoft: sourceTheme.panelSoft || '#171d2b',
    border: sourceTheme.border || '#2b3650',
    text: sourceTheme.text || '#f7fbff',
    muted: sourceTheme.muted || '#8f9bb3',
    accent: sourceTheme.accent || '#00f0ff',
    accent2: sourceTheme.accent2 || '#ff2bd6',
    chartArea: sourceTheme.chartArea || 'rgba(0, 240, 255, 0.8)',
    chartLine: sourceTheme.chartLine || sourceTheme.accent || '#00f0ff',
    scoreText: sourceTheme.scoreText || sourceTheme.accent || '#67e8f9',
    splitLine: sourceTheme.splitLine || 'rgba(255,255,255,0.28)',
    splitAreaA: sourceTheme.splitArea?.[0] || 'rgba(255,255,255,0.05)',
    splitAreaB: sourceTheme.splitArea?.[1] || 'rgba(255,255,255,0.025)',
    accentSoft: withAlpha(sourceTheme.accent || '#00f0ff', isDark ? 0.18 : 0.12),
    accent2Soft: withAlpha(sourceTheme.accent2 || '#ff2bd6', isDark ? 0.16 : 0.1),
    scan: withAlpha(sourceTheme.accent2 || '#ffffff', 0.48),
    shadow: isDark ? 'rgba(0, 0, 0, 0.38)' : 'rgba(15, 23, 42, 0.14)',
    isDark,
  }
}

function clampScore(value, min = 0) {
  const number = Number(value)
  if (!Number.isFinite(number)) return min
  return Math.max(min, number)
}

function normalizeNumber(value, fallback) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function normalizeText(value, fallback = '') {
  const text = typeof value === 'string' ? value.trim() : String(value ?? '').trim()
  return text || fallback
}

function normalizeScoreText(value, fallback) {
  if (value === null || value === undefined || value === '') return String(fallback)
  return String(value).trim()
}

function normalizeMapScoreDuration(value) {
  const duration = Number(value)
  if (!Number.isFinite(duration) || duration <= 0) return DEFAULT_MAP_SCORE_DURATION
  return Math.max(1, Math.min(12, duration))
}

function normalizeMapSummaryDuration(value) {
  const duration = Number(value)
  if (!Number.isFinite(duration) || duration <= 0) return DEFAULT_MAP_SUMMARY_DURATION
  return Math.max(1, Math.min(12, duration))
}

function normalizeStatValue(value) {
  if (value === null || value === undefined || value === '') return '-'
  if (Number.isFinite(Number(value))) return Math.round(Number(value) * 10) / 10
  return String(value).trim() || '-'
}

function firstFiniteNumber(values) {
  for (const value of values) {
    const number = Number(value)
    if (Number.isFinite(number)) return number
  }

  return undefined
}

function normalizeMax(value, min) {
  const number = Number(value)
  return Number.isFinite(number) && number > min ? number : min + 100
}

function isDarkColor(hex) {
  const rgb = parseHex(hex)
  if (!rgb) return true
  return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000 < 128
}

function withAlpha(hex, alpha) {
  const rgb = parseHex(hex)
  if (!rgb) return `rgba(255,255,255,${alpha})`
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
}

function parseHex(value) {
  if (typeof value !== 'string' || !value.startsWith('#')) return null
  const raw = value.slice(1)
  const normalized =
    raw.length === 3
      ? raw
          .split('')
          .map((char) => char + char)
          .join('')
      : raw
  if (normalized.length !== 6) return null
  const number = Number.parseInt(normalized, 16)
  if (Number.isNaN(number)) return null
  return {
    r: (number >> 16) & 255,
    g: (number >> 8) & 255,
    b: number & 255,
  }
}
