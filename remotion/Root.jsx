import { Composition } from 'remotion'
import { MapSummaryCard } from './components/MapSummaryCard.jsx'
import { MapScoreTransition } from './components/MapScoreTransition.tsx'
import { SeriesSummaryCard } from './components/SeriesSummaryCard.jsx'
import { RadarBatchSequenceLandscape } from './compositions/RadarBatchSequenceLandscape.jsx'
import { RadarRevealLandscape } from './compositions/RadarRevealLandscape.jsx'
import {
  normalizeMapSummaryProps,
  normalizeRadarBatchProps,
  normalizeRadarVideoProps,
  normalizeSeriesSummaryProps,
} from './utils/dataAdapter.js'

const FPS = 30
const DEFAULT_MAP_SCORE_DURATION_SECONDS = 3
const DEFAULT_MAP_SUMMARY_DURATION_SECONDS = 4
const DEFAULT_DURATION_SECONDS = 8
const DEFAULT_BATCH_DURATION_SECONDS = 5

const defaultProps = normalizeRadarVideoProps({
  title: 'RadarForge 能力雷达视频',
  subtitle: '数据可视化生成演示',
  theme: 'esports',
  duration: DEFAULT_DURATION_SECONDS,
  characterName: '对象 A',
  characterTag: '角色',
  matchLeftTeam: 'EDG',
  matchLeftScore: '2',
  matchRightScore: '1',
  matchRightTeam: 'JDG',
  battleRank: '#1',
  battlePower: '9876',
  kda: '1/3/3',
  heroIcons: [],
  heroIconLayout: 'grid',
  hupuRatingTemplate: 'classic',
  hupuRatingImage: '',
  dimensions: ['内容选题', '视觉冲击', '叙事节奏', '传播潜力', '信息密度', '商业转化'],
  values: [86, 78, 82, 91, 74, 69],
  characterImage: '',
})

