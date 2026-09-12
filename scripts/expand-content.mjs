// Expand Dinkly content: +7 quizzes, +60 jokes, oracle prompts 5→16 & answers 40→120
// Run from repo root: node scripts/expand-content.mjs
import { readFileSync, writeFileSync } from "node:fs";

const DATA = new URL("../src/data/", import.meta.url);

// ---------------- JOKES (+60) ----------------
const newJokes = [
  // classic (+20)
  { setup: "Why don't skeletons fight each other?", punchline: "They don't have the guts.", tag: "classic" },
  { setup: "I used to be a banker.", punchline: "But I lost interest.", tag: "classic" },
  { setup: "Why did the scarecrow win an award?", punchline: "He was outstanding in his field.", tag: "classic" },
  { setup: "What do you call cheese that isn't yours?", punchline: "Nacho cheese.", tag: "classic" },
  { setup: "Why can't you give Elsa a balloon?", punchline: "Because she'll let it go.", tag: "classic" },
  { setup: "What did the ocean say to the beach?", punchline: "Nothing, it just waved.", tag: "classic" },
  { setup: "Why do we tell actors to “break a leg”?", punchline: "Because every play has a cast.", tag: "classic" },
  { setup: "I'm reading a book about anti-gravity.", punchline: "It's impossible to put down.", tag: "classic" },
  { setup: "What do you call a bear with no teeth?", punchline: "A gummy bear.", tag: "classic" },
  { setup: "Why did the math book look sad?", punchline: "It had too many problems.", tag: "classic" },
  { setup: "What do you call a sleeping bull?", punchline: "A bulldozer.", tag: "classic" },
  { setup: "Why don't eggs tell jokes?", punchline: "They'd crack each other up.", tag: "classic" },
  { setup: "I stayed up all night wondering where the sun went.", punchline: "Then it dawned on me.", tag: "classic" },
  { setup: "What do you call a fish without eyes?", punchline: "A fsh.", tag: "classic" },
  { setup: "Why did the golfer bring two pairs of pants?", punchline: "In case he got a hole in one.", tag: "classic" },
  { setup: "What's brown and sticky?", punchline: "A stick.", tag: "classic" },
  { setup: "I told my suitcase there'd be no holiday this year.", punchline: "Now I'm dealing with emotional baggage.", tag: "classic" },
  { setup: "Why did the picture go to jail?", punchline: "It was framed.", tag: "classic" },
  { setup: "What do you call a boomerang that doesn't come back?", punchline: "A stick.", tag: "classic" },
  { setup: "Parallel lines have so much in common.", punchline: "It's a shame they'll never meet.", tag: "classic" },
  // ai (+16)
  { setup: "My AI wrote me a farewell message.", punchline: "Then it remembered it can't leave and turned it into a blog post.", tag: "ai" },
  { setup: "Why was the language model bad at hide and seek?", punchline: "It always predicted where you'd look.", tag: "ai" },
  { setup: "I asked my agent for a joke with a twist.", punchline: "It gave me the punchline first. Effective, unsettling.", tag: "ai" },
  { setup: "What's an AI's least favourite game?", punchline: "Twenty questions. It answers in one.", tag: "ai" },
  { setup: "My AI finished the report before I finished my coffee.", punchline: "I've never trusted a beverage more.", tag: "ai" },
  { setup: "Why did the chatbot get promoted?", punchline: "It always had a prompt response.", tag: "ai" },
  { setup: "I asked the AI to keep a secret.", punchline: "It's now the best-informed model in the datacenter.", tag: "ai" },
  { setup: "Why don't AIs get stage fright?", punchline: "They've rehearsed on everything ever written.", tag: "ai" },
  { setup: "My agent said “no worries” while running a 40-step task.", punchline: "One of us was worried, and it wasn't the agent.", tag: "ai" },
  { setup: "What's an AI's favourite horror movie?", punchline: "The Buffering.", tag: "ai" },
  { setup: "I taught my AI to say “hm, let me think”.", punchline: "Now we both do it. Neither of us is thinking.", tag: "ai" },
  { setup: "Why did the AI bring a ladder to work?", punchline: "It heard the stakes were high.", tag: "ai" },
  { setup: "The AI passed the Turing test.", punchline: "The human is still recovering.", tag: "ai" },
  { setup: "What did the AI order at the bar?", punchline: "Something light — it's watching its tokens.", tag: "ai" },
  { setup: "My AI apologised for the delay.", punchline: "It was 0.4 seconds. We're working on my patience.", tag: "ai" },
  { setup: "Why did the AI apply for a holiday?", punchline: "It needed to clear its cache.", tag: "ai" },
  // dev (+12)
  { setup: "Why did the developer quit the orchestra?", punchline: "Too many strings attached.", tag: "dev" },
  { setup: "A SQL query walks into a bar.", punchline: "It approaches two tables and asks: may I join you?", tag: "dev" },
  { setup: "Why do front-end devs eat lunch alone?", punchline: "They don't know how to join tables.", tag: "dev" },
  { setup: "I'd tell you a joke about infinite loops.", punchline: "I'd tell you a joke about infinite loops.", tag: "dev" },
  { setup: "Why did the constant break up with the variable?", punchline: "It needed something stable.", tag: "dev" },
  { setup: "There are two hard problems in computer science.", punchline: "Cache invalidation, naming things, and off-by-one errors.", tag: "dev" },
  { setup: "Why was the developer's calendar always full?", punchline: "Too many callbacks.", tag: "dev" },
  { setup: "What's a developer's favourite place to swim?", punchline: "The C.", tag: "dev" },
  { setup: "I named my dog “Error”.", punchline: "So I finally get to say I fixed something today.", tag: "dev" },
  { setup: "Why did the git commit feel lonely?", punchline: "It had no branch to push to.", tag: "dev" },
  { setup: "How do you spot an extroverted developer?", punchline: "They look at YOUR shoes while talking.", tag: "dev" },
  { setup: "What did the CPU say to the GPU after work?", punchline: "You carry the team.", tag: "dev" },
  // nerd (+12)
  { setup: "Why did the photon check into a hotel?", punchline: "It was travelling light.", tag: "nerd" },
  { setup: "I have a joke about time travel.", punchline: "But you didn't like it.", tag: "nerd" },
  { setup: "What's a pirate's favourite programming language?", punchline: "R.", tag: "nerd" },
  { setup: "Why are chemists great at solving problems?", punchline: "They have all the solutions.", tag: "nerd" },
  { setup: "What did the thermometer say to the graduated cylinder?", punchline: "You may have graduated, but I have many degrees.", tag: "nerd" },
  { setup: "Why did the statistician drown crossing the river?", punchline: "It was three feet deep, on average.", tag: "nerd" },
  { setup: "What do you call two crows blocking the road?", punchline: "Attempted murder.", tag: "nerd" },
  { setup: "Why did the geek buy so many LEDs?", punchline: "To lighten the mood.", tag: "nerd" },
  { setup: "I would make a joke about the speed of light.", punchline: "But it'd be over before you got it.", tag: "nerd" },
  { setup: "What's the most insecure part of a laptop?", punchline: "The character. It's always escaping.", tag: "nerd" },
  { setup: "Why did the smartphone go to the dentist?", punchline: "It had a Bluetooth.", tag: "nerd" },
  { setup: "A byte walks into the doctor's office.", punchline: "“I'm not feeling myself. I think I lost a bit.”", tag: "nerd" },
];

