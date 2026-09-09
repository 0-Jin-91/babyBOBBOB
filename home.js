/*========== 홈 ==========*/
/* 섹션 구조: 상단 검색 → 알림(항상 표시) → 접이식 6개 섹션.
   각 섹션은 sec(id,...) 로 감싸며 펼침 상태가 저장된다(ui.js SEC). */
var HSEC=['h_goal','h_milk','h_nut','h_rec','h_stage','h_road'];
function vHome(){var s=curS(),T=TG(),rec=todayRec(),sl=SLOTS(),D=todaySum();
var pAcc={p:0,fe:0,ca:0,zn:0};
rec.forEach(function(r){if(!r)return;var n=nutOf(r).t;NK.forEach(function(k){pAcc[k]+=n[k]})});
var due=obs.filter(function(o){return !o.done&&dObs(o)<=3});
var exp=cubes.filter(function(c){return c.q>0&&dLeft(c)<=2});
var ns=nextStage(),nd=ns?Math.ceil((addM(d0(baby.birth),ns.f)-TD())/864e5):999;
var dri=T.dri,w=T.w;
var DS=dayScore(rec);
var DY=mlDay(),G=mlGuide();

/*----- ① 통합 검색 + 알림 (항상 표시) -----*/
return findBar()
+(s.id==='ready'?'<div class="cd" style="background:#FFF6EC"><b>🕒 아직 이유식 시작 전</b><p class="mu" style="margin:5px 0 0">시작 예정일 <b style="color:var(--pd)">'+fmt(addM(d0(baby.birth),6))+'</b> · <b>'+Math.max(0,Math.ceil((addM(d0(baby.birth),6)-TD())/864e5))+'일</b> 남음</p></div>':'')
+(ns&&nd>0&&nd<=14?'<div class="cd" style="background:#F3FAF7"><b>🎉 '+nd+'일 후 '+ns.n+'로 넘어가요</b><p class="mu" style="margin:4px 0 0">'+fmt(addM(d0(baby.birth),ns.f))+'부터 <b>'+ns.ra+'</b> · '+ns.ct+'</p></div>':'')
+(due.length?'<div class="alert mid"><span class="ic">🔔</span><div><b>알레르기 관찰 중 '+due.length+'건</b>'+due.map(function(o){return '<br>· '+esc(o.n)+' — '+dObs(o)+'일차'}).join('')+'<button class="btn g s" style="margin-top:8px" onclick="tab=\'food\';fTab=\'obs\';render()">관찰 기록하기</button><button class="btn y s" style="margin-top:8px" onclick="tab=\'food\';fTab=\'chk\';render()">✅ 통과 체크리스트</button></div></div>':'')
+((typeof cubeLowAlert==='function')?cubeLowAlert():'')
+(exp.length?'<div class="alert bad"><span class="ic">🧊</span><div>유효기간 임박: <b>'+exp.map(function(c){return c.n}).join(', ')+'</b><button class="btn g s" style="margin-top:8px" onclick="tab=\'plan\';pTab=\'c\';render()">큐브 보기</button></div></div>':'')

/*----- 오늘 탭 바로가기 (항상 표시 · 얇게) -----*/
+'<div class="cd" style="background:#F3F6FA;cursor:pointer;padding:11px" onclick="tab=\'today\';render()"><div class="rw" style="justify-content:space-between;align-items:center"><div><b style="font-size:13px">📅 오늘 기록 관리</b><div class="mu" style="font-size:10.5px;margin-top:2px">끼니 체크 · 먹은 양 수정 · 수유 회차 · 간식</div></div><span style="color:var(--bl);font-weight:800">›</span></div></div>'

/*----- 전체 펼치기/접기 -----*/
+secBar(HSEC)

/*----- ② 하루 목표 기준 -----*/
+sec('h_goal','🎯','오늘의 하루 목표 기준','이유식 · 수유가 함께 채우는 비율',function(){
return '<div class="rw" style="justify-content:flex-end;margin-bottom:7px"><button class="mu" style="color:var(--bl);font-weight:700" onclick="tab=\'grow\';render()">📈 성장기록</button></div>'
+'<div class="g2">'
+'<div style="background:'+(T.use?'#fff':'#FFEDE4')+';border:1.5px solid '+(T.use?'var(--ln)':'var(--pc)')+';border-radius:11px;padding:9px;cursor:pointer" onclick="baby.useW=0;save();render()"><div class="mu" style="font-size:10px;font-weight:800">표준 기준 ('+T.lb+')</div><b style="font-size:13px">단백 '+dri.p+'g · 철 '+dri.fe+'mg</b><div class="mu" style="font-size:10px">2020 섭취기준</div></div>'
+'<div style="background:'+(T.use?'#FFEDE4':'#fff')+';border:1.5px solid '+(T.use?'var(--pc)':'var(--ln)')+';border-radius:11px;padding:9px;cursor:pointer" onclick="if(!'+(w?1:0)+'){alert(\'성장 탭에서 몸무게를 먼저 기록해 주세요\');return}baby.useW=1;save();render()"><div class="mu" style="font-size:10px;font-weight:800">우리 아기 체중 기준</div><b style="font-size:13px">'+(w?'단백 '+rnd(w*dri.pkg)+'g · 철 '+dri.fe+'mg':'몸무게 미입력')+'</b><div class="mu" style="font-size:10px">'+(w?w+'kg × '+dri.pkg+'g/kg':'성장 탭에서 입력')+'</div></div></div>'
+'<div class="mu" style="font-size:10.5px;margin-top:7px">눌러서 기준 변경. 현재 적용: <b style="color:var(--pd)">'+(T.use?'체중 기준':'표준 기준')+'</b> '+sT('kdri')+'</div>'
+dualGoal()},1,(T.use?'체중 기준':'표준 기준'))

/*----- ③ 수유 -----*/
+sec('h_milk','🍼','오늘 수유','권장 '+DY.lo+'~'+DY.hi+'ml ('+G.lb+(ageM()>=6?' · 이유식 병행':'')+')',milkCard,1,D.ml+'ml')

/*----- ④ 영양 현황 -----*/
+sec('h_nut','📊','영양 현황','일일 · 주간 · 월간 · 재료별 섭취',function(){
return dashBoard(true)
+'<button class="btn g s" style="margin-top:8px" onclick="tab=\'food\';fTab=\'dash\';render()">🥕 재료별 상세 보기</button>'},1,D.cnt+'끼')

/*----- ⑤ 오늘 추천 끼니 -----*/
+sec('h_rec','🍽','오늘 '+MEALS()+'끼 추천','하루 합계 '+DS.sc+'% · 대안·수정·기록',function(){
return '<div class="cd" style="background:#FBF6F2"><b style="font-size:12.5px">추천 '+MEALS()+'끼를 모두 먹으면 (이유식만)</b><div class="g5" style="margin-top:8px">'+NK.map(function(k){var p=Math.round(pAcc[k]/T.solid[k]*100);
return '<div style="text-align:center;background:#fff;border-radius:9px;padding:7px 2px"><div class="mu" style="font-size:9.5px">'+NL[k][0]+'</div><b style="color:'+lvCol(p)+';font-size:15px">'+p+'%</b></div>'}).join('')+'</div><div class="mu" style="font-size:10px;margin-top:6px">이유식 담당 목표 대비</div></div>'
+(DS.low.length?'<div class="alert '+(DS.low[0].pc<LV.mid?'bad':'mid')+'"><span class="ic">'+(DS.low[0].pc<LV.mid?'🚨':'⚠️')+'</span><div><b>추천 '+MEALS()+'끼를 다 먹어도 '+DS.low.map(function(x){return x.nm+' '+Math.round(x.pc)+'%'}).join(' · ')+'</b>가 부족합니다.<br>'
+DS.low.slice(0,2).map(function(x){return '· <b>'+x.nm+'</b> '+rnd2(x.lack)+x.u+' 더 필요 — '+FIX[x.k].f.slice(0,3).join('·')+' 추가<br>'}).join('')
+'<div class="ch" style="margin-top:7px">'+DS.low.slice(0,2).map(function(x){
return '<button style="background:#E7F1FB;color:#3A6FA8" onclick="boostDay(\''+x.k+'\')">🔧 '+x.nm+' 보충하기</button>'}).join('')
+'<button style="background:#F5EFEA;color:var(--sub)" onclick="reRec()">🎲 다시 편성</button></div></div>'
:'<div class="alert ok"><span class="ic">✅</span><div>추천 '+MEALS()+'끼로 <b>이유식 담당 영양이 충분히 채워집니다.</b> 나머지는 수유가 보충해요.</div></div>')
+rec.map(function(r,i){if(!r)return '';var sc=mealScore(r);
return '<div class="cd" style="padding:10px"><div class="rw" style="justify-content:space-between;align-items:center;margin-bottom:6px"><b style="font-size:12.5px;color:var(--pd)">'+sl[i]+'</b><span><button class="mu" style="font-weight:700;color:var(--bl)" onclick="openAlt('+i+')">🔄 대안</button> <button class="mu" style="font-weight:700;color:var(--pd);margin-left:8px" onclick="openEd(\''+r.i+'\')">✏️ 수정</button></span></div>'
+rcard(r)
+((sc<LV.mid||sc>LV.over)?'<div class="alert '+lvl(sc)+'" style="margin:6px 0 8px;cursor:pointer" onclick="diagMeal(\''+r.i+'\')"><span class="ic">'+lvIco(sc)+'</span><div>1끼 목표의 <b>'+sc+'%</b> ('+lvTxt(sc)+') — <u>눌러서 개선안 보기 ›</u></div></div>':'')
+(function(){var done=loggedToday(r.i);
return '<div class="rw">'+(done?'<button class="btn g s" onclick="openAteFor(\''+done+'\')">⚖️ 먹은 양 수정</button><button class="btn y s" onclick="unLog(\''+done+'\')">↩︎ 취소</button>':'<button class="btn g s" onclick="qLog(\''+r.i+'\')">📝 먹었어요</button><button class="btn y s" onclick="toggleFav(\''+r.i+'\')">'+(fav[r.i]?'⭐ 해제':'☆ 즐겨찾기')+'</button>')+'</div>'
+(done?'<div class="mu" style="font-size:10.5px;margin-top:6px;color:var(--ok);font-weight:700">✅ 기록됨'+(logTmOf(done)?' · 🕐 '+logTmOf(done):'')+(logAmtOf(done)?' · '+logAmtOf(done)+'g':' · 양 미입력')+'</div>':'')})()+'</div>'}).join('')
+'<button class="btn y s" onclick="reRec()">🎲 추천 다시 받기</button>'},1,DS.sc+'%')

/*----- ⑥ 단계 기준 -----*/
+sec('h_stage','📚',s.n+' 기준',s.lb+' · '+s.ra,function(){
return '<div class="g2">'+cell('농도',s.ra)+cell('횟수',s.ct)+cell('1회 양',s.am)+cell('입자',s.tx)+'</div><p class="mu" style="margin:10px 0 0">'+s.ds+'</p><div class="hr"></div><ul style="margin:0;padding-left:17px;font-size:13px">'+s.td.map(function(t){return '<li>'+t+'</li>'}).join('')+'</ul><div style="margin-top:8px">'+sT('ppibbo')+'</div>'},0,s.ra)

/*----- ⑦ 로드맵 -----*/
+sec('h_road','🗺',esc(baby.name)+'의 로드맵','이유식 단계별 이정표',function(){
return '<div class="rm">'+roadmap()+'</div>'},0)

+'<p class="mu" style="text-align:center;font-size:10.5px;margin:14px 6px 0">참고 자료입니다. 최종 판단은 담당 소아과와 상의하세요.</p>'}

