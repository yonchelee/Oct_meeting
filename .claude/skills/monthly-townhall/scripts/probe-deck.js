// Walk the whole deck in a real browser and report anything broken.
//
//   NODE_PATH=<dir with playwright>/node_modules node probe-deck.js [index.html] [--shots DIR]
//
// Checks: every slide is reachable, every nav dot points at a slide that
// exists, the liquid shader runs and sleeps where it should, the kinetic type
// lands, the curtain runs, the remote popup lists the deck, and the console stays clean.
// Exits non-zero if anything fails.
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '../../../..');
const args = process.argv.slice(2);
const shotsAt = args.indexOf('--shots');
const SHOTS = shotsAt >= 0 ? args[shotsAt + 1] : null;
const DECK = args.find((a, i) => !a.startsWith('--') && (shotsAt < 0 || i !== shotsAt + 1))
  || path.join(ROOT, 'index.html');

const fail = [];
const ok = (cond, what, detail) => {
  console.log(`${cond ? 'ok  ' : 'FAIL'}  ${what}${detail === undefined ? '' : '  — ' + detail}`);
  if (!cond) fail.push(what);
};

(async () => {
  const br = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'],
  });
  const ctx = await br.newContext({ viewport: { width: 1920, height: 1080 } });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push('pageerror: ' + e.message));
  pg.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });

  await pg.goto('file://' + DECK);
  await pg.waitForTimeout(800);

  const slides = await pg.evaluate(() => [...document.querySelectorAll('.slide')].map(s => s.id));
  const dots = await pg.evaluate(() =>
    [...document.querySelectorAll('.nav-dot')].map(d => d.dataset.target));
  console.log(`\nslides (${slides.length}): ${slides.join(', ')}\n`);

  ok(slides.length > 0, 'deck has slides', slides.length);
  ok(dots.length === slides.length, 'one nav dot per slide', `${dots.length} dots / ${slides.length} slides`);
  const orphans = await pg.evaluate(() =>
    [...document.querySelectorAll('.nav-dot')].filter(d => !document.getElementById(d.dataset.target))
      .map(d => d.dataset.target));
  ok(orphans.length === 0, 'every dot points at a real slide', orphans.join(',') || 'none missing');
  const order = await pg.evaluate(() =>
    [...document.querySelectorAll('.nav-dot')].every((d, i) =>
      d.dataset.target === document.querySelectorAll('.slide')[i].id));
  ok(order, 'dots are in slide order');

  // ---- motion layer ----
  const theme = await pg.evaluate(() => THEME);
  ok(theme === 'reel' ? await pg.evaluate(() => document.documentElement.classList.contains('theme-reel')
      && [...document.querySelectorAll('.slide:not(.slide--embed)')].every(s => /tone-[kbwyv]/.test(s.className)))
    : await pg.evaluate(() => fxField && fxField.state().awake),
    theme === 'reel' ? 'showreel theme: every own slide has a colour field' : 'motion field runs on the intro');
  await pg.waitForTimeout(3200);
  if (theme === 'liquid') ok(await pg.evaluate(() => fxField.state().gl), 'the liquid shader compiled (WebGL)');
  ok(await pg.evaluate(() => { const e = document.querySelector('#intro .eyebrow');
    return e.textContent === e.dataset.text; }), 'the intro eyebrow decodes to its text');
  ok(await pg.evaluate(() => getComputedStyle(document.querySelector('#intro .title .wi')).transform === 'none'),
    'the intro title has risen out of its mask');
  if (SHOTS) await pg.screenshot({ path: path.join(SHOTS, 'intro.png') });
  const chapters = await pg.evaluate(() => document.querySelectorAll('.chapter').length);
  const titleSlides = await pg.evaluate(() =>
    [...document.querySelectorAll('.slide')].filter((s, i) => i > 0 && s.querySelector('.headline')).length);
  const bands = await pg.evaluate(() => document.querySelectorAll('.marquee').length);
  ok(chapters === titleSlides && bands === titleSlides * 2,
    'every section title has its number and marquees', `${chapters} numbers, ${bands} bands / ${titleSlides}`);
  const label = await pg.evaluate(() => {
    const h = document.querySelector('.headline');
    return h.getAttribute('aria-label') === [...h.querySelectorAll('.wi')].map(c => c.textContent).join(' ');
  });
  ok(label, 'split letters still read as the title');

  // a title slide: field awake, hue changed, burst fired
  await pg.keyboard.press('ArrowRight'); await pg.waitForTimeout(150);
  const burst = await pg.evaluate(() => fxField.state());
  if (theme === 'liquid') ok(burst.awake && burst.energy > .3, 'moving the deck surges the field', `energy ${burst.energy}`);
  ok(await pg.evaluate(() => document.getElementById('veil').classList.contains('go')), 'the curtain runs forward');
  await pg.waitForTimeout(2800);
  const hue = await pg.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--hue').trim());
  ok(hue === String(await pg.evaluate(() => slideHue[1])), 'the section hue follows the slide', hue);
  if (SHOTS) await pg.screenshot({ path: path.join(SHOTS, 'chapter.png') });
  // the first full-bleed embed: field asleep
  await pg.evaluate(() => document.querySelectorAll('.nav-dot')[
    [...document.querySelectorAll('.slide')].findIndex(s => s.classList.contains('slide--embed'))].click());
  await pg.waitForTimeout(400);
  ok(await pg.evaluate(() => !fxField.state().awake && document.body.classList.contains('embed-mode')),
    'the field sleeps under a full-bleed page');

  // walk to the end with the keyboard
  for (let i = 0; i < slides.length + 2; i++) { await pg.keyboard.press('ArrowRight'); await pg.waitForTimeout(70); }
  await pg.waitForTimeout(900);
  const atEnd = await pg.evaluate(() => ({
    tf: document.querySelector('.track').style.transform,
    next: document.getElementById('nextBtn').disabled,
    dot: [...document.querySelectorAll('.nav-dot')].findIndex(d => d.classList.contains('active')),
  }));
  ok(atEnd.next === true && atEnd.dot === slides.length - 1, 'arrow keys reach the last slide',
    `${atEnd.tf}, dot ${atEnd.dot}`);

  await pg.keyboard.press('Home'); await pg.waitForTimeout(800);
  ok(await pg.evaluate(() => document.querySelector('.track').style.transform === 'translate3d(0%, 0px, 0px)'),
    'Home returns to the first slide');
  if (theme === 'liquid') ok(await pg.evaluate(() => fxField.state().awake), 'the field wakes again on a dark slide');
  ok(await pg.evaluate(() => /^01 \/ \d+$/.test(document.getElementById('hudPos').textContent)), 'the HUD counts the page');

  // every dot navigates
  let dotFails = 0;
  for (let i = 0; i < dots.length; i++) {
    await pg.evaluate(i => document.querySelectorAll('.nav-dot')[i].click(), i);
    await pg.waitForTimeout(140);
    const active = await pg.evaluate(() =>
      [...document.querySelectorAll('.nav-dot')].findIndex(d => d.classList.contains('active')));
    if (active !== i) dotFails++;
  }
  ok(dotFails === 0, 'every dot jumps to its slide', dotFails ? `${dotFails} wrong` : 'all');

  // the presenter remote
  await pg.keyboard.press('Home'); await pg.waitForTimeout(600);
  const [popup] = await Promise.all([ctx.waitForEvent('page'), pg.click('#remoteBtn')]);
  popup.on('pageerror', e => errs.push('remote pageerror: ' + e.message));
  await popup.waitForLoadState(); await popup.waitForTimeout(1200);
  const rows = await popup.evaluate(() => document.querySelectorAll('#rmList li').length);
  ok(rows === slides.length, 'the remote lists every slide', `${rows} rows`);
  ok(await popup.evaluate(() => typeof fxField !== 'undefined' && fxField === null),
    'the remote does not run the motion layer');
  await popup.click('#rmNext'); await pg.waitForTimeout(800);
  ok(await pg.evaluate(() => document.querySelector('.track').style.transform === 'translate3d(-100%, 0px, 0px)'),
    'the remote drives the deck');
  await popup.close(); await pg.waitForTimeout(400);

  // reduced motion: everything visible, nothing animating
  const rctx = await br.newContext({ viewport: { width: 1280, height: 720 }, reducedMotion: 'reduce' });
  const rp = await rctx.newPage();
  rp.on('pageerror', e => errs.push('reduced pageerror: ' + e.message));
  await rp.goto('file://' + DECK); await rp.waitForTimeout(600);
  ok(await rp.evaluate(() => { const e = document.querySelector('#intro .eyebrow');
    return e.textContent === 'October Town Hall' && !fxField.state().awake
      && getComputedStyle(document.querySelector('#intro .title .wi')).transform === 'none'; }),
    'reduced motion: text shown at once, field still');
  await rctx.close();

  // Opened from file://, the deck cannot reach the internal embeds and cannot
  // delegate autoplay/fullscreen to a frame. Neither says anything about the deck.
  const noise = /ERR_(NAME_NOT_RESOLVED|CONNECTION|BLOCKED|FILE_NOT_FOUND|TUNNEL|ABORTED)|Failed to load resource|permissions policy/i;
  const real = errs.filter(e => !noise.test(e));
  ok(real.length === 0, 'no console errors', real.length ? real.join(' | ') : 'clean');

  await br.close();
  console.log(fail.length ? `\n${fail.length} FAILED: ${fail.join(', ')}` : '\nall checks passed');
  process.exit(fail.length ? 1 : 0);
})().catch(e => { console.error('PROBE CRASHED', e.message); process.exit(2); });
