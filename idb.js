/*==================================================================
  idb.js — 사진 저장소 (IndexedDB)
  ------------------------------------------------------------------
  왜 만들었나
    localStorage 한도(origin당 5MB 안팎)는 API 로 늘릴 수 없다. 늘리는 게
    아니라 저장소를 바꿔야 한다. IndexedDB 는 한도 체계가 완전히 달라
    디스크 여유의 상당 비율(수백 MB~GB)을 쓸 수 있고, Blob 원본 바이트를
    그대로 담는다. dataURL(base64)은 원본보다 33% 크고 사파리 계열은
    문자당 2바이트로 세기도 해서, 같은 사진이 최악 2.66배까지 부풀었다.

  설계 원칙 — 데이터를 잃지 않는다
    1. 원본을 지우지 않고 복사한다. IDB 쓰기가 검증된 뒤에만 localStorage
       의 b6.ph 를 비운다. 중간에 앱이 죽으면 양쪽에 다 남고 다음 실행에
       이어서 한다. 한쪽도 없는 순간이 생기지 않는다.
    2. 클라우드(Firestore users/{uid}/photos)는 건드리지 않는다. 업로드
       완료표(b6.phup)도 그대로 둬서 이미 올라간 사진이 재업로드되지 않는다.
    3. 메모리 인터페이스를 유지한다. 화면 코드가 쓰던 ph[k] 형태를 그대로
       두고, 앱 시작 때 IDB → 메모리로 한 번 올린다. 읽기 코드는 무수정.
    4. IDB 를 못 쓰면(사파리 시크릿 등) localStorage 로 폴백한다. 새 저장소
       실패가 데이터 손실로 이어지지 않게 한다.
==================================================================*/

var IDB_NAME = 'b6photos';
var IDB_STORE = 'ph';
var IDB_VER = 1;
var IDBOK = null;          /* null=미확인 / true=사용가능 / false=폴백 */
var _idb = null;           /* 열린 DB 핸들 */
var IDBERR = '';           /* 마지막 오류 (정보 탭 표시용) */

/* DB 열기 — 한 번 열어 재사용한다 */
function idbOpen(){
  return new Promise(function(res, rej){
    if(_idb){ res(_idb); return }
    if(!window.indexedDB){ IDBOK=false; rej(new Error('no-indexeddb')); return }
    var rq;
    try{ rq = indexedDB.open(IDB_NAME, IDB_VER) }
    catch(e){ IDBOK=false; IDBERR=String(e&&e.message||e); rej(e); return }
    rq.onupgradeneeded = function(){
      var db = rq.result;
      if(!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE);
    };
    rq.onsuccess = function(){ _idb = rq.result; IDBOK = true; res(_idb) };
    rq.onerror   = function(){ IDBOK=false; IDBERR=String(rq.error&&rq.error.message||'open'); rej(rq.error) };
    /* 사파리 시크릿 모드는 open 이 영원히 pending 되는 사례가 있다 */
    setTimeout(function(){ if(IDBOK===null){ IDBOK=false; IDBERR='timeout'; rej(new Error('idb-timeout')) } }, 3000);
  });
}

function idbTx(mode){
  return idbOpen().then(function(db){
    return db.transaction(IDB_STORE, mode).objectStore(IDB_STORE);
  });
}

/* 한 장 쓰기 — value 는 {b:Blob, n:number} 또는 {d:dataURL} */
function idbPut(k, val){
  return idbTx('readwrite').then(function(st){
    return new Promise(function(res, rej){
      var rq = st.put(val, k);
      rq.onsuccess = function(){ res(true) };
      rq.onerror   = function(){ IDBERR=String(rq.error&&rq.error.message||'put'); rej(rq.error) };
    });
  });
}

function idbDel(k){
  return idbTx('readwrite').then(function(st){
    return new Promise(function(res, rej){
      var rq = st.delete(k);
      rq.onsuccess = function(){ res(true) };
      rq.onerror   = function(){ rej(rq.error) };
    });
  });
}

/* 전량 읽기 — {key: value} */
function idbAll(){
  return idbTx('readonly').then(function(st){
    return new Promise(function(res, rej){
      var out = {};
      var rq = st.openCursor();
      rq.onsuccess = function(){
        var c = rq.result;
        if(!c){ res(out); return }
        out[c.key] = c.value;
        c.continue();
      };
      rq.onerror = function(){ rej(rq.error) };
    });
  });
}

