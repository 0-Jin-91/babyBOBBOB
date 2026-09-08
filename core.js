/*========== 상수 ==========*/
var NK=['p','fe','ca','zn'];
var NI={p:1,fe:2,ca:3,zn:4};
var NL={p:['단백질','g','#3FAE8E'],fe:['철분','mg','#E85536'],ca:['칼슘','mg','#5B8FCC'],zn:['아연','mg','#8B7FD4']};
var MILK={f:{n:'분유',v:[67,1.4,.8,55,.5],vc:9,ab:.10},b:{n:'모유',v:[65,1.0,.03,32,.15],vc:4,ab:.50}};
var PCG={'달걀':50,'달걀노른자':17,'달걀흰자':33};
/*========== 재료 검색 매칭 ==========
  '계란'→달걀, 'ㄱㄹ'→고구마/김 처럼 다르게 쳐도 찾아준다.
  ① 이름·분류·영양키 부분일치  ② SYN 동의어 사전  ③ 초성 검색
  ④ 공백·특수문자 무시  ⑤ 조합 중인 자모('ㄱㅖ')도 통과 ==========*/
var CHO=['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
/* 한글 문자열의 초성만 뽑는다. '고구마' -> 'ㄱㄱㅁ' */
function choOf(s){var o='';for(var i=0;i<s.length;i++){var c=s.charCodeAt(i);
if(c>=0xAC00&&c<=0xD7A3)o+=CHO[Math.floor((c-0xAC00)/588)];
else if(c>=0x3131&&c<=0x314E)o+=s.charAt(i);
else if(c!==' ')o+=s.charAt(i).toLowerCase()}
return o}
/* 검색용 정규화 — 공백·괄호·중점 제거 후 소문자 */
function nrm(s){return String(s||'').toLowerCase().replace(/[\s()·\-_,.\/]/g,'')}
/* 초성만으로 입력했는지 판정 (ㄱ~ㅎ 만 있는 경우) */
function isCho(q){return /^[ㄱ-ㅎ]+$/.test(q)}
/* 한 재료(f)가 검색어(q)에 걸리는지 */
function fdMatch(f,q){var ql=nrm(q);if(!ql)return true;
var name=f[0]||'',cat=f[2]||'',key=f[4]||'',ali=f[7]||'';
var syn=(typeof SYN!=='undefined'&&SYN[name])||'';
var hay=nrm(name+' '+cat+' '+key+' '+ali+' '+syn);
if(hay.indexOf(ql)>=0)return true;
/* 동의어를 낱말 단위로도 확인 — '계란 노른자' 처럼 띄어 쳐도 걸린다 */
var words=(name+' '+ali+' '+syn).split(/\s+/),qw=String(q||'').trim().toLowerCase().split(/\s+/);
if(qw.length>1){var all=1;
for(var i=0;i<qw.length;i++){var hit=0,qq=nrm(qw[i]);
if(!qq)continue;
for(var j=0;j<words.length;j++)if(nrm(words[j]).indexOf(qq)>=0){hit=1;break}
if(!hit){all=0;break}}
if(all)return true}
/* 초성 검색 — 'ㄱㄱㅁ' -> 고구마 */
if(isCho(String(q||'').replace(/\s/g,''))){
var cq=String(q||'').replace(/\s/g,'');
if(choOf(name).indexOf(cq)>=0)return true;
for(var k=0;k<words.length;k++)if(choOf(words[k]).indexOf(cq)>=0)return true}
return false}
var IDS=['ready','early','mid','late','final'];
var TY={p:'🍲 죽',t:'🧊 토핑',f:'✋ 핑거',m:'🍚 유아식'};
var GN={w:['몸무게','kg'],h:['키','cm'],c:['머리둘레','cm']};
function sT(k){return '<span class="tg v" style="cursor:pointer" onclick="openSrc(\''+k+'\')">📎 '+SRC[k].t+'</span>'}

/*========== 영양 계산 ==========*/
function gOf(x){var q=+x[1]||0,u=x[2],k=x[3];
if(u==='개')return q*(x[4]?+x[4]:(PCG[k]||10));
if(u==='방울')return q*.5;
if(u==='ml')return NUT[k]?q:0;return q}
function nutOf(r,ml){ml=ml||1;var t={p:0,fe:0,ca:0,zn:0,vc:0},meat=0,d=[],ms=[],sv=r.sv||1;
(r.g||[]).forEach(function(x){var v=NUT[x[3]];if(!v){if(x[2]!=='ml')ms.push(x[0]);return}
var gr=gOf(x)*ml/sv,o={n:x[0],g:gr};
NK.forEach(function(k){o[k]=v[NI[k]]*gr/100;t[k]+=o[k]});
o.vc=v[5]*gr/100;t.vc+=o.vc;o.ty=v[6];
if(v[6]==='h')meat+=gr;
d.push(o)});
return {t:t,d:d,ms:ms,meat:meat}}
function milkNut(v,tp){var M=MILK[tp]||MILK.f,o={};
NK.forEach(function(k){o[k]=M.v[NI[k]]*v/100});
o.vc=M.vc*v/100;return o}
function DRI(m){if(m<6)return{p:10,fe:.3,ca:250,zn:2,lb:'0~5개월',pkg:1.4};
if(m<12)return{p:15,fe:6,ca:300,zn:3,lb:'6~11개월',pkg:1.2};
if(m<24)return{p:20,fe:6,ca:500,zn:3,lb:'12~23개월',pkg:1.1};
return{p:25,fe:7,ca:600,zn:4,lb:'만 3~5세',pkg:1.05}}

/*========== 성장 유틸 ==========*/
function gArr(kind,sx){var D=GD[kind][sx];
if(kind==='c')return{p3:D.p50.map(function(v){return Math.round((v-2.6)*10)/10}),p50:D.p50,p97:D.p50.map(function(v){return Math.round((v+2.6)*10)/10})};
return D}
function ncdf(z){var t=1/(1+.2316419*Math.abs(z)),d=.3989423*Math.exp(-z*z/2);
var p=1-d*t*(1.330274*Math.pow(t,4)-1.821256*Math.pow(t,3)+1.781478*t*t-.356538*t+.319381);
return z>0?p:1-p}
function pctOf(v,p3,p50,p97){var z;
if(v<p50)z=-1.881*(p50-v)/Math.max(.01,p50-p3);else z=1.881*(v-p50)/Math.max(.01,p97-p50);
return Math.max(.1,Math.min(99.9,ncdf(z)*100))}
function ipol(a,m){var i=Math.floor(m);if(i>=a.length-1)return a[a.length-1];if(i<0)return a[0];
return a[i]+(a[i+1]-a[i])*(m-i)}

/*========== 상태 ==========*/
var KY={b:'b6.baby',l:'b6.log',f:'b6.food',m:'b6.my',c:'b6.cube',o:'b6.ov',p:'b6.ph',w:'b6.plan',a:'b6.obs',s:'b6.shop',t:'b6.today',v:'b6.fav',g:'b6.grow',bw:'b6.bowl'};
function LS(k,d){try{var v=JSON.parse(localStorage.getItem(k));return v===null?d:v}catch(e){return d}}
var baby=LS(KY.b,null),logs=LS(KY.l,[]),tried=LS(KY.f,{}),myR=LS(KY.m,[]),cubes=LS(KY.c,[]),ov=LS(KY.o,{}),ph=LS(KY.p,{}),plan=LS(KY.w,null),obs=LS(KY.a,[]),shopChk=LS(KY.s,{}),todaySel=LS(KY.t,null),fav=LS(KY.v,{}),grow=LS(KY.g,[]);
function migLogs(){var ch=0;
logs.forEach(function(l){if(l.nu){if(l.nu.kcal!=null){delete l.nu.kcal;ch=1}if(l.nu.feAb!=null){delete l.nu.feAb;ch=1}}});
if(ch)save()}
function save(){localStorage.setItem(KY.b,JSON.stringify(baby));localStorage.setItem(KY.l,JSON.stringify(logs));
localStorage.setItem(KY.f,JSON.stringify(tried));localStorage.setItem(KY.m,JSON.stringify(myR));
localStorage.setItem(KY.c,JSON.stringify(cubes));localStorage.setItem(KY.o,JSON.stringify(ov));
localStorage.setItem(KY.w,JSON.stringify(plan));localStorage.setItem(KY.a,JSON.stringify(obs));
localStorage.setItem(KY.s,JSON.stringify(shopChk));localStorage.setItem(KY.t,JSON.stringify(todaySel));
localStorage.setItem(KY.v,JSON.stringify(fav));localStorage.setItem(KY.g,JSON.stringify(grow));
if(typeof BW!=='undefined')localStorage.setItem(KY.bw,JSON.stringify(BW));
try{localStorage.setItem(KY.p,JSON.stringify(ph))}catch(e){alert('사진 저장 공간이 부족합니다.')}}
function RCP(){return BASE.map(function(r){var o=ov[r.i];if(!o)return r;
var c={};for(var k in r)c[k]=r[k];for(var k2 in o)c[k2]=o[k2];c.ed=1;return c}).concat(myR)}
function getR(id){var a=RCP();for(var i=0;i<a.length;i++)if(a[i].i===id)return a[i];return null}
var tab='home',selS=null,selT='p',qty=1,curR=null,fCat='전체',lRx='😋',mTab='s',ME=null,phT=null,pTab='w',srch='',gK='w';


/*========== 개월수별 권장 수유 ==========*/
/* [회당ml최소,회당ml최대,하루횟수최소,하루횟수최대,라벨] */
var MLG=[
{f:0,t:1,per:[60,90],cnt:[8,12],lb:'0~1개월'},
{f:1,t:2,per:[90,120],cnt:[7,9],lb:'1~2개월'},
{f:2,t:4,per:[120,150],cnt:[6,8],lb:'2~3개월'},
{f:4,t:6,per:[150,180],cnt:[5,6],lb:'4~5개월'},
{f:6,t:9,per:[170,175],cnt:[3,4],lb:'6~8개월'},
{f:9,t:12,per:[170,200],cnt:[3,3],lb:'9~11개월'},
{f:12,t:99,per:[200,250],cnt:[2,2],lb:'12개월+'}];
/* 6개월+ 는 이유식 병행 기준(하루 총량 6~8개월 500~700 · 9~11개월 500~600 · 12개월+ 400~500ml). 4~5개월은 이유식 시작 전이라 수유 위주 기준 유지 */
function mlGuide(){var m=ageM();
for(var i=0;i<MLG.length;i++)if(m>=MLG[i].f&&m<MLG[i].t)return MLG[i];
return MLG[MLG.length-1]}
function mlDay(){var G=mlGuide();
return {lo:G.per[0]*G.cnt[0],hi:G.per[1]*G.cnt[1],G:G}}
function mlPct(ml){var D=mlDay(),mid=(D.lo+D.hi)/2;return ml/Math.max(1,mid)*100}
function mlLv(ml){var D=mlDay();
return ml<D.lo*.7?'bad':ml<D.lo?'mid':ml<=D.hi?'ok':ml<=D.hi*1.25?'mid':'bad'}
function mlTxt(ml){var D=mlDay();
return ml<D.lo*.7?'많이 부족':ml<D.lo?'조금 부족':ml<=D.hi?'적정':ml<=D.hi*1.25?'조금 많음':'많이 많음'}

/*========== 그릇 무게 프리셋 ==========*/
var BW=LS(KY.bw,null)||{list:[{id:'b1',n:'기본 이유식 그릇',w:120}],cur:'b1'};
function bwCur(){var a=BW.list.filter(function(x){return x.id===BW.cur});return a.length?a[0]:(BW.list[0]||null)}
function bwSave(){localStorage.setItem(KY.bw,JSON.stringify(BW))}
function bwAdd(n,w){var id='b'+Date.now();BW.list.push({id:id,n:n,w:w});BW.cur=id;bwSave()}
function bwDel(id){BW.list=BW.list.filter(function(x){return x.id!==id});
if(BW.cur===id)BW.cur=BW.list.length?BW.list[0].id:null;bwSave()}
function bwSet(id){BW.cur=id;bwSave()}
/* 실제 먹은 양 = (먹이기전 총중량 - 먹인후 총중량) */
function ateOf(pre,post){var a=(+pre||0)-(+post||0);return a>0?Math.round(a*10)/10:0}

/*========== 날짜 ==========*/
function d0(s){var d=new Date(s);d.setHours(0,0,0,0);return d}
function TD(){var d=new Date();d.setHours(0,0,0,0);return d}
function addM(d,m){var x=new Date(d),g=x.getDate();x.setMonth(x.getMonth()+m);if(x.getDate()<g)x.setDate(0);return x}
function addD(d,n){var x=new Date(d);x.setDate(x.getDate()+n);return x}
function ageMAt(dt){var b=d0(baby.birth),n=d0(dt),m=(n.getFullYear()-b.getFullYear())*12+(n.getMonth()-b.getMonth());
if(n.getDate()<b.getDate())m--;return m+Math.floor((n-addM(b,m))/864e5)/30}
function ageM(){return ageMAt(TD())}
function dOld(){return Math.floor((TD()-d0(baby.birth))/864e5)}
function fmt(d){return d.getFullYear()+'.'+('0'+(d.getMonth()+1)).slice(-2)+'.'+('0'+d.getDate()).slice(-2)}
function ymd(d){return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)}
function ageT(){var m=Math.floor(ageM());
return '생후 '+dOld()+'일 · 만 '+m+'개월 '+Math.floor((TD()-addM(d0(baby.birth),m))/864e5)+'일'}
function curS(){var m=ageM();for(var i=0;i<STG.length;i++)if(m>=STG[i].f&&m<STG[i].t)return STG[i];return STG[0]}
function nextStage(){var i=IDS.indexOf(curS().id);return i<4?STG[i+1]:null}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function rnd(n){return Math.round(n*10)/10}
function rnd2(n){return Math.round(n*100)/100}
function wkStart(){var d=TD(),w=d.getDay();return addD(d,-((w+6)%7))}

