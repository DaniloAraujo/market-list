# Tá na Lista

A modern list app built with React and Vite. Make lists for groceries, home, trips, work or anything else, organise items with categories (including your own, with emoji) and prices, and share lists with others in real time.

## Features

- 🛒 **Multiple Lists Management** - Create and manage multiple shopping lists
- 📦 **Product Organization** - Categorize products with 13+ categories (Hortifruti, Açougue, Padaria, etc.)
- 💰 **Price Tracking** - Add and track unit prices with automatic total calculations
- ⚖️ **Units** - Items are counted in units by default; switch to packages or kilos (kilos move in 250 g steps: 250 g, 500 g, 750 g, 1 kg, 1.25 kg...) and the price becomes per kg
- ✅ **Check-off Items** - Mark products as collected with visual feedback
- 🔍 **Filter & Search** - Filter products by category and view by status (pending/collected)
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 🎨 **Modern UI** - Brand-based design system with light/dark themes (Tailwind CSS + Radix UI)
- ↩️ **Undo** - Removed items and bulk actions can be undone from a toast
- 🎉 **Progress** - Running totals and a celebration when the list is complete
- 💾 **Local mode** - Without an account, lists stay in the browser (localStorage)
- ☁️ **Cloud mode** - Sign in (e-mail/password or Google) to keep up to 3 lists (150 items each) in your account, on any device
- 🔗 **Sharing** - Invite people by link (valid for one person, expires in 4 hours) as *read-only* or *editor*; shared lists appear next to your own, and the owner can remove people at any time
- 🗑️ **Delete account** - Accounts are deactivated, not erased; the same e-mail (or Google) can reactivate it and bring the lists back
- 🔄 **Real time** - Changes made by other people or other devices appear instantly (WebSocket)
- 📱 **PWA Ready** - Installable as a Progressive Web App
- 📴 **Offline start** - The app shell is cached and the last synced lists are shown without a connection; changes made offline are not queued yet

## Tech Stack

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Motion** - List and progress animations
- **Sonner** - Toasts with undo
- **canvas-confetti** - Completion celebration
- **Fontsource** - Bricolage Grotesque + Figtree, self-hosted
- **Lucide React** - Icon library
- **LocalStorage API** - Data persistence

## Backend (accounts, sharing, sync)

Login, cloud lists and sharing are served by [market-list-api](https://github.com/DaniloAraujo/market-list-api).
The app talks to it through `VITE_API_URL`:

```bash
cp .env.example .env.local   # or use the default in .env.development (http://localhost:8787)
```

- **Without `VITE_API_URL`** (e.g. a production build before the API is deployed) the app runs in local-only mode:
  login screens and invite routes are hidden and the Share button just says it is coming soon.
- On Vercel, set `VITE_API_URL` to the deployed API URL; `vercel.json` already rewrites all paths to the SPA
  (needed for `/invite/...`, `/verify-email`, `/auth/callback`).
- When a user signs in for the first time, the app offers to import the lists saved in the browser
  (respecting the account limits).

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd ta-na-lista
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Tests

```bash
npm test
```

Vitest covers the optimistic-update ordering (out-of-order responses, rollbacks, bulk actions), the offline
snapshot, the template data and the service worker caching rules.

## Features in Detail

### Product Management
- Add products with name, category, quantity, and unit price
- Edit products inline with a simple click
- Delete individual products or clear entire lists
- Mark products as collected/uncollected

### List Management
- Create lists from scratch or from ready-made templates (weekly groceries, baby layette, barbecue, moving, travel...)
- Rename lists on the fly
- Delete a list from its menu, or leave a list that someone shared with you
- Switch between lists with the chips at the top

### Sharing
- Signed-in owners generate invite links (read-only or editor); a link works for one person and expires in 4 hours
- Everyone with access sees changes in real time (WebSocket); each item records who edited it
- The owner can see who has access and remove people
- Legacy `?list=` links (a base64 copy of a list) are still imported as an independent copy in local mode

### Categories
13 pre-defined categories with custom icons and colors:
- Hortifruti, Açougue, Padaria, Alimentos, Bebidas
- Limpeza, Higiene, Beleza, Pet, Farmácia
- Fitness, Itens da Semana, Outros

## PWA Support

Invite and e-mail links open the installed app when the platform allows it: Android and desktop Chrome/Edge
use the manifest (`scope`, `handle_links`, `launch_handler`). iOS never opens links in a Home Screen app, so
there the link opens in Safari.

The app is configured as a Progressive Web App and can be installed on:
- **Desktop** - Chrome, Edge, Firefox
- **Mobile** - iOS Safari, Android Chrome

Installation prompts will appear when the app is ready to be installed.

## Browser Support

Modern browsers with ES6+ support:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Private project
