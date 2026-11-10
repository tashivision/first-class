// Motion layer for the First Class page: neon signs, scroll-scrubbed scenes and
// pointer interactions. Everything degrades to a static, fully readable page when
// GSAP is missing or the visitor prefers reduced motion.

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const onEnter = (els, cb, options = {}) => {
  const io = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    cb(entry.target);
    io.unobserve(entry.target);
  }), { threshold: options.threshold ?? .35, rootMargin: options.rootMargin ?? '0px 0px -8% 0px' });
  els.forEach((el) => io.observe(el));
};

export function initMotion() {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const canScrub = Boolean(gsap && ScrollTrigger && !reduceMotion);
  if (canScrub) gsap.registerPlugin(ScrollTrigger);

  heroTitle(gsap, canScrub);
  odometers();
  neonSigns();
  planeDrawings();
  classTriggers();
  counters(gsap);
  marquees();
  flightPaths();
  departuresBoard();
  boardClock();
  gallery();
  crewRing();
  if (finePointer && !reduceMotion) { tilt(); magnetic(); spotlight(); }

  if (!canScrub) { staticFallbacks(); return; }

  parallaxImages(gsap);
  journeyDepth(gsap);
  wordReveal(gsap);
  route(gsap);
  flightLog(gsap);
  crewReveal(gsap);
  xrayScan(gsap);
  timeline(gsap);
  seasonMega(gsap);
  windowReveal(gsap);

  const refresh = () => ScrollTrigger.refresh();
  document.fonts?.ready.then(refresh);
  window.addEventListener('load', refresh);
  requestAnimationFrame(refresh);
}

/* ---------- Hero: letters rise out of a mask, then the neon sign flickers on ---------- */
function heroTitle(gsap, canScrub) {
  const hero = $('#hero');
  if (!hero) return;
  const words = $$('[data-split]', hero);
  words.forEach((word) => {
    word.innerHTML = [...word.textContent].map((ch) => `<span class="ch">${ch}</span>`).join('');
  });
  const flight = $('.fc-hero__flight', hero);
  const play = () => {
    hero.classList.add('is-on');
    if (canScrub) {
      gsap.from($$('.ch', hero), { yPercent: 115, rotate: 8, opacity: 0, duration: 1.1, stagger: .05, ease: 'expo.out' });
      gsap.from($$('.fc-hero__meta li, .fc-hero__lead, .fc-hero__actions', hero), { opacity: 0, y: 14, filter: 'blur(6px)', duration: .9, stagger: .1, delay: .55, ease: 'power3.out' });
    }
    window.setTimeout(() => flight?.classList.add('is-lit'), canScrub ? 700 : 0);
  };
  onEnter([hero], play, { threshold: .25, rootMargin: '0px' });
}

/* ---------- Every [data-neon] word switches on like a neon tube when it enters ---------- */
function neonSigns() {
  const signs = $$('[data-neon]').filter((el) => !el.closest('#hero'));
  if (reduceMotion) { signs.forEach((el) => el.classList.add('is-lit')); return; }
  onEnter(signs, (el) => window.setTimeout(() => el.classList.add('is-lit'), 120 + Math.random() * 260), { threshold: .6 });
}

function planeDrawings() {
  const planes = $$('.fc-plane-outline[data-draw]');
  if (reduceMotion) { planes.forEach((el) => el.classList.add('is-drawn')); return; }
  onEnter(planes, (el) => el.classList.add('is-drawn'), { threshold: .15 });
}

function classTriggers() {
  const groups = [
    ['mark[data-mark]', 'is-on', .5],
    ['[data-stamp]', 'is-on', .9],
    ['.fc-stat-card', 'is-on', .45],
    ['.fc-journey__counters li', 'is-on', .6],
  ];
  groups.forEach(([sel, cls, threshold]) => {
    const els = $$(sel);
    if (reduceMotion) els.forEach((el) => el.classList.add(cls));
    else onEnter(els, (el) => el.classList.add(cls), { threshold });
  });
}

