# hmkconf - Web Configurator for libhmk Keyboards

For more information about libhmk, see the [libhmk repository](https://github.com/peppapighs/libhmk).

## Prerequisites

- [Node.js](https://nodejs.org/en/)
- [bun](https://bun.sh)

## Getting Started

1. Install the dependencies:

```bash
bun install
```

2. Start the development server:

```bash
bun dev
```

Open [http://localhost:5173](http://localhost:5173) with your browser to see the result.

## Deploy to Cloudflare Workers

This app is configured for [Cloudflare Workers](https://developers.cloudflare.com/workers/) via [`@sveltejs/adapter-cloudflare`](https://svelte.dev/docs/kit/adapter-cloudflare).

1. Log in to Cloudflare (once):

```bash
bunx wrangler login
```

2. Build and deploy:

```bash
bun run deploy
```

The site will be available on your `*.workers.dev` subdomain (for example `https://hmkconf.<your-subdomain>.workers.dev`).

To preview the production build locally with the Workers runtime:

```bash
bun run preview
```
