# MyAI Notes

A lightweight, privacy-focused note-taking web application that uses OpenAI's and Anthropic's APIs to expand your short notes into detailed, well-structured text. All data is stored locally in your browser, ensuring complete privacy and control.

## Features

### Core Features
- **AI-Powered Expansion**: Transform short notes into detailed content using OpenAI GPT or Anthropic Claude models
- **Local Storage**: All notes are stored in your browser's localStorage - no server, no cloud
- **Markdown Rendering**: Expanded notes are rendered with beautiful Markdown formatting
- **Persistent Formatting**: Applied AI output keeps its Markdown structure even after reloading the page
- **Selective Regeneration**: Highlight a saved passage to rewrite just that section without regenerating the entire note
- **Auto-Save**: Notes are automatically saved as you type
- **Export/Import**: Export individual notes as .txt files or all notes as JSON

### User Interface
- **Sidebar Layout**: Intuitive layout similar to modern note-taking apps
- **Dark/Light Mode**: Toggle between themes, with automatic system preference detection
- **Minimalist Design**: Clean, distraction-free interface focused on productivity
- **Responsive**: Works on desktop and mobile devices
- **Published Notes Drawer**: Curate selected notes into a dedicated, distraction-free panel that surfaces concise snippets and opens the full published Markdown in a dedicated reader that temporarily replaces the sidebar and editor, with a back button to return to editing
- **Expanded Note Toggle**: Collapse the AI output when you just want to focus on the saved version

