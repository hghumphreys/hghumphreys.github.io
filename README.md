# Hannah Grace Humphreys — personal academic website

Personal site for **Hannah Grace Humphreys**, PhD student in the Department of Linguistics at the University of Hawaiʻi at Mānoa. Her research covers linguistic anthropology, idioms, Polynesian languages and Marquesan, including fieldwork in Nuku Hiva with the Académie marquisienne. Built by Andy Kline (a friend) for Hannah.

**Live at https://hghumphreys.github.io**. Repo: https://github.com/hghumphreys/hghumphreys.github.io (Hannah's account, public; Andy is a collaborator with push access).
**Status (Nov 2026):** first push done, with **lorem ipsum placeholder content**. See *Pending* below.

## How it works
- **Hannah is not technical.** All her content lives in **one file, `data/content.json`**, and she edits it through **[Pages CMS](https://pagescms.org)**. That's a free web editor: she logs in with GitHub, fills in forms and hits Save. The form layout is defined in `.pages.yml`.
- `index.html` is a fixed template (section headings, menu, layout). `assets/js/site.js` fetches `data/content.json` and fills the page in the browser. **There is no build step.** What you preview locally is exactly what goes live.
- Hosted on **GitHub Pages**. GitHub runs Jekyll on every push, but this site has no Jekyll templates. Jekyll only copies the files, and `_config.yml`'s `exclude:` list keeps `mockups/`, `screenshots/`, the README and other working files off the public site.

### Why not a Jekyll template site?
That was the original plan. It was dropped because Jekyll can't be installed on Andy's Mac. macOS's system Ruby 2.6 is too old (the `ffi` dependency needs Ruby 3+), and `brew install ruby` failed on this macOS version (Homebrew "Tier 3"). Without Jekyll the site couldn't be tested locally. The client-side approach also has a real upside: no Jekyll build that can fail without anyone noticing after a CMS save.
Trade-off: the content is rendered by JavaScript. Google indexes it fine, and the `<head>` meta tags and the static fallback name/role in `index.html` cover link previews and no-JS visitors.

## Files
```
index.html               page template (EN/FR headings and menu are fixed text here)
data/content.json        ALL of Hannah's content. Pages CMS edits this file.
assets/js/site.js        renders content.json + EN/FR toggle
assets/css/style.css     styles (from mockups/e-editorial.html)
assets/hg-headshot.png   headshot (600×600, Nuku Hiva)
assets/hannahgrace-humphreys-cv.pdf   CV — NOT ADDED YET (the CV button 404s until it is)
assets/uploads/          where Pages CMS saves files Hannah uploads
assets/favicon.svg       rose square with an italic "hg"
404.html                 bilingual not-found page (root-absolute links, on purpose)
.pages.yml               Pages CMS form definition (field names must match content.json keys)
_config.yml              GitHub Pages: copy as-is, exclude working files
mockups/, screenshots/   design history (not published)
```

### content.json conventions (site.js depends on these)
- Bilingual fields are `{ "en": "...", "fr": "..." }`. **An empty `fr` falls back to the English text**, so French is optional for every field.
- `about`, research `description`, and publication/presentation `citation` are **HTML** (the CMS rich-text editor saves HTML, with `format: html` in `.pages.yml`). Use `<em>` for italic journal and book titles. Citations are one language only, shown in both modes. Format them in Unified Style Sheet for Linguistics style.
- **Empty lists hide their section and menu link** (research, publications, presentations, teaching). Empty `google_scholar` / `orcid` / `academia` links are left out.
- Paths (`photo`, `cv`) can be `assets/...` or `/assets/...`. site.js strips the leading slash, because the CMS writes `/assets/uploads/...`.
- If you add a field, add it in **both** `content.json` and `.pages.yml`, and render it in `site.js`.

### Editing content.json by hand (VS Code)
Andy also types content straight into `data/content.json`; the CMS and hand edits work on the same file. Things that break JSON:
- **Commas:** a comma between items, and none after the last item in a list or object. VS Code underlines mistakes in red. If the file is invalid, the page shows only the name and role.
- **Quotes inside text:** use typographic quotes (“ ” ’) in prose, which is also better typography. A straight `"` inside a string must be written `\"`.
- **Rich-text fields are HTML in a string:** wrap paragraphs as `"<p>First.</p><p>Second.</p>"` and italics as `<em>Journal</em>`.
- To add a publication, copy an existing `{ "citation": "..." }` line, put a comma between the two, and edit.
- Check: refresh http://localhost:8000/ (and with `?lang=fr`). If something's missing, the browser console says `Could not load data/content.json`.
- If both of you edit, `git pull` before editing, because Hannah's CMS saves are commits on GitHub.

## English / French toggle
Same pattern as Andy's site, andrewlkline.github.io, which has an EN/TET toggle:
- Paired `<span lang="en">` / `<span lang="fr">` elements. CSS `body[data-lang="en"] [lang="fr"] {display:none}` (and the reverse) hides the other language.
- The button flips `body[data-lang]` and `<html lang>`, and saves the choice in `localStorage["site-lang"]`.
- `?lang=fr` in the URL overrides the saved choice, which gives a shareable French link.
- **The French was written by Claude and Hannah should review it** ("Doctorante", "Terrain sur le marquisien", "Assistante d'enseignement", "Chargée de cours", "Université d'Hawaiʻi à Mānoa").

## Run locally
```bash
python3 -m http.server 8000
```
Open http://localhost:8000/ (the site) or http://localhost:8000/mockups/ (design history). `.claude/launch.json` has a `site` entry that runs the same server. It must be served over http; opening `index.html` as a file won't work, because `fetch()` of the JSON is blocked.

## Deploying
Push to `main` and GitHub Pages publishes within a minute or two. The repo is named `hghumphreys.github.io`, so it's a user site served from the root of `main`.
- `.gitignore` keeps `mockups/`, `screenshots/`, `.claude/`, `.DS_Store` and the stray Edwards PDF **out of the public repo**. Those exist only on Andy's Mac. `_config.yml`'s exclude list is a second layer, in case any of them get committed later.
- Only Hannah (the owner) can change repo Settings → Pages.

Pages CMS (still to do):
1. Hannah goes to app.pagescms.org → Sign in with GitHub → installs the Pages CMS GitHub App on `hghumphreys.github.io` → opens the repo. The `.pages.yml` is already there.
2. **Test a save from the CMS** before handing it over: edit the bio, add a talk, upload a CV. Confirm that content.json keeps its shape and the live site updates within a minute or two.

## Gotchas
- **Fonts and Polynesian characters:** the ʻokina (U+02BB) and kahakō need fonts that include them. Newsreader (used here), Source Serif 4 and Spectral do. Crimson Pro has no ʻokina and leaves a gap. Caveat draws the macron in "Mānoa" so it looks like a tilde ("Mañoa"). Check any new font by zooming in on "Hawaiʻi" and "Mānoa". Always use `ʻ`, never `'`.
- Phone header: `.nav-right { display: contents }` puts the name and the EN/FR button on one row, with the menu wrapping below. The French labels are long, and without this the header took three rows.
- Screenshots: headless Chrome (`--headless=new --screenshot --force-device-scale-factor=2 --virtual-time-budget=15000`). Chrome won't make a window narrower than about 500px, so phone shots load the page in a 390px `<iframe>` on a wrapper page. Serve the wrapper over http, not `file://`, or Google Fonts won't load.

## Pending
- **All body content is lorem ipsum**: bio, research description, publications, presentations, course names. Real facts already in place: name, position, interests, fieldwork title and location, email.
- **CV PDF**: save it as `assets/hannahgrace-humphreys-cv.pdf`.
- Google Scholar / ORCID / Academia links (hidden until filled in).
- Hannah to review the French.
- The Pages CMS config was written from its docs but **not yet tested against a live repo**.
- `05Edwards2018topdown.pdf` in the project root isn't part of the site. It's excluded from publishing; move it elsewhere if it was misplaced.

## Design history
Hannah's first brief was "very colourful and bright, pink green blue brown, fun like a Y2K 11-year-old's bedroom, serif fonts". That gave mockups A–C. The direction then moved to academic and professional, giving D and E. **E (Editorial) was chosen** and then changed: white background, EN/FR toggle, plain rectangular headshot. It keeps her four colours as muted accents (rose, sage, slate, walnut).
