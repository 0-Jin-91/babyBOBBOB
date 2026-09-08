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
function clSave(){ saveKey(CLK, CL) }
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
  CL={on:0,uid:'',email:'',lastUp:0,lastDown:0,pend:0,err:'',emsg:''};
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
  return {
    sv:1, v:(window.APPV||''), at:Date.now(),
    baby:baby, logs:logs, tried:tried, my:myR, cubes:cubes, ov:ov,
    plan:plan, obs:obs, fav:fav, grow:grow,
    stock:(typeof STK!=='undefined'?STK:null),
    bowl :(typeof BW !=='undefined'?BW :null),
    calc : LS('b6.calc',null),
    nav  :(typeof NAVC!=='undefined'?NAVC:null),
    navm :(typeof NAVM!=='undefined'?NAVM:null),
    sec  :(typeof SEC !=='undefined'?SEC :null),
    cmix :(typeof CMIX!=='undefined'?CMIX:null)
  };
}
function clApply(d){
  if(!d) return;
  if(d.baby) baby=d.baby;
  if(d.logs) logs=d.logs;
  if(d.tried)tried=d.tried;
  if(d.my)   myR=d.my;
  if(d.cubes)cubes=d.cubes;
  if(d.ov)   ov=d.ov;
  if(d.plan!==undefined) plan=d.plan;
  if(d.obs)  obs=d.obs;
  if(d.fav)  fav=d.fav;
  if(d.grow) grow=d.grow;
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

/*───────── 첫 연결 처리 (가장 조심할 부분) ─────────*/
/* 양쪽에 데이터가 다 있으면 절대 자동 판단하지 않고 사용자에게 묻는다.
   여기서 잘못 덮어쓰면 기록이 한 번에 사라진다. */
var _clfirst = 0;
function clFirst(){
  if(_clfirst || !clOn()) return;
  _clfirst = 1;
  var F=FB, ref=F.D.doc(F.db,'users',CLUSER.uid,'data','main');
  F.D.getDoc(ref).then(function(sn){
    var remote = sn.exists() ? sn.data() : null;
    var rn = clCount(remote), ln = clCount(clPack());

    if(!remote || rn===0){ clPush(1); return }          /* 클라우드 비어있음 → 올림 */
    if(ln===0){ clPull(remote); return }                /* 이 폰 비어있음 → 내림 */

    /* 양쪽에 다 있음 → 묻는다 */
    var rt = remote.at ? new Date(remote.at).toLocaleString('ko-KR') : '알 수 없음';
    var msg = '⚠️ 양쪽에 기록이 있습니다.\n\n'
      +'· 이 폰: '+ln+'건\n'
      +'· 클라우드: '+rn+'건 (마지막 저장 '+rt+')\n\n'
      +'[확인] 클라우드 기록을 내려받습니다 (이 폰 기록은 사라집니다)\n'
      +'[취소] 이 폰 기록을 올립니다 (클라우드 기록이 사라집니다)\n\n'
      +'헷갈리면 취소를 누르고, 먼저 설정 > 백업 내보내기로 파일을 저장해 두세요.';
    if(confirm(msg)) clPull(remote); else clPush(1);
  }).catch(function(e){ clErr('first',e) });
}

function clPull(remote){
  try{
    clApply(fbDec(remote));                       /* 인코딩된 중첩 배열을 원래 모양으로 */
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
  try{
    F.D.setDoc(ref, fbEnc(clPack())).then(function(){
      CLBUSY=0; CL.lastUp=Date.now(); CL.pend=0; CL.err=''; clSave(); clPaint();
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
function clPhPush(){
  if(!clOn() || !navigator.onLine) return;
  var keys=Object.keys(ph||{});
  if(!keys.length) return;
  var done = LS('b6.phup',{}) || {};
  var todo = keys.filter(function(k){ return done[k]!==(ph[k]||'').length });
  if(!todo.length) return;
  var F=FB, i=0;
  (function step(){
    if(i>=todo.length || i>=5){ saveKey('b6.phup',done); return }   /* 한 번에 5장까지 */
    var k=todo[i++], d=ph[k]||'';
    if(d.length > 900*1024){ step(); return }                        /* 너무 큰 건 건너뜀 */
    F.D.setDoc(F.D.doc(F.db,'users',CLUSER.uid,'photos',encodeURIComponent(k)),
      {d:d, at:Date.now()})
     .then(function(){ done[k]=d.length; step() })
     .catch(function(){ saveKey('b6.phup',done) });
  })();
}
function clPhPull(){
  if(!clOn()) return;
  var F=FB;
  F.D.getDocs(F.D.collection(F.db,'users',CLUSER.uid,'photos')).then(function(qs){
    var got=0, done=LS('b6.phup',{})||{};
    qs.forEach(function(doc){
      var k=decodeURIComponent(doc.id), v=doc.data();
      if(v&&v.d&&!ph[k]){ ph[k]=v.d; done[k]=v.d.length; got++ }
    });
    if(got){ saveKey(KY.p, ph); saveKey('b6.phup',done);
             if(typeof render==='function') render() }
  }).catch(function(){});
}

/*───────── 상태 표시 ─────────*/
function clWhen(){
  var t=CL.lastUp; if(!t) return '아직 없음';
  var s=Math.floor((Date.now()-t)/1000);
  if(s<60) return '방금';
  if(s<3600) return Math.floor(s/60)+'분 전';
  if(s<86400) return Math.floor(s/3600)+'시간 전';
  return Math.floor(s/86400)+'일 전';
}
function clState(){
  if(!clReady()) return {t:'off',  s:'', c:'#8C8480'};
  if(!clOn()){
    /* 로그인 이력이 있고 SDK 가 아직 로드 중이면 '로그인하세요'로 겁주지 않는다 */
    if(CL.on && !FB) return {t:'chk', s:'백업 확인 중…', c:'#7FA8D9'};
    return {t:'out', s:'백업 안 됨 · 로그인하세요', c:'#E08A00'};
  }
  if(CLBUSY)     return {t:'sync', s:'백업 중…', c:'#7FA8D9'};
  if(!navigator.onLine) return {t:'off2', s:'인터넷 없음 · 연결되면 자동 백업', c:'#E08A00'};
  if(CL.err)     return {t:'err',  s:'백업 실패 · 눌러서 다시 시도', c:'#EF6A4C'};
  if(CL.pend)    return {t:'wait', s:'백업 대기 중…', c:'#7FA8D9'};
  return {t:'ok', s:clWhen()+' 백업됨', c:'#2E9C7D'};
}
/* 화면 상단 작은 배지 — 눈으로 확인돼야 마음을 놓는다 */
function clPaint(){
  var b=document.getElementById('cb'); if(!b) return;
  var S=clState();
  if(S.t==='off'){ b.style.display='none'; return }
  b.style.display='block';
  b.style.color=S.c;
  b.innerHTML=(S.t==='ok'?'☁️ ':(S.t==='sync'||S.t==='wait'||S.t==='chk')?'🔄 ':'⚠️ ')+S.s;
  b.onclick=function(){
    if(!clOn()) clLogin();
    else if(CL.err||CL.pend) clPush(1);
    else if(typeof go==='function') go('info');
  };
}
setInterval(clPaint, 15000);

/* 인터넷이 돌아오면 밀린 것을 자동 전송 */
window.addEventListener('online', function(){
  if(clOn() && CL.pend) clPush(1);
  clPaint();
});
window.addEventListener('offline', clPaint);
/* 앱을 다시 볼 때 밀린 것 전송 */
document.addEventListener('visibilitychange', function(){
  if(!document.hidden && clOn() && CL.pend) clPush(1);
});

/*───────── 설정 화면 카드 (info.js 에서 호출) ─────────*/
function clCard(){
  if(!clReady()){
    return '<div class="st">☁️ 클라우드 백업</div><div class="cd">'
     +'<p class="mu" style="margin:0">클라우드 설정이 아직 등록되지 않았습니다. '
     +'등록하면 구글 계정으로 로그인해 자동 백업할 수 있어요.</p></div>';
  }
  var S=clState();
  var h='<div class="st">☁️ 클라우드 백업</div><div class="cd">';
  if(!clOn()){
    h+='<p class="mu" style="margin:0 0 10px">구글 계정으로 로그인하면 <b>기록할 때마다 자동으로 백업</b>됩니다. '
      +'폰을 바꿔도 로그인만 하면 그대로 이어서 쓸 수 있어요. 비밀번호를 새로 만들 필요는 없습니다.</p>'
      +'<button class="btn p" onclick="clLogin()">'+(CL.on?'구글 계정으로 다시 로그인':'구글 계정으로 로그인')+'</button>'
      +(CL.on?('<p class="mu" style="margin:9px 0 0;font-size:10.5px">이전에 <b>'+esc(CL.email||'구글 계정')
        +'</b>으로 로그인한 기록이 있습니다. 세션이 만료됐을 수 있으니 위 버튼을 한 번 더 눌러 주세요.</p>'
        +'<button class="btn y s" style="margin-top:8px" onclick="clForget()">로그인 정보 지우기</button>'):'')
      +'<p class="mu" style="margin:9px 0 0;font-size:10.5px">로그인하지 않아도 앱은 지금처럼 모두 동작합니다. '
      +'다만 폰을 바꾸거나 사파리 기록을 지우면 데이터가 사라질 수 있어요.</p>'
      +(CL.emsg?('<p class="mu" style="margin:9px 0 0;font-size:10px;color:#EF6A4C;word-break:break-all">'
        +'마지막 오류('+esc(CL.err||'')+'): '+esc(CL.emsg)+'</p>'):'');
  }else{
    h+='<div class="ir"><span>계정</span><b style="font-size:12px">'+esc(CL.email||'로그인됨')+'</b></div>'
      +'<div class="ir"><span>상태</span><b style="color:'+S.c+'">'+(S.s||'-')+'</b></div>'
      +'<div class="ir"><span>사진</span><b class="mu">'+Object.keys(ph||{}).length+'장 · '+phSize()+'KB</b></div>'
      +'<button class="btn g s" style="margin-top:10px" onclick="clPush(1)">지금 백업하기</button>'
      +'<button class="btn g s" style="margin-top:8px" onclick="clRestore()">클라우드에서 되돌리기</button>'
      +'<button class="btn y s" style="margin-top:8px" onclick="clLogout()">로그아웃</button>'
      +(CL.emsg?('<p class="mu" style="margin:9px 0 0;font-size:10px;color:#EF6A4C;word-break:break-all">'
        +'마지막 오류('+esc(CL.err||'')+'): '+esc(CL.emsg)+'</p>'):'');
  }
  h+='</div>';
  return h;
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
