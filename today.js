/*========== 📅 오늘 — 하루 기록 관리 ==========*/
var tdD=null;                      /* 보고 있는 날짜(fmt). null = 오늘 */
function tdDate(){return tdD||fmt(TD())}
function tdIsToday(){return tdDate()===fmt(TD())}
function tdShift(n){var a=tdDate().split('.');
var d=new Date(+a[0],+a[1]-1,+a[2]);d=addD(d,n);
if(d>TD())return;
tdD=fmt(d);render()}
function tdLogs(){var d=tdDate();
return logs.filter(function(l){return l.d===d})
.sort(function(a,b){return hm2min(a.tm||'99:99')-hm2min(b.tm||'99:99')})}
function tdSum(){var f={p:0,fe:0,ca:0,zn:0},m={p:0,fe:0,ca:0,zn:0},ml=0,cnt=0;
tdLogs().forEach(function(l){
if(l.k==='milk'){ml+=+l.ml||0;var n=milkNut(+l.ml||0,l.mt||MTYPE());
NK.forEach(function(k){m[k]+=n[k]})}
else{cnt++;NK.forEach(function(k){f[k]+=(l.nu&&l.nu[k])||0})}});
return {f:f,m:m,ml:ml,cnt:cnt}}

/*----- 메인 뷰 -----*/
function vToday(){var D=tdSum(),T=TG(),sl=SLOTS(),rec=todayRec(),DY=mlDay(),G=mlGuide();
var L=tdLogs(),ms=L.filter(function(l){return l.k==='milk'}),fs=L.filter(function(l){return l.k!=='milk'});
var mlPc=Math.min(150,D.ml/Math.max(1,(DY.lo+DY.hi)/2)*100);
var solidPc=0;NK.forEach(function(k){solidPc+=D.f[k]/Math.max(.01,T.solid[k])*100});solidPc/=NK.length;
return tdHead()

/*----- 한눈에 요약 -----*/
+'<div class="cd"><div class="g2">'
+'<div class="tsum"><div class="tsi">🍲</div><div><b>'+D.cnt+' / '+MEALS()+'끼</b><div class="mu" style="font-size:10px">이유식 '+Math.round(solidPc)+'%</div></div></div>'
+'<div class="tsum"><div class="tsi">🍼</div><div><b>'+D.ml+'ml</b><div class="mu" style="font-size:10px">수유 '+ms.length+'회 · '+Math.round(mlPc)+'%</div></div></div>'
+'</div>'
+'<div class="bar" style="height:12px;margin-top:9px"><i class="solid" style="width:'+Math.min(100,solidPc)+'%;background:#3FAE8E"></i><span class="goal" style="left:calc(100% - 3px)"></span></div>'
+'<div class="bar" style="height:12px;margin-top:5px"><i class="solid" style="width:'+Math.min(100,mlPc)+'%;background:#7FB5E8"></i><span class="goal" style="left:calc(100% - 3px)"></span></div>'
+'<div class="mu" style="font-size:10px;margin-top:6px">🍲 이유식 목표 대비 · 🍼 권장 '+DY.lo+'~'+DY.hi+'ml 대비</div></div>'

/*----- 끼니별 체크리스트 -----*/
+'<div class="st">🍽 오늘 '+MEALS()+'끼</div>'
+sl.map(function(s,i){var r=rec[i],hit=null;
fs.forEach(function(l){if(l.t===s||(r&&(l.rid===r.i||l.n===r.n)))hit=l});
return tdSlot(s,r,hit,i)}).join('')

/*----- 수유 -----*/
+'<div class="st">🍼 수유 <span class="mu" style="font-weight:600;font-size:11.5px">· 권장 회당 '+G.per[0]+'~'+G.per[1]+'ml · 하루 '+G.cnt[0]+'~'+G.cnt[1]+'회</span></div>'
+'<div class="cd">'+(tdIsToday()?tdMilkQuick():'')
+(ms.length?ms.map(function(l,i){return '<div class="mrow"><span class="mno">'+(i+1)+'회</span><span class="mtm">'+(l.tm||'--:--')+'</span>'
+'<button class="mml" onclick="editMilk(\''+l.id+'\')">'+l.ml+'ml</button>'
+'<span class="mu" style="font-size:10px;flex:1">'+MILK[l.mt||MTYPE()].n+'</span>'
+'<button class="mx" onclick="delMilk(\''+l.id+'\')">✕</button></div>'}).join('')
:'<div class="mu" style="font-size:11.5px;padding:8px 0;text-align:center">수유 기록이 없어요.</div>')+'</div>'

/*----- 간식 · 직접 기록 -----*/
+'<div class="st">➕ 그 밖의 기록</div>'
+'<div class="cd"><div class="rw"><button class="btn g s" onclick="tdFree()">🍽 간식·직접 입력</button><button class="btn y s" onclick="tab=\'log\';render()">📝 상세 기록 탭</button></div></div>'

/*----- 타임라인 -----*/
+(L.length?'<div class="st">🕐 하루 흐름</div><div class="cd">'+tdTimeline(L)+'</div>'+gapCard(tdDate()):'')

/*----- 영양 -----*/
+(L.length?'<div class="st">📊 '+(tdIsToday()?'오늘':tdDate())+' 영양 달성</div><div class="cd">'+stackBars(D.f,D.m,T.day)+'</div>':'')
+'<p class="mu" style="text-align:center;font-size:10.5px;margin:14px 6px 0">기록을 눌러 언제든 양·시간을 고치거나 지울 수 있어요.</p>'}

