/*========== 재료 도감 · 알레르기 관찰 ==========*/
function dObs(o){return Math.floor((TD()-d0(o.dt))/864e5)+1}
function vFood(){var m=ageM(),cats=['전체','곡류','육류','어패류','채소','과일','콩·유제품','기타'];
var list=FD.filter(function(f){return fCat==='전체'||f[2]===fCat}).sort(function(a,b){return a[3]-b[3]});
var act=obs.filter(function(o){return !o.done});
return '<div class="cd" style="background:#FFF6EC"><b>🔔 알레르기 3일 관찰 타이머</b><p class="mu" style="margin:5px 0 8px">새 재료는 <b>오전에 소량</b>으로 먹이고 3일간 지켜봅니다.</p>'
+'<div class="rw"><div class="fd" style="flex:1.4;margin:0"><label>새 재료</label><input id="oN" list="oL" placeholder="예: 달걀 노른자"><datalist id="oL">'+FD.map(function(f){return '<option>'+f[0]+'</option>'}).join('')+'</datalist></div><div class="fd" style="flex:1;margin:0"><label>시작일</label><input id="oD" type="date" value="'+ymd(TD())+'"></div></div>'
+'<button class="btn" style="margin-top:9px" onclick="addObs()">＋ 관찰 시작</button><button class="btn y s" style="margin-top:7px" onclick="askNoti()">🔔 브라우저 알림 허용</button></div>'
+(act.length?act.map(function(o,i){var d=dObs(o);
return '<div class="cd" style="border-left:4px solid '+(d<=3?'var(--sn)':'var(--mt)')+'"><div class="rw" style="justify-content:space-between"><b>'+esc(o.n)+'</b><span class="mu">'+o.dt+' · '+d+'일차</span></div>'
+'<div class="ch" style="margin-top:8px">'+[0,1,2].map(function(x){return '<button class="'+(o.c[x]?'on':'')+'" onclick="obsChk('+i+','+x+')">D+'+x+' '+(o.c[x]?'✓':'확인')+'</button>'}).join('')+'</div>'
+'<div class="fd" style="margin:9px 0 0"><label>증상 메모</label><input type="text" value="'+esc(o.m||'')+'" oninput="obsMemo('+i+',this.value)" placeholder="발진·설사·보챔 등"></div>'
+'<div class="rw" style="margin-top:9px"><button class="btn g s" onclick="obsDone('+i+',1)">😊 안전 확인</button><button class="btn y s" onclick="obsDone('+i+',0)">😖 반응 있었음</button></div>'
+(d>=3&&o.c[0]&&o.c[1]&&o.c[2]?'<div class="tp" style="margin-top:8px">3일 관찰이 끝났어요. 이상이 없으면 안전 확인을 눌러주세요.</div>':'')+'</div>'}).join(''):'<div class="cd mu">관찰 중인 재료가 없어요.</div>')
+'<div class="st">🥕 재료 도감 (만 '+Math.floor(m)+'개월 기준)</div>'
+'<div class="cd" style="font-size:12px"><p class="mu" style="margin:0">흐린 재료는 아직 이른 시기. 시기는 일반적 기준이며 아기마다 다릅니다. '+sT('ppibbo')+sT('niaid')+'</p></div>'
+'<div class="tab">'+cats.map(function(c){return '<button class="'+(c===fCat?'on':'')+'" onclick="fCat=\''+c+'\';render()">'+c+'</button>'}).join('')+'</div>'
+'<div class="g4">'+list.map(function(f){var lk=m<f[3],t=tried[f[0]],nv=NUT[f[4]];
return '<button class="ig '+(lk?'lk':'')+'" onclick="openF(\''+f[0]+'\')"><div class="e">'+f[1]+'</div><div class="n">'+f[0]+'</div><div class="m">'+f[3]+'개월+</div>'+(nv&&nv[6]==='h'?'<div class="ok" style="color:var(--rd)">헴철</div>':nv&&nv[5]>=30?'<div class="ok" style="color:#B07C13">비타민C</div>':'')+(t==='ok'?'<div class="ok">✓ 확인</div>':'')+(t==='bad'?'<div class="ok" style="color:#E0563C">⚠ 반응</div>':'')+'</button>'}).join('')+'</div>'}
function addObs(){var n=document.getElementById('oN').value.trim(),dt=document.getElementById('oD').value;
if(!n)return alert('재료명을 입력해 주세요');
obs.push({id:'o'+Date.now(),n:n,dt:dt,c:[0,0,0],m:'',done:0});save();askNoti();render()}
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
+(nv?'<div class="cd"><b style="font-size:13px">100g당 영양 · 하루 목표 대비</b><table class="tb" style="margin-top:5px"><tr><th></th><th>열량</th><th>단백질</th><th>철분</th><th>칼슘</th><th>아연</th><th>VC</th></tr><tr><td>100g</td><td>'+nv[0]+'</td><td>'+nv[1]+'</td><td>'+nv[2]+'</td><td>'+nv[3]+'</td><td>'+nv[4]+'</td><td>'+nv[5]+'</td></tr><tr><td>하루%</td>'+NK.map(function(k,i){return '<td><b style="color:'+NL[k][2]+'">'+Math.round(nv[i]/T.day[k]*100)+'%</b></td>'}).join('')+'<td>-</td></tr></table>'
+'<div class="mu" style="font-size:10.5px;margin-top:5px">철분 종류: <b>'+(nv[6]==='h'?'헴철 — 흡수율 약 20~25%':'비헴철 — 흡수율 약 5%, 비타민C와 함께 먹으면 2~3배 상승')+'</b></div></div>':'')
+(m<f[3]?'<div class="alert bad"><span class="ic">⏳</span><div>아직 이른 재료예요. <b>'+fmt(addM(d0(baby.birth),f[3]))+'</b>(만 '+f[3]+'개월) 이후에 시도해 보세요.</div></div>':'')
+'<div class="st">관찰 · 반응</div><div class="cd"><button class="btn g s" onclick="startObs(\''+n+'\')">🔔 이 재료로 3일 관찰 시작</button><div class="ch" style="margin-top:9px">'+[['ok','😊 잘 먹었어요'],['watch','😐 관찰 중'],['bad','😖 반응 있었어요']].map(function(x){return '<button class="'+(t===x[0]?'on':'')+'" onclick="setF(\''+n+'\',\''+x[0]+'\')">'+x[1]+'</button>'}).join('')+'</div>'
+(t==='bad'?'<div class="alert bad" style="margin-top:9px"><span class="ic">🚑</span><div>호흡 곤란·얼굴 부기·심한 구토가 있으면 즉시 병원에 가세요.</div></div>':'')+'</div>'
+comboFood(f[4])
+(rs.length?'<div class="st">이 재료로 만드는 메뉴</div>'+rs.map(function(r){return rcard(r)}).join(''):'')
+'<button class="btn y" onclick="closeM()">닫기</button>';
document.getElementById('md').classList.add('on');document.body.style.overflow='hidden'}
function startObs(n){obs.push({id:'o'+Date.now(),n:n,dt:ymd(TD()),c:[0,0,0],m:'',done:0});
save();askNoti();closeM();tab='food';render()}
function setF(n,s){tried[n]=tried[n]===s?null:s;if(!tried[n])delete tried[n];save();openF(n);render()}