/*========== 🎯 이유식 + 수유 이중 목표 ==========*/
function dualGoal(){var T=TG(),D=todaySum(),DY=mlDay(),G=mlGuide(),s=curS();
var mlPc=Math.min(150,D.ml/Math.max(1,(DY.lo+DY.hi)/2)*100);
var solidPc=0,n=0;
NK.forEach(function(k){solidPc+=D.f[k]/Math.max(.01,T.solid[k])*100;n++});
solidPc=solidPc/n;
var sfAvg=Math.round(T.sf*100);
return '<div class="hr"></div><div class="mu" style="font-size:11px;font-weight:800;margin-bottom:7px">🍲 이유식과 🍼 수유가 함께 채웁니다 <span style="font-weight:600">('+s.n+')</span></div>'
+'<div class="dg">'
+'<div class="dgi"><div class="dgh"><b>🍲 이유식</b><span class="badge '+lvl(solidPc)+'">'+lvIco(solidPc)+' '+Math.round(solidPc)+'%</span></div>'
+'<div class="bar" style="height:13px"><i class="solid" style="width:'+Math.min(100,solidPc)+'%;background:#3FAE8E"></i><span class="goal" style="left:calc(100% - 3px)"></span></div>'
+'<div class="dgv">'+D.cnt+'끼 / 목표 '+MEALS()+'끼 · 영양의 <b>약 '+sfAvg+'%</b> 담당</div>'
+'<div class="dgs">단백 '+rnd(T.solid.p)+'g · 철 '+rnd(T.solid.fe)+'mg · 칼슘 '+Math.round(T.solid.ca)+'mg</div></div>'
+'<div class="dgi"><div class="dgh"><b>🍼 수유</b><span class="badge '+mlLv(D.ml)+'">'+(mlLv(D.ml)==='ok'?'✅':mlLv(D.ml)==='mid'?'⚠️':'🚨')+' '+Math.round(mlPc)+'%</span></div>'
+'<div class="bar" style="height:13px"><i class="solid" style="width:'+Math.min(100,mlPc)+'%;background:#7FB5E8"></i><span class="goal" style="left:calc(100% - 3px)"></span></div>'
+'<div class="dgv">'+D.ml+'ml / 권장 <b>'+DY.lo+'~'+DY.hi+'ml</b> · 영양의 <b>약 '+(100-sfAvg)+'%</b> 담당</div>'
+'<div class="dgs">회당 '+G.per[0]+'~'+G.per[1]+'ml · 하루 '+G.cnt[0]+'~'+G.cnt[1]+'회</div></div>'
+'</div>'
+'<div class="mu" style="font-size:10px;margin-top:7px">'+s.n+'에는 이유식이 영양의 <b>'+sfAvg+'%</b>, 수유가 <b>'+(100-sfAvg)+'%</b>를 담당하는 것이 일반적입니다. 둘을 <b>합쳐서 100%</b>면 충분해요.</div>'}

