# ScaleOps Media Website

Futuristic, responsive ScaleOps Media website based on the approved dark neon growth-systems concept.

## Pages
- `/` Home
- `/systems/`
- `/services/`
- `/case-studies/`
- `/insights/`
- `/contact/`

## Positioning
ScaleOps Media is presented as a **growth systems company — not another marketing agency**. The operating model is:

**Acquire → Convert → Retain → Operate → Scale**

Primary CTA: **Growth Systems Audit**.

## Services
- Growth Systems Audit
- Authority Content & SEO
- Paid Acquisition
- Creative Strategy & Production
- Funnel & CRO
- CRM & Lifecycle Automation
- Analytics & RevOps
- Growth Ops & SOPs

## Current launch status
The repository is ready for a GitHub Pages soft launch. The temporary github.io preview is deliberately configured with `noindex,nofollow` plus a blocking `robots.txt` so Google does not index the preview URL before the final custom domain is connected.

Real client names, final case-study evidence, business contact information, booking integration, pricing and CRM/form integrations will be added only after approval. No fabricated business claims are used.

## Contact artwork
`assets/images/contact-hero-s.png` is the exact futuristic blue ScaleOps graphic supplied for the Contact page.

## Deployment
`.github/workflows/deploy-pages.yml` deploys the static site from `main` to GitHub Pages after Pages is enabled in repository settings with **Source: GitHub Actions**.

## Custom-domain launch
When the domain is connected we will:
- switch every legitimate page to `index,follow`
- allow crawling in `robots.txt`
- create the production sitemap
- add canonical URLs and social metadata
- verify HTTPS and redirects
- connect Google Search Console

## Automation
`AGENTS.md` contains the operating guardrails for future Codex maintenance, SEO validation, content workflows and low-risk deployment automation.
