import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: './',
  server: { host: '0.0.0.0', allowedHosts: ['terminal.local'] },
  build: {
    rollupOptions: {
      output: { manualChunks: { three: ['three'], vue: ['vue'] } },
    },
  },
})