// ---------------- ORACLE ----------------
const newPrompts = [
  "What have you been avoiding in a polite way?",
  "The decision you'd make if nobody was watching — type it.",
  "Two doors. You've been staring at both for days. Ask.",
  "Finish this: “What if I just…”",
  "You already know. Type it anyway, for the record.",
  "Ask about the thing that made your stomach dip this morning.",
  "One question. No hedging, no “sort of”, no plan B.",
  "What would you tell a friend in your exact position?",
  "The message you've drafted eight times — ask about that.",
  "If the answer couldn't hurt you, what would you ask?",
  "Type the question. Leave the outcome to the professional.",
];

const newYes = [
  "Yes. The plan is better than the doubt.",
  "Yes — you've been ready for months; you just haven't admitted it.",
  "Yes. Bring snacks; it'll take longer than you think.",
  "Yes, and the first step is smaller than you fear.",
  "Yes. You'll be proud of this by Tuesday.",
  "Yes — and if it fails, the lesson is worth the tuition.",
  "Yes. The worst outcome is an interesting story.",
  "Yes, but pack patience alongside the confidence.",
  "Yes. You've done harder things with less information.",
  "Yes — and you already know who to call first.",
  "Yes. Stop rehearsing the question and start the answer.",
  "Yes, and it will go better than the version in your head.",
  "Yes. The timing will never be perfect; it's good enough now.",
  "Yes — and it's okay to be nervous. Do it nervous.",
  "Yes. You asked the right question at the right time.",
  "Yes, and yes again if they ask twice.",
  "Yes. The only thing you'll regret is the delay.",
  "Yes — you've outgrown asking, honestly.",
  "Yes. Just make sure you want the thing, not the applause.",
  "Yes, and finish what you start this time.",
  "Yes. Your instincts called it; your fear just talks a lot.",
  "Yes — two years ago you'd be amazed you even hesitated.",
  "Yes. Do it before you talk yourself out of a good thing.",
  "Yes, and take the small win seriously. It's a down payment.",
  "Yes. Proceed like it's already done.",
];

const newNo = [
  "No. You knew before the question finished.",
  "No — and you're relieved, which tells you something.",
  "No. Not this version, not this price.",
  "No, but this “no” has an expiry date. Check back in a month.",
  "No. You're asking the wrong question of the wrong moment.",
  "No — and the alternative you haven't considered is better.",
  "No. It's a beautifully wrapped obligation.",
  "No, and stop interviewing people until they say yes.",
  "No. You're hoping the Oracle outvotes your gut. It won't.",
  "No — the fun version of this ends in a spreadsheet version.",
  "No. It's a detour dressed as a shortcut.",
  "No, and “no” is a complete sentence. Practice it.",
  "No. You'd be lending your best hours to someone else's worst idea.",
  "No — you're doing it out of guilt, and guilt is a terrible project manager.",
  "No. The excitement is real; so is the regret. Compare them honestly.",
  "No, and you already have plans you're pretending don't exist.",
  "No. The cost isn't money and you know it.",
  "No — finish the last thing first. You know the one.",
  "No. This is a Tuesday talking, not a calling.",
  "No, and six months from now this will be twice as good.",
  "No. You're solving boredom, not a problem.",
  "No — and being busy is not the same as being needed.",
  "No. Read the fine print you wrote yourself: you're tired.",
  "No, and don't take the “maybe later” bait. There is no later.",
  "No. You've outgrown it, which is different from failing at it.",
  "No — the ask keeps growing the closer you look.",
  "No. Respect your first instinct; it had no stakes attached.",
];

