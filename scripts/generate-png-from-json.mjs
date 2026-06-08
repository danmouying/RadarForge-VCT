import { renderStill, selectComposition } from '@remotion/renderer'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  createRemotionBundle,
  readJsonProps,
  renderConfig,
} from './render-utils.mjs'
import { validateRadarVideoProps } from '../remotion/utils/dataAdapter.js'
import { EXPORTS_DIR, formatRelativePath } from './batch-utils.mjs'

export async function generatePngFromJson(jsonFilePath, options = {}) {
  const absoluteJsonPath = path.resolve(jsonFilePath)
  const inputProps = await readJsonProps(absoluteJsonPath)
  const validation = validateRadarVideoProps(inputProps)

  if (!validation.ok) {
    throw new Error(`JSON 数据验证失败：${validation.errors.join('；')}`)
  }

  const serveUrl = options.serveUrl ?? (await createRemotionBundle())
  const composition = await selectComposition({
    serveUrl,
    id: renderConfig.compositionId,
    inputProps,
    logLevel: 'warn',
  })
  const output = options.outputPath ?? path.join(EXPORTS_DIR, `${path.basename(absoluteJsonPath, '.json')}.png`)

  await renderStill({
    serveUrl,
    composition,
    inputProps,
    frame: Math.max(0, composition.durationInFrames - 1),
    imageFormat: 'png',
    output,
    overwrite: true,
    logLevel: 'warn',
  })

  return output
}

if (fileURLToPath(import.meta.url) === path.resolve(process.argv[1] || '')) {
  const jsonFilePath = process.argv[2]

  if (!jsonFilePath) {
    console.error('请提供 JSON 文件路径，例如：')
    console.error('npm run generate:png -- /Users/danmou/Desktop/codex/雷达图/exports/凯多.json')
    process.exit(1)
  }

  try {
    const output = await generatePngFromJson(jsonFilePath)
    console.log('PNG 生成完成')
    console.log(`PNG 输出：${formatRelativePath(output)}`)
  } catch (error) {
    console.error('PNG 生成失败')
    console.error(error?.stack || error?.message || String(error))
    process.exit(1)
  }
}
