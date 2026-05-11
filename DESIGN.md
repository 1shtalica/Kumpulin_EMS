# Kumpulin EMS Design Guide

This file captures the current visual direction for the Kumpulin EMS frontend. Use it as the first reference before changing UI so new work stays consistent with the pages that have already been retouched.

## Design Thesis

Kumpulin EMS should feel like a clean event operations product: bright, calm, friendly, and scan-friendly. Use soft slate surfaces, crisp white panels, restrained primary purple accents, rounded but not bubbly controls, light shadows, and subtle SVG line graphics that support the content without becoming decoration-heavy.

## Core Tokens

Use the existing Tailwind theme from `app/globals.css`.

- Font: `Poppins` for UI, `JetBrains Mono` only for ticket numbers, order IDs, codes, and other machine-readable identifiers.
- Primary: `primary`, `primary-hover`, `primary-light`.
- Secondary/accent: `secondary`, `secondary-light`, plus small amounts of green via `#10b981` or `success`.
- Text: prefer `text-slate-950` for main headings, `text-slate-900` for strong body text, `text-slate-600` for readable support copy, and `text-slate-400` or `text-slate-500` for metadata.
- Page surface: `bg-[#f9fafb]` for refreshed public sections and organizer workspaces.
- Borders: `border-slate-200/80` for panels, `border-primary/10` to `border-primary/30` for accented controls or hover states.
- Shadows: use `shadow-sm shadow-slate-900/5` for normal panels and `shadow-md shadow-slate-900/5` for prominent panels. Avoid heavy shadows.
- Radius: use `rounded-xl` for controls and compact surfaces, `rounded-2xl` for major panels and cards. Avoid very large pill/card rounding unless the control is naturally pill-shaped.

## Typography

The app uses Poppins with relatively light custom font weights, so hierarchy should come from size, spacing, and color as much as weight.

- Page title: `text-3xl font-bold leading-[1.12] text-slate-950 md:text-4xl`.
- Section title: `text-xl font-semibold text-slate-950` or compact `text-base font-semibold text-slate-950`.
- Card title: `text-lg font-semibold leading-snug text-slate-950`.
- Body copy: `text-sm leading-relaxed text-slate-600 md:text-base`.
- Metadata: `text-xs text-slate-500` or `text-[11px] font-medium uppercase tracking-wider text-slate-500`.
- Numeric stats: `text-2xl font-semibold leading-none tabular-nums`.
- Do not use oversized hero typography inside cards, sidebars, tables, or admin panels.
- Keep letter spacing normal except for tiny uppercase labels, where `tracking-wider` is acceptable.

## Page Surfaces

Organizer pages now share a light workspace treatment:

```tsx
<main className="relative min-h-[calc(100vh-136px)] overflow-hidden bg-[#f9fafb] px-4 py-6 md:-mx-8 md:px-8">
  <div
    className="pointer-events-none absolute inset-0"
    aria-hidden="true"
    style={{
      backgroundImage: "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
      backgroundSize: "28px 28px",
      opacity: 0.16,
    }}
  />
  <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-5">
    {children}
  </div>
</main>
```

Use subtle background SVG lines sparingly on refreshed pages. Keep them low opacity, usually `0.05` to `0.12`, and behind content with `pointer-events-none`.

## Panels And Cards

Use panels only when they clarify a real unit of interaction or information. Keep app UI dense but readable.

- Major header panel: `rounded-2xl border border-slate-200/80 bg-white p-5 shadow-md shadow-slate-900/5`.
- Normal panel: `rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/5`.
- Secondary inset panel: `rounded-xl border border-slate-200/80 bg-slate-50/80 p-3`.
- Hoverable card: add `transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md hover:shadow-slate-900/10`.
- Do not nest full cards inside full cards. If inner grouping is needed, use a light `bg-slate-50/70` inset or simple dividers.

## Buttons And Inputs

