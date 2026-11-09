# Implementation Plan: Diary Visual Styling

## Overview

This implementation plan transforms the SABI Living Diary into a handmade scrapbook aesthetic through CSS-only updates. The work is organized into five major groups: typography system, color palette system, paper texture engine, decorative elements, and scene styling. All changes preserve existing functionality, layout, and JavaScript behavior while updating only visual presentation.

## Tasks

- [x] 1. Set up typography system and font loading
  - [x] 1.1 Add Google Fonts link tags to HTML files
    - Add preconnect resource hints for fonts.googleapis.com and fonts.gstatic.com
    - Add stylesheet link for Satisfy, Patrick Hand, Pinyon Script, and Caveat fonts
    - Include font-display=swap parameter for graceful fallback
    - _Requirements: 2.7_
  
  - [x] 1.2 Implement memory title typography styling
    - Apply 'Satisfy' cursive font to memory title elements
    - Set font-size to 1.1rem
    - Include fallback chain: cursive, serif
    - _Requirements: 2.1_
  
  - [x] 1.3 Implement memory text typography styling
    - Apply 'Patrick Hand' cursive font to memory text, dates, and notes
    - Set font-size range between 0.76rem and 0.85rem
    - Include fallback chain: cursive, sans-serif
    - Verify existing line-height values (1.3-1.78) are preserved
    - _Requirements: 2.2, 2.5_
  
  - [x] 1.4 Implement homepage title typography styling
    - Apply 'Pinyon Script' cursive font to homepage cover title
    - Apply 'Pinyon Script' to decorative page titles
    - Include fallback chain: cursive, serif
    - _Requirements: 2.3_
  
  - [x] 1.5 Implement supplementary text typography styling
    - Apply 'Caveat' cursive font to UI labels and supplementary text
    - Include fallback chain: cursive, sans-serif
    - Verify text color preservation for all typography updates
    - _Requirements: 2.4, 2.6_

