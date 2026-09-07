/*========== 재료 조합 규칙 ==========*/
/* 재료군 — 키는 NUT 의 키와 정확히 일치해야 한다 */
var CGRP={
hem:['소고기','닭고기','돼지고기','흰살생선','연어','새우'],
nonhem:['시금치','오트밀','두부','달걀노른자','아몬드가루','김','미역'],
vc:['파프리카','브로콜리','토마토','딸기','양배추','청경채','비타민(다채)'],
cal:['우유','요거트','아기치즈','멸치가루','두부'],
calOnly:['우유','요거트','아기치즈','멸치가루'],
gas:['브로콜리','양배추','콩나물','양파','고구마','두부','사과','배'],
cruci:['브로콜리','양배추','무','콩나물'],
nitr:['시금치','무','당근','가지','비타민(다채)','양배추'],
alg:['달걀','달걀노른자','흰살생선','연어','새우','우유','아기치즈','요거트','아몬드가루','두부','토마토','딸기','김'],
oxal:['시금치','아몬드가루'],
loose:['배','사과','블루베리'],
consti:['바나나','아기치즈','우유','밥','진밥','감자'],
fiber:['미역','김','브로콜리','양배추','콩나물','표고버섯','가지','오트밀'],
iod:['미역','김'],
fat:['참기름','아보카도','아기치즈','연어','아몬드가루'],
caro:['당근','단호박','시금치','브로콜리','파프리카','청경채','토마토'],
vd:['표고버섯','달걀노른자','연어'],
grain:['불린 쌀','쌀','오트밀','밥','진밥','10배죽','7배죽','5배죽','소면','전분'],
prot:['두부','소고기','달걀노른자','닭고기','흰살생선'],
prebio:['바나나','사과','고구마','양파','미역']};

/* 주의 조합 — ty: pair(두 군이 함께) / grp(한 군에서 min개 이상) / new(미확인 알레르겐) */
var CBAD=[
{id:'alg',ty:'new',a:'alg',min:2,lv:2,t:'새 알레르기 재료가 한꺼번에',
r:'아직 안전 확인이 안 된 알레르기 주의 재료가 <b>2가지 이상</b> 함께 들어 있습니다. 반응이 나타나도 <b>무엇이 원인인지 특정할 수 없습니다</b>.',
fix:'새 재료는 <b>한 번에 하나씩</b>, 오전에 소량으로 시작해 3일간 관찰하세요. 나머지는 다음 끼니로 미루면 됩니다.'},
{id:'nitr',ty:'grp',a:'nitr',min:3,lv:2,t:'질산염 많은 채소가 겹침',
r:'시금치·무·당근·가지·양배추는 <b>질산염</b>이 비교적 많은 채소입니다. 여러 종을 한 끼에 몰아 담으면 어린 아기에게 부담이 될 수 있습니다.',
fix:'한 끼에 <b>1~2종까지</b>만 쓰고, 만든 이유식은 냉장 24시간·냉동 2주 안에 소진하세요. 데친 물은 버립니다.'},
{id:'feca',ty:'pair',a:'nonhem',b:'calOnly',lv:1,t:'철분 × 칼슘이 서로를 방해',
r:'<b>칼슘이 비헴철의 흡수를 방해</b>합니다. 우유·치즈·요거트·멸치가루를 철분 재료와 같은 끼니에 담으면 철분 흡수율이 떨어집니다.',
fix:'유제품은 <b>다른 끼니나 간식</b>으로 옮기고, 이 끼니에는 <b>파프리카·브로콜리·토마토</b> 같은 비타민C 채소를 곁들이세요.'},
{id:'oxal',ty:'pair',a:'oxal',b:'cal',lv:1,t:'옥살산 × 칼슘',
r:'시금치·아몬드가루의 <b>옥살산</b>이 칼슘과 결합해 <b>둘 다 흡수가 떨어집니다</b>.',
fix:'시금치는 <b>끓는 물에 데쳐</b> 옥살산을 줄이고, 칼슘 재료는 다른 끼니로 나누세요.'},
{id:'gas',ty:'grp',a:'gas',min:3,lv:1,t:'가스가 잘 차는 재료가 겹침',
r:'브로콜리·양배추·콩나물·양파·고구마·두부·사과·배는 장에서 <b>발효되며 가스를 만듭니다</b>. 세 가지 이상 겹치면 배가 부글거리고 보챌 수 있습니다.',
fix:'한 끼에 <b>2종 이하</b>로 줄이고, 충분히 익혀 부드럽게 만드세요. 저녁 끼니에는 특히 양을 줄입니다.'},
{id:'fiber',ty:'grp',a:'fiber',min:3,lv:1,t:'섬유질이 너무 많음',
r:'미역·김·브로콜리·양배추·표고버섯·오트밀이 겹쳐 <b>식이섬유가 과다</b>합니다. 포만감이 커서 정작 필요한 단백질·철분을 덜 먹게 되고, 미네랄 흡수도 방해합니다.',
fix:'섬유질 재료는 <b>2종 이하</b>로 두고, 대신 <b>고기·달걀노른자</b>처럼 밀도 높은 재료를 넣으세요.'},
{id:'iod',ty:'pair',a:'iod',b:'iod',lv:1,t:'요오드 과다',
r:'미역과 김을 함께 쓰면 <b>요오드가 과잉</b>이 되기 쉽습니다. 아기는 성인보다 허용 폭이 좁습니다.',
fix:'해조류는 <b>한 끼에 한 종류</b>, 주 2~3회로 제한하세요.'},
{id:'loose',ty:'grp',a:'loose',min:2,lv:1,t:'묽은 변이 될 수 있음',
r:'배·사과·블루베리에 든 <b>과당과 솔비톨</b>이 겹치면 변이 묽어지거나 배가 아플 수 있습니다.',
fix:'과일은 <b>한 종류만</b> 소량 쓰고, 갈아 즙으로 만들지 말고 과육째 으깨 주세요.'},
{id:'consti',ty:'grp',a:'consti',min:3,lv:1,t:'변비가 올 수 있는 조합',
r:'바나나·치즈·우유·흰밥·감자가 겹쳐 <b>변이 단단해지기 쉽습니다</b>.',
fix:'<b>고구마·배·자두·양배추</b>처럼 섬유질 있는 재료를 하나 더하고, 수분을 충분히 주세요.'}];

