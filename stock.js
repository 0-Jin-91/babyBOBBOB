/*========== 📦 재고 관리 ==========*/
/* 재고 항목: {id,n,key,unit,full,left,per,dt,exp,memo,hist:[{d,t,g,why}]}
   unit : g·ml = 무게/부피 단위 / 개·팩·봉·통 = 개수 단위
   per  : 개수 단위일 때 1개당 g (환산용). 무게 단위면 1.
   left·full 은 항상 그 재고의 unit 기준 값이다. 레시피 차감(g)은 per 로 나눠 개수로 바꾼다.
   full = 충전량(1회 채웠을 때 기준), left = 남은 양 */

var STK=LS('b6.stock',[]);
function stkSave(){localStorage.setItem('b6.stock',JSON.stringify(STK))}
/*----- 단위 유틸 -----*/
var CNTU=['개','팩','봉','통','조각','컵'];              /* 개수로 세는 단위 */
function isCnt(u){return CNTU.indexOf(u)>=0}
function stkPer(s){return isCnt(s.unit)?(+s.per||10):1}  /* 1단위당 g */
/* 재고 단위 기준 수량 → 보기 좋은 문자열 */
function stkAmt(s,v){var u=s.unit;
return (isCnt(s.unit)?rnd2(v):rnd(v))+u}
/* 개수 단위면 총 g 도 함께 보여준다 */
function stkSub(s,v){if(!isCnt(s.unit))return '';
return ' <span class="mu" style="font-size:9.5px">(약 '+rnd(v*stkPer(s))+'g)</span>'}
/* 규격 문자열 — "200g/개" 처럼 1단위 용량을 보여준다 */
function stkSpec(s){return isCnt(s.unit)?stkPer(s)+'g/'+s.unit:''}
/* "200g × 3개 = 600g" 형태의 규격 요약 */
function stkSpecFull(s,v){if(!isCnt(s.unit))return stkAmt(s,v);
return stkPer(s)+'g × '+rnd2(v)+s.unit+' = '+rnd(v*stkPer(s))+'g'}
/* g → 재고 단위 값 */
function g2u(s,g){return isCnt(s.unit)?g/stkPer(s):g}
/* 재고 단위 값 → g */
function u2g(s,v){return isCnt(s.unit)?v*stkPer(s):v}
function stkFind(nameOrKey){var hit=null;
STK.forEach(function(s){if(s.n===nameOrKey||(s.key&&s.key===nameOrKey))hit=s});
return hit}
function stkPct(s){return s.full>0?Math.max(0,s.left)/s.full*100:0}
function stkLv(s){var p=stkPct(s);return p<=10?'bad':p<=20?'mid':'ok'}
function stkIco(s){var l=stkLv(s);return l==='bad'?'🚨':l==='mid'?'⚠️':'✅'}
function stkTxt(s){var l=stkLv(s);return l==='bad'?'거의 소진':l==='mid'?'부족':'충분'}
function stkLow(){return STK.filter(function(s){return stkPct(s)<=20}).sort(function(a,b){return stkPct(a)-stkPct(b)})}
function stkExpLeft(s){if(!s.exp)return null;return Math.ceil((d0(s.exp)-TD())/864e5)}

/*----- 사용량 차감 (먹었어요 / 기록 저장 시 호출) -----*/
function stkUse(gs,why,logId){if(!gs||!gs.length)return 0;
var n=0;
gs.forEach(function(x){var key=x[3]||x[0],nm=x[0];
var s=stkFind(key)||stkFind(nm);if(!s)return;
var g=gOf(x);
if(g<=0)return;
/* 레시피는 항상 g 기준 → 개수 단위 재고면 1개당 g 으로 나눠 개수로 환산해 차감 */
var d=g2u(s,g);
s.left=Math.round((s.left-d)*100)/100;
s.hist=(s.hist||[]);s.hist.push({d:fmt(TD()),t:nowHM(),g:-d,why:why||'사용',lid:logId||''});
if(s.hist.length>60)s.hist=s.hist.slice(-60);
n++});
if(n)stkSave();
return n}
/*----- 되돌리기 (기록 취소 시) -----*/
function stkUndo(logId){if(!logId)return 0;var n=0;
STK.forEach(function(s){var keep=[],back=0;
(s.hist||[]).forEach(function(h){if(h.lid===logId&&h.g<0){back+=-h.g}else keep.push(h)});
if(back){s.left=Math.round((s.left+back)*100)/100;s.hist=keep;n++}});
if(n)stkSave();return n}

