import re
import pathlib

# ★ parent.parent 로 tools/ 안을 가정하면 스크립트가 babyfood/ 루트로 옮겨진
#   순간 깨진다(실제로 깨졌다). 폴더 위치를 가정하지 말고 index.html+sw.js 가
#   함께 있는 폴더를 위로 올라가며 찾는다.
import sys


def _base_dir():
    here = pathlib.Path(__file__).resolve().parent
    for c in (here, *here.parents):
        if (c / 'index.html').exists() and (c / 'sw.js').exists():
            return c
        if (c / 'babyfood' / 'sw.js').exists():
            return c / 'babyfood'
    sys.exit('index.html·sw.js 가 있는 폴더를 찾지 못했습니다.')


d = _base_dir()
print("검사 폴더: %s" % d)
sw = d.joinpath('sw.js').read_text(encoding='utf-8')
html = d.joinpath('index.html').read_text(encoding='utf-8')

swjs = re.findall(r"'([^']+)'", re.search(r"var JS=\[(.*?)\];", sw, re.S).group(1))
# 파일명에 .js 가 삼켜지지 않도록 문자 클래스를 좁힌다
pairs = re.findall(r'src="([A-Za-z0-9_-]+)\.js\?v=(\d+)"', html)
names = [n for n, v in pairs]
vers = sorted(set(v for n, v in pairs))

print("sw.js  JS(%d): %s" % (len(swjs), swjs))
print("index  JS(%d): %s" % (len(names), names))
print("index  ?v= 값 : %s" % vers)
print()
print("항목 집합 동일 : %s" % (set(swjs) == set(names)))
print("순서까지 동일  : %s" % (swjs == names))
print("sw 에만 있음   : %s" % (sorted(set(swjs) - set(names)) or "없음"))
print("index 에만 있음: %s" % (sorted(set(names) - set(swjs)) or "없음"))

missing = [n for n in swjs if not d.joinpath(n + '.js').exists()]
print("캐시목록 중 실제 파일 없음 : %s" % (missing or "없음"))

onlyfile = sorted(p.stem for p in d.glob('*.js') if p.stem not in swjs and p.stem != 'sw')
print("폴더에 있으나 캐시목록 없음: %s" % (onlyfile or "없음"))

swv = re.search(r"var V='(\d+)'", sw).group(1)
appv = re.search(r"window\.APPV='(\d+)'", html).group(1)
print()
print("sw.js V=%s / index.html APPV=%s / ?v=%s → 3자 일치: %s"
      % (swv, appv, vers, len(vers) == 1 and swv == appv == vers[0]))
