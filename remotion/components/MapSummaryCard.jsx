import { AbsoluteFill, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import { useState } from 'react'
import { normalizeMapSummaryProps } from '../utils/dataAdapter.js'

const themeTokens = {
  'white-red': {
    background: '#ffffff',
    panel: '#ffffff',
    panelSoft: '#ffffff',
    border: '#e5e7eb',
    borderSoft: '#e5e7eb',
    text: '#111827',
    muted: '#6b7280',
    accent: '#e11d48',
    accentDark: '#be123c',
    shadow: 'rgba(15, 23, 42, 0.08)',
  },
}

const statLabels = [
  ['kda', 'KDA'],
  ['acs', 'ACS'],
  ['adr', 'ADR'],
  ['kast', 'KAST'],
]

const roundColorTokens = {
  red: {
    background: '#fff1f2',
    border: '#fecdd3',
    text: '#dc2626',
  },
  blue: {
    background: '#eff6ff',
    border: '#bfdbfe',
    text: '#2563eb',
  },
}

export function MapSummaryCard(inputProps) {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()
  const props = normalizeMapSummaryProps(inputProps)
  const theme = themeTokens[props.theme] || themeTokens['white-red']
  const durationSeconds = props.duration || durationInFrames / fps
  const fadeIn = progressBetween(frame, fps, 0, 0.45)
  const fadeOut = 1 - progressBetween(frame, fps, Math.max(0, durationSeconds - 0.35), durationSeconds)
  const teamProgress = progressBetween(frame, fps, 0.25, 0.9)
  const scoreProgress = progressBetween(frame, fps, 0.55, 1.05)
  const imageProgress = progressBetween(frame, fps, 0.75, 1.35)
  const textProgress = progressBetween(frame, fps, 1.05, 1.65)

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
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: '#ffffff',
        }}
      />
      <Header title={props.summaryTitle} theme={theme} />
      <div
        style={{
          position: 'absolute',
          left: 72,
          right: 72,
          top: 186,
          bottom: 82,
          display: 'grid',
          gridTemplateColumns: '370px 1fr 370px',
          gap: 48,
          alignItems: 'stretch',
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
        <CenterPanel
          props={props}
          scoreProgress={scoreProgress}
          imageProgress={imageProgress}
          textProgress={textProgress}
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

function Header({ title, theme }) {
  return (
    <header
      style={{
        position: 'absolute',
        top: 62,
        left: 104,
        right: 104,
        height: 88,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: `4px solid ${theme.accent}`,
      }}
    >
      <h1
        style={{
          margin: 0,
          maxWidth: '100%',
          color: theme.text,
          fontSize: 66,
          fontWeight: 1000,
          lineHeight: 1,
          letterSpacing: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          textAlign: 'center',
        }}
      >
        {title}
      </h1>
    </header>
  )
}

function TeamStatsPanel({ align, name, logo, stats, progress, theme }) {
  const direction = align === 'left' ? -1 : 1
  const eased = easeOut(progress)
  const translateX = interpolate(eased, [0, 1], [direction * 86, 0])

  return (
    <section
      style={{
        display: 'grid',
        gridTemplateRows: 'auto 1fr',
        gap: 22,
        opacity: progress,
        transform: `translateX(${translateX}px)`,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '94px 1fr',
          gap: 18,
          alignItems: 'center',
          minHeight: 118,
          padding: '18px 20px',
          borderRadius: 8,
          background: theme.panel,
          border: `2px solid ${theme.border}`,
          boxShadow: `0 16px 40px ${theme.shadow}`,
          boxSizing: 'border-box',
        }}
      >
        <LogoBox logo={logo} name={name} theme={theme} />
        <strong
          style={{
            color: theme.text,
            fontSize: 42,
            fontWeight: 950,
            lineHeight: 1,
            letterSpacing: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            textAlign: align,
          }}
        >
          {name}
        </strong>
      </div>
      <div
        style={{
          display: 'grid',
          gap: 15,
          alignContent: 'start',
          padding: 24,
          borderRadius: 8,
          background: theme.panel,
          border: `2px solid ${theme.borderSoft}`,
          boxShadow: `0 16px 40px ${theme.shadow}`,
        }}
      >
        {statLabels.map(([key, label]) => (
          <StatRow key={key} statKey={key} label={label} value={stats[key]} theme={theme} />
        ))}
      </div>
    </section>
  )
}

function CenterPanel({ props, scoreProgress, imageProgress, textProgress, theme }) {
  const scoreScale = interpolate(easeOutBack(scoreProgress), [0, 1], [0.82, 1])
  const imageScale = interpolate(easeOut(imageProgress), [0, 1], [1.05, 1])

  return (
    <main
      style={{
        position: 'relative',
        display: 'grid',
        gridTemplateRows: '140px 156px 1fr',
        gap: 28,
        minWidth: 0,
      }}
    >
      <section
        style={{
          display: 'grid',
          justifyItems: 'center',
          alignContent: 'center',
          gap: 0,
          opacity: scoreProgress,
          transform: `scale(${scoreScale})`,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            alignItems: 'center',
            justifyItems: 'center',
            width: 710,
            maxWidth: '100%',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '120px 42px 120px',
              alignItems: 'center',
              justifyItems: 'center',
              color: theme.text,
              fontSize: 124,
              fontWeight: 950,
              lineHeight: 0.9,
              letterSpacing: 0,
            }}
          >
            <span>{props.leftMapScore}</span>
            <span style={{ color: theme.accent }}>:</span>
            <span>{props.rightMapScore}</span>
          </div>
        </div>
      </section>
      <div
        style={{
          alignSelf: 'center',
          justifySelf: 'center',
          width: '100%',
          maxWidth: '100%',
          minHeight: 156,
          opacity: textProgress,
          transform: `translateY(${interpolate(easeOut(textProgress), [0, 1], [18, 0])}px)`,
        }}
      >
        <RoundEventsTable
          events={props.roundEvents}
          leftTeamName={props.leftTeamName}
          rightTeamName={props.rightTeamName}
          leftStartingSide={props.leftStartingSide}
          rightStartingSide={props.rightStartingSide}
          theme={theme}
        />
      </div>
      <MapImage
        image={props.mapImage}
        mapName={props.mapName}
        opacity={imageProgress}
        scale={imageScale}
        theme={theme}
      />
    </main>
  )
}

function RoundEventsTable({ events, leftTeamName, rightTeamName, leftStartingSide, rightStartingSide, theme }) {
  const rounds = Array.isArray(events) ? events : []
  if (rounds.length === 0) return null

  const layout = getRoundEventsLayout(rounds.length)
  const rows = [
    { key: 'left', name: leftTeamName },
    { key: 'right', name: rightTeamName },
  ]

  return (
    <section
      style={{
        width: '100%',
        minHeight: 156,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `${layout.labelWidth}px repeat(${rounds.length}, ${layout.cellSize}px)`,
          columnGap: layout.gap,
          rowGap: layout.rowGap,
          alignItems: 'center',
          justifyContent: 'center',
          padding: '14px 18px',
          borderRadius: 8,
          background: '#ffffff',
          border: `2px solid ${theme.borderSoft}`,
          boxShadow: `0 14px 34px ${theme.shadow}`,
          boxSizing: 'border-box',
          maxWidth: '100%',
        }}
      >
        {rows.flatMap((row) => [
          <TeamRoundLabel key={`${row.key}-label`} name={row.name} theme={theme} />,
          ...rounds.map((event) => (
            <RoundEventCell
              key={`${row.key}-${event.round}`}
              event={event}
              teamName={row.name}
              leftTeamName={leftTeamName}
              rightTeamName={rightTeamName}
              leftStartingSide={leftStartingSide}
              rightStartingSide={rightStartingSide}
              cellSize={layout.cellSize}
              iconSize={layout.iconSize}
              theme={theme}
            />
          )),
        ])}
      </div>
    </section>
  )
}

function TeamRoundLabel({ name, theme }) {
  return (
    <strong
      style={{
        color: theme.text,
        fontSize: 22,
        fontWeight: 950,
        lineHeight: 1,
        letterSpacing: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        textAlign: 'right',
      }}
    >
      {getInitials(name)}
    </strong>
  )
}

function RoundEventCell({
  event,
  teamName,
  leftTeamName,
  rightTeamName,
  leftStartingSide,
  rightStartingSide,
  cellSize,
  iconSize,
  theme,
}) {
  const [sourceIndex, setSourceIndex] = useState(0)
  const isWinner = isSameTeam(event.winner, teamName)
  const winnerColor = getRoundWinnerColor(event, leftTeamName, rightTeamName, leftStartingSide, rightStartingSide)
  const method = event.method
  const sources = isWinner ? getRoundEventSources(event.icon, method, winnerColor) : []
  const source = sources[sourceIndex] ? resolveAssetSource(sources[sourceIndex]) : ''
  const roundLabel = formatRoundNumber(event.round)
  const winnerColorStyle = winnerColor === 'blue' ? roundColorTokens.blue : roundColorTokens.red

  return (
    <div
      title={`Round ${event.round}`}
      style={{
        width: cellSize,
        height: cellSize,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
        background: isWinner ? winnerColorStyle.background : '#f8fafc',
        border: `1px solid ${isWinner ? winnerColorStyle.border : theme.borderSoft}`,
        boxSizing: 'border-box',
      }}
    >
      {!isWinner ? (
        <span
          style={{
            color: '#64748b',
            fontSize: clamp(Math.round(cellSize * 0.43), 10, 14),
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: 0,
          }}
        >
          {roundLabel}
        </span>
      ) : source ? (
        <img
          src={source}
          alt={`${method} round event`}
          onError={() => setSourceIndex((index) => index + 1)}
          style={{
            width: iconSize,
            height: iconSize,
            objectFit: 'contain',
            display: 'block',
          }}
        />
      ) : (
        <span
          style={{
            color: winnerColorStyle.text,
            fontSize: clamp(Math.round(cellSize * 0.36), 9, 12),
            fontWeight: 950,
            lineHeight: 1,
            letterSpacing: 0,
          }}
        >
          {getRoundMethodFallback(method)}
        </span>
      )}
    </div>
  )
}

function StatRow({ statKey, label, value, theme }) {
  const isKda = statKey === 'kda'

  return (
    <div
      style={{
        minHeight: 74,
        display: 'grid',
        gridTemplateColumns: isKda ? '70px minmax(0, 1fr)' : '78px minmax(0, 1fr)',
        alignItems: 'center',
        gap: 12,
        padding: '0 12px',
        borderRadius: 8,
        background: theme.panelSoft,
        border: `1px solid ${theme.borderSoft}`,
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 33,
          borderRadius: 6,
          background: theme.accent,
          color: '#ffffff',
          fontSize: 18,
          fontWeight: 950,
          lineHeight: 1,
          letterSpacing: 0,
        }}
      >
        {label}
      </span>
      <strong
        style={{
          color: theme.text,
          fontSize: isKda ? 30 : 32,
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: 0,
          overflow: 'visible',
          whiteSpace: 'nowrap',
          minWidth: 0,
        }}
      >
        {String(value || '-')}
      </strong>
    </div>
  )
}

function LogoBox({ logo, name, theme }) {
  const [hasError, setHasError] = useState(false)
  const source = logo && !hasError ? resolveAssetSource(logo) : ''

  return (
    <div
      style={{
        width: 94,
        height: 94,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        borderRadius: 8,
        background: '#ffffff',
        border: `1px solid ${theme.borderSoft}`,
        boxSizing: 'border-box',
      }}
    >
      {source ? (
        <img
          src={source}
          alt={`${name} logo`}
          onError={() => setHasError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      ) : (
        <span
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 6,
            background: theme.accent,
            color: '#ffffff',
            fontSize: getInitials(name).length > 3 ? 22 : 30,
            fontWeight: 950,
            lineHeight: 1,
            letterSpacing: 0,
          }}
        >
          {getInitials(name)}
        </span>
      )}
    </div>
  )
}

function MapImage({ image, mapName, opacity, scale, theme }) {
  const [hasError, setHasError] = useState(false)
  const source = image && !hasError ? resolveAssetSource(image) : ''

  return (
    <div
      style={{
        position: 'relative',
        alignSelf: 'stretch',
        justifySelf: 'center',
        width: 780,
        maxWidth: '100%',
        minHeight: 390,
        opacity,
        transform: `scale(${scale})`,
        borderRadius: 8,
        overflow: 'hidden',
        background: '#f8fafc',
        border: `2px solid ${theme.borderSoft}`,
        boxShadow: `0 16px 44px ${theme.shadow}`,
      }}
    >
      {source ? (
        <img
          src={source}
          alt={`${mapName} map`}
          onError={() => setHasError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      ) : (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            background: '#ffffff',
          }}
        >
          <strong
            style={{
              color: theme.accentDark,
              fontSize: 66,
              fontWeight: 950,
              lineHeight: 1,
              letterSpacing: 0,
            }}
          >
            {mapName || 'MAP'}
          </strong>
        </div>
      )}
    </div>
  )
}