/*========== 뷰 ==========*/
var sTab='list',sQ='',sCat='전체',SE=null;
function vStock(){return '<div class="tt"><button class="'+(sTab==='list'?'on':'')+'" onclick="sTab=\'list\';render()">📦 재고 ('+STK.length+')</button>'
+'<button class="'+(sTab==='add'?'on':'')+'" onclick="sTab=\'add\';render()">＋ 등록</button>'
+'<button class="'+(sTab==='hist'?'on':'')+'" onclick="sTab=\'hist\';render()">🕐 이력</button></div>'
+(sTab==='list'?vStkList():sTab==='add'?vStkAdd():vStkHist())}

/*----- 재고 목록 -----*/
function vStkList(){var low=stkLow(),exp=STK.filter(function(s){var d=stkExpLeft(s);return d!=null&&d<=3});
if(!STK.length)return '<div class="cd" style="background:#FFF6EC"><b>📦 재고를 등록해 보세요</b><p class="mu" style="margin:5px 0 9px">재료를 등록하면 <b>먹었어요를 누를 때마다 자동으로 차감</b>되고, 20% 이하로 떨어지면 경고와 함께 장보기 목록에 자동으로 올라갑니다.</p><button class="btn" onclick="sTab=\'add\';render()">＋ 첫 재료 등록하기</button></div>';
return (low.length?'<div class="alert '+(stkPct(low[0])<=10?'bad':'mid')+'"><span class="ic">'+(stkPct(low[0])<=10?'🚨':'⚠️')+'</span><div><b>재고 부족 '+low.length+'건</b>'
+low.slice(0,5).map(function(s){return '<br>· '+esc(s.n)+' — '+stkAmt(s,Math.max(0,s.left))+' 남음 ('+Math.round(stkPct(s))+'%)'}).join('')
+(low.length>5?'<br>· 외 '+(low.length-5)+'건':'')
+'<button class="btn g s" style="margin-top:8px" onclick="tab=\'plan\';pTab=\'s\';render()">🛒 장보기 목록 보기</button></div></div>':'<div class="alert ok"><span class="ic">✅</span><div>모든 재료 재고가 <b>충분</b>합니다 (20% 초과).</div></div>')
+(exp.length?'<div class="alert bad"><span class="ic">📅</span><div>유통기한 임박: <b>'+exp.map(function(s){var d=stkExpLeft(s);return s.n+(d<0?'(지남)':' D-'+d)}).join(', ')+'</b></div></div>':'')
+'<div class="cd" style="padding:9px"><input value="'+esc(sQ)+'" oninput="sQ=this.value;reStk()" id="sQi" placeholder="🔎 재고 검색" style="width:100%;padding:10px;border:1.5px solid var(--ln);border-radius:11px;outline:none"></div>'
+'<div id="stkres">'+stkRows()+'</div>'}
/* 결과만 갱신 — 입력창 재생성 금지(한글 IME 조합 끊김) */
function reStk(){var e=document.getElementById('sQi');if(e)sQ=e.value;
var r=document.getElementById('stkres');if(r)r.innerHTML=stkRows()}
function stkRows(){var q=sQ.trim().toLowerCase();
var L=STK.filter(function(s){return !q||s.n.toLowerCase().indexOf(q)>=0})
.sort(function(a,b){return stkPct(a)-stkPct(b)});
if(!L.length)return '<div class="cd mu">검색 결과가 없어요.</div>';
return L.map(function(s){var p=stkPct(s),lv=stkLv(s),ed=stkExpLeft(s);
var used=(s.hist||[]).filter(function(h){return h.g<0}).reduce(function(a,h){return a-h.g},0);
return '<div class="cd" style="padding:10px;border-left:4px solid '+(lv==='bad'?'var(--rd)':lv==='mid'?'var(--warn)':'var(--ok)')+'">'
+'<div class="rw" style="justify-content:space-between;align-items:center"><b style="font-size:13.5px">'+esc(s.n)+(isCnt(s.unit)?' <span class="tg">'+stkSpec(s)+'</span>':'')+(s.key&&NUT[s.key]?'':' <span class="tg m">직접</span>')+'</b>'
+'<span class="badge '+lv+'">'+stkIco(s)+' '+stkTxt(s)+' '+Math.round(p)+'%</span></div>'
+'<div class="bar" style="height:15px;margin-top:7px"><i class="solid" style="width:'+Math.min(100,p)+'%;background:'+(lv==='bad'?'#E85536':lv==='mid'?'#F0A93C':'#3FAE8E')+'"></i>'
+'<span class="goal" style="left:20%;background:var(--warn)"></span><span class="goal" style="left:10%;background:var(--rd)"></span></div>'
+'<div class="rw" style="justify-content:space-between;margin-top:5px"><span class="mu" style="font-size:10.5px">남음 <b style="font-size:13px;color:var(--pd)">'+stkAmt(s,Math.max(0,s.left))+'</b>'+stkSub(s,Math.max(0,s.left))+' / 충전 '+stkAmt(s,s.full)+'</span>'
+'<span class="mu" style="font-size:10px">누적 사용 '+stkAmt(s,used)+(ed!=null?' · 기한 '+(ed<0?'지남':'D-'+ed):'')+'</span></div>'
+(isCnt(s.unit)?'<div class="mu" style="font-size:9.5px;margin-top:3px">📦 <b>'+stkPer(s)+'g</b> 짜리 · 현재 '+stkSpecFull(s,Math.max(0,s.left))+' · <span style="color:var(--bl);font-weight:700" onclick="stkPerEdit(\''+s.id+'\')">규격 수정 ›</span></div>':'')
+(s.memo?'<div class="mu" style="font-size:10.5px;margin-top:4px">'+esc(s.memo)+'</div>':'')
+'<div class="rw" style="margin-top:8px"><button class="btn g s" onclick="stkRefill(\''+s.id+'\')">🔄 충전</button>'
+'<button class="btn y s" onclick="stkAdj(\''+s.id+'\')">✏️ 조정</button></div>'
+(function(){var q=isCnt(s.unit)?[-0.5,-1,-2]:[-10,-20,-50];
return '<div class="rw" style="margin-top:6px">'+q.map(function(v){
return '<button class="mu" style="flex:1;font-weight:700;color:var(--bl);font-size:11px" onclick="stkQuick(\''+s.id+'\','+v+')">'+v+s.unit+'</button>'}).join('')})()
+'<button class="mu" style="flex:1;font-weight:700;color:var(--mt);font-size:11px" onclick="stkDel(\''+s.id+'\')">삭제</button></div></div>'}).join('')}
/*----- 개수 단위 환산량(1개당 g) 수정 -----*/
function stkPerEdit(id){var s=null;STK.forEach(function(x){if(x.id===id)s=x});if(!s)return;
var v=prompt('「'+s.n+'」 1'+s.unit+'의 용량(g)\n\n예) 소고기 200g 짜리 → 200 / 달걀 1개 → 50 / 두부 1팩 → 300\n\n레시피 사용량(g)을 이 값으로 나눠 '+s.unit+' 수를 차감합니다.',stkPer(s));
if(v===null)return;v=+v;if(!v||v<=0)return alert('0보다 큰 숫자를 넣어 주세요');
s.per=v;stkSave();render()}

