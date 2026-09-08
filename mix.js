/*========== 🧩 조합 탭 · 재고 활용 메뉴 추천 ==========*/
/* CMIX: 조합 실험판에 담은 재료 키 목록 (NUT 키) */
var CMIX=LS('b6.cmix',[]),CMQ='',cmCat='재고';
function cmSave(){localStorage.setItem('b6.cmix',JSON.stringify(CMIX))}
/* 조합 판정용 가짜 레시피 — comboOf/comboSug 를 그대로 재사용한다 */
function cmR(){return {i:'__mix',n:'조합 실험',s:IDS.indexOf(curS().id==='ready'?'early':curS().id),y:'p',sv:1,
g:CMIX.map(function(k){return (typeof stkRow==='function')?stkRow(k):[k,QG[k]||10,qUnit(k),k]})}}
function cmHas(k){return CMIX.indexOf(k)>=0}
function cmToggle(k){var i=CMIX.indexOf(k);
if(i>=0)CMIX.splice(i,1);else{if(CMIX.length>=12)return alert('한 번에 12가지까지 담을 수 있어요.');CMIX.push(k)}
cmSave();render()}
function cmClear(){if(!CMIX.length)return;if(!confirm('담은 재료를 모두 비울까요?'))return;CMIX=[];cmSave();render()}

/*----- 재고에서 쓸 수 있는 재료 (원재료 + 🧊 큐브) -----*/
/* 반환: [{n,key,left,unit,per,g,cg,rg,src}]
   g   = 보유 총 그램(원재료 + 큐브 합산)
   cg  = 큐브 보유 g, rg = 원재료 보유 g
   src = 'cube'(큐브만) / 'raw'(원재료만) / 'both' */
function stkAvail(){var M={},out=[];
/* ① 원재료 */
if(typeof STK!=='undefined')STK.filter(function(s){return s.left>0}).forEach(function(s){
var k=(s.key&&NUT[s.key])?s.key:(s.key||s.n),rg=(typeof u2g==='function')?u2g(s,Math.max(0,s.left)):Math.max(0,s.left);
var o=M[k]||(M[k]={n:s.n,key:s.key||'',left:s.left,unit:s.unit,per:(+s.per||1),rg:0,cg:0,cq:0,id:s.id});
o.rg+=rg});
/* ② 🧊 큐브 — 원재료가 없어도 재고로 인정한다 (기존 버그: 큐브를 아예 안 봤음) */
if(typeof cubes!=='undefined')cubes.filter(function(c){return c.q>0}).forEach(function(c){
var k=(c.key&&NUT[c.key])?c.key:(c.key||c.n);
var o=M[k]||(M[k]={n:c.n,key:(c.key&&NUT[c.key])?c.key:'',left:0,unit:'개',per:(+c.g||10),rg:0,cg:0,cq:0,id:''});
o.cg+=(+c.q||0)*(+c.g||0);o.cq+=(+c.q||0);
if(!o.left){o.left=o.cq;o.unit='큐브';o.per=(+c.g||10)}});
for(var k in M){var o=M[k];o.key=o.key||(NUT[k]?k:'');o.g=o.rg+o.cg;
o.src=o.cg>0&&o.rg>0?'both':(o.cg>0?'cube':'raw');
if(o.g>0)out.push(o)}
return out}
/* 영양 연동되는(NUT 에 있는) 재고만 */
function stkAvailNut(){return stkAvail().filter(function(x){return x.key&&NUT[x.key]})}
/* 재고 표시용 남은 양 문구 — 큐브/원재료를 나눠 보여준다 */
function stkAvailTxt(x){var a=[];
if(x.cg>0)a.push('🧊 '+rnd2(x.cq)+'개');
if(x.rg>0)a.push('🥩 '+rnd(x.rg)+'g');
return a.join(' · ')}

