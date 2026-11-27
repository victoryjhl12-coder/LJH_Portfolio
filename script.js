// 배경 그래픽 반짝임 좌표 (배경 이미지에서 밝은 점을 검출한 위치, 디자인 px)
const SPARKS = {
  hero:  [[387,111],[560,361],[871,361],[1612,235],[491,490],[809,948],[33,35],[33,1035],[940,890],[1207,891],[582,948],[1505,33]],
  brand: [[388,106],[1614,228],[560,356],[33,1025],[1172,785],[33,34],[1210,852],[1495,33],[1496,227],[923,846],[489,480]],
  p1:    [[266,229],[396,228],[1520,102],[1886,897],[395,35],[451,958],[154,856],[1372,896],[1886,341],[1886,35]],
  p2:    [[363,94],[1612,220],[1506,26],[916,856],[1160,790],[537,353],[537,569],[44,500],[1067,359]],
  p3:    [[1612,218],[368,92],[1507,22],[920,850],[1163,784],[542,565],[542,351],[1070,356],[51,496],[474,483]],
  // 메인 첫 화면 흐린 정원 배경용: 아치문(가운데) 바깥에 흩뿌림
  haze:  [[180,160],[420,420],[260,760],[560,980],[620,250],[1340,180],[1560,420],[1720,820],[1420,960],[1300,640],[90,560],[1840,140],[480,620],[1660,620]],
};
document.querySelectorAll('.sparks').forEach(box => {
  SPARKS[box.dataset.set].forEach(([x, y], i) => {
    const s = document.createElement('i');
    const dur = 2.6 + ((i * 0.73) % 1.8);           // 2.6~4.4s 사이로 박자를 어긋나게
    s.className = 'spark';
    s.style.cssText = `--x:${x}px;--y:${y}px;--s:${30 + ((i * 11) % 28)}px;--dur:${dur.toFixed(2)}s;--dl:-${((i * 1.37) % dur).toFixed(2)}s`;
    box.appendChild(s);
  });
});

// 브랜드 선언 엠블럼: 섹션이 보일 때만 재생하고, 들어올 때마다 처음부터 시작
const brand = document.getElementById('brand');
new IntersectionObserver(([e]) => brand.classList.toggle('is-live', e.isIntersecting), { threshold: 0.25 }).observe(brand);

// 1920px 디자인을 창 너비에 맞게 스케일
const page = document.getElementById('page');
const fit = () => {
  const z = document.documentElement.clientWidth / 1920;
  page.style.zoom = z;
  // 고정 무대를 화면 세로 중앙에 배치 (디자인 px 기준)
  page.style.setProperty('--stick-top', `${Math.max(0, (innerHeight / z - 1080) / 2)}px`);
  updateStory();
};

// 대표상품 고정형 스토리: 스크롤 진행도에 따라 장면 전환
const story = document.getElementById('story');
const stage = story.querySelector('.story-stage');
const scenes = [...story.querySelectorAll('.scene')];
const dots = [...story.querySelectorAll('.story-nav button')];
const fill = document.getElementById('storyFill');
let current = 0, settleTimer;
// 상품 1은 JS 없이도 보이도록 HTML에서 활성 상태로 두고, JS가 동작하면 꺼 두었다가
// 섹션이 화면에 충분히 들어왔을 때 켜서 등장 연출을 보여줌
let shown = false;
scenes[0].classList.remove('is-active');

function storyProgress() {
  const r = story.getBoundingClientRect();
  const s = stage.getBoundingClientRect();
  const range = r.height - s.height;
  return Math.min(1, Math.max(0, (s.top - r.top) / range));
}