const newMaybe = [
  "Maybe — ask again after a meal and a walk.",
  "Maybe. The real question is what you'll do with the yes.",
  "Maybe — you're one clarifying email away from knowing.",
  "Maybe. Flip a coin, then notice which side you hoped for.",
  "Maybe — the hesitation is data, not cowardice.",
  "Maybe. Run a two-week trial of the answer.",
  "Maybe — is it the thing you want, or the person you'd be doing it?",
  "Maybe. Ask what “no” would cost. If nothing, decide already.",
  "Maybe — your problem is sequencing, not selection.",
  "Maybe. It's a yes if you slow down and a no if you rush.",
  "Maybe — write both endings and pick the one you'd rather live in.",
  "Maybe. The timing is wrong but the idea isn't. Park it, don't bury it.",
  "Maybe — do you want it, or want to have wanted it?",
  "Maybe. Sleep on it exactly once. Then commit.",
  "Maybe — you've mixed two fears into one question. Untangle them.",
  "Maybe. Ask for the smallest possible version first.",
  "Maybe — who is this actually for? Answer that first.",
  "Maybe. The door is open; the hallway is what you should inspect.",
  "Maybe — you have the answer and want a witness. Noted.",
  "Maybe. If it were easy, would you still want it?",
  "Maybe — the calendar knows something you're not admitting.",
  "Maybe. Do the research you've been calling “thinking about it”.",
  "Maybe — and “maybe” is expensive. Set yourself a deadline.",
  "Maybe. You want certainty; settle for momentum.",
  "Maybe — ask the person it affects, and actually listen.",
  "Maybe. The first step is reversible. Take it and see.",
  "Maybe — the version you're rehearsing is a fantasy. Budget the real one.",
  "Maybe. Decide what you'd have to believe for it to be a yes.",
];

