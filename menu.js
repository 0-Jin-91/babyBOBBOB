/*========== 메뉴 탭 ==========*/
function menuHead(){return '<div class="tt"><button class="'+(mTab==='s'?'on':'')+'" onclick="mTab=\'s\';render()">📚 단계별</button><button class="'+(mTab==='f'?'on':'')+'" onclick="mTab=\'f\';render()">⭐ 즐겨찾기</button><button class="'+(mTab==='m'?'on':'')+'" onclick="mTab=\'m\';render()">✏️ 나의 메뉴 ('+myR.length+')</button></div>'
+'<div class="cd" style="padding:9px"><input value="'+esc(srch)+'" oninput="srch=this.value;reSearch()" id="sq" placeholder="🔎 메뉴·재료 검색 (예: 소고기, 토핑)" style="width:100%;padding:10px;border:1.5px solid var(--ln);border-radius:11px;outline:none"></div>'}
function vMenu(){return menuHead()+(srch?vSearch():mTab==='s'?vStage():mTab==='f'?vFav():vMy())}
function reSearch(){srch=document.getElementById('sq').value;
document.getElementById('vw').innerHTML=vMenu();
var s2=document.getElementById('sq');if(s2){s2.focus();s2.setSelectionRange(s2.value.length,s2.value.length)}}
function vSearch(){var q=srch.toLowerCase();
var L=RCP().filter(function(r){
if(r.n.toLowerCase().indexOf(q)>=0)return 1;
if(TY[r.y].indexOf(q)>=0)return 1;
return (r.g||[]).filter(function(x){return (x[0]+' '+(x[3]||'')).toLowerCase().indexOf(q)>=0}).length});
return '<div class="st">검색 결과 '+L.length+'개</div>'+(L.length?L.map(function(r){return rcard(r,' · '+STG[r.s].n+' '+TY[r.y])}).join(''):'<div class="cd mu">결과가 없어요.</div>')}
function vFav(){var L=RCP().filter(function(r){return fav[r.i]});
return '<div class="cd" style="background:#FFF6EC;font-size:12px">즐겨찾기한 메뉴는 <b>추천에서 우선 선택</b>됩니다. 메뉴 상세에서 ☆를 눌러 등록하세요.</div>'
+(L.length?L.map(function(r){return rcard(r,' · '+STG[r.s].n)}).join(''):'<div class="cd mu">아직 즐겨찾기가 없어요.</div>')}
function vStage(){var si=IDS.indexOf(selS),st=STG[si],cur=curS().id;
var ty=[['p',TY.p],['t',TY.t]];
if(selS==='late')ty.push(['f',TY.f]);
if(selS==='final')ty=[['m',TY.m]];
if(!ty.filter(function(x){return x[0]===selT}).length)selT=ty[0][0];
var list=RCP().filter(function(r){return r.s===si&&r.y===selT});
return '<div class="tab">'+STG.slice(1).map(function(s){return '<button class="'+(s.id===selS?'on':'')+'" style="'+(s.id===selS?'background:'+s.c:'')+'" onclick="selS=\''+s.id+'\';render()">'+s.n+(s.id===cur?' ·':'')+'</button>'}).join('')+'</div>'
+'<div class="cd" style="border-left:4px solid '+st.c+'"><b style="font-size:16px">'+st.n+' <span class="mu" style="font-weight:600">'+st.lb+'</span></b>'+(st.id===cur?' <span class="tg p">지금 여기</span>':'')+'<p class="mu" style="margin:7px 0 10px">'+st.ds+'</p><div class="g2">'+cell('농도',st.ra)+cell('횟수',st.ct)+cell('1회 양',st.am)+cell('입자',st.tx)+'</div><div style="margin-top:9px">'+sT('ppibbo')+sT('bboon')+'</div></div>'
+'<div class="tt">'+ty.map(function(t){return '<button class="'+(t[0]===selT?'on':'')+'" onclick="selT=\''+t[0]+'\';render()">'+t[1]+'</button>'}).join('')+'</div>'
+(selT==='t'?'<div class="cd" style="background:#F3FAF7;font-size:12px"><b>🧊 토핑이유식</b> — 기본 죽(밥)에 재료별 큐브를 올려 주는 방식. 먼저 <b>[준비] 큐브 만들기</b>로 큐브를 만들고 아래 조합을 돌려 쓰세요. '+sT('topping')+'</div>':'')
+(selT==='p'?'<div class="cd" style="background:#FFF6EC;font-size:12px"><b>🍲 죽 이유식</b> — 배죽 비율(10→7→5배죽→진밥)에 따라 재료를 함께 끓이는 방식. '+sT('bboon')+'</div>':'')
+(list.length?list.map(function(r){return rcard(r)}).join(''):'<div class="cd mu">메뉴가 없습니다.</div>')}
function vMy(){return '<div class="cd"><b>✏️ 나의 메뉴</b><p class="mu" style="margin:5px 0 10px">재료와 중량을 입력하면 영양소·권장량 %·<b>철분 흡수 추정</b>까지 자동 계산됩니다. <b>기본 메뉴도 메뉴명까지 수정</b> 가능해요.</p><button class="btn" onclick="openEd()">＋ 새 메뉴 만들기</button></div>'
+(myR.length?myR.slice().reverse().map(function(r){return rcard(r,' · '+STG[r.s].n)}).join(''):'<div class="cd mu">아직 등록한 메뉴가 없어요.</div>')}