/*========== 🍼 회차별 진행 막대 차트 ==========*/
function milkChart(){var ms=todayLogs().filter(function(l){return l.k==='milk'&&l.tm})
.sort(function(a,b){return hm2min(a.tm)-hm2min(b.tm)});
if(!ms.length)return '<div class="mu" style="font-size:11px;text-align:center;padding:14px 0">아래에서 첫 수유를 기록해 보세요.</div>';
var G=mlGuide(),hi=G.per[1],mx=hi;
ms.forEach(function(l){if(+l.ml>mx)mx=+l.ml});
var DY=mlDay();
var bars=ms.map(function(l,i){var v=+l.ml||0;
var h=Math.round(v/mx*100),lo=G.per[0],inR=(v>=lo&&v<=hi);
var col=inR?'#7FB5E8':(v<lo?'#F2C879':'#E88A6B');
var gap=i?hm2min(l.tm)-hm2min(ms[i-1].tm):null;
return '<div class="mcol" onclick="editMilk(\''+l.id+'\')">'
+'<div class="mcv">'+v+'</div>'
+'<div class="mcb"><i style="height:'+h+'%;background:'+col+'"></i></div>'
+'<div class="mct">'+l.tm+'</div>'
+'<div class="mcg">'+(gap!=null?'+'+minTxt(gap):'&nbsp;')+'</div></div>'}).join('');
var loH=Math.round(G.per[0]/mx*100),hiH=Math.round(hi/mx*100);
return '<div class="mch"><div class="mcgrid"><span style="bottom:'+hiH+'%"><b>'+hi+'</b></span><span style="bottom:'+loH+'%"><b>'+G.per[0]+'</b></span></div>'
+'<div class="mcrow">'+bars+'</div></div>'
+'<div class="sub2" style="margin-top:5px;font-size:9.5px"><span><b style="background:#7FB5E8"></b>권장 범위</span><span><b style="background:#F2C879"></b>적게</span><span><b style="background:#E88A6B"></b>많이</span><span style="margin-left:auto">막대를 누르면 수정</span></div>'
+cumBar(ms,DY)}
function cumBar(ms,DY){var cum=0,segs=ms.map(function(l){var v=+l.ml||0;var st=cum;cum+=v;
return {st:st,v:v,tm:l.tm}});
var total=cum,base=Math.max(DY.hi,total);
return '<div style="margin-top:10px"><div class="mu" style="font-size:10.5px;font-weight:800;margin-bottom:4px">누적 진행 · '+total+'ml / 권장 '+DY.lo+'~'+DY.hi+'ml</div>'
+'<div class="cum">'+segs.map(function(s,i){return '<i style="left:'+(s.st/base*100)+'%;width:'+(s.v/base*100)+'%;background:'+(i%2?'#7FB5E8':'#5B9BD8')+'" title="'+s.tm+' '+s.v+'ml"></i>'}).join('')
+'<span class="cl" style="left:'+(DY.lo/base*100)+'%"></span><span class="cl hi" style="left:'+(DY.hi/base*100)+'%"></span></div>'
+'<div class="mu" style="font-size:9.5px;margin-top:3px">초록선 = 권장 하한('+DY.lo+') · 파란선 = 권장 상한('+DY.hi+')</div></div>'}

