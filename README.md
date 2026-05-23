# MindFirst

MindFirst is a suite of tools for people who want to use AI without becoming dependent on it. It tracks how much time you spend in AI apps, nudges you to think before you ask, and helps you measure whether your own reasoning skills are improving or atrophying.

This repository contains three components that work independently.

---

## What's in this repo

| Component | Folder | Description |
|-----------|--------|-------------|
| Website | `website/` | Static landing page with an AI literacy quiz, AI usage logger, and roast feature |
| Chrome Extension | `extension/` | Intercepts prompts on ChatGPT, classifies them as thinking vs lookup tasks, and asks you to attempt an answer first |
| Desktop App | `desktop-app/` | macOS menu bar app that tracks time spent in AI applications and sends daily usage notifications |

---

## Prerequisites

- Node.js 18+ and npm (for the desktop app)
- A Chromium-based browser (Chrome, Brave, Arc) for the extension
- An Anthropic API key for the extension's prompt classifier — get one at [console.anthropic.com](https://console.anthropic.com)

---

## Website

The website is a plain static site. No build step needed.

```bash
cd website
# Open index.html in your browser, or serve it:
npx serve .
```

---

## Chrome Extension

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked** and select the `extension/` folder
4. Click the extension icon → **Settings** → paste your Anthropic API key

The extension only activates on `chat.openai.com` and `chatgpt.com`. When you press send on a prompt, it classifies it as a thinking task or a lookup task. Thinking tasks show a small popup asking you to attempt the answer yourself first.

### Configuring the API key

The extension uses the Anthropic API (`claude-3-5-haiku-20241022`) to classify prompts. You need to supply your own key:

1. Go to [console.anthropic.com/account/keys](https://console.anthropic.com/account/keys)
2. Create a key
3. Open the extension popup → click the ⚙ settings icon → paste the key

The key is stored in `chrome.storage.local` on your device only.

---

## Desktop App (macOS)

```bash
cd desktop-app
npm install
npm start          # run in development
npm run build      # build a .dmg installer
```

On first launch, macOS will ask for **Automation permission** so the app can detect which app is in the foreground. Grant it.

The app tracks time in: ChatGPT, Claude, Copilot, Notion, Perplexity, and any app whose name contains "AI". Data is stored locally at `~/Library/Application Support/MindFirst/mindfirst-data.json`.

---

## License

MIT
