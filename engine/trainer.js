/* Study trainer engine. Reads window.GUIDE (see README.md for the content format). */
(function(){
"use strict";
const G = window.GUIDE;
if(!G){ document.getElementById("app").innerHTML = "<p class='warn'>No guide content loaded.</p>"; return; }

/* ---------- content ---------- */
const GROUPS = {}; const GIDX = {};
G.groups.forEach((g,k)=>{ GROUPS[g.key] = g.name; GIDX[g.key] = "g"+k; });
const DAYS = G.days;                       // [{title, kind}] kind: learn | connect | review | final | test
const N = DAYS.length;
const TERMS = G.terms;
const T = {}; TERMS.forEach(t=>T[t.id]=t);
const N_LEARN = DAYS.filter(d=>d.kind==="learn").length;
const CONNECT = N_LEARN+1;                  // hand-written questions with d:"C" unlock on the connect day
const HAND = (G.questions||[]).map(h=>Object.assign({},h,{d:h.d==="C"?CONNECT:h.d}));
const ORDERS = G.orders||[];
const BIG = G.bigPicture||null;
const DAY_TITLES = DAYS.map(d=>d.title);

/* how many learn days have opened by day index i (inclusive) */
function learnNo(i){ let n=0; for(let j=0;j<=i && j<N;j++) if(DAYS[j].kind==="learn") n++; return n; }
function kindOf(i){ return i>=N ? "over" : DAYS[i].kind; }

/* ---------- storage ---------- */
const KEY = "study-"+G.id;
let storageOK = true;
function blank(){ return {terms:{},days:{},last:null}; }
function load(){
  try{
    localStorage.setItem(KEY+"-t","1"); localStorage.removeItem(KEY+"-t");
    const r = localStorage.getItem(KEY);
    if(r){ const o = JSON.parse(r); return Object.assign(blank(), o); }
  }catch(e){ storageOK = false; }
  return blank();
}
let S = load();
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){ storageOK = false; } }
function ts(id){ if(!S.terms[id]) S.terms[id] = {box:0,seen:false,right:0,wrong:0}; return S.terms[id]; }
function dayRec(i){ if(!S.days[i]) S.days[i] = {done:{},scores:{}}; return S.days[i]; }

/* ---------- dates ---------- */
function parseDate(s){ const p = s.split("-").map(Number); return new Date(p[0],p[1]-1,p[2]); }
const START = parseDate(G.start);
const TEST = dateOf(N-1);
function rawIdx(){ const n = new Date(); n.setHours(0,0,0,0); return Math.round((n-START)/864e5); }
function I(){ return Math.min(N-1, Math.max(0, rawIdx())); }
function dateOf(j){ const d = new Date(START); d.setDate(d.getDate()+j); return d; }
function fmt(d,opts){ return d.toLocaleDateString("en-US",opts); }
const TEST_LABEL = fmt(TEST,{weekday:"long",month:"short",day:"numeric"});

