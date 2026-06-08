import { Easing, interpolate } from 'remotion'

export function timelineProgress(frame, durationInFrames, startRatio, endRatio) {
  const startFrame = Math.round(durationInFrames * startRatio)
  const endFrame = Math.round(durationInFrames * endRatio)

  return interpolate(frame, [startFrame, endFrame], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  })
}
