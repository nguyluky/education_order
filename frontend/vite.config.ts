import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [react(), tailwindcss()],
    build: { // to output your build into build dir the same as Webpack
        outDir: 'build',
    },
    server: {
        open: true,
        port: 3000,
    },
});