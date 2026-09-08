/*========== 재료 도감 · 알레르기 관찰 ==========*/
function dObs(o){return Math.floor((TD()-d0(o.dt))/864e5)+1}
var fTab='dict';
function vFood(){if(fTab==='dash')return vFoodDash();
if(fTab==='chk')return vFoodChk();
if(fTab==='obs')return vFoodObs();
return vFoodDict()}

/*----- 🥕 도감 (도감만) -----*/
function vFoodDict(){var m=ageM(),cats=['전체','곡류','육류','어패류','채소','과일','콩·유제품','기타'];
var list=FD.filter(function(f){return fCat==='전체'||f[2]===fCat}).sort(function(a,b){return a[3]-b[3]});
return fTabBar()
+'<div class="cd" style="font-size:12px"><b>🥕 재료 도감 <span class="mu" style="font-weight:600">· 만 '+Math.floor(m)+'개월 기준</span></b>'
+'<p class="mu" style="margin:5px 0 0">흐린 재료는 아직 이른 시기. 시기는 일반적 기준이며 아기마다 다릅니다. '+sT('ppibbo')+sT('niaid')+'</p></div>'
+'<div class="tab">'+cats.map(function(c){return '<button class="'+(c===fCat?'on':'')+'" onclick="fCat=\''+c+'\';render()">'+c+'</button>'}).join('')+'</div>'
+'<div class="g4">'+list.map(function(f){var lk=m<f[3],t=tried[f[0]],nv=NUT[f[4]],ob=ckObs(f[0]);
return '<button class="ig '+(lk?'lk':'')+'" onclick="openF(\''+f[0]+'\')"><div class="e">'+f[1]+'</div><div class="n">'+f[0]+'</div><div class="m">'+f[3]+'개월+</div>'+(nv&&nv[6]==='h'?'<div class="ok" style="color:var(--rd)">헴철</div>':nv&&nv[5]>=30?'<div class="ok" style="color:#B07C13">비타민C</div>':'')+(t==='ok'?'<div class="ok">✓ 통과</div>':'')+(t==='bad'?'<div class="ok" style="color:#E0563C">⚠ 반응</div>':'')+(!t&&ob?'<div class="ok" style="color:#B07C13">🔄 관찰중</div>':'')+'</button>'}).join('')+'</div>'}