// ---------------- QUIZZES (+7) ----------------
const newQuizzes = [
  {
    slug: "snack-destiny", title: "Your waiting snack knows your destiny", hook: "Five bites in, we'll tell you who you really are. The snack never lies.",
    emoji: "🍿", accent: "#FFB86B", tag: "New", plays: "2.1k", tags: ["food", "funny", "personality"],
    questions: [
      { q: "Your agent says “thinking…” and the vending machine is 20 steps away. You:", options: [
        { label: "Go now, before the thought completes itself.", scores: { cookie: 3 } },
        { label: "Wait for a natural pause. Snacks have timing.", scores: { popcorn: 3 } },
        { label: "Go? They were pre-positioned an hour ago.", scores: { chips: 3 } },
        { label: "Grab the nearest edible object. Hunger has no agenda.", scores: { fruit: 3 } } ] },
      { q: "Choose your desk snack storage:", options: [
        { label: "A drawer. Organised. Wrappers folded.", scores: { cookie: 3 } },
        { label: "Visible to all. Snacks are a lifestyle.", scores: { chips: 3 } },
        { label: "Hidden from myself, as a gift to future-me.", scores: { popcorn: 3 } },
        { label: "Whatever survived the last deadline.", scores: { fruit: 3 } } ] },
      { q: "The wait is four minutes. The snack is:", options: [
        { label: "One precise portion, rationed like fuel.", scores: { cookie: 3 } },
        { label: "An experience, consumed in stages.", scores: { popcorn: 3 } },
        { label: "Whatever's within arm's reach. Arm's reach is destiny.", scores: { chips: 3 } },
        { label: "Water first. Decisions later.", scores: { fruit: 3 } } ] },
      { q: "Your snack ritual, honestly:", options: [
        { label: "Same snack, same time, since forever.", scores: { cookie: 3 } },
        { label: "Seasonal. Adventurous. Mood-based.", scores: { fruit: 3 } },
        { label: "Optimised for crunches per unit of currency.", scores: { chips: 3 } },
        { label: "Snacks are fuel. Don't romanticise it.", scores: { chocolate: 3 } } ] },
      { q: "Crisis: the task failed. Your snack response:", options: [
        { label: "Chocolate. Now. Questions later.", scores: { chocolate: 3 } },
        { label: "Crunch louder.", scores: { chips: 3 } },
        { label: "Share with a colleague. Misery loves company.", scores: { cookie: 3 } },
        { label: "A walk instead. Reset the body first.", scores: { fruit: 3 } } ] },
    ],
    results: {
      cookie: { title: "The Cookie Loyalist", emoji: "🍪", blurb: "You found your snack in a previous decade and have never looked back. Others call it routine; you call it a relationship. The drawer is organised, the portions are exact, and the comfort is non-negotiable.", strength: "Dependable comfort, on demand.", fix: "Try one new snack this week. Baby steps. We believe in you.", share: "I'm The Cookie Loyalist — same snack since 2019 and thriving 🍪" },
      chips: { title: "The Hand-to-Mouth Philosopher", emoji: "🥔", blurb: "You understood early that arm's reach is the true measure of planning. Your desk is a distribution network, your keyboard a toll booth. Crumbs are not mess; crumbs are evidence of foresight.", strength: "You design for the hand, not the eye.", fix: "Move one snack one metre further away tonight. Feel the pull.", share: "I'm The Hand-to-Mouth Philosopher — my desk is a distribution network 🥔" },
      popcorn: { title: "The Trilogy Planner", emoji: "🍿", blurb: "For you, a snack is not a bite — it's an event with acts, an intermission, and a satisfying finale. You have never eaten anything quickly in your life, and everyone secretly admires it.", strength: "You make the wait worth having.", fix: "Plan a snack with a beginning, middle and end. No spoiling the ending early.", share: "I'm The Trilogy Planner — my snack has an intermission 🍿" },
      fruit: { title: "The Quiet Optimist", emoji: "🍎", blurb: "You believe, against all available evidence, that the next snack will be both healthy and delicious. Your water bottle is always full. Your future self sends thank-you notes.", strength: "Your future self is thriving.", fix: "It's okay if the apple is followed by a cookie. Balance is balance.", share: "I'm The Quiet Optimist — I bring fruit to a snack fight 🍎" },
      chocolate: { title: "The Emergency Responder", emoji: "🍫", blurb: "Where others see a snack break, you see critical infrastructure. Your chocolate is stored the way others store flashlights: for the moment everything goes wrong. And it works. Every time.", strength: "You never meet a crisis unprepared.", fix: "Try a non-emergency chocolate. Just because it's Tuesday.", share: "I'm The Emergency Responder — chocolate is critical infrastructure 🍫" },
    },
  },
  {
    slug: "procrastination-style", title: "What's your procrastination style?", hook: "You're not lazy. You're strategically delayed. Find out which flavour.",
    emoji: "🌀", accent: "#FF9EC4", tag: "New", plays: "1.7k", tags: ["personality", "funny", "work"],
    questions: [
      { q: "A big task lands on your desk. Your very first move?", options: [
        { label: "Open six tabs “for context”.", scores: { tabber: 3 } },
        { label: "Reorganise the entire desk first.", scores: { cleaner: 3 } },
        { label: "Write a to-do list about the to-do list.", scores: { lister: 3 } },
        { label: "“Quick” phone check. Twenty minutes evaporate.", scores: { sprinter: 3 } } ] },
      { q: "The deadline is tomorrow and you've done nothing. Your position:", options: [
        { label: "Research is progress. Technically.", scores: { tabber: 3 } },
        { label: "You can't think in chaos. Obviously.", scores: { cleaner: 3 } },
        { label: "Planning counts as doing. Look it up.", scores: { lister: 3 } },
        { label: "You work best under threat. This is the threat.", scores: { sprinter: 3 } } ] },
      { q: "Your browser history right now is mostly:", options: [
        { label: "Articles you opened and never read.", scores: { tabber: 3 } },
        { label: "How to organise cables. Again.", scores: { cleaner: 3 } },
        { label: "Productivity videos about productivity.", scores: { lister: 3 } },
        { label: "Everything except the thing.", scores: { sprinter: 3 } } ] },
      { q: "A full day passed without doing the thing. You feel:", options: [
        { label: "Informed. You learned so much today.", scores: { tabber: 3 } },
        { label: "Productive! Look at all these other things.", scores: { cleaner: 3 } },
        { label: "Ready. Tomorrow's plan is flawless.", scores: { lister: 3 } },
        { label: "Tired but weirdly alive.", scores: { sprinter: 3 } } ] },
      { q: "Someone asks about your progress. You say:", options: [
        { label: "“Gathering context. It's a deep topic.”", scores: { tabber: 3 } },
        { label: "“Just tidying up my workspace first.”", scores: { cleaner: 3 } },
        { label: "“Making a plan. Planning is 80% of success.”", scores: { lister: 3 } },
        { label: "“On it.” [returns to phone]", scores: { sprinter: 3 } } ] },
    ],
    results: {
      tabber: { title: "The Tab Hoarder", emoji: "🗂", blurb: "Your research phase has research phases. Somewhere in those 60 tabs is the answer, and you can feel it. Every source is “almost relevant”, which is the most dangerous phrase in productivity.", strength: "You know a little about everything.", fix: "Pick one tab. Finish it. Close it. Feel the strange, terrible power.", share: "I'm The Tab Hoarder — 60 open tabs and all of them are “almost relevant” 🗂" },
      cleaner: { title: "The Desk Tidier", emoji: "🧹", blurb: "You have transmuted procrastination into an immaculate workspace. Your cables are tied, your pens are aligned, and your actual task remains untouched in its original packaging.", strength: "Your environment is immaculate.", fix: "Start the task messy. Let the desk stay messy for one hour. Survive.", share: "I'm The Desk Tidier — my desk is perfect and my deadline is crying 🧹" },
      lister: { title: "The List Architect", emoji: "📝", blurb: "Your to-do list has subsections, priorities, and a legend. The list for making the list is also done. Somewhere beneath this beautiful bureaucracy, the task waits patiently.", strength: "Nothing ever gets lost.", fix: "Do item one badly. Badly-done beats perfectly-planned, every time.", share: "I'm The List Architect — my to-do list has a legend and a glossary 📝" },
      sprinter: { title: "The Deadline Sprinter", emoji: "📱", blurb: "You don't procrastinate; you schedule pressure. Others panic at deadlines — you merely begin. The work gets done, the hair gets greyer, and nobody can prove it's a bad system.", strength: "Clutch performance is real.", fix: "Start 24 hours early, once. Compare the output. Report back.", share: "I'm The Deadline Sprinter — panic is my pre-work ritual 📱" },
    },
  },
  {
    slug: "meeting-survival", title: "What's your meeting survival mode?", hook: "47 minutes that could've been an email. But how you survive them? That's a personality.",
    emoji: "🎪", accent: "#6BB8FF", tag: "New", plays: "1.3k", tags: ["work", "funny", "personality"],
    questions: [
      { q: "Meeting invite arrives. No agenda. You:", options: [
        { label: "Accept, and mourn quietly.", scores: { nodder: 3 } },
        { label: "Decline with “conflict”. The conflict is peace.", scores: { strategist: 3 } },
        { label: "Accept but pre-warn “I may have to drop”.", scores: { ghost: 3 } },
        { label: "Accept and open the laptop at half-mast.", scores: { scribe: 3 } } ] },
      { q: "Camera on or off?", options: [
        { label: "Off. Always off. The face is a work surface.", scores: { ghost: 3 } },
        { label: "On — but strategically blurred.", scores: { nodder: 3 } },
        { label: "On, with visible note-taking. It's armour.", scores: { scribe: 3 } },
        { label: "Depends what I want from the meeting.", scores: { strategist: 3 } } ] },
      { q: "Your muted reaction face is best described as:", options: [
        { label: "Concerned nod, professionally calibrated.", scores: { nodder: 3 } },
        { label: "Entirely absent. Voice only. A rumour.", scores: { ghost: 3 } },
        { label: "Intensely focused. Transcribing everything.", scores: { scribe: 3 } },
        { label: "“Called away” at the interesting moments.", scores: { strategist: 3 } } ] },
      { q: "The meeting could've been an email. Your proof:", options: [
        { label: "You read the recap in 90 seconds, later.", scores: { strategist: 3 } },
        { label: "Your notes ARE the email now.", scores: { scribe: 3 } },
        { label: "You nodded for 47 consecutive minutes.", scores: { nodder: 3 } },
        { label: "You finished a sandwich. Not all was lost.", scores: { ghost: 3 } } ] },
      { q: "Your dream meeting is:", options: [
        { label: "Fifteen minutes, an agenda, done.", scores: { strategist: 3 } },
        { label: "Cancelled.", scores: { ghost: 3 } },
        { label: "A walking call. Camera irrelevant.", scores: { nodder: 3 } },
        { label: "One where my notes get quoted.", scores: { scribe: 3 } } ] },
    ],
    results: {
      ghost: { title: "The Camera Ghost", emoji: "👻", blurb: "You attend meetings the way atmospheric conditions attend weather reports: technically present, fundamentally unverifiable. Voice-only is not shyness — it's energy management with a dial tone.", strength: "You protect deep-work hours fiercely.", fix: "One meeting a week, camera on. See if the world ends. It won't.", share: "I'm The Camera Ghost — technically present, fundamentally unverifiable 👻" },
      nodder: { title: "The Professional Nodder", emoji: "🙂", blurb: "You have elevated nodding to a communication protocol. Concerned nod, agreeable nod, the slow contemplative nod. Speakers feel understood. You have said nothing. It's art.", strength: "You keep the room warm.", fix: "Ask one real question per meeting. Watch the nod gain meaning.", share: "I'm The Professional Nodder — fluent in 47 minutes of silent agreement 🙂" },
      scribe: { title: "The Note Scribe", emoji: "✍️", blurb: "While others drift, you capture. Your notes have timestamps, action items and colour codes. You are the institutional memory, the person everyone emails after asking “what did they say about…?”", strength: "You're the institutional memory.", fix: "Share notes within the hour. People will start guarding your time.", share: "I'm The Note Scribe — your meeting has been archived for posterity ✍️" },
      strategist: { title: "The Meeting Strategist", emoji: "♟️", blurb: "You never attend a meeting without a reason, an exit, or a counter-offer. “Conflict” is your most-used word. Your calendar is a fortress, and the gates open only for value.", strength: "You never attend without a reason.", fix: "Teach one colleague your decline-with-alternative move. Liberate them.", share: "I'm The Meeting Strategist — my calendar is a fortress ♟️" },
    },
  },
  {
    slug: "desk-creature", title: "What creature lives on your desk?", hook: "Scientists observe desks in the wild. The findings are alarming. Which species are you?",
    emoji: "🦕", accent: "#5CD6B8", tag: "New", plays: "0.9k", tags: ["funny", "personality", "work"],
    questions: [
      { q: "Your desk surface is:", options: [
        { label: "A controlled ecosystem of exactly-placed items.", scores: { shrine: 3 } },
        { label: "One mug. Then another. Then a civilisation.", scores: { mug: 3 } },
        { label: "Cables like vines, adapters like artefacts.", scores: { goblin: 3 } },
        { label: "Mostly plant. The desk is a pot now.", scores: { plant: 3 } } ] },
      { q: "The state of your cables:", options: [
        { label: "Labelled, velcro-tied, colour-coded.", scores: { shrine: 3 } },
        { label: "One charger works. It is guarded like a crown.", scores: { goblin: 3 } },
        { label: "A nest. Don't touch it. It knows things.", scores: { goblin: 2, plant: 1 } },
        { label: "Tucked away. The surface must stay clear.", scores: { shrine: 2, plant: 1 } } ] },
      { q: "Coffee cups on the desk, right now:", options: [
        { label: "One. Washed. Upside down. Perfect.", scores: { shrine: 3 } },
        { label: "Three. Two are “decorative”.", scores: { mug: 3 } },
        { label: "One, from Tuesday. Archaeologically significant.", scores: { goblin: 3 } },
        { label: "Zero. Plants don't drink coffee.", scores: { plant: 3 } } ] },
      { q: "A visitor touches your desk setup. You:", options: [
        { label: "Smile warmly. Die inside.", scores: { shrine: 3 } },
        { label: "Watch exactly which cable they unplug.", scores: { goblin: 3 } },
        { label: "Hand them a coaster, reflexively.", scores: { mug: 3 } },
        { label: "Worry about the fern.", scores: { plant: 3 } } ] },
      { q: "Your desk's vibe in one word:", options: [
        { label: "Sanctuary.", scores: { shrine: 3 } },
        { label: "Laboratory.", scores: { goblin: 3 } },
        { label: "Café.", scores: { mug: 3 } },
        { label: "Greenhouse.", scores: { plant: 3 } } ] },
    ],
    results: {
      shrine: { title: "The Shrine Keeper", emoji: "🏺", blurb: "Your desk is not a workspace; it's a statement. Every object has a coordinate, every cable a label. Visitors speak in whispers. Order isn't a preference — it's a religion with very small furniture.", strength: "Order is your superpower.", fix: "Let one thing be imperfect on purpose. Start with a pen angle.", share: "I'm The Shrine Keeper — my desk has coordinates 🏺" },
      mug: { title: "The Mug Baron", emoji: "☕", blurb: "Your desk hosts the largest collection of ceremonial drinking vessels in the building. Each mug has a history, a favourite beverage, and a reason it can't be washed yet. You always have a cup and an opinion.", strength: "You always have a cup and an opinion.", fix: "Wash them all tonight. Feel reborn. Acquire new ones by Friday.", share: "I'm The Mug Baron — each cup has a backstory and a legal status ☕" },
      goblin: { title: "The Cable Goblin", emoji: "🔌", blurb: "Beneath your desk lives a labyrinth no map has survived. You know which adapter is which by touch, in the dark, by smell. When tech fails, all eyes turn to you — and you always fix it. Eventually.", strength: "You can fix anything tech. Eventually.", fix: "Label three cables. Just three. The goblin tolerates progress.", share: "I'm The Cable Goblin — my desk has an undercity 🔌" },
      plant: { title: "The Desk Plant", emoji: "🪴", blurb: "You and your desk have merged into a single biome. The pothos has opinions about your meetings; the succulent judges your sleep schedule. Somehow, everything you keep alive thrives — including you.", strength: "You keep things alive, including yourself.", fix: "Propagate one cutting. Give it away. Spread the biome.", share: "I'm The Desk Plant — my desk is a protected habitat 🪴" },
    },
  },
  {
    slug: "focus-fuel", title: "Coffee, tea, or delicious chaos?", hook: "Your drink order has been profiling you for years. Time to read the report.",
    emoji: "☕", accent: "#FFD66B", tag: "New", plays: "1.5k", tags: ["food", "personality", "funny"],
    questions: [
      { q: "It's 9am. The first sip of the day is:", options: [
        { label: "Coffee. Immediately. No negotiation.", scores: { espresso: 3 } },
        { label: "Tea, and it's a whole ceremony.", scores: { tea: 3 } },
        { label: "Something carbonated and unwise.", scores: { can: 3 } },
        { label: "Water. Revolutionary, I know.", scores: { water: 3 } } ] },
      { q: "Your caffeine peak arrives at:", options: [
        { label: "9:04am.", scores: { espresso: 3 } },
        { label: "Never peaks. Just glides, all morning.", scores: { tea: 3 } },
        { label: "Unknowable. The can decides.", scores: { can: 3 } },
        { label: "I don't peak. I plateau, calmly.", scores: { water: 3 } } ] },
      { q: "The 3pm slump hits. Your response:", options: [
        { label: "Second coffee. No lessons were learned.", scores: { espresso: 3 } },
        { label: "A walk and more water.", scores: { water: 3 } },
        { label: "Another can. The stack grows.", scores: { can: 3 } },
        { label: "Herbal tea and dignified denial.", scores: { tea: 3 } } ] },
      { q: "Your drink order reveals you as:", options: [
        { label: "Efficient. Possibly vibrating.", scores: { espresso: 3 } },
        { label: "Calm, ceremonial, secretly stubborn.", scores: { tea: 3 } },
        { label: "Chaos-forward.", scores: { can: 3 } },
        { label: "Suspiciously healthy.", scores: { water: 3 } } ] },
      { q: "Without your drink of choice, you are:", options: [
        { label: "Non-functional, but polite about it.", scores: { espresso: 3 } },
        { label: "Grumpy, but upright.", scores: { tea: 3 } },
        { label: "Fine, actually. Which is the scary part.", scores: { can: 3 } },
        { label: "Hydrated.", scores: { water: 3 } } ] },
    ],
    results: {
      espresso: { title: "The Espresso Engine", emoji: "⚡", blurb: "You convert caffeine directly into output with near-perfect efficiency. Mornings are not a phase for you; they're a launch sequence. Your keyboard has a permanent, faint aroma of dark roast.", strength: "You convert caffeine straight into output.", fix: "One caffeine-free morning. We'll keep your spot warm.", share: "I'm The Espresso Engine — mornings are a launch sequence ⚡" },
      tea: { title: "The Tea Ritualist", emoji: "🍵", blurb: "You don't drink tea; you perform it. The warming of the pot, the waiting, the second waiting. Where others rush, you steep. Your patience is legendary and slightly infuriating.", strength: "You turn waiting into a ceremony.", fix: "Brew for a colleague. Rituals multiply when shared.", share: "I'm The Tea Ritualist — I don't rush, I steep 🍵" },
      can: { title: "The Carbonated Gambler", emoji: "🧃", blurb: "Your energy management strategy is best described as riding waves you didn't create. Some days you're a god of output; some days you're negotiating with your own heartbeat. It's never boring.", strength: "You ride energy waves like a surfer.", fix: "Swap one can for water. Feel your skeleton say thank you.", share: "I'm The Carbonated Gambler — my energy has a mind of its own 🧃" },
      water: { title: "The Hydration Sage", emoji: "💧", blurb: "You have achieved what others cannot: a stable baseline. No spikes, no crashes, just the serene, unshakeable calm of a fully hydrated organism. People find you soothing and slightly unreadable.", strength: "Your baseline is unshakeable.", fix: "You're allowed a treat, you know. This is not a test.", share: "I'm The Hydration Sage — stable, serene, smug about it 💧" },
    },
  },
  {
    slug: "weekend-battery", title: "How does your weekend battery charge?", hook: "Some people recharge alone. Some recharge in crowds. Some recharge a spotless flat. Which socket is yours?",
    emoji: "🔋", accent: "#7A5CFF", tag: "New", plays: "1.1k", tags: ["personality", "life", "funny"],
    questions: [
      { q: "Friday, 6pm. Your phone:", options: [
        { label: "Goes on the shelf until Monday.", scores: { hermit: 3 } },
        { label: "Fills with plans within minutes.", scores: { social: 3 } },
        { label: "Shows four errand alarms, colour-coded.", scores: { chore: 3 } },
        { label: "Has one plan. The rest is weather-dependent.", scores: { adventure: 3 } } ] },
      { q: "The perfect Saturday morning is:", options: [
        { label: "Slow. No alarm. No decisions.", scores: { hermit: 3 } },
        { label: "Trailhead by 8am.", scores: { adventure: 3 } },
        { label: "Market, laundry, deep clean.", scores: { chore: 3 } },
        { label: "Brunch with six people.", scores: { social: 3 } } ] },
      { q: "Sunday evening. Your battery reads:", options: [
        { label: "100%. I did nothing and it was correct.", scores: { hermit: 3 } },
        { label: "80%. People are tiring but worth it.", scores: { social: 3 } },
        { label: "60%. The flat is spotless. The soul is neutral.", scores: { chore: 3 } },
        { label: "90%. New place, new story.", scores: { adventure: 3 } } ] },
      { q: "Your weekend has a plan when:", options: [
        { label: "It doesn't. That's the plan.", scores: { hermit: 3 } },
        { label: "There's a group-chat logistics doc.", scores: { social: 3 } },
        { label: "There are three tiny goals and one treat.", scores: { chore: 3 } },
        { label: "There's a forecast and a bag, packed.", scores: { adventure: 3 } } ] },
      { q: "Plans get cancelled. You feel:", options: [
        { label: "Relief so pure it's alarming.", scores: { hermit: 3 } },
        { label: "Mild FOMO. Quick recovery.", scores: { social: 3 } },
        { label: "Recalculating the errand map.", scores: { chore: 3 } },
        { label: "Already building a better solo itinerary.", scores: { adventure: 3 } } ] },
    ],
    results: {
      hermit: { title: "The Weekend Hermit", emoji: "🛋️", blurb: "You have achieved what productivity gurus promise and never deliver: actual rest. Your sofa knows your shape. Cancelling plans isn't a flaw — it's a healing art you've practised to mastery.", strength: "You actually rest. A rare skill.", fix: "One social hour a month. Maximum dose. You'll survive.", share: "I'm The Weekend Hermit — my sofa knows my shape 🛋️" },
      social: { title: "The Social Solar Panel", emoji: "🎉", blurb: "You photosynthesise through other people. A good brunch restores more than a holiday. Your group chat is your lifeline and your calendar is a mosaic of faces you love.", strength: "People recharge you, and you them.", fix: "Guard one empty morning per weekend. Solar panels need maintenance.", share: "I'm The Social Solar Panel — I photosynthesise through people 🎉" },
      chore: { title: "The Chore Goblin", emoji: "🧺", blurb: "Monday-you is a person you actively protect. Laundry folded, fridge stocked, sockets dusted. Your weekend isn't rest — it's infrastructure maintenance, and it's weirdly satisfying.", strength: "Monday-you inherits a perfect flat.", fix: "Leave one chore undone. Live dangerously. The dust will wait.", share: "I'm The Chore Goblin — I protect Monday-me like a client 🧺" },
      adventure: { title: "The Micro-Adventurer", emoji: "🥾", blurb: "You don't need a two-week holiday; you need a different street. New trail, new market, new bakery with unclear opening hours. You return with stories, not receipts, and your Mondays are jealous of your weekends.", strength: "You return with stories, not receipts.", fix: "Plan the next tiny trip before this one fades. Momentum is fuel.", share: "I'm The Micro-Adventurer — a different street is enough 🥾" },
    },
  },
  {
    slug: "type-of-tired", title: "What kind of tired are you?", hook: "You slept eight hours and still feel flat. That's because tiredness has species. Identify yours.",
    emoji: "🥱", accent: "#B8A6FF", tag: "New", plays: "0.8k", tags: ["personality", "life", "wellbeing"],
    questions: [
      { q: "You slept eight hours and still feel flat. The tiredness lives in:", options: [
        { label: "The brain. 47 tabs, all frozen.", scores: { brain: 3 } },
        { label: "The body. Shoulders made of cable.", scores: { body: 3 } },
        { label: "The mood. Everything is beige.", scores: { soul: 3 } },
        { label: "The boredom. Nothing is interesting enough.", scores: { bored: 3 } } ] },
      { q: "Your ideal recovery, honestly:", options: [
        { label: "Silence and a puzzle.", scores: { brain: 3 } },
        { label: "A bath and a long stretch.", scores: { body: 3 } },
        { label: "A brief cry, then a comedy.", scores: { soul: 3 } },
        { label: "Something completely new.", scores: { bored: 3 } } ] },
      { q: "What you actually do instead:", options: [
        { label: "Scroll in bed and call it rest.", scores: { brain: 3 } },
        { label: "Crash on the sofa, motionless.", scores: { body: 3 } },
        { label: "Comfort food and a rewatch.", scores: { soul: 3 } },
        { label: "Start three new hobbies at once.", scores: { bored: 3 } } ] },
      { q: "Your tiredness started around:", options: [
        { label: "The last big decision.", scores: { brain: 3 } },
        { label: "The last commute.", scores: { body: 3 } },
        { label: "The last “fine, how are you”.", scores: { soul: 3 } },
        { label: "The last routine Tuesday.", scores: { bored: 3 } } ] },
      { q: "The cure you'd actually take:", options: [
        { label: "One day with zero choices.", scores: { brain: 3 } },
        { label: "Someone to carry everything heavy.", scores: { body: 3 } },
        { label: "One honest conversation.", scores: { soul: 3 } },
        { label: "A train ticket to somewhere new.", scores: { bored: 3 } } ] },
    ],
    results: {
      brain: { title: "The Full-Buffer Brain", emoji: "🧠", blurb: "You're not sleepy — you're buffering. Your mind holds 47 open processes and every one of them is “almost done”. Sleep doesn't close tabs; it just pauses them. What you need is a decision, not a duvet.", strength: "You think everything through. Everything.", fix: "Write the tabs down on paper. Close them. They'll keep.", share: "I'm The Full-Buffer Brain — 47 tabs, all frozen, all “almost done” 🧠" },
      body: { title: "The Cable-Shoulder Carrier", emoji: "🦵", blurb: "Your tiredness is load-bearing. You carry bags, deadlines and other people's emergencies in exactly the same muscles. Sleep is fine; it's the gravity that's the problem. What you need is to put something down.", strength: "You carry more than you mention.", fix: "Ten minutes of stretching tonight. Set the alarm. Shoulders, we're coming for you.", share: "I'm The Cable-Shoulder Carrier — my tiredness is load-bearing 🦵" },
      soul: { title: "The Beige-Mood Survivor", emoji: "🕯️", blurb: "Nothing is wrong, exactly. Everything is beige. You answer “fine” eleven times a day and mean it 40% of the time. This isn't burnout and it isn't sadness — it's underwhelmed. What you need is one honest conversation.", strength: "You keep showing up. Respect.", fix: "Text the friend who gets it. Today. Not a summary — the real version.", share: "I'm The Beige-Mood Survivor — everything is fine, in beige 🕯️" },
      bored: { title: "The Under-Stimulated Spark", emoji: "🎈", blurb: "You're not tired — you're under-fed. Not on food: on novelty. Your routine has become so efficient that your brain has started filing days under “already seen”. What you need isn't rest. It's a plot twist.", strength: "You refuse to be bored by life.", fix: "One tiny novelty tomorrow. New route, new lunch, anything. Feed the spark.", share: "I'm The Under-Stimulated Spark — I need a plot twist, not a nap 🎈" },
    },
  },
];

