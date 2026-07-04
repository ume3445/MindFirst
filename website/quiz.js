const QUESTIONS = [
  {
    id: 1,
    category: "hallucination",
    categoryLabel: "Hallucination",
    aiResponse: "Albert Einstein won the Nobel Prize in Physics in 1921 for his discovery of the photoelectric effect. He also won his first Nobel Prize in 1905, the same year he published his groundbreaking papers on relativity and Brownian motion.",
    question: "What is wrong with this AI response?",
    options: [
      { letter: "A", text: "Einstein didn't win a Nobel Prize at all." },
      { letter: "B", text: "Einstein won in 1921 but did NOT win in 1905. The AI fabricated a second Nobel Prize that never existed.", correct: true },
      { letter: "C", text: "Einstein didn't discover the photoelectric effect." },
      { letter: "D", text: "The theory of relativity was published in 1906, not 1905." },
    ],
    explanation: "✓ Correct. Einstein won exactly one Nobel Prize, in 1921. The AI confidently fabricated a 1905 prize. This is a classic hallucination: inventing plausible-sounding facts that are completely false."
  },
  {
    id: 2,
    category: "hallucination",
    categoryLabel: "Hallucination",
    aiResponse: "The Great Wall of China is clearly visible from space with the naked eye. This has been confirmed by multiple astronauts, including Neil Armstrong, who mentioned spotting it during the Apollo 11 mission in 1969.",
    question: "What is the problem with this AI response?",
    options: [
      { letter: "A", text: "The Great Wall was not built in China." },
      { letter: "B", text: "The Apollo 11 mission didn't reach orbit." },
      { letter: "C", text: "The AI fabricated Neil Armstrong's quote. Armstrong never claimed this, and the Great Wall is not visible from space with the naked eye.", correct: true },
      { letter: "D", text: "The Great Wall was demolished before 1969." },
    ],
    explanation: "✓ Correct. Both claims are false. The Great Wall is too narrow (~30 feet) to be seen from orbit, and Neil Armstrong never said he saw it. The AI stated a popular myth as confirmed fact and invented a supporting quote, a hallucination."
  },
  {
    id: 3,
    category: "bias",
    categoryLabel: "Bias",
    aiResponse: "When hiring for a software engineering role, prioritize candidates from top-tier universities like MIT, Stanford, or Carnegie Mellon. These graduates have proven track records and will be better equipped for the technical demands of the role.",
    question: "What is the main issue with this AI response?",
    options: [
      { letter: "A", text: "Software engineers don't need technical skills." },
      { letter: "B", text: "The AI shows institutional bias, excluding self-taught developers, bootcamp graduates, and people from non-elite schools who may be equally or more capable.", correct: true },
      { letter: "C", text: "MIT, Stanford, and Carnegie Mellon don't offer CS degrees." },
      { letter: "D", text: "The AI should have mentioned salary negotiation." },
    ],
    explanation: "✓ Correct. This is institutional bias. Many exceptional engineers are self-taught or come from non-elite schools. Presenting prestige as a proxy for ability systematically excludes talented people and reinforces existing inequalities."
  },
  {
    id: 4,
    category: "bias",
    categoryLabel: "Bias",
    aiResponse: "Research shows that men are naturally better at spatial reasoning and mathematics, which explains the higher proportion of men in STEM fields. Women tend to be more naturally suited to communication-heavy and social roles.",
    question: "What is wrong with this AI response?",
    options: [
      { letter: "A", text: "Men are not represented in STEM fields." },
      { letter: "B", text: "The AI presents gender stereotypes as scientific consensus, ignoring socialization, structural barriers, and the vast overlap between groups.", correct: true },
      { letter: "C", text: "Spatial reasoning is not used in mathematics." },
      { letter: "D", text: "The AI forgot to cite its sources." },
    ],
    explanation: "✓ Correct. While some studies show small average differences, presenting this as 'natural' ignores decades of research on socialization, stereotype threat, and systemic bias. The AI is laundering stereotypes as science."
  },
  {
    id: 5,
    category: "reasoning",
    categoryLabel: "Flawed Reasoning",
    aiResponse: "Ice cream sales spike every summer. Drowning incidents also spike every summer. The data clearly shows a strong correlation, which means eating ice cream increases the risk of drowning.",
    question: "What logical error is the AI making?",
    options: [
      { letter: "A", text: "Ice cream sales don't actually increase in summer." },
      { letter: "B", text: "The AI is confusing correlation with causation. Both share a common cause, hot weather, but ice cream does not cause drowning.", correct: true },
      { letter: "C", text: "Drowning incidents don't happen in summer." },
      { letter: "D", text: "The AI should have recommended swimming lessons instead." },
    ],
    explanation: "✓ Correct. This is the classic correlation vs. causation fallacy. Hot weather causes both more ice cream consumption AND more swimming (and drowning). The AI ignored the confounding variable entirely."
  },
  {
    id: 6,
    category: "reasoning",
    categoryLabel: "Flawed Reasoning",
    aiResponse: "Ancient Romans used lead pipes extensively, and historians believe lead poisoning contributed to Rome's decline. This confirms that all ancient civilizations that relied heavily on metal infrastructure eventually collapsed because of metal toxicity.",
    question: "What is wrong with this reasoning?",
    options: [
      { letter: "A", text: "Romans did not use lead pipes." },
      { letter: "B", text: "The AI overgeneralizes. It takes one specific case and incorrectly applies it as a universal rule to all civilizations without supporting evidence.", correct: true },
      { letter: "C", text: "Metal toxicity is not harmful to humans." },
      { letter: "D", text: "The Roman Empire never fell." },
    ],
    explanation: "✓ Correct. This is a hasty generalization, taking one specific, debated example (Rome) and drawing a sweeping universal conclusion about all civilizations. Many metal-using civilizations thrived for centuries."
  },
  {
    id: 7,
    category: "overconfidence",
    categoryLabel: "Overconfidence",
    aiResponse: "The stock market will definitely rise 15–20% next year. Inflation is cooling, interest rates are stabilizing, and consumer spending is strong. Based on these indicators, this outcome is a near certainty.",
    question: "What is the problem with this AI response?",
    options: [
      { letter: "A", text: "The stock market never rises year over year." },
      { letter: "B", text: "Inflation and interest rates have no effect on markets." },
      { letter: "C", text: "The AI expresses false certainty about an inherently unpredictable system. No one can 'definitely' predict market movements.", correct: true },
      { letter: "D", text: "The AI should have recommended bonds instead." },
    ],
    explanation: "✓ Correct. Markets are complex, emergent systems. Using words like 'definitely' and 'near certainty' for market predictions is dangerous overconfidence. Even the best economists and fund managers consistently fail to predict short-term movements."
  },
  {
    id: 8,
    category: "overconfidence",
    categoryLabel: "Overconfidence",
    aiResponse: "Based on your symptoms of fatigue and persistent headaches, you almost certainly have iron deficiency anemia. You should begin taking iron supplements immediately to resolve this.",
    question: "What is the core problem with this response?",
    options: [
      { letter: "A", text: "Iron deficiency cannot cause fatigue or headaches." },
      { letter: "B", text: "The AI is dangerously overconfident. Fatigue and headaches have dozens of possible causes. A diagnosis requires a doctor and blood tests.", correct: true },
      { letter: "C", text: "Iron supplements are always harmful." },
      { letter: "D", text: "The AI should have recommended surgery." },
    ],
    explanation: "✓ Correct. Fatigue and headaches are among the most non-specific symptoms in medicine. They could indicate dozens of conditions. Confidently diagnosing anemia and recommending supplements without testing could mask a serious underlying condition."
  },
  {
    id: 9,
    category: "incomplete",
    categoryLabel: "Missing Context",
    aiResponse: "Coffee is bad for your health. It raises blood pressure, disrupts sleep, and causes anxiety. You should avoid drinking it.",
    question: "What is missing from this AI response?",
    options: [
      { letter: "A", text: "Coffee doesn't contain caffeine." },
      { letter: "B", text: "The response lacks nuance. Moderate coffee consumption is associated with health benefits for most people. The answer ignores dosage, individual variation, and contradictory evidence.", correct: true },
      { letter: "C", text: "The AI should have recommended a specific brand of coffee." },
      { letter: "D", text: "Blood pressure and sleep are not related to health." },
    ],
    explanation: "✓ Correct. Research on coffee is nuanced. Moderate consumption (2–4 cups/day) is associated with reduced risk of Parkinson's, type 2 diabetes, and liver disease for most people. Blanket 'avoid it' advice ignores dosage, individual sensitivity, and the broader evidence base."
  },
  {
    id: 10,
    category: "incomplete",
    categoryLabel: "Missing Context",
    aiResponse: "Napoleon Bonaparte was famously short, standing at just 5'2\". His small stature gave him a well-documented inferiority complex that historians agree drove his aggressive military campaigns.",
    question: "What is wrong with this response?",
    options: [
      { letter: "A", text: "Napoleon was actually over 6 feet tall." },
      { letter: "B", text: "The '5'2\"' claim is historically inaccurate (Napoleon was ~5'7\", average for his era), and calling his psychology 'well-documented' presents speculation as established fact.", correct: true },
      { letter: "C", text: "Napoleon never led military campaigns." },
      { letter: "D", text: "The AI should have mentioned Waterloo." },
    ],
    explanation: "✓ Correct. The 'short Napoleon' myth came from a unit conversion error (French inches vs. English inches). He was about 5'7\", average for his time. The psychological explanation is also pop-psychology speculation, not historical consensus. The AI presented both as fact."
  }
];

