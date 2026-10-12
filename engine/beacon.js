/* Progress beacon: records when a study activity happened, how long it took, and how it went.
   Each record is kept locally (study-log) and, when STUDY_CONFIG.endpoint is set, posted to the family sheet.
   Active time counts seconds between interactions; gaps over 2 minutes are not counted. */
window.BEACON = (function(){
  "use strict";
  const cfg = window.STUDY_CONFIG || {}, LOG = "study-log", GAP = 120000, MAX = 600;
  let act = {active:0, last:0};
  function now(){ return Date.now(); }
  function touch(){ const t = now(); if(act.last && t-act.last < GAP) act.active += t-act.last; act.last = t; }
  ["click","keydown","input","pointerdown","scroll","touchstart"].forEach(ev=>document.addEventListener(ev,touch,{passive:true,capture:true}));
  document.addEventListener("visibilitychange",()=>{ if(document.hidden) act.last = 0; else act.last = now(); });
  function begin(){ act = {active:0, last:now()}; }
  function seconds(){ touch(); return Math.round(act.active/1000); }
  function device(){ const u = navigator.userAgent; return /iPad|iPhone/.test(u) ? "iPad" : /Macintosh/.test(u) ? "Mac" : /Windows/.test(u) ? "Windows" : /CrOS/.test(u) ? "Chromebook" : "other"; }
  function send(rec){
    rec = Object.assign({ts:new Date().toISOString(), seconds:seconds(), device:device()}, rec);
    try{ const log = JSON.parse(localStorage.getItem(LOG)||"[]"); log.push(rec); while(log.length>MAX) log.shift(); localStorage.setItem(LOG, JSON.stringify(log)); }catch(e){}
    if(cfg.endpoint){
      try{
        const body = JSON.stringify(rec);
        let ok = false;
        if(navigator.sendBeacon) ok = navigator.sendBeacon(cfg.endpoint, new Blob([body],{type:"text/plain"}));
        if(!ok) fetch(cfg.endpoint,{method:"POST",mode:"no-cors",keepalive:true,headers:{"Content-Type":"text/plain"},body}).catch(()=>{});
      }catch(e){}
    }
    begin();
  }
  begin();
  return {begin, send, seconds};
})();