/* ---------- Counters keep their prefix ("około", "~") small, like in the deck ---------- */
function counters(gsap) {
  const render = (node, value) => {
    const { prefix = '', suffix = '' } = node.dataset;
    const decimals = Number(node.dataset.decimals || 0);
    const text = Number(value).toFixed(decimals).replace('.', ',');
    node.innerHTML = `${prefix ? `<small class="fc-count__pre">${prefix.trim()}</small>` : ''}${text}${suffix}`;
  };
  const nodes = $$('.fc-count[data-count]');
  nodes.forEach((node) => render(node, node.dataset.count));
  if (!gsap || reduceMotion) return;
  nodes.forEach((node) => render(node, 0));
  onEnter(nodes, (node) => {
    const state = { v: 0 };
    gsap.to(state, { v: Number(node.dataset.count), duration: 1.7, ease: 'power3.out', onUpdate: () => render(node, state.v) });
  }, { threshold: .6 });
}

/* ---------- Seamless marquees (brands under Mike, the film strip) ---------- */
function marquees() {
  $$('[data-marquee]').forEach((track) => {
    const clone = [...track.children].map((child) => {
      const copy = child.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      copy.querySelectorAll('img').forEach((img) => { img.alt = ''; });
      return copy;
    });
    track.append(...clone);
  });
}

/* ---------- Next Destinations background: flowing flight paths ---------- */
function flightPaths() {
  const svg = $('[data-flight-paths]');
  if (!svg) return;
  const ns = 'http://www.w3.org/2000/svg';
  for (const position of [1, -1]) {
    for (let i = 0; i < 30; i += 1) {
      const p = document.createElementNS(ns, 'path');
      p.setAttribute('d', `M-${380 - i * 5 * position} -${189 + i * 6}C-${380 - i * 5 * position} -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${152 - i * 5 * position} ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${684 - i * 5 * position} ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`);
      p.setAttribute('pathLength', '1');
      p.setAttribute('stroke', i % 7 === 0 ? '#ff7300' : '#ffffff');
      p.setAttribute('stroke-opacity', String(i % 7 === 0 ? .32 : .025 + i * .0035));
      p.setAttribute('stroke-width', String(.4 + i * .025));
      p.style.setProperty('--d', `${18 + ((i * 7) % 13)}s`);
      p.style.animationDelay = `-${(i * 1.7) % 18}s`;
      svg.append(p);
    }
  }
  const section = svg.closest('.fc-dest');
  new IntersectionObserver(([entry]) => section.classList.toggle('is-visible', entry.isIntersecting)).observe(section);
}

/* ---------- Split-flap departures board ---------- */
function departuresBoard() {
  const board = $('[data-flap-board]');
  if (!board) return;
  const CHARSET = 'ABCDEFGHIJKLMNOPRSTUWYZĄĘŁŃÓŚŻ0123456789–';
  const flaps = $$('[data-flap]', board);
  flaps.forEach((flap) => {
    const text = flap.dataset.flap;
    flap.setAttribute('aria-label', text);
    flap.innerHTML = text.split(' ').map((word) => `<span class="wd" aria-hidden="true">${[...word].map((ch) => `<span class="c" data-ch="${ch}">${reduceMotion ? ch : ' '}</span>`).join('')}</span>`).join('');
  });
  if (reduceMotion) { flaps.forEach((f) => f.classList.add('is-settled')); return; }
  const run = () => {
    flaps.forEach((flap, fi) => {
      const cells = $$('.c', flap);
      cells.forEach((cell, ci) => {
        const target = cell.dataset.ch;
        const flipsLeft = 6 + ci * 2 + fi * 3 + Math.floor(Math.random() * 6);
        let n = 0;
        const tick = () => {
          n += 1;
          cell.textContent = n >= flipsLeft ? target : CHARSET[Math.floor(Math.random() * CHARSET.length)];
          cell.classList.remove('flip');
          void cell.offsetWidth;
          cell.classList.add('flip');
          if (n < flipsLeft) window.setTimeout(tick, 55 + Math.random() * 25);
          else if (ci === cells.length - 1) flap.classList.add('is-settled');
        };
        window.setTimeout(tick, fi * 90);
      });
    });
  };
  onEnter([board], run, { threshold: .3 });
}

