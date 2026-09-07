/*========== 🧮 계산 탭 ==========*/
var cTab='rice';
var CT=[['rice','🍚 배죽'],['milk','🍼 분유'],['spoon','🥄 계량'],['cube','🧊 큐브'],
['keep','🧊 보관'],['med','💊 해열제'],['body','📏 체격'],['scale','⚖️ 그릇']];

function vCalc(){return '<div class="cd" style="background:#F3F6FA;padding:9px 10px"><b style="font-size:13px">🧮 이유식 계산기</b><div class="mu" style="font-size:10.5px;margin-top:3px">모두 <b>오프라인에서 작동</b>합니다. 계산 결과는 참고값이며 최종 판단은 담당 소아과와 상의하세요.</div></div>'
+'<div class="tab">'+CT.map(function(x){return '<button class="'+(cTab===x[0]?'on':'')+'" onclick="cTab=\''+x[0]+'\';render()">'+x[1]+'</button>'}).join('')+'</div>'
+({rice:cRice,milk:cMilk,spoon:cSpoon,cube:cCube,keep:cKeep,med:cMed,body:cBody,scale:cScale}[cTab]||cRice)()}

/*========== 상태 ==========*/
var CV=LS('b6.calc',null)||{rW:30,rR:'',mlT:'',spQ:1,spK:'쌀(생)',cbT:'',cbG:10,kpD:ymd(TD()),kpT:'냉장',mdW:'',mdK:'ap',bdW:'',bdH:''};
function cvSave(){localStorage.setItem('b6.calc',JSON.stringify(CV))}
function cSet(k,v){CV[k]=v;cvSave();cLive()}
function cLive(){var el=document.getElementById('cres');if(el)el.innerHTML=({rice:cRiceRes,milk:cMilkRes,spoon:cSpoonRes,cube:cCubeRes,keep:cKeepRes,med:cMedRes,body:cBodyRes,scale:function(){return ''}}[cTab]||function(){return ''})()}
function cCard(t,d){return '<div class="cd" style="background:#FBF6F2;font-size:11.5px"><b>'+t+'</b><div class="mu" style="font-size:11px;margin-top:5px;line-height:1.6">'+d+'</div></div>'}

