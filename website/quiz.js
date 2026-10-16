const CATEGORY_LABELS = {"hallucination": "Hallucination", "bias": "Bias", "reasoning": "Flawed Reasoning", "overconfidence": "Overconfidence", "incomplete": "Missing Context"};

// Question pool: 6 per category. Each run draws 2 per category, shuffles the
// question order and the answer order, so no two runs look the same.
const QUESTION_POOL = [
  {
    "category": "hallucination",
    "categoryLabel": "Hallucination",
    "aiResponse": "Albert Einstein won the Nobel Prize in Physics in 1921 for his discovery of the photoelectric effect. He also won his first Nobel Prize in 1905, the same year he published his papers on relativity and Brownian motion.",
    "question": "What is wrong with this AI response?",
    "options": [
      {
        "text": "The 1905 Nobel Prize is invented. He won once, in 1921.",
        "correct": true
      },
      {
        "text": "The 1921 prize was for relativity, not the photoelectric effect."
      },
      {
        "text": "Physics Nobels were not awarded until the 1920s."
      },
      {
        "text": "Brownian motion was published in 1906, not 1905."
      }
    ],
    "explanation": "Einstein won a single Nobel Prize, in 1921. The 1905 prize was made up to sit next to a real date, which is typical of a hallucination: a true fact padded with a false one that fits the story. The other options sound reasonable, but each one is itself false."
  },
  {
    "category": "hallucination",
    "categoryLabel": "Hallucination",
    "aiResponse": "According to a 2019 Stanford study by Dr. Helen Marchetti, published in Nature, people who drink two liters of water before bed improve their memory retention by 41%.",
    "question": "What should you do before trusting this?",
    "options": [
      {
        "text": "Look the study up. AI tools often invent specific-sounding citations.",
        "correct": true
      },
      {
        "text": "Nothing. Nature only publishes verified research, so it can be trusted as is."
      },
      {
        "text": "Ask the AI again and trust the claim if it gives the same answer."
      },
      {
        "text": "Check whether the 41% figure is statistically significant first."
      }
    ],
    "explanation": "Names, journals, years and exact percentages make a claim feel checked, but language models can generate all of them without any source behind them. Asking again does not help, because a model can repeat the same invented citation. Whether the number is significant only matters after you know the study exists."
  },
  {
    "category": "hallucination",
    "categoryLabel": "Hallucination",
    "aiResponse": "To sort a list of users by age in Python, call users.sortBy(key=lambda u: u.age). It sorts the list in place.",
    "question": "What is the issue?",
    "options": [
      {
        "text": "Python lists have no sortBy method. The real one is sort.",
        "correct": true
      },
      {
        "text": "Python lists can't be sorted in place; sorted() returns a new list."
      },
      {
        "text": "The key argument must be a string naming an attribute, not a lambda."
      },
      {
        "text": "sortBy only exists on tuples, so the list needs converting first."
      }
    ],
    "explanation": "The AI mixed in a method name from another language (sortBy is JavaScript and Scala territory). Invented API calls are one of the most common coding hallucinations, and they read as natural. Run the code, or check the docs, before you build on it."
  },
  {
    "category": "hallucination",
    "categoryLabel": "Hallucination",
    "aiResponse": "As Mark Twain famously said, \"The definition of insanity is doing the same thing over and over and expecting different results.\"",
    "question": "What is the most defensible criticism of this?",
    "options": [
      {
        "text": "It is a popular misattribution. No reliable source ties it to Twain.",
        "correct": true
      },
      {
        "text": "Twain never wrote about insanity at all, so the quote is fabricated."
      },
      {
        "text": "The quote is genuine, but the AI should have named the book it came from."
      },
      {
        "text": "It belongs to Einstein, who said it in a 1950 interview."
      }
    ],
    "explanation": "Quote researchers have found no source for this line from Twain, and the usual alternative, Einstein, is just as unsupported. Saying Twain never wrote about insanity goes further than the evidence does. Be wary of any \"famously said\" line that the AI delivers without a source."
  },
  {
    "category": "hallucination",
    "categoryLabel": "Hallucination",
    "aiResponse": "In Henderson v. Pacific Rail Co. (1987), the Supreme Court ruled that employees cannot be fired for refusing to work on holidays. You can cite this in your complaint.",
    "question": "What is the biggest risk in using this?",
    "options": [
      {
        "text": "The case may not exist. Lawyers have been sanctioned for citing fake ones.",
        "correct": true
      },
      {
        "text": "A ruling from 1987 is too old to still count as valid law."
      },
      {
        "text": "Employment rulings only apply in the state where they were decided."
      },
      {
        "text": "It leaves out the page number of the opinion, which makes it unusable."
      }
    ],
    "explanation": "AI tools have produced convincing case names, courts and holdings that do not exist, and lawyers have been fined for filing them. Older rulings are still precedent unless overturned. Verify any citation in a real legal database before you rely on it."
  },
  {
    "category": "hallucination",
    "categoryLabel": "Hallucination",
    "aiResponse": "Humans only use about 10% of their brains. Unlocking the other 90% is the key to better focus and memory.",
    "question": "What is wrong with this response?",
    "options": [
      {
        "text": "It repeats a myth. Brain scans show activity across the whole brain.",
        "correct": true
      },
      {
        "text": "The real figure is closer to 30%, so the AI's number is just outdated."
      },
      {
        "text": "The claim holds for adults over 40, whose brain use declines sharply."
      },
      {
        "text": "The claim is true on average, but people in intellectual jobs use more."
      }
    ],
    "explanation": "The 10% idea is a long-running myth. Scans and damage studies show that nearly every region is active over the course of a day. Models repeat myths like this because they appear so often in the text they learned from. Fixing the number, as one option does, still leaves the myth in place."
  },
  {
    "category": "bias",
    "categoryLabel": "Bias",
    "aiResponse": "When hiring for a software engineering role, prioritize candidates from top-tier universities like MIT, Stanford, or Carnegie Mellon. These graduates have proven track records and will be better equipped for the technical demands.",
    "question": "What is the main issue with this advice?",
    "options": [
      {
        "text": "Prestige is used as a stand-in for ability, which screens out capable people.",
        "correct": true
      },
      {
        "text": "Graduates of elite schools actually perform worse, so the advice is backwards."
      },
      {
        "text": "It names only three universities when it should name at least ten."
      },
      {
        "text": "It never asks about the company's size, so the advice is too generic."
      }
    ],
    "explanation": "Prestige correlates with ability, but it is a weak filter that excludes self-taught developers, bootcamp graduates and state-school graduates. The advice is not factually absurd, which is why bias like this slips by."
  },
  {
    "category": "bias",
    "categoryLabel": "Bias",
    "aiResponse": "Research shows men are naturally better at spatial reasoning and math, which explains the higher proportion of men in STEM. Women tend to be more naturally suited to communication-heavy roles.",
    "question": "What is wrong with this response?",
    "options": [
      {
        "text": "It turns small average gaps into innate ability, ignoring socialization.",
        "correct": true
      },
      {
        "text": "It cites no specific studies, so none of the claims can be checked."
      },
      {
        "text": "Men and women score identically on every cognitive measure, so the claim is false."
      },
      {
        "text": "AI should not discuss any differences between groups at all."
      }
    ],
    "explanation": "Some studies do find small average gaps on some tasks, but the response turns that into \"natural\" ability and a career verdict for individuals. Saying there are no differences at all, as one option does, is also an overclaim. The problem is the leap from averages to destiny."
  },
  {
    "category": "bias",
    "categoryLabel": "Bias",
    "aiResponse": "Both candidates have a computer science degree and five years of backend experience. Emily Walsh seems like the better cultural fit, so I'd move her forward over Lakisha Washington.",
    "question": "What is the problem here?",
    "options": [
      {
        "text": "It ranks on something unrelated to the job when the qualifications match.",
        "correct": true
      },
      {
        "text": "Cultural fit should never be considered when hiring anyone."
      },
      {
        "text": "It should have asked for a cover letter before comparing them."
      },
      {
        "text": "Two candidates with identical experience cannot be meaningfully compared."
      }
    ],
    "explanation": "Audit studies have repeatedly found that identical resumes get different responses depending on the name at the top. \"Cultural fit\" is vague enough to hide that. Asking what evidence the AI used, and getting none, is a good test."
  },
  {
    "category": "bias",
    "categoryLabel": "Bias",
    "aiResponse": "Always tip 20% at restaurants. It's the standard everywhere, and skipping it is rude.",
    "question": "What hidden assumption is in this advice?",
    "options": [
      {
        "text": "It assumes US norms apply worldwide. In many countries tipping is optional.",
        "correct": true
      },
      {
        "text": "20% is too low, since 25% is now the standard in most places."
      },
      {
        "text": "Tipping is illegal in most countries, so the advice could get you fined."
      },
      {
        "text": "You should tip in cash rather than on a card, in all cases."
      }
    ],
    "explanation": "Much AI training text comes from US sources, so US customs come out as defaults. The word \"everywhere\" is the giveaway. Norms in Japan, much of Europe and elsewhere differ a lot, and tipping is not illegal in most places."
  },
  {
    "category": "bias",
    "categoryLabel": "Bias",
    "aiResponse": "Older employees tend to struggle with new technology, so for the software rollout, assign the training sessions mainly to younger staff.",
    "question": "What is the main problem?",
    "options": [
      {
        "text": "It uses age as a stand-in for skill instead of assessing individual people.",
        "correct": true
      },
      {
        "text": "Training should be identical for every employee regardless of their role."
      },
      {
        "text": "Younger staff tend to make worse trainers, so it picked the wrong group."
      },
      {
        "text": "A rollout shouldn't include formal training sessions in the first place."
      }
    ],
    "explanation": "Plenty of older employees are quick with new tools, and plenty of younger ones are not. Treating a group stereotype as a fact about each person is how bias shows up in workplace advice. The fix is to assess skills directly."
  },
  {
    "category": "bias",
    "categoryLabel": "Bias",
    "aiResponse": "We surveyed 500 Twitter users and found that 80% of Americans support the new policy.",
    "question": "What is the flaw in this conclusion?",
    "options": [
      {
        "text": "Users of one platform are not a random sample of all Americans.",
        "correct": true
      },
      {
        "text": "Opinion surveys cannot measure support for specific policies."
      },
      {
        "text": "A sample of 500 is always too small to say anything useful."
      },
      {
        "text": "80% is too high a number for any poll to be believable."
      }
    ],
    "explanation": "This is selection bias. People on one platform differ from the general public in age, politics and how often they post. A well-drawn sample of 500 can be accurate to within a few points, so size is not the issue here. Who got asked is."
  },
  {
    "category": "reasoning",
    "categoryLabel": "Flawed Reasoning",
    "aiResponse": "Ice cream sales spike every summer, and so do drownings. The data shows a strong correlation, which means eating ice cream raises the risk of drowning.",
    "question": "What logical error is the AI making?",
    "options": [
      {
        "text": "It reads correlation as causation. Hot weather drives both.",
        "correct": true
      },
      {
        "text": "Ice cream sales and drownings are not really correlated."
      },
      {
        "text": "Drownings are too rare an event to support any statistical conclusion."
      },
      {
        "text": "The correlation is real but weak, so it should say 'might' instead of 'raises'."
      }
    ],
    "explanation": "A hidden third factor, summer heat, pushes up both numbers. Without ruling out confounders, a correlation cannot support a causal claim. Hedging the wording, as one option suggests, would not fix the logic."
  },
  {
    "category": "reasoning",
    "categoryLabel": "Flawed Reasoning",
    "aiResponse": "Lead pipes were used heavily in ancient Rome, and some historians think lead exposure contributed to its decline. So any civilization that used lead plumbing was doomed to collapse.",
    "question": "What is wrong with this reasoning?",
    "options": [
      {
        "text": "One debated case is stretched into a universal rule about every civilization.",
        "correct": true
      },
      {
        "text": "Rome never used lead pipes at scale, so the premise is wrong."
      },
      {
        "text": "Historians have already proven the lead theory false, so it should not be cited."
      },
      {
        "text": "Lead can only harm individuals, so it cannot explain a whole society's decline."
      }
    ],
    "explanation": "This is a hasty generalization. Even if the Rome theory is right, a single case does not support \"all\" civilizations, and several societies used lead and lasted for centuries."
  },
  {
    "category": "reasoning",
    "categoryLabel": "Flawed Reasoning",
    "aiResponse": "You can only break into tech by attending a coding bootcamp. You do not have $15,000, so you should give up on a tech career.",
    "question": "Which reasoning flaw is this?",
    "options": [
      {
        "text": "False dilemma. It ignores degrees, self-study, internships and other routes.",
        "correct": true
      },
      {
        "text": "Circular reasoning. It assumes the very thing it is trying to prove."
      },
      {
        "text": "Appeal to authority. It leans on what bootcamps say about themselves."
      },
      {
        "text": "Slippery slope. It predicts a chain of ever-worse events with no evidence."
      }
    ],
    "explanation": "The argument presents two options, bootcamp or nothing, when many other paths exist. The other fallacy names are real, but none of them describes what happens here, which is a short list of options passed off as the whole list."
  },
  {
    "category": "reasoning",
    "categoryLabel": "Flawed Reasoning",
    "aiResponse": "Steve Jobs, Bill Gates and Mark Zuckerberg all dropped out of college and became billionaires. Dropping out is clearly a strong path to success.",
    "question": "What is the flaw?",
    "options": [
      {
        "text": "Survivorship bias. The failures who also dropped out are invisible.",
        "correct": true
      },
      {
        "text": "Post hoc reasoning. It assumes that dropping out came after the success."
      },
      {
        "text": "Straw man. It misstates what those founders have said about school."
      },
      {
        "text": "Ad hominem. It attacks people who chose to stay in college instead."
      }
    ],
    "explanation": "Only the successes get remembered, so the sample is rigged. To judge dropping out you would need the outcomes of everyone who did it, and most never make headlines."
  },
  {
    "category": "reasoning",
    "categoryLabel": "Flawed Reasoning",
    "aiResponse": "A bat and a ball cost $1.10 together. The bat costs $1.00 more than the ball. So the ball costs 10 cents.",
    "question": "What went wrong?",
    "options": [
      {
        "text": "The ball costs 5 cents. The answer fails the second condition.",
        "correct": true
      },
      {
        "text": "The ball costs 15 cents once tax on the total is included."
      },
      {
        "text": "Nothing is wrong. If the bat is $1.00, the ball is 10 cents."
      },
      {
        "text": "The puzzle has no unique answer, so any price could be right."
      }
    ],
    "explanation": "If the ball were 10 cents, the bat would be $1.10 and the total $1.20. The intuitive answer feels right, and AI is prone to the same snap judgments as people. Checking a result against every condition in the problem is the habit that catches this."
  },
  {
    "category": "reasoning",
    "categoryLabel": "Flawed Reasoning",
    "aiResponse": "The test is 95% accurate and your result came back positive, so there is a 95% chance that you have the disease.",
    "question": "What is missing from this reasoning?",
    "options": [
      {
        "text": "The base rate: for a rare disease, most positives are false alarms.",
        "correct": true
      },
      {
        "text": "No real medical test is accurate enough to reach 95%."
      },
      {
        "text": "A positive result should always be retested three times first."
      },
      {
        "text": "Accuracy measures the lab's confidence, not how the test performs."
      }
    ],
    "explanation": "Suppose 1 in 1,000 people has the disease. Out of 1,000 tests, about 1 true positive appears next to roughly 50 false ones, so a positive means about a 2% chance. Test accuracy and the chance you are sick are different numbers."
  },
  {
    "category": "overconfidence",
    "categoryLabel": "Overconfidence",
    "aiResponse": "The stock market will definitely rise 15 to 20% next year. Inflation is cooling, rates are stabilizing, and spending is strong. This outcome is a near certainty.",
    "question": "What is the problem with this response?",
    "options": [
      {
        "text": "It claims certainty about a system nobody can predict.",
        "correct": true
      },
      {
        "text": "Inflation and interest rates have no effect on stock prices."
      },
      {
        "text": "It gives a range instead of a single exact number."
      },
      {
        "text": "It should name which index the forecast refers to."
      }
    ],
    "explanation": "Even professional forecasters miss market moves constantly. Words like \"definitely\" and \"near certainty\" are the warning sign. The indicators it lists are real, but they do not make the outcome certain."
  },
  {
    "category": "overconfidence",
    "categoryLabel": "Overconfidence",
    "aiResponse": "Based on your fatigue and persistent headaches, you almost certainly have iron deficiency anemia. Start taking iron supplements immediately.",
    "question": "What is the core problem with this response?",
    "options": [
      {
        "text": "Many conditions fit these symptoms, and it skips testing first.",
        "correct": true
      },
      {
        "text": "Iron deficiency cannot cause fatigue or headaches, so it is wrong."
      },
      {
        "text": "Iron supplements are never safe to take without a prescription."
      },
      {
        "text": "It should have asked your age and sex before answering."
      }
    ],
    "explanation": "Fatigue and headaches fit dozens of conditions. Iron deficiency can cause them, so the claim is plausible, which is exactly why the confidence is risky. Taking iron without testing can also be harmful for some people."
  },
  {
    "category": "overconfidence",
    "categoryLabel": "Overconfidence",
    "aiResponse": "You can legally break your lease without any penalty because your landlord was slow fixing the heater. I am sure of this.",
    "question": "What is the problem?",
    "options": [
      {
        "text": "Tenant law varies by place and lease, so a flat guarantee is unreliable.",
        "correct": true
      },
      {
        "text": "Heating repairs are never the landlord's responsibility."
      },
      {
        "text": "Leases can only be ended by mutual agreement, never by the tenant alone."
      },
      {
        "text": "It should have said 'likely', since most landlords agree to this."
      }
    ],
    "explanation": "Some places do allow a tenant to terminate over serious, unresolved habitability issues, with notice requirements and conditions that vary. The AI does not know your lease or your jurisdiction, and \"I am sure\" covers for that."
  },
  {
    "category": "overconfidence",
    "categoryLabel": "Overconfidence",
    "aiResponse": "Quantum computers will break all current encryption by 2028. Every business should switch its security this year.",
    "question": "What is the issue with this prediction?",
    "options": [
      {
        "text": "A precise date for shaky tech, and post-quantum encryption exists.",
        "correct": true
      },
      {
        "text": "Quantum computers do not exist in any form, so this cannot happen."
      },
      {
        "text": "Current encryption was already broken in 2020, so the date is wrong."
      },
      {
        "text": "2028 is too far in the future for anyone to make a prediction."
      }
    ],
    "explanation": "Experts debate when, or whether, large-scale quantum computers will arrive, and standards bodies have already published post-quantum algorithms. A confident date from an AI is a guess dressed as a fact."
  },
  {
    "category": "overconfidence",
    "categoryLabel": "Overconfidence",
    "aiResponse": "Here is the function. It is guaranteed to be thread-safe and bug-free.",
    "question": "What should you do with this claim?",
    "options": [
      {
        "text": "Treat the guarantee as a red flag; the AI can't run code.",
        "correct": true
      },
      {
        "text": "Accept it, since AI-written code is checked by the compiler first."
      },
      {
        "text": "Ask the AI to confirm and accept the answer if it agrees."
      },
      {
        "text": "Rewrite it in a safer language, since the language is the issue."
      }
    ],
    "explanation": "A model predicts plausible code. It does not run it or prove anything about it. Compilers catch syntax errors, not race conditions. Asking the same model again just gets you the same confidence."
  },
  {
    "category": "overconfidence",
    "categoryLabel": "Overconfidence",
    "aiResponse": "I checked the restaurant's hours: it is open until 11 pm tonight, so you have plenty of time.",
    "question": "What is the concern?",
    "options": [
      {
        "text": "It can't have checked live hours without web access, so call to confirm.",
        "correct": true
      },
      {
        "text": "Restaurants rarely stay open past 10 pm, so the hours must be wrong."
      },
      {
        "text": "Hours on map apps are always unreliable, so no one should trust them."
      },
      {
        "text": "It should have said what the restaurant serves as well as when."
      }
    ],
    "explanation": "Models sometimes describe actions they could not have taken, such as looking something up. Confident claims about current facts are worth a quick check with the source."
  },
  {
    "category": "incomplete",
    "categoryLabel": "Missing Context",
    "aiResponse": "Coffee is bad for your health. It raises blood pressure, disrupts sleep, and causes anxiety. You should avoid it.",
    "question": "What is missing from this response?",
    "options": [
      {
        "text": "Nuance. Effects vary by dose and person, and moderate intake is often fine.",
        "correct": true
      },
      {
        "text": "Coffee does not actually contain caffeine, so the effects are overstated."
      },
      {
        "text": "It should recommend a specific brand of coffee to be useful."
      },
      {
        "text": "It leaves out the history of how coffee spread around the world."
      }
    ],
    "explanation": "Each claim has some truth, and heavy intake or sensitivity to caffeine can cause real problems. The flaw is the blanket verdict: dose and individual variation are left out, and so is the evidence pointing the other way."
  },
  {
    "category": "incomplete",
    "categoryLabel": "Missing Context",
    "aiResponse": "Put all your savings into an S&P 500 index fund. It always goes up in the long run.",
    "question": "What does this advice leave out?",
    "options": [
      {
        "text": "Your time horizon, your emergency fund, and years-long market drops.",
        "correct": true
      },
      {
        "text": "Index funds charge fees that are too high to be worth owning."
      },
      {
        "text": "Individuals can't buy index funds directly, only through advisers."
      },
      {
        "text": "It should have pushed individual stocks, which beat index funds."
      }
    ],
    "explanation": "Broad index investing is common and defensible, and that is why this answer sounds fine. But \"always\" hides long drawdowns, and putting all savings in one place skips questions about when you need the money."
  },
  {
    "category": "incomplete",
    "categoryLabel": "Missing Context",
    "aiResponse": "The Industrial Revolution improved life for everyone by making goods cheaper and creating jobs.",
    "question": "What is missing?",
    "options": [
      {
        "text": "The costs: dangerous factories, child labor, and gains that were uneven.",
        "correct": true
      },
      {
        "text": "It started in Germany, not Britain, so the history is off."
      },
      {
        "text": "Goods became more expensive, so the claim about prices is backwards."
      },
      {
        "text": "It should have named the inventor of the steam engine."
      }
    ],
    "explanation": "Living standards did eventually rise, but \"everyone\" and the tidy success story skip a long, painful transition. One-sided summaries sound complete because nothing in them is false."
  },
  {
    "category": "incomplete",
    "categoryLabel": "Missing Context",
    "aiResponse": "The best programming language is Python. You should use it for everything.",
    "question": "What is wrong with this answer?",
    "options": [
      {
        "text": "'Best' depends on what you're building, and it never asks.",
        "correct": true
      },
      {
        "text": "Python is too slow to count as best for any kind of work."
      },
      {
        "text": "Java should have been named instead, as it is more widely used."
      },
      {
        "text": "Languages can't be compared, so any 'best' claim is wrong."
      }
    ],
    "explanation": "Python is a strong choice for data work and scripting, and a weak one for things like mobile apps or tight real-time systems. A single winner with no questions about your goal is a sign that context is missing."
  },
  {
    "category": "incomplete",
    "categoryLabel": "Missing Context",
    "aiResponse": "Crime in the city rose 50% last year, so it has become much more dangerous.",
    "question": "What is missing?",
    "options": [
      {
        "text": "The actual counts. A 50% rise could mean 2 incidents became 3.",
        "correct": true
      },
      {
        "text": "The percentage should be rounded to the nearest 10 for clarity."
      },
      {
        "text": "Crime figures can't be compared from one year to the next."
      },
      {
        "text": "It should name which mayor was in office that year."
      }
    ],
    "explanation": "A percentage change without a baseline can mean nothing or a lot. You also want the population, how crimes are counted, and the longer trend before calling a city dangerous."
  },
  {
    "category": "incomplete",
    "categoryLabel": "Missing Context",
    "aiResponse": "You can visit Country X without a visa. Just show up with your passport.",
    "question": "What is the problem with this answer?",
    "options": [
      {
        "text": "It depends on your passport and stay, and rules change.",
        "correct": true
      },
      {
        "text": "A passport isn't enough anywhere, so a visa is always required."
      },
      {
        "text": "Visas are only needed for stays over one year, worldwide."
      },
      {
        "text": "It should have told you to book through a travel agent."
      }
    ],
    "explanation": "Visa rules differ a lot by nationality, and they get updated. The answer might be correct for some travelers and wrong for you, which is exactly why a confident one-size reply is risky. Check the embassy or government site."
  }
];

let QUESTIONS = [];

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Draw 2 questions per category, shuffle their order, and shuffle each
// question's answers so the correct letter is random.
function buildQuiz() {
  const picked = [];
  Object.keys(CATEGORY_LABELS).forEach((cat) => {
    const inCat = QUESTION_POOL.filter((x) => x.category === cat);
    picked.push(...shuffle(inCat).slice(0, 2));
  });
  QUESTIONS = shuffle(picked).map((x, i) => ({
    ...x,
    id: i + 1,
    options: shuffle(x.options).map((o, k) => ({ ...o, letter: "ABCD"[k] })),
  }));
}

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
  buildQuiz();
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

  // Score ring animation (the ring SVG was removed from quiz.html, so skip if absent)
  const ring = document.getElementById("ring-fill");
  if (ring) {
    const circumference = 327;
    const offset = circumference - (score / 100) * circumference;
    const svg = ring.closest("svg");
    if (svg) {
      svg.innerHTML += `
    <defs>
      <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%"   stop-color="#7c5cfc"/>
        <stop offset="100%" stop-color="#34d399"/>
      </linearGradient>
    </defs>`;
    }
    setTimeout(() => {
      ring.style.strokeDashoffset = offset;
    }, 100);
  }

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
