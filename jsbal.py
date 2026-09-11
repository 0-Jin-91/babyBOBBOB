"""JS 괄호/따옴표 균형 검사 — 정규식 리터럴을 인식한다.

왜 필요한가: food.js:345 의 `.replace(/'/g,"\\'")` 처럼 정규식 안에 홑따옴표가
들어가면, 정규식을 모르는 검사기는 그것을 문자열 시작으로 읽어 그 뒤 파일
전체의 괄호 수를 잘못 센다. v88 원본에서도 같은 FAIL 이 났으므로 코드가 아니라
검사기의 결함이었다. 나눗셈 `/` 와 정규식 시작 `/` 는 직전 토큰으로 구분한다.
"""


def strip_js(s):
    """문자열·주석·정규식을 제거한 코드만 돌려준다. (code, 미종료상태)"""
    out = []
    i = 0
    n = len(s)
    st = None          # None | "'" | '"' | '`' | 'bc' | 'lc' | 're'
    prev = ''          # 직전 의미 있는 문자
    while i < n:
        c = s[i]
        if st is None:
            if c == '/' and i + 1 < n and s[i + 1] == '*':
                st = 'bc'; i += 2; continue
            if c == '/' and i + 1 < n and s[i + 1] == '/':
                st = 'lc'; i += 2; continue
            if c == '/':
                # 정규식이냐 나눗셈이냐 — 값이 올 자리면 정규식
                if prev == '' or prev in '(,=:[!&|?{};+-*~^%<>\n':
                    st = 're'; i += 1; continue
                out.append(c); prev = c; i += 1; continue
            if c in "'\"`":
                st = c; i += 1; continue
            out.append(c)
            if not c.isspace():
                prev = c
            i += 1
        elif st == 'bc':
            if c == '*' and i + 1 < n and s[i + 1] == '/':
                st = None; i += 2; continue
            i += 1
        elif st == 'lc':
            if c == '\n':
                st = None; out.append(c)
            i += 1
        elif st == 're':
            if c == '\\':
                i += 2; continue
            if c == '[':                      # 문자클래스 안의 / 는 종료가 아니다
                j = i + 1
                while j < n and s[j] != ']':
                    if s[j] == '\\':
                        j += 1
                    j += 1
                i = j + 1
                continue
            if c == '\n':                     # 정규식은 줄을 넘지 않는다 → 오판
                st = None
                i += 1
                continue
            if c == '/':
                st = None
                prev = 'r'                    # 정규식은 값 → 뒤의 / 는 나눗셈
                i += 1
                continue
            i += 1
        else:                                 # 문자열 내부
            if c == '\\':
                i += 2; continue
            if c == st:
                st = None
                prev = 's'
            i += 1
    return ''.join(out), st


def check(fn):
    s = open(fn, encoding='utf-8').read()
    code, st = strip_js(s)
    res = {'file': fn, 'unterminated': st}
    for a, b, nm in [('{', '}', 'brace'), ('(', ')', 'paren'), ('[', ']', 'bracket')]:
        res[nm] = (code.count(a), code.count(b))
    res['ok'] = st is None and all(res[k][0] == res[k][1] for k in ('brace', 'paren', 'bracket'))
    return res


if __name__ == '__main__':
    import sys, os, glob
    # ★ tools/ 안을 가정한 dirname(dirname(...)) 은 스크립트가 babyfood/ 루트로
    #   옮겨지면 한 단계 위로 올라가 깨진다. 폴더 위치를 가정하지 말고
    #   index.html+sw.js 가 함께 있는 폴더를 위로 올라가며 찾는다.
    here = os.path.dirname(os.path.abspath(__file__))
    base = None
    c = here
    while True:
        if os.path.exists(os.path.join(c, 'index.html')) and \
           os.path.exists(os.path.join(c, 'sw.js')):
            base = c; break
        if os.path.exists(os.path.join(c, 'babyfood', 'sw.js')):
            base = os.path.join(c, 'babyfood'); break
        p = os.path.dirname(c)
        if p == c:
            break
        c = p
    if not base:
        sys.exit('index.html·sw.js 가 있는 폴더를 찾지 못했습니다.')
    os.chdir(base)
    print('검사 폴더: %s' % base)
    bad = 0
    # 인자를 안 주면 전체 .js 를 검사한다 — 예전엔 사용법만 출력하고 끝나
    # '검사기를 돌렸다'고 착각하기 쉬웠다.
    targets = sys.argv[1:] or sorted(
        f for f in glob.glob('*.js') if not f.endswith(('.bak', '.new')))
    for fn in targets:
        r = check(fn)
        flag = 'OK  ' if r['ok'] else 'FAIL'
        print(f"  {flag} {fn:16s} {{}} {r['brace'][0]}/{r['brace'][1]}  "
              f"() {r['paren'][0]}/{r['paren'][1]}  "
              f"[] {r['bracket'][0]}/{r['bracket'][1]}  unterminated={r['unterminated']}")
        if not r['ok']:
            bad += 1
    sys.exit(1 if bad else 0)