/*----- 🔔 관찰 타이머 (도감과 분리) -----*/
function vFoodObs(){var act=obs.filter(function(o){return !o.done});
var dn=obs.filter(function(o){return o.done}).slice().reverse();
return fTabBar()
+'<div class="cd" style="background:#FFF6EC"><b>🔔 알레르기 3일 관찰 타이머</b><p class="mu" style="margin:5px 0 8px">새 재료는 <b>오전에 소량</b>으로 먹이고 3일간 지켜봅니다. 무엇을 남겨뒀는지는 <b>✅ 체크리스트</b> 탭에서 한눈에 봐요.</p>'
+obsPicker()
+'<button class="btn y s" style="margin-top:7px" onclick="askNoti()">🔔 브라우저 알림 허용</button></div>'
+'<div class="st">⏱ 지금 관찰 중 <span class="mu" style="font-weight:600">· '+act.length+'건</span></div>'
+(act.length?act.map(function(o,i){var d=dObs(o);
return '<div class="cd" style="border-left:4px solid '+(o.lv===2?'var(--rd)':o.lv===1?'var(--warn)':(d<=3?'var(--sn)':'var(--mt)'))+'"><div class="rw" style="justify-content:space-between"><b>'+esc(o.n)+(o.lv===2?' <span class="tg r">특별주의</span>':o.lv===1?' <span class="tg v">주의</span>':'')+'</b><span class="mu">'+o.dt+(o.tm?' '+o.tm:'')+' · '+d+'일차</span></div>'
+'<div class="ch" style="margin-top:8px">'+[0,1,2].map(function(x){return '<button class="'+(o.c[x]?'on':'')+'" onclick="obsChk('+i+','+x+')">D+'+x+' '+(o.c[x]?'✓':'확인')+'</button>'}).join('')+'</div>'
+'<div class="fd" style="margin:9px 0 0"><label>증상 메모</label><input type="text" value="'+esc(o.m||'')+'" oninput="obsMemo('+i+',this.value)" placeholder="발진·설사·보챔 등"></div>'
+'<div class="rw" style="margin-top:9px"><button class="btn g s" onclick="obsDone('+i+',1)">😊 안전 확인</button><button class="btn y s" onclick="obsDone('+i+',0)">😖 반응 있었음</button></div>'
+(d>=3&&o.c[0]&&o.c[1]&&o.c[2]?'<div class="tp" style="margin-top:8px">3일 관찰이 끝났어요. 이상이 없으면 안전 확인을 눌러주세요.</div>':'')+'</div>'}).join(''):'<div class="cd mu">관찰 중인 재료가 없어요. 위에서 재료를 골라 시작하세요.</div>')
+(dn.length?'<div class="st">📖 지난 관찰 기록 <span class="mu" style="font-weight:600">· '+dn.length+'건</span></div>'
+'<div class="cd" style="padding:10px">'+dn.slice(0,20).map(function(o){
return '<div class="cb"><div style="flex:1;min-width:0"><b style="font-size:12.5px">'+esc(o.n)+'</b><div class="mu" style="font-size:10.5px">'+o.dt+(o.m?' · '+esc(o.m):'')+'</div></div>'
+'<span class="pill2" style="background:'+(o.ok?'#E8F6F0':'#FDF0EC')+';color:'+(o.ok?'#1F7A5F':'#C0350F')+'">'+(o.ok?'✅ 통과':'⚠️ 반응')+'</span></div>'}).join('')
+(dn.length>20?'<div class="mu" style="font-size:10.5px;margin-top:6px">최근 20건만 표시</div>':'')+'</div>':'')
+'<button class="btn y" style="margin-top:12px" onclick="fTab=\'chk\';render()">✅ 통과 체크리스트로 이동</button>'}

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
function fTabBar(){var act=obs.filter(function(o){return !o.done}).length,pd=ckPending();
return '<div class="tt" style="flex-wrap:wrap"><button class="'+(fTab==='dict'?'on':'')+'" onclick="fTab=\'dict\';render()">🥕 도감</button>'
+'<button class="'+(fTab==='obs'?'on':'')+'" onclick="fTab=\'obs\';render()">🔔 관찰'+(act?' '+act:'')+'</button>'
+'<button class="'+(fTab==='chk'?'on':'')+'" onclick="fTab=\'chk\';render()">✅ 체크리스트'+(pd?' '+pd:'')+'</button>'
+'<button class="'+(fTab==='dash'?'on':'')+'" onclick="fTab=\'dash\';render()">📊 분석</button></div>'}
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

/*========== ✅ 알레르기 통과 체크리스트 — 시기별 신호등 ==========*/
/* 상태 판정 (관찰 목록 obs · 재료 상태 tried 를 그대로 공유한다)
   ok   통과   — tried[n]==='ok'
   test 진행중 — obs 에 미완료 관찰이 있거나 tried[n]==='watch'
   bad  반응   — tried[n]==='bad'
   todo 해야함 — 먹여도 되는 시기인데 미시도
   soon 이른시기 */
var ALG8=['달걀 노른자','달걀 흰자','달걀(전란)','우유','플레인 요거트','치즈','밀','밀가루','땅콩','땅콩버터','호두','아몬드','대두','두부','새우','게','생선','연어','대구','고등어','메밀','복숭아','토마토','키위','참깨'];
var CK={cat:'주요 알레르겐',open:{},showOk:0};
function ckObs(n){var a=null;obs.forEach(function(o){if(!o.done&&o.n===n)a=o});return a}
function ckSt(f){var n=f[0],t=tried[n],ob=ckObs(n),m=ageM();
if(t==='ok')return 'ok';
if(t==='bad')return 'bad';
if(ob||t==='watch')return 'test';
if(m<f[3])return 'soon';
/* 그 재료가 속한 시기가 이미 끝났으면 '기간 지나 밀린 것' */
var g=ckStgOf(f);
return m>=g.t?'over':'todo'}
/*----- 시기 버킷: 재료 시작 개월수를 STG 구간에 넣는다 -----*/
function ckStages(){return STG.filter(function(g){return g.id!=='ready'})}
function ckStgOf(f){var S=ckStages(),mo=f[3];
for(var i=0;i<S.length;i++)if(mo>=S[i].f&&mo<S[i].t)return S[i];
return S[S.length-1]}
function ckCats(){return ['주요 알레르겐','전체','곡류','육류','어패류','채소','과일','콩·유제품','기타']}
function ckPool(){
if(CK.cat==='전체')return FD.slice();
if(CK.cat==='주요 알레르겐')return FD.filter(function(f){return (f[6]||0)>0||ALG8.indexOf(f[0])>=0});
return FD.filter(function(f){return f[2]===CK.cat})}
/* 탭 배지 — 지금 해야 할(먹여도 되는데 미시도) 재료 수. 주요 알레르겐 기준 */
function ckPending(){var m=ageM();
return FD.filter(function(f){return ((f[6]||0)>0||ALG8.indexOf(f[0])>=0)&&m>=f[3]&&(ckSt(f)==='todo'||ckSt(f)==='over')}).length}
/*----- 시기별 신호등 판정 -----*/
/* sig: 'blue' 지난 시기 전부 정리됨 / 'red' 지난 시기인데 안 한 게 남음
        'now' 지금 진행 중인 시기 / 'gray' 아직 오지 않은 시기 */
