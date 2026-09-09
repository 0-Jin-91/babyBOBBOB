/* 이유식 노트 — 오프라인 캐시
   ★ 캐시 URL 은 index.html 이 실제로 요청하는 '?v=' 포함 정확한 URL 이다.
     ignoreSearch:true 로 쿼리를 무시하면 버전을 올려도 구버전 응답이
     그대로 히트해 '업데이트했는데 옛 화면'이 된다. 그래서 쓰지 않는다.
   ★ 배포 시 V 만 바꾸면 CORE 전체가 따라간다 (index.html 의 window.APPV·?v= 와 동일 값). */
var V='82';
var VER='bf-v'+V;
var JS=['data','core','idb','update','ui','dash','combo','mix','find','home','today','stock',
'calc','plan','menu','edit','food','grow','log','info','cloud','boot'];
var CORE=['./','./index.html?v='+V,'./index.html','./manifest.json?v='+V,'./manifest.json']
.concat(JS.map(function(n){return './'+n+'.js?v='+V}));

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

/* ★ 버전확인용 요청(?_=타임스탬프)·no-store 요청은 SW 가 절대 가로채지 않는다.
   가로채면 구버전 index.html 이 반환돼 업데이트 알림이 무한 반복된다. */
if(u.searchParams.has('_')||r.cache==='no-store'||r.cache==='reload')return;

/* 앱 파일: 캐시 우선(정확 URL 매칭) + 백그라운드 갱신 */
e.respondWith(caches.match(r).then(function(hit){
var net=fetch(r).then(function(res){
if(res&&res.status===200)caches.open(VER).then(function(c){c.put(r,res.clone())});
return res}).catch(function(){return null});
if(hit){net;return hit}
return net.then(function(res){
if(res)return res;
/* 오프라인이고 캐시에도 없을 때 — 문서 요청은 현재 버전 index.html 로 폴백.
   쿼리 유무 두 가지를 순서대로 시도한다(ignoreSearch 없이). */
if(r.mode==='navigate'){
 return caches.match('./index.html?v='+V).then(function(a){
  return a||caches.match('./index.html')})}
return new Response('',{status:504,statusText:'offline'})})}))});

self.addEventListener('message',function(e){
if(e.data==='skipWaiting')self.skipWaiting()});
