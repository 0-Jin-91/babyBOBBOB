/*========== 기록 탭 ==========*/
function vLog(){var by={};
logs.slice().reverse().forEach(function(l){(by[l.d]=by[l.d]||[]).push(l)});
var si=IDS.indexOf(curS().id==='ready'?'early':curS().id),op=RCP().filter(function(r){return r.s===si}),D=todaySum(),T=TG();
return '<div class="cd" style="background:#FBF6F2"><b>오늘 요약</b><div class="rw" style="margin-top:7px">'
+[['이유식',D.cnt+'끼'],['수유',D.ml+'ml'],['열량',Math.round(D.f.kcal+D.m.kcal)],['흡수철',rnd2(D.f.feAb+D.m.feAb)+'mg']].map(function(x){return '<div style="flex:1;text-align:center;background:#fff;border-radius:9px;padding:8px 2px"><div class="mu" style="font-size:10px">'+x[0]+'</div><b style="font-size:14px">'+x[1]+'</b></div>'}).join('')+'</div></div>'
+'<div class="cd"><b style="font-size:15px">📝 이유식 기록</b>'
+'<div class="fd" style="margin:12px 0 10px"><label>메뉴</label><input id="gN" list="gL" placeholder="메뉴명 입력 또는 선택"><datalist id="gL">'+op.map(function(r){return '<option>'+esc(r.n)+'</option>'}).join('')+'</datalist></div>'
+'<div class="rw"><div class="fd" style="flex:1;margin:0"><label>먹은 양(g)</label><input id="gA" type="number" placeholder="80"></div><div class="fd" style="flex:1;margin:0"><label>시간</label><select id="gT">'+SLOTS().concat(['간식']).map(function(s){return '<option>'+s+'</option>'}).join('')+'</select></div></div>'
+'<div class="fd" style="margin:12px 0 10px"><label>반응</label><div class="ch">'+['😋','😐','😖'].map(function(x){return '<button class="'+(lRx===x?'on':'')+'" onclick="lRx=\''+x+'\';render()">'+x+'</button>'}).join('')+'</div></div>'
+'<button class="btn" onclick="addLog()">이유식 기록 저장</button>'
+'<div class="hr"></div><div class="rw"><div class="fd" style="flex:1;margin:0"><label>🍼 수유(ml)</label><input id="mV" type="number" value="'+(baby.vol||180)+'"></div><div class="fd" style="flex:1;margin:0"><label>종류</label><select id="mT"><option value="f" '+(MTYPE()==='f'?'selected':'')+'>분유</option><option value="b" '+(MTYPE()==='b'?'selected':'')+'>모유</option></select></div></div>'
+'<button class="btn g s" style="margin-top:9px" onclick="addMilk2()">＋ 수유 기록 추가</button></div>'
+'<div class="st">지난 기록 '+(logs.length?'('+logs.length+')':'')+'</div>'
+(logs.length?Object.keys(by).map(function(d){var s={kcal:0,p:0,fe:0,ca:0,zn:0,feAb:0},ml=0;
by[d].forEach(function(l){if(l.k==='milk'){ml+=+l.ml||0;var n=milkNut(+l.ml||0,l.mt||MTYPE());
NK.forEach(function(k){s[k]+=n[k]});s.feAb+=n.feAb}
else{NK.forEach(function(k){s[k]+=(l.nu&&l.nu[k])||0});s.feAb+=(l.nu&&l.nu.feAb)||0}});
var kp=Math.round(s.kcal/T.day.kcal*100);
return '<div class="cd"><div class="rw" style="justify-content:space-between;align-items:center"><b style="font-size:13px;color:var(--pd)">'+d+'</b><span class="badge '+lvl(kp)+'">'+lvIco(kp)+' 열량 '+kp+'%</span></div><div class="mu" style="font-size:10px;margin:3px 0 4px">'+Math.round(s.kcal)+'kcal · 흡수철 '+rnd2(s.feAb)+'mg · 수유 '+ml+'ml</div>'
+by[d].map(function(l){return '<div class="lg2"><div style="font-size:19px">'+(l.k==='milk'?'🍼':l.rx||'🍲')+'</div><div style="flex:1"><b style="font-size:13.5px">'+esc(l.n)+'</b><div class="mu" style="font-size:10px">'+(l.t||'')+(l.a?' · '+l.a+'g':'')+(l.nu?' · 흡수철 '+rnd2(l.nu.feAb||0)+'mg':'')+'</div></div><button class="mu" style="font-size:16px;padding:2px 6px" onclick="delLog(\''+l.id+'\')">✕</button></div>'}).join('')+'</div>'}).join('')
:'<div class="cd mu">아직 기록이 없어요.</div>')
+(logs.length?'<button class="btn y s" onclick="csv()">CSV로 내보내기</button>':'')}

/*========== 기록 추가 · 삭제 ==========*/
function addMilk2(){var v=+document.getElementById('mV').value,t=document.getElementById('mT').value;
if(!v)return alert('수유량을 입력해 주세요');
logs.push({id:''+Date.now(),d:fmt(TD()),k:'milk',ml:v,mt:t,n:MILK[t].n+' '+v+'ml',t:'수유'});save();render()}
function addLog(){var n=document.getElementById('gN').value.trim();
if(!n)return alert('메뉴명을 입력해 주세요');
var r=null;RCP().forEach(function(x){if(x.n===n)r=x});
var amt=document.getElementById('gA').value,nu=r?nutOf(r).t:null;
if(nu&&amt){var base=0;(r.g||[]).forEach(function(x){base+=gOf(x)});base=base/(r.sv||1);
if(base>0){var f=amt/base,n2={};NK.forEach(function(k){n2[k]=nu[k]*f});
n2.feAb=nu.feAb*f;n2.vc=nu.vc*f;nu=n2}}
logs.push({id:''+Date.now(),d:fmt(TD()),n:n,a:amt,t:document.getElementById('gT').value,rx:lRx,nu:nu});
save();render()}
function qLog(id){var r=getR(id);
logs.push({id:''+Date.now(),d:fmt(TD()),n:r.n,a:'',t:'식사',rx:'😋',nu:nutOf(r).t});
save();closeM();tab='home';render()}
function delLog(id){logs=logs.filter(function(l){return l.id!==id});save();render()}

/*========== 내보내기 공용 ==========*/
function dl(b,fn){var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=fn;a.click()}
function csv(){var s='날짜,구분,시간,메뉴,양,반응,열량,단백질,철,흡수철,칼슘,아연\n'+logs.map(function(l){var n=l.nu||(l.k==='milk'?milkNut(+l.ml||0,l.mt||'f'):{});
return [l.d,(l.k==='milk'?'수유':'이유식'),l.t||'','"'+l.n+'"',(l.k==='milk'?l.ml+'ml':(l.a||'')+'g'),l.rx||'',rnd(n.kcal||0),rnd(n.p||0),rnd(n.fe||0),rnd2(n.feAb||0),rnd(n.ca||0),rnd(n.zn||0)].join(',')}).join('\n');
var g='\n\n날짜,몸무게kg,키cm,머리둘레cm\n'+grow.map(function(x){return [x.d,x.w||'',x.h||'',x.c||''].join(',')}).join('\n');
dl(new Blob(['﻿'+s+g],{type:'text/csv'}),baby.name+'_이유식_성장기록.csv')}