/*========== 목표 ==========*/
function MEALS(){return (baby&&baby.meals)||2}
function SLOTS(){var n=MEALS();return n===1?['아침']:n===2?['아침','저녁']:['아침','점심','저녁']}
function MTYPE(){return baby.feed==='b'?'b':'f'}
function lastG(k){var a=grow.filter(function(g){return g[k]!=null&&g[k]!==''}).sort(function(x,y){return x.d<y.d?1:-1});
return a.length?a[0]:null}
function curW(){var g=lastG('w');return g?+g.w:null}
var SFT={
ready:{p:.10,fe:.10,ca:.06,zn:.15},
early:{p:.25,fe:.30,ca:.10,zn:.35},
mid:{p:.50,fe:.32,ca:.14,zn:.55},
late:{p:.78,fe:.50,ca:.30,zn:.78},
final:{p:.95,fe:.85,ca:.78,zn:.92}};
function TG(){var m=ageM(),dri=DRI(m),w=curW(),use=(baby.useW!==0)&&w,day={};
NK.forEach(function(k){day[k]=dri[k]});
if(use){day.p=rnd(w*dri.pkg)}
var sid=curS().id,SF=SFT[sid]||SFT.mid,bm=MTYPE()==='b';
var sf={};NK.forEach(function(k){sf[k]=SF[k]});
if(bm){sf.fe=Math.min(.9,sf.fe*2.4);sf.ca=Math.min(.9,sf.ca*1.3)}
var solid={},meal={};
NK.forEach(function(k){solid[k]=day[k]*sf[k];meal[k]=solid[k]/MEALS()});
var avg=(sf.p+sf.fe+sf.ca+sf.zn)/4;
return {day:day,solid:solid,meal:meal,dri:dri,sf:avg,sfk:sf,w:w,use:!!use,lb:dri.lb,bm:bm}}

