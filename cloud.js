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
    cmix :(typeof CMIX!=='undefined'?CMIX:null)
  };
  p.hash = clHash(p);            /* 메타 제외한 내용만의 지문 — 2단계에서 비교에 쓴다 */
  return p;
}
function clApply(d){
  if(!d) return;
  if(d.baby) baby=d.baby;
  if(d.logs) logs=d.logs.map(logFull);
  if(d.tried)tried=d.tried;
  if(d.my)   myR=d.my;
  if(d.cubes)cubes=d.cubes;
  if(d.ov)   ov=d.ov;
  if(d.plan!==undefined) plan=d.plan;
  if(d.obs)  obs=d.obs.map(obsFull);
  if(d.fav)  fav=d.fav;
  if(d.grow) grow=d.grow.map(growFull);
  if(d.stock&&typeof STK!=='undefined'){ STK=d.stock; if(typeof stkSave==='function')stkSave() }
  if(d.bowl &&typeof BW !=='undefined'){ BW =d.bowl;  if(typeof bwSave ==='function')bwSave()  }
  if(d.calc) saveKey('b6.calc', d.calc);
  if(d.nav &&typeof NAVC!=='undefined'){ NAVC=d.nav;  if(typeof navSave==='function')navSave() }
  if(d.navm&&typeof NAVM!=='undefined'){ NAVM=d.navm; if(typeof NAVMK!=='undefined')saveKey(NAVMK,d.navm) }
  if(d.sec &&typeof SEC !=='undefined'){ SEC =d.sec;  if(typeof secSave==='function')secSave() }
  if(d.cmix&&typeof CMIX!=='undefined'){ CMIX=d.cmix; if(typeof cmSave ==='function')cmSave()  }
  save();
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

    /*── 3. 진짜 충돌(둘 다 변함) 또는 기준점 없음 → 이때만 묻는다 ──*/
    var rt  = remote.at ? clStamp(new Date(remote.at).getTime()) : '알 수 없음';
    /* 어느 기기가 올린 백업인지 알려준다 — 내 폰이 올린 것이면 그렇게 표시 */
    var who = remote.dn ? remote.dn : '알 수 없는 기기';
    if(remote.did && remote.did===CL.did) who = '이 폰';
    var msg = (base ? '두 기기에서 각각 기록이 바뀌었습니다.\n\n'
                    : '이 계정에 백업된 기록이 있습니다.\n\n')
      +'· 백업한 기기: '+who+'\n'
      +'· 백업 시각: '+rt+'\n'
      +'· 백업된 기록: '+rn+'건\n'
      +'· 지금 이 폰: '+ln+'건\n\n'
      +'이 백업을 폰으로 가져올까요?\n\n'
      +'[아니오] 지금 이 폰의 기록을 백업합니다 (권장)\n'
      +'[예] 백업을 내려받아 이 폰 기록을 대체합니다';
    if(!confirm(msg)){ clPush(1); return }

    /* 이 폰 기록이 사라지는 쪽이므로 한 번 더.
       ★ 여기서 '취소'는 아무것도 하지 않고 끝낸다 — 예전에는 취소해도
         clPush(1) 이 실행되어 "취소했는데 서버가 덮이는" 반대 방향 파괴가
         일어났다. 다음 save() 때 어차피 올라가므로 지금 강행할 이유가 없다. */
    if(!confirm('이 폰의 기록 '+ln+'건이 백업 '+rn+'건으로 바뀝니다.\n\n'
      +'되돌릴 수 없습니다. 계속할까요?')) return;
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
    clBase(clHash(clPack()));
    CL.lastDown=Date.now(); CL.err=''; clSave(); clPaint();
    if(typeof boot==='function') boot(); else if(typeof render==='function') render();
    clPhPull();
  }catch(e){ clErr('pull',e) }
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
  var out = clPack();
  try{
    F.D.setDoc(ref, fbEnc(out)).then(function(){
      CLBUSY=0; CL.lastUp=Date.now(); CL.pend=0; CL.err='';
      clBase(out.hash || clHash(out));            /* 올린 내용 = 서버 내용 → 기준점 */
      clSave(); clPaint();
      clPhPush();                                 /* 기록이 끝난 뒤 사진 */
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
  if(Date.now() - CLSYNCAT < 10000) return;             /* 10초 안에 다시 부르지 않는다 */
  /* ★ 입력창(모달)이 열려 있으면 받지 않는다 — clPull 은 boot()/render() 로
     화면을 다시 그리므로, 기록을 쓰던 중이면 입력하던 내용이 사라진다.
     닫은 뒤 다음 기회(다시 앱으로 돌아올 때)에 받으면 충분하다. */
  var _md = document.getElementById('md');
  if(_md && _md.classList.contains('on')) return;

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
window.addEventListener('online', function(){
  if(clOn() && CL.pend) clPush(1);
  else clSync('online');                /* 밀린 게 없으면 서버 쪽 변경을 확인한다 */
  clPaint();
});
window.addEventListener('offline', clPaint);
/* 앱을 다시 볼 때 — 밀린 것은 올리고, 없으면 서버 변경을 받아온다 */
document.addEventListener('visibilitychange', function(){
  if(document.hidden || !clOn()) return;
  if(CL.pend) clPush(1);
  else clSync('visible');
});

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
