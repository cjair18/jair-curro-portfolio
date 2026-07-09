# Jair Curro — Portfolio

Personal portfolio site. Analyst → Product.

Built with React, Vite, and React Router. Dark, minimal design with Space Grotesk + Inter.

## Pages

- **Home** — intro, target roles, quick stats
- **Work** — PM case studies (Instacart, Blackstone) and experience
- **About** — story, education, interests
- **Credentials** — certifications and skills

## Run locally

```bash
npm install
npm run dev
```

Node.js 18+ required. On this machine Node is installed at `~/.local/node/bin`
(add it to your PATH if `node` isn't found).

## Build & deploy

```bash
npm run build
```

Output goes to `dist/`. The repo includes `netlify.toml`, so deploying to
Netlify is automatic: connect the repo (or drag-and-drop the `dist` folder at
app.netlify.com) and it will build with `npm run build` and publish `dist`.

## Updating content

All content lives in `src/pages/` as plain data arrays at the top of each
file — edit the text there. To add a headshot later, drop the image into
`public/` and reference it from `src/pages/About.jsx`.