/*----- 등록 -----*/
function vStkAdd(){return '<div class="cd"><b style="font-size:13.5px">＋ 재고 등록</b><div class="mu" style="font-size:10.5px;margin:3px 0 9px">재료도감에서 <b>검색해 선택</b>하거나 없는 것은 직접 입력하세요.</div>'
+ingSearch('stkPick','SE')
+'</div>'
+(SE?'<div class="cd"><div class="rw" style="justify-content:space-between;align-items:center"><b style="font-size:13px">'+(SE.emoji||'📦')+' '+esc(SE.n)+'</b>'+(SE.key&&NUT[SE.key]?'<span class="tg p">영양 연동</span>':'<span class="tg m">직접 입력</span>')+'</div>'
/* 규격 × 개수 — 예) 소고기 200g 3개 */
+'<div class="cd" style="background:#F3F6FA;padding:10px;margin:9px 0 0"><b style="font-size:12.5px">📦 몇 g 짜리 · 몇 개</b>'
+'<div class="mu" style="font-size:10.5px;margin:3px 0 8px">개수로 관리하면서 실제 사용량은 <b>g 으로 정확히 차감</b>됩니다. 낱개가 아닌 것도 <b>1통·1봉</b>의 용량을 넣으면 됩니다.</div>'
+'<div class="rw" style="align-items:flex-end"><div class="fd" style="flex:1;margin:0"><label>1개 용량</label><input id="skP" type="number" inputmode="decimal" step="1" value="'+(SEper()||'')+'" oninput="skLive()" placeholder="200"></div>'
+'<div class="fd" style="flex:.62;margin:0"><label>용량단위</label><select id="skPU" onchange="skLive()">'+['g','ml'].map(function(u){return '<option '+(SPU===u?'selected':'')+'>'+u+'</option>'}).join('')+'</select></div>'
+'<div style="flex:0 0 14px;text-align:center;font-weight:800;color:var(--sub);padding-bottom:12px">×</div>'
+'<div class="fd" style="flex:.68;margin:0"><label>개수</label><input id="skF" type="number" inputmode="decimal" step="0.5" oninput="skLive()" placeholder="3"></div>'
+'<div class="fd" style="flex:.62;margin:0"><label>세는단위</label><select id="skU" onchange="SU=this.value;skLive()">'+CNTU.map(function(u){return '<option '+(SU===u?'selected':'')+'>'+u+'</option>'}).join('')+'</select></div></div>'
+(SE&&PERH[SE.n]?'<div class="ch" style="margin-top:8px">'+PERH[SE.n].map(function(v){return '<button onclick="skSet(\'skP\','+v[1]+')">'+v[0]+' '+v[1]+'g</button>'}).join('')+'</div>':'')
+'<div id="skcalc" style="margin-top:9px">'+skCalcHTML()+'</div></div>'
+'<div class="rw" style="margin-top:10px"><div class="fd" style="flex:1;margin:0"><label>유통기한 (선택)</label><input id="skE" type="date"></div>'
+'<div class="fd" style="flex:1;margin:0"><label>메모 (선택)</label><input id="skM" placeholder="냉동실 2번칸"></div></div>'
+'<button class="btn" style="margin-top:10px" onclick="stkAdd()">＋ 등록</button>'
+'<div class="mu" style="font-size:10.5px;margin-top:7px">등록하면 <b>먹었어요·기록 저장 시 자동 차감</b>됩니다. 남은 양이 충전량의 <b>20% 이하 ⚠️ · 10% 이하 🚨</b>가 되면 장보기 목록에 자동으로 올라갑니다.</div></div>'
:'<div class="cd mu">위에서 재료를 검색해 선택해 주세요.</div>')}
/*----- 등록 폼 실시간 계산 (입력창 재생성 금지 — 한글·숫자 입력 유지) -----*/
var SPU='g';
function skSet(id,v){var e=document.getElementById(id);if(e){e.value=v;skLive()}}
function skLive(){var c=document.getElementById('skcalc');if(c)c.innerHTML=skCalcHTML()}
function skVal(id){var e=document.getElementById(id);return e?+e.value||0:0}
function skCalcHTML(){var per=skVal('skP'),cnt=skVal('skF');
var ue=document.getElementById('skU');if(ue)SU=ue.value;
var pe=document.getElementById('skPU');if(pe)SPU=pe.value;
if(!per||!cnt)return '<div class="mu" style="font-size:10.5px">1개 용량과 개수를 넣으면 총 보유량이 계산됩니다.</div>';
return '<div class="ir" style="background:#fff;border-radius:9px;padding:8px 10px"><span>총 보유량</span><b style="color:var(--pd);font-size:15px">'+rnd(per*cnt)+SPU+'</b></div>'
+'<div class="mu" style="font-size:10.5px;margin-top:5px">'+per+SPU+' × '+rnd2(cnt)+SU+' = <b>'+rnd(per*cnt)+SPU+'</b> · 재고는 <b>'+SU+'</b> 단위로 관리하고, 레시피 사용량은 '+per+SPU+' 기준으로 나눠 차감합니다.</div>'}


