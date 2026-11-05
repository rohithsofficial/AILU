# How Vercel preview links work

## The short answer

Vercel builds **every branch** you push, not only `main`.

- `main` goes to your **real website**.
- Every other branch gets a **private test link**, called a preview.

A preview does not change your real website.

## A simple way to think about it

Think of a shop.

- **`main`** is the shop that customers walk into.
- **A branch** is a copy of the shop in a back room, where you try new things.
- **A preview link** is the door to that back room.
- **A PR (pull request)** is you asking: "Can I move these changes into the real shop?"
- **Merging** is saying yes. The changes then go to the real shop.

## What happens when you push

```
You push to feat/two-worlds
        |
        v
Vercel builds that branch
        |
        v
Preview link is updated (private test copy)
        |
        |   Real website does NOT change
        v
You merge the PR into main
        |
        v
Vercel builds main
        |
        v
Real website is updated
```

## The three words that cause confusion

| Word | What it is | Example |
|---|---|---|
| Branch | A separate copy of your code | `feat/two-worlds` |
| PR | A request to merge one branch into another | PR #5 |
| Preview link | A website built from one branch | `worldofailu-git-feat-two-worlds-...vercel.app` |

**The preview link belongs to the branch, not the PR.** Vercel only posts the link in the PR so it is easy to find.

## Why the link did not change after my fix

The address comes from the branch name. The same branch always has the same address.

Each push rebuilds the site behind that address. So the link stays the same, but it always shows the newest push.

Every push also gets its own fixed link that never changes. You can see those in the Vercel dashboard under Deployments. You normally do not need them.

## Your branches right now

```
main                       real website
  |
  +-- feat/dreams-private  PR #4 (merges into main)
        |
        +-- feat/two-worlds  PR #5 (merges into feat/dreams-private)
```

PR #5 is built on top of PR #4. So:

- The PR #4 preview shows the dreams work.
- The PR #5 preview shows the dreams work **and** the two worlds.

This is why the order matters:

1. Merge PR #4 into `main`.
2. Change the base of PR #5 to `main`.
3. Merge PR #5.

## Production and Preview compared

| | Production | Preview |
|---|---|---|
| Built from | `main` | Any other branch |
| Address | Your real domain | `...vercel.app` link |
| Who can open it | Everyone | Only people logged in to your Vercel team |
| Changes when | You merge into `main` | You push to that branch |

## Be careful about these

1. **Merging into `main` is what goes live.** Pushing to a branch does not. If `COMING_SOON` is on for Production, the public still sees the Coming Soon page after a merge.

2. **A preview may use your real database.** If the Preview environment has the same `DATABASE_URL` as Production, a test form on a preview saves into the real Neon database. Check this in Vercel: Settings, then Environment Variables. Claude has not checked these settings.

3. **Production and Preview have separate settings.** Each environment variable can be set for Production, Preview or both. So a preview can behave differently from the live site.

4. **Old preview links keep working.** They are private, so this is normally fine.

## Where to find things

| You want | Where to look |
|---|---|
| The preview link | The Vercel comment on the PR. Tap **Preview**. |
| All deployments | Vercel dashboard, project `worldofailu`, Deployments |
| Which one is live | The deployment marked **Production** in that list |
| Environment variables | Vercel dashboard, Settings, Environment Variables |

## Quick answers

**Does pushing to a branch change my real website?**
No. Only merging into `main` does.

**Why do I have so many links?**
Because each branch gets its own preview.

**Can customers see a preview?**
No. Your previews ask for a Vercel login.

**What if a preview looks broken?**
Nothing happens to the real site. Fix it on the branch and push again.

**Can I undo a bad release?**
Yes. In Vercel, open Deployments, pick an older Production deployment and use **Instant Rollback**.
