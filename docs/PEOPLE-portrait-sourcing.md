# /people: portrait sourcing tracker

22 people are currently hidden from `/people` because the portal rule is that
nobody is listed without a real photograph of that person. They are hidden,
not deleted: the taxonomy (discipline, city, tags, slug) is intact, so each
one returns the moment a portrait lands.

**To restore someone:** drop the file in `brand_assets/people/`, point the
card's `<img>` at it, and remove `is-no-portrait` from that card's `<article>`
in `people.html`. Nothing else changes.

---

## The rights position, and the recommended ask

Every name below is a real, identifiable person. Two things have to be true
before a photograph goes live, and neither is solved by finding an image:

1. **It is definitely them.** A wrong face under a named architect is worse
   than an empty slot. This portal has already shipped stock imagery that
   misrepresented a real client once.
2. **We are allowed to publish it.** Most press and editorial photographs of
   these people are somebody else's copyright.

**The recommended route is therefore to request an official headshot from the
firm's press or marketing contact.** That settles identity and permission in
one exchange, and firms almost always have an approved image ready. The URLs
below are the starting point for that conversation, not a download list.

---

## Verified sources

Status is what the domain returned to an automated request on 2026-08-05.
`403` / `406` means the site is live but rejects bots; it exists, it just
cannot be checked this way. Only rows marked **page found** have a confirmed
deep link to the person or the leadership listing.

### Anarock (4 people)

Leadership listing confirmed live, covers the group.

| Person | Role on our page |
|---|---|
| Anuj Puri | Chairman |
| Shobhit Agarwal | Managing Director & CEO, Anarock Capital |
| Peush Jain | Managing Director, Commercial |
| Prashant Thakur | Regional Director & Head of Research |

- **page found** https://www.anarock.com/company/leadership-team
- **page found** https://anarock.com/about/management-team

### Godrej

| Person | Source | Status |
|---|---|---|
| Pirojsha Godrej | https://www.godrejproperties.com/our-story/management/pirojsha-godrej | **page found**, dedicated profile |
| Pirojsha Godrej | https://www.godrejproperties.com/investors/governance-leadership | **page found** |
| Adi Godrej | https://www.godrejindustries.com/ | 403, site live, bot-blocked |

### Corporates

| Person | Firm | Source | Status |
|---|---|---|---|
| Irfan Razack | Prestige Group | https://www.prestigeconstructions.com/about-us | **page found** |
| Atul Chordia | Panchshil Realty | https://www.panchshil.com/ | 200, team path not located |
| Amit Syngle | Asian Paints | https://www.asianpaints.com/ | 200, team path not located |
| B. Santhanam | Saint-Gobain India | https://www.saint-gobain.co.in/ | 403, site live, bot-blocked |
| Rudra Chatterjee | Obeetee | https://obeetee.com/Contact | 200, no leadership page on site |
| Angelique Dhama | Obeetee | https://obeetee.com/Contact | 200, **see note below** |

> **Angelique Dhama needs verification before she is restored at all.** A
> search of obeetee.com returned no page naming her. Her title on our card
> ("President, Brand & Marketing") could not be confirmed against the
> company's own site. Confirm the person, the title and the employer with
> Obeetee before sourcing a photograph.

### Architecture and design practices

Small studios often do not publish founder headshots, so the press contact
route matters more here than the website.

| Person | Practice | Source | Status |
|---|---|---|---|
| Sameep Padora | sP+a | https://sp-arc.net/ | 200 |
| Ashiesh Shah | Ashiesh Shah Atelier | https://ashieshshah.com/ | 200 |
| Sanjay Puri | Sanjay Puri Architects | https://sanjaypuriarchitects.com/ | 406, live, bot-blocked |
| Brinda Somaya | Somaya & Kalappa | https://snkindia.com/ | 406, live, bot-blocked |
| Anupama Kundoo | Anupama Kundoo Architects | https://anupamakundoo.com/ | 406, live, bot-blocked |
| Rooshad Shroff | Rooshad Shroff Architecture + Design | https://rooshadshroff.com/ | 406, live, bot-blocked |
| Sandeep Khosla | Khosla Associates | https://khoslaassociates.com/ | 406, live, bot-blocked |
| Bijoy Jain | Studio Mumbai | https://studiomumbai.com/ | 444, no response, check by hand |
| Nuru Karim | NUDES | https://www.nudes.in/ | no connection, check by hand |

### Independent

| Person | Source | Status |
|---|---|---|
| Pronab Sen | https://www.theigc.org/person/pronab-sen | **page found**, dedicated profile |

---

## Three who have a file but were still hidden

These are not missing images. They are images that cannot carry a card.

| Person | File | Why it fails |
|---|---|---|
| Nuru Karim | `nuru-karim.jpg` | Not a photograph. A PATALKS podcast episode graphic carrying a third party's branding and typeset text |
| Ashiesh Shah | `ashiesh-shah.jpg` | Full body in a room, source only 588x423. Cropping to his face yields about 254px wide, softer than the card renders |
| Bijoy Jain | `bijoy-jain.jpg` | Conference stage grab. Cropped twice: every framing either clips the crown of his head or pulls in fragments of the LED wall text behind him |

Originals for anything edited are kept in `brand_assets/people/_originals/`.

---

## Quality bar for a replacement

- A photograph of that person, from the firm or the person. Never stock.
- Ideally at least 1200px on the long edge. The weakest file currently
  shipping is `hafeez-contractor.jpg` at 300x222, which is soft on a retina
  screen and should also be replaced when convenient.
- Pre-crop to 4:3 landscape with the head anchored high. The runtime
  `object-position` is a safety net, not the crop.
- Check the edges. `darshini-mahadevia.png` arrived as a template graphic
  with a gold bar down the right and a navy bar along the bottom baked in.
- Four of the nine portraits now live are black and white and the grid reads
  visibly mixed. Worth deciding one way or the other as the set grows.
