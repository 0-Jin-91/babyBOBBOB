/*========== 주간 식단 편성 ==========*/
function genPlan(){var si=IDS.indexOf(curS().id==='ready'?'early':curS().id),ws=wkStart(),n=SLOTS().length,d=[],prev=[];
for(var i=0;i<7;i++){var rs=recommend(si,dOld()+i*3,n,prev);
d.push(rs.map(function(r){return r.i}));
prev=[];rs.forEach(function(r){mainKeys(r).forEach(function(k){if(k.charAt(0)==='P')prev.push(k)})})}
plan={ws:ymd(ws),n:n,d:d};shopChk={};save()}

function vPlan(){return '<div class="tt"><button class="'+(pTab==='w'?'on':'')+'" onclick="pTab=\'w\';render()">🗓 주간 식단</button><button class="'+(pTab==='c'?'on':'')+'" onclick="pTab=\'c\';render()">🧊 큐브</button><button onclick="tab=\'shop\';render()">🛒 장보기 ›</button></div>'+(pTab==='c'?vCube():vWeek())}
/* 장보기 독립 탭 */
function vShopTab(){if(!plan||plan.ws!==ymd(wkStart())||plan.n!==SLOTS().length)genPlan();
return vShop()}

/*========== 주간 ==========*/
function vWeek(){if(!plan||plan.ws!==ymd(wkStart())||plan.n!==SLOTS().length)genPlan();
var ws=d0(plan.ws),sl=SLOTS(),DW=['월','화','수','목','금','토','일'],T=TG(),badN=0,badFirst=null;
var h='<div class="cd"><div class="rw" style="justify-content:space-between;align-items:center"><b>🗓 '+fmt(ws)+' 주간 식단</b><button class="mu" style="color:var(--bl);font-weight:700" onclick="genPlan();render()">🎲 자동 편성</button></div><p class="mu" style="margin:5px 0 0">칸을 눌러 교체하세요. 🚨 부족/과다 · ⚠️ 주의 · ✅ 적정 · 숫자는 1끼 영양 점수</p></div>';
var tbl='<div class="cd" style="padding:8px"><table class="wk"><tr><th></th>'+sl.map(function(s){return '<th>'+s+'</th>'}).join('')+'</tr>';
for(var i=0;i<7;i++){var dt=addD(ws,i),td=ymd(dt)===ymd(TD());
tbl+='<tr><th>'+DW[i]+'<br><span style="font-weight:400">'+(dt.getMonth()+1)+'/'+dt.getDate()+'</span></th>';
for(var j=0;j<sl.length;j++){var r=getR(plan.d[i][j]),sc=r?mealScore(r):0,lv=r?lvl(sc):'';
if(lv==='bad'){badN++;if(!badFirst)badFirst=r.i}
tbl+='<td class="'+(td?'tdy ':'')+(lv==='ok'?'':lv)+'" onclick="swapPlan('+i+','+j+')">'+(r?'<span class="mn">'+(lv!=='ok'?lvIco(sc)+' ':'')+esc(r.n.length>10?r.n.slice(0,10)+'…':r.n)+'</span><span class="mu" style="font-size:9.5px;font-weight:800;color:'+lvCol(sc)+'">'+sc+'%</span>':'-')+'</td>'}
tbl+='</tr>'}
tbl+='</table></div>';
if(badN)h+='<div class="alert bad" style="cursor:pointer" onclick="diagMeal(\''+badFirst+'\')"><span class="ic">🚨</span><div>영양이 <b>'+LV.mid+'% 미만인 끼니가 '+badN+'개</b> 있습니다.<br><u>눌러서 첫 항목 진단·개선안 보기 ›</u> (또는 붉은 칸을 직접 눌러 교체)</div></div>';
h+=tbl;
var wk={p:0,fe:0,ca:0,zn:0},cnt=0;
plan.d.forEach(function(day){day.forEach(function(id){var r=getR(id);
if(r){var n=nutOf(r).t;NK.forEach(function(k){wk[k]+=n[k]});cnt++}})});
h+='<div class="st">주간 평균 (1일 이유식 기준)</div><div class="cd">'+NK.map(function(k){var v=wk[k]/7,pc=v/T.solid[k]*100,lv=lvl(pc);
return '<div class="nrow" style="cursor:pointer" onclick="diagDay(\''+k+'\')"><div class="nhd"><div class="nnm"><i class="ndot" style="background:'+NL[k][2]+'"></i>'+NL[k][0]+' <span class="badge '+lv+'">'+lvIco(pc)+'</span></div><div><div class="npc" style="color:'+lvCol(pc)+';font-size:16px">'+Math.round(pc)+'%</div><div class="nval">'+rnd(v)+' / '+rnd(T.solid[k])+NL[k][1]+'</div></div></div>'
+'<div class="bar" style="height:17px"><i class="solid" style="width:'+Math.min(100,pc)+'%;background:'+NL[k][2]+'"></i><span class="goal" style="left:calc(100% - 3px)"></span></div></div>'}).join('')
+'<div class="mu" style="font-size:10.5px;margin-top:7px">총 '+cnt+'끼 · 하루 철분 평균 '+rnd(wk.fe/7)+'mg (이유식 담당 목표 '+rnd(T.solid.fe)+'mg)</div></div>'
+'<button class="btn g s" onclick="tab=\'shop\';render()">🛒 장보기 리스트 보기</button>';
return h}
function swapPlan(i,j){var si=IDS.indexOf(curS().id==='ready'?'early':curS().id),L=altList(si,[plan.d[i][j]]);
document.getElementById('mb').innerHTML='<div class="mt2">메뉴 교체</div><p class="mu" style="margin:6px 0 10px">'+['월','화','수','목','금','토','일'][i]+'요일 '+SLOTS()[j]+' · 영양 점수 높은 순</p>'
+'<div class="rw" style="margin-bottom:10px"><button class="btn" style="flex:1.4;margin:0" onclick="planNewMenu('+i+','+j+')">✏️ 새 메뉴 만들어 넣기</button><button class="btn g" style="flex:1;margin:0" onclick="closeM();tab=\'combo\';render()">🧩 조합 실험</button></div>'
+L.map(function(r){return '<div onclick="doSwap('+i+','+j+',\''+r.i+'\')">'+rcard(r)+'</div>'}).join('')
+'<button class="btn y" onclick="closeM()">닫기</button>';
document.getElementById('md').classList.add('on');document.body.style.overflow='hidden'}
function doSwap(i,j,id){plan.d[i][j]=id;shopChk={};save();closeM();render()}
/* 식단 칸에서 새 메뉴 만들기 — 저장하면 그 칸에 자동으로 들어간다 */
var PLSLOT=null;
function planNewMenu(i,j){PLSLOT=[i,j];openEd()}


