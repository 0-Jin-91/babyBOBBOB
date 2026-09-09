/*========== 클라우드 자동 백업 (구글 계정 로그인) ==========
  설계 원칙 — 폰이 원본, 클라우드는 사본.
   · 저장은 항상 localStorage 에 먼저. 클라우드 전송은 뒤에서 조용히.
     (부엌에서 비행기모드로도 100% 동작해야 하므로 방향을 바꾸면 안 된다)
   · 로그인 없이도 지금처럼 전부 동작. 강제하지 않는다.
   · 사진(b6.ph)은 기록과 분리해서 올린다. 용량이 수백 배라
     사진 업로드가 밀렸다고 오늘의 이유식 기록이 백업 못 되면 안 된다.

  로그인 방식: signInWithPopup (GitHub Pages 에서 동작하는 유일한 방식)
   · signInWithRedirect 는 <프로젝트>.firebaseapp.com 도움창을 쓰는데
     앱 도메인(github.io)과 달라 Safari 가 '남의 도메인 저장소'로 차단한다.
   · popup 은 도메인을 넘어가지 않으므로 그 문제가 발생하지 않는다.
   · 단 아이폰 홈화면앱은 팝업이 막힐 수 있어 → 실패 시 안내 배너 + 이메일 예비수단.
========================================================*/

/* ── 설정: Firebase 콘솔에서 받은 값을 여기에 붙여넣습니다 ── */
var FBCFG = {
  apiKey:            "AIzaSyAW6uMsEW-61ZFDiHkoraCf_DfKsNtl_dA",
  authDomain:        "babybob-58f2e.firebaseapp.com",
  projectId:         "babybob-58f2e",
  appId:             "1:565315154177:web:bd83df640575f9e281ab00"
};
/* 위 4칸이 비어 있으면 클라우드 기능 전체가 조용히 꺼집니다(앱은 정상 동작). */

var CLK = 'b6.cloud';                 /* 동기화 상태 저장 키 */
var CL  = LS(CLK, null) || {on:0, uid:'', email:'', lastUp:0, lastDown:0, pend:0, err:''};
if(CL.emsg===undefined) CL.emsg='';   /* 마지막 오류 원문 — 진단용 */
/*───────── 동기화 기준점 (1단계) ─────────
   baseHash = 이 폰과 클라우드가 마지막으로 일치했던 시점의 내용 지문.
   이 값이 있으면 "어느 쪽이 변했는가"를 3자 비교로 알 수 있다.
     local===remote           → 아무 일도 없음
     local===base, remote 다름 → 서버만 변했다  → 받으면 된다
     remote===base, local 다름 → 이 폰만 변했다 → 올리면 된다
     둘 다 base 와 다름        → 진짜 충돌      → 이때만 사용자에게 묻는다
   ★ 기존 사용자는 이 값이 빈 문자열이다. 그때는 판단 근거가 없으므로
     예전처럼 묻는다 — 없는 기준점을 추측해서 자동으로 덮으면 안 된다. */
if(CL.baseHash===undefined) CL.baseHash='';   /* 마지막 일치 시점의 지문 */
if(CL.baseAt  ===undefined) CL.baseAt  =0;    /* 그 시각 — 화면 표시·진단용 */
function clSave(){ saveKey(CLK, CL) }
/* 기준점 갱신 — push/pull 이 성공한 직후에만 부른다.
   ★ 성공하지 않은 전송으로 기준점을 올리면 "변한 적 없다"고 오판해
     다음 동기화에서 변경이 조용히 사라진다. 반드시 성공 후에만. */
function clBase(h){
  if(!h) return;
  CL.baseHash=h; CL.baseAt=Date.now(); clSave();
}

/*───────── 기기 식별 (1단계) ─────────
   여러 기기가 같은 계정을 쓸 때 "누가 올린 데이터인지" 구분하기 위한 것.
   ★ did 는 이 기기에서 최초 1회만 만들고 CL 에 영구 보관한다 — 지우면 다른
     기기로 인식되므로 clForget/clLogout 에서도 건드리지 않는다.
   ★ 이 단계는 값을 실어 보내기만 한다. 판단 로직은 2단계에서 쓴다. */
function clDid(){
  if(!CL.did){
    CL.did = 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2,8);
    clSave();
  }
  return CL.did;
}
/* 기기명 — 사용자가 알림에서 "어느 폰이 올린 것"인지 알아볼 수 있으면 된다.
   UA 는 브라우저마다 다르므로 못 알아내면 빈 값을 두고 표시할 때 대체한다. */
function clDevName(){
  if(CL.dn) return CL.dn;                       /* 사용자가 고친 이름이 있으면 우선 */
  var u = (navigator.userAgent||''), n = '';
  /* Android UA 는 "(Linux; Android 14; SM-S931N Build/…)" 꼴.
     정규식을 복잡하게 쓰지 않고 세미콜론으로 잘라 모델명 토큰만 집는다. */
  if(u.indexOf('Android')>=0){
    var seg = u.split(';'), t, x;
    for(x=0;x<seg.length;x++){
      t = seg[x].split(')')[0].split('Build')[0].trim();   /* 괄호 뒤 버전정보 버림 */
      if(t && t.indexOf('Android')<0 && t.indexOf('Linux')<0
           && t.indexOf('Mozilla')<0 && t.indexOf('AppleWebKit')<0){ n=t; break }
    }
  }
  else if(/iPhone/i.test(u)) n = 'iPhone';
  else if(/iPad/i.test(u))   n = 'iPad';
  else if(/Macintosh/i.test(u)) n = 'Mac';
  else if(/Windows/i.test(u))   n = 'Windows PC';
  return n || '알 수 없는 기기';
}
/* 내용 해시 — "서버 데이터와 지금 이 폰이 같은가"를 건수가 아니라 내용으로 본다.
   ★ 반드시 fbEnc 를 거치지 않은 원본에 대해 계산한다. fbEnc 는 중첩 배열을
     {_na:1,…} 객체로 바꾸므로, 인코딩 후에 계산하면 양쪽 값이 어긋난다.
   ★ 메타(at·v·did·dn·hash)는 제외한다 — 시각·버전이 달라도 내용이 같으면
     같다고 봐야 알림을 지울 수 있다. */
var CLMETA = {sv:1, v:1, at:1, did:1, dn:1, hash:1};
function clStable(v){
  if(v===undefined || v===null) return 'null';
  if(typeof v!=='object') return JSON.stringify(v);
  if(Object.prototype.toString.call(v)==='[object Array]'){
    var i, a=[];
    for(i=0;i<v.length;i++) a.push(clStable(v[i]));
    return '['+a.join(',')+']';
  }
  var ks=[], k;
  for(k in v){ if(Object.prototype.hasOwnProperty.call(v,k)) ks.push(k) }
  ks.sort();                                    /* 키 순서가 달라도 같은 해시 */
  var p=[];
  for(i=0;i<ks.length;i++) p.push(JSON.stringify(ks[i])+':'+clStable(v[ks[i]]));
  return '{'+p.join(',')+'}';
}
function clHash(d){
  if(!d) return '';
  var body={}, k;
  for(k in d){ if(Object.prototype.hasOwnProperty.call(d,k) && !CLMETA[k]) body[k]=d[k] }
  var s=clStable(body), h1=0x811c9dc5, h2=0x01000193, i;
  for(i=0;i<s.length;i++){                      /* FNV 계열 2채널 — 충돌 여유 */
    h1 = (h1 ^ s.charCodeAt(i)) >>> 0; h1 = (h1 * 16777619) >>> 0;
    h2 = (h2 + s.charCodeAt(i) * (i%7+1)) >>> 0;
  }
  return s.length.toString(36)+'-'+h1.toString(36)+h2.toString(36);
}
/* 오류를 코드+원문으로 남긴다 — 원인을 화면에서 확인할 수 있어야 고칠 수 있다 */
function clErr(kind, e){
  CL.err=kind;
  CL.emsg=((e&&(e.code||e.name))||'')+(e&&e.message?(' · '+e.message):'');
  if(CL.emsg.length>200) CL.emsg=CL.emsg.slice(0,200);
  clSave(); clPaint();
}

var FB = null;                        /* {app,auth,db,fn:{...}} — 로드 후 채워짐 */
var CLUSER = null;                    /* 로그인된 사용자 (null = 비로그인) */
var CLBUSY = 0;                       /* 전송 중 표시 */
var _cltmr = null;                    /* 디바운스 타이머 */
var CLGOT  = 0;                       /* 조용한 동기화로 받아온 시각 — 배지 안내용(2단계) */
var CLAPPLY= 0;                       /* clApply 진행 중 — 되올림(에코) 방지 */
var CLMERGE= 1;                       /* 4단계 병합 사용 (0 이면 예전처럼 전체 교체) */
var CLMGD  = 0;                       /* 방금 병합으로 내용이 달라졌다 → 되올려야 한다 */
var CLPUSHM= 0;                       /* clPush 의 사전 확인 진행 중 — 재귀 방지 */
var CLSCRL = 0;                       /* 마지막 스크롤 시각 — 읽는 중 화면 튐 방지 */

function clReady(){ return !!(FBCFG.apiKey && FBCFG.projectId) }
/* 로그인 여부는 변수(CLUSER) 하나에 의존하지 않는다.
   변수는 콜백 순서·페이지 전환·예외로 비워질 수 있지만
   Firebase 가 보관한 세션(auth.currentUser)은 남아 있다.
   여기서 되살리지 않으면 '로그인했는데 로그인하세요'가 영구히 남는다. */
