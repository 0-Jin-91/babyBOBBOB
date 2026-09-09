/*========== 성장곡선 뷰 ==========*/
/* gArr · ncdf · pctOf · ipol · lastG · curW 는 core.js 에 있음 */
function vGrow(){var sx=baby.sex||'f',A=gArr(gK,sx);
var recs=grow.filter(function(g){return g[gK]!=null&&g[gK]!==''}).sort(function(a,b){return a.d<b.d?-1:1});
var last=recs.length?recs[recs.length-1]:null,prev=recs.length>1?recs[recs.length-2]:null,pc=null;
if(last){var m=Math.min(24,Math.max(0,ageMAt(last.d)));pc=pctOf(+last[gK],ipol(A.p3,m),ipol(A.p50,m),ipol(A.p97,m))}
return '<div class="cd"><b>📈 성장 기록</b><p class="mu" style="margin:5px 0 10px">몸무게를 기록하면 <b>체중 기반 영양 목표</b>가 자동 계산되고, WHO 성장곡선 위에 백분위가 표시됩니다.</p>'
+'<div class="fd" style="margin:0"><label>날짜</label><input id="grD" type="date" value="'+ymd(TD())+'"></div>'
+'<div class="rw" style="margin-top:8px"><div class="fd" style="flex:1;margin:0"><label>몸무게 kg</label><input id="grW" type="number" step="0.01" placeholder="8.2"></div><div class="fd" style="flex:1;margin:0"><label>키 cm</label><input id="grH" type="number" step="0.1" placeholder="70.5"></div><div class="fd" style="flex:1;margin:0"><label>머리둘레</label><input id="grC" type="number" step="0.1" placeholder="44"></div></div>'
+'<button class="btn" style="margin-top:10px" onclick="addGrow()">＋ 측정 기록 저장</button></div>'
+'<div class="tt">'+['w','h','c'].map(function(k){return '<button class="'+(gK===k?'on':'')+'" onclick="gK=\''+k+'\';render()">'+GN[k][0]+'</button>'}).join('')+'</div>'
+(last?'<div class="cd"><div class="rw" style="justify-content:space-between;align-items:center"><div><b style="font-size:21px">'+last[gK]+GN[gK][1]+'</b> <span class="mu">'+last.d+'</span>'
+(prev?'<div class="mu" style="font-size:11px">지난 기록('+prev.d+') 대비 <b style="color:'+(+last[gK]>=+prev[gK]?'var(--ok)':'var(--rd)')+'">'+(+last[gK]-+prev[gK]>=0?'+':'')+rnd2(+last[gK]-+prev[gK])+GN[gK][1]+'</b></div>':'')+'</div>'
+'<div style="text-align:right"><span class="pill2" style="background:'+(pc<3||pc>97?'#FFE3DC':pc<15||pc>85?'#FFF1CC':'#DFF4EC')+';color:'+(pc<3||pc>97?'#C0350F':pc<15||pc>85?'#8A5D00':'#1F7A5F')+'">'+(pc<3||pc>97?'🚨 ':pc<15||pc>85?'⚠️ ':'✅ ')+Math.round(pc)+' 백분위</span><div class="mu" style="font-size:10px;margin-top:3px">만 '+Math.floor(ageMAt(last.d))+'개월 · '+(sx==='m'?'남아':'여아')+'</div></div></div>'
+(pc<3||pc>97?'<div class="alert bad" style="margin-top:9px"><span class="ic">🚨</span><div>'+(pc<3?'3 백분위 미만입니다.':'97 백분위를 넘습니다.')+' 성장 속도와 함께 <b>소아과에서 확인</b>해 보세요.</div></div>'
:pc<15||pc>85?'<div class="alert mid" style="margin-top:9px"><span class="ic">⚠️</span><div>'+(pc<15?'하위':'상위')+' 구간이지만 <b>정상 범위</b>입니다. 곡선을 따라 꾸준히 올라가는지가 더 중요해요.</div></div>'
:'<div class="alert ok" style="margin-top:9px"><span class="ic">✅</span><div>정상 범위(3~97 백분위)에서 잘 자라고 있어요!</div></div>')+'</div>':'<div class="cd mu">아직 '+GN[gK][0]+' 기록이 없어요.</div>')
+'<div class="cd" style="padding:10px">'+gChart(gK,sx)+'<div class="sub2" style="justify-content:center;margin-top:6px"><span><b style="background:#DCE9F7"></b>3~97 백분위</span><span><b style="background:#6E9FD4"></b>50 백분위</span><span><b style="background:var(--pd)"></b>우리 아기</span></div></div>'
+(recs.length?'<div class="st">측정 이력</div><div class="cd">'+recs.slice().reverse().map(function(g){var m2=Math.min(24,Math.max(0,ageMAt(g.d))),p=pctOf(+g[gK],ipol(A.p3,m2),ipol(A.p50,m2),ipol(A.p97,m2));
return '<div class="cb"><div style="flex:1"><b style="font-size:13.5px">'+g[gK]+GN[gK][1]+'</b> <span class="mu">'+g.d+' · 만 '+Math.floor(m2)+'개월</span></div><span class="mu">'+Math.round(p)+'%ile</span><button class="mu" style="font-size:15px;padding:0 4px" onclick="delGrow(\''+g.id+'\')">✕</button></div>'}).join('')+'</div>':'')
+'<div class="cd" style="background:#F3F6FA;font-size:11.5px"><b>성장곡선 읽는 법</b><ul style="margin:5px 0 0;padding-left:16px;color:var(--sub)"><li>한 시점의 백분위보다 <b>곡선을 따라 꾸준히 자라는지</b>가 중요합니다.</li><li>2개 이상의 백분위 구간을 급하게 벗어나면 소아과 상담을 권합니다.</li><li>모유수유아는 6개월 이후 체중 증가가 완만해지는 것이 자연스럽습니다.</li></ul><div style="margin-top:7px">'+sT('who')+sT('kdca')+'</div><div class="mu" style="font-size:10px;margin-top:5px">※ WHO 기준의 월별 근사값이며 머리둘레는 P50±2.6cm로 근사했습니다.</div></div>'}

