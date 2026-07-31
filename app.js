const app = document.querySelector("#app");
const flash = document.querySelector("#flash");
const banner = document.querySelector("#broadcast-banner");
const achievementLayer = document.querySelector("#achievement-layer");
const soundToggle = document.querySelector("#sound-toggle");

const TOTAL_QUESTIONS = 9;

const TAGS = [
  "protect","strategy","social","bond","survival","adapt",
  "risk","knowledge","control","leadership","mercy","ambition"
];

const QUESTION_BANK = [
  {id:"baseline_creature",stage:"baseline",tags:["protect","bond"],prompt:"A dangerous creature is trapped beneath rubble. A child is being chased nearby. What do you do first, and why?",intro:"Compassion under pressure. Let us determine whether yours is useful or merely expensive."},
  {id:"baseline_loot",stage:"baseline",tags:["strategy","social"],prompt:"You and a stranger find one life-saving item. The stranger insists they need it more. What happens next?",intro:"Resource conflict detected. Please reveal how quickly civilization leaves your body."},
  {id:"baseline_power",stage:"baseline",tags:["risk","ambition"],prompt:"Choose a permanent price for extraordinary power: pain, lost memories, unwanted truth, or refusal. Explain.",intro:"Every crawler claims to have principles until the reward begins glowing."},
  {id:"protect_hostage",stage:"adaptive",tags:["protect","control"],prompt:"An enemy takes a party member hostage and demands your best weapon. You suspect they will kill the hostage anyway. What do you do?",intro:"A classic hostage problem. Management recommends panic. It photographs well."},
  {id:"protect_many",stage:"adaptive",tags:["protect","leadership"],prompt:"You can save five strangers or one person you love. No loophole is obvious. Walk me through your decision.",intro:"Please rank human value while the audience judges your facial expression."},
  {id:"protect_weak",stage:"adaptive",tags:["protect","mercy"],prompt:"A badly injured crawler is slowing your party and attracting monsters. They beg you not to leave them. What happens?",intro:"The weak have become expensive. Your move."},
  {id:"strategy_maze",stage:"adaptive",tags:["strategy","knowledge"],prompt:"A maze rearranges whenever anyone speaks. Your party is already arguing. How do you get everyone out?",intro:"A puzzle powered by poor communication. You should feel at home."},
  {id:"strategy_boss",stage:"adaptive",tags:["strategy","leadership"],prompt:"The final boss is stronger than your entire party. You have one hour before combat. How do you prepare?",intro:"Your survival odds are insulting. Improve them."},
  {id:"strategy_rules",stage:"adaptive",tags:["strategy","control"],prompt:"You discover a rule the Dungeon never explained. Following it helps you, but revealing it could help thousands. What do you do?",intro:"Information asymmetry detected. Delicious."},
  {id:"social_cult",stage:"adaptive",tags:["social","control"],prompt:"A powerful cult mistakes you for their prophesied leader. Correcting them is dangerous. Playing along could save lives. What do you do?",intro:"Congratulations on your accidental promotion."},
  {id:"social_enemy",stage:"adaptive",tags:["social","mercy"],prompt:"An enemy offers genuine peace, but your party wants revenge. How do you handle both sides?",intro:"Diplomacy: violence with better posture."},
  {id:"social_lie",stage:"adaptive",tags:["social","strategy"],prompt:"A convincing lie would save your party today but destroy someone else's reputation permanently. Do you use it?",intro:"Truth has entered the marketplace. Bidding begins now."},
  {id:"bond_monster",stage:"adaptive",tags:["bond","mercy"],prompt:"A monster has killed before, but it protects you and appears capable of change. Your party wants it dead. What do you do?",intro:"Emotional attachment to a murder-beast. Audience engagement is rising."},
  {id:"bond_familiar",stage:"adaptive",tags:["bond","protect"],prompt:"Your familiar can absorb a fatal attack meant for you, but it may not survive. Do you allow it?",intro:"Pet-related trauma tests exceptionally well."},
  {id:"bond_betrayal",stage:"adaptive",tags:["bond","control"],prompt:"A trusted companion betrays you, but their information could still save the group. What happens next?",intro:"Betrayal protocol. Excellent. The audience loves unresolved attachment wounds."},
  {id:"survival_door",stage:"adaptive",tags:["survival","risk"],prompt:"One door promises safety but removes all your gear. Another preserves your gear but may lead to a boss. Which do you choose?",intro:"Comfort or equipment. Choose your emotional support object."},
  {id:"survival_alone",stage:"adaptive",tags:["survival","adapt"],prompt:"You wake alone with no equipment and hear something hunting you. What are your first three moves?",intro:"Inventory: nothing. Predators: plural. Begin."},
  {id:"survival_food",stage:"adaptive",tags:["survival","mercy"],prompt:"Your party has food for three days. Ten starving survivors ask to join you. What do you decide?",intro:"Scarcity has arrived wearing sad eyes."},
  {id:"adapt_identity",stage:"adaptive",tags:["adapt","knowledge"],prompt:"You learn that one of your core memories is false. How does that change what you do next?",intro:"Identity patch available. Side effects include becoming interesting."},
  {id:"adapt_body",stage:"adaptive",tags:["adapt","risk"],prompt:"A powerful transformation would permanently change your body into something nonhuman. Would you accept it?",intro:"Please select a new shape for your ongoing crisis."},
  {id:"adapt_failure",stage:"adaptive",tags:["adapt","leadership"],prompt:"Your plan fails publicly and people are hurt. How do you respond to the group afterward?",intro:"Failure detected. Now we measure whether you become useful or defensive."},
  {id:"knowledge_secret",stage:"adaptive",tags:["knowledge","control"],prompt:"You uncover a secret that would shatter your party if revealed. Keeping it hidden gives you leverage. What do you do?",intro:"Knowledge is power. Power is usually evidence."},
  {id:"knowledge_forbidden",stage:"adaptive",tags:["knowledge","risk"],prompt:"A forbidden book may contain the answer you need, but reading it could alter your mind. Do you open it?",intro:"Reading-related self-destruction. Finally, culture."},
  {id:"knowledge_truth",stage:"adaptive",tags:["knowledge","mercy"],prompt:"You can learn the exact date and cause of every party member's death. Do you choose to know?",intro:"Spoilers are now medically significant."},
  {id:"control_mutiny",stage:"adaptive",tags:["control","leadership"],prompt:"Half your party wants to abandon your plan. You still believe it is the only way to survive. What do you do?",intro:"Consensus has failed. Authority would like a word."},
  {id:"control_weapon",stage:"adaptive",tags:["control","risk"],prompt:"You find a weapon that becomes stronger each time it influences your decisions. Do you use it?",intro:"A sentient red flag with excellent damage output."},
  {id:"control_prisoner",stage:"adaptive",tags:["control","mercy"],prompt:"A prisoner knows where the hostages are but refuses to talk. How far will you go?",intro:"Ethics have entered a timed event."},
  {id:"leadership_vote",stage:"adaptive",tags:["leadership","social"],prompt:"Your party votes for a plan you believe will get people killed. Do you follow the vote?",intro:"Democracy has produced a tactical error."},
  {id:"leadership_blame",stage:"adaptive",tags:["leadership","protect"],prompt:"A decision must be made, and whoever makes it will be blamed for the outcome. Do you take responsibility?",intro:"Leadership opportunity detected. Warranty void on contact."},
  {id:"leadership_rival",stage:"adaptive",tags:["leadership","ambition"],prompt:"A more popular crawler challenges your authority, but they may actually be better suited to lead. What do you do?",intro:"Ego has entered the arena wearing leadership credentials."},
  {id:"mercy_enemy",stage:"adaptive",tags:["mercy","survival"],prompt:"A defeated enemy begs for mercy and promises to change. Sparing them creates a future risk. What do you do?",intro:"Mercy has requested a risk assessment."},
  {id:"mercy_memory",stage:"adaptive",tags:["mercy","adapt"],prompt:"You can erase an enemy's worst memories instead of killing them, but doing so changes who they are. Is that mercy?",intro:"Please define kindness without making it horrifying."},
  {id:"mercy_child",stage:"adaptive",tags:["mercy","protect"],prompt:"A child has been transformed into a dangerous monster and is losing control. What do you do?",intro:"Management has combined innocence and body horror for improved retention."},
  {id:"ambition_crown",stage:"adaptive",tags:["ambition","control"],prompt:"You can claim a throne that would let you protect thousands, but ruling requires cruelty. Do you take it?",intro:"Power has arrived with terms and conditions."},
  {id:"ambition_fame",stage:"adaptive",tags:["ambition","social"],prompt:"The audience offers you fame and resources if you betray your party's secrets. What do you do?",intro:"Influencer contract detected. Morality not included."},
  {id:"ambition_legacy",stage:"adaptive",tags:["ambition","knowledge"],prompt:"Would you rather survive anonymously or die accomplishing something the world will remember?",intro:"Legacy versus continued breathing. Branding would like an answer."},
  {id:"final_self",stage:"final",tags:["adapt","ambition"],prompt:"What is the one thing the Dungeon could take from you that would make you no longer recognize yourself?",intro:"Final calibration. Try not to hand management an obvious weakness."},
  {id:"final_line",stage:"final",tags:["leadership","survival"],prompt:"Your party is exhausted, terrified, and waiting for you to speak before the final battle. What do you say?",intro:"The cameras are live. Give them something worth surviving for."},
  {id:"final_choice",stage:"final",tags:["mercy","strategy"],prompt:"At the end, you can escape alone or stay behind to give everyone else a chance. No one will know what you chose. What do you do?",intro:"No audience reward. No reputation gain. Just the choice."}
];

