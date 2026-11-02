/* Julien · ELA · Spelling: blends with l, r, s (take-home list, week of Nov 2, 2026)
   Words come straight from the teacher's take-home list: 12 list words, 4 review words, 2 challenge words.
   Each problem reads the word, a sentence, and the word again (like a spelling test), and Julien types it. */
(function(){
"use strict";
const pick = a=>a[Math.floor(Math.random()*a.length)];
const shuffle = a=>{ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
const B = s=>'<b>'+s+'</b>';

/* w: word · blend: the two letters that glide together · at: "start" or "end" · s: sentence (___ is the word)
   how: extra spelling tip after the blend · miss: common misspellings → [key, short, kind message] */
const W = {
  drag:  {blend:"dr",at:"start",s:"Don't ___ your feet on the floor.",how:"Short a in the middle, then g.",
          miss:{dag:["blend","dropped the r","Listen for both sounds at the start: d‑r. Drag starts with dr."],darg:["order","letters swapped","The d and r go together at the start: dr‑ag."]}},
  glide: {blend:"gl",at:"start",s:"The bird can ___ through the air.",how:"Long i says its name, so a silent e goes at the end.",
          miss:{glid:["silente","forgot the silent e","The i says its name (“eye”), so glide needs a silent e at the end."],gide:["blend","dropped the l","Glide starts with two sounds: g‑l. Don't skip the l!"]}},
  globe: {blend:"gl",at:"start",s:"Spin the ___ and find our country.",how:"Long o says its name, so a silent e goes at the end.",
          miss:{glob:["silente","forgot the silent e","The o says its name (“oh”), so globe needs a silent e at the end."],gobe:["blend","dropped the l","Globe starts with g‑l together. Say it slowly: gl‑obe."]}},
  grade: {blend:"gr",at:"start",s:"My brother is in fifth ___.",how:"Long a says its name, so a silent e goes at the end.",
          miss:{grad:["silente","forgot the silent e","The a says its name (“ay”), so grade needs a silent e at the end."],gade:["blend","dropped the r","Grade starts with g‑r. Growl like a bear: grrr‑ade!"]}},
  just:  {blend:"st",at:"end",s:"I ___ finished my snack.",how:"Short u in the middle. It ends with the blend st.",
          miss:{jus:["ending","dropped the t at the end","Listen to the very end: jus‑t. Just ends with s‑t."],jist:["vowel","wrong middle sound","The middle sound is short u, like in “up”: j‑u‑st."]}},
  last:  {blend:"st",at:"end",s:"Who wants to go ___?",how:"Short a in the middle. It ends with the blend st.",
          miss:{las:["ending","dropped the t at the end","Hear the t at the end? Last ends with s‑t."],lasd:["ending","ended with d","Last ends with a t sound: s‑t."]}},
  place: {blend:"pl",at:"start",s:"Put your book back in its ___.",how:"Long a says its name. The “s” sound at the end is spelled ce.",
          miss:{plase:["ce","wrote s for the ce sound","In place, the “s” sound at the end is spelled c‑e: pla‑ce."],plac:["silente","forgot the e","Place ends with c‑e. The e makes the c say “s” and makes the a say its name."],pace:["blend","dropped the l","Place starts with p‑l together. Say it slowly: pl‑ace."]}},
  skin:  {blend:"sk",at:"start",s:"Put sunscreen on your ___.",how:"Short i, then n. The “k” sound here is spelled with a k.",
          miss:{scin:["k","used c instead of k","In skin, the “k” sound before i is spelled with a k: s‑k‑in."],sin:["blend","dropped the k","Skin starts with s‑k. Two sounds: s‑k‑in."]}},
  space: {blend:"sp",at:"start",s:"Astronauts fly into outer ___.",how:"Long a says its name. The “s” sound at the end is spelled ce.",
          miss:{spase:["ce","wrote s for the ce sound","Space ends like place: the “s” sound is spelled c‑e."],spac:["silente","forgot the e","Space ends with c‑e, just like place."],sace:["blend","dropped the p","Space starts with s‑p together: sp‑ace."]}},
  stove: {blend:"st",at:"start",s:"Dad cooks soup on the ___.",how:"Long o says its name, so a silent e goes at the end.",
          miss:{stov:["silente","forgot the silent e","The o says its name (“oh”), so stove ends with v‑e. English words almost never end in v!"],sove:["blend","dropped the t","Stove starts with s‑t together: st‑ove."]}},
  swim:  {blend:"sw",at:"start",s:"We ___ in the pool every summer.",how:"Short i, then m.",
          miss:{sim:["blend","dropped the w","Swim starts with s‑w. Your lips make a little circle for the w!"],swem:["vowel","wrong middle sound","The middle sound is short i, like in “it”: sw‑i‑m."]}},
  test:  {blend:"st",at:"end",s:"I studied for my spelling ___.",how:"Short e in the middle. It ends with the blend st.",
          miss:{tes:["ending","dropped the t at the end","Test has a t at the start AND the end: t‑e‑s‑t."],tast:["vowel","wrong middle sound","The middle sound is short e, like in “egg”: t‑e‑st."]}},
  close: {blend:"cl",at:"start",s:"Please ___ the door.",how:"Long o says its name, then s and a silent e.",
          miss:{clos:["silente","forgot the silent e","The o says its name (“oh”), so close needs a silent e at the end."],klose:["k","used k instead of c","Close starts with c‑l: cl‑ose."]}},
  grape: {blend:"gr",at:"start",s:"I ate a purple ___.",how:"Long a says its name, so a silent e goes at the end.",
          miss:{grap:["silente","forgot the silent e","The a says its name (“ay”), so grape needs a silent e at the end."],gape:["blend","dropped the r","Grape starts with g‑r, like grade."]}},
  plate: {blend:"pl",at:"start",s:"Put the cookies on a ___.",how:"Long a says its name, so a silent e goes at the end.",
          miss:{plat:["silente","forgot the silent e","The a says its name (“ay”), so plate needs a silent e at the end."],pate:["blend","dropped the l","Plate starts with p‑l, like place."]}},
  slid:  {blend:"sl",at:"start",s:"The penguin ___ on the ice.",how:"Short i, then d. No silent e: the i says “ih,” not its name.",
          miss:{slide:["extrae","added an e","Slid has a short i (“ih”). Slide with an e is a different word: the thing at the park!"],sid:["blend","dropped the l","Slid starts with s‑l together: sl‑id."]}},
  bruise:{blend:"br",at:"start",s:"I got a ___ when I bumped my knee.",how:"The “oo” sound is spelled ui. The “z” sound is spelled s, with a silent e at the end.",challenge:true,
          miss:{bruse:["challenge","missed the ui","The “oo” sound in bruise is spelled u‑i: br‑ui‑se."],brooz:["challenge","spelled it how it sounds","Good listening! But bruise is tricky: b‑r‑u‑i‑s‑e."],bruize:["challenge","used z","The “z” sound in bruise is spelled with an s: bru‑i‑s‑e."]}},
  climb: {blend:"cl",at:"start",s:"Let's ___ to the top of the hill.",how:"Long i, then m and a silent b at the end. You can't hear the b!",challenge:true,
          miss:{clim:["challenge","forgot the silent b","Climb has a sneaky silent b at the end: c‑l‑i‑m‑b."],climbe:["challenge","added an e","Climb ends with the silent b. No e."],klimb:["k","used k instead of c","Climb starts with c‑l, like close."]}}
};
const LIST = ["drag","glide","globe","grade","just","last","place","skin","space","stove","swim","test"];
const REVIEW = ["close","grape","plate","slid"];
const CHALLENGE = ["bruise","climb"];
const ALL = LIST.concat(REVIEW);
const BLENDS = ["bl","br","cl","cr","dr","fl","fr","gl","gr","pl","pr","sk","sl","sp","st","sw","tr"];

function sentence(w){ return W[w].s.replace("___",'<span class="blank"></span>'); }
function sayIt(w){ return [w, W[w].s.replace("___", w), w]; }
function stepsFor(w){
  const d = W[w], b = d.blend;
  const first = d.at==="end"
    ? "It ends with the blend "+B(b)+": "+B(b[0])+" and "+B(b[1])+" glide together."
    : "It starts with the blend "+B(b)+": "+B(b[0])+" and "+B(b[1])+" glide together.";
  return [first, d.how, "Spelled: "+B(w.split("").join("‑"))+" → "+B(w)];
}
function hintsFor(w){
  return Object.keys(W[w].miss).filter(v=>v!==w).map(v=>{ const m = W[w].miss[v]; return {v, key:m[0], short:m[1], msg:m[2]}; });
}

/* spell the word: hear it, type it */
function spell(w){
  return {q:'<div class="story">'+sentence(w)+'</div>', wide:true, say:sayIt(w), review:w+" — "+W[w].s.replace("___",w),
    type:"word", a:w, label:"", placeholder:"type the word", prompt:"Listen, then spell the word.", steps:stepsFor(w), hints:hintsFor(w)};
}
/* level 1: which blend do you hear? */
function genBlend(){
  const w = pick(ALL), d = W[w], b = d.blend;
  const rest = d.at==="end" ? w.slice(0,-2) : w.slice(2);
  const shown = d.at==="end" ? rest+'<span class="blank"></span>' : '<span class="blank"></span>'+rest;
  const near = BLENDS.filter(x=>x!==b && (x[0]===b[0] || x[1]===b[1]));
  const others = shuffle(near.length>=3 ? near : BLENDS.filter(x=>x!==b)).slice(0,3);
  const choices = shuffle([b].concat(others)).map(x=>({text:B(x), review:x, ok:x===b,
    msg: x===b ? "" : "Listen again: "+w+" "+(d.at==="end"?"ends":"starts")+" with "+b+", not "+x+".", short:"picked "+x, key:"blend"}));
  return {q:shown, say:[w, d.s.replace("___",w), w], review:w, choices, grid:true,
    prompt:"Listen. Which blend do you hear "+(d.at==="end"?"at the end":"at the start")+"?",
    steps:[(d.at==="end"?"The word ends with ":"The word starts with ")+B(b)+": "+B(b[0])+" and "+B(b[1])+" glide together.", "The whole word: "+B(w)]};
}
const fromPool = pool => () => spell(pick(pool));

window.PRACTICE = {
  id: "julien-spelling-blends",
  student: "Julien",
  title: "🔥 Campfire Spelling",
  intro: "This week's words: blends with l, r and s. Listen to the word, then type it.",
  kid: true, setSize: 8, passAt: 6,
  answerType: "word",
  mistakeNames: {blend:"Missed a blend sound", silente:"Forgot the silent e", ending:"Missed the -st ending", ce:"ce spelled with s", k:"c and k mix-up", vowel:"Wrong middle sound", order:"Letters swapped", extrae:"Added an extra e", challenge:"Challenge word slips", choice:"Picked the wrong blend"},
  levels: [
    {name:"Hear the blend", desc:"Pick the blend you hear at the start or end", sticker:"🔥", gen:genBlend},
    {name:"List words 1–6", desc:"drag, glide, globe, grade, just, last", sticker:"🐿️", gen:fromPool(LIST.slice(0,6))},
    {name:"List words 7–12", desc:"place, skin, space, stove, swim, test", sticker:"🦉", gen:fromPool(LIST.slice(6))},
    {name:"All 12 list words", desc:"The whole list, like the real test", sticker:"⛺", gen:fromPool(LIST)},
    {name:"Review words", desc:"close, grape, plate, slid, plus list words", sticker:"🌲", gen:()=>spell(Math.random()<0.6?pick(REVIEW):pick(LIST))},
    {name:"Challenge words", desc:"bruise and climb, mixed with the list", sticker:"🏅", gen:()=>spell(Math.random()<0.5?pick(CHALLENGE):pick(ALL))}
  ],
  lesson: [
    {h:"What's a blend?", body:'<p>A <b>blend</b> is two letters that slide together. You can hear <b>both</b> sounds.</p><p><b>gl</b>ide: g + l. &nbsp; <b>dr</b>ag: d + r. &nbsp; <b>sw</b>im: s + w.</p><p>Say the word slowly and listen for both sounds. Don\'t skip one!</p>'},
    {h:"Blends with l, r and s", body:'<p><b>l blends:</b> <b>gl</b>ide, <b>gl</b>obe, <b>pl</b>ace, <b>cl</b>ose, <b>pl</b>ate, <b>sl</b>id, <b>cl</b>imb</p><p><b>r blends:</b> <b>dr</b>ag, <b>gr</b>ade, <b>gr</b>ape, <b>br</b>uise</p><p><b>s blends:</b> <b>sk</b>in, <b>sp</b>ace, <b>st</b>ove, <b>sw</b>im</p><p><b>st at the end:</b> ju<b>st</b>, la<b>st</b>, te<b>st</b>. Listen for the t at the very end!</p>'},
    {h:"The silent e trick", body:'<p>When a vowel says its own name, a <b>silent e</b> often goes at the end.</p><p>glid<b>e</b>, glob<b>e</b>, grad<b>e</b>, stov<b>e</b>, clos<b>e</b>, grap<b>e</b>, plat<b>e</b></p><p><b>slid</b> has a short i (“ih”), so it has no e. <b>slide</b> is the thing at the park!</p>'},
    {h:"Tricky spots", body:'<p><b>place</b> and <b>space</b> end with <b>ce</b>, not s.</p><p><b>bruise</b>: the “oo” sound is <b>ui</b>, and it ends in <b>se</b>.</p><p><b>climb</b> has a silent <b>b</b> at the end. You can\'t hear it, but it\'s there!</p>'},
    {h:"How to play", body:'<p>Tap <b>Start</b>. The game reads the word, a sentence, and the word again, just like a spelling test. Tap <b>🔊 Hear it again</b> as many times as you want.</p><p>Type the word and tap <b>Check</b>. Get 6 of 8 right to earn a sticker!</p>'}
  ]
};
})();
