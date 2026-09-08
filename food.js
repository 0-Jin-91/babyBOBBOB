/*========== 재료 도감 · 알레르기 관찰 ==========*/
function dObs(o){return Math.floor((TD()-d0(o.dt))/864e5)+1}
var fTab='obs';
function vFood(){if(fTab==='dash')return vFoodDash();
if(fTab==='chk')return vFoodChk();
var m=ageM(),cats=['전체','곡류','육류','어패류','채소','과일','콩·유제품','기타'];
var list=FD.filter(function(f){return fCat==='전체'||f[2]===fCat}).sort(function(a,b){return a[3]-b[3]});
var act=obs.filter(function(o){return !o.done});
return fTabBar()
+'<div class="cd" style="background:#FFF6EC"><b>🔔 알레르기 3일 관찰 타이머</b><p class="mu" style="margin:5px 0 8px">새 재료는 <b>오전에 소량</b>으로 먹이고 3일간 지켜봅니다.</p>'
+obsPicker()
+'<button class="btn y s" style="margin-top:7px" onclick="askNoti()">🔔 브라우저 알림 허용</button></div>'
+(act.length?act.map(function(o,i){var d=dObs(o);
return '<div class="cd" style="border-left:4px solid '+(o.lv===2?'var(--rd)':o.lv===1?'var(--warn)':(d<=3?'var(--sn)':'var(--mt)'))+'"><div class="rw" style="justify-content:space-between"><b>'+esc(o.n)+(o.lv===2?' <span class="tg r">특별주의</span>':o.lv===1?' <span class="tg v">주의</span>':'')+'</b><span class="mu">'+o.dt+(o.tm?' '+o.tm:'')+' · '+d+'일차</span></div>'
+'<div class="ch" style="margin-top:8px">'+[0,1,2].map(function(x){return '<button class="'+(o.c[x]?'on':'')+'" onclick="obsChk('+i+','+x+')">D+'+x+' '+(o.c[x]?'✓':'확인')+'</button>'}).join('')+'</div>'
+'<div class="fd" style="margin:9px 0 0"><label>증상 메모</label><input type="text" value="'+esc(o.m||'')+'" oninput="obsMemo('+i+',this.value)" placeholder="발진·설사·보챔 등"></div>'
+'<div class="rw" style="margin-top:9px"><button class="btn g s" onclick="obsDone('+i+',1)">😊 안전 확인</button><button class="btn y s" onclick="obsDone('+i+',0)">😖 반응 있었음</button></div>'
+(d>=3&&o.c[0]&&o.c[1]&&o.c[2]?'<div class="tp" style="margin-top:8px">3일 관찰이 끝났어요. 이상이 없으면 안전 확인을 눌러주세요.</div>':'')+'</div>'}).join(''):'<div class="cd mu">관찰 중인 재료가 없어요.</div>')
+'<div class="st">🥕 재료 도감 (만 '+Math.floor(m)+'개월 기준)</div>'
+'<div class="cd" style="font-size:12px"><p class="mu" style="margin:0">흐린 재료는 아직 이른 시기. 시기는 일반적 기준이며 아기마다 다릅니다. '+sT('ppibbo')+sT('niaid')+'</p></div>'
+'<div class="tab">'+cats.map(function(c){return '<button class="'+(c===fCat?'on':'')+'" onclick="fCat=\''+c+'\';render()">'+c+'</button>'}).join('')+'</div>'
+'<div class="g4">'+list.map(function(f){var lk=m<f[3],t=tried[f[0]],nv=NUT[f[4]];
return '<button class="ig '+(lk?'lk':'')+'" onclick="openF(\''+f[0]+'\')"><div class="e">'+f[1]+'</div><div class="n">'+f[0]+'</div><div class="m">'+f[3]+'개월+</div>'+(nv&&nv[6]==='h'?'<div class="ok" style="color:var(--rd)">헴철</div>':nv&&nv[5]>=30?'<div class="ok" style="color:#B07C13">비타민C</div>':'')+(t==='ok'?'<div class="ok">✓ 확인</div>':'')+(t==='bad'?'<div class="ok" style="color:#E0563C">⚠ 반응</div>':'')+'</button>'}).join('')+'</div>'}
/*========== 관찰 시작 — 재료 선택형 ==========*/
var OB={sel:'',free:'',cat:'추천'};
function obsCats(){return ['🔎 검색','추천','미확인','곡류','육류','어패류','채소','과일','콩·유제품','기타','직접입력']}
function obsList(){var m=ageM();
if(OB.cat==='직접입력'||OB.cat==='🔎 검색')return [];
var L=FD.filter(function(f){return !tried[f[0]]});
if(OB.cat==='추천'){
 /* 지금 먹여도 되는 시기 + 알레르기 주의도 낮은 것 우선, 알레르겐은 뒤로 */
 return L.filter(function(f){return m>=f[3]}).sort(function(a,b){
  if(a[6]!==b[6])return a[6]-b[6];
  return b[3]-a[3]}).slice(0,12)}
if(OB.cat==='미확인')return L.filter(function(f){return m>=f[3]});
return FD.filter(function(f){return f[2]===OB.cat})}
function obsPicker(){var m=ageM(),L=obsList(),sel=OB.sel,f=null;
FD.forEach(function(x){if(x[0]===sel)f=x});
return '<div class="ch" style="margin:8px 0 9px">'+obsCats().map(function(x){
return '<button class="'+(OB.cat===x?'on':'')+'" onclick="OB.cat=\''+x+'\';render()">'+x+'</button>'}).join('')+'</div>'
+(OB.cat==='🔎 검색'
?ingSearch('obsPick','OB')
:OB.cat==='직접입력'
?'<div class="fd" style="margin:0"><label>재료명 직접 입력</label><input id="oF" value="'+esc(OB.free)+'" oninput="OB.free=this.value" placeholder="예: 아기 치즈 (브랜드명)"></div>'
+'<div class="mu" style="font-size:10.5px;margin-top:5px">재료도감에 없는 것은 여기에 입력하세요. 영양은 계산되지 않지만 관찰 기록은 남습니다.</div>'
:(L.length?'<div class="g4" style="margin-bottom:9px">'+L.map(function(x){var lk=m<x[3],on=(sel===x[0]);
return '<button class="ig'+(lk?' lk':'')+(on?' pick':'')+'" onclick="OB.sel=\''+x[0]+'\';render()"><div class="e">'+x[1]+'</div><div class="n">'+x[0]+'</div><div class="m">'+x[3]+'개월+</div>'
+(x[6]===1?'<div class="ok" style="color:#8A5D00">주의</div>':x[6]===2?'<div class="ok" style="color:#C0350F">특별주의</div>':'')+'</button>'}).join('')+'</div>'
:'<div class="mu" style="font-size:11.5px;padding:8px 0">이 분류에 아직 관찰할 재료가 없어요. 다른 분류나 직접입력을 써 주세요.</div>'))
+(f?obsPoint(f):'')
+'<div class="rw" style="margin-top:9px"><div class="fd" style="flex:1.2;margin:0"><label>관찰 시작일</label><input id="oD" type="date" value="'+ymd(TD())+'"></div>'
+'<div class="fd" style="flex:1;margin:0"><label>먹인 시각</label><input id="oT" type="time" value="'+nowHM()+'"></div></div>'
+'<button class="btn" style="margin-top:9px" onclick="addObs()">＋ '+(OB.cat==='직접입력'?(OB.free||'재료'):(sel||'재료 선택'))+' 관찰 시작</button>'}

