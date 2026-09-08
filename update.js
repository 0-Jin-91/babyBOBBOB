/*========== 🍼 새로고침 · 업데이트 확인 ==========*/
var APPV='41';                     /* index.html 의 ?v= 와 같은 값 */
var UPDS=LS('b6.updfound',null)||{};
/* 저장된 '발견 버전'은 숫자이고 APPV 보다 클 때만 유효하다.
   과거 버그로 '최신' 같은 비숫자나 이미 지나간 버전이 저장돼 있으면 버린다
   (그대로 두면 앱을 열 때마다 업데이트 알림이 무한 반복된다). */
var _uv=(UPDS.v&&/^\d+$/.test(UPDS.v)&&(+UPDS.v)>(+APPV))?UPDS.v:'';
if(UPDS.v&&!_uv)localStorage.setItem('b6.updfound',JSON.stringify({v:''}));
var UPD={found:!!_uv,checking:false,last:LS('b6.updchk',0),newv:_uv,asked:'',timer:0};
/* 자동 새로고침 사용 여부 (기본 켜짐). 끄면 안내만 뜨고 직접 눌러야 한다 */
var UAUTO=LS('b6.updauto',1);
function updAutoSet(v){UAUTO=v?1:0;localStorage.setItem('b6.updauto',JSON.stringify(UAUTO));
if(!UAUTO)updStop();
if(document.getElementById('mb')&&UPD.found)updAsk(1)}
function updSaveF(){localStorage.setItem('b6.updfound',JSON.stringify({v:UPD.found?UPD.newv:''}))}
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
/* 서버 index.html 에서 ?v= 를 읽는다. 못 읽으면 판정하지 않는다(오탐 방지) */
var m=t.match(/\?v=(\d+)/);
UPD.checking=false;updSpin(false);
UPD.last=Date.now();localStorage.setItem('b6.updchk',JSON.stringify(UPD.last));
/* 새 버전 판정은 '서버 v > 내 v' 일 때만. 같거나 오히려 낮으면 최신으로 본다.
   (구버전이 캐시로 돌아왔을 때 알림이 반복되는 것을 막는다) */
if(m&&(+m[1])>(+APPV)){UPD.found=true;UPD.newv=m[1];updSaveF();updBanner();
if(!silent)updAsk();
else updNag()}
else{UPD.found=false;UPD.newv='';UPD.asked='';updSaveF();updBanner();
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

/*----- 업데이트 발견 안내 (auto=1 이면 자동 감지로 뜬 것) -----*/
var UCD=10;                        /* 자동 새로고침 카운트다운(초) */
function updAsk(auto){var au=auto&&UAUTO;
document.getElementById('mb').innerHTML='<div class="mt2">'+(auto?'🔄 업데이트가 있습니다':'🎉 새 버전이 있어요')+'</div>'
+'<div class="alert mid" style="margin-top:10px"><span class="ic">🔄</span><div><b>최신 버전이 아닙니다.</b><br>현재 v'+APPV+' → 새 버전 <b>v'+UPD.newv+'</b><br>최신 버전으로 새로고침 해주세요.</div></div>'
+(au?'<div class="ucd" id="ucdbox"><b id="ucd">'+UCD+'</b><div><b>초 후 자동으로 새로고침합니다</b><div class="mu" style="font-size:11px;margin-top:2px">기다리지 않으려면 아래 버튼을 누르세요.</div></div></div>':'')
+updInfoCard()
+'<div class="cd" style="background:#F3FAF7;font-size:11.5px"><b>안심하세요</b><div class="mu" style="font-size:11px;margin-top:5px;line-height:1.6">새로고침해도 <b>아기 정보·기록·재고·성장 데이터는 모두 그대로</b>입니다. 앱 화면과 기능만 최신으로 바뀝니다.</div></div>'
+'<button class="btn" onclick="updForce()">🔄 지금 최신 버전으로 새로고침</button>'
+'<button class="btn y" style="margin-top:8px" onclick="updLater()">나중에</button>'
+('<div class="cd" style="background:#FBF6F2;margin-top:10px"><div class="tcf" style="margin:0;border:0;padding:4px 0"><div style="flex:1"><b style="font-size:12.5px">자동 새로고침</b><div class="mu" style="font-size:10.5px">새 버전을 찾으면 '+UCD+'초 뒤 자동 적용</div></div><div class="tsw '+(UAUTO?'on':'')+'" onclick="updAutoSet('+(UAUTO?0:1)+')"><i></i></div></div></div>');
document.getElementById('md').classList.add('on');document.body.style.overflow='hidden';
updStop();
if(au)updTick()}
/*----- 카운트다운 -----*/
function updTick(){var n=UCD;
UPD.timer=setInterval(function(){n--;
var e=document.getElementById('ucd');
if(!e){updStop();return}                     /* 모달이 닫혔으면 중단 */
e.textContent=n;
if(n<=0){updStop();updForce()}},1000)}
function updStop(){if(UPD.timer){clearInterval(UPD.timer);UPD.timer=0}}
/*----- 나중에: 이 버전은 이번 실행 동안 다시 띄우지 않는다 (배너는 유지) -----*/
function updLater(){updStop();UPD.asked=UPD.newv;closeM()}

/*----- 자동 감지 시 안내 띄우기 -----*/
function updNag(){
if(!UPD.found)return;
if(UPD.asked===UPD.newv)return;                             /* 이미 안내했다 */
var md=document.getElementById('md');
if(md&&md.classList.contains('on'))return;                  /* 작업 중인 모달을 덮지 않는다 */
if(document.body.classList.contains('solo'))return;         /* 온보딩 중이면 방해하지 않는다 */
UPD.asked=UPD.newv;updAsk(1)}

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
if(UPD.found){el.className='ub on';document.body.classList.add('ubon');
el.innerHTML='<span>🔄 <b>최신 버전이 아닙니다.</b> 최신 버전으로 새로고침 해주세요.'+(UPD.newv&&UPD.newv!=='최신'?' (v'+APPV+' → v'+UPD.newv+')':'')+'</span>'
+'<button onclick="updAsk(1)" style="background:#fff;color:var(--pd);margin-right:5px">안내</button>'
+'<button onclick="updForce()">새로고침</button>'}
else{el.className='ub';el.innerHTML='';document.body.classList.remove('ubon')}
updSpin(false)}

/*----- 앱 시작 시 조용히 확인 (6시간마다) -----*/
function updAuto(){if(navigator.onLine===false)return;
/* 앱을 열 때마다 확인한다. 2분 내 재확인만 건너뛴다(연속 새로고침 방지) */
var last=+UPD.last||0;
if(Date.now()-last < 12e4)return;
setTimeout(function(){updCheck(true)},1200)}
/* 화면으로 돌아올 때·온라인 복귀 때도 확인 — 배너가 상시 최신 상태를 반영한다 */
document.addEventListener('visibilitychange',function(){
if(document.visibilityState==='visible')updAuto()});
window.addEventListener('online',function(){setTimeout(function(){updAuto()},800)});

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
/* SW 갱신 자체로 알림을 띄우지 않는다. 예전에는 newv='최신' 을 넣었는데
   '최신' 은 APPV 와 절대 같아지지 않아 알림이 영구 반복됐다.
   실제 버전 상승은 updCheck() 의 숫자 비교로만 판정한다. */
updCheck(true)}})})})})}