/*----- 날짜 헤더 -----*/
function tdHead(){var d=tdDate(),a=d.split('.'),dt=new Date(+a[0],+a[1]-1,+a[2]);
var DW=['일','월','화','수','목','금','토'];
return '<div class="cd" style="padding:9px 10px"><div class="rw" style="justify-content:space-between;align-items:center">'
+'<button class="tdnav" onclick="tdShift(-1)">‹</button>'
+'<div style="text-align:center"><b style="font-size:14.5px">'+(tdIsToday()?'오늘':(+a[1])+'월 '+(+a[2])+'일')+' <span class="mu" style="font-weight:600">('+DW[dt.getDay()]+')</span></b>'
+'<div class="mu" style="font-size:10px">'+d+' · 생후 '+Math.floor((dt-d0(baby.birth))/864e5)+'일</div></div>'
+'<button class="tdnav'+(tdIsToday()?' off':'')+'" onclick="tdShift(1)">›</button></div>'
+(tdIsToday()?'':'<button class="btn g s" style="margin-top:8px" onclick="tdD=null;render()">오늘로 돌아가기</button>')+'</div>'}

/*----- 끼니 카드 -----*/
function tdSlot(s,r,hit,i){
if(!r)return '';
var sc=mealScore(r),done=!!hit;
return '<div class="cd" style="padding:10px;border-left:4px solid '+(done?'var(--ok)':'var(--ln)')+'">'
+'<div class="rw" style="justify-content:space-between;align-items:center;margin-bottom:6px">'
+'<b style="font-size:12.5px;color:'+(done?'var(--ok)':'var(--pd)')+'">'+(done?'✅ ':'')+s+'</b>'
+'<span>'+(done?'<span class="mu" style="font-size:10.5px">🕐 '+(hit.tm||'--:--')+(hit.a?' · '+hit.a+'g':'')+' '+(hit.rx||'')+'</span>'
:'<button class="mu" style="font-weight:700;color:var(--bl)" onclick="openAlt('+i+')">🔄 대안</button>')+'</span></div>'
+'<div class="rw" style="align-items:center;gap:8px"><div style="flex:0 0 44px;height:34px;border-radius:8px;overflow:hidden">'+thumb(r)+'</div>'
+'<div style="flex:1" onclick="openR(\''+r.i+'\')"><b style="font-size:13px">'+esc(r.n)+'</b><div class="mu" style="font-size:10px">'+lvIco(sc)+' 1끼 영양 '+sc+'%</div></div></div>'
+(done?'<div class="rw" style="margin-top:8px"><button class="btn g s" onclick="openAteFor(\''+hit.id+'\')">⚖️ 먹은 양 수정</button><button class="btn y s" onclick="unLog(\''+hit.id+'\')">↩︎ 취소</button></div>'
+(hit.a?'':'<div class="mu" style="font-size:10px;margin-top:5px;color:var(--warn)">⚠️ 먹은 양 미입력 — 레시피 1회분으로 계산 중</div>')
:'<div class="rw" style="margin-top:8px"><button class="btn g s" onclick="qLog(\''+r.i+'\')">📝 먹었어요 (양 입력)</button><button class="btn y s" onclick="qFast(\''+r.i+'\')">⚡ 바로 기록</button></div>')
+'</div>'}

/*----- 수유 빠른 추가 -----*/
function tdMilkQuick(){var G=mlGuide();
return '<div class="mu" style="font-size:11px;font-weight:800;margin-bottom:6px">＋ 회차 추가</div>'
+'<div class="mlk" style="margin-bottom:9px">'+milkQuick().map(function(v){return '<button onclick="addMilk('+v+')">+'+v+'</button>'}).join('')
+'<button onclick="addMilkP()" style="background:#F5EFEA;color:var(--sub)">직접</button></div>'}

