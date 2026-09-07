/*========== 🍼 새로고침 · 업데이트 확인 ==========*/
var APPV='24';                     /* index.html 의 ?v= 와 같은 값 */
var UPD={found:false,checking:false,last:LS('b6.updchk',0),newv:''};
/* 업데이트 이력 — 실제로 버전이 올라간 순간만 기록한다.
   최신 상태에서 확인만 한 것은 '업데이트'가 아니므로 절대 갱신하지 않는다. */
var UH=LS('b6.updhist',null);
if(!UH||!UH.v){UH={v:APPV,at:'',first:1};localStorage.setItem('b6.updhist',JSON.stringify(UH))}
function updSaveH(){localStorage.setItem('b6.updhist',JSON.stringify(UH))}
/* 로드된 실제 버전(APPV)이 기록보다 높으면 = 새로고침으로 업데이트가 적용된 것 */
function updMark(){if(APPV!==UH.v){UH={v:APPV,at:new Date().toISOString(),prev:UH.v,first:0};updSaveH()}}
function updWhen(){if(!UH.at)return '기록 없음 (설치 후 업데이트 이력 없음)';
var d=new Date(UH.at);if(isNaN(d))return '기록 없음';
return d.getFullYear()+'.'+('0'+(d.getMonth()+1)).slice(-2)+'.'+('0'+d.getDate()).slice(-2)
+' '+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)}
/* 마지막 '확인' 시각 — 최신이어도 확인 기록은 남긴다(업데이트 시점과 구분) */
function updChkWhen(){var t=+UPD.last||0;if(!t)return '확인한 적 없음';
var d=new Date(t),df=Math.floor((Date.now()-t)/6e4);
return (df<1?'방금':df<60?df+'분 전':df<1440?Math.floor(df/60)+'시간 전':Math.floor(df/1440)+'일 전')
+' ('+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)+')'}

/*----- 서버의 index.html 을 읽어 ?v= 비교 -----*/
function updCheck(silent){
if(navigator.onLine===false){if(!silent)alert('📡 인터넷이 연결되어야 가능합니다.\n\n업데이트 확인은 온라인 상태에서만 가능해요.\n지금 버전으로도 모든 기능은 정상 작동합니다.');return}
if(UPD.checking)return;
UPD.checking=true;updSpin(true);
var url='./index.html?_=' + Date.now();
fetch(url,{cache:'no-store'}).then(function(r){return r.text()}).then(function(t){
var m=t.match(/\?v=(\d+)/);
UPD.checking=false;updSpin(false);
UPD.last=Date.now();localStorage.setItem('b6.updchk',JSON.stringify(UPD.last));
if(m&&m[1]!==APPV){UPD.found=true;UPD.newv=m[1];updBanner();
if(!silent)updAsk()}
else{UPD.found=false;updBanner();
if(!silent)updOk()}
}).catch(function(){UPD.checking=false;updSpin(false);
if(!silent)alert('업데이트 확인에 실패했어요. 잠시 뒤 다시 시도해 주세요.')})}

/*----- 최신 상태 안내 -----*/
/*----- 버전 정보 공통 블록 -----*/
function updInfoCard(){return '<div class="cd"><b style="font-size:13px">📋 버전 정보</b>'
+'<div class="ir" style="margin-top:6px"><span>현재 버전</span><b>v'+APPV+'</b></div>'
+'<div class="ir"><span>최종 업데이트 시점</span><b style="color:'+(UH.at?'var(--pd)':'var(--sub)')+'">'+updWhen()+'</b></div>'
+(UH.prev?'<div class="ir"><span>이전 버전</span><b class="mu">v'+UH.prev+'</b></div>':'')
+'<div class="ir"><span>마지막 확인</span><b class="mu">'+updChkWhen()+'</b></div></div>'}

