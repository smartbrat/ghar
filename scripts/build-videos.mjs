#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════
   build-videos.mjs: bakes the /videos vertical from scripts/video-data.mjs

   One registry, three templates. Every card on /videos is written from the
   registry into the page between a pair of markers:

     <!-- VIDEOS:<block>:start --> ... <!-- VIDEOS:<block>:end -->

   so the pages stay static HTML (no fetch, no client render of listings)
   and a new upload is one registry row plus `npm run build:videos`.

   THE LAUNCH GATE LIVES HERE. A hub rail renders only when it holds at
   least RAIL_MIN videos. Below that the whole section is left out rather
   than shipping a rail of two, which reads as an empty shop. Category grids
   have no gate: they collapse at N=0 and show `.gtk-empty` instead.

   THE HUB NEVER REPEATS A VIDEO (pillar de-duplication rule). Each rail
   draws from what the rails above it have not used.

   Pages:
     videos.html           /videos            hub
     videos-category.html  /videos/{topic}    one template, resolved by path
     videos-watch.html     /videos/{slug}     one template, resolved by path

   Contract: docs/VIDEOS-HANDOFF.md
   ═══════════════════════════════════════════════════════════════════════ */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { TOPICS, GHARTALKS, FEATURED, VIDEOS } from './video-data.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const RAIL_MIN = 6;

/* ── helpers ─────────────────────────────────────────────────────────── */
const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const LABEL = Object.fromEntries([...TOPICS, GHARTALKS].map((t) => [t.slug, t.label]));
const TOPIC_HREF = (slug) => (slug === 'ghartalks' ? GHARTALKS.href : `/videos/${slug}`);

