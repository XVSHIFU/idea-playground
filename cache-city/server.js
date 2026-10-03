import http from 'node:http';
import {readFile} from 'node:fs/promises';
const files={'/':'index.html','/index.html':'index.html','/style.css':'style.css','/app.js':'app.js','/engine.js':'engine.js','/assets/story-serif.ttf':'assets/story-serif.ttf'};
const mime={ttf:'font/ttf',html:'text/html; charset=utf-8',css:'text/css; charset=utf-8',js:'text/javascript; charset=utf-8'};
const port=Number(process.env.PORT||4187);
http.createServer(async(req,res)=>{const file=files[new URL(req.url,'http://localhost').pathname];if(!file){res.writeHead(404);res.end('Not found');return;}try{const data=await readFile(new URL(file,import.meta.url));res.writeHead(200,{'Content-Type':mime[file.split('.').pop()]});res.end(data);}catch{res.writeHead(500);res.end('Unable to read application file');}}).listen(port,'127.0.0.1',()=>console.log(`缓存之城：http://127.0.0.1:${port}`));