function updOk(){document.getElementById('mb').innerHTML='<div class="mt2">🍼 최신 버전입니다</div>'
+'<div class="alert ok" style="margin-top:10px"><span class="ic">✅</span><div><b>현재 버전 v'+APPV+'가 최신입니다</b><br>더 새로운 버전이 없어요. 그대로 사용하세요.</div></div>'
+updInfoCard()
+'<div class="cd" style="background:#F3F6FA;font-size:11.5px"><b>ℹ️ 업데이트가 없으면 시점은 그대로입니다</b><div class="mu" style="font-size:11px;margin-top:5px;line-height:1.6">방금 확인했지만 이미 최신이므로 <b>최종 업데이트 시점과 버전은 바뀌지 않습니다.</b> 실제로 새 버전이 적용된 순간만 기록됩니다.<br><br>새로고침해도 <b>기록·재고·성장 데이터는 그대로</b> 유지됩니다.</div></div>'
+'<button class="btn g" onclick="updForce()">🔄 그래도 새로고침</button>'
+'<button class="btn y" style="margin-top:8px" onclick="closeM()">닫기</button>';
document.getElementById('md').classList.add('on');document.body.style.overflow='hidden'}

/*----- 업데이트 발견 -----*/
function updAsk(){document.getElementById('mb').innerHTML='<div class="mt2">🎉 새 버전이 있어요</div>'
+'<div class="alert mid" style="margin-top:10px"><span class="ic">🔄</span><div><b>최신 버전이 아닙니다.</b><br>현재 v'+APPV+' → 새 버전 <b>v'+UPD.newv+'</b><br>최신 버전으로 새로고침 해주세요.</div></div>'
+updInfoCard()
+'<div class="cd" style="background:#F3FAF7;font-size:11.5px"><b>안심하세요</b><div class="mu" style="font-size:11px;margin-top:5px;line-height:1.6">새로고침해도 <b>아기 정보·기록·재고·성장 데이터는 모두 그대로</b>입니다. 앱 화면과 기능만 최신으로 바뀝니다.</div></div>'
+'<button class="btn" onclick="updForce()">🔄 지금 최신 버전으로 새로고침</button>'
+'<button class="btn y" style="margin-top:8px" onclick="closeM()">나중에</button>';
document.getElementById('md').classList.add('on');document.body.style.overflow='hidden'}

/*----- 강제 새로고침 (SW 캐시 비우고 재로드) -----*/
function updForce(){
var done=function(){location.reload(true)};
try{
if('caches' in window){
caches.keys().then(function(ks){
return Promise.all(ks.map(function(k){return caches.delete(k)}))
}).then(function(){
if('serviceWorker' in navigator&&navigator.serviceWorker.getRegistrations){
navigator.serviceWorker.getRegistrations().then(function(rs){
Promise.all(rs.map(function(r){return r.unregister()})).then(done)}).catch(done)}
else done()}).catch(done)}
else done()}
catch(e){done()}}

/*----- 헤더 버튼 회전 -----*/
function updSpin(on){var b=document.getElementById('rfb');
if(b)b.className='rfb'+(on?' spin':'')+(UPD.found?' new':'');
var l=document.getElementById('lgb');
if(l)l.className='lgb'+(on?' spin':'')+(UPD.found?' new':'')}

/*----- 상단 업데이트 배너 -----*/
function updBanner(){var el=document.getElementById('ub');if(!el)return;
if(UPD.found){el.className='ub on';
el.innerHTML='<span>🔄 <b>최신 버전이 아닙니다.</b> 최신 버전으로 새로고침 해주세요. (v'+APPV+' → v'+UPD.newv+')</span>'
+'<button onclick="updForce()">새로고침</button>'}
else{el.className='ub';el.innerHTML=''}
updSpin(false)}

/*----- 앱 시작 시 조용히 확인 (6시간마다) -----*/
function updAuto(){if(navigator.onLine===false)return;
var last=+UPD.last||0;
if(Date.now()-last < 6*36e5)return;
setTimeout(function(){updCheck(true)},2500)}

/*----- Service Worker 가 새 버전을 감지했을 때 -----*/
function updSWHook(){if(!('serviceWorker' in navigator))return;
navigator.serviceWorker.addEventListener('controllerchange',function(){
/* 새 SW 가 제어권을 잡음 = 업데이트 적용됨 */});
navigator.serviceWorker.getRegistrations&&navigator.serviceWorker.getRegistrations().then(function(rs){
rs.forEach(function(r){
r.addEventListener('updatefound',function(){
var nw=r.installing;if(!nw)return;
nw.addEventListener('statechange',function(){
if(nw.state==='installed'&&navigator.serviceWorker.controller){
UPD.found=true;UPD.newv='최신';updBanner()}})})})})}