function boardClock() {
  const clock = $('[data-clock]');
  if (!clock) return;
  const fmt = new Intl.DateTimeFormat('pl-PL', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Warsaw' });
  const tick = () => { clock.textContent = `WAW ${fmt.format(new Date())}`; };
  tick();
  window.setInterval(tick, 15000);
}

/* ---------- Lightbox: the photo mosaic and the film strip share one dialog ---------- */
function lightbox() {
  let dialog = $('.fc-lightbox');
  if (!dialog) {
    dialog = document.createElement('dialog');
    dialog.className = 'fc-lightbox';
    dialog.setAttribute('aria-label', 'Podgląd zdjęcia');
    dialog.innerHTML = '<figure><img alt=""><video controls playsinline hidden></video><figcaption></figcaption></figure>'
      + '<button type="button" class="fc-lightbox__close" aria-label="Zamknij">✕</button>'
      + '<button type="button" class="fc-lightbox__nav fc-lightbox__nav--prev" aria-label="Poprzednie">←</button>'
      + '<button type="button" class="fc-lightbox__nav fc-lightbox__nav--next" aria-label="Następne">→</button>';
    document.body.append(dialog);
  }
  if (typeof dialog.showModal !== 'function') return null;
  const img = $('img', dialog);
  const player = $('video', dialog);
  const caption = $('figcaption', dialog);
  const pad = (v) => String(v).padStart(2, '0');
  let items = [];
  let index = 0;
  const show = (i) => {
    index = (i + items.length) % items.length;
    const item = items[index];
    const clip = $('video', item);
    img.hidden = Boolean(clip);
    player.hidden = !clip;
    if (clip) {
      player.poster = clip.poster;
      player.src = $('source', clip).src;
      player.play().catch(() => {});
    } else {
      player.pause();
      player.removeAttribute('src');
      const source = $('img', item);
      img.src = source.currentSrc || source.src;
      img.alt = source.alt;
    }
    // Only a quiet counter under the photo, no descriptions
    caption.textContent = `${pad(index + 1)} / ${pad(items.length)}`;
  };
  dialog.addEventListener('close', () => player.pause());
  $('.fc-lightbox__close', dialog).addEventListener('click', () => dialog.close());
  $('.fc-lightbox__nav--prev', dialog).addEventListener('click', () => show(index - 1));
  $('.fc-lightbox__nav--next', dialog).addEventListener('click', () => show(index + 1));
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') show(index + 1);
    if (event.key === 'ArrowLeft') show(index - 1);
  });
  return {
    open(list, i) {
      items = list;
      show(i);
      if (!dialog.open) dialog.showModal();
    },
  };
}

function gallery() {
  const box = lightbox();
  if (!box) return;
  const root = $('[data-gallery]');
  if (root) {
    const items = $$('.fc-bento__item', root);
    items.forEach((item, i) => item.addEventListener('click', () => box.open(items, i)));
  }
  filmstrip(box);
}

/* ---------- Film strip: hovering speeds it up, a click opens the frame ---------- */
function filmstrip(box) {
  $$('.fc-filmstrip').forEach((strip) => {
    const track = $('.fc-filmstrip__track', strip);
    if (!track) return;
    const all = $$('figure', track);
    const frames = all.filter((figure) => !figure.hasAttribute('aria-hidden'));   // the marquee copies are aria-hidden
    if (!frames.length) return;
    const open = (figure) => box.open(frames, all.indexOf(figure) % frames.length);
    frames.forEach((figure) => {
      figure.tabIndex = 0;
      figure.setAttribute('role', 'button');
      figure.setAttribute('aria-label', `Powiększ zdjęcie: ${$('img', figure)?.alt || ''}`);
    });
    track.addEventListener('click', (event) => {
      const figure = event.target.closest('figure');
      if (figure) open(figure);
    });
    track.addEventListener('keydown', (event) => {
      if ((event.key !== 'Enter' && event.key !== ' ') || !event.target.matches('figure')) return;
      event.preventDefault();
      open(event.target);
    });

    if (!finePointer || reduceMotion) return;
    const FAST = 5;
    let rate = 1;
    let target = 1;
    let raf = 0;
    const tick = () => {
      const anim = track.getAnimations?.()[0];
      rate += (target - rate) * .09;
      if (Math.abs(target - rate) < .01) rate = target;
      if (anim) anim.playbackRate = rate;
      raf = rate === target ? 0 : requestAnimationFrame(tick);
    };
    const setRate = (value) => { target = value; if (!raf) raf = requestAnimationFrame(tick); };
    strip.addEventListener('pointerenter', (event) => { if (event.pointerType === 'mouse') setRate(FAST); });
    strip.addEventListener('pointerleave', () => setRate(1));
  });
}