function obsPick(n){var q=(ISQ.OB||'').trim();
if(!n){if(!q)return alert('재료명을 입력해 주세요');OB.cat='직접입력';OB.free=q;OB.sel='';render();return}
OB.sel=n;render()}

/*----- 재료별 관찰 포인트 -----*/
var OBP={
1:{t:'알레르기 주의 재료',c:'#8A5D00',bg:'#FFF6EC',p:['<b>오전 중</b>에 먹이세요 — 반응이 와도 병원 진료시간 안입니다','아주 <b>소량(1작은술)</b>부터. 3일간 같은 재료만 늘려갑니다','<b>입 주변 발진·두드러기</b>가 가장 흔한 첫 신호입니다','새 재료 두 가지를 <b>같은 날 함께</b> 시작하지 마세요']},
2:{t:'특별 주의 재료',c:'#C0350F',bg:'#FDF3F0',p:['이 재료는 <b>심한 반응</b> 사례가 보고된 재료입니다','반드시 <b>오전</b>, <b>극소량</b>으로 시작하세요','<b>호흡 곤란·얼굴 부기·심한 구토</b>가 보이면 즉시 119 또는 응급실','첫 시도 전 <b>담당 소아과와 상의</b>를 권합니다']},
0:{t:'일반 재료',c:'#1F7A5F',bg:'#F3FAF7',p:['알레르기 보고가 드문 재료입니다','그래도 <b>3일 관찰</b>은 권장합니다 — 소화 반응(묽은 변·가스)을 볼 수 있어요','<b>소량 → 조금씩 늘리기</b> 순서를 지키세요']}};
function obsPoint(f){var lv=f[6]||0,P=OBP[lv],m=ageM(),early=m<f[3];
return '<div class="cd" style="background:'+P.bg+';padding:10px;margin-bottom:0"><div class="rw" style="justify-content:space-between;align-items:center"><b style="font-size:13px">'+f[1]+' '+f[0]+' <span class="mu" style="font-weight:600">· '+P.t+'</span></b><span class="tg'+(m>=f[3]?' p':'')+'">'+f[3]+'개월부터</span></div>'
+(early?'<div class="alert bad" style="margin:8px 0 0"><span class="ic">⏳</span><div>아직 이른 재료예요. <b>'+fmt(addM(d0(baby.birth),f[3]))+'</b> 이후를 권합니다.</div></div>':'')
+'<div class="mu" style="font-size:11.5px;margin-top:7px">'+f[5]+'</div>'
+'<div class="mu" style="font-size:11px;font-weight:800;margin:9px 0 4px;color:'+P.c+'">👀 이렇게 관찰하세요</div>'
+'<ul style="margin:0;padding-left:16px;font-size:11.5px;color:var(--sub);line-height:1.65">'+P.p.map(function(x){return '<li>'+x+'</li>'}).join('')+'</ul>'
+'<div class="mu" style="font-size:11px;font-weight:800;margin:9px 0 4px">🚨 이런 증상이면 중단</div>'
+'<div class="mu" style="font-size:11px;line-height:1.6">피부 — 두드러기·발진·눈두덩 부기<br>소화 — 반복 구토·설사·피 섞인 변<br>호흡 — 쌕쌕거림·기침·호흡 곤란 <b style="color:var(--rd)">(즉시 병원)</b></div>'
+'<div style="margin-top:7px">'+sT('niaid')+'</div></div>'}

