/* Skill-practice engine: generated problems, typed answers, worked solutions, levels.
   Reads window.PRACTICE (see README.md for the content format). */
(function(){
"use strict";
const P = window.PRACTICE;
const $app = document.getElementById("app");
if(!P){ $app.innerHTML = "<p class='warn'>No practice content loaded.</p>"; return; }

const SET = P.setSize || 10, PASS = P.passAt || 8, LV = P.levels, KID = !!P.kid;
if(KID) document.body.classList.add("kid");
const REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const CHEERS = P.cheers || ["Yes!","Nailed it!","You got it!","Way to go!","Boom!","Nice one!"];
const OOPS = P.oops || ["Almost! Let's look.","Not quite. Here's how it goes.","Close one. Check this out."];

/* ---------- storage ---------- */
const KEY = "study-"+P.id;
let storageOK = true;
function blank(){ return {levels:{},days:{},total:0,correct:0,mistakes:{},last:null,stickers:[]}; }
function load(){
  try{
    localStorage.setItem(KEY+"-t","1"); localStorage.removeItem(KEY+"-t");
    const r = localStorage.getItem(KEY);
    if(r) return Object.assign(blank(), JSON.parse(r));
  }catch(e){ storageOK = false; }
  return blank();
}
let S = load();
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){ storageOK = false; } }
function lv(i){ if(!S.levels[i]) S.levels[i] = {attempts:0,correct:0,sets:0,passed:false,best:0}; return S.levels[i]; }
function dayKey(d){ return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function todayKey(){ return dayKey(new Date()); }
function unlocked(i){ return i===0 || lv(i-1).passed; }
function recommended(){ for(let i=0;i<LV.length;i++){ if(unlocked(i) && !lv(i).passed) return i; } return LV.length-1; }
function streak(){
  let n = 0; const d = new Date(); d.setHours(0,0,0,0);
  if(!S.days[dayKey(d)]) d.setDate(d.getDate()-1);
  while(S.days[dayKey(d)]){ n++; d.setDate(d.getDate()-1); }
  return n;
}

/* ---------- answers ---------- */
function esc(s){ return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }
function typeOf(p){ return p.type || P.answerType || "number"; }
function parseAnswer(p,raw){
  let s = String(raw).trim().toLowerCase().replace(/−/g,"-").replace(/,/g,".").replace(/\s+/g,"");
  const t = typeOf(p);
  if(s==="") return {empty:true};
  if(t==="money"){
    const hadDollar = s.indexOf("$")>=0, hadCent = /¢|c$/.test(s);
    s = s.replace(/[$¢c]/g,"");
    if(!/^\d*\.?\d+$/.test(s)) return {bad:true};
    if(s.indexOf(".")>=0) return {v: Math.round(parseFloat(s)*100)};
    const n = parseInt(s,10);
    if(hadCent) return {v:n};
    if(hadDollar) return {v:n*100};
    if(p.unit==="cents") return {v:n};
    if(p.unit==="dollars") return {v:n*100};   // strict: this level is about writing $0.56
    return {v: n>=10 ? n : n*100};          // "40" means 40¢, "1" means $1
  }
  if(t==="time"){
    s = s.replace(/[.:h]/g,":").replace(/(am|pm)$/,"");
    let mm = s.match(/^(\d{1,2}):(\d{2})$/);
    if(!mm){ const d = s.match(/^(\d{3,4})$/); if(d){ const z = d[1]; mm = [z, z.slice(0,z.length-2), z.slice(-2)]; } }
    if(!mm) return {bad:true};
    let h = parseInt(mm[1],10), m = parseInt(mm[2],10);
    if(m>59 || h<0 || h>12) return {bad:true, why: m>59 ? "Minutes only go up to 59." : "Hours go from 1 to 12."};
    if(h===0) h = 12;
    return {v: h*60+m};
  }
  s = s.replace(/^[a-z]=/,"");
  const fr = s.match(/^(-?\d+)\/(-?\d+)$/);
  if(fr){ if(+fr[2]===0) return {bad:true}; return {v: fr[1]/fr[2]}; }
  if(!/^-?\d*\.?\d+$/.test(s)) return {bad:true};
  return {v: parseFloat(s)};
}
function answerValue(p){
  if(typeOf(p)==="time"){ const m = String(p.a).split(":"); return (+m[0])*60 + (+m[1]); }
  return p.a;
}
function fmtAns(p,v){
  const t = typeOf(p);
  if(t==="money"){ return (p.unit==="cents" && v<100) ? v+"¢" : "$"+(v/100).toFixed(2); }
  if(t==="time"){ const h = Math.floor(v/60), m = v%60; return h+":"+String(m).padStart(2,"0"); }
  return (Math.round(v*1000)/1000).toString().replace("-","−");
}
function badMsg(p,a){
  if(a.why) return a.why;
  const t = typeOf(p);
  return t==="money" ? "Type an amount, like 45 or $1.15." : t==="time" ? "Type a time, like 3:30." : "Enter a number, like −4 or 3/2.";
}

/* ---------- sessions ---------- */
let view = {name:"home"}, sess = null;
function startSet(levelIdx, mixed){
  const items = [];
  for(let k=0;k<SET;k++){
    const li = mixed ? mixed[Math.floor(Math.random()*mixed.length)] : levelIdx;
    let p, tries = 0;
    do { p = LV[li].gen(); tries++; } while(tries<10 && items.some(o=>o.p.q===p.q));
    items.push({li,p});
  }
  sess = {level:levelIdx,mixed:!!mixed,title:mixed?"Mixed review":LV[levelIdx].name,items,i:0,score:0,missed:[],err:""};
  view = {name:"run"}; render(true);
}
function check(raw){
  const it = sess.items[sess.i], p = it.p;
  if(it.given!==undefined) return;
  const a = parseAnswer(p,raw);
  if(a.empty){ sess.err = "Type your answer first."; render(false,true); return; }
  if(a.bad){ sess.err = badMsg(p,a); render(false,true); return; }
  sess.err = "";
  const want = answerValue(p), ok = Math.abs(a.v - want) < 1e-9;
  it.given = a.v; it.ok = ok;
  const L = lv(it.li); L.attempts++; S.total++;
  if(ok){ L.correct++; S.correct++; sess.score++; it.cheer = CHEERS[Math.floor(Math.random()*CHEERS.length)]; }
  else {
    sess.missed.push(it); it.oops = OOPS[Math.floor(Math.random()*OOPS.length)];
    const hint = (p.hints||[]).find(h=>Math.abs(h.v - a.v) < 1e-9);
    if(hint){ it.hint = hint; S.mistakes[hint.key] = (S.mistakes[hint.key]||0)+1; }
  }
  save(); render();
  if(ok && KID) sparkle();
}
function next(){
  sess.i++;
  if(sess.i >= sess.items.length) finish(); else render(true);
}
function finish(){
  const passed = sess.score >= PASS;
  if(!sess.mixed){
    const L = lv(sess.level); L.sets++; L.best = Math.max(L.best, sess.score);
    if(passed && !L.passed){
      L.passed = true; sess.unlockedNext = sess.level+1 < LV.length;
      const st = LV[sess.level].sticker; if(st && S.stickers.indexOf(st)<0){ S.stickers.push(st); sess.newSticker = st; }
    }
  }
  S.days[todayKey()] = (S.days[todayKey()]||0)+1;
  S.last = {score:sess.score,total:sess.items.length,title:sess.title};
  save(); view = {name:"results"}; render(true);
  if(passed && KID) confetti();
}

/* ---------- celebrations ---------- */
function sparkle(){
  if(REDUCED) return;
  const el = document.querySelector(".fb.good"); if(!el) return;
  for(let i=0;i<8;i++){ const s = document.createElement("i"); s.className = "spark"; s.style.left = (10+Math.random()*80)+"%"; s.style.animationDelay = (Math.random()*0.2)+"s"; el.appendChild(s); }
}
function confetti(){
  if(REDUCED) return;
  const c = document.createElement("canvas"); c.className = "confetti"; document.body.appendChild(c);
  const ctx = c.getContext("2d"); c.width = innerWidth; c.height = innerHeight;
  const colors = ["#F5A524","#2742B8","#E24B4A","#1D9E75","#7F77DD","#D4537E"];
  const bits = Array.from({length:120},()=>({x:Math.random()*c.width,y:-20-Math.random()*c.height*0.5,r:5+Math.random()*6,vx:(Math.random()-0.5)*2,vy:2+Math.random()*3,rot:Math.random()*6,vr:(Math.random()-0.5)*0.3,col:colors[Math.floor(Math.random()*colors.length)]}));
  const t0 = performance.now();
  (function frame(t){
    ctx.clearRect(0,0,c.width,c.height);
    bits.forEach(b=>{ b.x+=b.vx; b.y+=b.vy; b.rot+=b.vr; ctx.save(); ctx.translate(b.x,b.y); ctx.rotate(b.rot); ctx.fillStyle=b.col; ctx.fillRect(-b.r/2,-b.r/2,b.r,b.r*0.6); ctx.restore(); });
    if(t-t0 < 2600) requestAnimationFrame(frame); else c.remove();
  })(t0);
}

/* ---------- views ---------- */
function stars(score,total){
  const n = score>=total ? 3 : score>=PASS ? 2 : score>=Math.ceil(total/2) ? 1 : 0;
  return '<div class="stars" aria-label="'+n+' of 3 stars">'+[0,1,2].map(k=>'<span class="'+(k<n?"on":"")+'">★</span>').join("")+'</div>';
}
function unlockedCount(){ let n=0; LV.forEach((l,i)=>{ if(unlocked(i)) n++; }); return n; }

function viewHome(){
  const rec = recommended(), st = streak(), today = S.days[todayKey()]||0;
  let h = '<section class="panel"><div class="row"><div><h1>'+esc(P.title)+'</h1><p class="sub">'+esc(P.intro)+'</p></div>'+(st>0?'<span class="badge">'+st+'-day streak</span>':"")+'</div>';
  h += '<div class="step next" style="display:grid"><span class="mark">'+(today?"✓":"1")+'</span><div><strong>'+(today?"Today's set is done. Another one?":"Today's set")+'</strong><span class="d">Level '+(rec+1)+': '+esc(LV[rec].name)+' · '+SET+' problems · get '+PASS+' right to pass</span></div><button class="btn small primary" data-act="start" data-l="'+rec+'">Start</button></div>';
  h += '<div class="btns"><button class="btn" data-act="go" data-to="learn">'+(KID?"Show me how":"Learn how")+'</button>'+(unlockedCount()>1?'<button class="btn" data-act="mixed">Mixed review</button>':"")+'</div></section>';
  if(!storageOK) h += '<p class="warn">This browser is blocking saved data, so progress won\'t be remembered after you close the tab.</p>';
  if(KID){
    const all = LV.map(l=>l.sticker).filter(Boolean);
    if(all.length) h += '<section class="panel shelf"><div class="row"><h3>Sticker shelf</h3><span class="sub">'+S.stickers.length+' of '+all.length+'</span></div><div class="stickers">'+all.map(s=>'<span class="sticker'+(S.stickers.indexOf(s)>=0?"":" locked")+'">'+s+'</span>').join("")+'</div></section>';
  }
  h += '<section class="panel"><h3>Levels</h3><ol class="steps">';
  LV.forEach((l,i)=>{
    const L = lv(i), open = unlocked(i), cls = L.passed?"done":(open?(i===rec?"next":""):"locked");
    h += '<li class="step '+cls+'"><span class="mark">'+(L.passed?(l.sticker||"✓"):(i+1))+'</span><div><strong>'+esc(l.name)+'</strong><span class="d">'+esc(l.desc)+(L.sets?' · best '+L.best+' of '+SET:'')+'</span></div>'+
      (open?'<button class="btn small'+(i===rec?" primary":"")+'" data-act="start" data-l="'+i+'">'+(L.passed?"Play again":"Start")+'</button>':'<span class="sub">Pass level '+i+' first</span>')+'</li>';
  });
  h += '</ol></section>';
  return h;
}

function viewLearn(){
  return '<div class="row"><button class="btn quiet" data-act="go" data-to="home">← Back</button><span class="sub">'+(KID?"Show me how":"Learn how")+'</span></div>'+
    P.lesson.map(s=>'<section class="panel"><h2>'+s.h+'</h2>'+s.body+'</section>').join("")+
    '<div class="btns"><button class="btn primary" data-act="start" data-l="'+recommended()+'">'+(KID?"Let's play":"Practice now")+'</button></div>';
}

function viewRun(){
  const it = sess.items[sess.i], p = it.p, n = sess.items.length;
  let h = '<div class="row"><button class="btn quiet" data-act="quit">← Quit</button><span class="sub">'+esc(sess.title)+' · '+(sess.i+1)+' of '+n+' · '+(KID?"⭐ ":"score ")+sess.score+'</span></div>';
  h += '<div class="bar"><i style="width:'+Math.round(sess.i/n*100)+'%"></i></div>';
  h += '<section class="panel"><p class="sub">'+esc(p.prompt||P.prompt||"Solve.")+'</p><div class="eq'+(p.wide?" wide":"")+'">'+p.q+'</div>';
  const label = p.label!==undefined ? p.label : (P.label||"Answer"), suffix = p.suffix||"";
  if(it.given===undefined){
    h += '<form class="ansrow" data-act="check">'+(label?'<label class="sub lab" for="ans">'+esc(label)+'</label>':"")+'<input id="ans" class="ans" autocomplete="off" inputmode="'+(typeOf(p)==="number"&&KID?"decimal":"text")+'" placeholder="'+esc(p.placeholder||P.placeholder||"?")+'" aria-describedby="err">'+(suffix?'<span class="lab">'+esc(suffix)+'</span>':"")+'<button class="btn primary" type="submit">Check</button></form>';
    h += '<p id="err" class="err">'+esc(sess.err)+'</p>';
  } else {
    h += '<div class="fb '+(it.ok?"good":"bad")+'"><b class="'+(it.ok?"good":"bad")+'">'+(it.ok?(KID?it.cheer:"Correct."):(KID?it.oops:"Not quite."))+'</b> '+
      (it.ok?"":"You put "+fmtAns(p,it.given)+". The answer is "+fmtAns(p,answerValue(p))+".")+
      (it.hint?'<p class="hintmsg">'+it.hint.msg+'</p>':"")+'</div>';
    h += '<div class="sol"><p class="sub">'+(KID?"How it works":"Worked solution")+'</p><ol>'+p.steps.map(s=>'<li>'+s+'</li>').join("")+'</ol>'+(p.check?'<p class="chk">'+p.check+'</p>':"")+'</div>';
    h += '<div class="btns"><button class="btn primary" id="nextq" data-act="next">'+(sess.i+1<n?"Next":"See results")+'</button></div>';
  }
  return h+'</section>';
}

function viewResults(){
  const n = sess.items.length, passed = sess.score>=PASS;
  let h = '<section class="panel results"><p class="sub">'+esc(sess.title)+'</p>'+(KID?stars(sess.score,n):"")+'<h1>'+sess.score+' of '+n+'</h1>';
  if(sess.newSticker) h += '<div class="award"><span class="sticker big">'+sess.newSticker+'</span><p><strong>New sticker!</strong> Level '+(sess.level+1)+' passed.</p></div>';
  if(sess.mixed) h += '<p>'+(passed?"Strong review.":"Good practice. The misses below show what to look at.")+'</p>';
  else if(sess.unlockedNext) h += '<p><strong>Level passed.</strong> Level '+(sess.level+2)+' is unlocked: '+esc(LV[sess.level+1].name)+'.</p>';
  else if(passed) h += '<p>'+(lv(sess.level).passed&&!sess.newSticker?"Passed again. Keep it sharp.":"Level passed.")+'</p>';
  else h += '<p>You need '+PASS+' of '+n+' to pass this level. '+(KID?"Look at the ones you missed, then try again. You've got this.":"Look over the misses, then try another set.")+'</p>';
  if(sess.missed.length){
    h += '<h3>Worth another look</h3><ol class="miss">'+sess.missed.map(it=>'<li><span class="eqsmall">'+(it.p.review||it.p.q)+'</span><br><span>Answer: '+fmtAns(it.p,answerValue(it.p))+' · you put '+fmtAns(it.p,it.given)+(it.hint?' · '+it.hint.short:'')+'</span></li>').join("")+'</ol>';
  }
  h += '<div class="btns"><button class="btn primary" data-act="start" data-l="'+(sess.unlockedNext?sess.level+1:sess.level)+'">'+(sess.unlockedNext?"Start level "+(sess.level+2):(KID?"Play again":"Another set"))+'</button><button class="btn" data-act="go" data-to="home">Back</button></div></section>';
  return h;
}

function viewProgress(){
  const acc = S.total ? Math.round(S.correct/S.total*100) : 0;
  const sets = Object.values(S.days).reduce((a,b)=>a+b,0);
  let h = '<section class="panel"><h1>Progress</h1><div class="stats"><div class="stat"><b>'+S.total+'</b><span>Problems solved</span></div><div class="stat"><b>'+acc+'%</b><span>Accuracy</span></div><div class="stat"><b>'+sets+'</b><span>Sets completed</span></div><div class="stat"><b>'+streak()+'</b><span>Day streak</span></div></div>';
  LV.forEach((l,i)=>{ const L = lv(i), pct = L.attempts?Math.round(L.correct/L.attempts*100):0;
    h += '<div class="erarow"><span>'+esc(l.name)+'</span><div class="bar"><i style="width:'+pct+'%"></i></div><em>'+(L.attempts?pct+'%':'–')+'</em></div>'; });
  h += '</section>';
  const mk = Object.keys(S.mistakes).sort((a,b)=>S.mistakes[b]-S.mistakes[a]);
  h += '<section class="panel"><h3>Common slips</h3>'+(mk.length?'<div class="chips">'+mk.map(k=>'<span class="chip">'+esc((P.mistakeNames||{})[k]||k)+' × '+S.mistakes[k]+'</span>').join("")+'</div><p class="sub">These are the patterns behind wrong answers. Fewer over time is the goal.</p>':'<p class="sub">Nothing here yet. Patterns behind wrong answers show up here.</p>')+'</section>';
  h += '<div class="btns"><button class="btn quiet" data-act="reset">'+(view.confirmReset?"Tap again to erase all progress":"Reset progress")+'</button></div>';
  return h;
}

function render(top,keepInput){
  const v = view.name;
  const prev = keepInput && document.getElementById("ans") ? document.getElementById("ans").value : null;
  $app.innerHTML = v==="home"?viewHome():v==="learn"?viewLearn():v==="run"?viewRun():v==="results"?viewResults():viewProgress();
  ["home","learn","progress"].forEach(n=>{ const b = document.getElementById("nav-"+n); if(!b) return; if(v===n) b.setAttribute("aria-current","page"); else b.removeAttribute("aria-current"); });
  if(top) window.scrollTo(0,0);
  const inp = document.getElementById("ans");
  if(inp){ if(prev!==null) inp.value = prev; inp.focus(); }
  const nx = document.getElementById("nextq"); if(nx) nx.focus();
}

/* ---------- actions ---------- */
const ACT = {
  go(el){ sess = null; view = {name:el.dataset.to}; render(true); },
  quit(){ sess = null; view = {name:"home"}; render(true); },
  start(el){ startSet(+el.dataset.l); },
  mixed(){ const open = []; LV.forEach((l,i)=>{ if(unlocked(i)) open.push(i); }); startSet(open[open.length-1], open); },
  next(){ next(); },
  reset(){ if(view.confirmReset){ S = blank(); save(); view = {name:"home"}; render(true); } else { view.confirmReset = true; render(); } }
};
document.addEventListener("click",e=>{
  const el = e.target.closest("[data-act]"); if(!el || el.tagName==="FORM") return;
  const f = ACT[el.dataset.act]; if(f) f(el);
});
document.addEventListener("submit",e=>{
  const f = e.target.closest("form[data-act=check]"); if(!f) return;
  e.preventDefault(); check(document.getElementById("ans").value);
});
document.addEventListener("keydown",e=>{
  if(e.key==="Enter" && e.target.id==="ans"){ e.preventDefault(); check(e.target.value); }
});
document.addEventListener("input",e=>{ if(e.target.id==="ans" && sess && sess.err){ sess.err=""; const el = document.getElementById("err"); if(el) el.textContent=""; } });

document.title = P.student+"'s "+P.title;
render();
})();