/* ---------- On Board: the artists sit on a ring that turns with the cursor ---------- */
function crewRing() {
  $$('[data-ring]').forEach((ring) => {
    const stage = $('.fc-ring__stage', ring);
    const items = $$('.fc-ring__item', stage);
    const n = items.length;
    if (n < 6) return;   // too few cards to close a circle: keep the plain row
    const counter = $('[data-ring-count]', ring);
    const TAU = Math.PI * 2;
    const step = TAU / n;
    const IDLE = reduceMotion ? 0 : .085;   // rad/s, the slow drift when nobody is steering
    const MAX = 1.35;                        // rad/s with the cursor at the very edge
    const pad = (v) => String(v).padStart(2, '0');
    const wrap = (a) => a - TAU * Math.round(a / TAU);
    let radius = 0;
    let rot = 0;
    let vel = IDLE;
    let target = IDLE;
    let dir = 1;
    let goal = null;
    let aim = 0;
    let front = -1;
    let holdUntil = 0;
    let lockX = null;
    let drag = null;
    let moved = false;
    let visible = false;
    let raf = 0;
    let last = 0;

    ring.classList.add('is-ready');

    const measure = () => {
      const w = items[0].offsetWidth || 240;
      radius = (w + Math.max(14, w * .09)) / (2 * Math.tan(Math.PI / n));
    };
    const render = () => {
      let best = -2;
      let lead = 0;
      items.forEach((item, i) => {
        const a = wrap(i * step + rot);
        const c = Math.cos(a);
        const o = Math.min(1, Math.max(0, (c - .04) / .3));
        item.style.transform = `translate3d(${(Math.sin(a) * radius).toFixed(1)}px,0,${((c - 1) * radius).toFixed(1)}px) rotateY(${(a * 57.2958).toFixed(2)}deg)`;
        item.style.opacity = o.toFixed(3);
        item.style.visibility = o ? 'visible' : 'hidden';
        item.style.zIndex = String(Math.round(c * 100) + 100);
        item.style.setProperty('--dim', (1 - c).toFixed(3));
        if (c > best) { best = c; lead = i; }
      });
      if (lead !== front) {
        items[front]?.classList.remove('is-front');
        items[lead].classList.add('is-front');
        front = lead;
        if (counter) counter.textContent = `${pad(lead + 1)} / ${pad(n)}`;
      }
    };
    const frame = (now) => {
      const dt = Math.min(.05, Math.max(0, (now - last) / 1000));
      last = now;
      if (!drag || !moved) {
        if (goal !== null) {
          rot += (goal - rot) * (1 - Math.exp(-dt * 8));
          if (Math.abs(goal - rot) < .0015) { rot = goal; goal = null; vel = 0; holdUntil = now + 2600; }
        } else {
          const want = now < holdUntil ? 0 : target;
          vel += (want - vel) * (1 - Math.exp(-dt * 3.6));
          rot += vel * dt;
        }
      }
      render();
      raf = visible ? requestAnimationFrame(frame) : 0;
    };
    const go = (i) => {
      aim = (i + n) % n;
      goal = rot + wrap(-aim * step - rot);
      target = 0;
      if (reduceMotion) { rot = goal; goal = null; render(); }
    };
    // Cursor left of centre turns the ring one way, right the other; the middle is a rest zone.
    const steer = (clientX) => {
      const box = stage.getBoundingClientRect();
      const nx = Math.max(-1, Math.min(1, (clientX - (box.left + box.width / 2)) / (box.width / 2)));
      const dead = .14;
      const m = Math.abs(nx);
      if (m <= dead) { target = 0; return; }
      dir = -Math.sign(nx);
      target = dir * MAX * Math.pow((m - dead) / (1 - dead), 1.4);
    };

    stage.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      drag = { x: event.clientX, startX: event.clientX, t: performance.now(), id: event.pointerId };
      moved = false;
    });
    stage.addEventListener('pointermove', (event) => {
      if (drag) {
        if (!moved && Math.abs(event.clientX - drag.startX) > 6) {
          moved = true;
          goal = null;
          holdUntil = 0;
          stage.classList.add('is-dragging');
          try { stage.setPointerCapture(drag.id); } catch { /* pointer already gone */ }
        }
        if (moved) {
          const now = performance.now();
          const d = ((event.clientX - drag.x) / radius) * 1.15;
          rot += d;
          vel = vel * .5 + (d / Math.max(.008, (now - drag.t) / 1000)) * .5;
          drag.x = event.clientX;
          drag.t = now;
        }
        return;
      }
      if (event.pointerType !== 'mouse' || reduceMotion || goal !== null) return;
      if (lockX !== null) {
        if (Math.abs(event.clientX - lockX) < 28) return;
        lockX = null;
      }
      holdUntil = 0;
      steer(event.clientX);
    });
    const release = (event) => {
      if (!drag) return;
      stage.classList.remove('is-dragging');
      if (moved) {
        vel = Math.max(-3, Math.min(3, vel));
        if (vel) dir = Math.sign(vel);
        target = event.pointerType === 'mouse' ? 0 : dir * IDLE;
        lockX = event.clientX;
      }
      drag = null;
    };
    stage.addEventListener('pointerup', release);
    stage.addEventListener('pointercancel', release);
    stage.addEventListener('pointerleave', () => {
      if (drag) return;
      lockX = null;
      target = dir * IDLE;
    });
    // A click (not a drag) brings that artist to the front
    stage.addEventListener('click', (event) => {
      if (moved) { moved = false; return; }
      const item = event.target.closest('.fc-ring__item');
      if (!item) return;
      const i = items.indexOf(item);
      if (i === front) return;
      go(i);
      lockX = event.clientX;
    });
    const stepBy = (delta) => go((goal !== null ? aim : front) + delta);
    $('[data-ring-prev]', ring)?.addEventListener('click', () => stepBy(-1));
    $('[data-ring-next]', ring)?.addEventListener('click', () => stepBy(1));
    ring.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') stepBy(-1);
      if (event.key === 'ArrowRight') stepBy(1);
    });

    measure();
    render();
    new ResizeObserver(() => { measure(); render(); }).observe(stage);
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
    }, { rootMargin: '120px 0px' }).observe(ring);
  });
}

