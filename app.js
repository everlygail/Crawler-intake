const QUESTIONS = [
  {
    id: "creature",
    prompt: "A dangerous creature is trapped beneath rubble. A child is being chased nearby. What do you do first, and why?",
    intro: "Compassion under pressure. How adorable. Let us determine whether yours is useful or merely expensive."
  },
  {
    id: "loot",
    prompt: "You and a stranger find one life-saving item. The stranger insists they need it more. What happens next?",
    intro: "Resource conflict detected. Please reveal how quickly civilization leaves your body."
  },
  {
    id: "curse",
    prompt: "Choose a permanent price for extraordinary power: pain, lost memories, unwanted truth, or refusal. Explain your choice.",
    intro: "Every crawler claims to have principles until the reward begins glowing."
  },
  {
    id: "betrayal",
    prompt: "A trusted party member betrays you, but their information could still save the group. What do you do?",
    intro: "Betrayal protocol. Excellent. The audience loves unresolved attachment wounds."
  },
  {
    id: "boss",
    prompt: "The final boss is stronger than your entire party. You have one hour before combat. How do you prepare?",
    intro: "Your survival odds are insulting. Improve them."
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
  step: "boot",
  name: "",
  question: 0,
  answers: {},
  profile: null,
  reactionReady: false
};

const app = document.querySelector("#app");
const flash = document.querySelector("#flash");
const soundToggle = document.querySelector("#sound-toggle");

let audioContext = null;
let masterGain = null;
let ambienceNodes = [];
let soundOn = false;
let typingToken = 0;

const escapeHtml = (value = "") =>
  value.replace(/[&<>'"]/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  })[char]);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function triggerFlash() {
  flash.classList.remove("active");
  void flash.offsetWidth;
  flash.classList.add("active");
}

function glitch() {
  app.classList.remove("glitching");
  void app.offsetWidth;
  app.classList.add("glitching");
}

function showToast(text) {
  let toast = document.querySelector(".system-toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.className = "system-toast";
    document.body.appendChild(toast);
  }

  toast.textContent = text;
  toast.classList.add("show");

  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => toast.classList.remove("show"), 2600);
}

function ensureAudio() {
  if (audioContext) return;

  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = audioContext.createGain();
  masterGain.gain.value = .06;
  masterGain.connect(audioContext.destination);
}

function startAmbience() {
  ensureAudio();
  audioContext.resume();

  if (ambienceNodes.length) return;

  const hum = audioContext.createOscillator();
  const humGain = audioContext.createGain();
  hum.type = "sine";
  hum.frequency.value = 48;
  humGain.gain.value = .45;
  hum.connect(humGain).connect(masterGain);
  hum.start();

  const overtone = audioContext.createOscillator();
  const overtoneGain = audioContext.createGain();
  overtone.type = "triangle";
  overtone.frequency.value = 96;
  overtoneGain.gain.value = .12;
  overtone.connect(overtoneGain).connect(masterGain);
  overtone.start();

  const wobble = audioContext.createOscillator();
  const wobbleGain = audioContext.createGain();
  wobble.frequency.value = .13;
  wobbleGain.gain.value = 4;
  wobble.connect(wobbleGain).connect(hum.frequency);
  wobble.start();

  ambienceNodes = [hum, overtone, wobble];
}

function stopAmbience() {
  ambienceNodes.forEach(node => {
    try { node.stop(); } catch {}
  });
  ambienceNodes = [];
}

function beep(frequency = 180, duration = .08, volume = .16) {
  if (!soundOn) return;

  ensureAudio();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = "square";
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(volume, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + duration);

  oscillator.connect(gain).connect(masterGain);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}

function alarmBurst() {
  if (!soundOn) return;
  [0, 160, 320].forEach((delay, index) => {
    setTimeout(() => beep(index % 2 ? 460 : 330, .13, .25), delay);
  });
}

soundToggle.addEventListener("click", () => {
  soundOn = !soundOn;
  soundToggle.textContent = soundOn ? "SOUND: ON" : "SOUND: OFF";
  soundToggle.classList.toggle("on", soundOn);

  if (soundOn) {
    startAmbience();
    beep(520, .08, .15);
    showToast("AMBIENCE ENABLED. HEADPHONES RECOMMENDED.");
  } else {
    stopAmbience();
    showToast("AMBIENCE DISABLED.");
  }
});

async function typeText(element, text, speed = 24) {
  const token = ++typingToken;
  element.textContent = "";

  for (let index = 0; index < text.length; index += 1) {
    if (token !== typingToken) return;
    element.textContent += text[index];

    if (/[.!?]/.test(text[index])) {
      await sleep(speed * 4);
    } else {
      await sleep(speed + Math.random() * speed * .5);
    }
  }
}

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
    ? "ERROR: SUBJECT HAS REFUSED TO RESPECT THE PROVIDED CHOICES. Management is irritated. The audience is interested."
    : "Response recorded. The audience has begun making irresponsible financial decisions based on your survival odds.";

  return { line, tags: top };
}

function render() {
  if (state.step === "boot") return renderBoot();
  if (state.step === "welcome") return renderWelcome();
  if (state.step === "quiz") return renderQuiz();
  if (state.step === "reveal-loading") return renderRevealLoading();
  return renderReveal();
}