### Customization
- **Model Selection**: Choose from GPT-4o, GPT-4o-mini, GPT-4 Turbo, GPT-3.5 Turbo, or Claude 3.x models
- **Temperature Control**: Adjust creativity level (0-2) for AI responses
- **Secure API Key Storage**: Your OpenAI API key is stored locally and never sent anywhere except OpenAI

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- An OpenAI API key (get one at [OpenAI Platform](https://platform.openai.com/api-keys))
- (Optional) An Anthropic Claude API key (get one at [Anthropic Console](https://console.anthropic.com/))

### Installation

#### Option 1: Use GitHub Pages (Recommended)
1. Fork this repository
2. Go to repository Settings > Pages
3. Under "Build and deployment", select:
   - Source: **GitHub Actions**
4. Push any commit to the `main` branch to trigger deployment
5. Your app will be available at `https://yourusername.github.io/myai-notes/`

#### Option 2: Run Locally
1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/myai-notes.git
   cd myai-notes
   ```

2. **Serve the app through a local web server** (required for Claude requests and recommended for OpenAI too):
   ```bash
   # Using Python 3
   python -m http.server 8000

   # Using Node.js
   npx serve
   ```

3. Navigate to `http://localhost:8000` in your browser

### Configuration

1. **Set Your OpenAI API Key**:
   - Click the Settings button (⚙️) in the top right
   - Enter your OpenAI API key (starts with `sk-`)
   - Click "Save Key"
   - Your key is stored locally and securely in your browser

2. **Set Your Claude API Key (Optional)**:
   - Toggle **Enable Claude (Anthropic)** in Settings
   - Enter your Claude API key (starts with `sk-ant-`)
   - Click "Save Key"
   - In the Anthropic Console, enable **Browser access** for that key so it can be used from this web app

   > **Note:** The app already sends the `anthropic-dangerous-direct-browser-access: true` header required for in-browser calls, following the [Claude API browser access guide](https://docs.claude.com/en/docs/intro/browser-access). Without the browser access toggle, requests will be blocked and result in a network error.

3. **Configure Model Settings** (Optional):
   - Choose your preferred model (OpenAI or Claude)
   - Adjust the temperature (creativity) slider
   - Click "Save Model Settings"

## Usage

### Creating and Expanding Notes

1. **Create a New Note**:
   - Click the "+ New Note" button in the sidebar
   - Give your note a title
   - Write a short note in the input area

2. **Expand with AI**:
   - Click the "✨ Expand with AI" button
   - Wait for the AI to process your note
   - The expanded content appears on the right with Markdown formatting
   - Click "📌 Set as Note" to replace your original text with the generated version (you can always return to editing with the "✏️ Edit" button). Saved notes keep the AI-generated Markdown formatting when you revisit them later.
   - Use the "🙈 Hide" / "👁️ Show" toggle to collapse the expanded draft after you are happy with it.

3. **Save and Export**:
   - Notes are auto-saved as you type
   - Click "💾 Save" to manually save
   - Click "📄 Export as .txt" to download the current note
   - Click "📋 Copy" to copy the expanded content

### Publishing notes

1. Finish writing or expanding a note so that it contains the Markdown you want to share.
2. Click "📢 Publish Note" to add it to the Published Notes drawer. If you change the note later, the button switches to "📢 Update Published" so you can refresh the published version, or cancel and choose to unpublish it entirely.
3. Open the 📰 Published Notes drawer to skim snippets of the notes you have explicitly published. Click any card to replace the entire workspace (sidebar and editor) with a full, read-only view of the published Markdown, then use the ⬅️ Back button to resume editing.

### Regenerating a section

1. Highlight the portion of the note you want to update. You can select text directly in the formatted view or click "✏️ Edit" to select it inside the editor.
2. Click the "🔁 Regenerate Selection" button to ask the AI to rewrite only that passage.
3. The replacement text is inserted immediately, preserving Markdown formatting. If the selection includes heavy formatting that cannot be mapped from the formatted preview, switch to the editor view and highlight the text there instead.

### Managing Notes

- **View All Notes**: Your notes appear in the sidebar, sorted by most recent
- **Switch Notes**: Click any note in the sidebar to view/edit it
- **Delete Notes**: Click the 🗑️ button to delete the current note
- **Import/Export All**: Use the Import/Export buttons in the sidebar to backup all notes
- **Review Published Notes**: Click the 📰 button in the header to open the published notes drawer. Each entry shows a short snippet so you can quickly find the right note—click a card to load a full-viewport reader of the published Markdown that temporarily hides the sidebar and editor, then tap ⬅️ Back to return to the editor. Press `Esc` or the ✖️ button to close the drawer.

### Themes

- Click the theme toggle button (🌙/☀️) in the header
- The app automatically detects your system preference on first load
- Your theme preference is saved and persists across sessions

### Troubleshooting Claude network errors

If you encounter the message `Network error: Unable to connect to Claude API`, work through the checklist below:

1. **Serve the app via HTTP/HTTPS** – Opening `index.html` directly from disk prevents secure cross-origin requests. Use a local server (`python -m http.server 8000`) or deploy to GitHub Pages.
2. **Enable browser access for your key** – In the Anthropic Console, visit **Settings → API Keys**, edit the key you saved in MyAI Notes, and toggle on **Browser access**.
3. **Allow outbound HTTPS** – Ensure your network allows access to `https://api.anthropic.com`. Corporate firewalls or VPNs may require allow-listing this domain.

After applying any changes, refresh the page and try expanding a note again.

## Project Structure

```
myai-notes/
├── index.html              # Main application page
├── settings.html           # Settings/configuration page
├── css/
│   └── style.css          # All styles with light/dark themes
├── js/
│   ├── main.js            # Core app logic (expand, save, export)
│   ├── storage.js         # localStorage management
│   ├── settings.js        # API key and model configuration
│   └── theme.js           # Dark/light mode toggle
├── .github/
│   └── workflows/
│       ├── deploy.yml                 # GitHub Pages deployment config
│       └── pr-preview-artifact.yml    # Downloadable preview build for pull requests
└── README.md              # This file
```

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Storage**: Browser localStorage API
- **Markdown**: marked.js (v9.1.6)
- **API**: OpenAI Chat Completions API
- **Deployment**: GitHub Pages + GitHub Actions

## Security & Privacy

### What's Stored Locally
- Your OpenAI API key (encrypted by browser)
- All your notes and their content
- Model preferences (model type, temperature)
- Theme preference (light/dark)

### What's Sent to OpenAI
- Only the note content you choose to expand
- Your API key for authentication
- Model configuration (model name, temperature)

### What's NOT Collected
- No analytics or tracking
- No data sent to any third-party servers
- No account creation or login required
- No cookies (except localStorage for functionality)

### Best Practices
- Never share your API key with anyone
- Keep your OpenAI account secure
- Regularly backup your notes using JSON export
- Clear your API key if using a shared computer

## Cost Information

This app uses the OpenAI API, which charges based on usage:
- **GPT-4o-mini** (Recommended): ~$0.15 per million input tokens, ~$0.60 per million output tokens
- **GPT-4o**: ~$2.50 per million input tokens, ~$10 per million output tokens
- **GPT-3.5-turbo**: ~$0.50 per million input tokens, ~$1.50 per million output tokens

For typical note expansion (200 words in, 500 words out), expect:
- GPT-4o-mini: ~$0.001 per note
- GPT-4o: ~$0.01 per note

Check [OpenAI Pricing](https://openai.com/api/pricing/) for current rates.

## Troubleshooting

### "Please set your OpenAI API key in Settings"
- Go to Settings and enter your API key
- Make sure it starts with `sk-`
- Verify your key is valid at [OpenAI Platform](https://platform.openai.com/api-keys)

### "Claude API key is missing"
- Toggle **Enable Claude (Anthropic)** in Settings
- Add your Claude key (should start with `sk-ant-`)
- Click **Save Key** and try again

### API Errors
- **401 Unauthorized**: Invalid API key
- **429 Rate Limit**: Too many requests, wait and try again
- **500 Server Error**: OpenAI service issue, try again later

### Network Errors When Calling Claude
- Ensure you are connected to the internet (the app will warn if you are offline)
- Make sure you are serving the app from `http://` or `https://` (opening `index.html` directly via `file://` prevents secure API calls)
- Verify that your firewall or browser settings allow outbound HTTPS requests to `https://api.anthropic.com`

### Notes Not Saving
- Check if localStorage is enabled in your browser
- Ensure you're not in private/incognito mode
- Check browser storage quota

### GitHub Pages Not Deploying
- Ensure GitHub Actions is enabled in repository settings
- Check that GitHub Pages source is set to "GitHub Actions"
- Review the Actions tab for deployment errors

## Development

### Pull Request Preview Environments

- Every open pull request automatically deploys a preview to the GitHub Pages site under
  `https://<your-username>.github.io/myai-notes/pr/<PR_NUMBER>/`.
- The PR bot comments with the exact link and updates it whenever new commits are pushed.
- Previews are cleaned up automatically when the pull request is closed.
- If you prefer downloadable archives instead, keep the `PR Preview (Downloadable)` workflow enabled.

### Local Development
```bash
# Clone the repository
git clone https://github.com/yourusername/myai-notes.git
cd myai-notes

# Serve locally
python -m http.server 8000
```

### Making Changes
1. Edit files in your local repository
2. Test thoroughly in your browser
3. Commit changes: `git commit -am "Description of changes"`
4. Push to main: `git push origin main`
5. GitHub Actions will automatically deploy to Pages

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Built with vanilla JavaScript for simplicity and performance
- Markdown rendering by [marked.js](https://marked.js.org/)
- Powered by [OpenAI API](https://openai.com/api/) and [Anthropic Claude API](https://www.anthropic.com/)

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the OpenAI API documentation for API-related questions

---

Made with ❤️ for productive note-taking
