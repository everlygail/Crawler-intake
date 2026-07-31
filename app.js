const QUESTIONS = [
  {
    id: "creature",
    prompt: "A dangerous creature is trapped beneath rubble. A child is being chased nearby. What do you do first, and why?"
  },
  {
    id: "loot",
    prompt: "You and a stranger find one life-saving item. The stranger insists they need it more. What happens next?"
  },
  {
    id: "curse",
    prompt: "Choose a permanent price for extraordinary power: pain, lost memories, unwanted truth, or refusal. Explain your choice."
  },
  {
    id: "betrayal",
    prompt: "A trusted party member betrays you, but their information could still save the group. What do you do?"
  },
  {
    id: "boss",
    prompt: "The final boss is stronger than your entire party. You have one hour before combat. How do you prepare?"
  }
];

const KEYWORDS = {
  bond: ["tame", "befriend", "animal", "creature", "calm", "trust", "help", "understand"],
  protect: ["save", "protect", "child", "group", "party", "everyone", "both", "shield"],
  strategy: ["plan", "examine", "information", "prepare", "option", "use", "benefit", "trap", "weakness"],
  social: ["convince", "agree", "negotiate", "talk", "offer", "persuade", "deal", "reason"],
  survival: ["survive", "escape", "live", "safe", "risk", "hide"],
  adapt: ["remade", "adapt", "change", "future", "rebuild", "learn", "improvise"],
  risk: ["curse", "pain", "sacrifice", "cost", "price", "accept"],
  identity: ["memory", "identity", "past", "self", "become", "remember"],
  control: ["control", "leverage", "watch", "contain", "restrain", "command"],
  knowledge: ["learn", "study", "research", "weakness", "pattern", "observe"],
  leadership: ["assign", "team", "lead", "roles", "coordinate", "organize"]
};

const ARCHETYPES = [
  {
    title: "The Better Offer",
    type: "Controller / Support",
    className: "Beast Diplomat",
    race: "Serpentkin",
    alignment: "Chaotic Cooperative",
    primary: ["social", "bond", "strategy"],
    quote: "The dungeon does not need another weapon. It needs a negotiator."
  },
  {
    title: "The Last Door Standing",
    type: "Defender / Commander",
    className: "Oath Warden",
    race: "Ironblood",
    alignment: "Protective Neutral",
    primary: ["protect", "leadership", "survival"],
    quote: "Anything behind me is not yours to take."
  },
  {
    title: "The Unwritten Option",
    type: "Tactician / Manipulator",
    className: "Loophole Architect",
    race: "Mirrorborn",
    alignment: "Chaotic Strategic",
    primary: ["strategy", "control", "knowledge"],
    quote: "Your rules are only dangerous when I agree they are rules."
  },
  {
    title: "The One Who Returned",
    type: "Adaptive / Skirmisher",
    className: "Ruinwalker",
    race: "Ashborn",
    alignment: "Pragmatic Neutral",
    primary: ["adapt", "survival", "risk"],
    quote: "Meaning can be rebuilt. So can I."
  }
];

const state = {
  step: "welcome",
  name: "",
  question: 0,
  answers: {},
  profile: null
};

const app = document.querySelector("#app");

