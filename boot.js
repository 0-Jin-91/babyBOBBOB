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
plan :{i:'🗓',n:'식단' ,d:'주간 식단·큐브'},
shop :{i:'🛒',n:'장보기',d:'장보기 목록·추천'},
menu :{i:'🍲',n:'메뉴' ,d:'레시피 목록·검색'},
food :{i:'🥕',n:'재료' ,d:'재료도감·관찰·섭취분석'},
grow :{i:'📈',n:'성장' ,d:'성장곡선·측정기록'},
stock:{i:'📦',n:'재고' ,d:'재고관리·자동차감'},
calc :{i:'🧮',n:'계산' ,d:'배죽·분유·계량 등'},
combo:{i:'🧩',n:'조합' ,d:'재료 궁합 점수·경고'},
log  :{i:'📝',n:'기록' ,d:'전체 기록·CSV'},
info :{i:'📖',n:'정보' ,d:'설정·출처·백업'}};
var TABDEF=['home','today','plan','menu','food','grow','stock','shop','calc','combo','log','info'];
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
return '<button data-t="'+t+'" class="'+(t===tab?'on':'')+'" title="'+T.d+'"><i>'+T.i+'</i>'+T.n+'</button>'}).join('')}

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
+'<div class="st">메뉴 표시 방식</div>'
+'<div class="cd"><div class="g2">'
+'<div class="nmc'+(NAVM==='drawer'?' on':'')+'" onclick="navModeSet(\'drawer\')"><b>☰ 숨김 (기본)</b><div class="mu" style="font-size:10.5px;margin-top:3px">평소엔 숨어 있고 왼쪽 위 ☰ 를 누르면 열립니다. 화면이 넓어집니다.</div></div>'
+'<div class="nmc'+(NAVM==='fixed'?' on':'')+'" onclick="navModeSet(\'fixed\')"><b>📌 항상 표시</b><div class="mu" style="font-size:10.5px;margin-top:3px">왼쪽에 늘 붙어 있습니다. 탭 이동이 한 번에 됩니다.</div></div>'
+'</div><div class="mu" style="font-size:10.5px;margin-top:8px">숨김 모드에서는 <b>화면 아래에 자주 쓰는 5개 탭</b>이 함께 표시됩니다.</div></div>'
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

/*========== 📱 왼쪽 메뉴 — 드로어 / 고정 모드 ==========*/
/* NAVM: 'drawer' = 숨겨져 있다가 ☰ 로 열기(기본) / 'fixed' = 항상 표시 */
var NAVMK='b6.navmode';
var NAVM=LS(NAVMK,null)||'drawer';
function navModeSet(m){NAVM=m;localStorage.setItem(NAVMK,JSON.stringify(m));
navApply();navRender();navCfgDraw&&document.getElementById('md').classList.contains('on')&&navCfgDraw();render()}
function navApply(){var b=document.body;
if(NAVM==='fixed'){b.classList.add('navfix');b.classList.remove('navdrw')}
else{b.classList.add('navdrw');b.classList.remove('navfix');navClose()}}
function navOpen(){if(NAVM==='fixed')return;
document.body.classList.add('nvon');navRender()}
function navClose(){document.body.classList.remove('nvon')}
function navToggleDrawer(){document.body.classList.contains('nvon')?navClose():navOpen()}

/*========== 부팅 ==========*/
function boot(){var B=document.body;
if(!baby){B.classList.add('solo');document.getElementById('ob').classList.remove('hd');
document.getElementById('mv').classList.add('hd');document.getElementById('nv').classList.add('hd');return}
B.classList.remove('solo');document.getElementById('ob').classList.add('hd');
document.getElementById('mv').classList.remove('hd');document.getElementById('nv').classList.remove('hd');
if(!selS)selS=curS().id==='ready'?'early':curS().id;
migLogs();updMark();if(typeof perSync==='function')perSync();navApply();navRender();render();notiCheck();netBanner();updBanner();updAuto();updSWHook();
/* 사진을 IndexedDB 에서 메모리로 올린다(+ localStorage 잔여분 이관).
   비동기이므로 먼저 화면을 띄우고, 끝나면 사진이 보이도록 다시 그린다.
   ★ 이관은 '복사 → 검증 → 원본 삭제' 순서라 중간에 끊겨도 유실이 없다. */
if(typeof phBoot==='function' && !window._phBooted){
  window._phBooted=1;
  phBoot().then(function(){ render(); if(typeof clPaint==='function')clPaint() })
          .catch(function(){ render() });
}
if(typeof clBoot==='function'){clBoot();clPaint()}
/* 이전 실행에서 이미 새 버전을 찾아뒀다면(오프라인 포함) 바로 안내 */
if(UPD.found)setTimeout(function(){updNag()},900)}

