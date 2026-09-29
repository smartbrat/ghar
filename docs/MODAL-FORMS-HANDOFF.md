# Modals and forms: what changed, why, and what you need to update

> **Written for the programmer who has already integrated the portal's
> modals and forms.** This is a delta doc. It covers commits `4d67f29` and
> `9f84ebf` (2026-09-29), which changed the modal markup contract, moved
> shared CSS, and fixed two modals that were broken on most of the portal.
> If you integrated before those commits, some of what you built against is
> now wrong. Everything you need to change is in section 5.
>
> Related: [`BACKEND-INTEGRATION-GUIDE.md`](BACKEND-INTEGRATION-GUIDE.md)
> (its "Form submissions" section is corrected by section 6 below),
> [`SEARCH-HANDOFF.md`](SEARCH-HANDOFF.md) (§8 superseded, see 4.5).

---

## 1. The short version

| # | What happened | Does it affect your code? |
|---|---|---|
| 1 | A modal that contains a form no longer has a header bar (`.jm-hdr`). The title is inside the scrolling body. | **Yes** if you hand-wrote or generated any modal markup. |
| 2 | The phone-keyboard fix is back: on phones an open full-screen modal is sized from `window.visualViewport`. | **Yes** if your JS sets `height` or `top` on a modal. |
| 3 | The contact modal's CSS now lives in `styles.css` only. Seven pages had a copy in a page `<style>` block; all deleted. | **Yes** if you templated a page from one of those seven. |
| 4 | The sign-in modal was shipping one step out of five. Two of its own links threw and blanked the modal on 44 pages. | **Yes.** Your sign-in integration was hitting a broken modal. |
| 5 | `index.html` and `person-profile.html` now expand the shared partials instead of carrying hand-written copies. | **Yes** if you built PHP includes from the old marker set. |
| 6 | The mobile search modal joined the shared chassis (scroll lock, Back button, keyboard fix). | Minor. Its markup gained three attributes. |

Nothing about routing, data contracts, the palette registry or the template
token set changed. This is modal chassis and form markup only.

---

## 2. The rule that drives all of it

**A modal that contains a form is a content modal, and a content modal has
no header bar.**

```html
<div id="brContactOverlay" onclick="brContactClose()"></div>
<div id="brContactModal" role="dialog" aria-modal="true" aria-label="Contact a brand">
  <button class="jm-close" type="button" onclick="brContactClose()" aria-label="Close">...</button>
  <div class="jm-body">
    <div class="jm-heading">Contact<span id="brContactBrand">this brand</span></div>
    <p class="jm-subtext">...</p>
    <form id="brContactForm" onsubmit="return brContactSubmit(event)">...</form>
  </div>
</div>
```

Three things are load-bearing in that shape:

1. **`.jm-close` is the first child of the shell**, not a floating button and
   not inside `.jm-body`. The shell is `display:flex; flex-direction:column;
   overflow:hidden`, so the close button is a flex item at `flex-shrink:0`
   that holds the top while `.jm-body` scrolls under it. Nothing inside a
   modal is ever `position:sticky` or `position:fixed`.
2. **`.jm-body` is the one scroll container** (`overflow-y:auto;
   overscroll-behavior:contain`). Do not add a second scrolling element
   inside it.
3. **The title is `.jm-heading` inside `.jm-body`**, with `.jm-subtext`
   under it. It scrolls away with the content, by design.

The `.jm-hdr` bar still exists, but only for a sheet that has no editorial
title of its own: `#clModal` (Collections) and `#brsFmodal` (search
filters). If you are adding a modal and it has an input in it, it does not
get the bar.

**Why this changed:** `#joinModal` carried a `.jm-hdr` bar with "Sign In" in
it *and* a `.jm-heading` saying "Sign In" in the body. Four CSS rules existed
purely to hide the first one and reposition what was left. The moment that
CSS was unscoped, the homepage showed the title twice. The bar was removed
rather than the workaround extended.

---

## 3. The JS contract for any modal

All of this lives in one place, `main.js` (shipped as `dist/main.min.js`),
in the IIFE guarded by `window.__ghModalHooksInit`. There is no second copy.
The old copy in `dist/bpr-reveal.js` was deleted in `c413332`.

**To put a modal on the chassis you need exactly two things in the markup:**

- `role="dialog"` on the modal element (the hook's selector is
  `[role="dialog"]`)
- the class `jm-open` toggled on it when it opens and off when it closes

A `MutationObserver` watches that class and does the rest. Toggling
`style.display` alone gets you nothing.

**What you get once it is on the chassis:**

