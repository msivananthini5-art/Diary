# Requirements Document

## Introduction

This specification defines the visual styling update for the SABI Living Diary web application to achieve a handwritten, handmade scrapbook aesthetic with warm sandalwood cream paper texture, floral botanical decorations, and vintage diary feel. The update SHALL preserve all existing functionality, content positions, layout structure, and interactive behaviors while transforming only the visual presentation layer.

## Glossary

- **Diary_Application**: The complete SABI Living Diary web-based journal system
- **Homepage_Scene**: The landing page displaying the closed diary cover on a wooden table
- **Diary_Scene**: The open diary view showing two-page spreads with memories
- **Visual_Layer**: CSS styling, fonts, colors, textures, backgrounds, and decorative elements
- **Functional_Layer**: JavaScript logic, DOM structure, event handlers, data management, and user interactions
- **Memory_Element**: A diary entry containing date, title, text, photo, and notes
- **Decorative_Element**: Botanical illustrations, floral ornaments, or embellishments that enhance visual aesthetics
- **Paper_Texture**: The visual appearance of handmade diary paper including grain, edges, aging, and warmth
- **Typography_System**: The collection of handwritten and cursive fonts used throughout the interface
- **Warm_Palette**: A color scheme featuring sandalwood cream, aged ivory, vintage sepia, and soft floral tones
- **Scrapbook_Aesthetic**: A visual style reminiscent of handmade journals with torn edges, washi tape, pressed flowers, and personal touches

## Requirements

### Requirement 1

**User Story:** As a diary user, I want the paper to look and feel like handmade sandalwood cream diary pages, so that the digital experience feels warm, personal, and tactile.

#### Acceptance Criteria

1. THE Paper_Texture SHALL display a warm sandalwood cream base color ranging from #f7ead8 to #e5d0aa
2. THE Paper_Texture SHALL include subtle fiber texture visible at normal viewing distance without creating grid or repetitive patterns
3. THE Paper_Texture SHALL display aged paper stains using radial gradients with rgba opacity between 0.14 and 0.18
4. THE Paper_Texture SHALL render natural deckled or torn edges along the spine side of each page
5. WHEN Paper_Texture is rendered, THE Diary_Application SHALL display horizontal ruled diary lines spaced 23-24 pixels apart with rgba(160, 125, 85, 0.072) color
6. THE Paper_Texture SHALL include subtle shadow along the spine edge between 8-12 pixels wide with rgba(0,0,0,0.08) opacity
7. THE Paper_Texture SHALL maintain vignette effect at page borders using gradients from base cream to darker aged tones
8. THE Paper_Texture SHALL preserve all existing page padding, margins, and content positioning

### Requirement 2

**User Story:** As a diary user, I want handwritten and cursive fonts throughout the interface, so that the diary feels personal and authentic like handwritten journal entries.

#### Acceptance Criteria

1. THE Typography_System SHALL use 'Satisfy' cursive font for all memory titles with font-size 1.1rem
2. THE Typography_System SHALL use 'Patrick Hand' cursive font for all memory text, dates, and notes with font-size between 0.76rem and 0.85rem
3. THE Typography_System SHALL use 'Pinyon Script' cursive font for the homepage cover title and page decorative titles
4. THE Typography_System SHALL use 'Caveat' cursive font for supplementary text and UI labels
5. THE Typography_System SHALL maintain existing line-height values ranging from 1.3 to 1.78 for readability
6. THE Typography_System SHALL preserve all existing text color values for consistency with warm paper tones
7. THE Typography_System SHALL load fonts from Google Fonts CDN with preconnect optimization
8. WHEN Typography_System is rendered, THE Diary_Application SHALL display all text with proper font fallbacks defined

### Requirement 3

**User Story:** As a diary user, I want floral and botanical decorations throughout the diary, so that pages feel embellished like a handmade scrapbook.

#### Acceptance Criteria

1. THE Decorative_Element SHALL include pressed botanical illustrations positioned on page corners or near content
2. THE Decorative_Element SHALL use opacity between 0.5 and 0.7 to appear subtle and aged
3. THE Decorative_Element SHALL apply drop-shadow filter with rgba(80,50,20,0.18) for dimensional depth
4. THE Decorative_Element SHALL position elements with pointer-events set to none to prevent interaction blocking
5. THE Decorative_Element SHALL include floral ornaments on homepage cover in corner positions
6. WHEN Decorative_Element is added, THE Visual_Layer SHALL maintain z-index value of 4 to layer above content without obscuring text
7. THE Decorative_Element SHALL use botanical emoji or CSS-drawn flowers without requiring external image assets
8. THE Decorative_Element SHALL preserve existing functional element positions including polaroids and note cards

