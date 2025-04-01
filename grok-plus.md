<xaiArtifact>
# Grok Plus

A Chrome extension to enhance your Grok experience with custom prompts and categories.

## Overview

Grok Plus adds powerful prompt management capabilities to Grok:

- Create and manage custom prompts with categories
- Search through your prompt library
- Organize prompts with favorites and categories
- Toggle between grid and list views
- Edit, duplicate, or delete prompts via a more menu
- Track prompt creation and usage dates
- Basic settings menu (placeholder for future options)

## Installation

1. Download or clone the repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory containing `manifest.json`, `content.js`, `styles.css`, and an `icons` folder
5. The Grok Plus icon (`add_circle`) will appear between the Grok 3 dropdown and "Send" button on grok.com

## Usage

### Adding Prompts
1. Click the `add_circle` icon on grok.com to open the modal
2. Click "Add Prompt" in the top right
3. Fill in:
   - **Title**: Prompt name
   - **Content**: Prompt text
   - **Category**: Select or create a new one
   - **Favorite**: Check to mark as favorite
4. Click "Add Prompt" to save

### Managing Categories
1. In the sidebar, click "Add Category" under "CATEGORIES"
2. Enter a name and pick a color
3. Click "Add Category" to save

### Using Prompts
- **View**: Switch between "Prompts", "Recent", and "Favorites" in the sidebar
- **Search**: Type in the search bar to filter by title or content
- **Toggle View**: Use grid (`grid_view`) or list (`view_list`) buttons
- **Favorite**: Click the star to toggle favorite status
- **More Menu**: Click the three-dot icon for:
  - **Edit**: Modify the prompt
  - **Duplicate**: Create a copy
  - **Delete**: Remove with confirmation
- **Click**: Updates "last viewed" timestamp (future integration with Grok input planned)

### Settings
- Click the settings icon for a dropdown (currently placeholder options: "Settings", "Help", "About")

## Storage

Uses `chrome.storage.local` with this structure:

```javascript
{
  "grokPlus": {
    "prompts": [
      {
        "name": "string",           // Prompt title
        "content": "string",        // Prompt text
        "category": "string",       // Category name or "uncategorized"
        "isFavorite": boolean,      // Favorite status
        "createdDate": "ISO string", // Creation date
        "lastViewed": "ISO string"   // Last viewed date
      }
    ],
    "categories": [
      {
        "name": "string",           // Category name
        "color": "string"           // Color identifier (e.g., "business")
      }
    ]
  }
}