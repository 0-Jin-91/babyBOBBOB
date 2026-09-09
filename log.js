/*========== 기록 탭 ==========*/
/* 로그 스키마
   이유식: {id,d,n,a,t,tm,rx,nu,gs:[[재료,g,단위,영양키]],rid}
   수유:   {id,d,k:'milk',ml,mt,n,t,tm}
   tm = 'HH:MM' 실제 먹은 시각 */

function nowHM(){var d=new Date();return ('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)}
function hm2min(s){if(!s)return null;var a=(''+s).split(':');return (+a[0]||0)*60+(+a[1]||0)}
function minTxt(m){if(m==null)return '';var h=Math.floor(m/60),i=m%60;
return (h?h+'시간 ':'')+(i?i+'분':(h?'':'0분'))}
function slotOf(tm){var m=hm2min(tm);if(m==null)return '';
return m<10*60?'아침':m<14*60?'점심':m<18*60?'저녁':'밤'}

/*----- 간격 분석 -----*/
function gapsOf(d){var L=logs.filter(function(l){return l.d===d&&l.tm}).map(function(l){
return {t:hm2min(l.tm),k:l.k==='milk'?'m':'f',n:l.n,ml:l.ml}}).sort(function(a,b){return a.t-b.t});
var out=[];
for(var i=1;i<L.length;i++)out.push({from:L[i-1],to:L[i],gap:L[i].t-L[i-1].t});
return {list:L,gaps:out}}
function gapCard(d){var G=gapsOf(d);if(G.list.length<2)return '';
var mn=999,mx=0,sum=0;
G.gaps.forEach(function(g){if(g.gap<mn)mn=g.gap;if(g.gap>mx)mx=g.gap;sum+=g.gap});
var avg=Math.round(sum/G.gaps.length);
var tight=G.gaps.filter(function(g){return g.gap<120});
var first=G.list[0],last=G.list[G.list.length-1];
return '<div class="cd" style="background:#F3F6FA;font-size:12px"><b>⏰ 시간 분석</b>'
+'<div class="ir" style="margin-top:6px"><span>첫 끼 · 마지막 끼</span><b>'+first.n.slice(0,8)+' '+minHM(first.t)+' → '+minHM(last.t)+'</b></div>'
+'<div class="ir"><span>평균 간격</span><b>'+minTxt(avg)+'</b></div>'
+'<div class="ir"><span>가장 짧은 간격</span><b style="color:'+(mn<120?'var(--warn)':'var(--ok)')+'">'+minTxt(mn)+'</b></div>'
+(tight.length?'<p class="mu" style="margin:7px 0 0">⚠️ <b>2시간 미만 간격이 '+tight.length+'번</b> 있었어요. 배가 덜 고픈 상태로 먹으면 이유식을 잘 안 먹을 수 있습니다. 이유식은 <b>수유 30분~1시간 전</b>, 배고플 때 주는 것이 좋아요.</p>':'<p class="mu" style="margin:7px 0 0">✅ 끼니 간격이 <b>2시간 이상</b>으로 적절합니다.</p>')
+(hm2min(last.tm||minHM(last.t))>21*60?'<p class="mu" style="margin:5px 0 0">🌙 마지막 수유가 <b>밤 9시 이후</b>였어요. 늦은 수유는 밤중 깨는 횟수와 관련될 수 있습니다.</p>':'')
+'</div>'}
function minHM(m){return ('0'+Math.floor(m/60)).slice(-2)+':'+('0'+(m%60)).slice(-2)}

/*----- 타임라인 -----*/
function timeline(arr){var L=arr.filter(function(l){return l.tm}).sort(function(a,b){return hm2min(a.tm)-hm2min(b.tm)});
if(!L.length)return '';
return '<div class="tl">'+L.map(function(l,i){var pv=i?hm2min(l.tm)-hm2min(L[i-1].tm):null;
return (pv!=null?'<div class="tlg">'+minTxt(pv)+' 뒤</div>':'')
+'<div class="tli"><b class="tlt">'+l.tm+'</b><span class="tle">'+(l.k==='milk'?'🍼':l.rx||'🍲')+'</span><span class="tln">'+esc(l.n)+'</span></div>'}).join('')+'</div>'}

/*========== 뷰 ==========*/
function vLog(){var by={};
logs.slice().reverse().forEach(function(l){(by[l.d]=by[l.d]||[]).push(l)});
var si=IDS.indexOf(curS().id==='ready'?'early':curS().id),op=RCP().filter(function(r){return r.s===si}),D=todaySum(),T=TG();
var td=fmt(TD());
return '<div class="cd" style="background:#FBF6F2"><b>오늘 요약</b><div class="rw" style="margin-top:7px">'
+[['이유식',D.cnt+'끼'],['수유',D.ml+'ml'],['단백질',rnd(D.f.p+D.m.p)+'g'],['철분',rnd(D.f.fe+D.m.fe)+'mg']].map(function(x){return '<div style="flex:1;text-align:center;background:#fff;border-radius:9px;padding:8px 2px"><div class="mu" style="font-size:10px">'+x[0]+'</div><b style="font-size:14px">'+x[1]+'</b></div>'}).join('')+'</div></div>'
+(gapCard(td)||'')

/*----- 이유식 기록 입력 -----*/
+'<div class="cd"><b style="font-size:15px">📝 이유식 기록</b>'
+'<div class="fd" style="margin:12px 0 10px"><label>메뉴</label><input id="gN" list="gL" placeholder="메뉴명 입력 또는 선택" oninput="pickMenuIng(this.value)"><datalist id="gL">'+op.map(function(r){return '<option>'+esc(r.n)+'</option>'}).join('')+'</datalist></div>'
+'<div class="rw"><div class="fd" style="flex:1;margin:0"><label>먹은 시각</label><input id="gTm" type="time" value="'+nowHM()+'"></div><div class="fd" style="flex:1;margin:0"><label>먹은 양(g)</label><input id="gA" type="number" placeholder="80"></div></div>'
+'<button class="btn g s" style="margin-top:8px" onclick="openScale(\'gA\')">⚖️ 그릇 무게로 계산하기</button>'
+'<div class="mu" style="font-size:10.5px;margin-top:6px">시각을 남기면 <b>끼니 간격·수유 리듬</b>을 자동 분석해 드려요.</div>'
+ingPicker()
+'<div class="fd" style="margin:12px 0 10px"><label>반응</label><div class="ch">'+['😋','😐','😖'].map(function(x){return '<button class="'+(lRx===x?'on':'')+'" onclick="lRx=\''+x+'\';render()">'+x+'</button>'}).join('')+'</div></div>'
+'<button class="btn" onclick="addLog()">이유식 기록 저장</button>'

/*----- 수유 기록 입력 -----*/
+'<div class="hr"></div><div class="rw"><div class="fd" style="flex:1;margin:0"><label>🍼 수유(ml)</label><input id="mV" type="number" value="'+(baby.vol||mlGuide().per[0])+'"></div><div class="fd" style="flex:.9;margin:0"><label>시각</label><input id="mTm" type="time" value="'+nowHM()+'"></div><div class="fd" style="flex:.8;margin:0"><label>종류</label><select id="mT"><option value="f" '+(MTYPE()==='f'?'selected':'')+'>분유</option><option value="b" '+(MTYPE()==='b'?'selected':'')+'>모유</option></select></div></div>'
+'<div class="mu" style="font-size:10.5px;margin-top:6px">'+mlGuide().lb+' 권장 — 회당 <b>'+mlGuide().per[0]+'~'+mlGuide().per[1]+'ml</b> · 하루 <b>'+mlGuide().cnt[0]+'~'+mlGuide().cnt[1]+'회</b> (총 '+mlDay().lo+'~'+mlDay().hi+'ml)</div>'
+'<button class="btn g s" style="margin-top:9px" onclick="addMilk2()">＋ 수유 기록 추가</button></div>'

/*----- 지난 기록 -----*/
+'<div class="st">지난 기록 '+(logs.length?'('+logs.length+')':'')+'</div>'
+(logs.length?Object.keys(by).map(function(d){var s={p:0,fe:0,ca:0,zn:0},ml=0;
by[d].forEach(function(l){if(l.k==='milk'){ml+=+l.ml||0;var n=milkNut(+l.ml||0,l.mt||MTYPE());
NK.forEach(function(k){s[k]+=n[k]})}
else{NK.forEach(function(k){s[k]+=(l.nu&&l.nu[k])||0})}});
var pp=Math.round(s.p/T.day.p*100);
return '<div class="cd"><div class="rw" style="justify-content:space-between;align-items:center"><b style="font-size:13px;color:var(--pd)">'+d+'</b><span class="badge '+lvl(pp)+'">'+lvIco(pp)+' 단백질 '+pp+'%</span></div><div class="mu" style="font-size:10px;margin:3px 0 4px">단백 '+rnd(s.p)+'g · 철 '+rnd(s.fe)+'mg · 칼슘 '+Math.round(s.ca)+'mg · 수유 '+ml+'ml</div>'
+timeline(by[d])
+by[d].map(function(l){return '<div class="lg2"><div style="font-size:19px">'+(l.k==='milk'?'🍼':l.rx||'🍲')+'</div><div style="flex:1"><b style="font-size:13.5px">'+esc(l.n)+'</b><div class="mu" style="font-size:10px">'+(l.tm?'🕐 '+l.tm+' · ':'')+(l.t||'')+(l.a?' · '+l.a+'g':'')+(l.gs&&l.gs.length?' · 재료 '+l.gs.length+'종':'')+'</div></div>'
+'<button class="mu" style="font-size:13px;padding:2px 5px;color:var(--bl);font-weight:700" onclick="editLog(\''+l.id+'\')">수정</button>'
+'<button class="mu" style="font-size:16px;padding:2px 6px" onclick="delLog(\''+l.id+'\')">✕</button></div>'}).join('')+'</div>'}).join('')
:'<div class="cd mu">아직 기록이 없어요.</div>')
+(logs.length?'<button class="btn y s" onclick="csv()">CSV로 내보내기</button>':'')}

/*========== ⚖️ 그릇 무게 계산기 ==========*/
var SC={tg:'gA',pre:'',post:''};
function openScale(tg){SCBACK='drawScale';SC={tg:tg||'gA',pre:'',post:''};drawScale();
document.getElementById('md').classList.add('on');document.body.style.overflow='hidden'}
function drawScale(){var b=bwCur(),bwt=b?b.w:0;
document.getElementById('mb').innerHTML='<div class="mt2">⚖️ 그릇 무게로 먹은 양 계산</div>'
+'<p class="mu" style="margin:6px 0 10px">그릇째 저울에 올린 무게를 그대로 넣으면 됩니다. 그릇 무게는 자동으로 빠집니다.</p>'
+'<div class="cd"><div class="rw" style="justify-content:space-between;align-items:center"><b style="font-size:12.5px">🥣 사용 중인 그릇</b><button class="mu" style="color:var(--bl);font-weight:700" onclick="scMgr()">관리 ›</button></div>'
+(BW.list.length?'<div class="ch" style="margin-top:7px">'+BW.list.map(function(x){return '<button class="'+(BW.cur===x.id?'on':'')+'" onclick="bwSet(\''+x.id+'\');bwPick(this);scLive()">'+esc(x.n)+' '+x.w+'g</button>'}).join('')+'</div>':'<div class="mu" style="margin-top:6px">등록된 그릇이 없어요. 관리에서 추가해 주세요.</div>')
+'</div>'
+'<div class="cd"><div class="fd" style="margin:0"><label>① 먹이기 전 무게 (그릇 포함, g)</label><input id="scPre" type="number" step="0.1" inputmode="decimal" value="'+SC.pre+'" oninput="SC.pre=this.value;scLive()" placeholder="'+(bwt+80)+'"></div>'
+'<div class="fd" style="margin:10px 0 0"><label>② 먹인 후 무게 (그릇 포함, g)</label><input id="scPost" type="number" step="0.1" inputmode="decimal" value="'+SC.post+'" oninput="SC.post=this.value;scLive()" placeholder="'+(bwt+15)+'"></div>'
+'<div class="mu" style="font-size:10.5px;margin-top:7px">그릇 무게 <b>'+bwt+'g</b>을 양쪽에서 빼고 계산합니다.</div></div>'
+'<div id="scres">'+scResHTML()+'</div>'
+'<div id="scbtn">'+scBtnHTML()+'</div>'
+'<button class="btn y" style="margin-top:8px" onclick="closeM()">취소</button>';
document.getElementById('md').classList.add('on')}
function scResHTML(){var b=bwCur(),bwt=b?b.w:0;
var pre=+SC.pre||0,post=+SC.post||0,ate=ateOf(pre,post);
var served=pre?Math.round((pre-bwt)*10)/10:0,left=post?Math.round((post-bwt)*10)/10:0;
var rate=served>0?Math.round(ate/served*100):0;
return '<div class="cd" style="background:'+(ate?'#F3FAF7':'#FBF6F2')+'"><div class="ir"><span>담아준 양</span><b>'+(served>0?served+'g':'-')+'</b></div>'
+'<div class="ir"><span>남긴 양</span><b>'+(post?Math.max(0,left)+'g':'-')+'</b></div>'
+'<div class="ir" style="border:0"><span style="font-weight:800">실제 먹은 양</span><b style="font-size:19px;color:var(--pd)">'+(ate?ate+'g':'-')+'</b></div>'
+(ate&&served>0?'<div class="bar" style="height:15px;margin-top:6px"><i class="solid" style="width:'+Math.min(100,rate)+'%;background:#3FAE8E"></i></div><div class="mu" style="font-size:10.5px;margin-top:4px">담아준 양의 <b>'+rate+'%</b>를 먹었어요'+(rate>=80?' 👍':rate<50?' — 오늘은 입맛이 없었나 봐요':'')+'</div>':'')
+'</div>'}
function scBtnHTML(){var ate=ateOf(SC.pre,SC.post);
return ate?'<button class="btn" onclick="scApply()">✓ '+ate+'g 으로 입력하기</button>'
:'<button class="btn" style="opacity:.45" onclick="alert(\'두 무게를 모두 입력해 주세요\')">먹은 양이 계산되면 활성화</button>'}
function bwPick(el){var p=el.parentNode,bs=p.getElementsByTagName('button');
for(var i=0;i<bs.length;i++)bs[i].className='';
el.className='on'}
function scLive(){var r=document.getElementById('scres'),b=document.getElementById('scbtn');
if(r)r.innerHTML=scResHTML();
if(b)b.innerHTML=scBtnHTML()}
function scApply(){var ate=ateOf(SC.pre,SC.post);
if(!ate)return alert('두 무게를 모두 입력해 주세요');
closeM();
if(SC.tg==='EL'){EL.a=ate;drawEL();return}
var el=document.getElementById(SC.tg);
if(el){el.value=ate}else{render();setTimeout(function(){var e2=document.getElementById(SC.tg);if(e2)e2.value=ate},60)}}
var SCBACK='drawScale';
function scBack(){if(SCBACK==='drawAte')drawAte();else drawScale()}
function scMgr(){scMgrCore(SCBACK)}
function scMgrCore(back){SCBACK=back||SCBACK;document.getElementById('mb').innerHTML='<div class="mt2">🥣 그릇 무게 관리</div>'
+'<p class="mu" style="margin:6px 0 10px">자주 쓰는 그릇의 <b>빈 무게</b>를 미리 등록해 두면 매번 재지 않아도 됩니다.</p>'
+(BW.list.length?'<div class="cd">'+BW.list.map(function(x){return '<div class="cb"><div style="flex:1"><b style="font-size:13.5px">'+esc(x.n)+'</b>'+(BW.cur===x.id?' <span class="tg p">사용 중</span>':'')+'<div class="mu" style="font-size:10.5px">빈 무게 '+x.w+'g</div></div>'
+'<button class="mu" style="color:var(--bl);font-weight:700;padding:0 6px" onclick="bwSet(\''+x.id+'\');scMgr()">선택</button>'
+'<button class="mu" style="font-size:15px;padding:0 5px" onclick="bwDel(\''+x.id+'\');scMgr()">✕</button></div>'}).join('')+'</div>':'<div class="cd mu">등록된 그릇이 없어요.</div>')
+'<div class="cd"><b style="font-size:12.5px">＋ 새 그릇 등록</b>'
+'<div class="rw" style="margin-top:8px"><div class="fd" style="flex:1.4;margin:0"><label>이름</label><input id="bwN" placeholder="실리콘 그릇"></div><div class="fd" style="flex:.8;margin:0"><label>빈 무게(g)</label><input id="bwW" type="number" step="0.1" placeholder="120"></div></div>'
+'<button class="btn g s" style="margin-top:9px" onclick="bwNew()">＋ 등록</button>'
+'<div class="mu" style="font-size:10.5px;margin-top:7px">빈 그릇만 저울에 올려 나온 숫자를 넣으세요.</div></div>'
+'<button class="btn" onclick="scBack()">‹ 계산기로 돌아가기</button>'
+'<button class="btn y" style="margin-top:8px" onclick="closeM()">닫기</button>'}
function bwNew(){var n=document.getElementById('bwN').value.trim(),w=+document.getElementById('bwW').value;
if(!n)return alert('그릇 이름을 입력해 주세요');
if(!w)return alert('빈 무게를 입력해 주세요');
bwAdd(n,w);scMgrCore(SCBACK)}

/*========== 재료별 입력 UI ==========*/
var LG=[];
function ingPicker(){var ks=Object.keys(NUT);
return '<div class="cd" style="background:#FBF6F2;margin:12px 0 0;padding:10px"><b style="font-size:12.5px">🥕 뭘 얼마나 먹였나요? (선택)</b>'
+'<div class="mu" style="font-size:10.5px;margin:3px 0 8px">재료를 넣으면 <b>실제 먹은 재료 기준</b>으로 영양이 계산됩니다. 메뉴를 고르면 자동으로 채워져요.</div>'
+(LG.length?LG.map(function(x,i){return '<div class="ei"><input style="flex:1.4" value="'+esc(x[0])+'" oninput="LG['+i+'][0]=this.value"><input style="flex:.62" type="number" step="0.1" value="'+x[1]+'" oninput="LG['+i+'][1]=+this.value;reLog()"><select style="flex:.52" onchange="LG['+i+'][2]=this.value;reLog()">'+['g','ml','개','방울'].map(function(u){return '<option '+(x[2]===u?'selected':'')+'>'+u+'</option>'}).join('')+'</select><select style="flex:1" onchange="LG['+i+'][3]=this.value;reLog()"><option value="">영양 미반영</option>'+ks.map(function(k){return '<option '+(x[3]===k?'selected':'')+'>'+k+'</option>'}).join('')+'</select><button style="color:var(--sub)" onclick="LG.splice('+i+',1);reLog()">✕</button></div>'}).join('')
:'<div class="mu" style="font-size:11px">아직 재료가 없어요. 아래에서 추가하거나 메뉴를 선택하세요.</div>')
+'<div class="ei" style="margin-top:8px"><select id="lK" style="flex:1.4" onchange="document.getElementById(\'lN\').value=this.value"><option value="">— 재료 선택 —</option>'+ks.map(function(k){return '<option>'+k+'</option>'}).join('')+'</select><input id="lN" style="flex:1" placeholder="직접 입력"><input id="lQ" style="flex:.6" type="number" placeholder="20"><select id="lU" style="flex:.5"><option>g</option><option>ml</option><option>개</option><option>방울</option></select></div>'
+'<button class="btn g s" onclick="addLogIng()">＋ 재료 추가</button>'
+(LG.length?'<div class="mu" style="font-size:10.5px;margin-top:7px">'+lgSum()+'</div>':'')+'</div>'}
function lgSum(){var n=nutOf({g:LG,sv:1}).t;
return '합계 — 단백 <b>'+rnd(n.p)+'g</b> · 철 <b>'+rnd(n.fe)+'mg</b> · 칼슘 <b>'+Math.round(n.ca)+'mg</b> · 아연 <b>'+rnd(n.zn)+'mg</b>'}
function addLogIng(){var k=document.getElementById('lK').value,n=document.getElementById('lN').value.trim()||k;
var q=+document.getElementById('lQ').value,u=document.getElementById('lU').value;
if(!n)return alert('재료를 선택하거나 입력해 주세요');
if(!q)return alert('양을 입력해 주세요');
LG.push([n,q,u,k||(NUT[n]?n:'')]);reLog()}
function reLog(){render()}
function pickMenuIng(nm){var r=null;RCP().forEach(function(x){if(x.n===nm)r=x});
if(!r||LG.length)return;
var sv=r.sv||1;
LG=(r.g||[]).map(function(x){return [x[0],Math.round((+x[1]||0)/sv*10)/10,x[2],x[3]||'']});
render()}

/*========== 기록 추가 ==========*/
function addMilk2(){var v=+document.getElementById('mV').value,t=document.getElementById('mT').value,tm=document.getElementById('mTm').value;
if(!v)return alert('수유량을 입력해 주세요');
logs.push(uNow({id:''+Date.now(),d:fmt(TD()),k:'milk',ml:v,mt:t,tm:tm||nowHM(),n:MILK[t].n+' '+v+'ml',t:'수유'}));save();render()}
function addLog(){var n=document.getElementById('gN').value.trim();
if(!n&&!LG.length)return alert('메뉴명을 입력하거나 재료를 추가해 주세요');
var tm=document.getElementById('gTm').value||nowHM();
var amt=document.getElementById('gA').value,nu=null,gs=null;
if(LG.length){gs=JSON.parse(JSON.stringify(LG));nu=nutOf({g:gs,sv:1}).t}
else{var r=null;RCP().forEach(function(x){if(x.n===n)r=x});
if(r){nu=nutOf(r).t;
if(amt){var base=0;(r.g||[]).forEach(function(x){base+=gOf(x)});base=base/(r.sv||1);
if(base>0){var f=amt/base,n2={};NK.forEach(function(k){n2[k]=nu[k]*f});n2.vc=nu.vc*f;nu=n2}}}}
var lid2=''+Date.now();
logs.push(uNow({id:lid2,d:fmt(TD()),n:n||'직접 입력',a:amt,t:slotOf(tm),tm:tm,rx:lRx,nu:nu,gs:gs}));
if(gs.length&&typeof stkUse==='function')stkUse(gs,n||'직접 입력',lid2);
LG=[];save();render()}
/* 즉시 기록 (양 미입력) */
function qLogNow(id,tm){var r=getR(id),sv=r.sv||1;tm=tm||nowHM();
var lid=''+Date.now();
var gs=(r.g||[]).map(function(x){return [x[0],Math.round((+x[1]||0)/sv*10)/10,x[2],x[3]||'']});
logs.push(uNow({id:lid,d:fmt(TD()),n:r.n,a:'',t:slotOf(tm),tm:tm,rx:'😋',nu:nutOf(r).t,rid:id,gs:gs}));
if(typeof stkUse==='function')stkUse(gs,r.n,lid);
save();return lid}

/* 먹었어요 → 중량 입력 모달 */
var AT=null;
function qLog(id){var r=getR(id);if(!r)return;
AT={rid:id,n:r.n,tm:nowHM(),a:'',rx:'😋',pre:'',post:'',lid:null};
drawAte();document.getElementById('md').classList.add('on');document.body.style.overflow='hidden'}
function openAteFor(lid){var l=null;logs.forEach(function(x){if(x.id===lid)l=x});if(!l)return;
AT={rid:l.rid||'',n:l.n,tm:l.tm||nowHM(),a:l.a||'',rx:l.rx||'😋',pre:l.pre||'',post:l.post||'',lid:lid};
drawAte();document.getElementById('md').classList.add('on');document.body.style.overflow='hidden'}
function drawAte(){SCBACK='drawAte';var b=bwCur(),bwt=b?b.w:0,a=+AT.a||0;
document.getElementById('mb').innerHTML='<div class="mt2">'+(AT.lid?'✏️ 먹은 양 수정':'📝 먹었어요')+'</div>'
+'<div class="cd" style="background:#F3FAF7;padding:10px"><b style="font-size:13.5px">'+esc(AT.n)+'</b>'
+'<div class="rw" style="margin-top:8px"><div class="fd" style="flex:1;margin:0"><label>먹은 시각</label><input type="time" value="'+AT.tm+'" onchange="AT.tm=this.value;drawAte()"></div>'
+'<div class="fd" style="flex:1;margin:0"><label>반응</label><select onchange="AT.rx=this.value">'+['😋','😐','😖'].map(function(x){return '<option '+(AT.rx===x?'selected':'')+'>'+x+'</option>'}).join('')+'</select></div></div></div>'

/* 직접 입력 */
+'<div class="cd"><div class="fd" style="margin:0"><label>먹은 양 (g) — 아는 경우 바로 입력</label><input id="atA" type="number" step="0.1" inputmode="decimal" value="'+AT.a+'" oninput="AT.a=this.value;atLive()" placeholder="80"></div>'
+'<div class="ch" style="margin-top:8px" id="atq">'+[30,50,80,100,120].map(function(v){return '<button class="'+(a===v?'on':'')+'" onclick="atSetA('+v+')">'+v+'g</button>'}).join('')
+'<button onclick="atClear()" style="background:#F5EFEA;color:var(--sub)">지우기</button></div></div>'

/* 그릇 무게 계산 */
+'<div class="cd" style="background:#FBF6F2"><div class="rw" style="justify-content:space-between;align-items:center"><b style="font-size:12.5px">⚖️ 그릇 무게로 계산</b><button class="mu" style="color:var(--bl);font-weight:700" onclick="scMgr2()">그릇 관리 ›</button></div>'
+(BW.list.length?'<div class="ch" style="margin-top:7px">'+BW.list.map(function(x){return '<button class="'+(BW.cur===x.id?'on':'')+'" onclick="bwSet(\''+x.id+'\');bwPick(this);atLive()">'+esc(x.n)+' '+x.w+'g</button>'}).join('')+'</div>':'<div class="mu" style="margin-top:6px;font-size:11px">등록된 그릇이 없어요. 그릇 관리에서 추가해 주세요.</div>')
+'<div class="rw" style="margin-top:9px"><div class="fd" style="flex:1;margin:0"><label>① 먹이기 전 (그릇 포함)</label><input id="atPre" type="number" step="0.1" inputmode="decimal" value="'+AT.pre+'" oninput="AT.pre=this.value;atLive()" placeholder="'+(bwt+80)+'"></div>'
+'<div class="fd" style="flex:1;margin:0"><label>② 먹인 후 (그릇 포함)</label><input id="atPost" type="number" step="0.1" inputmode="decimal" value="'+AT.post+'" oninput="AT.post=this.value;atLive()" placeholder="'+(bwt+15)+'"></div></div>'
+'<div id="atres">'+atResHTML()+'</div>'
+'</div>'

+'<div id="atsum">'+atSumHTML()+'</div>'
+'<div id="atgs">'+atGsHTML()+'</div>'
+'<button class="btn" onclick="saveAte()">'+(AT.lid?'수정 저장':'기록 저장')+'</button>'
+(AT.lid?'<button class="btn y" style="margin-top:8px" onclick="delLog(\''+AT.lid+'\');closeM()">이 기록 삭제</button>':'')
+'<button class="btn y" style="margin-top:8px" onclick="closeM()">취소</button>'}
function scMgr2(){scMgrCore('drawAte')}
function atResHTML(){var b=bwCur(),bwt=b?b.w:0;
var pre=+AT.pre||0,post=+AT.post||0,calc=ateOf(pre,post);
var served=pre?Math.round((pre-bwt)*10)/10:0;
var rate=(served>0&&calc)?Math.round(calc/served*100):0;
return calc?'<div class="cd" style="background:#fff;margin:9px 0 0;padding:9px"><div class="ir"><span>담아준 양</span><b>'+served+'g</b></div>'
+'<div class="ir"><span>남긴 양</span><b>'+Math.max(0,Math.round((post-bwt)*10)/10)+'g</b></div>'
+'<div class="ir" style="border:0"><span style="font-weight:800">계산된 먹은 양</span><b style="font-size:18px;color:var(--pd)">'+calc+'g</b></div>'
+'<div class="bar" style="height:13px;margin-top:5px"><i class="solid" style="width:'+Math.min(100,rate)+'%;background:#3FAE8E"></i></div>'
+'<div class="mu" style="font-size:10px;margin-top:4px">담아준 양의 <b>'+rate+'%</b>'+(rate>=80?' 👍 잘 먹었어요':rate<50?' — 오늘은 입맛이 없었나 봐요':'')+'</div>'
+'<button class="btn g s" style="margin-top:8px" onclick="atSetA('+calc+')">✓ '+calc+'g 로 채우기</button></div>'
:'<div class="mu" style="font-size:10.5px;margin-top:7px">그릇 무게 <b>'+bwt+'g</b>을 자동으로 빼고 계산합니다.</div>'}
/* 먹은 양에 따라 재료가 어떻게 반영되는지 미리보기 */
function atGsPreview(){var r=AT.rid?getR(AT.rid):null,sv=r?(r.sv||1):1;
var amt=AT.a===''?null:+AT.a;
var base=[],prev=0;
if(r)base=(r.g||[]).map(function(x){return [x[0],Math.round((+x[1]||0)/sv*10)/10,x[2],x[3]||'']});
else if(AT.lid){var o=null;logs.forEach(function(l){if(l.id===AT.lid)o=l});
if(o&&o.gs){base=JSON.parse(JSON.stringify(o.gs));prev=+o.a||0}}
if(!base.length)return null;
var tot=gsTotal(base),f=1;
if(amt&&tot>0)f=(!r&&prev>0)?(amt/prev):(amt/tot);
return {base:base,scaled:gsScale(base,f),f:f,tot:tot,amt:amt,prev:prev,recipe:!!r}}
function atGsHTML(){var P=atGsPreview();
if(!P)return '';
var chg=Math.abs(P.f-1)>0.005;
return '<div class="cd" style="background:#FBF6F2;padding:10px"><div class="rw" style="justify-content:space-between;align-items:center">'
+'<b style="font-size:12.5px">🥕 재료별 섭취 기록</b>'
+(chg?'<span class="tg '+(P.f<1?'v':'p')+'">×'+rnd2(P.f)+' 로 조정</span>':'<span class="tg">1회분 그대로</span>')+'</div>'
+'<div class="mu" style="font-size:10.5px;margin:4px 0 7px">'+(P.amt?(chg?'먹은 양 <b>'+P.amt+'g</b>에 맞춰 재료가 <b>비례 조절</b>됩니다.':'전량 기준으로 기록됩니다.'):'양을 입력하면 재료도 비례해 조절됩니다. (지금은 '+(P.recipe?'1회분':'기존')+' 기준)')+'</div>'
+'<table class="tb"><tr><th>재료</th><th>'+(chg?'전':'')+'</th>'+(chg?'<th>→ 기록</th>':'')+'</tr>'
+P.scaled.map(function(x,i){var b=P.base[i];
return '<tr><td>'+esc(x[0])+'</td>'
+(chg?'<td class="mu" style="text-decoration:line-through">'+rnd(b[1])+b[2]+'</td><td><b style="color:var(--pd)">'+rnd(x[1])+x[2]+'</b></td>':'<td><b>'+rnd(x[1])+x[2]+'</b></td>')
+'</tr>'}).join('')
+'<tr style="border-top:1.5px solid var(--ln)"><td><b>합계</b></td>'
+(chg?'<td class="mu">'+P.tot+'g</td><td><b style="color:var(--pd)">'+gsTotal(P.scaled)+'g</b></td>':'<td><b>'+P.tot+'g</b></td>')
+'</tr></table>'
+'<div class="mu" style="font-size:10px;margin-top:6px">이 값이 <b>재고 차감</b>과 <b>재료별 섭취 분석</b>에 그대로 반영됩니다.</div></div>'}
function atSumHTML(){return '<div class="cd" style="background:#F3F6FA;font-size:11.5px"><b>기록될 양:</b> <b style="color:var(--pd);font-size:14px">'+(AT.a?AT.a+'g':'미입력 (레시피 1회분 기준)')+'</b><div class="mu" style="font-size:10px;margin-top:3px">양을 넣으면 실제 먹은 만큼 영양이 계산됩니다.</div></div>'}
function atLive(){var r=document.getElementById('atres'),s=document.getElementById('atsum'),g=document.getElementById('atgs');
if(r)r.innerHTML=atResHTML();
if(s)s.innerHTML=atSumHTML();
if(g)g.innerHTML=atGsHTML();
atMarkQ()}
function atMarkQ(){var q=document.getElementById('atq');if(!q)return;
var a=+AT.a||0,bs=q.getElementsByTagName('button');
for(var i=0;i<bs.length;i++){var t=parseInt(bs[i].textContent,10);
if(!isNaN(t))bs[i].className=(t===a?'on':'')}}
function atSetA(v){AT.a=v;var el=document.getElementById('atA');if(el)el.value=v;atLive()}
function atClear(){AT.a='';AT.pre='';AT.post='';
var a=document.getElementById('atA'),p1=document.getElementById('atPre'),p2=document.getElementById('atPost');
if(a)a.value='';if(p1)p1.value='';if(p2)p2.value='';atLive()}
/* 재료 배열의 총 g 합 (개·방울 환산 포함) */
function gsTotal(gs){var t=0;
(gs||[]).forEach(function(x){t+=gOf(x)});
return Math.round(t*10)/10}
/* 재료 배열을 비율 f 로 조정 */
function gsScale(gs,f){return (gs||[]).map(function(x){
return [x[0],Math.round((+x[1]||0)*f*10)/10,x[2],x[3]]})}
/* 재료 배열로 영양 재계산 */
function gsNut(gs){return (gs&&gs.length)?nutOf({g:gs,sv:1}).t:null}

function saveAte(){var r=AT.rid?getR(AT.rid):null,sv=r?(r.sv||1):1;
var amt=AT.a===''?null:+AT.a;
var old=null;if(AT.lid)logs.forEach(function(l){if(l.id===AT.lid)old=l});
var nu=null,gs=[];

if(r){
/* 레시피 기반 — 1회분 재료에서 시작해 먹은 양 비율로 조정 */
nu=nutOf(r).t;
gs=(r.g||[]).map(function(x){return [x[0],Math.round((+x[1]||0)/sv*10)/10,x[2],x[3]||'']});
if(amt){var base=gsTotal(gs);
if(base>0){var f=amt/base;gs=gsScale(gs,f);
var n2=gsNut(gs);if(n2)nu=n2;else{n2={};NK.forEach(function(k){n2[k]=nutOf(r).t[k]*f});nu=n2}}}}

else if(old&&old.gs&&old.gs.length){
/* 레시피 없는 기록(간식·직접입력) — 기존 재료를 이전 양 대비 비례 조정 */
gs=JSON.parse(JSON.stringify(old.gs));
var prev=+old.a||0,pbase=gsTotal(gs);
if(amt&&pbase>0){
/* 이전에 양이 있었으면 그 비율로, 없었으면 재료합 대비로 */
var f2=prev>0?(amt/prev):(amt/pbase);
gs=gsScale(gs,f2)}
nu=gsNut(gs)||old.nu||null}

else if(old){nu=old.nu||null;gs=old.gs||[]}

if(AT.lid){var i=-1;logs.forEach(function(l,x){if(l.id===AT.lid)i=x});
if(typeof stkUndo==='function')stkUndo(AT.lid);
if(gs.length&&typeof stkUse==='function')stkUse(gs,AT.n,AT.lid);
if(i>=0){logs[i].a=AT.a;logs[i].tm=AT.tm;logs[i].t=slotOf(AT.tm);logs[i].rx=AT.rx;
logs[i].pre=AT.pre;logs[i].post=AT.post;logs[i].n=AT.n||logs[i].n;
if(nu)logs[i].nu=nu;if(gs.length)logs[i].gs=gs;
uNow(logs[i])}}   /* 기존 기록을 고쳤으므로 수정시각을 새로 찍는다 */
else{var nid=''+Date.now();
logs.push(uNow({id:nid,d:fmt(TD()),n:AT.n,a:AT.a,t:slotOf(AT.tm),tm:AT.tm,rx:AT.rx,
nu:nu,gs:gs,rid:AT.rid,pre:AT.pre,post:AT.post}));
if(typeof stkUse==='function')stkUse(gs,AT.n,nid)}
save();closeM();if(tab!=='today')tab='today';render()}
function delLog(id){if(!confirm('이 기록을 삭제할까요?'))return;
if(typeof stkUndo==='function')stkUndo(id);
logs=logs.filter(function(l){return l.id!==id});save();render()}

/*========== 기록 수정 모달 ==========*/
var EL=null;
function editLog(id){var l=null;logs.forEach(function(x){if(x.id===id)l=x});
if(!l)return;
EL=JSON.parse(JSON.stringify(l));if(!EL.gs)EL.gs=[];
drawEL();document.getElementById('md').classList.add('on');document.body.style.overflow='hidden'}
function drawEL(){var ks=Object.keys(NUT),isM=EL.k==='milk';
var nu=isM?milkNut(+EL.ml||0,EL.mt||'f'):(EL.gs.length?nutOf({g:EL.gs,sv:1}).t:(EL.nu||{}));
document.getElementById('mb').innerHTML='<div class="mt2">'+(isM?'🍼 수유':'🍲 이유식')+' 기록 수정</div>'
+'<div class="cd">'
+(isM?'<div class="rw"><div class="fd" style="flex:1;margin:0"><label>수유량(ml)</label><input type="number" value="'+(EL.ml||0)+'" oninput="EL.ml=+this.value;drawEL()"></div><div class="fd" style="flex:1;margin:0"><label>종류</label><select onchange="EL.mt=this.value;drawEL()"><option value="f" '+(EL.mt==='f'?'selected':'')+'>분유</option><option value="b" '+(EL.mt==='b'?'selected':'')+'>모유</option></select></div></div>'
:'<div class="fd"><label>메뉴명</label><input value="'+esc(EL.n)+'" oninput="EL.n=this.value"></div>'
+'<div class="rw"><div class="fd" style="flex:1;margin:0"><label>먹은 양(g)</label><input type="number" value="'+(EL.a||'')+'" oninput="EL.a=this.value"></div>'
+'<div class="fd" style="flex:1;margin:0"><label>반응</label><select onchange="EL.rx=this.value"><option '+(EL.rx==='😋'?'selected':'')+'>😋</option><option '+(EL.rx==='😐'?'selected':'')+'>😐</option><option '+(EL.rx==='😖'?'selected':'')+'>😖</option></select></div></div>')
+(isM?'':'<div class="rw" style="margin-top:9px"><button class="btn g s" onclick="openScale(\'EL\')">⚖️ 그릇 무게로 계산</button>'
+(EL.gs&&EL.gs.length?'<button class="btn y s" onclick="elScaleGs()">🥕 재료 비례 맞추기</button>':'')+'</div>')
+'<div class="rw" style="margin-top:10px"><div class="fd" style="flex:1;margin:0"><label>날짜</label><input type="date" value="'+ymdOf(EL.d)+'" onchange="EL.d=fmt(d0(this.value));drawEL()"></div><div class="fd" style="flex:1;margin:0"><label>먹은 시각</label><input type="time" value="'+(EL.tm||'')+'" onchange="EL.tm=this.value;drawEL()"></div></div></div>'
+(isM?'':'<div class="st">🥕 먹은 재료 · 양</div><div class="cd">'
+(EL.gs.length?EL.gs.map(function(x,i){return '<div class="ei"><input style="flex:1.4" value="'+esc(x[0])+'" oninput="EL.gs['+i+'][0]=this.value"><input style="flex:.62" type="number" step="0.1" value="'+x[1]+'" oninput="EL.gs['+i+'][1]=+this.value;drawEL()"><select style="flex:.52" onchange="EL.gs['+i+'][2]=this.value;drawEL()">'+['g','ml','개','방울'].map(function(u){return '<option '+(x[2]===u?'selected':'')+'>'+u+'</option>'}).join('')+'</select><select style="flex:1" onchange="EL.gs['+i+'][3]=this.value;drawEL()"><option value="">영양 미반영</option>'+ks.map(function(k){return '<option '+(x[3]===k?'selected':'')+'>'+k+'</option>'}).join('')+'</select><button style="color:var(--sub)" onclick="EL.gs.splice('+i+',1);drawEL()">✕</button></div>'}).join('')
:'<div class="mu" style="font-size:11px">재료 기록이 없습니다. 아래에서 추가하면 영양이 재계산됩니다.</div>')
+'<div class="ei" style="margin-top:8px"><select id="eLK" style="flex:1.4" onchange="document.getElementById(\'eLN\').value=this.value"><option value="">— 재료 선택 —</option>'+ks.map(function(k){return '<option>'+k+'</option>'}).join('')+'</select><input id="eLN" style="flex:1" placeholder="직접 입력"><input id="eLQ" style="flex:.6" type="number" placeholder="20"><select id="eLU" style="flex:.5"><option>g</option><option>ml</option><option>개</option><option>방울</option></select></div>'
+'<button class="btn g s" onclick="elAddIng()">＋ 재료 추가</button></div>')
+'<div class="cd" style="background:#FBF6F2;font-size:12px"><b>계산된 영양</b><div class="rw" style="margin-top:6px">'
+NK.map(function(k){return '<div style="flex:1;text-align:center;background:#fff;border-radius:8px;padding:6px 2px"><div class="mu" style="font-size:9.5px">'+NL[k][0]+'</div><b style="font-size:13px;color:'+NL[k][2]+'">'+rnd(nu[k]||0)+NL[k][1]+'</b></div>'}).join('')+'</div></div>'
+'<button class="btn" onclick="saveEL()">저장하기</button>'
+'<button class="btn y" style="margin-top:8px" onclick="delLog(\''+EL.id+'\');closeM()">이 기록 삭제</button>'
+'<button class="btn y" style="margin-top:8px" onclick="closeM()">취소</button>'}
function ymdOf(dstr){var a=(dstr||'').split('.');return a.length===3?a[0]+'-'+a[1]+'-'+a[2]:ymd(TD())}
function elAddIng(){var k=document.getElementById('eLK').value,n=document.getElementById('eLN').value.trim()||k;
var q=+document.getElementById('eLQ').value,u=document.getElementById('eLU').value;
if(!n)return alert('재료를 선택하거나 입력해 주세요');
if(!q)return alert('양을 입력해 주세요');
EL.gs.push([n,q,u,k||(NUT[n]?n:'')]);drawEL()}
/* 수정한 먹은 양에 맞춰 재료를 비례 조정 */
function elScaleGs(){if(!EL.gs||!EL.gs.length)return alert('조정할 재료가 없어요.');
var amt=+EL.a||0;
if(!amt)return alert('먹은 양(g)을 먼저 입력해 주세요.');
var cur=gsTotal(EL.gs);
if(cur<=0)return alert('재료 중량을 읽을 수 없어요.');
var f=amt/cur;
if(!confirm('재료 합계 '+cur+'g → 먹은 양 '+amt+'g 기준으로\n모든 재료를 ×'+rnd2(f)+' 조정할까요?'))return;
EL.gs=gsScale(EL.gs,f);
drawEL()}
function saveEL(){if(EL.k==='milk'){EL.n=MILK[EL.mt||'f'].n+' '+(EL.ml||0)+'ml'}
else{EL.nu=gsNut(EL.gs)||EL.nu;EL.t=slotOf(EL.tm)||EL.t;
/* 재고: 기존 차감 되돌리고 새 재료로 다시 차감 */
if(typeof stkUndo==='function')stkUndo(EL.id);
if(EL.gs&&EL.gs.length&&typeof stkUse==='function')stkUse(EL.gs,EL.n,EL.id)}
var i=-1;logs.forEach(function(l,x){if(l.id===EL.id)i=x});
if(i>=0)logs[i]=EL;
save();closeM();render()}

/*========== 내보내기 ==========*/
function dl(b,fn){var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=fn;a.click()}
function csv(){var s='날짜,시각,구분,끼니,메뉴,양,반응,재료상세,단백질,철,칼슘,아연\n'+logs.slice().sort(function(a,b){return (a.d+(a.tm||''))<(b.d+(b.tm||''))?-1:1}).map(function(l){var n=l.nu||(l.k==='milk'?milkNut(+l.ml||0,l.mt||'f'):{});
var gs=(l.gs||[]).map(function(x){return x[0]+' '+x[1]+x[2]}).join(' / ');
return [l.d,l.tm||'',(l.k==='milk'?'수유':'이유식'),l.t||'','"'+l.n+'"',(l.k==='milk'?l.ml+'ml':(l.a||'')+'g'),l.rx||'','"'+gs+'"',rnd(n.p||0),rnd(n.fe||0),rnd(n.ca||0),rnd(n.zn||0)].join(',')}).join('\n');
var g='\n\n날짜,몸무게kg,키cm,머리둘레cm\n'+grow.map(function(x){return [x.d,x.w||'',x.h||'',x.c||''].join(',')}).join('\n');
dl(new Blob(['﻿'+s+g],{type:'text/csv'}),baby.name+'_아빠의이유식_기록.csv')}
