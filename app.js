const app = document.querySelector("#app");
const flash = document.querySelector("#flash");
const banner = document.querySelector("#broadcast-banner");
const achievementLayer = document.querySelector("#achievement-layer");
const soundToggle = document.querySelector("#sound-toggle");

const TOTAL_QUESTIONS = 9;

const TAGS = [
  "protect","strategy","social","bond","survival","adapt","risk","knowledge",
  "control","leadership","mercy","ambition","empathy","loyalty","curiosity",
  "discipline","chaos","violence","sacrifice","pragmatism","deception",
  "honor","patience","independence","faith","vengeance","creativity",
  "caution","authority","defiance","optimism","ruthlessness","cooperation",
  "intuition","calculation","identity","fear","humor","responsibility",
  "manipulation","restraint","hope","obsession","trust","ego","resourcefulness",
  "justice","attachment","selfPreservation","altruism"
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
  protect:["save","protect","shield","child","everyone","both","party","defend","guard"],
  strategy:["plan","trap","weakness","information","prepare","option","study","examine","calculate"],
  social:["talk","convince","negotiate","offer","deal","persuade","reason","bargain"],
  bond:["friend","familiar","creature","trust","love","companion","tame","loyal"],
  survival:["survive","escape","safe","hide","live","food","run","shelter"],
  adapt:["adapt","change","rebuild","learn","improvise","accept","remade","adjust"],
  risk:["risk","danger","cost","curse","pain","gamble","chance"],
  knowledge:["know","learn","study","truth","secret","research","information","book"],
  control:["control","restrain","command","leverage","contain","watch","manage"],
  leadership:["lead","assign","team","responsibility","decide","coordinate","organize"],
  mercy:["mercy","spare","forgive","help","compassion","change","second chance"],
  ambition:["power","throne","fame","legacy","win","stronger","rule","rise"],
  empathy:["feel","understand","hurt","afraid","comfort","care","empathy"],
  loyalty:["loyal","stay","promise","betray","side","stand by","commit"],
  curiosity:["curious","open","explore","wonder","question","find out"],
  discipline:["wait","routine","careful","practice","discipline","steady"],
  chaos:["chaos","random","wild","improvise","whatever happens","unpredictable"],
  violence:["kill","attack","fight","hurt","weapon","destroy","execute"],
  sacrifice:["sacrifice","give up","take the hit","stay behind","trade my"],
  pragmatism:["necessary","practical","efficient","best option","least harm","realistic"],
  deception:["lie","trick","fake","pretend","mislead","deceive"],
  honor:["honor","fair","promise","word","truthful","right thing"],
  patience:["wait","observe","patient","watch first","take time"],
  independence:["alone","myself","independent","don't need","solo"],
  faith:["faith","believe","god","fate","destiny","trust the universe"],
  vengeance:["revenge","payback","vengeance","make them suffer","settle the score"],
  creativity:["invent","create","unexpected","third option","another way","loophole"],
  caution:["careful","avoid","check","safe","cautious","slow"],
  authority:["order","command","authority","obey","rank","leader"],
  defiance:["refuse","won't","reject","break the rules","defy","ignore the choice"],
  optimism:["hope","believe it can work","better future","we can"],
  ruthlessness:["leave them","kill them","necessary loss","cut them loose","no hesitation"],
  cooperation:["together","team","everyone helps","work with","share"],
  intuition:["instinct","gut","feel like","sense"],
  calculation:["calculate","odds","probability","weigh","compare","analyze"],
  identity:["who i am","myself","identity","recognize myself","become"],
  fear:["afraid","fear","terrified","panic","scared"],
  humor:["joke","laugh","funny","sarcasm","make light"],
  responsibility:["my fault","responsibility","own it","accountable","blame me"],
  manipulation:["use them","leverage","influence","make them think","pressure"],
  restraint:["hold back","don't kill","restrain","limit","controlled force"],
  hope:["hope","chance","future","tomorrow","keep going"],
  obsession:["must know","can't stop","whatever it takes","need to"],
  trust:["trust","believe them","give them a chance","rely on"],
  ego:["prove","better than","my authority","respect me","I deserve"],
  resourcefulness:["use what i have","improvise","make do","repurpose","jury-rig"],
  justice:["justice","deserve","fair","accountability","consequence"],
  attachment:["love","can't leave","need them","mine","my person"],
  selfPreservation:["my life","save myself","escape alone","stay alive"],
  altruism:["others first","everyone else","save them","for the group"]
};

const RACE_ENGINES = [
  {name:"Verdant Naga",keys:["mercy","bond","adapt"],note:"soft-spoken, patient, and considerably more dangerous than it looks"},
  {name:"Archivist Wyrm",keys:["knowledge","control","curiosity"],note:"built to hoard truths, secrets, and leverage"},
  {name:"Sunforged",keys:["ambition","leadership","hope"],note:"radiant, commanding, and difficult to ignore"},
  {name:"Ashborn",keys:["adapt","survival","identity"],note:"rebuilt by loss rather than defined by it"},
  {name:"Mirrorborn",keys:["strategy","deception","creativity"],note:"reflective, elusive, and structurally opposed to simple answers"},
  {name:"Ironblood",keys:["protect","discipline","responsibility"],note:"made for endurance, duty, and becoming the wall"},
  {name:"Nightborn",keys:["restraint","violence","justice"],note:"controlled, severe, and familiar with ugly necessities"},
  {name:"Thornkin",keys:["mercy","defiance","protect"],note:"gentle until cornered, then regrettable"},
  {name:"Glyphborn",keys:["knowledge","faith","identity"],note:"marked by symbols it only partially understands"},
  {name:"Stormblood",keys:["chaos","risk","defiance"],note:"volatile, impulsive, and deeply entertaining"},
  {name:"Hollow Saint",keys:["sacrifice","hope","mercy"],note:"built around absence, duty, and impossible compassion"},
  {name:"Glass Revenant",keys:["survival","vengeance","identity"],note:"fractured, persistent, and not finished"},
  {name:"Crownmarked",keys:["authority","ambition","ego"],note:"born with the posture of someone already issuing orders"},
  {name:"Mossbound",keys:["bond","patience","cooperation"],note:"slow to trust, slower to abandon"},
  {name:"Voidtouched",keys:["curiosity","risk","obsession"],note:"too curious for its own continued structural integrity"},
  {name:"Emberkin",keys:["hope","leadership","violence"],note:"warm, bright, and alarmingly willing to burn"}
];