/*----- 재고 기반 조합 추천 -----*/
/* 보유 재고 중에서 조합점수 + 영양점수가 높은 4~5가지 세트를 만든다 */
function stkCombo(seed){var A=stkAvailNut();if(A.length<2)return null;
/* 🧊 큐브 보유분을 먼저 쓴다 — 같은 조건이면 큐브가 우선 선택되게 정렬 */
A=A.slice().sort(function(a,b){return (b.cg>0?1:0)-(a.cg>0?1:0)});
var keys=A.map(function(x){return x.key});
/* 곡류 1 + 단백 1 + 채소 1~2 + 비타민C 1 순으로 뼈대를 잡는다 */
function pick(gn,ex){var G=CGRP[gn]||[];
var c=keys.filter(function(k){return G.indexOf(k)>=0&&ex.indexOf(k)<0});
if(!c.length)return null;
return c[(seed||0)%c.length]}
var out=[],s=seed||0;
var gr=pick('grain',out);if(gr)out.push(gr);
var pr=pick('hem',out)||pick('prot',out);if(pr)out.push(pr);
var vc=pick('vc',out);if(vc)out.push(vc);
var ca=pick('caro',out);if(ca&&out.length<5)out.push(ca);
/* 부족하면 남은 재고에서 채운다 — 조합점수가 떨어지는 것은 제외 */
keys.forEach(function(k){if(out.length>=5||out.indexOf(k)>=0)return;
var t=out.concat([k]);
var c=comboOf({g:t.map(function(x){return [x,QG[x]||10,qUnit(x),x]})});
if(c.sc>=70)out.push(k)});
if(out.length<2)return null;
return out}
function cmFromStock(){var o=stkCombo(Math.floor(Math.random()*7));
if(!o)return alert('영양 연동되는 재고가 2가지 이상 필요해요.\n\n재고 탭에서 원재료나 🧊 큐브를 등록해 주세요.');
CMIX=o;cmSave();render()}

/*----- 재고 활용 패널 (조합 탭·편집 화면 공용) -----*/
/* mode: 'mix'(조합 탭에 담기) / 'edit'(편집 중 레시피에 추가)
   🧊 큐브 보유분을 먼저 보여주고, 큐브가 없는 원재료는 큐브화 안내를 함께 띄운다 */
function stkPanel(mode){var A=stkAvail();
if(!A.length)return '<div class="cd" style="background:#FFF6EC;font-size:12px"><b>📦 보유 재고가 없어요</b><div class="mu" style="font-size:11px;margin-top:4px">재고 탭에서 <b>원재료</b>나 <b>🧊 큐브</b>를 등록하면 <b>가지고 있는 것으로 만들 수 있는 조합</b>을 추천해 드립니다.</div>'
+'<button class="btn g s" style="margin-top:8px" onclick="closeM();tab=\'stock\';sTab=\'add\';render()">📦 재고 등록하러 가기</button></div>';
var N=A.filter(function(x){return x.key&&NUT[x.key]}),X=A.filter(function(x){return !(x.key&&NUT[x.key])});
var CB=N.filter(function(x){return x.cg>0}),RW=N.filter(function(x){return !(x.cg>0)});
var fn=mode==='edit'?'edAddStk':'cmToggle';
function chip(x){var on=(mode!=='edit'&&cmHas(x.key)),ic=x.cg>0?'🧊 ':'🥩 ';
return '<button class="'+(on?'on':'')+'" style="'+(on?'':(x.cg>0?'background:#E3F0FB;color:#2E86C1':'background:#DFF4EC;color:#1F7A5F'))+'" onclick="'+fn+'(\''+x.key+'\')">'+(on?'✓ ':'＋ ')+ic+esc(x.n)+'<span class="mu" style="font-weight:600"> · '+stkAvailTxt(x)+'</span></button>'}
return '<div class="cd" style="background:#F3FAF7"><div class="rw" style="justify-content:space-between;align-items:center"><b style="font-size:13px">📦 지금 가지고 있는 재료</b><span class="mu" style="font-size:10.5px">🧊 '+CB.length+'종 · 🥩 '+RW.length+'종</span></div>'
+'<div class="mu" style="font-size:10.5px;margin:3px 0 8px">눌러서 '+(mode==='edit'?'레시피에 추가':'조합에 담기')+'. 🧊는 큐브 보유, 🥩는 원재료만 보유입니다.</div>'
+(CB.length?'<div class="mu" style="font-size:10.5px;font-weight:700;margin-bottom:3px">🧊 큐브로 바로 쓸 수 있어요</div><div class="ch">'+CB.map(chip).join('')+'</div>':'')
+(RW.length?'<div class="mu" style="font-size:10.5px;font-weight:700;margin:8px 0 3px">🥩 원재료만 있어요 — 큐브화하거나 바로 손질해 조리</div><div class="ch">'+RW.map(chip).join('')+'</div>'
+'<div class="mu" style="font-size:10px;margin-top:5px">위 재료는 큐브 재고가 없습니다. <b>큐브화</b>해 두면 다음 끼니부터 바로 쓸 수 있고, 이번 한 번이면 <b>그대로 손질해 함께 조리</b>해도 됩니다.'
+'<button class="btn g s" style="margin-top:5px" onclick="closeM();tab=\'stock\';sTab=\'list\';render()">🧊 재고 탭에서 큐브화하기</button></div>':'')
+(!N.length?'<div class="mu" style="font-size:11px">영양 연동되는 재고가 없어요.</div>':'')
+(X.length?'<div class="mu" style="font-size:10px;margin-top:7px">※ 영양 미연동(직접 입력한 재료): '+X.map(function(x){return esc(x.n)}).join(', ')+'</div>':'')
+(N.length>=2?'<button class="btn g s" style="margin-top:9px" onclick="'+(mode==='edit'?'edFromStock()':'cmFromStock()')+'">🎲 보유 재고로 조합 추천</button>':'')+'</div>'}

