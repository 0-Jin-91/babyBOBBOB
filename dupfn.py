#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""전역 함수·var 중복 검사 — 스크립트 23개가 전역 스코프를 공유하므로
같은 이름이 두 번 선언되면 나중 것이 앞의 것을 조용히 덮어쓴다.
(clPushNow 충돌로 무한재귀가 났던 것이 정확히 이 문제였다)

★ 옛 버전의 두 결함을 고쳤다.
  1) pathlib.Path('babyfood') 하드코딩 → 실행 위치에 따라 파일을 0개 읽고도
     "중복 없음"을 출력했다. 통과처럼 보이는 실패라 가장 위험했다.
     이제 스크립트 위치에서 위로 올라가며 index.html+sw.js 를 찾는다.
  2) 줄 시작만 정규식으로 봤다 → 이 코드베이스는 함수 본문이 0열에서
     시작하는 조밀한 스타일이라, function 안의 지역변수(edit.js 의 var D 등)를
     전역으로 오판해 한 글자 이름 수십 개를 쏟아냈다.
     이제 문자열·주석·정규식을 지운 뒤 중괄호 깊이 0 인 선언만 센다.
"""
import re
import sys
import pathlib
from collections import defaultdict


def base_dir():
    """index.html 과 sw.js 가 함께 있는 폴더를 위로 올라가며 찾는다."""
    here = pathlib.Path(__file__).resolve().parent
    for d in (here, *here.parents):
        if (d / 'index.html').exists() and (d / 'sw.js').exists():
            return d
        if (d / 'babyfood' / 'sw.js').exists():
            return d / 'babyfood'
    sys.exit('index.html·sw.js 가 있는 폴더를 찾지 못했습니다.')


def blank_noncode(s):
    """문자열·주석·정규식 내용을 공백으로 바꾼다. 길이와 줄바꿈은 보존한다
    (줄번호를 그대로 쓰기 위해). 나눗셈과 정규식 시작은 직전 토큰으로 구분."""
    out = list(s)
    i, n, st, prev = 0, len(s), None, ''

    def blank(a, b):
        for k in range(a, min(b, n)):
            if out[k] != '\n':
                out[k] = ' '

    while i < n:
        c = s[i]
        if st is None:
            if c == '/' and i + 1 < n and s[i + 1] == '*':
                j = s.find('*/', i + 2)
                j = n if j < 0 else j + 2
                blank(i, j); i = j; continue
            if c == '/' and i + 1 < n and s[i + 1] == '/':
                j = s.find('\n', i)
                j = n if j < 0 else j
                blank(i, j); i = j; continue
            if c == '/':
                if prev == '' or prev in '(,=:[!&|?{};+-*~^%<>\n':
                    st = 're'; blank(i, i + 1); i += 1; continue
                prev = c; i += 1; continue
            if c in '\'"`':
                st = c; blank(i, i + 1); i += 1; continue
            if not c.isspace():
                prev = c
            i += 1
        elif st == 're':
            if c == '\\':
                blank(i, i + 2); i += 2; continue
            if c == '[':
                j = i + 1
                while j < n and s[j] != ']':
                    j += 2 if s[j] == '\\' else 1
                blank(i, j + 1); i = j + 1; continue
            if c == '\n':
                st = None; i += 1; continue
            if c == '/':
                st = None; prev = 'r'; blank(i, i + 1); i += 1; continue
            blank(i, i + 1); i += 1
        else:                                  # ' " `
            if c == '\\':
                blank(i, i + 2); i += 2; continue
            if c == st:
                st = None
            blank(i, i + 1); i += 1
    return ''.join(out), st


FN = re.compile(r'\bfunction\s+([A-Za-z_$][\w$]*)\s*\(')
VAR = re.compile(r'\b(?:var|let|const)\s+([A-Za-z_$][\w$]*)')


def top_level_decls(src):
    """중괄호 깊이 0 에서 선언된 (kind, name, lineno) 만 돌려준다."""
    code, unterminated = blank_noncode(src)
    depth = 0
    line = 1
    out = []
    i, n = 0, len(code)
    while i < n:
        c = code[i]
        if c == '\n':
            line += 1; i += 1; continue
        if c == '{':
            depth += 1; i += 1; continue
        if c == '}':
            depth = max(0, depth - 1); i += 1; continue
        if depth == 0 and (c == 'f' or c == 'v' or c == 'l' or c == 'c'):
            m = FN.match(code, i)
            if m:
                out.append(('fn', m.group(1), line))
                i = m.end(); continue
            m = VAR.match(code, i)
            if m:
                out.append(('var', m.group(1), line))
                i = m.end(); continue
        i += 1
    return out, unterminated


def main():
    d = base_dir()
    files = sorted(p for p in d.glob('*.js')
                   if p.name != 'sw.js' and not p.name.endswith(('.bak', '.new')))
    if not files:
        sys.exit('검사할 .js 가 없습니다: %s' % d)

    fns = defaultdict(list)
    vars_ = defaultdict(list)
    warn = []
    for p in files:
        decls, unterm = top_level_decls(p.read_text(encoding='utf-8'))
        if unterm:
            warn.append('%s (미종료 %s)' % (p.name, unterm))
        for kind, name, ln in decls:
            (fns if kind == 'fn' else vars_)[name].append((p.name, ln))

    print('검사 폴더: %s' % d)
    print('검사 파일: %d개' % len(files))
    if warn:
        print('⚠ 미종료 리터럴 — 결과 신뢰도 낮음: %s' % ', '.join(warn))
    print()

    bad = 0
    for label, table in (('전역 함수명', fns), ('전역 var/let/const', vars_)):
        dups = {k: v for k, v in table.items() if len(v) > 1}
        print('=' * 70)
        print('%s 중복 (나중 정의가 앞을 조용히 덮어씀)' % label)
        print('=' * 70)
        if not dups:
            print('  중복 없음 — 총 %d개' % len(table))
        else:
            bad += len(dups)
            for k in sorted(dups):
                print('  ★ %-16s %s' % (k, ', '.join('%s:%d' % x for x in dups[k])))
            print('\n  총 %d개 / 중복 이름 %d개' % (len(table), len(dups)))
        print()

    if bad:
        print('실패: 중복 %d건' % bad)
    else:
        print('통과: 전역 충돌 없음')
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
