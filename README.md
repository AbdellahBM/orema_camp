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

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## 🚀 Deploying to Vercel

This project is fully compatible with [Vercel](https://vercel.com/) for seamless deployment.

### Steps to Deploy:

1. **Push your code to GitHub, GitLab, or Bitbucket.**
2. **Go to [Vercel](https://vercel.com/) and import your repository.**
3. **Configure the following settings:**
   - **Framework Preset:** Next.js
   - **Build Command:** `next build` (default)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install` (default)
4. **Set Environment Variables:**
   - If you use Supabase or other services, add your environment variables (e.g., `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the Vercel dashboard under Project Settings > Environment Variables.
5. **Click Deploy!**

### Notes:
- No custom `vercel.json` is required for standard Next.js projects.
- All static assets in the `public/` folder will be served automatically.
- For best results, ensure your `next.config.ts` does not block static export or SSR unless needed.

For more details, see the [Vercel Next.js documentation](https://vercel.com/docs/concepts/frameworks/nextjs).

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
