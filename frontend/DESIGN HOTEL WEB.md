# Design System Document: High-End Editorial Hospitality

## 1. Overview & Creative North Star: "The Atmospheric Horizon"
This design system rejects the "templated" nature of modern travel booking engines in favor of a bespoke, editorial experience. Our Creative North Star is **The Atmospheric Horizon**—a concept that mimics the depth of the sea meeting the sky. 

Instead of rigid grids and harsh borders, we employ intentional asymmetry, significant breathing room (negative space), and layered tonal depth. The goal is to move the user from a "transactional" mindset to an "aspirational" one. We break the template by overlapping high-resolution photography with sophisticated serif typography and using surface-on-surface layering to define space.

---

## 2. Colors: Tonal Depth & Soul
The palette is rooted in a spectrum of blues, from the profound authority of `primary` (#00193c) to the ethereal lightness of `secondary_fixed` (#cee5ff).

### The "No-Line" Rule
To maintain a premium, seamless aesthetic, **1px solid borders are strictly prohibited for sectioning.** 
*   Boundaries must be defined solely through background color shifts.
*   *Example:* A "Room Amenities" section using `surface-container-low` (#f1f4f6) should sit directly against a `surface` (#f7fafc) background to create a soft, natural break.

### Surface Hierarchy & Nesting
Treat the UI as a physical environment of stacked materials.
*   **Base:** `surface` (#f7fafc) for the primary page background.
*   **Nesting:** Use `surface-container-lowest` (#ffffff) for elevated content cards and `surface-container-highest` (#e0e3e5) for recessed utility areas like footers or search bars.
*   Each inner container should use a tier relative to its parent to define importance without visual clutter.

### The "Glass & Gradient" Rule
Flat color can feel "default." To add "soul":
*   **CTAs:** Apply a subtle linear gradient from `primary` (#00193c) to `primary_container` (#002d62) to give buttons a curved, tactile feel.
*   **Floating Elements:** Use Glassmorphism for the navigation bar and booking overlays. Use `surface` at 80% opacity with a `24px` backdrop-blur to allow hero imagery to bleed through softly.

---

### 3. Typography: The Editorial Voice
We use a high-contrast typographic scale to establish a hierarchy of luxury.

*   **The Authority (Serif):** `Noto Serif` is reserved for `display` and `headline` tiers. This font carries the heritage and prestige of the hospitality industry. Use `display-lg` (3.5rem) for hero headlines with generous letter-spacing to command attention.
*   **The Utility (Sans-Serif):** `Manrope` is used for `title`, `body`, and `labels`. Its clean, geometric nature ensures maximum readability for room descriptions and booking details.
*   **Visual Rhythm:** Always pair a `headline-lg` (Noto Serif) with a `body-lg` (Manrope) lead-in paragraph. The tension between the classic serif and the modern sans-serif creates a sophisticated, "magazine-style" layout.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows often feel "cheap" in high-end design. We prioritize **Tonal Layering**.

*   **The Layering Principle:** Depth is achieved by "stacking" surface tiers. Place a `surface-container-lowest` card on a `surface-container-low` section to create a soft, natural lift.
*   **Ambient Shadows:** When a "floating" effect is mandatory (e.g., a modal), use a shadow with a blur radius of at least `40px` and an opacity of `6%`. Use the `on_surface` color (#181c1e) as the shadow base to mimic natural ambient light.
*   **The "Ghost Border" Fallback:** If accessibility requires a container definition, use a "Ghost Border": the `outline-variant` (#c4c6d1) at **15% opacity**. Never use 100% opaque borders.
*   **Glassmorphism:** Navigation menus should feel like "frosted crystal." Use semi-transparent `surface` colors to integrate the UI into the photography, making the experience feel like one cohesive journey.

---

## 5. Components: Luxury Primitives

### Buttons
*   **Primary:** Background: `primary` gradient. Text: `on_primary`. Shape: `md` (0.375rem).
*   **Secondary:** Background: `transparent`. Border: Ghost Border (`outline-variant` at 20%). Text: `primary`.
*   **Tertiary:** Text: `primary` with a 1px underline using `primary_fixed_dim`.

### Cards & Lists
*   **The "No-Divider" Rule:** Forbid the use of horizontal divider lines. Use vertical white space (32px, 48px, or 64px) or subtle shifts between `surface-container` tiers to separate content.
*   **Hotel Room Cards:** Use `surface-container-lowest` for the card base. Ensure the image has a slight `xl` (0.75rem) corner radius.

### Input Fields
*   **Text Inputs:** Use a "Minimalist Tray" style. No full box. Only a bottom border (Ghost Border) that transitions to `primary` on focus. Labels should use `label-md` in `on_surface_variant`.

### Hospitality-Specific Components
*   **The Booking Bar:** A persistent, glassmorphic element at the top or bottom of the viewport. It should use `surface` at 85% opacity with `primary` for the "Check Availability" action.
*   **Date Picker:** Use `primary_fixed` for the selected date range and `on_primary_fixed_variant` for the text to ensure a soft, low-contrast, yet readable selection.

---

## 6. Do's and Don'ts

### Do:
*   **Do** use asymmetrical layouts where text overlaps 15% of a lifestyle image.
*   **Do** prioritize "White Space as Luxury"—if a section feels crowded, double the padding.
*   **Do** use `on_surface_variant` for secondary text to create a soft, sophisticated tonal range.

### Don't:
*   **Don't** use standard "Web Blue" (#0000FF). Stick to our curated navy and sky tones.
*   **Don't** use 1px solid borders to separate sections. Use background color shifts.
*   **Don't** use high-contrast shadows. If you can see the shadow clearly, it’s too dark.
*   **Don't** center-align long blocks of body text. Keep editorial content left-aligned for a modern, structured feel.