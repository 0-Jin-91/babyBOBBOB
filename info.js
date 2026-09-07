/*========== 정보 · 설정 탭 ==========*/
function vInfo(){var T=TG(),dri=T.dri;
return '<div class="cd"><b>⚙️ 식사·수유 설정</b>'
+'<div class="fd" style="margin:10px 0 0"><label>하루 이유식 끼니 수</label><select onchange="baby.meals=+this.value;todaySel=null;plan=null;save();render()">'+[1,2,3].map(function(n){return '<option value="'+n+'" '+(MEALS()===n?'selected':'')+'>'+n+'끼</option>'}).join('')+'</select></div>'
+'<div class="fd" style="margin:10px 0 0"><label>수유 방식 (영양 계산 기준)</label><select onchange="baby.feed=this.value;todaySel=null;plan=null;save();render()">'+[['f','분유 위주'],['b','모유 위주'],['m','혼합']].map(function(x){return '<option value="'+x[0]+'" '+(baby.feed===x[0]?'selected':'')+'>'+x[1]+'</option>'}).join('')+'</select></div>'
+'<div class="fd" style="margin:10px 0 0"><label>성별 (성장곡선)</label><select onchange="baby.sex=this.value;save();render()">'+[['f','여아'],['m','남아']].map(function(x){return '<option value="'+x[0]+'" '+(baby.sex===x[0]?'selected':'')+'>'+x[1]+'</option>'}).join('')+'</select></div>'
+'<div class="fd" style="margin:10px 0 0"><label>기본 1회 수유량 (ml)</label><input type="number" value="'+(baby.vol||180)+'" oninput="baby.vol=+this.value;save()"></div>'
+'<div class="fd" style="margin:10px 0 0"><label>영양 목표 기준</label><select onchange="baby.useW=+this.value;save();render()"><option value="1" '+(baby.useW!==0?'selected':'')+'>우리 아기 체중 기준(권장)</option><option value="0" '+(baby.useW===0?'selected':'')+'>표준 기준</option></select></div></div>'

/*----- 계산 기준 표 -----*/
+'<div class="cd" style="background:#F3F6FA"><b>🧮 지금 적용 중인 영양 계산 기준</b>'
+'<table class="tb" style="margin-top:7px"><tr><th></th><th>열량</th><th>단백질</th><th>철</th><th>칼슘</th><th>아연</th></tr>'
+'<tr><td>표준('+dri.lb+')</td><td>'+dri.kcal+'</td><td>'+dri.p+'</td><td>'+dri.fe+'</td><td>'+dri.ca+'</td><td>'+dri.zn+'</td></tr>'
+'<tr><td>적용 하루 목표</td><td><b>'+Math.round(T.day.kcal)+'</b></td><td><b>'+rnd(T.day.p)+'</b></td><td><b>'+T.day.fe+'</b></td><td><b>'+T.day.ca+'</b></td><td><b>'+T.day.zn+'</b></td></tr>'
+'<tr><td>이유식 담당비율</td><td>'+Math.round(T.sfk.kcal*100)+'%</td><td>'+Math.round(T.sfk.p*100)+'%</td><td>'+Math.round(T.sfk.fe*100)+'%</td><td>'+Math.round(T.sfk.ca*100)+'%</td><td>'+Math.round(T.sfk.zn*100)+'%</td></tr>'
+'<tr><td>이유식 목표량</td><td>'+Math.round(T.solid.kcal)+'</td><td>'+rnd(T.solid.p)+'</td><td>'+rnd(T.solid.fe)+'</td><td>'+Math.round(T.solid.ca)+'</td><td>'+rnd(T.solid.zn)+'</td></tr></table>'
+'<div class="mu" style="font-size:11px;margin-top:7px">'+(T.use?'몸무게 <b>'+T.w+'kg × '+dri.ekg+'kcal/kg</b>으로 열량, <b>× '+dri.pkg+'g/kg</b>으로 단백질을 계산했습니다.':'몸무게 미입력 또는 표준 기준 선택 상태입니다.')+'</div>'
+'<div class="mu" style="font-size:11px;margin-top:5px"><b>이유식 담당비율</b>은 영양소마다 다릅니다. 예컨대 칼슘·열량은 수유가 대부분 담당하고, 단백질·아연은 이유식 비중이 큽니다.'+(T.bm?' <b>모유수유</b> 중이므로 철분·칼슘의 이유식 담당비율을 높게 잡았습니다.':'')+'</div>'
+'<div class="mu" style="font-size:11px;margin-top:5px"><b>경고 기준</b> — 🚨 '+LV.mid+'% 미만 / ⚠️ '+LV.mid+'~'+LV.ok+'% / ✅ '+LV.ok+'% 이상 / ⚠️ '+LV.over+'% 초과. 각 경고를 <b>누르면 원인과 개선안</b>이 나옵니다.</div>'
+'<div style="margin-top:7px">'+sT('kdri')+sT('fe')+'</div></div>'

/*----- 원칙 · 단계 요약 · 출처 -----*/
+'<div class="cd" style="background:#FFF6EC"><b>📖 이유식 기본 원칙</b><p class="mu" style="margin:6px 0 0;font-size:11px">널리 알려진 소아과적 원칙과 공공 지침을 정리한 내용입니다. 책 문장을 그대로 옮긴 것이 아니므로 원서와 담당 소아과에서 확인해 주세요.</p></div>'
+RL.map(function(r,i){return '<div class="cd"><b style="font-size:14px">'+(i+1)+'. '+r[0]+'</b><p class="mu" style="margin:5px 0 7px">'+r[2]+'</p>'+r[1].map(sT).join('')+'</div>'}).join('')
+'<div class="st">단계별 요약</div><div class="cd" style="font-size:12.5px">'+STG.slice(1).map(function(s){var SF=SFT[s.id];
return '<div style="padding:8px 0;border-bottom:1px solid var(--ln)"><b style="color:'+(s.c==='#FFC861'?'#B07C13':s.c)+'">'+s.n+' · '+s.lb+'</b><div class="mu" style="font-size:11.5px">'+s.ra+' · '+s.ct+' · '+s.am+'</div><div class="mu" style="font-size:10.5px">이유식 담당 — 열량 '+Math.round(SF.kcal*100)+'% · 단백 '+Math.round(SF.p*100)+'% · 철 '+Math.round(SF.fe*100)+'% · 칼슘 '+Math.round(SF.ca*100)+'%</div></div>'}).join('')+'<div class="mu" style="font-size:10.5px;margin-top:6px">※ 일반적 수유량을 감안한 앱의 계산 기준입니다.</div></div>'
+'<div class="st">전체 출처</div><div class="cd">'+Object.keys(SRC).map(function(k){return '<div style="padding:8px 0;border-bottom:1px solid var(--ln)"><span class="tg v">'+SRC[k].t+'</span><b style="display:block;font-size:13px;margin:3px 0">'+SRC[k].n+'</b><div class="mu" style="font-size:11.5px">'+SRC[k].d+'</div><a style="font-size:11px" href="'+SRC[k].u+'" target="_blank" rel="noopener">'+SRC[k].u+'</a></div>'}).join('')+'</div>'

/*----- 백업 · 아기 정보 -----*/
+'<div class="st">백업 · 아빠 폰 공유</div><div class="cd"><p class="mu" style="margin:0 0 10px">백업 파일을 카톡으로 보내고 상대 폰에서 불러오면 모든 데이터(성장기록 포함)가 옮겨집니다.</p><button class="btn g s" onclick="expJ()">⬇ 백업 내보내기 (.json)</button><button class="btn g s" style="margin-top:8px" onclick="document.getElementById(\'fj\').click()">⬆ 백업 불러오기</button></div>'
+'<div class="st">아기 정보</div><div class="cd"><div class="ir"><span>이름</span><b>'+esc(baby.name)+'</b></div><div class="ir"><span>생일</span><b>'+fmt(d0(baby.birth))+'</b></div><div class="ir"><span>나이</span><b>'+ageT()+'</b></div><div class="ir"><span>최근 체중</span><b>'+(T.w?T.w+'kg':'미입력')+'</b></div>'
+'<button class="btn g s" style="margin-top:12px" onclick="editBaby()">아기 정보 수정</button><button class="btn y s" style="margin-top:8px" onclick="resetAll()">전체 초기화</button></div>'
+'<p class="mu" style="text-align:center;font-size:10.5px;margin:14px 6px 0">본 앱은 의료 행위를 대체하지 않습니다. 영양·알레르기·성장 판단은 담당 소아과와 상의하세요.</p>'}

/*========== 백업 · 아기정보 · 초기화 ==========*/
function expJ(){dl(new Blob([JSON.stringify({v:7,baby:baby,logs:logs,tried:tried,my:myR,cubes:cubes,ov:ov,ph:ph,plan:plan,obs:obs,fav:fav,grow:grow})],{type:'application/json'}),baby.name+'_이유식노트_백업.json')}
function editBaby(){var n=prompt('아기 이름',baby.name);if(n===null)return;
var b=prompt('생년월일 (YYYY-MM-DD)',baby.birth);if(b===null)return;
if(isNaN(d0(b)))return alert('날짜 형식 오류');
baby.name=n.trim()||baby.name;baby.birth=b;todaySel=null;plan=null;save();render()}
function resetAll(){if(!confirm('모든 데이터가 삭제됩니다. 계속할까요?'))return;
for(var k in KY)localStorage.removeItem(KY[k]);location.reload()}
