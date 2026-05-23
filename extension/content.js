/* ─── Try First · Content Script v2 ─────────────────────────── */
/* Intercepts AI prompt sends, classifies with Claude Haiku,      */
/* and nudges for THINKING tasks. LOOKUP tasks pass through       */
/* instantly with zero interruption.                              */

'use strict';

// ─── Classifier — routes through background SW via persistent port ─
// Content scripts are subject to the host page's CORS policy, so we
// cannot call api.anthropic.com directly from here. Background SWs
// are exempt from CORS. We use chrome.runtime.connect (a persistent
// port) rather than sendMessage so the SW is already awake and
// holding the connection open before the async fetch starts — this
// avoids the "Receiving end does not exist" race on the first call.

async function classify(text) {
  return new Promise((resolve) => {
    let settled = false;

    function done(result) {
      if (settled) return;
      settled = true;
      try { port.disconnect(); } catch (_) {}
      resolve(result);
    }

    // Safety net — never block the user longer than 6 seconds total
    const fallback = setTimeout(() => {
      console.warn('[TryFirst] classify() timed out — letting prompt through');
      done('LOOKUP');
    }, 6000);

    let port;
    try {
      port = chrome.runtime.connect({ name: 'classifier' });
    } catch (err) {
      console.warn('[TryFirst] connect() failed:', err.message);
      clearTimeout(fallback);
      resolve('LOOKUP');
      return;
    }

    port.onMessage.addListener((msg) => {
      clearTimeout(fallback);
      done(msg.result === 'THINKING' ? 'THINKING' : 'LOOKUP');
    });

    port.onDisconnect.addListener(() => {
      clearTimeout(fallback);
      if (!settled) {
        console.warn('[TryFirst] SW port disconnected unexpectedly');
        done('LOOKUP');
      }
    });

    port.postMessage({ type: 'classify', text });
  });
}

// ─── Site-specific send-button & input selectors ───────────────
const SITE = (function () {
  const h = location.hostname;

  if (h.includes('chatgpt.com') || h.includes('chat.openai.com')) {
    return {
      sendSelectors: [
        'button[data-testid="send-button"]',
        'button[aria-label="Send prompt"]',
        'button[aria-label*="Send" i]:not([disabled])',
      ],
      inputSelectors: [
        '#prompt-textarea',
        'div[contenteditable="true"][data-id]',
        'textarea[data-id]',
      ],
    };
  }
  if (h.includes('claude.ai')) {
    return {
      sendSelectors: [
        'button[aria-label="Send Message"]',
        'button[aria-label="Send"]',
        'button[data-testid="send-button"]',
        '[data-value="send"]',
      ],
      inputSelectors: [
        'div[contenteditable="true"].ProseMirror',
        'div[contenteditable="true"]',
      ],
    };
  }
  if (h.includes('gemini.google.com')) {
    return {
      sendSelectors: [
        'button.send-button',
        'button[aria-label*="Send" i]',
        'button[aria-label*="send" i]',
        'button.mdc-icon-button[data-mat-icon-name="send"]',
      ],
      inputSelectors: [
        'div[contenteditable="true"].ql-editor',
        'rich-textarea div[contenteditable]',
        'div[contenteditable="true"]',
        'textarea',
      ],
    };
  }
  if (h.includes('copilot.microsoft.com')) {
    return {
      sendSelectors: [
        'button[aria-label*="submit" i]',
        'button[aria-label*="Send" i]',
        'cib-chat-input button',
      ],
      inputSelectors: [
        'cib-text-input textarea',
        'textarea',
        'div[contenteditable="true"]',
      ],
    };
  }
  if (h.includes('perplexity.ai')) {
    return {
      sendSelectors: [
        'button[aria-label*="Submit" i]',
        'button[aria-label*="Search" i]',
        'button[type="submit"]',
      ],
      inputSelectors: [
        'textarea[placeholder*="Ask" i]',
        'textarea',
      ],
    };
  }
  if (h.includes('poe.com')) {
    return {
      sendSelectors: [
        'button[class*="sendButton"]',
        'button[aria-label*="Send" i]',
        'button[title*="Send" i]',
      ],
      inputSelectors: [
        'textarea[class*="GrowingTextArea"]',
        'textarea',
        'div[contenteditable="true"]',
      ],
    };
  }
  if (h.includes('character.ai')) {
    return {
      sendSelectors: [
        'button[aria-label*="Send" i]',
        'div[name="human_turn_editor"] ~ * button',
        'button[type="submit"]',
      ],
      inputSelectors: [
        'div[name="human_turn_editor"] div[contenteditable]',
        'textarea[placeholder*="message" i]',
        'div[contenteditable="true"]',
        'textarea',
      ],
    };
  }
  // Fallback
  return {
    sendSelectors: [
      'button[data-testid*="send" i]',
      'button[aria-label*="Send" i]',
      'button[aria-label*="Submit" i]',
      'button[type="submit"]',
    ],
    inputSelectors: [
      'textarea',
      'div[contenteditable="true"]',
    ],
  };
})();

// ─── State ─────────────────────────────────────────────────────
let bypassing    = false;   // true while we're re-dispatching the send
let intercepting = false;   // true while classification is in flight
let popupVisible = false;

