/*========== 📊 영양 대시보드 (일·주·월) ==========*/
var dPer='d';                    /* d=일간 w=주간 m=월간 */
var dOpen=LS('b6.dashopen',1);   /* 홈에서 펼침 상태 */

/*----- 기간 계산 -----*/
function dRange(){var t=TD();
if(dPer==='d')return {f:t,t:t,n:1,lb:'오늘',sub:fmt(t)};
if(dPer==='w'){var s=addD(t,-6);return {f:s,t:t,n:7,lb:'최근 7일',sub:fmt(s)+' ~ '+fmt(t)}}
var s2=addD(t,-29);return {f:s2,t:t,n:30,lb:'최근 30일',sub:fmt(s2)+' ~ '+fmt(t)}}
function inRange(dstr,R){var a=(dstr||'').split('.');if(a.length!==3)return false;
var d=new Date(+a[0],+a[1]-1,+a[2]);d.setHours(0,0,0,0);
return d>=R.f&&d<=R.t}

/*----- 기간 집계: 영양 + 재료별 -----*/
function dAgg(){var R=dRange(),f={p:0,fe:0,ca:0,zn:0},m={p:0,fe:0,ca:0,zn:0};
var ing={},ml=0,cnt=0,days={},milkCnt=0;
logs.forEach(function(l){if(!inRange(l.d,R))return;
days[l.d]=1;
if(l.k==='milk'){ml+=+l.ml||0;milkCnt++;
var n=milkNut(+l.ml||0,l.mt||MTYPE());
NK.forEach(function(k){m[k]+=n[k]});return}
cnt++;
NK.forEach(function(k){f[k]+=(l.nu&&l.nu[k])||0});
(l.gs||[]).forEach(function(x){var nm=x[0],key=x[3]||'';
if(!nm||nm==='물')return;
var g=gOf(x);
if(g<=0)return;
var o=ing[nm]||(ing[nm]={n:nm,key:key,g:0,cnt:0,days:{}});
o.g+=g;o.cnt++;o.days[l.d]=1})});
var dayN=Object.keys(days).length||1;
return {R:R,f:f,m:m,ing:ing,ml:ml,cnt:cnt,dayN:dayN,milkCnt:milkCnt}}

/*----- 재료 순위 -----*/
function ingRank(A,n){var L=[];
for(var k in A.ing){var o=A.ing[k];
L.push({n:o.n,key:o.key,g:o.g,cnt:o.cnt,dayN:Object.keys(o.days).length,
per:o.g/A.R.n,cat:(function(){var c='기타';FD.forEach(function(f){if(f[0]===o.n||f[4]===o.key)c=f[2]});return c})(),
emoji:(function(){var e='🥕';FD.forEach(function(f){if(f[0]===o.n||f[4]===o.key)e=f[1]});return e})()})}
return L.sort(function(a,b){return b.g-a.g}).slice(0,n||999)}

/*----- 카테고리 균형 -----*/
var CATC={'곡류':'#F0A93C','육류':'#E85536','어패류':'#5B8FCC','채소':'#68AE49','과일':'#E88AB0','콩·유제품':'#8B7FD4','기타':'#A99C93'};
function catAgg(A){var L=ingRank(A),c={},tot=0;
L.forEach(function(x){c[x.cat]=(c[x.cat]||0)+x.g;tot+=x.g});
return {c:c,tot:tot,keys:Object.keys(c).sort(function(a,b){return c[b]-c[a]})}}

