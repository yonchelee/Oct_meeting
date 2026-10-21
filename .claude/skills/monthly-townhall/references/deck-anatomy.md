# index.html 해부

약 79KB, 한 파일. 위에서부터 `<style>` → 마크업 → `<script>` 순서다.

## 파일 지도

```
/* ===== Fixed backdrop ===== */          그라디언트 바탕 (모든 슬라이드 공용)
/* ===== Liquid field ===== */            WebGL 메시 그라디언트 캔버스, 도트 그리드
/* ===== Page transition ===== */         챕터 색 커튼(.veil)
/* ===== Carousel deck ===== */           .deck/.track/.slide, 3D 깊이 변환
/* ===== Kinetic type ===== */            마스크 리빌(.w/.wi), 스윈
/* ===== Shared typography ===== */       .headline/.eyebrow/.kicker/.rule
/* ===== Chapter dressing ===== */        오도미터 번호, 마퀴 띠
/* ===== Intro slide ===== */             리퀴드 크롬 타이틀, 글래스 필
/* ===== Embedded page ===== */           .embed-wrap, .embed-open
/* ===== Closing video ===== */           .slide--video, .video-play
/* ===== Presenter remote / Dot navigation / Carousel arrows ===== */

// ----- Chapter palettes -----             PALETTES, slideChapter, slideHue
// ----- Kinetic type -----                 splitText(el, mode)
// ----- Chapter dressing -----             키커·번호·마퀴를 마크업에서 생성
// ----- Scramble -----                     scramble(el)
// ----- Liquid field -----                 fxField.slide(index, dir, covered)
// ----- Page transition -----              curtain(dir, index)
// ----- Render current carousel position ----- render() / goTo() / next() / prev()
// ----- Presenter remote / Keyboard / Wheel / Touch / Titles fit / remote popup
// ----- the embedded video page
render();                                 ← 스크립트 마지막 줄
```

## 섹션 — 피라미드 구조 (2026년 10월: 잇고, 이루고, 나아가다)

현재 18장(맨 앞 쇼릴 포함, `?reel=0`이면 17장). 결론을 먼저 말하고(오늘의 결론), 그 아래 세 파트가 근거를 받친다.

```
intro          잇고, 이루고, 나아가다 · 2026 복기 · 2027 구상
answer         오늘의 결론 — 핵심 메시지 + 세 파트 카드          (slide--msg)
part-connect   Part 1 잇다      → gwp-q1, gwp-q1-moments, gwp-q1-gift,
                                 gwp-q2, gwp-q2-acts, gwp-q2-voices  (모션 스토리 장)
part-achieve   Part 2 이루다    → patent, travel (msg), quick (임베드)
part-forward   Part 3 나아가다  → ax, newcomers (msg)
leader         그룹장 말씀                                     (msg, data-palette="5")
```

**파트 제목** — `.headline`이 있는 장이 파트가 된다. 키커("Part 0N"), 오도미터 번호("01 / 03"),
마퀴 띠, 팔레트는 스크립트가 순서대로 붙인다. `data-en`은 마퀴에 함께 흐르는 영문.

```html
<section id="part-x" class="slide">
  <h2 class="headline headline--xl" data-en="Connect">잇다</h2>
  <p class="subhead reveal" style="--d:1s">이 파트의 결론 한 문장</p>
  <div class="rule" style="--d:.9s"></div>
</section>
```

**메시지 장** (`slide--msg`) — 제목은 **결론 문장**으로 쓴다(피라미드 원칙). 근거는
`.stats`(숫자 카드), `.steps`(3단계), `.pillars`(세 카드) 중 하나. `data-split="words"`는
단어 리빌, `<br>`은 줄바꿈으로 유지된다. 숫자는 `data-count="27"`(소수 가능)과
`data-suffix="%"`를 넣으면 도착할 때 카운트업한다 — 비워 두면 적힌 텍스트(○○) 그대로.

