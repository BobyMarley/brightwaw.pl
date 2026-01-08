import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        host: '0.0.0.0',
        port: parseInt(process.env.PORT || '5173')
    },
    preview: {
        host: '0.0.0.0',
        port: parseInt(process.env.PORT || '4173'),
        allowedHosts: ['brightapp-production.up.railway.app']
    },
    build: {
        outDir: 'dist',
        sourcemap: false,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                    firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
                    mui: ['@mui/material', '@mui/icons-material']
                }
            }
        }
    }
})
