import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            strategies: 'injectManifest',
            srcDir: 'src',
            filename: 'sw.ts',
            registerType: 'autoUpdate',
            includeAssets: ['chatspark.svg', 'pwa-192.png', 'pwa-512.png'],
            manifest: {
                name: 'ChatSpark',
                short_name: 'ChatSpark',
                description: 'Real-time chat application',
                theme_color: '#0F172A',
                background_color: '#0F172A',
                display: 'standalone',
                orientation: 'portrait',
                start_url: '/',
                icons: [
                    { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
                    { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
                ],
            },
        }),
    ],
    base: '/',
    build: {
        outDir: 'dist',
        sourcemap: false,
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
    }
});