/*========== 렌더 ==========*/
var VIEW={home:vHome,today:vToday,stock:vStock,shop:vShopTab,calc:vCalc,combo:vCombo,plan:vPlan,menu:vMenu,food:vFood,grow:vGrow,log:vLog,info:vInfo};
function render(){var s=curS(),T=TG();
document.getElementById('hdr').innerHTML='<button class="rfb'+(UPD.found?' new':'')+'" id="rfb" onclick="updCheck()" title="새로고침 · 업데이트 확인">🍼</button><div class="hg">TODAY · '+fmt(TD())+' · 이유식 '+MEALS()+'끼'+(T.w?' · '+T.w+'kg':'')+'</div><div class="hn">'+esc(baby.name)+' <span style="font-size:12px;font-weight:600;color:var(--sub)">아빠의 이유식 레시피</span></div><div class="ha">'+ageT()+'</div><span class="pl" style="background:'+s.c+'">'+s.n+' · '+s.lb+'</span>';
/* 한 탭의 오류가 앱 전체(내비게이션 포함)를 멈추지 않게 감싼다.
   예전에는 vCombo 안의 오류로 조합 탭이 '아무 화면도 안 나오는' 상태가 됐다. */
try{document.getElementById('vw').innerHTML=(VIEW[tab]||vHome)()}
catch(err){
document.getElementById('vw').innerHTML='<div class="cd" style="background:#FFECEC;border-left:4px solid var(--rd)"><b style="font-size:14px">⚠️ 이 화면을 그리는 중 문제가 생겼어요</b>'
+'<div class="mu" style="font-size:11.5px;margin-top:6px;line-height:1.7">탭 <b>'+esc((TABD[tab]||{}).n||tab)+'</b> 에서 오류가 발생했습니다. 다른 탭은 정상적으로 쓸 수 있습니다.'
+'<br>기록·재고 데이터는 안전하게 보관돼 있습니다.</div>'
+'<div class="cd" style="background:#fff;font-size:11px;margin-top:8px;word-break:break-all"><b>오류 내용</b><div class="mu" style="margin-top:3px">'+esc(err&&err.message||String(err))+'</div></div>'
+'<button class="btn g s" style="margin-top:8px" onclick="tab=\'home\';render()">🏠 홈으로</button></div>';
if(window.console&&console.error)console.error('render('+tab+')',err)}
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
if(b&&b.dataset.t){tab=b.dataset.t;navClose();render()}});
/* 드로어 배경 클릭·ESC 로 닫기 */
var _sc=document.getElementById('nvsc');
if(_sc)_sc.addEventListener('click',navClose);
document.addEventListener('keydown',function(e){if(e.key==='Escape')navClose()});

/* 조리 단계 사진 업로드 ─────────────────────────────────────────────
   ★ 용량 절약 2단계: 가로 340→260px, 상한 200KB→70KB, WebP 우선.
     localStorage 한도(5MB 안팎)는 늘릴 수 없으므로 들어가는 크기를 줄인다.
     base64 는 원본보다 33% 크고, 사파리 계열은 문자당 2바이트로 세기도 해서
     장당 70KB 로 조이면 실질 확보량이 크다. WebP 는 같은 화질에서
     JPEG 보다 25~35% 작다 (iOS 14+ 지원). 미지원 기기는 JPEG 로 자동 폴백. */
var PH_W = 260;                       /* 저장 가로 픽셀 */
var PH_CAP = 70*1024;                 /* dataURL 상한 (문자 수) */

/* 이 브라우저가 WebP 로 인코딩할 수 있는가 — 한 번만 검사해 기억한다.
   미지원 브라우저는 요청을 무시하고 PNG 를 돌려주므로 접두사로 판별한다. */
var _webpOK = null;
function phWebpOK(){
  if(_webpOK===null){
    try{
      var t=document.createElement('canvas'); t.width=t.height=1;
      _webpOK = t.toDataURL('image/webp').indexOf('data:image/webp')===0;
    }catch(e){ _webpOK=false }
  }
  return _webpOK;
}

