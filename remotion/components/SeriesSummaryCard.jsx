import { AbsoluteFill, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import { useState } from 'react'
import { normalizeSeriesSummaryProps } from '../utils/dataAdapter.js'
import { getSeriesMapGridLayout } from '../utils/seriesMapLayout.js'

const themeTokens = {
  'white-red': {
    background: '#ffffff',
    panel: '#ffffff',
    border: '#e5e7eb',
    text: '#111827',
    muted: '#6b7280',
    accent: '#800020',
    cream: '#F9F7EA',
    shadow: 'rgba(15, 23, 42, 0.08)',
  },
}

const statLabels = [
  ['kda', 'KDA'],
  ['acs', 'ACS'],
  ['adr', 'ADR'],
  ['kast', 'KAST'],
]

export function SeriesSummaryCard(inputProps) {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()
  const props = normalizeSeriesSummaryProps(inputProps)
  const theme = themeTokens[props.theme] || themeTokens['white-red']
  const durationSeconds = props.duration || durationInFrames / fps
  const fadeIn = progressBetween(frame, fps, 0, 0.45)
  const fadeOut = 1 - progressBetween(frame, fps, Math.max(0, durationSeconds - 0.35), durationSeconds)
  const teamProgress = progressBetween(frame, fps, 0.2, 0.85)
  const centerProgress = progressBetween(frame, fps, 0.55, 1.35)

  return (
    <AbsoluteFill
      style={{
        background: theme.background,
        color: theme.text,
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        opacity: fadeIn * fadeOut,
        overflow: 'hidden',
      }}
    >
      <Header props={props} theme={theme} />
      <div
        style={{
          position: 'absolute',
          left: 64,
          right: 64,
          top: 208,
          bottom: 64,
          display: 'grid',
          gridTemplateColumns: '330px minmax(0, 1fr) 330px',
          gap: 34,
        }}
      >
        <TeamStatsPanel
          align="left"
          name={props.leftTeamName}
          logo={props.leftTeamLogo}
          stats={props.leftTeamStats}
          progress={teamProgress}
          theme={theme}
        />
        <MapResultsGrid
          results={props.mapResults}
          leftTeamName={props.leftTeamName}
          rightTeamName={props.rightTeamName}
          progress={centerProgress}
          theme={theme}
        />
        <TeamStatsPanel
          align="right"
          name={props.rightTeamName}
          logo={props.rightTeamLogo}
          stats={props.rightTeamStats}
          progress={teamProgress}
          theme={theme}
        />
      </div>
    </AbsoluteFill>
  )
}

function Header({ props, theme }) {
  return (
    <header
      style={{
        position: 'absolute',
        top: 48,
        left: 104,
        right: 104,
        height: 124,
        display: 'grid',
        alignContent: 'center',
        justifyItems: 'center',
        gap: 12,
        borderBottom: `4px solid ${theme.accent}`,
      }}
    >
      <h1 style={{ margin: 0, fontSize: 52, fontWeight: 1000, lineHeight: 1 }}>
        {props.summaryTitle}
      </h1>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 78px 38px 78px 1fr',
          alignItems: 'center',
          gap: 14,
          minWidth: 650,
          fontSize: 38,
          fontWeight: 950,
          lineHeight: 1,
        }}
      >
        <span style={{ textAlign: 'right', color: theme.accent }}>{props.leftTeamName}</span>
        <span style={{ textAlign: 'center', fontSize: 50 }}>{props.leftScore}</span>
        <span style={{ textAlign: 'center', color: theme.accent, fontSize: 44 }}>:</span>
        <span style={{ textAlign: 'center', fontSize: 50 }}>{props.rightScore}</span>
        <span style={{ textAlign: 'left', color: theme.accent }}>{props.rightTeamName}</span>
      </div>
    </header>
  )
}

function TeamStatsPanel({ align, name, logo, stats, progress, theme }) {
  const direction = align === 'left' ? -1 : 1
  const translateX = interpolate(easeOut(progress), [0, 1], [direction * 72, 0])

  return (
    <section
      style={{
        display: 'grid',
        gridTemplateRows: '118px 1fr',
        gap: 18,
        opacity: progress,
        transform: `translateX(${translateX}px)`,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '82px 1fr',
          gap: 16,
          alignItems: 'center',
          padding: 16,
          border: `2px solid ${theme.border}`,
          borderRadius: 10,
          boxShadow: `0 16px 40px ${theme.shadow}`,
          boxSizing: 'border-box',
        }}
      >
        <ImageWithFallback
          source={logo}
          fallback={getInitials(name)}
          alt={`${name} logo`}
          imageStyle={{ objectFit: 'contain' }}
          fallbackStyle={{ background: theme.accent, color: theme.cream }}
        />
        <strong
          style={{
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: 38,
            fontWeight: 950,
            textAlign: align,
          }}
        >
          {name}
        </strong>
      </div>
      <div
        style={{
          display: 'grid',
          alignContent: 'start',
          gap: 15,
          padding: 22,
          border: `2px solid ${theme.border}`,
          borderRadius: 10,
          boxShadow: `0 16px 40px ${theme.shadow}`,
        }}
      >
        {statLabels.map(([key, label]) => (
          <div
            key={key}
            style={{
              display: 'grid',
              gridTemplateColumns: '60px minmax(0, 1fr)',
              alignItems: 'center',
              gap: 8,
              minHeight: 76,
              padding: '0 16px',
              border: `2px solid ${theme.border}`,
              borderLeft: `6px solid ${theme.accent}`,
              borderRadius: 8,
              boxSizing: 'border-box',
            }}
          >
            <span style={{ color: theme.muted, fontSize: 22, fontWeight: 850 }}>{label}</span>
            <strong
              style={{
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: key === 'kda' ? 23 : 34,
                fontWeight: 950,
                textAlign: 'right',
              }}
            >
              {stats[key]}
            </strong>
          </div>
        ))}
      </div>
    </section>
  )
}

