# AI Ingestion

> The Brand Connect onboarding pipeline. What goes in, what comes out,
> what admin controls, what AI never does. Not a specification of the AI
> model itself — that's the programmer's implementation choice. This is
> the contract at the input/output boundary.

---

## 1. Why this exists

The current Brand Connect onboarding is manual:

1. Someone clones `_dev/templates/brand-profile-*.html` → `brand-profile-{slug}.html`
2. Someone hand-fills the content section by section
3. Someone adds a `vercel.json` rewrite
4. Someone runs the local dev server + screenshots for QA

**This does not scale.** The brief §9 describes the target — a Brand kit
comes in, entities + relationships + configs come out, admin reviews,
publishes. AI accelerates every step; admin decides.

---

## 2. Input — the Brand kit

The minimum structured input from a brand or their team. Fields marked
`optional` can be omitted; AI extracts as much as it can from the
`media_urls`.

```json
{
  "kit_id": "kit-2026-08-31-teearch-example",
  "submission_source": "brand_direct | admin_ingest | website_scrape | pdf_upload",
  "submitted_at": "2026-08-31T14:22:00Z",

  "brand": {
    "name": "Horizon Architects",
    "website": "https://horizonarchitects.com",
    "logo_url": "https://…/logo.svg",
    "primary_category_hint": "architecture",
    "founded_year": 2005,
    "primary_city": "Mumbai",
    "supplied_facts": {
      "team_size": 32,
      "projects_delivered_sq_ft": 480000,
      "years_in_practice": 21
    }
  },

  "media_urls": [
    { "url": "https://…/portfolio-2024.pdf", "kind": "pdf", "hint": "portfolio" },
    { "url": "https://…/founder-portrait.jpg", "kind": "image", "hint": "portrait" },
    { "url": "https://…/office-shot-1.jpg", "kind": "image", "hint": "office" },
    { "url": "https://…/project-sabhyata-1.jpg", "kind": "image", "hint": "project", "project_name": "Sabhyata Sanctuary" }
  ],

  "supplied_people": [
    {
      "name": "Hemal Shah",
      "role": "Founder & Principal Architect",
      "portrait_url": "https://…/hemal.jpg",
      "linkedin": "https://linkedin.com/in/hemal-shah",
      "bio_hint": "IIT Bombay 1998, worked at HCP Design & Planning 1998–2004, founded Horizon 2005"
    }
  ],

  "supplied_projects": [
    {
      "name": "Sabhyata Sanctuary",
      "city": "Mumbai",
      "locality": "Bandra West",
      "project_type": "residential",
      "delivered_at": "2023-11",
      "area_sqft": 12000,
      "principal_person_name": "Hemal Shah",
      "images": ["https://…/project-sabhyata-1.jpg", "https://…/project-sabhyata-2.jpg"]
    }
  ],

  "supplied_awards": [
    { "title": "IIA Award for Residential", "year": 2022, "body": "Indian Institute of Architects" }
  ],

  "package_hint": "spotlight"
}
```

**Every field is optional except `brand.name` and `brand.website`.** AI
fills in gaps from `media_urls`; admin reviews.

---

## 3. The pipeline — 6 stages

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                    │
│  1. EXTRACT                                                        │
│     Scrape website, parse PDF, OCR + face detection on images.    │
│     Extract: about text, project list, team names,                │
│              structured data (JSON-LD, meta tags).                │
│                                                                    │
│  2. RESOLVE ENTITIES                                              │
│     Dedupe: brand against existing brands, each named person       │
│     against existing people, each named project against            │
│     existing projects.                                             │
│     Confidence signals → auto-match (≥0.85) OR admin review.       │
│                                                                    │
│  3. PROPOSE RELATIONSHIPS                                          │
│     Brand ↔ Person: role, is_founder, is_leadership                │
│     Brand ↔ Project: developer / architect / pmc / etc.            │
│     Person ↔ Project: principal / lead                             │
│                                                                    │
│  4. SUGGEST COMPOSITION                                            │
│     Pick category composition rules based on primary_category.     │
│     For each auto-mode section, propose content.                   │
│     For each manual-mode section, draft copy for admin review.     │
│                                                                    │
│  5. ADMIN REVIEW                                                   │
│     Present: entities (accept/edit/reject), relationships          │
│     (confirm/edit/reject), section drafts (edit/accept/regenerate).│
│     Every AI-authored field flagged with provenance.               │
│                                                                    │
│  6. PUBLISH                                                        │
│     Commit entity records + relationships + section configs.       │
│     Register /brands/{slug} route.                                 │
│     Emit distribution graph updates.                               │
│     Invalidate resolver caches.                                    │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

