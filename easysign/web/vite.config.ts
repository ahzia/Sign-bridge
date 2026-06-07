import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  appType: 'spa',
  server: {
    host: true,
  },
  preview: {
    host: true,
  },
  optimizeDeps: {
    exclude: ['@sutton-signwriting/sgnw-components', 'fsw-sign', '@mediapipe/tasks-vision'],
    include: ['@tensorflow/tfjs', 'three', '@mediapipe/tasks-vision'],
  },
})
