import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  EXPORTS_DIR,
  buildAssetFromCsvRecord,
  formatRelativePath,
  loadCsvRows,
  writeProjectJson,
} from './batch-utils.mjs'

export async function generateJsonFromCsv(inputFilePath, options = {}) {
  const { headers, records, inputFilePath: absoluteInputPath } = await loadCsvRows(inputFilePath)
  const outputDir = options.outputDir ?? EXPORTS_DIR
  const results = []

  console.log(`CSV 输入：${absoluteInputPath}`)
  console.log(`JSON 输出目录：${outputDir}`)

  for (const [index, record] of records.entries()) {
    const asset = await buildAssetFromCsvRecord({
      record,
      headers,
      inputFilePath: absoluteInputPath,
      outputDir,
    })

    console.log('')
    console.log(`[${index + 1}/${records.length}] 正在生成：${asset.name}`)

    if (!asset.ok) {
      console.error(`失败：第 ${asset.rowNumber} 行，${asset.errors.join('；')}`)
      results.push(asset)
      continue
    }

    await writeProjectJson(asset)
    console.log(`JSON 输出：${formatRelativePath(asset.jsonPath)}`)

    for (const warning of asset.warnings) {
      console.warn(`警告：${warning}`)
    }

    results.push(asset)
  }

  return results
}

if (fileURLToPath(import.meta.url) === path.resolve(process.argv[1] || '')) {
  const inputFilePath = process.argv[2]

  if (!inputFilePath) {
    console.error('请提供 CSV 文件路径，例如：')
    console.error('npm run generate:json -- batch-input/example-characters.csv')
    process.exit(1)
  }

  try {
    const results = await generateJsonFromCsv(inputFilePath)
    const successCount = results.filter((result) => result.ok).length
    const failures = results.filter((result) => !result.ok)

    console.log('')
    console.log('批量 JSON 生成完成')
    console.log(`成功生成 JSON：${successCount}`)
    console.log(`失败行数：${failures.length}`)
    console.log(`输出目录：${path.resolve(EXPORTS_DIR)}`)

    if (failures.length > 0) {
      console.log('失败原因：')
      for (const failure of failures) {
        console.log(`- 第 ${failure.rowNumber} 行 ${failure.name}：${failure.errors.join('；')}`)
      }
    }

    process.exit(failures.length > 0 ? 1 : 0)
  } catch (error) {
    console.error('批量 JSON 生成失败')
    console.error(error?.stack || error?.message || String(error))
    process.exit(1)
  }
}