/*========== 조합 탭 화면 ==========*/
function vCombo(){var R=cmR(),C=comboOf(R),S=comboSug(R).sug,nu=nutOf(R),T=TG();
var cats=['재고','전체','곡류','육류','어패류','채소','과일','콩·유제품','기타'];
return '<div class="cd"><b style="font-size:14px">🧩 재료 조합 실험실</b>'
+'<div class="mu" style="font-size:11px;margin:4px 0 0;line-height:1.6">먹이려는 재료를 담으면 <b>궁합 점수</b>와 함께 무엇이 문제이고 무엇이 좋은지 알려 드립니다. 레시피를 만들기 전에 미리 확인해 보세요.</div></div>'
/* --- 담은 재료 --- */
+'<div class="cd"><div class="rw" style="justify-content:space-between;align-items:center"><b style="font-size:13px">🥕 담은 재료 '+CMIX.length+'개</b>'
+(CMIX.length?'<button class="mu" style="color:var(--rd);font-weight:700;font-size:11px" onclick="cmClear()">전체 비우기</button>':'')+'</div>'
+(CMIX.length?'<div class="ch" style="margin-top:8px">'+CMIX.map(function(k){var f=FD.filter(function(x){return x[4]===k})[0];
return '<button class="on" onclick="cmToggle(\''+k+'\')">'+(f?f[1]+' ':'')+esc(k)+' ✕</button>'}).join('')+'</div>'
:'<div class="mu" style="font-size:11.5px;margin-top:8px">아래에서 재료를 눌러 담아 주세요. 2가지 이상 담으면 조합을 판정합니다.</div>')+'</div>'
/* --- 점수 --- */
+(CMIX.length>=2?cmScore(C,S,nu,T,R):'')
/* --- 재고 패널 --- */
+stkPanel('mix')
/* --- 재료 고르기 --- */
+'<div class="st">🔎 재료 고르기</div>'
+'<div class="cd" style="padding:9px"><input id="cmq" value="'+esc(CMQ)+'" oninput="cmSearch()" placeholder="🔎 재료명 검색 (예: 소고기, 브로콜리)" style="width:100%;padding:10px;border:1.5px solid var(--ln);border-radius:11px;outline:none"></div>'
+'<div class="tab">'+cats.map(function(c){return '<button class="'+(c===cmCat?'on':'')+'" onclick="cmCat=\''+c+'\';render()">'+(c==='재고'?'📦 '+c:c)+'</button>'}).join('')+'</div>'
+'<div id="cmg">'+cmGrid()+'</div>'
+'<p class="mu" style="text-align:center;font-size:10.5px;margin:14px 6px 0">조합 판정은 일반적인 소화·흡수 원리에 근거한 참고 정보이며 금지 조합이 아닙니다. 아기 반응이 우선입니다.</p>'}

