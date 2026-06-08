/**
 * RadarRevealLandscape accepts either this normalized shape or a RadarForge
 * project JSON snapshot. It renders a single target person.
 *
 * {
 *   title: string,
 *   subtitle?: string,
 *   theme?: string | object,
 *   duration?: 5 | 8 | 10,
 *   characterName?: string,
 *   characterTag?: string,
 *   characterImage?: string,
 *   teamName?: string,
 *   matchLeftTeam?: string,
 *   matchLeftScore?: string,
 *   matchRightScore?: string,
 *   matchRightTeam?: string,
 *   battleRank?: '#1' | '#2' | '#3' | '#4' | '#5' | '#6' | '#7' | '#8' | '#9' | '#10',
 *   battlePower?: string,
 *   kda?: string,
 *   heroIcons?: string[],
 *   heroIconLayout?: 'grid' | 'single',
 *   hupuRatingTemplate?: 'classic' | 'jrs',
 *   hupuRatingImage?: string,
 *   hupuRating?: string,
 *   dimensions: string[] | { name: string }[],
 *   values?: number[],
 *   scores?: number[],
 *   data?: number[],
 *   person?: { name: string, color?: string, values?: number[], scores?: number[], data?: number[], portraitImage?: string, kda?: string, heroIcons?: string[], heroIconLayout?: 'grid' | 'single', hupuRatingTemplate?: 'classic' | 'jrs', hupuRatingImage?: string, hupuRating?: string },
 *   people?: { name: string, color?: string, values?: number[], scores?: number[], data?: number[], portraitImage?: string, kda?: string, heroIcons?: string[], heroIconLayout?: 'grid' | 'single', hupuRatingTemplate?: 'classic' | 'jrs', hupuRatingImage?: string, hupuRating?: string }[],
 *   characters?: { name: string, color?: string, values?: number[], scores?: number[], data?: number[], portraitImage?: string }[]
 * }
 *
 * RadarBatchSequenceLandscape accepts:
 *
 * {
 *   title?: string,
 *   items: Array<RadarRevealLandscapeProps>
 * }
 *
 * Or an episode map manifest shape:
 *
 * {
 *   title?: string,
 *   maps: Array<{
 *     transition: {
 *       leftTeamName: string,
 *       rightTeamName: string,
 *       leftTeamLogo?: string,
 *       rightTeamLogo?: string,
 *       leftScore: string | number,
 *       rightScore: string | number,
 *       mapName?: string,
 *       label?: string,
 *       duration?: number,
 *       theme?: 'esports' | 'white-red'
 *     },
 *     summary?: {
 *       leftTeamName: string,
 *       rightTeamName: string,
 *       leftTeamLogo?: string,
 *       rightTeamLogo?: string,
 *       leftMapScore: string | number,
 *       rightMapScore: string | number,
 *       mapName?: string,
 *       mapImage?: string,
 *       summaryTitle?: string,
 *       summaryText?: string,
 *       leftStartingSide?: 'attack' | 'defense',
 *       rightStartingSide?: 'attack' | 'defense',
 *       roundEvents?: Array<{
 *         round: number,
 *         winner: string,
 *         method: 'elimination' | 'defuse' | 'detonation' | 'time',
 *         icon?: string,
 *         winnerSide?: 'attack' | 'attacking' | 'atk' | 'defense' | 'defensive' | 'def',
 *         winnerColor?: 'red' | 'blue'
 *       }>,
 *       leftTeamStats?: { kda?: string, acs?: string | number, adr?: string | number, kast?: string },
 *       rightTeamStats?: { kda?: string, acs?: string | number, adr?: string | number, kast?: string },
 *       duration?: number,
 *       theme?: 'white-red'
 *     },
 *     items: Array<RadarRevealLandscapeProps>
 *   }>
 * }
 *
 * Each legacy item defaults to 5 seconds if it does not include duration. In
 * maps mode, the batch composition renders one MapScoreTransition, an optional
 * MapSummaryCard or SeriesSummaryCard when `summary` is present, then each map's radar items. Radar
 * items inside each map are sorted from low to high by rankScore / score /
 * hupuRating, falling back to average radar value.
 */
export const radarVideoPropsVersion = 1
