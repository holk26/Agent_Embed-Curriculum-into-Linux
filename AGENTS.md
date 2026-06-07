# Homero Cabrera — Terminal CV

> Personal CV website styled as a retro Linux terminal. Live at [cv.x.moonsbow.com](https://cv.x.moonsbow.com).

## Project Overview

This is a single-page React application that presents a software developer's resume as an interactive terminal experience. The site has four main views:

1. **Home (`/`)** — A simulated Linux boot sequence with dmesg-style kernel messages, followed by a TTY login prompt that auto-types credentials and transitions to the terminal.
2. **Terminal (`/terminal`)** — A fully interactive bash-like shell with commands (`help`, `ls`, `cd`, `cat`, `neofetch`, `skills`, `experience`, `education`, etc.), TAB completion, command history, and typing animations.
3. **Projects (`/projects`)** — A dual-pane file browser (vim-style on desktop, single-pane on mobile) showcasing 5 professional projects with ASCII box-drawn detail cards.
4. **Contact (`/contact`)** — A `sendmail`-style form with step-by-step field progression, plus direct contact links.

The entire UI uses a green phosphor CRT terminal aesthetic with scanlines, vignette, noise texture, and a custom terminal color palette.

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | 19.2.0 |
| Language | TypeScript | ~5.9.3 |
| Build Tool | Vite | 7.2.4 |
| Styling | Tailwind CSS | 3.4.19 |
| UI Components | shadcn/ui | New York style |
| Routing | react-router-dom | 7.14.2 |
| Animation | framer-motion, gsap | latest |
| Icons | lucide-react | 0.562.0 |
| Font | JetBrains Mono | Google Fonts |

## Project Structure

```
├── public/                  # Static assets (CRT scanlines, noise texture)
├── src/
│   ├── pages/               # Route-level page components
│   │   ├── Home.tsx         # Boot sequence + login simulation
│   │   ├── Terminal.tsx     # Interactive terminal shell
│   │   ├── Projects.tsx     # File-browser project showcase
│   │   ├── Contact.tsx      # sendmail-style contact form
│   │   └── terminal-data.ts # Command handlers, completions, output data
│   ├── components/
│   │   ├── Layout.tsx       # Root layout with CRT overlays
│   │   ├── Navbar.tsx       # Tab-like nav bar (vim buffer style)
│   │   ├── Footer.tsx       # Status bar (vim command-line style)
│   │   └── ui/              # 50+ shadcn/ui components
│   ├── hooks/
│   │   └── use-mobile.ts    # Mobile breakpoint hook (768px)
│   ├── lib/
│   │   └── utils.ts         # cn() utility (clsx + tailwind-merge)
│   ├── App.tsx              # Route definitions
│   ├── main.tsx             # Entry point (HashRouter wrapping)
│   ├── index.css            # Global styles, CSS variables, CRT effects
│   └── App.css              # Legacy Vite template styles (mostly unused)
├── index.html               # HTML entry point
├── vite.config.ts           # Vite config (base: './', alias: '@/src')
├── tailwind.config.js       # Custom terminal color palette + animations
├── postcss.config.js        # PostCSS with Tailwind + autoprefixer
├── components.json          # shadcn/ui configuration
├── eslint.config.js         # ESLint 9 flat config
├── tsconfig.json            # TypeScript project references
├── tsconfig.app.json        # App TS config
├── tsconfig.node.json       # Node/Vite TS config
└── Dockerfile               # Multi-stage build → Nginx
```

## Build and Development Commands

```bash
# Install dependencies
npm ci

# Start development server (port 3000)
npm run dev

# Production build (tsc + vite build)
npm run build

# Preview production build locally
npm run preview

# Run ESLint
npm run lint
```

## Code Style Guidelines

- **TypeScript strict mode** is enabled. All components are typed with explicit interfaces.
- **Tailwind CSS** is used for all styling. No CSS-in-JS libraries.
- **shadcn/ui components** live in `src/components/ui/` and follow the shadcn patterns (Radix UI primitives + Tailwind + `cn()` utility).
- **Terminal color tokens** are defined in `tailwind.config.js` under `theme.extend.colors.terminal` and as CSS variables in `src/index.css`:
  - `terminal-black` (#0C0C0C), `terminal-black-alt` (#141414)
  - `terminal-green` (#4AF626), `terminal-green-dim` (#2D8C16)
  - `terminal-white`, `terminal-gray`, `terminal-gray-dark`
  - `terminal-amber`, `terminal-red`, `terminal-blue`, `terminal-cyan`
- **Font**: JetBrains Mono is used globally. `font-mono` class is applied throughout.
- **Animation timing**: Cursor blink is 530ms (matching the CSS animation). Typing effects use 15–40ms per character.
- **Responsive design**: Mobile breakpoints use `md:` Tailwind prefixes. Terminal window chrome (traffic lights, title bar) is hidden on mobile.
- **Keyboard-driven UX**: Most pages support keyboard navigation (Arrow keys, Enter, Escape, Tab, Ctrl+C, Ctrl+D, Ctrl+L).

## Routing Architecture

The app uses **HashRouter** (`react-router-dom`) because it is deployed as a static SPA. Routes:

| Path | Page | Description |
|------|------|-------------|
| `/#/` | Home | Boot sequence |
| `/#/terminal` | Terminal | Interactive shell |
| `/#/projects` | Projects | File browser |
| `/#/contact` | Contact | sendmail form |

The `Layout` component wraps all routes and conditionally renders the Navbar and Footer (hidden on the home page during boot).

## Key Module Details

### `terminal-data.ts`
This is the command engine. It exports:
- `commands: Record<string, CommandHandler>` — All shell commands and their string output generators.
- `getCompletions(partial, currentDir)` — TAB completion logic.
- `getPromptPath(currentDir)` — Prompt path formatter.

Commands include: `about`, `cat`, `cd`, `clear`, `contact`, `date`, `education`, `experience`, `exit`, `help`, `history`, `languages`, `ls`, `neofetch`, `projects`, `pwd`, `skills`, `tree`, `whoami`.

Navigation commands (`projects`, `contact-form`, `exit`, `logout`) return a `navigateTo` field that the `Terminal` component uses to route via `useNavigate()`.

### `Terminal.tsx`
Implements the full terminal UX:
- Scrollback buffer with `Line[]` state.
- Per-command output renderers (`OutputRenderer`) that syntax-highlight ASCII output with terminal colors.
- Input handling: history (↑/↓), TAB completion, Ctrl+C interrupt, Ctrl+L clear.
- A 400ms processing delay before output is typed character-by-character.

### `Projects.tsx`
- Desktop: 40/60 dual-pane layout (file list + README detail view).
- Mobile: Single-pane with drill-in navigation.
- Keyboard shortcuts: ↑/↓ to navigate, Enter to open, Escape to go back, `h`/`?` for help.
- Projects are hardcoded in a `projects: ProjectEntry[]` array with ASCII box-drawn detail cards.

### `Contact.tsx`
- Simulates `sendmail` command execution with a typing animation.
- Step-by-step form: To → From → Subject → Body.
- Submit via Ctrl+D or Enter (on non-body fields). Cancel via Ctrl+C.
- Success/cancelled states with animated transitions.

## Testing

There is **no test framework currently configured** in this project. If adding tests, the recommended stack would be:
- **Vitest** (aligns with Vite)
- **React Testing Library** for component tests
- **Playwright** for E2E terminal interaction tests

## Deployment

The project is containerized with a **multi-stage Dockerfile**:
1. **Builder**: `node:22-alpine` — installs dependencies and runs `npm run build`.
2. **Runtime**: `nginx:alpine` — serves the `dist/` folder with an SPA fallback (`try_files $uri $uri/ /index.html`).

Expose port 80. Build and run:
```bash
docker build -t terminal-cv .
docker run -p 8080:80 terminal-cv
```

## Security Considerations

- The contact form logs to `console.log` only — **no backend API exists**. To make it functional, integrate a form backend (e.g., Formspree, Getform, or a custom endpoint).
- No user input is persisted or executed. All "commands" are string-mapped to static output generators.
- The app is a static SPA with no authentication or sensitive data storage.
- The `base: './'` in `vite.config.ts` ensures relative paths work when served from non-root paths.

## Adding New Commands to the Terminal

1. Open `src/pages/terminal-data.ts`.
2. Add the command name to `ALL_COMMANDS`.
3. Add a handler to the `commands` record:
   ```ts
   mycommand: () => ({
     type: 'output',
     content: 'Your output here',
   }),
   ```
4. If the command needs syntax highlighting in the terminal, add a case in `Terminal.tsx`'s `OutputRenderer` switch statement.

## Adding New Projects

1. Open `src/pages/Projects.tsx`.
2. Append a new `ProjectEntry` to the `projects` array.
3. Ensure `id` is unique and `type` is `'directory'`.
4. The detail card renders automatically with ASCII box drawing.

## Dependencies of Note

- `plugin-inspect-react-code` is included in Vite plugins for React component inspection during development.
- `lenis` is installed but not currently used in the source (available for smooth scrolling if needed).
- `recharts` is installed but not currently used (available for future chart needs).
- `next-themes` is installed (likely a shadcn/ui dependency) but theming is hardcoded to dark terminal mode.