/* 좋은 조합 */
var CGOOD=[
{id:'hemvc',a:'hem',b:'vc',t:'헴철 + 비타민C',r:'고기·생선의 <b>헴철</b>에 비타민C 채소가 더해져 흡수율이 <b>2~3배</b> 올라갑니다. 철분 조합의 정석입니다.'},
{id:'nhvc',a:'nonhem',b:'vc',t:'비헴철 + 비타민C',r:'시금치·두부·오트밀의 <b>비헴철</b>은 그냥 먹으면 5%만 흡수되지만, 비타민C와 함께면 <b>3배까지</b> 올라갑니다.'},
{id:'carofat',a:'caro',b:'fat',t:'베타카로틴 + 지방',r:'당근·단호박·시금치의 <b>베타카로틴(비타민A)</b>은 기름과 함께여야 흡수됩니다. 참기름 몇 방울·아보카도가 그 역할을 합니다.'},
{id:'calvd',a:'cal',b:'vd',t:'칼슘 + 비타민D',r:'표고버섯·달걀노른자·연어의 <b>비타민D</b>가 칼슘 흡수를 돕습니다.'},
{id:'bio',a:'prebio',b:'cal',t:'유산균 + 식이섬유',r:'요거트의 유산균과 바나나·사과·고구마의 <b>프리바이오틱스</b>가 만나 장 환경이 좋아집니다.'},
{id:'amino',a:'grain',b:'prot',t:'곡류 + 단백질',r:'쌀에 부족한 아미노산을 <b>고기·두부·달걀노른자</b>가 채워 단백질의 질이 올라갑니다.'},
{id:'crucii',a:'cruci',b:'iod',t:'십자화과 + 해조류',r:'브로콜리·양배추가 요오드 흡수를 살짝 방해하는데, <b>미역·김의 요오드</b>가 이를 상쇄합니다.'}];

