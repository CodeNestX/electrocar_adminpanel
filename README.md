# ElectroCar Admin Panel

Admin panel built for the [Electrocar](https://github.com/CodeNestX/Electrocar) project
(Next.js 16 + React 19 + Tailwind v4, Persian RTL).

This repo contains **only the admin-panel files**. Copy them over a clone of the main
project preserving the folder structure:

- `app/admin/**` — panel routes: login, dashboard, articles, messages, users, admins, settings
- `components/admin/**` — sidebar, topbar (search + notifications), charts, block editor, category manager
- `context/AdminAuthContext.tsx` — mock auth with roles (`super` / `editor`)
- `data/adminMock.ts` — demo seed data
- `lib/` — localStorage store (`adminStore.ts`), block helpers (`articleBlocks.ts`), Persian digits (`fa.ts`)

> Note: also apply the `app/layout.tsx` fix from the main workspace (remove the inline
> `<script>` direction snippet — incompatible with React 19 / Next 16; direction is
> applied by `LanguageContext` instead).

## Demo accounts

- Super admin: `admin / 123456`
- Editor: `editor / 123456`
