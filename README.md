# Grok Plus

A powerful Chrome extension for managing and organizing your Grok AI prompts.

## Features

- 📝 Create and manage AI prompts
- 🗂️ Organize prompts by categories
- ⭐ Mark favorites for quick access
- 🔍 Search through your prompts
- 📱 Responsive design with grid/list views
- 🌙 Modern dark theme interface

## Installation

1. Clone this repository or download the source code
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## Usage

1. Click the Grok Plus icon in your Chrome toolbar
2. Use the "Add Prompt" button to create new prompts
3. Organize prompts by categories
4. Search for prompts using the search bar
5. Toggle between grid and list views
6. Mark prompts as favorites for quick access

## Development

The extension is built with vanilla JavaScript and uses:
- Chrome Extension APIs
- Local storage for data persistence
- CSS custom properties for theming
- CSS Grid for layout

### Project Structure

```
grok-plus/
├── manifest.json      # Extension configuration
├── content.js        # Main extension logic
├── styles.css        # Styling
├── popup.html        # Extension popup
├── assets/          # Icons and images
├── CHANGELOG.md     # Version history
└── README.md        # Documentation
```

### Building

No build step required - this is a vanilla JavaScript extension.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use and modify as needed.

## Version History

See [CHANGELOG.md](CHANGELOG.md) for version history.