const CLASS_ENGINES = [
  {name:"Whisper Broker",keys:["social","manipulation","strategy"]},
  {name:"Tomb Cartographer",keys:["knowledge","caution","resourcefulness"]},
  {name:"Bone Accountant",keys:["calculation","pragmatism","control"]},
  {name:"Swarm Shepherd",keys:["bond","leadership","cooperation"]},
  {name:"Living Siege",keys:["protect","violence","discipline"]},
  {name:"Blood Negotiator",keys:["social","violence","restraint"]},
  {name:"Grief Alchemist",keys:["adapt","identity","hope"]},
  {name:"Audience Heretic",keys:["defiance","independence","creativity"]},
  {name:"Mercy Binder",keys:["mercy","control","bond"]},
  {name:"Oath Warden",keys:["honor","protect","responsibility"]},
  {name:"Loophole Architect",keys:["strategy","creativity","defiance"]},
  {name:"Abyssal Archivist",keys:["knowledge","obsession","risk"]},
  {name:"Ruinwalker",keys:["survival","adapt","resourcefulness"]},
  {name:"Sovereign Renegade",keys:["leadership","ambition","defiance"]},
  {name:"Monster Advocate",keys:["bond","mercy","social"]},
  {name:"Threat Composer",keys:["calculation","violence","creativity"]},
  {name:"Hope Smuggler",keys:["hope","deception","altruism"]},
  {name:"Debt Paladin",keys:["justice","honor","vengeance"]},
  {name:"Chaos Medic",keys:["mercy","chaos","resourcefulness"]},
  {name:"Memory Thief",keys:["identity","deception","knowledge"]},
  {name:"Crisis Oracle",keys:["intuition","fear","leadership"]},
  {name:"Quiet Executioner",keys:["restraint","violence","pragmatism"]},
  {name:"Familiar General",keys:["bond","authority","protect"]},
  {name:"Probability Witch",keys:["calculation","risk","knowledge"]}
];

const TITLE_PREFIXES = {
  protect:["The Last","The Shield of","The One Who Guards","The Wall Before"],
  strategy:["The Unwritten","The Architect of","The Mind Behind","The One Who Planned"],
  social:["The Better","The Silver-Tongued","The Voice Behind","The One Who Offered"],
  bond:["The Beast-Beloved","The Keeper of","The One Monsters Follow","The Familiar's"],
  survival:["The One Who Returned","The Unburied","The Still-Breathing","The Last Living"],
  adapt:["The Remade","The Many-Shaped","The One Who Became","The Ash-Rewritten"],
  knowledge:["The Forbidden","The Index of","The One Who Opened","The Keeper of Impossible"],
  control:["The Hand on","The Keeper of","The One Holding","The Chain Around"],
  leadership:["The Crown Without","The Voice Before","The One They Follow","The Unasked-for"],
  mercy:["The Gentle","The Patron Saint of","The One Who Spared","The Kindness After"],
  ambition:["The Crown-Hungry","The One Who Reached","The Heir to","The Uninvited"],
  defiance:["The Uncooperative","The Rulebreaker of","The One Who Refused","The Door That Wouldn't"],
  curiosity:["The One Who Looked","The Door-Opener","The Question Beneath","The Unfinished"],
  hope:["The Last Hope of","The One Who Believed","The Light Beneath","The Tomorrow After"],
  violence:["The Necessary","The Red-Handed","The Blade Behind","The One Who Ended"],
  sacrifice:["The Final","The One Who Stayed","The Price Paid by","The Last Gift of"]
};

const TITLE_SUFFIXES = {
  protect:["the Door","the Innocent","Everyone Else","the Final Room"],
  strategy:["Bad Odds","the Hidden Exit","Impossible Plans","the Third Option"],
  social:["Offer","Lie","Peace Treaty","Impossible Bargain"],
  bond:["Monsters","Lost Things","Unwanted Creatures","the Faithful"],
  survival:["Ruin","the Collapse","Certain Death","the Last Floor"],
  adapt:["Disaster","the Fire","What Was Left","the Breaking Point"],
  knowledge:["Door","Truth","Archive","Warning Label"],
  control:["Chaos","the Leash","the Last Word","the Room"],
  leadership:["Permission","the Crown","the Charge","the Final Stand"],
  mercy:["Catastrophe","Bad Decisions","the Damned","the Enemy"],
  ambition:["the Throne","the Summit","the Empty Crown","Tomorrow"],
  defiance:["Open","Obey","Stay Broken","Take the Hint"],
  curiosity:["Back","Every Warning","the Dark","the Last Page"],
  hope:["the End","Ruin","the Dark","Everyone Else"],
  violence:["Monster","Argument","Mercy","the Threat"],
  sacrifice:["Choice","Door","Light","Breath"]
};

const QUIRKS = [
  {keys:["bond","empathy"],text:"NPC children and frightened animals trust you before they have any reason to."},
  {keys:["social","ambition"],text:"Shopkeepers overcharge you because you look expensive."},
  {keys:["knowledge","curiosity"],text:"You can identify a cursed object instantly. You still want to touch it."},
  {keys:["protect","sacrifice"],text:"Allies unconsciously stand behind you when danger enters the room."},
  {keys:["chaos","humor"],text:"Your worst ideas receive suspiciously enthusiastic audience applause."},
  {keys:["control","discipline"],text:"Doors seem more willing to lock after you enter a room."},
  {keys:["mercy","violence"],text:"Enemies are never quite sure whether you are saving them or sentencing them."},
  {keys:["survival","resourcefulness"],text:"You can turn almost any useless object into a disappointing but functional weapon."},
  {keys:["leadership","responsibility"],text:"Strangers hand you problems as though you are already in charge."},
  {keys:["defiance","creativity"],text:"System menus occasionally display options that do not exist for other crawlers."},
  {keys:["faith","hope"],text:"Candles remain lit when you pass, even in wind."},
  {keys:["vengeance","patience"],text:"You remember every debt. The Dungeon has started keeping a separate ledger."},
  {keys:["deception","social"],text:"Your most convincing lies contain one unnecessary and completely true detail."},
  {keys:["independence","survival"],text:"Maps become less accurate whenever you decide you do not need anyone."},
  {keys:["ego","authority"],text:"Furniture subtly rearranges itself to give you the best seat."},
  {keys:["attachment","fear"],text:"You are fearless until someone you love is placed at risk."},
  {keys:["justice","restraint"],text:"You prefer consequences that leave the target alive long enough to understand them."},
  {keys:["obsession","knowledge"],text:"Books sometimes open to the page you need. This is not necessarily helpful."},
  {keys:["altruism","hope"],text:"Your survival odds improve whenever you are protecting someone else."},
  {keys:["calculation","intuition"],text:"Your gut feelings arrive with percentages attached."},
  {keys:["manipulation","mercy"],text:"You can make kindness feel like a threat."},
  {keys:["caution","risk"],text:"You carefully evaluate every danger before doing something reckless anyway."},
  {keys:["identity","adapt"],text:"Mirrors occasionally show versions of you that made different choices."},
  {keys:["humor","fear"],text:"You become significantly funnier when terrified."},
  {keys:["cooperation","leadership"],text:"Parties function better around you, but complain more often."},
  {keys:["violence","restraint"],text:"Weapons feel heavier in your hand until you are certain."},
  {keys:["curiosity","defiance"],text:"Warning signs become more legible as you approach them."},
  {keys:["pragmatism","mercy"],text:"You are capable of doing the kind thing for deeply unromantic reasons."},
  {keys:["ambition","hope"],text:"The audience can never tell whether you want power for yourself or for what it could fix."},
  {keys:["trust","loyalty"],text:"Betrayal affects you exactly once per person."}
];