/*========== 판정 ==========*/
function ckeys(r){var s=[];((r&&r.g)||[]).forEach(function(x){if(x[3]&&s.indexOf(x[3])<0)s.push(x[3])});return s}
function cIn(keys,gn){var G=CGRP[gn]||[],o=[];keys.forEach(function(k){if(G.indexOf(k)>=0)o.push(k)});return o}
function cNew(keys,gn){return cIn(keys,gn).filter(function(k){var t=tried[typeof fdName==='function'?fdName(k):k];return t!=='ok'})}
function comboOf(r){var keys=ckeys(r),bad=[],good=[];
CBAD.forEach(function(R){var hit=[];
if(R.ty==='grp')hit=cIn(keys,R.a);
else if(R.ty==='new')hit=cNew(keys,R.a);
else{var A=cIn(keys,R.a),B=cIn(keys,R.b);
if(!A.length||!B.length)return;
hit=A.slice();B.forEach(function(k){if(hit.indexOf(k)<0)hit.push(k)});
if(hit.length<2)return}
if((R.ty==='pair'&&hit.length>=2)||(R.ty!=='pair'&&hit.length>=(R.min||2)))bad.push({R:R,it:hit})});
CGOOD.forEach(function(R){var A=cIn(keys,R.a),B=cIn(keys,R.b);
if(!A.length||!B.length)return;
var it=A.slice();B.forEach(function(k){if(it.indexOf(k)<0)it.push(k)});
if(it.length>=2)good.push({R:R,it:it})});
var pen=0;bad.forEach(function(b){pen+=b.R.lv===2?22:11});
var bon=Math.min(15,good.length*5);
var sc=Math.max(0,Math.min(100,100-pen+bon));
return {sc:sc,bad:bad,good:good,keys:keys}}
function cLv(sc){return sc>=85?'ok':sc>=65?'mid':'bad'}
function cIco(sc){return sc>=85?'✅':sc>=65?'⚠️':'🚨'}
function cTxt(sc){return sc>=85?'좋은 조합':sc>=65?'주의 있음':'조합 재검토'}
function cCol(sc){return sc>=85?'var(--ok)':sc>=65?'var(--warn)':'var(--rd)'}
function cTag(it){return it.map(function(k){return '<span class="tg">'+esc(k)+'</span>'}).join('')}

/*========== 추천 재료 (지금 조합에 더하면 좋은 것) ==========*/
function comboSug(r){var keys=ckeys(r),C=comboOf(r),out=[];
function add(fn,why){if(keys.indexOf(fn)>=0)return;
if(out.filter(function(o){return o.n===fn}).length)return;
out.push({n:fn,w:why})}
var hasVC=cIn(keys,'vc').length,hasFe=cIn(keys,'hem').length+cIn(keys,'nonhem').length;
if(hasFe&&!hasVC){['파프리카','브로콜리','토마토'].forEach(function(x){add(x,'철분 흡수 2~3배')})}
if(!cIn(keys,'hem').length&&cIn(keys,'nonhem').length)add('소고기','흡수 잘 되는 헴철 보강');
if(cIn(keys,'caro').length&&!cIn(keys,'fat').length)add('참기름','비타민A 흡수를 도움');
if(cIn(keys,'cal').length&&!cIn(keys,'vd').length)add('표고버섯','칼슘 흡수를 도움');
if(cIn(keys,'grain').length&&!cIn(keys,'prot').length)add('두부','곡류의 아미노산을 보완');
if(cIn(keys,'consti').length>=2)add('고구마','변을 부드럽게');
return {sug:out.slice(0,4),c:C}}

