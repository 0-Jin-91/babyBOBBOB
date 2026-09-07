/*========== 온보딩 ==========*/
function saveBaby(){var n=document.getElementById('iN').value.trim(),b=document.getElementById('iB').value;
if(!n)return alert('아기 이름을 입력해 주세요');
if(!b)return alert('태어난 날을 선택해 주세요');
if(d0(b)>TD())return alert('오늘 이후 날짜는 안 돼요');
baby={name:n,birth:b,sex:document.getElementById('iS').value,feed:document.getElementById('iF').value,meals:+document.getElementById('iM').value,vol:+document.getElementById('iV').value||180,useW:1};
var w=+document.getElementById('iW').value,h=+document.getElementById('iH').value;
if(w||h)grow.push({id:'g'+Date.now(),d:ymd(TD()),w:w||null,h:h||null,c:null});
save();boot()}

/*========== 탭 정의 · 순서·표시 설정 ==========*/
/* TABD: 전체 탭 마스터. home 은 고정(항상 표시·항상 맨 앞) */
var TABD={
home :{i:'🏠',n:'홈'   ,d:'오늘 요약·목표·추천'},
today:{i:'📅',n:'오늘' ,d:'오늘 기록 관리'},
plan :{i:'🗓',n:'식단' ,d:'주간 식단·장보기·큐브'},
menu :{i:'🍲',n:'메뉴' ,d:'레시피 목록·검색'},
food :{i:'🥕',n:'재료' ,d:'재료도감·관찰·섭취분석'},
grow :{i:'📈',n:'성장' ,d:'성장곡선·측정기록'},
stock:{i:'📦',n:'재고' ,d:'재고관리·자동차감'},
calc :{i:'🧮',n:'계산' ,d:'배죽·분유·계량 등'},
log  :{i:'📝',n:'기록' ,d:'전체 기록·CSV'},
info :{i:'📖',n:'정보' ,d:'설정·출처·백업'}};
var TABDEF=['home','today','plan','menu','food','grow','stock','calc','log','info'];
var NAVK='b6.nav';
/* NAVC={order:[...], off:{tab:1}} */
var NAVC=LS(NAVK,null)||{order:TABDEF.slice(),off:{}};
function navSave(){localStorage.setItem(NAVK,JSON.stringify(NAVC))}
/* 저장된 순서에 새 탭이 생겼거나 사라진 것을 정리 */
function navNorm(){var o=(NAVC.order||[]).filter(function(t){return TABD[t]});
TABDEF.forEach(function(t){if(o.indexOf(t)<0)o.push(t)});
o=o.filter(function(t){return t!=='home'});o.unshift('home');   /* 홈은 항상 맨 앞 */
NAVC.order=o;NAVC.off=NAVC.off||{};delete NAVC.off.home;        /* 홈은 숨길 수 없다 */
return o}
function navList(){return navNorm().filter(function(t){return !NAVC.off[t]})}
/* nav 버튼 그리기 */
function navRender(){var w=document.getElementById('nvb');if(!w)return;
w.innerHTML=navList().map(function(t){var T=TABD[t];
return '<button data-t="'+t+'" class="'+(t===tab?'on':'')+'"><i>'+T.i+'</i>'+T.n+'</button>'}).join('')}

/*========== 탭 설정 모달 ==========*/
function navCfgOpen(){navNorm();navCfgDraw();
document.getElementById('md').classList.add('on');document.body.style.overflow='hidden'}
function navCfgDraw(){var o=navNorm(),on=navList().length;
document.getElementById('mb').innerHTML='<div class="mt2">⚙️ 탭 순서·표시 설정</div>'
+'<p class="mu" style="margin:6px 0 12px">▲▼ 로 순서를 바꾸고, 오른쪽 스위치로 <b>필요한 탭만</b> 남기세요. 숨긴 탭의 기능은 그대로 남아 있고 나중에 다시 켜면 됩니다.</p>'
+'<div class="cd" style="background:#F3F6FA;font-size:11.5px;padding:10px"><b>표시 중 '+on+'개</b> / 전체 '+o.length+'개 · <b>홈</b>은 항상 맨 앞에 고정됩니다.</div>'
+o.map(function(t,i){var T=TABD[t],off=!!NAVC.off[t],lock=(t==='home');
return '<div class="tcf'+(off?' off':'')+'"><div class="ti">'+T.i+'</div>'
+'<div class="tn">'+T.n+'<div class="td2">'+T.d+'</div></div>'
+(lock?'<span class="lk2">고정</span>'
:'<div class="tb2"><button onclick="navMove('+i+',-1)" '+(i<=1?'disabled':'')+'>▲</button>'
+'<button onclick="navMove('+i+',1)" '+(i>=o.length-1?'disabled':'')+'>▼</button></div>'
+'<div class="tsw'+(off?'':' on')+'" onclick="navToggle(\''+t+'\')"><i></i></div>')
+'</div>'}).join('')
+'<button class="btn g" style="margin-top:6px" onclick="navReset()">↩️ 기본 순서로 되돌리기</button>'
+'<button class="btn y" style="margin-top:8px" onclick="closeM()">닫기</button>'}
function navMove(i,d){var o=navNorm(),j=i+d;
if(i<=0||j<=0||j>=o.length)return;                /* home(0) 자리는 건드리지 않는다 */
var t=o[i];o[i]=o[j];o[j]=t;NAVC.order=o;navSave();
navCfgDraw();navRender()}
function navToggle(t){if(t==='home')return;
if(NAVC.off[t])delete NAVC.off[t];else{
  if(navList().length<=2)return alert('탭은 최소 2개는 남겨 두세요.');
  NAVC.off[t]=1;
  if(tab===t){tab='home'}}
navSave();navCfgDraw();navRender();render()}
function navReset(){if(!confirm('탭 순서와 표시를 기본값으로 되돌릴까요?'))return;
NAVC={order:TABDEF.slice(),off:{}};navSave();navCfgDraw();navRender();render()}

