/*========== 공통 카드 ==========*/
function cell(k,v){return '<div style="background:#FBF6F2;border-radius:11px;padding:8px 10px"><div class="mu" style="font-size:10.5px;font-weight:700">'+k+'</div><div style="font-size:13px;font-weight:700">'+v+'</div></div>'}
function thumb(r){var p=ph[r.i+'_0'];return p?'<img src="'+p+'">':ART(kOf((r.st&&r.st[0])||''))}
function rcard(r,x){var n=nutOf(r).t,sc=mealScore(r),lv=lvl(sc);
return '<div class="rc '+lv+'"><div class="th" onclick="openR(\''+r.i+'\')">'+thumb(r)+'</div>'
+'<div style="flex:1" onclick="openR(\''+r.i+'\')"><div class="nm">'+(fav[r.i]?'⭐ ':'')+esc(r.n)+(r.my?' <span class="tg m">내 메뉴</span>':'')+(r.ed?' <span class="tg p">수정</span>':'')+'</div>'
+'<div class="ds">⏱ '+(r.tm||'-')+' · 철 '+rnd(n.fe)+'mg(흡수 '+rnd2(n.feAb)+') · 단백 '+rnd(n.p)+'g'+(x||'')+'</div></div>'
+'<button class="badge '+lv+'" style="flex:0 0 auto;font-size:11px;padding:7px 8px;line-height:1.25;text-align:center" onclick="event.stopPropagation();diagMeal(\''+r.i+'\')">'+lvIco(sc)+'<br>'+sc+'%</button></div>'}
function todayLogs(){return logs.filter(function(l){return l.d===fmt(TD())})}
function todaySum(){var f={kcal:0,p:0,fe:0,ca:0,zn:0,feAb:0},m={kcal:0,p:0,fe:0,ca:0,zn:0,feAb:0},ml=0,cnt=0;
todayLogs().forEach(function(l){
if(l.k==='milk'){ml+=+l.ml||0;var n=milkNut(+l.ml||0,l.mt||MTYPE());
NK.forEach(function(k){m[k]+=n[k]});m.feAb+=n.feAb}
else{cnt++;NK.forEach(function(k){f[k]+=(l.nu&&l.nu[k])||0});f.feAb+=(l.nu&&l.nu.feAb)||0}});
return {f:f,m:m,ml:ml,cnt:cnt}}

