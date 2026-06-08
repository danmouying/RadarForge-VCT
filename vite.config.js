import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { Buffer } from 'node:buffer'
import fs from 'node:fs/promises'
import path from 'node:path'
import { cwd } from 'node:process'

function localExportPlugin() {
  return {
    name: 'local-export',
    configureServer(server) {
      server.middlewares.use('/api/export-png', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method Not Allowed')
          return
        }

        let body = ''
        req.on('data', (chunk) => {
          body += chunk
        })
        req.on('end', async () => {
          try {
            const { fileName, dataUrl } = JSON.parse(body)
            const match = /^data:image\/png;base64,(.+)$/.exec(dataUrl)
            if (!match) {
              res.statusCode = 400
              res.end('Invalid PNG data')
              return
            }

            const exportDir = path.join(cwd(), 'exports')
            await fs.mkdir(exportDir, { recursive: true })
            const safeName = String(fileName || 'RadarForge').replace(/[\\/:*?"<>|]/g, '-')
            const outputPath = path.join(exportDir, `${safeName}-${Date.now()}.png`)
            await fs.writeFile(outputPath, Buffer.from(match[1], 'base64'))

            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ path: outputPath }))
          } catch (error) {
            console.error(error)
            res.statusCode = 500
            res.end('Export failed')
          }
        })
      })
      server.middlewares.use('/api/export-json', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method Not Allowed')
          return
        }

        let body = ''
        req.on('data', (chunk) => {
          body += chunk
        })
        req.on('end', async () => {
          try {
            const { fileName, payload } = JSON.parse(body)
            const exportDir = path.join(cwd(), 'exports')
            await fs.mkdir(exportDir, { recursive: true })
            const safeName = String(fileName || 'RadarForge').replace(/[\\/:*?"<>|]/g, '-')
            const outputPath = path.join(exportDir, `${safeName}-${Date.now()}.json`)
            await fs.writeFile(outputPath, JSON.stringify(payload, null, 2))

            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ path: outputPath }))
          } catch (error) {
            console.error(error)
            res.statusCode = 500
            res.end('Export failed')
          }
        })
      })
      server.middlewares.use('/api/export-video', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method Not Allowed')
          return
        }

        let body = ''
        req.on('data', (chunk) => {
          body += chunk
        })
        req.on('end', async () => {
          try {
            const { fileName, dataUrl, extension } = JSON.parse(body)
            const match = /^data:video\/webm(?:;codecs=[^;]+)?;base64,(.+)$/.exec(dataUrl)
            if (!match) {
              res.statusCode = 400
              res.end('Invalid video data')
              return
            }

            const exportDir = path.join(cwd(), 'exports')
            await fs.mkdir(exportDir, { recursive: true })
            const safeName = String(fileName || 'RadarForge').replace(/[\\/:*?"<>|]/g, '-')
            const safeExtension = extension === 'webm' ? extension : 'webm'
            const outputPath = path.join(exportDir, `${safeName}-${Date.now()}.${safeExtension}`)
            await fs.writeFile(outputPath, Buffer.from(match[1], 'base64'))

            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ path: outputPath }))
          } catch (error) {
            console.error(error)
            res.statusCode = 500
            res.end('Export failed')
          }
        })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [localExportPlugin(), react(), tailwindcss()],
})