/* ---------- Pointer: tilt with glare, magnetic buttons ---------- */
function tilt() {
  $$('[data-tilt]').forEach((card) => {
    const max = card.classList.contains('fc-ticket') ? 6 : 9;
    card.addEventListener('pointermove', (event) => {
      const r = card.getBoundingClientRect();
      const x = (event.clientX - r.left) / r.width;
      const y = (event.clientY - r.top) / r.height;
      card.classList.add('is-tilting');
      card.style.setProperty('--rx', `${(0.5 - y) * max}deg`);
      card.style.setProperty('--ry', `${(x - 0.5) * max}deg`);
      card.style.setProperty('--gx', `${x * 100}%`);
      card.style.setProperty('--gy', `${y * 100}%`);
    });
    card.addEventListener('pointerleave', () => {
      card.classList.remove('is-tilting');
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });
}

function magnetic() {
  $$('[data-magnetic]').forEach((el) => {
    el.addEventListener('pointermove', (event) => {
      const r = el.getBoundingClientRect();
      const x = event.clientX - (r.left + r.width / 2);
      const y = event.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${x * .18}px, ${y * .3}px)`;
      el.style.transition = 'transform .15s linear';
    });
    el.addEventListener('pointerleave', () => {
      el.style.transform = '';
      el.style.transition = 'transform .6s cubic-bezier(.2,.75,.2,1)';
    });
  });
}

/* ---------- Scroll-scrubbed scenes (GSAP ScrollTrigger) ---------- */
function parallaxImages(gsap) {
  $$('[data-parallax-img]').forEach((img) => {
    gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  $$('[data-zoom-out]').forEach((img) => {
    gsap.fromTo(img, { scale: 1.28 }, { scale: 1.04, ease: 'none', scrollTrigger: { trigger: img.closest('section'), start: 'top bottom', end: 'center top', scrub: true } });
  });
  $$('.fc-bento__item img').forEach((img, i) => {
    gsap.fromTo(img, { yPercent: i % 2 ? -5 : 5 }, { yPercent: i % 2 ? 5 : -5, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
}

function wordReveal(gsap) {
  $$('[data-word-reveal], [data-highlight]').forEach((el) => {
    const walk = (node) => [...node.childNodes].forEach((child) => {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part.trim()) { frag.append(part); return; }
          const w = document.createElement('span');
          w.className = 'w';
          w.textContent = part;
          frag.append(w);
        });
        child.replaceWith(frag);
      } else walk(child);
    });
    walk(el);
    gsap.to($$('.w', el), { opacity: 1, stagger: .12, ease: 'none', scrollTrigger: { trigger: el, start: 'top 85%', end: 'bottom 55%', scrub: true } });
  });
}

function crewReveal(gsap) {
  const cards = $$('.fc-crew__card');
  if (!cards.length) return;
  const trigger = cards[0].closest('.fc-ring') || cards[0].parentElement;
  // On the ring the neighbours of the front card sit at both ends of the list, so open outwards from it
  const stagger = (i) => Math.min(i, cards.length - i) * .1;
  gsap.fromTo(cards,
    { clipPath: 'inset(100% 0% 0% 0% round 14px)' },
    { clipPath: 'inset(0% 0% 0% 0% round 14px)', duration: 1.1, stagger, ease: 'power3.inOut', scrollTrigger: { trigger, start: 'top 80%' } });
  gsap.fromTo($$('.fc-crew__card img'), { scale: 1.3 }, { scale: 1.04, duration: 1.6, stagger, ease: 'power3.out', scrollTrigger: { trigger, start: 'top 80%' } });
}

function xrayScan(gsap) {
  const xray = $('[data-xray]');
  if (!xray) return;
  const stage = $('.fc-xray__stage', xray);
  const status = $('[data-xray-status]', xray);
  const tags = $$('.fc-xray__tags li', xray);
  const state = { scan: 0 };
  const update = () => {
    stage.style.setProperty('--scan', state.scan.toFixed(4));
    tags.forEach((tag) => tag.classList.toggle('is-on', state.scan >= Number(tag.dataset.at)));
    const done = state.scan > .985;
    xray.classList.toggle('is-cleared', done);
    status.textContent = done ? 'Zawartość: premium ✓' : `Skanowanie… ${Math.round(state.scan * 100)}%`;
  };
  const scan = (scrollTrigger) => gsap.to(state, { scan: 1, ease: 'none', onUpdate: update, scrollTrigger });
  gsap.matchMedia().add({ pin: '(min-width: 901px)', flow: '(max-width: 900px)' }, ({ conditions }) => {
    const grid = xray.closest('.fc-inside__grid');
    // Hold it still only when the whole block fits under the fixed header
    const fits = grid && grid.offsetHeight <= window.innerHeight - 110;
    if (conditions.pin && fits) scan({ trigger: grid, start: 'center center+=48', end: '+=110%', pin: true, scrub: .6, anticipatePin: 1, refreshPriority: 1 });
    else scan({ trigger: xray, start: 'top 75%', end: 'bottom 45%', scrub: .6 });
  });
  update();
}

function timeline(gsap) {
  const tl = $('[data-timeline]');
  if (!tl) return;
  const stops = $$('li', tl);
  const state = { p: 0 };
  gsap.to(state, {
    p: 1, ease: 'none',
    scrollTrigger: { trigger: tl, start: 'top 85%', end: 'top 40%', scrub: .5 },
    onUpdate: () => {
      tl.style.setProperty('--p', state.p.toFixed(4));
      stops.forEach((stop, i) => stop.classList.toggle('is-passed', state.p >= i / (stops.length - 1) - .001));
    },
  });
}

function seasonMega(gsap) {
  const mega = $('[data-mega]');
  if (!mega) return;
  gsap.fromTo(mega, { letterSpacing: '.18em', scale: .82, opacity: .4 }, { letterSpacing: '-.05em', scale: 1, opacity: 1, ease: 'none', scrollTrigger: { trigger: mega, start: 'top 95%', end: 'top 35%', scrub: true } });
}

function windowReveal(gsap) {
  const section = $('[data-window]');
  if (!section) return;
  const frame = $('.fc-window__frame', section);
  const sticky = $('.fc-window__sticky', section);
  const start = getComputedStyle(frame);
  const wy = parseFloat(start.getPropertyValue('--wy')) || 20;
  const wx = parseFloat(start.getPropertyValue('--wx')) || 36;
  const wr = parseFloat(start.getPropertyValue('--wr')) || 220;
  const state = { p: 0 };
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const update = () => {
    const t = clamp01(state.p / .7);
    const e = 1 - Math.pow(1 - t, 3);
    frame.style.setProperty('--wy', `${lerp(wy, 0, e)}%`);
    frame.style.setProperty('--wx', `${lerp(wx, 0, e)}%`);
    frame.style.setProperty('--wr', `${lerp(wr, 0, e)}px`);
    sticky.style.setProperty('--ws', lerp(1.3, 1, e).toFixed(3));
    sticky.style.setProperty('--wshade', lerp(.35, 1, clamp01((state.p - .45) / .4)).toFixed(3));
    sticky.style.setProperty('--wc', clamp01((state.p - .55) / .3).toFixed(3));
    sticky.style.setProperty('--wp', clamp01((state.p - .5) / .35).toFixed(3));
  };
  gsap.to(state, { p: 1, ease: 'none', onUpdate: update, scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: .4 } });
  update();
}

/* Without GSAP or with reduced motion everything is shown in its final state. */
function staticFallbacks() {
  $$('.fc-xray').forEach((x) => {
    $('.fc-xray__stage', x)?.style.setProperty('--scan', '1');
    $$('.fc-xray__tags li', x).forEach((li) => li.classList.add('is-on'));
    x.classList.add('is-cleared');
    const status = $('[data-xray-status]', x);
    if (status) status.textContent = 'Zawartość: premium ✓';
  });
  $$('[data-route]').forEach((r) => { layoutRoute(r); $$('.fc-route__stops li', r).forEach((li) => li.classList.add('is-reached')); setRouteProgress(r, 1); });
  $$('[data-log] li').forEach((li) => li.classList.add('is-on'));
  $$('[data-timeline]').forEach((tl) => {
    tl.style.setProperty('--p', '1');
    $$('li', tl).forEach((li) => li.classList.add('is-passed'));
  });
  $$('[data-window] .fc-window__sticky').forEach((s) => { s.style.setProperty('--wc', '1'); s.style.setProperty('--wp', '1'); s.style.setProperty('--wshade', '1'); });
  $$('[data-window] .fc-window__frame').forEach((f) => { f.style.setProperty('--wy', '0%'); f.style.setProperty('--wx', '0%'); f.style.setProperty('--wr', '0px'); });
}

/* ---------- Odometer: digits roll like a flight-deck counter ---------- */
function odometers() {
  $$('.fc-odo[data-odo]').forEach((odo) => {
    const value = odo.dataset.odo;
    odo.setAttribute('aria-label', value);
    const digits = [...value];
    odo.innerHTML = digits.map((ch, i) => {
      if (!/\d/.test(ch)) return `<span aria-hidden="true">${ch}</span>`;
      const strip = [...Array(20).keys()].map((n) => `<span>${n % 10}</span>`).join('');
      return `<span class="fc-odo__d" aria-hidden="true"><span class="fc-odo__s" style="--to:${10 + Number(ch)};--dl:${(i * .12).toFixed(2)}s">${strip}</span></span>`;
    }).join('');
  });
  const all = $$('.fc-odo[data-odo]');
  if (reduceMotion) { all.forEach((o) => o.classList.add('is-rolled')); return; }
  onEnter(all, (o) => o.classList.add('is-rolled'), { threshold: .8 });
}

/* ---------- Spotlight border that follows the cursor across a group of cards ---------- */
function spotlight() {
  $$('[data-spotlight]').forEach((group) => {
    const cards = $$('.fc-stat-card', group);
    group.addEventListener('pointermove', (event) => {
      cards.forEach((card) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${event.clientX - r.left}px`);
        card.style.setProperty('--my', `${event.clientY - r.top}px`);
      });
    });
  });
}