/*========== 하루 누적 막대 ==========*/
function stackBars(f,m,day){var T=TG();
var rows=NK.map(function(k){var L=NL[k],fp=f[k]/day[k]*100,mp=m[k]/day[k]*100,tot=fp+mp;
var w1=Math.min(100,fp),w2=Math.max(0,Math.min(100-w1,mp)),lv=lvl(tot);
var sp=f[k]/Math.max(.01,T.solid[k])*100;
return '<div class="nrow" style="cursor:pointer" onclick="diagDay(\''+k+'\')"><div class="nhd"><div class="nnm"><i class="ndot" style="background:'+L[2]+'"></i>'+L[0]+' <span class="badge '+lv+'">'+lvIco(tot)+' '+lvTxt(tot)+'</span></div>'
+'<div><div class="npc" style="color:'+lvCol(tot)+'">'+Math.round(tot)+'%</div><div class="nval">'+rnd(f[k]+m[k])+' / '+rnd(day[k])+L[1]+'</div></div></div>'
+'<div class="bar"><i class="solid" style="width:'+w1+'%;background:'+L[2]+'"></i><i class="milk" style="width:'+w2+'%;background:'+L[2]+';opacity:.62"></i><span class="goal" style="left:calc(100% - 3px)"></span>'+(tot<LV.ok?'<span class="txt">목표까지 '+Math.round(100-tot)+'%</span>':'')+'</div>'
+'<div class="sub2"><span><b style="background:'+L[2]+'"></b>🍲 '+rnd(f[k])+L[1]+' ('+Math.round(fp)+'%)</span><span><b class="milk" style="background:'+L[2]+';opacity:.62"></b>🍼 '+rnd(m[k])+L[1]+' ('+Math.round(mp)+'%)</span><span style="color:var(--bl);margin-left:auto;font-weight:800">진단 ›</span></div>'
+'<div class="mu" style="font-size:9.5px;margin-top:2px">이유식 담당목표('+rnd(T.solid[k])+L[1]+') 대비 <b style="color:'+lvCol(sp)+'">'+Math.round(sp)+'%</b></div></div>'}).join('');
var bad=[],mid=[],over=[];
NK.forEach(function(k){var t=(f[k]+m[k])/day[k]*100;
if(t<LV.mid)bad.push(k);else if(t<LV.ok)mid.push(k);else if(t>LV.over)over.push(k)});
var al='';
if(bad.length)al='<div class="alert bad" style="cursor:pointer" onclick="diagDay(\''+bad[0]+'\')"><span class="ic">🚨</span><div><b>'+bad.map(function(k){return NL[k][0]}).join(' · ')+'</b>이(가) 하루 목표의 '+LV.mid+'% 미만입니다.<br><u>눌러서 원인·해결책 보기 ›</u></div></div>';
else if(mid.length)al='<div class="alert mid" style="cursor:pointer" onclick="diagDay(\''+mid[0]+'\')"><span class="ic">⚠️</span><div><b>'+mid.map(function(k){return NL[k][0]}).join(' · ')+'</b>이(가) 조금 부족해요.<br><u>눌러서 해결책 보기 ›</u></div></div>';
else if(over.length)al='<div class="alert mid" style="cursor:pointer" onclick="diagDay(\''+over[0]+'\')"><span class="ic">⚠️</span><div><b>'+over.map(function(k){return NL[k][0]}).join(' · ')+'</b>이(가) 하루 목표의 '+LV.over+'%를 넘습니다. 성장에 큰 문제는 아니지만 다른 영양소와 균형을 확인해 보세요.<br><u>눌러서 상세 보기 ›</u></div></div>';
else al='<div class="alert ok"><span class="ic">✅</span><div>주요 영양소가 <b>모두 적정 범위('+LV.ok+'~'+LV.over+'%)</b>에 있어요. 잘하고 있습니다!</div></div>';
return '<div class="mu" style="font-size:11px;margin-bottom:8px;padding:8px 10px;background:#F3F6FA;border-radius:9px">📌 이 카드는 <b>🍲이유식 + 🍼수유</b>를 합친 <b>하루 전체</b> 기준입니다. 메뉴 카드의 점수는 <b>이유식 목표만</b> 따로 평가한 값이에요.</div>'+al+rows}

