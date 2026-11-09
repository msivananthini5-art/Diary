# Design Document: Diary Visual Styling

## Overview

This design implements a comprehensive visual styling update for the SABI Living Diary web application, transforming it into a handmade scrapbook aesthetic with warm sandalwood cream paper texture, handwritten fonts, floral botanical decorations, and vintage diary elements. The implementation is strictly CSS-only, preserving all existing functionality, DOM structure, JavaScript logic, and layout behavior while updating only the visual presentation layer.

## Architecture

### System Components

The visual styling system consists of five primary architectural layers:

#### 1. **Color Palette System**
A centralized warm color scheme that establishes visual harmony across all interface elements:
- **Paper tones**: Sandalwood cream range (#f7ead8 to #e5d0aa)
- **Text colors**: Deep brown (#2c221e) for primary text, warm brown (#8b6040) for metadata
- **Accent colors**: Dusty rose (#a8606e) for interactive elements, soft pink (#b07080) for decorative elements
- **Shadow system**: Graduated opacity range (rgba(0,0,0,0.08) to rgba(0,0,0,0.25))
- **Scene backgrounds**: Dark wood tones (#1a0810 to #1f0b0a)

Implementation will use CSS custom properties (variables) for maintainability where beneficial, allowing consistent color application and easy future adjustments.

#### 2. **Typography System**
A multi-font hierarchy that creates authentic handwritten character:
- **'Satisfy' cursive**: Memory titles at 1.1rem for elegant headers
- **'Patrick Hand' cursive**: Memory text, dates, notes at 0.76rem-0.85rem for readable body content
- **'Pinyon Script' cursive**: Homepage and decorative titles for formal elegance
- **'Caveat' cursive**: Supplementary text and UI labels for casual annotations

Font loading optimized via Google Fonts CDN with preconnect resource hints. All font declarations include fallback chains (cursive, serif) for graceful degradation. Existing line-height values (1.3 to 1.78) preserved for readability.

#### 3. **Paper Texture Engine**
Multi-layered CSS implementation creating authentic handmade paper appearance:
- **Base layer**: Sandalwood cream solid color background
- **Fiber texture**: Subtle SVG data URI or CSS noise filter for paper grain
- **Aged stains**: Multiple radial gradients with rgba opacity (0.14-0.18) positioned randomly across pages
- **Ruled lines**: Horizontal repeating-linear-gradient with 23-24px spacing, rgba(160,125,85,0.072)
- **Deckled edges**: clip-path polygons along spine edges for torn paper effect
- **Spine shadow**: Linear gradient or box-shadow along spine (8-12px wide, rgba(0,0,0,0.08))
- **Vignette**: Radial gradients at page borders transitioning from base cream to darker aged tones

All effects layered using background composition and pseudo-elements to avoid DOM changes.

#### 4. **Decorative Element System**
Botanical illustrations and embellishments that enhance scrapbook authenticity:
- **Botanical illustrations**: CSS-drawn shapes or botanical emoji positioned at page corners
- **Styling**: Opacity 0.5-0.7 for subtle aged appearance, drop-shadow rgba(80,50,20,0.18) for depth
- **Positioning**: Absolute positioning with pointer-events: none to prevent interaction blocking
- **Layering**: z-index: 4 to sit above content without obscuring text
- **Homepage ornaments**: Floral corner decorations on closed diary cover

Implementation uses pseudo-elements (::before, ::after) and emoji content, avoiding external image dependencies.

#### 5. **Memory Element Styling**
Enhanced scrapbook aesthetics for photos and notes:

**Polaroid Cards:**
- White background (#ffffff) with asymmetric padding (7px sides, 24px bottom)
- Washi tape strip: positioned -9px from top, 52px × 14px, rgba(230,240,255,0.55) with subtle stripe pattern
- Multi-layer box-shadow (3 definitions) for dimensional depth
- Caption line at bottom (4px from edge)
- Preserved rotation transforms (-4deg to 3deg)
- Hover effect: scale(1.04) with enhanced shadow

**Note Cards:**
- Torn top edge via clip-path polygon (30 coordinate points for natural irregularity)
- Color variants: #f8f0e0 (white), #fdf6d3 (yellow), #fde8ea (pink)
- Padding: 14px 16px 16px
- Decorative flower at bottom-right (1.2rem, opacity 0.5)
- Box-shadow with 2 definitions (rgba(0,0,0,0.2) and rgba(0,0,0,0.12))
- 'Caveat' font for handwritten note appearance

### Scene Architecture

#### Homepage Scene (index.html)
Atmospheric landing page with closed diary on wooden table:
- **Table background**: Linear gradient #1f0b0a → #1a0706 with SVG fractal noise for wood grain
- **Candlelight glow**: Radial gradient rgba(200,100,60,0.18) at center
- **Vignette**: Radial gradient rgba(5,0,5,0.7) at edges, transparent at 40%
- **Decorations**: Lace cloth (top-left, rgba(255,248,240,0.55)), dried flowers (right side, CSS-drawn), glass vase (linear gradient rgba blues)
- **Diary cover**: Preserved dimensions and click interaction, enhanced with floral corner ornaments

#### Diary Scene (diary.html)
Open book view with visible binding and two-page spreads:
- **Hardcover back**: Linear gradient 160deg, #c9849a → #a8606e → #c9849a
- **Spine**: 24px wide center element with layered background gradients
- **Hinges**: Left and right 28px wide elements, linear gradients 90deg/-90deg, #8a4a5a → #a85f70
- **Binding edges**: Top and bottom 10px height with gradient shadows
- **Book shadow**: Two drop-shadow filters for table resting effect
- **Border radius**: 6px 14px 14px 6px for rounded hardcover edges
- **Pages**: Paper texture system applied to left and right page containers

### Layout Preservation Strategy

All existing layout properties strictly preserved:
- **Flexbox/Grid**: All display modes, justify-content, align-items, grid-template values unchanged
- **Positioning**: All position declarations (absolute, relative, fixed) and offsets (top, right, bottom, left) unchanged
- **Dimensions**: All width, height, aspect-ratio values preserved
- **Spacing**: All padding, margin values maintained
- **Stacking**: All z-index values preserved
- **Responsive**: Media query breakpoints (700px, 768px) and clamp() functions unchanged

Implementation will only add or modify properties that affect visual appearance (colors, backgrounds, fonts, shadows, borders, filters) without touching structural layout properties.

### Animation Preservation

All existing animations and transitions maintained:
- **Transitions**: Button/card hovers (0.2s-0.4s), opacity fades (0.15s-0.35s), shadow depth (0.15s-0.25s)
- **Page flips**: 0.65s duration, cubic-bezier(0.68, -0.55, 0.265, 1.55) easing
- **Floating petals**: 12-28s duration, linear timing
- **Button pulse**: 3s duration, ease-in-out timing
- **Keyframes**: All @keyframes definitions preserved without modification

### Implementation Constraints

**CSS-Only Modification:**
- Only files in `css/` directory modified (diary.css, homepage.css, related stylesheets)
- No changes to HTML structure in diary.html or index.html
- No modifications to JavaScript files in `js/` directory
- No inline styles added
- All DOM element IDs, classes, and data attributes preserved for JavaScript compatibility

**Maintainability:**
- CSS custom properties for repeated color values
- Section comments documenting major styling areas
- Consistent code organization following existing patterns
- Separation of concerns: styling in CSS, behavior in JavaScript

## Data Models

No data structure changes required. All existing data models remain unchanged:
- Memory objects (date, title, text, photo, notes)
- Diary state storage format
- DOM data attributes
- Event handler parameters

## Interfaces

### CSS Class Interface (JavaScript Dependencies)

The following CSS classes must remain unchanged as they are referenced by JavaScript:
- `.page` - Page containers for flip animations
- `.polaroid` - Photo card elements
- `.note-card` - Note card elements
- `.memory` - Memory container elements
- `.edit-mode` - Edit mode state class
- `.toolbar` - Editor toolbar visibility
- `.modal` - Add memory modal
- `.btn-*` - Button classes with click handlers

Visual styling updated via property modifications within these selectors without changing class names or selector specificity.

### Font Loading Interface

Google Fonts API integration via HTML `<link>` elements:
```html
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Satisfy&family=Patrick+Hand&family=Pinyon+Script&family=Caveat:wght@400;500&display=swap" rel="stylesheet"/>
```

Font-family declarations with fallbacks:
```css
font-family: 'Satisfy', cursive, serif;
font-family: 'Patrick Hand', cursive, sans-serif;
font-family: 'Pinyon Script', cursive, serif;
font-family: 'Caveat', cursive, sans-serif;
```

## Error Handling

No error handling changes required as implementation is CSS-only. Existing JavaScript error handling preserved. Font loading uses `font-display: swap` for graceful degradation to fallback fonts during load.

## Performance Considerations

### Optimization Strategies

1. **Font Loading**: Preconnect resource hints reduce DNS lookup latency for Google Fonts CDN
2. **Texture Implementation**: SVG data URIs embedded inline avoid additional HTTP requests
3. **Shadow Layering**: Limited to 2-3 shadow definitions per element to maintain render performance
4. **Animation Preservation**: Existing requestAnimationFrame-based page flip animations unchanged
5. **CSS Selector Efficiency**: Maintain existing selector specificity, avoid overly complex selectors

### Browser Compatibility

Targeting modern browsers with CSS features:
- clip-path for torn edges (supported in all modern browsers)
- CSS custom properties (widely supported)
- Multiple background layers (universally supported)
- Drop-shadow filters (widely supported)
- Fallback fonts ensure text renders on all platforms

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Paper color range compliance

*For any* CSS background-color declaration applied to paper elements (pages, page containers), the computed color value SHALL fall within the sandalwood cream range from #f7ead8 to #e5d0aa when converted to hexadecimal format.

**Validates: Requirements 1.1, 8.1**

### Property 2: Paper stain opacity range

*For any* radial-gradient used for aged paper stains in the paper texture system, all rgba color stops SHALL have opacity values between 0.14 and 0.18 inclusive.

**Validates: Requirements 1.3**

### Property 3: Diary line spacing consistency

*For any* rendered horizontal ruled line on diary pages, the vertical spacing between consecutive lines SHALL be between 23 and 24 pixels inclusive, and the line color SHALL be rgba(160, 125, 85, 0.072).

**Validates: Requirements 1.5**

### Property 4: Spine shadow dimensions

*For any* spine shadow effect applied to page edges, the shadow width SHALL be between 8 and 12 pixels inclusive, and the shadow color SHALL use rgba(0, 0, 0, 0.08) opacity.

**Validates: Requirements 1.6**

### Property 5: Page vignette gradient structure

*For any* vignette effect applied at page borders, the CSS SHALL include a radial or linear gradient that transitions from a lighter base cream color to a darker aged tone, with the gradient direction oriented toward page edges.

**Validates: Requirements 1.7**

### Property 6: Layout property preservation

*For all* HTML elements that had padding or margin values in the original implementation, the computed padding and margin values after styling updates SHALL be identical to the original values.

**Validates: Requirements 1.8, 10.4**

### Property 7: Memory title typography

*For all* memory title elements, the computed font-family SHALL include 'Satisfy' as the primary font, and the computed font-size SHALL be 1.1rem.

**Validates: Requirements 2.1**

### Property 8: Memory text typography range

*For all* memory text, date, and note elements, the computed font-family SHALL include 'Patrick Hand' as the primary font, and the computed font-size SHALL be between 0.76rem and 0.85rem inclusive.

**Validates: Requirements 2.2**

### Property 9: Homepage title typography

*For all* homepage cover title elements and page decorative title elements, the computed font-family SHALL include 'Pinyon Script' as the primary font.

**Validates: Requirements 2.3**

### Property 10: Supplementary text typography

*For all* supplementary text and UI label elements, the computed font-family SHALL include 'Caveat' as the primary font.

**Validates: Requirements 2.4**

### Property 11: Line height preservation

*For all* text elements, the computed line-height value SHALL be between 1.3 and 1.78 inclusive.

**Validates: Requirements 2.5**

### Property 12: Text color preservation

*For all* text elements that had a specific color value in the original implementation, the computed color value after styling updates SHALL be identical to the original value.

**Validates: Requirements 2.6**

### Property 13: Font fallback completeness

*For any* font-family CSS declaration, the value SHALL include at least one fallback font (generic family or specific font name) after the primary font.

**Validates: Requirements 2.8**

### Property 14: Decorative element positioning

*For all* botanical decorative elements, the computed position SHALL be 'absolute', and the top/bottom and left/right offset values SHALL position the element at a page corner or adjacent to content areas.

**Validates: Requirements 3.1**

### Property 15: Decorative element opacity range

*For all* decorative botanical elements, the computed opacity SHALL be between 0.5 and 0.7 inclusive.

**Validates: Requirements 3.2**

### Property 16: Decorative element shadow

*For all* decorative botanical elements with drop-shadow filters, the filter SHALL include a drop-shadow function with color value rgba(80, 50, 20, 0.18) or equivalent.

**Validates: Requirements 3.3**

### Property 17: Decorative element interaction prevention

*For all* decorative elements, the computed pointer-events property SHALL be 'none'.

**Validates: Requirements 3.4**

### Property 18: Decorative element layering

*For all* decorative elements, the computed z-index value SHALL be 4.

**Validates: Requirements 3.6**

### Property 19: Decorative element implementation

*For all* decorative botanical elements, the implementation SHALL use either CSS-generated content (pseudo-elements), emoji Unicode characters, or SVG data URIs, without referencing external image URLs (excluding data: scheme).

**Validates: Requirements 3.7**

### Property 20: Functional element position preservation

*For all* polaroid and note card elements, the computed top, right, bottom, left, and transform properties after styling updates SHALL be identical to the original values.

**Validates: Requirements 3.8**

### Property 21: Polaroid background and padding

*For all* polaroid elements, the computed background-color SHALL be #ffffff (white), the computed padding-left and padding-right SHALL be 7px, and the computed padding-bottom SHALL be 24px.

**Validates: Requirements 4.1**

### Property 22: Washi tape dimensions

*For all* washi tape elements within polaroids, the computed width SHALL be 52px, the computed height SHALL be 14px, and the computed top offset SHALL be -9px relative to the polaroid container.

**Validates: Requirements 4.2**

### Property 23: Washi tape color

*For all* washi tape elements, the computed background-color SHALL be rgba(230, 240, 255, 0.55) and the element SHALL include a pattern in its background-image or pseudo-element content.

**Validates: Requirements 4.3**

### Property 24: Polaroid shadow layer count

*For all* polaroid elements, the box-shadow CSS value SHALL contain exactly 3 comma-separated shadow definitions.

**Validates: Requirements 4.4**

### Property 25: Polaroid caption line position

*For all* caption line elements within polaroids, the computed bottom offset SHALL be 4px from the polaroid edge.

**Validates: Requirements 4.5**

### Property 26: Polaroid rotation preservation

*For all* polaroid elements with transform rotations, the rotation angle SHALL be between -4 degrees and 3 degrees inclusive.

**Validates: Requirements 4.6**

### Property 27: Polaroid hover effect

*For all* polaroid elements, the :hover pseudo-class CSS SHALL include a transform property containing scale(1.04) and a box-shadow with increased blur or spread values compared to the default state.

**Validates: Requirements 4.7**

### Property 28: Polaroid dimension preservation

*For all* polaroid elements, the computed width, height, and position properties after styling updates SHALL be identical to the original values.

**Validates: Requirements 4.8**

### Property 29: Homepage table gradient colors

*For the* homepage scene table background element, the background CSS SHALL include a linear-gradient containing color stops #1f0b0a and #1a0706.

**Validates: Requirements 5.1**

### Property 30: Homepage candlelight glow

*For the* homepage scene, the background or overlay SHALL include a radial-gradient containing the color rgba(200, 100, 60, 0.18).

**Validates: Requirements 5.2**

### Property 31: Homepage vignette structure

*For the* homepage scene vignette effect, the radial-gradient SHALL include the color rgba(5, 0, 5, 0.7) and a transparent color stop at approximately 40%.

**Validates: Requirements 5.3**

### Property 32: Homepage wood grain texture

*For the* homepage scene table background, the background-image SHALL include a data URI containing an SVG element with a feTurbulence filter element.

**Validates: Requirements 5.4**

### Property 33: Lace cloth positioning and color

*For the* lace cloth decorative element on the homepage, the computed top and left positioning SHALL place it at the top-left corner, and the background-color SHALL be rgba(255, 248, 240, 0.55).

**Validates: Requirements 5.5**

### Property 34: Dried flowers implementation

*For the* dried flowers decorative element on the homepage, the computed right offset SHALL position it on the right side, and the element SHALL use CSS-generated shapes (pseudo-elements with border-radius or other shape properties) without external image URLs.

**Validates: Requirements 5.6**

### Property 35: Glass vase gradient

*For the* glass vase decorative element on the homepage, the background SHALL include a linear-gradient with rgba color values using blue channels (values where the blue component is the highest or dominant).

**Validates: Requirements 5.7**

### Property 36: Diary cover dimension preservation

*For the* diary cover element on the homepage, the computed width and height properties after styling updates SHALL be identical to the original values.

**Validates: Requirements 5.8**

### Property 37: Hardcover gradient structure

*For the* diary scene hardcover back element, the background SHALL include a linear-gradient with 160deg angle and color stops #c9849a, #a8606e, and #c9849a in sequence.

**Validates: Requirements 6.1**

### Property 38: Spine dimensions and layering

*For the* diary scene visible spine element, the computed width SHALL be 24px, and the background SHALL include multiple gradients (composite background with 2 or more gradient functions).

**Validates: Requirements 6.2**

### Property 39: Left hinge gradient

*For the* diary scene left hinge element, the background SHALL include a linear-gradient at 90deg angle from #8a4a5a to #a85f70, and the computed width SHALL be 28px.

**Validates: Requirements 6.3**

### Property 40: Right hinge gradient

*For the* diary scene right hinge element, the background SHALL include a linear-gradient at -90deg angle from #8a4a5a to #a85f70, and the computed width SHALL be 28px.

**Validates: Requirements 6.4**

### Property 41: Binding edge dimensions

*For all* top and bottom binding edge elements in the diary scene, the computed height SHALL be 10px, and the background or box-shadow SHALL include gradient definitions.

**Validates: Requirements 6.5**

### Property 42: Book shadow layer count

*For the* book element in the diary scene, the filter CSS value SHALL contain exactly 2 drop-shadow function definitions.

**Validates: Requirements 6.6**

### Property 43: Book border radius

*For the* book element in the diary scene, the computed border-radius value SHALL be 6px 14px 14px 6px.

**Validates: Requirements 6.7**

### Property 44: Note card clip-path complexity

*For all* note card elements, the clip-path CSS value SHALL contain a polygon function with exactly 30 coordinate points (60 numeric values in the polygon point list).

**Validates: Requirements 7.1**

### Property 45: Note card default color

*For all* default (white variant) note card elements, the computed background-color SHALL be #f8f0e0.

**Validates: Requirements 7.2**

### Property 46: Note card variant colors

*For all* yellow variant note card elements, the computed background-color SHALL be #fdf6d3, and for all pink variant note card elements, the computed background-color SHALL be #fde8ea.

**Validates: Requirements 7.3**

### Property 47: Note card padding

*For all* note card elements, the computed padding SHALL be 14px 16px 16px (shorthand for 14px top, 16px left/right, 16px bottom).

**Validates: Requirements 7.4**

### Property 48: Note card decorative flower

*For all* decorative flower elements within note cards, the computed position SHALL place the element at the bottom-right, the computed font-size SHALL be 1.2rem, and the computed opacity SHALL be 0.5.

**Validates: Requirements 7.5**

### Property 49: Note card shadow structure

*For all* note card elements, the box-shadow CSS value SHALL contain exactly 2 comma-separated shadow definitions with colors rgba(0, 0, 0, 0.2) and rgba(0, 0, 0, 0.12).

**Validates: Requirements 7.6**

### Property 50: Note card typography

*For all* note card title and text content elements, the computed font-family SHALL include 'Caveat' as the primary font.

**Validates: Requirements 7.7**

### Property 51: Note card transform preservation

*For all* note card elements, the computed width, height, transform, and z-index properties after styling updates SHALL be identical to the original values.

**Validates: Requirements 7.8**

### Property 52: Primary text color compliance

*For all* primary text elements, the computed color SHALL be #2c221e, and for all date and label elements, the computed color SHALL be #8b6040.

**Validates: Requirements 8.2**

### Property 53: Accent color compliance

*For all* button elements, the computed color or background-color SHALL include #a8606e, and for all heart and decorative elements, the computed color SHALL include #b07080.

**Validates: Requirements 8.3**

### Property 54: Shadow opacity range

*For all* elements with box-shadow or drop-shadow filters, the rgba black shadow color opacity values SHALL be between 0.08 and 0.25 inclusive.

**Validates: Requirements 8.4**

### Property 55: Scene background color range

*For all* scene background elements (homepage and diary scene containers), the computed background-color or gradient color stops SHALL include colors within the range #1a0810 to #1f0b0a.

**Validates: Requirements 8.5**

### Property 56: Botanical decoration color

*For all* botanical decoration elements with color styling (not using default emoji colors), the color SHALL be rgba(200, 150, 140, 0.5).

**Validates: Requirements 8.6**

### Property 57: Color contrast compliance

*For any* text element and its background, the color contrast ratio SHALL be at least 4.5:1 for normal text or 3:1 for large text (18px+ or 14px+ bold) according to WCAG 2.0 Level AA standards.

**Validates: Requirements 8.8**

### Property 58: DOM attribute preservation

*For all* HTML elements referenced by JavaScript (elements with IDs, elements with data-* attributes, elements with classes used in querySelector/querySelectorAll in JS files), the id, class list, and data attributes SHALL remain unchanged after styling updates.

**Validates: Requirements 9.2**

### Property 59: Animation timing preservation

*For all* CSS properties with transition declarations, the transition-duration and transition-timing-function values SHALL remain unchanged after styling updates.

**Validates: Requirements 9.4**

### Property 60: Flexbox layout preservation

*For all* elements with display: flex or display: inline-flex, the flex-direction, justify-content, align-items, flex-wrap, and gap properties SHALL remain unchanged after styling updates.

**Validates: Requirements 10.1**

### Property 61: Position property preservation

*For all* elements with position: absolute, position: relative, or position: fixed, the position value and associated top, right, bottom, left offset values SHALL remain unchanged after styling updates.

**Validates: Requirements 10.2**

### Property 62: Dimension property preservation

*For all* container elements, the width, height, min-width, min-height, max-width, max-height, and aspect-ratio properties SHALL remain unchanged after styling updates.

**Validates: Requirements 10.3**

### Property 63: Z-index preservation

*For all* elements with explicit z-index declarations, the z-index value SHALL remain unchanged after styling updates.

**Validates: Requirements 10.5**

### Property 64: Media query preservation

*For all* CSS @media rules, the breakpoint values (pixel widths like 700px, 768px) and media query conditions SHALL remain unchanged after styling updates.

**Validates: Requirements 10.6**

### Property 65: Clamp function preservation

*For all* CSS property values using clamp() functions, the function parameters (minimum, preferred, maximum values) SHALL remain unchanged after styling updates.

**Validates: Requirements 10.7**

### Property 66: Transform transition timing

*For all* elements with transitions on transform properties, the transition-duration SHALL be between 0.2s and 0.4s inclusive.

**Validates: Requirements 11.2**

### Property 67: Opacity transition timing

*For all* elements with transitions on opacity properties, the transition-duration SHALL be between 0.15s and 0.35s inclusive.

**Validates: Requirements 11.3**

### Property 68: Shadow transition timing

*For all* elements with transitions on box-shadow properties, the transition-duration SHALL be between 0.15s and 0.25s inclusive.

**Validates: Requirements 11.4**

### Property 69: Page flip animation parameters

*For all* page flip animations, the animation-duration SHALL be 0.65s and the animation-timing-function SHALL be cubic-bezier(0.68, -0.55, 0.265, 1.55).

**Validates: Requirements 11.5**

### Property 70: Petal animation timing range

*For all* floating petal animations, the animation-duration SHALL be between 12s and 28s inclusive, and the animation-timing-function SHALL be linear.

**Validates: Requirements 11.6**

### Property 71: Button pulse animation parameters

*For all* button pulse animations, the animation-duration SHALL be 3s and the animation-timing-function SHALL be ease-in-out.

**Validates: Requirements 11.7**

### Property 72: Keyframe definition preservation

*For all* @keyframes rules defined in the original CSS, the keyframe name, percentage selectors, and property values SHALL remain unchanged after styling updates.

**Validates: Requirements 11.8**

### Property 73: CSS selector preservation

*For all* CSS selectors that match elements referenced by JavaScript querySelector/querySelectorAll calls, the selector string SHALL remain valid and SHALL match the same elements after styling updates.

**Validates: Requirements 12.5**

## Implementation Notes

### CSS Organization

Maintain existing file structure:
- **homepage.css**: Homepage scene, closed diary cover, table decorations
- **diary.css**: Open diary scene, book structure, page styling, memory elements
- **Additional files**: Animations.css, entry-modal.css as needed for specific features

### Testing Strategy

**Property-based tests** will verify universal properties across all inputs:
- Color value ranges for all paper elements
- Font-family presence for all text elements
- Dimension preservation across all layout elements
- Shadow/opacity ranges across all styled elements

**Integration tests** will verify visual quality and functionality:
- Manual visual inspection of texture appearance at normal viewing distance
- Interactive testing of page flips, edit mode, modal, storage
- Responsive layout testing at breakpoints 700px and 768px
- Cross-browser rendering verification

**Example-based tests** will verify specific cases:
- Homepage contains lace cloth at top-left
- Font loading link tags present in HTML
- Floral ornaments present on homepage cover

### Development Workflow

1. **Baseline snapshot**: Capture computed styles of all elements before modifications
2. **Incremental updates**: Apply styling changes in isolated sections (typography, then colors, then textures, etc.)
3. **Verification after each section**: Run property tests to verify preservation constraints
4. **Visual review**: Compare rendered output against design requirements
5. **Integration testing**: Execute full user interaction workflows
6. **Final validation**: Run complete property test suite and manual testing

### Browser Developer Tools Usage

Leverage browser inspect element for:
- Computed style verification during development
- Layout preservation validation
- Color value confirmation
- Font rendering inspection
- Shadow and filter effect review

## Conclusion

This design provides a complete CSS-only transformation of the SABI Living Diary into a warm, handmade scrapbook aesthetic while maintaining 100% functional compatibility with existing JavaScript logic and DOM structure. The property-based specification ensures every requirement is testable and verifiable, and the architectural separation of concerns ensures maintainability and future extensibility.