function clOn(){
  if(!clReady()) return false;
  if(!CLUSER && FB && FB.auth && FB.auth.currentUser) CLUSER = FB.auth.currentUser;
  return !!CLUSER;
}

/*───────── SDK 로드 (ESM, 필요할 때 한 번만) ─────────*/
var _clload = null;
function clLoad(){
  if(_clload) return _clload;
  if(!clReady()) return Promise.reject(new Error('no-config'));
  var B='https://www.gstatic.com/firebasejs/10.12.2/';
  _clload = Promise.all([
    import(B+'firebase-app.js'),
    import(B+'firebase-auth.js'),
    import(B+'firebase-firestore.js')
  ]).then(function(m){
    var A=m[0], U=m[1], D=m[2];
    var app = A.initializeApp(FBCFG);
    var auth= U.getAuth(app);
    var db  = D.getFirestore(app);
    /* 로그인 상태를 폰에 유지 — 한 번 로그인하면 계속 유지된다 */
    U.setPersistence(auth, U.browserLocalPersistence).catch(function(){});
    FB = {app:app, auth:auth, db:db, U:U, D:D};
    U.onAuthStateChanged(auth, function(u){
      CLUSER = u || null;
      if(u){ CL.on=1; CL.uid=u.uid; CL.email=u.email||''; CL.err=''; CL.emsg=''; clSave() }
      else { CL.on=0; clSave() }
      /* 화면 갱신을 먼저 — 아래 첫동기화가 실패해도 배지는 반드시 살아난다 */
      clPaint();
      if(typeof render==='function') try{ render() }catch(e){}
      if(u) setTimeout(function(){ try{ clFirst() }catch(e){ clErr('first',e) } },0);
    });
    return FB;
  }).catch(function(e){
    _clload=null; clErr('sdk',e); throw e;
  });
  return _clload;
}

/* 앱 시작 시: 이미 로그인한 적 있으면 조용히 SDK 를 불러 세션을 복구 */
function clBoot(){
  if(!clReady()) return;
  /* CL.on 으로 걸러내지 않는다 — 첫 로그인 직후 상태 저장이 실패했거나
     페이지가 새로 열린 경우에도 Firebase 가 보관한 세션을 복구해야 한다.
     (여기서 걸러내면 '로그인했는데 로그인하세요'가 영구히 남는다) */
  clLoad().catch(function(e){ clErr('sdk',e) });
}

/*───────── 로그인 / 로그아웃 ─────────*/
function clLogin(){
  if(!clReady()){ alert('클라우드 설정이 아직 등록되지 않았어요.\n(개발자에게 Firebase 설정값 입력을 요청해 주세요)'); return }
  clLoad().then(function(F){
    var p = new F.U.GoogleAuthProvider();
    p.setCustomParameters({prompt:'select_account'});
    return F.U.signInWithPopup(F.auth, p);
  }).then(function(r){
    /* onAuthStateChanged 가 이어서 처리하지만, 혹시 콜백이 늦거나
       실행되지 않는 환경을 대비해 여기서도 직접 반영한다 */
    var u=r&&r.user;
    if(u){ CLUSER=u; CL.on=1; CL.uid=u.uid; CL.email=u.email||''; CL.err=''; CL.emsg=''; clSave() }
    clPaint();
    if(typeof render==='function') try{ render() }catch(e){}
  }).catch(function(e){
    var c=(e&&e.code)||'';
    if(c==='auth/popup-closed-by-user'||c==='auth/cancelled-popup-request') return;
    if(c==='auth/popup-blocked'||c==='auth/operation-not-supported-in-this-environment'){
      clPopupHelp(); return;
    }
    if(c==='auth/unauthorized-domain'){
      alert('이 주소가 클라우드에 등록되지 않았어요.\n\n개발자에게 "승인된 도메인 추가"를 요청해 주세요.\n주소: '+location.hostname); return;
    }
    clErr('login',e);
    alert('로그인에 실패했어요.\n\n'+(CL.emsg||'')+'\n\n인터넷 연결을 확인하고 다시 시도해 주세요.');
  });
}

/* 홈화면앱에서 팝업이 막힌 경우 — Safari 로 여는 길을 안내 */
function clPopupHelp(){
  alert('📱 로그인 창이 열리지 않았어요.\n\n'
   +'홈 화면 앱에서는 막힐 수 있습니다.\n'
   +'아래 순서로 해 주세요.\n\n'
   +'1. 사파리(Safari)를 엽니다\n'
   +'2. 같은 주소로 들어갑니다\n'
   +'   '+location.href.split('?')[0]+'\n'
   +'3. 거기서 "구글로 로그인"을 누릅니다\n'
   +'4. 다시 홈 화면 앱으로 돌아옵니다\n\n'
   +'한 번만 하면 됩니다.');
}

/* 로그인 이력만 지운다 — 기록은 건드리지 않는다 */
function clForget(){
  if(!confirm('이 폰에 저장된 로그인 정보를 지웁니다.\n\n이유식 기록은 그대로 남습니다.\n계속할까요?')) return;
  /* ★ did/dn 은 남긴다 — 이 폰의 신분증이므로 지우면 같은 폰이 '새 기기'로
     인식되어 동기화 판단(2단계)이 어긋난다. 지우는 건 로그인 정보뿐. */
  /* ★ baseHash 는 지운다 — 계정이 바뀌면 "마지막으로 일치했던 시점"이라는
     전제가 무효다. 남겨두면 다른 계정 데이터에 대해 잘못된 자동 판정을 한다.
     지문이 없으면 clFirst() 는 안전하게 사용자에게 묻는 쪽으로 돌아간다. */
  CL={on:0,uid:'',email:'',lastUp:0,lastDown:0,pend:0,err:'',emsg:'',
      baseHash:'', baseAt:0,
      did:CL.did||'', dn:CL.dn||''};
  CLUSER=null; clSave(); clPaint();
  if(typeof render==='function') try{ render() }catch(e){}
}
function clLogout(){
  if(!confirm('로그아웃하면 이 폰에서 자동 백업이 멈춥니다.\n\n지금까지 백업된 기록은 클라우드에 그대로 남아 있고,\n이 폰의 기록도 지워지지 않습니다.\n\n로그아웃할까요?')) return;
  if(!FB){ CL.on=0; clSave(); clPaint(); return }
  FB.U.signOut(FB.auth).then(function(){
    CLUSER=null; CL.on=0; clSave(); clPaint();
    if(typeof render==='function') render();
    alert('로그아웃되었습니다.');
  });
}

/*───────── Firestore 안전 변환 (중첩 배열 우회) ─────────*/
/* Firestore 는 '배열 안의 배열'을 저장하지 못한다 (invalid-argument).
   그런데 주간 식단 plan.d 는 [7일][끼니] 2차원 배열이라 그대로 보내면
   문서 전체가 거부되고, 하필 그 검증이 동기 throw 라서
   setDoc().catch() 가 실행되지 않아 '백업 중…'이 영구히 멈춘다.
   → 보낼 때 중첩 배열만 객체로 바꾸고(fbEnc), 받을 때 되돌린다(fbDec).
   객체는 중첩에 제한이 없으므로 이 우회는 Firestore 규격 안에서 안전하다.
   undefined 도 Firestore 가 거부하므로 여기서 함께 걸러낸다. */
function fbEnc(v){
  if(v===undefined||v===null) return null;
  if(typeof v!=='object') return v;
  if(v instanceof Date) return v.getTime();
  if(Object.prototype.toString.call(v)==='[object Array]'){
    var i, nest=0;
    for(i=0;i<v.length;i++){
      if(Object.prototype.toString.call(v[i])==='[object Array]'){ nest=1; break }
    }
    if(!nest){
      var a=[]; for(i=0;i<v.length;i++) a.push(fbEnc(v[i]));
      return a;
    }
    /* 중첩 → {_na:1, n:길이, i0:…, i1:…} 형태의 객체로 */
    var o={_na:1, n:v.length};
    for(i=0;i<v.length;i++) o['i'+i]=fbEnc(v[i]);
    return o;
  }
  var r={};
  for(var k in v){
    if(!Object.prototype.hasOwnProperty.call(v,k)) continue;
    if(v[k]===undefined) continue;              /* undefined 키는 아예 보내지 않는다 */
    r[k]=fbEnc(v[k]);
  }
  return r;
}
function fbDec(v){
  if(v===null||typeof v!=='object') return v;
  if(Object.prototype.toString.call(v)==='[object Array]'){
    var a=[]; for(var i=0;i<v.length;i++) a.push(fbDec(v[i]));
    return a;
  }
  if(v._na===1 && typeof v.n==='number'){       /* 인코딩된 중첩 배열 되돌리기 */
    var b=[]; for(var j=0;j<v.n;j++) b.push(fbDec(v['i'+j]));
    return b;
  }
  var r={};
  for(var k in v){
    if(Object.prototype.hasOwnProperty.call(v,k)) r[k]=fbDec(v[k]);
  }
  return r;
}