/*========== 철분 코칭 · 영양 블록 ==========*/
function feCoach(n){var msg=[];
if(n.meat<=0&&n.t.fe>0.3)msg.push('고기·생선이 없어 <b>비헴철</b>만 들어 있습니다(흡수율 낮음). 소고기 10~20g을 더하면 흡수 철분이 크게 늘어요.');
if(n.t.vc<10&&n.nh>0.3)msg.push('비타민C 재료가 적습니다. <b>브로콜리·파프리카·토마토·양배추</b>를 곁들이면 비헴철 흡수가 2~3배 올라갑니다.');
if(n.meat>15&&n.t.vc>=20)msg.push('고기(헴철) + 비타민C 조합으로 <b>철분 흡수 조건이 좋습니다</b> 👍');
return msg.length?'<div class="fe">🩸 <b>철분 흡수 코칭</b><br>'+msg.join('<br>')+'<div class="mu" style="font-size:10px;margin-top:5px">계산 모델: 헴철 25% / 비헴철 5%(비타민C·육류인자로 최대 18%) '+sT('fe')+'</div></div>':''}
function nutBlock(nu,ml){var T=TG(),D=diagOf(curR||{g:[]}),sc=curR?mealScore(curR):0;
var bad=D.filter(function(x){return x.pc<LV.mid}),mid=D.filter(function(x){return x.pc>=LV.mid&&x.pc<LV.ok}),ovr=D.filter(function(x){return x.pc>LV.over});
var al=bad.length?'<div class="alert bad" style="cursor:pointer" onclick="diagMeal(\''+(curR?curR.i:'')+'\')"><span class="ic">🚨</span><div><b>'+bad.map(function(x){return x.nm}).join(' · ')+'</b>이 1끼 목표의 '+LV.mid+'% 미만입니다.<br><u>눌러서 개선안 보기 ›</u></div></div>'
:mid.length?'<div class="alert mid" style="cursor:pointer" onclick="diagMeal(\''+(curR?curR.i:'')+'\')"><span class="ic">⚠️</span><div><b>'+mid.map(function(x){return x.nm}).join(' · ')+'</b>이 조금 부족합니다. 다른 끼니·수유로 보충됩니다.<br><u>눌러서 개선안 보기 ›</u></div></div>'
:ovr.length?'<div class="alert mid" style="cursor:pointer" onclick="diagMeal(\''+(curR?curR.i:'')+'\')"><span class="ic">⚠️</span><div><b>'+ovr.map(function(x){return x.nm}).join(' · ')+'</b>이 1끼 목표의 '+LV.over+'%를 넘습니다. 재료를 조금 줄여도 좋아요.<br><u>눌러서 상세 보기 ›</u></div></div>'
:'<div class="alert ok"><span class="ic">✅</span><div>이 한 끼로 주요 영양소가 <b>적정 범위('+LV.ok+'~'+LV.over+'%)</b>에 있습니다.</div></div>';
return '<div class="cd"><div class="rw" style="justify-content:space-between;align-items:center;margin-bottom:4px"><b style="font-size:14px">🍀 1회 분량 영양'+(ml>1?' ×'+ml:'')+'</b><span class="badge '+lvl(sc)+'" style="font-size:12px;padding:5px 10px">'+lvIco(sc)+' 종합 '+sc+'%</span></div>'
+'<div class="mu" style="font-size:10.5px;margin-bottom:9px">1끼 목표 = '+(T.use?'체중 '+T.w+'kg 기준':'표준('+T.lb+')')+' 하루 목표 × 영양소별 이유식 담당비율 ÷ '+MEALS()+'끼</div>'+al
+D.map(function(x){var lv=lvl(x.pc);
return '<div class="nrow"><div class="nhd"><div class="nnm">'+(x.k==='fe2'?'🩸 ':'<i class="ndot" style="background:'+x.col+'"></i>')+x.nm+' <span class="badge '+lv+'">'+lvIco(x.pc)+'</span></div><div><div class="npc" style="color:'+lvCol(x.pc)+';font-size:16px">'+Math.round(x.pc)+'%</div><div class="nval">'+rnd2(x.v)+' / '+rnd2(x.goal)+x.u+'</div></div></div>'
+'<div class="bar" style="height:17px"><i class="solid" style="width:'+Math.min(100,x.pc)+'%;background:'+x.col+'"></i><span class="goal" style="left:calc(100% - 3px)"></span></div></div>'}).join('')
+'<div class="mu" style="font-size:10px;margin-top:6px">헴철 '+rnd2(nu.hm)+'mg · 비헴철 '+rnd2(nu.nh)+'mg · 비타민C '+rnd(nu.t.vc)+'mg · 고기 '+Math.round(nu.meat)+'g</div>'
+'<div class="hr"></div><b style="font-size:12.5px">재료별 기여도</b><table class="tb" style="margin-top:5px"><tr><th>재료</th><th>g</th><th>kcal</th><th>단백</th><th>철</th><th>칼슘</th><th>VC</th></tr>'
+nu.d.map(function(o){return '<tr><td>'+esc(o.n)+(o.ty==='h'?' <span class="tg r" style="padding:0 4px">헴</span>':'')+'</td><td>'+rnd(o.g)+'</td><td>'+Math.round(o.kcal)+'</td><td>'+rnd(o.p)+'</td><td>'+rnd2(o.fe)+'</td><td>'+Math.round(o.ca)+'</td><td>'+rnd(o.vc)+'</td></tr>'}).join('')+'</table>'
+(nu.ms.length?'<div class="mu" style="font-size:10.5px;margin-top:6px">※ 영양 미반영: '+nu.ms.join(', ')+'</div>':'')
+'<div class="mu" style="font-size:10.5px;margin-top:6px">※ 원물 기준 추정치(조리 손실 미반영). '+sT('rda')+sT('kdri')+'</div></div>'+feCoach(nu)}

