/* Julien · ELA · Spelling: number words (take-home Number Words Chart, spelling test Fri Nov 20, 2026)
   The chart covers zero to one hundred forty-nine, plus the hundreds (two hundred … nine hundred).
   Each problem shows the number, reads it aloud, and Julien types it in words. */
(function(){
"use strict";
const pick = a=>a[Math.floor(Math.random()*a.length)];
const ri = (a,b)=>a+Math.floor(Math.random()*(b-a+1));
const B = s=>'<b>'+s+'</b>';

const ONES = ["zero","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"];
const TENS = {20:"twenty",30:"thirty",40:"forty",50:"fifty",60:"sixty",70:"seventy",80:"eighty",90:"ninety"};
function words(n){
  if(n<20) return ONES[n];
  if(n<100) return TENS[n-n%10]+(n%10?"-"+ONES[n%10]:"");
  return ONES[Math.floor(n/100)]+" hundred"+(n%100?" "+words(n%100):"");
}

/* tip: shown in "How it works" · miss: common misspellings → [key, short label, kind message] */
const INFO = {
  zero:{tip:"z‑e‑r‑o. It ends with an o.", miss:{zeero:["letters","extra e","Zero has just one e: z‑e‑r‑o."],zro:["letters","missing e","Don't forget the e: z‑e‑r‑o."],ziro:["letters","i instead of e","Zero is spelled with an e: z‑e‑r‑o."]}},
  one:{tip:"It sounds like “won,” but the number is spelled o‑n‑e.", miss:{won:["sound","spelled by sound","“Won” is what you did in the game. The number is o‑n‑e."],wun:["sound","spelled by sound","It sounds like “wun,” but the number is spelled o‑n‑e."],on:["e","dropped the e","One ends with an e: o‑n‑e."]}},
  two:{tip:"The number has a silent w: t‑w‑o.", miss:{to:["sound","wrote “to”","“To” is for going places. The number has a silent w: t‑w‑o."],too:["sound","wrote “too”","“Too” means also. The number is t‑w‑o."],tow:["letters","letters swapped","The w comes in the middle: t‑w‑o."],tu:["sound","spelled by sound","The number is spelled t‑w‑o, with a silent w."]}},
  three:{tip:"th‑r‑ee: two e's at the end.", miss:{thre:["e","only one e","Three ends with two e's: th‑r‑e‑e."],tree:["letters","missing h","A tree has leaves! The number starts with t‑h: three."],threee:["letters","too many e's","Just two e's: th‑r‑e‑e."],there:["letters","letters swapped","The r comes before the e's: th‑r‑e‑e."]}},
  four:{tip:"The number 4 has a u in it: f‑o‑u‑r.", miss:{for:["u","wrote “for”","“For” is a different word (this is for you). The number has a u: f‑o‑u‑r."],fore:["u","wrote “fore”","The number is f‑o‑u‑r, with a u."],foor:["u","oo instead of ou","Four is spelled o‑u: f‑o‑u‑r."],fuor:["letters","letters swapped","The o comes before the u: f‑o‑u‑r."]}},
  five:{tip:"The i says its name, so a silent e goes at the end.", miss:{fiv:["e","forgot the silent e","Five ends with a silent e. English words don't end in v!"],fife:["letters","f instead of v","The second sound is v: f‑i‑v‑e."]}},
  six:{tip:"Just three letters: s‑i‑x.", miss:{sics:["sound","spelled by sound","The “ks” sound at the end is the letter x: s‑i‑x."],siks:["sound","spelled by sound","The “ks” sound at the end is the letter x: s‑i‑x."],sicks:["sound","spelled by sound","The “ks” sound at the end is the letter x: s‑i‑x."],sixe:["letters","extra e","No e at the end: s‑i‑x."]}},
  seven:{tip:"sev‑en: it ends with e‑n.", miss:{sevin:["letters","i instead of e","Seven ends with e‑n: sev‑en."],sevn:["letters","missing e","Seven has two e's: s‑e‑v‑e‑n."],sevan:["letters","a instead of e","Seven ends with e‑n: sev‑en."],seven_:["letters","",""]}},
  eight:{tip:"The tricky one! e‑i‑g‑h‑t. The g and h are silent.", miss:{ate:["sound","wrote “ate”","“Ate” is what you did at lunch. The number is e‑i‑g‑h‑t."],eigt:["eight","missing h","Eight has a silent g AND a silent h: e‑i‑g‑h‑t."],eihgt:["eight","g and h swapped","The g comes before the h: e‑i‑g‑h‑t."],eit:["eight","missing gh","Eight hides two silent letters in the middle: e‑i‑g‑h‑t."],aight:["eight","a instead of e","Eight starts with e‑i: e‑i‑g‑h‑t."],eaght:["eight","a instead of i","Eight starts with e‑i: e‑i‑g‑h‑t."],eghit:["eight","letters swapped","Say the letters in order: e‑i‑g‑h‑t."],ieght:["eight","i and e swapped","E comes first: e‑i‑g‑h‑t."]}},
  nine:{tip:"The i says its name, so a silent e goes at the end.", miss:{nin:["e","forgot the silent e","Nine ends with a silent e: n‑i‑n‑e."],nien:["letters","letters swapped","The e goes at the very end: n‑i‑n‑e."],nyne:["letters","y instead of i","Nine is spelled with an i: n‑i‑n‑e."]}},
  ten:{tip:"t‑e‑n, with a short e.", miss:{tin:["letters","i instead of e","A tin is a can! The number is t‑e‑n."],tenn:["letters","extra n","Just one n: t‑e‑n."]}},
  eleven:{tip:"e‑lev‑en: it has three e's!", miss:{elevin:["letters","i instead of e","Eleven ends with e‑n, like seven."],elven:["letters","missing e","Eleven has three e's: e‑l‑e‑v‑e‑n."],elevn:["letters","missing e","Eleven has three e's: e‑l‑e‑v‑e‑n."],eleavn:["letters","mixed-up letters","Say it slowly: e‑lev‑en."],leven:["letters","missing the first e","Eleven starts with an e: e‑lev‑en."]}},
  twelve:{tip:"tw‑el‑ve: it ends with v‑e (words don't end in v).", miss:{twelv:["e","forgot the e","Twelve ends with v‑e. English words don't end in v!"],twelf:["letters","f instead of ve","The ending is v‑e: tw‑el‑ve."],twleve:["letters","letters swapped","The e comes before the l: tw‑e‑l‑ve."],twelfe:["letters","f instead of v","The ending is v‑e: tw‑el‑ve."],tweleve:["letters","extra e","Twelve has just two e's: tw‑e‑l‑v‑e."],twelev:["letters","letters swapped","It ends with v‑e: tw‑el‑ve."]}},
  thirteen:{tip:"thir + teen. It's th‑i‑r, not “three‑teen.”", miss:{therteen:["thir","e instead of i","Thirteen starts with th‑i‑r: thir‑teen."],threeteen:["thir","wrote three + teen","Three changes to thir: thir‑teen."],thirten:["teen","only one e","Teen has two e's: thir‑t‑e‑e‑n."],thirtteen:["letters","extra t","Just one t: thir‑teen."],thurteen:["thir","u instead of i","Thirteen starts with th‑i‑r: thir‑teen."],thriteen:["thir","letters swapped","The i comes before the r: th‑i‑r‑teen."]}},
  fourteen:{tip:"four + teen. Keep the u!", miss:{forteen:["u","dropped the u","Fourteen keeps the u from four: four‑teen."],fourten:["teen","only one e","Teen has two e's: four‑t‑e‑e‑n."],foreteen:["u","wrote fore","It's four + teen: f‑o‑u‑r‑teen."]}},
  fifteen:{tip:"fif + teen. Five changes to f‑i‑f.", miss:{fiveteen:["fif","wrote five + teen","Five changes to fif: fif‑teen."],fifthteen:["fif","extra th","No th in the middle: fif‑teen."],fiften:["teen","only one e","Teen has two e's: fif‑t‑e‑e‑n."],fivteen:["fif","v instead of f","Five changes to fif: fif‑teen."]}},
  sixteen:{tip:"six + teen. Easy!", miss:{sixten:["teen","only one e","Teen has two e's: six‑t‑e‑e‑n."],sixtene:["teen","e in the wrong place","Teen is t‑e‑e‑n: six‑teen."],sicksteen:["sound","spelled by sound","It's six + teen: s‑i‑x‑teen."]}},
  seventeen:{tip:"seven + teen. Easy!", miss:{seventen:["teen","only one e","Teen has two e's: seven‑t‑e‑e‑n."],sevinteen:["letters","i instead of e","It's seven + teen: sev‑e‑n‑teen."],sevnteen:["letters","missing e","It's seven + teen: sev‑e‑n‑teen."]}},
  eighteen:{tip:"eight + een. Only ONE t: eigh‑teen.", miss:{eightteen:["eight","two t's","Eight already ends in t, so just add een: eigh‑teen."],eigteen:["eight","missing h","Keep the silent g AND h: e‑i‑g‑h‑teen."],eighten:["teen","only one e","Teen has two e's: eigh‑t‑e‑e‑n."],ateen:["sound","spelled by sound","It starts with eight: e‑i‑g‑h‑teen."],eihgteen:["eight","g and h swapped","The g comes before the h: e‑i‑g‑h‑teen."]}},
  nineteen:{tip:"nine + teen. Keep the e in nine!", miss:{ninteen:["e","dropped the e","Nineteen keeps the e from nine: nine‑teen."],nineten:["teen","only one e","Teen has two e's: nine‑t‑e‑e‑n."],nintene:["e","e in the wrong place","It's nine + teen: n‑i‑n‑e‑teen."]}},
  twenty:{tip:"twen + ty. Don't skip the t in the middle: twen‑T‑y.", miss:{twenny:["twen","missing the t","Twenty has a t in the middle: twen‑ty."],tweny:["twen","missing the t","Twenty has a t in the middle: twen‑ty."],twentie:["letters","ie instead of y","It ends with a y: twen‑ty."],twuenty:["letters","extra u","No u: t‑w‑e‑n‑ty."],twinty:["letters","i instead of e","Twenty is spelled with an e: tw‑e‑n‑ty."],twentey:["letters","extra e","It ends with just t‑y: twen‑ty."]}},
  thirty:{tip:"thir + ty, just like thirteen.", miss:{therty:["thir","e instead of i","Thirty starts with th‑i‑r: thir‑ty."],thirdy:["letters","d instead of t","It ends with t‑y: thir‑ty."],threety:["thir","wrote three + ty","Three changes to thir: thir‑ty."],thurty:["thir","u instead of i","Thirty starts with th‑i‑r: thir‑ty."],thrity:["thir","letters swapped","The i comes before the r: th‑i‑r‑ty."],thirtey:["letters","extra e","It ends with just t‑y: thir‑ty."]}},
  forty:{tip:"Surprise: forty has NO u. f‑o‑r‑t‑y.", miss:{fourty:["u","added a u","Four has a u, but forty drops it: f‑o‑r‑ty. Sneaky!"],fortey:["letters","extra e","It ends with just t‑y: for‑ty."],fordy:["letters","d instead of t","It ends with t‑y: for‑ty."],fourtey:["u","added a u","Forty has no u: f‑o‑r‑ty."]}},
  fifty:{tip:"fif + ty, just like fifteen.", miss:{fivety:["fif","wrote five + ty","Five changes to fif: fif‑ty."],fifthy:["fif","extra h","No h: fif‑ty."],fivty:["fif","v instead of f","Five changes to fif: fif‑ty."],fiftey:["letters","extra e","It ends with just t‑y: fif‑ty."],fiffty:["letters","extra f","Just f‑i‑f, then ty: fif‑ty."]}},
  sixty:{tip:"six + ty. Easy!", miss:{sixdy:["letters","d instead of t","It ends with t‑y: six‑ty."],sixtey:["letters","extra e","It ends with just t‑y: six‑ty."],sicksty:["sound","spelled by sound","It's six + ty: s‑i‑x‑ty."]}},
  seventy:{tip:"seven + ty. Easy!", miss:{sevendy:["letters","d instead of t","It ends with t‑y: seven‑ty."],sevinty:["letters","i instead of e","It's seven + ty: sev‑e‑n‑ty."],sevnty:["letters","missing e","It's seven + ty: sev‑e‑n‑ty."],seventey:["letters","extra e","It ends with just t‑y: seven‑ty."]}},
  eighty:{tip:"eight + y. Only ONE t: eigh‑ty.", miss:{eightty:["eight","two t's","Eight already ends in t, so just add y: eigh‑ty."],eigty:["eight","missing h","Keep the silent g AND h: e‑i‑g‑h‑ty."],eightey:["letters","extra e","Just add y to eight: eight‑y."],aty:["sound","spelled by sound","It starts with eight: e‑i‑g‑h‑ty."],eihgty:["eight","g and h swapped","The g comes before the h: e‑i‑g‑h‑ty."],eighy:["eight","missing t","Keep the t from eight: e‑i‑g‑h‑t‑y."]}},
  ninety:{tip:"nine + ty. Keep the e in nine!", miss:{ninty:["e","dropped the e","Ninety keeps the e from nine: nine‑ty."],ninedy:["letters","d instead of t","It ends with t‑y: nine‑ty."],ninetey:["letters","extra e","It ends with just t‑y: nine‑ty."],nintey:["e","e in the wrong place","It's nine + ty: n‑i‑n‑e‑ty."]}},
  hundred:{tip:"hun‑dred: h‑u‑n‑d‑r‑e‑d.", miss:{hundrid:["hundred","i instead of e","It ends with r‑e‑d, like the color: hun‑dred."],hunderd:["hundred","letters swapped","The r comes before the e: hun‑d‑r‑e‑d."],hundered:["hundred","extra e","No e after the d: hun‑dred."],hundread:["hundred","extra a","It ends with r‑e‑d: hun‑dred."],hunderd_:["hundred","",""],hundrd:["hundred","missing e","Don't forget the e: hun‑dr‑e‑d."],hunred:["hundred","missing d","There's a d in the middle: hun‑d‑red."],hondred:["hundred","o instead of u","Hundred starts with h‑u‑n."]}}
};
Object.keys(INFO).forEach(k=>Object.keys(INFO[k].miss).forEach(m=>{ if(m.indexOf("_")>=0) delete INFO[k].miss[m]; }));
const TEEN_TY = {thirteen:"thirty",fourteen:"forty",fifteen:"fifty",sixteen:"sixty",seventeen:"seventy",eighteen:"eighty",nineteen:"ninety"};

function parts(w){ return w.split(/[ -]/); }
function hintsFor(n){
  const w = words(n), out = [], seen = new Set([w]);
  const add = (v,key,short,msg)=>{ if(!seen.has(v)){ seen.add(v); out.push({v,key,short,msg}); } };
  /* one part misspelled, the rest right */
  const toks = w.split(/([ -])/);            // words at even positions, separators at odd
  toks.forEach((pt,i)=>{ const info = i%2===0 && INFO[pt]; if(!info) return;
    Object.keys(info.miss).forEach(m=>{ const x = info.miss[m], t = toks.slice(); t[i] = m; add(t.join(""), x[0], x[1], x[2]+(w!==pt?" The whole thing: "+B(w)+".":"")); }); });
  /* squished together */
  if(/[ -]/.test(w)) add(w.replace(/[ -]/g,""), "dash", "squished into one word", w.indexOf(" ")>=0 ? "These are separate words. Leave a space between them: "+B(w)+"." : "These are two words with a little dash between them: "+B(w)+".");
  /* teen ↔ ty */
  Object.keys(TEEN_TY).forEach(t=>{ const ty = TEEN_TY[t];
    if(w===t) add(ty,"teen","wrote the -ty number","That spells "+ty+". Listen for “teen” at the end: "+B(t)+".");
    if(w===ty) add(t,"teen","wrote the -teen number","That spells "+t+". This one ends with “ty”: "+B(ty)+"."); });
  return out;
}
/* right letters, but the dash or “and” is off: counts as right, with a reminder */
function acceptFor(n){
  const w = words(n), flat = s=>s.replace(/-/g," ");
  return function(g){
    if(g===w) return null;
    if(flat(g)===flat(w)){
      if(w.indexOf("-")>=0 && g.indexOf(w.match(/[a-z]+-[a-z]+/)[0])<0) return {key:"dash", msg:"The letters are all right! Next time, put the little dash in: "+B(w)+"."};
      return {key:"dash", msg:"The letters are all right! “Hundred” doesn't need a dash, just a space: "+B(w)+"."};
    }
    const noAnd = g.replace(/(^| |-)and( |-)/g,"$1").replace(/  +/g," ");
    if(noAnd!==g && flat(noAnd)===flat(w)) return {key:"and", msg:"The letters are all right! The chart leaves out “and”: "+B(w)+"."};
    return null;
  };
}
function stepsFor(n){
  const w = words(n), ps = parts(w), steps = [], done = new Set();
  ps.forEach(pt=>{ if(done.has(pt) || !INFO[pt]) return; done.add(pt); steps.push(B(pt)+": "+INFO[pt].tip); });
  if(w.indexOf(" hundred")>=0 && n%100) steps.push("Say the hundreds first, leave a space, then the rest. No “and.”");
  if(w.indexOf("-")>=0) steps.push("The tens word and the ones word get a little dash between them: "+B(w.match(/[a-z]+-[a-z]+/)[0])+".");
  steps.push(ps.length===1 ? "Spelled: "+B(w.split("").join("‑"))+" → "+B(w) : "All together: "+B(w));
  return steps;
}
function spell(n){
  const w = words(n);
  return {q:'<div class="numeral">'+n+'</div>', say:[w], review:n+" — "+w, type:"word", phrase:true, a:w, label:"", placeholder:"type the number word",
    prompt:"Listen, then spell this number in words.", steps:stepsFor(n), hints:hintsFor(n), accept:acceptFor(n)};
}
const from = pool => () => spell(pick(pool));
const range = (a,b)=>Array.from({length:b-a+1},(_,i)=>a+i);
const SMALL = range(0,10), TEENS = range(11,19), TENSN = [20,30,40,50,60,70,80,90,100];
const COUSINS = [2,12,20, 3,13,30, 4,14,40, 5,15,50, 8,18,80, 9,19,90];
const DASH = range(21,99).filter(n=>n%10);
const HUND = range(100,149).concat([200,300,400,500,600,700,800,900]);
function genTest(){ const r = Math.random(); return spell(r<0.3 ? ri(0,19) : r<0.45 ? pick(TENSN) : r<0.75 ? pick(DASH) : ri(100,149)); }

window.PRACTICE = {
  id: "julien-spelling-number-words",
  student: "Julien",
  title: "🔢 Number Word Spelling",
  intro: "Spelling test Friday, Nov 20: number words from zero to one hundred forty-nine. Look at the number, listen, then type it in words.",
  kid: true, setSize: 8, passAt: 6,
  answerType: "word", phrase: true,
  cheers: ["You got it!","Yes!","Count on it!","Nailed it!","Way to go!","Number one!"],
  mistakeNames: {u:"The u in four, fourteen, forty", eight:"The silent gh in eight", teen:"teen and ty mix-ups", fif:"five turns into fif", thir:"three turns into thir", twen:"The t in twenty", e:"Dropped or missing e", hundred:"Spelling hundred", dash:"The little dash", and:"Added “and”", sound:"Spelled by sound", letters:"Letter slips"},
  levels: [
    {name:"Zero to ten", desc:"zero, one, two … ten", sticker:"🐾", gen:from(SMALL)},
    {name:"The teens", desc:"eleven, twelve, thirteen … nineteen", sticker:"🌙", gen:from(TEENS)},
    {name:"Counting by tens", desc:"twenty, thirty, forty … one hundred", sticker:"🪵", gen:from(TENSN)},
    {name:"Tricky cousins", desc:"four, fourteen, forty · eight, eighteen, eighty", sticker:"🦊", gen:from(COUSINS)},
    {name:"Dash words", desc:"twenty-one to ninety-nine", sticker:"🏹", gen:from(DASH)},
    {name:"The hundreds", desc:"one hundred seven, one hundred forty-six", sticker:"🏔️", gen:from(HUND)},
    {name:"Test day", desc:"Everything on the chart, mixed", sticker:"🏅", gen:genTest}
  ],
  lesson: [
    {h:"Zero to ten", body:'<p>zero · one · two · three · four · five · six · seven · eight · nine · ten</p><p>Watch out for these:</p><p><b>one</b> sounds like “won.” &nbsp; <b>two</b> has a silent <b>w</b>. &nbsp; <b>four</b> has a <b>u</b>. &nbsp; <b>eight</b> hides a silent <b>gh</b>: e‑i‑g‑h‑t.</p>'},
    {h:"The teens", body:'<p>Most teens are the small number + <b>teen</b>: six<b>teen</b>, seven<b>teen</b>, four<b>teen</b>, nine<b>teen</b>.</p><p>Three change a little: <b>thir</b>teen (not three‑teen), <b>fif</b>teen (not five‑teen), <b>eigh</b>teen (only one t).</p><p>Two are special: <b>eleven</b> (three e\'s!) and <b>twelve</b> (ends in v‑e).</p>'},
    {h:"Counting by tens", body:'<p>The tens end in <b>ty</b>: six<b>ty</b>, seven<b>ty</b>, nine<b>ty</b> (keep the e in nine!).</p><p>The tricky ones: <b>twen</b>ty (hear the t), <b>thir</b>ty, <b>fif</b>ty, <b>eigh</b>ty (one t).</p><div class="trap"><b>Sneakiest word on the list:</b> four and fourteen have a u, but <b>forty</b> does not. f‑o‑r‑t‑y.</div>'},
    {h:"The little dash", body:'<p>From twenty‑one to ninety‑nine, put a little dash (‑) between the tens word and the ones word.</p><p><b>twenty‑one</b> · <b>thirty‑five</b> · <b>forty‑eight</b> · <b>ninety‑nine</b></p><p>The dash key is next to the 0 on the keyboard.</p>'},
    {h:"The hundreds", body:'<p>Say how many hundreds, then a space, then the rest. No dash after hundred, and no “and.”</p><p><b>one hundred</b> · <b>one hundred seven</b> · <b>one hundred eighteen</b> · <b>one hundred forty‑six</b></p><p><b>hundred</b> is hun + dred: h‑u‑n‑d‑r‑e‑d.</p>'},
    {h:"How to play", body:'<p>Tap <b>Start</b>. You\'ll see a number and hear it. Tap <b>🔊 Hear it again</b> as many times as you want.</p><p>Type the number in words and tap <b>Check</b>. Get 6 of 8 right to earn a sticker!</p>'}
  ]
};
})();
