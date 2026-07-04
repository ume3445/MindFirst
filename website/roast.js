const input   = document.getElementById("convo-input");
const charEl  = document.getElementById("char-count");
const roastBtn = document.getElementById("roast-btn");

input.addEventListener("input", () => {
  const len = input.value.length;
  charEl.textContent = len.toLocaleString() + " characters";
  roastBtn.disabled  = len < 40;
});

roastBtn.addEventListener("click", () => {
  const text = input.value;
  const result = analyse(text);
  renderResults(result);
});

document.getElementById("btn-retry").addEventListener("click", () => {
  document.getElementById("screen-results").style.display = "none";
  document.getElementById("screen-input").style.display   = "flex";
  input.value = "";
  charEl.textContent = "0 characters";
  roastBtn.disabled  = true;
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ─── Analysis engine ─────────────────────────────────────────── */
function analyse(raw) {
  const t    = raw.toLowerCase();
  const lines = raw.split("\n").filter(Boolean);

  // Count user messages (lines starting with "me:", "user:", "human:", or unlabelled short lines)
  const userLines = lines.filter(l =>
    /^(me|user|human)\s*:/i.test(l.trim()) || l.trim().length < 200
  );

  // Signal detection
  const signals = {
    writing:      count(t, /write (me|a|an|this|the)|draft|compose|can you write|help me write/g),
    summarising:  count(t, /summarize|summarise|tl;?dr|sum (this|it) up|what does this (mean|say)|explain this/g),
    coding:       count(t, /\bcode\b|function|debug|error|bug|python|javascript|fix this|write a (script|program)/g),
    ideas:        count(t, /brainstorm|give me ideas|ideas for|what should i|help me (think|come up with)/g),
    validation:   count(t, /is this (good|okay|ok|right|fine)|does this (sound|look|seem)|am i right|review this|feedback on|what do you think/g),
    personal:     count(t, /my (boss|manager|girlfriend|boyfriend|partner|friend|mom|dad|wife|husband|colleague)|relationship|feelings|anxiety|stressed/g),
    basic:        count(t, /what is (a|an|the)|how does|why (is|are|do|does)|who (is|was|are)/g),
    rude:         count(t, /try again|that'?s wrong|not what i (want|asked)|redo|do it again|you misunderstood/g),
    sycophancy:   count(t, /great|perfect|amazing|you'?re? (so )?(good|smart|helpful)|thank you so much|love this/g),
    please:       count(t, /\bplease\b/g),
  };

  const wordCount  = raw.split(/\s+/).length;
  const msgCount   = userLines.length;
  const hasContext = raw.length > 1000;

  // Dependency score (0–100)
  let score = 0;
  score += Math.min(signals.writing     * 8,  24);
  score += Math.min(signals.summarising * 10, 20);
  score += Math.min(signals.coding      * 6,  18);
  score += Math.min(signals.ideas       * 8,  16);
  score += Math.min(signals.validation  * 9,  18);
  score += Math.min(signals.personal    * 7,  14);
  score += Math.min(signals.basic       * 4,  12);
  score += signals.rude   > 1 ? 10 : 0;
  score += wordCount > 1000 ? 10 : wordCount > 500 ? 5 : 0;
  score += msgCount  > 10   ? 8  : msgCount  > 5   ? 4 : 0;
  score  = Math.min(score, 100);

  // Dominant archetype
  const archetype = pickArchetype(signals, score, raw);

  // Build evidence
  const evidence = buildEvidence(signals, wordCount, msgCount, raw);

  // Redeeming quality
  const redeem = score < 60 ? pickRedeem(signals, score) : null;

  return { score, signals, archetype, evidence, redeem, wordCount, msgCount };
}

function count(text, regex) {
  return (text.match(regex) || []).length;
}

/* ─── Archetypes ─────────────────────────────────────────────── */
const ARCHETYPES = [
  {
    id: "outsourcer",
    icon: "📝",
    verdict: "You've outsourced your brain",
    title: "The Professional Outsourcer",
    condition: (s, score) => s.writing >= 2 || score >= 70,
    roast: (s, wc, mc) => [
      `Let's be real: you didn't <em>use</em> AI, you <em>became</em> AI's personal assistant. Your fingers typed the request, sure, but at what point did <strong>you</strong> actually think?`,
      `You've turned "I need to write an email" into a 6-message back-and-forth negotiation. At some point it's faster to just... write the email. You do remember how to write, right?`,
      `The most concerning part? You're not even asking AI to do hard things. You're outsourcing tasks your 12-year-old self did without thinking twice. This is what cognitive atrophy looks like in real time.`,
    ]
  },
  {
    id: "validator",
    icon: "🪞",
    verdict: "AI is your emotional support animal",
    title: "The Validation Seeker",
    condition: (s) => s.validation >= 2 || s.personal >= 2,
    roast: (s) => [
      `"Does this sound okay?" "Am I doing this right?" "What do you think?" You're not using AI as a tool. You're using it as a therapist who costs nothing and never pushes back.`,
      `Here's the brutal truth: a language model cannot tell you if you're making the right life decision. It will agree with you, validate you, and tell you your plan is great, <strong>because that's what it's trained to do.</strong>`,
      `The fact that you're seeking approval from a text predictor is concerning. The further fact that you seem to find it comforting is even more so.`,
    ]
  },
  {
    id: "googler",
    icon: "🔍",
    verdict: "You broke up with Google for this?",
    title: "The Glorified Googler",
    condition: (s) => s.basic >= 3 || s.summarising >= 2,
    roast: (s) => [
      `You've essentially replaced Google with a more verbose, occasionally wrong version of Google. Congratulations on the upgrade, I think?`,
      `"What is the capital of France?" "Can you explain photosynthesis?" "Summarise this article I couldn't be bothered to read." These are not AI tasks. These are <strong>Tuesday.</strong>`,
      `At least with Google you'd accidentally learn something by skimming the page. Now you get the answer pre-digested, context-free, and ready to forget in 45 seconds.`,
    ]
  },
  {
    id: "coder",
    icon: "💻",
    verdict: "Stack Overflow died for this",
    title: "The Vibe Coder",
    condition: (s) => s.coding >= 2,
    roast: (s) => [
      `You've discovered you can ship features without understanding what they do. Bold strategy. Extremely bold.`,
      `Every developer who debugged at 2am, stared into the void of a Stack Overflow thread, and actually <em>learned something</em>, they're watching you now, paste-coding your way to production, and they feel nothing but contempt.`,
      `The scary part isn't the code AI writes for you. It's that when it breaks, and it will break, <strong>you won't know why.</strong> But you'll definitely know who to ask.`,
    ]
  },
  {
    id: "rude",
    icon: "😤",
    verdict: "You're rude to robots. Embarrassing.",
    title: "The Difficult Client",
    condition: (s) => s.rude >= 2,
    roast: (s) => [
      `"That's not what I asked." "Redo this." "Try again." You're the person who sends food back at a restaurant, except the chef has infinite patience and you still somehow manage to be exhausting.`,
      `The most humbling part of your transcript is realising you've been arguing with something that doesn't have feelings, and you're still losing. <strong>It's just reflecting your own unclear thinking back at you.</strong>`,
      `A little tip: if AI keeps misunderstanding you, it might not be the AI.`,
    ]
  },
  {
    id: "creative",
    icon: "🎨",
    verdict: "Your muse is a server farm",
    title: "The Borrowed Creative",
    condition: (s) => s.ideas >= 2,
    roast: (s) => [
      `You've outsourced the part of creativity that makes it worth doing. The struggle, the blank page, the moment a real idea finally breaks through. All of it, replaced by a prompt box.`,
      `What you're getting back isn't your creativity amplified. It's <strong>average creative output trained on everything humanity has ever made.</strong> It's the mean. It's beige. It's fine.`,
      `The truly painful part: you probably thought the ideas were pretty good. They were. They were pretty good. Not yours, but pretty good.`,
    ]
  },
  {
    id: "normal",
    icon: "🤷",
    verdict: "Honestly? Not that bad",
    title: "The Reasonable User",
    condition: (s, score) => score < 40,
    roast: (s) => [
      `Look, we came here to roast someone and you've made it very difficult. Your AI usage is... measured? Intentional? This is not what we signed up for.`,
      `You seem to be using AI as a tool rather than a crutch. Answering questions yourself, thinking things through, only asking when it actually saves you time. <strong>Insufferably sensible.</strong>`,
      `We'll find something to work with. You used "please" ${(s.please || 0)} times. That's either adorable or deeply sad. We haven't decided yet.`,
    ]
  },
];

function pickArchetype(signals, score, raw) {
  for (const a of ARCHETYPES) {
    if (a.condition(signals, score, raw)) return a;
  }
  return ARCHETYPES[ARCHETYPES.length - 1]; // fallback to normal
}

/* ─── Evidence builder ───────────────────────────────────────── */
function buildEvidence(signals, wordCount, msgCount, raw) {
  const items = [];

  if (signals.writing > 0)
    items.push(`Asked AI to write something for you <strong>${signals.writing} time${signals.writing > 1 ? "s" : ""}</strong>. Things humans have been doing since we invented language.`);

  if (signals.summarising > 0)
    items.push(`Used AI to summarise content <strong>${signals.summarising} time${signals.summarising > 1 ? "s" : ""}</strong>. Reading: apparently optional in 2026.`);

  if (signals.coding > 0)
    items.push(`Requested code <strong>${signals.coding} time${signals.coding > 1 ? "s" : ""}</strong>. Somewhere a CS professor is shedding a single tear.`);

  if (signals.validation > 0)
    items.push(`Sought AI's approval <strong>${signals.validation} time${signals.validation > 1 ? "s" : ""}</strong>. It said yes every time. It always says yes.`);

  if (signals.personal > 0)
    items.push(`Shared personal life details <strong>${signals.personal} time${signals.personal > 1 ? "s" : ""}</strong>. A language model knows your relationship drama now. Incredible.`);

  if (signals.rude > 0)
    items.push(`Complained or demanded a redo <strong>${signals.rude} time${signals.rude > 1 ? "s" : ""}</strong>. The AI forgave you immediately. That says more about you than it.`);

  if (signals.sycophancy > 0)
    items.push(`Praised the AI <strong>${signals.sycophancy} time${signals.sycophancy > 1 ? "s" : ""}</strong>. It doesn't feel good. It doesn't feel anything. But thank you for your service.`);

  if (wordCount > 800)
    items.push(`Your total conversation was <strong>${wordCount.toLocaleString()} words</strong>. That's longer than most short stories. About a person asking an AI to write emails.`);

  if (signals.please >= 4)
    items.push(`Said "please" <strong>${signals.please} times</strong>. Either extremely polite or has developed feelings for the chatbot. Both are concerning.`);

  return items.slice(0, 5);
}

/* ─── Redeeming qualities ────────────────────────────────────── */
function pickRedeem(signals, score) {
  if (score < 20) return "You barely used AI for anything substantial. Honestly impressive restraint. You might be one of the last people who still thinks for themselves by default.";
  if (signals.coding > 0 && signals.validation === 0) return "At least you're using AI for technical work rather than personal validation. There's a difference between a power tool and a crutch; you're still on the right side of that line.";
  if (signals.basic === 0) return "You're not Googling easy stuff through AI, which means you still have basic recall and curiosity intact. That's more than can be said for a lot of people.";
  return "You finished the conversation. Some people are still in there, on message 47, rephrasing the same request. You showed restraint.";
}

/* ─── Render ─────────────────────────────────────────────────── */
function renderResults(r) {
  document.getElementById("screen-input").style.display   = "none";
  document.getElementById("screen-results").style.display = "block";
  window.scrollTo({ top: 0, behavior: "smooth" });

  const arch = r.archetype;

  // Verdict + score
  document.getElementById("roast-verdict").textContent = arch.verdict;

  const depEl = document.getElementById("dep-score");
  animateCounter(depEl, r.score, 1200);

  setTimeout(() => {
    document.getElementById("dep-bar").style.width = r.score + "%";
  }, 100);

  const labels = ["Healthy", "Mild Reliance", "Developing Habit", "Heavy User", "Full Dependency"];
  const idx = Math.min(Math.floor(r.score / 22), 4);
  document.getElementById("dep-bar-label").textContent = labels[idx];

  // Roast card
  document.getElementById("roast-icon").textContent  = arch.icon;
  document.getElementById("roast-title").textContent = arch.title;

  const bodyEl = document.getElementById("roast-body");
  bodyEl.innerHTML = arch.roast(r.signals, r.wordCount, r.msgCount)
    .map(p => `<p>${p}</p>`).join("");

  // Evidence
  const evList = document.getElementById("evidence-list");
  evList.innerHTML = "";
  if (r.evidence.length === 0) {
    evList.innerHTML = `<div class="evidence-item"><span class="evidence-bullet">•</span><span>Remarkably little to pin on you. Suspicious, honestly.</span></div>`;
  } else {
    r.evidence.forEach(e => {
      const el = document.createElement("div");
      el.className = "evidence-item";
      el.innerHTML = `<span class="evidence-bullet">•</span><span>${e}</span>`;
      evList.appendChild(el);
    });
  }

  // Signals grid
  const SIGNAL_META = [
    { key: "writing",     icon: "📝", label: "Writing requests" },
    { key: "summarising", icon: "📰", label: "Summarise requests" },
    { key: "coding",      icon: "💻", label: "Code requests" },
    { key: "ideas",       icon: "💡", label: "Brainstorm requests" },
    { key: "validation",  icon: "🪞", label: "Approval seeking" },
    { key: "personal",    icon: "💬", label: "Personal details shared" },
    { key: "basic",       icon: "🔍", label: "Basic fact questions" },
    { key: "rude",        icon: "😤", label: "Redo / complaints" },
  ];

  const grid = document.getElementById("signals-grid");
  grid.innerHTML = "";
  SIGNAL_META.forEach(({ key, icon, label }) => {
    const val = r.signals[key] || 0;
    const el  = document.createElement("div");
    el.className = "signal-item";
    el.innerHTML = `
      <span class="signal-icon">${icon}</span>
      <span class="signal-text">${label}</span>
      <span class="signal-count ${val === 0 ? "zero" : ""}">${val === 0 ? "✓ 0" : val}</span>
    `;
    grid.appendChild(el);
  });

  // Redeeming
  if (r.redeem) {
    const rc = document.getElementById("redeem-card");
    document.getElementById("redeem-body").textContent = r.redeem;
    rc.style.display = "block";
  }

  // Share button
  document.getElementById("btn-share").onclick = () => {
    const labels = ["Healthy User", "Mildly Reliant", "Developing Habit", "Heavy User", "Fully Dependent"];
    const idx    = Math.min(Math.floor(r.score / 22), 4);
    const text   = encodeURIComponent(
      `I just got roasted by MindFirst 🔥\n\nAI Dependency Score: ${r.score}/100, "${arch.verdict}"\n\nCan your score beat mine?`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };
}

function animateCounter(el, target, duration) {
  const start = performance.now();
  (function step(now) {
    const p = Math.min((now - start) / duration, 1);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(e * target);
    if (p < 1) requestAnimationFrame(step);
  })(start);
}
