/*========== 레시피 편집 ==========*/
function openEd(id,pre){var r=id?getR(id):null;
ME=r?JSON.parse(JSON.stringify(r)):{i:'my'+Date.now(),my:1,n:'',s:IDS.indexOf(curS().id==='ready'?'early':curS().id),y:'p',tm:'',g:[],st:[''],tip:'',sv:1,sr:['ppibbo']};
ME.orig=(id&&r&&!r.my)?id:null;EDGATE=0;
if(pre&&pre.length&&!id){ME.g=pre.map(function(k){return (typeof stkRow==='function')?stkRow(k):[k,QG[k]||10,qUnit(k),k]});
if(!ME.n)ME.n=pre.slice(0,2).join(' ')+'죽'}
/* 기존 레시피를 열 때도 재고에 등록된 최신 규격(1개당 g)을 반영한다 */
if(typeof edPerFix==='function')edPerFix();
drawEd();document.getElementById('md').classList.add('on');document.body.style.overflow='hidden'}
function drawEd(){var nu=nutOf(ME),T=TG(),ks=Object.keys(NUT),sc=ME.g.length?mealScore(ME):0;
var D=diagOf(ME),low=D.filter(function(x){return x.pc<LV.ok}).sort(function(a,b){return a.pc-b.pc});
document.getElementById('mb').innerHTML='<div class="mt2" style="margin-bottom:4px">'+(ME.orig?'✏️ 레시피 수정':(ME.n?'✏️ 내 메뉴 수정':'＋ 나의 메뉴 만들기'))+'</div>'
+(ME.orig?'<p class="mu" style="margin:0 0 10px">메뉴명·재료·중량 모두 수정 가능. 이 기기에만 저장되고 원본은 보존됩니다.</p>':'')
+'<div class="cd"><div class="fd"><label>메뉴 이름</label><input type="text" value="'+esc(ME.n)+'" oninput="ME.n=this.value"></div>'
+'<div class="rw"><div class="fd" style="flex:1"><label>단계</label><select onchange="ME.s=+this.value;drawEd()">'+STG.slice(1).map(function(s,i){return '<option value="'+(i+1)+'" '+(ME.s===i+1?'selected':'')+'>'+s.n+'</option>'}).join('')+'</select></div>'
+'<div class="fd" style="flex:1"><label>분류</label><select onchange="ME.y=this.value">'+[['p','죽'],['t','토핑'],['f','핑거푸드'],['m','유아식']].map(function(x){return '<option value="'+x[0]+'" '+(ME.y===x[0]?'selected':'')+'>'+x[1]+'</option>'}).join('')+'</select></div></div>'
+'<div class="rw"><div class="fd" style="flex:1;margin:0"><label>조리시간</label><input type="text" value="'+esc(ME.tm||'')+'" oninput="ME.tm=this.value" placeholder="25분"></div><div class="fd" style="flex:1;margin:0"><label>몇 회분?</label><input type="number" min="1" value="'+(ME.sv||1)+'" oninput="ME.sv=Math.max(1,+this.value||1);drawEd()"></div></div></div>'
+'<div class="st">재료 · 중량 (숫자를 바꾸면 즉시 재계산)</div><div class="cd">'
+(ME.g.length?ME.g.map(function(x,i){return '<div class="ei"><input style="flex:1.4" value="'+esc(x[0])+'" oninput="ME.g['+i+'][0]=this.value"><input style="flex:.62" type="number" step="0.1" value="'+x[1]+'" oninput="ME.g['+i+'][1]=+this.value;drawEd()"><select style="flex:.52" onchange="ME.g['+i+'][2]=this.value;edUnit('+i+')">'+['g','ml','개','방울'].map(function(u){return '<option '+(x[2]===u?'selected':'')+'>'+u+'</option>'}).join('')+'</select><select style="flex:1" onchange="ME.g['+i+'][3]=this.value;edUnit('+i+')"><option value="">영양 미반영</option>'+ks.map(function(k){return '<option '+(x[3]===k?'selected':'')+'>'+k+'</option>'}).join('')+'</select><button style="color:var(--sub)" onclick="ME.g.splice('+i+',1);drawEd()">✕</button></div>'
+edPerRow(x,i)}).join(''):'<div class="mu">재료를 추가해 주세요.</div>')
+'<div class="hr"></div><div class="fd" style="margin-bottom:8px"><label>기본 재료 선택 (영양 자동 계산)</label><select id="eK" onchange="document.getElementById(\'eN\').value=this.value"><option value="">— 직접 입력 —</option>'+ks.map(function(k){return '<option>'+k+'</option>'}).join('')+'</select></div>'
+'<div class="ei"><input id="eN" style="flex:1.4" placeholder="재료명"><input id="eQ" style="flex:.62" type="number" placeholder="20"><select id="eU" style="flex:.52"><option>g</option><option>ml</option><option>개</option><option>방울</option></select></div>'
+'<button class="btn g s" onclick="addIng()">＋ 재료 추가</button></div>'
+stkPanel('edit')
+(low.length&&ME.g.length?'<div class="st">🔧 부족한 영양소 원터치 보충</div><div class="cd">'+low.slice(0,3).map(function(x){var kk=x.k;
return '<div style="margin-bottom:9px"><b style="font-size:12.5px;color:'+lvCol(x.pc)+'">'+lvIco(x.pc)+' '+x.nm+' '+Math.round(x.pc)+'%</b><div class="ch" style="margin-top:5px">'+FIX[kk].f.map(function(fn){return '<button style="background:#E7F1FB;color:#3A6FA8" onclick="edAddChk(\''+fn+'\')">＋ '+fn+' '+(QG[fn]||10)+qUnit(fn)+'</button>'}).join('')+'</div></div>'}).join('')+'</div>':'')
+'<div class="cd"><div class="rw" style="justify-content:space-between;align-items:center"><b style="font-size:13px">🍀 자동 계산 영양 (1회분)</b><span class="badge '+lvl(sc)+'" style="font-size:12px;padding:5px 10px">'+lvIco(sc)+' 종합 '+sc+'%</span></div>'
+'<div class="mu" style="font-size:10.5px;margin:4px 0 8px">1끼 목표 = '+(T.use?'체중 '+T.w+'kg':'표준')+' 하루 목표 × 영양소별 이유식 담당비율 ÷ '+MEALS()+'끼</div>'
+D.map(nrow).join('')
+'<div class="mu" style="font-size:10px;margin-top:5px">비타민C '+rnd(nu.t.vc)+'mg · 고기 '+Math.round(nu.meat)+'g</div></div>'
+feCoach(nu)
+comboEdit()
+'<div class="st">만드는 순서 (그림 자동 매칭)</div><div class="cd">'
+ME.st.map(function(s,i){return '<div class="rw" style="margin-bottom:6px;align-items:center"><div style="flex:0 0 40px;height:31px;border-radius:8px;overflow:hidden;border:1px solid var(--ln)">'+ART(kOf(s))+'</div><input value="'+esc(s)+'" oninput="ME.st['+i+']=this.value" onblur="drawEd()" placeholder="'+(i+1)+'단계" style="flex:1;padding:10px;border:1.5px solid var(--ln);border-radius:11px"><button style="color:var(--sub);padding:0 4px" onclick="ME.st.splice('+i+',1);drawEd()">✕</button></div>'}).join('')
+'<button class="btn g s" onclick="ME.st.push(\'\');drawEd()">＋ 단계 추가</button></div>'
+'<div class="cd"><div class="fd" style="margin:0"><label>메모 / TIP</label><textarea rows="3" oninput="ME.tip=this.value">'+esc(ME.tip||'')+'</textarea></div></div>'
+'<button class="btn" onclick="saveEd()">저장하기</button>'
+(ME.my&&myR.filter(function(r){return r.i===ME.i}).length?'<button class="btn y" style="margin-top:8px" onclick="delMy(\''+ME.i+'\')">삭제</button>':'')
+'<button class="btn y" style="margin-top:8px" onclick="closeM()">취소</button>'}
/*----- 개수 단위 행의 규격(1개당 g) 표시·수정 -----*/
function edPerRow(x,i){if(x[2]!=='개'||!x[3])return '';
var s=(typeof stkByKey==='function')?stkByKey(x[3]):null;
var linked=!!(s&&typeof isCnt==='function'&&isCnt(s.unit));
var per=+x[4]||(linked?stkPer(s):(PCG[x[3]]||10));
var tot=(+x[1]||0)*per;
return '<div class="mu" style="font-size:10px;margin:-4px 0 7px;padding-left:4px;line-height:1.5">'
+(linked?'📦 <b style="color:var(--mt)">재고 규격 연동</b> · ':'')
+'1개 = <b>'+rnd(per)+'g</b> → 총 <b style="color:var(--pd)">'+rnd(tot)+'g</b>'
+' <button style="color:var(--bl);font-weight:800" onclick="edPerSet('+i+')">규격 수정</button>'
+(linked?'<br><span style="color:var(--mt)">재고에서 「'+esc(s.n)+'」 1'+s.unit+'='+rnd(stkPer(s))+'g 으로 등록돼 있어 자동 반영됩니다.</span>':'')+'</div>'}
/* 단위·재료를 바꾸면 개당 g 을 다시 물린다 */
function edUnit(i){var x=ME.g[i];
if(x[2]==='개'&&x[3]){var s=(typeof stkByKey==='function')?stkByKey(x[3]):null;
if(s&&isCnt(s.unit))x[4]=stkPer(s);
else if(!x[4])x[4]=PCG[x[3]]||10}
else if(x[2]!=='개')x[4]=undefined;
drawEd()}
/* 규격 직접 수정 — 재고와 연동된 항목은 재고 쪽 값도 함께 고칠지 묻는다 */
function edPerSet(i){var x=ME.g[i],s=(typeof stkByKey==='function')?stkByKey(x[3]):null;
var linked=!!(s&&isCnt(s.unit));
var cur=+x[4]||(linked?stkPer(s):(PCG[x[3]]||10));
var v=prompt('「'+x[0]+'」 1개의 무게(g)\n\n예) 달걀 1개 50 / 소고기 1팩 200 / 두부 1팩 300'
+(linked?'\n\n※ 재고에 「'+s.n+'」 1'+s.unit+'='+rnd(stkPer(s))+'g 으로 등록돼 있습니다.\n   값을 바꾸면 재고 규격도 함께 수정됩니다.':''),cur);
if(v===null)return;v=+v;if(!v||v<=0)return alert('0보다 큰 숫자를 넣어 주세요');
x[4]=v;
if(linked){s.per=v;if(typeof stkSave==='function')stkSave();
if(typeof perSync==='function')perSync()}
drawEd()}
function edAdd(fn){var q=QG[fn]||10,u=qUnit(fn),hit=-1;
ME.g.forEach(function(x,i){if(x[3]===fn)hit=i});
if(hit>=0)ME.g[hit][1]=Math.round((+ME.g[hit][1]+q)*10)/10;else ME.g.push([fn,q,u,fn]);
drawEd()}
function addIng(){var k=document.getElementById('eK').value,n=document.getElementById('eN').value.trim()||k,q=+document.getElementById('eQ').value,u=document.getElementById('eU').value;
if(!n)return alert('재료명을 입력해 주세요');if(!q)return alert('양을 입력해 주세요');
ME.g.push([n,q,u,k||'']);drawEd()}
function saveEd(){if(!(ME.n||'').trim())return alert('메뉴 이름을 입력해 주세요');
/* 저장 전 재료 조합 검증 — 문제가 있으면 확인 모달을 띄우고 멈춘다 */
if(!EDGATE&&(ME.g||[]).length&&typeof edComboGate==='function'&&!edComboGate())return;
EDGATE=0;
ME.st=ME.st.filter(function(x){return x.trim()});
if(!ME.st.length)ME.st=['—'];
if(ME.orig){var id=ME.orig;ov[id]={n:ME.n,g:ME.g,st:ME.st,tm:ME.tm,sv:ME.sv,tip:ME.tip,s:ME.s,y:ME.y};
save();closeM();curR=getR(id);openR(id);render();return}
ME.my=1;ME.tag='내 레시피';delete ME.orig;
var i=-1;myR.forEach(function(r,x){if(r.i===ME.i)i=x});
if(i>=0)myR[i]=ME;else myR.push(ME);
save();closeM();
/* 식단 칸에서 만들기로 들어왔으면 그 칸에 넣고 식단으로 돌아간다 */
if(typeof PLSLOT!=='undefined'&&PLSLOT&&plan&&plan.d){plan.d[PLSLOT[0]][PLSLOT[1]]=ME.i;
PLSLOT=null;shopChk={};save();tab='plan';pTab='w';render();return}
mTab='m';tab='menu';srch='';render()}
function resetOv(id){if(!confirm('기본 레시피로 되돌릴까요?'))return;
delete ov[id];save();curR=getR(id);document.getElementById('mb').innerHTML=rBody();render()}
function delMy(id){if(!confirm('삭제할까요?'))return;
myR=myR.filter(function(r){return r.i!==id});save();closeM();render()}