Each stage is independently reviewable and re-runnable.

---

## 4. Stage 1: EXTRACT

**Input:** Brand kit (§2).

**Operations:**

- **Website scrape:**
  - Fetch `brand.website` + follow N links (max 20, capped at same-domain).
  - Extract `<meta>` tags, JSON-LD, Open Graph.
  - Identify About / Team / Projects / Contact pages heuristically.
  - Text extraction (readability library).
- **PDF parse:**
  - Extract text.
  - Extract images.
  - Attempt structured layout extraction (portfolio → project entries).
- **Image analysis (per media URL):**
  - Face detection → tag as `portrait`.
  - Building / interior detection → tag as `project`.
  - Text-in-image detection → OCR → tag as `document`.

**Output — `extraction_result`:**

```json
{
  "kit_id": "kit-…",
  "brand": {
    "name": "Horizon Architects",
    "website_html": "…",
    "about_paragraphs_extracted": ["…", "…"],
    "team_page_extracted_names": ["Hemal Shah", "Priya Menon"],
    "projects_page_extracted": [ { "name": "Sabhyata Sanctuary", "…" } ]
  },
  "media": [
    { "url": "…/founder-portrait.jpg", "kind": "portrait", "detected_face_count": 1, "confidence": 0.98 },
    { "url": "…/project-sabhyata-1.jpg", "kind": "project", "confidence": 0.85 }
  ],
  "pdf_extracts": [
    { "url": "…/portfolio-2024.pdf", "projects_extracted": [ … ], "text_extracted": "…" }
  ],
  "warnings": [
    "Website navigation not deterministic — team page may have been missed",
    "Portfolio PDF has 3 images without extractable metadata"
  ]
}
```

Store extraction_result as JSON — becomes the raw source for stage 2.

---

## 5. Stage 2: RESOLVE ENTITIES

**Input:** `extraction_result` + `brand_kit.supplied_*`.

**For the brand itself:**

Follow the resolver in [`ENTITY-RELATIONSHIPS.md §6`](ENTITY-RELATIONSHIPS.md).

- Match on `brand.name` + normalised `brand.website` domain + logo perceptual hash.
- ≥ 0.85 confidence → mark as `matched_existing` (updating existing brand record if kit adds new info).
- < 0.85 → mark as `new_entity`.

**For each named person:**

Same resolver. Special: check `person_aliases` (married names / initials).

**For each named project:**

Match on `project.name` + `project.city` + `project.delivered_at`.

**Output — `resolution_result`:**

```json
{
  "brand": {
    "match_status": "new_entity",   // or "matched_existing"
    "confidence": 0.92,
    "target_id": null,               // if matched_existing, the id
    "candidate_matches": []           // if multiple candidates for review
  },
  "people": [
    { "supplied_name": "Hemal Shah", "match_status": "new_entity", "confidence": 1.0 },
    { "supplied_name": "Priya Menon", "match_status": "matched_existing", "target_id": 87, "confidence": 0.95, "matched_via": "linkedin_url" }
  ],
  "projects": [
    { "supplied_name": "Sabhyata Sanctuary", "match_status": "new_entity", "confidence": 1.0 },
    { "supplied_name": "Vidya Sagar Residence", "match_status": "needs_review", "confidence": 0.65, "candidate_matches": [ { "id": 42, "name": "Vidya Sagar Villa" } ] }
  ]
}
```