/*==================================================
  1) 배죽 계산기
==================================================*/
var RICE=[{k:'10',n:'10배죽',r:10,st:'초기 1단계',m:'6개월',tx:'완전히 갈아 체에 내림'},
{k:'8',n:'8배죽',r:8,st:'초기 2단계',m:'6.5개월',tx:'곱게 갈기'},
{k:'7',n:'7배죽',r:7,st:'중기 1단계',m:'7개월',tx:'2~3mm 입자'},
{k:'6',n:'6배죽',r:6,st:'중기 2단계',m:'8개월',tx:'3~4mm 입자'},
{k:'5',n:'5배죽',r:5,st:'후기 1단계',m:'9개월',tx:'5mm 이상'},
{k:'4',n:'4배죽(진밥)',r:4,st:'후기 2단계',m:'10개월',tx:'질게 지은 밥'},
{k:'2',n:'2배죽(무른밥)',r:2,st:'완료기',m:'12개월',tx:'일반 밥에 가깝게'}];
function autoRice(){var m=ageM();
for(var i=RICE.length-1;i>=0;i--)if(m>=parseFloat(RICE[i].m))return RICE[i].k;
return '10'}
function cRice(){var sel=CV.rR||autoRice();
return '<div class="cd"><b style="font-size:13.5px">🍚 배죽 비율 계산</b><div class="mu" style="font-size:10.5px;margin:3px 0 9px">쌀(또는 밥) 양을 넣으면 물 양을 계산합니다. <b>배죽 = 쌀 대비 물의 배수</b>입니다.</div>'
+'<div class="ch">'+RICE.map(function(x){return '<button class="'+(sel===x.k?'on':'')+'" onclick="cSet(\'rR\',\''+x.k+'\');render()">'+x.n+'</button>'}).join('')+'</div>'
+'<div class="mu" style="font-size:10px;margin-top:6px">현재 '+curS().n+' → <b>'+(RICE.filter(function(x){return x.k===autoRice()})[0]||RICE[0]).n+'</b> 권장</div>'
+'<div class="rw" style="margin-top:10px"><div class="fd" style="flex:1;margin:0"><label>쌀 또는 밥 (g)</label><input id="cRW" type="number" inputmode="decimal" value="'+CV.rW+'" oninput="CV.rW=this.value;cvSave();cLive()" placeholder="30"></div>'
+'<div class="fd" style="flex:1;margin:0"><label>기준</label><select onchange="cSet(\'rBase\',this.value)"><option value="rice" '+(CV.rBase!=='cook'?'selected':'')+'>생쌀</option><option value="cook" '+(CV.rBase==='cook'?'selected':'')+'>지은 밥</option></select></div></div>'
+'<div class="ch" style="margin-top:8px">'+[15,20,30,40,50,60].map(function(v){return '<button onclick="CV.rW='+v+';cvSave();render()">'+v+'g</button>'}).join('')+'</div></div>'
+'<div id="cres">'+cRiceRes()+'</div>'
+cCard('💡 배죽 이렇게 씁니다','<b>10배죽</b> = 쌀 1 : 물 10 (예: 쌀 20g + 물 200ml)<br>생쌀로 끓이면 불리는 시간(30분~1시간)을 두세요. <b>지은 밥</b>으로 만들 때는 물을 배죽의 <b>절반 정도</b>로 줄입니다(밥에 이미 수분이 있음).<br>조리 중 수분이 날아가므로 <b>10~15% 여유</b>를 두면 좋습니다.')}
function cRiceRes(){var sel=CV.rR||autoRice(),R=RICE.filter(function(x){return x.k===sel})[0]||RICE[0];
var w=+CV.rW||0,cook=CV.rBase==='cook';
var mul=cook?R.r/2:R.r,water=Math.round(w*mul);
var loss=Math.round(water*1.12),done=Math.round(w*(cook?1:2.4)+water*.82);
if(!w)return '<div class="cd mu" style="font-size:11.5px">쌀 양을 입력해 주세요.</div>';
return '<div class="cd" style="background:#F3FAF7"><div class="rw" style="justify-content:space-between;align-items:center"><b style="font-size:14px">'+R.n+'</b><span class="tg p">'+R.st+' · '+R.m+'+</span></div>'
+'<div class="ir" style="margin-top:7px"><span>'+(cook?'지은 밥':'생쌀')+'</span><b>'+w+'g</b></div>'
+'<div class="ir"><span>넣을 물</span><b style="font-size:19px;color:var(--pd)">'+water+'ml</b></div>'
+'<div class="ir"><span>졸아드는 것 감안</span><b>'+loss+'ml 권장</b></div>'
+'<div class="ir" style="border:0"><span>완성 예상량</span><b>약 '+done+'g</b></div>'
+'<div class="mu" style="font-size:10.5px;margin-top:6px">입자 — '+R.tx+'</div></div>'
+'<div class="cd"><b style="font-size:12.5px">📐 다른 양으로도 보기</b><table class="tb" style="margin-top:6px"><tr><th>쌀</th><th>물</th><th>완성(약)</th></tr>'
+[15,20,30,40,50].map(function(v){return '<tr'+(v===w?' style="background:#FFF6EC;font-weight:800"':'')+'><td>'+v+'g</td><td>'+Math.round(v*mul)+'ml</td><td>'+Math.round(v*(cook?1:2.4)+v*mul*.82)+'g</td></tr>'}).join('')+'</table></div>'}

