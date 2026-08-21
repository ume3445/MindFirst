/* ─── Try First · Background Service Worker ──────────────────── */
/* API calls live here — SWs are not subject to CORS.            */
/* Uses chrome.runtime.connect (persistent port) so the SW is   */
/* already awake and listening before the classify call fires.   */

const CLASSIFIER_SYSTEM = `You are a classifier. A user is about to send this prompt to an AI. Decide if this is a THINKING task or a LOOKUP task. Be aggressive about classifying things as THINKING. A THINKING task includes: writing anything, solving coding problems or algorithms, math problems that require working through steps, making decisions, analysis, critical thinking, creative work, explaining concepts in your own words, or any problem that has multiple steps. A LOOKUP task is only: single factual questions with one definitive answer like capitals of countries, definitions of words, unit conversions, or translating text. When in doubt always classify as THINKING. Respond with only one word: THINKING or LOOKUP.`;

const CLASSIFY_WORKER_URL = 'https://mindfirst-classify-api.umerhammad010.workers.dev';

class LimitReachedError extends Error {}

// ── Install UUID — anonymous, not tied to identity, used only to ─
// enforce the free daily classification limit on the Worker.
async function getInstallUuid() {
  const data = await chrome.storage.local.get(['installUuid']);
  if (data.installUuid) return data.installUuid;

  const uuid = crypto.randomUUID();
  await chrome.storage.local.set({ installUuid: uuid });
  return uuid;
}

// Fires on fresh installs and on updates (e.g. users upgrading from a
// version that predates the Worker). Guarded by getInstallUuid() so it
// never regenerates an existing UUID.
chrome.runtime.onInstalled.addListener(() => {
  getInstallUuid();
});

// ── Persistent port listener ───────────────────────────────────
// The content script opens a port (chrome.runtime.connect) which
// keeps the SW alive for the duration of the connection.
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'classifier') {
    port.onMessage.addListener(async (msg) => {
      if (msg.type !== 'classify') return;

      try {
        const result = await classifyPrompt(msg.text);
        port.postMessage({ result });
      } catch (err) {
        console.warn('[TryFirst SW] classify error:', err.message);
        try {
          port.postMessage({ result: 'LOOKUP' });
        } catch (fallbackErr) {
          console.warn('[TryFirst SW] fallback postMessage failed, port likely closed:', fallbackErr.message);
        }
      }
    });
    return;
  }

  if (port.name === 'saveResult') {
    port.onMessage.addListener((msg) => {
      if (msg.type !== 'saveResult') return;

      queueSaveResult(msg.result, msg.answered, msg.site, msg.reflection)
        .then(() => {
          try {
            port.postMessage({ ok: true });
          } catch (ackErr) {
            console.warn('[TryFirst SW] saveResult ack failed, port likely closed (write already committed):', ackErr.message);
          }
        })
        .catch((err) => {
          console.warn('[TryFirst SW] saveResult write failed:', err.message);
          try { port.postMessage({ ok: false }); } catch (_) {}
        });
    });
  }
});

// ── Stats/activity writer — serialized so concurrent tabs can't ─
// clobber each other's read-modify-write cycle on chrome.storage.local.
let statsQueue = Promise.resolve();

function queueSaveResult(type, answered, site, reflection) {
  const run = statsQueue.then(() => saveResultToStorage(type, answered, site, reflection));
  statsQueue = run.catch(() => {}); // keep the chain alive even if one write throws
  return run;
}

async function saveResultToStorage(type, answered, site, reflection) {
  const data = await chrome.storage.local.get(['stats', 'activityLog']);
  const stats = data.stats || {
    thinkingTasks : 0,
    lookupTasks   : 0,
    answered      : 0,
    skipped       : 0,
    streak        : 0,
    lastAnswerDate: '',
  };
  const log = data.activityLog || [];

  if (type === 'LOOKUP') {
    stats.lookupTasks++;
  } else {
    stats.thinkingTasks++;
    if (answered) {
      stats.answered++;
      // Update streak
      const today = new Date().toDateString();
      if (stats.lastAnswerDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        stats.streak = stats.lastAnswerDate === yesterday ? stats.streak + 1 : 1;
        stats.lastAnswerDate = today;
      }
    } else {
      stats.skipped++;
      // Skipping does NOT break the streak — only counts as a missed opportunity
    }
  }

  // Prepend log entry (no prompt content stored)
  const entry = {
    type,
    answered: type === 'THINKING' ? answered : null,
    site,
    ts: Date.now(),
  };
  if (reflection) entry.reflection = reflection.trim().slice(0, 500);

  log.unshift(entry);

  await chrome.storage.local.set({
    stats,
    activityLog: log.slice(0, 100),
  });
}

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
// Default path: MindFirst's Worker, keyed by an anonymous install UUID,
// with a free daily limit. Fallback path: the user's own Anthropic key
// (BYOK), used once that limit is hit, if they've saved one.
async function classifyPrompt(text) {
  const prompt = text.trim().slice(0, 600);
  if (prompt.length < 4) return 'LOOKUP';

  try {
    const result = await classifyViaWorker(prompt);
    await chrome.storage.local.set({ limitReached: false });
    return result;
  } catch (err) {
    if (!(err instanceof LimitReachedError)) {
      console.warn('[TryFirst SW] Worker classify error, failing open:', err.message);
      return 'LOOKUP';
    }

    const data = await chrome.storage.local.get(['apiKey']);
    const apiKey = data.apiKey;
    if (apiKey && apiKey.trim() !== '') {
      try {
        const result = await classifyViaAnthropic(prompt, apiKey);
        await chrome.storage.local.set({ limitReached: false });
        return result;
      } catch (anthropicErr) {
        console.warn('[TryFirst SW] BYOK fallback error, failing open:', anthropicErr.message);
        return 'LOOKUP';
      }
    }

    console.warn('[TryFirst SW] Free daily limit reached, no BYOK key saved — failing open');
    await chrome.storage.local.set({ limitReached: true });
    return 'LOOKUP';
  }
}

async function classifyViaWorker(prompt) {
  const uuid = await getInstallUuid();

  const resp = await fetch(CLASSIFY_WORKER_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ uuid, prompt }),
    signal: AbortSignal.timeout(5000),
  });

  if (resp.status === 429) {
    let body = {};
    try { body = await resp.json(); } catch (_) {}
    if (body?.error === 'limit_reached') throw new LimitReachedError('free daily limit reached');
    throw new Error(`worker 429: ${JSON.stringify(body)}`);
  }

  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`worker error ${resp.status}: ${body}`);
  }

  const json = await resp.json();
  const word = (json?.result || '').trim().toUpperCase();
  return word.startsWith('THINKING') ? 'THINKING' : 'LOOKUP';
}

async function classifyViaAnthropic(prompt, apiKey) {
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 5,
      system: CLASSIFIER_SYSTEM,
      messages: [{ role: 'user', content: prompt }],
    }),
    signal: AbortSignal.timeout(5000),
  });

  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Anthropic API error ${resp.status}: ${body}`);
  }

  const json = await resp.json();
  const word = (json?.content?.[0]?.text || '').trim().toUpperCase();
  return word.startsWith('THINKING') ? 'THINKING' : 'LOOKUP';
}
