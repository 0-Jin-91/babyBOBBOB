/*========== 🔎 통합 검색 (홈 상단) ==========*/
/* 기능·메뉴·재료를 한 칸에서 찾아 바로 이동한다.
   FIDX: 기능 색인. [제목, 설명·검색어, 이모지, 이동함수문자열] */
var FQ='';                       /* 검색어 */
var FIDX=[
/*----- 기록 -----*/
['오늘 기록 관리','오늘 끼니 체크 먹었어요 취소 수정 수유 회차 간식 타임라인 하루','📅','go(\'today\')'],
['먹은 양 수정','중량 그램 수정 조절 재료 비례 먹었어요 수정','⚖️','go(\'today\')'],
['그릇 무게로 계산','그릇 무게 먹인 양 저울 전 후 중량 계산 섭취율','⚖️','openScale(\'gA\')'],
['수유 기록','분유 모유 ml 회차 시간 수정 삭제 젖병','🍼','go(\'home\')'],
['전체 기록 · CSV','기록 목록 지난 기록 내보내기 csv 엑셀 백업 이력','📝','go(\'log\')'],
/*----- 메뉴 -----*/
['메뉴 만들기','새 레시피 나의 메뉴 직접 만들기 추가 등록 작성','✏️','openEd()'],
['레시피 목록','메뉴 죽 토핑 핑거푸드 유아식 단계별 초기 중기 후기 완료기','🍲','go(\'menu\')'],
['즐겨찾기 메뉴','즐겨찾기 별 favorite 자주 먹는','⭐','goMenu(\'f\')'],
['나의 메뉴','내가 만든 레시피 내 메뉴 수정한 메뉴','✏️','goMenu(\'m\')'],
/*----- 식단 · 장보기 -----*/
['주간 식단표','일주일 식단 편성 주간 계획 요일별 메뉴 교체','🗓','go(\'plan\')'],
['장보기 목록','장보기 쇼핑 사야 할 구매 리스트 카톡 복사 추천','🛒','goPlan(\'s\')'],
['냉동 큐브','큐브 트레이 냉동 보관 재고 유효기간','🧊','goPlan(\'c\')'],
['큐브 만든 날짜 수정','큐브 수정 편집 만든날 기간 보관기한 개수 규격 변경','✏️','goStock(\'cube\')'],
/*----- 재고 -----*/
['재고 관리','재고 남은 양 충전 차감 부족 경고 유통기한','📦','go(\'stock\')'],
['재고 등록','재고 추가 새 재료 등록 규격 개수 몇그램','📦','goStock(\'add\')'],
['재고 이력','입출고 충전 사용 이력 내역','📦','goStock(\'hist\')'],
/*----- 재료 -----*/
['재료 도감','재료 사전 시기 개월 언제부터 알레르기 영양','🥕','go(\'food\')'],
['알레르기 3일 관찰','알레르기 관찰 새 재료 반응 발진 3일 타이머 시작','🔔','go(\'food\')'],
['알레르기 통과 체크리스트','알레르기 체크리스트 통과 진행중 해야할것 현황 진도 한눈에 목록','✅','goFood(\'chk\')'],
['재료별 섭취 분석','재료별 얼마나 먹었나 섭취량 식품군 균형 편식','📊','goFood(\'dash\')'],
/*----- 조합 -----*/
['재료 조합 점수','궁합 조합 같이 먹으면 가스 상극 좋은 조합 경고','🧩','go(\'combo\')'],
['보유 재고로 메뉴 추천','재고 활용 추천 있는 재료로 만들기','🎲','openEd()'],
/*----- 계산 -----*/
['배죽 계산 (물 양)','10배죽 7배죽 5배죽 진밥 쌀 물 비율 몇배죽','🍚','goCalc(\'rice\')'],
['분유 타는 법 계산','분유 스푼 물 몇 스푼 총량 농도','🍼','goCalc(\'milk\')'],
['계량 환산 (숟가락)','작은술 큰술 컵 스푼 그램 환산 저울 없을 때','🥄','goCalc(\'spoon\')'],
['큐브 개수 계산','큐브 몇 칸 며칠분 소진','🧊','goCalc(\'cube\')'],
['보관 기한 계산','냉장 냉동 실온 며칠 유통기한 상했나','🧊','goCalc(\'keep\')'],
['해열제 용량 계산','해열제 타이레놀 부루펜 아세트아미노펜 이부프로펜 몇 ml 열','💊','goCalc(\'med\')'],
['체격 백분위','백분위 카우프 체격 몸무게 키 비율','📏','goCalc(\'body\')'],
/*----- 성장 -----*/
['성장곡선 · 측정','성장 몸무게 키 머리둘레 백분위 곡선 기록 그래프','📈','go(\'grow\')'],
/*----- 설정 -----*/
['탭 순서·표시 설정','탭 순서 숨기기 메뉴 정리 왼쪽 메뉴','⚙️','navCfgOpen()'],
['끼니 수·수유 방식 설정','설정 끼니 몇끼 분유 모유 성별 기준','⚙️','go(\'info\')'],
['그릇 무게 등록','그릇 프리셋 무게 등록 관리','⚖️','scMgrCore(\'drawScale\')'],
['백업 · 복원','백업 내보내기 불러오기 json 옮기기 기기 변경','💾','go(\'info\')'],
['버전 · 업데이트 확인','업데이트 새로고침 버전 최신 갱신','🍼','updCheck()'],
['출처 · 참고자료','출처 근거 자료 링크 논문 지침','📎','go(\'info\')']];