/*========== 등급 (기준: ✅70% / ⚠️45% / 🚨45%미만) ==========*/
function lvl(pc){return pc>180?'bad':pc>150?'mid':pc>=70?'ok':pc>=45?'mid':'bad'}
function lvIco(pc){return pc>150?'⚠️':pc>=70?'✅':pc>=45?'⚠️':'🚨'}
function lvTxt(pc){return pc>180?'많이 과다':pc>150?'조금 과다':pc>=70?'적정':pc>=45?'조금 부족':'많이 부족'}
function lvCol(pc){return pc>150?'var(--warn)':pc>=70?'var(--ok)':pc>=45?'var(--warn)':'var(--rd)'}
var LV={ok:70,mid:45,over:150};
var FIX={
p:{f:['소고기','닭고기','두부','흰살생선','달걀노른자'],t:'고기·생선·두부·달걀 양을 <b>5~10g 늘리면</b> 빠르게 채워집니다.'},
fe:{f:['소고기','달걀노른자','오트밀','시금치','파프리카'],t:'<b>소고기 10~20g</b>을 넣고 <b>파프리카·브로콜리·토마토</b>를 곁들이면 흡수율이 2~3배 올라갑니다. 분유수유 중이면 분유가 철분을 상당 부분 공급합니다.'},
ca:{f:['두부','아기치즈','미역','멸치가루','청경채','요거트'],t:'칼슘은 <b>수유·유제품이 주 공급원</b>입니다. 이유식에서 올리려면 두부 20g·아기치즈 5g·불린미역·무염 멸치가루를 활용하세요.'},
zn:{f:['소고기','달걀노른자','표고버섯','두부'],t:'<b>소고기·달걀노른자·표고버섯</b>이 아연이 많습니다.'}};
var QG={'소고기':15,'닭고기':15,'두부':20,'흰살생선':15,'달걀노른자':1,'오트밀':10,'시금치':10,'파프리카':10,'아기치즈':5,'미역':10,'멸치가루':2,'표고버섯':10,'고구마':20,'단호박':20,'아보카도':10,'참기름':2,'요거트':30,'청경채':10,'밥':30,'브로콜리':10,'당근':10};
function qUnit(fn){return (fn==='달걀노른자'||fn==='달걀흰자'||fn==='달걀')?'개':(fn==='참기름'?'방울':'g')}
function tipFor(n){var m={'단백질':'p','철분':'fe','칼슘':'ca','아연':'zn'};
return FIX[m[n]]?FIX[m[n]].t:''}
function mealScore(r){var T=TG(),n=nutOf(r).t,W={p:1.3,fe:1.4,ca:.9,zn:.8},s=0,tw=0;
NK.forEach(function(k){var pc=n[k]/Math.max(.01,T.meal[k])*100;
if(pc>150)pc=150-Math.min(50,(pc-150)*.3);
s+=Math.min(150,pc)*W[k];tw+=W[k]});
return Math.round(s/tw)}
function diagOf(r){var T=TG(),n=nutOf(r).t,out=[];
NK.forEach(function(k){out.push({k:k,nm:NL[k][0],u:NL[k][1],pc:n[k]/Math.max(.01,T.meal[k])*100,v:n[k],goal:T.meal[k],col:NL[k][2]})});
return out}

