import { AbsoluteFill, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import { useState } from 'react'

const DEFAULT_DURATION_SECONDS = 3
const ENTRY_DELAY_SECONDS = 1

const themeTokens = {
  esports: {
    background: '#ffffff',
    text: '#111827',
    muted: '#6b7280',
    accent: '#800020',
    cream: '#F9F7EA',
    line: 'rgba(128, 0, 32, 0.15)',
    shadow: 'rgba(15, 23, 42, 0.18)',
  },
}

export function MapScoreTransition(inputProps) {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()
  const props = normalizeMapScoreProps(inputProps)
  const theme = themeTokens[props.theme] || themeTokens.esports
  const durationSeconds = props.duration || durationInFrames / fps
  const fadeIn = progressBetween(frame, fps, 0, 0.5)
  const fadeOutStart = Math.max(0, durationSeconds - 0.3)
  const fadeOut = 1 - progressBetween(frame, fps, fadeOutStart, durationSeconds)
  const sceneOpacity = fadeIn * fadeOut
  const logoProgress = progressBetween(frame, fps, 0.3, 0.8 + ENTRY_DELAY_SECONDS)
  const scoreProgress = progressBetween(frame, fps, 0.8 + ENTRY_DELAY_SECONDS, 1.2 + ENTRY_DELAY_SECONDS)
  const labelProgress = progressBetween(frame, fps, 0.45, 0.9 + ENTRY_DELAY_SECONDS)

  return (
    <AbsoluteFill
      style={{
        background: theme.background,
        color: theme.text,
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        opacity: sceneOpacity,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: '92px 120px 84px',
          display: 'grid',
          gridTemplateColumns: '430px 1fr 430px',
          alignItems: 'center',
          gap: 54,
        }}
      >
        <TeamPanel
          align="left"
          logo={props.leftTeamLogo}
          name={props.leftTeamName}
          progress={logoProgress}
          theme={theme}
        />
        <ScorePanel
          leftTeamName={props.leftTeamName}
          rightTeamName={props.rightTeamName}
          leftScore={props.leftScore}
          rightScore={props.rightScore}
          label={props.label}
          progress={scoreProgress}
          labelProgress={labelProgress}
          theme={theme}
        />
        <TeamPanel
          align="right"
          logo={props.rightTeamLogo}
          name={props.rightTeamName}
          progress={logoProgress}
          theme={theme}
        />
      </div>
    </AbsoluteFill>
  )
}

function TeamPanel({ align, logo, name, progress, theme }) {
  const direction = align === 'left' ? -1 : 1
  const translateX = interpolate(easeOut(progress), [0, 1], [direction * 260, 0])
  const scale = interpolate(easeOut(progress), [0, 1], [0.82, 1])
  const opacity = progress

  return (
    <section
      style={{
        display: 'grid',
        justifyItems: 'center',
        alignContent: 'center',
        gap: 30,
        opacity,
        transform: `translateX(${translateX}px) scale(${scale})`,
        transformOrigin: align === 'left' ? '70% 50%' : '30% 50%',
      }}
    >
      <LogoBox logo={logo} name={name} theme={theme} />
      <strong
        style={{
          maxWidth: 420,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          color: theme.text,
          fontSize: 72,
          fontWeight: 950,
          lineHeight: 1,
          letterSpacing: 0,
          textAlign: 'center',
        }}
      >
        {name}
      </strong>
    </section>
  )
}

function LogoBox({ logo, name, theme }) {
  const [hasError, setHasError] = useState(false)
  const source = logo && !hasError ? resolveLogoSource(logo) : ''

  return (
    <div
      style={{
        width: 340,
        height: 340,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 34,
        borderRadius: 34,
        background: '#ffffff',
        border: `2px solid ${theme.line}`,
        boxShadow: `0 30px 80px ${theme.shadow}`,
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
            borderRadius: 24,
            background: theme.accent,
            color: theme.cream,
            fontSize: initialsFontSize(name),
            fontWeight: 950,
            lineHeight: 1,
            letterSpacing: 0,
          }}
        >
          {getTeamInitials(name)}
        </span>
      )}
    </div>
  )
}

