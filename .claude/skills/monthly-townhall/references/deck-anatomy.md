# index.html 해부

약 46KB, 한 파일. 위에서부터 `<style>` → 마크업 → `<script>` 순서다.

## 파일 지도

```
/* ===== Fixed backdrop ===== */          그라디언트 바탕 (모든 슬라이드 공용)
/* ===== Motion field ===== */            오로라·먼지 캔버스, 필름 그레인, 수평선
/* ===== Transition light sweep ===== */  슬라이드 전환 때 지나가는 빛줄기
/* ===== Carousel deck ===== */           .deck/.track/.slide, 3D 깊이 변환
/* ===== Shared typography ===== */       .headline/.eyebrow/.kicker/.rule(+스파크)
/* ===== Section titles ===== */          글자 등장, 챕터 번호, 궤도 링
/* ===== Intro slide ===== */             파티클 타이틀
/* ===== Embedded page ===== */           .embed-wrap, .embed-open
/* ===== Closing video ===== */           .slide--video, .video-play
/* ===== Presenter remote / Dot navigation / Carousel arrows ===== */

// ----- Section hues -----                 슬라이드별 색상(HUES)
// ----- Chapter dressing -----             챕터 번호·궤도·키커·글자 분리를 마크업에서 생성
// ----- Motion field -----                 fxField.slide(index, dir, covered)
// ----- Intro -----                        introFx(active)
// ----- Transition light sweep -----       sweep(dir)
// ----- Render current carousel position ----- render() / goTo() / next() / prev()
// ----- Presenter remote / Keyboard / Wheel / Touch / Titles fit / remote popup
// ----- the embedded video page
render();                                 ← 스크립트 마지막 줄
```

## 섹션

현재 11장: `intro` / `culture`+`culture-content` / `video`+`video-content` /
`team-lead`+`team-lead-content` / `mi-part`+`mi-part-content` /
`qna`+`qna-content`. (마무리 영상은 뺐다 — 마지막 장은 `qna-content`.)

제목 슬라이드는 이 모양이다. 글자 크기·챕터 번호·"Chapter 0N" 키커는 쓰지 않는다 —
스크립트가 순서대로 만들어 붙인다.

```html
<!-- 새 주제 (제목) -->
<section id="newtopic" class="slide">
  <h2 class="headline">새 주제</h2>
  <div class="rule" style="--d:.55s"></div>
</section>
```

섹션을 추가·삭제할 때 같이 손볼 곳:

1. `<section>` 마크업
2. `<nav class="nav-dots">` 안의 점 (슬라이드와 **같은 순서**, `data-target`=id,
   `data-label`=리모컨·툴팁 이름)
3. `render()` 안의 id 분기 (`intro`, `video`/`video-content`)

슬라이드 수·챕터 번호·섹션 색·리모컨 목록은 전부 DOM에서 세므로 그 외 상수는 없다.

## 임베드

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