function updateStory() {
  const p = storyProgress();
  const n = scenes.length;
  const idx = Math.min(n - 1, Math.floor(p * n));
  const local = p * n - idx;               // 장면 안에서의 진행도 0~1
  // 섹션 윗변이 화면 높이의 60% 지점보다 위로 올라오면(섹션이 40% 보이면) 장면을 켬
  const entered = story.getBoundingClientRect().top < innerHeight * 0.6;
  if (!entered) {
    // 다시 위로 되돌아가면 꺼서, 다음에 내려올 때 등장 연출이 또 재생되게
    if (shown) {
      scenes[current].classList.remove('is-active', 'is-settled');
      clearTimeout(settleTimer);
      shown = false;
    }
  } else if (!shown || idx !== current) {
    if (shown) scenes[current].classList.remove('is-active', 'is-settled');
    current = idx;
    shown = true;
    scenes[idx].classList.add('is-active');
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => scenes[current].classList.add('is-settled'), 1400);
    dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
  }
  scenes[idx].style.setProperty('--lp', (local - 0.5).toFixed(3));
  fill.style.width = `${p * 100}%`;
  // 마지막 3% 구간에서 진행 바가 흐려져, 고정이 풀린 뒤 다음 섹션 경계에 띠처럼 남지 않게
  fill.parentElement.style.opacity = Math.min(1, (1 - p) / 0.03).toFixed(3);
}

dots.forEach((d, i) => d.addEventListener('click', () => {
  const r = story.getBoundingClientRect();
  const s = stage.getBoundingClientRect();
  const range = r.height - s.height;
  // getBoundingClientRect는 화면 px, scrollTo도 화면 px
  scrollTo({ top: scrollY + r.top + range * (i + 0.5) / scenes.length, behavior: 'smooth' });
}));

addEventListener('scroll', updateStory, { passive: true });
fit();
updateStory();   // 새로고침으로 페이지 중간에서 시작해도 현재 위치에 맞는 장면을 켬
addEventListener('resize', fit);

// 앵커 부드러운 스크롤
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length < 2) { e.preventDefault(); return; }
    const el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: 'smooth' });
  });
});

// 24H 낮/밤 탭
const h24 = document.getElementById('h24');
// 선택 표시용 알약: 활성 탭의 위치·폭으로 이동 (offset 값은 레이아웃 px라 zoom 배율과 무관)
const tabsBox = h24.querySelector('.tabs');
const pill = document.createElement('span');
pill.className = 'tab-pill no-anim';
pill.setAttribute('aria-hidden', 'true');
tabsBox.prepend(pill);
tabsBox.classList.add('has-pill');
const movePill = () => {
  const on = tabsBox.querySelector('.tab.is-active');
  pill.style.width = `${on.offsetWidth}px`;
  pill.style.transform = `translateX(${on.offsetLeft}px)`;
};
movePill();
requestAnimationFrame(() => pill.classList.remove('no-anim'));   // 첫 배치는 애니메이션 없이
addEventListener('load', movePill);   // 웹폰트 로드 후 탭 폭이 바뀌면 다시 맞춤
h24.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const mode = tab.dataset.mode;
    h24.dataset.mode = mode;
    h24.querySelectorAll('.tab').forEach(t => {
      const on = t === tab;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', on);
    });
    movePill();
    h24.querySelector('.layer.day').setAttribute('aria-hidden', mode !== 'day');
    h24.querySelector('.layer.night').setAttribute('aria-hidden', mode !== 'night');
  });
});

// 실험실 pH 슬라이더: 3.0 핑크(이미지_1) → 5.0 보라(이미지_2) → 7.0 블루(이미지_3)로 연속 교차 전환
const range = document.getElementById('phRange');
const glass1 = document.getElementById('labGlass1');
const glass3 = document.getElementById('labGlass3');
const clamp01 = v => Math.min(1, Math.max(0, v));
const tint = () => {
  const ph = parseFloat(range.value);
  glass1.style.opacity = clamp01((5 - ph) / 2);   // 5.0 → 3.0 구간에서 0 → 1
  glass3.style.opacity = clamp01((ph - 5) / 2);   // 5.0 → 7.0 구간에서 0 → 1
};
range.addEventListener('input', tint);
tint();

