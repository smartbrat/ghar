# GharTalks: Backend Handoff

> The video authority layer at `/ghartalks`. Four templates, one episode
> store, one episode page. This doc is the contract: URL scheme, content
> model, template hooks, what is reused, and the editorial rules the code has
> to enforce.

**Live templates**
- Landing: [`ghartalks.html`](../ghartalks.html) → `/ghartalks`
- Beat + guest index: [`ghartalks-category.html`](../ghartalks-category.html) → `/ghartalks/{beat}`, `/ghartalks/guests`
- Browse / SRP: [`ghartalks-search.html`](../ghartalks-search.html) → `/ghartalks/search`
- Episode: [`ghartalks-article.html`](../ghartalks-article.html) → `/ghartalks/{slug}`

**Catalog entry:** [design-system.html#ghartalks-chassis](../_dev/reference/design-system.html#ghartalks-chassis)
**Siblings:** [`VOICES-HANDOFF.md`](VOICES-HANDOFF.md) · [`DESIGN-ARTICLE-HANDOFF.md`](DESIGN-ARTICLE-HANDOFF.md) · [`SEARCH-HANDOFF.md`](SEARCH-HANDOFF.md)

---

## 0. TL;DR for the busy dev

1. **One episode store.** Everything lives at `/ghartalks/{slug}`. The episode
   page is a video hero plus a full written piece, not an embed with a
   caption. §3.
2. **One destination per card.** Every listing surface navigates to the
   episode page; playback happens only in the episode page's own hero. The
   shared handler enforces this, so you cannot break it by accident. §4.
3. **The L2 axis is BEATS, not formats.** Format never varies here. §2.
4. **A tag is a filter, not a page**, until it graduates on the /design bar.
   Tag views are `NOINDEX,FOLLOW`. §6.
5. **Four files, not seven.** The beat views and the guest index share one
   template that resolves the view from the path. §1.
6. **Nothing here is a new component if an existing one fits.** The finder,
   the article block catalog, the rails, the nav, the newsletter,
   `.vx-speaker` and `.vx-sp` are all reused verbatim. The only new CSS is
   the video-led card family plus the chapter block. §7.
7. **The written layer is machine-drafted and the page says so.** §9.

---

## 1. URL scheme

| URL | Renders | Notes |
|---|---|---|
| `/ghartalks` | `ghartalks.html` | Landing, "All" pill active |
| `/ghartalks/developers` | `ghartalks-category.html` | Beat view |
| `/ghartalks/market` | `ghartalks-category.html` | Beat view |
| `/ghartalks/design` | `ghartalks-category.html` | Beat view. Catches the `?category=design` and `?category=architecture` links already shipping from four /design pages |
| `/ghartalks/materials` | `ghartalks-category.html` | Beat view |
| `/ghartalks/guests` | `ghartalks-category.html` | Person index (guest-index mode) |
| `/ghartalks/{beat}?tag={slug}` | `ghartalks-category.html` | Filtered beat. **NOINDEX,FOLLOW** |
| `/ghartalks/search` | `ghartalks-search.html` | Browse / SRP. Also accepts `?tag=` |
| `/ghartalks/{slug}` | `ghartalks-article.html` | One episode |
| `/ghartalks/pitch`, `/ghartalks/nominate` | `ghartalks-search.html` | **Placeholders.** Intake forms not built |

### Why one category template and not six files

`/voices` shipped a separate ~260KB HTML file per view, and
[`VOICES-HANDOFF.md`](VOICES-HANDOFF.md) §1 already concedes those files
collapse into a single route with a `view` param once a backend exists. The
views differ by a title, a dek, and which cards survive a filter. Six copies
of the same chrome is six places for the nav to drift and six files to touch
for one card change.

Built as one template from the start there is nothing to collapse later. The
static page renders the **Developers** beat, which is the no-JS and
first-paint default; an inline resolver at the foot of `<main>` reads the beat
off `location.pathname` and the tag off `?tag=`, then relabels the hero and
filters the grid.

```php
Route::get('/ghartalks/{slug?}', function ($slug = null) {
    $beats = ['developers','market','design','materials'];
    if ($slug === null)               return view('ghartalks-landing');
    if ($slug === 'search')           return view('ghartalks-search');
    if ($slug === 'guests')           return view('ghartalks-beat', ['view' => 'guests']);
    if (in_array($slug, $beats))      return view('ghartalks-beat', ['beat' => $slug]);
    return view('ghartalks-episode', ['slug' => $slug]);   // else: one episode
});
```

**When the backend renders the filtered set directly, delete the resolver
block and keep the markup.** Not one class or data attribute has to change.
That is why filtering is done with a class rather than by removing nodes.

Static config lives in two places that **must stay in sync**: the `rewrites`
array in [`vercel.json`](../vercel.json) and the `REWRITES` map plus
`GHARTALKS_VIEW_SLUGS` set in [`serve.mjs`](../serve.mjs). **Order matters in
`vercel.json`:** the five named beat routes must precede `/ghartalks/:slug` or
the catch-all swallows them.

**A `/ghartalks/:slug` catch-all is safe**, for the same reason it is safe on
`/voices` and deliberately absent on `/brands` and `/people`: an episode page
is generic editorial, so an unbuilt slug renders the demo episode and nothing
is misattributed to a real company or person.

It also **had** to be a catch-all. Roughly 25 `/ghartalks/{slug}` links were
already shipping across the portal from brand profiles, `/design` and
`/voices` before this vertical existed, and every one of them 404'd. All 40
inbound `/ghartalks*` links now resolve.

---

## 2. Beats, not formats

The L2 subnav is the **subject** axis: `All · Developers · Market · Design ·
Materials · Guests`.

On `/voices` the L2 answers "who is holding the pen" (Conversations /
Perspectives / Quotes), because provenance genuinely varies there. **Here the
format never varies** — every item is a recorded conversation — so a format
axis would be a row of pills that all mean the same thing.

[`VOICES-HANDOFF.md`](VOICES-HANDOFF.md) §5b is the receipt for choosing
subject instead: it flags the speaker-type series as the wrong browse axis and
names beats as the fix. **GharTalks starts where Voices had to correct to.**

| Beat | Slug | What it covers |
|---|---|---|
| Developers | `developers` | Founders and CEOs: land, delivery, capital, townships |
| Market | `market` | Analysts and economists: supply, absorption, outlook |
| Design | `design` | Architects and studios: climate, craft, practice |
| Materials | `materials` | Brands and workshops: specification, manufacturing |
| Guests | `guests` | The person index (a view, not a beat) |

Unlike the Voices series list, **nothing is held back**. A beat is a subject
the archive already covers, not a franchise that has to be commissioned into
existence. Growth happens in the tag layer instead (§6).

---

## 3. The episode page, and why there is writing under the video

`.art-hero-figure` (a photograph) is replaced by `.art-video-hero` (the
recording). **That one swap is the vertical.** Everything else in the hero —
eyebrow, title, deck, byline, speaker strip — is the `art-*` chassis verbatim,
and so is the whole body block catalog.

A 13-minute recording is not skimmable, not quotable, not searchable and
cannot be linked to a specific claim. The write-up is what makes an episode a
**citable object** instead of a YouTube URL. Both halves are load-bearing; a
page with only the embed is not this template.

### Two navigation systems, deliberately not merged

| Block | Indexes | Behaviour |
|---|---|---|
| `.art-toc` | the WRITING | auto-built from H2s, hides under 3 |
| `.gtk-chapters` | the RECORDING | timestamps that seek the hero player |

They describe different objects. Collapsing them into one list leaves one half
of the page unnavigable.

Chapter rows are `<button>`, not `<a>`: a chapter has no URL of its own, it is
a position in a player already on the page, and an `<a href="#t=...">` would
push a meaningless fragment into history on every click.

**`{CHAPTERS[]}` drives two things and they must be regenerated together:** the
on-page block, and the `VideoObject.hasPart` array in the page's JSON-LD. If
they drift, search shows key moments that jump to the wrong place.

### Schema: two objects, both required

`VideoObject` makes the episode eligible for a video result and a key-moments
carousel. `NewsArticle` describes the write-up, which is a different work with
a different author from the recording. Emitting only one either hides the
video from video search or leaves the written piece unattributed.

`og:type` is `video.other` and `og:image` is the **video still**, not a
portrait: a share card that does not look like a video under-sells the one
thing this page has.

---

## 4. One destination per card

**A card's play glyph is an affordance, not a second action.**

Every listing surface navigates to `/ghartalks/{slug}`. Playback happens in
exactly one place: the episode page's own hero.

This is enforced by the shared handler in [`main.js`](../main.js) (search
`YOUTUBE FAÇADE`), not by markup discipline:

- a façade **inside** an `<a href>` declines to mount → the card navigates
- a façade **outside** one mounts an iframe in place → the episode plays

Two targets on one card (play here / read there) was the obvious first cut and
it is wrong: the reader cannot tell which half of the card they are clicking,
and the written context is the whole reason the episode page exists.

**No text CTA on any card.** There is no "Watch and read" row on the hero or on any episode card. The play glyph and the duration chip already state the action and its cost, and the whole card is one anchor, so the text row restated the card’s only action in words. This departs from [[feedback_whole_card_link]] on purpose: that rule keeps an inner cue on cards whose clickability is not otherwise signalled, and a video card carries a play button. Do not reintroduce it.

**No iframe is created until a click, anywhere.** An embedded YouTube player
costs roughly a megabyte and a few hundred milliseconds of main-thread work
per instance. Listing pages carry stills only. The embed host is
`youtube-nocookie.com`, which defers YouTube's tracking cookies until playback
actually starts.

### The handler also fixes an older bug

`.art-video__frame[data-video-id]` shipped in `design-article.html` with the
comment *"the click handler swaps the facade for an iframe"* and **no such
handler anywhere in the repo**. That block had been inert since it was built.
The shared handler covers both markup families, so it is fixed and a third
copy will not get written.

---

## 5. Frontmatter and the Guests index

Phase 1 (today) puts frontmatter in the episode's `<head>` as `<meta>` tags,
the same staging path the design and voices verticals used:

```html
<meta name="ghartalks:video"     content="m0us2RQGskA">   <!-- load-bearing -->
<meta name="ghartalks:beat"      content="market">
<meta name="ghartalks:guest"     content="pankaj-kapoor"> <!-- load-bearing -->
<meta name="ghartalks:guest-org" content="liases-foras">
<meta name="ghartalks:tags"      content="supply,pricing,city-outlook">
<meta name="ghartalks:city"      content="mumbai">
<meta name="ghartalks:duration"  content="PT12M52S">
```

**`ghartalks:guest`** — the Guests index is a `GROUP BY guest` over the episode
store, not a hand-maintained list. Same query the Voices Speakers view runs.

**`ghartalks:video`** — unique to this vertical and the second load-bearing
field. It is the join key between our page and the recording, and everything
video-shaped reads it: the still URL, the player, the `VideoObject`, and the
"already published" check that stops one YouTube ID being written up twice
under two slugs.

**Phase 2 trigger: 30+ episodes.** Promote frontmatter to
`docs/ghartalks-episodes.json`. Cards keep their shape; only the data source
flips.

### Portraits: two different rules on two different surfaces

This vertical needs a distinction `/voices` never had, because a GharTalks
episode is legitimately sometimes with a **company** rather than a named
person.

| Surface | Rule |
|---|---|
| Episode card (guest is a credential) | Real portrait if we have one. Company → `.gtk-mono` initial. **Named person with no portrait → text-only credential**, never a monogram, never a silhouette |
| Guests index (a directory) | Strict [[feedback_no_person_without_portrait]]: no real portrait, not listed. Add `is-no-portrait`, hide, do not delete the taxonomy. **Companies never appear here at all** |

A company monogram is not a portrait workaround — there is no person to
photograph. A named person's monogram would be, which is why it is not
available.

The hero on `/ghartalks` currently uses a text-only credential for Pankaj
Kapoor. The first cut cropped the YouTube still into the portrait circle; at
that size it reads *as* a portrait and is not one. Restore an `<img>` the day
a real headshot is sourced per
[`PEOPLE-portrait-sourcing.md`](PEOPLE-portrait-sourcing.md).

---

## 6. The tag layer

**A tag is a FILTER, not a page.** It resolves to
`/ghartalks/{beat}?tag={slug}` and renders through the beat template, which
reads the param and narrows its own grid.

A tag earns a URL of its own on the same bar the design vertical uses
([[project_design_tag_graduation_rule]]): **10+ episodes AND** either a brand
partner or a standing editorial commitment. Nothing has graduated yet. When
one does, its chip's `href` changes from `?tag=` to a flat `/ghartalks/{tag}`
and nothing else moves.

Why the bar matters here specifically: **video is expensive to make**, so the
archive grows slowly, and a tag namespace that outruns the archive produces
exactly the thin-page sprawl that rule exists to prevent.

**Tag views are `NOINDEX,FOLLOW`**, set by the resolver. A filtered slice of a
beat indexed separately would have the archive competing with itself for the
same episodes.

### Where the tag layer is visible

1. The **Topics** block on `/ghartalks` — `.dp-chip` strip, the browse surface
2. The **active-filter pill** on a beat page when `?tag=` is present
3. The **tag row** at the foot of every episode
4. The **sub facet** in the browse finder

Note there is **no chip strip on the beat page itself**, per
[[feedback_no_chip_strip_on_collection_pages]]: a chip row belongs on a broad
pillar with 30+ items across 6+ tag axes. A beat page is already narrow — that
is what makes it a beat — and scope is carried by the breadcrumb, the subnav
and the hero title. The active-filter pill is not browse chrome; it is the
page saying what it did to the set, with the way out.

---

## 6b. The landing's layout, and why it is shaped this way

Rebuilt 2026-09-09. The first cut was an editorial magazine layout with a
video in it — one featured card, one uniform grid, then text cards. Every
item the same weight, nothing bleeding past the edge, no reason for the eye
to move.

The brief was to make it feel like a video destination. What was taken from
the reference platforms is **not** their colour and **not** their layout
copied across — our archive is a handful of named industry conversations,
not a catalogue of thousands, and a grid built for thousands looks empty
holding six. Three things transfer:

1. **Not every item is equal.** Hero → rail → browse tiles → people.
2. **Different content types look different.** Three deliberately different
   proportions down the page, so each block says what it holds before a
   word is read:

   | Block | Ratio | Because |
   |---|---|---|
   | Episodes | 16:9 | a screen |
   | Beats | 1:1 | a label, a way in |
   | Guests | 3:4 | a person |

3. **It bleeds.** The rail runs off the right edge so the last card is cut
   rather than completed. This matters MORE with a small archive, not less:
   six items in a rail read as the front of a library, six in a 3-up grid
   read as a hole in row two.

**Beat tiles are typographic, not photographic**, and that is an honesty
constraint. A representative still would have to come from a real episode
in that beat, and Materials has none yet — so three tiles would carry a
photograph and the fourth a stand-in. A colour tile is true at any archive
size.

**Beat tile colour: reference the token, never a hex.** The tiles use
`var(--terracotta)`, `var(--indigo)`, `var(--sand)`, `var(--sage)`, one
each, rotated by meaning. Turmeric is reserved for the format block, which
is the page's own voice rather than a category. The first cut hardcoded
five hexes copied out of a memory file and every one was stale — see §10.

**Text colour is per tile.** The live Theme Colors are saturated, not
pastel: terracotta and indigo sit near 0.2 relative luminance and need
white type; sand and sage keep the ink. The tile's beat name is large text
and clears AA-large on all four. The 12.5px dek was REMOVED rather than
restyled, because small text needs 4.5:1 and white on terracotta reaches
only 3.75 — the beat page carries the description instead.

**Watch, then read** is the one block with no equivalent on any video
platform, and it exists because the written half is the differentiator. It
shows a worked example rather than making a claim, and it points at the
Mumbai slug deliberately — the one episode whose article page is actually
built, so the link lands on the piece the excerpt quotes.

## 7. What is reused (Reuse-First Protocol)

| Need | Reused from | Notes |
|---|---|---|
| Nav, bottom bar, off-canvas, sign-in, search modal, footer | `partials/` | Verified byte-identical by `npm run build:partials` |
| Vertical subnav | `.subnav` / `.subnav-link` | GharTalks vocabulary, same chassis. Needs `design-listing.css` linked |
| Beat page hero | `.dp-hero` | Verbatim |
| Section heads | `.dp-strip__head` | Verbatim |
| Tag chips | `.dp-chip` / `.dp-filterstrip` | Verbatim |
| Rails | `.rail-outer` / `.rail` + `initCarousel` | Verbatim; `.gtk-rail` adds only shadow clearance |
| Sponsored slot | `.dp-adslot` | Verbatim, follows [[project_pillar_ad_banner_recipe]] |
| Brand Connect CTA | `.dp-partner` | Verbatim, GharTalks copy |
| Guest credential | **`.vx-speaker`** | Verbatim from the Voices chassis |
| Guest index card | **`.vx-sp`** | Verbatim, including the appearances list |
| Beat shelf, intake block | `.vx-series`, `.vx-contribute` | Verbatim |
| **Entire browse finder** | `.br-search-wrap`, `.br-pill`, `.br-cdd`, `.brs-fmodal`, `.brs-toolbar`, `.brs-empty` + their JS | Machinery verbatim; only the data layer swapped, see §8 |
| **Entire article block catalog** | all `art-*` | Including `.art-qa`, `.art-takeaways`, `.art-pullquote--byline`, `.art-brand-callout`, `.art-note`, `.art-stat-strip`, auto-TOC, progress bar |
| Newsletter | `.subscribe` | Chassis reused, copy swapped |

**New CSS is the `.gtk-*` family only** — the façade, the card, the hero, the
rail wrapper, the chapter block, the monogram and the empty state — plus
`.art-video-hero`. It went straight into `styles.css` (search `GHARTALKS
CHASSIS`) rather than starting inline, because this vertical shipped with four
consumers on day one, already past the promotion bar in
[`DESIGN-PILLAR-HANDOFF.md`](DESIGN-PILLAR-HANDOFF.md) §5.

### Three rules inside the chassis that are easy to undo by accident

**The hover lift is on `.gtk-card__media`, never on `.gtk-card`.** The anchor
is the click target and a click target that moves under the cursor drops
clicks intermittently — see [[feedback_hover_transform_not_on_click_target]].
Hover rules are also guarded on `@media (hover:hover)` so the state cannot
latch after a tap.

**`.gtk-hero { padding-block: 0 }` is load-bearing.** `main > section` in
`styles.css` applies 80–120px of block padding; left in place it opens a dead
band above the player and pushes the fold. `.vx-hero` and `.dp-filterstrip`
carry the same override for the same reason.

**`.gtk-rail` pads all four sides and pulls them back with negative margins.**
A horizontal scroll container clips painted ink on every side, not just the
bottom, so a first card's left shadow and a last card's right shadow get
guillotined. Per [[feedback_carousel_shadow_clipping]].

---

## 8. Browse page, what differs from `/voices/search`

The finder machinery is identical. Only the data layer is swapped, and the
variable names deliberately keep the chassis identifiers (`PARENTS`,
`CITIES`, `brandIndex`) so future diffs stay readable.

| Chassis var | On `/voices/search` | On `/ghartalks/search` |
|---|---|---|
| `PARENTS` | The 4 launch series | The 4 beats |
| `PARENT_SUBS` | Topics inside each series | Tier-2 tags inside each beat |
| `CITIES` | Speakers | **Guests — people AND companies** |
| `brandIndex` | Built from `.vx-card` / `.vx-quote` | Built from `.gtk-card` |

Behavioural differences worth knowing:

- **One card face, not two.** `/voices/search` mixes `.vx-card` and
  `.vx-quote` in one grid because it indexes two kinds of thing. There is only
  one kind of thing here, so a second face would be a distinction without a
  difference.
- **`data-tags` is in the search haystack**, with hyphens spaced out. A reader
  searching "climate" or "townships" reaches episodes whose *titles* never use
  the word — the tag vocabulary is the only place that subject is written down.
  Verified: `townships` returns the Sunteck and Raymond episodes, neither of
  which says the word in its title.
- **`?tag=` seeds the `sub` facet** and is honoured by the filter, not just by
  the control. Those links ship from the landing's Topics block, every beat
  page's filter pill, and every episode's tag row. `?sub=` still wins if both
  are present, because that one came from the page's own controls.
- **The guest facet carries companies.** They filter the archive here but never
  appear in the Guests directory (§5).
- **Sort is label-only.** Inherited from `/voices/search`, which documents the
  same handoff: the click updates the label, no reordering happens. The
  options are Most recent / Longest first / Guest A–Z. *"Most discussed" was
  removed — it is a metric that does not exist on this archive and shipping it
  would be inventing engagement data.*

> **When porting this chassis, check the submit URL.** It pointed at
> `/voices/search` here, and `VOICES-HANDOFF.md` §8 records finding it
> pointing at `/brands/search` on `voices-search.html` after *that* port.
> Third time the same line has been missed.

---

## 9. Content provenance, disclosed on the page

The written layer is drafted from the recording with machine assistance for
the transcript and the first pass, then edited and fact-checked by the desk.
**The episode template says so**, in an `.art-note--disclosure` near the foot
of the body. Keep that block when the demo copy is replaced.

The reasoning is the same as the sponsor disclosure strip a few blocks up: the
reader is entitled to know what they are reading before deciding how much
weight it carries.

The load-bearing sentence is the last one: *drafted by machine, checked by a
person, and the video is the record.* That is a defensible position. "AI
generated summary" with no human step is not, because nobody has verified that
the summary says what the guest said.

---

## 10. Known follow-ups

1. **All written quotes on the episode page are PLACEHOLDER copy on a real
   named person.** The video is real, Pankaj Kapoor is real, Liases Foras is
   real; not one quoted sentence is a transcript. `grep -rn
   "PLACEHOLDER-QUOTE" ghartalks*.html`. Chapter timings are invented too:
   `grep -rn "PLACEHOLDER-CHAPTER"`. **Every one must be replaced from the
   actual recording or removed before publishing.** Attributing an invented
   sentence to a named living person is the one failure this vertical cannot
   survive — the same warning [`VOICES-HANDOFF.md`](VOICES-HANDOFF.md) §9.5
   carries.
2. **THE HERO STILL HAS A SELECTION RULE.** It must carry no large baked-in
   display type. The hero shipped on `m0us2RQGskA` (Mumbai Rise or Fall),
   whose cover is a YouTube headline card — giant white "MUMBAI" over a
   yellow band with "FALL?" in black. It works on YouTube, where a thumbnail
   competes in a grid of thumbnails. At hero scale beside our own Gazpacho
   headline it simply won, and the page read as an embed of someone else's
   platform. Swapped to `MX3DjZ9qtMY` (Abhikrama) on 2026-09-08: two people
   mid-conversation, warm room, small logo chip, no display type.

   Loud covers are fine on the CARDS — small, and no competing headline
   beside them. Mumbai now sits in the grid and looks correct there.

   **Known gap while the archive is demo data:** the hero links to
   `/ghartalks/abhikrama`, and every `/ghartalks/{slug}` currently renders
   the single Mumbai demo article, so the hero click-through lands on an
   episode page about a different conversation. That is true of all ~25 demo
   slugs and resolves itself the moment the backend renders per-episode. It
   is called out here because it is now visible on the page's most prominent
   link, where it was not before the swap.

3. **Demo episodes.** Eight of the fifteen cards are scaffolding, tagged
   `PLACEHOLDER-EPISODE`, present because those slugs were already linked
   across the portal and had to resolve. Six episodes are real, with real
   YouTube IDs off `@Ghar.tv_official`: `m0us2RQGskA`, `tjyHzEItoq0`,
   `veiWXyFuxNI`, `YKmVhuwYJlM`, `89dPjxzX1aI`, `MX3DjZ9qtMY`.
4. **The archive is genuinely small** and that is reflected honestly: no
   episode counts, no view counts, no subscriber numbers anywhere in the
   vertical. Per [[feedback_stats_calibration]], the fix for a metric that
   does not exist yet is to drop the metric, not to shrink the figure. Do not
   add counts to the beat cards; every number would be a single digit today.
5. **Intake is not built.** `/ghartalks/pitch` and `/ghartalks/nominate` park
   on the browse page so the landing CTAs do not 404. This is the supply side
   and it matters more than it looks: a vertical launching with a thin archive
   needs recruitment more, not less.
6. **The category and search grids are the same fifteen episodes, duplicated.**
   When the backend takes over both come from one query and the duplication
   disappears. Until then, **edit them together** — they have already drifted
   once during this build and were reconciled.
7. **`partials/subscribe.html` hardcodes Design copy**, so all four GharTalks
   pages carry an un-markered copy of the `.subscribe` chassis and
   `build-partials.mjs` logs `no subscribe marker pair, skipping` for them.
   **That warning is expected, not a bug** — same as the Voices pages. Fix
   properly by parameterising eyebrow/title/dek in the partial.
8. **`sitemap.xml` does not list this vertical** — but it does not list
   `/voices`, `/brands` or `/people` either. It is stale portal-wide and
   wants one pass, which is out of scope here.
9. **If you add a page to this vertical, add it to BOTH `PAGES` and
   `VERTICAL_LOCKUP` in `scripts/build-partials.mjs` in the same edit.** A
   page in the first but not the second silently loses its masthead lockup,
   because the script strips the placeholder rather than leaving it visible.
   That comment is already in the file; it has caught three pages so far.

---

## 11. Local dev

```bash
node serve.mjs            # http://localhost:3000/ghartalks
npm run build:partials    # after editing any partial
npm run build:styles      # after editing the GHARTALKS CHASSIS block in styles.css
npm run build:js          # after editing the YOUTUBE FAÇADE block in main.js
```

Bump the `?v=` on the `dist/styles.min.css` link after a styles rebuild. The
GharTalks pages are currently on `?v=31`.

---

## 12. Reference

- Memory: [[project_ghartalks_context]], [[project_video_hosting]],
  [[feedback_no_person_without_portrait]], [[feedback_stats_calibration]],
  [[feedback_hover_transform_not_on_click_target]],
  [[feedback_carousel_shadow_clipping]], [[feedback_gazpacho_numbers]],
  [[project_design_tag_graduation_rule]],
  [[feedback_no_chip_strip_on_collection_pages]],
  [[feedback_no_ad_gate_before_editorial]], [[feedback_reuse_first_protocol]],
  [[feedback_shared_chrome_byte_identical]]
- Voice and copy: [`voices.md`](../voices.md) at project root, single source of
  truth. Note the name collision: that file is the site-wide **voice guide**,
  not documentation for the Voices vertical.
- Catalog: [design-system.html#ghartalks-chassis](../_dev/reference/design-system.html#ghartalks-chassis)