/*----- 점수 카드 -----*/
/* R = cmR() 로 만든 판정용 레시피 객체. 예전에는 이 인자가 없어 전역 R 을 참조해
   ReferenceError 가 났고, 재료를 2개 담는 순간 조합 탭 전체가 렌더되지 않았다. */
function cmScore(C,S,nu,T,R){var m=ageM();
if(!R)R=cmR();
var h='<div class="cd"><div class="rw" style="justify-content:space-between;align-items:center;margin-bottom:6px"><b style="font-size:14px">🧩 조합 판정</b><span class="badge '+cLv(C.sc)+'" style="font-size:13px;padding:6px 12px">'+cIco(C.sc)+' '+cTxt(C.sc)+' '+C.sc+'점</span></div>'
+'<div class="bar" style="height:20px"><i class="solid" style="width:'+C.sc+'%;background:'+cCol(C.sc)+'"></i><span class="goal" style="left:calc(85% - 3px)"></span></div>'
+'<div class="mu" style="font-size:10px;margin-top:4px">100점에서 주의마다 차감(심각 −22 · 주의 −11), 좋은 조합마다 +5(최대 +15) · 85점 이상이 권장 구간</div>';
/* 경고 */
if(C.bad.length)h+='<div class="hr"></div><b style="font-size:12.5px;color:var(--rd)">⚠️ 이런 문제가 있어요 ('+C.bad.length+'건)</b>'
+C.bad.map(function(b){return '<div class="alert '+(b.R.lv===2?'bad':'mid')+'" style="margin-top:8px"><span class="ic">'+(b.R.lv===2?'🚨':'⚠️')+'</span><div><b>'+b.R.t+'</b><div style="margin:4px 0 5px">'+cTag(b.it)+'</div>'+b.R.r
+'<div class="mu" style="margin-top:6px;font-size:11.5px">💡 <b>이렇게 해보세요</b> — '+b.R.fix+'</div>'
+'<div class="ch" style="margin-top:7px">'+b.it.map(function(k){return '<button style="background:#FFF1CC;color:#8A5D00" onclick="cmToggle(\''+k+'\')">✕ '+k+' 빼기</button>'}).join('')+'</div>'
+(b.R.id==='nitr'&&m<6?'<div class="mu" style="margin-top:5px;font-size:11px;color:var(--rd)"><b>만 6개월 미만</b>이라 특히 주의가 필요합니다.</div>':'')+'</div></div>'}).join('');
else h+='<div class="alert ok" style="margin-top:9px"><span class="ic">✅</span><div>충돌하는 조합이 <b>없습니다.</b> 이대로 먹여도 좋아요.</div></div>';
/* 칭찬 */
var BN=comboBen(R),BS=comboBenSug(R);
if(BN.length)h+='<div class="hr"></div><b style="font-size:12.5px">💛 이 조합은 이런 점이 좋아요</b><div class="benw" style="margin-top:6px">'
+BN.map(function(b){return '<div class="ben"><b>'+b.ico+' '+b.t+'</b><p>'+b.r+'</p></div>'}).join('')+'</div>';
if(BS.length)h+='<div class="hr"></div><b style="font-size:12.5px">✨ 이 재료를 더하면 좋아져요</b>'
+'<div class="mu" style="font-size:10.5px;margin:3px 0 7px">누르면 조합에 담깁니다.</div>'
+BS.map(function(x){return '<div class="bsug" onclick="cmToggle(\''+x.n+'\')"><i>'+x.ico+'</i><div><b>＋ '+x.n+'</b><span>를 추가하면 <b>'+x.t.replace('에 좋아요','')+'에 좋아요</b></span>'
+(x.alt.length?'<em>또는 '+x.alt.join(' · ')+'</em>':'')+'</div><u>＋</u></div>'}).join('');
if(C.good.length)h+='<div class="hr"></div><b style="font-size:12.5px;color:var(--ok)">👍 이런 점이 좋아요 ('+C.good.length+'건)</b>'
+C.good.map(function(g){return '<div class="alert ok" style="margin-top:8px"><span class="ic">✅</span><div><b>'+g.R.t+'</b><div style="margin:4px 0 5px">'+cTag(g.it)+'</div>'+g.R.r+'</div></div>'}).join('');
/* 추천 */
if(S.length)h+='<div class="hr"></div><b style="font-size:12.5px">＋ 더하면 좋은 재료</b><div class="ch" style="margin-top:6px">'
+S.map(function(x){return '<button style="background:#E7F1FB;color:#3A6FA8" onclick="cmToggle(\''+x.n+'\')">＋ '+x.n+'<span class="mu" style="font-weight:600"> · '+x.w+'</span></button>'}).join('')+'</div>';
/* 영양 참고 */
h+='<div class="hr"></div><b style="font-size:12.5px">🍀 참고 · 이 재료들의 영양</b><div class="mu" style="font-size:10px;margin:2px 0 6px">각 재료를 표준량('+CMIX.map(function(k){return k+' '+(QG[k]||10)+qUnit(k)}).slice(0,3).join(', ')+(CMIX.length>3?' …':'')+')으로 담았을 때</div>'
+'<div class="g4">'+NK.map(function(k){var pc=Math.round(nu.t[k]/Math.max(.01,T.meal[k])*100);
return '<div style="text-align:center;background:#FBF6F2;border-radius:9px;padding:7px 2px"><div class="mu" style="font-size:9.5px">'+NL[k][0]+'</div><b style="color:'+lvCol(pc)+';font-size:14px">'+pc+'%</b></div>'}).join('')+'</div>';
/* 재고 상태 — 담은 재료를 큐브/원재료 기준으로 판정하고 큐브화 안내 */
if(typeof stkHowto==='function'){var hw=stkHowto(cmR());
if(hw)h+='<div class="hr"></div><b style="font-size:12.5px">📦 지금 재고로 만들 수 있나요?</b><div style="margin-top:6px">'+hw+'</div>'}
return h+'<button class="btn" style="margin-top:11px" onclick="cmToEdit()">✏️ 이 조합으로 메뉴 만들기</button>'
+'<div class="mu" style="font-size:10.5px;margin-top:6px;text-align:center">담은 재료가 그대로 들어간 새 메뉴 만들기 화면이 열립니다.</div></div>'}

