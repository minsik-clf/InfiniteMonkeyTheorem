# Infinite Monkey Theorem

An idle clicker web game where monkeys randomly type characters to earn gold.

## Quick start

```bash
npm install
npm run dev                       # http://localhost:3000
```

## Features

- **Monkeys**: Each monkey randomly types alphanumeric characters.
- **Gold**: Every 3 characters typed earns 3 gold.
- **Upgrades**: Use gold to buy more monkeys. Costs scale exponentially.
- **Local Save**: Progress is saved automatically to your browser.
- **Responsive**: Works perfectly on mobile and desktop devices.

## Architecture

- **Framework**: Next.js 15.4 (App Router).
- **Styling**: Tailwind CSS v4.
- **State Management**: Zustand (with persist middleware for local storage).
- **i18n**: next-intl for English/Korean support.
- **Deployment**: Cloudflare Workers via `@opennextjs/cloudflare`.
