/* Directory order: every card whose profile page exists comes first on
   /brands and /people, in SHOWCASE order, ahead of cards with no page.
   Promo tiles keep their card-count slots but never split the profiled block.
   Adds cards for profile pages the directory did not list yet.
   Usage: npm run build:directory   (writes; idempotent)
   Dry run: node scripts/build-directory-order.cjs   (prints the order)
   New profile page? Add its slug to SHOWCASE (and a card to ADD if the
   directory has none); the run fails until it is listed. */
const fs = require('fs');
const WRITE = process.argv.includes('--write');

const STAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2l2.4 5.4L20 8l-4.2 3.8L17 18l-5-2.8L7 18l1.2-6.2L4 8l5.6-.6L12 2z"/></svg>';
const PIN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>';
const TICK = n => `<span class="bpr-person__verified" title="Claimed profile, maintained by ${n}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg></span>`;
const CARD_SIZES = '(min-width: 1024px) 40vw, 100vw';
const pic = ({ base, src, widths, w, h, alt = '', sizes = CARD_SIZES, fade = true }) => {
  const set = ext => widths.map(x => `${base}-${x}.${ext} ${x}w`).join(', ');
  return `<picture><source type="image/avif" srcset="${set('avif')}" sizes="${sizes}"><source type="image/webp" srcset="${set('webp')}" sizes="${sizes}"><img${fade ? ' class="img-fade"' : ''} src="${src}" alt="${alt}" loading="lazy" decoding="async" width="${w}" height="${h}"></picture>`;
};

function personCard(c) {
  const badge = c.badge ? `
              <span class="bpr-person__badge bpr-person__badge--featured" title="Brand Connect ${c.badge} partner">
                ${STAR}
                ${c.badge}
              </span>` : '';
  const media = c.portrait
    ? `<div class="bpr-person__media">${badge}
              ${c.portrait}
            </div>`
    : `<div class="bpr-person__media bpr-person__media--mono">${badge}${badge ? '\n              ' : ''}<span class="bpr-person__mono" aria-hidden="true">${c.mono}</span>${badge ? '\n            ' : ''}</div>`;
  return `        <!-- ${c.name} · ${c.note} Profile page: /people/${c.slug}. -->
        <article class="bpr-person" data-cat="${c.cat}" data-city="${c.city}">
          <a class="bpr-person__link" href="/people/${c.slug}">
            ${media}
            <div class="bpr-person__body">
              <div class="bpr-person__ident">
                <h3 class="bpr-person__name">${c.name}${c.claimed ? TICK(c.name) : ''}</h3>
                <p class="bpr-person__role">${c.role}</p>
                <p class="bpr-person__location">${PIN}${c.city}</p>
              </div>
              <ul class="bpr-person__tags">${c.tags.map(t => `<li>${t}</li>`).join('')}</ul>
            </div>
          </a>
          <div class="bpr-person__foot">
            <button type="button" class="bpr-person__cta" data-brand-contact data-brand="${c.name}">Connect <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg></button>
          </div>
        </article>`;
}

function brandCard(c) {
  return `        <!-- ${c.name} · ${c.note} Profile page: /brands/${c.slug}. -->
        <div class="brand-card" data-cat="${c.cat}">
          <a class="brand-card__link" href="/brands/${c.slug}">
          <div class="brand-card__media">
            ${c.photo}
            <div class="brand-card__logo">${c.logo}</div>
          </div>
          <div class="brand-card__body">
            <div class="brand-card__hdr">
              <div class="brand-card__meta">
                <h3 class="brand-card__name">${c.name}</h3>
              </div>
            </div>
            <span class="brand-card__loc">${c.loc}</span>
            <ul class="brand-card__tags">${c.tags.map(t => `<li>${t}</li>`).join('')}</ul>
          </div>
          </a>
          <div class="brand-card__foot"><button type="button" class="brand-card__cta" data-brand="${c.name}">Contact ${c.name} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg></button>
          </div>
        </div>`;
}

