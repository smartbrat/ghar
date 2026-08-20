# PRICE LOOKUP PLAYBOOK

Find the starting price and the per-sq-ft rate for any Indian real estate project, by name.

Designed to run headless via Claude Code (Hostinger VPS or any server). Give it a project
name, it returns a normalised price line. All areas are converted to **square feet only**.

---

## 1. OUTPUT CONTRACT

The agent returns exactly one of these three shapes. Nothing else is a valid answer.

| Case | Output shape | Example |
|---|---|---|
| Only a floor price is published | `₹<X> onwards` | `₹1.2 Cr onwards` |
| A full range is published | `₹<X> to ₹<Y>` | `₹1.2 Cr to ₹3 Cr` |
| Nothing credible found | `NOT FOUND` + reason | `NOT FOUND: no portal listing, no builder source` |

Every non-`NOT FOUND` answer must also carry:

- `rate_per_sqft` : the per-square-foot rate, in ₹, as an integer
- `area_basis` : `super` | `built-up` | `carpet` | `unknown`
- `area_range_sqft` : the unit sizes, in sq ft, always
- `source_tier` : 1, 2 or 3 (see §4)
- `source_url` : the single URL the price came from
- `as_of` : the publication or crawl date of that source
- `confidence` : `high` | `medium` | `low`

### JSON schema (use this for machine consumption)

```json
{
  "project": "string",
  "developer": "string|null",
  "locality": "string",
  "city": "string",
  "state": "string",
  "price_display": "₹1.2 Cr onwards",
  "price_min_inr": 12000000,
  "price_max_inr": null,
  "rate_per_sqft": 8585,
  "rate_basis": "derived|published",
  "area_basis": "super|built-up|carpet|unknown",
  "area_min_sqft": 1050,
  "area_max_sqft": 3400,
  "configs": ["2 BHK", "3 BHK"],
  "source_tier": 1,
  "source_url": "https://...",
  "as_of": "2026-07-18",
  "confidence": "high",
  "conflicts": [],
  "notes": ""
}
```

`price_max_inr` is `null` for the `onwards` case. That null **is** the signal, do not fake a ceiling.

---

## 2. INPUT

Required: **project name**.

Strongly recommended, because Indian project names collide constantly:

- locality (e.g. Noida Extension)
- city (e.g. Greater Noida)
- state (e.g. Uttar Pradesh)
- developer (e.g. RedBricks Builder)

The more of these supplied, the fewer disambiguation failures in §5.

---

## 3. PREREQUISITES

- Claude Code CLI, authenticated.
- **Nimble MCP server** connected. Plain `WebFetch` is not sufficient: the major Indian
  portals serve a bot wall or a React shell to unauthenticated fetches. Nimble's
  `nimble_search` and `nimble_extract` render the page and return real content.
- Optional: Playwright MCP, as a fallback for pages Nimble returns empty for.

Verify before a batch run:

```bash
claude mcp list
```

---

## 4. SOURCE LADDER

Search in this order. Stop climbing the moment a tier resolves a price, but always record
whether a **lower-numbered tier disagrees**.

### Tier 1: major portals (preferred, best structured)

```
99acres.com
magicbricks.com
housing.com
squareyards.com
proptiger.com
nobroker.in
commonfloor.com
```

These publish an explicit `Avg. Price ₹X/sq.ft` field. When present, take it as
`rate_basis: "published"` rather than deriving it.

### Tier 2: the builder's own channels

Official site, Facebook page, Instagram profile, YouTube description, brochure PDF.

Use this when Tier 1 has no project page at all, which is normal for pre-launch,
new-launch and builder-floor projects. Builder-published prices are primary source but
they are **marketing asking prices**, not transacted prices. Cap confidence at `medium`
and say so in `notes`.

### Tier 3: aggregators and syndicators

`aurumproptech.in`, `realtypromoo.com`, local broker sites, `ghar.tv` itself.

Lowest trust. Use only to corroborate, never as the sole source. Confidence `low`.

**Never** price a project off Quora, forum posts, or a broker's WhatsApp-style reel caption
with no unit sizes attached.

---

## 5. DISAMBIGUATION (the step that actually breaks things)

Indian project names repeat across cities and builders reuse a prefix across their own
portfolio. Before accepting any price, run all four checks:

1. **City match.** Confirm the result's city and state match the input. A search for
   "RB Heights" returns a Patna project at ₹6,528/sq ft that has nothing to do with the
   Noida Extension one.
2. **Sibling-project match.** Confirm the project name matches in full, not by prefix.
   RedBricks Builder ships RB Heights, RB Edifice, Redbricks Vista and Redbricks Pristine
   Villas in the same locality at four different price points. A prefix match here silently
   returns the wrong number.
3. **Phase and tower match.** "RB Heights (Tower-Legacy)" may be priced differently from
   the base RB Heights. Capture the phase or tower label in `project` if the source names one.
4. **Sector match.** If one source says Sector 10 and another says Sector 1, they are
   probably not the same asset. Log both in `conflicts` and do not average them.