function MapResultsGrid({ results, leftTeamName, rightTeamName, progress, theme }) {
  const maps = results.length > 0 ? results : [{ label: 'Summary', mapName: '暂无地图数据' }]
  const layout = getSeriesMapGridLayout(maps.length)
  const translateY = interpolate(easeOut(progress), [0, 1], [24, 0])

  return (
    <main
      style={{
        display: 'grid',
        gridTemplateColumns: layout.columns,
        gridTemplateRows: layout.rows,
        gap: layout.gap,
        alignContent: 'center',
        justifyContent: 'center',
        minWidth: 0,
        opacity: progress,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {maps.map((map, index) => (
        <MapResultCard
          key={`${map.label}-${map.mapName}-${index}`}
          map={map}
          leftTeamName={leftTeamName}
          rightTeamName={rightTeamName}
          gridColumn={layout.positions[index]?.gridColumn}
          theme={theme}
        />
      ))}
    </main>
  )
}

function MapResultCard({ map, leftTeamName, rightTeamName, gridColumn, theme }) {
  return (
    <article
      style={{
        gridColumn,
        width: '100%',
        minWidth: 0,
        height: '100%',
        display: 'grid',
        gridTemplateRows: 'minmax(0, 1fr) auto',
        overflow: 'hidden',
        border: `2px solid ${theme.border}`,
        borderRadius: 10,
        background: theme.panel,
        boxShadow: `0 14px 34px ${theme.shadow}`,
      }}
    >
      <ImageWithFallback
        source={map.mapImage}
        fallback={map.mapName}
        alt={map.mapName}
        imageStyle={{ objectFit: 'cover' }}
        fallbackStyle={{ background: '#fff7f8', color: theme.accent }}
      />
      <div style={{ display: 'grid', gap: 7, padding: '13px 16px 15px', textAlign: 'center' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 10,
            color: theme.muted,
            fontSize: 17,
            fontWeight: 850,
            lineHeight: 1,
          }}
        >
          <span>{map.label}</span>
          <span>{map.mapName}</span>
        </div>
        <strong style={{ fontSize: 22, fontWeight: 950, lineHeight: 1.1 }}>
          {leftTeamName} {map.leftMapScore} <span style={{ color: theme.accent }}>:</span>{' '}
          {map.rightMapScore} {rightTeamName}
        </strong>
      </div>
    </article>
  )
}

function ImageWithFallback({ source, fallback, alt, imageStyle, fallbackStyle }) {
  const [hasError, setHasError] = useState(false)
  const resolvedSource = source && !hasError ? resolveImageSource(source) : ''

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        minHeight: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        ...fallbackStyle,
      }}
    >
      {resolvedSource ? (
        <img
          src={resolvedSource}
          alt={alt}
          onError={() => setHasError(true)}
          style={{ width: '100%', height: '100%', display: 'block', ...imageStyle }}
        />
      ) : (
        <strong style={{ padding: 16, fontSize: 28, fontWeight: 950, textAlign: 'center' }}>
          {fallback}
        </strong>
      )}
    </div>
  )
}

function resolveImageSource(source) {
  if (/^(data:|https?:|blob:)/i.test(source)) return source
  return staticFile(String(source).replace(/^\/+/, '').replace(/^public\//, ''))
}

function getInitials(name) {
  const text = String(name || '').trim()
  if (!text) return 'TEAM'
  if (/[\u3400-\u9fff]/.test(text)) return text.slice(0, 2)
  return text
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 4)
    .toUpperCase()
}

function progressBetween(frame, fps, startSeconds, endSeconds) {
  if (endSeconds <= startSeconds) return frame >= endSeconds * fps ? 1 : 0
  return interpolate(frame, [startSeconds * fps, endSeconds * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
}

function easeOut(value) {
  return 1 - (1 - value) ** 3
}
