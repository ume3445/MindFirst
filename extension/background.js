/* ─── Try First · Background Service Worker ──────────────────── */
/* API calls live here — SWs are not subject to CORS.            */
/* Uses chrome.runtime.connect (persistent port) so the SW is   */
/* already awake and listening before the classify call fires.   */

const CLASSIFIER_SYSTEM = `You are a classifier. A user is about to send this prompt to an AI. Decide if this is a THINKING task or a LOOKUP task. Be aggressive about classifying things as THINKING. A THINKING task includes: writing anything, solving coding problems or algorithms, math problems that require working through steps, making decisions, analysis, critical thinking, creative work, explaining concepts in your own words, or any problem that has multiple steps. A LOOKUP task is only: single factual questions with one definitive answer like capitals of countries, definitions of words, unit conversions, or translating text. When in doubt always classify as THINKING. Respond with only one word: THINKING or LOOKUP.`;

// ── Persistent port listener ───────────────────────────────────
// The content script opens a port (chrome.runtime.connect) which
// keeps the SW alive for the duration of the connection.
chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== 'classifier') return;

  port.onMessage.addListener(async (msg) => {
    if (msg.type !== 'classify') return;

    try {
      const result = await classifyPrompt(msg.text);
      port.postMessage({ result });
    } catch (err) {
      console.warn('[TryFirst SW] classify error:', err.message);
      port.postMessage({ result: 'LOOKUP' });
    }
  });
});

// ── Also keep the one-shot listener for options page key check ─
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getApiKey') {
    chrome.storage.local.get(['apiKey'], data => {
      sendResponse({ apiKey: data.apiKey || '' });
    });
    return true;
  }
});

// ── Classifier ────────────────────────────────────────────────
async function classifyPrompt(text) {
  const data = await chrome.storage.local.get(['apiKey']);
  const apiKey = data.apiKey;

  if (!apiKey || apiKey.trim() === '') return 'LOOKUP';

  const prompt = text.trim().slice(0, 600);
  if (prompt.length < 4) return 'LOOKUP';

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 5,
      system: CLASSIFIER_SYSTEM,
      messages: [{ role: 'user', content: prompt }],
    }),
    signal: AbortSignal.timeout(5000),
  });

  if (!resp.ok) {
    const body = await resp.text();
    console.warn('[TryFirst SW] Anthropic API error:', resp.status, body);
    return 'LOOKUP';
  }

  const json = await resp.json();
  const word = (json?.content?.[0]?.text || '').trim().toUpperCase();
  return word.startsWith('THINKING') ? 'THINKING' : 'LOOKUP';
}