| Behaviour | Detail |
|---|---|
| Body scroll lock | `document.body.classList.add('jm-scroll-locked')`, which is `overflow:hidden !important`. **Never** `position:fixed` on body: it makes `window.scrollY` read 0 and it fights GSAP ScrollSmoother. Do not set `body.style.overflow` inline alongside it. |
| Back-button close | `history.pushState({modal:id})` on open; `popstate` calls the modal's close function. |
| Phone keyboard fix | See section 4.2. |

**Registering a new modal for the Back button.** Two lists in `main.js`:

```js
// 1. knownCloseFor(id) - what popstate should call
if (id === 'mobileModal' && typeof window.closeMobileSearch === 'function')
  return window.closeMobileSearch;

// 2. REGISTERS in gharModalHistoryInit - wraps your open/close pair
{ open: 'openMobileSearch', close: 'closeMobileSearch', modal: 'mobileModal' }
```

If your backend adds a modal, you can register it without touching `main.js`
by pushing to `window.gharModalHistory` before the script runs:

```js
window.gharModalHistory = [{ open: 'myOpen', close: 'myClose', modal: 'myModal' }];
```

---

## 4. Each change, and what it means for you

### 4.1 The header bar is gone from form modals

**Affects:** any modal markup you hand-wrote, generated server-side, or
copied out of a page before 2026-09-29.

**Symptom if you do nothing:** the title renders twice, once in a bar at the
top and once as the Gazpacho heading below it. On a phone the bar also eats
about 40px of a sheet that is already short when the keyboard is up.

**What to do:** delete the `.jm-hdr` element from any form modal you emit.
Move its title text into `<div class="jm-heading">` as the first child of
`.jm-body`, if it is not already there. Do not add CSS to hide the bar.

### 4.2 The phone-keyboard fix is back, and your JS must not fight it

**Affects:** any code that writes `height` or `top` on a modal element.

Below 744px an open full-screen sheet gets its `height` and `top` from
`window.visualViewport`, re-applied on `resize`, `scroll` and
`orientationchange` (rAF-throttled).

**Why it is needed:** a soft keyboard does not shrink the *layout* viewport.
The browser scrolls the *visual* viewport instead, which carries a
`position:fixed` sheet's title and close button off the top of the screen,
where scrolling `.jm-body` cannot bring them back. Users could not reach the
close button with the keyboard open. Verified fixed on a real device before
this shipped.

**How it decides what to bind.** A sheet qualifies if it claims full screen
(the `.jm-modal` class, or membership of
`FULLSCREEN_MODAL_IDS = ['brContactModal','brBriefModal','joinModal','mobileModal']`
for the modals that predate the class) **and** the layout agrees: computed
`position:fixed` and computed `max-height:none`.

Three things to know, because each one was a bug at some point:

- The test is on **`max-height`**, not `top`. `getComputedStyle` resolves
  `top:auto` to a used pixel value, so `top` cannot tell a bottom sheet from
  a full-screen one. `max-height` is also the one property this code never
  writes, so it cannot be fooled by its own output.
- It is **not** a class allow-list. `#brShareModal` is a bottom sheet that
  gained `.jm-modal` during an earlier migration.
- A bound sheet is marked **`data-jm-vv-bound="1"`** and is released by that
  mark, never by re-testing. Rotating a phone to landscape crosses 744px,
  where the sheet is a centred card again and the test stops recognising it;
  without the mark it would keep a stale `height:844px`.

**What to do:**

- Do not set `style.height` or `style.top` on a modal. If you need a
  different height, do it in CSS.
- If you add a **bottom sheet**, give it a real `max-height` cap in CSS.
  That is what keeps it out of this binding.
- If you add a **full-screen sheet**, give it the `.jm-modal` class and it
  is picked up automatically. Use `.jm-modal--no-fullscreen` to opt out.
- Do not clear `data-jm-vv-bound` yourself.

### 4.3 The contact modal's CSS has one home

**Affects:** anyone who templated a page from `brands.html`,
`brands-search.html`, `ghartalks-search.html`, `voices-search.html`,
`people.html`, `people-search.html` or `person-profile.html`.

Those seven pages each carried a 2413-byte copy of the contact modal's CSS
in a page `<style>` block, and the canonical block in `styles.css` was
scoped to `body:is(.pp-page, [data-brand-format])`. The scope is gone, the
block is portal-wide, and all seven copies are deleted.

Computed styles on `/brands` were captured before and after: identical,
property for property. This is a maintenance change, not a visual one.

**What to do:** if your PHP layout or template engine reproduces one of those
page `<style>` blocks, drop the contact modal section from it. **A page
`<style>` block beats a shared stylesheet**, so a leftover copy will not
merely duplicate, it will silently win and freeze that page on the old
design. One of the seven had already drifted this way (its textarea border
was on `--rule` instead of `--field-rule`).

### 4.4 The sign-in modal was broken on 44 pages