/*───────── 데이터 묶기 / 풀기 ─────────*/
/* 기록 뭉치 — 사진 제외. schemaVersion 을 넣어 나중에 구조가 바뀌어도 읽을 수 있게. */
function clPack(){
  var p = {
    sv:1, v:(window.APPV||''), at:Date.now(),
    did:clDid(), dn:clDevName(),          /* 1단계 — 어느 기기가 올렸는지 */
    /* 슬림 형식으로 올린다 — Firestore 문서 1MiB 한도에도 여유가 생긴다 */
    baby:baby, logs:logs.map(logSlim), tried:tried, my:myR, cubes:cubes, ov:ov,
    plan:plan, obs:obs.map(obsSlim), fav:fav, grow:grow.map(growSlim),
    stock:(typeof STK!=='undefined'?STK:null),
    bowl :(typeof BW !=='undefined'?BW :null),
    calc : LS('b6.calc',null),
    nav  :(typeof NAVC!=='undefined'?NAVC:null),
    navm :(typeof NAVM!=='undefined'?NAVM:null),
    sec  :(typeof SEC !=='undefined'?SEC :null),
    cmix :(typeof CMIX!=='undefined'?CMIX:null),
    /* 3b — 삭제 흔적(묘비). 이것이 서버를 거쳐 다른 기기로 가야
       "A에서 지운 것이 B에서 되살아나는" 사고를 4단계가 막을 수 있다. */
    del  :(typeof DEL !=='undefined'?DEL :null)
  };
  p.hash = clHash(p);            /* 메타 제외한 내용만의 지문 — 2단계에서 비교에 쓴다 */
  return p;
}
/*═════════ 병합 엔진 (4단계) ═════════
   두 기기가 각각 입력한 것을 둘 다 살린다.

   왜 필요한가 — clPush 는 setDoc(문서 전체 교체)이고 clApply 는 배열을
   통째로 갈아치운다. 그래서 아이패드에 소고기, 아이폰에 닭고기를 넣으면
   나중에 올린 쪽이 앞의 것을 덮어 하나가 사라졌다.

   병합 규칙 — 자료 성격마다 다르다. 한 규칙을 전부에 쓰면 반드시 사고가 난다.
     ① 기록형 배열 (logs·grow·obs·my·cubes·stock)
        → 합집합. id 로 짝을 맞추고, 양쪽에 있으면 u(수정시각)가 나중인 쪽.
        → 묘비(DEL)에 있는 id 는 되살리지 않는다.
     ② 재고(stock)는 여기에 규칙이 하나 더 붙는다
        → id 는 기기마다 다르게 생성되므로(k+Date.now()) 같은 재료가 두 줄이
          될 수 있다. stkFind() 가 이름/키로 중복을 막고 있으니, 같은 재료는
          한 줄로 합치고 u 가 나중인 쪽을 택한다.
     ③ 설정·단일값 (baby·plan·bowl·calc·nav·navm·sec·tried·fav·ov·cmix)
        → 합치지 않고 '더 나중에 저장된 문서' 쪽을 통째로 택한다.
        ★ tried·fav 는 토글(해제 시 키를 delete)이므로 합집합을 쓰면 안 된다 —
          한쪽에서 해제한 즐겨찾기가 상대편 키 때문에 되살아난다.
        ★ cmix 는 문자열 배열(조합 실험판에 담은 재료)이라 id 가 없고,
          성격도 '지금 담아둔 목록'이므로 합치는 것이 의미가 없다. */

/* 항목 배열을 id 기준으로 합친다 */
function clMergeList(mine, theirs, idKey, kind){
  mine   = mine   || [];
  theirs = theirs || [];
  var byId = {}, order = [], i, it;
  /* ★ put() 안에서 쓰는 이름을 바깥과 겹치지 않게 한다. 예전에는 바깥의
     var k 를 함수 안에서 그대로 대입해(섀도잉 없이) 공유했고, 매개변수 이름도
     바깥 var it 와 같았다. 동작이 꼬이기 쉬운 구조라 지역변수로 분리한다. */
  function put(item, fromMine){
    if(!item) return;
    var it = item;
    var k = ''+(it[idKey]!==undefined ? it[idKey] : '');
    if(!k) return;
    /*───── 지운 것은 되살리지 않는다 (3b 묘비 연동) ─────
       ★ 판단 기준은 '내 목록에 있느냐'가 아니라 '삭제가 더 나중이냐'다.
         처음에는 내 항목(fromMine)에는 묘비를 적용하지 않았다. undo 로 되살린
         항목을 지키려던 것이었는데, 그 때문에 상대가 지운 항목이 내 쪽에
         남아 두 기기가 영구히 어긋났다("아이패드에서 지운 당근이 아이폰에 남음").
       ★ 시각으로 비교하면 두 요구가 동시에 충족된다.
           삭제시각 > 항목수정시각  →  지운 뒤 손대지 않았다  → 삭제 유지
           삭제시각 < 항목수정시각  →  지운 뒤 되살렸다(undo) → 항목 유지 */
    if(typeof delAt==='function'){
      var _dt = delAt(kind, k);
      if(_dt && _dt >= +(it.u||0)) return;
    }
    var cur = byId[k];
    if(cur===undefined){ byId[k]=it; order.push(k); return }
    /* 양쪽에 있다 → u 가 나중인 쪽. u 가 없으면(구 레코드) 있는 쪽을 남긴다. */
    var a = +(cur.u||0), b = +(it.u||0);
    if(b > a) byId[k] = it;
  }
  for(i=0;i<mine.length;i++)   put(mine[i], 1);
  for(i=0;i<theirs.length;i++) put(theirs[i], 0);

  var out = [];
  for(i=0;i<order.length;i++){ it = byId[order[i]]; if(it) out.push(it) }
  return out;
}

/* 재고 전용 — 위 합집합 뒤에 '같은 재료 한 줄로' 규칙을 더 적용한다 */
function clMergeStock(mine, theirs){
  var list = clMergeList(mine, theirs, 'id', 'stock');
  var byName = {}, order = [], i, s, k, cur;
  for(i=0;i<list.length;i++){
    s = list[i];
    k = ''+(s.key || s.n || '');          /* stkFind 와 같은 기준(키 또는 이름) */
    if(!k){ order.push('#'+i); byName['#'+i]=s; continue }
    cur = byName[k];
    if(cur===undefined){ byName[k]=s; order.push(k); continue }
    /* 같은 재료가 양쪽에서 등록됨 → 최신 것 하나만 남긴다.
       (수량을 더하지 않는다 — 재고는 '현재 남은 양'이고, 추가 구매는
        충전 기능이 담당한다) */
    if(+(s.u||0) > +(cur.u||0)) byName[k]=s;
  }
  var out = [];
  for(i=0;i<order.length;i++){ if(byName[order[i]]) out.push(byName[order[i]]) }
  return out;
}

function clApply(d){
  if(!d) return;
  /* ★ 적용이 끝날 때까지 업로드 예약을 막는다 (되올림 방지).
     아래 저장함수들과 마지막 save() 가 모두 clQueue 를 타므로,
     플래그 없이는 받은 내용을 그대로 다시 올린다.
     try/finally 로 감싸 어느 줄에서 예외가 나도 반드시 풀린다 —
     안 풀리면 그 뒤 모든 자동 백업이 영구히 멈춘다. */
  CLAPPLY = 1;
  try{
  /*───── 기록형 배열은 합친다 (4단계) ─────
     ★ CLMERGE 가 꺼져 있으면 예전처럼 통째로 교체한다. 병합은 되돌리기 어려운
       동작이라, 문제가 생겼을 때 이 한 줄로 3단계 상태로 되돌릴 수 있게 두었다. */
  var _mg = (typeof CLMERGE==='undefined') || CLMERGE;
  /*───── ★ 묘비를 배열 병합보다 '먼저' 합친다 ─────
     병합(clMergeList)은 delHas() 로 "지운 것인가"를 판단한다. 그런데 묘비
     합치기가 뒤에 있으면, 상대가 보낸 삭제 흔적을 아직 모르는 상태로 병합하게
     되어 상대가 지운 항목이 내 쪽에서 되살아난다.
     (실제로 "아이패드에서 지운 당근이 아이폰에 되살아나는" 증상이 여기서 났다)
     ★ 순서가 곧 정확성이다 — 삭제 정보가 병합 판단보다 앞서야 한다. */
  if(d.del && typeof DEL!=='undefined'){
    var _dk, _di;
    for(_dk in d.del){
      if(!DEL[_dk]) DEL[_dk]={};
      for(_di in d.del[_dk]){
        if(!DEL[_dk][_di] || d.del[_dk][_di] > DEL[_dk][_di]) DEL[_dk][_di]=d.del[_dk][_di];
      }
    }
    if(typeof delPrune==='function')delPrune();
    if(typeof delSave ==='function')delSave();
  }
  if(d.baby) baby=d.baby;
  /* logs·grow 도 obs 와 같은 이유로 병합 뒤 Full 을 다시 적용한다 */
  if(d.logs) logs = _mg ? clMergeList(logs, d.logs.map(logFull), 'id', 'logs').map(logFull)
                        : d.logs.map(logFull);
  if(d.tried)tried=d.tried;
  if(d.my)   myR  = _mg ? clMergeList(myR, d.my, 'i', 'my') : d.my;
  if(d.cubes)cubes= _mg ? clMergeList(cubes, d.cubes, 'id', 'cubes') : d.cubes;
  if(d.ov)   ov=d.ov;
  if(d.plan!==undefined) plan=d.plan;
  /* ★ 병합 결과에 obsFull 을 다시 적용한다.
     obs 항목은 obsSlim 이 빈 값을 지워서 올린다(c·m·done·lv 가 없을 수 있다).
     그래서 받은 쪽은 obsFull 로 기본값을 채워야 하는데, 병합은 '내 항목'과
     '서버 항목' 중 하나를 고르므로 내 항목이 이기면 채워지지 않은 채 남는다.
     그 상태로 notiCheck(food.js:132) 가 o.c[...] 를 읽으면 예외가 나고,
     전역 오류 핸들러가 "문제가 생겨 일부 화면이 멈췄어요" 배너를 띄운다. */
  if(d.obs)  obs  = _mg ? clMergeList(obs, d.obs.map(obsFull), 'id', 'obs').map(obsFull)
                        : d.obs.map(obsFull);
  if(d.fav)  fav=d.fav;
  if(d.grow) grow = _mg ? clMergeList(grow, d.grow.map(growFull), 'id', 'grow').map(growFull)
                        : d.grow.map(growFull);
  if(d.stock&&typeof STK!=='undefined'){
    STK = _mg ? clMergeStock(STK, d.stock) : d.stock;
    if(typeof stkSave==='function')stkSave();
  }
  if(d.bowl &&typeof BW !=='undefined'){ BW =d.bowl;  if(typeof bwSave ==='function')bwSave()  }
  if(d.calc) saveKey('b6.calc', d.calc);
  if(d.nav &&typeof NAVC!=='undefined'){ NAVC=d.nav;  if(typeof navSave==='function')navSave() }
  if(d.navm&&typeof NAVM!=='undefined'){ NAVM=d.navm; if(typeof NAVMK!=='undefined')saveKey(NAVMK,d.navm) }
  if(d.sec &&typeof SEC !=='undefined'){ SEC =d.sec;  if(typeof secSave==='function')secSave() }
  if(d.cmix&&typeof CMIX!=='undefined'){ CMIX=d.cmix; if(typeof cmSave ==='function')cmSave()  }
  /* 묘비 합치기는 위(배열 병합 앞)에서 이미 처리했다 — 순서가 중요하므로
     여기로 되돌리지 말 것. 상대의 삭제를 모르는 채 병합하면 부활한다. */
  save();
  }finally{ CLAPPLY = 0 }
}
/* 기록이 몇 건인지 — 첫 연결 때 사용자에게 숫자로 보여주기 위함 */
function clCount(d){
  if(!d) return 0;
  return (d.logs?d.logs.length:0)+(d.grow?d.grow.length:0)
        +(d.obs?d.obs.length:0)+(d.my?d.my.length:0);
}

