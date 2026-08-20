# Industry Voices: Backend Handoff

> The written authority layer at `/voices`. Three pages, one article store, one
> piece template. This doc is the contract: URL scheme, content model, template
> hooks, what is reused, and the editorial rules the code has to enforce.

**Live templates**
- Landing: [`voices.html`](../voices.html) → `/voices`
- Browse / SRP: [`voices-search.html`](../voices-search.html) → `/voices/search`
- Piece: [`voices-article.html`](../voices-article.html) → `/voices/{slug}`

**Catalog entry:** [design-system.html#voices-chassis](../_dev/reference/design-system.html#voices-chassis)
**Siblings:** [`DESIGN-PILLAR-HANDOFF.md`](DESIGN-PILLAR-HANDOFF.md) · [`DESIGN-ARTICLE-HANDOFF.md`](DESIGN-ARTICLE-HANDOFF.md) · [`SEARCH-HANDOFF.md`](SEARCH-HANDOFF.md)

---

## 0. TL;DR for the busy dev

1. **One article store.** Everything lives at `/voices/{slug}`. It is **not** filed
   under the blog. See §2 for why, because this was a deliberate call.
2. **One piece template, two byline models, format as an attribute.** Do not fork
   the page per content type. §3.
3. **The Speakers index is a query, not a list.** It groups the article store by
   the `voices:speaker` frontmatter tag. §4.
4. **A quote is a card until it earns a page.** §5. This is the rule that keeps
   the vertical out of thin-content territory, so do not relax it quietly.
5. **The content plan is too narrow and it is the top open item.** 10 of 12
   speakers are architects; 8 of 11 claims are craft aphorisms. The references
   run policy, capital, earnings and outlook. See §5b before commissioning
   anything.
6. **Nothing here is a new component if an existing one fits.** The finder, the
   article block catalog, the rails, the nav and the newsletter are all reused
   verbatim. The only new CSS is the claim-led card family. §7.

---

## 1. URL scheme

| URL | Renders | Notes |
|---|---|---|
| `/voices` | `voices.html` | Landing, "All" pill active |
| `/voices/conversations` | `voices.html` | Filtered view, pill active |
| `/voices/perspectives` | `voices.html` | Filtered view |
| `/voices/quotes` | `voices.html` | Filtered view |
| `/voices/speakers` | `voices.html` | Person-indexed view |
| `/voices/search` | `voices-search.html` | Browse / SRP |
| `/voices/{series-slug}` | `voices.html` | Landing filtered by franchise |
| `/voices/{slug}` | `voices-article.html` | One piece |
| `/voices/contribute`, `/voices/nominate` | `voices-search.html` | **Placeholders.** Intake forms not built. |

The four view URLs are the **content model**, not topics. They exist as separate
URLs today so the demo is clickable; when the backend takes over they collapse
into one route with a `view` param:

```php
Route::get('/voices/{slug?}', function ($slug = null) {
    $views  = ['conversations','perspectives','quotes','speakers'];
    $series = ['developer-dialogues','market-leaders','expert-opinion','design-conversations',
               'founder-conversations','broker-voices','investor-voices'];
    if ($slug === null)              return view('voices-landing');
    if (in_array($slug, $views))     return view('voices-landing', ['view'   => $slug]);
    if (in_array($slug, $series))    return view('voices-landing', ['series' => $slug]);
    return view('voices-piece', ['slug' => $slug]);   // else: one piece
});
```

Static config lives in two places that **must stay in sync**: the `rewrites`
array in [`vercel.json`](../vercel.json) and the `REWRITES` map plus
`VOICES_SERIES_SLUGS` set in [`serve.mjs`](../serve.mjs).

**A `/voices/:slug` catch-all is safe here**, unlike `/brands/:slug` and
`/people/:slug` where it is deliberately absent. Those templates render a
specific tenant's real team and credentials, so a fallback would put one
company's people under another company's URL. A Voices piece is generic
editorial, so an unbuilt slug renders a demo article and nothing is
misattributed.

---

## 2. Why Voices is not under the blog

This was researched against two live competitors before being decided.

**ET Realty** runs three namespaces: `/news/{cat}/{slug}/{id}` for
journalist-written interviews, `/blog/{slug}/{id}` for guest opinion where the
industry figure holds the byline, and `/leaders-speak` as a person-indexed view
over both. The news/blog split is inherited Times Internet platform debt, not a
design decision, and their own Leaders Speak page has to reconcile it.

**We have no legacy blog namespace forcing the same split**, and four reasons
not to invent one:

1. The IA already shipped Voices as a peer of the blog. Off-canvas "Read &
   Watch" lists Editorial, Intelligence, Design, Industry Voices, Videos and
   Building India as siblings; the footer and homepage `vc4` section both link
   `/voices`; three `/design` pages cross-link `/voices?topic=…`.
2. The organising key is a **person**, not a topic. A blog is organised by
   subject matter. A URL can really only express one axis, and ours is the
   speaker.
3. Two roots halve the topical authority we are trying to build on "what
   credible people think about Indian real estate".
4. We would inherit their reconciliation problem for no benefit.

**What we did take from ET** is the idea underneath their split, which is
correct: one template, and the byline identity is what varies. See §3.

---

## 3. Content model, one template, two byline models

| Type | Eyebrow | `.art-byline` | `.art-speaker-strip` | Body |
|---|---|---|---|---|
| **Conversation** | `{Series} · Interview` | Ghar.tv journalist | the subject | `.art-qa` pairs |
| **Perspective** | `{Series} · Op-ed` | **the speaker** | omitted (byline already names them) | prose |
| **Quote** | `{Series} · Quote` | Ghar.tv editorial | the source | quote as `.art-pullquote--byline`, then our response |

Conflating the two identities is the specific failure mode to avoid. The Realty
Today's `/news/expert-opinion/` is a category named after a person-type whose
articles are all bylined "TRT Editorial", an expert opinion section with no
expert in it. If a Voices card ever ships without the speaker on it, we have
built the same thing.

**Format is an attribute, not a template.** A response can be text, video
(`.art-video`) or audio (`.art-audio`). All three render through
`voices-article.html`. Do not fork the page for a video piece.

`.art-qa` was already specced as "Interview format (Industry Voices default)" in
`DESIGN-ARTICLE-HANDOFF.md` §5 before this vertical existed. It is the default
body block for Conversations.

---

## 4. Frontmatter and the Speakers index

Phase 1 (today) puts frontmatter in the piece's `<head>` as `<meta>` tags,
same staging path the design vertical used:

```html
<meta name="voices:type"         content="conversation">   <!-- conversation | perspective | quote -->
<meta name="voices:series"       content="design-conversations">
<meta name="voices:speaker"      content="sonali-rastogi"> <!-- load-bearing, see below -->
<meta name="voices:speaker-org"  content="morphogenesis">
<meta name="voices:tags"         content="sustainability,climate-design,procurement">
<meta name="voices:city"         content="delhi-ncr">
```

`voices:speaker` is the load-bearing one. **The Speakers index is a
`GROUP BY speaker` over the article store, not a hand-maintained list.** That is
the one piece of ET Realty's architecture worth copying wholesale: they tag
person and company as first-class entities on every article, which is what makes
their person-indexed view generate itself.

Person and practice also appear as first-class entries in the piece's `.art-tags`
row, linking to `/people/{slug}` and `/brands/{slug}`.

**Phase 2 trigger: 30+ pieces.** Promote frontmatter to `docs/voices-pieces.json`.
Cards keep their shape; only the data source flips. Do not skip straight to a
CMS, the manifest is what proves the schema before the DB migration.

### Where our Speakers index beats theirs

Three things ET Realty's Leaders Speak gets wrong, all of which the markup here
prevents:

1. **It never shows the quote.** Each entry says "Mentioned in" plus a headline.
   The reader never learns what the person said without clicking. `.vx-sp__claim`
   is not optional.
2. **Most portraits are missing** and render as a grey default silhouette. Per
   [[feedback_no_person_without_portrait]], a speaker without a real portrait is
   **not listed at all**. Hide the entry, do not substitute a placeholder.
3. **The name links to an article**, because they have no person pages. Every
   name here resolves to `/people/{slug}`.

---

## 5. Quotes, the curated layer

The cold-start layer, and the only one that can be populated without booking an
interview. Three fields are non-negotiable and the markup enforces all three:

| Field | Class | Rule |
|---|---|---|
| Verbatim sentence | `.vx-quote__text` | Never paraphrase inside quote marks |
| Editorial framing | `.vx-quote__why` | One line on why it matters. **Never optional** |
| Source receipt | `.vx-source` | Platform + date + live outbound link |

Drop any of the three and the surface stops being intelligence and becomes a
social-media wall.

### Hero quote length, cap at 170 characters

The hero pull quote is capped at **170 characters**. This is an editorial rule,
not a code one, and it is deliberately not enforced by truncation: cutting a
sentence short misrepresents what a named person said, which is the one thing
this vertical cannot do.

The hero sizes itself from a `data-len` tier on `.vx-hero__bubble`, which the
template should emit and an inline fallback in `voices.html` recomputes from the
text. Within the cap the layout gives a longer statement **more width**, not
smaller type, so length never costs the piece its presence:

| Tier | Characters | Box | Type at 1440 |
|---|---|---|---|
| `s` | ≤80 | 620px | 34px |
| (base) | 81-140 | 720px | 27px |
| `l` | 141-210 | 860px | 27px |
| `xl` | >210 | 860px | 21px, **safety net** |

`xl` is the only tier that still trades size for height, and past the 170-char
cap it should never be reached in the hero. The fallback script logs a console
warning when it is, so an over-long quote surfaces in dev rather than quietly
rendering small. **The fix is always editorial**: pick a tighter pull quote, or
trim at a sentence boundary. The full statement lives on the piece itself.

Below 744px the box is already full width, so the lever there is alignment
instead: anything above the `s` tier sets left rather than centred. Centred
setting works for two or three lines and turns into a slab at five.

### Quote permalink rule

**A quote is a card until it earns a page.** It gets its own `/voices/{slug}`
only once it has editorial framing **and** a response piece attached. Below that
bar it lives as a card on `/voices` and in browse, with no URL of its own.

Two reasons: a wall of one-sentence URLs is thin content at scale and reads as
scraping to both readers and search; and the line between aggregation and
intelligence is exactly the editorial framing, so that is the right place to draw
the URL boundary. Same shape as [[project_design_tag_graduation_rule]], applied
to quotes instead of tags.

### Curation policy, NOT YET WRITTEN

Quoting public figures with attribution and a live source link is standard press
practice, but at volume it needs written rules. **`docs/VOICES-curation-policy.md`
does not exist yet and should be written before the first real quote ships.** It
needs to cover: quote-length cap, source always linked and never screenshotted,
no paraphrase presented inside quote marks, date-spotted always shown, and a
stated correction and takedown path.

---

## 5b. CONTENT GAP: Voices is currently too narrow

**Flagged 2026-08-10. This is an editorial problem, not a template problem, and
it is the most important open item in this doc.**

Audit of the demo content as built: **10 of 12 speakers are architects or
interior designers**, and **8 of 11 claims are craft or design aphorisms**
("craft survives when it has a job", "a house should be quieter than the life
inside it"). Voices currently reads as an architecture quote wall.

That is not what the reference publications are. What they actually run:

| Content type | ET Realty / The Realty Today | Voices today |
|---|---|---|
| Policy and regulation | Budget reactions, RERA, IBC avoidance transactions, ULCRA repeal, PMAY, housing pension | Almost none |
| Capital and funding | NCD raises, REIT capex, IPO governance, mortgage financing, evolving funding landscape | None |
| Company strategy with numbers | "targets ₹3,750-4,000 crore pre-sales in FY27", "₹15,000 crore Ahmedabad investment", "portfolio may grow over 50%" | None |
| Earnings-linked commentary | The main engine of Leaders Speak: results drop, the leader is quoted | None |
| Market outlook by city or segment | "expects Pune to overtake Chennai", senior living, mid-segment shift | One |
| Craft, material, design philosophy | A minor beat, mostly in DesignScape | **Almost everything** |

### What has to change

1. **Speaker mix is the root cause.** The roster followed the portrait bank,
   and the portrait bank is design-heavy. Voices needs developer CMDs, REIT
   heads, NAREDCO/CREDAI office holders, housing-finance and NBFC leaders,
   RERA and housing-board officials, consultants (Anarock/CBRE/JLL class) and
   economists. Portrait sourcing per `PEOPLE-portrait-sourcing.md` must target
   the **business** side first. Right now it is the binding constraint on the
   whole vertical, not just on which series can launch.

2. **The type taxonomy is about provenance, not subject.** Conversation /
   Perspective / Quote answers "who holds the pen". It does not answer "what
   kind of thing is this". Add a second axis:

   | Type | What it is | Cadence |
   |---|---|---|
   | Reaction | Short, fast, tied to an event: Budget, RBI, a policy notification, results | High volume, same-day |
   | Outlook | Numbers-led forward statement about a company, city or segment | Weekly |
   | Analysis | "What this regulation actually means" | Weekly |
   | Conversation | The long interview | Fortnightly |
   | Position | The craft/philosophy piece we currently do exclusively | Occasional |

   **Reaction is the missing volume engine.** It is cheap, timely, and it is
   what makes an opinion surface feel current rather than curated-precious.
   The Budget and RBI calendar should be a planned content trigger.

3. **Beats, not just speaker-type series.** The four launch series
   (Developer Dialogues, Market Leaders, Expert Opinion, Design Conversations)
   are speaker buckets. The references organise by beat: Regulatory,
   Residential, Commercial, Housing Finance, Infrastructure, Materials. Voices
   needs beats as the browse axis, with the series kept as editorial franchises
   on top. The browse-page TOPIC facet is the right home for beats and is
   currently underpopulated.

4. **Newsroom ingest.** In Leaders Speak a person surfaces because news happened
   about them, not only because we booked an interview. Voices should pull
   quotable statements out of results calls, policy consultations and conference
   stages, not just commission them. Without this the vertical is limited to
   what the editorial team can personally produce.

**None of this changes the templates.** The piece template already renders
Reaction and Analysis (short prose, stat strip, editor's note), the card family
already handles a numbers-led claim, and the browse facets already have a TOPIC
dimension waiting to be filled. This is a commissioning and sourcing brief.

---

## 6. Series

Four launch. Three are held as tags.

| Series | Slug | Status |
|---|---|---|
| Developer Dialogues | `developer-dialogues` | Launch |
| Market Leaders | `market-leaders` | Launch |
| Expert Opinion | `expert-opinion` | Launch |
| Design Conversations | `design-conversations` | Launch |
| Founder Conversations | `founder-conversations` | Tag |
| Broker Voices | `broker-voices` | Tag |
| Investor Voices | `investor-voices` | Tag |

A tag graduates to a series on evidence, not intent: **10+ pieces AND editorial
commitment**, the same bar as the design vertical's tag graduation. Seven
near-empty franchises reads as ambition; four with content reads as authority.

**Why these four, and the constraint behind it.** `brand_assets/people/` holds 12
real named portraits. Eight are architects and designers, one is a developer
(Abhishek Lodha), one is an academic (Darshini Mahadevia), two are TEEARCH. So
Design Conversations is currently the only series that can be filled with real
faces, and Developer Dialogues / Market Leaders / Investor Voices are
portrait-blocked. **Portrait sourcing per `PEOPLE-portrait-sourcing.md` is a
hard dependency on expanding the series list**, because of the no-portrait rule
in §4.

---

## 7. What is reused (Reuse-First Protocol)

| Need | Reused from | Notes |
|---|---|---|
| Nav, bottom bar, off-canvas, sign-in, search modal, footer | `partials/` | Verified byte-identical by `npm run build:partials` |
| Vertical subnav | `.subnav` / `.subnav-link` | Voices vocabulary, same chassis. Needs `design-listing.css` linked, that is where `.subnav-inner` layout lives |
| Series tab row | `.dp-subnav` | Verbatim |
| Section heads | `.dp-strip__head` | Verbatim |
| Rails | `.rail-outer` / `.rail` + `initCarousel` + `.dc-paginator` | Verbatim |
| Sponsored slot | `.dp-adslot` | Verbatim, follows [[project_pillar_ad_banner_recipe]] |
| Brand Connect CTA | `.dp-partner` | Verbatim, Voices copy |
| Buttons | `.btn` / `.btn-accent` / `.btn-primary` / `.btn-link` | `--accent` (solid ink) for the lede's one primary action, outline for section CTAs |
| **Entire browse finder** | `.br-search-wrap`, `.br-pill`, `.br-cdd`, `.brs-fmodal`, `.brs-toolbar`, `.brs-empty` + their JS | Machinery verbatim; only the data layer swapped, see §8 |
| **Entire article block catalog** | all `art-*` | Including `.art-qa`, `.art-pullquote--byline`, `.art-brand-callout`, `.art-note`, `.art-stat-strip`, auto-TOC, progress bar, PhotoSwipe |
| Newsletter | `.subscribe` | Chassis reused, copy swapped, see §9 |

**New CSS is the `.vx-*` card family only**, promoted to `styles.css` (search
`VOICES CHASSIS`) once the browse page became a second consumer, per the
promotion rule in `DESIGN-PILLAR-HANDOFF.md` §5. Do not re-stamp those rules
inline on a new Voices page.

### Two rules inside the chassis that are easy to undo by accident

**Voices cards carry no image.** `.vx-card` is claim first, then a hairline,
then a small speaker credit. There is no `.vx-card__media` and reintroducing one
is a regression. The first cut had a 4:3 portrait on top, which put the same face
on the card twice (media plus credit row) and made the card about the person. The
card is about the claim; the person gains standing because the claim is
worth reading. If a piece has real scene photography rather than a head shot,
that belongs inside the piece, not on the card. The same rule applies to the
article page's downstream sections, which use `.vx-card` rather than the
design-article `.art-card`.

**The hero is full viewport, and it answers five questions in order.**
`.vx-hero` is `min-height: 100svh` minus the nav stack, minus the 64px bottom
bar on mobile. `svh` not `vh` so the mobile URL bar cannot push content
off-screen, and `min-height` not `height` so it still grows if a claim runs long
on a narrow phone.

| # | The reader asks | The hero answers with |
|---|---|---|
| 1 | What is this section? | the `h1` proposition line |
| 2 | Is it worth my time? | the featured claim, and who holds it |
| 3 | Can I trust it? | the source line |
| 4 | How long will it take? | format + read time |
| 5 | What can I do now? | one CTA |

An earlier cut answered only (5): a bare quote with no framing, and the page
carried no `h1` at all, so neither a first-time visitor nor a crawler was told
what Voices is.

`{HERO}` is a **single object**, not a list: claim, speaker (name, role,
portrait), series (label + href), source line, format, readTime, and one CTA
(label + href). The CTA label varies by piece type: "Read the conversation" for
an interview, "Read the perspective" for an op-ed, "Read the response" for a
quote we answered. The `h1` is per-vertical and static.

**Exactly two interactive targets**: the series pill and the read CTA. Hold that
line. An earlier cut had nine and read as cramped, with nowhere for the eye to
settle. What was removed and why:

| Removed | Why |
|---|---|
| Scroll anchor | The page obviously scrolls; a cue is decoration |
| Roster column + swap script | Duplicated the "The speakers" section on the same page, and added five more targets |
| Link on the speaker | `/people` is reachable from The speakers; the hero should not offer two competing destinations |
| Separate "View source" link | A second action competing with the read CTA. The source still shows as text, which is the point |
| Stats line ("10 voices, 4 series") | Decoration, not information the reader needs here |
| Solid-ink speech bubble | Right at card scale on the homepage where it supplies mass; at full-viewport scale it becomes a slab across a third of the screen and reads as a testimonial |

**Two layout rules that are easy to break.**

`padding-block: 0` on `.vx-hero` is load-bearing. `main > section` in styles.css
applies `padding-block: var(--pad-v)` (80-120px); left in place it pushes the
content low, opens a dead band at the foot, and inflates the block past the
viewport so it can never fit. `.dp-filterstrip` carries the same override for the
same reason.

`.vx-hero__inner` is `max-width:900px; margin-inline:auto`, so the hairlines span
the measure rather than the container. Flush-left content inside the full 1600
container left the right third empty while the rules ran full width, and read as
one-side-heavy. Centring the measure fixes the balance; the type stays
left-aligned inside it so it reads editorial rather than as a centred
testimonial.

---

## 8. Browse page, what differs from `/brands/search`

The finder machinery is identical. Only the data layer is swapped, and the
variable names deliberately keep the chassis identifiers (`PARENTS`, `CITIES`,
`brandIndex`) so future diffs against `brands-search.html` stay readable.

| Chassis var | On `/brands/search` | On `/voices/search` |
|---|---|---|
| `PARENTS` | Categories | The 4 launch series |
| `PARENT_SUBS` | Sub-categories | Topics inside each series |
| `CITIES` | Cities | **Speakers** (the person index) |
| `brandIndex` | Built from `.brand-card` | Built from `.vx-card` / `.vx-quote` |

Three behavioural differences worth knowing:

- **No `gharCityMatch()` on the second facet.** The brands page routes city
  through the shared matcher because a metro also matches its satellites and
  multi-city brands match everywhere. A piece has exactly one speaker, so this
  is a straight comparison against `data-speaker`. Reaching for `gharCityMatch`
  here would be a category error. City *is* still a Voices facet, but it lives
  in the filter modal and describes where the speaker is based.
- **The search haystack includes the claim text**, so a reader can search the
  topic ("procurement", "climate") and not only a name.
- **`.is-filtered-out` needed a Voices selector.** The chassis rule is
  `.brand-card.is-filtered-out{display:none}`, class-scoped, so it does not reach
  `.vx-card` / `.vx-quote`. Same class name, our selectors, in the page's style
  block.

Cards carry `data-format`, `data-series` and `data-speaker` for the programmer to
filter on. **`?topic=…` links already ship from `design.html` and
`design-architecture.html` and must map onto the TOPIC facet.**

Results are **pieces, not people**. A person-result mode would collide with
`/people`, which is already the directory.

**On day-one density:** the archive is small and most facets return few rows.
The surface is built at full fidelity so facets light up as content lands. Do not
strip the filter drawer because it looks over-specified against 9 demo cards.

---

## 9. Known follow-ups

1. **`partials/subscribe.html` hardcodes Design copy** ("Ghar.tv Design",
   "Architecture worth visiting…"). All three Voices pages therefore carry an
   un-markered copy of the same `.subscribe` chassis with Voices copy, and
   `build-partials.mjs` logs `no subscribe marker pair, skipping` for them.
   **That warning is expected, not a bug.** Fix properly by parameterising
   eyebrow/title/dek in the partial, then bring all three back under the marker
   pair.
2. **`docs/VOICES-curation-policy.md` is unwritten.** Blocking for the first real
   curated quote. See §5.
3. **Contribution intake is not built.** `/voices/contribute` and
   `/voices/nominate` park on the browse page so the landing CTAs do not 404.
   These are the supply side of the vertical and matter more than they look:
   ET Realty recruits its opinion content rather than commissioning it, which is
   how that section stays fed. A vertical launching with no archive needs the
   intake more, not less.
4. **Portrait sourcing gates the series list.** See §6.
5. **All demo quotes are placeholder copy on real named people.** Every one is
   tagged with a `PLACEHOLDER-QUOTE` HTML comment. `grep -rn "PLACEHOLDER-QUOTE"
   voices*.html` finds all of them. **Every single one must be replaced with a
   verifiable sourced statement, or removed, before this ships.** Attributing an
   invented sentence to a named living person is the one failure this vertical
   cannot survive.
6. **Homepage `vc4` section still uses its own `.vc4-*` classes.** It predates
   this chassis. Worth reconciling onto `.vx-card` so the homepage teaser and the
   vertical read as one system.

---

## 10. Local dev

```bash
node serve.mjs            # http://localhost:3000/voices
npm run build:partials    # after editing any partial
npm run build:styles      # after editing the VOICES CHASSIS block in styles.css
```

Bump the `?v=` on the `dist/styles.min.css` link after a styles rebuild. The
Voices pages are currently on `?v=21`.

---

## 11. Reference

- Memory: [[project_voices_context]], [[feedback_voices_design]],
  [[feedback_voices_md_source_of_truth]], [[feedback_no_person_without_portrait]],
  [[feedback_reuse_first_protocol]], [[feedback_shared_chrome_byte_identical]],
  [[project_design_tag_graduation_rule]], [[feedback_no_ad_gate_before_editorial]],
  [[feedback_no_section_level_sponsorship]]
- Voice and copy: [`voices.md`](../voices.md) at project root, single source of
  truth. Note the name collision: that file is the site-wide **voice guide**, not
  documentation for this vertical.
- Catalog: [design-system.html#voices-chassis](../_dev/reference/design-system.html#voices-chassis)
