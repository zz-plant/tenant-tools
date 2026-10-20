# Run your own copy

This guide is for a tenant union or building group that wants to run Building Ledger on its own Cloudflare account. Then the union holds the data and the keys.

Cost: the Cloudflare free plan is enough for a few buildings. Check current Cloudflare limits before you start.

The free plan allows 1,000 KV writes a day. Each resident action (a new record, a "me too", a dated fact) uses a few writes. That is enough for a few hundred actions a day. If your union runs many buildings, or a large 311 day, consider the Workers Paid plan. When the free limit is reached, saving fails until 00:00 UTC.

## What you need

- A Cloudflare account (free).
- A GitHub account, to copy the code.
- A computer with [Bun](https://bun.sh) 1.2+ and Node 20+.
- About one hour.

## 1. Copy the code

```bash
git clone https://github.com/zz-plant/tenant-tools.git
cd tenant-tools
bun install
npx wrangler login
```

## 2. Create storage

Records live in Cloudflare KV. Photos live in a private R2 bucket.

```bash
npx wrangler kv namespace create SUBMISSIONS_KV
npx wrangler r2 bucket create building-ledger-evidence
```

The first command prints an `id`. Put it in `wrangler.jsonc` under `kv_namespaces` → `id`.

Never turn on public access for the R2 bucket.

## 3. Edit `wrangler.jsonc`

- `name`: a name for your Worker, such as `our-union-ledger`.
- `routes`: replace `galina.kanav.net` with your own domain. Your domain must be on Cloudflare.
- No domain? Remove `routes` and set `"workers_dev": true`. Cloudflare then gives you a `*.workers.dev` address.
- `kv_namespaces[0].id`: the id from step 2.
- `ratelimits`: each `namespace_id` must be unique in your Cloudflare account. If another Worker in your account already uses 47104 to 47160, change these numbers.

Leave these settings as they are:

- `"keep_vars": true`: a deploy keeps variables you set in the Cloudflare dashboard. Without it, each deploy deletes them.
- `"preview_urls": false`: old versions are not served at public preview addresses.
- `"invocation_logs": false`: Cloudflare does not save request URLs. A first visit URL can hold a building key or the steward key. The app logs only failed routes and error names.

## 4. Set secrets

Secrets are stored by Cloudflare and are not in the code.

```bash
npx wrangler secret put STEWARD_KEY
npx wrangler secret put EVIDENCE_SIGNING_KEY
```

- `STEWARD_KEY`: a long random value for stewards. Share it only with stewards.
- `EVIDENCE_SIGNING_KEY`: a long random value used to sign photo links. No one needs to type it.

You do not need to set building keys here. Stewards issue them on the site (step 6). If you already use `BUILDING_KEYS_JSON`, it keeps working. A key issued on the site replaces the settings key for that building.

`SITE_URL` is your full address, such as `https://ledger.example.org`. It is used for page links, link previews, and the sitemap. It is read when the site is built, not in the Cloudflare dashboard. Set it every time you build (step 5). Without it, links point to `galina.kanav.net`.

## 5. Deploy

### From your computer

```bash
bun run test
SITE_URL=https://ledger.example.org bun run deploy
```

### From Cloudflare Workers Builds (recommended)

Cloudflare builds and deploys `main` itself. You do not make or store an API token. Deploy once from your computer first, so the Worker exists.

1. In Cloudflare, open **Workers & Pages**, then your Worker. Go to **Settings → Builds → Connect**.
2. Choose GitHub, then your copy of the repository. Set the branch to `main`.
3. Build command: `bun install --frozen-lockfile && bun run typecheck && bun run test && bun run build`
4. Deploy command: `bunx wrangler deploy`
5. Under **Build variables**, add `SITE_URL` (your full address), `BUN_VERSION` = `1.2.14`, and `SKIP_DEPENDENCY_INSTALL` = `1`. The build command installs with Bun itself.
6. Leave builds for other branches off. A branch build would use the same KV namespace and photo bucket as your live site.

After this, every merge to `main` deploys. If a check fails, nothing is deployed. Build logs are under the Worker's **Deployments** tab.

### From GitHub

Use this instead of Workers Builds, not as well. With both, each merge deploys twice.

The `deploy` job in `.github/workflows/ci.yml` deploys `main` after the checks pass. Then no one has to remember to deploy. Set it up once:

1. In Cloudflare, go to **My Profile → API Tokens → Create Token**. Use the **Edit Cloudflare Workers** template. Under resources, choose only your account and only your domain's zone.
2. Copy your **Account ID** from **Workers & Pages → Overview**.
3. In GitHub, open your copy of the repository. Go to **Settings → Secrets and variables → Actions**.
4. Add two **secrets**: `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
5. Add one **variable**: `SITE_URL`.

After this, every merge to `main` deploys. To deploy by hand, open **Actions → CI → Run workflow** on `main`. Without the secrets, the deploy job is skipped and the run summary says so.

Never put the API token in the code or in a chat. If it leaks, delete it in Cloudflare and make a new one.

## 6. Add buildings and keys

1. Open `https://YOUR-ADDRESS/steward?stewardKey=YOUR-STEWARD-KEY`. The key moves into a private cookie for 15 minutes.
2. Under "Add a building", type the street address, with no unit number.
3. Copy the new key or the resident link. It is shown only once.
4. Note the check code. After 5 minutes, reload `/steward`. The building should show the same check code. If it is different, issue a new key again.
5. Share the link with residents in person or in a private group chat.

**Only one steward should issue keys at a time.** Agree in your group who does it. All issued keys are saved together. If two stewards issue keys within a few minutes, one change can replace the other. The check code can show you that this happened, but it can miss it: Cloudflare can take more than a minute to show a change everywhere. The one-steward rule is the real protection.

## If a key reaches management

1. Open `/steward`.
2. Select "Issue a new key" for the building.
3. After 5 minutes, reload `/steward` and compare the check code. If it is different, issue a new key again. If the codes do not match, the old key may still work.
4. Share the new key with residents. The old key stops working within about a minute.

## Keep your own copy of the data

On `/steward`, under "Export data", download a CSV (for spreadsheets) or JSON (full data) file for each building. Exports have records and dated facts. They have no names, keys, or photos.

## Emergency wipe

If a building's records are no longer safe, use "Emergency wipe" on `/steward`. It deletes every record, dated fact, "me too" count, canvass, and photo for that building. It cannot be undone. Export first if you want a copy. Then issue a new key.

## Updates

If you deploy from Workers Builds or GitHub, merge the update into `main`. The checks run, then it deploys.

From your computer:

```bash
git pull
bun install
bun run test
SITE_URL=https://ledger.example.org bun run deploy
```

Read `CHANGELOG.md` before you update. Keep `AGENTS.md` rules if you change the code: no names, no public evidence, no comments.