const escapeHtml = (value = "") =>
  value.replace(/[&<>'"]/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  })[char]);

function scoreAnswers(answers) {
  const scores = Object.fromEntries(Object.keys(KEYWORDS).map(key => [key, 0]));

  Object.values(answers).forEach(answer => {
    const text = answer.toLowerCase();

    for (const [tag, words] of Object.entries(KEYWORDS)) {
      words.forEach(word => {
        if (text.includes(word)) scores[tag] += 2;
      });
    }

    if (/both|third option|another way|instead|after that|then i/.test(text)) scores.strategy += 4;
    if (/convince|negotiate|offer|agree|talk/.test(text)) scores.social += 3;
    if (/save|protect|child|party|everyone/.test(text)) scores.protect += 3;
  });

  return scores;
}

function buildProfile(name, answers, crawlerNumber) {
  const scores = scoreAnswers(answers);
  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  const archetype = ARCHETYPES
    .map(item => ({
      ...item,
      score: item.primary.reduce((sum, key) => sum + (scores[key] || 0), 0)
    }))
    .sort((a, b) => b.score - a.score)[0];

  const top = ranked.slice(0, 3).map(([key]) => key);

  const stat = (base, keys) =>
    Math.min(18, base + keys.reduce(
      (sum, key) => sum + Math.floor((scores[key] || 0) / 5),
      0
    ));

  return {
    name,
    crawlerNumber,
    ...archetype,
    stats: {
      Strength: stat(6, ["protect", "survival"]),
      Dexterity: stat(7, ["adapt", "risk"]),
      Constitution: stat(7, ["survival", "protect"]),
      Intelligence: stat(10, ["strategy", "knowledge"]),
      Wisdom: stat(10, ["bond", "adapt", "identity"]),
      Charisma: stat(10, ["social", "leadership"])
    },
    traits: [
      top.includes("bond") ? "Monster Whisperer" : "Threat Reader",
      top.includes("strategy") ? "False Choice" : "Pressure Tested",
      top.includes("social") ? "Better Offer" : "Adaptive Mind"
    ],
    weakness: top.includes("protect")
      ? "You will endanger yourself for those you claim as yours."
      : "You trust your own plan long after sensible people begin screaming.",
    threat: archetype.score > 20 ? "HIGH" : "MODERATE"
  };
}

async function allocateNumber() {
  const response = await fetch("/.netlify/functions/allocate-crawler-number", {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !Number.isInteger(data.crawlerNumber)) {
    throw new Error(data.error || "The Dungeon failed to allocate a number.");
  }

  return data.crawlerNumber;
}

function reaction(answer) {
  const scores = scoreAnswers({ answer });
  const top = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([key]) => key);

  const rejectedChoice =
    /both|another way|instead|convince|negotiate|after that|then i/.test(answer.toLowerCase());

  const line = rejectedChoice
    ? "ERROR: SUBJECT HAS ONCE AGAIN REFUSED TO RESPECT THE WRITER'S FALSE CHOICE. Management is irritated. The audience is interested."
    : "Response recorded. The audience has begun making irresponsible financial decisions based on your survival odds.";

  return { line, tags: top };
}

function render() {
  if (state.step === "welcome") return renderWelcome();
  if (state.step === "quiz") return renderQuiz();
  return renderReveal();
}

function renderWelcome() {
  app.innerHTML = `
    <section class="panel welcome">
      <div class="warning-strip"><span>Mandatory Dungeon Processing</span></div>
      <p class="eyebrow">Survival Classification Division</p>
      <div class="stamp">Property of the Dungeon</div>

      <h1>CRAWLER<br><span>INTAKE</span></h1>

      <p class="lede">
        Your former life has been successfully converted into entertainment.
        Complete the assessment. Receive one permanent crawler number from
        1 to 13,000,000. Try not to embarrass your species.
      </p>

      <label>
        Crawler designation
        <input id="name" placeholder="Enter crawler name" maxlength="40" autocomplete="nickname">
      </label>

      <button id="begin" disabled>Enter the Dungeon</button>

      <small>
        Unofficial fan-made personality generator inspired by LitRPG dungeon-crawl fiction.
        Not affiliated with or endorsed by any author, publisher, or rights holder.
      </small>
    </section>
  `;

  const input = document.querySelector("#name");
  const button = document.querySelector("#begin");

  input.addEventListener("input", () => {
    button.disabled = !input.value.trim();
  });

  input.addEventListener("keydown", event => {
    if (event.key === "Enter" && input.value.trim()) begin(input.value);
  });

  button.addEventListener("click", () => begin(input.value));
}

function begin(name) {
  state.name = name.trim();
  state.step = "quiz";
  render();
}

function renderQuiz() {
  const current = QUESTIONS[state.question];
  const progress = ((state.question + 1) / QUESTIONS.length) * 100;

  app.innerHTML = `
    <section class="panel quiz">
      <div class="warning-strip"><span>Psychological Hazard Assessment</span></div>

      <div class="progress-frame">
        <div class="progress">
          <span style="width:${progress}%"></span>
        </div>
      </div>

      <p class="eyebrow">Assessment ${state.question + 1} of ${QUESTIONS.length}</p>
      <h2>${escapeHtml(current.prompt)}</h2>

      <textarea id="answer" placeholder="The Dungeon AI is listening..." rows="8"></textarea>

      <div id="reaction"></div>

      <div class="ai-note">
        <strong>SYSTEM NOTE:</strong> Attempts to reject the available choices will be recorded.
        Unfortunately for management, they may also be rewarded.
      </div>

      <button id="submit" disabled>
        ${state.question === QUESTIONS.length - 1 ? "Complete Assessment" : "Submit Response"}
      </button>
    </section>
  `;

  const answer = document.querySelector("#answer");
  const button = document.querySelector("#submit");

  answer.addEventListener("input", () => {
    button.disabled = !answer.value.trim();
  });

  button.addEventListener("click", () => submit(current.id, answer.value, button));
}

async function submit(id, value, button) {
  state.answers[id] = value.trim();

  const result = reaction(value);
  document.querySelector("#reaction").innerHTML = `
    <div class="reaction">
      <b>DUNGEON AI:</b> ${result.line}
      <div class="tag-row">
        ${result.tags.map(tag => `<span class="tag">${tag.toUpperCase()} DETECTED</span>`).join("")}
      </div>
    </div>
  `;

  button.disabled = true;

  if (state.question < QUESTIONS.length - 1) {
    setTimeout(() => {
      state.question += 1;
      render();
    }, 700);
    return;
  }

  button.textContent = "Assigning Permanent Crawler Number...";

  try {
    const crawlerNumber = await allocateNumber();
    state.profile = buildProfile(state.name, state.answers, crawlerNumber);
    state.step = "reveal";
    render();
  } catch (error) {
    button.disabled = false;
    button.textContent = "Retry Number Assignment";

    document.querySelector("#reaction").innerHTML += `
      <div class="error-banner">
        ${escapeHtml(error.message)} Check the Netlify environment variables and function deployment, then retry.
      </div>
    `;
  }
}

function traitText(trait) {
  const descriptions = {
    "False Choice": "You instinctively notice options the Dungeon hoped you would ignore.",
    "Monster Whisperer": "Hostile creatures hesitate before deciding whether you are food, friend, or management.",
    "Threat Reader": "You notice behavioral tells and shifting danger before most crawlers understand they are in trouble.",
    "Pressure Tested": "Stress sharpens your priorities instead of erasing them.",
    "Better Offer": "You gain leverage by understanding what others need.",
    "Adaptive Mind": "New information becomes a weapon faster than management considers healthy."
  };

  return descriptions[trait] || "Management has declined to explain this trait.";
}

function renderReveal() {
  const profile = state.profile;

  app.innerHTML = `
    <section class="reveal-wrap">
      <div class="card" id="crawler-card">
        <div class="warning-strip"><span>Official Crawler Dossier</span></div>

        <header>
          <div>
            <p class="eyebrow">Dungeon Registration Complete</p>
            <h2>${escapeHtml(profile.name)}</h2>
            <h3>“${profile.title}”</h3>
          </div>

          <div class="number">
            <span>Crawler</span>
            <strong>#${profile.crawlerNumber.toLocaleString()}</strong>
          </div>
        </header>

        <div class="classification">
          <b>${profile.type}</b>
          <span>${profile.alignment}</span>
          <em>Threat: ${profile.threat}</em>
        </div>

        <div class="grid">
          <section>
            <h4>Attributes</h4>
            ${Object.entries(profile.stats).map(([name, value]) => `
              <div class="stat">
                <span>${name}</span>
                <b>${value}</b>
              </div>
            `).join("")}
          </section>

          <section>
            <h4>Starting Traits</h4>
            ${profile.traits.map(trait => `
              <div class="trait">
                <b>${trait}</b>
                <p>${traitText(trait)}</p>
              </div>
            `).join("")}
          </section>
        </div>

        <div class="path">
          <div>
            <span>Race Affinity</span>
            <b>${profile.race}</b>
          </div>
          <div>
            <span>Class Candidate</span>
            <b>${profile.className}</b>
          </div>
        </div>

        <blockquote>${profile.quote}</blockquote>

        <div class="weakness">
          <b>Exploitable Flaw:</b> ${profile.weakness}
        </div>

        <footer>
          PROPERTY OF THE DUNGEON • CRAWLER NUMBER PERMANENT • DO NOT DUPLICATE
        </footer>
      </div>

      <div class="actions">
        <button id="download">Download Crawler Card</button>
        <button class="secondary" id="again">Create Another</button>
      </div>
    </section>
  `;

  document.querySelector("#download").addEventListener("click", downloadCard);
  document.querySelector("#again").addEventListener("click", () => location.reload());
}

async function downloadCard() {
  const card = document.querySelector("#crawler-card");

  if (!window.html2canvas) {
    alert("Image export library did not load. Check your connection and try again.");
    return;
  }

  const canvas = await window.html2canvas(card, {
    scale: 2,
    backgroundColor: "#eee2c8",
    useCORS: true
  });

  const link = document.createElement("a");
  link.download =
    `${state.profile.name.replace(/\s+/g, "-").toLowerCase()}-crawler-${state.profile.crawlerNumber}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

render();
