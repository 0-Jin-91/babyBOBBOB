/* 이유식 노트 — 오프라인 캐시 */
var VER='bf-v37';
var CORE=['./','./index.html','./data.js','./core.js','./ui.js','./combo.js','./mix.js','./calc.js','./stock.js','./update.js','./dash.js','./find.js',
'./home.js','./today.js','./plan.js','./menu.js','./edit.js','./food.js','./grow.js',
'./log.js','./info.js','./boot.js','./manifest.json'];

self.addEventListener('install',function(e){
e.waitUntil(caches.open(VER).then(function(c){
/* 개별 실패가 전체 설치를 막지 않도록 */
return Promise.all(CORE.map(function(u){
return c.add(new Request(u,{cache:'reload'})).catch(function(){return null})}))
}).then(function(){return self.skipWaiting()}))});

self.addEventListener('activate',function(e){
e.waitUntil(caches.keys().then(function(ks){
return Promise.all(ks.map(function(k){return k===VER?null:caches.delete(k)}))
}).then(function(){return self.clients.claim()}))});

self.addEventListener('fetch',function(e){
var r=e.request;
if(r.method!=='GET')return;
var u=new URL(r.url);
/* 외부 도메인(출처 링크·유튜브)은 네트워크로만 */
if(u.origin!==self.location.origin)return;

/* 앱 파일: 캐시 우선 + 백그라운드 갱신 */
e.respondWith(caches.match(r,{ignoreSearch:true}).then(function(hit){
var net=fetch(r).then(function(res){
if(res&&res.status===200)caches.open(VER).then(function(c){c.put(r,res.clone())});
return res}).catch(function(){return null});
if(hit){net;return hit}
return net.then(function(res){
if(res)return res;
/* 오프라인이고 캐시에도 없을 때 */
if(r.mode==='navigate')return caches.match('./index.html',{ignoreSearch:true});
return new Response('',{status:504,statusText:'offline'})})}))});

self.addEventListener('message',function(e){
if(e.data==='skipWaiting')self.skipWaiting()});