- [x] 2. Implement color palette system
  - [x] 2.1 Create CSS custom properties for color palette
    - Define paper color variables (#f7ead8 to #e5d0aa range)
    - Define text color variables (#2c221e primary, #8b6040 metadata)
    - Define accent color variables (#a8606e buttons, #b07080 decorative)
    - Define shadow color variables (rgba(0,0,0,0.08) to rgba(0,0,0,0.25))
    - Define scene background variables (#1a0810 to #1f0b0a)
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [x] 2.2 Apply warm palette colors to text elements
    - Update primary text color to #2c221e
    - Update date and label colors to #8b6040
    - Verify color contrast ratios meet WCAG 2.0 Level AA (4.5:1 for normal text)
    - _Requirements: 8.2, 8.8_
  
  - [x] 2.3 Apply accent colors to interactive elements
    - Update button colors to use #a8606e
    - Update heart and decorative elements to use #b07080
    - Update botanical decoration colors to rgba(200,150,140,0.5)
    - _Requirements: 8.3, 8.6_
  
  - [x] 2.4 Apply shadow colors across all elements
    - Update box-shadow definitions to use rgba(0,0,0,0.08-0.25) range
    - Update drop-shadow filters to match opacity range
    - Verify all shadow layers maintain depth hierarchy
    - _Requirements: 8.4_

- [x] 3. Checkpoint - Verify typography and colors
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement paper texture engine for diary pages
  - [x] 4.1 Create base paper color and fiber texture
    - Apply sandalwood cream background (#f7ead8 to #e5d0aa) to page elements
    - Add subtle fiber texture using SVG data URI or CSS noise filter
    - Ensure texture is visible at normal viewing distance without repetition
    - _Requirements: 1.1, 1.2_
  
  - [x] 4.2 Add aged paper stains
    - Create multiple radial-gradient stains across page surfaces
    - Use rgba opacity between 0.14 and 0.18 for subtle aging
    - Position stains randomly for natural appearance
    - Layer stains with base paper color using background composition
    - _Requirements: 1.3_
  
  - [x] 4.3 Write property test for paper stain opacity
    - **Property 2: Paper stain opacity range**
    - **Validates: Requirements 1.3**
  
  - [x] 4.4 Create horizontal ruled diary lines
    - Implement repeating-linear-gradient for horizontal lines
    - Set line spacing to 23-24px intervals
    - Use rgba(160,125,85,0.072) color for subtle line appearance
    - _Requirements: 1.5_
  
  - [x] 4.5 Write property test for diary line spacing
    - **Property 3: Diary line spacing consistency**
    - **Validates: Requirements 1.5**
  
  - [x] 4.6 Create deckled edges along spine
    - Implement clip-path polygons for torn paper effect on spine edges
    - Position irregularly for natural handmade appearance
    - _Requirements: 1.4_
  
  - [x] 4.7 Add spine shadow effect
    - Create linear gradient or box-shadow along spine edge
    - Set width to 8-12px
    - Use rgba(0,0,0,0.08) opacity for subtle depth
    - _Requirements: 1.6_
  
  - [x] 4.8 Write property test for spine shadow dimensions
    - **Property 4: Spine shadow dimensions**
    - **Validates: Requirements 1.6**
  
  - [x] 4.9 Create page vignette effect
    - Add radial gradients at page borders
    - Transition from base cream color to darker aged tones at edges
    - Orient gradients toward page borders for natural darkening
    - _Requirements: 1.7_
  
  - [x] 4.10 Write property test for vignette structure
    - **Property 5: Page vignette gradient structure**
    - **Validates: Requirements 1.7**
  
  - [x] 4.11 Verify layout preservation for paper elements
    - Confirm all padding and margin values remain unchanged
    - Verify content positioning is preserved
    - Test at multiple viewport sizes
    - _Requirements: 1.8_

- [x] 5. Checkpoint - Verify paper texture implementation
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement decorative botanical elements
  - [x] 6.1 Create corner botanical decorations for diary pages
    - Use CSS pseudo-elements (::before, ::after) for botanical shapes
    - Position absolutely at page corners or near content areas
    - Use botanical emoji or CSS-drawn flower shapes
    - Set pointer-events: none to prevent interaction blocking
    - _Requirements: 3.1, 3.4, 3.7_
  
  - [x] 6.2 Style botanical decorations for aged appearance
    - Set opacity between 0.5 and 0.7 for subtle aged look
    - Apply drop-shadow filter with rgba(80,50,20,0.18)
    - Set z-index to 4 for proper layering above content
    - Apply botanical decoration color rgba(200,150,140,0.5) where needed
    - _Requirements: 3.2, 3.3, 3.6, 8.6_
  
  - [x] 6.3 Write property test for decorative element opacity
    - **Property 15: Decorative element opacity range**
    - **Validates: Requirements 3.2**
  
  - [x] 6.4 Add floral ornaments to homepage cover
    - Position floral decorations at corners of closed diary cover
    - Implement using CSS-drawn shapes or emoji
    - Maintain existing cover dimensions and click functionality
    - _Requirements: 3.5_
  
  - [x] 6.5 Verify decorative elements preserve functional positions
    - Confirm polaroid and note card positions unchanged
    - Test that decorations don't obscure interactive elements
    - Verify z-index layering works correctly
    - _Requirements: 3.8_

- [ ] 7. Implement polaroid photo card styling
  - [ ] 7.1 Create polaroid white background and padding
    - Set background-color to #ffffff
    - Apply padding: 7px (sides) and 24px (bottom)
    - Preserve existing width, height, and position properties
    - _Requirements: 4.1, 4.8_
  
  - [ ] 7.2 Add washi tape strip to polaroids
    - Position washi tape at top: -9px
    - Set dimensions: 52px width × 14px height
    - Apply background rgba(230,240,255,0.55)
    - Add subtle plaid stripe pattern using linear-gradient
    - _Requirements: 4.2, 4.3_
  
  - [x] 7.3 Write property test for washi tape dimensions
    - **Property 22: Washi tape dimensions**
    - **Validates: Requirements 4.2**
  
  - [ ] 7.4 Add multi-layer shadows to polaroids
    - Create box-shadow with exactly 3 comma-separated definitions
    - Use graduated shadow layers for dimensional depth
    - Preserve existing shadow opacity ranges
    - _Requirements: 4.4_
  
  - [ ] 7.5 Add caption line to polaroid bottom
    - Position caption line 4px from bottom edge
    - Style to match handwritten diary aesthetic
    - _Requirements: 4.5_
  
  - [ ] 7.6 Preserve polaroid rotation and add hover effect
    - Verify rotation angles between -4deg and 3deg are preserved
    - Add hover state with transform: scale(1.04)
    - Enhance box-shadow on hover with increased blur/spread
    - _Requirements: 4.6, 4.7_
  
  - [x] 7.7 Write property test for polaroid hover effect
    - **Property 27: Polaroid hover effect**
    - **Validates: Requirements 4.7**

- [x] 8. Implement note card styling
  - [ ] 8.1 Create torn top edge for note cards
    - Implement clip-path polygon with exactly 30 coordinate points
    - Create natural irregular torn paper appearance
    - _Requirements: 7.1_
  
  - [x] 8.2 Write property test for note card clip-path complexity
    - **Property 44: Note card clip-path complexity**
    - **Validates: Requirements 7.1**
  
  - [ ] 8.3 Apply note card background colors
    - Set default (white) variant to #f8f0e0
    - Set yellow variant to #fdf6d3
    - Set pink variant to #fde8ea
    - _Requirements: 7.2, 7.3_
  
  - [ ] 8.4 Set note card padding and typography
    - Apply padding: 14px 16px 16px
    - Apply 'Caveat' cursive font to note card title and text
    - Include proper font fallback chain
    - _Requirements: 7.4, 7.7_
  
  - [ ] 8.5 Add decorative flower to note cards
    - Position flower at bottom-right corner
    - Set font-size to 1.2rem
    - Set opacity to 0.5
    - Use emoji or CSS-drawn flower
    - _Requirements: 7.5_
  
  - [ ] 8.6 Add two-layer shadows to note cards
    - Create box-shadow with exactly 2 definitions
    - Use rgba(0,0,0,0.2) for first layer
    - Use rgba(0,0,0,0.12) for second layer
    - _Requirements: 7.6_
  
  - [ ] 8.7 Verify note card transform preservation
    - Confirm width, height, transform, and z-index unchanged
    - Test note card positioning and rotation
    - _Requirements: 7.8_

- [ ] 9. Checkpoint - Verify memory elements styling
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement homepage scene styling
  - [ ] 10.1 Create wooden table background
    - Apply linear-gradient with colors #1f0b0a to #1a0706
    - Add SVG data URI with feTurbulence for wood grain texture
    - Layer gradient and texture using background composition
    - _Requirements: 5.1, 5.4_
  
  - [ ] 10.2 Add candlelight glow effect
    - Create radial-gradient with rgba(200,100,60,0.18) at center
    - Position at center of scene for warm atmospheric lighting
    - _Requirements: 5.2_
  
  - [ ] 10.3 Create vignette effect for homepage
    - Add radial-gradient with rgba(5,0,5,0.7) at edges
    - Set transparent color stop at 40% for gradual fade
    - _Requirements: 5.3_
  
  - [x] 10.4 Write property test for homepage vignette
    - **Property 31: Homepage vignette structure**
    - **Validates: Requirements 5.3**
  
  - [ ] 10.5 Add lace cloth decoration
    - Position at top-left corner using absolute positioning
    - Apply background rgba(255,248,240,0.55)
    - Set pointer-events: none
    - _Requirements: 5.5_
  
  - [ ] 10.6 Create dried flowers decoration
    - Position at right side of scene
    - Implement using CSS-drawn shapes (border-radius, pseudo-elements)
    - Avoid external image URLs
    - _Requirements: 5.6_
  
  - [ ] 10.7 Add glass vase element
    - Create using linear-gradient with rgba blue values
    - Position near dried flowers for cohesive decoration
    - _Requirements: 5.7_
  
  - [ ] 10.8 Enhance diary cover on homepage
    - Add floral corner ornaments to cover
    - Verify cover dimensions and click interaction preserved
    - Test that cover opens diary correctly
    - _Requirements: 5.8_

- [x] 11. Implement diary scene book structure
  - [ ] 11.1 Create hardcover back styling
    - Apply linear-gradient at 160deg angle
    - Use color stops: #c9849a → #a8606e → #c9849a
    - _Requirements: 6.1_
  
  - [x] 11.2 Write property test for hardcover gradient
    - **Property 37: Hardcover gradient structure**
    - **Validates: Requirements 6.1**
  
  - [ ] 11.3 Create visible spine styling
    - Set width to 24px
    - Apply layered background gradients (2 or more gradient functions)
    - Position at center between pages
    - _Requirements: 6.2_
  
  - [ ] 11.4 Create left and right hinge elements
    - Left hinge: linear-gradient 90deg from #8a4a5a to #a85f70, width 28px
    - Right hinge: linear-gradient -90deg from #8a4a5a to #a85f70, width 28px
    - Position adjacent to spine
    - _Requirements: 6.3, 6.4_
  
  - [x] 11.5 Write property test for hinge gradients
    - **Property 39: Left hinge gradient**
    - **Property 40: Right hinge gradient**
    - **Validates: Requirements 6.3, 6.4**
  
  - [ ] 11.6 Add top and bottom binding edges
    - Set height to 10px for both edges
    - Apply gradient shadows for dimensional appearance
    - Position at top and bottom of book
    - _Requirements: 6.5_
  
  - [ ] 11.7 Add book shadow for table resting effect
    - Apply exactly 2 drop-shadow filter definitions
    - Create appearance of book resting on table surface
    - _Requirements: 6.6_
  
  - [ ] 11.8 Set book border radius
    - Apply border-radius: 6px 14px 14px 6px
    - Create rounded hardcover edge appearance
    - _Requirements: 6.7_
  
  - [ ] 11.9 Verify diary scene functionality preservation
    - Test page flip animations work correctly
    - Verify navigation arrows function properly
    - Test toolbar and edit mode functionality
    - _Requirements: 6.8_

- [ ] 12. Checkpoint - Verify scene styling implementation
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Verify layout and animation preservation
  - [ ] 13.1 Verify flexbox and grid layout preservation
    - Check all display: flex and display: grid elements
    - Verify flex-direction, justify-content, align-items unchanged
    - Test grid-template values preserved
    - _Requirements: 10.1_
  
  - [ ] 13.2 Verify positioning preservation
    - Check all position: absolute, relative, fixed elements
    - Verify top, right, bottom, left offset values unchanged
    - _Requirements: 10.2_
  
  - [ ] 13.3 Verify dimension preservation
    - Check all width, height, aspect-ratio values
    - Verify min/max width and height values unchanged
    - _Requirements: 10.3_
  
  - [ ] 13.4 Verify spacing preservation
    - Check all padding and margin values
    - Verify spacing consistency across elements
    - _Requirements: 10.4_
  
  - [ ] 13.5 Verify z-index preservation
    - Check all z-index declarations
    - Verify stacking order unchanged
    - _Requirements: 10.5_
  
  - [ ] 13.6 Verify responsive behavior preservation
    - Test media query breakpoints at 700px and 768px
    - Verify clamp() function parameters unchanged
    - Test at multiple viewport sizes
    - _Requirements: 10.6, 10.7_
  
  - [x] 13.7 Write property test for layout preservation
    - **Property 6: Layout property preservation**
    - **Validates: Requirements 1.8, 10.4**
  
  - [ ] 13.8 Verify transition and animation preservation
    - Check transform transitions (0.2s-0.4s duration)
    - Check opacity transitions (0.15s-0.35s duration)
    - Check box-shadow transitions (0.15s-0.25s duration)
    - Verify page flip animation (0.65s, cubic-bezier easing)
    - Verify floating petal animations (12-28s, linear timing)
    - Verify button pulse animation (3s, ease-in-out)
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_
  
  - [x] 13.9 Write property test for animation timing preservation
    - **Property 59: Animation timing preservation**
    - **Validates: Requirements 9.4**
  
  - [ ] 13.10 Verify keyframe definitions unchanged
    - Check all @keyframes rules
    - Verify keyframe names, percentages, and properties preserved
    - _Requirements: 11.8_

- [x] 14. Verify JavaScript compatibility and functionality
  - [ ] 14.1 Verify DOM structure preservation
    - Confirm no changes to HTML files (diary.html, index.html)
    - Verify all element IDs and classes unchanged
    - Check all data-* attributes preserved
    - _Requirements: 9.2, 12.2_
  
  - [ ] 14.2 Verify CSS selector compatibility
    - Test all selectors used by JavaScript querySelector calls
    - Verify selectors still match intended elements
    - _Requirements: 12.5_
  
  - [ ] 14.3 Test interactive functionality
    - Test page flip functionality
    - Test edit mode toggle and element selection
    - Test add memory modal (open, input, submit)
    - Test storage (save and load diary state)
    - Test navigation arrows and keyboard shortcuts
    - _Requirements: 9.3, 9.4, 9.5, 9.6, 9.7_
  
  - [ ] 14.4 Verify no JavaScript modifications
    - Confirm all files in js/ directory unchanged
    - Verify no inline JavaScript added to HTML
    - _Requirements: 9.1, 12.3_

- [x] 15. Final integration and polish
  - [ ] 15.1 Add CSS section comments for maintainability
    - Document major styling sections
    - Add comments for complex implementations (paper texture, decorations)
    - Note property preservation constraints
    - _Requirements: 12.7_
  
  - [ ] 15.2 Optimize CSS custom property usage
    - Review color custom properties for consistency
    - Ensure variables are used where beneficial
    - Maintain separation of concerns (styling vs. behavior)
    - _Requirements: 12.4, 12.6_
  
  - [ ] 15.3 Cross-browser compatibility check
    - Test clip-path rendering
    - Test CSS custom properties
    - Test multiple background layers
    - Test drop-shadow filters
    - Verify fallback fonts work correctly
    - _Requirements: 2.8_
  
  - [ ] 15.4 Visual quality review
    - Review paper texture appearance at normal viewing distance
    - Check decorative elements are subtle and not obtrusive
    - Verify color harmony across all scenes
    - Test warm and inviting aesthetic achieved
    - _Requirements: 1.2, 3.2_
  
  - [x] 15.5 Write integration tests for visual quality
    - Test homepage scene rendering
    - Test diary scene rendering
    - Test memory elements rendering
    - Test responsive behavior

- [x] 16. Final checkpoint - Complete testing and validation
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- All implementation is CSS-only - no HTML or JavaScript modifications allowed
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at logical breaks
- Property tests validate universal correctness properties from the design document
- Layout preservation is critical - all positioning, dimensions, and spacing must remain unchanged
- Animation and transition preservation ensures smooth user experience continuity
- The implementation follows five architectural layers: typography, colors, paper texture, decorative elements, and scene styling

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "1.4", "1.5", "2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4"] },
    { "id": 3, "tasks": ["4.1", "4.2"] },
    { "id": 4, "tasks": ["4.3", "4.4", "4.6", "4.7", "4.9", "4.11"] },
    { "id": 5, "tasks": ["4.5", "4.8", "4.10"] },
    { "id": 6, "tasks": ["6.1", "6.2", "6.4", "6.5"] },
    { "id": 7, "tasks": ["6.3", "7.1", "7.2", "7.4", "7.5", "7.6"] },
    { "id": 8, "tasks": ["7.3", "7.7", "8.1", "8.3", "8.4", "8.5", "8.6", "8.7"] },
    { "id": 9, "tasks": ["8.2"] },
    { "id": 10, "tasks": ["10.1", "10.2", "10.3", "10.5", "10.6", "10.7", "10.8"] },
    { "id": 11, "tasks": ["10.4", "11.1", "11.3", "11.4", "11.6", "11.7", "11.8", "11.9"] },
    { "id": 12, "tasks": ["11.2", "11.5"] },
    { "id": 13, "tasks": ["13.1", "13.2", "13.3", "13.4", "13.5", "13.6", "13.8", "13.10"] },
    { "id": 14, "tasks": ["13.7", "13.9", "14.1", "14.2", "14.3", "14.4"] },
    { "id": 15, "tasks": ["15.1", "15.2", "15.3", "15.4"] },
    { "id": 16, "tasks": ["15.5"] }
  ]
}
```