/*==================================================
  2) 분유 타기 계산
==================================================*/
function cMilk(){var G=mlGuide();
return '<div class="cd"><b style="font-size:13.5px">🍼 분유 타기 · 하루 수유량</b><div class="mu" style="font-size:10.5px;margin:3px 0 9px">만들 총량을 넣으면 물과 스푼 수를 계산합니다.</div>'
+'<div class="rw"><div class="fd" style="flex:1;margin:0"><label>만들 총량 (ml)</label><input type="number" inputmode="decimal" value="'+(CV.mlT||'')+'" oninput="CV.mlT=this.value;cvSave();cLive()" placeholder="'+G.per[0]+'"></div>'
+'<div class="fd" style="flex:1;margin:0"><label>1스푼당 물 (ml)</label><select onchange="cSet(\'mlS\',this.value)">'+[20,30,40].map(function(v){return '<option value="'+v+'" '+((+CV.mlS||20)===v?'selected':'')+'>'+v+'ml</option>'}).join('')+'</select></div></div>'
+'<div class="ch" style="margin-top:8px">'+milkQuick().map(function(v){return '<button class="'+((+CV.mlT||0)===v?'on':'')+'" onclick="CV.mlT='+v+';cvSave();render()">'+v+'ml</button>'}).join('')+'</div>'
+'<div class="mu" style="font-size:10px;margin-top:6px">제품마다 스푼 기준이 다릅니다 — <b>반드시 캔 표기</b>를 확인하세요.</div></div>'
+'<div id="cres">'+cMilkRes()+'</div>'
+cCard('💡 분유 타는 순서','① 끓여서 <b>70℃ 이상</b>으로 식힌 물을 먼저 붓습니다<br>② 스푼은 <b>깎아서</b> 평평하게 넣습니다<br>③ 굴려서 섞고 <b>손목 안쪽</b>에 떨어뜨려 온도 확인<br>④ 만든 분유는 <b>2시간 안에</b> 먹이고 남은 것은 버립니다<br>물을 먼저 넣어야 표기 농도가 맞습니다.')}
function cMilkRes(){var t=+CV.mlT||0,per=+CV.mlS||20,G=mlGuide(),DY=mlDay();
if(!t)return '<div class="cd mu" style="font-size:11.5px">만들 총량을 입력해 주세요.</div>';
var sp=t/per,spR=Math.round(sp*2)/2;
var inR=(t>=G.per[0]&&t<=G.per[1]);
return '<div class="cd" style="background:#F3FAF7"><div class="ir"><span>물</span><b style="font-size:18px;color:var(--pd)">'+t+'ml</b></div>'
+'<div class="ir"><span>분유 스푼</span><b style="font-size:18px;color:var(--pd)">'+spR+'스푼</b></div>'
+'<div class="ir" style="border:0"><span>회당 권장 ('+G.lb+')</span><b style="color:'+(inR?'var(--ok)':'var(--warn)')+'">'+G.per[0]+'~'+G.per[1]+'ml '+(inR?'✅':'⚠️')+'</b></div>'
+(sp!==spR?'<div class="mu" style="font-size:10.5px;margin-top:5px">정확히는 '+rnd(sp)+'스푼 — 물을 '+(spR*per)+'ml로 맞추면 딱 '+spR+'스푼입니다.</div>':'')+'</div>'
+'<div class="cd"><b style="font-size:12.5px">📊 하루 기준</b>'
+'<div class="ir" style="margin-top:6px"><span>이 양으로 '+G.cnt[0]+'회</span><b>'+(t*G.cnt[0])+'ml</b></div>'
+'<div class="ir"><span>이 양으로 '+G.cnt[1]+'회</span><b>'+(t*G.cnt[1])+'ml</b></div>'
+'<div class="ir" style="border:0"><span>하루 권장 총량</span><b style="color:var(--ok)">'+DY.lo+'~'+DY.hi+'ml</b></div>'
+'<div class="mu" style="font-size:10.5px;margin-top:6px">오늘 기록된 수유량은 <b>'+todaySum().ml+'ml</b>입니다.</div></div>'}