Every `needs_review` blocks publish until admin resolves.

---

## 6. Stage 3: PROPOSE RELATIONSHIPS

**Input:** `resolution_result` + `extraction_result`.

For each identified person + brand:

- Infer `role` from extraction context ("Founder", "Principal Architect", "Managing Partner", etc.).
- Infer `relationship_type`:
  - Kit says `Founder & Principal` → `founder` + `is_founder=true` + `is_leadership=true`
  - Kit says "current partner" → `current`
  - Kit says "advisor" → `advisor`
- Infer `is_featured` for people prominent enough to appear on the brand's team section.

For each identified project + brand:

- Infer `role` from context — if brand IS the developer per project data, `developer`; if brand IS the architect, `architect`; etc.

For each identified project + person:

- If kit named this person as `principal_person_name` → `role='Principal Architect', is_lead=true`.

**Output — `relationships_result`:**

```json
{
  "brand_person": [
    {
      "brand_target_id": "<new_or_matched_brand>",
      "person_target_id": "<new_or_matched_person>",
      "role": "Founder & Principal Architect",
      "relationship_type": "founder",
      "is_founder": true,
      "is_leadership": true,
      "is_featured": true,
      "confidence": 0.98,
      "inferred_from": ["kit.supplied_people[0].role", "website.team_page.hemal_shah_role"]
    }
  ],
  "brand_project": [
    {
      "brand_target_id": "<horizon>",
      "project_target_id": "<sabhyata>",
      "role": "architect",
      "is_lead": true,
      "confidence": 1.0
    }
  ],
  "person_project": [
    {
      "person_target_id": "<hemal>",
      "project_target_id": "<sabhyata>",
      "role": "Principal Architect",
      "is_lead": true,
      "confidence": 1.0
    }
  ]
}
```

---

## 7. Stage 4: SUGGEST COMPOSITION

**Input:** all prior stages + `brand_kit.package_hint` + `primary_category_hint`.

1. **Look up composition rules** for `primary_category`.
2. **For each section**, determine:
   - Is content available (from extraction + resolution)?
   - Which variant fits the content shape?
   - What content_source to use?
     - `auto` if resolver can fill it from now-known entities
     - `manual_content` if AI drafted specific copy
     - `manual_select` if AI picked specific entity IDs
3. **Draft AI copy** for `manual_content` sections:
   - Hero eyebrow: "Architecture · Since {founded_year}"
   - Hero tagline: extract from website homepage headline
   - About lede: draft a 20-word summary of the brand's stated mission
   - About paragraphs: adapt the website's About paragraphs (never verbatim without attribution)

**Output — `composition_result`:**

```json
{
  "brand_target_id": "<horizon>",
  "primary_category": "architect",
  "package_hint": "spotlight",
  "motion_profile": "editorial",
  "theme_tokens": {
    "--brand": "#c67e35",     // extracted from logo dominant colour
    "--brand-soft": "#f4e4d5"
  },
  "section_configs": [
    {
      "section_id": "hero",
      "variant": "ambient",
      "content_source": "auto",
      "reasoning": "Architecture category default variant; ambient SVG can be generated per project_dynamic_abstract_brand_graphics"
    },
    {
      "section_id": "about",
      "variant": "seamless",
      "content_source": "manual_content",
      "content_source_data": {
        "heading": "The practice",
        "lede": "We build things that outlive the developer.",
        "paragraphs": [
          "Draft paragraph 1 …",
          "Draft paragraph 2 …"
        ]
      },
      "ai_confidence": 0.7,
      "requires_review": true
    },
    {
      "section_id": "work",
      "variant": "editorial",
      "content_source": "manual_select",
      "content_source_data": {
        "ids": ["<sabhyata>", "<vidya-sagar>"],
        "featured_id": "<sabhyata>"
      },
      "reasoning": "2 projects extracted; editorial variant is architecture default for small portfolios"
    }
  ]
}
```