/*========== 진단 모달 (하루) ==========*/
function fdName(key){for(var i=0;i<FD.length;i++)if(FD[i][4]===key||FD[i][0]===key)return FD[i][0];return key}
function topBy(k,n){var si=IDS.indexOf(curS().id==='ready'?'early':curS().id),T=TG();
var L=pool(si).sort(function(a,b){return nutOf(b).t[k]-nutOf(a).t[k]}).slice(0,n||4);
return L.map(function(r){var pc=Math.round(nutOf(r).t[k]/T.meal[k]*100);
return '<div onclick="closeM();openR(\''+r.i+'\')">'+rcard(r,' · '+NL[k][0]+' '+pc+'%')+'</div>'}).join('')}
function diagDay(k){var T=TG(),D=todaySum(),L=NL[k],f=D.f[k],mk=D.m[k],tot=(f+mk)/T.day[k]*100;
var ps=Math.round(T.sfk[k]*100);
document.getElementById('mb').innerHTML='<div class="mt2">'+lvIco(tot)+' '+L[0]+' 진단</div>'
+'<div class="alert '+lvl(tot)+'" style="margin-top:10px"><span class="ic">'+lvIco(tot)+'</span><div><b>하루 목표 '+rnd(T.day[k])+L[1]+' 중 '+rnd(f+mk)+L[1]+' ('+Math.round(tot)+'%)</b><br>'+lvTxt(tot)+' 상태입니다.</div></div>'
+'<div class="cd"><b style="font-size:13px">📌 어디서 채워지고 있나요?</b>'
+'<div class="ir" style="margin-top:6px"><span>🍲 이유식 ('+D.cnt+'끼)</span><b style="color:'+L[2]+'">'+rnd(f)+L[1]+' · '+Math.round(f/T.day[k]*100)+'%</b></div>'
+'<div class="ir"><span>🍼 수유 ('+D.ml+'ml)</span><b style="color:'+L[2]+'">'+rnd(mk)+L[1]+' · '+Math.round(mk/T.day[k]*100)+'%</b></div>'
+'<div class="ir"><span>남은 부족량</span><b style="color:'+(tot>=100?'var(--ok)':'var(--rd)')+'">'+rnd(Math.max(0,T.day[k]-f-mk))+L[1]+'</b></div></div>'
+'<div class="cd" style="background:#F3F6FA;font-size:12px"><b>ℹ️ 이 단계의 기준</b><p class="mu" style="margin:5px 0 0">'+curS().n+'에는 '+L[0]+'의 약 <b>'+ps+'%</b>를 이유식이, 나머지 <b>'+(100-ps)+'%</b>를 수유가 담당하는 것이 일반적입니다. 이유식 비율이 낮아도 <b>수유를 합쳐 100%</b>면 괜찮습니다.'+(T.bm&&(k==='fe'||k==='ca')?'<br><b>모유수유</b> 중이라 '+L[0]+'은 이유식이 더 담당해야 해서 목표가 높게 잡혀 있어요.':'')+'</p><div style="margin-top:6px">'+sT('kdri')+'</div></div>'
+(D.ml<300?'<div class="alert mid"><span class="ic">🍼</span><div>오늘 수유 기록이 <b>'+D.ml+'ml</b>뿐입니다. 실제로 더 먹였다면 입력해 주세요.<button class="btn g s" style="margin-top:8px" onclick="closeM();tab=\'home\';render()">수유 입력하러 가기</button></div></div>':'')
+(tot<LV.ok?'<div class="st">🍳 '+L[0]+'이 많은 재료</div><div class="cd"><div class="ch">'+FIX[k].f.map(function(x){return '<button onclick="closeM();openF(\''+fdName(x)+'\')">'+x+'</button>'}).join('')+'</div><p class="mu" style="margin:9px 0 0">'+FIX[k].t+'</p></div>'
+'<div class="st">🍽 '+L[0]+'이 높은 메뉴</div>'+topBy(k,4):'')
+'<button class="btn y" onclick="closeM()">닫기</button>';
document.getElementById('md').classList.add('on');document.body.style.overflow='hidden'}

