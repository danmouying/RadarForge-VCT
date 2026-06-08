import path from 'node:path'
import { createRemotionBundle, listInputJsonFiles, renderConfig, renderJsonFile } from './render-utils.mjs'

let jsonFiles = []

try {
  jsonFiles = await listInputJsonFiles()
} catch (error) {
  console.error(`无法读取默认 JSON 目录：${renderConfig.inputDir}`)
  console.error(error?.message || String(error))
  process.exit(1)
}

if (jsonFiles.length === 0) {
  console.log(`没有找到可渲染的 JSON 文件：${path.join(renderConfig.inputDir, '*.json')}`)
  console.log(`MP4 默认输出目录：${renderConfig.outputDir}`)
  process.exit(0)
}

console.log(`默认 JSON 输入目录：${renderConfig.inputDir}`)
console.log(`MP4 输出目录：${renderConfig.outputDir}`)
console.log(`共找到 ${jsonFiles.length} 个 JSON，开始串行渲染。`)

const results = []
const failures = []
const serveUrl = await createRemotionBundle()

for (const [index, jsonFile] of jsonFiles.entries()) {
  const logPrefix = `[${index + 1}/${jsonFiles.length}]`

  try {
    const result = await renderJsonFile(jsonFile, { serveUrl, logPrefix })
    results.push(result)
    console.log(`  完成：${result.output}`)
  } catch (error) {
    const reason = error?.message || String(error)
    failures.push({ file: jsonFile, reason })
    console.error(`  失败：${reason}`)
  }
}

console.log('')
console.log('批量渲染完成')
console.log(`成功数量：${results.length}`)
console.log(`失败数量：${failures.length}`)
console.log(`输出目录：${renderConfig.outputDir}`)

if (results.length > 0) {
  console.log('成功文件：')
  for (const result of results) {
    console.log(`- ${result.output}`)
  }
}

if (failures.length > 0) {
  console.log('失败文件：')
  for (const failure of failures) {
    console.log(`- ${failure.file}`)
    console.log(`  原因：${failure.reason}`)
  }
}

process.exit(failures.length > 0 ? 1 : 0)