/*==================================================
  3) 계량 환산
==================================================*/
var SPN={'쌀(생)':{ts:5,tb:15,cup:180},'밥':{ts:6,tb:18,cup:200},'물':{ts:5,tb:15,cup:200},
'오트밀':{ts:3,tb:9,cup:90},'밀가루':{ts:3,tb:9,cup:110},'설탕':{ts:4,tb:12,cup:150},
'참기름':{ts:4.5,tb:13,cup:180},'분유가루':{ts:2.5,tb:7.5,cup:90},'멸치가루':{ts:2,tb:6,cup:70},
'다진 고기':{ts:6,tb:18,cup:210},'두부':{ts:6,tb:18,cup:220},'요거트':{ts:6,tb:18,cup:230}};
function cSpoon(){var ks=Object.keys(SPN);
return '<div class="cd"><b style="font-size:13.5px">🥄 계량 환산</b><div class="mu" style="font-size:10.5px;margin:3px 0 9px">저울이 없을 때 숟가락·컵으로 어림잡습니다.</div>'
+'<div class="fd" style="margin:0"><label>재료</label><select onchange="cSet(\'spK\',this.value)">'+ks.map(function(k){return '<option '+(CV.spK===k?'selected':'')+'>'+k+'</option>'}).join('')+'</select></div>'
+'<div class="rw" style="margin-top:9px"><div class="fd" style="flex:1;margin:0"><label>수량</label><input type="number" step="0.5" inputmode="decimal" value="'+CV.spQ+'" oninput="CV.spQ=this.value;cvSave();cLive()"></div>'
+'<div class="fd" style="flex:1.2;margin:0"><label>단위</label><select onchange="cSet(\'spU\',this.value)">'
+[['ts','작은술(5ml)'],['tb','큰술(15ml)'],['cup','컵(200ml)'],['g','그램(g)']].map(function(x){return '<option value="'+x[0]+'" '+((CV.spU||'tb')===x[0]?'selected':'')+'>'+x[1]+'</option>'}).join('')+'</select></div></div></div>'
+'<div id="cres">'+cSpoonRes()+'</div>'
+cCard('💡 계량 기준','작은술(ts) = 5ml · 큰술(tb) = 15ml · 컵 = 200ml 기준입니다.<br>가루류는 <b>깎아서</b> 평평하게, 고기·두부는 <b>꾹 눌러</b> 담은 기준입니다. 재료 상태(수분·입자)에 따라 ±15% 차이가 날 수 있어 <b>저울이 가장 정확</b>합니다.')}
function cSpoonRes(){var k=CV.spK||'쌀(생)',S=SPN[k],q=+CV.spQ||0,u=CV.spU||'tb';
if(!q)return '<div class="cd mu" style="font-size:11.5px">수량을 입력해 주세요.</div>';
var g=(u==='g')?q:q*S[u];
return '<div class="cd" style="background:#F3FAF7"><div class="rw" style="justify-content:space-between;align-items:baseline"><b style="font-size:13px">'+k+'</b><b style="font-size:22px;color:var(--pd)">'+rnd(g)+'g</b></div>'
+'<div class="hr"></div><div class="ir"><span>작은술로</span><b>'+rnd(g/S.ts)+'개</b></div>'
+'<div class="ir"><span>큰술로</span><b>'+rnd(g/S.tb)+'개</b></div>'
+'<div class="ir" style="border:0"><span>컵으로</span><b>'+rnd2(g/S.cup)+'컵</b></div>'
+(NUT[k]||NUT[k.replace(/\(.*\)/,'')]?nutMini(k.replace(/\(.*\)/,''),g):'')+'</div>'}
function nutMini(k,g){var v=NUT[k];if(!v)return '';
return '<div class="hr"></div><div class="mu" style="font-size:10.5px;font-weight:800;margin-bottom:4px">이 양의 영양</div><div class="rw">'
+NK.map(function(kk){return '<div style="flex:1;text-align:center;background:#fff;border-radius:8px;padding:6px 2px"><div class="mu" style="font-size:9px">'+NL[kk][0]+'</div><b style="font-size:12px;color:'+NL[kk][2]+'">'+rnd(v[NI[kk]]*g/100)+'</b></div>'}).join('')+'</div>'}

/*==================================================
  4) 큐브 계산
==================================================*/
function cCube(){return '<div class="cd"><b style="font-size:13.5px">🧊 큐브 계산</b><div class="mu" style="font-size:10.5px;margin:3px 0 9px">만들 총량과 큐브 1칸 용량으로 개수·소진일을 계산합니다.</div>'
+'<div class="rw"><div class="fd" style="flex:1;margin:0"><label>재료 총량 (g)</label><input type="number" inputmode="decimal" value="'+(CV.cbT||'')+'" oninput="CV.cbT=this.value;cvSave();cLive()" placeholder="140"></div>'
+'<div class="fd" style="flex:1;margin:0"><label>1칸 용량 (g)</label><select onchange="cSet(\'cbG\',this.value)">'+[10,15,20,25,30,50].map(function(v){return '<option value="'+v+'" '+((+CV.cbG||10)===v?'selected':'')+'>'+v+'g</option>'}).join('')+'</select></div></div>'
+'<div class="rw" style="margin-top:9px"><div class="fd" style="flex:1;margin:0"><label>하루에 몇 칸 쓰나요?</label><input type="number" step="0.5" inputmode="decimal" value="'+(CV.cbD||1)+'" oninput="CV.cbD=this.value;cvSave();cLive()"></div>'
+'<div class="fd" style="flex:1;margin:0"><label>만든 날</label><input type="date" value="'+(CV.cbDt||ymd(TD()))+'" onchange="cSet(\'cbDt\',this.value)"></div></div></div>'
+'<div id="cres">'+cCubeRes()+'</div>'
+cCard('💡 큐브 보관 원칙','완전히 <b>식힌 뒤</b> 뚜껑을 덮어 냉동합니다.<br>권장 사용기한은 <b>만든 날부터 14일</b>(육류·어류는 7일 권장).<br>한 번 해동한 것은 <b>재냉동 금지</b>. 지퍼백에 재료명·날짜를 적어두세요.')}
function cCubeRes(){var t=+CV.cbT||0,g=+CV.cbG||10,d=+CV.cbD||1;
if(!t)return '<div class="cd mu" style="font-size:11.5px">재료 총량을 입력해 주세요.</div>';
var n=Math.floor(t/g),rest=Math.round((t-n*g)*10)/10;
var days=d>0?Math.floor(n/d):0;
var made=CV.cbDt?d0(CV.cbDt):TD(),exp=addD(made,14),left=Math.ceil((exp-TD())/864e5);
var runOut=addD(TD(),days);
return '<div class="cd" style="background:#F3FAF7"><div class="rw" style="justify-content:space-between;align-items:baseline"><span class="mu">만들 수 있는 큐브</span><b style="font-size:24px;color:var(--pd)">'+n+'칸</b></div>'
+(rest?'<div class="ir" style="margin-top:5px"><span>남는 양</span><b>'+rest+'g</b></div>':'')
+'<div class="ir"><span>하루 '+d+'칸 사용 시</span><b>'+days+'일분</b></div>'
+'<div class="ir"><span>소진 예상일</span><b>'+fmt(runOut)+'</b></div>'
+'<div class="ir" style="border:0"><span>권장 사용기한</span><b style="color:'+(left<=2?'var(--rd)':left<=5?'var(--warn)':'var(--ok)')+'">'+fmt(exp)+' (D'+(left>=0?'-'+left:'+'+(-left))+')</b></div>'
+(days>14?'<div class="alert mid" style="margin-top:8px"><span class="ic">⚠️</span><div>소진까지 <b>'+days+'일</b>이 걸려 권장 기한(14일)을 넘깁니다. 양을 줄여 만드는 편이 좋아요.</div></div>':'')
+'</div>'
+'<div class="cd"><b style="font-size:12.5px">🥣 1칸 용량별 개수</b><table class="tb" style="margin-top:6px"><tr><th>1칸</th><th>개수</th><th>남는 양</th></tr>'
+[10,15,20,25,30].map(function(v){return '<tr'+(v===g?' style="background:#FFF6EC;font-weight:800"':'')+'><td>'+v+'g</td><td>'+Math.floor(t/v)+'칸</td><td>'+rnd(t-Math.floor(t/v)*v)+'g</td></tr>'}).join('')+'</table>'
+'<button class="btn g s" style="margin-top:9px" onclick="tab=\'plan\';pTab=\'c\';render()">🧊 큐브 재고에 등록하러 가기</button></div>'}