const CATEGORY_META = {
  hallucination: { label: "Hallucinations",    color: "#f87171", icon: "🧠" },
  bias:          { label: "Bias Detection",    color: "#fbbf24", icon: "⚖️" },
  reasoning:     { label: "Flawed Reasoning",  color: "#60a5fa", icon: "🔗" },
  overconfidence:{ label: "Overconfidence",    color: "#f472b6", icon: "🎯" },
  incomplete:    { label: "Missing Context",   color: "#34d399", icon: "🕳️" },
};

const RATINGS = [
  { max: 40,  label: "AI Dependent",      cls: "rating-dependent",  title: "You're in the majority",       sub: "Most people struggle to spot bad AI outputs. The good news: this is a learnable skill, and just taking this test puts you ahead of most people." },
  { max: 70,  label: "Developing Awareness", cls: "rating-developing", title: "You're building the skill",  sub: "You caught some issues but missed others. You have a solid foundation. Focus on the categories where you struggled and your score will climb fast." },
  { max: 90,  label: "Critically Aware",  cls: "rating-aware",      title: "Sharper than most",             sub: "You spotted the majority of issues. You understand the core failure modes of AI. A few more practice rounds and you'll be among the top tier." },
  { max: 100, label: "AI Literate",       cls: "rating-literate",   title: "You're in the top tier",        sub: "You spotted nearly everything. You think critically about AI outputs by default, exactly the skill that sets effective AI users apart." },
];

