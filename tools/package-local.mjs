import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('dist');
let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
html=html.replace(/<script\b[^>]*src="([^"]+)"[^>]*><\/script>/g,(_,src)=>{
  const js=fs.readFileSync(path.resolve(root,src),'utf8').replace(/<\/script/gi,'<\\/script');
  return `<script type="module">${js}</script>`;
});
html=html.replace(/<link\b[^>]*href="([^"]+\.css)"[^>]*>/g,(_,src)=>`<style>${fs.readFileSync(path.resolve(root,src),'utf8')}</style>`);
fs.writeFileSync('Emberfall.html',html);
console.log('Created Emberfall.html — open directly in a browser, no server required.');