/*========== 추천 엔진 ==========*/
function mainKeys(r){var s={};
(r.g||[]).forEach(function(x){if(x[3]&&['소고기','닭고기','돼지고기','흰살생선','연어','새우','두부','달걀','달걀노른자'].indexOf(x[3])>=0)s['P'+x[3]]=1;else if(x[3])s[x[3]]=1});
return Object.keys(s)}
function score(r,acc,tg,used){var n=nutOf(r),nu=n.t,sc=0,W={p:1.4,fe:1.5,ca:1.2,zn:1.3};
NK.forEach(function(k){var need=Math.max(0,tg[k]-(acc[k]||0));sc+=Math.min(nu[k],need)/Math.max(.01,tg[k])*W[k]});
var mk=mainKeys(r),dup=0;mk.forEach(function(k){if(used[k])dup++});
/* 큐브 우선: 보유 큐브로 커버되는 재료가 많은 레시피에 가산 */
var st=stkOf(r),cubeBonus=st.cube*0.35;
return sc-dup*.45+cubeBonus}
/*========== 재고 연동 (추천을 보유 재고 안에서) ==========*/
/* 물·모유·분유 등 재고관리 대상이 아닌 재료 */
function isPantry(nm,key){return !key||key===''||nm==='물'||key==='물'}
/* 원재료(STK) 보유 g */
function rawGramOf(key,nm){if(typeof STK==='undefined')return 0;
var tot=0;STK.forEach(function(x){if((key&&x.key===key)||(nm&&x.n===nm)){
tot+=(typeof u2g==='function')?u2g(x,Math.max(0,x.left)):Math.max(0,x.left)}});return tot}
/* 큐브 보유 g */
function cubeGram(key,nm){if(typeof cubes==='undefined')return 0;
return cubes.filter(function(c){return c.q>0&&((key&&c.key===key)||(nm&&c.n===nm))})
.reduce(function(a,c){return a+c.q*c.g},0)}
/* 레시피 재고 판정 — 큐브 기준을 먼저 본다.
   반환 {ok, need, have, cube, cubeAll, raw:[{n,key,g,rg}], lack:[재료명], mode}
   · cube    : 큐브로 (일부라도) 커버되는 재료 수
   · cubeAll : 필요한 모든 재료가 큐브만으로 충족 → 바로 조리 가능
   · raw     : 큐브는 없거나 부족하지만 원재료가 있어 큐브화/직접조리로 가능한 재료
   · lack    : 큐브도 원재료도 없는 재료 (장보기 필요)
   · mode    : 'cube'(큐브만으로 OK) / 'raw'(원재료 손질 필요) / 'buy'(장보기 필요) / 'none' */