/*───────── 첫 연결 처리 ─────────*/
/* 묻는 방향을 하나로 고정한다 — "계정에 있는 백업을 가져올까요?"
     아니오(기본) → 지금 이 폰의 기록을 올린다 (백업)
     예            → 클라우드가 더 최근이라는 뜻이므로 이 폰으로 가져온다
   ★ 예전에는 확인/취소 각각이 어느 쪽을 지우는지 헷갈리는 물음이었다.
     이제 '예'만이 이 폰을 덮어쓰고, 그 경우 한 번 더 확인한다. */
var _clfirst = 0;
function clFirst(){
  if(_clfirst || !clOn()) return;
  _clfirst = 1;
  var F=FB, ref=F.D.doc(F.db,'users',CLUSER.uid,'data','main');
  F.D.getDoc(ref).then(function(sn){
    var remote = sn.exists() ? sn.data() : null;
    var mine   = clPack();
    var rn = clCount(remote), ln = clCount(mine);

    /*── 1. 한쪽이 비어 있으면 물을 것이 없다 ──*/
    if(!remote || rn===0){ clPush(1); return }        /* 클라우드 비어있음 → 올림 */
    if(ln===0){ clPull(remote); return }              /* 이 폰 비어있음 → 조용히 내림 */

    /*── 2. 내용 지문으로 비교 ──
       ★ 예전에는 clCount() 로 건수만 비교했다. 그런데 clPack() 은 17개 키를
         올리는데 clCount() 는 logs·grow·obs·my 4종만 센다. 그래서 재고·즐겨찾기·
         설정만 바꾼 기기는 변경이 감지되지 않고, 반대로 내용이 완전히 같아도
         양쪽에 기록이 있으면 팝업이 떴다.
       ★ clHash() 는 메타(at·v·did·dn)를 제외한 17개 키 전체의 지문이므로
         "시각만 다르고 내용은 같다"를 정확히 판정한다. */
    var lh = mine.hash || clHash(mine);
    var rh = remote.hash || clHash(remote);          /* 구버전이 올린 문서는 hash 가 없다 */
    var base = CL.baseHash || '';

    /* (a) 양쪽 내용이 같다 → 아무것도 하지 않는다. 기준점만 세운다 */
    if(lh && rh && lh===rh){ clBase(lh); clPaint(); return }

    /* (b) 기준점이 있으면 어느 쪽이 변했는지 알 수 있다 → 묻지 않고 처리 */
    if(base && lh && rh){
      if(lh===base){ clPull(remote); return }        /* 서버만 변함  → 조용히 받는다 */
      if(rh===base){ clPush(1);      return }        /* 이 폰만 변함 → 조용히 올린다 */
    }

    /*── 3. 둘 다 변함 + 기준점 있음 → 합친다 (4단계) ──
       예전에는 여기서 "어느 쪽으로 덮을까요"를 물었다. 어느 쪽을 골라도 반대편
       입력이 사라지는 질문이었다. 이제 합칠 수 있으므로 묻지 않는다. */
    if(CLMERGE && base){
      CLGOT = Date.now();
      CLMGD = 1;
      clPull(remote);
      return;
    }

    /*── 4. 기준점이 없다(이 기기의 첫 연결) → 이때만 묻는다 ──
       기준점이 없으면 "무엇이 새로 생긴 것인지" 판단할 근거가 없다. 다만
       합치기가 가능해졌으므로, 예전처럼 한쪽을 버리게 하지 않고 합치기를
       기본 선택지로 제시한다. */
    var rt  = remote.at ? clStamp(new Date(remote.at).getTime()) : '알 수 없음';
    /* 어느 기기가 올린 백업인지 알려준다 — 내 폰이 올린 것이면 그렇게 표시 */
    var who = remote.dn ? remote.dn : '알 수 없는 기기';
    if(remote.did && remote.did===CL.did) who = '이 폰';
    var msg = '이 계정에 백업된 기록이 있습니다.\n\n'
      +'· 백업한 기기: '+who+'\n'
      +'· 백업 시각: '+rt+'\n'
      +'· 백업된 기록: '+rn+'건\n'
      +'· 지금 이 폰: '+ln+'건\n\n'
      +'두 기록을 하나로 합칠까요?\n\n'
      +'[예] 백업과 이 폰 기록을 합칩니다 (권장 — 어느 쪽도 사라지지 않습니다)\n'
      +'[아니오] 합치지 않고 이 폰 기록만 백업합니다';
    if(!confirm(msg)){ clPush(1); return }

    /* 합치기 — 어느 쪽도 지워지지 않으므로 재확인을 두지 않는다.
       ★ 예전에는 "되돌릴 수 없습니다"를 한 번 더 물었다. 그때는 한쪽을 버리는
         동작이었기 때문이다. 이제는 합치기이므로 그 경고가 사실과 다르다. */
    CLGOT = Date.now();
    CLMGD = 1;
    clPull(remote);
  }).catch(function(e){ clErr('first',e) });
}

function clPull(remote){
  try{
    clApply(fbDec(remote));                       /* 인코딩된 중첩 배열을 원래 모양으로 */
    /* 받은 직후 이 폰 = 서버. 그 지문이 새 기준점이다.
       ★ 서버가 보낸 remote.hash 를 그대로 믿지 않고 적용 후 다시 계산한다 —
         구버전 문서는 hash 가 없고, clApply 가 일부 키만 반영하는 경우도
         있어(if(d.logs) 형태) 실제 로컬 상태와 어긋날 수 있다. */
    var _h = clHash(clPack());
    clBase(_h);
    CL.lastDown=Date.now(); CL.err=''; clSave(); clPaint();
    /*───── 화면 갱신은 Promise 밖에서 (진단·안정성) ─────
       ★ clPull 은 Firebase 의 then() 안에서 불린다. 거기서 boot() 가 예외를
         던지면 브라우저는 원인을 감추고 "Script error" 만 남긴다 —
         Firebase 가 gstatic.com(다른 출처)에서 동적 import 로 로드되기 때문이다.
         그래서 실제 원인 파일·줄번호를 알 수 없었다.
       ★ setTimeout 으로 체인 밖에서 실행하면 예외가 전역 핸들러에 그대로
         잡혀 파일·줄번호가 기록되고, 동기화 로직도 예외에 끌려가지 않는다. */
    setTimeout(function(){
      /* 다시 그리면 스크롤이 맨 위로 튄다 — 위치를 기억해 되돌려준다.
         읽던 자리를 잃지 않게 하는 것이 목적이므로 두 번 복원한다
         (그리기 직후, 그리고 비동기 렌더가 끝난 뒤 한 번 더). */
      var _sy = window.pageYOffset || document.documentElement.scrollTop || 0;
      function _restore(){
        if(!_sy) return;
        try{ window.scrollTo(0, _sy) }catch(e){}
      }
      try{
        if(typeof boot==='function') boot(); else if(typeof render==='function') render();
        _restore(); setTimeout(_restore, 60);
      }catch(e){
        /* 화면 그리기가 실패해도 받은 데이터는 이미 저장됐다 —
           배너는 전역 핸들러가 띄우되, 원인을 남긴다. */
        try{ localStorage.setItem('b6.lasterr', JSON.stringify({
          m:'pull-render: '+((e&&e.message)||e), s:'cloud.js', l:0, c:0,
          v:window.APPV, at:new Date().toISOString()})) }catch(_e){}
        throw e;
      }
    }, 0);
    clPhPull();
    /*───── 병합 결과 되올리기 (4단계) ─────
       병합했으면 내 내용은 서버와 다르다(양쪽을 합쳤으므로). 올리지 않으면
       상대 기기는 자기 것만 있는 옛 문서를 계속 보게 된다.
       ★ 서버가 보낸 hash 와 비교해 정말 달라졌을 때만 올린다 — 합쳤는데
         결과가 서버와 같으면(내 쪽에 새 것이 없었던 경우) 올릴 필요가 없다.
       ★ clBase 를 먼저 세워 두었으므로, 이 push 가 성공하면 기준점이 다시
         갱신되어 다음 확인에서 "변한 적 없음"으로 조용히 넘어간다. */
    if(CLMGD){
      CLMGD = 0;
      if(!remote.hash || remote.hash !== _h){
        /* ★ clPushNow 를 직접 부른다 — clPush 를 부르면 그것이 또 서버를
             확인하고, 서버는 아직 병합 전 상태이므로 "내가 모르는 변경이 있다"고
             판단해 다시 병합→되올림을 반복한다(무한재귀). 방금 이 순간 서버를
             읽어 합친 결과이므로 다시 확인할 필요가 없다. */
        setTimeout(function(){ clSend(1) }, 300);  /* boot() 가 끝난 뒤 올린다 */
      }
    }
  }catch(e){ CLMGD=0; clErr('pull',e) }
}

