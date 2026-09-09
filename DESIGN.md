# Flipkart Bites Design Direction

Flipkart Bites is treated as a meal-delivery tab inside the Flipkart shopping surface. The app should feel like a practical, commerce-first Flipkart extension: blue header, white product surfaces, grey page background, yellow highlights, orange purchase actions, dense scannable information, and food photography carrying appetite.

## Core Tokens

- Brand blue: `#2874F0` for the global header, active links, selection states, and primary trust markers.
- Yellow: `#F7D417` for tab underlines, product logo energy, offer badges, and small attention moments.
- Orange: `#FB641B` for checkout and high-intent purchase actions.
- Background: `#F1F3F6` for the marketplace canvas.
- Text: `#172337` for primary copy, `#565E6C` and `#878787` for metadata.
- Success: `#26A541` for delivered, skipped-refund, and zero-fee proof.

## Component Rules

- Use a Flipkart-like two-tier header on desktop: blue utility/search row, white category row.
- Keep the broader Flipkart tabs visible, but only Bites routes should contain working product functionality.
- Food cards behave like product cards: image first, dish name, calories/details, final price, and a compact Add/Added button.
- Menu cards should expose choice without becoming restaurant delivery: cuisine filters, diet tags, spice level, kcal, lightweight add-ons, and one clear selected meal per slot.
- Cards use 8px radii or less and subtle shadows; avoid decorative nested panels.
- Use yellow sparingly as attention, never as the dominant page background.
- Use orange only for clear conversion actions such as checkout or plan start.
- Motion should feel useful and calm: short fade-up entrances, hover lift on product cards, soft pulse only for route progress or active status. Respect reduced-motion preferences.

## Layout Rules

- Mobile is commerce-app first: sticky bottom nav, compact top location bar, thumb-friendly 44px controls.
- Desktop content should sit in a marketplace grid with a wide working area and a supporting right rail.
- Preserve all existing booking, subscription, skip, wallet, order, and tracking flows.

## Product Experience Rules

- Lead with serviceability: users should understand that Bites opens fixed delivery points before broad city coverage.
- Make subscriptions the default mental model. Daily booking is a fallback, monthly plans are the core product, and group batches are the expansion strategy.
- Treat the weekly calendar as the command center for everyday meals: choose, skip, protect credits, and understand locked days.
- Use smart defaults to reduce daily decision fatigue: auto-pick popular meals, avoid repeats, and remember spice/diet preferences.
- Show trust as operational proof, not marketing copy: verified kitchens, route density, handoff points, wallet credits, fixed slots, and no hidden fees.
- Represent expansion ideas in product surfaces: route unlock score, density pricing, meal commitment ladder, kitchen report, meal swap, family/roommate plans, admin batch dashboard, freshness timeline, referral unlocks, light add-ons, and emergency surplus meals.
- Appeal to broad Indian daily-meal segments with Jain, Gujarati, Punjabi, South Indian, Maharashtrian, and healthy/light tiffin options.