/*========== 대시보드 본체 ==========*/
function dashBoard(compact){var A=dAgg(),T=TG(),R=A.R;
var mul=R.n;                              /* 기간 배수 */
var rows=NK.map(function(k){
var got=A.f[k]+A.m[k],goal=T.day[k]*mul,pc=got/Math.max(.01,goal)*100;
var fp=A.f[k]/Math.max(.01,goal)*100,mp=A.m[k]/Math.max(.01,goal)*100;
return {k:k,nm:NL[k][0],u:NL[k][1],col:NL[k][2],got:got,goal:goal,pc:pc,fp:fp,mp:mp,
per:got/mul,perGoal:T.day[k]}});
var avg=0;rows.forEach(function(r){avg+=Math.min(150,r.pc)});avg=Math.round(avg/rows.length);
var low=rows.filter(function(r){return r.pc<LV.ok}).sort(function(a,b){return a.pc-b.pc});

return dashHead(A,avg)
+'<div class="cd">'+rows.map(function(r){var lv=lvl(r.pc);
var w1=Math.min(100,r.fp),w2=Math.max(0,Math.min(100-w1,r.mp));
return '<div class="nrow" style="cursor:pointer" onclick="dPer===\'d\'?diagDay(\''+r.k+'\'):0">'
+'<div class="nhd"><div class="nnm"><i class="ndot" style="background:'+r.col+'"></i>'+r.nm
+' <span class="badge '+lv+'">'+lvIco(r.pc)+' '+lvTxt(r.pc)+'</span></div>'
+'<div><div class="npc" style="color:'+lvCol(r.pc)+'">'+Math.round(r.pc)+'%</div>'
+'<div class="nval">'+rnd(r.got)+' / '+rnd(r.goal)+r.u+'</div></div></div>'
+'<div class="bar"><i class="solid" style="width:'+w1+'%;background:'+r.col+'"></i><i class="milk" style="width:'+w2+'%;background:'+r.col+';opacity:.62"></i><span class="goal" style="left:calc(100% - 3px)"></span></div>'
+'<div class="sub2"><span><b style="background:'+r.col+'"></b>🍲 '+rnd(A.f[r.k])+r.u+'</span><span><b class="milk" style="background:'+r.col+';opacity:.62"></b>🍼 '+rnd(A.m[r.k])+r.u+'</span>'
+(mul>1?'<span style="margin-left:auto">하루 평균 '+rnd(r.per)+' / '+rnd(r.perGoal)+r.u+'</span>':'<span style="margin-left:auto;color:var(--bl);font-weight:800">진단 ›</span>')+'</div></div>'}).join('')
+(low.length?'<div class="alert '+(low[0].pc<LV.mid?'bad':'mid')+'" style="margin:8px 0 0"><span class="ic">'+(low[0].pc<LV.mid?'🚨':'⚠️')+'</span><div><b>'+low.map(function(r){return r.nm+' '+Math.round(r.pc)+'%'}).join(' · ')+'</b>가 '+R.lb+' 기준으로 부족해요.'
+(low[0].k&&FIX[low[0].k]?'<br>'+FIX[low[0].k].f.slice(0,4).join('·')+' 를 늘려보세요.':'')+'</div></div>'
:'<div class="alert ok" style="margin:8px 0 0"><span class="ic">✅</span><div>'+R.lb+' 주요 영양소가 <b>모두 적정</b>합니다.</div></div>')
+'</div>'
+(compact?'':dashIng(A)+dashCat(A)+dashTrend(A))}

/*----- 헤더 (기간 전환) -----*/
function dashHead(A,avg){var R=A.R;
return '<div class="cd" style="padding:10px"><div class="rw" style="justify-content:space-between;align-items:center">'
+'<div><b style="font-size:13.5px">📊 영양 대시보드</b><div class="mu" style="font-size:10px;margin-top:2px">'+R.sub+'</div></div>'
+'<span class="badge '+lvl(avg)+'" style="font-size:12px;padding:5px 10px">'+lvIco(avg)+' 평균 '+avg+'%</span></div>'
+'<div class="tt" style="margin:9px 0 0">'+[['d','오늘'],['w','주간'],['m','월간']].map(function(x){
return '<button class="'+(dPer===x[0]?'on':'')+'" onclick="dPer=\''+x[0]+'\';render()">'+x[1]+'</button>'}).join('')+'</div>'
+'<div class="rw" style="margin-top:8px">'+[['🍲 이유식',A.cnt+'끼'],['🍼 수유',A.ml+'ml'],['🥕 재료',Object.keys(A.ing).length+'종'],['📅 기록일',A.dayN+'일']].map(function(x){
return '<div style="flex:1;text-align:center;background:#FBF6F2;border-radius:9px;padding:7px 2px"><div class="mu" style="font-size:9.5px">'+x[0]+'</div><b style="font-size:13px">'+x[1]+'</b></div>'}).join('')+'</div></div>'}