If two credible sources disagree and you cannot resolve which is correct, report the one
whose full caption or page body you actually read, and list the other under `conflicts`.
Search-engine snippets are notorious for stitching text from a different post on the same
profile onto the URL you asked about. Trust the extracted page body over the snippet.

---

## 6. AREA CONVERSION (STRICT, sq ft only)

Any area found in another unit is converted to sq ft before it appears anywhere in the
output. Never emit sq m, gaj, acre or any local unit in the final answer.

### Exact factors

| Unit | Sq ft | Note |
|---|---|---|
| 1 sq metre (sq m) | 10.7639 | most common on RERA filings |
| 1 sq yard (gaj / var) | 9 | exact |
| 1 acre | 43,560 | exact |
| 1 hectare | 107,639 | |
| 1 marla | 272.25 | Punjab, Haryana, HP |
| 1 kanal | 5,445 | = 20 marla |
| 1 cent | 435.6 | Kerala, TN, Karnataka |
| 1 ground | 2,400 | Tamil Nadu |
| 1 ankanam | 72 | Andhra Pradesh, Telangana |
| 1 guntha | 1,089 | Maharashtra, Karnataka |
| 1 dismil / decimal | 435.6 | Bihar, Jharkhand, UP |

### State-variable units: DO NOT convert silently

`bigha`, `biswa`, `katha`, `kattha`, `lecha`, `chatak` have no national value. Examples of
the spread: a Bihar katha is 1,361.25 sq ft, a West Bengal katha is 720 sq ft. A western UP
pucca bigha is 27,000 sq ft, a kaccha bigha is far smaller.

Rule: convert **only** if the source states the state, and then use that state's factor and
record it in `notes`. If the state is unknown, set `area_min_sqft: null`, set
`confidence: "low"`, and say in `notes` which ambiguous unit blocked the conversion.
Guessing here produces an error of several hundred percent.

### Rounding

Round converted areas to the nearest whole sq ft. Round `rate_per_sqft` to the nearest ₹1.
Never round before dividing.

---

## 7. PRICE PARSING

### Indian magnitude words

| Token | Multiplier |
|---|---|
| `K` | 1,000 |
| `L`, `Lac`, `Lakh`, `Lakhs` | 100,000 |
| `Cr`, `Crore`, `Crores` | 10,000,000 |
| `Ar`, `Arab` | 1,000,000,000 |

Accept `₹`, `Rs`, `Rs.`, `INR`, and bare numbers in an obvious price column. Accept the
Indian digit grouping `47,00,000` (which is 47 lakh, **not** 4.7 million) as well as
`4,700,000`. Parsing `47,00,000` with a Western thousands-separator assumption yields
₹470,000, a 10x error, so strip separators before evaluating rather than pattern-matching
on comma position.

### Deriving the rate

```
rate_per_sqft = round(price_inr / area_sqft)
```

Compute it from the **smallest configuration** to get the entry rate, since the output is a
starting price. Also compute it for the largest and note the spread if the two differ by
more than 20 percent, because that usually means the source mixes carpet and super area.

### Display formatting

- Below ₹1 crore: express in lakh, one decimal max, e.g. `₹47 L`, `₹83.5 L`
- ₹1 crore and above: express in crore, two decimals max, e.g. `₹1.2 Cr`, `₹3 Cr`
- Strip trailing zeros: `₹3 Cr`, not `₹3.00 Cr`
- Always prefix `₹`

---

## 8. THE AREA-BASIS TRAP

The single largest source of wrong per-sq-ft numbers. The same project can legitimately
show two very different rates because portals divide by different areas:

- **Carpet area**: usable floor, RERA-mandated basis. Smallest number, so highest rate.
- **Built-up area**: carpet plus walls, roughly 1.1x to 1.2x carpet.
- **Super built-up / saleable**: plus a share of common areas, roughly 1.25x to 1.5x carpet.
  Largest number, so lowest rate.

Real observed case: RB Edifice, Noida Extension. housing.com showed about ₹4,200/sq ft while
proptiger showed ₹2,588/sq ft for the same project. Neither is wrong, they are different bases.

Rules:

1. Record `area_basis` on every answer. `unknown` is an acceptable and honest value.
2. Never compare or average rates across different bases.
3. Builder-floor and plotted projects almost always quote super area and will look
   dramatically cheaper per sq ft than a RERA tower in the same sector. That gap is a unit
   artefact, not a bargain. Note it rather than flagging the project as underpriced.
4. If a portal snippet shows a stray `10.76`, that is the sq m to sq ft factor bleeding
   through the UI, not an area or a price. Discard it.

---

## 9. SANITY CHECKS BEFORE RETURNING

Reject and re-search if any of these fire:

- `rate_per_sqft` below ₹800 or above ₹150,000, unless the project is explicitly ultra-luxury
  in a Tier 1 city core. This usually means a magnitude-word or unit-conversion error.
- `price_min_inr` divided by `area_min_sqft` disagrees with a published `rate_per_sqft` by
  more than 25 percent. Report both, do not pick one silently.
- Derived rate is more than 3x or less than 0.3x the locality average for the same asset type.
  Fetch the locality average from the portal's "Property Rates in <locality>" page as a check.