/*----- 재료 그리드 (검색·분류) -----*/
function cmGrid(){var q=(CMQ||'').trim().toLowerCase(),L;
if(q){L=FD.filter(function(f){return f[4]&&NUT[f[4]]&&fdMatch(f,q)})}
else if(cmCat==='재고'){var av=stkAvailNut().map(function(x){return x.key});
L=FD.filter(function(f){return av.indexOf(f[4])>=0})}
else L=FD.filter(function(f){return f[4]&&NUT[f[4]]&&(cmCat==='전체'||f[2]===cmCat)});
L=L.sort(function(a,b){return a[3]-b[3]});
if(!L.length)return '<div class="cd mu">'+(cmCat==='재고'?'영양 연동되는 재고가 없어요. 재고 탭에서 원재료나 🧊 큐브를 등록해 주세요.':'해당하는 재료가 없어요.')+'</div>';
var m=ageM();
/* 재고 보유 표시 — 🧊 큐브 있음 / 🥩 원재료만 있음 */
var SA={};stkAvailNut().forEach(function(x){SA[x.key]=x});
return '<div class="g4">'+L.map(function(f){var on=cmHas(f[4]),lk=m<f[3],av=SA[f[4]];
var mk=av?(av.cg>0?'<div class="m" style="color:#2E86C1;font-weight:700">🧊 큐브 '+rnd2(av.cq)+'개</div>':'<div class="m" style="color:#1F7A5F;font-weight:700">🥩 원재료 '+rnd(av.rg)+'g</div>'):'';
return '<button class="ig '+(lk?'lk':'')+'" style="'+(on?'border-color:var(--pc);background:#FFEDE4':(av?'border-color:#BFE3F5':''))+'" onclick="cmToggle(\''+f[4]+'\')"><div class="e">'+f[1]+'</div><div class="n">'+f[0]+'</div><div class="m">'+f[3]+'개월+</div>'+mk+(on?'<div class="ok">✓ 담음</div>':'')+'</button>'}).join('')+'</div>'}
/* 입력창을 재생성하지 않는다 — 한글 조합 유지 */
function cmSearch(){var e=document.getElementById('cmq');if(e)CMQ=e.value;
var g=document.getElementById('cmg');if(g)g.innerHTML=cmGrid()}