Every AI-drafted field carries `ai_confidence` and `requires_review`.

---

## 8. Stage 5: ADMIN REVIEW

The admin UI (see [`ADMIN-CONTROLS-SCHEMA.md §4`](ADMIN-CONTROLS-SCHEMA.md))
loads the composition_result as a draft. Admin walks:

1. **Entity review** — for every `needs_review` resolution, choose:
   - Match to existing (pick a candidate)
   - Create new
   - Reject (do not create)
2. **Relationship review** — for every proposed relationship, confirm/edit/reject.
3. **Section review** — for every `requires_review: true` section, edit content or accept AI draft.
4. **Package confirmation** — assign package (may differ from `package_hint`).
5. **Publish** or **Save as draft**.

**Every AI-authored field is flagged with provenance:**

```html
<span data-provenance="ai_extracted" data-source="website.homepage.headline"
      data-confidence="0.85" data-review-status="pending">
  We build things that outlive the developer.
</span>
```

Editor can toggle a "show AI edits" view to see which fields are still
AI-provenance vs which admin has touched.

---

## 9. Stage 6: PUBLISH

Atomic operation:

1. Create/update `brands` record.
2. Create/update `people` records.
3. Create/update `projects` records.
4. Create relationship rows.
5. Create/update `profile_section_configs` rows.
6. Set `brands.status = 'published'`.
7. Register vercel.json rewrite (if new tenant) OR verify existing rewrite still points to composer.
8. Invalidate content resolver caches for the brand + every affected person + project.
9. Invalidate distribution surface caches for surfaces the brand may now appear on.
10. Log to `admin_action_log` with `action_type = 'publish'`.
11. Notify admin: "Published /brands/{slug}. See live page."

---

## 10. What AI never does

**Hard rules. Enforced at the pipeline layer.**

- Never publish without admin review — stage 5 is mandatory.
- Never overwrite `content_source != 'auto'` sections in a regeneration pass.
- Never invent statistics, project names, awards, dates, quotations. AI can extract; never fabricate.
- Never create a person without a real portrait (see [[feedback_no_person_without_portrait]]). If no portrait exists AND no verified monogram initials can be inferred, flag the person for portrait sourcing instead of creating a headless record.
- Never set commercial state (`brand.package_id`) — package assignment is admin-only.
- Never publish content that couldn't be sourced. If a fact has no `inferred_from` provenance, it doesn't ship.
- Never write in a person's voice. AI can describe a person; never quote them. Statements are Ghar.tv-authored descriptions, never words in the person's mouth (per [`BRIEF-people-pages.md §8`](BRIEF-people-pages.md)).
- Never copy verbatim from external sources. Paraphrase + attribute; original source stays in `inferred_from` for audit.
- Never violate content attribution — an article about a brand's employer doesn't automatically become an article about the person.
- Never use stock faces / AI-generated faces / generic avatars (per [[feedback_no_person_without_portrait]]).

---

## 11. Regeneration — AI runs again on an existing brand

**Trigger:** admin clicks "Refresh brand data" OR a scheduled monthly job.

**Behaviour:**

1. Re-run extraction on the brand's `website` (checks for new pages, updated About, new team members, new projects).
2. Re-run entity resolution (finds any new people to link, any new projects to link).
3. Propose new relationships (never modify existing relationships without admin review).
4. Update `content_source = 'auto'` sections only. Never touch manual overrides.
5. Present admin a diff of proposed changes.
6. Admin accepts / rejects per change.

**Guarantee:** an admin edit on a section is permanent unless the admin re-opens it for AI regeneration.

---

## 12. Failure modes + fallbacks

