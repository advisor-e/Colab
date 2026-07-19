# Deployed Versions — the ledger

> **Version-Pull Recording Rule (binding).** Any time this repository's code is pulled,
> installed, or updated in any environment beyond a developer's own machine — UAT,
> production, a demo, or inside the Advisory.com master app — the person doing it must
> record it **at that moment** in the table below: the date, the environment, the exact
> commit hash pulled, who pulled it, and any notes. **A deployment is not complete until
> its row is written.** This is how everyone always knows which version is running
> where, and in what state.

How to find the commit hash you are pulling: `git rev-parse HEAD` immediately after the
pull, or read it from the GitHub commits page. Record the full state honestly — if the
hash wasn't captured at the time, add the row anyway with "commit unknown" and backfill
it as soon as it can be established.

| Date | Environment | Commit | Pulled by | Notes |
|---|---|---|---|---|
| — | — | — | — | *No deployments yet (as of 2026-07-20 this app runs only on developer machines — that is useful information in itself).* |