/*───────── 올리기 (기록) ─────────*/
function clPush(now){
  if(!clOn()) return;
  if(!navigator.onLine){ CL.pend=1; clSave(); clPaint(); return }
  CLBUSY=1; clPaint();
  var F=FB, ref=F.D.doc(F.db,'users',CLUSER.uid,'data','main');
  /* setDoc 은 데이터가 규격에 안 맞으면 Promise 를 만들기 전에 '동기적으로' throw 한다.
     그때 .catch() 는 실행되지 않으므로 CLBUSY 가 1로 남아 '백업 중…'이 영구히 멈춘다.
     → 호출 자체를 try 로 감싸 어떤 경로로 실패해도 반드시 CLBUSY 를 0으로 되돌린다. */
  /* ★ 보낼 뭉치를 변수로 붙잡는다 — 성공 후에 clPack() 을 다시 부르면
       그 사이 사용자가 입력한 내용까지 포함된 지문이 기준점이 되어
       "안 올린 변경을 올렸다"고 오판한다. 올린 것과 같은 뭉치여야 한다. */
  /*───── 올리기 전에 서버를 확인한다 (4단계 보강) ─────
     ★ 여기가 "동기화 전 추가/삭제가 서로 안 보인다"의 근본 원인이었다.
       setDoc 은 문서 전체 교체다. 서버를 보지 않고 올리면, 그 사이 상대가
       올린 내용이 그대로 지워진다. 병합 엔진을 만들어도 clPush 가 확인 없이
       덮으면 아무 소용이 없다 — 덮은 뒤에는 합칠 대상이 남아있지 않다.
     ★ 그래서 올리기 직전에 한 번 읽어, 서버가 내 기준점과 다르면(=상대가
       무언가 올렸으면) 먼저 합치고 그 결과를 올린다. */
  if(CLMERGE && CL.baseHash && !CLPUSHM){
    CLPUSHM = 1;                                  /* 이 확인 때문에 재귀하지 않도록 */
    F.D.getDoc(ref).then(function(sn){
      CLPUSHM = 0;
      var rem = sn.exists() ? sn.data() : null;
      if(rem && rem.hash && rem.hash !== CL.baseHash && rem.hash !== clHash(clPack())){
        /* 서버에 내가 모르는 변경이 있다 → 합친 뒤 올린다.
           clPull 이 병합·저장·화면갱신까지 하고, CLMGD 로 되올림도 예약한다. */
        CLBUSY = 0;
        CLGOT = Date.now(); CLMGD = 1;
        clPull(rem);
        return;
      }
      clSend(now);                                /* 서버가 내가 아는 상태 → 그냥 올린다 */
    }).catch(function(e){
      CLPUSHM = 0;
      /* 확인에 실패했으면 예전처럼 올린다 — 백업이 멈추는 것보다 낫다 */
      clSend(now);
    });
    return;
  }
  clSend(now);
}

/* 실제 전송 — clPush 가 서버 확인을 끝낸 뒤 부른다.
   ★ 이름을 clSend 로 둔다. 예전에 clPushNow 로 지었더니 파일 아래쪽에 이미
     있던 clPushNow('지금 백업하기' 버튼 → clPush 호출)와 이름이 겹쳤다.
     나중 정의가 이 함수를 덮어써서 clPush → 버튼함수 → clPush 무한재귀가 되어
     RangeError: Maximum call stack size exceeded 가 났다. */
function clSend(now){
  if(!clOn()) return;
  if(!navigator.onLine){ CLBUSY=0; CL.pend=1; clSave(); clPaint(); return }
  CLBUSY=1; clPaint();
  var F=FB, ref=F.D.doc(F.db,'users',CLUSER.uid,'data','main');
  var out = clPack();
  try{
    F.D.setDoc(ref, fbEnc(out)).then(function(){
      CLBUSY=0; CL.lastUp=Date.now(); CL.pend=0; CL.err='';
      clBase(out.hash || clHash(out));            /* 올린 내용 = 서버 내용 → 기준점 */
      clSave(); clPaint();
      clPhPush();                                 /* 기록이 끝난 뒤 사진 */
      /* ★ 올린 직후 서버를 한 번 확인한다 (4단계 보강).
         내 변경을 올리는 것과 상대 변경을 받는 것은 별개다. 예전에는 올리고
         끝나서, 내가 입력한 뒤에는 상대가 올린 것을 받을 기회가 없었다.
         (CL.pend 가 서 있는 동안 clSync 는 스스로 물러나므로 더욱 그랬다)
         → "동기화 전에 각각 추가/삭제한 것이 서로 안 보인다"의 직접 원인. */
      setTimeout(function(){ clSync('afterpush') }, 500);
    }).catch(function(e){
      CLBUSY=0; CL.pend=1; clErr('push',e);
    });
  }catch(e){
    CLBUSY=0; CL.pend=1; clErr('push',e);
  }
}

/* 기록이 바뀌면 3초 뒤 자동 전송 — 연달아 입력할 때 과다 전송 방지 */
function clQueue(){
  if(!clOn()) return;
  /* ★ 서버에서 받아 적용하는 중에는 예약하지 않는다.
     clApply 는 STK·BW·NAVC·SEC·CMIX 를 각 저장함수로 쓰고 마지막에 save() 도
     부른다. 그 저장함수들이 clQueue 를 타게 되면(이번 수정) "받자마자 그대로
     되올리는" 왕복이 생긴다. 내용이 같아 지문도 같으니 사고는 아니지만,
     의미 없는 통신이고 lastUp 시각을 흐려 진단을 어렵게 한다. */
  if(CLAPPLY) return;
  CL.pend=1; clSave(); clPaint();
  if(_cltmr) clearTimeout(_cltmr);
  _cltmr = setTimeout(function(){ _cltmr=null; clPush() }, 3000);
}

/*───────── 사진 (기록과 분리, 한 장씩) ─────────*/
/* 사진은 문서 1MiB 한도가 있어 한 장 = 한 문서로 나눠 담는다. */
var CLPHB=0;                          /* 남은 사진 장수 — 화면 표시용 */
function clPhPush(){
  if(!clOn() || !navigator.onLine){ CLPHB=0; return }
  var keys=Object.keys(ph||{});
  if(!keys.length){ CLPHB=0; clPaint(); return }
  var done = LS('b6.phup',{}) || {};
  /* 사진 크기 판단은 실제 바이트(PHN)로 한다 — IDB 시대에는 ph[k] 가
     objectURL 문자열이라 길이를 재면 의미가 없다.
     Firestore 문서 1MiB 한도 = base64 로 부풀면 약 900KB 원본이 상한. */
  function bytesOf(k){
    if(typeof PHN!=='undefined' && PHN[k]!=null) return PHN[k];
    return (typeof ph[k]==='string')?ph[k].length:0;
  }
  var todo = keys.filter(function(k){
    var n=bytesOf(k);
    return n>0 && n<=660*1024 && done[k]!==n;     /* 660KB*1.34 ≒ 890KB base64 */
  });
  if(!todo.length){ CLPHB=0; saveKey('b6.phup',done); clPaint(); return }
  CLPHB=todo.length; clPaint();
  var F=FB, i=0, n=0;
  (function step(){
    if(i>=todo.length || n>=5){                    /* 한 묶음 5장 */
      saveKey('b6.phup',done);
      CLPHB=todo.length-i; clPaint();
      /* ★ 예전엔 5장에서 끊긴 뒤 다시 부르는 곳이 없어 나머지가 영구히 안 올라갔다 */
      if(i<todo.length) setTimeout(clPhPush, 1200);
      return;
    }
    var k=todo[i++]; n++;
    /* Blob → dataURL 변환은 올릴 때만 (저장은 Blob 그대로 두어 용량 절약) */
    var get = (typeof phDurl==='function') ? phDurl(k) : Promise.resolve(ph[k]);
    get.then(function(d){
      if(!d){ step(); return }
      return F.D.setDoc(F.D.doc(F.db,'users',CLUSER.uid,'photos',encodeURIComponent(k)),
        {d:d, n:bytesOf(k), at:Date.now()})
       .then(function(){ done[k]=bytesOf(k); CL.lastPh=Date.now(); clSave(); step() });
    }).catch(function(e){ CLPHB=0; saveKey('b6.phup',done); clErr('photo',e) });
  })();
}

