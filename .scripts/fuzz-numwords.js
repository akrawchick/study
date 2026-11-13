global.window={}; require(process.cwd()+"/julien/ela/number-words/content.js");
const P=window.PRACTICE; let bad=0; const re=/^[a-z]+([ -][a-z]+)*$/;
const seenAns=new Set();
P.levels.forEach((L,li)=>{ for(let i=0;i<4000;i++){ let p; try{ p=L.gen(); }catch(e){ bad++; console.log(li,"threw",e.message); break; }
  if(!re.test(p.a)){bad++;console.log(li,"bad answer",p.a);} seenAns.add(p.a);
  const hv=new Set();
  (p.hints||[]).forEach(h=>{ if(h.v===p.a||!re.test(h.v)||hv.has(h.v)||!h.msg||!h.key||!P.mistakeNames[h.key]){bad++;console.log(li,"hint",JSON.stringify(h).slice(0,120),p.a);} hv.add(h.v); if(p.accept(h.v)){bad++;console.log(li,"hint also accepted",h.v);} });
  if(p.accept(p.a)!==null){bad++;console.log(li,"accept(a) not null",p.a);}
  if(/-/.test(p.a)){ const g=p.a.replace(/-/g," "); const n=p.accept(g); if(!n||n.key!=="dash"){bad++;console.log(li,"no-dash not accepted",g);} }
  if(/ hundred /.test(p.a)){ const g=p.a.replace(" hundred "," hundred and "); const n=p.accept(g); if(!n||n.key!=="and"){bad++;console.log(li,"and not accepted",g);} const g2=p.a.replace(" hundred","-hundred"); if(!p.accept(g2)){bad++;console.log(li,"hyphen-hundred not accepted",g2);} }
  if(p.accept("banana")||p.accept(p.a+"s")){bad++;console.log(li,"accepts junk");}
  if(!p.steps.length||!p.say||!p.say[0]){bad++;console.log(li,"no steps/say");}
  if(i<2) console.log(li,"|",p.review,"| hints",p.hints.length,"|",p.steps.length,"steps");
}});
console.log("distinct answers:",seenAns.size,"bad:",bad);
const w=window.PRACTICE.levels[6]; 