function resolveAssetSource(value) {
  if (!value) return ''
  if (/^(data:image\/|https?:\/\/|blob:|\/)/i.test(value)) return value
  return staticFile(value.replace(/^public\//, ''))
}

function getRoundEventSources(icon, method, color = 'red') {
  const normalizedMethod = String(method || 'elimination').trim().toLowerCase()
  const normalizedColor = color === 'blue' ? 'blue' : 'red'
  const preferred = String(icon || `image/round-events/${normalizedMethod}_${normalizedColor}.jpg`).trim()
  const sources = []

  addUniqueSource(sources, preferred)
  if (/\.(png|jpe?g|webp)$/i.test(preferred)) {
    addUniqueSource(sources, preferred.replace(/\.(png|jpe?g|webp)$/i, '.jpg'))
    addUniqueSource(sources, preferred.replace(/\.(png|jpe?g|webp)$/i, '.jpeg'))
    addUniqueSource(sources, preferred.replace(/\.(png|jpe?g|webp)$/i, '.png'))
  }
  addUniqueSource(sources, `image/round-events/${normalizedMethod}_${normalizedColor}.jpg`)
  addUniqueSource(sources, `image/round-events/${normalizedMethod}_${normalizedColor}.jpeg`)
  addUniqueSource(sources, `image/round-events/${normalizedMethod}_${normalizedColor}.png`)
  addUniqueSource(sources, `image/round-events/${normalizedMethod}.jpg`)
  addUniqueSource(sources, `image/round-events/${normalizedMethod}.jpeg`)
  addUniqueSource(sources, `image/round-events/${normalizedMethod}.png`)

  return sources
}

function addUniqueSource(sources, source) {
  if (source && !sources.includes(source)) {
    sources.push(source)
  }
}

function getRoundEventsLayout(count) {
  const labelWidth = 72
  const availableWidth = 830 - labelWidth
  const gap = count >= 28 ? 4 : count >= 23 ? 5 : count >= 18 ? 6 : 8
  const rawCellSize = Math.floor((availableWidth - gap * Math.max(0, count - 1)) / Math.max(1, count))
  const cellSize = clamp(rawCellSize, 21, 32)

  return {
    labelWidth,
    gap,
    rowGap: count >= 28 ? 8 : 10,
    cellSize,
    iconSize: clamp(Math.round(cellSize * 0.68), 14, 22),
  }
}

function isSameTeam(a, b) {
  return normalizeTeamKey(a) === normalizeTeamKey(b)
}

function normalizeTeamKey(value) {
  return String(value || '').trim().toLowerCase()
}

function getRoundWinnerColor(event, leftTeamName, rightTeamName, leftStartingSide, rightStartingSide) {
  const explicitColor = normalizeRoundColor(event.winnerColor)
  if (explicitColor) return explicitColor

  const explicitSide = normalizeRoundSide(event.winnerSide)
  if (explicitSide) return sideToColor(explicitSide)

  const winnerSide = getTeamSideForRound(
    event.winner,
    event.round,
    leftTeamName,
    rightTeamName,
    leftStartingSide,
    rightStartingSide,
  )
  return sideToColor(winnerSide)
}

function getTeamSideForRound(teamName, round, leftTeamName, rightTeamName, leftStartingSide, rightStartingSide) {
  const isLeftTeam = isSameTeam(teamName, leftTeamName)
  const startingSide = normalizeRoundSide(isLeftTeam ? leftStartingSide : rightStartingSide) || (isLeftTeam ? 'defense' : 'attack')
  const roundNumber = Number(round)

  if (!Number.isFinite(roundNumber) || roundNumber <= 0) return startingSide
  if (roundNumber >= 25) {
    const baseSide = roundNumber % 2 === 1 ? startingSide : getOppositeSide(startingSide)
    return baseSide
  }
  if (roundNumber >= 13) return getOppositeSide(startingSide)
  return startingSide
}

function normalizeRoundSide(value) {
  const side = String(value || '').trim().toLowerCase()
  if (side === 'attack' || side === 'attacking' || side === 'atk') return 'attack'
  if (side === 'defense' || side === 'defensive' || side === 'def') return 'defense'
  return ''
}

function normalizeRoundColor(value) {
  const color = String(value || '').trim().toLowerCase()
  if (color === 'red' || color === 'attack' || color === 'attacking' || color === 'atk') return 'red'
  if (color === 'blue' || color === 'defense' || color === 'defensive' || color === 'def') return 'blue'
  return ''
}

function sideToColor(side) {
  return side === 'defense' ? 'blue' : 'red'
}

function getOppositeSide(side) {
  return side === 'defense' ? 'attack' : 'defense'
}

function formatRoundNumber(round) {
  return String(Number(round) || 0).padStart(2, '0')
}

function getRoundMethodFallback(method) {
  const normalizedMethod = String(method || '').trim().toLowerCase()
  if (normalizedMethod === 'defuse') return 'D'
  if (normalizedMethod === 'detonation') return 'B'
  if (normalizedMethod === 'time') return 'T'
  return 'K'
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function progressBetween(frame, fps, startSecond, endSecond) {
  const startFrame = startSecond * fps
  const endFrame = endSecond * fps
  if (endFrame <= startFrame) return 1

  return interpolate(frame, [startFrame, endFrame], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
}

function easeOut(value) {
  return 1 - Math.pow(1 - value, 3)
}

function easeOutBack(value) {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(value - 1, 3) + c1 * Math.pow(value - 1, 2)
}

function getInitials(name) {
  const cleanName = String(name || '').trim()
  if (!cleanName) return '--'
  const parts = cleanName.split(/\s+/).filter(Boolean)
  if (parts.length > 1) {
    return parts
      .map((part) => part[0])
      .join('')
      .slice(0, 3)
      .toUpperCase()
  }

  return cleanName.slice(0, 4).toUpperCase()
}