// 쇼룸 지도 확대·축소: 매장 핀(지도 박스 기준 385, 169)을 중심으로 확대, 확대 상태에서는 드래그로 이동
(() => {
  const box = document.getElementById('mapBox');
  const pan = document.getElementById('mapPan');
  const slider = document.getElementById('mapZoom');
  const btnIn = document.getElementById('mapZoomIn');
  const btnOut = document.getElementById('mapZoomOut');
  const W = 800, H = 365, PIN = { x: 385, y: 169 };
  const MIN = +slider.min, MAX = +slider.max, STEP = 0.5;
  let z = 1, tx = 0, ty = 0;

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const render = () => {
    // 지도가 박스 밖으로 비지 않도록 이동 범위 제한
    tx = clamp(tx, W - W * z, 0);
    ty = clamp(ty, H - H * z, 0);
    pan.style.transform = `translate(${tx}px, ${ty}px) scale(${z})`;
    slider.value = z;
    slider.style.setProperty('--fill', `${((z - MIN) / (MAX - MIN)) * 100}%`);
    btnIn.disabled = z >= MAX;
    btnOut.disabled = z <= MIN;
    box.classList.toggle('is-zoomed', z > MIN);
  };
  // 화면상 같은 지점(fx, fy)이 고정되도록 배율 변경
  const zoomTo = (next, fx = PIN.x, fy = PIN.y, animate = true) => {
    next = clamp(next, MIN, MAX);
    pan.classList.toggle('no-anim', !animate);
    tx = fx - (fx - tx) * (next / z);
    ty = fy - (fy - ty) * (next / z);
    z = next;
    render();
  };

  btnIn.addEventListener('click', () => zoomTo(z + STEP));
  btnOut.addEventListener('click', () => zoomTo(z - STEP));
  slider.addEventListener('input', () => zoomTo(+slider.value, PIN.x, PIN.y, false));

  // 드래그 이동 (페이지 전체가 zoom으로 축소돼 있으므로 이동량을 페이지 배율로 보정)
  let drag = null;
  box.addEventListener('pointerdown', e => {
    if (z <= MIN || e.target.closest('.map-zoom')) return;
    drag = { x: e.clientX, y: e.clientY, tx, ty, k: parseFloat(page.style.zoom) || 1 };
    try { box.setPointerCapture(e.pointerId); } catch (_) {}
    box.classList.add('is-dragging');
    pan.classList.add('no-anim');
  });
  box.addEventListener('pointermove', e => {
    if (!drag) return;
    tx = drag.tx + (e.clientX - drag.x) / drag.k;
    ty = drag.ty + (e.clientY - drag.y) / drag.k;
    render();
  });
  const end = () => { drag = null; box.classList.remove('is-dragging'); };
  box.addEventListener('pointerup', end);
  box.addEventListener('pointercancel', end);

  render();
})();