/*========== 🔎 재료 검색 선택기 (재고·관찰 공용) ==========*/
/* cb: 선택 시 호출할 함수명, store: 선택 결과를 담을 전역변수명 */
var SU='개';  /* 등록 폼에서 고른 세는 단위 */
/* 도감 재료의 1개 무게 힌트 — PCG(달걀 등) 와 흔한 포장 단위 */
var PERH={'달걀':[['달걀 1개',50]],'달걀노른자':[['노른자 1개',17]],'두부':[['두부 1팩',300],['부침용 1모',400]],
'아기치즈':[['치즈 1장',18]],'요거트':[['1컵',85]],'김':[['김 1장',2]],'바나나':[['1개',100]],
'사과':[['1개',200]],'배':[['1개',300]],'감자':[['1개',150]],'고구마':[['1개',150]],'단호박':[['1/4쪽',200]],
'브로콜리':[['1송이',300]],'양파':[['1개',180]],'당근':[['1개',150]],'토마토':[['1개',150]],'파프리카':[['1개',120]]};
function SEper(){return (SE&&PERH[SE.n])?PERH[SE.n][0][1]:''}
function SEperHint(){if(SE&&PERH[SE.n])return PERH[SE.n];
return [['작은 1개',30],['중간 1개',100],['1팩',300],['1봉',500]]}
var ISQ={},IScb={};
/* 검색 결과 HTML — 입력창과 분리해서 이 부분만 갱신한다 */
function isResHTML(q,cb){var ql=(q||'').trim().toLowerCase();
if(!ql)return '<div class="mu" style="font-size:10.5px;margin-top:7px">재료명을 입력하면 도감에서 찾아 드려요. 도감에 없으면 직접 입력할 수 있습니다.</div>';
var L=FD.filter(function(f){
return f[0].toLowerCase().indexOf(ql)>=0||f[2].toLowerCase().indexOf(ql)>=0||(f[4]||'').toLowerCase().indexOf(ql)>=0}).slice(0,18);
var exact=L.filter(function(f){return f[0].toLowerCase()===ql}).length;
return (L.length?'<div class="g4" style="margin-top:9px">'+L.map(function(f){
return '<button class="ig" onclick="'+cb+'(\''+esc(f[0])+'\')"><div class="e">'+f[1]+'</div><div class="n">'+f[0]+'</div><div class="m">'+f[3]+'개월+</div></button>'}).join('')+'</div>'
:'<div class="mu" style="font-size:11.5px;margin-top:8px">도감에 <b>'+esc(q)+'</b>가 없어요.</div>')
+(!exact?'<button class="btn g s" style="margin-top:8px" onclick="'+cb+'(\'\')">＋ &quot;'+esc(q)+'&quot; 직접 입력으로 추가</button>':'')}
function ingSearch(cb,store){var q=ISQ[store]||'';IScb[store]=cb;
return '<input value="'+esc(q)+'" id="isq_'+store+'" oninput="reIS(\''+store+'\')" placeholder="🔎 재료명 검색 (예: 소고기, 시금치)" style="width:100%;padding:11px;border:1.5px solid var(--ln);border-radius:11px;outline:none">'
+'<div id="isr_'+store+'">'+isResHTML(q,cb)+'</div>'}
/* 결과 영역만 갱신 — <input> 을 다시 만들지 않아야 한글이 정상 입력된다 */
function reIS(store){var e=document.getElementById('isq_'+store);
if(e)ISQ[store]=e.value;
var r=document.getElementById('isr_'+store);
if(r)r.innerHTML=isResHTML(ISQ[store]||'',IScb[store]||'')}
function stkPick(n){var q=(ISQ.SE||'').trim();
if(!n){if(!q)return alert('재료명을 입력해 주세요');SE={n:q,key:'',emoji:'📦'};render();return}
var f=null;FD.forEach(function(x){if(x[0]===n)f=x});
SE=f?{n:f[0],key:f[4]||'',emoji:f[1]}:{n:n,key:'',emoji:'📦'};
render()}