/*========== 수유 카드 ==========*/
function milkCard(){var D=todaySum(),G=mlGuide(),DY=mlDay(),ms=todayLogs().filter(function(l){return l.k==='milk'});
var lv=mlLv(D.ml),pc=Math.min(100,D.ml/Math.max(1,DY.hi)*100),lop=DY.lo/Math.max(1,DY.hi)*100;
return '<div class="cd"><div class="rw" style="justify-content:space-between;align-items:baseline"><b style="font-size:22px">'+D.ml+' <span style="font-size:13px;font-weight:600">ml</span></b>'
+'<span class="badge '+lv+'">'+(lv==='ok'?'✅':lv==='mid'?'⚠️':'🚨')+' '+mlTxt(D.ml)+'</span></div>'
+'<div class="bar" style="height:15px;margin-top:7px"><i class="solid" style="width:'+pc+'%;background:#7FB5E8"></i><span class="goal" style="left:'+lop+'%;background:var(--ok)"></span><span class="goal" style="left:calc(100% - 3px)"></span></div>'
+'<div class="mu" style="font-size:10.5px;margin-top:5px">'+MILK[MTYPE()].n+' · '+ms.length+'회 / 권장 '+G.cnt[0]+'~'+G.cnt[1]+'회 · 회당 '+G.per[0]+'~'+G.per[1]+'ml</div>'
+'<div class="hr"></div><div class="mu" style="font-size:11px;font-weight:800;margin-bottom:6px">📊 회차별 진행</div>'+milkChart()
+(ms.length?'<div class="hr"></div><div class="mu" style="font-size:11px;font-weight:800;margin-bottom:5px">회차별 기록 <span style="font-weight:600">(숫자를 눌러 수정)</span></div>'
+ms.sort(function(a,b){return hm2min(a.tm||'00:00')-hm2min(b.tm||'00:00')}).map(function(l,i){
return '<div class="mrow"><span class="mno">'+(i+1)+'회</span><span class="mtm">'+(l.tm||'--:--')+'</span>'
+'<button class="mml" onclick="editMilk(\''+l.id+'\')">'+l.ml+'ml</button>'
+'<span class="mu" style="font-size:10px;flex:1">'+MILK[l.mt||MTYPE()].n+'</span>'
+'<button class="mx" onclick="delMilk(\''+l.id+'\')">✕</button></div>'}).join(''):'')
+'<div class="hr"></div><div class="mu" style="font-size:11px;font-weight:800;margin-bottom:6px">＋ 이번 회차 추가</div>'
+'<div class="rw" style="align-items:flex-end;margin-bottom:8px"><div class="fd" style="flex:1;margin:0"><label>먹인 시각</label><input id="mkTm" type="time" value="'+nowHM()+'"></div><button class="btn g s" style="flex:0 0 auto;margin:0 0 0 7px;width:auto;padding:10px 12px" onclick="document.getElementById(\'mkTm\').value=nowHM()">지금</button></div>'
+'<div class="mlk">'+milkQuick().map(function(v){return '<button onclick="addMilk('+v+')">+'+v+'</button>'}).join('')
+'<button onclick="addMilkP()" style="background:#F5EFEA;color:var(--sub)">직접</button></div>'
+'<div class="mu" style="font-size:10px;margin-top:7px">권장량은 일반적 기준이며 아기마다 다릅니다. '+sT('milk')+'</div></div>'}
function milkQuick(){var G=mlGuide(),lo=G.per[0],hi=G.per[1],st=(hi-lo)/4,a=[];
for(var i=0;i<5;i++)a.push(Math.round((lo+st*i)/10)*10);
var u={},r=[];a.forEach(function(v){if(!u[v]){u[v]=1;r.push(v)}});return r}
function editMilk(id){var L=null;logs.forEach(function(l){if(l.id===id)L=l});if(!L)return;
var v=prompt('수유량 (ml)  ·  '+(L.tm||'')+' 회차',L.ml);
if(v===null)return;v=+v;
if(!v){if(confirm('0으로 두면 이 회차를 삭제합니다. 삭제할까요?'))delMilk(id);return}
L.ml=v;L.n=MILK[L.mt||MTYPE()].n+' '+v+'ml';
var t=prompt('먹은 시각 (HH:MM) — 비워두면 그대로',L.tm||'');
if(t!==null&&t.trim())L.tm=t.trim();
save();render()}
function delMilk(id){if(!confirm('이 수유 회차를 삭제할까요?'))return;
logs=logs.filter(function(l){return l.id!==id});save();render()}