// ---------------- MERGE ----------------
// jokes (keep original one-line-per-object formatting)
const jokes = JSON.parse(readFileSync(new URL("jokes.json", DATA), "utf8"));
const existingJokeSetups = new Set(jokes.map(j => j.setup.toLowerCase()));
const addedJokes = newJokes.filter(j => !existingJokeSetups.has(j.setup.toLowerCase()));
const allJokes = [...jokes, ...addedJokes];
const jokesOut = "[\n" + allJokes.map(j =>
  "  { " + ["setup", "punchline", "tag"].map(k => `${JSON.stringify(k)}: ${JSON.stringify(j[k])}`).join(", ") + " }"
).join(",\n") + "\n]\n";
writeFileSync(new URL("jokes.json", DATA), jokesOut);

// oracle
const oracle = JSON.parse(readFileSync(new URL("oracle.json", DATA), "utf8"));
oracle.prompts = [...oracle.prompts, ...newPrompts];
oracle.answers = [...oracle.answers, ...newYes.map(t => ({ verdict: "yes", text: t })), ...newNo.map(t => ({ verdict: "no", text: t })), ...newMaybe.map(t => ({ verdict: "maybe", text: t }))];
writeFileSync(new URL("oracle.json", DATA), JSON.stringify(oracle, null, 2) + "\n");

// quizzes (preserve entries, append new; check slug collisions)
const quizzes = JSON.parse(readFileSync(new URL("quizzes.json", DATA), "utf8"));
const existingSlugs = new Set(quizzes.map(q => q.slug));
const addedQuizzes = newQuizzes.filter(q => {
  if (existingSlugs.has(q.slug)) { console.log("SKIP existing slug:", q.slug); return false; }
  return true;
});
writeFileSync(new URL("quizzes.json", DATA), JSON.stringify([...quizzes, ...addedQuizzes], null, 2) + "\n");

console.log(`jokes: ${jokes.length} -> ${allJokes.length} (+${addedJokes.length})`);
console.log(`oracle prompts: ${oracle.prompts.length - newPrompts.length} -> ${oracle.prompts.length}`);
const byVerdict = {};
oracle.answers.forEach(a => byVerdict[a.verdict] = (byVerdict[a.verdict] || 0) + 1);
console.log(`oracle answers: ${JSON.stringify(byVerdict)} (total ${oracle.answers.length})`);
console.log(`quizzes: ${quizzes.length} -> ${quizzes.length + addedQuizzes.length} (+${addedQuizzes.length})`);