/*----- 등록 실행 -----*/
function stkAdd(){if(!SE)return alert('재료를 선택해 주세요');
var u=document.getElementById('skU').value,cnt=skVal('skF'),per=skVal('skP');
var pe=document.getElementById('skPU');var pu=pe?pe.value:'g';
var exp=document.getElementById('skE').value,memo=document.getElementById('skM').value.trim();
if(stkFind(SE.n))return alert('이미 등록된 재료예요. 목록에서 🔄 충전을 눌러 주세요.');
if(!per||per<=0)return alert('1개 용량(예: 200)을 입력해 주세요');
if(!cnt||cnt<=0)return alert('개수를 입력해 주세요');
STK.push({id:'k'+Date.now(),n:SE.n,key:SE.key,unit:u,per:per,spec:per+pu,full:cnt,left:cnt,dt:fmt(TD()),exp:exp,memo:memo,
hist:[{d:fmt(TD()),t:nowHM(),g:cnt,why:'최초 등록 ('+per+pu+'×'+rnd2(cnt)+u+')'}]});
stkSave();SE=null;ISQ.SE='';SU=CNTU[0];sTab='list';render()}

/*----- 충전 · 조정 -----*/
function stkRefill(id){var s=null;STK.forEach(function(x){if(x.id===id)s=x});if(!s)return;
var v=prompt('「'+s.n+'」 충전량 ('+s.unit+')\n\n남은 양에 더합니다. 새로 산 만큼 넣어주세요.'+(isCnt(s.unit)?'\n\n규격: 1'+s.unit+' = '+stkPer(s)+'g\n예) 200g 짜리 3개 사왔으면 → 3':''),s.full);
if(v===null)return;v=+v;if(!v)return;
s.left=Math.round((Math.max(0,s.left)+v)*10)/10;
if(v>s.full)s.full=v;
var e=prompt('유통기한 (YYYY-MM-DD) — 비워두면 그대로',s.exp||'');
if(e!==null)s.exp=e.trim();
s.hist=(s.hist||[]);s.hist.push({d:fmt(TD()),t:nowHM(),g:v,why:'충전'});
stkSave();render()}
function stkAdj(id){var s=null;STK.forEach(function(x){if(x.id===id)s=x});if(!s)return;
var v=prompt('「'+s.n+'」 실제 남은 양 ('+s.unit+')\n\n'+(isCnt(s.unit)?'남은 개수를 세어서 넣어 주세요. 0.5 처럼 반 개도 됩니다.':'저울로 재서 정확한 값을 넣으면 맞춰집니다.'),isCnt(s.unit)?rnd2(Math.max(0,s.left)):rnd(Math.max(0,s.left)));
if(v===null)return;v=+v;
if(isNaN(v))return;
var d=Math.round((v-s.left)*10)/10;
s.left=v;
var f=prompt('충전량(100% 기준) — 비워두면 그대로',s.full);
if(f!==null&&+f>0)s.full=+f;
s.hist=(s.hist||[]);s.hist.push({d:fmt(TD()),t:nowHM(),g:d,why:'실측 조정'});
stkSave();render()}
function stkQuick(id,g){var s=null;STK.forEach(function(x){if(x.id===id)s=x});if(!s)return;
s.left=Math.round((s.left+g)*10)/10;
s.hist=(s.hist||[]);s.hist.push({d:fmt(TD()),t:nowHM(),g:g,why:'직접 차감'});
stkSave();render()}
function stkDel(id){var s=null;STK.forEach(function(x){if(x.id===id)s=x});if(!s)return;
if(!confirm('「'+s.n+'」 재고를 삭제할까요?'))return;
STK=STK.filter(function(x){return x.id!==id});stkSave();render()}

