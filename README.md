# ScaleOps Media Website

Futuristic, responsive ScaleOps Media website based on the approved dark neon growth-systems concept.

## Pages
- `/` Home
- `/systems/`
- `/services/`
- `/case-studies/`
- `/insights/`
- `/contact/`
- `/thanks/`

## Positioning
ScaleOps Media is presented as a **growth systems company — not another marketing agency**.

**Acquire → Convert → Retain → Operate → Scale**

Primary CTA: **Book a Strategy Call / Growth Systems Audit**.

## Services
- Authority Content Systems
- Paid Acquisition Systems
- Creative Strategy & Production
- Funnel & CRO Systems
- Email & Lifecycle Marketing
- Analytics & Dashboards
- Automation Systems
- Growth Systems Audit

## Visual system
The site uses custom HD SVG artwork for the Home, Systems, Services, Case Studies and Insights pages, plus the supplied `assets/images/contact-hero-s.png` artwork on the Contact page. `assets/images/logo-mark.svg` is used as the ScaleOps header mark and favicon.

## Contact form
The Contact page is active. Submissions are sent through FormSubmit to the configured ScaleOps lead inbox with the subject:

`New ScaleOps Media Website Lead`

A Gmail label named **ScaleOps Website Leads** has been created for lead organization, and the lead-monitoring automation checks for new website enquiries and surfaces the submitted lead details.

## Deployment
`.github/workflows/deploy-pages.yml` deploys the static site from `main` to GitHub Pages. Validation and deployment workflows are both enabled.

## Current launch status
The GitHub Pages preview is live. It remains intentionally configured with `noindex,nofollow` and a blocking `robots.txt` until the dedicated ScaleOps domain is connected.

## Custom-domain launch
When the domain is connected we will:
- switch legitimate pages to `index,follow`
- allow crawling in `robots.txt`
- create the production sitemap
- add canonical URLs and social metadata
- verify HTTPS and redirects
- connect Google Search Console and analytics

## Automation
`AGENTS.md` contains operating guardrails for future Codex maintenance, SEO validation, content workflows and low-risk deployment automation.
