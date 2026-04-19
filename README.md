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

Because `next.config.js` uses `output: 'standalone'`, production startup uses the generated standalone server through `npm start`. The wrapper forces Railway deployments to bind to `0.0.0.0` instead of a platform-specific `HOSTNAME`, which prevents the container from failing to accept traffic.
