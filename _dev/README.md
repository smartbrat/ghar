# `_dev/` — everything that is not a shipped page

The project root holds **production only**: pages that a route resolves to,
the CSS/JS they load, the build config, and the asset folders. Everything
else lives here.

The rule is not cosmetic. The root used to carry ~90 non-production files
mixed in with the real ones, and every task started by working out which
`index-*.html` was the live homepage. If you cannot point at a route in
`vercel.json`, `serve.mjs`, `sitemap.xml`, or a link in `partials/`, the file
belongs in `_dev/`.

## Folders

| Folder | What goes in it |
|---|---|
| `archive/` | Superseded versions and backups: `index-v2.html`, `*.bak`, `*.rejected-v1`, `main-v1.js`, replaced stylesheets. Kept for reference, never edited. |
| `prototypes/` | Exploration and preview pages that were never routed: `opt1-3.html`, `eco-*`, `brand-flow.html`, `media-kit.html`. |
| `reference/` | Things read, not shipped: `design-system.html` (the component catalog), `explore-shapes.html`, the project report, sales PDFs. |
| `templates/` | Page templates the build scripts read and write. Not served. See the wiring note below. |
| `tools/` | One-off dev scripts: scrapers, screenshot runners, font extraction, section audits. Most predate the Playwright MCP workflow and need `puppeteer`, which is not installed. |
| `scratch/` | Throwaway text and JSON dumps from in-progress work. Delete freely. |

## The pages still work at their old URLs

`serve.mjs` builds a map of every `.html` under `_dev/*/` at boot and falls
back to it when a root path 404s. So `http://localhost:3000/design-system`
and `/opt2.html` resolve exactly as before.

This matters because the moved pages carry **relative** asset paths
(`href="dist/styles.min.css"`, `src="ghar-carousel.js"`). Served from a root
URL those resolve against `/` and work. Opening
`/_dev/reference/design-system.html` directly resolves them against
`/_dev/reference/` and 404s every stylesheet — so use the short URL.

The map is built from the directory listing, so a new page dropped into any
subfolder is reachable with no code change.

## Wiring you must not break

Two build scripts reach into `templates/`:

- `scripts/build-partials.mjs` — its `PAGES` list includes
  `_dev/templates/brand-profile.html`, `_dev/templates/person.html` and
  `_dev/templates/person-profile.html`, so shared chrome stays byte-identical
  in the templates that seed future pages.
- `scripts/build-person-profiles.mjs` — writes the regenerated template to
  `_dev/templates/person-profile.html`. Person pages themselves still land at
  the root, because they are routed.

If you move anything inside `templates/`, update both.

## Git

`_dev/` is in `.gitignore` as a single rule. A new prototype or throwaway
script needs no `.gitignore` edit — create it in the right folder and it is
already excluded from the repo and from the Vercel deploy.