function dur(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = String(secs % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'];
function longDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}
const shortDate = (iso) => longDate(iso).replace(/^(\d+) (\w{3})\w* (\d+)$/, '$1 $2 $3');

/* Long videos use YouTube's auto frame (maxres2), never the custom
   thumbnail, which carries burned-in type. Two uploads have no maxres2 and
   ask for hq2 instead; both still drop to hqdefault on a 404 through the
   page's `data-yt-fallback` handler. Shorts use oar2, the 9:16 auto frame:
   YouTube's 16:9 stills for a Short are a blurred pillarbox. */
function still(v) {
  if (v.format === 'short') return { src: `https://i.ytimg.com/vi/${v.id}/oar2.jpg`, w: 1080, h: 1920 };
  if (v.still === 'hq2') return { src: `https://i.ytimg.com/vi/${v.id}/hq2.jpg`, w: 480, h: 360 };
  return { src: `https://i.ytimg.com/vi/${v.id}/maxres2.jpg`, w: 1280, h: 720 };
}

const PLAY = '<span class="gtk-facade__play" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M3 1.5v13l11-6.5z"/></svg></span>';
const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7"/></svg>';

function img(v, { eager = false } = {}) {
  const s = still(v);
  const fb = v.format === 'short' ? '' : ` data-yt-fallback="${v.id}"`;
  const load = eager ? 'fetchpriority="high"' : 'loading="lazy"';
  return `<img class="gtk-facade__img" src="${s.src}"${fb} alt="" width="${s.w}" height="${s.h}" ${load} decoding="async">`;
}

/* One card, two shapes. Both are `.gtk-card`: the Short only changes the
   frame (9:16) and drops the meta line, which a 180px-wide card has no room
   for. Filter keys ride on the anchor for the category and watch pages. */
function card(v, { eyebrow = true, i = 0 } = {}) {
  const short = v.format === 'short';
  const meta = [v.city, shortDate(v.date)].filter(Boolean).map(esc).join(' &middot; ');
  return `<a href="${v.home}" class="gtk-card${short ? ' vid-card--short' : ''}" data-topic="${v.topic}" data-format="${v.format}" data-slug="${v.slug}" data-i="${i}">
  <div class="gtk-card__media">
    <span class="gtk-facade${short ? ' vid-facade--short' : ''}">
      ${img(v)}
      ${PLAY}
      <span class="gtk-facade__dur">${dur(v.secs)}</span>
    </span>
  </div>
  <div class="gtk-card__body">
    ${eyebrow ? `<span class="gtk-card__eyebrow">${esc(LABEL[v.topic])}</span>\n    ` : ''}<h3 class="gtk-card__title">${esc(v.title)}</h3>${short ? '' : `
    <p class="gtk-card__meta">${meta}</p>`}
  </div>
</a>`;
}

const indent = (s, n) => s.split('\n').map((l) => (l ? ' '.repeat(n) + l : l)).join('\n');

function rail(key, title, dek, items, seeAll, opts = {}) {
  if (items.length < RAIL_MIN) {
    console.log(`  rail "${key}" skipped: ${items.length} < ${RAIL_MIN}`);
    return '';
  }
  const id = `vid${key}`;
  const link = seeAll
    ? `\n        <a href="${seeAll.href}" class="section-head__link">${esc(seeAll.label)} ${ARROW}</a>`
    : '';
  return `
  <section class="gtk-strip" aria-labelledby="${id}Title">
    <div class="gtk-strip__head">
      <div>
        <h2 id="${id}Title" class="gtk-strip__title">${esc(title)}</h2>
        <p class="gtk-strip__dek">${esc(dek)}</p>
      </div>
      <div class="gtk-strip__nav vid-strip__nav">${link}
        <button type="button" id="${id}Prev" aria-label="Previous" data-vid-arrow>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <button type="button" id="${id}Next" aria-label="Next" data-vid-arrow>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
    </div>
    <div class="rail-outer gtk-rail-outer" id="${id}Outer" data-vid-rail="${id}">
      <div class="rail gtk-rail" id="${id}Track">
${indent(items.map((v) => card(v, opts)).join('\n'), 8)}
      </div>
    </div>
  </section>
`;
}

/* Topic tiles: `.gtk-beats` verbatim, same four tones GharTalks uses, in the
   same order, so the two verticals read as one system. */
/* Beat tiles: the canonical shape IS the tile. Each tone draws its canonical
   partner from design-system #bi-shapes (never a different pairing). */
const SHAPES = {
  terracotta: '<path d="M 100,26 L 176,72 L 176,170 L 24,170 L 24,72 Z" fill="currentColor" stroke="currentColor" stroke-width="28" stroke-linejoin="round"/>',
  indigo: '<path d="M 58,26 L 176,88 L 176,170 L 24,170 L 24,78 Z" fill="currentColor" stroke="currentColor" stroke-width="28" stroke-linejoin="round"/>',
  aubergine: '<path d="M 24,64 L 176,26 L 176,170 L 24,170 Z" fill="currentColor" stroke="currentColor" stroke-width="28" stroke-linejoin="round"/>',
  sage: '<path d="M 22,184 C 15,184, 10,178, 10,170 L 10,80 C 10,73, 13,68, 18,64 L 113,12 C 120,7, 129,8, 133,14 C 136,17, 137,22, 137,27 L 137,58 C 137,63, 139,67, 143,69 C 147,70, 150,69, 154,66 L 173,49 C 181,42, 190,48, 190,59 L 190,170 C 190,178, 185,184, 178,184 Z" fill="currentColor"/>',
};
const TONES = [['terracotta', '#fff'], ['indigo', '#fff'], ['aubergine', '#fff'], ['sage', '#fff']];
function beats() {
  const tiles = TOPICS.map((t, n) => {
    const [tone, ink] = TONES[n];
    const count = VIDEOS.filter((v) => v.topic === t.slug).length;
    return `<a href="/videos/${t.slug}" class="gtk-beat" data-topic="${t.slug}" style="--gtk-beat-tone:var(--${tone}); --gtk-beat-ink:${ink}">
  <svg class="gtk-beat__shape" viewBox="10 12 180 172" aria-hidden="true">${SHAPES[tone]}</svg>
  <span class="gtk-beat__body">
    <span class="gtk-beat__meta">${count} video${count === 1 ? '' : 's'}</span>
    <h3 class="gtk-beat__name">${esc(t.label)}</h3>
  </span>
  <span class="gtk-beat__go" aria-hidden="true">${ARROW}</span>
</a>`;
  }).join('\n');
  return `\n    <div class="gtk-beats">\n${indent(tiles, 6)}\n    </div>\n    `;
}

function inject(file, block, html) {
  const path = join(ROOT, file);
  const src = readFileSync(path, 'utf8');
  const re = new RegExp(`(<!-- VIDEOS:${block}:start -->)[\\s\\S]*?(<!-- VIDEOS:${block}:end -->)`);
  if (!re.test(src)) throw new Error(`${file}: marker pair VIDEOS:${block} not found`);
  const out = src.replace(re, (_, a, b) => `${a}${html}${b}`);
  if (out !== src) writeFileSync(path, out);
  return out !== src;
}

/* ── registry sanity ─────────────────────────────────────────────────── */
const slugs = new Set();
for (const v of VIDEOS) {
  if (slugs.has(v.slug)) throw new Error(`duplicate slug ${v.slug}`);
  slugs.add(v.slug);
  if (TOPICS.some((t) => t.slug === v.slug)) throw new Error(`slug ${v.slug} collides with a topic route`);
  if (!LABEL[v.topic]) throw new Error(`${v.id}: unknown topic ${v.topic}`);
}
const featured = VIDEOS.find((v) => v.id === FEATURED);
if (!featured) throw new Error(`FEATURED ${FEATURED} not in registry`);

const long = VIDEOS.filter((v) => v.format === 'long');
const shorts = VIDEOS.filter((v) => v.format === 'short');
const changed = [];

/* ── hub ─────────────────────────────────────────────────────────────── */
/* THE FLOW: billboard, then shelves by topic, then everything else. A
   video is used once, in that order, so the billboard takes its picks
   first and each shelf draws from what is left. The last section picks up
   whatever no shelf took, so the hub still carries the whole library. */
{
  const used = new Set();
  const take = (list) => { list.forEach((v) => used.add(v.id)); return list; };
  const fresh = (v) => !used.has(v.id);
  const newestLong = (topic) => long.find((v) => v.topic === topic && fresh(v));

  /* Billboard: the editorial pick, then the newest long video of every
     topic that has one, then the newest GharTalks episode. */
  const bb = take([featured]);
  for (const t of [...TOPICS.map((x) => x.slug), 'ghartalks']) {
    const v = newestLong(t);
    if (v && bb.length < 6) bb.push(...take([v]));
  }
  const slide = (v, n) => {
    const s = still(v);
    const load = n === 0 ? 'fetchpriority="high"' : 'loading="lazy"';
    return `<a href="${v.home}" class="gtk-tile vid-bb" role="listitem">
  <span class="gtk-tile__media"><img class="gtk-tile__img" src="${s.src}"${v.format === 'short' ? '' : ` data-yt-fallback="${v.id}"`} alt="" width="${s.w}" height="${s.h}" ${load} decoding="async"></span>
  <span class="gtk-tile__body">
    <span class="gtk-tile__play" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M3 1.5v13l11-6.5z"/></svg></span>
    <h2 class="gtk-tile__title">${esc(v.title)}</h2>
  </span>
</a>`;
  };

  /* Shelves. Long rows first where a topic has the depth, Shorts shelves
     ("in a minute") where the topic lives mostly as Shorts. Every shelf is
     one topic, so its cards drop the eyebrow: the row title says it. */
  const T = (slug) => TOPICS.find((t) => t.slug === slug);
  const shelf = (key, title, dek, list, seeAll) => rail(key, title, dek, take(list), seeAll, { eyebrow: false });
  const pick = (topic, format, max = 12) => VIDEOS.filter((v) => v.topic === topic && v.format === format && fresh(v)).slice(0, max);

  const rails = [
    shelf('Tours', 'Project tours', T('project-tours').dek, pick('project-tours', 'long'), { href: '/videos/project-tours', label: 'See all' }),
    shelf('TourShorts', 'Tours in a minute', 'The same homes as Shorts: one view, one room or one reason each.', pick('project-tours', 'short'), { href: '/videos/project-tours', label: 'See all' }),
    shelf('Talks', 'GharTalks', 'Long conversations with the people building Indian real estate.', pick('ghartalks', 'long'), { href: GHARTALKS.href, label: 'All episodes' }),
    shelf('MarketShorts', 'Market in a minute', T('market').dek, pick('market', 'short'), { href: '/videos/market', label: 'See all' }),
    shelf('DesignShorts', 'Design in a minute', T('design').dek, pick('design', 'short'), { href: '/videos/design', label: 'See all' }),
  ].join('');

  /* Everything else, newest first, long above Shorts. */
  const restLong = take(long.filter(fresh));
  const restShort = take(shorts.filter(fresh));
  const more = restLong.length + restShort.length === 0 ? '' : `
  <section class="gtk-strip" aria-labelledby="vidMoreTitle">
    <div class="gtk-strip__head">
      <div>
        <h2 id="vidMoreTitle" class="gtk-strip__title">More to watch</h2>
        <p class="gtk-strip__dek">Home buying guides, project tours, market explainers and GharTalks conversations, newest first.</p>
      </div>
    </div>${restLong.length ? `
    <div class="gtk-grid">
${indent(restLong.map((v) => card(v)).join('\n'), 6)}
    </div>` : ''}${restShort.length ? `
    <div class="vid-shorts-grid">
${indent(restShort.map((v) => card(v)).join('\n'), 6)}
    </div>` : ''}
  </section>
`;
  if (used.size !== VIDEOS.length) throw new Error(`hub shows ${used.size} of ${VIDEOS.length} videos`);

  if (inject('videos.html', 'billboard', `\n${indent(bb.map(slide).join('\n'), 10)}\n        `)) changed.push('videos.html#billboard');
  if (inject('videos.html', 'rails', rails + '  ')) changed.push('videos.html#rails');
  if (inject('videos.html', 'more', more)) changed.push('videos.html#more');
  if (inject('videos.html', 'topics', beats())) changed.push('videos.html#topics');
  console.log(`  hub: billboard ${bb.length}, more ${restLong.length} long + ${restShort.length} Shorts`);
}

/* ── category (one template, every topic baked, filtered by path) ─────── */
{
  const topicVids = VIDEOS.filter((v) => v.topic !== 'ghartalks');
  const longCards = topicVids.filter((v) => v.format === 'long').map((v, i) => card(v, { eyebrow: false, i })).join('\n');
  const shortCards = topicVids.filter((v) => v.format === 'short').map((v, i) => card(v, { eyebrow: false, i })).join('\n');
  const topicJson = JSON.stringify(Object.fromEntries(TOPICS.map((t) => [t.slug, { label: t.label, dek: t.dek }])));

  if (inject('videos-category.html', 'long', `\n${indent(longCards, 6)}\n      `)) changed.push('videos-category.html#long');
  if (inject('videos-category.html', 'shorts', `\n${indent(shortCards, 6)}\n      `)) changed.push('videos-category.html#shorts');
  if (inject('videos-category.html', 'topics', beats())) changed.push('videos-category.html#topics');
  if (inject('videos-category.html', 'data', `\n  <script type="application/json" id="vidTopics">${topicJson}</script>\n  `)) changed.push('videos-category.html#data');
}

/* ── watch (one template, every video's data inline, resolved by path) ── */
{
  /* Every video gets an entry, but only one whose HOME is a watch page is
     played here. A GharTalks episode with its own /ghartalks/{slug} page is
     never played twice: its /videos/{slug} redirects to the one home (see
     the resolver in videos-watch.html). */
  const data = {};
  for (const v of VIDEOS) {
    data[v.slug] = {
      id: v.id, title: v.title, dek: v.dek, topic: v.topic, label: LABEL[v.topic],
      topicHref: TOPIC_HREF(v.topic), format: v.format, date: v.date,
      dateText: longDate(v.date), dur: dur(v.secs), mins: Math.max(1, Math.round(v.secs / 60)),
      city: v.city || '', home: v.home,
    };
  }
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  const moreLong = long.map((v, i) => card(v, { eyebrow: false, i })).join('\n');
  const moreShort = shorts.map((v, i) => card(v, { eyebrow: false, i })).join('\n');

  if (inject('videos-watch.html', 'data', `\n  <script type="application/json" id="vidData">${json}</script>\n  `)) changed.push('videos-watch.html#data');
  if (inject('videos-watch.html', 'more-long', `\n${indent(moreLong, 10)}\n          `)) changed.push('videos-watch.html#more-long');
  if (inject('videos-watch.html', 'more-shorts', `\n${indent(moreShort, 10)}\n          `)) changed.push('videos-watch.html#more-shorts');
}

console.log(`build-videos: ${VIDEOS.length} videos (${long.length} long, ${shorts.length} Shorts).`);
console.log(changed.length ? `  updated ${changed.join(', ')}` : '  no changes');
