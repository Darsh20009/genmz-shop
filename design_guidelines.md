# Fashion Store Design Guidelines

## Design Approach
**Reference-Based:** Drawing from Zara, Everlane, and Reformation's minimalist e-commerce aesthetics. High-end fashion demands visual storytelling through imagery with restrained UI elements that never compete with product photography.

## Typography System
**Fonts:** 
- Primary: "Manrope" (Google Fonts) - Clean geometric sans-serif
- Accent: "Cormorant Garamond" (Google Fonts) - Elegant serif for headings

**Scale (Mobile-First):**
- Hero: text-3xl / md:text-5xl (30px/48px)
- H2: text-2xl / md:text-4xl (24px/36px)
- H3: text-lg / md:text-2xl (18px/24px)
- Body: text-sm / md:text-base (14px/16px)
- Small: text-xs / md:text-sm (12px/14px)
- Button: text-xs / md:text-sm uppercase tracking-wider

**RTL:** Use `dir="rtl"` and `lang="ar"` attributes, mirror all spacing/layouts

## Layout System
**Spacing Units:** Tailwind 2, 4, 6, 8, 12, 16, 24 (tight, minimal approach)

**Grid Structure:**
- Container: max-w-7xl with px-4 md:px-6
- Product Grids: grid-cols-2 md:grid-cols-4 gap-2 md:gap-4
- Mobile breakpoints: 640px (md), 1024px (lg)

## Homepage Structure

### 1. Navigation (Sticky)
Minimal transparent nav becoming white on scroll:
- Logo (center on mobile, left on desktop)
- Hamburger menu (mobile) → Full-screen overlay with large text links
- Desktop: Menu, Search icon, Bag icon, Language toggle (AR/EN)
- Height: h-16 md:h-20

### 2. Hero Section - Full Viewport
**Large Hero Image:** YES - Single model in burgundy hoodie, full-bleed
- Mobile: h-screen, model portrait cropped cleverly
- Desktop: h-screen, landscape with model positioned left/right third
- Overlay: Subtle gradient from bottom (20% opacity black)
- Text: Positioned bottom-left with 32px padding
  - Headline: "MINIMAL ESSENTIALS" in Cormorant
  - Subtext: "Designed for Gen M&Z"
  - CTA Button: Glass morphism style (backdrop-blur-md, bg-white/20, border white/40) "SHOP COLLECTION"

### 3. Product Grid Section
**Images:** All 4 hoodie colors (burgundy, teal, grey, blue)
- 2x2 grid mobile, 4 columns desktop
- Each image: Square aspect ratio (1:1)
- On hover (desktop only): Slight scale-up (105%), quick product name fade-in overlay
- Gap: gap-2 md:gap-4
- No borders, clean edge-to-edge

### 4. Featured Category - Split Layout
**Image:** Teal hoodie model, lifestyle shot
- Desktop: 60/40 split (image left, content right)
- Mobile: Stacked, image first
- Content side: Vertical center alignment, p-8 md:p-16
  - Small eyebrow text: "NEW ARRIVAL"
  - Heading + description + price
  - Size selector (minimal pills)
  - ADD TO BAG button (solid black, white text)

### 5. Gallery Mosaic
**Images:** Grey and blue hoodies in varied lifestyle contexts
- Asymmetric masonry grid (Pinterest-style)
- Mobile: 2 columns, Desktop: 3 columns with varied heights
- Fullscreen lightbox on click

### 6. Footer - Comprehensive
- Newsletter (single input + arrow button)
- Links grid: Shop, About, Customer Care, Social
- Language/Currency selectors
- Payment icons strip
- Copyright + legal links

## Component Library

**Buttons:**
- Primary: Black bg, white text, px-8 py-3, no rounded corners
- Ghost: Transparent with border, backdrop-blur on images
- Icon buttons: 40x40px touch targets mobile

**Product Cards:**
- Image + Name + Price
- No borders, minimal padding
- Wishlist heart icon (top-right absolute)

**Input Fields:**
- Border-b only (no full border)
- Minimal labels (floating or above)
- Focus: border-black transition

**Navigation Overlay (Mobile):**
- Full-screen white background
- Large text links (text-2xl)
- Close X (top-right)
- Slide-in from right for RTL

## Mobile-First Specifications
- Touch targets: min 44x44px
- Thumb-friendly bottom nav option (optional sticky bar: Home, Search, Bag)
- Swipeable product gallery
- Optimized images: WebP with fallbacks
- Lazy loading after fold
- No hover states on mobile (use tap/active states)

## Images Section
1. **Hero:** Single model burgundy hoodie, dramatic lighting, minimal background - portrait mobile / landscape desktop
2. **Grid Section:** 4 square product shots - each hoodie color on white/minimal backdrop
3. **Featured:** Teal hoodie lifestyle - urban/studio setting with model mid-movement
4. **Mosaic:** 6-8 varied shots of grey/blue hoodies - mix of close-ups, lifestyle, detail shots

**Aspect Ratios:**
- Hero: 9:16 mobile, 16:9 desktop
- Product grid: 1:1
- Featured: 3:4
- Mosaic: Mixed (1:1, 3:4, 4:5)