// ═════════ 스크롤 애니메이션 ═════════
(() => {
  if (!document.documentElement.classList.contains('js-anim')) return;   // 동작 줄이기 사용자: 정지 화면
  const clamp01 = v => Math.min(1, Math.max(0, v));

  // 순차 등장 지연값: 제휴사 로고 0.06초 간격, 블렌드 카드는 같은 줄 안에서 0.15초 간격
  document.querySelectorAll('.partners img').forEach((im, i) => im.style.setProperty('--d', `${(i * 0.06).toFixed(2)}s`));
  document.querySelectorAll('.blend .card').forEach(c => {
    const sameRowLeft = parseFloat(c.style.left) > 900;      // 오른쪽 카드는 왼쪽 카드보다 늦게
    c.style.setProperty('--d', sameRowLeft ? '.15s' : '0s');
  });

  // 화면에 들어오면 .is-in 추가 (한 번만 재생)
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('is-in');
    io.unobserve(e.target);
  }), { threshold: 0.18 });
  document.querySelectorAll('.mood, .partners, .h24, .signature, .blend, .blend .card, .showroom')
    .forEach(el => io.observe(el));

  // 대표 상품 썸네일: 섹션이 18%만 보여도 시작하면 큰 이미지(위에서 227px 아래 시작)가 거의 화면 밖일 때
  // 마스크 리빌이 끝나버림 → 이미지 자체가 35% 보일 때 섹션 전체(이미지 · 문구 · 버튼)를 시작
  // ※ 이미지(.rv-mask)를 직접 관찰하면 안 됨: 시작 전 clip-path로 완전히 가려져 있어
  //   브라우저가 '보이는 면적 0'으로 판단 → is-in이 영영 안 붙어 이미지 · 문구 · 버튼이 숨은 채로 남음.
  //   그래서 이미지와 같은 위치·크기의 투명한 감지용 상자를 따로 두고 그것을 관찰
  const thumbSec = document.querySelector('.thumb');
  const thumbMask = thumbSec.querySelector('.rv-mask');
  const thumbProbe = document.createElement('div');
  thumbProbe.className = 'abs';
  thumbProbe.setAttribute('aria-hidden', 'true');
  ['left', 'top', 'width', 'height'].forEach(k => { thumbProbe.style[k] = thumbMask.style[k]; });
  thumbProbe.style.pointerEvents = 'none';
  thumbSec.prepend(thumbProbe);
  new IntersectionObserver(([e], o) => {
    if (!e.isIntersecting) return;
    thumbSec.classList.add('is-in');
    o.disconnect();
  }, { threshold: 0.35 }).observe(thumbProbe);

  // 브랜드 가치관: 섹션이 40% 보이면 등장, 숫자는 나타나는 순간부터 1.4초 동안 카운트
  // (Microplastic은 100 → 0으로 내려가며 '없앴다'를 강조). HTML에는 최종값이 있어 JS가 없어도 정확히 보임
  const valuesSec = document.getElementById('values');
  const counters = [...valuesSec.querySelectorAll('.stat.v')];
  counters.forEach(el => { el.textContent = el.dataset.from + '%'; });
  const countUp = (el, delayMs) => setTimeout(() => {
    const from = +el.dataset.from, to = +el.dataset.to, dur = 1400, t0 = performance.now();
    const step = now => {
      const t = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - t, 3);                 // 끝에서 천천히 멈춤
      el.textContent = Math.round(from + (to - from) * e) + '%';
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, delayMs);
  new IntersectionObserver(([e], o) => {
    if (!e.isIntersecting) return;
    valuesSec.classList.add('is-in');
    counters.forEach(el => countUp(el, parseFloat(el.style.getPropertyValue('--d')) * 1000));
    o.disconnect();
  }, { threshold: 0.4 }).observe(valuesSec);

  // 메인 제목을 글자 단위 <span>으로 분리 (화면낭독기에는 원문 그대로 읽히도록)
  const splitChars = el => {
    const text = el.textContent;
    el.textContent = '';
    const sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = text;
    el.before(sr);
    return [...text].map(c => {
      const s = document.createElement('span');
      s.className = 'ch';
      s.setAttribute('aria-hidden', 'true');
      s.textContent = c;
      el.appendChild(s);
      return s;
    });
  };
  // 실험실 상단 문구: 제목 줄을 글자로 나눠 글자마다 시작 시간(--cd) 지정 → 틀 안에서 순서대로 올라옴
  // 섹션이 2550px로 길어 섹션 기준으로 감지하면 설명 문구가 화면 밖일 때 끝나버림 → 설명 문구가 절반 보일 때 시작
  const labSec = document.querySelector('.lab');
  labSec.querySelectorAll('.chars').forEach(line => {
    const base = parseFloat(line.dataset.d) || 0, step = parseFloat(line.dataset.step) || 0.03;
    splitChars(line).forEach((c, i) => c.style.setProperty('--cd', `${(base + i * step).toFixed(3)}s`));
  });
  new IntersectionObserver(([e], o) => {
    if (!e.isIntersecting) return;
    labSec.classList.add('is-in');
    o.disconnect();
  }, { threshold: 0.5 }).observe(labSec.querySelector('.lab-desc'));
  // 슬라이더 선 그리기: 상단 문구와 700px 이상 떨어져 있어 따로 감지 — 트랙이 화면 아래 20% 위로 올라오면 시작
  new IntersectionObserver(([e], o) => {
    if (!e.isIntersecting) return;
    labSec.classList.add('slider-in');
    o.disconnect();
  }, { rootMargin: '0px 0px -20% 0px' }).observe(labSec.querySelector('.ph-track'));

  const riseChars = splitChars(document.querySelector('.hero-line.rise'));
  const typeLine = document.querySelector('.hero-line.type');
  const typeChars = splitChars(typeLine);
  const caret = document.createElement('span');
  caret.className = 'caret off';
  caret.setAttribute('aria-hidden', 'true');
  typeLine.appendChild(caret);

  // 메인 첫 화면: 배경 이미지가 준비되면 작은 창이 서서히 나타남 (확장은 스크롤로)
  const hero = document.getElementById('top');
  const startHero = () => hero.classList.add('is-in');
  const heroImg = hero.querySelector('.hero-bg');
  Promise.resolve(heroImg.decode ? heroImg.decode() : null).catch(() => {})
    .then(() => requestAnimationFrame(() => requestAnimationFrame(startHero)));
  setTimeout(startHero, 2500);   // 이미지가 늦어도 2.5초 후에는 시작

  // 스크롤 연동 (패럴렉스 · 텍스트 하이라이트 · 무드 가로 슬라이드)
  // 비율(0~1)로 계산하므로 페이지 zoom 배율과 무관. 값은 부드럽게 따라가도록 보간.
  const heroStage = document.getElementById('heroStage');
  const heroMedia = document.getElementById('heroMedia');
  const heroZoom = document.getElementById('heroZoom');
  const heroBg = document.getElementById('heroBg');
  const heroFg = document.getElementById('heroFg');
  const heroCta = document.getElementById('heroCta');
  const heroFade = document.getElementById('heroFade');
  const gnb = document.getElementById('gnb');
  const navSections = [...document.querySelectorAll('[data-nav]')];
  const heroIntro = document.getElementById('heroIntro');
  const easeInOut = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const smooth = t => t * t * (3 - 2 * t);
  // 구간 [a, b]에서 0 → 1
  const seg = (p, a, b) => clamp01((p - a) / (b - a));
  // 값이 바뀔 때만 CSS 변수 지정 (불필요한 스타일 재계산 방지)
  const setT = (el, t) => {
    const v = t.toFixed(3);
    if (el._t !== v) { el._t = v; el.style.setProperty('--t', v); }
  };
  const brandSec = document.getElementById('brand');
  const emblem = document.getElementById('brandEmblem');
  // ── 타이핑 + 깜빡이는 커서 공통 ──
  // 여러 줄을 하나의 글자 배열로 이어 붙이고, shown개까지 보이게 + 커서를 마지막 글자 뒤에 둠
  const makeTyper = lineEls => {
    const lines = lineEls.map(el => { el.classList.add('tw'); return splitChars(el); });
    const chars = lines.flat();
    const caret = document.createElement('span');
    caret.className = 'caret caret--bar off';
    caret.setAttribute('aria-hidden', 'true');
    let last = -1;
    const set = (shown, caretOn) => {
      shown = Math.max(0, Math.min(chars.length, shown));
      if (shown !== last) {
        chars.forEach((c, i) => c.classList.toggle('on', i < shown));
        // 커서 위치: 마지막으로 보인 글자 뒤, 아무것도 없으면 첫 줄 맨 앞
        if (shown > 0) chars[shown - 1].after(caret);
        else lineEls[0].prepend(caret);
        last = shown;
      }
      caret.classList.toggle('off', !caretOn);
    };
    return { total: chars.length, set };
  };

  // 브랜드 선언: 제목 2줄 → 부제 2줄을 하나의 흐름으로 타이핑 (스크롤 연동)
  const brandTitle = document.getElementById('tw1').parentElement;
  const brandTyper = makeTyper(['tw1', 'tw2', 'tw3', 'tw4'].map(id => document.getElementById(id)));

  // 대표상품 1·2·3: 장면이 켜지면(시간 기준) 제목 → MOOD → 상품명 순서로 타이핑, 끝나면 shop 버튼 페이드업
  document.querySelectorAll('#story .scene').forEach(scene => {
    const lines = [
      scene.querySelector('.ci-title p .pf'),
      scene.querySelector('.ci-title p.mona'),
      ...scene.querySelectorAll('.s-copy--2 p'),
    ];
    const typer = makeTyper(lines);
    const START = 500, PER = 65;   // 시작 지연 · 글자 간격(ms)
    let raf = 0, t0 = 0;
    const step = now => {
      const shown = Math.floor((now - t0) / PER);
      typer.set(shown, true);
      if (shown < typer.total) raf = requestAnimationFrame(step);
      else scene.classList.add('btn-in');
    };
    const start = () => {
      cancelAnimationFrame(raf);
      scene.classList.remove('btn-in');
      typer.set(0, false);
      t0 = performance.now() + START;
      raf = requestAnimationFrame(step);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      scene.classList.remove('btn-in');
      typer.set(typer.total, false);   // 사라지는 동안은 문구 그대로 두고 커서만 끔
    };
    let active = scene.classList.contains('is-active');
    if (active) start();
    new MutationObserver(() => {
      const now = scene.classList.contains('is-active');
      if (now !== active) { active = now; now ? start() : stop(); }
    }).observe(scene, { attributes: true, attributeFilter: ['class'] });
  });
  const valuesBg = document.getElementById('valuesBg');
  const moodSec = document.getElementById('mood');
  const moodTrack = document.getElementById('moodTrack');
  const cur = {};
  let moving = false;   // 보간 중인 값이 하나라도 있으면 다음 프레임도 계속
  const ease = (key, target) => {
    const v = key in cur ? cur[key] + (target - cur[key]) * 0.12 : target;
    const out = Math.abs(target - v) < 0.0005 ? target : v;
    if (out !== target) moving = true;
    return (cur[key] = out);
  };
  const visible = r => r.bottom > 0 && r.top < innerHeight;
  // 섹션이 화면 아래에서 들어와 위로 나갈 때까지 0 → 1
  const through = r => clamp01((innerHeight - r.top) / (innerHeight + r.height));

  const tick = () => {
    moving = false;
    const hr = hero.getBoundingClientRect();
    // 메인이 화면 위로 60% 넘게 빠져나가면 네비게이션에 배경 바를 깔고 항상 보이게
    const solid = hr.bottom < innerHeight * 0.4;
    gnb.classList.toggle('is-solid', solid);
    if (solid) {
      gnb.style.visibility = 'visible';
      // 바 세로 가운데 바로 아래에 있는 섹션의 밝기(data-nav)를 보고 바 색을 정함
      const probe = gnb.getBoundingClientRect().bottom * 0.5;
      const under = navSections.find(s => { const r = s.getBoundingClientRect(); return r.top <= probe && r.bottom > probe; });
      gnb.classList.toggle('on-light', !!under && under.dataset.nav === 'light');
    }
    if (visible(hr)) {
      const sh = heroStage.getBoundingClientRect().height;
      const range = hr.height - sh;                                   // 무대가 고정되는 스크롤 거리
      const p = ease('hero', clamp01(-hr.top / range));               // 고정 구간 진행도
      const q = ease('heroOut', clamp01((-hr.top - range) / sh));     // 고정 해제 후 빠져나간 정도

      // ① 풀스크린 확장 (p 0 → 0.45): 가운데 둥근 창이 화면 전체로, 배경은 1.25배 → 1배
      const k = 1 - easeInOut(seg(p, 0, 0.45));
      // 아치문(위 190 · 좌우 740 · 아래 250, 위 모서리 반원) → 화면 전체
      const f = n => (n * k).toFixed(1);
      heroMedia.style.clipPath = `inset(${f(190)}px ${f(740)}px ${f(250)}px ${f(740)}px round ${f(220)}px ${f(220)}px ${f(16)}px ${f(16)}px)`;
      heroZoom.style.transform = `translateX(${f(-650)}px) scale(${(1 + 0.25 * k).toFixed(4)})`;
      // 로고 · 태그라인은 확장 초반(p 0 → 0.15)에 흩어지며 사라짐
      heroIntro.style.setProperty('--o', (1 - seg(p, 0, 0.15)).toFixed(3));
      const g = seg(p, 0.3, 0.45);
      gnb.style.opacity = (0.8 * g).toFixed(3);
      gnb.style.visibility = g > 0 ? 'visible' : 'hidden';
      hero.style.setProperty('--cue', (1 - seg(p, 0, 0.06)).toFixed(3));

      // ② 글자 리빌
      // Drink Me, (p 0.38 → 0.62): 글자마다 겹치며 순차 등장
      const tr = seg(p, 0.38, 0.62), n = riseChars.length, w = 0.45;
      riseChars.forEach((c, i) => setT(c, smooth(seg(tr, i / (n - 1) * (1 - w), i / (n - 1) * (1 - w) + w))));
      // Escape Reality. (p 0.56 → 0.86): 한 글자씩 타이핑, 끝난 뒤 잠시 커서 유지
      const tt = seg(p, 0.56, 0.86), shown = Math.round(tt * typeChars.length);
      typeChars.forEach((c, i) => c.classList.toggle('on', i < shown));
      caret.classList.toggle('off', !(tt > 0 && p < 0.97));
      // 버튼 (p 0.86 → 0.95)
      const tc = seg(p, 0.86, 0.95);
      setT(heroCta, tc);
      heroCta.style.visibility = tc > 0 ? 'visible' : 'hidden';

      // ③ 패럴렉스: 고정이 풀린 뒤 배경은 느리게, 제목은 빠르게 위로 빠지며 흐려짐
      heroBg.style.transform = `translate3d(0, ${(q * 380).toFixed(1)}px, 0)`;
      heroFg.style.transform = `translate3d(0, ${(-q * 260).toFixed(1)}px, 0)`;
      heroFg.style.opacity = (1 - q * 1.2).toFixed(3);
      // 경계 그라데이션: 빠져나가기 시작해 화면의 30%가 지나갈 때까지 서서히 나타남
      heroFade.style.setProperty('--fade', smooth(seg(q, 0, 0.3)).toFixed(3));
    }

    const br = brandSec.getBoundingClientRect();
    if (visible(br)) {
      const p = ease('brand', through(br));
      emblem.style.transform = `translate3d(0, ${((0.5 - p) * 180).toFixed(1)}px, 0)`;
      // 타이핑: 제목 윗변이 화면 높이 95% 지점에 오면 시작해 15% 지점에서 마지막 글자까지 완성.
      // 글자 수는 스크롤 위치에 비례(되돌리면 지워짐). 커서는 시작 후 계속 깜빡임
      const ty = brandTitle.getBoundingClientRect().top / innerHeight;
      const tp = ease('brandType', seg(ty, 0.95, 0.15));
      brandTyper.set(Math.round(tp * brandTyper.total), tp > 0);
    }

    // 브랜드 가치관 배경 숨쉬기: 지나가는 동안 1.1배 → 1배, 위아래 ±30px
    const vr = valuesSec.getBoundingClientRect();
    if (visible(vr)) {
      const p = ease('values', through(vr));
      valuesBg.style.transform = `translate3d(0, ${((0.5 - p) * 60).toFixed(1)}px, 0) scale(${(1.1 - 0.1 * p).toFixed(4)})`;
    }

    const mr = moodSec.getBoundingClientRect();
    if (visible(mr)) {
      // 세 번째 카드 오른쪽 끝(2369px)이 1800px까지 들어오도록 최대 -569px 이동
      const t = ease('mood', clamp01((through(mr) - 0.15) / 0.6));
      moodTrack.style.transform = `translate3d(${(80 - 649 * t).toFixed(1)}px, 0, 0)`;
    }
    // 값이 목표에 도달하면 루프를 멈추고, 스크롤·리사이즈 때 다시 시작
    if (moving) requestAnimationFrame(tick);
    else running = false;
  };
  let running = false;
  const kick = () => { if (!running) { running = true; requestAnimationFrame(tick); } };
  addEventListener('scroll', kick, { passive: true });
  addEventListener('resize', kick);
  kick();
})();