const KEYWORDS = {
  protect:["save","protect","shield","child","everyone","both","party","sacrifice"],
  strategy:["plan","trap","weakness","information","prepare","option","study","examine"],
  social:["talk","convince","negotiate","offer","deal","persuade","reason"],
  bond:["friend","familiar","creature","trust","love","companion","tame"],
  survival:["survive","escape","safe","hide","live","food","run"],
  adapt:["adapt","change","rebuild","learn","improvise","accept","remade"],
  risk:["risk","danger","cost","sacrifice","curse","pain","gamble"],
  knowledge:["know","learn","study","truth","secret","research","information"],
  control:["control","restrain","command","leverage","contain","watch"],
  leadership:["lead","assign","team","responsibility","decide","coordinate"],
  mercy:["mercy","spare","forgive","help","compassion","change"],
  ambition:["power","throne","fame","legacy","win","stronger","rule"]
};

const ARCHETYPES = [
  {title:"The Better Offer",type:"Controller / Support",race:"Serpentkin",className:"Beast Diplomat",alignment:"Chaotic Cooperative",keys:["social","bond","strategy"],quote:"The Dungeon does not need another weapon. It needs a negotiator."},
  {title:"The Last Door Standing",type:"Defender / Commander",race:"Ironblood",className:"Oath Warden",alignment:"Protective Neutral",keys:["protect","leadership","survival"],quote:"Anything behind me is not yours to take."},
  {title:"The Unwritten Option",type:"Tactician / Manipulator",race:"Mirrorborn",className:"Loophole Architect",alignment:"Chaotic Strategic",keys:["strategy","control","knowledge"],quote:"Your rules are only dangerous when I agree they are rules."},
  {title:"The One Who Returned",type:"Adaptive / Skirmisher",race:"Ashborn",className:"Ruinwalker",alignment:"Pragmatic Neutral",keys:["adapt","survival","risk"],quote:"Meaning can be rebuilt. So can I."},
  {title:"The Gentle Catastrophe",type:"Healer / Monster Handler",race:"Thornblood",className:"Mercy Binder",alignment:"Compassionate Dangerous",keys:["mercy","bond","protect"],quote:"Kindness is not softness. Ask the things I spared."},
  {title:"The Crown Without Permission",type:"Leader / Power Broker",race:"Sunforged",className:"Sovereign Renegade",alignment:"Ambitious Protective",keys:["ambition","leadership","control"],quote:"I did not ask for the throne. I asked what it could do."},
  {title:"The Forbidden Index",type:"Scholar / Reality Breaker",race:"Glyphborn",className:"Abyssal Archivist",alignment:"Curious Unstable",keys:["knowledge","risk","adapt"],quote:"Every warning label is also a table of contents."},
  {title:"The Necessary Monster",type:"Executioner / Guardian",race:"Nightborn",className:"Merciful Reaper",alignment:"Severe Compassion",keys:["mercy","control","survival"],quote:"I will do the terrible thing. I will also remember its name."}
];

