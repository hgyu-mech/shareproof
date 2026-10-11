import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve('dist'), port=Number(process.env.PORT||8781);
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.wasm':'application/wasm','.gz':'application/gzip','.txt':'text/plain; charset=utf-8'};
http.createServer(async(req,res)=>{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
 try{let p=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(p==='/')p='/index.html';const f=resolve(root,'.'+p);if(!f.startsWith(root+sep))throw Error('Invalid path');const b=await readFile(f);res.writeHead(200,{'Content-Type':mime[extname(f)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:b);}catch{res.writeHead(404);res.end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log('ShareProof: http://127.0.0.1:'+port));