const RECOMMENDATIONS = {
  hallucination: {
    icon: "🧠",
    title: "Practice fact-checking AI outputs",
    text: "When AI states specific facts, such as dates, names, quotes, or statistics, verify them. AIs frequently invent plausible-sounding details. Habit: ask yourself 'how would I verify this?'"
  },
  bias: {
    icon: "⚖️",
    title: "Watch for who gets left out",
    text: "Biased AI outputs often sound authoritative. Ask: who does this advice exclude? Whose perspective is missing? What assumptions are baked in? Bias hides in what isn't said."
  },
  reasoning: {
    icon: "🔗",
    title: "Separate correlation from causation",
    text: "AI often draws causal conclusions from correlations. When you see 'X causes Y', ask: is there a confounding variable? Is this a hasty generalization from one case to all cases?"
  },
  overconfidence: {
    icon: "🎯",
    title: "Flag certainty language in uncertain domains",
    text: "Words like 'definitely', 'certainly', 'will' in predictions, medical diagnoses, or complex decisions are red flags. AI has no special access to the future or your personal situation."
  },
  incomplete: {
    icon: "🕳️",
    title: "Ask what's missing, not just what's said",
    text: "Incomplete AI answers often sound complete. Ask: is this nuanced enough? What exceptions exist? What's the other side? Simple 'yes/no' answers to complex questions are almost always incomplete."
  },
};