// ─── Helpers ───────────────────────────────────────────────────
function queryFirst(selectors) {
  for (const sel of selectors) {
    try {
      const el = document.querySelector(sel);
      if (el) return el;
    } catch (_) {}
  }
  return null;
}

function getInputElement() {
  return queryFirst(SITE.inputSelectors);
}

function getSendButton() {
  return queryFirst(SITE.sendSelectors);
}

function getPromptText() {
  const el = getInputElement();
  if (!el) return '';
  const text = el.value !== undefined ? el.value : (el.innerText || el.textContent || '');
  return text.trim();
}

function isTargetSendButton(target) {
  for (const sel of SITE.sendSelectors) {
    try {
      if (target.matches(sel) || target.closest(sel)) return true;
    } catch (_) {}
  }
  return false;
}

function isTargetInput(target) {
  for (const sel of SITE.inputSelectors) {
    try {
      if (target.matches(sel) || target.closest(sel)) return true;
    } catch (_) {}
  }
  return false;
}

// ─── Bypass: let the next event through ────────────────────────
function allowThrough(fn) {
  bypassing = true;
  try { fn(); } catch (_) {}
  // Reset after a tick — synthetic events dispatch synchronously
  setTimeout(() => { bypassing = false; }, 150);
}

// ─── Save classification to storage (no prompt content) ────────
function saveResult(type, answered) {
  chrome.storage.local.get(['stats', 'activityLog'], (data) => {
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
    log.unshift({
      type,
      answered: type === 'THINKING' ? answered : null,
      site: location.hostname,
      ts: Date.now(),
    });

    chrome.storage.local.set({
      stats,
      activityLog: log.slice(0, 100),
    });
  });
}

// ─── Trigger send after user decision ──────────────────────────
function triggerSend() {
  const btn = getSendButton();
  if (btn) {
    allowThrough(() => btn.click());
    return;
  }
  // Fallback: dispatch Enter key on the input
  const input = getInputElement();
  if (input) {
    allowThrough(() => {
      input.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Enter', code: 'Enter', keyCode: 13,
        bubbles: true, cancelable: true,
      }));
    });
  }
}

// ─── Popup ─────────────────────────────────────────────────────
function showThinkingPopup(onDecision) {
  if (popupVisible) return;
  popupVisible = true;

  const popup = document.createElement('div');
  popup.id = 'tf-popup';
  popup.innerHTML = `
    <div id="tf-popup-inner">
      <div id="tf-popup-header">
        <span id="tf-popup-logo">◈ Try First</span>
        <button id="tf-popup-close" aria-label="Close">✕</button>
      </div>
      <p id="tf-popup-title">Wait — what's your own answer first?</p>
      <p id="tf-popup-sub">This looks like a reasoning task. Spending 30 seconds on it yourself builds the skill.</p>
      <textarea id="tf-popup-input" placeholder="Your thinking… (optional — even a few words count)" rows="3"></textarea>
      <div id="tf-popup-actions">
        <button id="tf-popup-skip">Skip this time</button>
        <button id="tf-popup-submit">Submit My Answer First →</button>
      </div>
    </div>
  `;

  document.body.appendChild(popup);

  // Animate in
  requestAnimationFrame(() => popup.classList.add('tf-visible'));

  function dismiss(answered) {
    popup.classList.remove('tf-visible');
    setTimeout(() => {
      popup.remove();
      popupVisible = false;
    }, 280);
    onDecision(answered);
  }

  document.getElementById('tf-popup-submit').addEventListener('click', () => {
    dismiss(true);
  });

  document.getElementById('tf-popup-skip').addEventListener('click', () => {
    dismiss(false);
  });

  document.getElementById('tf-popup-close').addEventListener('click', () => {
    dismiss(false);
  });

  // Focus textarea
  setTimeout(() => {
    const ta = document.getElementById('tf-popup-input');
    if (ta) ta.focus();
  }, 50);
}

// ─── Core intercept handler ────────────────────────────────────
async function handleInterceptEvent(e, refire) {
  if (bypassing || intercepting) return;

  const text = getPromptText();
  if (!text || text.length < 4) return; // empty / too short → pass through

  // Prevent the original event
  e.preventDefault();
  e.stopImmediatePropagation();

  intercepting = true;

  try {
    const result = await classify(text);

    if (result === 'LOOKUP') {
      saveResult('LOOKUP', false);
      refire();
    } else {
      // THINKING task
      showThinkingPopup((answered) => {
        saveResult('THINKING', answered);
        refire();
      });
    }
  } catch (_) {
    refire(); // never block on error
  } finally {
    intercepting = false;
  }
}

// ─── Click interceptor (capture phase) ────────────────────────
document.addEventListener('click', (e) => {
  if (bypassing || intercepting || popupVisible) return;
  if (!isTargetSendButton(e.target)) return;

  handleInterceptEvent(e, () => {
    allowThrough(() => {
      const btn = getSendButton();
      if (btn) btn.click();
    });
  });
}, true);

// ─── Enter key interceptor (capture phase) ────────────────────
document.addEventListener('keydown', (e) => {
  if (bypassing || intercepting || popupVisible) return;
  if (e.key !== 'Enter' || e.shiftKey || e.ctrlKey || e.metaKey) return;

  const active = document.activeElement;
  if (!active || !isTargetInput(active)) return;

  handleInterceptEvent(e, () => triggerSend());
}, true);