/*==================================================
  5) 보관·해동 기한
==================================================*/
var KEEP={'이유식(조리 완료)':{f:1,r:2,z:14},'죽·미음':{f:1,r:2,z:14},'육류 큐브':{f:0,r:1,z:7},
'어류 큐브':{f:0,r:1,z:7},'채소 큐브':{f:1,r:2,z:14},'과일 퓨레':{f:0,r:1,z:14},
'분유(타놓은 것)':{f:0,r:0,z:0,h:2},'모유(짜놓은 것)':{f:0,r:4,z:180,h:4},'생고기·생선(조리 전)':{f:0,r:1,z:30}};
function cKeep(){var ks=Object.keys(KEEP);
return '<div class="cd"><b style="font-size:13.5px">🧊 보관 기한 계산</b><div class="mu" style="font-size:10.5px;margin:3px 0 9px">만든 날을 넣으면 언제까지 먹여도 되는지 계산합니다.</div>'
+'<div class="fd" style="margin:0"><label>무엇인가요?</label><select onchange="cSet(\'kpK\',this.value)">'+ks.map(function(k){return '<option '+((CV.kpK||ks[0])===k?'selected':'')+'>'+k+'</option>'}).join('')+'</select></div>'
+'<div class="rw" style="margin-top:9px"><div class="fd" style="flex:1;margin:0"><label>만든 날 · 짠 날</label><input type="date" value="'+(CV.kpD||ymd(TD()))+'" onchange="cSet(\'kpD\',this.value)"></div>'
+'<div class="fd" style="flex:1;margin:0"><label>시각</label><input type="time" value="'+(CV.kpTm||nowHM())+'" onchange="cSet(\'kpTm\',this.value)"></div></div></div>'
+'<div id="cres">'+cKeepRes()+'</div>'
+cCard('💡 해동은 이렇게','<b>냉장 해동</b>(전날 냉장실로 옮기기)이 가장 안전합니다.<br>급할 때는 <b>중탕</b>이나 전자레인지 해동 후 <b>골고루 저어</b> 온도를 균일하게 하세요 — 부분 과열로 입천장을 델 수 있습니다.<br><b>실온 방치·재냉동은 금지</b>입니다. 한 번 데운 것은 남기면 버립니다.')}
function cKeepRes(){var ks=Object.keys(KEEP),k=CV.kpK||ks[0],K=KEEP[k];
var base=CV.kpD?d0(CV.kpD):TD();
var rows=[];
if(K.h)rows.push(['실온 (만든 후)',K.h+'시간',null]);
if(K.f)rows.push(['실온 보관','권장 안 함',null]);
if(K.r)rows.push(['냉장 (0~4℃)',K.r+'일',addD(base,K.r)]);
if(K.z)rows.push(['냉동 (-18℃)',K.z+'일',addD(base,K.z)]);
if(!rows.length)rows.push(['즉시 섭취','만든 즉시',null]);
var main=rows[rows.length-1],left=main[2]?Math.ceil((main[2]-TD())/864e5):null;
return '<div class="cd" style="background:'+(left!==null&&left<0?'#FDF3F0':'#F3FAF7')+'"><b style="font-size:13.5px">'+k+'</b>'
+'<div class="mu" style="font-size:10.5px;margin:3px 0 7px">기준일 '+fmt(base)+(CV.kpTm?' '+CV.kpTm:'')+'</div>'
+rows.map(function(r){return '<div class="ir"><span>'+r[0]+'</span><b>'+r[1]+(r[2]?' · '+fmt(r[2])+'까지':'')+'</b></div>'}).join('')
+(left!==null?'<div class="ir" style="border:0"><span style="font-weight:800">남은 기간</span><b style="font-size:17px;color:'+(left<0?'var(--rd)':left<=2?'var(--warn)':'var(--ok)')+'">'+(left<0?'기한 초과 ('+(-left)+'일 지남)':left+'일 남음')+'</b></div>':'')
+(left!==null&&left<0?'<div class="alert bad" style="margin-top:8px"><span class="ic">🚫</span><div>권장 기한을 넘겼습니다. <b>먹이지 말고 폐기</b>하세요.</div></div>':'')
+(K.h?'<div class="alert mid" style="margin-top:8px"><span class="ic">⏰</span><div>만든 후 <b>'+K.h+'시간</b> 안에 먹이고, 아기가 <b>입을 댄 것은 남기지 말고 버리세요</b>(세균 번식).</div></div>':'')
+'</div>'
+'<div style="margin-top:8px">'+sT('mfds')+'</div>'}

