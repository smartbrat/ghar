# Component source files

One file per component. `npm run build:components` turns them into `/components`,
`components.json` and `COMPONENTS.md`. Never edit those outputs by hand.

Files starting with `_` (like `_page.html`, the page shell) are not components.

## File shape

```html
<!-- @meta
{ ...JSON, fields below... }
-->

<!-- @snippet -->
markup the user copies

<!-- @preview -->
optional: markup for the preview when it should differ (several variants, a trigger button)

<!-- @style -->
optional: CSS NOT in any shared file, which must be pasted with the markup (status "inline")

<!-- @js -->
optional: JS the user copies. Required for kind "call"

<!-- @preview-style -->
optional: preview-only scaffolding CSS (a max-width, a grey ground). Never copied

<!-- @preview-script -->
optional: preview-only JS (an init call, a demo trigger). Never copied
```

## @meta fields

| field | required | meaning |
|---|---|---|
| `id` | yes | kebab-case, equals the file name |
| `name` | yes | what a person calls it, sentence case |
| `category` | yes | one of `CATEGORY_ORDER` in `scripts/build-components.mjs` |
| `kind` | yes | `paste` markup to copy · `include` generated partial, never pasted · `call` a JS function |
| `status` | yes | `shared` (its CSS/JS is in a shared file) · `inline` (its CSS lives in page `<style>` blocks, so `@style` carries it) · `include` |
| `summary` | yes | one or two plain sentences: what it is and what it does for the reader |
| `use` | yes | array, when to reach for it |
| `avoid` | yes | array, when not to, and the mistake people actually make |
| `css` | yes | root-absolute stylesheets it needs, in production load order, e.g. `"/dist/styles.min.css"` |
| `js` | yes | root-absolute scripts in load order. **`/dist/main.min.js` needs GSAP and ScrollTrigger listed first** (`https://unpkg.com/gsap@3.14.2/dist/gsap.min.js`, `.../ScrollTrigger.min.js`) or it throws and defines nothing |
| `signature` | yes | how the build finds pages using it: `.class`, `[data-attr]`, `body.class`, or a plain string such as a function name or `PARTIAL footer:start` |
| `api` | when it has one | `[{ "name", "type", "desc" }]`, type one of `class` `modifier` `attr` `js` `token` `body-class` `event` `slot`. Every `js` name must exist in a declared script |
| `guideline` | when one exists | `#anchor` of the matching section in `design-system.html`. Checked |
| `partial` | include only | file name in `partials/` without `.html` |
| `placement` | include only | where the marker goes, e.g. `Just before </body>, after <main>` |
| `hookClasses` | optional | classes that are JS hooks with no CSS, so the class check skips them |
| `keywords` | recommended | synonyms and symptoms people search with |
| `notes` | optional | one short paragraph shown as an amber note: a debt, a trap, a known duplicate |
| `unshipped` | optional | `true` if it exists in shared CSS but no root page uses it yet |
| `preview` | optional | `{ "height": px (only for fixed/overlay content), "pad": 32, "bg": "#ffffff", "bodyClass": "", "scroll": false, "width": "fit", "viewports": ["fit","desktop","tablet","phone"] }` |

## Rules

1. **Copy markup from a shipped page, never write it from memory.** The whole point
   is that the snippet is what production runs. Keep the real structure, classes,
   ARIA and attributes. Swap in neutral content where the real content is a
   specific tenant, and never invent statistics, project names or people.
2. **Declare dependencies exactly as production loads them.** The preview loads
   only what you declare, so a missing file shows up as a broken preview. That
   is the check working, not a bug to hide with `@preview-style`.
3. **Shared chrome is `include`.** Nav, footer, off-canvas menu, bottom bar,
   modals that live in `partials/`. Their preview is the real partial.
4. **Inline families are `inline`.** If the CSS only exists inside page `<style>`
   blocks, copy it into `@style` from the most canonical page and name the
   other pages carrying copies in `notes`. Do not move it into `styles.css`.
5. **No em dashes anywhere.** The build warns.
6. **Use and avoid are the rules that already exist** in `design-system.html`,
   `CLAUDE.md` and memory. Do not invent new policy.

## Checking your work

```
node scripts/build-components.mjs --only my-id,other-id --preview
```

Fix every warning. Know the one gap: the class check matches class names
against the declared CSS, so a class that only appears inside a hover or
descendant rule passes even with no base style. The preview catches that one;
look at it.

Then open `http://localhost:3000/_dev/scratch/component-previews/my-id.html`
and confirm it renders with no console errors.

## Links back to the guidelines

`npm run build:components -- --strict --xref` also rewrites the "Get the code"
links in `design-system.html`: one block under the heading of every `guideline`
anchor, between `COMPONENTS-XREF` markers. Run it whenever you add a component
or change a `guideline`. It is safe to rerun and touches nothing outside the
markers. Never hand-edit inside them.