/*----- 타임라인 -----*/
function tdTimeline(L){var W=L.filter(function(l){return l.tm});
if(!W.length)return '<div class="mu" style="font-size:11px">시각이 기록된 항목이 없어요.</div>';
return '<div class="tl">'+W.map(function(l,i){var pv=i?hm2min(l.tm)-hm2min(W[i-1].tm):null;
return (pv!=null?'<div class="tlg">'+minTxt(pv)+' 뒤</div>':'')
+'<div class="tli" style="cursor:pointer" onclick="'+(l.k==='milk'?'editMilk':'openAteFor')+'(\''+l.id+'\')">'
+'<b class="tlt">'+l.tm+'</b><span class="tle">'+(l.k==='milk'?'🍼':l.rx||'🍲')+'</span>'
+'<span class="tln">'+esc(l.n)+(l.k==='milk'?'':(l.a?' · '+l.a+'g':''))+'</span>'
+'<span class="mu" style="font-size:10px;color:var(--bl);font-weight:700">수정</span></div>'}).join('')+'</div>'}

/*----- 빠른 기록 (양 없이) -----*/
function qFast(id){qLogNow(id);if(tab!=='today')tab='today';render()}

/*----- 간식 · 자유 기록 -----*/
function tdFree(){var ks=Object.keys(NUT);
document.getElementById('mb').innerHTML='<div class="mt2">🍽 간식 · 직접 기록</div>'
+'<p class="mu" style="margin:6px 0 10px">이유식 외에 먹은 것을 남겨두세요. 재료를 넣으면 영양도 함께 계산됩니다.</p>'
+'<div class="cd"><div class="fd" style="margin:0"><label>무엇을 먹었나요?</label><input id="tfN" placeholder="예: 바나나 간식"></div>'
+'<div class="rw" style="margin-top:9px"><div class="fd" style="flex:1;margin:0"><label>시각</label><input id="tfT" type="time" value="'+nowHM()+'"></div>'
+'<div class="fd" style="flex:1;margin:0"><label>양(g)</label><input id="tfA" type="number" placeholder="30"></div>'
+'<div class="fd" style="flex:.8;margin:0"><label>반응</label><select id="tfR"><option>😋</option><option>😐</option><option>😖</option></select></div></div></div>'
+'<div class="cd" style="background:#FBF6F2"><b style="font-size:12.5px">🥕 재료 (선택)</b>'
+'<div class="ei" style="margin-top:8px"><select id="tfK" style="flex:1.4" onchange="document.getElementById(\'tfIN\').value=this.value"><option value="">— 재료 선택 —</option>'+ks.map(function(k){return '<option>'+k+'</option>'}).join('')+'</select><input id="tfIN" style="flex:1" placeholder="직접 입력"><input id="tfQ" style="flex:.6" type="number" placeholder="20"><select id="tfU" style="flex:.5"><option>g</option><option>ml</option><option>개</option><option>방울</option></select></div>'
+'<button class="btn g s" onclick="tfAdd()">＋ 재료 추가</button>'
+(TF.length?'<div style="margin-top:9px">'+TF.map(function(x,i){return '<div class="ir"><span>'+esc(x[0])+'</span><b>'+x[1]+x[2]+' <button style="color:var(--mt);padding:0 4px" onclick="TF.splice('+i+',1);tdFree()">✕</button></b></div>'}).join('')+'</div>':'')
+'</div>'
+'<button class="btn" onclick="tfSave()">기록 저장</button>'
+'<button class="btn y" style="margin-top:8px" onclick="TF=[];closeM()">취소</button>';
document.getElementById('md').classList.add('on');document.body.style.overflow='hidden'}
var TF=[];
function tfAdd(){var k=document.getElementById('tfK').value,n=document.getElementById('tfIN').value.trim()||k;
var q=+document.getElementById('tfQ').value,u=document.getElementById('tfU').value;
if(!n)return alert('재료를 선택하거나 입력해 주세요');
if(!q)return alert('양을 입력해 주세요');
TF.push([n,q,u,k||(NUT[n]?n:'')]);tdFree()}
function tfSave(){var n=document.getElementById('tfN').value.trim(),tm=document.getElementById('tfT').value||nowHM();
var a=document.getElementById('tfA').value,rx=document.getElementById('tfR').value;
if(!n&&!TF.length)return alert('내용을 입력해 주세요');
var nu=TF.length?nutOf({g:TF,sv:1}).t:null;
logs.push({id:''+Date.now(),d:fmt(TD()),n:n||'간식',a:a,t:'간식',tm:tm,rx:rx,nu:nu,gs:TF.slice()});
TF=[];save();closeM();if(tab!=='today')tab='today';render()}
