# ScaleOps Media Website — Codex Operating Instructions

## Objective
Maintain a fast, conversion-focused ScaleOps Media website without changing the approved futuristic brand direction or fabricating business claims.

## Brand and positioning
- ScaleOps Media is a **growth systems company**, not a generic marketing agency.
- Preserve the dark futuristic visual system: deep navy/black, electric blue/cyan, restrained violet glow, technical grid lines and system-led UI.
- Core operating model: **Acquire → Convert → Retain → Operate → Scale**.
- Primary conversion offer: **Growth Systems Audit**.

## Non-negotiables
- Do not invent client names, revenue, ROAS, leads, testimonials, case-study outcomes, pricing or certifications.
- Founder-led metrics may be used only when already documented in approved source material and must be labelled appropriately.
- Keep `assets/images/contact-hero-s.png` as the featured Contact-page graphic unless explicitly instructed otherwise.
- Keep every page responsive and accessible.
- Do not expose secrets or credentials in the repository.
- Do not delete production content or alter DNS, billing, account security or domain ownership without explicit human approval.

## Pages
- `/`
- `/systems/`
- `/services/`
- `/case-studies/`
- `/insights/`
- `/contact/`

## Current launch mode
The GitHub Pages version is a temporary soft-launch preview before the custom ScaleOps domain is connected. During this period all public HTML pages use `noindex,nofollow` and `robots.txt` blocks crawling so the temporary github.io URL does not become the indexed canonical site.

## Before every deploy
1. Validate internal links and required pages.
2. Check page titles and meta descriptions.
3. Confirm images have alt text or appropriate decorative treatment.
4. Check desktop, tablet and mobile breakpoints.
5. Confirm no placeholder metrics or fabricated claims are presented as real proof.
6. Keep the exact supplied Contact hero artwork in place.
7. Preserve the Growth Systems Audit CTA hierarchy.

## Custom-domain launch checklist
When the final domain is connected:
1. Replace `noindex,nofollow` with `index,follow` on all legitimate pages.
2. Change `robots.txt` to allow crawling and reference the production sitemap.
3. Replace the temporary sitemap URLs with the production domain.
4. Add self-referencing canonical tags.
5. Add Open Graph/Twitter metadata and production social preview assets.
6. Verify HTTPS and redirect hostname variants to one canonical host.
7. Add the property to Google Search Console and submit the sitemap.

## Deployment
Use GitHub Pages from `main` through `.github/workflows/deploy-pages.yml`. Low-risk validation/deployment work can be automated. DNS, billing, secrets, external email sends and destructive changes remain approval-gated.
