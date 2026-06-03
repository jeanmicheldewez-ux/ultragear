# GitHub Pages

This repository now has a root `index.html` landing page suitable for GitHub Pages.

## Published Paths

Expected Pages URLs after publishing:

- Project landing page: `https://<user>.github.io/<repo>/`
- Browser app: `https://<user>.github.io/<repo>/browser-app/`
- Separate midi2sound demo: `https://jeanmicheldewez-ux.github.io/midi2sound/`

## Setup

1. Push the repository to GitHub.
2. Open the repository settings.
3. Go to Pages.
4. Set the source to the main branch and repository root.
5. Save and wait for GitHub Pages to build.
6. Open the published root URL.
7. Click `Open Browser App`.

## Web MIDI Notes

Web MIDI support is browser-dependent. Chrome and Edge are the most reliable options. GitHub Pages serves over HTTPS, which is suitable for Web MIDI permission prompts.

If testing locally, serve the repo with:

```powershell
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/browser-app/
```

## Asset Paths

The landing page links use relative paths. The browser app files were moved together into `browser-app/`, so its existing local references such as `ultra.css`, `ultra.js`, `ultrasound.js`, `tone_15_04.js`, `nexusUI.js`, and `Amen-break.wav` remain relative to the app entry point.
