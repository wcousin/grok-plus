# Grok Plus

A powerful Chrome extension for managing and organizing your AI prompts.

## Features

### Free Plan
- 📝 Store up to 5 AI prompts
- 🗂️ Create 1 custom category
- 🌙 Modern dark theme interface
- 📱 Responsive design with grid/list views

### Premium Plan ($3/month)
- 📝 Unlimited AI prompts
- 🗂️ Unlimited custom categories

## Installation

### Extension Setup
1. Clone this repository or download the source code
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

### Server Setup
1. Navigate to the `server` directory
2. Copy `.env.example` to `.env` and fill in the required values:
   ```env
   FIREBASE_DATABASE_URL=your_firebase_url
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_PRICE_ID=your_stripe_price_id
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   EXTENSION_URL=http://localhost:3000
   ```
3. Install dependencies: `npm install`
4. Start the server: `node server.js`

### Firebase Setup
1. Create a new Firebase project
2. Enable Realtime Database
3. Add your service account key to `server/serviceAccountKey.json`

### Stripe Setup
1. Create a Stripe account
2. Set up a subscription product
3. Configure the webhook endpoint to `http://localhost:3000/webhook`
4. Add the webhook secret to your `.env` file

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
├── background.js     # Background service worker
├── content.js        # Main extension logic
├── styles.css        # Styling
├── server/
│   ├── server.js     # Express server for premium features
│   ├── .env          # Environment variables
│   └── serviceAccountKey.json  # Firebase credentials
├── popup.html        # Extension popup
├── assets/          # Icons and images
├── server/          # Backend server for premium features
│   ├── server.js    # Express server with Stripe integration
│   └── package.json # Server dependencies
├── services/        # Frontend services
│   └── premium.js   # Premium feature management
├── modals/          # UI components
│   └── upgrade.js   # Premium upgrade modal
├── CHANGELOG.md     # Version history
└── README.md        # Documentation
```

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your configuration:
   ```env
   PORT=3000
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_PRICE_ID=your_stripe_price_id
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   FIREBASE_DATABASE_URL=your_firebase_database_url
   ```

4. Start the server:
   ```bash
   npm start
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