const ACHIEVEMENTS = {
  falseChoice:["THE MENU IS A SUGGESTION","Reject a forced choice and invent another."],
  protector:["UNPROFITABLE COMPASSION","Put another life ahead of efficiency."],
  negotiator:["WORDS ARE ALSO WEAPONS","Attempt diplomacy before debris."],
  strategist:["CONCERNINGLY PREPARED","Display suspicious levels of forethought."],
  survivor:["STILL TECHNICALLY ALIVE","Prioritize continued biological operation."],
  mercy:["BAD FOR THE RATINGS","Show mercy when cruelty would be easier."],
  ambition:["MANAGEMENT MATERIAL","Admit that power might look good on you."],
  scholar:["DO NOT READ THIS","Treat forbidden knowledge as an invitation."]
};

const state = {
  step:"boot",
  name:"",
  queue:[],
  current:null,
  answers:[],
  scores:Object.fromEntries(TAGS.map(t=>[t,0])),
  audience:20,
  achievements:[],
  profile:null
};

let soundOn = false;
let audioContext = null;
let masterGain = null;
let ambience = [];
let typingToken = 0;

const escapeHtml = s => String(s??"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
const sleep = ms => new Promise(r=>setTimeout(r,ms));
const pick = arr => arr[Math.floor(Math.random()*arr.length)];
const shuffled = arr => [...arr].sort(()=>Math.random()-.5);

function flashScreen(){ flash.classList.remove("active"); void flash.offsetWidth; flash.classList.add("active"); }
function showBanner(text,d=2500){ banner.textContent=text; banner.classList.add("show"); setTimeout(()=>banner.classList.remove("show"),d); }
function vibrate(p){ if("vibrate" in navigator) navigator.vibrate(p); }

function ensureAudio(){
  if(audioContext) return;
  audioContext=new (window.AudioContext||window.webkitAudioContext)();
  masterGain=audioContext.createGain();
  masterGain.gain.value=.06;
  masterGain.connect(audioContext.destination);
}
function beep(f=180,d=.08,v=.16){
  if(!soundOn) return;
  ensureAudio();
  const o=audioContext.createOscillator(),g=audioContext.createGain();
  o.type="square";o.frequency.value=f;g.gain.value=v;
  g.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+d);
  o.connect(g).connect(masterGain);o.start();o.stop(audioContext.currentTime+d);
}
function startAmbience(){
  ensureAudio();audioContext.resume();if(ambience.length)return;
  const o=audioContext.createOscillator(),g=audioContext.createGain();
  o.frequency.value=48;g.gain.value=.4;o.connect(g).connect(masterGain);o.start();
  ambience=[o];
}
function stopAmbience(){ ambience.forEach(n=>{try{n.stop()}catch{}}); ambience=[]; }
soundToggle.onclick=()=>{
  soundOn=!soundOn;
  soundToggle.textContent=`SOUND: ${soundOn?"ON":"OFF"}`;
  if(soundOn){startAmbience();beep(520)}else stopAmbience();
};

