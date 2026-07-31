const app = document.querySelector("#app");
const saved = JSON.parse(localStorage.getItem("dungeonPlayer") || "null");

const state = {
  code: saved?.code || "",
  number: saved?.num || "",
  player: null,
  campaign: null,
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
  const response = await fetch("/.netlify/functions/game-api", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...payload })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Dungeon connection failed.");
  return data;
}

function stopPolling() {
  if (state.timer) clearInterval(state.timer);
  state.timer = null;
}

function startPolling() {
  stopPolling();
  refresh();
  state.timer = setInterval(refresh, 3000);
}

function renderJoin(error = "") {
  stopPolling();
  app.innerHTML = `
    <section class="panel">
      <h1>JOIN THE<br><span>DUNGEON</span></h1>
      ${error ? `<p>${escapeHtml(error)}</p>` : ""}
      <label>Campaign code<input id="campaign-code" value="${escapeHtml(state.code)}"></label>
      <label>Crawler number<input id="crawler-number" inputmode="numeric" value="${escapeHtml(state.number)}"></label>
      <button id="join-game">Connect Crawler</button>
    </section>`;

  const button = document.querySelector("#join-game");
  button.addEventListener("click", async () => {
    const code = document.querySelector("#campaign-code").value.trim().toUpperCase();
    const number = Number(document.querySelector("#crawler-number").value.replace(/\D/g, ""));
    if (!code || !number) return;
    button.disabled = true;

    try {
      const data = await api("join", { campaignCode: code, crawlerNumber: number });
      Object.assign(state, {
        code,
        number,
        player: data.player,
        campaign: data.campaign,
        event: data.event
      });
      localStorage.setItem("dungeonPlayer", JSON.stringify({ code, num: number }));
      render();
      startPolling();
    } catch (error) {
      renderJoin(error.message);
    }
  });
}

async function refresh() {
  try {
    const data = await api("state", {
      campaignCode: state.code,
      crawlerNumber: Number(state.number)
    });
    Object.assign(state, {
      player: data.player,
      campaign: data.campaign,
      event: data.event
    });
    render();
  } catch (error) {
    renderJoin(error.message);
  }
}

function header() {
  const hp = state.player?.hp || 0;
  const max = state.player?.max_hp || 1;
  return `<div class="status"><div><div class="num">Crawler #${Number(state.number).toLocaleString()}</div><b>${escapeHtml(state.player?.crawler_name || "Connecting")}</b></div><div class="hp">HP ${hp}/${max}<div class="bar"><i style="width:${Math.max(0, Math.min(100, hp / max * 100))}%"></i></div></div></div>`;
}

function render() {
  if (!state.player || !state.campaign) {
    app.innerHTML = `<section class="panel waiting"><h2>CONNECTING</h2><div class="pulse"></div></section>`;
    return;
  }

  let body;
  if (state.campaign.status === "waiting" && !state.event) {
    body = `<section class="panel waiting"><h2>WAITING ROOM</h2><p>Campaign <b>${escapeHtml(state.code)}</b></p><div class="pulse"></div><div class="party">${(state.campaign.players || []).map(player => `<div><span>${escapeHtml(player.crawler_name)}</span><b>#${player.crawler_number}</b></div>`).join("")}</div></section>`;
  } else if (!state.event) {
    body = `<section class="panel waiting"><h2>WAITING FOR THE DUNGEON</h2><div class="pulse"></div></section>`;
  } else {
    body = renderEvent(state.event);
  }

  app.innerHTML = header() + body;
  wireEvent(state.event);
}