**Affects:** your entire sign-in integration. Re-test it.

`partials/join-modal.html` shipped with only the first of five steps
(`jmSignIn`), while its own "Login with OTP" and "Forgot Password?" links
call `jmShowOTPLogin()` and `jmShowForgot()`. Those handlers write into
`#jmOTPHeading` and focus `#jmForgotPhone`, which did not exist, so both
threw. They throw *after* `jmShowView()` has already removed `.active` from
the sign-in step, so the modal was left showing nothing at all. Measured
live: `Cannot set properties of null`, and no visible step afterwards.

This only worked on the homepage, which had its own hand-written copy with
all five steps. Every other page had a modal that went blank on the second
click.

All five steps are now in the partial:

| Step id | Purpose | Primary action |
|---|---|---|
| `jmSignIn` | phone + password | `jmDoSignIn()` |
| `jmOTPLogin` | phone entry for OTP | `jmSendOTP()` |
| `jmOTPVerify` | 6-box OTP entry | `jmVerifyOTP()` |
| `jmForgot` | phone entry for reset | inline TODO |
| `jmSignupDetails` | name, email, company | `jmSubmitSignup()` |

`jmShowView(id)` swaps the `.active` class between them. `jmFlow` is
`'login'` or `'signup'`; `openSignUp(pkg)` sets it to `'signup'` and stores
the tier in `jmSignupPkg`, so a CTA like "Apply for SuperPro" calls
`openSignUp('superpro')` and the package travels with the account creation.

**Do not trim a step out of this partial to make a page smaller.** That is
what caused this.

### 4.5 `index.html` and `person-profile.html` now use the partials

**Affects:** your PHP include mapping, if you built it from the marker set.

`scripts/build-partials.mjs` expands `partials/*.html` into every page that
carries a `<!-- PARTIAL name:start -->` / `<!-- PARTIAL name:end -->` pair
**and is listed in that script's `PAGES` array**. `index.html` and
`person-profile.html` carried markers but were missing from `PAGES`, so both
kept hand-written copies that no partial edit ever reached. Both are now
registered, and `index.html` was additionally wrapped for
`mobile-search-modal` in `9f84ebf`.

Two consequences:

- `SEARCH-HANDOFF.md` §8 says `index.html`, `design.html` and
  `design-article.html` carry byte-identical copies of the `#mobileModal`
  markup. **That is no longer how it works.** All of them expand
  `partials/mobile-search-modal.html`. Edit the partial, run
  `npm run build:partials`, commit the partial and the regenerated pages.
- At integration time, each marker pair plus its content becomes
  `<?php include 'partials/<name>.html'; ?>`. `index.html` and
  `person-profile.html` now have more include points than they did in your
  last checkout: `join-modal` on both, plus `mobile-search-modal` on the
  homepage.

**Rule to carry forward:** if you add PARTIAL markers to a file, add the
file to `PAGES` in the same commit. Markers without registration look
correct and silently do nothing.

### 4.6 The mobile search modal is on the chassis

`#mobileModal` gained `role="dialog" aria-modal="true" aria-label="Search
properties"`, it toggles `.jm-open` beside its `display` switch, and it is
registered for Back-button close. It no longer sets `body.style.overflow`
inline; the class lock handles it.

Practical effect: the search sheet's close button now survives the keyboard,
Android Back closes it instead of leaving the page, and it cannot leave the
body unscrollable.

---

## 5. Your checklist

Work through this against your implementation:

- [ ] **Search your codebase for `jm-hdr`.** Any occurrence inside a modal
      that contains an input is now wrong. Remove the element.
- [ ] **Search for `position:fixed` applied to `body`.** Replace with
      `document.body.classList.add('jm-scroll-locked')`.
- [ ] **Search for `body.style.overflow`** set alongside a modal open or
      close. Remove it; the chassis owns the lock.
- [ ] **Search for any assignment to a modal's `style.height` or
      `style.top`.** Remove it.
- [ ] **Check every modal you emit has `role="dialog"`** and toggles
      `jm-open`. If it only toggles `display`, it has no scroll lock, no
      Back button and no keyboard fix.
- [ ] **Re-test the full sign-in flow on an inner page** (not the homepage):
      open, "Login with OTP", "Forgot Password?", Back button, and the
      signup path via `openSignUp('<tier>')`.
- [ ] **Remove the contact modal CSS** from any page `<style>` block your
      templates generate.
- [ ] **Re-map your PHP includes** for `index.html` and
      `person-profile.html` (section 4.5).
- [ ] **Test one form modal on a real phone with the keyboard open.** The
      close button must stay reachable. This is the regression that started
      all of it, and it is not visible in a desktop browser or in an
      emulator that fakes the keyboard.