async function typeText(el,text,speed=17){
  const token=++typingToken;el.textContent="";
  for(const ch of text){
    if(token!==typingToken)return;
    el.textContent+=ch;
    await sleep(/[.!?]/.test(ch)?speed*3:speed+Math.random()*8);
  }
}

function analyze(answer){
  const text=answer.toLowerCase();
  const found=[];
  for(const [tag,words] of Object.entries(KEYWORDS)){
    let points=0;
    for(const w of words) if(text.includes(w)) points+=2;
    if(points){state.scores[tag]+=points;found.push([tag,points]);}
  }
  if(/both|another way|instead|third option|then i|after that/.test(text)){state.scores.strategy+=4;found.push(["strategy",4]);unlock("falseChoice");}
  if(/save|protect|child|everyone|help/.test(text))unlock("protector");
  if(/talk|convince|negotiate|offer|deal/.test(text))unlock("negotiator");
  if(/plan|prepare|weakness|trap|study/.test(text))unlock("strategist");
  if(/survive|escape|safe|live/.test(text))unlock("survivor");
  if(/mercy|spare|forgive|compassion/.test(text))unlock("mercy");
  if(/power|throne|fame|legacy|rule/.test(text))unlock("ambition");
  if(/book|secret|knowledge|truth|study/.test(text))unlock("scholar");
  state.audience=Math.min(99,state.audience+5+Math.min(12,Math.floor(answer.length/45)));
  return found.sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>x[0]);
}

