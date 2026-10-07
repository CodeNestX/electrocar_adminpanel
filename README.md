# ElectroCar Admin Panel

Admin panel built for the [Electrocar](https://github.com/CodeNestX/Electrocar) project
(Next.js 16 + React 19 + Tailwind v4, Persian RTL).

This repo contains **only the admin-panel files**. Copy them over a clone of the main
project preserving the folder structure:

- `app/admin/**` — panel routes: login, dashboard, articles, messages, **comments (approve/reject)**, users, admins, settings
- `components/admin/**` — sidebar, topbar (search + notifications), charts, **block editor (paragraph/heading/image/quote/list)**, category manager, image picker (upload from device or link)
- `context/AdminAuthContext.tsx` — mock auth with roles (`super` / `editor`)
- `data/adminMock.ts` — demo seed data
- `lib/` — localStorage store (`adminStore.ts`), block helpers (`articleBlocks.ts`), Persian digits (`fa.ts`), file upload (`imageUpload.ts`)

Features: multilingual categories (neutral parent + fa/en subcategories, each sub
has a Latin slug so URLs look like `/articles/battery/slug`), article language
with RTL/LTR editing, three statuses (published/draft/archived), comment moderation.

> Note: also apply the `app/layout.tsx` fix from the main workspace (remove the inline
> `<script>` direction snippet — incompatible with React 19 / Next 16; direction is
> applied by `LanguageContext` instead).

## Demo accounts

- Super admin: `admin / 123456`
- Editor: `editor / 123456`