const PPL = '/brand_assets/people/';
const JOBS = [
  {
    file: 'brands.html', grid: 'br-cat-grid', kind: 'brands', card: 'div class="brand-card"',
    page: s => `brand-profile-${s}.html`,
    // TEEARCH is the paid Featured tenant: always position 0.
    // Category corrections for profiled cards (slug: data-cat).
    CATS: { obeetee: 'furniture' },
    SHOWCASE: ['teearch', 'horizon-architects', 'avirahi', 'scarlet-splendour', 'godrej-properties', 'obeetee', 'saint-gobain', 'studiofov', 'asian-paints'],
    ADD: {
      studiofov: brandCard({
        slug: 'studiofov', name: 'Studio FOV', cat: 'interior',
        note: 'architectural visualisation studio, head office Krishna Nagar, Delhi, studio in Bandra West, Mumbai.',
        photo: pic({ base: '/brand_assets/brands/studiofov/satyam-queen-necklace', src: '/brand_assets/brands/studiofov/satyam-queen-necklace.webp', widths: [640, 1280], w: 2000, h: 1379 }),
        logo: pic({ base: '/brand_assets/brands/studiofov/logo', src: '/brand_assets/brands/studiofov/logo.png', widths: [600], w: 600, h: 600, alt: 'Studio FOV', sizes: '240px', fade: false }),
        loc: 'Delhi &middot; Mumbai', tags: ['3D visualisation', 'Scale models'],
      }),
      'asian-paints': brandCard({
        slug: 'asian-paints', name: 'Asian Paints', cat: 'materials',
        note: 'paints and coatings, Asian Paints House, Santacruz East, Mumbai.',
        photo: pic({ base: '/brand_assets/brand-photos/asian-paints-hero', src: '/brand_assets/brand-photos/asian-paints-hero.webp', widths: [640, 1280], w: 1440, h: 600 }),
        logo: pic({ base: '/brand_assets/brands/asian-paints-png', src: '/brand_assets/brands/asian-paints.png', widths: [640], w: 800, h: 800, alt: 'Asian Paints', sizes: '240px', fade: false }),
        loc: 'Santacruz East &middot; Mumbai', tags: ['Paints &amp; coatings'],
      }),
    },
  },
  {
    file: 'people.html', grid: 'pe-cat-grid', kind: 'people', card: 'article class="bpr-person"',
    page: s => `person-profile-${s}.html`,
    // Grouped by brand: TEEARCH, Godrej, Avirahi, Scarlet Splendour, Studio FOV, then independents.
    SHOWCASE: ['tarun-motta', 'hemal-shah', 'hiten-motta', 'devesh-motta', 'pirojsha-godrej', 'adi-godrej', 'vinod-doshi', 'virendra-shah', 'hardik-shah', 'satish-bhansali', 'suman-kanodia', 'ashish-bajoria', 'manpreet-singh', 'darshini-mahadevia'],
    ADD: {
      'devesh-motta': personCard({ slug: 'devesh-motta', name: 'Devesh Motta', mono: 'DM', cat: 'architects', city: 'Mumbai', claimed: true, role: 'Partner, TEEARCH', tags: ['Surveying', 'Redevelopment'], note: 'partner at TEEARCH.' }),
      'vinod-doshi': personCard({ slug: 'vinod-doshi', name: 'Vinod Doshi', mono: 'VD', cat: 'developers', city: 'Mumbai', role: 'Founder &amp; Group Head, Avirahi Group', tags: ['Development', 'Strategy'], note: 'founder and group head, Avirahi Group.' }),
      'virendra-shah': personCard({ slug: 'virendra-shah', name: 'Virendra Shah', mono: 'VS', cat: 'developers', city: 'Mumbai', role: 'Founder &amp; Group Head, Avirahi Group', tags: ['Development', 'Strategy'], note: 'founder and group head, Avirahi Group.' }),
      'hardik-shah': personCard({ slug: 'hardik-shah', name: 'Hardik Shah', mono: 'HS', cat: 'developers', city: 'Mumbai', role: 'Partner, Avirahi Group', tags: ['Operations', 'Client relations'], note: 'partner at Avirahi Group.' }),
      'satish-bhansali': personCard({ slug: 'satish-bhansali', name: 'Satish Bhansali', mono: 'SB', cat: 'developers', city: 'Mumbai', role: 'Partner, Avirahi Group', tags: ['Development'], note: 'partner at Avirahi Group.' }),
      // Scarlet Splendour is Signature: named co-founders inherit the badge
      // (docs/BRANDCONNECT-spotlight-delivery.md §4).
      'suman-kanodia': personCard({ slug: 'suman-kanodia', name: 'Suman Kanodia', mono: 'SK', cat: 'brandleaders', city: 'Kolkata', badge: 'Signature', role: 'Co-Founder, Scarlet Splendour', tags: ['Luxury furniture', 'Design objects'], note: 'co-founder of Scarlet Splendour, a Brand Connect Signature brand.',
        portrait: pic({ base: PPL + 'suman-kanodia', src: PPL + 'suman-kanodia.jpg', widths: [640], w: 1024, h: 683, alt: 'Suman Kanodia' }) }),
      'ashish-bajoria': personCard({ slug: 'ashish-bajoria', name: 'Ashish Bajoria', mono: 'AB', cat: 'brandleaders', city: 'Kolkata', badge: 'Signature', role: 'Co-Founder, Scarlet Splendour', tags: ['Luxury furniture', 'Design objects'], note: 'co-founder of Scarlet Splendour, a Brand Connect Signature brand.' }),
      'manpreet-singh': personCard({ slug: 'manpreet-singh', name: 'Manpreet Singh', mono: 'MS', cat: 'brandleaders', city: 'Delhi NCR', role: 'Founder, Studio FOV', tags: ['3D visualisation', 'Scale models'], note: 'founder of Studio FOV.' }),
    },
    // Profiled people whose page has a real portrait: the card shows it too.
    PORTRAITS: {
      'pirojsha-godrej': pic({ base: PPL + 'pirojsha-godrej', src: PPL + 'pirojsha-godrej.jpg', widths: [640, 1280], w: 1800, h: 1200, alt: 'Pirojsha Godrej' }),
      'adi-godrej': pic({ base: PPL + 'adi-godrej', src: PPL + 'adi-godrej.jpg', widths: [640, 1280], w: 1800, h: 2700, alt: 'Adi Godrej' })
        .replace('<img ', '<img style="--focal-y: 4%" '), // 2:3 source: keep the crown inside the 4:3 card
    },
  },
];

