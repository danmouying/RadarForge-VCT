import path from 'node:path'
import {
  buildFullVideoProps,
  createRemotionBundle,
  loadFullVideoInput,
  renderConfig,
  renderFullVideo,
  summarizeRadarFullVideoProps,
} from './render-utils.mjs'

const manifestFilePath = process.argv[2]
const outputFilePath = process.argv[3]
const outputLocation = path.resolve(outputFilePath || renderConfig.defaultFullVideoOutput)

try {
  const input = await loadFullVideoInput(manifestFilePath)

  for (const warning of input.warnings || []) {
    console.warn(`[render:full] warning: ${warning}`)
  }

  if (input.jsonFiles.length === 0 && input.maps.length === 0) {
    console.log(`没有找到可渲染的 JSON 文件：${input.sourceLabel}`)
    console.log(`默认输出：${renderConfig.defaultFullVideoOutput}`)
    process.exit(0)
  }

  const inputProps = await buildFullVideoProps(input)
  const summary = summarizeRadarFullVideoProps(inputProps)

  console.log(`[render:full] 输入：${input.sourceLabel}`)
  if (summary.mapCount > 0) {
    console.log(`[render:full] 共读取 ${summary.mapCount} 张地图，${summary.count} 个角色，${summary.sequenceCount} 个片段`)
  } else {
    console.log(`[render:full] 共读取 ${summary.count} 个角色`)
  }
  for (const item of summary.sequenceItems) {
    if (item.type === 'transition') {
      console.log(`${item.index}. [比分过渡] ${item.label || `Map ${(item.mapIndex ?? 0) + 1}`} - ${formatSeconds(item.duration)}s - ${item.frames} frames`)
    } else if (item.type === 'series-summary') {
      console.log(`${item.index}. [整场总结] ${item.summaryTitle || '整场总结'} - ${formatSeconds(item.duration)}s - ${item.frames} frames`)
    } else if (item.type === 'summary') {
      console.log(`${item.index}. [地图总览] ${item.summaryTitle || item.mapName || `Map ${(item.mapIndex ?? 0) + 1}`} - ${formatSeconds(item.duration)}s - ${item.frames} frames`)
    } else {
      const rankLabel = Number.isFinite(item.rankingScore) ? ` - rankScore ${formatSeconds(item.rankingScore)}` : ''
      console.log(`${item.index}. ${item.characterName}${rankLabel} - ${formatSeconds(item.duration)}s - ${item.frames} frames`)
    }
  }
  console.log(`总时长：${formatSeconds(summary.totalSeconds)}s`)
  console.log(`输出：${outputLocation}`)

  const serveUrl = await createRemotionBundle()
  await renderFullVideo({ inputProps, outputLocation, serveUrl })

  console.log('完整视频渲染完成')
  console.log(`MP4 输出：${outputLocation}`)
} catch (error) {
  console.error('完整视频渲染失败')
  console.error(error?.stack || error?.message || String(error))
  console.error(`默认输出：${renderConfig.defaultFullVideoOutput}`)
  process.exit(1)
}

function formatSeconds(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return '0'
  return Number.isInteger(number) ? String(number) : number.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
}