---

## 6. Corrections to `BACKEND-INTEGRATION-GUIDE.md`, "Form submissions"

That section is older than the shipped markup and is wrong in three ways.
The endpoints and the `{ ok: true }` response contract still stand.

**Field names.** The guide's payload column does not match the markup. The
real `name=` attributes, which are what a normal form POST sends:

| Form | Element | Real field names |
|---|---|---|
| Contact modal | `#brContactForm` | `brand` (hidden), `name`, `phone`, `email`, `message` |
| Brief / RFP modal | `#brBriefForm`, submits via `gharBriefSubmit(e)` | `source` (hidden), `name`, `phone`, `email`, `projectType`, `city`, `budget`, `timeline`, `message` |
| Subscribe | `.subscribe__form[data-subscribe-form]` | `email` |
| Sign in | `#jmSignIn` | `phone`, `password`, plus the country code from `jmSelCC.code`, which is JS state and not a field |

Note `message` where the guide says `note`, `brand` where it says
`brand_slug`, and that the brief form has `projectType` and `city` as
required selects, which the guide omits entirely.

**There is no CSRF field.** The guide says each form ships a hidden `csrf`
input read from a `<meta name="csrf">` tag. Neither exists anywhere in the
repo. If you want CSRF protection, you are adding both the meta tag in your
layout and the hidden input in each form partial; nothing is waiting for it.

**The sign-in endpoint table covers one of five steps.** The shipped flow
needs the list below, and the frontend handlers for it are still TODO stubs
that just close the modal (`jmDoSignIn`, `jmVerifyOTP`, `jmSubmitSignup`,
`jmResendOTP` in `main.js`, and an inline TODO on the reset button):

| Step | Suggested endpoint | Payload |
|---|---|---|
| Password sign-in | `POST /api/auth/signin` | `phone`, `country_code`, `password` |
| Send OTP | `POST /api/auth/otp/send` | `phone`, `country_code`, `purpose` (`login` or `signup`) |
| Verify OTP | `POST /api/auth/otp/verify` | `phone`, `country_code`, `otp`, `purpose` |
| Resend OTP | `POST /api/auth/otp/resend` | `phone`, `country_code` |
| Create account | `POST /api/auth/signup` | `phone`, `country_code`, `name`, `email`, `company`, `package` |
| Password reset | `POST /api/auth/reset` | `phone`, `country_code` |

Confirm these names with us before you build them. They are a proposal read
off the shipped flow, not a decision already taken.

---

## 7. Also worth knowing: the contact form is stubbed 30 times

Not part of these two commits, but it will be the next thing you hit.
`window.brContactSubmit` is defined **inline in 30 separate pages**, and
every copy does the same thing:

```js
window.brContactSubmit = function (e) {
  e.preventDefault();
  var brandName = field.value;
  brContactClose();
  alert('Thanks, your enquiry to ' + brandName + ' has been sent.');
  return false;
};
```

An `alert()`, thirty times over, with the open, close and Escape wiring
beside it. When you wire the real endpoint, do not edit thirty pages: a
shared `dist/br-contact.js` should land first and the inline copies get
stripped. Tell us when you are ready for that and it will be done on our
side, because deleting those blocks is a frontend change and it has to pass
the catalog drift check.

---

## 8. Commits and files

| Commit | What |
|---|---|
| `4d67f29` | The chassis work. 62 files: `main.js`, `styles.css`, `dist/`, `partials/join-modal.html`, `partials/mobile-search-modal.html`, `scripts/build-partials.mjs`, `index.html`, `person-profile.html`, the 7 unforked pages, 14 generated person profiles, the pages the partial rebuild touched, `_dev/templates/*`, and the component catalog. |
| `9f84ebf` | The homepage mobile search modal, which had the same hand-written-copy problem. |

**Where the rules are written down, if you want the frontend view:**

- `_dev/reference/design-system.html` sections `#ui-modals-shell`,
  `#ui-modals-header`, `#ui-modals-fullscreen`. Serve it at
  `http://localhost:3000/design-system`.
- `_dev/reference/components/modal-shell.html`, `join-modal.html`,
  `contact-modal.html`, `mobile-search-modal.html`. Browse at
  `http://localhost:3000/components`.

Both were updated in the same commit as the code, so what they show is what
shipped. If you paste a modal out of either, you get the current one.

---

## 9. Questions to send back

1. Do the six auth endpoints in section 6 match what you have built or
   planned? If you already have different names, the frontend will be wired
   to yours.
2. Do you want CSRF tokens? If yes, the hidden input goes into the form
   partials on our side and you render the meta tag.
3. When do you want the shared `dist/br-contact.js` (section 7)? It is about
   half a day here and it unblocks the real enquiry endpoint.