/*========== 진단 모달 (한 끼) ==========*/
function diagMeal(id){var r=getR(id);if(!r)return;
var D=diagOf(r),sc=mealScore(r);
var low=D.filter(function(x){return x.pc<LV.ok}).sort(function(a,b){return a.pc-b.pc});
var hi=D.filter(function(x){return x.pc>LV.over}).sort(function(a,b){return b.pc-a.pc});
document.getElementById('mb').innerHTML='<div class="mt2">'+lvIco(sc)+' '+esc(r.n)+'</div>'
+'<div class="alert '+lvl(sc)+'" style="margin-top:10px"><span class="ic">'+lvIco(sc)+'</span><div><b>1끼 종합 영양 '+sc+'%</b><br>'+(sc<LV.mid?'이 한 끼만으로는 많이 부족합니다. 아래 개선안을 참고하세요.':sc<LV.ok?'조금 부족하지만 다른 끼니·수유로 보충됩니다.':'이 한 끼로 <b>충분</b>합니다.')+'</div></div>'
+'<div class="cd"><b style="font-size:13px">📊 항목별 1끼 목표 달성</b>'
+D.map(function(x){return '<div class="nrow"><div class="nhd"><div class="nnm" style="font-size:13.5px">'+(x.k==='fe2'?'🩸 ':'<i class="ndot" style="background:'+x.col+'"></i>')+x.nm+' <span class="badge '+lvl(x.pc)+'">'+lvIco(x.pc)+'</span></div><div><div class="npc" style="color:'+lvCol(x.pc)+';font-size:16px">'+Math.round(x.pc)+'%</div><div class="nval">'+rnd2(x.v)+' / '+rnd2(x.goal)+x.u+'</div></div></div>'
+'<div class="bar" style="height:16px"><i class="solid" style="width:'+Math.min(100,x.pc)+'%;background:'+x.col+'"></i><span class="goal" style="left:calc(100% - 3px)"></span></div></div>'}).join('')+'</div>'
+(low.length?'<div class="st">🔧 이렇게 개선해 보세요</div>'
+low.slice(0,3).map(function(x){var kk=x.k==='fe2'?'fe':x.k;
return '<div class="cd"><b style="font-size:13.5px;color:'+lvCol(x.pc)+'">'+lvIco(x.pc)+' '+x.nm+' '+Math.round(x.pc)+'%</b><p class="mu" style="margin:5px 0 8px">'+FIX[kk].t+'</p><div class="ch">'+FIX[kk].f.map(function(fn){return '<button style="background:#E7F1FB;color:#3A6FA8" onclick="addQuick(\''+r.i+'\',\''+fn+'\')">＋ '+fn+' '+(QG[fn]||10)+qUnit(fn)+'</button>'}).join('')+'</div></div>'}).join('')
+'<div class="cd" style="background:#FFF6EC;font-size:12px">위 <b>＋재료</b>를 누르면 이 레시피에 적정량이 추가되고 영양이 즉시 재계산됩니다. 기본 레시피는 원본이 보존되어 언제든 복원할 수 있어요.</div>'
+'<div class="st">🔄 더 좋은 메뉴로 교체</div>'+altBetter(r,3):'')
+(hi.length?'<div class="st">📉 과다한 영양소</div><div class="cd">'+hi.map(function(x){var kk=x.k==='fe2'?'fe':x.k;
return '<div style="margin-bottom:8px"><b style="font-size:13px;color:var(--warn)">⚠️ '+x.nm+' '+Math.round(x.pc)+'%</b><p class="mu" style="margin:4px 0 0">1끼 목표('+rnd2(x.goal)+x.u+')보다 많습니다. '+(kk==='p'?'고기·생선·두부 양을 5~10g 줄여보세요. 단백질 과다는 신장에 부담이 될 수 있습니다.':kk==='kcal'?'양이 많을 수 있어요. 아기가 남기면 줄여도 됩니다.':'해당 재료를 조금 줄이거나 다른 재료로 나눠 담아보세요.')+'</p><div class="ch" style="margin-top:6px">'+(r.g||[]).filter(function(gg){return gg[3]&&NUT[gg[3]]&&NUT[gg[3]][NK.indexOf(kk)]>0}).slice(0,4).map(function(gg){return '<button style="background:#FFF1CC;color:#8A5D00" onclick="cutQuick(\''+r.i+'\',\''+gg[3]+'\')">− '+gg[0]+'</button>'}).join('')+'</div></div>'}).join('')
+'<div class="mu" style="font-size:11px">− 버튼을 누르면 해당 재료가 20% 줄어듭니다.</div></div>':'')
+'<button class="btn g" onclick="closeM();openEd(\''+r.i+'\')">✏️ 직접 수정하기</button>'
+'<button class="btn y" style="margin-top:8px" onclick="closeM()">닫기</button>';
document.getElementById('md').classList.add('on');document.body.style.overflow='hidden'}