/*========== 부팅 ==========*/
function boot(){var B=document.body;
if(!baby){B.classList.add('solo');document.getElementById('ob').classList.remove('hd');
document.getElementById('mv').classList.add('hd');document.getElementById('nv').classList.add('hd');return}
B.classList.remove('solo');document.getElementById('ob').classList.add('hd');
document.getElementById('mv').classList.remove('hd');document.getElementById('nv').classList.remove('hd');
if(!selS)selS=curS().id==='ready'?'early':curS().id;
migLogs();updMark();navRender();render();notiCheck();netBanner();updBanner();updAuto();updSWHook()}

/*========== 렌더 ==========*/
var VIEW={home:vHome,today:vToday,stock:vStock,calc:vCalc,plan:vPlan,menu:vMenu,food:vFood,grow:vGrow,log:vLog,info:vInfo};
function render(){var s=curS(),T=TG();
document.getElementById('hdr').innerHTML='<button class="rfb'+(UPD.found?' new':'')+'" id="rfb" onclick="updCheck()" title="새로고침 · 업데이트 확인">🍼</button><div class="hg">TODAY · '+fmt(TD())+' · 이유식 '+MEALS()+'끼'+(T.w?' · '+T.w+'kg':'')+'</div><div class="hn">'+esc(baby.name)+' <span style="font-size:12px;font-weight:600;color:var(--sub)">아빠의 이유식 레시피</span></div><div class="ha">'+ageT()+'</div><span class="pl" style="background:'+s.c+'">'+s.n+' · '+s.lb+'</span>';
document.getElementById('vw').innerHTML=(VIEW[tab]||vHome)();
window.scrollTo(0,0);document.documentElement.scrollTop=0;document.body.scrollTop=0;
var bs=document.querySelectorAll('#nvb button');
for(var i=0;i<bs.length;i++)bs[i].className=bs[i].dataset.t===tab?'on':''}

/*========== 온라인 상태 ==========*/
function isOnline(){return navigator.onLine!==false}
function netWarn(what){return '<div class="alert mid"><span class="ic">📡</span><div><b>인터넷이 연결되어야 가능합니다.</b><br>'+(what||'이 기능')+'은 온라인 상태에서만 동작해요. 나머지 기능(기록·계산·영양분석)은 오프라인에서도 모두 사용할 수 있습니다.</div></div>'}
function netGuard(what){if(isOnline())return true;
alert('📡 인터넷이 연결되어야 가능합니다.\n\n'+(what||'이 기능')+'은 온라인 상태에서만 동작해요.\n기록·계산 등 나머지 기능은 오프라인에서도 그대로 쓸 수 있습니다.');
return false}
function netBanner(){var b=document.getElementById('nb');if(!b)return;
b.className=isOnline()?'nb':'nb on';
b.innerHTML=isOnline()?'':'📡 오프라인 — 기록·계산은 정상 작동합니다'}

/*========== 이벤트 ==========*/
document.getElementById('nv').addEventListener('click',function(e){var b=e.target.closest('button');
if(b&&b.dataset.t){tab=b.dataset.t;render()}});

/* 조리 단계 사진 업로드 */
document.getElementById('fi').addEventListener('change',function(e){var f=e.target.files[0];if(!f)return;
var rd=new FileReader();
rd.onload=function(ev){var im=new Image();
im.onload=function(){var W=340,sc=W/im.width,cv=document.createElement('canvas');
cv.width=W;cv.height=Math.round(im.height*sc);
cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);
ph[phT]=cv.toDataURL('image/jpeg',.6);save();
if(curR)document.getElementById('mb').innerHTML=rBody();render()};
im.src=ev.target.result};
rd.readAsDataURL(f);e.target.value=''});

/* 백업 JSON 불러오기 */
document.getElementById('fj').addEventListener('change',function(e){var f=e.target.files[0];if(!f)return;
var r=new FileReader();
r.onload=function(ev){try{var d=JSON.parse(ev.target.result);
if(!confirm('현재 데이터를 덮어씁니다. 계속할까요?'))return;
baby=d.baby||baby;logs=d.logs||[];tried=d.tried||{};myR=d.my||[];cubes=d.cubes||[];
ov=d.ov||{};ph=d.ph||{};plan=d.plan||null;obs=d.obs||[];fav=d.fav||{};grow=d.grow||[];
if(d.stock&&typeof STK!=='undefined'){STK=d.stock;stkSave()}
if(d.bowl&&typeof BW!=='undefined'){BW=d.bowl;bwSave()}
if(d.calc)localStorage.setItem('b6.calc',JSON.stringify(d.calc));
if(d.nav){NAVC=d.nav;navSave()}
save();alert('불러오기 완료!');boot()}catch(err){alert('파일을 읽을 수 없습니다.')}};
r.readAsText(f);e.target.value=''});

/*========== 시작 ==========*/
boot();

/*========== 오프라인 지원 ==========*/
window.addEventListener('online',function(){netBanner();render()});
window.addEventListener('offline',function(){netBanner()});
if('serviceWorker' in navigator&&location.protocol!=='file:'){
window.addEventListener('load',function(){
navigator.serviceWorker.register('./sw.js').catch(function(){})})}
