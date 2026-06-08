import { composePreviewCanvas } from './exportPreview'

const FRAME_RATE = 30
const WEBM_MIME_TYPES = [
  'video/webm;codecs=vp9',
  'video/webm;codecs=vp8',
  'video/webm',
]

export function getSupportedVideoMimeType() {
  if (!window.MediaRecorder) return ''
  return WEBM_MIME_TYPES.find((mimeType) => MediaRecorder.isTypeSupported(mimeType)) || ''
}

export async function recordPreviewWebm({
  previewNode,
  theme,
  durationMs,
  animationMs,
  exportSize,
  animate,
}) {
  const mimeType = getSupportedVideoMimeType()
  if (!mimeType) {
    throw new Error('WebM recording is not supported in this browser.')
  }

  const frameOptions = exportSize
    ? { outputWidth: exportSize.width, outputHeight: exportSize.height }
    : { scale: 2 }
  const firstFrame = await composePreviewCanvas(previewNode, theme, frameOptions)
  const recordingCanvas = document.createElement('canvas')
  recordingCanvas.width = firstFrame.width
  recordingCanvas.height = firstFrame.height

  const context = recordingCanvas.getContext('2d')
  context.drawImage(firstFrame, 0, 0)

  const stream = recordingCanvas.captureStream(FRAME_RATE)
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: getVideoBitrate(recordingCanvas.width, recordingCanvas.height),
  })
  const chunks = []
  const recordingFinished = new Promise((resolve, reject) => {
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data)
    }
    recorder.onerror = () => reject(recorder.error)
    recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }))
  })

  recorder.start()

  const safeAnimationMs = Math.min(durationMs, Math.max(0, animationMs))
  const holdMs = Math.max(0, durationMs - safeAnimationMs)
  const paintLoop = paintPreviewFrames({
    previewNode,
    theme,
    context,
    width: recordingCanvas.width,
    height: recordingCanvas.height,
    frameOptions,
    durationMs,
  })

  await animate(safeAnimationMs)
  await wait(holdMs)
  await paintLoop

  recorder.stop()
  stream.getTracks().forEach((track) => track.stop())

  return {
    blob: await recordingFinished,
    mimeType,
    extension: 'webm',
  }
}

async function paintPreviewFrames({
  previewNode,
  theme,
  context,
  width,
  height,
  frameOptions,
  durationMs,
}) {
  const startedAt = performance.now()
  let elapsed = 0

  while (elapsed < durationMs) {
    const frame = await composePreviewCanvas(previewNode, theme, frameOptions)
    context.clearRect(0, 0, width, height)
    context.drawImage(frame, 0, 0, width, height)
    await wait(1000 / FRAME_RATE)
    elapsed = performance.now() - startedAt
  }

  const finalFrame = await composePreviewCanvas(previewNode, theme, frameOptions)
  context.clearRect(0, 0, width, height)
  context.drawImage(finalFrame, 0, 0, width, height)
}

function getVideoBitrate(width, height) {
  const pixels = width * height
  return Math.max(12_000_000, Math.round(pixels * 8))
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}