/*========== 레시피 상세 · 조합 카드 ==========*/
function comboBlock(r){var C=comboOf(r),S=comboSug(r).sug,m=ageM();
var h='<div class="cd"><div class="rw" style="justify-content:space-between;align-items:center;margin-bottom:4px"><b style="font-size:14px">🧩 재료 조합 분석</b><span class="badge '+cLv(C.sc)+'" style="font-size:12px;padding:5px 10px">'+cIco(C.sc)+' '+cTxt(C.sc)+' '+C.sc+'점</span></div>'
+'<div class="mu" style="font-size:10.5px;margin-bottom:9px">영양소 양이 아니라 <b>재료끼리의 궁합</b>(흡수 방해·가스·알레르기 겹침)을 봅니다. 100점에서 주의 항목마다 차감, 좋은 조합마다 가산.</div>';
if(!C.bad.length&&!C.good.length)h+='<div class="alert ok"><span class="ic">✅</span><div>재료 수가 적어 <b>충돌할 조합이 없습니다.</b> 무난하게 먹일 수 있어요.</div></div>';
if(C.bad.length)h+=C.bad.map(function(b){return '<div class="alert '+(b.R.lv===2?'bad':'mid')+'" style="margin-bottom:8px"><span class="ic">'+(b.R.lv===2?'🚨':'⚠️')+'</span><div><b>'+b.R.t+'</b><div style="margin:4px 0 5px">'+cTag(b.it)+'</div>'+b.R.r+'<div class="mu" style="margin-top:5px;font-size:11.5px">💡 <b>이렇게</b> — '+b.R.fix+'</div>'
+(b.R.id==='alg'?'<button class="btn g s" style="margin-top:8px" onclick="closeM();tab=\'food\';render()">🔔 알레르기 관찰 탭으로</button>':'')
+(b.R.id==='nitr'&&m<6?'<div class="mu" style="margin-top:5px;font-size:11px;color:var(--rd)"><b>만 6개월 미만</b>이라 특히 주의가 필요합니다.</div>':'')+'</div></div>'}).join('');
if(C.good.length)h+='<div class="hr"></div><b style="font-size:12.5px">👍 잘 어울리는 조합</b>'
+C.good.map(function(g){return '<div class="alert ok" style="margin-top:7px"><span class="ic">✅</span><div><b>'+g.R.t+'</b><div style="margin:4px 0 5px">'+cTag(g.it)+'</div>'+g.R.r+'</div></div>'}).join('');
if(S.length)h+='<div class="hr"></div><b style="font-size:12.5px">＋ 더하면 좋은 재료</b><div class="mu" style="font-size:10.5px;margin:3px 0 6px">누르면 이 레시피에 적정량이 추가됩니다.</div><div class="ch">'
+S.map(function(x){return '<button style="background:#E7F1FB;color:#3A6FA8" onclick="comboAdd(\''+r.i+'\',\''+x.n+'\')">＋ '+x.n+' '+(QG[x.n]||10)+qUnit(x.n)+'<span class="mu" style="font-weight:600"> · '+x.w+'</span></button>'}).join('')+'</div>';
return h+'<div class="mu" style="font-size:10px;margin-top:8px">※ 일반적인 소화·흡수 원리에 근거한 참고 정보이며, 금지 조합이 아닙니다. 아기 반응이 우선입니다.</div></div>'}
function comboAdd(id,fn){addG(id,fn);
if(curR&&curR.i===id){curR=getR(id);document.getElementById('mb').innerHTML=rBody()}
else diagMeal(id);
render()}

/*========== 편집 화면 · 실시간 경고 ==========*/
function comboEdit(){var C=comboOf(ME),S=comboSug(ME).sug;
if(!(ME.g||[]).length)return '';
var h='<div class="st">🧩 재료 조합 점검</div><div class="cd"><div class="rw" style="justify-content:space-between;align-items:center"><b style="font-size:13px">지금 조합</b><span class="badge '+cLv(C.sc)+'" style="font-size:12px;padding:5px 10px">'+cIco(C.sc)+' '+cTxt(C.sc)+' '+C.sc+'점</span></div>';
if(C.bad.length)h+=C.bad.map(function(b){return '<div class="alert '+(b.R.lv===2?'bad':'mid')+'" style="margin-top:8px"><span class="ic">'+(b.R.lv===2?'🚨':'⚠️')+'</span><div><b>'+b.R.t+'</b><div style="margin:4px 0 5px">'+cTag(b.it)+'</div>'+b.R.r
+'<div class="mu" style="margin-top:5px;font-size:11.5px">💡 '+b.R.fix+'</div>'
+'<div class="ch" style="margin-top:7px">'+b.it.map(function(k){return '<button style="background:#FFF1CC;color:#8A5D00" onclick="edDel(\''+k+'\')">✕ '+k+' 빼기</button>'}).join('')+'</div></div></div>'}).join('');
else h+='<div class="alert ok" style="margin-top:8px"><span class="ic">✅</span><div>충돌하는 재료 조합이 <b>없습니다.</b></div></div>';
if(C.good.length)h+='<div class="mu" style="margin-top:9px;font-size:11.5px">👍 '+C.good.map(function(g){return '<b>'+g.R.t+'</b>'}).join(' · ')+' 조합이 들어 있어요.</div>';
if(S.length)h+='<div class="hr"></div><b style="font-size:12.5px">＋ 궁합 좋은 재료 추천</b><div class="ch" style="margin-top:6px">'
+S.map(function(x){return '<button style="background:#DFF4EC;color:#1F7A5F" onclick="edAdd(\''+x.n+'\')">＋ '+x.n+' '+(QG[x.n]||10)+qUnit(x.n)+'<span class="mu" style="font-weight:600"> · '+x.w+'</span></button>'}).join('')+'</div>';
return h+'</div>'}
function edDel(k){var i=-1;ME.g.forEach(function(x,n){if(x[3]===k)i=n});
if(i>=0)ME.g.splice(i,1);drawEd()}