/*───────── dataURL ↔ Blob ─────────*/
/* base64 33% 오버헤드를 없애는 핵심 — 저장은 Blob, 표시는 objectURL */
function durlToBlob(d){
  if(!d || d.indexOf('data:')!==0) return null;
  try{
    var c = d.indexOf(','), head = d.slice(5, c), b64 = d.slice(c+1);
    var mime = head.split(';')[0] || 'image/jpeg';
    var bin = atob(b64), len = bin.length, u8 = new Uint8Array(len);
    for(var i=0;i<len;i++) u8[i] = bin.charCodeAt(i);
    return new Blob([u8], {type:mime});
  }catch(e){ return null }
}

function blobToDurl(b){
  return new Promise(function(res){
    var r = new FileReader();
    r.onload = function(){ res(r.result) };
    r.onerror = function(){ res(null) };
    r.readAsDataURL(b);
  });
}

/*───────── 메모리 표현 ─────────*/
/* ph[k] 는 화면이 <img src> 에 바로 넣을 수 있는 문자열이어야 한다.
   IDB 에서 올릴 때 Blob → objectURL 로 바꿔 ph[k] 에 담고, 실제 바이트
   크기는 PHN[k] 에 따로 기억한다 (objectURL 문자열 길이는 용량과 무관). */
var PHN = {};              /* key -> 실제 바이트 수 */
var PHB = {};              /* key -> Blob (업로드·내보내기에 쓴다) */
var _objurls = [];         /* revoke 대상 */

function phSetMem(k, blob, bytes){
  var u = URL.createObjectURL(blob);
  _objurls.push(u);
  ph[k] = u;
  PHB[k] = blob;
  PHN[k] = bytes || blob.size;
}

/* 사진 실제 총 바이트 — IDB 시대의 phBytes 대체.
   localStorage 폴백 중이면 문자열 길이가 곧 사용량이다. */
function phRealBytes(){
  var t = 0, k;
  if(IDBOK){
    for(k in PHN){ if(Object.prototype.hasOwnProperty.call(PHN,k)) t += PHN[k]||0 }
    return t;
  }
  try{ var s = localStorage.getItem(KY.p); return s ? s.length : 0 }catch(e){ return 0 }
}
function phCount(){ return Object.keys(ph||{}).length }

/*───────── 저장 (savePh 대체 경로) ─────────*/
/* dataURL 을 받아 Blob 으로 IDB 에 넣고 메모리를 갱신한다.
   IDB 가 안 되면 예전 localStorage 경로로 돌린다. */
function phStore(k, durl){
  var blob = durlToBlob(durl);
  if(!blob){ return savePhLS(k, durl) }          /* 변환 실패 → 예전 방식 */
  return idbPut(k, {b:blob, n:blob.size, at:Date.now()}).then(function(){
    /* 기존 objectURL 정리 후 교체 */
    phSetMem(k, blob, blob.size);
    /* 이 키가 localStorage 에 남아 있으면 이제 지운다 (IDB 에 안전히 들어갔으므로) */
    phDropFromLS(k);
    if(typeof clQueue==='function'){ try{ if(typeof clPhPush==='function') clPhPush() }catch(e){} }
    return true;
  }).catch(function(e){
    IDBERR = String(e&&e.message||e);
    return savePhLS(k, durl);                     /* 폴백 */
  });
}

/* 예전 방식(localStorage) 저장 — 폴백 전용 */
function savePhLS(k, durl){
  var prev = ph[k];
  ph[k] = durl;
  if(saveKey(KY.p, ph)){ PHN[k] = durl.length; return Promise.resolve(true) }
  if(prev===undefined) delete ph[k]; else ph[k] = prev;
  saveKey(KY.p, ph);
  if(typeof saveWarn==='function') saveWarn();
  return Promise.resolve(false);
}

/* localStorage 사본에서 한 키만 제거 */
function phDropFromLS(k){
  try{
    var raw = localStorage.getItem(KY.p); if(!raw) return;
    var o = JSON.parse(raw); if(!o || o[k]===undefined) return;
    delete o[k];
    if(Object.keys(o).length) localStorage.setItem(KY.p, JSON.stringify(o));
    else localStorage.removeItem(KY.p);
  }catch(e){}
}

function phRemove(k){
  delete ph[k]; delete PHN[k]; delete PHB[k];
  phDropFromLS(k);
  if(IDBOK) idbDel(k).catch(function(){});
}

/*───────── 앱 시작 시 로드 + 이관 ─────────*/
/* 반환: Promise — 끝나면 ph 가 채워져 있다.
   migPh 는 '복사 → 검증 → 원본 삭제' 순서를 지킨다. */
var PHMIG = {done:0, moved:0, total:0, err:''};