/* 이미지를 지정 가로폭으로 그린 캔버스 */
function phCanvas(im, w){
  var W=Math.min(w, im.width||w), sc=W/(im.width||W);
  var cv=document.createElement('canvas');
  cv.width=W; cv.height=Math.max(1, Math.round((im.height||W)*sc));
  var cx=cv.getContext('2d');
  cx.fillStyle='#fff'; cx.fillRect(0,0,cv.width,cv.height);   /* 투명 PNG 대비 */
  cx.drawImage(im,0,0,cv.width,cv.height);
  return cv;
}

/* 상한에 들어갈 때까지 품질 → 해상도 순으로 낮춘다.
   해상도를 먼저 깎으면 글씨가 안 보이므로 품질을 먼저 내린다. */
function phEncode(im){
  var webp=phWebpOK(), type=webp?'image/webp':'image/jpeg';
  var widths=[PH_W, 210, 170], qs=webp?[.72,.6,.5,.4]:[.6,.5,.42,.34];
  var best=null;
  for(var wi=0; wi<widths.length; wi++){
    var cv=phCanvas(im, widths[wi]);
    for(var qi=0; qi<qs.length; qi++){
      var d=cv.toDataURL(type, qs[qi]);
      if(best===null || d.length<best.length) best=d;
      if(d.length<=PH_CAP) return d;
    }
  }
  return best;                        /* 끝까지 못 줄이면 가장 작은 것 */
}

document.getElementById('fi').addEventListener('change',function(e){var f=e.target.files[0];if(!f)return;
var rd=new FileReader();
rd.onload=function(ev){var im=new Image();
im.onerror=function(){alert('이미지를 읽을 수 없어요. 다른 사진으로 시도해 주세요.')};
im.onload=function(){
var d=phEncode(im);
/* ★ savePh: 저장 실패 시 메모리 상태를 되돌려
   '화면엔 보이는데 저장은 안 된' 사진이 남지 않게 한다 */
savePh(phT,d);
if(curR)document.getElementById('mb').innerHTML=rBody();render()};
im.src=ev.target.result};
rd.onerror=function(){alert('파일을 읽을 수 없어요.')};
rd.readAsDataURL(f);e.target.value=''});

/* 백업 JSON 불러오기 */
document.getElementById('fj').addEventListener('change',function(e){var f=e.target.files[0];if(!f)return;
var r=new FileReader();
r.onload=function(ev){try{var d=JSON.parse(ev.target.result);
if(!confirm('현재 데이터를 덮어씁니다. 계속할까요?'))return;
/* 슬림 형식으로 저장된 백업도 읽을 수 있게 되살린다 (logFull/obsFull/growFull) */
baby=d.baby||baby;logs=(d.logs||[]).map(logFull);tried=d.tried||{};myR=d.my||[];cubes=d.cubes||[];
ov=d.ov||{};plan=d.plan||null;obs=(d.obs||[]).map(obsFull);fav=d.fav||{};grow=(d.grow||[]).map(growFull);
/* 사진은 IndexedDB 로 복원한다 (phStore 가 IDB→localStorage 폴백까지 처리) */
var _rph=d.ph||{};ph={};
if(typeof PHN!=='undefined'){for(var _k in PHN)delete PHN[_k]}
if(typeof PHB!=='undefined'){for(var _k2 in PHB)delete PHB[_k2]}
Object.keys(_rph).reduce(function(ch,k){
 return ch.then(function(){return (typeof phStore==='function')?phStore(k,_rph[k]):(ph[k]=_rph[k])});
},Promise.resolve()).then(function(){if(typeof render==='function')render()});
if(d.stock&&typeof STK!=='undefined'){STK=d.stock;stkSave()}
if(d.bowl&&typeof BW!=='undefined'){BW=d.bowl;bwSave()}
if(d.calc)localStorage.setItem('b6.calc',JSON.stringify(d.calc));
if(d.nav){NAVC=d.nav;navSave()}
if(d.navm){NAVM=d.navm;localStorage.setItem(NAVMK,JSON.stringify(d.navm))}
if(d.sec&&typeof SEC!=='undefined'){SEC=d.sec;secSave()}
if(d.cmix&&typeof CMIX!=='undefined'){CMIX=d.cmix;cmSave()}
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