export function RemotionRoot() {
  const defaultBatchProps = normalizeRadarBatchProps({
    title: defaultProps.title,
    items: [{ ...defaultProps, duration: DEFAULT_BATCH_DURATION_SECONDS }],
  })
  const defaultMapScoreProps = {
    leftTeamName: 'EDG',
    rightTeamName: 'XLG',
    leftTeamLogo: 'image/team-logos/EDG.jpg',
    rightTeamLogo: 'image/team-logos/XLG.jpg',
    leftScore: 1,
    rightScore: 0,
    mapName: 'Fracture',
    label: 'Map 1',
    duration: DEFAULT_MAP_SCORE_DURATION_SECONDS,
    theme: 'esports',
  }
  const defaultMapSummaryProps = normalizeMapSummaryProps({
    leftTeamName: 'EDG',
    rightTeamName: 'XLG',
    leftTeamLogo: 'image/team-logos/EDG.jpg',
    rightTeamLogo: 'image/team-logos/XLG.jpg',
    leftMapScore: 6,
    rightMapScore: 13,
    mapName: '深海明珠',
    mapImage: 'image/maps/深海明珠.jpg',
    summaryTitle: '深海明珠',
    summaryText: '',
    roundEvents: [
      { round: 1, winner: 'XLG', method: 'elimination' },
      { round: 2, winner: 'EDG', method: 'defuse' },
      { round: 3, winner: 'XLG', method: 'detonation' },
      { round: 4, winner: 'XLG', method: 'elimination' },
      { round: 5, winner: 'EDG', method: 'elimination' },
      { round: 6, winner: 'XLG', method: 'elimination' },
      { round: 7, winner: 'XLG', method: 'defuse' },
      { round: 8, winner: 'EDG', method: 'elimination' },
      { round: 9, winner: 'XLG', method: 'detonation' },
      { round: 10, winner: 'EDG', method: 'elimination' },
      { round: 11, winner: 'XLG', method: 'elimination' },
      { round: 12, winner: 'XLG', method: 'elimination' },
      { round: 13, winner: 'XLG', method: 'elimination' },
      { round: 14, winner: 'EDG', method: 'defuse' },
      { round: 15, winner: 'XLG', method: 'detonation' },
      { round: 16, winner: 'EDG', method: 'elimination' },
      { round: 17, winner: 'XLG', method: 'elimination' },
      { round: 18, winner: 'XLG', method: 'elimination' },
      { round: 19, winner: 'XLG', method: 'detonation' },
    ],
    leftTeamStats: {
      kda: '56/79/32',
      acs: 171,
      adr: 112.8,
      kast: '64%',
    },
    rightTeamStats: {
      kda: '79/56/40',
      acs: 225,
      adr: 148.6,
      kast: '77%',
    },
    duration: DEFAULT_MAP_SUMMARY_DURATION_SECONDS,
    theme: 'white-red',
  })
  const defaultSeriesSummaryProps = normalizeSeriesSummaryProps({
    type: 'series',
    label: 'Summary',
    leftTeamName: 'EDG',
    rightTeamName: 'XLG',
    leftTeamLogo: 'image/team-logos/EDG.jpg',
    rightTeamLogo: 'image/team-logos/XLG.jpg',
    leftScore: 3,
    rightScore: 2,
    summaryTitle: '整场总结',
    leftTeamStats: { kda: '312/288/156', acs: 205, adr: 134.8, kast: '72%' },
    rightTeamStats: { kda: '288/312/170', acs: 198, adr: 129.4, kast: '70%' },
    mapResults: [
      { label: 'Map 1', mapName: '裂变峡谷', mapImage: 'image/maps/裂变峡谷.jpg', leftMapScore: 9, rightMapScore: 13 },
      { label: 'Map 2', mapName: '霓虹町', mapImage: 'image/maps/霓虹町.jpg', leftMapScore: 13, rightMapScore: 9 },
      { label: 'Map 3', mapName: '微风岛屿', mapImage: 'image/maps/微风岛屿.jpg', leftMapScore: 13, rightMapScore: 11 },
      { label: 'Map 4', mapName: '隐士修所', mapImage: 'image/maps/隐士修所.jpg', leftMapScore: 9, rightMapScore: 13 },
      { label: 'Map 5', mapName: '深海明珠', mapImage: 'image/maps/深海明珠.jpg', leftMapScore: 13, rightMapScore: 6 },
    ],
    duration: 5,
    theme: 'white-red',
  })

  return (
    <>
      <Composition
        id="MapScoreTransition"
        component={MapScoreTransition}
        fps={FPS}
        width={1920}
        height={1080}
        durationInFrames={DEFAULT_MAP_SCORE_DURATION_SECONDS * FPS}
        defaultProps={defaultMapScoreProps}
        calculateMetadata={({ props }) => {
          const duration = Number(props.duration)
          const normalizedDuration = Number.isFinite(duration) && duration > 0 ? Math.max(1, Math.min(12, duration)) : DEFAULT_MAP_SCORE_DURATION_SECONDS

          return {
            durationInFrames: normalizedDuration * FPS,
            props: {
              ...defaultMapScoreProps,
              ...props,
              duration: normalizedDuration,
            },
          }
        }}
      />
      <Composition
        id="MapSummaryCard"
        component={MapSummaryCard}
        fps={FPS}
        width={1920}
        height={1080}
        durationInFrames={DEFAULT_MAP_SUMMARY_DURATION_SECONDS * FPS}
        defaultProps={defaultMapSummaryProps}
        calculateMetadata={({ props }) => {
          const normalizedProps = normalizeMapSummaryProps(props)

          return {
            durationInFrames: normalizedProps.duration * FPS,
            props: normalizedProps,
          }
        }}
      />
      <Composition
        id="SeriesSummaryCard"
        component={SeriesSummaryCard}
        fps={FPS}
        width={1920}
        height={1080}
        durationInFrames={5 * FPS}
        defaultProps={defaultSeriesSummaryProps}
        calculateMetadata={({ props }) => {
          const normalizedProps = normalizeSeriesSummaryProps(props)

          return {
            durationInFrames: normalizedProps.duration * FPS,
            props: normalizedProps,
          }
        }}
      />
      <Composition
        id="RadarRevealLandscape"
        component={RadarRevealLandscape}
        fps={FPS}
        width={1920}
        height={1080}
        durationInFrames={DEFAULT_DURATION_SECONDS * FPS}
        defaultProps={defaultProps}
        calculateMetadata={({ props }) => {
          const normalizedProps = normalizeRadarVideoProps(props)

          return {
            durationInFrames: normalizedProps.duration * FPS,
            props: normalizedProps,
          }
        }}
      />
      <Composition
        id="RadarBatchSequenceLandscape"
        component={RadarBatchSequenceLandscape}
        fps={FPS}
        width={1920}
        height={1080}
        durationInFrames={DEFAULT_BATCH_DURATION_SECONDS * FPS}
        defaultProps={defaultBatchProps}
        calculateMetadata={({ props }) => {
          const normalizedProps = normalizeRadarBatchProps(props)

          return {
            durationInFrames: normalizedProps.totalDurationInFrames,
            props: normalizedProps,
          }
        }}
      />
    </>
  )
}
