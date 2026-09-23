/* Skill-practice engine: generated problems, typed answers, worked solutions, levels.
   Reads window.PRACTICE (see README.md for the content format). */
(function(){
"use strict";
const P = window.PRACTICE;
const $app = document.getElementById("app");
if(!P){ $app.innerHTML = "<p class='warn'>No practice content loaded.</p>"; return; }

const SET = P.setSize || 10, PASS = P.passAt || 8, LV = P.levels;

/* ---------- storage ---------- */
const KEY = "study-"+P.id;
let storageOK = true;
function blank(){ return {levels:{},days:{},total:0,correct:0,mistakes:{},last:null}; }
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
function todayKey(){ const d = new Date(); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function unlocked(i){ return i===0 || lv(i-1).passed; }
function recommended(){ for(let i=0;i<LV.length;i++){ if(unlocked(i) && !lv(i).passed) return i; } return LV.length-1; }
function streak(){
  let n = 0; const d = new Date(); d.setHours(0,0,0,0);
  const k = x => x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0")+"-"+String(x.getDate()).padStart(2,"0");
  if(!S.days[k(d)]) d.setDate(d.getDate()-1);
  while(S.days[k(d)]){ n++; d.setDate(d.getDate()-1); }
  return n;
}

/* ---------- helpers ---------- */
function esc(s){ return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }
function parseAnswer(raw){
  let s = String(raw).trim().toLowerCase().replace(/−/g,"-").replace(/\s+/g,"");
  s = s.replace(/^[a-z]=/,"");
  if(s==="") return {empty:true};
  let v;
  const fr = s.match(/^(-?\d+)\/(-?\d+)$/);
  if(fr){ if(+fr[2]===0) return {bad:true}; v = fr[1]/fr[2]; }
  else { if(!/^-?\d*\.?\d+$/.test(s)) return {bad:true}; v = parseFloat(s); }
  return {v};
}
function fmtNum(n){ const s = (Math.round(n*1000)/1000).toString(); return s.replace("-","−"); }

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
  const a = parseAnswer(raw);
  if(a.empty){ sess.err = "Type your answer first."; render(false,true); return; }
  if(a.bad){ sess.err = "Enter a number, like −4 or 3/2."; render(false,true); return; }
  sess.err = "";
  const ok = Math.abs(a.v - p.a) < 1e-9;
  it.given = a.v; it.ok = ok;
  const L = lv(it.li); L.attempts++; S.total++;
  if(ok){ L.correct++; S.correct++; sess.score++; }
  else {
    sess.missed.push(it);
    const hint = (p.hints||[]).find(h=>Math.abs(h.v - a.v) < 1e-9);
    if(hint){ it.hint = hint; S.mistakes[hint.key] = (S.mistakes[hint.key]||0)+1; }
  }
  save(); render();
}
function next(){
  sess.i++;
  if(sess.i >= sess.items.length) finish(); else render(true);
}
function finish(){
  const passed = sess.score >= PASS;
  if(!sess.mixed){
    const L = lv(sess.level); L.sets++; L.best = Math.max(L.best, sess.score);
    if(passed && !L.passed){ L.passed = true; sess.unlockedNext = sess.level+1 < LV.length; }
  }
  S.days[todayKey()] = (S.days[todayKey()]||0)+1;
  S.last = {score:sess.score,total:sess.items.length,title:sess.title};
  save(); view = {name:"results"}; render(true);
}

/* ---------- views ---------- */
function viewHome(){
  const rec = recommended(), st = streak(), today = S.days[todayKey()]||0;
  let h = '<section class="panel"><div class="row"><div><h1>'+esc(P.title)+'</h1><p class="sub">'+esc(P.intro)+'</p></div>'+(st>0?'<span class="badge">'+st+'-day streak</span>':"")+'</div>';
  h += '<div class="step next" style="display:grid"><span class="mark">'+(today?"✓":"1")+'</span><div><strong>'+(today?"Today's set is done. Another one?":"Today's set")+'</strong><span class="d">Level '+(rec+1)+': '+esc(LV[rec].name)+' · '+SET+' problems · get '+PASS+' right to pass</span></div><button class="btn small primary" data-act="start" data-l="'+rec+'">Start</button></div>';
  h += '<div class="btns"><button class="btn" data-act="go" data-to="learn">Learn how</button>'+(unlockedCount()>1?'<button class="btn" data-act="mixed">Mixed review</button>':"")+'</div></section>';
  if(!storageOK) h += '<p class="warn">This browser is blocking saved data, so progress won\'t be remembered after you close the tab.</p>';
  h += '<section class="panel"><h3>Levels</h3><ol class="steps">';
  LV.forEach((l,i)=>{
    const L = lv(i), open = unlocked(i), cls = L.passed?"done":(open?(i===rec?"next":""):"locked");
    h += '<li class="step '+cls+'"><span class="mark">'+(L.passed?"✓":(i+1))+'</span><div><strong>'+esc(l.name)+'</strong><span class="d">'+esc(l.desc)+(L.sets?' · best '+L.best+' of '+SET:'')+'</span></div>'+
      (open?'<button class="btn small'+(i===rec?" primary":"")+'" data-act="start" data-l="'+i+'">'+(L.passed?"Practice":"Start")+'</button>':'<span class="sub">Pass level '+i+' first</span>')+'</li>';
  });
  h += '</ol></section>';
  return h;
}
function unlockedCount(){ let n=0; LV.forEach((l,i)=>{ if(unlocked(i)) n++; }); return n; }

function viewLearn(){
  return '<div class="row"><button class="btn quiet" data-act="go" data-to="home">← Back</button><span class="sub">Learn how</span></div>'+
    P.lesson.map(s=>'<section class="panel"><h2>'+s.h+'</h2>'+s.body+'</section>').join("")+
    '<div class="btns"><button class="btn primary" data-act="start" data-l="'+recommended()+'">Practice now</button></div>';
}

function viewRun(){
  const it = sess.items[sess.i], p = it.p, n = sess.items.length;
  let h = '<div class="row"><button class="btn quiet" data-act="quit">← Quit</button><span class="sub">'+esc(sess.title)+' · problem '+(sess.i+1)+' of '+n+' · score '+sess.score+'</span></div>';
  h += '<div class="bar"><i style="width:'+Math.round(sess.i/n*100)+'%"></i></div>';
  h += '<section class="panel"><p class="sub">'+esc(p.prompt||P.prompt||"Solve.")+'</p><div class="eq">'+p.q+'</div>';
  if(!it.ok && it.given===undefined){
    h += '<form class="ansrow" data-act="check"><label class="sub" for="ans">'+esc(p.label||P.label||"Answer")+'</label><input id="ans" class="ans" autocomplete="off" inputmode="text" placeholder="'+esc(p.placeholder||P.placeholder||"?")+'" aria-describedby="err"><button class="btn primary" type="submit">Check</button></form>';
    h += '<p id="err" class="err">'+esc(sess.err)+'</p>';
  } else {
    h += '<div class="fb '+(it.ok?"good":"bad")+'"><b class="'+(it.ok?"good":"bad")+'">'+(it.ok?"Correct.":"Not quite.")+'</b> '+
      (it.ok?"":"You answered "+fmtNum(it.given)+". The answer is "+fmtNum(p.a)+".")+
      (it.hint?'<p class="hintmsg">'+it.hint.msg+'</p>':"")+'</div>';
    h += '<div class="sol"><p class="sub">Worked solution</p><ol>'+p.steps.map(s=>'<li>'+s+'</li>').join("")+'</ol>'+(p.check?'<p class="chk">'+p.check+'</p>':"")+'</div>';
    h += '<div class="btns"><button class="btn primary" id="nextq" data-act="next">'+(sess.i+1<n?"Next problem":"See results")+'</button></div>';
  }
  return h+'</section>';
}

function viewResults(){
  const n = sess.items.length, passed = sess.score>=PASS;
  let h = '<section class="panel"><p class="sub">'+esc(sess.title)+'</p><h1>'+sess.score+' of '+n+'</h1>';
  if(sess.mixed) h += '<p>'+(passed?"Strong review.":"Good practice. The misses below show what to look at.")+'</p>';
  else if(sess.unlockedNext) h += '<p><strong>Level passed.</strong> Level '+(sess.level+2)+' is unlocked: '+esc(LV[sess.level+1].name)+'.</p>';
  else if(passed) h += '<p>'+(lv(sess.level).passed?"Passed again. Keep it sharp.":"Level passed.")+'</p>';
  else h += '<p>You need '+PASS+' of '+n+' to pass this level. Look over the misses, then try another set.</p>';
  if(sess.missed.length){
    h += '<h3>Worth another look</h3><ol class="miss">'+sess.missed.map(it=>'<li><span class="eqsmall">'+it.p.q+'</span><br><span>Answer: '+fmtNum(it.p.a)+' · you put '+fmtNum(it.given)+(it.hint?' · '+it.hint.short:'')+'</span></li>').join("")+'</ol>';
  }
  h += '<div class="btns"><button class="btn primary" data-act="start" data-l="'+(sess.unlockedNext?sess.level+1:sess.level)+'">'+(sess.unlockedNext?"Start level "+(sess.level+2):"Another set")+'</button><button class="btn" data-act="go" data-to="home">Back</button></div></section>';
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
