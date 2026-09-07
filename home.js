/*========== 홈 ==========*/
function vHome(){var s=curS(),T=TG(),rec=todayRec(),sl=SLOTS(),D=todaySum();
var pAcc={kcal:0,p:0,fe:0,ca:0,zn:0,feAb:0};
rec.forEach(function(r){if(!r)return;var n=nutOf(r).t;NK.forEach(function(k){pAcc[k]+=n[k]});pAcc.feAb+=n.feAb});
var due=obs.filter(function(o){return !o.done&&dObs(o)<=3});
var exp=cubes.filter(function(c){return c.q>0&&dLeft(c)<=2});
var ns=nextStage(),nd=ns?Math.ceil((addM(d0(baby.birth),ns.f)-TD())/864e5):999;
var feTot=D.f.feAb+D.m.feAb,fePc=feTot/T.feAb*100,dri=T.dri,w=T.w;
var DS=dayScore(rec);
return (s.id==='ready'?'<div class="cd" style="background:#FFF6EC"><b>🕒 아직 이유식 시작 전</b><p class="mu" style="margin:5px 0 0">시작 예정일 <b style="color:var(--pd)">'+fmt(addM(d0(baby.birth),6))+'</b> · <b>'+Math.max(0,Math.ceil((addM(d0(baby.birth),6)-TD())/864e5))+'일</b> 남음</p></div>':'')
+(ns&&nd>0&&nd<=14?'<div class="cd" style="background:#F3FAF7"><b>🎉 '+nd+'일 후 '+ns.n+'로 넘어가요</b><p class="mu" style="margin:4px 0 0">'+fmt(addM(d0(baby.birth),ns.f))+'부터 <b>'+ns.ra+'</b> · '+ns.ct+'</p></div>':'')
+(due.length?'<div class="alert mid"><span class="ic">🔔</span><div><b>알레르기 관찰 중 '+due.length+'건</b>'+due.map(function(o){return '<br>· '+esc(o.n)+' — '+dObs(o)+'일차'}).join('')+'<button class="btn g s" style="margin-top:8px" onclick="tab=\'food\';render()">관찰 기록하기</button></div></div>':'')
+(exp.length?'<div class="alert bad"><span class="ic">🧊</span><div>유효기간 임박: <b>'+exp.map(function(c){return c.n}).join(', ')+'</b><button class="btn g s" style="margin-top:8px" onclick="tab=\'plan\';pTab=\'c\';render()">큐브 보기</button></div></div>':'')

/*----- 하루 목표 기준 -----*/
+'<div class="cd"><div class="rw" style="justify-content:space-between;align-items:center"><b style="font-size:13.5px">🎯 오늘의 하루 목표 기준</b><button class="mu" style="color:var(--bl);font-weight:700" onclick="tab=\'grow\';render()">📈 성장기록</button></div>'
+'<div class="g2" style="margin-top:8px">'
+'<div style="background:'+(T.use?'#fff':'#FFEDE4')+';border:1.5px solid '+(T.use?'var(--ln)':'var(--pc)')+';border-radius:11px;padding:9px;cursor:pointer" onclick="baby.useW=0;save();render()"><div class="mu" style="font-size:10px;font-weight:800">표준 기준 ('+T.lb+')</div><b style="font-size:13px">'+dri.kcal+'kcal · 단백 '+dri.p+'g</b><div class="mu" style="font-size:10px">2020 섭취기준</div></div>'
+'<div style="background:'+(T.use?'#FFEDE4':'#fff')+';border:1.5px solid '+(T.use?'var(--pc)':'var(--ln)')+';border-radius:11px;padding:9px;cursor:pointer" onclick="if(!'+(w?1:0)+'){alert(\'성장 탭에서 몸무게를 먼저 기록해 주세요\');return}baby.useW=1;save();render()"><div class="mu" style="font-size:10px;font-weight:800">우리 아기 체중 기준</div><b style="font-size:13px">'+(w?Math.round(w*dri.ekg)+'kcal · 단백 '+rnd(w*dri.pkg)+'g':'몸무게 미입력')+'</b><div class="mu" style="font-size:10px">'+(w?w+'kg × '+dri.ekg+'kcal/kg':'성장 탭에서 입력')+'</div></div></div>'
+'<div class="mu" style="font-size:10.5px;margin-top:7px">눌러서 기준 변경. 현재 적용: <b style="color:var(--pd)">'+(T.use?'체중 기준':'표준 기준')+'</b> · '+curS().n+' 이유식 담당비율 — 열량 '+Math.round(T.sfk.kcal*100)+'% · 단백 '+Math.round(T.sfk.p*100)+'% · 철 '+Math.round(T.sfk.fe*100)+'% · 칼슘 '+Math.round(T.sfk.ca*100)+'% '+sT('kdri')+'</div></div>'

/*----- 수유 입력 -----*/
+'<div class="st">🍼 오늘 수유 입력</div><div class="cd"><div class="rw" style="justify-content:space-between;align-items:baseline;margin-bottom:8px"><b style="font-size:18px">'+D.ml+' ml</b><span class="mu">'+MILK[MTYPE()].n+' · '+todayLogs().filter(function(l){return l.k==='milk'}).length+'회</span></div>'
+'<div class="mlk">'+[100,120,150,180,200,220].map(function(v){return '<button onclick="addMilk('+v+')">+'+v+'</button>'}).join('')
+'<button onclick="addMilkP()" style="background:#F5EFEA;color:var(--sub)">직접</button><button onclick="undoMilk()" style="background:#FDEAE5;color:var(--rd)">↩︎</button></div>'
+'<div class="mu" style="font-size:10.5px;margin-top:8px">'+(MTYPE()==='f'?'분유 100ml당 67kcal·철 0.8mg(흡수율 약 10%)':'모유 100ml당 65kcal·철 0.03mg(흡수율 약 50%)')+' 기준 합산 '+sT('milk')+'</div></div>'

/*----- 하루 영양 달성 -----*/
+'<div class="st">📊 오늘의 하루 영양 달성 (이유식 '+D.cnt+'끼 + 수유 '+D.ml+'ml)</div><div class="cd">'+stackBars(D.f,D.m,T.day)
+'<div class="nrow" style="cursor:pointer" onclick="diagDay(\'fe\')"><div class="nhd"><div class="nnm">🩸 흡수 추정 철분 <span class="badge '+lvl(fePc)+'">'+lvIco(fePc)+' '+lvTxt(fePc)+'</span></div><div><div class="npc" style="color:'+lvCol(fePc)+'">'+Math.round(fePc)+'%</div><div class="nval">'+rnd2(feTot)+' / '+rnd2(T.feAb)+'mg</div></div></div>'
+'<div class="bar"><i class="solid" style="width:'+Math.min(100,D.f.feAb/T.feAb*100)+'%;background:var(--rd)"></i><i class="milk" style="width:'+Math.max(0,Math.min(100-D.f.feAb/T.feAb*100,D.m.feAb/T.feAb*100))+'%;background:var(--rd);opacity:.62"></i><span class="goal" style="left:calc(100% - 3px)"></span></div>'
+'<div class="mu" style="font-size:10px;margin-top:4px">철 권장량 '+dri.fe+'mg은 흡수율 10% 가정값이므로 실제 흡수 목표는 <b>'+rnd2(T.feAb)+'mg</b>입니다.</div></div></div>'

/*----- 추천 N끼 합계 -----*/
+'<div class="cd" style="background:#FBF6F2"><b style="font-size:12.5px">추천 '+MEALS()+'끼를 모두 먹으면 (이유식만)</b><div class="g5" style="margin-top:8px">'+NK.map(function(k){var p=Math.round(pAcc[k]/T.solid[k]*100);
return '<div style="text-align:center;background:#fff;border-radius:9px;padding:7px 2px"><div class="mu" style="font-size:9.5px">'+NL[k][0]+'</div><b style="color:'+lvCol(p)+';font-size:15px">'+p+'%</b></div>'}).join('')+'</div><div class="mu" style="font-size:10px;margin-top:6px">이유식 담당 목표 대비 · 흡수철 '+rnd2(pAcc.feAb)+'mg</div></div>'

/*----- 오늘 추천 끼니 -----*/
+'<div class="st">🍽 오늘 '+MEALS()+'끼 추천 <span style="color:'+lvCol(DS.sc)+'">· 하루 합계 '+DS.sc+'%</span></div>'
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
+'<div class="rw"><button class="btn g s" onclick="qLog(\''+r.i+'\')">📝 먹었어요</button><button class="btn y s" onclick="toggleFav(\''+r.i+'\')">'+(fav[r.i]?'⭐ 해제':'☆ 즐겨찾기')+'</button></div></div>'}).join('')
+'<button class="btn y s" onclick="reRec()">🎲 추천 다시 받기</button>'

