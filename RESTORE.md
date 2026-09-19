# Restore to pre-impeccable state

Use this guide when impeccable's design skills/hooks need to be undone and the project returned to the point before they were installed.

## What "pre-impeccable" means

The last commit before impeccable was installed is:

- **Commit:** `88ea022` — "Hide desktop search on tablet, keep it inside hamburger menu"
- **Branch:** `pre-impeccable` (pushed to `origin/pre-impeccable`)

Everything before and including `88ea022` is clean, runnable project state with no impeccable files.

## What impeccable added

The next commit, `0e416d1` ("Add impeccable skills and PRODUCT.md from init"), introduced:

- `.claude/settings.local.json` — impeccable skill registration for Claude Code
- `.codex/hooks.json` — impeccable hooks for Codex CLI
- `PRODUCT.md` — product-truth file created by `$impeccable init`

Skills were also installed globally (outside the repo) at:

- `~\.agents\skills\impeccable\`
- `~\.claude\skills\impeccable\` (if applicable)

These global installs are not tracked by git and do not affect the build.

## How to restore

### Option A — Hard reset main back to pre-impeccable (destructive to history since `0e416d1`)

```bash
git checkout main
git reset --hard 88ea022
git push --force-with-lease origin main
```

This erases `0e416d1` from `main`. The `pre-impeccable` branch still points at `88ea022` as a backup.

### Option B — Revert the impeccable commit while keeping history (safe, non-destructive)

```bash
git checkout main
git revert 0e416d1 --no-edit
git push origin main
```

This adds a new commit that un-does the impeccable files, without rewriting history.

### Option C — Just switch to the pre-impeccable branch (no main changes)

```bash
git checkout pre-impeccable
```

Use this to inspect the old state without modifying `main` at all.

## After restoring

The codebase is a normal Vite + React app and will run with:

```bash
npm install
npm run dev
```

If you later want impeccable back, it can be reinstalled with:

```bash
npx impeccable install
```