/*========== 차트 ==========*/
function gChart(k,sx){var A=gArr(k,sx),W=320,H=210,L=34,R=8,Tp=10,B=24;
var recs=grow.filter(function(g){return g[k]!=null&&g[k]!==''});
var lo=A.p3[0],hi=A.p97[24];
recs.forEach(function(g){var v=+g[k];if(v<lo)lo=v;if(v>hi)hi=v});
lo=Math.floor(lo-1);hi=Math.ceil(hi+1);
function X(m){return L+(W-L-R)*m/24}
function Y(v){return Tp+(H-Tp-B)*(1-(v-lo)/(hi-lo))}
function line(a){return a.map(function(v,i){return (i?'L':'M')+X(i).toFixed(1)+' '+Y(v).toFixed(1)}).join(' ')}
var band=line(A.p97)+' '+A.p3.slice().reverse().map(function(v,i){return 'L'+X(24-i).toFixed(1)+' '+Y(v).toFixed(1)}).join(' ')+' Z';
var g='<svg class="gc" viewBox="0 0 '+W+' '+H+'"><rect width="'+W+'" height="'+H+'" fill="#fff"/>';
for(var t=0;t<=4;t++){var v=lo+(hi-lo)*t/4;
g+='<line x1="'+L+'" y1="'+Y(v)+'" x2="'+(W-R)+'" y2="'+Y(v)+'" stroke="#F0E6DF"/><text x="'+(L-4)+'" y="'+(Y(v)+3.5)+'" font-size="8" fill="#8C8480" text-anchor="end">'+rnd(v)+'</text>'}
for(var mm=0;mm<=24;mm+=6){
g+='<line x1="'+X(mm)+'" y1="'+Tp+'" x2="'+X(mm)+'" y2="'+(H-B)+'" stroke="#F7F1EC"/><text x="'+X(mm)+'" y="'+(H-B+13)+'" font-size="8" fill="#8C8480" text-anchor="middle">'+mm+'개월</text>'}
g+='<path d="'+band+'" fill="#DCE9F7" opacity=".55"/><path d="'+line(A.p50)+'" fill="none" stroke="#6E9FD4" stroke-width="1.8"/>';
g+='<path d="'+line(A.p3)+'" fill="none" stroke="#A9C4E0" stroke-width="1" stroke-dasharray="3 2"/><path d="'+line(A.p97)+'" fill="none" stroke="#A9C4E0" stroke-width="1" stroke-dasharray="3 2"/>';
var pts=recs.map(function(r){return {x:X(Math.min(24,Math.max(0,ageMAt(r.d)))),y:Y(+r[k])}}).sort(function(a,b){return a.x-b.x});
if(pts.length>1)g+='<path d="'+pts.map(function(p,i){return (i?'L':'M')+p.x.toFixed(1)+' '+p.y.toFixed(1)}).join(' ')+'" fill="none" stroke="#F2734B" stroke-width="2.4"/>';
pts.forEach(function(p){g+='<circle cx="'+p.x.toFixed(1)+'" cy="'+p.y.toFixed(1)+'" r="4" fill="#F2734B" stroke="#fff" stroke-width="1.6"/>'});
g+='<text x="'+(L+2)+'" y="'+(Tp+9)+'" font-size="9" font-weight="bold" fill="#3E3A38">'+GN[k][0]+' ('+GN[k][1]+') · '+(sx==='m'?'남아':'여아')+'</text></svg>';
return g}
function addGrow(){var d=document.getElementById('grD').value,w=document.getElementById('grW').value,h=document.getElementById('grH').value,c=document.getElementById('grC').value;
if(!d)return alert('날짜를 선택해 주세요');
if(!w&&!h&&!c)return alert('측정값을 하나 이상 입력해 주세요');
grow.push(uNow({id:'g'+Date.now(),d:d,w:w||null,h:h||null,c:c||null}));save();render()}
function delGrow(id){if(!confirm('이 기록을 삭제할까요?'))return;
grow=grow.filter(function(g){return g.id!==id});save();render()}