function stkOf(r){var need=0,ok=0,cube=0,cubeAll=0,raw=[],lack=[];
(r.g||[]).forEach(function(x){var nm=x[0],key=x[3];
if(isPantry(nm,key))return;                 /* 물 등은 판정 제외 */
need++;
var g=(typeof gOf==='function')?gOf(x):(+x[1]||0);
var cg=cubeGram(key,nm),rg=rawGramOf(key,nm);
if(cg>0)cube++;
if(cg>=g-0.01){cubeAll++;ok++}                       /* 큐브만으로 충족 */
else if(cg+rg>=g-0.01){ok++;raw.push({n:nm,key:key||nm,g:g,rg:rg,cg:cg})}  /* 원재료 보충 필요 */
else if(rg>0){raw.push({n:nm,key:key||nm,g:g,rg:rg,cg:cg,short:1});lack.push(nm)}
else lack.push(nm)});
var mode=need===0?'none':(lack.length?'buy':(raw.length?'raw':'cube'));
return {ok:ok>=need,need:need,have:ok,cube:cube,cubeAll:cubeAll,raw:raw,lack:lack,mode:mode}}
function canMake(r){return stkOf(r).ok}
/* 큐브만으로 전부 되는가 */
function canMakeCube(r){var st=stkOf(r);return st.need>0&&st.mode==='cube'}
/* 원재료는 있어 큐브화·직접조리로 가능한가 */
function canMakeRaw(r){var st=stkOf(r);return st.ok&&st.mode==='raw'}
/* 추천 카드용 재고 배지 HTML */
function stkBadge(r){if(!stkReady())return '';var st=stkOf(r);
if(st.need===0)return '';
if(st.mode==='cube')return ' · <span style="color:#2E86C1;font-weight:700">🧊 큐브로 바로</span>';
if(st.mode==='raw')return ' · <span style="color:#1F7A5F;font-weight:700">🥩 원재료 보유</span><span class="mu" style="font-size:9.5px"> · '+st.raw.slice(0,2).map(function(x){return x.n}).join(',')+' 손질 필요</span>';
return ' · <span style="color:var(--warn)">🛒 '+st.lack.slice(0,2).join(',')+(st.lack.length>2?' 외':'')+' 부족</span>'}
/* 재고 안내문 — "큐브가 없으면 이렇게 하세요" 문장을 만든다 */
function stkHowto(r){var st=stkOf(r);if(st.need===0||!stkReady())return '';
if(st.mode==='cube')return '<div class="alert ok"><span class="ic">🧊</span><div><b>보유 큐브만으로 만들 수 있어요.</b><br>큐브를 꺼내 해동하면 바로 조리 가능합니다.</div></div>';
if(st.mode==='raw')return '<div class="alert mid"><span class="ic">🥩</span><div><b>큐브는 없지만 원재료가 있어요.</b> 아래 재료는 두 가지 방법 중 하나로 진행하세요.'
+st.raw.map(function(x){var s=(typeof stkFind==='function')?(stkFind(x.key)||stkFind(x.n)):null;
return '<div class="mu" style="font-size:11px;margin-top:5px">· <b>'+esc(x.n)+'</b> — 필요 약 '+rnd(x.g)+'g / 원재료 '+rnd(x.rg)+'g 보유'
+(s&&typeof cubeify==='function'?' <button class="btn g s" style="padding:2px 8px;margin-left:3px" onclick="cubeify(\''+s.id+'\')">🧊 큐브화</button>':'')
+'<br>&nbsp;&nbsp;① <b>큐브화</b>해 두면 다음에도 편해요 ② 이번만이면 <b>바로 손질해 함께 조리</b>하세요.</div>'}).join('')
+'</div></div>';
return '<div class="alert bad"><span class="ic">🛒</span><div><b>'+st.lack.slice(0,3).join(', ')+(st.lack.length>3?' 외 '+(st.lack.length-3)+'종':'')+'</b>은 큐브도 원재료도 없어요.<br>장보기 목록에 담아 주세요.'
+(st.raw.length?'<div class="mu" style="font-size:11px;margin-top:4px">나머지 '+st.raw.map(function(x){return esc(x.n)}).join(', ')+'은 원재료로 준비할 수 있어요.</div>':'')+'</div></div>'}
function poolAll(si){return RCP().filter(function(r){return r.s===si&&r.y!=='f'&&(r.g||[]).length&&(r.sv||1)<5})}
/* 재고 사용 여부: 원재료·큐브 중 하나라도 있으면 재고 기준으로 추천한다 */
function stkReady(){return (typeof STK!=='undefined'&&STK.filter(function(s){return s.left>0}).length>0)||(typeof cubes!=='undefined'&&cubes.filter(function(c){return c.q>0}).length>0)}
/* 추천 풀 — ① 큐브만으로 되는 것 ② 원재료로 되는 것(큐브화 안내) ③ 전체 fallback */
function pool(si){var all=poolAll(si);
if(!stkReady())return all;                       /* 재고 자체를 안 쓰면 기존대로 */
var cb=all.filter(function(r){return canMakeCube(r)});
var rw=all.filter(function(r){return canMakeRaw(r)});
if(cb.length>=3)return cb.concat(rw);            /* 큐브 우선, 원재료분은 뒤에 */
if(cb.length+rw.length)return cb.concat(rw);
return all}
function recommend(si,seed,mealN,pre){var P=pool(si);if(!P.length)return [];
var T=TG(),tgt={};NK.forEach(function(k){tgt[k]=T.solid[k]});
var acc={p:0,fe:0,ca:0,zn:0},used={},out=[];
(pre||[]).forEach(function(k){used[k]=1});
for(var s=0;s<mealN;s++){var best=null,bs=-999;
P.forEach(function(r,idx){if(out.filter(function(o){return o.i===r.i}).length)return;
var v=score(r,acc,tgt,used)*2.2+mealScore(r)/100*.5+((idx+seed*7+s*13)%5)*.008+(fav[r.i]?.2:0);
if(v>bs){bs=v;best=r}});
if(!best)break;
out.push(best);var nu=nutOf(best).t;
NK.forEach(function(k){acc[k]+=nu[k]});
mainKeys(best).forEach(function(k){used[k]=1})}
return out}
function dayScore(list){var T=TG(),acc={p:0,fe:0,ca:0,zn:0};
list.forEach(function(r){if(!r)return;var n=nutOf(r).t;NK.forEach(function(k){acc[k]+=n[k]})});
var W={p:1.3,fe:1.4,ca:.9,zn:.8},s=0,tw=0,low=[];
NK.forEach(function(k){var pc=acc[k]/Math.max(.01,T.solid[k])*100;
if(pc<LV.ok)low.push({k:k,nm:NL[k][0],pc:pc,lack:T.solid[k]-acc[k],u:NL[k][1]});
if(pc>150)pc=150-Math.min(50,(pc-150)*.3);
s+=Math.min(150,pc)*W[k];tw+=W[k]});
return {sc:Math.round(s/tw),low:low.sort(function(a,b){return a.pc-b.pc}),acc:acc}}
function altList(si,ex){var P=pool(si);
return P.filter(function(r){return ex.indexOf(r.i)<0}).sort(function(a,b){return mealScore(b)-mealScore(a)})}
function todayRec(){var si=IDS.indexOf(curS().id==='ready'?'early':curS().id),sl=SLOTS(),key=fmt(TD())+'|'+MEALS();
if(todaySel&&todaySel.k===key&&todaySel.ids.length===sl.length){var a=todaySel.ids.map(getR);if(a.indexOf(null)<0)return a}
var rs=recommend(si,dOld(),sl.length);
todaySel={k:key,ids:rs.map(function(r){return r.i})};save();return rs}

