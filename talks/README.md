# Talks

Slide decks for meetups and conferences. A talk lives in three places:

| Where | What | Deployed? |
|---|---|---|
| `talks/<yyyy-mm>-<id>/` | deck sources: `deck.js`, `.pptx` | no |
| `src/content/talks/<id>.md` | the talk page: event, date, abstract, links | → `/talks/<id>/` |
| `public/talks/<id>/` | `slides.pdf` + demo material (scripts, notebooks, configs) | yes, as files |

The talk page picks up `public/talks/<id>/` on its own: `slides.pdf` becomes the
Slides button, everything else is listed as demo material (notebooks get an
nbviewer link). Once a recording is public, add `recording: <url>` to the
talk entry: YouTube links are embedded on the page, any other host gets a
Recording button. The closing slide's QR code points at `https://datadave.dev/talks/<id>/`.

Before publishing demo files: clear notebook outputs, and no tenant IDs,
workspace URLs, tokens or customer data. Max 25 MiB per file (Cloudflare
static assets limit).

```
talks/
  _template/              the slide system
    brand.js              layouts, theme, helpers (single source of truth)
    showcase.js           builds the template showcase below
    qr.py                 QR codes for the closing slide
    assets/               logo (dark/light), round avatar, sample image
    datadave-dark.potx    PowerPoint template — default
    datadave-light.potx   PowerPoint template — for bright rooms
    datadave-dark.pdf     preview of every layout
  <yyyy-mm>-<id>/         one folder per talk
    deck.js               builds the deck from brand.js
    <id>.pptx             the deck (PDF export goes to public/talks/<id>/slides.pdf)
```

## The frame every talk shares

| Position | Layout | Per talk |
|---|---|---|
| Start 1 | `DD · Title` | event · date, title, subtitle |
| Start 2 | `DD · About` | nothing — fixed |
| … | content layouts | everything |
| End | `DD · Closing` | QR target + caption (e.g. link to the slides or post) |

Content layouts: `Section` (with progress pipeline), `Content`, `Title only`
(agenda, cards, stats, diagrams), `Two columns`, `Statement`, `Code`,
`Text + image`, `Demo`, `Blank`.

## Design

Same system as the blog (`src/styles/global.css`): GitHub Primer palette,
IBM Plex Sans for text, IBM Plex Mono for kickers/code/labels, Fraunces only
for the title-slide headline and "Thank you." — the one signature moment, like
the post `<h1>` on the site. The logo's pipeline (line + three nodes) is the
motif: title slide, agenda, section progress, closing.

Slides are always in English, whatever language the talk is given in.

## Fonts — before presenting

The decks use **IBM Plex Sans**, **IBM Plex Mono** and **Fraunces**. Install them
on the presenting Mac:

```sh
brew install --cask font-ibm-plex-sans font-ibm-plex-mono font-fraunces
```

Presenting from someone else's machine: in PowerPoint for Mac, *Preferences →
Save → Embed fonts in the file* before copying the deck over — and always
bring the PDF on a stick as fallback.

## Building

```sh
cd talks/_template && node showcase.js      # rebuild the templates
cd talks/<talk> && node deck.js             # rebuild a deck
```

Needs `pptxgenjs` (`npm i -g pptxgenjs`) and Python 3 with `reportlab` for QR codes.
