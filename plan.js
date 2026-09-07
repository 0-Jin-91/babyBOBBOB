/*========== 주간 식단 편성 ==========*/
function genPlan(){var si=IDS.indexOf(curS().id==='ready'?'early':curS().id),ws=wkStart(),n=SLOTS().length,d=[],prev=[];
for(var i=0;i<7;i++){var rs=recommend(si,dOld()+i*3,n,prev);
d.push(rs.map(function(r){return r.i}));
prev=[];rs.forEach(function(r){mainKeys(r).forEach(function(k){if(k.charAt(0)==='P')prev.push(k)})})}
plan={ws:ymd(ws),n:n,d:d};shopChk={};save()}

function vPlan(){return '<div class="tt"><button class="'+(pTab==='w'?'on':'')+'" onclick="pTab=\'w\';render()">🗓 주간</button><button class="'+(pTab==='s'?'on':'')+'" onclick="pTab=\'s\';render()">🛒 장보기</button><button class="'+(pTab==='c'?'on':'')+'" onclick="pTab=\'c\';render()">🧊 큐브</button></div>'+(pTab==='w'?vWeek():pTab==='s'?vShop():vCube())}

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
+'<button class="btn g s" onclick="pTab=\'s\';render()">🛒 장보기 리스트 만들기</button>';
return h}
function swapPlan(i,j){var si=IDS.indexOf(curS().id==='ready'?'early':curS().id),L=altList(si,[plan.d[i][j]]);
document.getElementById('mb').innerHTML='<div class="mt2">메뉴 교체</div><p class="mu" style="margin:6px 0 10px">'+['월','화','수','목','금','토','일'][i]+'요일 '+SLOTS()[j]+' · 영양 점수 높은 순</p>'
+L.map(function(r){return '<div onclick="doSwap('+i+','+j+',\''+r.i+'\')">'+rcard(r)+'</div>'}).join('')
+'<button class="btn y" onclick="closeM()">닫기</button>';
document.getElementById('md').classList.add('on');document.body.style.overflow='hidden'}
function doSwap(i,j,id){plan.d[i][j]=id;shopChk={};save();closeM();render()}