/*========== 🛒 장보기 추천 ==========*/
/* ① 다음 주 식단에 새로 등장하는 재료
   ② 지금/곧 도입 시기가 되는 재료 (재료도감 f[3] 기준)
   ③ 다음 단계 진입이 임박했을 때 그 단계 대표 재료 */
function nextPlanNeed(){/* 다음 주 식단(seed 를 +7 로 미리 편성) 재료 */
var si=IDS.indexOf(curS().id==='ready'?'early':curS().id),n=SLOTS().length,need={};
var cur={};
if(plan&&plan.d)plan.d.forEach(function(day){day.forEach(function(id){var r=getR(id);
if(r)(r.g||[]).forEach(function(x){var nm=x[3]||x[0];if(nm&&nm!=='물')cur[nm]=1})})});
for(var i=0;i<7;i++){var rs=recommend(si,dOld()+70+i*3,n);
rs.forEach(function(r){var sv=r.sv||1;
(r.g||[]).forEach(function(x){var nm=x[3]||x[0];
if(!nm||nm==='물'||x[0]==='물')return;
var gr=gOf(x)/sv;if(!gr)return;
need[nm]=(need[nm]||0)+gr})})}
return {need:need,cur:cur}}
function newFoodsDue(){/* 도입 시기 도달/임박 재료 */
var m=ageM(),out=[];
FD.forEach(function(f){
if(tried[f[0]])return;                       /* 이미 확인한 것 제외 */
if(obs.filter(function(o){return !o.done&&o.n===f[0]}).length)return;  /* 관찰 중 제외 */
var d=f[3]-m;                                 /* 남은 개월 */
if(d<=0.5&&d>-1.5)out.push({f:f,when:'now',d:d});      /* 지금 시작 적기 */
else if(d>0.5&&d<=1)out.push({f:f,when:'soon',d:d});   /* 2~4주 뒤 */
});
return out.sort(function(a,b){
if(a.when!==b.when)return a.when==='now'?-1:1;
if(a.f[6]!==b.f[6])return a.f[6]-b.f[6];
return a.d-b.d})}
function stageSoon(){var ns=nextStage();if(!ns)return null;
var dd=Math.ceil((addM(d0(baby.birth),ns.f)-TD())/864e5);
return (dd>0&&dd<=21)?{s:ns,d:dd}:null}
function shopRec(){var NP=nextPlanNeed(),out=[];
/* ① 다음 주 새 재료 */
var fresh=Object.keys(NP.need).filter(function(k){return !NP.cur[k]})
.sort(function(a,b){return NP.need[b]-NP.need[a]}).slice(0,6);
if(fresh.length)out.push({t:'📅 다음 주 식단에 새로 필요',k:'plan',
items:fresh.map(function(k){return {n:k,g:Math.ceil(NP.need[k]/10)*10}}),
d:'이번 주 식단에는 없고 <b>다음 주</b>에 쓰이는 재료예요. 미리 사두면 큐브를 여유롭게 만들 수 있어요.'});
/* ② 도입 시기 재료 */
var due=newFoodsDue();
var now=due.filter(function(x){return x.when==='now'}).slice(0,6);
var soon=due.filter(function(x){return x.when==='soon'}).slice(0,6);
if(now.length)out.push({t:'🌱 지금 시작하기 좋은 새 재료',k:'now',
items:now.map(function(x){return {n:x.f[0],e:x.f[1],m:x.f[3],lv:x.f[6],why:x.f[5]}}),
d:'만 '+Math.floor(ageM())+'개월인 지금 <b>도입 적기</b>인 재료입니다. 새 재료는 오전에 소량으로 시작하고 3일간 관찰하세요.'});
if(soon.length)out.push({t:'⏳ 2~4주 뒤 시작할 재료',k:'soon',
items:soon.map(function(x){return {n:x.f[0],e:x.f[1],m:x.f[3],lv:x.f[6],why:x.f[5]}}),
d:'곧 먹일 수 있게 되는 재료예요. 냉동 보관이 되는 것은 미리 준비해도 좋습니다.'});
/* ③ 단계 전환 임박 */
var ss=stageSoon();
if(ss){var pool2=FD.filter(function(f){return !tried[f[0]]&&f[3]<=ss.s.f+0.5&&f[3]>ss.s.f-1.5}).slice(0,6);
out.push({t:'🎉 '+ss.d+'일 후 '+ss.s.n+' 시작',k:'stage',
items:pool2.map(function(f){return {n:f[0],e:f[1],m:f[3],lv:f[6],why:f[5]}}),
d:'<b>'+ss.s.ra+'</b> · '+ss.s.ct+' · 1회 '+ss.s.am+'<br>입자 크기가 '+ss.s.tx+'로 바뀝니다. 단계가 바뀌면 재료 종류를 늘릴 수 있어요.'})}
return out}
function vShopRec(){var R=shopRec();
if(!R.length)return '';
return '<div class="st">✨ 이런 것도 준비해 보세요</div>'
+R.map(function(g){return '<div class="rcb'+(g.k==='soon'?' soon':'')+'"><div class="rt">'+g.t+'</div>'
+(g.items.length?'<div class="ch" style="margin-top:7px">'+g.items.map(function(x){
var badge=x.lv===2?' 🚨':x.lv===1?' ⚠️':'';
return '<button onclick="'+(g.k==='plan'?'shopAddRec(\''+x.n.replace(/'/g,'')+'\','+(x.g||30)+')':'openF(\''+x.n.replace(/'/g,'')+'\')')+'">'+(x.e?x.e+' ':'')+esc(x.n)+(x.g?' '+x.g+'g':'')+badge+'</button>'}).join('')+'</div>':'')
+'<div class="rd">'+g.d+'</div>'
+(g.k==='now'||g.k==='soon'?'<div class="mu" style="font-size:10px;margin-top:5px">재료를 누르면 상세·관찰 시작으로 이동합니다. ⚠️🚨 는 알레르기 주의 재료예요.</div>':'')
+(g.k==='plan'?'<div class="mu" style="font-size:10px;margin-top:5px">누르면 장보기 목록에 추가됩니다.</div>':'')
+'</div>'}).join('')}
var shopAdd=LS('b6.shopadd',{});
function shopAddRec(n,g){shopAdd=LS('b6.shopadd',{});
shopAdd[n]=g||30;localStorage.setItem('b6.shopadd',JSON.stringify(shopAdd));
alert('「'+n+' '+(g||30)+'g」을 장보기 목록에 추가했어요.');render()}
function shopAddDel(n){shopAdd=LS('b6.shopadd',{});
delete shopAdd[n];localStorage.setItem('b6.shopadd',JSON.stringify(shopAdd));render()}

/*========== 장보기 ==========*/
function shopList(){if(!plan)genPlan();var need={};
plan.d.forEach(function(day){day.forEach(function(id){var r=getR(id);if(!r)return;var sv=r.sv||1;
(r.g||[]).forEach(function(x){var nm=x[3]||x[0];
if(!nm||x[0]==='물'||nm==='물')return;
var gr=gOf(x)/sv;if(!gr)return;need[nm]=(need[nm]||0)+gr})})});
var have={};cubes.forEach(function(c){if(c.q>0)have[c.n]=(have[c.n]||0)+c.q*c.g});
/* 재고 등록분도 보유량에 반영 */
if(typeof STK!=='undefined')STK.forEach(function(s){if(s.unit==='g'&&s.left>0)have[s.n]=(have[s.n]||0)+s.left});
var out=Object.keys(need).map(function(k){var n=need[k],h=have[k]||0;
return {n:k,need:n,have:h,buy:Math.ceil(Math.max(0,n-h)/10)*10}});
/* 재고 부족(20% 이하) 항목을 병합 — 식단에 없어도 올린다 */
/* 추천에서 담은 항목 */
var man=LS('b6.shopadd',{});
Object.keys(man).forEach(function(k){var hit=null;out.forEach(function(x){if(x.n===k)hit=x});
if(hit){hit.man=1;if(man[k]>hit.buy)hit.buy=man[k]}
else out.push({n:k,need:0,have:0,buy:man[k],man:1,unit:'g'})});
if(typeof stkShopAdd==='function')stkShopAdd().forEach(function(s){
var hit=null;out.forEach(function(x){if(x.n===s.n)hit=x});
if(hit){hit.stock=1;hit.pct=s.pct;hit.unit=s.unit;if(s.buy>hit.buy)hit.buy=s.buy}
else out.push(s)});
return out.sort(function(a,b){
var ap=a.stock?(a.pct||0):999,bp=b.stock?(b.pct||0):999;
if(ap!==bp)return ap-bp;
return b.buy-a.buy})}
function vShop(){var L=shopList(),ws=d0(plan.ws);
var lows=(typeof stkLow==='function')?stkLow():[];
return '<div class="cd"><div class="rw" style="justify-content:space-between;align-items:center"><b>🛒 장보기 리스트</b><button class="mu" style="color:var(--bl);font-weight:700" onclick="tab=\'stock\';render()">📦 재고관리 ›</button></div><p class="mu" style="margin:5px 0 0">'+fmt(ws)+' 주간 식단('+plan.n+'끼×7일) 총량에서 <b>큐브·재고 보유량 차감</b>. 10g 단위 올림.</p></div>'
+(lows.length?'<div class="alert '+(stkPct(lows[0])<=10?'bad':'mid')+'"><span class="ic">📦</span><div><b>재고 부족 '+lows.length+'건이 목록 맨 위에 올라와 있어요.</b><br>'+lows.slice(0,4).map(function(s){return esc(s.n)+' '+Math.round(stkPct(s))+'%'}).join(' · ')+'</div></div>':'')
+(L.length?'<div class="cd">'+L.map(function(x){var on=shopChk[x.n];
var u=x.unit||'g';
return '<div class="sc '+(on?'on':'')+'" onclick="shopChk[\''+x.n.replace(/'/g,'')+'\']='+(on?'0':'1')+';save();render()"><div class="bx2">'+(on?'✓':'')+'</div><div style="flex:1"><b class="nm2" style="font-size:13.5px">'+esc(x.n)+'</b>'
+(x.man?' <span class="tg p">추천</span>':'')
+(x.stock?' <span class="tg '+((x.pct||0)<=10?'r':'v')+'">'+((x.pct||0)<=10?'🚨 재고 '+Math.round(x.pct||0)+'%':'⚠️ 재고 '+Math.round(x.pct||0)+'%')+'</span>':'')
+'<div class="mu" style="font-size:10.5px">'+(x.man&&!x.need?'추천으로 담음':x.stock&&!x.need?'재고 부족 — 보충 필요':'필요 '+Math.round(x.need)+u)+(x.have?' · 보유 '+Math.round(x.have)+u:'')+'</div></div><b style="color:'+(x.buy?'var(--pd)':'var(--mt)')+'">'+(x.buy?x.buy+u:'충분')+'</b></div>'}).join('')+'</div>':'<div class="cd mu">식단을 먼저 편성해 주세요.</div>')
+vShopRec()
+'<button class="btn g s" onclick="copyShop()">📋 텍스트 복사 (카톡 전송용)</button>'
+'<div class="cd" style="background:#F3FAF7;font-size:12px;margin-top:10px"><b>구매 팁</b><ul style="margin:5px 0 0;padding-left:16px;color:var(--sub)"><li>고기는 소분 냉동해 두면 편합니다.</li><li>비타민C 채소(파프리카·브로콜리)는 철분 흡수용으로 늘 준비하세요.</li><li>두부·생선은 조리 당일 구매를 권합니다.</li></ul></div>'}
function copyShop(){var L=shopList().filter(function(x){return x.buy>0});
var t='🛒 '+baby.name+' 이유식 장보기 ('+fmt(d0(plan.ws))+' 주)\n'+L.map(function(x){return '· '+x.n+' '+x.buy+'g'}).join('\n');
if(navigator.clipboard)navigator.clipboard.writeText(t).then(function(){alert('복사했어요!')},function(){prompt('복사하세요',t)});
else prompt('복사하세요',t)}

/*========== 큐브 ==========*/
/* 큐브 남은 보관일. 큐브별 keep(일)을 수정했으면 그것을 쓰고, 없으면 기본 14일 */
function dLeft(c){var k=(typeof cubeKeep==='function')?cubeKeep(c):((c&&+c.keep>0)?+c.keep:14);
return k-Math.floor((TD()-d0(c.dt))/864e5)}
function vCube(){var act=cubes.filter(function(c){return c.q>0});
return ((typeof cubeLowAlert==='function')?cubeLowAlert():'')
+'<div class="cd"><b>🧊 냉동 큐브 재고</b><p class="mu" style="margin:5px 0 10px">만든 날 기준 14일까지를 권장 사용기한으로 계산하고 장보기에서 자동 차감합니다.</p>'
+'<div class="rw"><div class="fd" style="flex:1.3;margin:0"><label>재료</label><input id="cN" list="cL" placeholder="소고기"><datalist id="cL">'+Object.keys(NUT).map(function(k){return '<option>'+k+'</option>'}).join('')+'</datalist></div><div class="fd" style="flex:.6;margin:0"><label>개수</label><input id="cQ" type="number" placeholder="7"></div><div class="fd" style="flex:.6;margin:0"><label>1개 g</label><input id="cG" type="number" placeholder="10"></div></div>'
+'<div class="fd" style="margin:10px 0 0"><label>만든 날</label><input id="cD" type="date" value="'+ymd(TD())+'"></div><button class="btn" style="margin-top:10px" onclick="addCube()">＋ 큐브 등록</button></div>'
+'<div class="st">보유 중 ('+act.length+'종)</div>'
+(act.length?'<div class="cd">'+act.map(function(c){var d=dLeft(c);
return '<div class="cb"><div style="flex:0 0 30px;height:30px;border-radius:9px;overflow:hidden">'+ART('cube')+'</div><div style="flex:1"><b style="font-size:13.5px">'+esc(c.n)+'</b><div class="mu" style="font-size:10.5px">'+c.g+'g/개 · 총 '+(c.q*c.g)+'g · '+(d>0?'<b style="color:'+(d<=2?'var(--rd)':'var(--sub)')+'">D-'+d+'</b>':'<b style="color:var(--rd)">기한 초과</b>')+'</div></div><div class="sp"><button onclick="cQ2(\''+c.id+'\',-1)">−</button><b style="width:20px;text-align:center">'+c.q+'</b><button onclick="cQ2(\''+c.id+'\',1)">＋</button>'+((typeof cubeEdit==='function')?'<button style="padding:0 4px" onclick="cubeEdit(\''+c.id+'\')" title="수정">✏️</button>':'')+'<button style="color:var(--sub);padding:0 3px" onclick="cD2(\''+c.id+'\')">✕</button></div></div>'+((typeof CE!=='undefined'&&CE.id===c.id&&typeof cubeEditForm==='function')?cubeEditForm(c):'')}).join('')
+'<div class="mu" style="font-size:10.5px;margin-top:8px">끼니를 <b>기록하면 자동 차감</b>됩니다. − ＋ 는 수동 보정용입니다.</div></div>':'<div class="cd mu">등록된 큐브가 없어요. 메뉴 > 토핑 > [준비] 큐브 만들기를 참고하세요.</div>')
+'<div class="cd" style="background:#F3FAF7;font-size:12px"><b>보관 팁</b><ul style="margin:5px 0 0;padding-left:16px;color:var(--sub)"><li>완전히 식힌 뒤 뚜껑을 덮어 냉동.</li><li>지퍼백에 재료명·날짜를 적어두세요.</li><li>실온 방치·재냉동은 피하세요.</li></ul><div style="margin-top:6px">'+sT('mfds')+'</div></div>'}
function addCube(){var n=document.getElementById('cN').value.trim(),q=+document.getElementById('cQ').value,g=+document.getElementById('cG').value||10,dt=document.getElementById('cD').value;
if(!n)return alert('재료명을 입력해 주세요');if(!q)return alert('개수를 입력해 주세요');
cubes.push({id:'c'+Date.now(),n:n,key:(typeof NUT!=='undefined'&&NUT[n]?n:n),q:q,g:g,dt:dt});save();render()}
function cQ2(id,d){cubes.forEach(function(c){if(c.id===id)c.q=Math.max(0,c.q+d)});save();render()}
function cD2(id){cubes=cubes.filter(function(c){return c.id!==id});save();render()}
