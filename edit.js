/*========== 레시피 편집 ==========*/
function openEd(id,pre){var r=id?getR(id):null;
ME=r?JSON.parse(JSON.stringify(r)):{i:'my'+Date.now(),my:1,n:'',s:IDS.indexOf(curS().id==='ready'?'early':curS().id),y:'p',tm:'',g:[],st:[''],tip:'',sv:1,sr:['ppibbo']};
ME.orig=(id&&r&&!r.my)?id:null;EDGATE=0;
if(pre&&pre.length&&!id){ME.g=pre.map(function(k){return (typeof stkRow==='function')?stkRow(k):[k,QG[k]||10,qUnit(k),k]});
if(!ME.n)ME.n=pre.slice(0,2).join(' ')+'죽'}
/* 기존 레시피를 열 때도 재고에 등록된 최신 규격(1개당 g)을 반영한다 */
if(typeof edPerFix==='function')edPerFix();
if(typeof PREPEDIT!=='undefined')PREPEDIT=1;   /* 손질법 토글이 편집화면을 다시 그리도록 */
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
+(ME.g.length?ME.g.map(function(x,i){return '<div class="ei"><input style="flex:1.4" value="'+esc(x[0])+'" oninput="ME.g['+i+'][0]=this.value"><input style="flex:.62" type="number" step="'+(x[2]==='개'?'1':'0.1')+'" min="0" value="'+x[1]+'" oninput="ME.g['+i+'][1]=+this.value;drawEd()"><select style="flex:.52" onchange="ME.g['+i+'][2]=this.value;edUnit('+i+')">'+['g','ml','개','방울'].map(function(u){return '<option '+(x[2]===u?'selected':'')+'>'+u+'</option>'}).join('')+'</select><select style="flex:1" onchange="ME.g['+i+'][3]=this.value;edUnit('+i+')"><option value="">영양 미반영</option>'+ks.map(function(k){return '<option '+(x[3]===k?'selected':'')+'>'+k+'</option>'}).join('')+'</select><button style="color:var(--sub)" onclick="ME.g.splice('+i+',1);drawEd()">✕</button></div>'
+edPerRow(x,i)}).join(''):'<div class="mu">재료를 추가해 주세요.</div>')
+'<div class="hr"></div><div class="fd" style="margin-bottom:8px"><label>기본 재료 선택 (영양 자동 계산)</label><select id="eK" onchange="document.getElementById(\'eN\').value=this.value"><option value="">— 직접 입력 —</option>'+ks.map(function(k){return '<option>'+k+'</option>'}).join('')+'</select></div>'
+'<div class="ei"><input id="eN" style="flex:1.4" placeholder="재료명"><input id="eQ" style="flex:.62" type="number" placeholder="20"><select id="eU" style="flex:.52"><option>g</option><option>ml</option><option>개</option><option>방울</option></select></div>'
+'<button class="btn g s" onclick="addIng()">＋ 재료 추가</button></div>'
+((typeof stkHowto==='function'&&ME.g&&ME.g.length)?stkHowto(ME):'')
+((typeof prepBlock==='function')?prepBlock(ME):'')
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
/* ★★ 표시값은 gOf() 와 반드시 같은 식이어야 한다 (v91) ★★
   예전에는 여기만 재고 규격을 fallback 으로 썼다(linked?stkPer(s):…).
   그래서 x[4] 가 빈 '두부 1개' 를 화면은 300g 이라 적고 gOf() 는 10g 으로
   계산했다 — 화면과 영양·권장%·재고차감이 30배 어긋난 채 아무 경고도 없었다.
   이제 미지정이면 그 사실을 드러내고, 값 결정은 사용자가 한다. */
var unset=!(+x[4]>0);
var per=+x[4]||(PCG[x[3]]||10);          /* gOf(core.js:49) 와 동일한 fallback */
var tot=(+x[1]||0)*per;
if(unset){
var sug=linked?rnd(stkPer(s)):0;
return '<div style="font-size:10px;margin:-4px 0 7px;padding:5px 7px;background:#FFF4EE;border-radius:7px;line-height:1.55">'
+'<b style="color:var(--pd)">⚠️ 1개 = ?g 미지정</b> <span class="mu">— 지금은 '+rnd(per)+'g 으로 계산돼 총 '+rnd(tot)+'g 입니다. 실제와 다르면 영양·권장%·재고차감이 모두 틀립니다.</span>'
+(linked?'<br><span class="mu">📦 재고: 「'+esc(s.n)+'」 1'+s.unit+' = '+sug+'g</span>'
+' <button style="color:var(--bl);font-weight:800" onclick="edPerUse('+i+','+sug+')">이 값 적용</button>':'')
+' <button style="color:var(--bl);font-weight:800" onclick="edPerSet('+i+')">직접 입력</button>'
+'</div>'}
/* ★ 권장량 대비 과다 경고 (v91)
   개수 단위는 1개 미만을 쓸 수 없어, 포장 단위가 큰 재료(1팩 300g·1통 800g)를
   개수로 담으면 한 끼 권장량을 몇 배씩 넘는다. 예전 stkRow/edAddStk 가 만든
   행들이 이미 그 상태로 저장돼 있으므로, 화면에서 눈에 띄게 알려 준다. */
var rec=(typeof QG!=='undefined'&&QG[x[3]])?QG[x[3]]:0;
var over=(rec>0&&tot>=rec*2);
return '<div class="mu" style="font-size:10px;margin:-4px 0 7px;padding-left:4px;line-height:1.5">'
+'1개 = <b>'+rnd(per)+'g</b> → 총 <b style="color:var(--pd)">'+rnd(tot)+'g</b>'
+' <button style="color:var(--bl);font-weight:800" onclick="edPerSet('+i+')">규격 수정</button>'
+(over?'<br><span style="color:var(--pd);font-weight:700">⚠️ 한 끼 권장 '+rnd(rec)+'g 의 '+(tot/rec).toFixed(1)+'배입니다.</span>'
+' <span class="mu">포장 단위(1'+(linked?s.unit:'개')+')를 그대로 담아 커진 값일 수 있어요.</span>'
+' <button style="color:var(--bl);font-weight:800" onclick="edToGram('+i+','+rnd(rec)+')">'+rnd(rec)+'g 으로 바꾸기</button>':'')
+(linked&&Math.abs(per-stkPer(s))>0.05?'<br><span style="color:var(--mt)">📦 재고의 「'+esc(s.n)+'」 는 1'+s.unit+'='+rnd(stkPer(s))+'g 입니다. <button style="color:var(--bl);font-weight:800" onclick="edPerUse('+i+','+rnd(stkPer(s))+')">그 값으로 바꾸기</button></span>':'')+'</div>'}
/* 개수 행을 g 행으로 바꾼다 — 포장 단위로 부풀려진 행을 권장량으로 되돌리는 용도.
   재고 차감은 stkUse 가 g→개수(g2u)로 환산하므로 g 으로 둬도 정상 차감된다. */