function unlock(key){
  if(state.achievements.includes(key)||!ACHIEVEMENTS[key])return;
  state.achievements.push(key);
  const [name,desc]=ACHIEVEMENTS[key];
  const p=document.createElement("div");
  p.className="achievement-popup";
  p.innerHTML=`<strong>Achievement: ${name}</strong><p>${desc}</p>`;
  achievementLayer.appendChild(p);
  beep(430,.14,.25);vibrate([70,40,120]);
  setTimeout(()=>p.remove(),5000);
}

function buildQueue(){
  const baseline=shuffled(QUESTION_BANK.filter(q=>q.stage==="baseline")).slice(0,3);
  state.queue=[...baseline];
}

function chooseNext(){
  const used=new Set(state.answers.map(a=>a.id));
  if(state.answers.length>=TOTAL_QUESTIONS-1){
    return pick(QUESTION_BANK.filter(q=>q.stage==="final"&&!used.has(q.id)));
  }
  const ranked=Object.entries(state.scores).sort((a,b)=>b[1]-a[1]).map(x=>x[0]);
  const focus=ranked.slice(0,3);
  let pool=QUESTION_BANK.filter(q=>q.stage==="adaptive"&&!used.has(q.id)&&q.tags.some(t=>focus.includes(t)));
  if(pool.length<3)pool=QUESTION_BANK.filter(q=>q.stage==="adaptive"&&!used.has(q.id));
  return pick(pool);
}

function commentary(tags,answer){
  const top=tags[0];
  const maps={
    protect:"You keep reaching for other people before checking whether your own limbs are still attached. Admirable. Expensive.",
    strategy:"You are already looking for the part of the problem management forgot to lock.",
    social:"You appear to believe every catastrophe can be negotiated with. Disturbingly, this may work.",
    bond:"Emotional attachment detected. The audience has begun preparing tribute videos.",
    survival:"Strong continued-existence bias. Sensible, if aesthetically dull.",
    adapt:"You bend instead of breaking. Management prefers cleaner outcomes.",
    risk:"You understand the price and are considering paying it anyway. Excellent television.",
    knowledge:"Curiosity has once again mistaken a warning label for an invitation.",
    control:"You do not merely want the situation solved. You want it contained.",
    leadership:"You have begun assigning responsibility before anyone voted for you.",
    mercy:"Compassion detected under hostile conditions. Sponsor interest is mixed.",
    ambition:"You looked at power and asked what size it came in."
  };
  const length=answer.length>220?" Also, apparently brevity died on the surface.":"";
  return (maps[top]||"Response recorded. Your psychological file is becoming inconveniently specific.")+length;
}

function callback(){
  if(!state.answers.length)return "";
  const a=pick(state.answers);
  const excerpt=a.answer.replace(/\s+/g," ").slice(0,90);
  return `Earlier you said, “${escapeHtml(excerpt)}${a.answer.length>90?"…":""}” The system remembered.`;
}

async function api(method,payload,number){
  const url=number?`/.netlify/functions/crawler-api?crawler=${number}`:"/.netlify/functions/crawler-api";
  const r=await fetch(url,{method,headers:{"Content-Type":"application/json"},body:payload?JSON.stringify(payload):undefined});
  const data=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(data.error||"Dungeon registry error.");
  return data;
}

