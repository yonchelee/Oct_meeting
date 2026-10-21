# 검증

눈으로 보고 "될 것 같다"로 끝내지 않는다.

## 1. 문법 — 매번, 몇 초

```bash
.claude/skills/monthly-townhall/scripts/check-syntax.sh
```

인라인 `<script>`를 뽑아 `node --check`로 돌리고 태그 짝·슬라이드 수·점 수를 센다.

## 2. 브라우저 — 매번, 1분 남짓

```bash
NODE_PATH=<playwright가 설치된 node_modules> \
  node .claude/skills/monthly-townhall/scripts/probe-deck.js [--shots DIR]
```

Playwright는 저장소에 커밋하지 않는다(`node_modules/`는 무시). 없으면
스크래치 디렉터리에서 `npm i playwright` 후 그 `node_modules`를 `NODE_PATH`로 준다.
브라우저는 `/opt/pw-browsers/chromium` (`playwright install` 하지 말 것).

보는 것: 전 슬라이드 이동, 점↔슬라이드 순서, 모션 필드 동작/서지/휴면/재기동,
인트로 타이틀 완성, 챕터 연출 개수, 글자 분리 후 접근성 라벨, 리모컨,
reduced-motion, **콘솔 에러 0**. `--shots`를 주면 인트로·챕터 화면을 저장한다.

헤드리스 주의: GPU가 없어 4~8fps라 애니메이션이 띄엄띄엄 보인다. H.264 디코더가 없다.
3D 변환 때문에 `getBoundingClientRect().x`는 엉뚱하다 — `.track`의 transform과 활성 점으로 본다.

## 3. 배포 — 푸시한 다음

```bash
.claude/skills/monthly-townhall/scripts/watch-deploy.sh
```

라이브 페이지가 로컬 `index.html`과 바이트가 같아져야 "배포 완료"다.
(저장소 Settings → Pages에서 해당 브랜치가 게시되도록 설정돼 있어야 한다.)

## 사내 PC에서만 확인되는 것

- 사내 깃헙 임베드가 실제로 뜨는지 (망·권한)
- SamsungOne 폰트로 파티클 타이틀 위치가 맞는지
- 발표 PC에서 모션의 프레임률 (끊기면 `RIBBONS`의 `STRANDS`나 먼지 수를 줄인다)
- 임베드 영상 페이지의 자동재생과 소리