### Requirement 4

**User Story:** As a diary user, I want polaroid photos to look like physical scrapbook elements with washi tape, so that memories feel tangible and personally curated.

#### Acceptance Criteria

1. THE Memory_Element polaroid SHALL display white (#ffffff) background with padding of 7px sides and 24px bottom
2. THE Memory_Element polaroid SHALL include washi tape strip positioned top minus 9px with 52px width and 14px height
3. THE Memory_Element polaroid washi tape SHALL use translucent background rgba(230,240,255,0.55) with subtle plaid stripe pattern
4. THE Memory_Element polaroid SHALL display box-shadow with multiple layers totaling 3 shadow definitions for depth
5. THE Memory_Element polaroid SHALL include caption area line at bottom positioned 4px from edge
6. THE Memory_Element polaroid SHALL maintain existing transform rotation values between negative 4 and positive 3 degrees
7. WHEN Memory_Element polaroid is hovered, THE Visual_Layer SHALL apply scale(1.04) transform and increased shadow
8. THE Memory_Element polaroid SHALL preserve all existing width, height, and position properties from current implementation

### Requirement 5

**User Story:** As a diary user, I want the homepage wooden table scene to have warm atmospheric lighting, so that the closed diary feels inviting and cozy.

#### Acceptance Criteria

1. THE Homepage_Scene SHALL display wooden table background with linear-gradient colors #1f0b0a to #1a0706
2. THE Homepage_Scene SHALL include warm candlelight glow using radial-gradient with rgba(200,100,60,0.18) at center
3. THE Homepage_Scene SHALL display subtle vignette effect with rgba(5,0,5,0.7) at edges fading to transparent at 40 percent
4. THE Homepage_Scene SHALL include wood grain texture using SVG data URI with fractal noise
5. THE Homepage_Scene SHALL position lace cloth decoration at top-left corner with rgba(255,248,240,0.55) background
6. THE Homepage_Scene SHALL display dried flowers decoration at right side using CSS-drawn shapes
7. THE Homepage_Scene SHALL include glass vase element with linear-gradient rgba blues for translucency
8. THE Homepage_Scene SHALL preserve all existing diary cover dimensions, text, and interactive click behavior

### Requirement 6

**User Story:** As a diary user, I want the open diary to show a physical hardcover book appearance with spine and binding, so that pages feel like part of a real bound journal.

#### Acceptance Criteria

1. THE Diary_Scene SHALL display hardcover back using linear-gradient from #c9849a to #a8606e to #c9849a at 160deg angle
2. THE Diary_Scene SHALL include visible spine at center with 24px width and layered background gradients
3. THE Diary_Scene SHALL display left hinge using linear-gradient 90deg from #8a4a5a to #a85f70 with 28px width
4. THE Diary_Scene SHALL display right hinge using linear-gradient negative 90deg from #8a4a5a to #a85f70 with 28px width
5. THE Diary_Scene SHALL include top and bottom binding edges with 10px height and gradient shadows
6. THE Diary_Scene SHALL apply drop-shadow filters totaling 2 shadow layers for book resting on table effect
7. THE Diary_Scene SHALL display border-radius of 6px 14px 14px 6px for rounded hardcover edges
8. THE Diary_Scene SHALL preserve all existing page flip animations, navigation arrows, and toolbar functionality

### Requirement 7

**User Story:** As a diary user, I want note cards to have torn paper tops and vintage colors, so that annotations feel like handwritten notes tucked into pages.

#### Acceptance Criteria

1. THE Memory_Element note card SHALL display torn top edge using clip-path polygon with 30 coordinate points
2. THE Memory_Element note card SHALL use base background color #f8f0e0 for default white variant
3. THE Memory_Element note card SHALL include variant colors #fdf6d3 for yellow and #fde8ea for pink
4. THE Memory_Element note card SHALL display padding of 14px 16px 16px for consistent inner spacing
5. THE Memory_Element note card SHALL include decorative flower element positioned at bottom-right with 1.2rem font-size and 0.5 opacity
6. THE Memory_Element note card SHALL apply box-shadow with 2 shadow definitions totaling rgba(0,0,0,0.2) and rgba(0,0,0,0.12)
7. THE Memory_Element note card SHALL use 'Caveat' cursive font for title and text content
8. THE Memory_Element note card SHALL preserve all existing dimensions, rotations, and z-index layering

### Requirement 8

**User Story:** As a diary user, I want the color palette to feel warm, aged, and cohesive, so that the entire diary experience feels harmonious and inviting.

#### Acceptance Criteria

1. THE Warm_Palette SHALL define primary paper colors in the range #f7ead8 to #e5d0aa for cream tones
2. THE Warm_Palette SHALL define text colors using #2c221e for primary text and #8b6040 for dates and labels
3. THE Warm_Palette SHALL define accent colors using #a8606e for buttons and #b07080 for hearts and decorative elements
4. THE Warm_Palette SHALL define shadow colors using rgba(0,0,0,0.08) to rgba(0,0,0,0.25) for subtle depth
5. THE Warm_Palette SHALL define background scene colors from #1a0810 to #1f0b0a for dark wooden table
6. THE Warm_Palette SHALL define botanical decoration colors using rgba(200,150,140,0.5) for floral elements
7. THE Warm_Palette SHALL define washi tape colors using rgba(230,240,255,0.55) for translucent blue tape
8. THE Warm_Palette SHALL maintain existing color relationships for sufficient contrast and readability

### Requirement 9

**User Story:** As a diary user, I want all interactive elements to remain fully functional, so that the visual update does not break any existing features.

#### Acceptance Criteria

1. THE Functional_Layer SHALL preserve all JavaScript files without modifications to logic or data structures
2. THE Functional_Layer SHALL maintain all DOM element IDs, classes, and data attributes used by scripts
3. THE Functional_Layer SHALL preserve all event listeners for clicks, hovers, and keyboard interactions
4. THE Functional_Layer SHALL maintain all page flip animations with existing timing and easing functions
5. THE Functional_Layer SHALL preserve edit mode toggling with element selection and toolbar visibility
6. THE Functional_Layer SHALL maintain add memory modal with all input fields and submission handlers
7. THE Functional_Layer SHALL preserve storage functionality for saving and loading diary state
8. WHEN Functional_Layer is tested, THE Diary_Application SHALL execute all user interactions without errors or regressions

### Requirement 10

**User Story:** As a diary user, I want the layout structure to remain unchanged, so that content positions and responsive behavior are preserved.

#### Acceptance Criteria

1. THE Visual_Layer SHALL maintain all existing flexbox and grid layout properties
2. THE Visual_Layer SHALL preserve all position absolute, relative, and fixed declarations
3. THE Visual_Layer SHALL maintain all width, height, and aspect-ratio values for containers
4. THE Visual_Layer SHALL preserve all padding and margin values for spacing consistency
5. THE Visual_Layer SHALL maintain all z-index layering for proper element stacking
6. THE Visual_Layer SHALL preserve all media query breakpoints at 700px and 768px for responsive behavior
7. THE Visual_Layer SHALL maintain all clamp() functions for fluid typography scaling
8. WHEN Visual_Layer is rendered at different viewport sizes, THE Diary_Application SHALL display content without layout shifts or overlaps

### Requirement 11

**User Story:** As a diary user, I want subtle animations and transitions, so that interactions feel smooth and polished.

#### Acceptance Criteria

1. THE Visual_Layer SHALL preserve all existing transition properties on buttons, cards, and interactive elements
2. THE Visual_Layer SHALL maintain transform transitions with 0.2s to 0.4s duration for hover states
3. THE Visual_Layer SHALL preserve opacity transitions with 0.15s to 0.35s duration for fade effects
4. THE Visual_Layer SHALL maintain box-shadow transitions with 0.15s to 0.25s duration for depth changes
5. THE Visual_Layer SHALL preserve page flip animations with 0.65s duration and cubic-bezier(0.68, -0.55, 0.265, 1.55) easing
6. THE Visual_Layer SHALL maintain floating petal animations with 12-28s duration and linear timing
7. THE Visual_Layer SHALL preserve button pulse animations with 3s duration and ease-in-out timing
8. THE Visual_Layer SHALL maintain all keyframe animation definitions without modification

### Requirement 12

**User Story:** As a developer, I want the styling changes isolated to CSS files, so that implementation is clean and maintainable.

#### Acceptance Criteria

1. THE Visual_Layer SHALL modify only files in the css directory including diary.css, homepage.css, and related stylesheets
2. THE Visual_Layer SHALL preserve all HTML structure in diary.html and index.html without DOM changes
3. THE Visual_Layer SHALL maintain all JavaScript files in the js directory without logic modifications
4. THE Visual_Layer SHALL use CSS custom properties for repeated color values if beneficial for maintenance
5. THE Visual_Layer SHALL preserve all existing CSS class names and selectors used by JavaScript
6. THE Visual_Layer SHALL maintain separation of concerns with styling in CSS and behavior in JavaScript
7. THE Visual_Layer SHALL include comments documenting major styling sections for clarity
8. WHEN Visual_Layer is reviewed, THE implementation SHALL follow existing code organization patterns
