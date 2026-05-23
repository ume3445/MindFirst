/* ─── Try First · Options Page ───────────────────────────────── */

const input    = document.getElementById('api-key-input');
const saveBtn  = document.getElementById('save-btn');
const clearBtn = document.getElementById('clear-btn');
const status   = document.getElementById('status');
const preview  = document.getElementById('key-preview');
const display  = document.getElementById('key-display');

// Load existing key on open
chrome.storage.local.get(['apiKey'], (data) => {
  if (data.apiKey) {
    const key = data.apiKey;
    display.textContent = key.slice(0, 12) + '•••' + key.slice(-4);
    preview.style.display = 'block';
  }
});

// Save key
saveBtn.addEventListener('click', () => {
  const key = input.value.trim();
  if (!key) {
    showStatus('Please enter an API key.', 'error');
    return;
  }
  if (!key.startsWith('sk-ant-')) {
    showStatus('That doesn\'t look like an Anthropic key. It should start with sk-ant-', 'error');
    return;
  }
  chrome.storage.local.set({ apiKey: key }, () => {
    display.textContent = key.slice(0, 12) + '•••' + key.slice(-4);
    preview.style.display = 'block';
    input.value = '';
    showStatus('✓ API key saved. The extension is now active.', 'success');
  });
});

// Allow Enter key to save
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') saveBtn.click();
});

// Clear all data
clearBtn.addEventListener('click', () => {
  if (!confirm('Clear all Try First data including your API key, stats, and history?')) return;
  chrome.storage.local.clear(() => {
    preview.style.display = 'none';
    showStatus('All data cleared.', 'success');
  });
});

function showStatus(msg, type) {
  status.textContent = msg;
  status.className = type;
  status.style.display = 'block';
  setTimeout(() => { status.style.display = 'none'; }, 4000);
}
