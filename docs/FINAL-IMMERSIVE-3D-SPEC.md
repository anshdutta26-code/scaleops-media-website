# ScaleOps Media — Final Immersive 3D Production Specification

## Creative direction
The website is a single scroll-driven 3D narrative. The orbit is the permanent visual anchor. Customer-facing copy lives to the left and right of the orbit; it never overlaps the central object.

## Brand usage
- Use the ScaleOps S mark as the primary 3D object.
- Header uses S + SCALEOPS + Media with deliberate spacing.
- Favicon uses the S mark only.
- Final CTA shows the S mark only — no company name, subheading or tagline inside the central stage.
- Palette: deep navy/black, Electric Blue #2F80ED, cyan #69D8FF, violet #7657FF, off-white.

## Scroll narrative
1. **Hero:** ScaleOps mark inside a glass sphere; towers, data cubes, HUD and particles surround the orbit.
2. **Growth Orbit:** Acquire / Convert / Retain / Operate / Scale become orbiting objects around the mark.
3. **Commercial Value:** the mark morphs into a layered 3D ₹ object; value beams and offer/follow-up/revenue chips appear.
4. **Systems Hub:** ₹ remains central while Acquisition, Conversion, Lifecycle, Automation, Analytics and Growth Ops orbit it.
5. **Services:** service-stack 3D graphic and service chips replace the systems graphics.
6. **Proof:** dashboard graph, growth bars and proof metrics appear around the ₹.
7. **Case Studies:** case-network visual and result nodes replace proof graphics.
8. **How We Work:** orbit returns to an operational process view.
9. **Insights:** server / knowledge graphic and authority-content chips appear.
10. **Return:** ₹ dissolves while the ScaleOps mark reforms.
11. **Final CTA:** ScaleOps mark only, above the holographic platform.

## Content principles
- No internal section numbering.
- No wireframe or design-review terminology.
- Copy is written for buyers and operators.
- Authority content focuses on offer/funnel leakage, CAC/LTV, CRM follow-up, automation ownership, analytics and operating systems.
- Only established ScaleOps proof metrics are shown.

## Typography
- Desktop hero headline: 42–64 px.
- Section headings: 34–47 px.
- Body copy: 14 px desktop, 13 px mobile/tablet.
- Cards: 10–13 px.
- Headings are intentionally smaller than previous production versions to protect the orbit and improve scanability.

## Responsive behavior
### Desktop
Three protected zones: left content / central orbit / right content. The central stage remains fixed and unobstructed.

### Tablet / iPad
The orbit scales to 42–50vw. Copy widths and card padding decrease. Header switches to mobile navigation before the layout becomes crowded.

### Mobile
The stage remains fixed in the upper half of the viewport while each scene’s content flows below it. Large peripheral graphics simplify automatically; no copy overlaps the orbit.

## Motion
- CSS 3D transforms for sphere, orbital rings, holographic platform and ₹ extrusion.
- Canvas particle system for continuous ambient motion.
- Stage-specific graphics crossfade on scroll.
- Subtle pointer parallax on desktop only.
- `prefers-reduced-motion` disables nonessential animation.

## Production safeguards
- Required pages and booking contract remain unchanged.
- Contact form subject remains `New ScaleOps Media Website Lead`.
- Booking slots remain 12 PM, 1 PM, 2 PM, 3 PM, 4 PM and Flexible.
- JavaScript is syntax-validated in GitHub Actions.
