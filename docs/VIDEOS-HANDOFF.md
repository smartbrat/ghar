# /videos handoff

The index of every Ghar.tv video. Built 2026-09-28 as an MVP on the GharTalks
chassis. One registry, one build script, three templates.

## The rule: one home per video

Every video has exactly one page where it plays. Every other surface shows a
card that links to that page.

| Video | Home |
|---|---|
| GharTalks episode with a written page | `/ghartalks/{slug}` |
| Everything else | `/videos/{slug}` (watch page) |
| Project tour, once project pages exist | the project page (change `home` in the registry) |

If someone opens `/videos/{slug}` for a video whose home is somewhere else,
the watch page sends them to the home with `location.replace`.

## Files

| File | Route | What it is |
|---|---|---|
| `scripts/video-data.mjs` | none | The registry. One row per video. |
| `scripts/build-videos.mjs` | none | Bakes cards into the three pages. Run `npm run build:videos`. |
| `videos.html` | `/videos` | Hub |
| `videos-category.html` | `/videos/project-tours`, `/market`, `/home-buying`, `/design` | One template. The script reads the topic from the path. |
| `videos-watch.html` | `/videos/{slug}` | One template. The script reads the slug from the path and looks it up in the inline `#vidData` JSON. |
| `_dev/tools/videos-registry-draft.cjs` | none | One-off. Built the first registry from the YouTube channel. |
| `_dev/tools/videos-scaffold.cjs` | none | One-off, superseded. Built the first pages from the `ghartalks.html` chrome. The hub has since been redesigned by hand. Do not run it again. |

Routes are in `vercel.json` and `serve.mjs`. List topic routes before the
`/videos/:slug` catch-all.

## Registry row

```js
{ id, slug, topic, format, title, date, secs, city?, home, still?, dek }
```

| Field | Meaning |
|---|---|
| `id` | YouTube video ID |
| `topic` | `project-tours`, `market`, `home-buying`, `design` or `ghartalks` |
| `format` | `long` or `short` |
| `home` | The one page where the video plays |
| `still` | `hq2` only on the two uploads that have no `maxres2`. Otherwise leave it out. |

Slugs must be unique and can't match a topic slug. The build checks both.

## Hub rules (enforced in the build)

- **Launch gate.** A rail renders only when it has 6 or more videos. A thinner rail is left out.
- **Flow.** The hub reads like a streaming home page:
  1. **Highlights billboard.** `FEATURED` plus the newest long video of each topic and of GharTalks (6 slides). It uses the carousel-cards-paged chassis with `.gtk-tile.vid-bb` slides (title only over the picture, with a small play mark beside it), autoplays every 6s and has a paginator. It runs in centre mode at every width: the heading sits centred above it, the active slide sits in the middle with a neighbour peeking on both sides, and the rail runs to the screen edges. It loops (`loop: true` in initCarousel), so it opens centred with a neighbour on both sides. The neighbours sit under a soft blur (`activeClass`), and the arrows sit over them instead of under the rail. Slide width is `--bb-w` in styles.css.
  2. **Shelves**, one per topic and format, each with a See all link: Project tours, Tours in a minute, GharTalks, Market in a minute, Design in a minute.
  3. **More to watch.** Every video the billboard and shelves did not use, as a grid.
  4. Browse by topic, subscribe, VideoWorks.
- **No repeats, nothing missing.** No video appears twice on the hub, and the build fails if any video is left off it.
- **Rails bleed to the screen edge.** A rail's outer box never clips. `body` clips it at the viewport. A clip on the outer cuts the cards at the `--max-w` line and looks chopped on wide screens.
- **Topic pages have no gate.** An empty section collapses. If the whole topic is empty, the page shows `.gtk-empty`.

## Stills

| Format | Still | Fallback |
|---|---|---|
| Long video | `i.ytimg.com/vi/{id}/maxres2.jpg`, a clean auto frame | `data-yt-fallback` drops to `hqdefault` on a 404 |
| Short | `oar2.jpg`, the 9:16 auto frame | none |

Never use the custom thumbnail, because it has text burned in. Never use a
16:9 still for a Short, because those are blurred pillarboxes.
`i.ytimg.com` is on the image-rule allowlist.

## CSS and JS

- Only new CSS: the `.vid-*` block in `styles.css`. Search for "VIDEOS VERTICAL". It adds the 9:16 card, grid and player. Catalog entry: `/components#video-short`.
- Everything else is reused: `.gtk-*`, `.dp-*`, `.art-*`, `.subscribe`.
- `main.js` YOUTUBE FAÇADE: the iframe now fills its host instead of fixing 16:9. This lets a Short play at 9:16.
- Shared fix: `.art-video-hero` now has a top margin. Before this, the byline touched the player on GharTalks episode pages too.

## Adding a video

1. Add a row to `scripts/video-data.mjs`.
2. Run `npm run build:videos`.
3. Commit the registry and all three pages.

## Open

- **SEO for watch pages.** Title, meta and VideoObject JSON-LD are set client-side, the same as GharTalks. A backend should render them on the server.
- **Events.** There is one event video (IPS Dubai 2024), filed under Market. Events becomes a topic once it has 6 or more videos.
- **Search.** There is no search page yet. The hub and topic pages cover the MVP.
- **Subscribe.** The subscribe block is outside the `subscribe` partial markers, because the partial's copy is hardcoded for Design. This is the same follow-up as GharTalks.