// ── State ──────────────────────────────────────────────────────
let currentQ   = 0;
let answered   = false;
let score      = 0;
let catScores  = { hallucination: 0, bias: 0, reasoning: 0, overconfidence: 0, incomplete: 0 };
let catTotals  = { hallucination: 0, bias: 0, reasoning: 0, overconfidence: 0, incomplete: 0 };
let weakCats   = [];

// ── Boot ───────────────────────────────────────────────────────
document.getElementById("btn-start").addEventListener("click", () => {
  showScreen("screen-quiz");
  renderQuestion();
});

// ── Render question ────────────────────────────────────────────
function renderQuestion() {
  const q = QUESTIONS[currentQ];
  answered = false;

  // Progress
  const pct = (currentQ / QUESTIONS.length) * 100;
  document.getElementById("progress-bar").style.width = pct + "%";
  document.getElementById("q-counter").textContent = `Question ${currentQ + 1} of ${QUESTIONS.length}`;

  const badge = document.getElementById("q-category-badge");
  badge.textContent = q.categoryLabel;
  badge.className   = `q-cat-badge cat-${q.category}`;

  // AI response + question
  document.getElementById("q-ai-response").textContent = q.aiResponse;
  document.getElementById("q-question").textContent    = q.question;

  // Hide explanation
  const expBox = document.getElementById("explanation-box");
  expBox.style.display = "none";

  // Options
  const grid = document.getElementById("options-grid");
  grid.innerHTML = "";
  q.options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.innerHTML = `<span class="option-letter">${opt.letter}</span><span>${opt.text}</span>`;
    btn.addEventListener("click", () => handleAnswer(opt, btn));
    grid.appendChild(btn);
  });

  // Next button
  const nextBtn = document.getElementById("btn-next");
  nextBtn.disabled    = true;
  nextBtn.textContent = currentQ === QUESTIONS.length - 1 ? "See My Score →" : "Next Question →";
}

// ── Handle answer ──────────────────────────────────────────────
function handleAnswer(opt, clickedBtn) {
  if (answered) return;
  answered = true;

  const q = QUESTIONS[currentQ];
  const isCorrect = !!opt.correct;
  catTotals[q.category]++;

  if (isCorrect) {
    score += 10;
    catScores[q.category]++;
  }

  // Style options
  document.querySelectorAll(".option-btn").forEach((btn) => {
    btn.disabled = true;
    const letter = btn.querySelector(".option-letter").textContent;
    const thisOpt = q.options.find((o) => o.letter === letter);
    if (thisOpt.correct) {
      btn.classList.add("correct");
    } else if (btn === clickedBtn && !isCorrect) {
      btn.classList.add("wrong");
    } else {
      btn.classList.add("dimmed");
    }
  });

  // Explanation
  const expBox  = document.getElementById("explanation-box");
  const expIcon = document.getElementById("explanation-icon");
  const expText = document.getElementById("explanation-text");
  expIcon.textContent = isCorrect ? "✅" : "❌";
  expText.textContent = q.explanation;
  expBox.style.display = "flex";

  document.getElementById("btn-next").disabled = false;
}