/*========== 오늘 먹은 여부 ==========*/
function loggedToday(rid){var td=fmt(TD()),hit=null;
logs.forEach(function(l){if(l.d===td&&l.k!=='milk'&&(l.rid===rid||l.n===(getR(rid)||{}).n))hit=l.id});
return hit}
function logAmtOf(id){var a='';logs.forEach(function(l){if(l.id===id)a=l.a||''});return a}
function logTmOf(id){var t='';logs.forEach(function(l){if(l.id===id)t=l.tm||''});return t}
function unLog(id){if(typeof stkUndo==='function')stkUndo(id);
logs=logs.filter(function(l){return l.id!==id});save();render()}

/*========== 수유 · 즐겨찾기 ==========*/
function addMilk(v,tm){logs.push(uNow({id:''+Date.now(),d:fmt(TD()),k:'milk',ml:v,mt:MTYPE(),tm:tm||milkTm(),n:MILK[MTYPE()].n+' '+v+'ml',t:'수유'}));save();render()}
function milkTm(){var e=document.getElementById('mkTm');return (e&&e.value)?e.value:nowHM()}
function addMilkP(){var G=mlGuide(),tm=milkTm();
var v=prompt('수유량 (ml)  ·  '+tm+'  ·  권장 회당 '+G.per[0]+'~'+G.per[1]+'ml',baby.vol||G.per[0]);
if(v===null)return;v=+v;if(!v)return;addMilk(v,tm)}
function toggleFav(id){fav[id]=fav[id]?0:1;if(!fav[id])delete fav[id];save();render()}