/*========== 재료 가감 ==========*/
function putG(id,g){var isBase=BASE.filter(function(b){return b.i===id}).length>0,r=getR(id);
if(isBase){ov[id]={n:r.n,g:g,st:r.st,tm:r.tm,sv:r.sv,tip:r.tip,s:r.s,y:r.y}}
else{myR.forEach(function(x){if(x.i===id)x.g=g})}
save()}
function cutQuick(id,fn){var r=getR(id),g=JSON.parse(JSON.stringify(r.g||[]));
g.forEach(function(x){if(x[3]===fn)x[1]=Math.max(1,Math.round(+x[1]*.8*10)/10)});
putG(id,g);diagMeal(id)}
function addG(id,fn){var r=getR(id),g=JSON.parse(JSON.stringify(r.g||[]));
var q=QG[fn]||10,u=qUnit(fn),hit=-1;
g.forEach(function(x,i){if(x[3]===fn)hit=i});
if(hit>=0)g[hit][1]=Math.round((+g[hit][1]+q)*10)/10;else g.push([fn,q,u,fn]);
putG(id,g)}
function addQuick(id,fn){addG(id,fn);diagMeal(id)}
function boostDay(k){var rec=todayRec(),T=TG(),target=null,best=1e9;
rec.forEach(function(r){if(!r)return;var pc=nutOf(r).t[k]/Math.max(.01,T.meal[k])*100;
if(pc<best){target=r;best=pc}});
if(!target)return;
var fn=FIX[k].f[0];
for(var i=0;i<FIX[k].f.length;i++){if(NUT[FIX[k].f[i]]){fn=FIX[k].f[i];break}}
addG(target.i,fn);
alert('「'+target.n+'」에 '+fn+' '+(QG[fn]||10)+qUnit(fn)+'을 추가했어요.');
render()}
function altBetter(r,n){var cur=mealScore(r);
var L=pool(r.s).filter(function(x){return x.i!==r.i&&mealScore(x)>cur}).sort(function(a,b){return mealScore(b)-mealScore(a)}).slice(0,n||3);
if(!L.length)return '<div class="cd mu">이 단계에서 더 높은 점수의 메뉴가 없습니다. 위 재료 추가를 이용해 보세요.</div>';
return L.map(function(x){return '<div onclick="swapAll(\''+r.i+'\',\''+x.i+'\')">'+rcard(x)+'</div>'}).join('')}
function swapAll(oldId,newId){
if(todaySel&&todaySel.ids){var i=todaySel.ids.indexOf(oldId);if(i>=0)todaySel.ids[i]=newId}
if(plan&&plan.d)plan.d.forEach(function(day,a){day.forEach(function(id,b){if(id===oldId)plan.d[a][b]=newId})});
save();closeM();render()}

/*========== 모달 공통 ==========*/
function closeM(){document.getElementById('md').classList.remove('on');document.body.style.overflow=''}
function openSrc(k){var s=SRC[k];
document.getElementById('mb').innerHTML='<div class="mt2">📎 출처</div><div class="cd" style="margin-top:10px"><span class="tg v">'+s.t+'</span><b style="display:block;margin:6px 0">'+s.n+'</b><p class="mu" style="margin:0">'+s.d+'</p><div class="hr"></div><a href="'+s.u+'" target="_blank" rel="noopener">'+s.u+'</a></div><button class="btn y" onclick="closeM()">닫기</button>';
document.getElementById('md').classList.add('on');document.body.style.overflow='hidden'}
function pickPh(k){phT=k;document.getElementById('fi').click()}
function delPh(k){delete ph[k];save();document.getElementById('mb').innerHTML=rBody();render()}
