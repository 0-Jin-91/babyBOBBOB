/*========== 레시피 편집 ==========*/
function openEd(id){var r=id?getR(id):null;
ME=r?JSON.parse(JSON.stringify(r)):{i:'my'+Date.now(),my:1,n:'',s:IDS.indexOf(curS().id==='ready'?'early':curS().id),y:'p',tm:'',g:[],st:[''],tip:'',sv:1,sr:['ppibbo']};
ME.orig=(id&&r&&!r.my)?id:null;
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
+(ME.g.length?ME.g.map(function(x,i){return '<div class="ei"><input style="flex:1.4" value="'+esc(x[0])+'" oninput="ME.g['+i+'][0]=this.value"><input style="flex:.62" type="number" step="0.1" value="'+x[1]+'" oninput="ME.g['+i+'][1]=+this.value;drawEd()"><select style="flex:.52" onchange="ME.g['+i+'][2]=this.value;drawEd()">'+['g','ml','개','방울'].map(function(u){return '<option '+(x[2]===u?'selected':'')+'>'+u+'</option>'}).join('')+'</select><select style="flex:1" onchange="ME.g['+i+'][3]=this.value;drawEd()"><option value="">영양 미반영</option>'+ks.map(function(k){return '<option '+(x[3]===k?'selected':'')+'>'+k+'</option>'}).join('')+'</select><button style="color:var(--sub)" onclick="ME.g.splice('+i+',1);drawEd()">✕</button></div>'}).join(''):'<div class="mu">재료를 추가해 주세요.</div>')
+'<div class="hr"></div><div class="fd" style="margin-bottom:8px"><label>기본 재료 선택 (영양 자동 계산)</label><select id="eK" onchange="document.getElementById(\'eN\').value=this.value"><option value="">— 직접 입력 —</option>'+ks.map(function(k){return '<option>'+k+'</option>'}).join('')+'</select></div>'
+'<div class="ei"><input id="eN" style="flex:1.4" placeholder="재료명"><input id="eQ" style="flex:.62" type="number" placeholder="20"><select id="eU" style="flex:.52"><option>g</option><option>ml</option><option>개</option><option>방울</option></select></div>'
+'<button class="btn g s" onclick="addIng()">＋ 재료 추가</button></div>'
+(low.length&&ME.g.length?'<div class="st">🔧 부족한 영양소 원터치 보충</div><div class="cd">'+low.slice(0,3).map(function(x){var kk=x.k;
return '<div style="margin-bottom:9px"><b style="font-size:12.5px;color:'+lvCol(x.pc)+'">'+lvIco(x.pc)+' '+x.nm+' '+Math.round(x.pc)+'%</b><div class="ch" style="margin-top:5px">'+FIX[kk].f.map(function(fn){return '<button style="background:#E7F1FB;color:#3A6FA8" onclick="edAdd(\''+fn+'\')">＋ '+fn+' '+(QG[fn]||10)+qUnit(fn)+'</button>'}).join('')+'</div></div>'}).join('')+'</div>':'')
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
function edAdd(fn){var q=QG[fn]||10,u=qUnit(fn),hit=-1;
ME.g.forEach(function(x,i){if(x[3]===fn)hit=i});
if(hit>=0)ME.g[hit][1]=Math.round((+ME.g[hit][1]+q)*10)/10;else ME.g.push([fn,q,u,fn]);
drawEd()}
function addIng(){var k=document.getElementById('eK').value,n=document.getElementById('eN').value.trim()||k,q=+document.getElementById('eQ').value,u=document.getElementById('eU').value;
if(!n)return alert('재료명을 입력해 주세요');if(!q)return alert('양을 입력해 주세요');
ME.g.push([n,q,u,k||'']);drawEd()}
function saveEd(){if(!(ME.n||'').trim())return alert('메뉴 이름을 입력해 주세요');
ME.st=ME.st.filter(function(x){return x.trim()});
if(!ME.st.length)ME.st=['—'];
if(ME.orig){var id=ME.orig;ov[id]={n:ME.n,g:ME.g,st:ME.st,tm:ME.tm,sv:ME.sv,tip:ME.tip,s:ME.s,y:ME.y};
save();closeM();curR=getR(id);openR(id);render();return}
ME.my=1;ME.tag='내 레시피';delete ME.orig;
var i=-1;myR.forEach(function(r,x){if(r.i===ME.i)i=x});
if(i>=0)myR[i]=ME;else myR.push(ME);
save();closeM();mTab='m';tab='menu';srch='';render()}
function resetOv(id){if(!confirm('기본 레시피로 되돌릴까요?'))return;
delete ov[id];save();curR=getR(id);document.getElementById('mb').innerHTML=rBody();render()}
function delMy(id){if(!confirm('삭제할까요?'))return;
myR=myR.filter(function(r){return r.i!==id});save();closeM();render()}
