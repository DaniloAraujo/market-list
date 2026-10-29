# Tá na Lista

A modern, feature-rich shopping list application built with React and Vite. Manage multiple shopping lists, track products with categories and prices, and share lists with others.

## Features

- 🛒 **Multiple Lists Management** - Create and manage multiple shopping lists
- 📦 **Product Organization** - Categorize products with 13+ categories (Hortifruti, Açougue, Padaria, etc.)
- 💰 **Price Tracking** - Add and track unit prices with automatic total calculations
- ✅ **Check-off Items** - Mark products as collected with visual feedback
- 🔍 **Filter & Search** - Filter products by category and view by status (pending/collected)
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 🎨 **Modern UI** - Brand-based design system with light/dark themes (Tailwind CSS + Radix UI)
- ↩️ **Undo** - Removed items and bulk actions can be undone from a toast
- 🎉 **Progress** - Running totals and a celebration when the list is complete
- 💾 **Local Storage** - Automatically saves your lists in the browser
- 🔗 **Share Lists** - Generate shareable links to import lists into other instances
- 📱 **PWA Ready** - Installable as a Progressive Web App

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

## Features in Detail

### Product Management
- Add products with name, category, quantity, and unit price
- Edit products inline with a simple click
- Delete individual products or clear entire lists
- Mark products as collected/uncollected

### List Management
- Create unlimited shopping lists
- Rename lists on the fly
- Delete multiple lists at once (minimum 1 list required)
- Switch between lists seamlessly

### Sharing
- Generate shareable links for any list
- Import shared lists into your instance
- Each imported list is independent (no sync conflicts)

### Categories
13 pre-defined categories with custom icons and colors:
- Hortifruti, Açougue, Padaria, Alimentos, Bebidas
- Limpeza, Higiene, Beleza, Pet, Farmácia
- Fitness, Itens da Semana, Outros

## PWA Support

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