async function renderBoot() {
  app.innerHTML = `
    <section class="boot-screen">
      <div class="boot-terminal">
        <h1 class="boot-logo">SIGNAL<br>OVERRIDE</h1>
        <div class="boot-lines" id="boot-lines"></div>
        <div class="boot-action" id="boot-action">
          <button id="continue-boot">Acknowledge Processing</button>
        </div>
      </div>
    </section>
  `;

  const lines = [
    ["system", "Connecting to local device..."],
    ["system", "Identity services unavailable."],
    ["warning", "Atmospheric integrity: FAILED"],
    ["warning", "Surface civilization: DISCONTINUED"],
    ["danger", "UNREGISTERED CRAWLER DETECTED"],
    ["system", "Launching mandatory intake protocol."]
  ];

  const holder = document.querySelector("#boot-lines");

  for (const [kind, text] of lines) {
    const line = document.createElement("p");
    line.className = `boot-line ${kind}`;
    holder.appendChild(line);
    await typeText(line, `> ${text}`, kind === "danger" ? 18 : 25);
    beep(kind === "danger" ? 330 : 160, .045, .1);
    await sleep(kind === "danger" ? 270 : 130);
  }

  const cursor = document.createElement("span");
  cursor.className = "cursor";
  holder.appendChild(cursor);

  document.querySelector("#boot-action").classList.add("ready");
  document.querySelector("#continue-boot").addEventListener("click", () => {
    beep(620, .12, .2);
    triggerFlash();
    glitch();

    setTimeout(() => {
      state.step = "welcome";
      render();
    }, 240);
  });
}

function renderWelcome() {
  app.innerHTML = `
    <section class="panel welcome question-arrival">
      <div class="warning-strip"><span>Mandatory Dungeon Processing</span></div>
      <p class="eyebrow">Survival Classification Division</p>
      <div class="stamp">Property of the Dungeon</div>

      <h1>CRAWLER<br><span>INTAKE</span></h1>

      <div class="ai-speaker">
        <div class="ai-icon">AI</div>
        <div class="ai-copy" id="welcome-ai"></div>
      </div>

      <p class="lede">
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

  typeText(
    document.querySelector("#welcome-ai"),
    "Your former life has been successfully converted into entertainment. Please provide a designation. Names with tragic backstories test well.",
    18
  );

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
  triggerFlash();
  beep(240, .08, .15);
  render();
}

function renderQuiz() {
  state.reactionReady = false;
  const current = QUESTIONS[state.question];
  const progress = ((state.question + 1) / QUESTIONS.length) * 100;

  app.innerHTML = `
    <section class="panel quiz question-arrival">
      <div class="warning-strip"><span>Psychological Hazard Assessment</span></div>

      <div class="progress-frame">
        <div class="progress">
          <span style="width:${progress}%"></span>
        </div>
      </div>

      <p class="eyebrow">Assessment ${state.question + 1} of ${QUESTIONS.length}</p>

      <div class="ai-speaker">
        <div class="ai-icon">AI</div>
        <div class="ai-copy" id="question-ai"></div>
      </div>

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

  typeText(document.querySelector("#question-ai"), current.intro, 18);

  const answer = document.querySelector("#answer");
  const button = document.querySelector("#submit");

  answer.addEventListener("input", () => {
    button.disabled = !answer.value.trim();
  });

  button.addEventListener("click", () => submit(current.id, answer.value, button));
}

async function submit(id, value, button) {
  state.answers[id] = value.trim();
  button.disabled = true;

  const result = reaction(value);
  document.querySelector("#reaction").innerHTML = `
    <div class="reaction">
      <b>DUNGEON AI:</b>
      <span id="reaction-copy"></span>
      <div class="tag-row">
        ${result.tags.map(tag => `<span class="tag">${tag.toUpperCase()} DETECTED</span>`).join("")}
      </div>
    </div>
  `;

  beep(200, .06, .16);
  await typeText(document.querySelector("#reaction-copy"), ` ${result.line}`, 15);

  if (state.question < QUESTIONS.length - 1) {
    button.textContent = "Response Recorded";
    await sleep(720);
    triggerFlash();
    state.question += 1;
    render();
    return;
  }

  button.textContent = "Assigning Permanent Crawler Number...";

  try {
    const crawlerNumber = await allocateNumber();
    state.profile = buildProfile(state.name, state.answers, crawlerNumber);
    state.step = "reveal-loading";
    alarmBurst();
    triggerFlash();
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

function renderRevealLoading() {
  app.innerHTML = `
    <section class="reveal-stage">
      <div class="reveal-overlay">
        <div class="reveal-sequence">
          <h2>PROCESSING</h2>
          <p id="reveal-status">Compiling psychological liabilities...</p>
          <div class="reveal-meter"><span></span></div>
        </div>
      </div>
    </section>
  `;

  const statuses = [
    "Compiling psychological liabilities...",
    "Estimating entertainment value...",
    "Calculating probable cause of death...",
    "Assigning permanent crawler identity..."
  ];

  const status = document.querySelector("#reveal-status");

  statuses.forEach((text, index) => {
    setTimeout(() => {
      status.textContent = text;
      beep(170 + index * 55, .08, .13);
    }, index * 560);
  });

  setTimeout(() => {
    triggerFlash();
    state.step = "reveal";
    render();
  }, 2450);
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
      <div class="card revealed" id="crawler-card">
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

  alarmBurst();
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