```html
<section id="x" class="slide slide--msg">
  <div class="eyebrow" data-scramble>English Label</div>
  <h3 class="msg-title" data-split="words">27건의 특허로 기술 자산을 쌓았습니다</h3>
  <div class="stats">
    <div class="stat reveal" style="--d:1s"><b data-count="27">27</b><span>출원</span></div>
  </div>
</section>
```

**GWP 스토리 장** (`slide--msg slide--story`) — 임베드 대신 행사 내용을 직접 모션으로 다시 그린 장.
1분기: 표지(읽다↔잇다) · 현장 사진 3D 링 갤러리(`.ring`, `media/gwp-q1/01~10.jpg`, 흐린 배경 사진 위로 천천히 회전) ·
행운의 주인공(`#gwp-q1-gift`, 스포트라이트 플립: 상품 티켓 카드가 들어와 뒤집히면 당첨 사진 → 날아가고 다음.
`GIFTS` 배열이 사진↔상품 짝이고 마지막이 1등 PS5. 카드 클릭=다음, 썸네일 클릭=그 장으로). 2분기: 표지(글래스 터미널 타이핑) · 활동 4카드(`.acts`, 파이썬·웹·
어시스턴트·소감 미니 장면) · 소감 LED 도트 전광판(`#gwp-q2-voices`, `VOICES` 배열의 긍정 소감이 대각선으로 쓸며 바뀜, 클릭=다음, 이름은 넣지 않음). 타이핑은 `data-type="문장"`과
`data-type-delay="초"`. 원자료: `GWP-guide`, `2026_2nd_GWP`, `2026_2nd_GWP_result` 저장소.

`data-palette="N"`을 주면 그 장만 `PALETTES[N]` 색을 쓴다(그룹장 말씀의 따뜻한 색).

섹션을 추가·삭제할 때 같이 손볼 곳:

1. `<section>` 마크업
2. `<nav class="nav-dots">` 안의 점 (슬라이드와 **같은 순서**, `data-target`=id,
   `data-label`=리모컨·툴팁·커튼에 뜨는 이름, 파트 아래 장은 `nav-dot--sub`)
3. `render()` 안의 id 분기 (`video`/`video-content` 임베드 영상 — 현재 덱에는 없음)

슬라이드 수·파트 번호·팔레트 배정·리모컨 목록은 전부 DOM에서 세므로 그 외 상수는 없다.

## 임베드

GitHub Pages(`yonchelee.github.io/...`) 자료도 같은 방식으로 임베드한다(퀵 자동화 발표).

```html
<section id="x-content" class="slide slide--embed">
  <div class="embed-wrap">
    <iframe src="https://pages.github.sec.samsung.net/yonche-lee/team_x" title="주제" allow="fullscreen"></iframe>
  </div>
  <a class="embed-open" href="https://pages.github.sec.samsung.net/yonche-lee/team_x"
     target="_blank" rel="noopener">새 탭에서 열기 &#8599;</a>
</section>
```

`slide--embed` 슬라이드에서는 `body.embed-mode`가 켜져 비네트가 사라지고,
모션 캔버스는 **잠든다**(가려진 화면을 그리느라 iframe 성능을 깎지 않도록).

## 영상

**사내 페이지 임베드 (`video-content`)** — `embedVideoOn(where)`가 제목 슬라이드에서
미리 로드(`warm`), 내용 슬라이드에서 `?autoplay=1&muted=1`로 새로고침(`play`),
벗어나면 src를 비운다(`off`).

## 조작

- **키보드** → / ↓ / PageDown / Space = 다음, ← / ↑ / PageUp = 이전, Home / End,
  `R` = 리모컨. 입력 중·전체화면 중에는 키를 가로채지 않는다.
- **리모컨** 같은 파일을 `?remote=1`로 팝업으로 연다. 그 모드에서는 모션이 돌지 않는다.
  본 화면과 `postMessage`(`townhall-cmd` / `townhall-state`)로 주고받는다.
