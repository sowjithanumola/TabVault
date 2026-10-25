# TabVault

TabVault is a fast, responsive personal bookmark manager built with React, TypeScript, Vite, and Tailwind CSS. It provides a dark interface with purple accents to save, categorize, search, and manage web bookmarks with Cloud Account authentication and data isolation.

All bookmarks and collections are stored securely in your personal Cloud Account with zero mock data.

---

## Key Features

- **Cloud Account Authentication**: Fast sign-in and account registration with private, isolated cloud vaults.
- **Smart URL Retrieval**: Automatically parses URLs and retrieves website titles and meta descriptions using a client-side proxy with domain heuristic fallback.
- **Collections & Spaces**: Group bookmarks into custom collections with solid color accents and dedicated icons.
- **Tagging System**: Add, search, and rename tags globally across all bookmarks.
- **Full-Text Instant Search**: Search bookmarks in real time across titles, URLs, tags, notes, and collections.
- **Dual View Modes**: Switch between a card Grid View and a high-density tabular List View.
- **Favorites & Activity Tracking**: Star favorite links and track visit counts locally.
- **Batch Operations**: Select multiple bookmarks to move between collections, toggle favorites, export, or delete in bulk.
- **JSON & HTML Import/Export**: Export complete TabVault libraries in JSON or standard Netscape Bookmark HTML format (compatible with Chrome, Safari, Firefox, Edge, and Arc).
- **Zero Mock Data**: Starts with a completely clean library ready for your real bookmarks.

---

## Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `/` or `Cmd+K` / `Ctrl+K` | Focus the global search input |
| `N` | Open the New Bookmark modal |
| `Esc` | Clear selection or dismiss modals |
| `Enter` or `,` (in tag input) | Add tag |

---

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite 8
- **Authentication & Storage**: TabVault Cloud Account System
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React

---

## Getting Started

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser at `http://localhost:3000`.

### Production Build

To test and compile the production build locally:

```bash
npm run build
npm run preview
```

---

## Free Vercel Deployment Guide

TabVault requires no server runtime and is ready for 1-click free deployment on Vercel:

1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Go to [Vercel Dashboard](https://vercel.com) and click **Add New > Project**.
3. Import your TabVault repository.
4. Keep the default build configuration:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Click **Deploy**. Vercel will build and assign you a free `*.vercel.app` domain.

---

## Data Privacy & Backups

TabVault isolates your data under your authenticated Cloud Account. We do not track or sell user activity. You can export a full JSON or HTML backup of your bookmarks at any time from **Settings & Backup**.

---

## License

MIT License. Free for personal, educational, and commercial use.
