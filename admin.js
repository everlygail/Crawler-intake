const app=document.querySelector("#admin-app");
const state={key:sessionStorage.getItem("dungeonos_admin_key")||"",crawlers:[],loading:false,query:""};
const escapeHtml = (value = "") =>
  String(value).replace(/[&<>'"]/g, char => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;"
    };
    return entities[char];
  });

async function adminApi(action="list",extra={}){
  const params=new URLSearchParams({action,...extra});
  const response=await fetch(`/.netlify/functions/admin-api?${params}`,{headers:{"X-Dungeon-Admin-Key":state.key}});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(data.error||"Administrator request failed.");
  return data;
}

function render(){if(!state.key)return renderLogin();renderConsole();}

function renderLogin(error=""){
  app.innerHTML=`<section class="shell"><header class="topbar"><div class="brand">DUNGEON<span>OS</span></div><div class="status">Administrator Access Required</div></header>
  <section class="login-panel"><h1>Administrator Console</h1><p>Enter the private administrator key stored in Netlify. It remains only in this browser session.</p>
  ${error?`<div class="error">${escapeHtml(error)}</div>`:""}
  <label>Administrator key<input id="admin-key" type="password" autocomplete="current-password"></label>
  <button id="login">Authorize Console</button></section></section>`;
  const input=document.querySelector("#admin-key"),button=document.querySelector("#login");
  button.addEventListener("click",async()=>{
    const key=input.value.trim();if(!key)return;button.disabled=true;
    try{state.key=key;await adminApi("status");sessionStorage.setItem("dungeonos_admin_key",key);renderConsole();}
    catch(error){state.key="";button.disabled=false;renderLogin(error.message);}
  });
}

async function loadCrawlers(){
  state.loading=true;renderCrawlerContent();
  try{const data=await adminApi("list",{limit:"100"});state.crawlers=data.crawlers||[];}
  catch(error){
    if(error.message.toLowerCase().includes("unauthorized")){sessionStorage.removeItem("dungeonos_admin_key");state.key="";return renderLogin("Administrator key was rejected.");}
    const holder=document.querySelector("#crawler-content");if(holder)holder.innerHTML=`<div class="error">${escapeHtml(error.message)}</div>`;
    state.loading=false;return;
  }
  state.loading=false;renderCrawlerContent();
}

function filteredCrawlers(){
  const query=state.query.trim().toLowerCase();if(!query)return state.crawlers;
  return state.crawlers.filter(crawler=>{
    const profile=crawler.profile||{};
    return [crawler.crawler_number,crawler.crawler_name,profile.title,profile.race,profile.className]
      .some(value=>String(value??"").toLowerCase().includes(query));
  });
}

function renderConsole(){
  app.innerHTML=`<section class="shell"><header class="topbar"><div class="brand">DUNGEON<span>OS</span></div><div class="status">Administrator Connected</div></header>
  <div class="dashboard-grid"><aside class="sidebar"><h2>Modules</h2><button class="nav-button">Crawlers</button>
  <button class="nav-button inactive" disabled>Broadcast</button><button class="nav-button inactive" disabled>Campaign</button>
  <button class="nav-button inactive" disabled>Inventory</button><button class="nav-button inactive" disabled>Encounters</button><button class="nav-button inactive" disabled>Sponsors</button></aside>
  <section class="console-panel"><header class="console-header"><h2>Crawler Database</h2></header>
  <div class="toolbar"><input id="crawler-search" placeholder="Search number, name, title, race, or class"><button class="dark" id="refresh">Refresh Registry</button></div>
  <div id="crawler-content"></div></section></div></section>`;
  document.querySelector("#crawler-search").addEventListener("input",event=>{state.query=event.target.value;renderCrawlerContent();});
  document.querySelector("#refresh").addEventListener("click",loadCrawlers);
  loadCrawlers();
}

function renderCrawlerContent(){
  const holder=document.querySelector("#crawler-content");if(!holder)return;
  if(state.loading){holder.innerHTML=`<div class="empty">Retrieving permanent crawler registry...</div>`;return;}
  const crawlers=filteredCrawlers();
  const averageThreat=crawlers.length?Math.round(crawlers.reduce((sum,crawler)=>sum+Number(crawler.profile?.metrics?.threat||0),0)/crawlers.length):0;
  const rareCount=crawlers.filter(crawler=>crawler.profile?.rareEnding).length;
  holder.innerHTML=`<div class="stats-row"><div class="stat-card"><span>Registered Crawlers</span><b>${state.crawlers.length}</b></div>
  <div class="stat-card"><span>Visible Results</span><b>${crawlers.length}</b></div><div class="stat-card"><span>Average Threat</span><b>${averageThreat}</b></div>
  <div class="stat-card"><span>Rare Outcomes</span><b>${rareCount}</b></div></div>
  <div class="crawler-list">${crawlers.length?crawlers.map(crawler=>{const profile=crawler.profile||{};return `<article class="crawler-row">
  <div class="crawler-number">#${Number(crawler.crawler_number).toLocaleString()}</div><div class="crawler-name">${escapeHtml(crawler.crawler_name)}
  <small>${escapeHtml(profile.title||"Unclassified")} • ${escapeHtml(profile.race||"Unknown Race")} • ${escapeHtml(profile.className||"Unknown Class")}</small></div>
  <span class="badge">Threat ${escapeHtml(profile.metrics?.threat??"?")}</span><button class="secondary view-crawler" data-number="${crawler.crawler_number}">Open</button></article>`;}).join(""):`<div class="empty">No crawlers match this search.</div>`}</div>`;
  holder.querySelectorAll(".view-crawler").forEach(button=>button.addEventListener("click",()=>openCrawler(button.dataset.number)));
}

function openCrawler(number){
  const crawler=state.crawlers.find(item=>String(item.crawler_number)===String(number));if(!crawler)return;
  const profile=crawler.profile||{},modal=document.createElement("div");modal.className="modal-backdrop";
  modal.innerHTML=`<section class="modal"><p class="status">Permanent Crawler Dossier</p><h2>${escapeHtml(crawler.crawler_name)}</h2>
  <p>Crawler #${Number(crawler.crawler_number).toLocaleString()} • “${escapeHtml(profile.title||"Unclassified")}”</p>
  <div class="modal-grid"><div class="modal-card"><span>Race</span><b>${escapeHtml(profile.race||"Unknown")}</b></div>
  <div class="modal-card"><span>Class</span><b>${escapeHtml(profile.className||"Unknown")}</b></div>
  <div class="modal-card"><span>Survival Odds</span><b>${escapeHtml(profile.metrics?.survival??"?")}%</b></div>
  <div class="modal-card"><span>Threat Index</span><b>${escapeHtml(profile.metrics?.threat??"?")}</b></div></div>
  <p>${escapeHtml(profile.personality||"No psychological summary stored.")}</p>
  <div class="modal-actions"><button id="public-dossier">Open Public Dossier</button><button class="dark" id="close-modal">Close Console Window</button></div></section>`;
  document.body.appendChild(modal);
  modal.querySelector("#public-dossier").addEventListener("click",()=>window.open(`/crawler/${crawler.crawler_number}`,"_blank"));
  modal.querySelector("#close-modal").addEventListener("click",()=>modal.remove());
  modal.addEventListener("click",event=>{if(event.target===modal)modal.remove();});
}

render();
