import { interpolate } from 'remotion'

export function LandscapeTitleBlock({ title, subtitle, progress, theme }) {
  return (
    <header
      style={{
        position: 'absolute',
        top: 76,
        left: 92,
        right: 92,
        transform: `translateY(${interpolate(progress, [0, 1], [18, 0])}px)`,
        opacity: progress,
      }}
    >
      <div
        style={{
          color: theme.accent,
          fontSize: 24,
          fontWeight: 800,
          letterSpacing: 0,
          marginBottom: 14,
        }}
      >
        RADAR REVEAL
      </div>
      <h1
        style={{
          margin: 0,
          color: theme.text,
          fontSize: 72,
          lineHeight: 1.04,
          fontWeight: 900,
          letterSpacing: 0,
        }}
      >
        {title}
      </h1>
      <p
        style={{
          margin: '18px 0 0',
          color: theme.muted,
          fontSize: 30,
          lineHeight: 1.32,
          fontWeight: 600,
          letterSpacing: 0,
        }}
      >
        {subtitle}
      </p>
    </header>
  )
}
