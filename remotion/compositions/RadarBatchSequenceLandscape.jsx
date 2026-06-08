import { Series } from 'remotion'
import { MapSummaryCard } from '../components/MapSummaryCard.jsx'
import { MapScoreTransition } from '../components/MapScoreTransition.tsx'
import { RadarRevealScene } from '../components/RadarRevealScene.jsx'
import { SeriesSummaryCard } from '../components/SeriesSummaryCard.jsx'
import { normalizeRadarBatchProps } from '../utils/dataAdapter.js'

export function RadarBatchSequenceLandscape(inputProps) {
  const props = normalizeRadarBatchProps(inputProps)

  return (
    <Series>
      {props.sequenceItems.map((item, index) => (
        <Series.Sequence key={buildSequenceKey(item, index)} durationInFrames={item.durationInFrames}>
          {item.type === 'transition' ? (
            <MapScoreTransition {...item} />
          ) : item.type === 'series-summary' ? (
            <SeriesSummaryCard {...item} />
          ) : item.type === 'summary' ? (
            <MapSummaryCard {...item} />
          ) : (
            <RadarRevealScene scene={item} durationInFrames={item.durationInFrames} />
          )}
        </Series.Sequence>
      ))}
    </Series>
  )
}

function buildSequenceKey(item, index) {
  if (item.type === 'transition') return `map-transition-${item.mapIndex}-${index}`
  if (item.type === 'series-summary') return `series-summary-${item.mapIndex}-${index}`
  if (item.type === 'summary') return `map-summary-${item.mapIndex}-${index}`
  return `${item.characterName}-${item.mapIndex ?? 'legacy'}-${index}`
}