/*========== 추천 재편성 · 대안 ==========*/
function reRec(){var si=IDS.indexOf(curS().id==='ready'?'early':curS().id);
var rs=recommend(si,dOld()+Math.floor(Math.random()*97),SLOTS().length);
todaySel={k:fmt(TD())+'|'+MEALS(),ids:rs.map(function(r){return r.i})};save();render()}
function openAlt(idx){var si=IDS.indexOf(curS().id==='ready'?'early':curS().id),L=altList(si,todaySel.ids);
document.getElementById('mb').innerHTML='<div class="mt2">🔄 '+SLOTS()[idx]+' 메뉴 바꾸기</div><p class="mu" style="margin:6px 0 10px">1끼 영양 점수가 높은 순입니다. 우측 배지를 누르면 상세 진단을 볼 수 있어요.</p>'
+L.map(function(r){return '<div onclick="pickAlt('+idx+',\''+r.i+'\')">'+rcard(r)+'</div>'}).join('')
+'<button class="btn y" onclick="closeM()">닫기</button>';
document.getElementById('md').classList.add('on');document.body.style.overflow='hidden'}
function pickAlt(idx,id){todaySel.ids[idx]=id;save();closeM();render()}

/*========== 로드맵 ==========*/
function miles(){var b=d0(baby.birth);
return [[4,'이유식 준비 관찰',['목 가누기·앉은 자세 확인','어른 음식에 관심 보이는지 관찰']],
[6,'이유식 시작 · 초기(10배죽)',['쌀미음 1~2숟갈로 시작','1주 안에 소고기 추가','하루 1회, 오전 수유 전']],
[6.5,'초기 2단계 · 하루 2회',['채소 종류 늘리기','1회 60~80g까지','토핑 큐브 만들기']],
[7,'중기 시작(7배죽)',['2~3mm로 다져서','달걀 노른자·두부·생선 도입','하루 2~3회']],
[9,'후기 시작(진밥·핑거푸드)',['하루 3회+간식','0.5cm로 크게','핑거푸드 매일']],
[12,'완료기 · 유아식 전환',['밥과 반찬 중심','생우유 400~500ml','젖병 떼기 완료']]]
.map(function(x){var dt=addM(b,Math.floor(x[0]));if(x[0]%1)dt.setDate(dt.getDate()+15);
return {m:x[0],t:x[1],td:x[2],dt:dt,dd:Math.ceil((dt-TD())/864e5)}})}
function roadmap(){var M=miles(),ni=-1;
for(var i=0;i<M.length;i++)if(M[i].dd>0){ni=i;break}
return M.map(function(x,i){var c=x.dd<=0?(i===(ni===-1?M.length-1:ni-1)?'nw2':'dn'):'';
return '<div class="ri '+c+'"><div class="dt"></div><div class="wh">만 '+x.m+'개월 · '+fmt(x.dt)+(x.dd>0?' <span style="color:var(--pd)">D-'+x.dd+'</span>':'')+'</div><h4>'+x.t+'</h4><ul>'+x.td.map(function(t){return '<li>'+t+'</li>'}).join('')+'</ul></div>'}).join('')}