/*----- 조합 → 새 메뉴 만들기 -----*/
function cmToEdit(){if(CMIX.length<2)return alert('재료를 2가지 이상 담아 주세요');
openEd(null,CMIX.slice())}

/*========== 재고 규격(1단위당 g) ↔ 레시피 연동 ==========*/
/* 레시피 재료 행 = [표시명, 수량, 단위, 영양키, (개당 g)]
   재고가 개수 단위(개·팩·봉…)로 등록돼 있으면 그 1단위당 g 을 5번째 칸에 실어
   gOf() 가 정확한 그램으로 환산하게 한다. 재고 규격을 고치면 레시피도 따라 바뀐다. */
function stkByKey(k){if(typeof STK==='undefined'||!k)return null;
var hit=null;STK.forEach(function(s){if(s.key===k&&!hit)hit=s});return hit}
/* 그 재료를 재고 규격 기준으로 담을 때의 행 하나 */
function stkRow(k){var s=stkByKey(k),q=QG[k]||10,u=qUnit(k);
if(s&&isCnt(s.unit)){var per=stkPer(s);
/* 권장량(g)에 가장 가까운 개수 — 0.5 단위로 끊는다. 최소 0.5 */
var n=Math.max(.5,Math.round(q/per*2)/2);
return [k,n,'개',k,per]}
return [k,q,u,k]}
/* 재고 규격이 바뀌었을 때 저장된 모든 레시피의 개당 g 을 갱신한다.
   반환: 바뀐 행 수 */
function perSync(){if(typeof STK==='undefined')return 0;
var n=0;
function fix(g){(g||[]).forEach(function(x){
if(x[2]!=='개'||!x[3])return;
var s=stkByKey(x[3]);if(!s||!isCnt(s.unit))return;
var per=stkPer(s);
if(+x[4]!==per){x[4]=per;n++}})}
(typeof myR!=='undefined'?myR:[]).forEach(function(r){fix(r.g)});
if(typeof ov!=='undefined')for(var k in ov)fix(ov[k].g);
if(typeof ME!=='undefined'&&ME&&ME.g)fix(ME.g);
if(n)save();
return n}
/* 편집 중인 행에 재고 규격을 즉시 물린다 */
function edPerFix(){if(typeof ME==='undefined'||!ME||!ME.g)return;
ME.g.forEach(function(x){if(x[2]==='개'&&x[3]){var s=stkByKey(x[3]);
if(s&&isCnt(s.unit))x[4]=stkPer(s)}})}

/*========== 편집 화면 · 재고 활용 ==========*/
/* 재고에서 눌러 담을 때는 재고에 등록한 규격(1개당 g)을 그대로 쓴다 */
function edAddStk(k){var s=stkByKey(k);
if(!(s&&isCnt(s.unit)))return edAdd(k);
var per=stkPer(s),hit=-1;
ME.g.forEach(function(x,i){if(x[3]===k)hit=i});
var step=Math.max(.5,Math.round((QG[k]||10)/per*2)/2);
if(hit>=0){var r=ME.g[hit];
if(r[2]==='개'){r[1]=Math.round((+r[1]+step)*10)/10;r[4]=per}
else{r[1]=Math.round((+r[1]+(QG[k]||10))*10)/10}}
else ME.g.push([k,step,'개',k,per]);
drawEd()}
function edFromStock(){var o=stkCombo(Math.floor(Math.random()*7));
if(!o)return alert('영양 연동되는 재고가 2가지 이상 필요해요.');
if((ME.g||[]).length&&!confirm('지금 재료를 지우고 보유 재고 조합으로 바꿀까요?'))return;
ME.g=o.map(function(k){return stkRow(k)});
if(!ME.n)ME.n=o.slice(0,2).join(' ')+(ME.y==='t'?' 토핑':'죽');
drawEd()}