for (const job of JOBS) {
  const html = fs.readFileSync(job.file, 'utf8');
  const nl = html.includes('\r\n') ? '\r\n' : '\n';
  const open = html.indexOf(`<div class="${job.grid}">`);
  const bodyStart = html.indexOf('\n', open) + 1;
  const closeRe = /\r?\n    <\/div>\r?\n/g; closeRe.lastIndex = bodyStart;
  const bodyEnd = closeRe.exec(html).index + (nl.length);
  const lines = html.slice(bodyStart, bodyEnd).split(/\r?\n/);
  if (lines[lines.length - 1] === '') lines.pop();

  // Split into items: comment/blank lines attach to the element that follows.
  const items = []; let pending = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/^\s*<!--/.test(l)) { let j = i; while (!lines[j].includes('-->')) j++; pending.push(...lines.slice(i, j + 1)); i = j; continue; }
    const m = l.match(/^(\s*)<(article|div|a)\b/);
    if (!m) { pending.push(l); continue; }
    let j = i;
    if (!new RegExp(`</${m[2]}>\\s*$`).test(l)) { const close = `${m[1]}</${m[2]}>`; j = i + 1; while (lines[j].trimEnd() !== close) j++; }
    const text = [...pending, ...lines.slice(i, j + 1)].join('\n').replace(/^\n+/, '');
    const isCard = l.trim().startsWith(`<${job.card}`);
    const slug = isCard ? (text.match(new RegExp(`href="/${job.kind}/([a-z0-9-]+)"`)) || [])[1] : null;
    items.push({ isCard, slug, text }); pending = []; i = j;
  }
  const tail = pending.join('\n').trim();

  const cards = items.filter(x => x.isCard);
  const slots = cards.length;
  const have = new Set(cards.map(c => c.slug));
  let added = 0;
  for (const [slug, text] of Object.entries(job.ADD)) if (!have.has(slug)) { cards.push({ slug, text }); added++; }

  const noPage = job.SHOWCASE.filter(s => !fs.existsSync(job.page(s)));
  if (noPage.length) throw new Error(`${job.file}: SHOWCASE slug with no profile page: ${noPage}`);
  const unlisted = fs.readdirSync('.').map(f => (f.match(new RegExp(`^${job.page('(.+)').replace('.', '\\.')}$`)) || [])[1]).filter(s => s && !job.SHOWCASE.includes(s));
  if (unlisted.length) throw new Error(`${job.file}: profile pages not in SHOWCASE: ${unlisted}`);
  const notInGrid = job.SHOWCASE.filter(s => !cards.some(c => c.slug === s));
  if (notInGrid.length) throw new Error(`${job.file}: profile pages with no card (add to ADD): ${notInGrid}`);

  for (const c of cards) {
    const profiled = job.SHOWCASE.includes(c.slug);
    // data-profiled keeps showcase cards out of the load-more (gharGridReveal).
    c.text = c.text.replace(new RegExp(`<(${job.card})((?: data-[a-z-]+(?:="[^"]*")?)*)>`), (m, tag, attrs) =>
      `<${tag}${attrs.replace(/ data-profiled/g, '')}${profiled ? ' data-profiled' : ''}>`);
    const cat = (job.CATS || {})[c.slug];
    if (cat) c.text = c.text.replace(new RegExp(`(<${job.card} data-cat=")[^"]*"`), `$1${cat}"`);
    const portrait = (job.PORTRAITS || {})[c.slug];
    if (portrait) c.text = c.text.replace(/<picture>[\s\S]*?<\/picture>/, () => portrait).replace(/<div class="bpr-person__media bpr-person__media--mono"><span class="bpr-person__mono"[^>]*>[A-Z]+<\/span><\/div>/,
      `<div class="bpr-person__media">\n              ${portrait}\n            </div>`);
  }

  const rank = s => { const i = job.SHOWCASE.indexOf(s); return i < 0 ? Infinity : i; };
  const sorted = cards.map((c, i) => ({ c, i })).sort((a, b) => rank(a.c.slug) - rank(b.c.slug) || a.i - b.i).map(x => x.c);

  // Refill the card slots in order, so each promo tile keeps its card count
  // (row-aligned), except that no tile ever splits the profiled block: one
  // that lands inside it waits until the block ends. Extra cards follow the
  // last card slot.
  const out = [], waiting = []; let k = 0, slot = 0;
  for (const it of items) {
    if (!it.isCard) { (k < job.SHOWCASE.length ? waiting : out).push(it.text); continue; }
    out.push(sorted[k++].text);
    if (++slot === slots) while (k < sorted.length) { out.push(sorted[k++].text); if (k === job.SHOWCASE.length) out.push(...waiting.splice(0)); }
    if (k === job.SHOWCASE.length) out.push(...waiting.splice(0));
  }
  out.push(...waiting);
  if (k !== sorted.length) throw new Error(`${job.file}: placed ${k} of ${sorted.length} cards`);

  const body = (out.join('\n\n') + (tail ? '\n' + tail : '')).split('\n').join(nl) + nl;
  console.log(`== ${job.file}: ${sorted.length} cards, ${added} added, ${items.length - slots} fixed tiles`);
  let pos = 0;
  console.log(out.map(t => { const s = (t.match(new RegExp(`<(?:${job.card})[\\s\\S]*?href="/${job.kind}/([a-z0-9-]+)"`)) || [])[1]; return s ? `  ${pos++} ${fs.existsSync(job.page(s)) ? 'P' : '.'} ${s}` : `  -- ${(t.match(/class="([^"]+)"/) || [])[1]}`; }).slice(0, job.SHOWCASE.length + 6).join('\n'));
  if (WRITE) fs.writeFileSync(job.file, html.slice(0, bodyStart) + body + html.slice(bodyEnd));
}
