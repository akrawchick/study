/* Parent report: when the student studied, for how long, and how it went. Reads the family sheet (with ?k=KEY) or, on the student's own device, the local study-log. */
(function(){
"use strict";
const cfg = window.STUDY_CONFIG||{}, student = window.REPORT_STUDENT||"noah", NAME = window.REPORT_NAME||"Noah";
const $app = document.getElementById("app"), $asof = document.getElementById("asof");
const key = new URLSearchParams(location.search).get("k");
const esc = s => String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const DAY = 864e5;
const fmtDay = d => d.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});
const fmtTime = d => d.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"});
const mins = s => Math.round(s/60);
const pct = (a,b) => b ? Math.round(a/b*100) : null;
const startOfDay = d => { const x = new Date(d); x.setHours(0,0,0,0); return x; };

async function load(){
  if(cfg.endpoint && key){
    try{ const r = await fetch(cfg.endpoint+"?k="+encodeURIComponent(key)+"&student="+encodeURIComponent(NAME)); const t = await r.text(); if(t.trim()==="no") return {rows:[],src:"badkey"}; return {rows:JSON.parse(t).rows||[], src:"sheet"}; }
    catch(e){ return {rows:[],src:"error",err:String(e)}; }
  }
  let log = []; try{ log = JSON.parse(localStorage.getItem("study-log")||"[]"); }catch(e){}
  return {rows:log.filter(r=>String(r.student).toLowerCase()===student || String(r.student)===NAME), src:cfg.endpoint&&!key?"nokey":"local"};
}
function norm(rows){
  return rows.map(r=>({ts:new Date(r.ts), guide:r.guide, title:r.title||r.guide, kind:r.kind, label:r.label||"", level:r.level, score:r.score===""?null:+r.score, total:r.total===""?null:+r.total, seconds:+r.seconds||0, mistakes:String(r.mistakes||"").split(",").map(x=>x.trim()).filter(Boolean), device:r.device||""}))
    .filter(r=>!isNaN(r.ts)).sort((a,b)=>a.ts-b.ts);
}
function render(data){
  const rows = norm(data.rows), acts = rows.filter(r=>r.kind!=="open"), now = new Date(), today = startOfDay(now);
  const last = rows.length ? rows[rows.length-1] : null;
  $asof.textContent = last ? "Last activity "+fmtDay(last.ts)+" at "+fmtTime(last.ts) : "";
  let h = "";
  if(data.src==="badkey") return $app.innerHTML = '<section class="panel"><h1>Report key didn\'t match</h1><p class="sub">Check the link you bookmarked.</p></section>';
  if(data.src==="error") return $app.innerHTML = '<section class="panel"><h1>Couldn\'t reach the sheet</h1><p class="sub">'+esc(data.err)+'</p></section>';
  if(data.src==="nokey") h += '<p class="warn">Opened without a key, so this shows only what\'s saved on this device. Use the bookmarked report link to see everything.</p>';
  if(data.src==="local") h += '<p class="warn">Device-only view: this is what\'s saved in this browser. Once the Google Sheet is connected, the report shows activity from any device.</p>';
  if(!rows.length){ return $app.innerHTML = h+'<section class="panel"><h1>'+NAME+'\'s study report</h1><p class="sub">No activity recorded yet. It starts filling in the first time '+NAME+' finishes a set or quiz.</p></section>'; }

  /* this week (Mon–Sun) */
  const dow = (today.getDay()+6)%7, mon = new Date(today-dow*DAY);
  const days = Array.from({length:7},(_,i)=>new Date(mon.getTime()+i*DAY));
  const inWeek = rows.filter(r=>r.ts>=mon && r.ts<new Date(mon.getTime()+7*DAY));
  const perDay = days.map(d=>{ const rs = inWeek.filter(r=>startOfDay(r.ts).getTime()===d.getTime()); return {d, sec:rs.reduce((a,r)=>a+r.seconds,0), n:rs.filter(r=>r.kind!=="open").length}; });
  const weekSec = perDay.reduce((a,x)=>a+x.sec,0), daysActive = perDay.filter(x=>x.sec>0||x.n>0).length;
  const weekActs = inWeek.filter(r=>r.kind!=="open"), wScore = weekActs.reduce((a,r)=>a+(r.score||0),0), wTotal = weekActs.reduce((a,r)=>a+(r.total||0),0);
  h += '<section class="panel"><h1>'+NAME+'\'s study report</h1><p class="sub">This week, '+fmtDay(mon)+' to '+fmtDay(days[6])+'</p>';
  h += '<div class="stats"><div class="stat"><b>'+mins(weekSec)+' min</b><span>Study time this week</span></div><div class="stat"><b>'+daysActive+' of '+(dow+1)+'</b><span>Days studied so far</span></div><div class="stat"><b>'+weekActs.length+'</b><span>Sets and quizzes</span></div><div class="stat"><b>'+(wTotal?pct(wScore,wTotal)+'%':'–')+'</b><span>Accuracy this week'+(wTotal?' · '+wScore+' right, '+(wTotal-wScore)+' wrong':'')+'</span></div></div>';
  h += '<div class="cal" style="--cols:7">'+perDay.map(x=>{ const isToday = x.d.getTime()===today.getTime(), future = x.d>today; return '<div class="'+(x.sec>0||x.n>0?"done":"")+(isToday?" today":"")+'"><b>'+x.d.getDate()+'</b>'+(future?fmtDay(x.d).slice(0,3):(x.sec>0||x.n>0?mins(x.sec)+" min":"—"))+'</div>'; }).join("")+'</div></section>';

  /* when */
  const buckets = [["Morning (before noon)",5,12],["Afternoon (12–5)",12,17],["Evening (5–9)",17,21],["Late (after 9)",21,29]];
  const counts = buckets.map(b=>acts.filter(r=>{ let hr = r.ts.getHours(); if(hr<5) hr += 24; return hr>=b[1] && hr<b[2]; }).length);
  const maxC = Math.max(1,...counts);
  const durs = acts.map(r=>r.seconds).filter(s=>s>0).sort((a,b)=>a-b), median = durs.length ? durs[Math.floor(durs.length/2)] : 0;
  const allDays = new Set(rows.map(r=>startOfDay(r.ts).getTime()));
  const devices = {}; rows.forEach(r=>{ if(r.device) devices[r.device]=(devices[r.device]||0)+1; });
  h += '<section class="panel"><h3>When '+NAME+' studies</h3>'+buckets.map((b,i)=>'<div class="erarow"><span>'+b[0]+'</span><div class="bar"><i style="width:'+Math.round(counts[i]/maxC*100)+'%"></i></div><em>'+counts[i]+'</em></div>').join("");
  h += '<p class="sub">'+allDays.size+' study day'+(allDays.size===1?"":"s")+' total since '+fmtDay(rows[0].ts)+'. A typical set takes about '+Math.max(1,mins(median))+' minute'+(mins(median)===1?"":"s")+'.'+(Object.keys(devices).length?' Devices: '+Object.keys(devices).map(d=>d+" ("+devices[d]+")").join(", ")+'.':'')+'</p></section>';

  /* per guide */
  const guides = {}; acts.forEach(r=>{ (guides[r.guide] = guides[r.guide] || {title:r.title, rows:[]}).rows.push(r); });
  const gl = Object.keys(guides).map(g=>{ const o = guides[g], sc = o.rows.filter(r=>r.total), s = sc.reduce((a,r)=>a+r.score,0), t = sc.reduce((a,r)=>a+r.total,0); const mk = {}; o.rows.forEach(r=>r.mistakes.forEach(m=>{ const name = m.replace(/\s*×\d+$/,""), n = +(m.match(/×(\d+)$/)||[0,1])[1]; mk[name]=(mk[name]||0)+n; })); return {id:g, title:o.title, rows:o.rows, last:o.rows[o.rows.length-1].ts, sec:o.rows.reduce((a,r)=>a+r.seconds,0), s, t, acc:pct(s,t), recent:sc.slice(-5), mk}; }).sort((a,b)=>b.last-a.last);
  h += '<section class="panel"><h3>By guide</h3>'+gl.map(g=>{
    const top = Object.keys(g.mk).sort((a,b)=>g.mk[b]-g.mk[a]).slice(0,3);
    return '<div style="border-top:1px solid var(--line);padding:12px 0"><div class="row"><strong>'+esc(g.title)+'</strong><span class="sub">last '+fmtDay(g.last)+' · '+mins(g.sec)+' min total</span></div>'+
      (g.t?'<div class="erarow" style="margin-top:6px"><span>Accuracy</span><div class="bar"><i style="width:'+g.acc+'%;background:'+(g.acc>=80?"var(--good)":g.acc>=65?"var(--gold)":"var(--bad)")+'"></i></div><em>'+g.acc+'%</em></div>':"")+
      '<p class="sub" style="margin-top:6px">'+g.rows.filter(r=>r.total).length+' set'+(g.rows.filter(r=>r.total).length===1?"":"s")+(g.t?' · <strong style="color:var(--good)">'+g.s+' right</strong>, <strong style="color:var(--bad)">'+(g.t-g.s)+' wrong</strong>':"")+(g.recent.length?' · recent: '+g.recent.map(r=>r.score+"/"+r.total).join(", "):"")+'</p>'+
      (top.length?'<div class="chips" style="margin-top:8px">'+top.map(m=>'<span class="chip">'+esc(m)+' × '+g.mk[m]+'</span>').join("")+'</div>':"")+'</div>';
  }).join("")+'</section>';

  /* what to say */
  const say = [];
  const sinceLast = Math.floor((today - startOfDay(last.ts))/DAY);
  if(sinceLast>=3) say.push(NAME+" hasn't opened a guide in "+sinceLast+" days (last: "+fmtDay(last.ts)+"). Ask what's coming up.");
  if(daysActive>=4) say.push(daysActive+" study days this week. Say you noticed.");
  gl.forEach(g=>{
    const r3 = g.recent.slice(-3); if(r3.length>=2){ const a = pct(r3.reduce((x,r)=>x+r.score,0), r3.reduce((x,r)=>x+r.total,0)); if(a<70) say.push("Sit with him on "+g.title+": the last "+r3.length+" sets averaged "+a+"%."); }
    const sc = g.rows.filter(r=>r.total); if(sc.length>=6){ const a = pct(sc.slice(-3).reduce((x,r)=>x+r.score,0), sc.slice(-3).reduce((x,r)=>x+r.total,0)), b = pct(sc.slice(-6,-3).reduce((x,r)=>x+r.score,0), sc.slice(-6,-3).reduce((x,r)=>x+r.total,0)); if(a-b>=10) say.push("He's improving on "+g.title+": from "+b+"% to "+a+"% over the last six sets."); }
    const top = Object.keys(g.mk).sort((a,b)=>g.mk[b]-g.mk[a])[0]; if(top && g.mk[top]>=3) say.push("In "+g.title+", the pattern behind his misses is “"+top+"” ("+g.mk[top]+" times). Worth a five-minute talk.");
  });
  const quick = acts.filter(r=>r.total && r.seconds>0 && r.seconds<120 && r.score/r.total<0.6).length; if(quick>=2) say.push(quick+" sets were under two minutes with low scores. That usually means clicking through, not working through.");
  if(!say.length) say.push("Steady. Nothing jumps out this week.");
  h += '<section class="panel"><h3>What to say to him</h3><ol class="miss">'+say.map(s=>'<li>'+esc(s)+'</li>').join("")+'</ol></section>';

  /* recent */
  h += '<section class="panel"><h3>Recent activity</h3><div>'+rows.slice(-25).reverse().map(r=>'<div class="row" style="padding:6px 0;border-top:1px solid var(--line);font-size:15px"><span><span class="sub">'+fmtDay(r.ts)+' '+fmtTime(r.ts)+'</span> &nbsp; '+esc(r.title)+(r.kind==="open"?' <span class="sub">opened</span>':' · '+esc(r.label))+'</span><span class="sub">'+(r.total?r.score+'/'+r.total+' · ':'')+(r.seconds?mins(r.seconds)+' min':'')+'</span></div>').join("")+'</div></section>';
  $app.innerHTML = h;
}
load().then(render).catch(e=>{ $app.innerHTML = '<section class="panel"><h1>Something went wrong</h1><p class="sub">'+esc(e)+'</p></section>'; });
})();
