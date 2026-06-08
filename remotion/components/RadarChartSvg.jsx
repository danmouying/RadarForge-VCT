import { interpolate } from 'remotion'
import { landscapeTemplateTokens } from '../../src/config/templateTokens.js'
import { buildRadarGeometry } from '../utils/radarGeometry.js'

export function RadarChartSvg({ dimensions, values, progress, gridProgress, theme, color }) {
  const tokens = landscapeTemplateTokens
  const radar = tokens.radar
  const chartColor = color || theme.chartLine
  const center = {
    x: tokens.width * radar.centerXRatio,
    y: tokens.height * radar.centerYRatio,
  }
  const radius = (Math.min(tokens.width, tokens.height) / 2) * radar.radiusRatio
  const geometry = buildRadarGeometry({
    dimensions,
    values,
    center,
    radius,
    labelOffset: radar.labelOffset,
    progress,
  })
  const hasOverCap = geometry.dataPoints.some((point) => point.overCap)
  const axisOpacity = interpolate(gridProgress, [0, 1], [0, 1])
  const polygonOpacity = interpolate(progress, [0, 1], [0, 0.8])
  const overColor = theme.accent2 || theme.scoreText || chartColor

  return (
    <svg
      width={tokens.width}
      height={tokens.height}
      viewBox={`0 0 ${tokens.width} ${tokens.height}`}
      style={{ position: 'absolute', inset: 0 }}
    >
      <g opacity={axisOpacity}>
        {geometry.grid.map((ring) => (
          <polygon
            key={ring.level}
            points={ring.points}
            fill={ring.level % 2 === 0 ? theme.splitAreaA : theme.splitAreaB}
            stroke={theme.splitLine}
            strokeWidth={radar.gridLineWidth}
          />
        ))}
        {geometry.axes.map((axis) => (
          <line
            key={axis.label}
            x1={geometry.center.x}
            y1={geometry.center.y}
            x2={axis.end.x}
            y2={axis.end.y}
            stroke={theme.splitLine}
            strokeWidth={radar.gridLineWidth}
          />
        ))}
        <polygon
          points={geometry.polygon}
          fill={chartColor}
          fillOpacity={polygonOpacity}
          stroke={hasOverCap ? overColor : chartColor}
          strokeWidth={hasOverCap ? radar.lineWidth + 2 : radar.lineWidth}
          strokeLinejoin="round"
          filter={hasOverCap ? "url(#overcap-glow)" : undefined}
        />
        {geometry.labelPoints.map((point) => (
          <g key={point.label} transform={`translate(${point.x} ${point.y})`}>
            <text
              textAnchor={point.anchor}
              dominantBaseline="middle"
              fill={theme.text}
              fontSize={radar.labelFontSize}
              fontWeight="800"
              letterSpacing="0"
            >
              {point.label}
            </text>
            <text
              y={radar.scoreOffset}
              textAnchor={point.anchor}
              dominantBaseline="middle"
              fill={point.overCap ? overColor : theme.scoreText}
              fontSize={point.overCap ? radar.scoreFontSize + 7 : radar.scoreFontSize}
              fontWeight="900"
              letterSpacing="0"
              filter={point.overCap ? "url(#overcap-glow)" : undefined}
            >
              {formatValue(point.value)}
            </text>
          </g>
        ))}
        <defs>
          <filter id="overcap-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </g>
    </svg>
  )
}

function formatValue(value) {
  return Number.isFinite(Number(value)) ? String(value) : ''
}