/*========== 레시피 상세 모달 ==========*/
function openR(id){curR=getR(id);qty=1;
document.getElementById('mb').innerHTML=rBody();
document.getElementById('md').classList.add('on');document.body.style.overflow='hidden'}
function rBody(){var r=curR,st=STG[r.s],nu=nutOf(r,qty),sc=mealScore(r);
return '<div class="rw" style="justify-content:space-between;align-items:center"><button class="badge '+lvl(sc)+'" style="font-size:12px;padding:6px 10px" onclick="diagMeal(\''+r.i+'\')">'+lvIco(sc)+' 1끼 영양 '+sc+'% · 진단 ›</button><button style="font-size:20px" onclick="toggleFav(\''+r.i+'\');document.getElementById(\'mb\').innerHTML=rBody()">'+(fav[r.i]?'⭐':'☆')+'</button></div>'
+'<div class="mt2" style="text-align:center;margin:8px 0 4px">'+esc(r.n)+'</div><div style="text-align:center;margin-bottom:12px"><span class="tg" style="background:'+st.c+'22;color:'+(st.c==='#FFC861'?'#B07C13':st.c)+'">'+st.n+'</span><span class="tg">'+TY[r.y]+'</span><span class="tg">⏱ '+(r.tm||'-')+'</span>'+(r.tag?'<span class="tg p">'+r.tag+'</span>':'')+(r.sv>1?'<span class="tg">'+r.sv+'회분</span>':'')+(r.ed?'<span class="tg p">내가 수정</span>':'')+'</div>'
+'<div class="qb"><b style="flex:1;font-size:13.5px">분량 ×'+qty+'</b><button onclick="setQ(-1)">−</button><b style="width:22px;text-align:center">'+qty+'</b><button onclick="setQ(1)">＋</button></div>'
+'<div class="cd"><div class="rw" style="justify-content:space-between"><b style="font-size:13.5px">🧾 재료</b><button class="mu" style="font-weight:700;color:var(--pd)" onclick="openEd(\''+r.i+'\')">✏️ 이름·재료·중량 수정</button></div><div style="margin-top:6px">'
+r.g.map(function(x){return '<div class="ir"><span>'+esc(x[0])+'</span><b>'+rnd((+x[1]||0)*qty)+x[2]+'</b></div>'}).join('')+'</div><div class="mu" style="font-size:10.5px;margin-top:6px">기준: '+st.ra+' · 1회 '+st.am+'</div></div>'
+nutBlock(nu,qty)
+'<div class="cd"><b style="font-size:13.5px">👩‍🍳 만드는 순서</b><div class="mu" style="font-size:10.5px;margin:2px 0 8px">기본 그림이 표시됩니다. 📷로 직접 찍은 사진으로 바꿀 수 있어요.</div><ul class="sl">'
+r.st.map(function(s,x){var k=r.i+'_'+x,p=ph[k];
return '<li><div class="no">'+(x+1)+'</div><div class="ar2"><div class="bx">'+(p?'<img src="'+p+'">':ART(kOf(s)))+'</div><div class="p2"><button onclick="pickPh(\''+k+'\')">📷 '+(p?'변경':'내 사진')+'</button>'+(p?'<button class="d" onclick="delPh(\''+k+'\')">↺</button>':'')+'</div></div><div class="tx">'+esc(s)+'</div></li>'}).join('')
+'</ul><button class="btn y s" onclick="ytSearch()">▶ 유튜브 조리영상 찾기</button></div>'
+(r.tip?'<div class="tp" style="margin-bottom:9px">💡 <b>TIP</b> '+esc(r.tip)+'</div>':'')
+(r.wn?'<div class="wn" style="margin-bottom:9px">⚠️ <b>주의</b> '+esc(r.wn)+'</div>':'')
+'<div class="sb" style="margin-bottom:11px"><b>📎 참고 출처</b><ul style="margin:6px 0 0;padding-left:16px">'+(r.sr||['ppibbo']).map(function(k){return '<li><a href="'+SRC[k].u+'" target="_blank" rel="noopener">'+SRC[k].n+'</a></li>'}).join('')
+'<li><a href="'+SRC.rda.u+'" target="_blank" rel="noopener">'+SRC.rda.n+'</a> (영양)</li><li><a href="'+SRC.kdri.u+'" target="_blank" rel="noopener">'+SRC.kdri.n+'</a> (권장량)</li></ul><div class="mu" style="font-size:10.5px;margin-top:6px">위 자료의 원칙·방식을 참고해 재구성했으며 원문을 그대로 옮긴 것이 아닙니다.</div></div>'
+'<button class="btn" onclick="qLog(\''+r.i+'\')">📝 오늘 먹은 기록에 추가</button>'
+'<button class="btn g" style="margin-top:8px" onclick="diagMeal(\''+r.i+'\')">🔧 영양 진단 · 개선안 보기</button>'
+'<button class="btn g" style="margin-top:8px" onclick="openEd(\''+r.i+'\')">✏️ 이 레시피 수정</button>'
+(ov[r.i]?'<button class="btn y" style="margin-top:8px" onclick="resetOv(\''+r.i+'\')">↩️ 기본값 복원</button>':'')
+'<button class="btn y" style="margin-top:8px" onclick="closeM()">닫기</button>'}
function ytSearch(){window.open('https://www.youtube.com/results?search_query='+encodeURIComponent(curR.n+' 이유식 만들기'),'_blank')}
function setQ(d){qty=Math.max(1,Math.min(10,qty+d));document.getElementById('mb').innerHTML=rBody()}
