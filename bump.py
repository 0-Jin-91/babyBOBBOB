#!/usr/bin/env python3
"""버전 일괄 올리기 — 배포 전 반드시 이걸로 올린다.

    python3 bump.py        # 현재 버전 +1
    python3 bump.py 50     # 특정 버전으로

세 곳을 동시에 고친다 (손으로 고치다 어긋나 업데이트 알림이 무한 반복된 적 있음):
  1. index.html  window.APPV='NN'   ← update.js 의 APPV 가 이걸 읽는다
  2. index.html  <script src="x.js?v=NN">  전체
  3. sw.js       var V='NN'         ← CORE 캐시 목록이 이걸 따라간다
"""
import re, sys, pathlib

d = pathlib.Path(__file__).parent
html = (d / 'index.html').read_text(encoding='utf-8')
sw   = (d / 'sw.js').read_text(encoding='utf-8')

cur = re.search(r"window\.APPV='(\d+)'", html)
if not cur:
    sys.exit('index.html 에서 window.APPV 를 찾지 못했습니다.')
cur = int(cur.group(1))
new = int(sys.argv[1]) if len(sys.argv) > 1 else cur + 1
if new <= cur:
    sys.exit(f'새 버전({new})이 현재({cur})보다 크지 않습니다.')

html = re.sub(r"window\.APPV='\d+'", f"window.APPV='{new}'", html)
html = re.sub(r'\?v=\d+', f'?v={new}', html)
sw   = re.sub(r"var V='\d+'", f"var V='{new}'", sw)

(d / 'index.html').write_text(html, encoding='utf-8')
(d / 'sw.js').write_text(sw, encoding='utf-8')

# 검증
h2 = (d / 'index.html').read_text(encoding='utf-8')
s2 = (d / 'sw.js').read_text(encoding='utf-8')
assert re.search(rf"window\.APPV='{new}'", h2)
assert not re.search(r'\?v=(?!%d\b)\d+' % new, h2), '남은 옛 ?v= 있음'
assert re.search(rf"var V='{new}'", s2)
print(f'v{cur} -> v{new}  (index.html · sw.js 동기화 완료)')
print('※ 서버에 올릴 때 index.html 은 캐시되지 않도록(no-cache) 배포하세요.')