function ScorePanel({
  leftTeamName,
  rightTeamName,
  leftScore,
  rightScore,
  label,
  progress,
  labelProgress,
  theme,
}) {
  const eased = easeOutBack(progress)
  const scale = interpolate(eased, [0, 1], [0.72, 1])
  const translateY = interpolate(easeOut(progress), [0, 1], [34, 0])

  return (
    <main
      style={{
        display: 'grid',
        justifyItems: 'center',
        alignContent: 'center',
        gap: 30,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          minHeight: 54,
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          opacity: labelProgress,
          transform: `translateY(${interpolate(easeOut(labelProgress), [0, 1], [16, 0])}px)`,
        }}
      >
        {label ? <MetaPill text={label} theme={theme} /> : null}
      </div>
      <div
        style={{
          display: 'grid',
          gap: 24,
          justifyItems: 'center',
          opacity: progress,
          transform: `translateY(${translateY}px) scale(${scale})`,
          transformOrigin: '50% 50%',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(150px, 1fr) auto minmax(150px, 1fr)',
            alignItems: 'center',
            justifyItems: 'center',
            gap: 24,
            width: 700,
            color: theme.accent,
            lineHeight: 1,
          }}
        >
          <strong style={teamNameStyle('right')}>{leftTeamName}</strong>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '132px 48px 132px',
              alignItems: 'center',
              justifyItems: 'center',
              color: theme.text,
              fontSize: 158,
              fontWeight: 950,
              letterSpacing: 0,
            }}
          >
            <span>{leftScore}</span>
            <span style={{ color: theme.accent }}>:</span>
            <span>{rightScore}</span>
          </div>
          <strong style={teamNameStyle('left')}>{rightTeamName}</strong>
        </div>
        <div
          style={{
            width: 560,
            height: 12,
            borderRadius: 999,
            background: theme.accent,
            boxShadow: `0 14px 30px ${theme.shadow}`,
          }}
        />
      </div>
    </main>
  )
}

function MetaPill({ text, theme }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 132,
        height: 46,
        padding: '0 22px',
        borderRadius: 999,
        background: theme.accent,
        border: 'none',
        color: theme.cream,
        fontSize: 24,
        fontWeight: 950,
        lineHeight: 1,
        letterSpacing: 0,
        boxShadow: `0 12px 28px ${theme.shadow}`,
      }}
    >
      {text}
    </span>
  )
}

function normalizeMapScoreProps(inputProps = {}) {
  return {
    leftTeamName: normalizeTeamName(inputProps.leftTeamName, 'EDG'),
    rightTeamName: normalizeTeamName(inputProps.rightTeamName, 'JDG'),
    leftTeamLogo: normalizeText(inputProps.leftTeamLogo),
    rightTeamLogo: normalizeText(inputProps.rightTeamLogo),
    leftScore: normalizeScore(inputProps.leftScore, 1),
    rightScore: normalizeScore(inputProps.rightScore, 0),
    mapName: normalizeText(inputProps.mapName),
    label: normalizeText(inputProps.label || 'Map 1'),
    duration: normalizeDuration(inputProps.duration),
    theme: normalizeText(inputProps.theme || 'esports'),
  }
}

function normalizeDuration(value) {
  const duration = Number(value)
  if (!Number.isFinite(duration) || duration <= 0) return DEFAULT_DURATION_SECONDS
  return Math.max(1, Math.min(12, duration))
}

function normalizeScore(value, fallback) {
  if (value === null || value === undefined || value === '') return String(fallback)
  return String(value).trim()
}

function normalizeTeamName(value, fallback) {
  return normalizeText(value) || fallback
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function resolveLogoSource(value) {
  if (/^(data:image\/|https?:\/\/|blob:|\/)/i.test(value)) return value
  return staticFile(value.replace(/^public\//, ''))
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

function getTeamInitials(name) {
  const cleanName = normalizeText(name)
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

function initialsFontSize(name) {
  return getTeamInitials(name).length > 3 ? 82 : 104
}

function teamNameStyle(textAlign) {
  return {
    maxWidth: 176,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: 42,
    fontWeight: 950,
    letterSpacing: 0,
    textAlign,
  }
}
