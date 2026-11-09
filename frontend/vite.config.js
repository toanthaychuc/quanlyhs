import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import https from 'node:https'

// Proxy middleware for Google Translate TTS audio (/api/tts) to avoid browser Referer/CORS blocks
function googleTtsProxyPlugin() {
  const handler = (req, res, next) => {
    if (!req.url || !req.url.startsWith('/api/tts')) {
      return next()
    }
    try {
      const urlObj = new URL(req.url, 'http://localhost')
      const q = (urlObj.searchParams.get('q') || '').trim().slice(0, 200)
      const tl = urlObj.searchParams.get('tl') || 'en-US'
      const ttsspeed = urlObj.searchParams.get('ttsspeed') || '1'

      if (!q) {
        res.statusCode = 400
        res.end('Missing query parameter q')
        return
      }

      const googleUrl = `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=${encodeURIComponent(tl)}&ttsspeed=${encodeURIComponent(ttsspeed)}&q=${encodeURIComponent(q)}`

      https.get(
        googleUrl,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept': '*/*'
          }
        },
        (googleRes) => {
          if (googleRes.statusCode !== 200) {
            res.statusCode = googleRes.statusCode || 502
            res.end('TTS upstream error')
            return
          }
          res.setHeader('Content-Type', 'audio/mpeg')
          res.setHeader('Cache-Control', 'public, max-age=86400')
          googleRes.pipe(res)
        }
      ).on('error', () => {
        res.statusCode = 502
        res.end('Failed to reach Google TTS')
      })
    } catch {
      res.statusCode = 500
      res.end('Internal TTS error')
    }
  }

  return {
    name: 'google-tts-proxy',
    configureServer(server) {
      server.middlewares.use(handler)
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler)
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    googleTtsProxyPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'Toán thầy Chức',
        short_name: 'Toán thầy Chức',
        description: 'Hệ thống Quản lý Học tập Toán Thầy Chức',
        theme_color: '#060913',
        background_color: '#060913',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5000000,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,ttf}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'jsdelivr-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
})