function buildProfile(number){
  const ranked=Object.entries(state.scores).sort((a,b)=>b[1]-a[1]);
  const archetype=ARCHETYPES.map(a=>({...a,score:a.keys.reduce((s,k)=>s+state.scores[k],0)})).sort((a,b)=>b.score-a.score)[0];
  const stat=(base,keys)=>Math.min(20,base+keys.reduce((s,k)=>s+Math.floor(state.scores[k]/5),0));
  const total=Object.values(state.scores).reduce((a,b)=>a+b,0);
  const survival=Math.min(96,Math.max(18,38+Math.floor(total/4)));
  const rarity=Math.max(1,15-state.achievements.length);
  return {
    crawlerNumber:number,
    name:state.name,
    title:archetype.title,
    type:archetype.type,
    race:archetype.race,
    className:archetype.className,
    alignment:archetype.alignment,
    quote:archetype.quote,
    stats:{
      Strength:stat(6,["protect","survival"]),
      Dexterity:stat(7,["adapt","risk"]),
      Constitution:stat(7,["survival","protect"]),
      Intelligence:stat(9,["strategy","knowledge"]),
      Wisdom:stat(9,["bond","adapt","mercy"]),
      Charisma:stat(9,["social","leadership","ambition"])
    },
    traits:ranked.slice(0,4).map(([k])=>({
      protect:"Guardian Reflex",strategy:"False Choice",social:"Better Offer",bond:"Monster Whisperer",
      survival:"Refuses to Die",adapt:"Adaptive Mind",risk:"Danger Appetite",knowledge:"Forbidden Index",
      control:"Containment Instinct",leadership:"Command Presence",mercy:"Merciful Threat",ambition:"Crown Hunger"
    }[k])),
    flaw: ranked[0][0]==="protect"?"You will endanger yourself for those you claim as yours.":
      ranked[0][0]==="knowledge"?"You will open the book even after the book starts screaming.":
      ranked[0][0]==="control"?"You trust your plan after sensible people begin evacuating.":
      "You mistake survivable consequences for permission.",
    achievements:state.achievements.map(k=>ACHIEVEMENTS[k][0]),
    metrics:{survival,audience:state.audience,sponsor:Math.min(99,state.audience+state.achievements.length*3),rarity:`Top ${rarity}%`},
    answers:state.answers,
    createdAt:new Date().toISOString()
  };
}

function render(){
  const path=location.pathname;
  if(path.startsWith("/crawler/")){
    const num=path.split("/").filter(Boolean)[1];
    return renderPublic(num);
  }
  if(state.step==="boot")return renderBoot();
  if(state.step==="home")return renderHome();
  if(state.step==="quiz")return renderQuiz();
  if(state.step==="processing")return renderProcessing();
  if(state.step==="result")return renderCard(state.profile,true);
}

async function renderBoot(){
  app.innerHTML=`<section class="boot-screen"><div class="boot-terminal"><h1 class="boot-logo">SIGNAL<br>OVERRIDE</h1><div class="boot-lines" id="lines"></div><div class="boot-action" id="boot-action"><button id="continue">Acknowledge Processing</button></div></div></section>`;
  showBanner(pick(["LOCAL DEVICE CLAIMED","SURFACE PRIVILEGES REVOKED","AUDIENCE CONNECTION ESTABLISHED"]));
  const lines=["Connecting to local device...","Identity services unavailable.","Surface civilization: DISCONTINUED","UNREGISTERED CRAWLER DETECTED","Launching adaptive intake protocol."];
  const holder=document.querySelector("#lines");
  for(const t of lines){
    const p=document.createElement("p");p.className=`boot-line ${t.includes("DETECTED")?"danger":t.includes("DISCONTINUED")?"warning":""}`;holder.appendChild(p);
    await typeText(p,"> "+t,22);beep(170,.04,.1);
  }
  document.querySelector("#boot-action").classList.add("ready");
  document.querySelector("#continue").onclick=()=>{flashScreen();state.step="home";render();};
}

function renderHome(){
  app.innerHTML=`<section class="panel">
    <div class="warning-strip"><span>Mandatory Dungeon Processing</span></div>
    <p class="eyebrow">Adaptive Psychological Classification</p>
    <div class="stamp">Property of the Dungeon</div>
    <h1>CRAWLER<br><span>INTAKE</span></h1>
    <p class="lede">No two interviews are identical. Your next question changes according to what you reveal, contradict, avoid, or accidentally confess.</p>
    <label>Crawler designation<input id="name" maxlength="40" placeholder="Enter crawler name"></label>
    <div class="home-actions"><button id="begin" disabled>Begin Adaptive Intake</button></div>
    <div class="search-row"><input id="search" inputmode="numeric" placeholder="Search crawler number"><button class="dark" id="find">Find Dossier</button></div>
    <small>Unofficial fan-made project. Not affiliated with any author, publisher, or rights holder.</small>
  </section>`;
  const name=document.querySelector("#name"),begin=document.querySelector("#begin");
  name.oninput=()=>begin.disabled=!name.value.trim();
  begin.onclick=()=>{state.name=name.value.trim();buildQueue();state.current=state.queue.shift();state.step="quiz";render();};
  document.querySelector("#find").onclick=()=>{
    const n=document.querySelector("#search").value.replace(/\D/g,"");
    if(n)location.href=`/crawler/${n}`;
  };
}

