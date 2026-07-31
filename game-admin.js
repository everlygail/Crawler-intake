const app = document.querySelector("#app");

const state = {
  key: sessionStorage.getItem("dungeonos_admin_key") || "",
  campaign: null,
  campaigns: [],
  event: null,
  timer: null
};

const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

async function api(action, payload = {}) {
  const response = await fetch("/.netlify/functions/game-admin-api", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Dungeon-Admin-Key": state.key
    },
    body: JSON.stringify({ action, ...payload })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Administrator action failed.");
  return data;
}

function stopPolling() {
  if (state.timer) clearInterval(state.timer);
  state.timer = null;
}

function startPolling() {
  stopPolling();
  state.timer = setInterval(refresh, 3000);
}

function renderLogin(error = "") {
  stopPolling();
  app.innerHTML = `
    <section class="panel login">
      <h1>GAME MASTER<br>CONSOLE</h1>
      ${error ? `<p>${escapeHtml(error)}</p>` : ""}
      <input id="admin-key" type="password" placeholder="Administrator key">
      <button id="authorize">Authorize</button>
    </section>`;

  const input = document.querySelector("#admin-key");
  const button = document.querySelector("#authorize");

  button.addEventListener("click", async () => {
    const key = input.value.trim();
    if (!key) return;
    button.disabled = true;

    try {
      state.key = key;
      await api("status");
      sessionStorage.setItem("dungeonos_admin_key", key);
      await refresh();
      startPolling();
    } catch (error) {
      state.key = "";
      renderLogin(error.message);
    }
  });
}

async function refresh() {
  try {
    const data = await api("dashboard", {
      campaignCode: state.campaign?.code
    });

    state.campaigns = data.campaigns || state.campaigns;
    if (data.campaign) state.campaign = data.campaign;
    if (data.event !== undefined) state.event = data.event;
    render();
  } catch (error) {
    console.error(error);
  }
}

function page(content) {
  app.innerHTML = `
    <header class="top">
      <div class="logo">DUNGEON<span>OS</span></div>
      <b>GAME MASTER</b>
    </header>
    ${content}`;
}

function render() {
  if (!state.key) return renderLogin();
  if (!state.campaign) return renderLobby();
  renderCampaign();
}

function renderLobby() {
  page(`
    <section class="panel">
      <h1>CREATE<br>CAMPAIGN</h1>
      <input id="campaign-name" value="Tutorial Guild">
      <button id="create-game">Create Game Night</button>
    </section>

    <section class="panel">
      <h2>Existing Campaigns</h2>
      ${state.campaigns.length
        ? state.campaigns.map(campaign => `
            <div class="campaign" data-code="${escapeHtml(campaign.code)}">
              <div class="code">${escapeHtml(campaign.code)}</div>
              ${escapeHtml(campaign.name)}
            </div>`).join("")
        : "<p>None yet.</p>"}
    </section>`);

  const createButton = document.querySelector("#create-game");
  const nameInput = document.querySelector("#campaign-name");

  createButton.addEventListener("click", async () => {
    createButton.disabled = true;
    createButton.textContent = "Creating...";

    try {
      const data = await api("create", {
        name: nameInput.value.trim() || "Tutorial Guild"
      });
      state.campaign = data.campaign;
      state.event = null;
      render();
    } catch (error) {
      createButton.disabled = false;
      createButton.textContent = "Create Game Night";
      alert(error.message);
    }
  });

  document.querySelectorAll("[data-code]").forEach(card => {
    card.addEventListener("click", async () => {
      const data = await api("dashboard", {
        campaignCode: card.dataset.code
      });
      state.campaign = data.campaign;
      state.event = data.event;
      render();
    });
  });
}

function renderCampaign() {
  const campaign = state.campaign;
  const currentEvent = state.event;

  page(`
    <div class="grid">
      <aside>
        <section class="panel">
          <h3>Campaign</h3>
          <div class="code">${escapeHtml(campaign.code)}</div>
          <b>${escapeHtml(campaign.name)}</b>
          <p>Floor ${campaign.floor} • ${escapeHtml(campaign.status)}</p>
          <button id="copy-link">Copy Player Link</button>
          <button class="alt" id="campaign-list">Campaign List</button>
        </section>

        <section class="panel">
          <h3>Crawlers</h3>
          <div class="party">
            ${(campaign.players || []).length
              ? campaign.players.map(player => `
                  <div>
                    ${escapeHtml(player.crawler_name)}
                    <b>${player.hp}/${player.max_hp} HP</b>
                  </div>`).join("")
              : "Waiting..."}
          </div>
        </section>
      </aside>

      <section>
        <section class="panel">
          <h2>Live Control</h2>
          <div class="controls">
            <button id="begin-floor">Begin Floor</button>
            <button class="alt" id="heal-party">Heal Party</button>
            <button id="enemy-turn">Enemy Turn</button>
          </div>
        </section>

        <section class="panel">
          <h2>Current Event</h2>
          ${currentEvent
            ? `<div class="event">
                <h3>${escapeHtml(currentEvent.payload?.title || currentEvent.payload?.enemy?.name || currentEvent.type)}</h3>
                <p>${escapeHtml(currentEvent.payload?.text || currentEvent.payload?.enemy?.description || "")}</p>
              </div>`
            : "<p>No active event.</p>"}
        </section>

        <section class="panel">
          <h2>Tutorial Floor</h2>
          <div class="script">${renderSteps(campaign.script_step || 0)}</div>
        </section>
      </section>
    </div>`);

  document.querySelector("#copy-link").addEventListener("click", async () => {
    await navigator.clipboard.writeText(`${location.origin}/play`);
    alert(`Player link copied. Campaign code: ${campaign.code}`);
  });

  document.querySelector("#campaign-list").addEventListener("click", () => {
    state.campaign = null;
    state.event = null;
    render();
  });

  document.querySelector("#begin-floor").addEventListener("click", () => runStep(0));

  document.querySelector("#heal-party").addEventListener("click", async () => {
    await api("heal", { campaignCode: campaign.code });
    await refresh();
  });

  document.querySelector("#enemy-turn").addEventListener("click", async () => {
    if (!currentEvent) return;
    await api("enemy", {
      campaignCode: campaign.code,
      eventId: currentEvent.id
    });
    await refresh();
  });

  document.querySelectorAll("[data-step]").forEach(button => {
    button.addEventListener("click", () => runStep(Number(button.dataset.step)));
  });
}

const STEPS = [
  "Floor One Initialization",
  "The Crushed Station",
  "Choose the First Door",
  "The Tripwire Hall",
  "The Nursery of Teeth",
  "Boss: Customer Service Representative",
  "The Complaint Box",
  "Floor One Complete"
];

function renderSteps(completed) {
  return STEPS.map((title, index) => `
    <div class="step">
      <b>${index + 1}</b>
      <span>${escapeHtml(title)}</span>
      <button data-step="${index}" ${index < completed ? "disabled" : ""}>Run</button>
    </div>`).join("");
}

async function runStep(step) {
  try {
    const data = await api("step", {
      campaignCode: state.campaign.code,
      step
    });
    state.campaign = data.campaign;
    state.event = data.event;
    render();
  } catch (error) {
    alert(error.message);
  }
}

if (state.key) {
  refresh().then(startPolling);
} else {
  renderLogin();
}