/*==================================================
  6) 체중당 해열제 용량
==================================================*/
var MED={ap:{n:'아세트아미노펜',b:'타이레놀·챔프(빨강)',mg:12.5,max:5,int:'4~6시간',conc:32,unit:'mg/ml',min:0,note:'생후 3개월 미만은 반드시 진료 후 복용'},
ib:{n:'이부프로펜',b:'부루펜·챔프(파랑)',mg:7.5,max:4,int:'6~8시간',conc:20,unit:'mg/ml',min:6,note:'생후 6개월 미만 복용 금지 · 탈수·수분부족 시 주의'}};
function cMed(){var w=+CV.mdW||curW()||0;
return '<div class="alert bad" style="margin-bottom:10px"><span class="ic">⚠️</span><div><b>참고용 계산기입니다.</b> 실제 복용량은 <b>제품 설명서와 소아과·약사 지시</b>를 따르세요. 제품마다 농도가 다르므로 반드시 병 표기를 확인해야 합니다.</div></div>'
+'<div class="cd"><b style="font-size:13.5px">💊 체중당 해열제 용량</b>'
+'<div class="ch" style="margin-top:8px">'+Object.keys(MED).map(function(k){return '<button class="'+((CV.mdK||'ap')===k?'on':'')+'" onclick="cSet(\'mdK\',\''+k+'\');render()">'+MED[k].n+'</button>'}).join('')+'</div>'
+'<div class="rw" style="margin-top:9px"><div class="fd" style="flex:1;margin:0"><label>몸무게 (kg)</label><input type="number" step="0.1" inputmode="decimal" value="'+(CV.mdW||'')+'" oninput="CV.mdW=this.value;cvSave();cLive()" placeholder="'+(curW()||8)+'"></div>'
+'<div class="fd" style="flex:1;margin:0"><label>제품 농도</label><input type="number" step="0.1" inputmode="decimal" value="'+(CV.mdC||MED[CV.mdK||'ap'].conc)+'" oninput="CV.mdC=this.value;cvSave();cLive()"></div></div>'
+'<div class="mu" style="font-size:10px;margin-top:5px">농도 = 1ml에 들어있는 mg. 병 라벨의 「'+MED[CV.mdK||'ap'].conc+'mg/ml」 같은 표기를 넣으세요.</div>'
+(curW()?'<button class="btn g s" style="margin-top:8px" onclick="CV.mdW='+curW()+';cvSave();render()">📈 최근 기록 체중 '+curW()+'kg 넣기</button>':'')+'</div>'
+'<div id="cres">'+cMedRes()+'</div>'
+cCard('🌡 해열제 기본 원칙','열 자체보다 <b>아기 상태</b>가 중요합니다. 잘 놀고 잘 먹으면 38.5℃ 미만은 지켜볼 수 있습니다.<br>같은 약은 <b>정해진 간격</b>을 지키고, 교차 복용은 소아과 지시가 있을 때만 하세요.<br><b>즉시 병원</b> — 생후 3개월 미만의 발열, 39℃ 이상 지속, 경련, 처지고 안 먹을 때, 목이 뻣뻣할 때.')}
function cMedRes(){var k=CV.mdK||'ap',M=MED[k],w=+CV.mdW||0,conc=+CV.mdC||M.conc,m=ageM();
if(!w)return '<div class="cd mu" style="font-size:11.5px">몸무게를 입력해 주세요.</div>';
var mg=w*M.mg,ml=mg/conc;
var dayMg=mg*M.max,blocked=(m<M.min);
return '<div class="cd" style="background:'+(blocked?'#FDF3F0':'#F3FAF7')+'"><div class="rw" style="justify-content:space-between;align-items:center"><b style="font-size:13.5px">'+M.n+'</b><span class="mu" style="font-size:10.5px">'+M.b+'</span></div>'
+(blocked?'<div class="alert bad" style="margin-top:8px"><span class="ic">🚫</span><div>생후 <b>'+M.min+'개월 미만</b>은 이 약을 쓰지 않습니다. 현재 만 '+Math.floor(m)+'개월 — <b>소아과 진료</b>를 받으세요.</div></div>'
:'<div class="ir" style="margin-top:7px"><span>1회 용량</span><b style="font-size:22px;color:var(--pd)">'+rnd(ml)+'ml</b></div>'
+'<div class="ir"><span>성분량</span><b>'+rnd(mg)+'mg ('+w+'kg × '+M.mg+'mg)</b></div>'
+'<div class="ir"><span>복용 간격</span><b>'+M.int+'</b></div>'
+'<div class="ir"><span>하루 최대</span><b>'+M.max+'회 · '+rnd(dayMg)+'mg</b></div>'
+'<div class="ir" style="border:0"><span>다음 복용 가능</span><b>'+M.int.split('~')[0]+'시간 후부터</b></div>')
+'<div class="mu" style="font-size:10.5px;margin-top:7px;color:var(--rd);font-weight:700">※ '+M.note+'</div></div>'
+(!blocked?'<div class="cd"><b style="font-size:12.5px">📐 체중별 참고표 ('+conc+'mg/ml)</b><table class="tb" style="margin-top:6px"><tr><th>체중</th><th>성분량</th><th>1회 용량</th></tr>'
+[5,6,7,8,9,10,12,14].map(function(v){return '<tr'+(Math.abs(v-w)<.6?' style="background:#FFF6EC;font-weight:800"':'')+'><td>'+v+'kg</td><td>'+rnd(v*M.mg)+'mg</td><td>'+rnd(v*M.mg/conc)+'ml</td></tr>'}).join('')+'</table>'
+'<div class="mu" style="font-size:10px;margin-top:5px">계산 기준 — '+M.n+' 1회 '+M.mg+'mg/kg</div></div>':'')}