function phBoot(){
  /* 1) localStorage 에 남은 사진 (예전 형식) 을 먼저 메모리에 확보 */
  var lsPh = {};
  try{ lsPh = JSON.parse(localStorage.getItem(KY.p)||'{}') || {} }catch(e){ lsPh = {} }

  return idbAll().then(function(all){
    /* 2) IDB 에 있는 것을 메모리로 */
    var k;
    for(k in all){
      if(!Object.prototype.hasOwnProperty.call(all,k)) continue;
      var v = all[k];
      if(v && v.b) phSetMem(k, v.b, v.n);
      else if(v && v.d){ var b = durlToBlob(v.d); if(b) phSetMem(k, b, b.size) }
    }
    /* 3) localStorage 에만 있는 것을 IDB 로 이관 */
    var todo = Object.keys(lsPh).filter(function(x){ return !all[x] });
    PHMIG.total = todo.length;
    if(!todo.length){
      /* 이관할 게 없는데 localStorage 에 사본이 남아 있으면 정리 */
      if(Object.keys(lsPh).length && Object.keys(all).length) phSweepLS(Object.keys(all));
      PHMIG.done = 1;
      return true;
    }
    return phMigrate(todo, lsPh);
  }).catch(function(e){
    /* IDB 를 못 쓴다 → 예전 방식 그대로 (데이터 손실 없음) */
    IDBOK = false;
    IDBERR = String(e&&e.message||e);
    PHMIG.err = IDBERR; PHMIG.done = 1;
    var k;
    for(k in lsPh){ if(Object.prototype.hasOwnProperty.call(lsPh,k)){ ph[k]=lsPh[k]; PHN[k]=(lsPh[k]||'').length } }
    return false;
  });
}

/* 한 장씩 복사하고, 복사가 검증된 키만 localStorage 에서 지운다 */
function phMigrate(todo, lsPh){
  var okKeys = [];
  return todo.reduce(function(chain, k){
    return chain.then(function(){
      var blob = durlToBlob(lsPh[k]);
      if(!blob){ ph[k] = lsPh[k]; PHN[k] = (lsPh[k]||'').length; return }  /* 변환 불가 → 그대로 둔다 */
      return idbPut(k, {b:blob, n:blob.size, at:Date.now()}).then(function(){
        /* 검증: 다시 읽어 크기가 같은지 확인한 뒤에만 원본 삭제 대상에 넣는다 */
        return idbTx('readonly').then(function(st){
          return new Promise(function(res){
            var rq = st.get(k);
            rq.onsuccess = function(){
              var v = rq.result;
              if(v && v.b && v.b.size===blob.size){
                phSetMem(k, blob, blob.size);
                okKeys.push(k); PHMIG.moved++;
              }else{
                ph[k] = lsPh[k]; PHN[k] = (lsPh[k]||'').length;   /* 검증 실패 → 원본 유지 */
              }
              res();
            };
            rq.onerror = function(){ ph[k]=lsPh[k]; PHN[k]=(lsPh[k]||'').length; res() };
          });
        });
      }).catch(function(){ ph[k]=lsPh[k]; PHN[k]=(lsPh[k]||'').length });
    });
  }, Promise.resolve()).then(function(){
    /* ★ 여기서 처음으로 원본을 지운다 — 검증된 키만 */
    if(okKeys.length) phSweepLS(okKeys);
    PHMIG.done = 1;
    return true;
  });
}

/* localStorage 사본에서 주어진 키들을 제거 */
function phSweepLS(keys){
  try{
    var raw = localStorage.getItem(KY.p); if(!raw) return;
    var o = JSON.parse(raw); if(!o) return;
    keys.forEach(function(k){ delete o[k] });
    if(Object.keys(o).length) localStorage.setItem(KY.p, JSON.stringify(o));
    else localStorage.removeItem(KY.p);
  }catch(e){}
}

/*───────── 클라우드·백업이 쓰는 dataURL 얻기 ─────────*/
/* 업로드와 JSON 내보내기는 문자열이 필요하다. Blob 을 그때만 변환한다. */
function phDurl(k){
  if(PHB[k]) return blobToDurl(PHB[k]);
  var v = ph[k];
  if(typeof v==='string' && v.indexOf('data:')===0) return Promise.resolve(v);
  return Promise.resolve(null);
}

/* IDB 용량 여유 — navigator.storage.estimate 기반 */
var IDBQ = null;
function idbQuota(){
  if(IDBQ!==null || !(navigator.storage && navigator.storage.estimate)) return;
  IDBQ = 0;
  navigator.storage.estimate().then(function(e){
    IDBQ = {u:e.usage||0, q:e.quota||0};
    if(typeof clPaint==='function') clPaint();
  }).catch(function(){ IDBQ = 0 });
}
