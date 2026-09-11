#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""큐브화 손질법(PREP) 커버리지 감사.

왜 필요한가
  prepOf() 는 손질법 데이터가 없으면 조용히 null 을 돌려주고, 호출부는
  '' 를 붙여 아무것도 표시하지 않는다. 즉 누락은 에러 없이 '그냥 안 보임'
  으로 나타나 눈으로는 절대 찾을 수 없다. 재료도감(FD)·영양표(NUT)·
  레시피 재료 전체를 prepOf 규칙 그대로 통과시켜 빈 곳을 찾는다.

prepOf 매칭 규칙 재현 (prep.js)
  1) PREP[key] 정확 일치
  2) PREP[nm]  정확 일치
  3) 긴 키 우선 부분매칭 — src.indexOf(k)>=0
     ★ 반드시 길이 내림차순. '진밥'이 '밥'에 먼저 걸리면 엉뚱한 주의사항이 뜬다.
"""
import re
import sys
import pathlib
from collections import Counter


def base_dir():
    here = pathlib.Path(__file__).resolve().parent
    for d in (here, *here.parents):
        if (d / 'index.html').exists() and (d / 'sw.js').exists():
            return d
        if (d / 'babyfood' / 'sw.js').exists():
            return d / 'babyfood'
    sys.exit('index.html·sw.js 가 있는 폴더를 찾지 못했습니다.')


D = base_dir()


def block(src, start, endpat=r'\nvar '):
    i = src.index(start)
    m = re.search(endpat, src[i + len(start):])
    return src[i:i + len(start) + (m.start() if m else len(src))]


# ---------- PREP 엔트리 ----------
prep_src = (D / 'prep.js').read_text(encoding='utf-8')
i = prep_src.index('var PREP={')
j = prep_src.index('\nfunction prepOf', i)
pblk = prep_src[i:j]

ENT = {}
for m in re.finditer(r"^'((?:[^'\\]|\\.)*)'\s*:\s*\{", pblk, re.M):
    k = m.group(1)
    # 이 키의 본문 = 다음 최상위 키 또는 블록 끝까지
    nxt = re.search(r"^'(?:[^'\\]|\\.)*'\s*:\s*\{", pblk[m.end():], re.M)
    body = pblk[m.end(): m.end() + (nxt.start() if nxt else len(pblk))]
    mm = re.search(r"m:'([a-z]+)'", body)
    wn = re.search(r"warn:'((?:[^'\\]|\\.)*)'", body)
    tt = re.search(r"t:'((?:[^'\\]|\\.)*)'", body)
    ENT[k] = {
        'm': mm.group(1) if mm else '?',
        'warn': bool(wn and wn.group(1).strip()),
        't': tt.group(1) if tt else '',
    }

KEYS_BY_LEN = sorted(ENT, key=lambda x: -len(x))


def prep_of(key, nm):
    """prep.js prepOf() 와 동일 규칙. 매칭된 PREP 키를 돌려준다."""
    if key and key in ENT:
        return key
    if nm and nm in ENT:
        return nm
    src = str(nm or key or '')
    if src:
        for k in KEYS_BY_LEN:
            if k in src:
                return k
    return None


# ---------- FD (재료도감) / NUT (영양표) ----------
data_src = (D / 'data.js').read_text(encoding='utf-8')

fdblk = block(data_src, 'var FD=[')
FD = re.findall(
    r"\['((?:[^'\\]|\\.)*)'\s*,\s*'[^']*'\s*,\s*'([^']*)'\s*,\s*[\d.]+\s*,\s*'((?:[^'\\]|\\.)*)'",
    fdblk)

nutblk = block(data_src, 'var NUT={')
NUTK = re.findall(r"'((?:[^'\\]|\\.)*)'\s*:\s*\[", nutblk)

# ---------- 레시피 재료 (RCP 전체 g 배열) ----------
ING = {}
for m in re.finditer(r"\['((?:[^'\\]|\\.)*)'\s*,\s*[\d.]+\s*,\s*'([^']*)'\s*,\s*'((?:[^'\\]|\\.)*)'", data_src):
    nm, unit, key = m.group(1), m.group(2), m.group(3)
    ING.setdefault((nm, key), 0)
    ING[(nm, key)] += 1

print('=' * 72)
print('큐브화 손질법(PREP) 커버리지 감사   폴더: %s' % D)
print('=' * 72)
print('PREP 등록 항목: %d' % len(ENT))
print()

# ① 재료도감
print('─' * 72)
print('① 재료도감(FD) %d종 — 손질법 매칭' % len(FD))
print('─' * 72)
miss_fd = [(n, c, k) for n, c, k in FD if not prep_of(k, n)]
if miss_fd:
    print('  ✗ 누락 %d종:' % len(miss_fd))
    for n, c, k in miss_fd:
        print('      %-14s (분류 %s / NUT키 %s)' % (n, c, k or '-'))
else:
    print('  ✓ 전부 매칭 — 누락 없음')
print()

# ② NUT
print('─' * 72)
print('② 영양표(NUT) %d종 — 손질법 매칭' % len(NUTK))
print('─' * 72)
miss_nut = [k for k in NUTK if not prep_of(k, k)]
if miss_nut:
    print('  ✗ 누락 %d종:' % len(miss_nut))
    for k in miss_nut:
        print('      %s' % k)
else:
    print('  ✓ 전부 매칭 — 누락 없음')
print()

# ③ 레시피 재료
print('─' * 72)
print('③ 레시피 재료 %d종(고유) — 손질법 매칭' % len(ING))
print('─' * 72)
miss_ing = sorted([(nm, key, cnt) for (nm, key), cnt in ING.items()
                   if not prep_of(key, nm)], key=lambda x: -x[2])
if miss_ing:
    print('  ✗ 누락 %d종 (등장 횟수 많은 순):' % len(miss_ing))
    for nm, key, cnt in miss_ing:
        print('      %-16s key=%-12s %d회' % (nm, key or '-', cnt))
else:
    print('  ✓ 전부 매칭 — 누락 없음')
print()

# ④ 부분매칭으로만 걸린 것 (오매칭 위험)
print('─' * 72)
print('④ 부분매칭으로만 걸린 항목 — 엉뚱한 손질법이 붙을 위험')
print('─' * 72)
fuzzy = []
for n, c, k in FD:
    if (k and k in ENT) or (n in ENT):
        continue
    hit = prep_of(k, n)
    if hit:
        fuzzy.append((n, k, hit))
for nm, key in ING:
    if (key and key in ENT) or (nm in ENT):
        continue
    hit = prep_of(key, nm)
    if hit and (nm, key, hit) not in fuzzy:
        fuzzy.append((nm, key, hit))
if fuzzy:
    for nm, key, hit in sorted(set(fuzzy)):
        flag = '  ← 확인 필요' if ENT[hit]['warn'] else ''
        print('      %-16s → PREP[%s]  (%s)%s' % (nm, hit, ENT[hit]['t'][:20], flag))
else:
    print('  없음')
print()

# ⑤ 조리법 분포 / warn 커버리지
print('─' * 72)
print('⑤ 조리법(m) 분포 · 주의사항(warn) 커버리지')
print('─' * 72)
LBL = {'steam': '찜', 'boil': '삶기', 'blanch': '데치기', 'bake': '굽기',
       'raw': '비가열', 'soak': '불리기', 'ban': '돌 전 금지'}
for k, v in Counter(e['m'] for e in ENT.values()).most_common():
    print('      %-8s %-10s %d종' % (k, LBL.get(k, '?'), v))
print()
nw = [k for k, v in ENT.items() if not v['warn']]
print('  warn 있음: %d / %d' % (len(ENT) - len(nw), len(ENT)))
if nw:
    print('  warn 없음 %d종:' % len(nw))
    for x in range(0, len(nw), 6):
        print('      ' + ' · '.join(nw[x:x + 6]))
print()

bad = len(miss_fd) + len(miss_nut) + len(miss_ing)
print('=' * 72)
print('총 누락: FD %d · NUT %d · 레시피재료 %d = %d' %
      (len(miss_fd), len(miss_nut), len(miss_ing), bad))
print('=' * 72)
sys.exit(0)