function ckStgSig(g,B){var m=ageM();
var past=m>=g.t, cur=m>=g.f&&m<g.t;
var left=B.todo.length+B.over.length;
if(past)return left?'red':'blue';
if(cur)return left?'now':'blue';
return 'gray'}
/* 상태 색 팔레트 — 상단 그래프·칩·시기 카드가 모두 이 색을 공유한다
   ok 통과=초록 / todo 지금 해야 함=노랑 / test 진행중=주황
   over 기간 지나 밀림=자주(빨강은 알레르기 반응 전용이라 겹치지 않게 진한 자주를 골랐다)
   bad 알레르기 반응=빨강 / soon 기간 미정=todo 와 같은 노랑 */
var CKC={ok:{c:'#1F7A5F',g:'linear-gradient(90deg,#3FBF95,#2E9E7A)',bg:'#E8F6F0'},
todo:{c:'#8A6A0B',g:'#F5CE47',bg:'#FFF9E3'},
test:{c:'#B05A13',g:'#FF9E3D',bg:'#FFF0E2'},
over:{c:'#8E2F5B',g:'#B23A72',bg:'#FBEBF2'},
bad:{c:'#C0350F',g:'#E0563C',bg:'#FDF0EC'}};
CKC.soon=CKC.todo;
var CKSIG={red:{c:'#8E2F5B',bg:'#FBEBF2',lb:'🟣 기간이 지났어요'},
blue:{c:'#1F7A5F',bg:'#E8F6F0',lb:'🔵 이 시기 완료'},
now:{c:'#B05A13',bg:'#FFF0E2',lb:'🟠 지금 이 시기'},
gray:{c:'#9A8F88',bg:'#F6F1ED',lb:'⚪️ 아직 이른 시기'}};
/* 정렬 우선순위 — 지난 시기 미완료 → 지금 시기 → 미래 → 완료 */
var CKORD={red:0,now:1,gray:2,blue:3};
function vFoodChk(){var m=ageM(),L=ckPool(),S=ckStages();
/* 시기별 버킷 */
var BK=S.map(function(g){return {g:g,ok:[],test:[],bad:[],todo:[],over:[],soon:[]}});
L.forEach(function(f){var g=ckStgOf(f),b=null;
BK.forEach(function(x){if(x.g.id===g.id)b=x});
if(b)b[ckSt(f)].push(f)});
BK.forEach(function(b){b.sig=ckStgSig(b.g,b);
b.done=b.ok.length;
/* 시기 카드 분모 = 그 시기의 테스트 대상 전체 (기간 미정 soon 까지 포함해야 0/0 이 안 뜬다) */
b.tot=b.ok.length+b.test.length+b.bad.length+b.todo.length+b.over.length+b.soon.length;});
/* 전체 진도 — 분모는 '전체 테스트 대상 재료 수'(현재 분류 전체). 기간 미정도 포함한다 */
var OKn=0,TSn=0,BDn=0,TDn=0,OVn=0,SOn=0;
L.forEach(function(f){var s=ckSt(f);
if(s==='ok')OKn++;else if(s==='test')TSn++;else if(s==='bad')BDn++;
else if(s==='over')OVn++;else if(s==='soon')SOn++;else TDn++});
var TOT=L.length;
var pct=TOT?Math.round(OKn/TOT*100):0;
function ckSeg(n,g){return n?'<div style="width:'+(n/Math.max(1,TOT)*100)+'%;background:'+g+'"></div>':''}
/* 정렬: 신호등 우선순위 → 시기 순서 */
var ORD=BK.slice().sort(function(a,b){var d=CKORD[a.sig]-CKORD[b.sig];
if(d)return d;return a.g.f-b.g.f});
var red=BK.filter(function(b){return b.sig==='red'});
return fTabBar()
+'<div class="cd"><div class="rw" style="justify-content:space-between;align-items:flex-start"><div><b>✅ 알레르기 통과 체크리스트</b><div class="mu" style="font-size:11px;margin-top:3px">만 '+Math.floor(m)+'개월 · '+CK.cat+'</div></div>'
+'<div style="text-align:right"><div style="font-size:22px;font-weight:900;color:var(--mt);line-height:1">'+pct+'%</div><div class="mu" style="font-size:10.5px">'+OKn+' / '+TOT+' 통과</div></div></div>'
+'<div class="bar" style="margin-top:9px">'
+ckSeg(OKn,CKC.ok.g)+ckSeg(TSn,CKC.test.g)+ckSeg(OVn,CKC.over.g)+ckSeg(BDn,CKC.bad.g)+ckSeg(TDn+SOn,CKC.todo.g)+'</div>'
+'<div class="rw" style="gap:6px;margin-top:8px;flex-wrap:wrap">'
+ckB('✅ 통과',OKn,CKC.ok.c,CKC.ok.bg)+ckB('🟠 진행 중',TSn,CKC.test.c,CKC.test.bg)
+ckB('🟡 지금 해야 할 것',TDn,CKC.todo.c,CKC.todo.bg)
+ckB('🟣 기간 지남',OVn,CKC.over.c,CKC.over.bg)
+ckB('🔴 알레르기 반응',BDn,CKC.bad.c,CKC.bad.bg)
+ckB('🟡 기간 미정',SOn,CKC.soon.c,CKC.soon.bg)+'</div>'
+'<div class="mu" style="font-size:10.5px;margin-top:7px">전체 테스트 대상 '+TOT+'가지 기준 · 막대는 통과·진행중·기간지남·반응·해야할것 순</div></div>'
+(red.length?'<div class="alert bad"><span class="ic">🟣</span><div><b>기간이 지났는데 안 한 게 '+red.reduce(function(a,b){return a+b.todo.length+b.over.length},0)+'가지 있어요</b><br><span style="font-size:11.5px">'+red.map(function(b){return b.g.n+' '+(b.todo.length+b.over.length)+'가지'}).join(' · ')+' — 아래 빨간 시기를 펼쳐 확인하세요.</span></div></div>':'')
+'<div class="tab">'+ckCats().map(function(c){return '<button class="'+(c===CK.cat?'on':'')+'" onclick="CK.cat=\''+c+'\';CK.open={};render()">'+c+'</button>'}).join('')+'</div>'
+'<div class="st">📅 시기별 현황 <span class="mu" style="font-weight:600">· 급한 시기부터</span></div>'
+ORD.map(function(b){return ckStgCard(b)}).join('')
+'<div class="cd mu" style="font-size:11px">· 파란 시기는 그 시기 재료를 모두 정리한 상태예요. 빨간 시기는 이미 지났는데 아직 안 해 본 재료가 남아 있다는 뜻입니다.<br>· 알레르기 시도를 <b>늦추는 것이 예방에 도움이 되지 않습니다.</b> 만 6개월 이후 소량씩 3일 관찰로 진행하세요. '+sT('niaid')+sT('ppibbo')+'</div>'}
function ckB(l,n,c,bg){return '<span class="pill2" style="background:'+bg+';color:'+c+'">'+l+' '+n+'</span>'}
/*----- 시기 카드 (접기/펼치기) -----*/
function ckStgCard(b){var g=b.g,K=CKSIG[b.sig],m=ageM();
var open=CK.open[g.id]!==undefined?CK.open[g.id]:(b.sig==='red'||b.sig==='now');
CKST[g.id]=open;
var pct=b.tot?Math.round(b.done/b.tot*100):0;
/* 미완료 = 기간 지난 것 + 지금 해야 할 것 + 기간 미정 */
var undone=b.over.length+b.todo.length+b.soon.length;
var body='';
if(open){
 body='<div style="margin-top:10px">'
 +ckGrp('🟣 기간이 지났어요',b.over,'over',g)
 +ckGrp('🟡 지금 해야 해요',b.todo,'todo',g)
 +ckGrp('🟠 관찰 진행 중',b.test,'test',g)
 +ckGrp('🔴 알레르기 반응 있었어요',b.bad,'bad',g)
 +ckGrp('🟡 기간 미정',b.soon,'soon',g)
 +ckGrp('✅ 통과한 재료',b.ok,'ok',g)
 +(b.tot===0?'<div class="mu" style="font-size:11.5px">이 분류에 해당하는 재료가 없어요.</div>':'')
 +'</div>'}
return '<div class="cd" style="border-left:5px solid '+K.c+';background:'+(b.sig==='blue'?'#FCFFFD':'var(--cd)')+'">'
+'<div onclick="ckTog(\''+g.id+'\')" style="cursor:pointer">'
+'<div class="rw" style="justify-content:space-between;align-items:center">'
+'<div style="min-width:0"><b style="font-size:14px">'+g.n+' <span class="mu" style="font-weight:600;font-size:11px">'+g.lb+'</span></b>'
+'<div style="margin-top:5px"><span class="pill2" style="background:'+K.bg+';color:'+K.c+'">'+K.lb+'</span>'
+(b.over.length?' <span class="pill2" style="background:'+CKC.over.bg+';color:'+CKC.over.c+'">기간지남 '+b.over.length+'</span>':'')
+(b.todo.length?' <span class="pill2" style="background:'+CKC.todo.bg+';color:'+CKC.todo.c+'">해야할것 '+b.todo.length+'</span>':'')
+(b.test.length?' <span class="pill2" style="background:'+CKC.test.bg+';color:'+CKC.test.c+'">관찰 '+b.test.length+'</span>':'')
+'</div></div>'
/* 통과 / 알레르기반응 / 진행중 / 안한것 — 4분할 표기 */
+'<div style="text-align:right;flex-shrink:0;padding-left:8px">'
+'<div style="font-size:15px;font-weight:900;line-height:1;white-space:nowrap">'
+'<span style="color:'+CKC.ok.c+'">'+b.done+'</span><span class="mu" style="font-weight:700">/</span>'
+'<span style="color:'+CKC.bad.c+'">'+b.bad.length+'</span><span class="mu" style="font-weight:700">/</span>'
+'<span style="color:'+CKC.test.c+'">'+b.test.length+'</span><span class="mu" style="font-weight:700">/</span>'
+'<span style="color:'+(b.over.length?CKC.over.c:CKC.todo.c)+'">'+undone+'</span></div>'
+'<div class="mu" style="font-size:9px;margin-top:2px;white-space:nowrap">통과/반응/진행/안함</div>'
+'<div class="mu" style="font-size:15px;line-height:1.1">'+(open?'▾':'▸')+'</div></div></div>'
+'<div class="bar" style="height:8px;border-radius:4px;margin-top:8px">'
+(b.done?'<div style="width:'+(b.done/Math.max(1,b.tot)*100)+'%;background:'+CKC.ok.g+'"></div>':'')
+(b.test.length?'<div style="width:'+(b.test.length/Math.max(1,b.tot)*100)+'%;background:'+CKC.test.g+'"></div>':'')
+(b.over.length?'<div style="width:'+(b.over.length/Math.max(1,b.tot)*100)+'%;background:'+CKC.over.g+'"></div>':'')
+(b.bad.length?'<div style="width:'+(b.bad.length/Math.max(1,b.tot)*100)+'%;background:'+CKC.bad.g+'"></div>':'')
+'</div>'
+'</div>'+body+'</div>'}
/* 현재 화면에 실제로 펼쳐져 있는 상태를 기억해 두고 그것을 뒤집는다
   (기본 펼침 여부가 신호등에 따라 달라지므로 undefined 를 그냥 false 로 두면
    빨간 시기는 첫 클릭이 먹지 않는다) */
