import {defineConfig} from 'vite';
export default defineConfig({base:'./',build:{assetsInlineLimit:8*1024*1024,chunkSizeWarningLimit:5000}});
