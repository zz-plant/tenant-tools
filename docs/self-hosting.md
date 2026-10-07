# Run your own copy

This guide is for a tenant union or building group that wants to run Building Ledger on its own Cloudflare account. Then the union holds the data and the keys.

Cost: the Cloudflare free plan is enough for a few buildings. Check current Cloudflare limits before you start.

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
- `routes`: remove the `galina.kanav.net` route, or replace it with your own domain. Without a route, Cloudflare gives you a `*.workers.dev` address.
- `kv_namespaces[0].id`: the id from step 2.

## 4. Set secrets

Secrets are stored by Cloudflare and are not in the code.

```bash
npx wrangler secret put STEWARD_KEY
npx wrangler secret put EVIDENCE_SIGNING_KEY
```

- `STEWARD_KEY`: a long random value for stewards. Share it only with stewards.
- `EVIDENCE_SIGNING_KEY`: a long random value used to sign photo links. No one needs to type it.

You do not need to set building keys here. Stewards issue them on the site (step 6). If you already use `BUILDING_KEYS_JSON`, it keeps working. A key issued on the site replaces the settings key for that building.

Optional: set `SITE_URL` (your full address, such as `https://ledger.example.org`) as a variable in the Cloudflare dashboard, for links and the sitemap.

## 5. Deploy

```bash
bun run test
bun run deploy
```

## 6. Add buildings and keys

1. Open `https://YOUR-ADDRESS/steward?stewardKey=YOUR-STEWARD-KEY`. The key moves into a private cookie for 15 minutes.
2. Under "Add a building", type the street address, with no unit number.
3. Copy the new key or the resident link. It is shown only once.
4. Share the link with residents in person or in a private group chat.

## If a key reaches management

1. Open `/steward`.
2. Select "Issue a new key" for the building.
3. Share the new key with residents. The old key stops working within about a minute.

## Keep your own copy of the data

On `/steward`, under "Export data", download a CSV (for spreadsheets) or JSON (full data) file for each building. Exports have records and dated facts. They have no names, keys, or photos.

## Emergency wipe

If a building's records are no longer safe, use "Emergency wipe" on `/steward`. It deletes every record, dated fact, "me too" count, canvass, and photo for that building. It cannot be undone. Export first if you want a copy. Then issue a new key.

## Updates

```bash
git pull
bun install
bun run test
bun run deploy
```

Read `CHANGELOG.md` before you update. Keep `AGENTS.md` rules if you change the code: no names, no public evidence, no comments.