/*========== 재료 탭 하위탭 ==========*/
function fTabBar(){return '<div class="tt"><button class="'+(fTab==='obs'?'on':'')+'" onclick="fTab=\'obs\';render()">🔔 관찰 · 도감</button>'
+'<button class="'+(fTab==='chk'?'on':'')+'" onclick="fTab=\'chk\';render()">✅ 통과 체크리스트</button>'
+'<button class="'+(fTab==='dash'?'on':'')+'" onclick="fTab=\'dash\';render()">📊 섭취 분석</button></div>'}
function vFoodDash(){var A=dAgg(),L=ingRank(A),R=A.R;
var nv=L.filter(function(x){return x.key&&NUT[x.key]});
return fTabBar()
+dashBoard(false)
+(nv.length?'<div class="st">🔬 재료별 영양 기여</div><div class="cd" style="padding:8px"><table class="tb"><tr><th>재료</th><th>g</th><th>단백</th><th>철</th><th>칼슘</th><th>아연</th></tr>'
+nv.slice(0,15).map(function(x){var v=NUT[x.key];
return '<tr onclick="openF(\''+x.n.replace(/'/g,'')+'\')" style="cursor:pointer"><td>'+x.emoji+' '+esc(x.n)+'</td><td>'+rnd(x.g)+'</td>'
+NK.map(function(k){return '<td><b style="color:'+NL[k][2]+'">'+rnd(v[NI[k]]*x.g/100)+'</b></td>'}).join('')+'</tr>'}).join('')
+'</table><div class="mu" style="font-size:10px;margin-top:6px">'+R.lb+' 동안 각 재료가 실제로 공급한 영양량입니다.</div></div>':'')
+notTried(A)
+'<p class="mu" style="text-align:center;font-size:10.5px;margin:14px 6px 0">기록한 재료 기준으로 계산합니다. 「먹었어요」에 먹은 양을 넣으면 더 정확해져요.</p>'}
/*----- 안 먹은 재료 제안 -----*/
function notTried(A){var m=ageM(),got={};
for(var k in A.ing)got[A.ing[k].n]=1;
var L=FD.filter(function(f){return m>=f[3]&&!got[f[0]]}).slice(0,12);
if(!L.length)return '';
return '<div class="st">🌱 이 기간에 안 먹은 재료 <span class="mu" style="font-weight:600;font-size:11.5px">· 먹여도 되는 시기</span></div>'
+'<div class="cd"><div class="ch">'+L.map(function(f){return '<button onclick="openF(\''+f[0].replace(/'/g,'')+'\')">'+f[1]+' '+f[0]+'</button>'}).join('')+'</div>'
+'<div class="mu" style="font-size:10.5px;margin-top:8px">다양한 재료를 돌려 먹이면 영양 균형과 <b>편식 예방</b>에 좋습니다.</div></div>'}

function addObs(){var n=(OB.cat==='직접입력'?(OB.free||'').trim():OB.sel);
var dE=document.getElementById('oD'),tE=document.getElementById('oT');
var dt=dE?dE.value:ymd(TD()),tm=tE?tE.value:'';
if(!n)return alert(OB.cat==='직접입력'?'재료명을 입력해 주세요':'관찰할 재료를 선택해 주세요');
if(obs.filter(function(o){return !o.done&&o.n===n}).length)return alert('이미 관찰 중인 재료예요.');
var f=null;FD.forEach(function(x){if(x[0]===n)f=x});
if(f&&ageM()<f[3]&&!confirm(n+'은 만 '+f[3]+'개월부터 권장돼요. 그래도 시작할까요?'))return;
obs.push({id:'o'+Date.now(),n:n,dt:dt,tm:tm,c:[0,0,0],m:'',done:0,lv:f?(f[6]||0):0});
OB.sel='';OB.free='';save();askNoti();render()}
function obsChk(i,x){var a=obs.filter(function(o){return !o.done})[i];a.c[x]=a.c[x]?0:1;save();render()}
function obsMemo(i,v){var a=obs.filter(function(o){return !o.done})[i];a.m=v;save()}
function obsDone(i,ok){var a=obs.filter(function(o){return !o.done})[i];
a.done=1;a.ok=ok;tried[a.n]=ok?'ok':'bad';save();
alert(ok?a.n+' — 안전 재료로 기록했어요!':a.n+' — 반응으로 기록했어요. 증상이 심하면 소아과에 문의하세요.');render()}
function askNoti(){if(!('Notification' in window))return alert('이 브라우저는 알림을 지원하지 않아요.');
Notification.requestPermission().then(function(p){if(p==='granted')new Notification('알림이 설정되었어요',{body:'관찰 기간 동안 앱을 열면 알려드립니다.'})})}
function notiCheck(){var due=obs.filter(function(o){return !o.done&&dObs(o)<=3&&!o.c[dObs(o)-1]});
if(due.length&&'Notification' in window&&Notification.permission==='granted')
new Notification('🔔 알레르기 관찰 '+due.length+'건',{body:due.map(function(o){return o.n+' '+dObs(o)+'일차'}).join(', ')})}

/*========== 재료 상세 모달 ==========*/
function openF(n){var f=null;FD.forEach(function(x){if(x[0]===n)f=x});
if(!f)return;
var m=ageM(),t=tried[n],nv=NUT[f[4]],T=TG();
var rs=RCP().filter(function(r){return (r.g||[]).filter(function(x){return x[3]===f[4]}).length});
document.getElementById('mb').innerHTML='<div style="font-size:40px;text-align:center">'+f[1]+'</div><div class="mt2" style="text-align:center">'+f[0]+'</div>'
+'<div style="text-align:center;margin:6px 0 12px"><span class="tg m">'+f[2]+'</span><span class="tg '+(m>=f[3]?'p':'')+'">'+f[3]+'개월부터</span>'+(nv&&nv[6]==='h'?'<span class="tg r">헴철(흡수율 높음)</span>':'')+(nv&&nv[5]>=30?'<span class="tg w">비타민C 풍부</span>':'')+(f[6]===1?'<span class="tg v">알레르기 주의</span>':'')+(f[6]===2?'<span class="tg r">특별 주의</span>':'')+'</div>'
+'<div class="cd">'+f[5]+'</div>'
+(nv?'<div class="cd"><b style="font-size:13px">100g당 영양 · 하루 목표 대비</b><table class="tb" style="margin-top:5px"><tr><th></th><th>단백질</th><th>철분</th><th>칼슘</th><th>아연</th><th>VC</th></tr><tr><td>100g</td><td>'+nv[1]+'</td><td>'+nv[2]+'</td><td>'+nv[3]+'</td><td>'+nv[4]+'</td><td>'+nv[5]+'</td></tr><tr><td>하루%</td>'+NK.map(function(k){return '<td><b style="color:'+NL[k][2]+'">'+Math.round(nv[NI[k]]/T.day[k]*100)+'%</b></td>'}).join('')+'<td>-</td></tr></table>'
+'<div class="mu" style="font-size:10.5px;margin-top:5px">철분 종류: <b>'+(nv[6]==='h'?'헴철 — 흡수율 약 20~25%':'비헴철 — 흡수율 약 5%, 비타민C와 함께 먹으면 2~3배 상승')+'</b></div></div>':'')
+(m<f[3]?'<div class="alert bad"><span class="ic">⏳</span><div>아직 이른 재료예요. <b>'+fmt(addM(d0(baby.birth),f[3]))+'</b>(만 '+f[3]+'개월) 이후에 시도해 보세요.</div></div>':'')
+'<div class="st">관찰 · 반응</div><div class="cd"><button class="btn g s" onclick="startObs(\''+n+'\')">🔔 이 재료로 3일 관찰 시작</button><div class="ch" style="margin-top:9px">'+[['ok','😊 잘 먹었어요'],['watch','😐 관찰 중'],['bad','😖 반응 있었어요']].map(function(x){return '<button class="'+(t===x[0]?'on':'')+'" onclick="setF(\''+n+'\',\''+x[0]+'\')">'+x[1]+'</button>'}).join('')+'</div>'
+(t==='bad'?'<div class="alert bad" style="margin-top:9px"><span class="ic">🚑</span><div>호흡 곤란·얼굴 부기·심한 구토가 있으면 즉시 병원에 가세요.</div></div>':'')+'</div>'
+comboFood(f[4])
+(rs.length?'<div class="st">이 재료로 만드는 메뉴</div>'+rs.map(function(r){return rcard(r)}).join(''):'')
+'<button class="btn y" onclick="closeM()">닫기</button>';
document.getElementById('md').classList.add('on');document.body.style.overflow='hidden'}
function startObs(n){var f=null;FD.forEach(function(x){if(x[0]===n)f=x});
if(obs.filter(function(o){return !o.done&&o.n===n}).length){alert('이미 관찰 중인 재료예요.');closeM();tab='food';render();return}
obs.push({id:'o'+Date.now(),n:n,dt:ymd(TD()),tm:nowHM(),c:[0,0,0],m:'',done:0,lv:f?(f[6]||0):0});
OB.sel='';OB.free='';
save();askNoti();closeM();tab='food';render()}
function setF(n,s){tried[n]=tried[n]===s?null:s;if(!tried[n])delete tried[n];save();openF(n);render()}

/*========== ✅ 알레르기 통과 체크리스트 ==========*/
/* 재료 하나하나의 상태를 4갈래로 정리한다.
   ok   통과   — tried[n]==='ok' (3일 관찰 안전 확인 또는 수동 체크)
   test 진행중 — obs 에 미완료 관찰이 있거나 tried[n]==='watch'
   bad  반응   — tried[n]==='bad'
   todo 해야함 — 먹여도 되는 시기인데 아직 손 안 댄 것
   soon 아직   — 권장 개월수가 안 된 것 (해야할 일에서 분리) */
var CK={cat:'주요 알레르겐',only:0};
/* 주요 알레르겐 — 국내 표시대상 + LEAP 근거로 조기도입 권장되는 것들 */
var ALG8=['달걀 노른자','달걀 흰자','달걀(전란)','우유','플레인 요거트','치즈','밀','밀가루','땅콩','땅콩버터','호두','아몬드','대두','두부','새우','게','생선','연어','대구','고등어','메밀','복숭아','토마토','키위','참깨'];
function ckObs(n){var a=null;obs.forEach(function(o){if(!o.done&&o.n===n)a=o});return a}
function ckSt(f){var n=f[0],t=tried[n],ob=ckObs(n),m=ageM();
if(t==='ok')return 'ok';
if(t==='bad')return 'bad';
if(ob||t==='watch')return 'test';
if(m<f[3])return 'soon';
return 'todo'}
var CKM={ok:{t:'통과',ic:'✅',c:'#1F7A5F',bg:'#F3FAF7'},
test:{t:'진행 중',ic:'🔄',c:'#B07C13',bg:'#FFF9EC'},
bad:{t:'반응 있었음',ic:'⚠️',c:'#C0350F',bg:'#FDF3F0'},
todo:{t:'해야 할 것',ic:'⬜',c:'#6B5FC7',bg:'#F4F2FD'},
soon:{t:'아직 이른 시기',ic:'⏳',c:'#8C8480',bg:'#F7F4F1'}};

function ckPool(){var m=ageM();
if(CK.cat==='주요 알레르겐')return FD.filter(function(f){return (f[6]||0)>0||ALG8.indexOf(f[0])>=0});
if(CK.cat==='전체')return FD.slice();
return FD.filter(function(f){return f[2]===CK.cat})}
function ckCats(){return ['주요 알레르겐','전체','곡류','육류','어패류','채소','과일','콩·유제품','기타']}

function vFoodChk(){var m=ageM(),L=ckPool(),G={ok:[],test:[],bad:[],todo:[],soon:[]};
L.forEach(function(f){G[ckSt(f)].push(f)});
/* 진도는 '지금 시도 가능한 것' 기준 — 아직 이른 재료를 분모에 넣으면 영원히 안 채워진다 */
var doable=G.ok.length+G.test.length+G.bad.length+G.todo.length;
var pct=doable?Math.round(G.ok.length/doable*100):0;
var ord=['test','todo','ok','bad','soon'];
return fTabBar()
+'<div class="cd" style="background:linear-gradient(135deg,#FFF6EC,#F3FAF7)"><div class="rw" style="justify-content:space-between;align-items:center">'
+'<b style="font-size:14px">✅ 알레르기 통과 현황</b><span class="pill2" style="background:#fff;color:var(--pd)">'+CK.cat+'</span></div>'
+'<div class="bar" style="margin:10px 0 6px"><i class="solid" style="width:'+pct+'%;background:var(--ok)"></i><span class="txt">'+G.ok.length+' / '+doable+' 통과 ('+pct+'%)</span></div>'
+'<div class="ch">'+ord.map(function(k){var K=CKM[k];
return '<button style="background:'+K.bg+';color:'+K.c+';font-weight:800">'+K.ic+' '+K.t+' '+G[k].length+'</button>'}).join('')+'</div>'
+'<div class="mu" style="font-size:10.5px;margin-top:8px">진도율은 <b>지금 먹여도 되는 재료</b>만 분모로 셉니다. 관찰을 끝내고 <b>😊 안전 확인</b>을 누르면 통과로 넘어갑니다. '+sT('niaid')+'</div></div>'
+'<div class="tab">'+ckCats().map(function(c){return '<button class="'+(CK.cat===c?'on':'')+'" onclick="CK.cat=\''+c.replace(/'/g,'')+'\';render()">'+c+'</button>'}).join('')+'</div>'
+(G.test.length?ckSec('test',G.test):'')
+(G.todo.length?ckSec('todo',G.todo):'')
+(G.bad.length?ckSec('bad',G.bad):'')
+(G.ok.length?ckSec('ok',G.ok):'')
+(G.soon.length?ckSec('soon',G.soon):'')
+(doable===0?'<div class="cd mu">이 분류에 지금 시도할 재료가 없어요.</div>':'')}

function ckSec(k,L){var K=CKM[k];
var hint={test:'3일 관찰이 돌고 있거나 관찰 중으로 표시한 재료입니다. 관찰 탭에서 D+0·1·2 를 체크하고 마무리하세요.',
todo:'먹여도 되는 시기인데 아직 시도하지 않은 재료입니다. 주의도가 높은 것(⚠️🚨)은 오전에 소량부터 시작하세요.',
ok:'3일 관찰을 통과한 안전 재료입니다. 메뉴 추천·조합 실험에서 자유롭게 씁니다.',
bad:'반응이 있었던 재료입니다. 재도전은 담당 소아과와 상의한 뒤에 하세요.',
soon:'권장 개월수가 아직 안 된 재료입니다. 시기가 되면 자동으로 해야 할 것으로 올라옵니다.'}[k];
return '<div class="st">'+K.ic+' '+K.t+' <span class="mu" style="font-weight:600">· '+L.length+'개</span></div>'
+'<div class="cd" style="background:'+K.bg+';padding:10px"><div class="mu" style="font-size:10.5px;margin-bottom:9px">'+hint+'</div>'
+L.map(function(f){return ckRow(f,k)}).join('')+'</div>'}

function ckRow(f,k){var n=f[0],ob=ckObs(n),d=ob?dObs(ob):0,lv=f[6]||0;
var badge=lv===2?'<span class="tg r">🚨 특별주의</span>':lv===1?'<span class="tg v">⚠️ 주의</span>':'';
var sub=k==='test'&&ob?(ob.dt+' 시작 · <b>'+d+'일차</b> · '+[0,1,2].map(function(x){return ob.c[x]?'●':'○'}).join('')) 
 :k==='test'?'관찰 중으로 표시됨 — 3일 타이머를 시작해 보세요'
 :k==='soon'?'<b>'+f[3]+'개월</b>부터 · '+fmt(addM(d0(baby.birth),f[3]))+' 이후'
 :k==='todo'?f[3]+'개월+ · 아직 시도 안 함'
 :k==='ok'?'안전 확인 완료'
 :'반응 기록됨';
return '<div class="cb"><div style="flex:0 0 26px;font-size:20px;text-align:center">'+f[1]+'</div>'
+'<div style="flex:1;min-width:0"><b style="font-size:13px">'+esc(n)+'</b> '+badge
+'<div class="mu" style="font-size:10.5px">'+sub+'</div></div>'
+'<div class="sp">'
+(k==='todo'?'<button style="font-size:10.5px;padding:5px 8px;background:#fff;font-weight:800;color:var(--pd)" onclick="ckStart(\''+n.replace(/'/g,'')+'\')">🔔 관찰 시작</button>':'')
+(k==='test'?'<button style="font-size:10.5px;padding:5px 8px;background:#fff;font-weight:800;color:#1F7A5F" onclick="ckPass(\''+n.replace(/'/g,'')+'\')">😊 통과</button>':'')
+(k==='ok'||k==='bad'?'<button style="font-size:10.5px;padding:5px 8px;background:#fff;font-weight:800;color:var(--sub)" onclick="ckReset(\''+n.replace(/'/g,'')+'\')">↩︎ 해제</button>':'')
+'<button style="color:var(--sub);padding:0 4px" onclick="openF(\''+n.replace(/'/g,'')+'\')">›</button></div></div>'}

/* 체크리스트에서 바로 조작 — 관찰 목록·tried 를 같은 규칙으로 건드린다 */
function ckStart(n){var f=null;FD.forEach(function(x){if(x[0]===n)f=x});
if(ckObs(n))return alert('이미 관찰 중인 재료예요.');
if(f&&ageM()<f[3]&&!confirm(n+'은 만 '+f[3]+'개월부터 권장돼요. 그래도 시작할까요?'))return;
obs.push({id:'o'+Date.now(),n:n,dt:ymd(TD()),tm:nowHM(),c:[0,0,0],m:'',done:0,lv:f?(f[6]||0):0});
save();askNoti();render()}
function ckPass(n){var ob=ckObs(n);
if(ob&&dObs(ob)<3&&!confirm('아직 '+dObs(ob)+'일차예요. 3일 관찰을 마치기 전인데 통과로 기록할까요?'))return;
if(ob){ob.done=1;ob.ok=1}
tried[n]='ok';save();render()}
function ckReset(n){delete tried[n];save();render()}