/*========== 재료 도감 · 이 재료의 궁합 ==========*/
function comboFood(key){if(!key)return '';
var bad=[],good=[];
CBAD.forEach(function(R){var inA=(CGRP[R.a]||[]).indexOf(key)>=0,inB=R.b?(CGRP[R.b]||[]).indexOf(key)>=0:0;
if(!inA&&!inB)return;
var part=[];
if(R.ty==='pair'){part=(inA?CGRP[R.b]:CGRP[R.a]).slice()}
else part=(CGRP[R.a]||[]).filter(function(x){return x!==key});
if(!part.length)return;
bad.push({R:R,p:part.slice(0,8)})});
CGOOD.forEach(function(R){var inA=(CGRP[R.a]||[]).indexOf(key)>=0,inB=(CGRP[R.b]||[]).indexOf(key)>=0;
if(!inA&&!inB)return;
var part=(inA?CGRP[R.b]:CGRP[R.a]).filter(function(x){return x!==key});
if(!part.length)return;
good.push({R:R,p:part.slice(0,8)})});
if(!bad.length&&!good.length)return '<div class="st">🧩 재료 궁합</div><div class="cd mu">이 재료는 특별히 주의할 조합이 없습니다.</div>';
var h='<div class="st">🧩 이 재료의 궁합</div>';
if(bad.length)h+='<div class="cd"><b style="font-size:13px;color:var(--rd)">⚠️ 함께 쓸 때 주의</b>'
+bad.map(function(b){return '<div style="margin-top:9px;padding-top:9px;border-top:1px solid var(--ln)"><b style="font-size:12.5px">'+b.R.t+'</b><div class="ch" style="margin:6px 0">'+b.p.map(function(x){return '<button style="background:#FDEAE5;color:#C0350F" onclick="openF(\''+fdName(x)+'\')">'+x+'</button>'}).join('')+'</div><p class="mu" style="margin:0;font-size:11.5px">'+b.R.r+'</p><p class="mu" style="margin:5px 0 0;font-size:11.5px">💡 '+b.R.fix+'</p></div>'}).join('')
+'<div class="mu" style="font-size:10.5px;margin-top:8px">함께 먹여도 되지만 <b>같은 끼니에 몰아 담지 않는</b> 편이 좋습니다.</div></div>';
if(good.length)h+='<div class="cd"><b style="font-size:13px;color:var(--ok)">👍 함께 쓰면 좋은 재료</b>'
+good.map(function(g){return '<div style="margin-top:9px;padding-top:9px;border-top:1px solid var(--ln)"><b style="font-size:12.5px">'+g.R.t+'</b><div class="ch" style="margin:6px 0">'+g.p.map(function(x){return '<button style="background:#DFF4EC;color:#1F7A5F" onclick="openF(\''+fdName(x)+'\')">'+x+'</button>'}).join('')+'</div><p class="mu" style="margin:0;font-size:11.5px">'+g.R.r+'</p></div>'}).join('')+'</div>';
return h}

/*========== 카드용 한 줄 배지 ==========*/
function comboTag(r){var C=comboOf(r);
if(!C.bad.length)return C.good.length?'<div class="ds" style="color:var(--ok)">🧩 조합 '+C.sc+'점 · '+C.good[0].R.t+'</div>':'';
var b=C.bad[0];
return '<div class="ds" style="color:'+(b.R.lv===2?'var(--rd)':'var(--warn)')+'">'+(b.R.lv===2?'🚨':'⚠️')+' 조합 '+C.sc+'점 · '+b.R.t+(C.bad.length>1?' 외 '+(C.bad.length-1)+'건':'')+'</div>'}
