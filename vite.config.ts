
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'maskable_icon.png', 'icon-192x192.png', 'icon-512x512.png'],
      manifest: {
        name: '180 IQ : เกมส์คนอัจฉริยะ',
        short_name: '180 IQ',
        description: 'ฝึกสมอง ประลองปัญญา กับเกมส์คณิตศาสตร์สุดท้าทาย',
        theme_color: '#1e293b',
        background_color: '#0f172a',
        display: 'fullscreen',
        scope: '/',
        start_url: '/',
        orientation: 'portrait',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/maskable_icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ]
})