/*==================================================
  7) 체격 지표
==================================================*/
function cBody(){var w=+CV.bdW||curW()||'',h=+CV.bdH||0,lg=lastG('h');
return '<div class="cd"><b style="font-size:13.5px">📏 체격 지표</b><div class="mu" style="font-size:10.5px;margin:3px 0 9px">체중·키로 성장 균형과 백분위를 계산합니다.</div>'
+'<div class="rw"><div class="fd" style="flex:1;margin:0"><label>몸무게 (kg)</label><input type="number" step="0.01" inputmode="decimal" value="'+(CV.bdW||'')+'" oninput="CV.bdW=this.value;cvSave();cLive()" placeholder="'+(curW()||8)+'"></div>'
+'<div class="fd" style="flex:1;margin:0"><label>키 (cm)</label><input type="number" step="0.1" inputmode="decimal" value="'+(CV.bdH||'')+'" oninput="CV.bdH=this.value;cvSave();cLive()" placeholder="'+(lg?lg.h:70)+'"></div></div>'
+((curW()||lg)?'<button class="btn g s" style="margin-top:8px" onclick="CV.bdW='+(curW()||0)+';CV.bdH='+(lg?lg.h:0)+';cvSave();render()">📈 최근 성장기록 값 넣기</button>':'')+'</div>'
+'<div id="cres">'+cBodyRes()+'</div>'
+cCard('💡 무엇을 보나요','한 시점의 값보다 <b>곡선을 따라 꾸준히 자라는지</b>가 중요합니다.<br><b>카우프 지수</b>(체중/키²)는 영아의 살집을 보는 지표로, 성인 BMI와 기준이 다릅니다.<br>2개 이상의 백분위 구간을 급히 벗어나면 소아과 상담을 권합니다.')}
function cBodyRes(){var w=+CV.bdW||0,h=+CV.bdH||0,sx=baby.sex||'f',m=Math.min(24,Math.max(0,ageM()));
if(!w||!h)return '<div class="cd mu" style="font-size:11.5px">몸무게와 키를 모두 입력해 주세요.</div>';
var kaup=w/Math.pow(h/100,2);
var AW=gArr('w',sx),AH=gArr('h',sx);
var pw=pctOf(w,ipol(AW.p3,m),ipol(AW.p50,m),ipol(AW.p97,m));
var pht=pctOf(h,ipol(AH.p3,m),ipol(AH.p50,m),ipol(AH.p97,m));
var kl=kaup<14?'마른 편':kaup<18?'적정':kaup<20?'통통한 편':'과체중 경향';
var kc=kaup<14?'var(--warn)':kaup<18?'var(--ok)':kaup<20?'var(--warn)':'var(--rd)';
var gap=Math.abs(pw-pht);
return '<div class="cd" style="background:#F3FAF7"><div class="rw"><div style="flex:1;text-align:center"><div class="mu" style="font-size:10px">체중 백분위</div><b style="font-size:20px;color:'+(pw<3||pw>97?'var(--rd)':'var(--pd)')+'">'+Math.round(pw)+'</b></div>'
+'<div style="flex:1;text-align:center"><div class="mu" style="font-size:10px">키 백분위</div><b style="font-size:20px;color:'+(pht<3||pht>97?'var(--rd)':'var(--pd)')+'">'+Math.round(pht)+'</b></div>'
+'<div style="flex:1;text-align:center"><div class="mu" style="font-size:10px">카우프 지수</div><b style="font-size:20px;color:'+kc+'">'+rnd(kaup)+'</b></div></div>'
+'<div class="hr"></div><div class="ir"><span>체격 판정</span><b style="color:'+kc+'">'+kl+'</b></div>'
+'<div class="ir" style="border:0"><span>키·체중 균형</span><b style="color:'+(gap>40?'var(--warn)':'var(--ok)')+'">'+(gap>40?'차이 큼 ('+Math.round(gap)+'p)':'균형적 ('+Math.round(gap)+'p)')+'</b></div>'
+(gap>40?'<div class="alert mid" style="margin-top:8px"><span class="ic">⚠️</span><div>키와 체중 백분위 차이가 커요. 한쪽만 빠르게 변하는 중일 수 있으니 <b>다음 검진에서 확인</b>해 보세요.</div></div>':'')
+'<div class="mu" style="font-size:10px;margin-top:6px">만 '+Math.floor(m)+'개월 '+(sx==='m'?'남아':'여아')+' 기준 · WHO 성장곡선 근사값</div></div>'
+'<button class="btn g s" onclick="tab=\'grow\';render()">📈 성장곡선에서 보기</button>'
+'<div style="margin-top:8px">'+sT('who')+sT('kdca')+'</div>'}