var CKST={};
function ckTog(id){CK.open[id]=!CKST[id];render()}
/*----- 상태별 재료 그룹 -----*/
function ckGrp(title,L,st,g){if(!L.length)return '';
if(st==='ok'&&!CK.showOk&&L.length>6){
 return '<div style="margin-bottom:9px"><div class="mu" style="font-size:11px;font-weight:800;margin-bottom:5px">'+title+' '+L.length+'</div>'
 +'<div class="rw" style="flex-wrap:wrap;gap:5px">'+L.slice(0,6).map(function(f){return ckOkChip(f)}).join('')
 +'<span class="pill2" style="background:#E8F6F0;color:#1F7A5F;cursor:pointer" onclick="CK.showOk=1;render()">+'+(L.length-6)+' 더보기</span></div></div>'}
if(st==='ok'){
 return '<div style="margin-bottom:9px"><div class="mu" style="font-size:11px;font-weight:800;margin-bottom:5px">'+title+' '+L.length+'</div>'
 +'<div class="rw" style="flex-wrap:wrap;gap:5px">'+L.map(function(f){return ckOkChip(f)}).join('')+'</div></div>'}
var sorted=L.slice().sort(function(a,b){
 if(st==='todo'||st==='over'||st==='soon'){if(a[3]!==b[3])return a[3]-b[3];return (b[6]||0)-(a[6]||0)}
 return 0});
return '<div style="margin-bottom:9px"><div class="mu" style="font-size:11px;font-weight:800;margin-bottom:5px">'+title+' '+L.length+'</div>'
+sorted.map(function(f){return ckRow(f,st)}).join('')+'</div>'}
/* 통과 재료 — 초록 알약으로 확 띄운다 */
function ckOkChip(f){return '<span onclick="openF(\''+f[0]+'\')" style="display:inline-flex;align-items:center;gap:4px;padding:5px 10px;border-radius:14px;background:linear-gradient(135deg,#3FBF95,#2E9E7A);color:#fff;font-size:11.5px;font-weight:800;cursor:pointer;box-shadow:0 1px 3px rgba(46,158,122,.35)">✓ '+f[1]+' '+esc(f[0])+'</span>'}
/* 그 외 재료 — 한 줄 */
function ckRow(f,st){var n=f[0],ob=ckObs(n),m=ageM();
var C={todo:[CKC.todo.bg,CKC.todo.c],over:[CKC.over.bg,CKC.over.c],test:[CKC.test.bg,CKC.test.c],bad:[CKC.bad.bg,CKC.bad.c],soon:[CKC.soon.bg,CKC.soon.c]}[st];
var right='';
if(st==='todo'||st==='over')right='<button class="btn g s" style="padding:5px 10px;font-size:11px;white-space:nowrap" onclick="ckStart(\''+n+'\')">🔔 시작</button>';
else if(st==='test'){
 if(ob){var d=dObs(ob),p=[0,1,2].map(function(x){return ob.c[x]?'●':'○'}).join('');
  right='<span class="mu" style="font-size:10.5px;white-space:nowrap">'+d+'일차 '+p+'</span><button class="btn g s" style="padding:5px 9px;font-size:11px;white-space:nowrap" onclick="ckPass(\''+n+'\')">😊 통과</button>'}
 else right='<button class="btn g s" style="padding:5px 10px;font-size:11px;white-space:nowrap" onclick="ckPass(\''+n+'\')">😊 통과</button>'}
else if(st==='bad')right='<span class="mu" style="font-size:10.5px">재도전은 소아과 상의</span>';
else if(st==='soon')right='<span class="mu" style="font-size:10.5px;white-space:nowrap">'+fmt(addM(d0(baby.birth),f[3]))+'~</span>';
var sub='';
if(st==='test'&&ob)sub=ob.dt+' 시작'+(ob.m?' · '+esc(ob.m):'');
else if(st==='todo')sub='만 '+f[3]+'개월+ 가능'+((f[6]||0)>0?(f[6]===2?' · 특별주의':' · 주의'):'');
else if(st==='over')sub='만 '+f[3]+'개월부터였어요 · 지금이라도 시작'+((f[6]||0)>0?(f[6]===2?' · 특별주의':' · 주의'):'');
else if(st==='soon')sub='만 '+f[3]+'개월부터';
else if(st==='bad')sub='반응 기록됨';
return '<div class="cb" style="background:'+C[0]+';border-radius:9px;border-bottom:0;padding:8px 10px;margin-bottom:5px">'
+'<span style="font-size:17px;flex-shrink:0">'+f[1]+'</span>'
+'<div style="flex:1;min-width:0"><b style="font-size:12.5px;color:'+C[1]+'" onclick="openF(\''+n+'\')">'+esc(n)+'</b>'
+(sub?'<div class="mu" style="font-size:10.5px">'+sub+'</div>':'')+'</div>'
+'<div class="rw" style="gap:5px;flex-shrink:0">'+right+'</div></div>'}
/*----- 체크리스트에서 바로 조작 -----*/
function ckStart(n){var f=null;FD.forEach(function(x){if(x[0]===n)f=x});
if(obs.filter(function(o){return !o.done&&o.n===n}).length)return alert('이미 관찰 중인 재료예요.');
obs.push({id:'o'+Date.now(),n:n,dt:ymd(TD()),tm:nowHM(),c:[0,0,0],m:'',done:0,lv:f?(f[6]||0):0});
save();askNoti();render()}
function ckPass(n){var a=null;obs.forEach(function(o){if(!o.done&&o.n===n)a=o});
if(a){a.done=1;a.ok=1}
tried[n]='ok';save();render()}
function ckReset(n){delete tried[n];save();render()}