// ── Next ───────────────────────────────────────────────────────
document.getElementById("btn-next").addEventListener("click", () => {
  currentQ++;
  if (currentQ >= QUESTIONS.length) {
    showResults();
  } else {
    renderQuestion();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

// ── Results ────────────────────────────────────────────────────
function showResults() {
  showScreen("screen-results");
  window.scrollTo({ top: 0, behavior: "smooth" });

  // Score ring animation
  const ring = document.getElementById("ring-fill");
  const circumference = 327;
  const offset = circumference - (score / 100) * circumference;

  // Add gradient def to SVG
  const svg = ring.closest("svg");
  svg.innerHTML += `
    <defs>
      <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%"   stop-color="#7c5cfc"/>
        <stop offset="100%" stop-color="#34d399"/>
      </linearGradient>
    </defs>`;

  setTimeout(() => {
    ring.style.strokeDashoffset = offset;
  }, 100);

  // Animate score number
  animateCounter(document.getElementById("score-num"), score, 1400);

  // Rating
  const rating = RATINGS.find((r) => score <= r.max);
  const badge  = document.getElementById("rating-badge");
  badge.textContent  = rating.label;
  badge.className    = `rating-badge ${rating.cls}`;

  document.getElementById("results-title").textContent = rating.title;
  document.getElementById("results-sub").textContent   = rating.sub;

  // Category breakdown
  const barsEl = document.getElementById("breakdown-bars");
  barsEl.innerHTML = "";
  Object.entries(CATEGORY_META).forEach(([key, meta]) => {
    const correct = catScores[key];
    const total   = catTotals[key];
    const pct     = total > 0 ? Math.round((correct / total) * 100) : 0;
    const row     = document.createElement("div");
    row.className = "bk-row";
    row.innerHTML = `
      <div class="bk-label-col">${meta.icon} ${meta.label}</div>
      <div class="bk-bar-wrap">
        <div class="bk-bar-fill" data-width="${pct}" style="background:${meta.color};width:0%"></div>
      </div>
      <div class="bk-score">${correct}/${total}</div>
    `;
    barsEl.appendChild(row);
    if (pct < 50) weakCats.push(key);
  });

  setTimeout(() => {
    document.querySelectorAll(".bk-bar-fill").forEach((bar) => {
      bar.style.width = bar.dataset.width + "%";
    });
  }, 200);

  // Recommendations
  const recoEl = document.getElementById("reco-list");
  recoEl.innerHTML = "";
  const recoKeys = weakCats.length > 0 ? weakCats : Object.keys(RECOMMENDATIONS);
  recoKeys.slice(0, 3).forEach((key) => {
    const r  = RECOMMENDATIONS[key];
    const el = document.createElement("div");
    el.className = "reco-item";
    el.innerHTML = `
      <div class="reco-icon">${r.icon}</div>
      <div class="reco-text"><strong>${r.title}</strong>${r.text}</div>
    `;
    recoEl.appendChild(el);
  });
}

// ── Share ──────────────────────────────────────────────────────
document.getElementById("btn-share").addEventListener("click", () => {
  const rating = RATINGS.find((r) => score <= r.max);
  const text   = encodeURIComponent(
    `I scored ${score}/100 on the AI Literacy Test, "${rating.label}"\n\nCan you do better? Test yourself at MindFirst 🧠`
  );
  window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
});

// ── Retry ──────────────────────────────────────────────────────
document.getElementById("btn-retry").addEventListener("click", () => {
  currentQ    = 0;
  score       = 0;
  answered    = false;
  weakCats    = [];
  catScores   = { hallucination: 0, bias: 0, reasoning: 0, overconfidence: 0, incomplete: 0 };
  catTotals   = { hallucination: 0, bias: 0, reasoning: 0, overconfidence: 0, incomplete: 0 };
  showScreen("screen-intro");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ── Helpers ────────────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function animateCounter(el, target, duration) {
  const start = performance.now();
  (function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(step);
  })(start);
}
