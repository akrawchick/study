global.window={}; require(process.cwd()+"/engine/draw.js"); require(process.cwd()+"/noah/math/two-step-inequalities/content.js");
const P=window.PRACTICE; let bad=0;
const key=s=>{const m=String(s).match(/^x(<=|>=|<|>)(-?\d+)$/); return m?m[1]+"|"+ +m[2]:null;};
P.levels.forEach((L,li)=>{ for(let i=0;i<3000;i++){ let p; try{ p=L.gen(); }catch(e){ bad++; console.log(li,"threw",e.stack.split("\n").slice(0,2).join(" ")); break; }
  if(p.type==="ineq"){ if(!key(p.a)){bad++;console.log(li,"bad a",p.a);} (p.hints||[]).forEach(h=>{ if(!key(h.v)||key(h.v)===key(p.a)){bad++;console.log(li,"hint",h.v,p.a,h.key);} }); }
  else if(p.type==="choice"){ const ok=p.choices.filter(c=>c.ok).length; const texts=new Set(p.choices.map(c=>c.text)); if(ok!==1||p.choices.length!==4||texts.size!==4){bad++;console.log(li,"choices",ok,p.choices.length,texts.size,p.review&&p.review.slice(0,60));} }
  else {bad++;console.log(li,"unknown type",p.type);}
  if(!p.steps||!p.steps.length){bad++;console.log(li,"no steps");}
  if(i<2) console.log(li,"|",(p.review||p.q).replace(/<[^>]+>/g,"").replace(/\s+/g," ").trim().slice(0,100),"->",p.type==="ineq"?p.a:p.choices.find(c=>c.ok).text.replace(/<[^>]+>/g,"").slice(0,40));
}});
console.log("bad:",bad);
