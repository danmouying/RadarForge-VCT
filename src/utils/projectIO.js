import {
  normalizeHeroIconLayout,
  normalizeHeroIcons,
  normalizeHupuRating,
  normalizeHupuRatingTemplate,
} from './portraitMeta.js'
import { formatMatchTitle, normalizeMatchInfo } from './matchInfo.js'

export function createProjectSnapshot({
  title,
  themeId,
  canvasRatioId,
  animationDuration,
  dimensions,
  people,
  portraitTitle,
  portraitImage,
  hupuRating,
  matchInfo,
  battleRank,
  battlePower,
  kda,
  heroIcons,
  heroIconLayout,
  hupuRatingTemplate,
  hupuRatingImage,
}) {
  const normalizedHeroIcons = normalizeHeroIcons(heroIcons)
  const normalizedHeroIconLayout = normalizeHeroIconLayout(heroIconLayout)
  const normalizedHupuRatingTemplate = normalizeHupuRatingTemplate(hupuRatingTemplate)
  const normalizedMatchInfo = normalizeMatchInfo(matchInfo)
  const teamName = formatMatchTitle(normalizedMatchInfo)

  return {
    version: 6,
    exportedAt: new Date().toISOString(),
    title,
    themeId,
    canvasRatioId,
    animationDuration,
    portraitTitle,
    portraitImage,
    hupuRating: normalizeHupuRating(hupuRating),
    teamName,
    matchLeftTeam: normalizedMatchInfo.leftTeam,
    matchLeftScore: normalizedMatchInfo.leftScore,
    matchRightScore: normalizedMatchInfo.rightScore,
    matchRightTeam: normalizedMatchInfo.rightTeam,
    battleRank: normalizeBattleRank(battleRank),
    battlePower: typeof battlePower === 'string' ? battlePower : String(battlePower ?? ''),
    kda: kda || '',
    heroIcons: normalizedHeroIcons,
    heroIconLayout: normalizedHeroIconLayout,
    hupuRatingTemplate: normalizedHupuRatingTemplate,
    hupuRatingImage: typeof hupuRatingImage === 'string' ? hupuRatingImage : '',
    dimensions: dimensions.map(({ name, min, max }, index) => {
      const safeMin = normalizeNumber(min, 0)
      return {
        name,
        min: safeMin,
        max: normalizeMax(max, safeMin),
        score: normalizeNumber(people[0]?.scores?.[index], safeMin),
      }
    }),
    people: people.map(({
      name,
      color,
      scores,
      portraitImage,
      hupuRating,
      kda,
      heroIcons,
      hupuRatingTemplate,
      hupuRatingImage,
    }) => ({
      name,
      color,
      scores,
      portraitImage: portraitImage || '',
      hupuRating: normalizeHupuRating(hupuRating),
      kda: kda || '',
      heroIcons: normalizeHeroIcons(heroIcons).length > 0 ? normalizeHeroIcons(heroIcons) : normalizedHeroIcons,
      heroIconLayout: normalizedHeroIconLayout,
      hupuRatingTemplate: normalizeHupuRatingTemplate(hupuRatingTemplate ?? normalizedHupuRatingTemplate),
      hupuRatingImage: typeof hupuRatingImage === 'string' ? hupuRatingImage : '',
    })),
  }
}

function normalizeBattleRank(value) {
  const rank = typeof value === 'string' ? value.trim() : ''
  return /^#(?:10|[1-9])$/.test(rank) ? rank : '#1'
}

function normalizeNumber(value, fallback) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function normalizeMax(value, min) {
  const number = Number(value)
  return Number.isFinite(number) && number > min ? number : min + 100
}

export function downloadJson(data, fileName) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${fileName}.json`
  link.click()
  URL.revokeObjectURL(url)
}

export function readJsonFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        resolve(JSON.parse(reader.result))
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}