- `price_max_inr` is less than `price_min_inr`.
- Any final field still carries a non-sq-ft unit.

---

## 10. WORKED EXAMPLE

Input: `Redbrick RB Heights, Noida Extension, Greater Noida, Uttar Pradesh`

Tier 1 returned nothing. All six portals carry only the sibling projects RB Edifice,
Redbricks Vista and Redbricks Pristine Villas. Tier 2 resolved it: the developer's own
Facebook post dated 18 July published a full price list.

```json
{
  "project": "RB Heights",
  "developer": "RedBricks Builder",
  "locality": "Sector 10, Noida Extension",
  "city": "Greater Noida",
  "state": "Uttar Pradesh",
  "price_display": "₹47 L to ₹83.5 L",
  "price_min_inr": 4700000,
  "price_max_inr": 8350000,
  "rate_per_sqft": 4476,
  "rate_basis": "derived",
  "area_basis": "super",
  "area_min_sqft": 1050,
  "area_max_sqft": 3400,
  "configs": ["2 BHK", "3 BHK", "2 BHK Duplex", "3 BHK Duplex"],
  "source_tier": 2,
  "source_url": "https://www.facebook.com/100076407458276/videos/luxury-builder-flats-starting-from-4689l/2556583674782126/",
  "as_of": "2026-07-18",
  "confidence": "medium",
  "conflicts": [
    "A ₹8,585/sq ft figure appears in search snippets attributed to the project's Instagram post, but the extracted caption for that post states Sector 10, lists no price, and gives a contact number instead. Unresolved: may be a different phase or a repricing."
  ],
  "notes": "Gated builder-floor project, not a RERA tower. Not listed on any Tier 1 portal, likely pre-launch. Builder asking price, not transacted. Rate derived from smallest config (₹47,00,000 / 1050 sq ft). Largest config derives to ₹2,456/sq ft, a wide spread typical of duplex super-area quoting. Sector 10 apartment average is roughly ₹9,700 to ₹10,850/sq ft, the gap is the builder-floor unit artefact described in §8."
}
```

Confidence is `medium`, not `high`, because the source is Tier 2 marketing copy and an
unresolved conflicting rate exists.

---

## 11. RUNNING IT

### Single project

```bash
claude -p "Follow docs/PRICE-LOOKUP-playbook.md exactly. \
Project: <PROJECT NAME>. Locality: <LOCALITY>. City: <CITY>. State: <STATE>. \
Return only the JSON object from section 1." \
  --output-format json
```

### Batch from a file

`projects.txt`, one project per line, pipe-delimited:

```
RB Heights|Noida Extension|Greater Noida|Uttar Pradesh
Godrej Woods|Sector 43|Noida|Uttar Pradesh
```

```bash
while IFS='|' read -r name locality city state; do
  claude -p "Follow docs/PRICE-LOOKUP-playbook.md exactly. \
Project: $name. Locality: $locality. City: $city. State: $state. \
Return only the JSON object from section 1." \
    --output-format json >> prices.jsonl
  sleep 3
done < projects.txt
```

The `sleep` is deliberate. Hammering the portals in a tight loop gets the server's IP
rate-limited, after which every subsequent lookup silently returns `NOT FOUND`.

### On Hostinger specifically

- Run under `tmux` or `screen`, or as a `systemd` unit. A batch of any size outlives an SSH session.
- Node 18+ is required for the Claude Code CLI. Hostinger's default Node on shared plans is
  often older, so check `node -v` and use `nvm` if needed. A VPS plan is the safer target;
  shared hosting frequently blocks the long-lived outbound connections the MCP servers need.
- Store the API key in the environment, not in the script. Never commit it.
- Append to `.jsonl` rather than rewriting a `.json` array, so a crash mid-batch does not
  destroy completed work.

---

## 12. FAILURE MODES

| Symptom | Cause | Fix |
|---|---|---|
| Every lookup returns `NOT FOUND` | IP rate-limited by portals | Increase `sleep`, retry later |
| Price is 10x or 100x off | Indian digit grouping parsed as Western | See §7, strip separators first |
| Rate is 3x expected | Carpet vs super area basis | See §8, record the basis |
| Wrong city's project returned | Name collision | See §5 check 1 |
| Sibling project's price returned | Prefix match instead of full match | See §5 check 2 |
| Nimble returns empty content | JS-heavy page, or login wall | Retry with `wait: 6000`, then Playwright |
| Nimble output exceeds token limit | Huge social page | Output is auto-saved to a file, grep it |
| Area silently wrong by 300% | `bigha` or `katha` converted without state | See §6, refuse to convert |

---

## 13. HARD RULES

1. Areas in the output are sq ft. Always. No exceptions.
2. Never invent a price ceiling to complete a range. `onwards` is a valid, complete answer.
3. Never average prices from different sources or different area bases.
4. Never let a search-engine snippet outrank an extracted page body.
5. Always carry `source_url` and `as_of`. A price with no date is not usable.
6. `NOT FOUND` is a correct answer. A fabricated price is not.