function clPhPull(){
  if(!clOn()) return;
  var F=FB;
  F.D.getDocs(F.D.collection(F.db,'users',CLUSER.uid,'photos')).then(function(qs){
    var got=0, done=LS('b6.phup',{})||{}, chain=Promise.resolve();
    qs.forEach(function(doc){
      var k=decodeURIComponent(doc.id), v=doc.data();
      if(!(v&&v.d) || ph[k]) return;
      got++;
      /* 새 사진은 IndexedDB 로 들어간다 (phStore 가 폴백까지 처리) */
      chain=chain.then(function(){
        done[k]=v.n||v.d.length;
        return (typeof phStore==='function')?phStore(k,v.d):(ph[k]=v.d);
      });
    });
    chain.then(function(){
      if(got){ saveKey('b6.phup',done);
               if(typeof render==='function') render();
               clPaint() }
    });
  }).catch(function(){});
}

/*───────── 용량 계산 ─────────*/
/* localStorage 한도를 알려주는 표준 API 는 없다. 실측상 5MB 안팎이 표준이므로
   그 값을 기준선으로 삼고, navigator.storage.estimate() 가 알려주면 함께 보여준다. */
var LSCAP = 5*1024*1024;
function fmtB(n){
  n=+n||0;
  if(n<1024) return n+'B';
  if(n<1048576) return (n/1024).toFixed(n<102400?1:0)+'KB';
  return (n/1048576).toFixed(2)+'MB';
}
/* 사진이 이 폰에서 실제로 차지하는 바이트 */
function phBytes(){
  /* IndexedDB 시대의 실제 사진 바이트 (Blob 크기 합). idb.js 가 없으면 예전 방식 */
  if(typeof phRealBytes==='function') return phRealBytes();
  try{ var s=localStorage.getItem(KY.p); return s?s.length:0 }catch(e){ return 0 }
}
/* 이 폰 전체 localStorage 사용량 (키 이름 포함) */
function lsBytes(){
  var t=0;
  try{ for(var i=0;i<localStorage.length;i++){ var k=localStorage.key(i);
        t += (k||'').length + ((localStorage.getItem(k)||'').length) } }catch(e){}
  return t;
}
/* 기록(사진 제외)만의 바이트 — 사진이 IDB 로 빠진 뒤의 실제 기록 사용량 */
function recBytes(){
  var t=0;
  try{ for(var i=0;i<localStorage.length;i++){ var k=localStorage.key(i);
        if(k===KY.p) continue;                          /* 사진 사본 제외 */
        t += (k||'').length + ((localStorage.getItem(k)||'').length) } }catch(e){}
  return t;
}

/* 클라우드에 올라간 사진 — 장수·바이트, 못 올리는 큰 사진 수까지 */
function phUpStat(){
  var d=LS('b6.phup',{})||{}, n=0, b=0, big=0, tot=0, tb=0, k, len;
  function bytesOf(x){
    if(typeof PHN!=='undefined' && PHN[x]!=null) return PHN[x];
    return (typeof ph[x]==='string')?ph[x].length:0;
  }
  for(k in ph){
    if(!Object.prototype.hasOwnProperty.call(ph,k)) continue;
    len=bytesOf(k); tot++; tb+=len;
    if(len>660*1024){ big++; continue }
    if(d[k]===len){ n++; b+=len }
  }
  return {n:n, b:b, big:big, tot:tot, tb:tb};
}
/* 브라우저가 알려주는 이 사이트 전체 할당량 (지원할 때만) */
var CLQ=null;
function clQuota(){
  if(CLQ!==null || !(navigator.storage && navigator.storage.estimate)) return;
  CLQ=0;
  navigator.storage.estimate().then(function(e){
    CLQ={u:e.usage||0, q:e.quota||0}; clPaint();
  }).catch(function(){ CLQ=0 });
}

/*───────── 시각 표시 ─────────*/
function p2(n){ return (n<10?'0':'')+n }
/* ★ 초까지 보여준다 — '방금'만 뜨면 백업이 실제로 됐는지 확인할 수 없다 */
function clStamp(t){
  if(!t) return '아직 없음';
  var d=new Date(t);
  return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate())+' '
        +p2(d.getHours())+':'+p2(d.getMinutes())+':'+p2(d.getSeconds());
}
function clAgo(t){
  if(!t) return '';
  var s=Math.floor((Date.now()-t)/1000); if(s<0) s=0;
  if(s<60)    return s+'초 전';
  if(s<3600)  return Math.floor(s/60)+'분 '+(s%60)+'초 전';
  if(s<86400) return Math.floor(s/3600)+'시간 전';
  return Math.floor(s/86400)+'일 전';
}
function clWhen(){ return CL.lastUp?clAgo(CL.lastUp):'아직 없음' }

/*───────── 상태 표시 ─────────*/
function clState(){
  if(!clReady()) return {t:'off',  s:'', c:'#8C8480'};
  if(!clOn()){
    if(CL.on && !FB) return {t:'chk', s:'백업 확인 중…', c:'#7FA8D9'};
    return {t:'out', s:'백업 안 됨 · 로그인하세요', c:'#E08A00'};
  }
  if(CLBUSY)            return {t:'sync', s:'백업 중…', c:'#7FA8D9'};
  if(!navigator.onLine) return {t:'off2', s:'인터넷 없음 · 연결되면 자동 백업', c:'#E08A00'};
  if(CL.err)            return {t:'err',  s:'백업 실패 · 눌러서 다시 시도', c:'#EF6A4C'};
  if(CLPHB)             return {t:'sync', s:'사진 백업 중… '+CLPHB+'장 남음', c:'#7FA8D9'};
  if(CL.pend)           return {t:'wait', s:'백업 대기 중…', c:'#7FA8D9'};
  /* 2단계 — 다른 기기 변경을 방금 받아왔다면 그 사실을 잠깐 알려준다.
     ★ 새 UI(토스트)를 만들지 않고 기존 배지에 얹는다. 자동으로 화면이
       바뀌면 사용자는 "내가 뭘 잘못 눌렀나" 싶으므로 반드시 알려야 하지만,
       확인을 요구하는 알림(alert)은 하던 일을 끊으므로 쓰지 않는다. */
  if(CLGOT && Date.now()-CLGOT < 20000)
    return {t:'got', s:'다른 기기 기록을 받아왔습니다', c:'#2E9C7D'};
  return {t:'ok', s:clWhen()+' 백업됨', c:'#2E9C7D'};
}
/* 배지 + 설정 카드를 함께 갱신한다.
   ★ 예전엔 배지(#cb)만 갱신해서, '지금 백업하기'로 실제 백업이 끝나도
     정보 탭 카드의 시각이 그대로였다 → "전혀 변화가 없다"의 진짜 원인. */
function clPaint(){
  var S=clState();
  var b=document.getElementById('cb');
  if(b){
    /* 정상일 때는 아무것도 띄우지 않는다.
       백업은 당연한 동작이고, 최근 백업시각·지금 백업하기는 정보 탭에 있다.
       손볼 것이 있을 때(로그인 필요·백업 실패)만 나타난다. */
    var show = (S.t==='out' || S.t==='err');
    if(!show){ b.style.display='none'; b.innerHTML=''; b.onclick=null }
    else{
      b.style.display='block';
      b.style.color=S.c;
      b.innerHTML='⚠️ '+S.s;
      b.onclick=function(){ if(!clOn()) clLogin(); else clPush(1) };
    }
  }
  var c=document.getElementById('clbody');
  if(c) c.innerHTML=clBody();
}
setInterval(clPaint, 15000);
/* 초를 표시하므로 1초마다 — 설정 카드가 화면에 있을 때만 일한다 */
setInterval(function(){
  if(document.hidden) return;
  var c=document.getElementById('clbody'); if(!c) return;
  c.innerHTML=clBody();
}, 1000);

/*───────── 조용한 동기화 (2단계) ─────────
   앱으로 돌아올 때·인터넷이 돌아올 때 서버를 확인해, 다른 기기가 올린 변경을
   자동으로 받아온다. 지금까지 다운로드는 부팅 시 1회(clFirst)뿐이었다.

   ★ clFirst 와 결정적으로 다른 점 — 이 함수는 절대 묻지 않는다.
     사용자가 앱을 쓰는 도중에 갑자기 확인창이 뜨면 하던 일이 끊기고,
     무엇보다 "무슨 상황인지 모르는 채 누르는" 선택은 데이터를 잃게 한다.
     그래서 확신할 수 있을 때만 움직이고, 애매하면 아무것도 하지 않는다.
     판단이 필요한 상황은 다음 부팅 때 clFirst 가 제대로 묻는다.

   ★ 기준점(baseHash)이 없으면 아예 시작하지 않는다 — 어느 쪽이 변했는지
     알 수 없는 상태에서 자동으로 덮으면 그것이 곧 데이터 유실이다. */
var _clsync = 0;                        /* 동시 실행 방지 */
var CLSYNCAT = 0;                       /* 마지막 확인 시각 — 화면 표시·과다호출 방지 */