/*----- 재료별 섭취량 -----*/
function dashIng(A){var L=ingRank(A,20),R=A.R;
if(!L.length)return '<div class="cd mu" style="font-size:11.5px">이 기간에 재료 기록이 없어요. 「먹었어요」로 기록하면 재료별 섭취량이 쌓입니다.</div>';
var mx=L[0].g;
return '<div class="st">🥕 재료별 섭취량 <span class="mu" style="font-weight:600;font-size:11.5px">· '+R.lb+' · '+L.length+'종</span></div>'
+'<div class="cd">'+L.map(function(x){var w=Math.round(x.g/mx*100),col=CATC[x.cat]||'#A99C93';
return '<div class="irow" onclick="openF(\''+x.n.replace(/'/g,'')+'\')">'
+'<div class="ie">'+x.emoji+'</div>'
+'<div style="flex:1;min-width:0"><div class="rw" style="justify-content:space-between"><b class="inm">'+esc(x.n)+'</b><b style="font-size:12.5px;color:'+col+'">'+rnd(x.g)+'g</b></div>'
+'<div class="ibar"><i style="width:'+w+'%;background:'+col+'"></i></div>'
+'<div class="mu" style="font-size:9.5px;margin-top:2px">'+x.cat+' · '+x.cnt+'회 · '+x.dayN+'일'+(R.n>1?' · 하루 평균 '+rnd(x.per)+'g':'')+'</div></div></div>'}).join('')
+'<div class="mu" style="font-size:10px;margin-top:7px">재료를 누르면 상세 정보로 이동합니다. 막대 길이는 최다 섭취 재료 대비 비율이에요.</div></div>'}

/*----- 카테고리 균형 -----*/
function dashCat(A){var C=catAgg(A);
if(!C.tot)return '';
return '<div class="st">🍱 식품군 균형</div><div class="cd">'
+'<div class="cbar">'+C.keys.map(function(k){var p=C.c[k]/C.tot*100;
return '<i style="width:'+p+'%;background:'+(CATC[k]||'#A99C93')+'" title="'+k+' '+Math.round(p)+'%"></i>'}).join('')+'</div>'
+'<div class="sub2" style="margin-top:7px;flex-wrap:wrap">'+C.keys.map(function(k){
return '<span><b style="background:'+(CATC[k]||'#A99C93')+'"></b>'+k+' '+Math.round(C.c[k]/C.tot*100)+'%</span>'}).join('')+'</div>'
+(function(){var msg=[];
var need=['육류','채소','곡류'];
need.forEach(function(k){if(!C.c[k])msg.push('<b>'+k+'</b>가 이 기간에 없어요')});
var mp=C.keys[0],mpc=C.c[mp]/C.tot*100;
if(mpc>55)msg.push('<b>'+mp+'</b>가 '+Math.round(mpc)+'%로 치우쳐 있어요');
if(!C.c['육류']&&!C.c['어패류'])msg.push('고기·생선이 없어 <b>철분·아연</b>이 부족해지기 쉬워요');
return msg.length?'<div class="alert mid" style="margin:9px 0 0"><span class="ic">⚠️</span><div>'+msg.join('<br>')+'</div></div>'
:'<div class="alert ok" style="margin:9px 0 0"><span class="ic">✅</span><div>여러 식품군이 <b>골고루</b> 들어갔어요.</div></div>'})()
+'</div>'}

/*----- 추이 (주/월) -----*/
function dashTrend(A){if(dPer==='d')return '';
var R=A.R,T=TG(),n=R.n,step=(n>7?Math.ceil(n/10):1),bars=[];
for(var i=n-1;i>=0;i-=step){var d=fmt(addD(TD(),-i));
var got={p:0,fe:0,ca:0,zn:0},has=false;
logs.forEach(function(l){if(l.d!==d)return;has=true;
if(l.k==='milk'){var nn=milkNut(+l.ml||0,l.mt||MTYPE());NK.forEach(function(k){got[k]+=nn[k]})}
else NK.forEach(function(k){got[k]+=(l.nu&&l.nu[k])||0})});
var pc=0;NK.forEach(function(k){pc+=Math.min(150,got[k]/Math.max(.01,T.day[k])*100)});pc=pc/NK.length;
bars.push({d:d,pc:has?pc:0,has:has,lb:d.slice(5).replace('.','/')})}
bars.reverse();
var mx=100;bars.forEach(function(b){if(b.pc>mx)mx=b.pc});
return '<div class="st">📈 일별 달성 추이</div><div class="cd" style="padding:10px 8px">'
+'<div class="tch"><div class="tcg"><span style="bottom:'+Math.round(100/mx*100)+'%"><b>100%</b></span><span style="bottom:'+Math.round(70/mx*100)+'%"><b>70%</b></span></div>'
+'<div class="tcrow">'+bars.map(function(b){var h=Math.round(b.pc/mx*100);
var col=!b.has?'#EDE3DA':b.pc>=LV.ok?'#3FAE8E':b.pc>=LV.mid?'#F0A93C':'#E85536';
return '<div class="tcol"><div class="tcb"><i style="height:'+h+'%;background:'+col+'"></i></div><div class="tct">'+b.lb+'</div></div>'}).join('')+'</div></div>'
+'<div class="sub2" style="margin-top:6px;font-size:9.5px"><span><b style="background:#3FAE8E"></b>적정</span><span><b style="background:#F0A93C"></b>부족</span><span><b style="background:#E85536"></b>많이 부족</span><span><b style="background:#EDE3DA"></b>기록 없음</span></div>'
+'<div class="mu" style="font-size:10px;margin-top:5px">4대 영양소 평균 달성률입니다. 기록이 없는 날은 회색으로 표시돼요.</div></div>'}

/*========== 홈 요약 카드 ==========*/
function dashCard(){
return '<div class="cd" style="padding:0;overflow:hidden">'
+'<div class="rw" style="justify-content:space-between;align-items:center;padding:10px;cursor:pointer" onclick="dashToggle()">'
+'<div><b style="font-size:13.5px">📊 영양 대시보드</b><div class="mu" style="font-size:10.5px;margin-top:2px">재료별 섭취량 · 권장량 충족도</div></div>'
+'<span style="color:var(--bl);font-weight:800;font-size:15px">'+(dOpen?'⌃':'⌄')+'</span></div>'
+(dOpen?'<div style="padding:0 10px 10px">'+dashBoard(true)
+'<button class="btn g s" style="margin-top:8px" onclick="tab=\'food\';fTab=\'dash\';render()">🥕 재료별 상세 보기</button></div>':'')
+'</div>'}
function dashToggle(){dOpen=dOpen?0:1;localStorage.setItem('b6.dashopen',JSON.stringify(dOpen));render()}
