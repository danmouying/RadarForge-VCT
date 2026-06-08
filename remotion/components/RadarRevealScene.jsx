import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { CharacterReveal } from './CharacterReveal.jsx'
import { RadarChartSvg } from './RadarChartSvg.jsx'
import { timelineProgress } from '../utils/animation.js'
import { landscapeTemplateTokens } from '../../src/config/templateTokens.js'

export function RadarRevealScene({ scene, durationInFrames }) {
  const frame = useCurrentFrame()
  const characterProgress = timelineProgress(frame, durationInFrames, 0.02, 0.24)
  const radarGridProgress = timelineProgress(frame, durationInFrames, 0.08, 0.28)
  const radarDataProgress = timelineProgress(frame, durationInFrames, 0.14, 0.46)
  const theme = scene.theme

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.canvas,
        color: theme.text,
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        overflow: 'hidden',
      }}
    >
      {scene.matchInfo ? <TeamBar matchInfo={scene.matchInfo} /> : null}
      <BattlePowerBadge rank={scene.battleRank} power={scene.battlePower} />
      <CharacterReveal
        image={scene.characterImage}
        name={scene.characterName}
        hupuRating={scene.hupuRating}
        kda={scene.kda}
        heroIcons={scene.heroIcons}
        heroIconLayout={scene.heroIconLayout}
        hupuRatingTemplate={scene.hupuRatingTemplate}
        hupuRatingImage={scene.hupuRatingImage}
        progress={characterProgress}
        theme={theme}
      />
      <RadarChartSvg
        dimensions={scene.dimensions}
        values={scene.values}
        progress={radarDataProgress}
        gridProgress={radarGridProgress}
        theme={theme}
        color={scene.characterColor}
      />
    </AbsoluteFill>
  )
}

function BattlePowerBadge({ rank, power }) {
  const badge = landscapeTemplateTokens.battlePower

  return (
    <div
      style={{
        position: 'absolute',
        top: badge.top,
        left: badge.left,
        width: badge.width,
        height: badge.height,
        display: 'grid',
        alignContent: 'center',
        gap: 4,
        boxSizing: 'border-box',
        padding: `0 ${badge.paddingX}px`,
        border: '1px solid rgba(15,23,42,0.12)',
        borderRadius: badge.radius,
        background: badge.background,
        color: badge.color,
        boxShadow: '0 12px 28px rgba(15,23,42,0.13)',
        lineHeight: 1,
        zIndex: 5,
      }}
    >
      <span
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontSize: badge.titleFontSize,
          fontWeight: 900,
          letterSpacing: 0,
        }}
      >
        战力表
      </span>
      <strong
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          color: badge.accent,
          fontSize: badge.rankFontSize,
          fontWeight: 950,
          lineHeight: 0.95,
          letterSpacing: 0,
        }}
      >
        {rank || '#1'}
      </strong>
      <span
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontSize: badge.valueFontSize,
          fontWeight: 900,
          letterSpacing: 0,
        }}
      >
        战斗力 {power || '--'}
      </span>
    </div>
  )
}

function TeamBar({ matchInfo }) {
  const bar = landscapeTemplateTokens.teamBar
  const width = landscapeTemplateTokens.width * bar.widthRatio
  const left = (landscapeTemplateTokens.width - width) / 2
  const scoreNumberWidth = bar.scoreFontSize * 0.62
  const colonWidth = bar.scoreFontSize * 0.24
  const scoreHalfWidth = scoreNumberWidth + colonWidth / 2
  const centerX = width / 2

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left,
        width,
        height: bar.height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: bar.background,
        color: bar.color,
        boxShadow: '0 10px 18px rgba(15,23,42,0.12)',
        zIndex: 5,
      }}
    >
      <strong
        style={{
          position: 'absolute',
          right: centerX + scoreHalfWidth + bar.teamGap,
          maxWidth: width * 0.36,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontSize: bar.teamFontSize,
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: 0,
          textAlign: 'right',
        }}
      >
        {matchInfo.leftTeam || 'EDG'}
      </strong>
      <div
        style={{
          position: 'absolute',
          left: centerX - scoreHalfWidth,
          width: scoreHalfWidth * 2,
          display: 'grid',
          gridTemplateColumns: `${scoreNumberWidth}px ${colonWidth}px ${scoreNumberWidth}px`,
          alignItems: 'center',
          justifyItems: 'center',
          fontSize: bar.scoreFontSize,
          fontWeight: 900,
          lineHeight: 1,
        }}
      >
        <span>{matchInfo.leftScore || '0'}</span>
        <span>:</span>
        <span>{matchInfo.rightScore || '0'}</span>
      </div>
      <strong
        style={{
          position: 'absolute',
          left: centerX + scoreHalfWidth + bar.teamGap,
          maxWidth: width * 0.36,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontSize: bar.teamFontSize,
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: 0,
          textAlign: 'left',
        }}
      >
        {matchInfo.rightTeam || 'JDG'}
      </strong>
    </div>
  )
}