/* ---------- helpers ---------- */
function esc(s){ return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }
function shuffle(a){ a = a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function uniq(a){ return Array.from(new Set(a)); }
function unlocked(i){ const n = learnNo(i); return TERMS.filter(t=>t.day<=n); }
function unseen(i){ return unlocked(i).filter(t=>!ts(t.id).seen); }
function seenTerms(){ return TERMS.filter(t=>ts(t.id).seen); }
function weight(id){ const s = ts(id); return (4-s.box) + Math.min(3,s.wrong); }
function weightedOrder(ids){
  return uniq(ids).map(id=>({id,k:Math.pow(Math.random(),1/weight(id))})).sort((a,b)=>b.k-a.k).map(o=>o.id);
}
function weakList(){
  return seenTerms().filter(t=>{const s=ts(t.id); return s.wrong>0 && s.box<3;})
    .sort((a,b)=>ts(a.id).box-ts(b.id).box || ts(b.id).wrong-ts(a.id).wrong);
}
function pips(id){ const b = ts(id).box; return '<span class="pips" aria-label="Mastery '+b+' of 3">'+[1,2,3].map(n=>'<i class="'+(b>=n?"on":"")+'"></i>').join("")+'</span>'; }
function article(t){ return t.article ? t.article+" " : ""; }

/* ---------- question building ---------- */
function distractors(t){
  const open = new Set(unlocked(I()).map(x=>x.id));
  return TERMS.filter(o=>o.id!==t.id && o.auto!==false)
    .map(o=>({o,p:(open.has(o.id)?2:0)+(o.kind===t.kind?1:0)+Math.random()*0.9}))
    .sort((a,b)=>b.p-a.p).slice(0,3).map(x=>x.o);
}
function autoQ(t,mode){
  const ds = distractors(t);
  if(mode==="A"){
    const p = t.kind==="person" ? "Who is this?" : t.kind==="place" ? "Which place is this?" : "Which term matches this definition?";
    return {type:"mc",t:[t.id],prompt:p,quote:t.def,opts:shuffle([{text:t.term,ok:true}].concat(ds.map(d=>({text:d.term,ok:false})))),explain:t.term+": "+t.def};
  }
  const p = t.kind==="person" ? (t.plural?"Who were ":"Who was ")+article(t)+t.term+"?" : t.kind==="place" ? "What was "+article(t)+t.term+"?" : "What does “"+t.term+"” mean?";
  return {type:"mc",t:[t.id],prompt:p,opts:shuffle([{text:t.def,ok:true}].concat(ds.map(d=>({text:d.def,ok:false})))),explain:t.hook};
}
function handQ(h){
  return {type:"mc",t:h.t.slice(),prompt:h.q,opts:shuffle(h.a.map((x,k)=>({text:x,ok:k===0}))),explain:h.e};
}
function questionFor(id,used,lastMode){
  const t = T[id], maxD = learnNo(I()) + (kindOf(I())!=="learn" ? 1 : 0);
  const all = HAND.filter(h=>h.t.indexOf(id)>=0 && h.d<=maxD);
  const fresh = all.filter(h=>!used.has(h));
  let modes = t.auto===false ? [] : ["A","B"];
  if(fresh.length) modes.push("H");
  if(!modes.length){
    if(!all.length) return autoQ(t,"B");
    const h = all[Math.floor(Math.random()*all.length)]; return handQ(h);
  }
  const pick = modes.filter(m=>m!==lastMode[id]);
  const m = (pick.length?pick:modes)[Math.floor(Math.random()*(pick.length?pick:modes).length)];
  lastMode[id] = m;
  if(m==="H"){ const h = fresh[Math.floor(Math.random()*fresh.length)]; used.add(h); return handQ(h); }
  return autoQ(t,m);
}
function matchQ(ids){
  return {type:"match",t:ids.slice(),prompt:"Match each term to its meaning. Pick a term, then pick its match.",defs:shuffle(ids),state:{sel:null,done:{},misses:{},flash:null}};
}
function orderQ(o){
  let sh = shuffle(o.items); let guard = 0;
  while(sh.join("|")===o.items.join("|") && guard++<10) sh = shuffle(o.items);
  return {type:"order",t:[],prompt:o.q,items:o.items,shown:sh,explain:o.e,state:{picked:[]}};
}
function makeQuestions(pool,n,nMatch,used){
  used = used || new Set();
  const lastMode = {}, qs = [];
  const matchable = uniq(pool).filter(id=>T[id].auto!==false);
  const m = matchable.length>=4 ? nMatch : 0;
  let order = weightedOrder(pool), k = 0;
  if(!order.length) return qs;
  while(qs.length < n-m){
    if(k>=order.length){ order = weightedOrder(pool); k = 0; }
    qs.push(questionFor(order[k++],used,lastMode));
  }
  for(let j=0;j<m;j++) qs.push(matchQ(shuffle(matchable).slice(0,4)));
  return shuffle(qs);
}
function resetQ(q){
  if(q.type==="mc"){ q.opts = shuffle(q.opts); }
  if(q.type==="match"){ q.defs = shuffle(q.defs); q.state = {sel:null,done:{},misses:{},flash:null}; }
  if(q.type==="order"){ q.shown = shuffle(q.items); q.state = {picked:[]}; }
  delete q.answered; delete q.ok; delete q.picked;
  return q;
}
function record(id,ok){
  const s = ts(id); s.seen = true;
  if(ok){ s.right++; s.box = Math.min(3,s.box+1); }
  else { s.wrong++; if(s.box>=2) s.box = 1; }
}
function connectQs(){
  const hand = shuffle(HAND.filter(h=>h.d===CONNECT)).slice(0,10-Math.min(3,ORDERS.length)).map(handQ);
  return shuffle(shuffle(ORDERS).slice(0,3).map(orderQ).concat(hand));
}

/* ---------- mission steps ---------- */
function stepsFor(i){
  const rec = dayRec(i), steps = [], kind = kindOf(i);
  if(rec.noWarm===undefined){ rec.noWarm = TERMS.filter(t=>t.day<learnNo(i) && ts(t.id).seen).length===0; save(); }
  if(kind==="learn"){
    if(!rec.noWarm) steps.push({id:"warm",name:"Warm-up",d:"5 questions from earlier days"});
    const un = unseen(i);
    steps.push({id:"learn",name:"Learn",d:(rec.done.learn?TERMS.filter(t=>t.day===learnNo(i)).length:un.length)+" flashcards"});
    steps.push({id:"quiz",name:"Daily quiz",d:"10 questions"});
    return steps;
  }
  if(unseen(i).length || rec.done.catchup) steps.push({id:"catchup",name:"Catch up",d:(unseen(i).length||"")+" cards you haven't seen yet"});
  if(kind==="connect"){
    if(!rec.noWarm) steps.push({id:"warm",name:"Warm-up",d:"5 questions from earlier days"});
    if(BIG) steps.push({id:"big",name:"See how it connects",d:"A short read, no new terms"});
    steps.push({id:"quiz",name:"Connections quiz",d:"10 questions"});
  } else if(kind==="review"){
    steps.push({id:"test",name:"Practice test",d:"25 questions on everything"});
    steps.push({id:"drill",name:"Fix what you missed",d:"10 questions on your weak spots"});
  } else if(kind==="final"){
    steps.push({id:"drill",name:"Weak spots",d:"10 questions on your toughest terms"});
    steps.push({id:"test",name:"Final practice test",d:"25 questions on everything"});
  } else {
    steps.push({id:"warm",name:"Five-minute warm-up",d:"5 quick questions, then go get it"});
  }
  return steps;
}
function minutesFor(i){ const k = kindOf(i); return k==="test"?5:(k==="review"||k==="final")?20:15; }
function checkComplete(i){
  const rec = dayRec(i);
  if(stepsFor(i).every(s=>rec.done[s.id])) rec.complete = true;
  save();
}
function streak(){
  const i = I(); let j = dayRec(i).complete ? i : i-1, n = 0;
  while(j>=0 && S.days[j] && S.days[j].complete){ n++; j--; }
  return n;
}
function drillPool(){
  let ids = weakList().map(t=>t.id);
  const rec = dayRec(I());
  if(rec.missed) ids = uniq(rec.missed.concat(ids));
  if(ids.length<6){
    const rest = seenTerms().filter(t=>ids.indexOf(t.id)<0).sort((a,b)=>ts(a.id).box-ts(b.id).box).map(t=>t.id);
    ids = ids.concat(rest.slice(0,8-ids.length));
  }
  if(ids.length<4) ids = unlocked(I()).map(t=>t.id);
  return ids;
}
function bigTest(){
  const used = new Set();
  const all = TERMS.map(t=>t.id);
  const nOrd = Math.min(2,ORDERS.length);
  const qs = makeQuestions(all,23-nOrd,2,used);
  const extra = shuffle(HAND.filter(h=>h.d===CONNECT && !used.has(h))).slice(0,2).map(handQ);
  return shuffle(qs.concat(extra, shuffle(ORDERS).slice(0,nOrd).map(orderQ)));
}

/* ---------- sessions ---------- */
let view = {name:"home"}, sess = null;

function startStep(id){
  const i = I(), kind = kindOf(i);
  if(id==="learn"||id==="catchup"){
    let list = unseen(i).map(t=>t.id);
    if(!list.length) list = TERMS.filter(t=>t.day===Math.min(learnNo(i),N_LEARN)).map(t=>t.id);
    startCards(list,id, id==="learn"?DAY_TITLES[i]:"Catch up");
  } else if(id==="big"){ view = {name:"big"}; render(true); }
  else if(id==="warm"){
    const pool = kind==="test" ? TERMS.map(t=>t.id) : TERMS.filter(t=>t.day<learnNo(i) && ts(t.id).seen).map(t=>t.id);
    startQuiz(makeQuestions(pool.length?pool:unlocked(i).map(t=>t.id),5,0),"Warm-up","warm");
  } else if(id==="quiz"){
    let qs;
    if(kind==="connect"){ qs = connectQs(); }
    else {
      const today = TERMS.filter(t=>t.day===learnNo(i)).map(t=>t.id);
      const recent = uniq(today.concat(TERMS.filter(t=>ts(t.id).learnedOn===i).map(t=>t.id)));
      const earlier = TERMS.filter(t=>ts(t.id).seen && recent.indexOf(t.id)<0).map(t=>t.id);
      const used = new Set();
      if(earlier.length>=3) qs = shuffle(makeQuestions(recent,7,1,used).concat(makeQuestions(earlier,3,0,used)));
      else qs = makeQuestions(recent,10,1,used);
    }
    startQuiz(qs, kind==="connect"?"Connections quiz":"Daily quiz","quiz");
  } else if(id==="test"){ startQuiz(bigTest(), kind==="final"?"Final practice test":"Practice test","test"); }
  else if(id==="drill"){ startQuiz(makeQuestions(drillPool(),10,1),"Weak spots","drill"); }
}
function startCards(list,stepId,title){
  sess = {kind:"cards",stepId:stepId,title:title,queue:list.slice(),i:0,shown:false,again:{},total:list.length};
  view = {name:"learn"}; render(true);
}
function startQuiz(qs,title,stepId){
  if(!qs.length){ view = {name:"home"}; render(true); return; }
  sess = {kind:"quiz",stepId:stepId,title:title,qs:qs,i:0,score:0,missed:[],missedTerms:[]};
  view = {name:"quiz"}; render(true);
}
function finishCards(){
  if(sess.stepId){ dayRec(I()).done[sess.stepId] = true; checkComplete(I()); }
  sess = null; view = {name:"home"}; render(true);
}
function finishQuiz(){
  const i = I();
  if(sess.stepId){
    const rec = dayRec(i);
    rec.done[sess.stepId] = true; rec.scores[sess.stepId] = [sess.score,sess.qs.length];
    if(sess.stepId==="test") rec.missed = uniq(sess.missedTerms);
    S.last = {score:sess.score,total:sess.qs.length,title:sess.title};
    checkComplete(i);
  }
  save(); view = {name:"results"}; render(true);
}
function answered(q,ok,perTerm){
  q.answered = true; q.ok = ok;
  q.t.forEach(id=>{ const good = perTerm ? !perTerm[id] : ok; record(id,good); if(!good) sess.missedTerms.push(id); });
  if(ok) sess.score++; else sess.missed.push(q);
  save();
}

/* ---------- views ---------- */
const $app = document.getElementById("app");

function viewHome(){
  const raw = rawIdx(), i = I(), over = raw>N-1, kind = kindOf(i);
  const st = streak(), left = N-1-i;
  let h = '<section class="panel"><div class="row"><div><h1>'+(over?G.subject+" is in the books":kind==="test"?"Test day, "+esc(G.student):"Hey "+esc(G.student)+", day "+(i+1)+" of "+(N-1))+'</h1><p class="sub">'+
    (over?"The test was "+TEST_LABEL+". Practice is still open if you want it.":kind==="test"?"You've put in the work. One quick warm-up and you're ready.":"Test is "+TEST_LABEL+" · "+left+" day"+(left===1?"":"s")+" to go")+'</p></div>'+
    (st>0?'<span class="badge">'+st+'-day streak</span>':"")+'</div>';
  h += '<div class="cal" style="--cols:'+Math.min(10,N)+'" aria-label="Study calendar">';
  for(let j=0;j<N;j++){
    const d = dateOf(j), k = DAYS[j].kind; let c = k==="test"?"test":(k==="review"||k==="final")?"rev":"";
    let label = k==="test"?"Test":(k==="review"||k==="final")?"Review":fmt(d,{weekday:"short"});
    if(j<i || (j===i && S.days[j] && S.days[j].complete)){ if(S.days[j] && S.days[j].complete){ c = "done"; label = "Done"; } else if(j<i){ c += " missed"; label = "Missed"; } }
    if(j===i && !over){ c += " today"; if(label!=="Done") label = "Today"; }
    h += '<div class="'+c+'"><b>'+d.getDate()+'</b>'+label+'</div>';
  }
  h += '</div></section>';

  if(!storageOK) h += '<p class="warn">This browser is blocking saved data, so progress won\'t be remembered after you close the tab. Turning off private browsing usually fixes it.</p>';

  if(!over){
    const rec = dayRec(i), steps = stepsFor(i);
    const extra = kind==="learn" ? unseen(i).filter(t=>t.day<learnNo(i)).length : 0;
    let nextFound = false;
    h += '<section class="panel"><div><p class="sub">Today\'s mission · about '+minutesFor(i)+' minutes</p><h2>'+esc(DAY_TITLES[i])+'</h2></div>';
    if(extra) h += '<p class="sub">Includes '+extra+' card'+(extra===1?"":"s")+' from a day you missed, so you stay on track.</p>';
    h += '<ol class="steps">';
    steps.forEach((s,n)=>{
      const done = !!rec.done[s.id]; let cls = done?"done":(!nextFound?"next":"locked");
      if(!done && !nextFound) nextFound = true;
      const sc = rec.scores[s.id];
      h += '<li class="step '+cls+'"><span class="mark">'+(done?"✓":(n+1))+'</span><div><strong>'+esc(s.name)+'</strong><span class="d">'+(done&&sc?"Score: "+sc[0]+" of "+sc[1]:esc(s.d))+'</span></div>'+
        (cls==="locked"?'<span class="sub">Finish step '+n+' first</span>':'<button class="btn small '+(cls==="next"?"primary":"")+'" data-act="step" data-id="'+s.id+'">'+(done?"Redo":"Start")+'</button>')+'</li>';
    });
    h += '</ol>';
    if(rec.complete) h += '<p><strong>Mission complete.</strong> <span class="sub">'+(kind==="test"?"Good luck today. You know this.":"Come back tomorrow for "+esc(DAY_TITLES[i+1])+".")+'</span></p>';
    h += '</section>';
  }
  h += '<section class="panel"><h3>Extra practice</h3><p class="sub">Optional. Short rounds that focus on the terms you miss most.</p><div class="btns"><button class="btn" data-act="practice" data-mode="weak">Practice weak spots</button><button class="btn" data-act="practice" data-mode="mixed">Mixed 10 questions</button><button class="btn" data-act="go" data-to="cards">Browse cards</button></div></section>';
  return h;
}

function viewLearn(){
  const id = sess.queue[sess.i], t = T[id];
  let h = '<div class="row"><button class="btn quiet" data-act="quit">← Quit</button><span class="sub">'+esc(sess.title)+' · card '+(Math.min(sess.i,sess.total-1)+1)+' of '+sess.total+(sess.i>=sess.total?" (second look)":"")+'</span></div>';
  h += '<section class="panel flash" data-act="flip" role="button" tabindex="0" aria-label="Flashcard. Press to flip."><span class="era '+GIDX[t.group]+'">'+esc(GROUPS[t.group]||"")+'</span><div class="term">'+esc(t.term)+'</div>';
  if(sess.shown){
    h += '<p class="def">'+esc(t.def)+'</p><p class="note"><b>Memory hook:</b> '+esc(t.hook)+'</p>';
    if(t.ask) h += '<p class="note ask"><b>You asked:</b> '+esc(t.ask)+'</p>';
  } else h += '<p class="sub">Say the meaning out loud, then tap to check</p>';
  h += '</section>';
  if(sess.shown) h += '<div class="btns" style="justify-content:center"><button class="btn" data-act="card" data-ok="0">Still learning</button><button class="btn primary" id="gotit" data-act="card" data-ok="1">Got it</button></div>';
  return h;
}

function viewBig(){
  const chain = a => '<div class="chain">'+a.map((x,k)=>(k?'<i>→</i>':'')+'<span>'+esc(x)+'</span>').join("")+'</div>';
  let h = '<div class="row"><button class="btn quiet" data-act="quit">← Back</button><span class="sub">The big picture</span></div>';
  h += '<section class="panel"><h2>'+esc(BIG.title)+'</h2><p>'+esc(BIG.intro)+'</p>'+(BIG.chain?chain(BIG.chain):"")+'</section>';
  h += '<section class="panel">'+BIG.sections.map(s=>'<h3>'+esc(s.h)+'</h3>'+chain(s.chain)+(s.note?'<p class="sub">'+esc(s.note)+'</p>':"")).join("")+'</section>';
  h += '<div class="btns"><button class="btn primary" data-act="bigdone">Got it, take me to the quiz</button></div>';
  return h;
}

function viewQuiz(){
  const q = sess.qs[sess.i], n = sess.qs.length;
  let h = '<div class="row"><button class="btn quiet" data-act="quit">← Quit</button><span class="sub">'+esc(sess.title)+' · question '+(sess.i+1)+' of '+n+' · score '+sess.score+'</span></div>';
  h += '<div class="bar"><i style="width:'+Math.round(sess.i/n*100)+'%"></i></div><section class="panel"><h2>'+esc(q.prompt)+'</h2>';
  if(q.quote) h += '<p class="quote">'+esc(q.quote)+'</p>';
  if(q.type==="mc"){
    h += '<div class="opts">'+q.opts.map((o,k)=>{
      let c = ""; if(q.answered){ c = " locked"+(o.ok?" good":(q.picked===k?" bad":"")); }
      return '<button class="opt'+c+'" data-act="pick" data-k="'+k+'"><span class="k">'+(k+1)+'</span><span>'+esc(o.text)+'</span></button>';
    }).join("")+'</div>';
  } else if(q.type==="match"){
    const s = q.state;
    h += '<div class="match"><div class="opts">'+q.t.map(id=>'<button class="opt'+(s.done[id]?" good locked":s.sel===id?" sel":"")+'" data-act="mterm" data-id="'+id+'">'+esc(T[id].term)+'</button>').join("")+'</div><div class="opts">'+
      q.defs.map(id=>'<button class="opt'+(s.done[id]?" good locked":s.flash===id?" bad":"")+'" data-act="mdef" data-id="'+id+'">'+esc(T[id].short)+'</button>').join("")+'</div></div>';
    if(!q.answered) h += '<p class="sub">'+(s.sel?"Now pick the meaning of “"+esc(T[s.sel].term)+"”.":"Pick a term on the left first.")+'</p>';
  } else {
    const s = q.state;
    h += '<div class="opts">'+q.shown.map((it,k)=>{
      const pos = s.picked.indexOf(it); let c = pos>=0?" sel":"";
      if(q.answered) c = " locked"+(q.items[pos]===it?" good":" bad");
      return '<button class="opt'+c+'" data-act="ord" data-k="'+k+'"><span class="k">'+(pos>=0?pos+1:"·")+'</span><span>'+esc(it)+'</span></button>';
    }).join("")+'</div>';
    if(!q.answered) h += s.picked.length===q.items.length ? '<div class="btns"><button class="btn primary" data-act="ordcheck">Check my order</button><button class="btn" data-act="ordreset">Start over</button></div>' : '<p class="sub">Tap the events in order, earliest first. Tap one again to undo it.</p>';
  }
  if(q.answered){
    let msg = "";
    if(q.type==="match") msg = q.ok ? "All matched without a miss." : "Matched. Look again at: "+q.t.filter(id=>q.state.misses[id]).map(id=>T[id].term+" ("+T[id].short+")").join("; ")+".";
    else if(q.type==="order") msg = (q.ok?"":"Correct order: "+q.items.join(" → ")+". ")+q.explain;
    else msg = q.explain;
    h += '<div class="fb '+(q.ok?"good":"bad")+'"><b class="'+(q.ok?"good":"bad")+'">'+(q.ok?"Correct.":"Not quite.")+'</b> '+esc(msg)+'</div><div class="btns"><button class="btn primary" id="nextq" data-act="next">'+(sess.i+1<n?"Next question":"See results")+'</button></div>';
  }
  return h+'</section>';
}

function viewResults(){
  const n = sess.qs.length, pct = Math.round(sess.score/n*100);
  const head = pct>=90?"Excellent work":pct>=70?"Solid round":"Good practice. Misses are how you find what to study.";
  let h = '<section class="panel"><p class="sub">'+esc(sess.title)+'</p><h1>'+sess.score+' of '+n+'</h1><p>'+head+'</p>';
  if(sess.missed.length){
    h += '<h3>Worth another look</h3><ol class="miss">'+sess.missed.map(q=>{
      if(q.type==="match") return '<li>Matching<br><span>'+q.t.filter(id=>q.state.misses[id]).map(id=>esc(T[id].term)+": "+esc(T[id].short)).join("<br>")+'</span></li>';
      if(q.type==="order") return '<li>'+esc(q.prompt)+'<br><span>'+esc(q.items.join(" → "))+'</span></li>';
      return '<li>'+esc(q.prompt)+(q.quote?" “"+esc(q.quote)+"”":"")+'<br><span>Answer: '+esc(q.opts.filter(o=>o.ok)[0].text)+'</span></li>';
    }).join("")+'</ol>';
  }
  h += '<div class="btns">'+(sess.missed.length?'<button class="btn" data-act="retry">Retry the ones I missed</button>':"")+'<button class="btn primary" data-act="go" data-to="home">Back to today</button></div></section>';
  return h;
}

function viewCards(){
  const i = I(), openTo = learnNo(i);
  let h = '<section class="panel"><h1>All cards</h1><p class="sub">Tap a term to see its meaning and memory hook. New cards open each day.</p></section>';
  let dayIdx = 0;
  for(let d=1;d<=N_LEARN;d++){
    while(dayIdx<N && DAYS[dayIdx].kind!=="learn") dayIdx++;
    const list = TERMS.filter(t=>t.day===d), open = d<=openTo, title = DAYS[dayIdx] ? DAYS[dayIdx].title : "Day "+d, when = dateOf(dayIdx);
    dayIdx++;
    h += '<section class="panel'+(open?"":" lockedgrp")+'"><div class="row"><h3>'+esc(title)+'</h3><span class="sub">'+(open?list.length+" cards":"Opens "+fmt(when,{weekday:"short",month:"short",day:"numeric"}))+'</span></div>';
    if(open) h += '<div>'+list.map(t=>'<details><summary><span>'+esc(t.term)+' <span class="era '+GIDX[t.group]+'">'+esc(GROUPS[t.group]||"")+'</span></span>'+pips(t.id)+'</summary><p>'+esc(t.def)+'</p><p class="hook">'+esc(t.hook)+'</p>'+(t.ask?'<p class="hook"><strong>You asked:</strong> '+esc(t.ask)+'</p>':"")+'</details>').join("")+'</div>';
    h += '</section>';
  }
  return h;
}

function viewProgress(){
  const mastered = TERMS.filter(t=>ts(t.id).box>=3).length;
  const daysDone = DAYS.filter((d,j)=>d.kind!=="test" && S.days[j] && S.days[j].complete).length;
  let h = '<section class="panel"><h1>Progress</h1><div class="stats"><div class="stat"><b>'+mastered+' of '+TERMS.length+'</b><span>Terms mastered</span></div><div class="stat"><b>'+(S.last?S.last.score+" of "+S.last.total:"–")+'</b><span>'+(S.last?esc(S.last.title):"Last quiz")+'</span></div><div class="stat"><b>'+daysDone+' of '+(N-1)+'</b><span>Days completed</span></div></div>';
  G.groups.forEach(g=>{
    const list = TERMS.filter(t=>t.group===g.key); if(!list.length) return;
    const sum = list.reduce((a,t)=>a+ts(t.id).box,0), pct = Math.round(sum/(list.length*3)*100);
    h += '<div class="erarow"><span>'+esc(g.name)+'</span><div class="bar '+GIDX[g.key]+'"><i style="width:'+pct+'%"></i></div><em>'+pct+'%</em></div>';
  });
  h += '<p class="sub">A term is mastered after you mark its card “Got it” and then answer two quiz questions on it correctly, with no miss in between. A miss sends it back for more practice.</p></section>';
  const weak = weakList().slice(0,8);
  h += '<section class="panel"><h3>Needs more practice</h3>'+(weak.length?'<div class="chips">'+weak.map(t=>'<span class="chip">'+esc(t.term)+'</span>').join("")+'</div>':'<p class="sub">Nothing here yet. Terms you miss on quizzes show up here.</p>')+'<div class="btns"><button class="btn primary" data-act="practice" data-mode="weak">Practice weak spots</button></div></section>';
  const seen = seenTerms();
  if(seen.length) h += '<section class="panel"><h3>Every term so far</h3><div>'+seen.map(t=>'<div class="row" style="padding:6px 0;border-top:1px solid var(--line)"><span>'+esc(t.term)+'</span>'+pips(t.id)+'</div>').join("")+'</div></section>';
  h += '<div class="btns"><button class="btn quiet" data-act="reset">'+(view.confirmReset?"Tap again to erase all progress":"Reset progress")+'</button></div>';
  return h;
}

function render(top){
  const v = view.name;
  $app.innerHTML = v==="home"?viewHome():v==="learn"?viewLearn():v==="big"?viewBig():v==="quiz"?viewQuiz():v==="results"?viewResults():v==="cards"?viewCards():viewProgress();
  ["home","cards","progress"].forEach(n=>{ const b = document.getElementById("nav-"+n); if(!b) return; if(v===n) b.setAttribute("aria-current","page"); else b.removeAttribute("aria-current"); });
  if(top) window.scrollTo(0,0);
  const f = document.getElementById("nextq") || document.getElementById("gotit"); if(f) f.focus();
}

/* ---------- actions ---------- */
const ACT = {
  go(el){ sess = null; view = {name:el.dataset.to}; render(true); },
  quit(){ sess = null; view = {name:"home"}; render(true); },
  step(el){ startStep(el.dataset.id); },
  practice(el){
    let pool = el.dataset.mode==="weak" ? drillPool() : seenTerms().map(t=>t.id);
    if(pool.length<4) pool = unlocked(I()).map(t=>t.id);
    startQuiz(makeQuestions(pool,10,1), el.dataset.mode==="weak"?"Weak spots practice":"Mixed practice", null);
  },
  flip(){ sess.shown = !sess.shown; render(); },
  card(el){
    const id = sess.queue[sess.i], s = ts(id), ok = el.dataset.ok==="1";
    s.seen = true; if(s.learnedOn===undefined) s.learnedOn = I();
    if(ok) s.box = Math.max(s.box,1);
    else if(!sess.again[id]){ sess.again[id] = true; sess.queue.push(id); }
    save(); sess.i++; sess.shown = false;
    if(sess.i>=sess.queue.length) finishCards(); else render(true);
  },
  bigdone(){ dayRec(I()).done.big = true; checkComplete(I()); view = {name:"home"}; render(true); },
  pick(el){
    const q = sess.qs[sess.i]; if(q.answered || q.type!=="mc") return;
    q.picked = +el.dataset.k; answered(q, q.opts[q.picked].ok); render();
  },
  mterm(el){ const q = sess.qs[sess.i]; if(q.answered || q.state.done[el.dataset.id]) return; q.state.sel = el.dataset.id; render(); },
  mdef(el){
    const q = sess.qs[sess.i], s = q.state, id = el.dataset.id; if(q.answered || s.done[id] || !s.sel) return;
    if(id===s.sel){ s.done[id] = true; s.sel = null; if(q.t.every(x=>s.done[x])) answered(q, Object.keys(s.misses).length===0, s.misses); render(); }
    else { s.misses[s.sel] = true; s.flash = id; render(); setTimeout(()=>{ if(s.flash===id){ s.flash = null; if(view.name==="quiz" && sess && sess.qs[sess.i]===q) render(); } },600); }
  },
  ord(el){
    const q = sess.qs[sess.i]; if(q.answered) return;
    const it = q.shown[+el.dataset.k], p = q.state.picked, at = p.indexOf(it);
    if(at>=0) p.splice(at,1); else p.push(it); render();
  },
  ordreset(){ sess.qs[sess.i].state.picked = []; render(); },
  ordcheck(){ const q = sess.qs[sess.i]; answered(q, q.state.picked.join("|")===q.items.join("|")); render(); },
  next(){ sess.i++; if(sess.i>=sess.qs.length) finishQuiz(); else render(true); },
  retry(){ startQuiz(sess.missed.map(resetQ),"Second try",null); },
  reset(){ if(view.confirmReset){ S = blank(); save(); view = {name:"home"}; render(true); } else { view.confirmReset = true; render(); } }
};
document.addEventListener("click",e=>{
  const el = e.target.closest("[data-act]"); if(!el) return;
  const f = ACT[el.dataset.act]; if(f) f(el);
});
document.addEventListener("keydown",e=>{
  if(e.metaKey||e.ctrlKey||e.altKey) return;
  const onBtn = document.activeElement && document.activeElement.tagName==="BUTTON";
  if(view.name==="quiz" && sess){
    const q = sess.qs[sess.i];
    if(q.type==="mc" && !q.answered && /^[1-4]$/.test(e.key) && q.opts[+e.key-1]){ q.picked = +e.key-1; answered(q,q.opts[q.picked].ok); render(); }
  } else if(view.name==="learn" && sess){
    if((e.key===" "||e.key==="Enter") && !onBtn){ e.preventDefault(); ACT.flip(); }
  }
});

document.title = G.student+"'s "+G.subject;
render();
})();
