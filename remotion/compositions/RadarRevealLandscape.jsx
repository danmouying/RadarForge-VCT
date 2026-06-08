import { useVideoConfig } from 'remotion'
import { RadarRevealScene } from '../components/RadarRevealScene.jsx'
import { normalizeRadarVideoProps } from '../utils/dataAdapter.js'

export function RadarRevealLandscape(inputProps) {
  const props = normalizeRadarVideoProps(inputProps)
  const { durationInFrames } = useVideoConfig()

  return <RadarRevealScene scene={props} durationInFrames={durationInFrames} />
}