/*========== 장보기 ==========*/
function shopList(){if(!plan)genPlan();var need={};
plan.d.forEach(function(day){day.forEach(function(id){var r=getR(id);if(!r)return;var sv=r.sv||1;
(r.g||[]).forEach(function(x){var nm=x[3]||x[0];
if(!nm||x[0]==='물'||nm==='물')return;
var gr=gOf(x)/sv;if(!gr)return;need[nm]=(need[nm]||0)+gr})})});
var have={};cubes.forEach(function(c){if(c.q>0)have[c.n]=(have[c.n]||0)+c.q*c.g});
return Object.keys(need).map(function(k){var n=need[k],h=have[k]||0;
return {n:k,need:n,have:h,buy:Math.ceil(Math.max(0,n-h)/10)*10}}).sort(function(a,b){return b.buy-a.buy})}
function vShop(){var L=shopList(),ws=d0(plan.ws);
return '<div class="cd"><b>🛒 장보기 리스트</b><p class="mu" style="margin:5px 0 0">'+fmt(ws)+' 주간 식단('+plan.n+'끼×7일) 총량에서 <b>냉동 큐브 재고 차감</b>. 10g 단위 올림.</p></div>'
+(L.length?'<div class="cd">'+L.map(function(x){var on=shopChk[x.n];
return '<div class="sc '+(on?'on':'')+'" onclick="shopChk[\''+x.n.replace(/'/g,'')+'\']='+(on?'0':'1')+';save();render()"><div class="bx2">'+(on?'✓':'')+'</div><div style="flex:1"><b class="nm2" style="font-size:13.5px">'+esc(x.n)+'</b><div class="mu" style="font-size:10.5px">필요 '+Math.round(x.need)+'g'+(x.have?' · 큐브 '+Math.round(x.have)+'g 보유':'')+'</div></div><b style="color:'+(x.buy?'var(--pd)':'var(--mt)')+'">'+(x.buy?x.buy+'g':'충분')+'</b></div>'}).join('')+'</div>':'<div class="cd mu">식단을 먼저 편성해 주세요.</div>')
+'<button class="btn g s" onclick="copyShop()">📋 텍스트 복사 (카톡 전송용)</button>'
+'<div class="cd" style="background:#F3FAF7;font-size:12px;margin-top:10px"><b>구매 팁</b><ul style="margin:5px 0 0;padding-left:16px;color:var(--sub)"><li>고기는 소분 냉동해 두면 편합니다.</li><li>비타민C 채소(파프리카·브로콜리)는 철분 흡수용으로 늘 준비하세요.</li><li>두부·생선은 조리 당일 구매를 권합니다.</li></ul></div>'}
function copyShop(){var L=shopList().filter(function(x){return x.buy>0});
var t='🛒 '+baby.name+' 이유식 장보기 ('+fmt(d0(plan.ws))+' 주)\n'+L.map(function(x){return '· '+x.n+' '+x.buy+'g'}).join('\n');
if(navigator.clipboard)navigator.clipboard.writeText(t).then(function(){alert('복사했어요!')},function(){prompt('복사하세요',t)});
else prompt('복사하세요',t)}

/*========== 큐브 ==========*/
function dLeft(c){return 14-Math.floor((TD()-d0(c.dt))/864e5)}
function vCube(){var act=cubes.filter(function(c){return c.q>0});
return '<div class="cd"><b>🧊 냉동 큐브 재고</b><p class="mu" style="margin:5px 0 10px">만든 날 기준 14일까지를 권장 사용기한으로 계산하고 장보기에서 자동 차감합니다.</p>'
+'<div class="rw"><div class="fd" style="flex:1.3;margin:0"><label>재료</label><input id="cN" list="cL" placeholder="소고기"><datalist id="cL">'+Object.keys(NUT).map(function(k){return '<option>'+k+'</option>'}).join('')+'</datalist></div><div class="fd" style="flex:.6;margin:0"><label>개수</label><input id="cQ" type="number" placeholder="7"></div><div class="fd" style="flex:.6;margin:0"><label>1개 g</label><input id="cG" type="number" placeholder="10"></div></div>'
+'<div class="fd" style="margin:10px 0 0"><label>만든 날</label><input id="cD" type="date" value="'+ymd(TD())+'"></div><button class="btn" style="margin-top:10px" onclick="addCube()">＋ 큐브 등록</button></div>'
+'<div class="st">보유 중 ('+act.length+'종)</div>'
+(act.length?'<div class="cd">'+act.map(function(c){var d=dLeft(c);
return '<div class="cb"><div style="flex:0 0 30px;height:30px;border-radius:9px;overflow:hidden">'+ART('cube')+'</div><div style="flex:1"><b style="font-size:13.5px">'+esc(c.n)+'</b><div class="mu" style="font-size:10.5px">'+c.g+'g/개 · 총 '+(c.q*c.g)+'g · '+(d>0?'<b style="color:'+(d<=2?'var(--rd)':'var(--sub)')+'">D-'+d+'</b>':'<b style="color:var(--rd)">기한 초과</b>')+'</div></div><div class="sp"><button onclick="cQ2(\''+c.id+'\',-1)">−</button><b style="width:20px;text-align:center">'+c.q+'</b><button onclick="cQ2(\''+c.id+'\',1)">＋</button><button style="color:var(--sub);padding:0 3px" onclick="cD2(\''+c.id+'\')">✕</button></div></div>'}).join('')
+'<div class="mu" style="font-size:10.5px;margin-top:8px">− 버튼으로 사용한 개수를 차감하세요.</div></div>':'<div class="cd mu">등록된 큐브가 없어요. 메뉴 > 토핑 > [준비] 큐브 만들기를 참고하세요.</div>')
+'<div class="cd" style="background:#F3FAF7;font-size:12px"><b>보관 팁</b><ul style="margin:5px 0 0;padding-left:16px;color:var(--sub)"><li>완전히 식힌 뒤 뚜껑을 덮어 냉동.</li><li>지퍼백에 재료명·날짜를 적어두세요.</li><li>실온 방치·재냉동은 피하세요.</li></ul><div style="margin-top:6px">'+sT('mfds')+'</div></div>'}
function addCube(){var n=document.getElementById('cN').value.trim(),q=+document.getElementById('cQ').value,g=+document.getElementById('cG').value||10,dt=document.getElementById('cD').value;
if(!n)return alert('재료명을 입력해 주세요');if(!q)return alert('개수를 입력해 주세요');
cubes.push({id:'c'+Date.now(),n:n,q:q,g:g,dt:dt});save();render()}
function cQ2(id,d){cubes.forEach(function(c){if(c.id===id)c.q=Math.max(0,c.q+d)});save();render()}
function cD2(id){cubes=cubes.filter(function(c){return c.id!==id});save();render()}
