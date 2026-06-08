import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const sourceManifestPath = path.join(projectRoot, 'examples/edg-xlg-full-episode.manifest.json')
const outputManifestPath = path.join(projectRoot, 'examples/edg-xlg-full-episode-with-summary.manifest.json')
const dimensions = ['Rating', '战斗评分', '回合均伤', '首杀能力', 'KAST', '助攻贡献']

const manifest = JSON.parse(await readFile(sourceManifestPath, 'utf8'))
const mapRounds = manifest.maps.map((map) => {
  const left = Number(map.summary?.leftMapScore || 0)
  const right = Number(map.summary?.rightMapScore || 0)
  return Math.max(1, left + right)
})
const playerNames = manifest.maps[0].items.map((itemPath) =>
  path.basename(itemPath).replace(/^map1_/, '').replace(/\.json$/i, ''),
)

const players = []
for (const playerName of playerNames) {
  const mapData = []
  for (let mapIndex = 0; mapIndex < manifest.maps.length; mapIndex += 1) {
    const filePath = path.join(projectRoot, 'exports', `map${mapIndex + 1}_${playerName}.json`)
    mapData.push(JSON.parse(await readFile(filePath, 'utf8')))
  }
  players.push(buildSeriesPlayer(playerName, mapData, mapRounds))
}

players.sort((a, b) => b.Rating_score - a.Rating_score)
const ratingMin = Math.min(...players.map((player) => player.Rating_score))
const ratingMax = Math.max(...players.map((player) => player.Rating_score))

for (const [index, player] of players.entries()) {
  player.battleRank = index + 1
  player.battlePower =
    ratingMax === ratingMin
      ? 100
      : Math.round(((player.Rating_score - ratingMin) / (ratingMax - ratingMin)) * 100)

  for (const dimension of dimensions) {
    const scores = players.map((item) => item[`${dimension}_score`])
    player[`${dimension}_min`] = Math.min(...scores)
    player[`${dimension}_max`] = Math.max(...scores)
  }

  const outputPath = path.join(projectRoot, 'exports', `summary_${player.characterName}.json`)
  await writeFile(outputPath, `${JSON.stringify(player, null, 2)}\n`, 'utf8')
}

const summaryMap = buildSummaryMap(manifest, players)
const completeManifest = {
  ...manifest,
  title: 'EDG vs XLG 3:2 Full Episode with Summary',
  maps: [...manifest.maps, summaryMap],
}

await writeFile(outputManifestPath, `${JSON.stringify(completeManifest, null, 2)}\n`, 'utf8')
console.log(`Generated ${players.length} summary player JSON files`)
console.log(`Generated manifest: ${outputManifestPath}`)

function buildSeriesPlayer(playerName, mapData, weights) {
  const base = mapData[0]
  const totalWeight = weights.reduce((total, weight) => total + weight, 0)
  const kdaTotals = mapData.reduce(
    (totals, item) => {
      const [kills, deaths, assists] = String(item.kda || '0/0/0')
        .split('/')
        .map((value) => Number(value) || 0)
      return [totals[0] + kills, totals[1] + deaths, totals[2] + assists]
    },
    [0, 0, 0],
  )

  const weightedAverage = (field, digits = 2) => {
    const value = mapData.reduce(
      (total, item, index) => total + (Number(item[field]) || 0) * weights[index],
      0,
    ) / totalWeight
    return Number(value.toFixed(digits))
  }
  const sum = (field) =>
    mapData.reduce((total, item) => total + (Number(item[field]) || 0), 0)

  return {
    series: 'EDG vs XLG 3:2',
    title: '',
    subtitle: playerName,
    characterName: playerName,
    characterImage: base.characterImage,
    theme: 'white-red',
    duration: 5,
    hupuRating: weightedAverage('hupuRating', 1),
    matchLeftTeam: 'EDG',
    matchLeftScore: 3,
    matchRightScore: 2,
    matchRightTeam: 'XLG',
    battleRank: 1,
    battlePower: 100,
    kda: kdaTotals.join('/'),
    heroIcons: base.heroIcons,
    heroIconLayout: base.heroIconLayout,
    hupuRatingTemplate: base.hupuRatingTemplate,
    hupuRatingImage: base.hupuRatingImage,
    Rating_score: weightedAverage('Rating_score'),
    Rating_min: 0,
    Rating_max: 0,
    战斗评分_score: weightedAverage('战斗评分_score', 1),
    战斗评分_min: 0,
    战斗评分_max: 0,
    回合均伤_score: weightedAverage('回合均伤_score', 1),
    回合均伤_min: 0,
    回合均伤_max: 0,
    首杀能力_score: sum('首杀能力_score'),
    首杀能力_min: 0,
    首杀能力_max: 0,
    KAST_score: weightedAverage('KAST_score', 1),
    KAST_min: 0,
    KAST_max: 0,
    助攻贡献_score: sum('助攻贡献_score'),
    助攻贡献_min: 0,
    助攻贡献_max: 0,
  }
}

function buildSummaryMap(sourceManifest, rankedPlayers) {
  const mapResults = sourceManifest.maps.map((map, index) => ({
    label: map.transition?.label || `Map ${index + 1}`,
    mapName: map.summary?.mapName || map.transition?.mapName || `Map ${index + 1}`,
    mapImage: map.summary?.mapImage || '',
    leftMapScore: map.summary?.leftMapScore ?? 0,
    rightMapScore: map.summary?.rightMapScore ?? 0,
  }))
  const rounds = sourceManifest.maps.map((map) =>
    Number(map.summary?.leftMapScore || 0) + Number(map.summary?.rightMapScore || 0),
  )
  const totalRounds = rounds.reduce((total, count) => total + count, 0)
  const aggregateTeamStats = (side) => {
    const stats = sourceManifest.maps.map((map) => map.summary?.[`${side}TeamStats`] || {})
    const kda = stats.reduce(
      (totals, item) => {
        const values = String(item.kda || '0/0/0').split('/').map((value) => Number(value) || 0)
        return totals.map((total, index) => total + values[index])
      },
      [0, 0, 0],
    )
    const weighted = (field, digits = 1) =>
      Number(
        (
          stats.reduce((total, item, index) => total + (Number.parseFloat(item[field]) || 0) * rounds[index], 0) /
          totalRounds
        ).toFixed(digits),
      )

    return {
      kda: kda.join('/'),
      acs: weighted('acs'),
      adr: weighted('adr'),
      kast: `${weighted('kast')}%`,
    }
  }

  return {
    transition: {
      leftTeamName: 'EDG',
      rightTeamName: 'XLG',
      leftTeamLogo: 'image/team-logos/EDG.jpg',
      rightTeamLogo: 'image/team-logos/XLG.jpg',
      leftScore: 3,
      rightScore: 2,
      mapName: '整场总结',
      label: 'Summary',
      duration: 4,
      theme: 'white-red',
    },
    summary: {
      type: 'series',
      label: 'Summary',
      leftTeamName: 'EDG',
      rightTeamName: 'XLG',
      leftTeamLogo: 'image/team-logos/EDG.jpg',
      rightTeamLogo: 'image/team-logos/XLG.jpg',
      leftScore: 3,
      rightScore: 2,
      summaryTitle: '整场总结',
      summaryText: '',
      theme: 'white-red',
      duration: 5,
      leftTeamStats: aggregateTeamStats('left'),
      rightTeamStats: aggregateTeamStats('right'),
      mapResults,
    },
    items: rankedPlayers.map((player) => `exports/summary_${player.characterName}.json`),
  }
}
