# Public Dark Theme Design

## Goal

Bring the landing page and authentication pages onto the same Vercel-style dark system already used by the dashboard. The change should preserve the current Solar landing structure, content, and motion, while removing light-theme page overrides and hard-coded light surfaces that clash with the dashboard.

## Scope

In scope:

- `/` landing page and its Solar components.
- `/auth/signin`.
- `/auth/signup`, which currently redirects to sign-in and should keep that behavior unless a later feature adds real sign-up.
- Shared Solar primitives that directly affect the public pages, including logo/mark, nav, buttons, cards, dividers, and illustrations.
- Global landing background override in `globals.css`.

Out of scope:

- Dashboard layout and dashboard page behavior.
- Auth provider/session behavior.
- New sign-up workflow.
- Major landing page content or section restructuring.

## Visual Direction

Use the existing dashboard tokens as the source of truth:

- Page background: `bg-background` / black.
- Primary text: `text-foreground`.
- Secondary text: `text-muted` or foreground opacity.
- Panels and cards: `bg-card/20`, `bg-white/[0.03]`, or similar dashboard-style translucent dark surfaces.
- Borders and rules: `border-border` and low-opacity white strokes.
- Accent: keep TitleChain orange for logo strokes, CTAs, section markers, and animated highlights.

The landing page should still feel like the current polished public site, not a dashboard clone. The auth pages should feel closer to the dashboard: compact, dark, quiet, and utilitarian.

## Component Changes

### Global Styling

Remove the light landing body override so public pages inherit the global black theme. Avoid introducing a second theme system.

### Landing Chrome And Nav

Change the landing wrapper from `bg-gray-50` to the dark background. Convert the sticky nav from a white glass surface to a black/translucent surface with subtle border and blur. Navigation text should use foreground/muted colors with hover states matching dashboard conventions.

### Hero

Keep the current headline, badge, CTA, and animated background. Convert badge, headline, body copy, icon, and background glow classes to dark-friendly values. The CTA can keep the orange gradient/button treatment if contrast remains strong.

### Landing Sections

Convert feature headings, paragraphs, grid lines, pattern strokes, orbit labels, sticker cards, analytics cards, testimonial text, CTA, and footer links from hard-coded light gray/white classes to dashboard-compatible dark surfaces. Preserve the existing section spacing and animation behavior.

Illustration internals that are meant to look like luminous product artifacts may keep light accents, but any text or key icon strokes must remain readable on black.

### Logo And Mark

Update `TitlechainLogo` and `TitlechainMark` so the internal strokes and wordmark do not disappear on black. Prefer `currentColor` or props-friendly styling where practical so the same mark can remain usable in dashboard and landing contexts.

### Auth Pages

Restyle sign-in to match dashboard tokens:

- Black full-screen background.
- Centered auth card using dark translucent panel, subtle border, and restrained shadow.
- Labels and headings in foreground colors.
- Inputs using dark background, border, muted placeholder, and the existing focus ring style.
- Orange submit button retained.
- Error state converted to a dark red-tinted panel.
- Demo account callout converted to a dark orange-tinted panel.
- Back link converted to muted/foreground hover colors.

Sign-up should continue redirecting to sign-in.

## Testing And Verification

Run the portal lint/test command available in the repo, or the closest targeted check if the full suite is too broad. Also run a local dev server and visually verify:

- `/` landing page on desktop and mobile widths.
- `/auth/signin` on desktop and mobile widths.
- `/auth/signup` redirect behavior.
- Dashboard still renders with its existing dark system.

Check for unreadable text, invisible logo strokes, light-page flashes, and any obvious overlap caused by changed contrast or surfaces.

## Approved Direction

The approved approach is a theme conversion with targeted polish: keep the current landing layout and animations, but make every public/auth surface align with the dashboard’s dark Vercel-style UI.