function edToGram(i,g){var x=ME.g[i];g=+g;if(!g||g<=0)return;
if(!confirm('「'+x[0]+'」 를 '+rnd(g)+'g 으로 바꿀까요?\n\n개수(1개 단위) 대신 g 으로 적으면 한 끼 분량을 정확히 맞출 수 있어요.\n재고에서는 그만큼만 차감됩니다.'))return;
x[1]=g;x[2]=(typeof qUnit==='function')?qUnit(x[3]):'g';if(x[2]==='개')x[2]='g';x[4]=undefined;
drawEd()}
/* 제안된 규격을 이 행에만 적용한다 (재고는 건드리지 않는다) */
function edPerUse(i,v){var x=ME.g[i];v=+v;if(!v||v<=0)return;
x[4]=v;drawEd()}
/* 단위·재료를 바꾸면 개당 g 을 다시 물린다 */
function edUnit(i){var x=ME.g[i];
/* ★ 이미 정해진 개당 g 은 덮어쓰지 않는다 (v91).
   예전에는 재고 연동이면 x[4]=stkPer(s) 로 무조건 덮었다. perSync·edPerFix·
   edAddStk 는 모두 !(+x[4]>0) 가드가 있는데 이 함수만 없어서, [규격 수정]으로
   직접 정한 값이 단위/재료 드롭다운을 한 번 건드리는 순간 날아갔다.
   → 비어 있을 때만 채우고, 그 값도 gOf() 와 같은 PCG 기준으로 둔다.
      재고 규격 적용은 edPerRow 의 [이 값 적용]으로 사용자가 명시적으로 한다. */
if(x[2]==='개'&&x[3]){if(!(+x[4]>0))x[4]=PCG[x[3]]||10}
else if(x[2]!=='개')x[4]=undefined;
drawEd()}
/* 규격 직접 수정 — 재고와 연동된 항목은 재고 쪽 값도 함께 고칠지 묻는다 */
function edPerSet(i){var x=ME.g[i],s=(typeof stkByKey==='function')?stkByKey(x[3]):null;
var linked=!!(s&&isCnt(s.unit));
/* ★ 기본 제시값도 gOf() 와 같은 기준으로 둔다 (v91).
   재고 규격(1팩=300g)을 prompt 기본값으로 띄우면 사용자가 무심코 확인만 눌러
   총량이 30배 되는 일이 생긴다. 재고값은 아래 ※ 안내로만 알려준다. */
var cur=+x[4]||(PCG[x[3]]||10);
var v=prompt('「'+x[0]+'」 1개의 무게(g)\n\n예) 달걀 1개 50 / 소고기 1팩 200 / 두부 1팩 300'
+(linked?'\n\n※ 재고에 「'+s.n+'」 1'+s.unit+'='+rnd(stkPer(s))+'g 으로 등록돼 있습니다.\n   값을 바꾸면 재고 규격도 함께 수정됩니다.':''),cur);
if(v===null)return;v=+v;if(!v||v<=0)return alert('0보다 큰 숫자를 넣어 주세요');
x[4]=v;
/* ★ 재고 규격까지 함께 고칠지는 사용자가 정한다.
   예전에는 묻지 않고 재고(s.per)를 같이 바꿨다. 재고 규격은 다른 레시피와
   장보기 계산에도 쓰이므로, 이 메뉴 하나 때문에 전체 기준이 바뀌면
   "왜 딴 데 양이 달라졌지"가 된다. 기본값은 '이 메뉴만'이다. */
if(linked){
if(confirm('재고의 「'+s.n+'」 규격도 1'+s.unit+'='+v+'g 으로 바꿀까요?\n\n[확인] 재고 기준까지 함께 변경 (장보기·다른 메뉴 계산에 반영)\n[취소] 이 메뉴에만 적용 (재고는 그대로)')){
s.per=v;if(typeof stkSave==='function')stkSave()}}
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
uNow(ME);                       /* 신규든 수정이든 지금 시각을 찍는다 */
if(i>=0)myR[i]=ME;else myR.push(ME);
save();closeM();
/* 식단 칸에서 만들기로 들어왔으면 그 칸에 넣고 식단으로 돌아간다 */
if(typeof PLSLOT!=='undefined'&&PLSLOT&&plan&&plan.d){plan.d[PLSLOT[0]][PLSLOT[1]]=ME.i;
PLSLOT=null;shopChk={};save();tab='plan';pTab='w';render();return}
mTab='m';tab='menu';srch='';render()}
function resetOv(id){if(!confirm('기본 레시피로 되돌릴까요?'))return;
delete ov[id];save();curR=getR(id);document.getElementById('mb').innerHTML=rBody();render()}
function delMy(id){if(!confirm('삭제할까요?'))return;
myR=myR.filter(function(r){return r.i!==id});delMark('my',id);save();closeM();render()}