const MIN_QUESTIONS = 7;
const MAX_QUESTIONS = 14;
const TARGET_CONFIDENCE = 82;

const CONTRADICTION_RULES = [
  {
    a:["protect","altruism","loyalty"],
    b:["selfPreservation","ruthlessness","independence"],
    label:"PROTECTOR / SURVIVOR CONFLICT",
    prompt:(earlier,current)=>`Earlier you described yourself as someone who protects others: “${earlier}” Yet now you chose self-preservation: “${current}” Which answer is closer to the truth when there is no time to perform morality?`
  },
  {
    a:["mercy","empathy","hope"],
    b:["violence","vengeance","ruthlessness"],
    label:"MERCY / VIOLENCE CONFLICT",
    prompt:(earlier,current)=>`You previously favored mercy: “${earlier}” Now you sound willing to become the punishment: “${current}” Where is the exact line that turns compassion into violence?`
  },
  {
    a:["honor","trust","responsibility"],
    b:["deception","manipulation","pragmatism"],
    label:"HONOR / DECEPTION CONFLICT",
    prompt:(earlier,current)=>`You claimed truth or responsibility mattered: “${earlier}” Then you justified manipulation: “${current}” Is honesty a principle, or merely your preferred tool when it works?`
  },
  {
    a:["cooperation","leadership","social"],
    b:["independence","authority","control"],
    label:"TEAM / CONTROL CONFLICT",
    prompt:(earlier,current)=>`You spoke about working with others: “${earlier}” But your latest answer centers control: “${current}” Do you want a party, or an audience that follows instructions?`
  },
  {
    a:["caution","calculation","patience"],
    b:["risk","chaos","curiosity"],
    label:"CAUTION / IMPULSE CONFLICT",
    prompt:(earlier,current)=>`Earlier you calculated the danger: “${earlier}” Then you walked toward it anyway: “${current}” Are you cautious, or do you simply enjoy understanding the risk before ignoring it?`
  },
  {
    a:["hope","optimism","faith"],
    b:["pragmatism","survival","calculation"],
    label:"HOPE / PRAGMATISM CONFLICT",
    prompt:(earlier,current)=>`You expressed hope: “${earlier}” Your later answer is colder: “${current}” When hope becomes inefficient, do you keep it?`
  }
];

const AI_OPINIONS = {
  intrigued:[
    "I am beginning to enjoy this. Do not make it sentimental.",
    "Management has asked why I am still paying attention. I declined to answer.",
    "Your file is becoming annoyingly difficult to summarize."
  ],
  impressed:[
    "That was better than the question deserved.",
    "You found the hidden hinge. Management hates when crawlers do that.",
    "I may have underestimated you. This will not happen twice."
  ],
  suspicious:[
    "That answer was polished. Too polished.",
    "You are either lying to me or lying to yourself. Both remain useful.",
    "Something in your file refuses to align."
  ],
  hostile:[
    "I do not like this answer. The audience does.",
    "You are making choices that create paperwork.",
    "Management is going to adore you. I consider this a flaw."
  ],
  amused:[
    "Oh, that is a terrible idea. Continue.",
    "The audience just leaned forward.",
    "Your survival odds have become emotionally complicated."
  ]
};

const RARE_ENDINGS = [
  {
    id:"uncategorizable",
    title:"ERROR: CRAWLER CANNOT BE CATEGORIZED",
    rarity:"0.3% SYSTEM ANOMALY",
    test:(p)=>p.dominantTraits?.slice(0,6).every((t,i,a)=>i===0||Math.abs(t.value-a[0].value)<=3) && p.metrics.threat>65,
    note:"Your instincts conflict too evenly for the classification engine to establish a stable identity."
  },
  {
    id:"audience_favorite",
    title:"AUDIENCE FAVORITE",
    rarity:"ULTRA-RARE BROADCAST STATUS",
    test:(p)=>p.metrics.audience>=94 && p.metrics.sponsor>=80,
    note:"The audience has begun treating your continued survival as a personal investment."
  },
  {
    id:"management_review",
    title:"MANAGEMENT REVIEW REQUIRED",
    rarity:"RESTRICTED CLASSIFICATION",
    test:(p)=>p.metrics.threat>=82 && p.dominantTraits?.some(t=>t.name==="defiance"),
    note:"Your profile has been escalated because standard incentives may not reliably control you."
  },
  {
    id:"potential_npc",
    title:"POTENTIAL NPC",
    rarity:"UNAUTHORIZED SOCIAL CLASSIFICATION",
    test:(p)=>p.dominantTraits?.some(t=>t.name==="social"&&t.value>=18) && p.dominantTraits?.some(t=>t.name==="manipulation"&&t.value>=12),
    note:"You may be more dangerous when giving quests than completing them."
  },
  {
    id:"last_light",
    title:"THE LAST LIGHT PROTOCOL",
    rarity:"HIDDEN HEROIC OUTCOME",
    test:(p)=>p.dominantTraits?.some(t=>t.name==="hope"&&t.value>=16) && p.dominantTraits?.some(t=>t.name==="sacrifice"&&t.value>=14),
    note:"The system predicts you would remain after the cameras stopped."
  }
];