/*----- 단계 기준 · 로드맵 -----*/
+'<div class="st">'+s.n+' 기준</div><div class="cd"><div class="g2">'+cell('농도',s.ra)+cell('횟수',s.ct)+cell('1회 양',s.am)+cell('입자',s.tx)+'</div><p class="mu" style="margin:10px 0 0">'+s.ds+'</p><div class="hr"></div><ul style="margin:0;padding-left:17px;font-size:13px">'+s.td.map(function(t){return '<li>'+t+'</li>'}).join('')+'</ul><div style="margin-top:8px">'+sT('ppibbo')+'</div></div>'
+'<div class="st">'+esc(baby.name)+'의 로드맵</div><div class="cd"><div class="rm">'+roadmap()+'</div></div>'
+'<p class="mu" style="text-align:center;font-size:10.5px;margin:14px 6px 0">참고 자료입니다. 최종 판단은 담당 소아과와 상의하세요.</p>'}

/*========== 수유 · 즐겨찾기 ==========*/
function addMilk(v){logs.push({id:''+Date.now(),d:fmt(TD()),k:'milk',ml:v,mt:MTYPE(),n:MILK[MTYPE()].n+' '+v+'ml',t:'수유'});save();render()}
function addMilkP(){var v=prompt('수유량(ml)',baby.vol||180);if(v===null)return;v=+v;if(!v)return;addMilk(v)}
function undoMilk(){for(var i=logs.length-1;i>=0;i--)if(logs[i].k==='milk'&&logs[i].d===fmt(TD())){logs.splice(i,1);break}save();render()}
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
