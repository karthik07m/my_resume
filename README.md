# Mani Karthik Bollimuntha, résumé site

Live at https://karthik07m.github.io/my_resume/

Next.js 16 static export, Tailwind 4, a small react-three-fiber particle scene in the hero, framer-motion for reveal-on-scroll, Lenis for smooth scrolling.

## Editing content

Everything on the page comes from `src/data/resume.json`. The résumé download is `public/Mani_Karthik_Resume.docx`; replace that file to update it.

## Running

```bash
npm install
npm run dev
```

## Deploying

```bash
npm run deploy
```

Builds to `out/` and pushes it to the `gh-pages` branch. `basePath` in `next.config.ts` must match the repo name (`/my_resume`).
