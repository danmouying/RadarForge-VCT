import { renderConfig, renderJsonFile } from './render-utils.mjs'

const jsonFilePath = process.argv[2]

if (!jsonFilePath) {
  console.error('请提供 JSON 文件路径，例如：')
  console.error('npm run render:one -- /Users/danmou/Desktop/codex/雷达图/exports/example.json')
  process.exit(1)
}

try {
  const result = await renderJsonFile(jsonFilePath)

  console.log('渲染完成')
  console.log(`MP4 输出：${result.output}`)
} catch (error) {
  console.error('渲染失败')
  console.error(error?.stack || error?.message || String(error))
  console.error(`默认输出目录：${renderConfig.outputDir}`)
  process.exit(1)
}
