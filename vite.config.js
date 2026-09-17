import {defineConfig} from 'vite';
import {resolve} from 'node:path';

export default defineConfig({
  base:'./',
  build:{
    assetsInlineLimit:8*1024*1024,
    chunkSizeWarningLimit:5000,
    rollupOptions:{input:{game:resolve(import.meta.dirname,'index.html'),promo:resolve(import.meta.dirname,'promo-render.html'),gameplayVideo:resolve(import.meta.dirname,'gameplay-video.html')}}
  }
});