| failure | behaviour |
|---|---|
| Website unreachable | Extraction returns empty; admin sees "Website unreachable — supply content manually" |
| PDF fails to parse | Skip PDF; admin sees "PDF could not be parsed — copy content manually" |
| No portrait detected for a supplied person | Person NOT auto-created; flag for portrait sourcing queue |
| Multiple existing candidates for a person (both above 0.85) | Block with admin picker |
| AI confidence < 0.5 on a section draft | Section marked `requires_review = true, requires_manual_content = true` — admin must draft |
| Logo colour extraction unclear | Skip theme tokens; admin picks manually |
| Category hint doesn't match extracted content | Warn: "Kit says 'materials', extracted content suggests 'architect' — confirm category" |

---

## 13. Provenance + audit

Every field on every ingested entity carries provenance metadata.

```sql
CREATE TABLE ingestion_provenance (
  id                BIGINT PRIMARY KEY AUTO_INCREMENT,
  kit_id            VARCHAR(120),
  entity_type       ENUM('brand','person','project','product'),
  entity_id         INT NOT NULL,
  field_path        VARCHAR(200),                -- e.g. 'about.paragraphs[0]'
  source            ENUM('kit_supplied','website_extracted','pdf_extracted','ai_drafted','admin_edited'),
  source_url        VARCHAR(500) NULL,
  confidence        DECIMAL(4, 3),
  inferred_from     JSON,                          -- array of source refs
  created_at        DATETIME NOT NULL,
  overridden_at     DATETIME NULL,
  overridden_by     VARCHAR(120),
  KEY idx_entity (entity_type, entity_id)
);
```

Enables:
- Auditing where every published fact came from
- Detecting fields that need re-verification when a source changes
- Answering "did we fabricate this?" — always no; the provenance proves it

---

## 14. Cost + throughput

Not this doc's problem — implementation choice. But budget-check
during design:

- Website scrape: negligible.
- PDF parse: 10–100s per large PDF.
- Image OCR + face detection: 1–5s per image.
- LLM composition suggestion: 10–60s per section depending on model.
- Admin review: 15–60 minutes per new tenant.

A single ingestion pipeline run for a new brand: **~15 minutes of compute**, **~30 minutes of admin review**. Compare to the current manual clone-and-fill process: **~4 hours of studio time**.

The economic case is strong. Programmer picks model + hosting.

---

## 15. What the programmer builds

Concretely:

1. `secreal/ingest/BrandKitIngester.php` — orchestrator
2. `secreal/ingest/WebsiteScraper.php` — stage 1
3. `secreal/ingest/PdfParser.php` — stage 1
4. `secreal/ingest/ImageAnalyzer.php` — stage 1 (calls face detection + OCR APIs)
5. `secreal/ingest/EntityDeduplicator.php` — stage 2
6. `secreal/ingest/RelationshipProposer.php` — stage 3
7. `secreal/ingest/AICompositionSuggester.php` — stage 4 (calls LLM)
8. `secreal/admin/IngestReviewController.php` — stage 5 UI
9. `secreal/admin/IngestPublishController.php` — stage 6

Each stage stores its output as JSON in an `ingestion_runs` table. Pipeline is resumable — restarting from stage 3 doesn't re-run stage 1.

---

## 16. First working iteration

Skip stages 1 + 4 for the first version.

- **v1:** admin fills the Brand kit JSON (§2) by hand. Skip website scrape + PDF parse. AI composition suggester still runs on the supplied data.
- **v2:** add PDF parse + image analysis.
- **v3:** add website scrape.
- **v4:** add monthly regeneration.

Each version ships independently. v1 alone reduces studio time from
~4 hours to ~1 hour per tenant.

---

**Last updated:** 2026-08-31. Companion:
[`ENTITY-RELATIONSHIPS.md`](ENTITY-RELATIONSHIPS.md),
[`ADMIN-CONTROLS-SCHEMA.md`](ADMIN-CONTROLS-SCHEMA.md),
[`PROFILE-SECTIONS-SPEC.json`](PROFILE-SECTIONS-SPEC.json).
