const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'dist');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2'};
if(!fs.existsSync(path.join(root,'index.html'))){console.error('Build missing. Run npm install then npm run build.');process.exit(1)}
const server=http.createServer((req,res)=>{try{let name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=path.resolve(root,'.'+(name==='/'?'/index.html':name));if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end()}fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);return res.end('Not found')}res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(data)});}catch{res.writeHead(400);res.end('Bad request')}});
server.listen(4173,'127.0.0.1',()=>console.log('Emberfall: http://127.0.0.1:4173  (Ctrl+C to stop)'));
server.on('error',e=>{console.error(e.code==='EADDRINUSE'?'Port 4173 is in use. Open Emberfall.html directly instead.':e.message);process.exit(1)});