function clSync(why){
  if(_clsync) return;                                   /* 이미 확인 중 */
  if(!clOn() || !navigator.onLine) return;
  if(CLBUSY) return;                                    /* 업로드 중이면 비켜준다 */
  if(_cltmr) return;                                    /* 업로드 대기 중(3초 디바운스) → 내 변경이 먼저 */
  if(CL.pend) return;                                   /* 못 올린 변경이 있다 → 받으면 그것이 사라진다 */
  if(!CL.baseHash) return;                              /* 기준점 없음 → 판단 불가, 건드리지 않는다 */
  /*───── 과다호출 억제 — 단, 트리거 성격에 따라 다르게 ─────
     ★ 예전에는 종류를 가리지 않고 10초를 막았다. 그래서 앱으로 돌아왔을 때
       (visible/pageshow/focus) 직전에 타이머가 한 번 돌았으면 그 이벤트가
       10초 억제에 걸려 버려지고, 결국 다음 타이머(최대 60초)까지 기다려야
       반영됐다. "자동은 되는데 60초 걸린다"의 원인이 이것이다.
     ★ 사용자가 앱을 다시 본 순간은 가장 확인이 필요한 시점이므로 거의 막지
       않고(1.5초 — 같은 전환에서 이벤트 2~3개가 겹쳐 오는 것만 흡수),
       주기 확인(timer)만 종전처럼 억제한다. */
  var _gap = (why==='timer') ? 10000 : 1500;
  if(Date.now() - CLSYNCAT < _gap) return;
  /* ★ 입력창(모달)이 열려 있으면 받지 않는다 — clPull 은 boot()/render() 로
     화면을 다시 그리므로, 기록을 쓰던 중이면 입력하던 내용이 사라진다.
     닫은 뒤 다음 기회(다시 앱으로 돌아올 때)에 받으면 충분하다. */
  var _md = document.getElementById('md');
  if(_md && _md.classList.contains('on')) return;
  /*───── 사용자가 지금 화면을 쓰고 있으면 받지 않는다 ─────
     ★ clPull 은 boot() 로 화면 전체를 다시 그린다. 그 순간
         · 입력 중이던 칸이 새로 만들어져 포커스가 풀린다 → 자판이 닫힌다
         · 목록이 다시 그려져 스크롤이 맨 위로 튄다
       받아올 내용은 몇 초 뒤에 받아도 아무 문제가 없다. 반대로 입력하던 것을
       잃는 것은 되돌릴 수 없다 — 그래서 사용 중에는 무조건 양보한다. */
  var ae = document.activeElement;
  if(ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName)) return;   /* 입력 중 */
  if(ae && ae.isContentEditable) return;
  /* 스크롤을 움직인 직후 2초는 보류 — 읽는 중에 화면이 튀지 않게 */
  if(CLSCRL && Date.now() - CLSCRL < 2000) return;

  _clsync = 1; CLSYNCAT = Date.now();
  var F=FB, ref=F.D.doc(F.db,'users',CLUSER.uid,'data','main');
  F.D.getDoc(ref).then(function(sn){
    _clsync = 0;
    if(!sn.exists()) return;                            /* 서버에 아직 없음 → clPush 가 할 일 */
    var remote = sn.data();
    if(!remote.hash) return;                            /* 구버전이 올린 문서 → 판단 불가 */

    /* 확인 사이에 사용자가 입력했을 수 있다 — 그러면 물러난다 */
    if(CLBUSY || _cltmr || CL.pend) return;

    var lh = clHash(clPack());
    if(lh === remote.hash) return;                      /* 같다 → 할 일 없음 */

    /* 이 폰이 기준점 그대로면 = 이 폰은 안 변했고 서버만 변했다 → 안전하게 받는다 */
    if(lh === CL.baseHash){
      /* 사용자가 누르지 않았는데 화면이 바뀌는 유일한 경로 → 반드시 알린다.
         (clFirst·clRestore 는 사용자가 스스로 선택한 것이므로 표시하지 않는다) */
      CLGOT = Date.now();
      clPull(remote);
      return;
    }

    /*───── 4단계 — 둘 다 변했으면 합친다 ─────
       예전에는 여기서 물러나(return) 다음 부팅의 clFirst 가 사용자에게 물었다.
       이제는 양쪽 변경을 합칠 수 있으므로 묻지 않고 처리한다.
       ★ 합친 뒤에는 내 내용이 서버와 다르다 → 반드시 되올려야 상대 기기도
         합쳐진 결과를 본다. 안 올리면 각 기기가 서로 다른 목록을 갖게 된다. */
    if(CLMERGE && CL.baseHash){
      CLGOT = Date.now();
      CLMGD = 1;                       /* clPull 안에서 되올림을 예약하게 한다 */
      clPull(remote);
      return;
    }

    /* 그 밖(이 폰만 변함 / 둘 다 변함)은 여기서 처리하지 않는다.
       이 폰만 변한 경우는 clQueue→clPush 가 이미 올릴 예정이고,
       둘 다 변한 경우는 사람이 판단해야 하므로 다음 부팅의 clFirst 에 맡긴다. */
  }).catch(function(e){
    _clsync = 0;
    /* 조용한 동기화의 실패는 사용자 잘못이 아니다 — 배지를 띄우지 않고
       진단용으로만 남긴다. 다음 기회에 다시 시도하면 된다. */
    CL.emsg = 'sync: ' + ((e&&(e.code||e.name))||'') + (e&&e.message?(' · '+e.message):'');
    if(CL.emsg.length>200) CL.emsg=CL.emsg.slice(0,200);
    clSave();
  });
}

/* 인터넷이 돌아오면 밀린 것을 자동 전송 */
/*───── 밀린 것이 있으면 올리고, 없으면 받는다 ─────
   ★ clPush 는 이제 올리기 전에 서버를 확인해 필요하면 합치므로(위 참조),
     pend 상태에서 clPush 를 부르는 것만으로 '올리기 + 받기'가 함께 이뤄진다.
     전송 성공 후에도 clSync('afterpush') 가 한 번 더 확인한다.
     예전에는 pend 면 clPush 만 하고 끝나서, 내가 입력한 뒤에는 상대 변경을
     받을 경로가 아예 없었다. */
window.addEventListener('online', function(){
  if(clOn() && CL.pend) clPush(1);
  else clSync('online');
  clPaint();
});
window.addEventListener('offline', clPaint);
document.addEventListener('visibilitychange', function(){
  if(document.hidden || !clOn()) return;
  if(CL.pend) clPush(1);
  else clSync('visible');
});
/*───────── iOS 보강 (3b) ─────────
   아이폰·아이패드에서 "다른 기기 수정이 앱을 껐다 켜야 반영된다"는 문제.
   원인이 둘이다.
     ① iOS Safari/PWA 는 앱을 전환해도 visibilitychange 가 오지 않는 경우가
        많다. pageshow·focus 는 상대적으로 잘 온다.
     ② 아예 화면을 계속 보고 있으면 어떤 이벤트도 발생하지 않는다.
        서버가 바뀐 것을 알려주는 수단이 없으므로(onSnapshot 미사용)
        스스로 주기적으로 확인해야 한다.

   ★ clSync 안에 10초 억제와 여러 안전장치가 이미 있으므로, 트리거를
     늘려도 통신이 과해지거나 로컬을 덮을 위험은 커지지 않는다. */
window.addEventListener('pageshow', function(){ clSync('pageshow') });
window.addEventListener('focus',    function(){ clSync('focus')    });
/*───── 스크롤 감지 — 확인이 아니라 '보류'를 위해 쓴다 ─────
   ★ 예전에는 touchstart 로 clSync 를 불렀다. iOS 이벤트 누락을 메우려던 것인데,
     화면을 만질 때마다 서버를 확인하고 그 결과로 boot() 가 돌아 스크롤이 위로
     튀고 자판이 닫혔다. 손을 대는 순간이야말로 화면을 바꾸면 안 되는 때다.
   ★ 그래서 반대로 뒤집었다 — 스크롤은 "지금 읽고 있다"는 신호이므로
     그 시각을 기록해 clSync 가 스스로 물러나게 한다. */
window.addEventListener('scroll', function(){ CLSCRL = Date.now() }, {passive:true});
document.addEventListener('touchmove', function(){ CLSCRL = Date.now() }, {passive:true});
/* 앱을 보고 있는 동안 주기 확인 — 화면이 가려져 있으면 건너뛴다(배터리).
   ★ 20초: 다른 기기 변경이 늦게 반영된다는 문제로 60초에서 줄였다.
     이 경로는 getDoc 1회(수 KB)뿐이고 내용이 같으면 아무 일도 하지 않는다. */
setInterval(function(){
  if(document.hidden) return;
  if(!clOn()) return;
  /* ★ 밀린 것이 있으면 clPush 로 간다 — clPush 가 서버 확인·병합까지 한다.
     예전에는 pend 면 그냥 건너뛰어서, 올리지 못한 상태가 이어지는 동안
     상대 변경을 영원히 받지 못했다. */
  if(CL.pend){ clPush(1); return }
  clSync('timer');
}, 20000);

/*───────── 지금 백업하기 (버튼 전용) ─────────*/
/* 눌렀을 때 무슨 일이 일어났는지 반드시 화면·안내로 남긴다 */
function clPushNow(){
  if(!clReady()) return;
  if(!clOn()){ clLogin(); return }
  if(!navigator.onLine){
    CL.pend=1; clSave(); clPaint();
    alert('인터넷에 연결되어 있지 않아요.\n연결되면 자동으로 백업됩니다.');
    return;
  }
  CLBUSY=1; clPaint();
  clPush(1);
}

/*───────── 설정 화면 카드 (info.js 에서 호출) ─────────*/
function clCard(){
  if(!clReady()){
    return '<div class="st">☁️ 클라우드 백업</div><div class="cd">'
     +'<p class="mu" style="margin:0">클라우드 설정이 아직 등록되지 않았습니다. '
     +'등록하면 구글 계정으로 로그인해 자동 백업할 수 있어요.</p></div>';
  }
  clQuota();
  return '<div class="st">☁️ 클라우드 백업</div><div class="cd" id="clbody">'+clBody()+'</div>';
}