/*==================================================
  8) 그릇 무게 (기존 계산기 재사용)
==================================================*/
function cScale(){var b=bwCur();
return '<div class="cd"><b style="font-size:13.5px">⚖️ 그릇 무게로 먹은 양</b><div class="mu" style="font-size:10.5px;margin:3px 0 9px">먹이기 전·후 무게로 실제 먹은 양을 계산합니다. 기록에 바로 반영할 수도 있어요.</div>'
+'<button class="btn" onclick="openScale(\'gA\')">⚖️ 계산기 열기</button>'
+'<button class="btn g s" style="margin-top:8px" onclick="scMgrCore(\'drawScale\')">🥣 그릇 무게 관리</button>'
+'<div class="mu" style="font-size:10.5px;margin-top:9px">현재 그릇 — <b>'+(b?esc(b.n)+' '+b.w+'g':'등록된 그릇 없음')+'</b> · 총 '+BW.list.length+'개 등록</div></div>'
+cCard('💡 이렇게 쓰면 편해요','자주 쓰는 그릇의 <b>빈 무게</b>를 미리 등록해 두면 매번 재지 않아도 됩니다.<br>「먹었어요」를 누를 때도 같은 계산기가 열려서, <b>실제 먹은 양만큼 영양이 계산</b>됩니다.<br>담아준 양 대비 <b>섭취율(%)</b>도 함께 보여주므로 식욕 변화를 알아채기 쉽습니다.')}