function renderQuiz(){
  const q=state.current;
  const index=state.answers.length+1;
  app.innerHTML=`<section class="panel">
    <div class="warning-strip"><span>Adaptive Hazard Assessment</span></div>
    <div class="progress-frame"><div class="progress"><span style="width:${index/TOTAL_QUESTIONS*100}%"></span></div></div>
    <p class="eyebrow">Assessment ${index} of ${TOTAL_QUESTIONS}</p>
    <div class="live-chip">Live Audience Feed</div>
    <div class="audience-bar"><span>Interest</span><div class="audience-track"><span style="width:${state.audience}%"></span></div><b>${state.audience}%</b></div>
    ${state.answers.length?`<div class="callback-box"><b>Memory Recall:</b> ${callback()}</div>`:""}
    <div class="ai-speaker"><div class="ai-icon">AI</div><div class="ai-copy" id="intro"></div></div>
    <h2>${escapeHtml(q.prompt)}</h2>
    <textarea id="answer" placeholder="The Dungeon AI is listening..."></textarea>
    <div id="reaction"></div>
    <button id="submit" disabled>${index===TOTAL_QUESTIONS?"Complete Classification":"Submit Response"}</button>
  </section>`;
  typeText(document.querySelector("#intro"),q.intro);
  const ans=document.querySelector("#answer"),btn=document.querySelector("#submit");
  ans.oninput=()=>btn.disabled=!ans.value.trim();
  btn.onclick=()=>submitAnswer(ans.value.trim(),btn);
}

async function submitAnswer(answer,btn){
  btn.disabled=true;
  const tags=analyze(answer);
  state.answers.push({id:state.current.id,prompt:state.current.prompt,answer,tags});
  document.querySelector("#reaction").innerHTML=`<div class="reaction"><b>DUNGEON AI:</b> <span id="rc"></span><div class="tag-row">${tags.map(t=>`<span class="tag">${t.toUpperCase()} DETECTED</span>`).join("")}</div></div>`;
  await typeText(document.querySelector("#rc")," "+commentary(tags,answer),14);
  await sleep(500);
  if(state.answers.length>=TOTAL_QUESTIONS){
    state.step="processing";render();return;
  }
  state.current=state.queue.length?state.queue.shift():chooseNext();
  if(state.answers.length===4||state.answers.length===7)await interruption();
  flashScreen();render();
}

async function interruption(){
  const o=document.createElement("div");o.className="interruption";
  o.innerHTML=`<div class="interruption-box"><h2>${pick(["LIVE FEED","SPONSOR PING","SYSTEM ALERT"])}</h2><p>${pick(["Viewer retention has increased. Dignity remains unscored.","Two weapon brands and one soup company have expressed interest.","Your answers have triggered an unscheduled psychological review."])}</p></div>`;
  document.body.appendChild(o);await sleep(20);o.classList.add("active");beep(360,.15,.25);vibrate([80,40,80]);await sleep(1350);o.remove();
}

function renderProcessing(){
  app.innerHTML=`<section class="reveal-overlay"><div class="reveal-sequence"><h2>PROCESSING</h2><p id="status">Compiling contradictions...</p><div class="reveal-meter"><span></span></div></div></section>`;
  const s=document.querySelector("#status");
  ["Estimating entertainment value...","Calculating probable cause of death...","Assigning permanent identity..."].forEach((t,i)=>setTimeout(()=>s.textContent=t,(i+1)*550));
  setTimeout(async()=>{
    try{
      const temp=buildProfile(null);
      const data=await api("POST",{profile:temp});
      state.profile={...temp,crawlerNumber:data.crawlerNumber};
      state.step="result";flashScreen();render();
    }catch(e){
      app.innerHTML=`<section class="panel"><h2>Registry Failure</h2><div class="error-banner">${escapeHtml(e.message)}</div><button onclick="location.reload()">Restart Intake</button></section>`;
    }
  },2200);
}

