import path from 'node:path'
import { createRemotionBundle } from './render-utils.mjs'
import {
  EXPORTS_DIR,
  buildAssetFromCsvRecord,
  formatRelativePath,
  loadCsvRows,
  writeProjectJson,
} from './batch-utils.mjs'
import { generatePngFromJson } from './generate-png-from-json.mjs'

const inputFilePath = process.argv[2]

if (!inputFilePath) {
  console.error('请提供 CSV 文件路径，例如：')
  console.error('npm run generate:assets -- batch-input/example-characters.csv')
  process.exit(1)
}

try {
  const { headers, records, inputFilePath: absoluteInputPath } = await loadCsvRows(inputFilePath)
  const results = []

  console.log(`CSV 输入：${absoluteInputPath}`)
  console.log(`输出目录：${EXPORTS_DIR}`)
  console.log(`共读取 ${records.length} 行人物数据。`)

  const serveUrl = await createRemotionBundle()

  for (const [index, record] of records.entries()) {
    const asset = await buildAssetFromCsvRecord({
      record,
      headers,
      inputFilePath: absoluteInputPath,
      outputDir: EXPORTS_DIR,
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

    try {
      await generatePngFromJson(asset.jsonPath, {
        serveUrl,
        outputPath: asset.pngPath,
      })
      asset.pngOk = true
      console.log(`PNG 输出：${formatRelativePath(asset.pngPath)}`)
    } catch (error) {
      asset.pngOk = false
      asset.pngError = error?.message || String(error)
      console.error(`PNG 失败：${asset.pngError}`)
    }

    results.push(asset)
  }

  const successJsonCount = results.filter((result) => result.ok).length
  const successPngCount = results.filter((result) => result.ok && result.pngOk).length
  const failures = results.filter((result) => !result.ok || (result.ok && !result.pngOk))

  console.log('')
  console.log('批量素材生成完成')
  console.log(`成功生成 JSON：${successJsonCount}`)
  console.log(`成功生成 PNG：${successPngCount}`)
  console.log(`失败行数：${failures.length}`)
  console.log(`输出目录：${path.resolve(EXPORTS_DIR)}`)

  if (failures.length > 0) {
    console.log('失败原因：')
    for (const failure of failures) {
      const reason = failure.ok ? failure.pngError : failure.errors.join('；')
      console.log(`- 第 ${failure.rowNumber} 行 ${failure.name}：${reason}`)
    }
  }

  process.exit(failures.length > 0 ? 1 : 0)
} catch (error) {
  console.error('批量素材生成失败')
  console.error(error?.stack || error?.message || String(error))
  process.exit(1)
}