/*----- 이력 -----*/
function vStkHist(){var H=[];
STK.forEach(function(s){(s.hist||[]).forEach(function(h){H.push({n:s.n,u:s.unit,cnt:isCnt(s.unit),h:h})})});
H.sort(function(a,b){return (a.h.d+(a.h.t||''))<(b.h.d+(b.h.t||''))?1:-1});
if(!H.length)return '<div class="cd mu">이력이 없어요.</div>';
var by={};H.forEach(function(x){(by[x.h.d]=by[x.h.d]||[]).push(x)});
return '<div class="cd" style="background:#F3F6FA;font-size:11.5px"><b>🕐 입출고 이력</b><div class="mu" style="font-size:10.5px;margin-top:4px">먹었어요로 기록하면 재료가 자동 차감되고 여기에 남습니다.</div></div>'
+Object.keys(by).slice(0,14).map(function(d){
var inS=0,outS=0;by[d].forEach(function(x){if(x.h.g>0)inS+=x.h.g;else outS+=-x.h.g});
return '<div class="cd"><div class="rw" style="justify-content:space-between;align-items:center"><b style="font-size:13px;color:var(--pd)">'+d+'</b><span class="mu" style="font-size:10px">＋'+rnd(inS)+' / −'+rnd(outS)+'</span></div>'
+by[d].map(function(x){return '<div class="lg2"><div style="font-size:15px">'+(x.h.g>0?'📥':'📤')+'</div><div style="flex:1"><b style="font-size:12.5px">'+esc(x.n)+'</b><div class="mu" style="font-size:10px">'+(x.h.t||'')+' · '+x.h.why+'</div></div>'
+'<b style="font-size:12.5px;color:'+(x.h.g>0?'var(--ok)':'var(--rd)')+'">'+(x.h.g>0?'+':'')+(x.cnt?rnd2(x.h.g):rnd(x.h.g))+x.u+'</b></div>'}).join('')+'</div>'}).join('')}

/*----- 장보기 연동 -----*/
function stkShopAdd(){return stkLow().map(function(s){
var short=s.full-Math.max(0,s.left);
/* 개수 단위는 1단위 올림(0.5개를 사올 수 없다), 무게 단위는 10 단위 올림 */
var buy=isCnt(s.unit)?Math.ceil(short):Math.ceil(short/10)*10;
return {n:s.n,need:s.full,have:Math.max(0,s.left),buy:buy,unit:s.unit,pct:stkPct(s),stock:1}})}