function renderEvent(event) {
  const payload = event.payload || {};
  if (event.type === "broadcast") return `<section class="panel"><div class="broadcast"><b>ATTENTION, CRAWLERS</b><h2>${escapeHtml(payload.title)}</h2><p>${escapeHtml(payload.text)}</p></div></section>`;
  if (event.type === "narration") return `<section class="panel"><h2>${escapeHtml(payload.title)}</h2><p>${escapeHtml(payload.text)}</p></section>`;
  if (event.type === "choice") {
    const vote = payload.votes?.[String(state.number)];
    return `<section class="panel"><h2>${escapeHtml(payload.title)}</h2><p>${escapeHtml(payload.text)}</p><div class="choices">${(payload.options || []).map((option, index) => `<button class="${Number(vote) === index ? "sel" : ""}" data-choice="${index}">${String.fromCharCode(65 + index)}. ${escapeHtml(option)}</button>`).join("")}</div></section>`;
  }
  if (event.type === "check") {
    const result = payload.results?.[String(state.number)];
    return `<section class="panel"><h2>${escapeHtml(payload.title)}</h2><p>${escapeHtml(payload.text)}</p>${result ? `<div class="result"><span>${escapeHtml(result.stat)} Check</span><strong>${result.total}</strong><p>${result.success ? "SUCCESS" : "FAILURE"}</p></div>` : `<button id="roll-check">Roll ${escapeHtml(payload.stat)}</button>`}</section>`;
  }
  if (event.type === "combat") {
    const enemy = payload.enemy || {};
    return `<section class="panel"><h2>${escapeHtml(enemy.name)}</h2><p>${escapeHtml(enemy.description)}</p><div class="card">Enemy HP ${enemy.hp}/${enemy.maxHp}</div>${state.player.hp > 0 && enemy.hp > 0 ? `<div class="combat"><button data-action="attack">Attack</button><button class="alt" data-action="defend">Defend</button><button data-action="ability">Class Ability</button><button class="alt" data-action="improvise">Improvise</button></div>` : ""}<div class="log">${(payload.log || []).slice(-12).reverse().map(line => `<p>${escapeHtml(line)}</p>`).join("")}</div></section>`;
  }
  if (event.type === "loot") {
    const claimed = (payload.claimedBy || []).includes(Number(state.number));
    return `<section class="panel"><h2>${escapeHtml(payload.title)}</h2><div class="loot"><span>${escapeHtml(payload.rarity)}</span><strong>${escapeHtml(payload.item?.name)}</strong><p>${escapeHtml(payload.item?.description)}</p></div>${claimed ? "<p>ITEM ADDED TO INVENTORY</p>" : `<button id="claim-loot">Claim Loot</button>`}</section>`;
  }
  return `<section class="panel"><div class="broadcast"><b>FLOOR COMPLETE</b><h2>${escapeHtml(payload.title)}</h2><p>${escapeHtml(payload.text)}</p></div></section>`;
}

function wireEvent(event) {
  if (!event) return;
  document.querySelectorAll("[data-choice]").forEach(button => {
    button.addEventListener("click", async () => {
      button.disabled = true;
      await api("vote", { campaignCode: state.code, crawlerNumber: Number(state.number), eventId: event.id, choice: Number(button.dataset.choice) });
      await refresh();
    });
  });

  const rollButton = document.querySelector("#roll-check");
  if (rollButton) rollButton.addEventListener("click", async () => {
    rollButton.disabled = true;
    await api("roll", { campaignCode: state.code, crawlerNumber: Number(state.number), eventId: event.id });
    await refresh();
  });

  document.querySelectorAll("[data-action]").forEach(button => {
    button.addEventListener("click", async () => {
      button.disabled = true;
      await api("act", { campaignCode: state.code, crawlerNumber: Number(state.number), eventId: event.id, actionType: button.dataset.action });
      await refresh();
    });
  });

  const claimButton = document.querySelector("#claim-loot");
  if (claimButton) claimButton.addEventListener("click", async () => {
    claimButton.disabled = true;
    await api("claim", { campaignCode: state.code, crawlerNumber: Number(state.number), eventId: event.id });
    await refresh();
  });
}

if (state.code && state.number) startPolling(); else renderJoin();