/* 용량 막대 */
function clBar(used, cap, col){
  var r=cap>0?Math.min(100,Math.round(used/cap*1000)/10):0;
  return '<div style="height:7px;border-radius:4px;background:#E7E3DF;overflow:hidden;margin:5px 0 2px">'
    +'<i style="display:block;height:100%;width:'+r+'%;background:'+col+'"></i></div>'
    +'<div class="mu" style="font-size:10px">'+fmtB(used)+' / '+fmtB(cap)+' ('+r+'%)</div>';
}

function clBody(){
  var S=clState();
  if(!clOn()){
    return '<p class="mu" style="margin:0 0 10px">구글 계정으로 로그인하면 <b>기록할 때마다 자동으로 백업</b>됩니다. '
      +'폰을 바꿔도 로그인만 하면 그대로 이어서 쓸 수 있어요.</p>'
      +'<button class="btn p" onclick="clLogin()">'+(CL.on?'구글 계정으로 다시 로그인':'구글 계정으로 로그인')+'</button>'
      +(CL.on?('<p class="mu" style="margin:9px 0 0;font-size:10.5px">이전에 <b>'+esc(CL.email||'구글 계정')
        +'</b>으로 로그인한 기록이 있습니다. 세션이 만료됐을 수 있으니 위 버튼을 한 번 더 눌러 주세요.</p>'
        +'<button class="btn y s" style="margin-top:8px" onclick="clForget()">로그인 정보 지우기</button>'):'')
      +'<p class="mu" style="margin:9px 0 0;font-size:10.5px">로그인하지 않아도 앱은 지금처럼 모두 동작합니다.</p>'
      +(CL.emsg?('<p class="mu" style="margin:9px 0 0;font-size:10px;color:#EF6A4C;word-break:break-all">'
        +'마지막 오류('+esc(CL.err||'')+'): '+esc(CL.emsg)+'</p>'):'');
  }

  var U=phUpStat(), pb=phBytes(), lb=lsBytes(), recB=recBytes();
  if(typeof idbQuota==='function') idbQuota();
  return '<div class="ir"><span>계정</span><b style="font-size:12px">'+esc(CL.email||'로그인됨')+'</b></div>'
   +'<div class="ir"><span>상태</span><b style="color:'+S.c+'">'+(S.s||'-')+'</b></div>'
   /* ── 시각: 초까지 ── */
   +'<div class="ir"><span>최근 백업</span><b style="font-size:11.5px">'+clStamp(CL.lastUp)
     +(CL.lastUp?(' <span class="mu">· '+clAgo(CL.lastUp)+'</span>'):'')+'</b></div>'
   +(CL.lastPh?('<div class="ir"><span>최근 사진 백업</span><b style="font-size:11.5px">'+clStamp(CL.lastPh)
     +' <span class="mu">· '+clAgo(CL.lastPh)+'</span></b></div>'):'')
   +(CL.lastDown?('<div class="ir"><span>최근 내려받기</span><b class="mu" style="font-size:11.5px">'+clStamp(CL.lastDown)+'</b></div>'):'')

   /* ── 사진 용량 (IndexedDB 기준) ── */
   +'<div class="st" style="margin:12px 0 6px;font-size:12px">📷 사진</div>'
   +'<div class="ir"><span>저장 위치</span><b style="color:'+(IDBOK?'#2E9C7D':'#E08A00')+'">'
     +(IDBOK?'IndexedDB (한도 없음에 가까움)':'localStorage (제한 5MB)')+'</b></div>'
   +'<div class="ir"><span>이 폰의 사진</span><b>'+U.tot+'장 · '+fmtB(pb)+'</b></div>'
   +'<div class="ir"><span>클라우드에 백업됨</span><b style="color:'+((U.tot-U.big-U.n)===0?'#2E9C7D':'#E08A00')+'">'
     +U.n+'장 · '+fmtB(U.b)+'</b></div>'
   +((U.tot-U.big-U.n)>0?('<div class="ir"><span>아직 안 올라간 사진</span><b>'+(U.tot-U.big-U.n)+'장</b></div>'):'')
   +(U.big?('<div class="ir"><span>용량초과로 못 올림</span><b style="color:#EF6A4C">'+U.big+'장</b></div>'
     +'<div class="mu" style="font-size:10px">한 장이 660KB(base64 변환 후 약 890KB)를 넘으면 클라우드 문서 한도(1MB)에 걸립니다.</div>'):'')
   +(U.tot?('<div class="mu" style="font-size:10.5px;margin:6px 0 0">클라우드 백업 진행률</div>'
     +clBar(U.b, pb||1, '#7FA8D9')):'')
   +(U.tot?('<div class="mu" style="font-size:10px;margin-top:3px">장당 평균 '+fmtB(Math.round(pb/U.tot))+'</div>'):'')

   /* ── 이관 상태 ── */
   +((typeof PHMIG!=='undefined' && PHMIG.moved)?
     ('<div class="mu" style="font-size:10.5px;margin-top:6px;color:#2E9C7D">✓ 사진 '+PHMIG.moved
      +'장을 IndexedDB 로 옮겼습니다 — localStorage 공간이 그만큼 비었습니다.</div>'):'')
   +((typeof PHMIG!=='undefined' && PHMIG.err)?
     ('<div class="mu" style="font-size:10px;margin-top:6px;color:#E08A00">IndexedDB 를 쓸 수 없어 예전 방식으로 저장합니다'
      +' ('+esc(PHMIG.err)+'). 사파리 시크릿 모드에서는 정상입니다 — 데이터는 그대로 있습니다.</div>'):'')

   /* ── 저장공간 ── */
   +'<div class="st" style="margin:12px 0 6px;font-size:12px">💾 이 폰 저장공간</div>'
   +'<div class="mu" style="font-size:10.5px">기록 — 브라우저 한도 '+fmtB(LSCAP)+' (localStorage)</div>'
   +clBar(lb, LSCAP, lb>LSCAP*0.8?'#EF6A4C':'#2E9C7D')
   +'<div class="mu" style="font-size:10px;margin-top:2px">기록 '+fmtB(recB)+' · 그 외 설정 '+fmtB(Math.max(0,lb-recB))
     +(IDBOK?' · 사진은 여기서 빠졌습니다':' · 사진 '+fmtB(pb)+' 포함')+'</div>'
   +(IDBOK?('<div class="mu" style="font-size:10.5px;margin-top:9px">사진 — IndexedDB'
     +((IDBQ&&IDBQ.q)?(' (전체 가용 '+fmtB(IDBQ.q)+')'):'')+'</div>'
     +((IDBQ&&IDBQ.q)?clBar(pb, IDBQ.q, '#7FA8D9')
       :('<div class="mu" style="font-size:10px">사진 '+fmtB(pb)+' 사용 · 이 브라우저는 전체 가용량을 알려주지 않습니다</div>'))):'')
   +((IDBQ&&IDBQ.q)?('<div class="mu" style="font-size:10px;margin-top:4px">브라우저가 알려준 이 사이트 전체: 가용 <b>'
     +fmtB(IDBQ.q)+'</b> 중 '+fmtB(IDBQ.u)+' 사용 ('+(IDBQ.q?Math.round(IDBQ.u/IDBQ.q*1000)/10:0)+'%)'
     +' · 남은 공간 <b>'+fmtB(Math.max(0,IDBQ.q-IDBQ.u))+'</b></div>'):'')
   +(IDBOK?('<div class="mu" style="font-size:10px;margin-top:6px">사진을 IndexedDB 로 옮겨 5MB 제한에서 벗어났습니다. '
     +'남은 공간 기준으로 대략 <b>'+(function(){
        var per=U.tot?Math.round(pb/U.tot):70*1024;
        var free=(IDBQ&&IDBQ.q)?Math.max(0,IDBQ.q-IDBQ.u):0;
        return free&&per?(Math.floor(free/per)+'장'):'수천 장';
      })()+'</b> 더 담을 수 있습니다.</div>'):'')

   +'<button class="btn g s" style="margin-top:12px" onclick="clPushNow()">'
     +((CLBUSY||CLPHB)?'🔄 백업 중…':'지금 백업하기')+'</button>'
   +'<button class="btn g s" style="margin-top:8px" onclick="clRestore()">클라우드에서 되돌리기</button>'
   +'<button class="btn y s" style="margin-top:8px" onclick="clLogout()">로그아웃</button>'
   +(CL.emsg?('<p class="mu" style="margin:9px 0 0;font-size:10px;color:#EF6A4C;word-break:break-all">'
     +'마지막 오류('+esc(CL.err||'')+'): '+esc(CL.emsg)+'</p>'):'');
}

/* 되돌리기 — 명시적으로 한 번 더 확인 */
function clRestore(){
  if(!clOn()) return;
  if(!confirm('클라우드에 저장된 기록으로 되돌립니다.\n\n이 폰의 현재 기록은 사라집니다.\n먼저 설정 > 백업 내보내기로 파일을 저장해 두는 것을 권합니다.\n\n계속할까요?')) return;
  var F=FB;
  F.D.getDoc(F.D.doc(F.db,'users',CLUSER.uid,'data','main')).then(function(sn){
    if(!sn.exists()){ alert('클라우드에 저장된 기록이 없습니다.'); return }
    clPull(sn.data());
    alert('되돌리기 완료!');
  }).catch(function(){ alert('불러오지 못했어요. 인터넷 연결을 확인해 주세요.') });
}