/*========== 3D 일러스트 ==========*/
function ART(t){var S={
soak:'<path d="M22 34h56l-6 26a6 6 0 0 1-6 5H34a6 6 0 0 1-6-5z" fill="url(#gW)"/><ellipse cx="50" cy="34" rx="28" ry="7" fill="#EDE3DA"/><ellipse cx="50" cy="35" rx="24" ry="5.5" fill="url(#gB)"/><ellipse cx="44" cy="35" rx="2.6" ry="1.5" fill="#fff"/><ellipse cx="53" cy="37" rx="2.6" ry="1.5" fill="#fff"/>',
blend:'<path d="M34 18h32l-4 42a7 7 0 0 1-7 6H45a7 7 0 0 1-7-6z" fill="url(#gS)"/><path d="M38 40h24l-2 20a7 7 0 0 1-7 6H47a7 7 0 0 1-7-6z" fill="url(#gY)"/><rect x="32" y="13" width="36" height="6" rx="3" fill="url(#gK)"/><circle cx="50" cy="49" r="3" fill="#6B6663"/>',
boil:'<path d="M20 32h60l-5 28a8 8 0 0 1-8 7H33a8 8 0 0 1-8-7z" fill="url(#gK)"/><ellipse cx="50" cy="32" rx="30" ry="7" fill="#5C5754"/><ellipse cx="50" cy="33" rx="25" ry="5.5" fill="url(#gY)"/><path d="M40 22q4-7 0-13M50 20q5-8 0-15M60 22q4-7 0-13" stroke="#CFC6BF" stroke-width="2.6" fill="none" stroke-linecap="round"/>',
sieve:'<ellipse cx="50" cy="28" rx="28" ry="8" fill="url(#gS)"/><path d="M22 28q28 26 56 0" fill="none" stroke="#B4BAC4" stroke-width="3"/><path d="M28 32h44M34 39h32M40 46h20" stroke="#C9CFD8" stroke-width="1.6"/><path d="M46 52v10M53 54v8" stroke="url(#gY)" stroke-width="3" stroke-linecap="round"/>',
chop:'<rect x="14" y="34" width="72" height="26" rx="5" fill="url(#gD)"/><path d="M30 24l34 6-2 5-34-6z" fill="url(#gS)"/><rect x="24" y="46" width="7" height="5" rx="1.5" fill="#68AE49"/><rect x="34" y="49" width="7" height="5" rx="1.5" fill="#EFAA3D"/><rect x="44" y="46" width="7" height="5" rx="1.5" fill="#EE7A52"/><rect x="54" y="49" width="7" height="5" rx="1.5" fill="#68AE49"/>',
steam:'<path d="M42 18q4-7 0-13M50 16q5-8 0-14M58 18q4-7 0-13" stroke="#CFC6BF" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M24 34h52l-4 24a7 7 0 0 1-7 6H35a7 7 0 0 1-7-6z" fill="url(#gW)"/><ellipse cx="50" cy="34" rx="26" ry="7" fill="#E6DBD2"/><ellipse cx="42" cy="36" rx="6" ry="4" fill="url(#gY)"/><ellipse cx="57" cy="37" rx="6" ry="4" fill="url(#gG)"/>',
cube:'<rect x="14" y="26" width="72" height="40" rx="7" fill="url(#gS)"/><rect x="19" y="31" width="14" height="14" rx="3" fill="url(#gP)"/><rect x="36" y="31" width="14" height="14" rx="3" fill="url(#gG)"/><rect x="53" y="31" width="14" height="14" rx="3" fill="url(#gY)"/><rect x="19" y="48" width="14" height="14" rx="3" fill="url(#gM)"/><rect x="36" y="48" width="14" height="14" rx="3" fill="url(#gY)"/><rect x="53" y="48" width="14" height="14" rx="3" fill="url(#gP)"/>',
fry:'<ellipse cx="46" cy="46" rx="30" ry="12" fill="url(#gK)"/><ellipse cx="46" cy="43" rx="26" ry="9.5" fill="#4A4643"/><ellipse cx="44" cy="42" rx="9" ry="4" fill="url(#gD)"/><ellipse cx="56" cy="44" rx="7" ry="3.4" fill="url(#gP)"/><rect x="72" y="38" width="20" height="6" rx="3" fill="url(#gD)"/>',
mash:'<path d="M24 36h52l-5 24a7 7 0 0 1-7 6H36a7 7 0 0 1-7-6z" fill="url(#gW)"/><ellipse cx="50" cy="36" rx="26" ry="7" fill="#EDE3DA"/><ellipse cx="50" cy="37" rx="22" ry="5" fill="url(#gY)"/><rect x="56" y="6" width="6" height="26" rx="3" fill="url(#gD)"/><rect x="46" y="30" width="26" height="7" rx="3.5" fill="url(#gS)"/>',
bone:'<path d="M20 44q16-16 40-10 12 3 20 10-8 7-20 10-24 6-40-10z" fill="url(#gB)"/><circle cx="34" cy="41" r="2.6" fill="#3E3A38"/><path d="M54 26l14-12" stroke="url(#gS)" stroke-width="3" stroke-linecap="round"/>',
wash:'<ellipse cx="50" cy="46" rx="22" ry="16" fill="url(#gG)"/><ellipse cx="44" cy="40" rx="8" ry="6" fill="#fff" opacity=".35"/><path d="M62 26q4 6 0 10M70 32q4 5 0 9M34 24q4 6 0 10" stroke="url(#gB)" stroke-width="3" fill="none" stroke-linecap="round"/>',
cool:'<path d="M24 34h52l-5 26a7 7 0 0 1-7 6H36a7 7 0 0 1-7-6z" fill="url(#gW)"/><ellipse cx="50" cy="34" rx="26" ry="7" fill="#EDE3DA"/><ellipse cx="50" cy="35" rx="22" ry="5.4" fill="url(#gY)"/><g stroke="url(#gB)" stroke-width="2.4" stroke-linecap="round"><path d="M76 12v14M69 15l14 8M83 15l-14 8"/></g>',
egg:'<ellipse cx="50" cy="44" rx="20" ry="24" fill="url(#gW)"/><ellipse cx="50" cy="46" rx="11" ry="12" fill="url(#gY)"/><ellipse cx="45" cy="40" rx="4" ry="3" fill="#fff" opacity=".5"/>',
mix:'<path d="M22 34h56l-6 26a7 7 0 0 1-7 6H35a7 7 0 0 1-7-6z" fill="url(#gW)"/><ellipse cx="50" cy="34" rx="28" ry="7.4" fill="#EDE3DA"/><ellipse cx="50" cy="35" rx="24" ry="5.8" fill="url(#gY)"/><rect x="58" y="8" width="5" height="28" rx="2.5" transform="rotate(16 58 8)" fill="url(#gD)"/>',
serve:'<path d="M18 34h64l-6 26a8 8 0 0 1-8 6H32a8 8 0 0 1-8-6z" fill="url(#gW)"/><ellipse cx="50" cy="34" rx="32" ry="8" fill="#EDE3DA"/><ellipse cx="50" cy="35" rx="27" ry="6.4" fill="#FFF3E2"/><ellipse cx="40" cy="34" rx="7" ry="3.6" fill="url(#gP)"/><ellipse cx="53" cy="36" rx="7" ry="3.6" fill="url(#gG)"/><ellipse cx="63" cy="33" rx="6" ry="3.2" fill="url(#gY)"/>'};
return '<svg viewBox="0 0 100 76" preserveAspectRatio="xMidYMid slice"><rect width="100" height="76" fill="#FBF6F2"/><ellipse cx="50" cy="66" rx="30" ry="4" fill="#000" opacity=".07"/>'+(S[t]||S.serve)+'<rect width="100" height="76" fill="url(#gL)" opacity=".3"/></svg>'}
function kOf(s){var K=[['불려|불린|담가','soak'],['갈아|믹서|갑니다','blend'],['체에|걸러','sieve'],['끓|졸입','boil'],['찝니다|찜기|삶|데쳐|데칩|익힙','steam'],['다집|다져|썰|썹','chop'],['큐브|트레이|냉동|지퍼백','cube'],['볶|팬에|굽습','fry'],['으깨|으깹|부숩|빚','mash'],['가시','bone'],['씻|헹궈','wash'],['식혀|식힌','cool'],['달걀|노른자','egg'],['섞|풀어','mix'],['담고|담아|올립|먹입|쥐게','serve']];
for(var i=0;i<K.length;i++)if(new RegExp(K[i][0]).test(s))return K[i][1];
return 'serve'}