/*========== 저장 전 조합 검증 ==========*/
/* saveEd 에서 호출 — 문제가 있으면 확인 모달을 띄우고 false 를 돌려준다 */
function edComboGate(){var C=comboOf(ME);
if(!C.bad.length)return true;
var sev=C.bad.filter(function(b){return b.R.lv===2}).length;
document.getElementById('mb').innerHTML='<div class="mt2">'+cIco(C.sc)+' 저장 전 확인</div>'
+'<div class="alert '+(sev?'bad':'mid')+'" style="margin-top:10px"><span class="ic">'+(sev?'🚨':'⚠️')+'</span><div><b>「'+esc(ME.n)+'」의 재료 조합에 주의할 점이 '+C.bad.length+'건 있습니다</b><br>조합 점수 <b>'+C.sc+'점</b> ('+cTxt(C.sc)+')<br>그대로 저장해도 되지만, 아래 내용을 한 번 확인해 주세요.</div></div>'
+C.bad.map(function(b){return '<div class="cd" style="border-left:4px solid '+(b.R.lv===2?'var(--rd)':'var(--warn)')+'"><b style="font-size:13px">'+(b.R.lv===2?'🚨':'⚠️')+' '+b.R.t+'</b><div style="margin:5px 0">'+cTag(b.it)+'</div>'
+'<p class="mu" style="margin:0;font-size:11.5px">'+b.R.r+'</p>'
+'<div class="tp" style="margin-top:7px">💡 <b>대안</b> — '+b.R.fix+'</div>'
+'<div class="ch" style="margin-top:8px">'+b.it.map(function(k){return '<button style="background:#FFF1CC;color:#8A5D00" onclick="closeM();openEdBack();edDel(\''+k+'\')">✕ '+k+' 빼기</button>'}).join('')+'</div></div>'}).join('')
+(function(){var B=comboBen(ME);
return B.length?'<div class="cd"><b style="font-size:12.5px">💛 이 메뉴의 좋은 점</b><div class="benw" style="margin-top:6px">'+B.map(function(b){return '<div class="ben"><b>'+b.ico+' '+b.t+'</b><p>'+b.r+'</p></div>'}).join('')+'</div></div>':''})()
+(C.good.length?'<div class="cd" style="background:#F3FAF7"><b style="font-size:12.5px;color:var(--ok)">👍 좋은 점도 있어요</b>'+C.good.map(function(g){return '<div style="margin-top:6px"><b style="font-size:12px">'+g.R.t+'</b><p class="mu" style="margin:2px 0 0;font-size:11.5px">'+g.R.r+'</p></div>'}).join('')+'</div>':'')
+(function(){var S=comboSug(ME).sug;
return S.length?'<div class="cd"><b style="font-size:12.5px">＋ 이 재료를 더하면 좋아집니다</b><div class="ch" style="margin-top:6px">'+S.map(function(x){return '<button style="background:#DFF4EC;color:#1F7A5F" onclick="closeM();openEdBack();edAdd(\''+x.n+'\')">＋ '+x.n+' '+(QG[x.n]||10)+qUnit(x.n)+'<span class="mu" style="font-weight:600"> · '+x.w+'</span></button>'}).join('')+'</div></div>':''})()
+'<button class="btn" onclick="edSaveForce()">그래도 이대로 저장</button>'
+'<button class="btn g" style="margin-top:8px" onclick="closeM();openEdBack()">✏️ 재료 수정하러 돌아가기</button>';
document.getElementById('md').classList.add('on');document.body.style.overflow='hidden';
return false}
/* 검증 모달에서 편집 화면으로 복귀 — ME 는 그대로 살아 있다 */
function openEdBack(){drawEd();document.getElementById('md').classList.add('on');document.body.style.overflow='hidden'}
function edSaveForce(){EDGATE=1;saveEd()}
var EDGATE=0;