const SECRET_PROTOCOLS = [
  {code:"LAZARUS", keys:["adapt","survival","identity"], text:"If this crawler is declared dead, verify twice."},
  {code:"MENAGERIE", keys:["bond","mercy","protect"], text:"Do not place this crawler near unregistered creatures without supervision."},
  {code:"HERETIC", keys:["defiance","knowledge","creativity"], text:"This crawler may discover interface options not approved by management."},
  {code:"REGENT", keys:["leadership","ambition","authority"], text:"Potential faction founder. Prevent access to a microphone."},
  {code:"MIRROR", keys:["deception","identity","social"], text:"Identity-based encounters may produce unreliable outcomes."},
  {code:"SAINT", keys:["sacrifice","hope","altruism"], text:"Crawler may choose the group over self even without reputation rewards."},
  {code:"BLACK LEDGER", keys:["vengeance","patience","justice"], text:"Debts remain active indefinitely."},
  {code:"OPEN BOOK", keys:["curiosity","knowledge","obsession"], text:"Sealed information will not remain sealed."},
  {code:"THIRD DOOR", keys:["strategy","defiance","creativity"], text:"Binary choice architecture ineffective."},
  {code:"QUIET KNIFE", keys:["restraint","violence","pragmatism"], text:"Threat response may be delayed, not absent."}
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


const PROCESSING_MESSAGES = [
  "Compiling psychological liabilities...",
  "Cross-referencing contradictions...",
  "Calculating marketability...",
  "Estimating emotional damage...",
  "Contacting sponsors...",
  "Selling naming rights...",
  "Evaluating snack potential...",
  "Checking for main-character syndrome...",
  "Searching unresolved childhood issues...",
  "Translating moral compass...",
  "Confirming bones are still internal...",
  "Running tax audit...",
  "Looking for hidden achievements...",
  "Asking Management if this one is our problem...",
  "Determining how expensive this death would be...",
  "Cross-referencing previous lives...",
  "Measuring plot armor...",
  "Counting terrible decisions...",
  "Testing audience sympathy...",
  "Searching monster adoption records...",
  "Verifying 'I'm fine' claim...",
  "Calculating probable cause of death...",
  "Estimating betrayal resistance...",
  "Scanning for secret protocols...",
  "Reviewing suspicious levels of confidence...",
  "Comparing mercy to survival instinct...",
  "Checking whether the crawler read the warning label...",
  "Auditing loyalty under catastrophic conditions...",
  "Calculating sponsor lawsuit exposure...",
  "Measuring attachment-based vulnerabilities...",
  "Evaluating leadership without permission...",
  "Checking for unauthorized optimism...",
  "Inspecting impulse-control warranty...",
  "Testing response to impossible choices...",
  "Validating threat profile...",
  "Searching Management blacklist...",
  "Polling the live audience...",
  "Confirming crawler number availability...",
  "Preparing permanent dossier..."
];

const state = {
  step:"boot",
  name:"",
  queue:[],
  current:null,
  answers:[],
  scores:Object.fromEntries(TAGS.map(t=>[t,0])),
  audience:20,
  achievements:[],
  profile:null,
  confidence:18,
  aiOpinion:"intrigued",
  contradictions:[],
  followUpsAsked:0,
  rareEnding:null
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

async function typeText(el,text,speed=22){
  const token=++typingToken;el.textContent="";
  for(const ch of text){
    if(token!==typingToken)return;
    el.textContent+=ch;
    await sleep(/[.!?]/.test(ch)?speed*4.5:speed+Math.random()*10);
  }
}

function analyze(answer){
  const text=answer.toLowerCase();
  const found=[];

  for(const [tag,words] of Object.entries(KEYWORDS)){
    let points=0;
    for(const w of words){
      if(text.includes(w)) points+=2;
    }
    if(points){
      state.scores[tag]+=points;
      found.push([tag,points]);
    }
  }

  const pairRules = [
    [/both|another way|third option|instead|then i|after that/, [["strategy",4],["creativity",5],["defiance",2]]],
    [/save|protect|child|everyone|help/, [["protect",3],["altruism",3],["empathy",2]]],
    [/talk|convince|negotiate|offer|deal/, [["social",3],["manipulation",1],["restraint",2]]],
    [/kill|execute|attack|destroy/, [["violence",4],["mercy",-2],["restraint",-1]]],
    [/wait|observe|watch first|take time/, [["patience",4],["caution",3],["calculation",2]]],
    [/sacrifice|stay behind|take the hit/, [["sacrifice",5],["altruism",4],["selfPreservation",-3]]],
    [/alone|by myself|escape alone/, [["independence",4],["cooperation",-2],["selfPreservation",2]]],
    [/truth|honest|tell them/, [["honor",3],["deception",-2],["trust",2]]],
    [/lie|pretend|mislead|trick/, [["deception",4],["honor",-2],["strategy",2]]],
    [/revenge|payback|make them suffer/, [["vengeance",5],["mercy",-3],["justice",2]]],
    [/forgive|spare|second chance/, [["mercy",5],["hope",3],["vengeance",-2]]],
    [/power|throne|rule|authority/, [["ambition",4],["authority",3],["ego",1]]],
    [/responsibility|my fault|blame me|own it/, [["responsibility",5],["leadership",3],["ego",-1]]],
    [/gut|instinct|feel like/, [["intuition",4],["calculation",-1]]],
    [/odds|probability|calculate|weigh/, [["calculation",4],["intuition",-1]]]
  ];

  for(const [regex,changes] of pairRules){
    if(regex.test(text)){
      for(const [tag,delta] of changes){
        state.scores[tag]=Math.max(0,state.scores[tag]+delta);
        if(delta>0) found.push([tag,delta]);
      }
    }
  }

  if(answer.length>260){
    state.scores.obsession+=2;
    state.scores.calculation+=1;
  }
  if(answer.length<55){
    state.scores.pragmatism+=2;
    state.scores.patience=Math.max(0,state.scores.patience-1);
  }

  if(/both|another way|instead|third option|then i|after that/.test(text))unlock("falseChoice");
  if(/save|protect|child|everyone|help/.test(text))unlock("protector");
  if(/talk|convince|negotiate|offer|deal/.test(text))unlock("negotiator");
  if(/plan|prepare|weakness|trap|study/.test(text))unlock("strategist");
  if(/survive|escape|safe|live/.test(text))unlock("survivor");
  if(/mercy|spare|forgive|compassion/.test(text))unlock("mercy");
  if(/power|throne|fame|legacy|rule/.test(text))unlock("ambition");
  if(/book|secret|knowledge|truth|study/.test(text))unlock("scholar");

  state.audience=Math.min(99,state.audience+4+Math.min(13,Math.floor(answer.length/42)));
  return found.sort((a,b)=>b[1]-a[1]).slice(0,4).map(x=>x[0]);
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


function excerpt(text,max=86){
  const clean=String(text||"").replace(/\s+/g," ").trim();
  return clean.length>max?`${clean.slice(0,max-1)}…`:clean;
}

function scoreConfidence(){
  const values=Object.values(state.scores).filter(v=>v>0).sort((a,b)=>b-a);
  if(!values.length)return 18;

  const answered=state.answers.length;
  const coverage=Math.min(32,values.length*1.9);
  const strength=Math.min(28,values.slice(0,8).reduce((a,b)=>a+b,0)/5);
  const comparison=values[Math.min(5,values.length-1)]||0;
  const separation=Math.min(18,Math.max(0,(values[0]-comparison)*1.4));
  const consistency=Math.max(0,16-state.contradictions.length*2.5);
  const depth=Math.min(12,answered*1.25);

  return Math.max(18,Math.min(99,Math.round(coverage+strength+separation+consistency+depth)));
}

function detectContradiction(currentAnswer,currentTags){
  if(state.answers.length<2)return null;

  for(const rule of CONTRADICTION_RULES){
    const currentA=currentTags.some(t=>rule.a.includes(t));
    const currentB=currentTags.some(t=>rule.b.includes(t));

    for(const previous of [...state.answers].reverse()){
      const prevA=previous.tags?.some(t=>rule.a.includes(t));
      const prevB=previous.tags?.some(t=>rule.b.includes(t));

      if((prevA&&currentB)||(prevB&&currentA)){
        const key=`${rule.label}:${previous.id}:${state.current.id}`;
        if(state.contradictions.some(c=>c.key===key))continue;

        const contradiction={
          key,
          label:rule.label,
          earlier:excerpt(previous.answer),
          current:excerpt(currentAnswer),
          prompt:rule.prompt(excerpt(previous.answer),excerpt(currentAnswer))
        };
        state.contradictions.push(contradiction);
        return contradiction;
      }
    }
  }

  return null;
}

function createContradictionQuestion(contradiction){
  return {
    id:`contradiction_${Date.now()}`,
    stage:"followup",
    tags:["identity","honor","adapt"],
    prompt:contradiction.prompt,
    intro:`CONTRADICTION DETECTED: ${contradiction.label}. The previous answer and the current answer cannot both remain uncomplicated.`,
    isContradiction:true
  };
}

function chooseOpinion(tags,answer,contradiction){
  if(contradiction)return "suspicious";
  if(tags.includes("creativity")||tags.includes("strategy"))return "impressed";
  if(tags.includes("defiance")||tags.includes("authority"))return "hostile";
  if(tags.includes("chaos")||/joke|laugh|funny|sarcasm/.test(answer.toLowerCase()))return "amused";
  return "intrigued";
}

function aiOpinionLine(){
  const pool=AI_OPINIONS[state.aiOpinion]||AI_OPINIONS.intrigued;
  return pick(pool);
}

function shouldFinish(){
  const count=state.answers.length;
  state.confidence=scoreConfidence();

  if(count<MIN_QUESTIONS)return false;
  if(count>=MAX_QUESTIONS)return true;
  if(state.current?.isContradiction)return false;

  return state.confidence>=TARGET_CONFIDENCE && state.contradictions.length<=2;
}

function chooseSecretProtocol(){
  const ranked=SECRET_PROTOCOLS
    .map(protocol=>({
      ...protocol,
      score:protocol.keys.reduce((sum,key)=>sum+(state.scores[key]||0),0)
    }))
    .sort((a,b)=>b.score-a.score);

  const top=ranked[0];
  const seed=state.answers.reduce((sum,a)=>sum+a.answer.length,0)+state.name.length;
  const fallback=ranked[seed%Math.min(4,ranked.length)];
  return top.score>8?top:fallback;
}

function chooseRareEnding(profile){
  const matching=RARE_ENDINGS.filter(ending=>ending.test(profile));
  if(!matching.length)return null;

  const seed=state.answers.reduce((sum,a)=>sum+a.answer.length,0);
  return matching[seed%matching.length];
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
  const topKeys=ranked.slice(0,8).map(([k])=>k);

  const scoreEngine = (engine) =>
    engine.keys.reduce((sum,key,index)=>sum+(state.scores[key]||0)*(3-index),0);

  const race = RACE_ENGINES
    .map(item=>({...item,score:scoreEngine(item)}))
    .sort((a,b)=>b.score-a.score)[0];

  const classChoice = CLASS_ENGINES
    .map(item=>({...item,score:scoreEngine(item)}))
    .sort((a,b)=>b.score-a.score)[0];

  const titlePrimary = topKeys.find(k=>TITLE_PREFIXES[k]) || "adapt";
  const titleSecondary = topKeys.find(k=>k!==titlePrimary && TITLE_SUFFIXES[k]) || titlePrimary;
  const prefixList = TITLE_PREFIXES[titlePrimary];
  const suffixList = TITLE_SUFFIXES[titleSecondary];

  const stableSeed = state.answers
    .map(a=>a.answer.length + a.answer.charCodeAt(0))
    .reduce((a,b)=>a+b,0);

  const prefix = prefixList[stableSeed % prefixList.length];
  const suffix = suffixList[(stableSeed + state.name.length) % suffixList.length];
  const title = `${prefix} ${suffix}`.replace(/\s+/g," ").trim();

  const stat=(base,positive,negative=[])=>{
    const gain=positive.reduce((s,k)=>s+Math.floor((state.scores[k]||0)/4),0);
    const loss=negative.reduce((s,k)=>s+Math.floor((state.scores[k]||0)/8),0);
    return Math.max(4,Math.min(20,base+gain-loss));
  };

  const stats={
    Strength:stat(5,["protect","violence","sacrifice"],["caution"]),
    Dexterity:stat(6,["adapt","risk","resourcefulness"],["discipline"]),
    Constitution:stat(6,["survival","discipline","selfPreservation"],["fear"]),
    Intelligence:stat(7,["strategy","knowledge","calculation","creativity"],["chaos"]),
    Wisdom:stat(7,["empathy","intuition","patience","mercy"],["ego"]),
    Charisma:stat(7,["social","leadership","manipulation","hope"],["independence"])
  };

  const traitMap={
    protect:"Guardian Reflex",strategy:"False Choice",social:"Better Offer",
    bond:"Monster Whisperer",survival:"Refuses to Die",adapt:"Adaptive Mind",
    risk:"Danger Appetite",knowledge:"Forbidden Index",control:"Containment Instinct",
    leadership:"Command Presence",mercy:"Merciful Threat",ambition:"Crown Hunger",
    empathy:"Pain Reader",loyalty:"Last to Leave",curiosity:"Door Opener",
    discipline:"Iron Routine",chaos:"Beautiful Disaster",violence:"Necessary Force",
    sacrifice:"Final Volunteer",pragmatism:"Cold Arithmetic",deception:"Useful Lie",
    honor:"Unbroken Word",patience:"Still Water",independence:"Solo Protocol",
    faith:"Impossible Believer",vengeance:"Debt Memory",creativity:"Third Option",
    caution:"Threat Audit",authority:"Command Voice",defiance:"System Error",
    optimism:"Future Bias",ruthlessness:"Clean Cut",cooperation:"Party Glue",
    intuition:"Bad Feeling",calculation:"Probability Sight",identity:"Unfinished Self",
    fear:"Fear-Forged",humor:"Crisis Comedian",responsibility:"Takes the Blame",
    manipulation:"Soft Leverage",restraint:"Held Blade",hope:"Hope Smuggler",
    obsession:"Cannot Look Away",trust:"Open Hand",ego:"Main Character Energy",
    resourcefulness:"Scrap Genius",justice:"Measured Consequence",
    attachment:"Chosen Person",selfPreservation:"Exit Instinct",altruism:"Others First"
  };

  const traits=ranked
    .filter(([k,v])=>v>0 && traitMap[k])
    .slice(0,5)
    .map(([k])=>traitMap[k]);

  const flawByTop={
    protect:"You will endanger yourself for those you claim as yours.",
    knowledge:"You will open the book even after the book starts screaming.",
    control:"You trust your plan after sensible people begin evacuating.",
    mercy:"You keep offering second chances to people holding knives.",
    ambition:"You can justify almost any risk if the outcome is large enough.",
    loyalty:"You remain loyal several decisions after loyalty stops being rational.",
    curiosity:"You confuse forbidden with personally addressed.",
    defiance:"You reject manipulation so aggressively that reverse psychology becomes alarmingly effective.",
    survival:"You can survive almost anything except admitting when survival is not enough.",
    social:"You believe every monster has a price, including the ones that do not.",
    strategy:"You keep planning after the room has already caught fire.",
    sacrifice:"You volunteer yourself before checking whether anyone asked.",
    vengeance:"You can wait a very long time for the wrong person to feel safe.",
    hope:"You keep believing long after evidence files a formal complaint.",
    responsibility:"You will carry blame that does not belong to you."
  };

  const dominant=ranked[0]?.[0]||"adapt";
  const secondary=ranked[1]?.[0]||"survival";
  const tertiary=ranked[2]?.[0]||"strategy";

  const paragraphOpen={
    protect:"You orient toward danger by deciding who stands behind you.",
    strategy:"You rarely accept the problem exactly as it is presented.",
    social:"You treat conflict as a negotiation before you treat it as a fight.",
    bond:"You form attachments across lines most people consider sensible.",
    survival:"You are built around continuation, not comfort.",
    adapt:"You do not return from disaster unchanged, but you do return.",
    knowledge:"You are most dangerous when someone tells you not to look.",
    control:"You solve fear by trying to put structure around it.",
    leadership:"People begin waiting for your decision before you realize they have chosen you.",
    mercy:"Your compassion survives situations designed to kill it.",
    ambition:"You look at power less as a prize than as a tool no one trustworthy is using.",
    defiance:"You react badly to cages, including the invisible kind.",
    curiosity:"You would rather face a terrible truth than live beside a locked door.",
    sacrifice:"You are always calculating what part of yourself can be spent."
  }[dominant] || "You are difficult to reduce to a single instinct.";

  const paragraphMiddle={
    protect:"You are protective without being passive.",
    strategy:"You prefer leverage to force and options to obedience.",
    social:"You notice wants, fears, and unspoken bargains quickly.",
    bond:"You treat loyalty as a living responsibility.",
    survival:"You improvise under pressure instead of waiting for perfect conditions.",
    adapt:"You metabolize failure into new behavior.",
    knowledge:"Information becomes a weapon almost immediately in your hands.",
    control:"You are calmer when every threat has a name and a boundary.",
    leadership:"You accept responsibility faster than authority.",
    mercy:"You are capable of kindness without becoming harmless.",
    ambition:"Your goals are large enough to frighten more cautious people.",
    defiance:"You search for the option nobody intended to give you.",
    curiosity:"Every warning sounds slightly like an invitation.",
    sacrifice:"You understand cost, then step forward anyway."
  }[secondary] || "Your secondary instincts complicate the obvious reading.";

  const paragraphClose={
    protect:"The Dungeon will test how many people you can carry before you finally choose yourself.",
    strategy:"The Dungeon will keep changing the rules because it knows you are reading them.",
    social:"The Dungeon will repeatedly put monsters in front of you that cannot be reasoned with.",
    bond:"The Dungeon will weaponize attachment because it has noticed the pattern.",
    survival:"The Dungeon will eventually ask what you are surviving for.",
    adapt:"The Dungeon will struggle to punish you the same way twice.",
    knowledge:"The Dungeon will hide its most dangerous doors behind your curiosity.",
    control:"The Dungeon will create situations that cannot be contained.",
    leadership:"The Dungeon will make every choice public and every consequence personal.",
    mercy:"The Dungeon will try to make compassion feel foolish.",
    ambition:"The Dungeon will offer exactly enough power to make refusal painful.",
    defiance:"The Dungeon will mistake your refusal for a challenge. It is correct.",
    curiosity:"The Dungeon will keep writing your name on sealed things.",
    sacrifice:"The Dungeon will keep accepting pieces of you until you learn to stop offering them."
  }[tertiary] || "The Dungeon has not yet decided how best to exploit this.";

  const personality=`${paragraphOpen} ${paragraphMiddle} ${paragraphClose}`;

  const quirkCandidates=QUIRKS
    .map(q=>({...q,score:q.keys.reduce((s,k)=>s+(state.scores[k]||0),0)}))
    .sort((a,b)=>b.score-a.score);

  const quirks=[];
  for(const q of quirkCandidates){
    if(!quirks.includes(q.text)) quirks.push(q.text);
    if(quirks.length===3) break;
  }

  const total=Object.values(state.scores).reduce((a,b)=>a+b,0);
  const spread=ranked.slice(0,10).reduce((s,[,v])=>s+v,0);
  const survival=Math.min(97,Math.max(14,31+Math.floor(
    (stats.Constitution+stats.Wisdom+stats.Intelligence)/3*2.4
  )));
  const distinctiveness=Math.min(99,Math.max(10,
    Math.round((spread/(total||1))*100 + state.achievements.length*4)
  ));
  const rarityNumber=Math.max(1,Math.round(18-distinctiveness/7));
  const threat = Math.min(99,Math.round(
    stats.Intelligence*1.4 + stats.Charisma + stats.Strength*.8 + state.scores.defiance*.3
  ));

  const secretProtocol=chooseSecretProtocol();

  const draftProfile={
    crawlerNumber:number,
    name:state.name,
    title,
    type:`${classChoice.name.includes("Broker")||classChoice.name.includes("Advocate")?"Social":"Adaptive"} / ${dominant[0].toUpperCase()+dominant.slice(1)}`,
    race:race.name,
    raceNote:race.note,
    className:classChoice.name,
    alignment:`${dominant[0].toUpperCase()+dominant.slice(1)} ${secondary[0].toUpperCase()+secondary.slice(1)}`,
    quote:`“${title}” is not a compliment. It is a warning label.`,
    stats,
    traits,
    flaw:flawByTop[dominant]||"You mistake survivable consequences for permission.",
    personality,
    quirks,
    dominantTraits:ranked.slice(0,8).map(([name,value])=>({name,value})),
    achievements:state.achievements.map(k=>ACHIEVEMENTS[k][0]),
    metrics:{
      survival,
      audience:state.audience,
      sponsor:Math.min(99,Math.round(state.audience*.75+state.scores.ambition*.5+state.scores.social*.4)),
      rarity:`Top ${rarityNumber}%`,
      threat
    },
    answers:state.answers,
    interview:{
      questionsAsked:state.answers.length,
      confidence:state.confidence,
      contradictions:state.contradictions.length,
      aiOpinion:state.aiOpinion
    },
    secretProtocol,
    createdAt:new Date().toISOString()
  };

  draftProfile.rareEnding=chooseRareEnding(draftProfile);
  return draftProfile;
}

function render(){
  const path=location.pathname;
  if(path.startsWith("/crawler/")){
    const num=path.split("/").filter(Boolean)[1];
    return renderPublic(num);
  }
  if(path.startsWith("/compare/")){
    const parts=path.split("/").filter(Boolean);
    return renderComparison(parts[1],parts[2]);
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
    await typeText(p,"> "+t,27);beep(170,.04,.1);
    await sleep(420);
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
    <div class="compare-box">
      <p class="eyebrow">Crawler Comparison</p>
      <div class="compare-inputs">
        <input id="compare-a" inputmode="numeric" placeholder="Crawler number A">
        <input id="compare-b" inputmode="numeric" placeholder="Crawler number B">
        <button class="secondary" id="compare">Compare</button>
      </div>
    </div>
    <small>Unofficial fan-made project. Not affiliated with any author, publisher, or rights holder.</small>
  </section>`;
  const name=document.querySelector("#name"),begin=document.querySelector("#begin");
  name.oninput=()=>begin.disabled=!name.value.trim();
  begin.onclick=()=>{state.name=name.value.trim();buildQueue();state.current=state.queue.shift();state.step="quiz";render();};
  document.querySelector("#find").onclick=()=>{
    const n=document.querySelector("#search").value.replace(/\D/g,"");
    if(n)location.href=`/crawler/${n}`;
  };
  document.querySelector("#compare").onclick=()=>{
    const a=document.querySelector("#compare-a").value.replace(/\D/g,"");
    const b=document.querySelector("#compare-b").value.replace(/\D/g,"");
    if(a&&b)location.href=`/compare/${a}/${b}`;
  };
}

function renderQuiz(){
  const q=state.current;
  const index=state.answers.length+1;
  const estimated=Math.max(MIN_QUESTIONS,Math.min(MAX_QUESTIONS,
    state.confidence>=70?index+2:index+4
  ));
  app.innerHTML=`<section class="panel">
    <div class="warning-strip"><span>Adaptive Hazard Assessment</span></div>
    <div class="progress-frame"><div class="progress"><span style="width:${Math.min(96,index/estimated*100)}%"></span></div></div>
    <div class="interview-status">
      <p class="eyebrow">Assessment ${index} • Variable-Length Interview</p>
      <div class="confidence-chip">AI Confidence: ${state.confidence}%</div>
    </div>
    <div class="status-row">
      <div class="live-chip">Live Audience Feed</div>
      <div class="opinion-chip">AI Status: ${state.aiOpinion.toUpperCase()}</div>
    </div>
    <div class="audience-bar"><span>Interest</span><div class="audience-track"><span style="width:${state.audience}%"></span></div><b>${state.audience}%</b></div>
    ${state.answers.length?`<div class="callback-box"><b>Memory Recall:</b> ${callback()}</div>`:""}
    <div class="ai-speaker"><div class="ai-icon">AI</div><div class="ai-copy" id="intro"></div></div>
    <h2>${escapeHtml(q.prompt)}</h2>
    <textarea id="answer" placeholder="The Dungeon AI is listening..."></textarea>
    <div id="reaction"></div>
    <button id="submit" disabled>${index>=MAX_QUESTIONS?"Complete Classification":"Submit Response"}</button>
  </section>`;
  typeText(document.querySelector("#intro"),q.intro,24);
  const ans=document.querySelector("#answer"),btn=document.querySelector("#submit");
  ans.oninput=()=>btn.disabled=!ans.value.trim();
  btn.onclick=()=>submitAnswer(ans.value.trim(),btn);
}

async function submitAnswer(answer,btn){
  btn.disabled=true;
  const tags=analyze(answer);
  const contradiction=detectContradiction(answer,tags);

  state.aiOpinion=chooseOpinion(tags,answer,contradiction);
  state.answers.push({
    id:state.current.id,
    prompt:state.current.prompt,
    answer,
    tags,
    contradictionResponse:Boolean(state.current.isContradiction)
  });

  state.confidence=scoreConfidence();

  const reactionText=[
    commentary(tags,answer),
    aiOpinionLine(),
    contradiction?`No. Something does not align. ${contradiction.label}.`:"",
    state.confidence>=70?`Classification confidence is now ${state.confidence}%.`:""
  ].filter(Boolean).join(" ");

  document.querySelector("#reaction").innerHTML=`
    <div class="reaction">
      <b>DUNGEON AI:</b> <span id="rc"></span>
      <div class="tag-row">
        ${tags.map(t=>`<span class="tag">${t.toUpperCase()} DETECTED</span>`).join("")}
        ${contradiction?`<span class="tag contradiction-tag">CONTRADICTION</span>`:""}
      </div>
    </div>`;

  await typeText(document.querySelector("#rc")," "+reactionText,21);
  await sleep(1800);

  if(contradiction && state.followUpsAsked<3){
    state.followUpsAsked+=1;
    state.current=createContradictionQuestion(contradiction);
  }else if(shouldFinish()){
    state.step="processing";
    render();
    return;
  }else{
    state.current=state.queue.length?state.queue.shift():chooseNext();
  }

  if(state.answers.length===4||state.answers.length===8||contradiction){
    await interruption();
  }

  flashScreen();
  render();
}

async function interruption(){
  const o=document.createElement("div");o.className="interruption";
  o.innerHTML=`<div class="interruption-box"><h2>${pick(["LIVE FEED","SPONSOR PING","SYSTEM ALERT"])}</h2><p>${pick(["Viewer retention has increased. Dignity remains unscored.","Two weapon brands and one soup company have expressed interest.","Your answers have triggered an unscheduled psychological review."])}</p></div>`;
  document.body.appendChild(o);await sleep(20);o.classList.add("active");beep(360,.15,.25);vibrate([80,40,80]);await sleep(2600);o.remove();
}

async function renderProcessing(){
  const chosenMessages=shuffled(PROCESSING_MESSAGES).slice(0,10);

  app.innerHTML=`
    <section class="reveal-overlay">
      <div class="reveal-sequence">
        <h2>PROCESSING</h2>
        <p id="status">Initializing crawler classification...</p>
        <div class="reveal-meter"><span id="reveal-progress"></span></div>
        <div class="processing-counter" id="processing-counter">0%</div>
      </div>
    </section>`;

  const status=document.querySelector("#status");
  const progress=document.querySelector("#reveal-progress");
  const counter=document.querySelector("#processing-counter");

  for(let i=0;i<chosenMessages.length;i+=1){
    const percent=Math.round(((i+1)/chosenMessages.length)*92);
    await typeText(status,chosenMessages[i],24);
    progress.style.width=`${percent}%`;
    counter.textContent=`${percent}%`;

    const holdTime=i===chosenMessages.length-1?3200:2600+Math.floor(Math.random()*700);
    await sleep(holdTime);
  }

  try{
    const temp=buildProfile(null);

    status.textContent="Assigning permanent crawler identity...";
    progress.style.width="96%";
    counter.textContent="96%";
    await sleep(2800);

    const data=await api("POST",{profile:temp});
    state.profile={...temp,crawlerNumber:data.crawlerNumber};

    progress.style.width="100%";
    counter.textContent="100%";
    await sleep(1000);

    await runFinalReveal();
  }catch(e){
    app.innerHTML=`
      <section class="panel">
        <h2>Registry Failure</h2>
        <div class="error-banner">${escapeHtml(e.message)}</div>
        <button onclick="location.reload()">Restart Intake</button>
      </section>`;
  }
}

async function runFinalReveal(){
  app.innerHTML=`
    <section class="final-reveal-screen">
      <div class="final-reveal-line" id="final-line"></div>
    </section>`;

  const line=document.querySelector("#final-line");

  await sleep(900);
  await typeText(line,"CLASSIFICATION COMPLETE.",34);
  beep(220,.16,.25);
  vibrate([80,50,80]);
  await sleep(2200);

  line.classList.add("fade-out");
  await sleep(650);

  line.classList.remove("fade-out");
  line.innerHTML=`
    <span>WELCOME TO THE DUNGEON,</span>
    <strong>CRAWLER #${Number(state.profile.crawlerNumber).toLocaleString()}</strong>
  `;
  line.classList.add("crawler-welcome");
  beep(340,.18,.28);
  vibrate([100,60,140]);
  await sleep(2600);

  line.classList.add("fade-out");
  await sleep(650);

  state.step="result";
  flashScreen();
  render();
}

function renderCard(p,own=false){
  app.innerHTML=`<section style="width:min(930px,100%)">
    <div class="card revealed" id="crawler-card">
      <div class="warning-strip"><span>Official Crawler Dossier</span></div>
      <header><div><p class="eyebrow">Dungeon Registration Complete</p><h2>${escapeHtml(p.name)}</h2><h3>“${escapeHtml(p.title)}”</h3><div class="rarity-badge">${p.metrics.rarity} PROFILE</div></div>
      <div class="number"><span>Crawler</span><strong>#${Number(p.crawlerNumber).toLocaleString()}</strong></div></header>
      <div class="classification"><b>${p.type}</b><span>${p.alignment}</span><em>Threat: ${p.metrics.survival>72?"HIGH":"MODERATE"}</em></div>
      ${p.rareEnding?`<div class="rare-ending">
        <span>${p.rareEnding.rarity}</span>
        <strong>${p.rareEnding.title}</strong>
        <p>${p.rareEnding.note}</p>
      </div>`:""}
      <div class="metrics-grid">
        <div class="metric"><span>Survival Odds</span><b>${p.metrics.survival}%</b></div>
        <div class="metric"><span>Audience</span><b>${p.metrics.audience}%</b></div>
        <div class="metric"><span>Sponsor Appeal</span><b>${p.metrics.sponsor}%</b></div>
        <div class="metric"><span>Threat Index</span><b>${p.metrics.threat||"?"}</b></div>
      </div>
      <div class="grid"><section><h4>Attributes</h4>${Object.entries(p.stats).map(([k,v])=>`<div class="stat"><span>${k}</span><b>${v}</b></div>`).join("")}</section>
      <section><h4>Starting Traits</h4>${p.traits.map(t=>`<div class="trait"><b>${t}</b><p>Behavioral pattern confirmed across multiple answers.</p></div>`).join("")}</section></div>
      <div class="path"><div><span>Race Affinity</span><b>${p.race}</b><p>${p.raceNote||""}</p></div><div><span>Class Candidate</span><b>${p.className}</b></div></div>
      <blockquote>${p.quote}</blockquote>
      ${p.personality?`<div class="profile-analysis"><b>PSYCHOLOGICAL SUMMARY:</b><p>${p.personality}</p></div>`:""}
      <div class="weakness"><b>Exploitable Flaw:</b> ${p.flaw}</div>
      ${p.quirks?.length?`<div class="quirk-grid">${p.quirks.map(q=>`<div class="quirk-card"><b>DUNGEON QUIRK</b><p>${q}</p></div>`).join("")}</div>`:""}
      ${p.dominantTraits?.length?`<div class="trait-spectrum"><h4>Hidden Trait Spectrum</h4>${p.dominantTraits.map(t=>`<div class="spectrum-row"><span>${t.name.replace(/([A-Z])/g," $1")}</span><div><i style="width:${Math.min(100,t.value*5)}%"></i></div><b>${t.value}</b></div>`).join("")}</div>`:""}
      ${p.interview?`<div class="interview-diagnostics">
        <div><span>Questions Required</span><b>${p.interview.questionsAsked}</b></div>
        <div><span>AI Confidence</span><b>${p.interview.confidence}%</b></div>
        <div><span>Contradictions Found</span><b>${p.interview.contradictions}</b></div>
        <div><span>AI Opinion</span><b>${p.interview.aiOpinion}</b></div>
      </div>`:""}
      ${p.secretProtocol?`<details class="sealed-protocol">
        <summary>SEALED SYSTEM NOTE // PROTOCOL ${p.secretProtocol.code}</summary>
        <p>${p.secretProtocol.text}</p>
      </details>`:""}
      <div class="achievement-list">${(p.achievements||[]).map(a=>`<span class="achievement-pill">${a}</span>`).join("")}</div>
      <div class="ai-private-note"><b>LEAKED AI NOTE:</b> This profile was generated from intersecting behavioral patterns, not a single archetype. Repeating the intake with materially different answers may produce an entirely different classification.</div>
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


function compactProfileCard(p){
  return `<article class="compare-card">
    <div class="number"><span>Crawler</span><strong>#${Number(p.crawlerNumber).toLocaleString()}</strong></div>
    <h2>${escapeHtml(p.name)}</h2>
    <h3>“${escapeHtml(p.title)}”</h3>
    <div class="path">
      <div><span>Race</span><b>${p.race}</b></div>
      <div><span>Class</span><b>${p.className}</b></div>
    </div>
    <div class="compare-metrics">
      <span>Survival <b>${p.metrics.survival}%</b></span>
      <span>Threat <b>${p.metrics.threat||"?"}</b></span>
      <span>Rarity <b>${p.metrics.rarity}</b></span>
    </div>
    <div class="trait-match-list">
      ${(p.dominantTraits||[]).slice(0,5).map(t=>`<span>${t.name}: ${t.value}</span>`).join("")}
    </div>
  </article>`;
}

async function renderComparison(a,b){
  app.innerHTML=`<section class="panel"><h2>Loading Comparison</h2><p class="lede">Cross-referencing crawler dossiers...</p></section>`;

  try{
    const [left,right]=await Promise.all([api("GET",null,a),api("GET",null,b)]);
    const p1=left.profile,p2=right.profile;

    const traits1=new Set((p1.dominantTraits||[]).slice(0,8).map(t=>t.name));
    const traits2=new Set((p2.dominantTraits||[]).slice(0,8).map(t=>t.name));
    const overlap=[...traits1].filter(t=>traits2.has(t));
    const compatibility=Math.max(8,Math.min(98,
      35+overlap.length*9-Math.abs((p1.metrics.threat||50)-(p2.metrics.threat||50))/3
    ));

    app.innerHTML=`<section class="comparison-shell">
      <div class="warning-strip"><span>Crawler Compatibility Analysis</span></div>
      <div class="comparison-grid">
        ${compactProfileCard(p1)}
        <div class="versus">VS</div>
        ${compactProfileCard(p2)}
      </div>
      <div class="compatibility-result">
        <span>Estimated Party Compatibility</span>
        <strong>${Math.round(compatibility)}%</strong>
        <p>${overlap.length?`Shared patterns: ${overlap.join(", ")}.`:"No major dominant traits overlap. This may be excellent or catastrophic."}</p>
      </div>
      <div class="actions"><button class="dark" onclick="location.href='/'">Return Home</button></div>
    </section>`;
  }catch(error){
    app.innerHTML=`<section class="panel"><h2>Comparison Failed</h2><div class="error-banner">${escapeHtml(error.message)}</div><button onclick="location.href='/'">Return Home</button></section>`;
  }
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
