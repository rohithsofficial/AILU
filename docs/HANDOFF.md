# AILU handoff

This file lets work continue on any computer. Claude reads it at the start of a session and updates it at the end.
Never put passwords, keys or connection strings here. This file goes to GitHub.

Last updated: 2026-11-06

## Owner
Rohith. Freelance developer. Often sends voice-typed messages, so read for the meaning. Use simple English and short sentences.

## Where things are
- **Live site:** https://www.worldofailu.com (hidden by `COMING_SOON=true`)
- **CRM:** https://www.worldofailu.com/admin
- **CMS:** https://www.worldofailu.com/admin/cms (guide: `docs/CMS_GUIDE.md`)
- **GitHub:** https://github.com/rohithsofficial/AILU (`main` goes live on Vercel)
- **Vercel:** project `worldofailu`, team `rohithofficial99`
- **Neon:** project `super-hat-36693606`, branch `production`
- **Blob store:** `ailu-media`, connected to Production and Preview

## What is finished
- CRM with email and password login, plus edit and delete for records.
- Two worlds: AILU World at `/`, website at `/classic`.
- Phone layout fixes, phone turning fix and a smoother intro.
- CMS with SEO and a photo library.
- Speed work. Local Lighthouse, first visit, phone: 88.
- Project files tidied into `docs/` and `_local/`.

## Next steps
1. Try one publish in the CMS on the live site. It was tested only on a local server.
2. Add real content, social links and permitted photos in the CMS.
3. Add the Google verification code in CMS, under SEO for every page.
4. Have a lawyer review the legal pages.
5. Launch: set `COMING_SOON=false` in Vercel, then run Lighthouse again.

## Waiting on a decision
- Partner reward policy. The reward screens exist, but do not use them for real rewards yet.
- Regenerating the world files: see `src/components/AiluWorld/CHANGES_FOR_GENERATOR.md`.
- Entering the world is still heavy on slow phones. The real fix needs engine changes.

## Notes for Claude
- `localhost:3000` on the office PC may be the Western Terrain Coffee Roasters project, not AILU. Check before testing.
- `.env.local` points to the live database. Test risky changes on a temporary Neon branch.
- `next start` can keep running after its task stops. Check the port before trusting a local test.
- Some Vercel connector calls fail with 403. The `vercel` command line works when signed in.
- Test names like "Rani" in `*.test.ts` files are sample customers only.

## New computer setup
1. Install Node.js, Git and VS Code. Sign in to GitHub.
2. Run these commands:

```bash
git clone https://github.com/rohithsofficial/AILU.git
cd AILU
npm install
```

3. Copy `.env.local` from the office PC to the project folder. Use a private method, such as a USB drive or a password manager. Do not email it, and do not commit it.
4. Copy `_local/` too, if you need the zip files or world source files.
5. Run `npm run dev` and open the address it prints.

## Daily routine
- Before starting: run `git pull`.
- Ask Claude to read `docs/HANDOFF.md` and continue.
- Before leaving: ask Claude to update this file, commit and push.
