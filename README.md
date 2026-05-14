This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load Geist, a modern font family.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Railway

Production deployments are triggered by the GitHub Actions workflow in `.github/workflows/railway-deploy.yml` whenever `main` is updated.

Configure the `RAILWAY_TOKEN` GitHub repository secret so the workflow can deploy the `Forschen` Railway service.

The committed `railway.json` codifies the current Railway builder/runtime defaults so dashboard-only deploy settings do not drift from the repository.

For app data persistence in Railway, set `GITHUB_TOKEN` in the Railway service. The app now enables GitHub-backed JSON storage automatically on Railway; `ENABLE_GITHUB_DATA_SYNC=true` is only needed outside Railway if you want to force the same behavior manually.

Because `next.config.js` uses `output: 'standalone'`, production startup uses `npm start` and reads the generated `.next/required-server-files.json` config directly. The wrapper keeps static assets available and intentionally avoids forcing Next.js to validate requests against a single `HOSTNAME`, which prevents proxied CSS, JS and image requests from failing with `400 Bad Request`. If a fixed hostname is ever required, set `STANDALONE_HOSTNAME` explicitly.