/*----- 이동 헬퍼 -----*/
function go(t){FQ='';tab=t;render()}
function goMenu(m){FQ='';tab='menu';mTab=m;srch='';render()}
function goPlan(p){FQ='';tab='plan';pTab=p;render()}
function goStock(s){FQ='';tab='stock';sTab=s;render()}
function goFood(f){FQ='';tab='food';fTab=f;render()}
function goCalc(c){FQ='';tab='calc';cTab=c;render()}

/*----- 검색 -----*/
function fNorm(s){return String(s||'').toLowerCase().replace(/[\s·\-_()]/g,'')}
function fHit(q,hay){q=fNorm(q);if(!q)return false;
return fNorm(hay).indexOf(q)>=0}
/* 초성 매칭 (재료 검색과 동일 로직 재사용)
   isCho() 는 core.js 에 이미 있으므로 여기서 다시 정의하지 않는다. */
function fCho(s){var C='ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ',o='';
for(var i=0;i<s.length;i++){var c=s.charCodeAt(i);
if(c>=0xAC00&&c<=0xD7A3)o+=C.charAt(Math.floor((c-0xAC00)/588));else o+=s.charAt(i)}
return o}

function findAll(q){var out={fn:[],mn:[],fd:[]};
if(!q||!q.trim())return out;
var cho=isCho(q.replace(/\s/g,'')),qn=fNorm(q);
/* 1) 기능 */
FIDX.forEach(function(x){
var hay=x[0]+' '+x[1];
if(cho?fCho(hay).indexOf(q.replace(/\s/g,''))>=0:fHit(q,hay))out.fn.push(x)});
/* 2) 메뉴(레시피) */
RCP().forEach(function(r){
var hay=r.n+' '+(TY[r.y]||'')+' '+(STG[r.s]?STG[r.s].n:'')
+' '+(r.g||[]).map(function(g){return g[0]+' '+(g[3]||'')+' '+(typeof SYN!=='undefined'?(SYN[g[3]]||''):'')}).join(' ');
if(cho?fCho(hay).indexOf(q.replace(/\s/g,''))>=0:fHit(q,hay))out.mn.push(r)});
/* 3) 재료 */
if(typeof fdMatch==='function'){FD.forEach(function(f){if(fdMatch(f,q))out.fd.push(f)})}
out.mn=out.mn.slice(0,8);out.fd=out.fd.slice(0,10);out.fn=out.fn.slice(0,8);
return out}

/*----- 홈 상단 검색바 -----*/
function findBar(){var q=FQ,R=findAll(q),n=R.fn.length+R.mn.length+R.fd.length;
return '<div class="fbw"><div class="fbi">'
+'<span class="fic">🔎</span>'
+'<input id="fq" value="'+esc(q)+'" oninput="reFind()" placeholder="기능·메뉴·재료 검색 (예: 장보기, 해열제, 계란)" autocomplete="off">'
+(q?'<button class="fx" onclick="FQ=\'\';render()">✕</button>':'')+'</div>'
+'<div id="fres">'+(q?findRes(R,n):findHint())+'</div></div>'}
function reFind(){var e=document.getElementById('fq');if(!e)return;
FQ=e.value;var R=findAll(FQ),n=R.fn.length+R.mn.length+R.fd.length;
document.getElementById('fres').innerHTML=FQ?findRes(R,n):findHint()}
function findHint(){var t=['장보기','재고','해열제','배죽','조합','메뉴 만들기','계란','백분위'];
return '<div class="fhint">'+t.map(function(x){
return '<button onclick="FQ=\''+x+'\';render()">'+x+'</button>'}).join('')+'</div>'}
function findRes(R,n){
if(!n)return '<div class="fnone">찾는 결과가 없어요. <b>다른 말</b>로 검색해 보세요 — 예: 장보기, 재고, 해열제, 배죽, 계란</div>';
var h='<div class="fres">';
if(R.fn.length){h+='<div class="fgt">⚙️ 기능 · 화면</div>'
+R.fn.map(function(x){return '<button class="fit" onclick="'+x[3]+'"><span class="fe">'+x[2]+'</span>'
+'<span class="ft"><b>'+esc(x[0])+'</b><i>'+esc(x[1].split(' ').slice(0,6).join(' '))+'</i></span><span class="fa">›</span></button>'}).join('')}
if(R.mn.length){h+='<div class="fgt">🍲 메뉴 '+(R.mn.length>=8?'(상위 8)':'')+'</div>'
+R.mn.map(function(r){return '<button class="fit" onclick="FQ=\'\';openR(\''+r.i+'\')"><span class="fe">🍲</span>'
+'<span class="ft"><b>'+esc(r.n)+'</b><i>'+(STG[r.s]?STG[r.s].n:'')+' · '+(TY[r.y]||'')+(r.my?' · 내 메뉴':'')+'</i></span><span class="fa">›</span></button>'}).join('')}
if(R.fd.length){h+='<div class="fgt">🥕 재료</div>'
+R.fd.map(function(f){return '<button class="fit" onclick="FQ=\'\';openF(\''+f[0]+'\')"><span class="fe">'+f[1]+'</span>'
+'<span class="ft"><b>'+esc(f[0])+'</b><i>'+f[2]+' · '+f[3]+'개월+</i></span><span class="fa">›</span></button>'}).join('')}
return h+'</div>'}
