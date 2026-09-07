/*========== 온보딩 ==========*/
function saveBaby(){var n=document.getElementById('iN').value.trim(),b=document.getElementById('iB').value;
if(!n)return alert('아기 이름을 입력해 주세요');
if(!b)return alert('태어난 날을 선택해 주세요');
if(d0(b)>TD())return alert('오늘 이후 날짜는 안 돼요');
baby={name:n,birth:b,sex:document.getElementById('iS').value,feed:document.getElementById('iF').value,meals:+document.getElementById('iM').value,vol:+document.getElementById('iV').value||180,useW:1};
var w=+document.getElementById('iW').value,h=+document.getElementById('iH').value;
if(w||h)grow.push({id:'g'+Date.now(),d:ymd(TD()),w:w||null,h:h||null,c:null});
save();boot()}

/*========== 부팅 ==========*/
function boot(){var B=document.body;
if(!baby){B.classList.add('solo');document.getElementById('ob').classList.remove('hd');
document.getElementById('mv').classList.add('hd');document.getElementById('nv').classList.add('hd');return}
B.classList.remove('solo');document.getElementById('ob').classList.add('hd');
document.getElementById('mv').classList.remove('hd');document.getElementById('nv').classList.remove('hd');
if(!selS)selS=curS().id==='ready'?'early':curS().id;
migLogs();render();notiCheck()}

/*========== 렌더 ==========*/
var VIEW={home:vHome,today:vToday,plan:vPlan,menu:vMenu,food:vFood,grow:vGrow,log:vLog,info:vInfo};
function render(){var s=curS(),T=TG();
document.getElementById('hdr').innerHTML='<div class="hg">TODAY · '+fmt(TD())+' · 이유식 '+MEALS()+'끼'+(T.w?' · '+T.w+'kg':'')+'</div><div class="hn">'+esc(baby.name)+' <span style="font-size:13px;font-weight:600;color:var(--sub)">이유식 노트</span></div><div class="ha">'+ageT()+'</div><span class="pl" style="background:'+s.c+'">'+s.n+' · '+s.lb+'</span>';
document.getElementById('vw').innerHTML=(VIEW[tab]||vHome)();
window.scrollTo(0,0);document.documentElement.scrollTop=0;document.body.scrollTop=0;
var bs=document.querySelectorAll('nav button');
for(var i=0;i<bs.length;i++)bs[i].className=bs[i].dataset.t===tab?'on':''}

/*========== 이벤트 ==========*/
document.getElementById('nv').addEventListener('click',function(e){var b=e.target.closest('button');
if(b&&b.dataset.t){tab=b.dataset.t;render()}});

/* 조리 단계 사진 업로드 */
document.getElementById('fi').addEventListener('change',function(e){var f=e.target.files[0];if(!f)return;
var rd=new FileReader();
rd.onload=function(ev){var im=new Image();
im.onload=function(){var W=340,sc=W/im.width,cv=document.createElement('canvas');
cv.width=W;cv.height=Math.round(im.height*sc);
cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);
ph[phT]=cv.toDataURL('image/jpeg',.6);save();
if(curR)document.getElementById('mb').innerHTML=rBody();render()};
im.src=ev.target.result};
rd.readAsDataURL(f);e.target.value=''});

/* 백업 JSON 불러오기 */
document.getElementById('fj').addEventListener('change',function(e){var f=e.target.files[0];if(!f)return;
var r=new FileReader();
r.onload=function(ev){try{var d=JSON.parse(ev.target.result);
if(!confirm('현재 데이터를 덮어씁니다. 계속할까요?'))return;
baby=d.baby||baby;logs=d.logs||[];tried=d.tried||{};myR=d.my||[];cubes=d.cubes||[];
ov=d.ov||{};ph=d.ph||{};plan=d.plan||null;obs=d.obs||[];fav=d.fav||{};grow=d.grow||[];
save();alert('불러오기 완료!');boot()}catch(err){alert('파일을 읽을 수 없습니다.')}};
r.readAsText(f);e.target.value=''});

/*========== 시작 ==========*/
boot();