/* ---------- Our Journey: layered collage depth, spinning badge ---------- */
function journeyDepth(gsap) {
  const section = $('.fc-journey');
  if (!section) return;
  const st = { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true };
  $$('[data-depth]', section).forEach((layer) => {
    const depth = Number(layer.dataset.depth);
    gsap.fromTo(layer, { yPercent: depth }, { yPercent: -depth, ease: 'none', scrollTrigger: st });
  });
  const ring = $('.fc-journey__ring', section);
  if (ring) gsap.to(ring, { rotation: 300, ease: 'none', transformOrigin: '50% 50%', scrollTrigger: st });
  gsap.fromTo($$('.fc-journey__float', section), { clipPath: 'inset(0 0 100% 0 round 14px)' }, { clipPath: 'inset(0 0 0% 0 round 14px)', duration: 1.1, stagger: .18, ease: 'power3.inOut', scrollTrigger: { trigger: section, start: 'top 70%' } });
}

/* ---------- Travel-language route ---------- */
function layoutRoute(root) {
  const stage = $('.fc-route__stage', root);
  const stops = $$('.fc-route__stops li', root);
  const h = stage.clientHeight;
  const pad = 70;
  const pts = stops.map((_, i) => [i % 2 ? 30 : 12, pad + i * ((h - pad * 2) / (stops.length - 1))]);
  // Smooth curve through the stops (Catmull-Rom → cubic Bézier), with a short lead-in.
  const first = [pts[0][0], 0];
  const last = [pts.at(-1)[0], h];
  const all = [first, ...pts, last];
  let d = `M${all[0][0]} ${all[0][1]}`;
  for (let i = 0; i < all.length - 1; i += 1) {
    const p0 = all[i - 1] || all[i];
    const p1 = all[i];
    const p2 = all[i + 1];
    const p3 = all[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  const base = $('.fc-route__base', root);
  const trail = $('.fc-route__trail', root);
  base.setAttribute('d', d);
  trail.setAttribute('d', d);
  const len = base.getTotalLength();
  trail.style.strokeDasharray = `${len}`;
  // Where along the path each stop sits (sampled), so stops light exactly when the plane passes.
  const samples = 240;
  const at = pts.map(([x, y]) => {
    let best = 0;
    let dist = Infinity;
    for (let s = 0; s <= samples; s += 1) {
      const p = base.getPointAtLength((len * s) / samples);
      const dd = (p.x - x) ** 2 + (p.y - y) ** 2;
      if (dd < dist) { dist = dd; best = s / samples; }
    }
    return best;
  });
  stops.forEach((li, i) => {
    li.style.setProperty('--x', `${pts[i][0]}px`);
    li.style.setProperty('--y', `${pts[i][1]}px`);
    li.dataset.at = at[i];
  });
  root._route = { base, trail, len, plane: $('.fc-route__plane', root), stops };
}

function setRouteProgress(root, p) {
  const r = root._route;
  if (!r) return;
  const L = r.len * p;
  const pt = r.base.getPointAtLength(L);
  const ahead = r.base.getPointAtLength(Math.min(r.len, L + 2));
  const behind = r.base.getPointAtLength(Math.max(0, L - 2));
  const angle = Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180 / Math.PI;
  r.plane.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)}) rotate(${angle.toFixed(1)}) scale(1.15)`);
  r.trail.style.strokeDashoffset = `${r.len - L}`;
}

function scramble(el) {
  const target = el.dataset.text || el.textContent;
  el.dataset.text = target;
  const glyphs = 'ABCDEFGHIJKLMNOPRSTUWXYZ0123456789/<>';
  let frame = 0;
  const total = 16;
  const tick = () => {
    frame += 1;
    el.textContent = [...target].map((ch, i) => {
      if (ch === ' ' || frame / total > i / target.length) return ch;
      return glyphs[Math.floor(Math.random() * glyphs.length)];
    }).join('');
    if (frame < total) requestAnimationFrame(tick);
    else el.textContent = target;
  };
  tick();
}

function route(gsap) {
  $$('[data-route]').forEach((root) => {
    layoutRoute(root);
    const state = { p: 0 };
    const update = () => {
      setRouteProgress(root, state.p);
      root._route.stops.forEach((li) => {
        const reached = state.p >= Number(li.dataset.at) - .005;
        if (reached && !li.classList.contains('is-reached')) {
          li.classList.add('is-reached');
          const label = $('[data-scramble]', li);
          if (label) scramble(label);
        } else if (!reached) li.classList.remove('is-reached');
      });
    };
    gsap.to(state, {
      p: 1, ease: 'none', onUpdate: update,
      scrollTrigger: { trigger: $('.fc-route__stage', root), start: 'top 62%', end: 'bottom 62%', scrub: .7, invalidateOnRefresh: true, onRefresh: () => { layoutRoute(root); update(); } },
    });
    update();
  });
}

/* ---------- Founder flight log: line draws, entries light up as it passes ---------- */
function flightLog(gsap) {
  $$('[data-log]').forEach((log) => {
    const items = $$('li', log);
    const state = { p: 0 };
    const update = () => {
      log.style.setProperty('--log', state.p.toFixed(3));
      const h = log.offsetHeight || 1;
      items.forEach((li) => li.classList.toggle('is-on', state.p * h >= li.offsetTop - 4));
    };
    gsap.to(state, { p: 1, ease: 'none', onUpdate: update, scrollTrigger: { trigger: log, start: 'top 75%', end: 'bottom 55%', scrub: .5 } });
    update();
  });
}
