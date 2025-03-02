import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import process from 'process';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(process.cwd(), './src'),
        },
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                    mui: ['@mui/material', '@mui/icons-material'],
                    aws: ['aws-amplify', '@aws-amplify/ui-react'],
                    charts: ['chart.js', 'react-chartjs-2'],
                },
            },
        },
    },
    server: {
        port: 3000,
        open: true,
    },
});
