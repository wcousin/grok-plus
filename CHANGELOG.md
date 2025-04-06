# Changelog

All notable changes to the Grok Plus Chrome extension will be documented in this file.

## [0.1.2] - 2025-04-05

### Fixed
- Fixed premium upgrade flow not working correctly
- Added proper error handling for license verification
- Improved debug logging throughout the premium flow
- Fixed service worker registration issues
- Added proper success page after Stripe payment
- Fixed background script syntax errors

### Added
- Hourly premium status verification
- Improved premium status synchronization across tabs
- Better error messages for failed upgrades
- Detailed debug logging for troubleshooting

## [0.1.1] - 2025-03-31

### Fixed
- Fixed issue where clicking "Add Prompt" button did not display the form
- Fixed issue where prompt grid remained hidden after closing the form
- Fixed issue where prompts were not visible in the "Prompts" tab without page reload
- Improved modal visibility using CSS classes instead of inline styles

## [0.1.0] - 2025-03-31

### Added
- Initial release of Grok Plus Chrome extension
- Modern UI with dark theme and consistent design system
- Prompt management system with CRUD operations
- Category system for organizing prompts
- Search functionality for finding prompts
- Favorites system for quick access to important prompts
- Recent prompts section for easy access to latest used prompts
- Grid and list view options for prompt display
- Modal system for adding and viewing prompts
- Responsive design with mobile menu support

### Features
- **Prompt Management**
  - Create, read, update, and delete prompts
  - Rich text editing for prompt content
  - Category assignment for organization
  - Favorite marking for quick access
  - Last viewed tracking
  - Duplicate prompt functionality

- **Categories**
  - Pre-defined category system
  - Category-based filtering
  - Color coding for different categories
  - Add new categories functionality

- **User Interface**
  - Modern dark theme with consistent color system
  - Grid and list view options
  - Search bar for finding prompts
  - Responsive design for all screen sizes
  - Smooth transitions and animations
  - Settings menu for view preferences
  - Mobile-friendly navigation

- **Storage**
  - Local Chrome storage for prompts and categories
  - Automatic state persistence
  - Modal state preservation across page reloads

### Technical Details
- Built with vanilla JavaScript for optimal performance
- CSS custom properties for consistent theming
- Chrome Extension APIs integration
- Event delegation for dynamic content
- Modular code structure
- Responsive CSS Grid layout system

### Design System
- Comprehensive color system with semantic variables
- Typography scale with responsive sizes
- Consistent spacing system
- Border radius system for visual hierarchy
- Transition system for smooth animations

### Known Issues
- None at this time

### Coming Soon
- Export/Import functionality for prompts
- Cloud sync support
- Additional view customization options
- Enhanced prompt editing capabilities
- Tag system for more granular organization