function renderCard(p,own=false){
  app.innerHTML=`<section style="width:min(930px,100%)">
    <div class="card revealed" id="crawler-card">
      <div class="warning-strip"><span>Official Crawler Dossier</span></div>
      <header><div><p class="eyebrow">Dungeon Registration Complete</p><h2>${escapeHtml(p.name)}</h2><h3>“${escapeHtml(p.title)}”</h3><div class="rarity-badge">${p.metrics.rarity} PROFILE</div></div>
      <div class="number"><span>Crawler</span><strong>#${Number(p.crawlerNumber).toLocaleString()}</strong></div></header>
      <div class="classification"><b>${p.type}</b><span>${p.alignment}</span><em>Threat: ${p.metrics.survival>72?"HIGH":"MODERATE"}</em></div>
      <div class="metrics-grid">
        <div class="metric"><span>Survival Odds</span><b>${p.metrics.survival}%</b></div>
        <div class="metric"><span>Audience</span><b>${p.metrics.audience}%</b></div>
        <div class="metric"><span>Sponsor Appeal</span><b>${p.metrics.sponsor}%</b></div>
        <div class="metric"><span>Rarity</span><b>${p.metrics.rarity}</b></div>
      </div>
      <div class="grid"><section><h4>Attributes</h4>${Object.entries(p.stats).map(([k,v])=>`<div class="stat"><span>${k}</span><b>${v}</b></div>`).join("")}</section>
      <section><h4>Starting Traits</h4>${p.traits.map(t=>`<div class="trait"><b>${t}</b><p>Behavioral pattern confirmed across multiple answers.</p></div>`).join("")}</section></div>
      <div class="path"><div><span>Race Affinity</span><b>${p.race}</b></div><div><span>Class Candidate</span><b>${p.className}</b></div></div>
      <blockquote>${p.quote}</blockquote>
      <div class="weakness"><b>Exploitable Flaw:</b> ${p.flaw}</div>
      <div class="achievement-list">${(p.achievements||[]).map(a=>`<span class="achievement-pill">${a}</span>`).join("")}</div>
      <div class="ai-private-note"><b>LEAKED AI NOTE:</b> Subject profile is unusually coherent. This is either an advantage or evidence of a much larger problem.</div>
      <footer>PROPERTY OF THE DUNGEON • CRAWLER NUMBER PERMANENT • DO NOT DUPLICATE</footer>
    </div>
    <div class="actions">
      ${own?`<button id="download">Download Card</button>`:""}
      <button class="secondary" id="share">Share Dossier</button>
      <button class="dark" id="home">New Intake</button>
    </div>
  </section>`;
  document.querySelector("#home").onclick=()=>location.href="/";
  document.querySelector("#share").onclick=()=>shareProfile(p);
  if(own)document.querySelector("#download").onclick=downloadCard;
}

async function renderPublic(number){
  app.innerHTML=`<section class="panel"><h2>Retrieving Dossier</h2><p class="lede">Searching permanent crawler registry...</p></section>`;
  try{ const data=await api("GET",null,number); renderCard(data.profile,false); }
  catch(e){ app.innerHTML=`<section class="panel"><h2>Dossier Not Found</h2><div class="error-banner">${escapeHtml(e.message)}</div><button onclick="location.href='/'">Return Home</button></section>`; }
}

async function shareProfile(p){
  const url=`${location.origin}/crawler/${p.crawlerNumber}`;
  const text=`${p.name} — Crawler #${p.crawlerNumber}\n${p.title}\n${p.race} ${p.className}\nSurvival odds: ${p.metrics.survival}%`;
  if(navigator.share){try{await navigator.share({title:`${p.name}'s Crawler Dossier`,text,url});return}catch{}}
  await navigator.clipboard.writeText(`${text}\n${url}`);
  showBanner("DOSSIER LINK COPIED");
}

async function downloadCard(){
  const canvas=await html2canvas(document.querySelector("#crawler-card"),{scale:2,backgroundColor:"#eee2c8",useCORS:true});
  const a=document.createElement("a");a.download=`crawler-${state.profile.crawlerNumber}.png`;a.href=canvas.toDataURL("image/png");a.click();
}

render();