- Primary action buttons should be clear and compact: `h-10 rounded-xl text-sm font-semibold`.
- Secondary buttons: `variant="outline"` with `border-slate-200 bg-white text-slate-600 hover:border-primary/30 hover:text-primary`.
- Search inputs: `h-10 rounded-xl border-slate-200 bg-slate-50 pl-9 text-sm focus-visible:border-primary/40 focus-visible:ring-primary/20`.
- Use lucide icons inside buttons and inputs when a familiar icon exists.
- Avoid text-only buttons for important operational actions. Pair with an icon such as `ScanLine`, `QrCode`, `Plus`, `Settings`, or `ArrowUpRight`.

## Decorative Graphics

The current graphic language is code-native SVG, not image assets:

- Thin curved paths, faint rounded rectangles, small QR-like blocks, and occasional success check marks.
- Use `text-primary` with `strokeOpacity` or `fillOpacity` between `0.07` and `0.14`.
- A small green accent can use `#10b981` with opacity around `0.1`.
- Place graphics inside cards only when they do not compete with content. Recent event/check-in cards place graphics at the bottom-left or tucked into corners.
- Avoid large solid circles unless specifically part of the design. The previous circle treatment was removed because it felt too heavy.
- Keep graphic layers `pointer-events-none absolute` and always make content `relative`.

## Event Cards

Event cards should feel compact, visual, and operational.

- Use white cards, slate borders, subtle shadow, and `rounded-2xl`.
- Keep titles readable with `line-clamp-2`.
- Use an image ratio around `aspect-[16/10]` for public event cards when an image is present.
- Add subtle SVG graphics inside event cards, preferably behind content or in an unused corner.
- Show the most important metadata first: status, date, location, price, participants, or check-in progress depending on context.
- Avoid increasing card height unless the image or stats need it for clarity.

## Organizer Pages

Organizer surfaces are tools, not landing pages.

- Start with an operational header panel, not a marketing hero.
- Include a small uppercase context label like `Organizer workspace`.
- Use summary stats when they help scanning.
- Put search/filter controls near the list they affect.
- Empty states should be helpful but concise, with one icon/graphic and one short paragraph.
- Loading states should match the final layout with slate skeleton blocks and the same roundedness.

## Public Pages

Public landing and event pages can be more expressive, but still follow the same system.

- Use `bg-[#f9fafb]`, subtle dotted texture, and clean white event/category cards.
- Hero sections may use stronger typography and visual cards, but content must remain readable on mobile.
- Popular category cards use compact mosaics, per-card icon graphics, and restrained color accents.
- Event detail pages use softer shadows, larger readable type, rounded image frames, and calm slate text.

## Status Styling

Use semantic colors consistently:

- Success: `bg-success-light text-success` or `text-success-hover`.
- Warning/upcoming: `bg-warning-light text-warning-hover`.
- Danger/error: `bg-danger-light text-danger`.
- Draft/closed/neutral: `bg-slate-100 text-slate-500 border-slate-200`.
- Active/primary: `bg-primary-light text-primary border-primary/15`.

Status badges should usually be rounded full, compact, and include a small dot when helpful:

```tsx
<Badge className="gap-1.5 rounded-full border-primary/15 bg-primary-light px-2.5 py-1 text-[11px] font-semibold text-primary">
  <span className="size-1.5 rounded-full bg-primary" />
  Aktif
</Badge>
```

## UX Rules

- Keep operational screens dense enough for repeated use.
- Make the primary action obvious on each card or panel.
- Do not add explanatory UI text that describes the design itself.
- Avoid decorative gradients, floating orb backgrounds, or generic SaaS card mosaics.
- Prefer consistent spacing and alignment over extra visual effects.
- Check mobile layouts for long event names, locations, and button labels.
- Use tables for dense history/participant data, but keep headers small and rows readable.

## Implementation Notes

- Use existing components from `components/ui` before adding new primitives.
- Use `cn` from `@/lib/utils` for conditional classes.
- Use lucide-react icons.
- Keep SVG graphics inline when they are simple and tied to a component.
- Keep changes scoped. Do not restyle unrelated legacy screens unless the task asks for it.
- Run focused lint on touched files, for example:

```bash
npx eslint 'app/organizer/(main_pages)/check-in/page.tsx'
```

