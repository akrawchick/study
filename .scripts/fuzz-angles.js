global.window={}; require(process.cwd()+"/engine/draw.js"); require(process.cwd()+"/noah/math/angles-triangles-prisms/content.js");
const P=window.PRACTICE; let bad=0;
P.levels.forEach((L,li)=>{ for(let i=0;i<3000;i++){ let p; try{ p=L.gen(); }catch(e){ bad++; console.log(li,"threw",e.message); break; }
  if(p.type==="choice"){ const ok=p.choices.filter(c=>c.ok).length, texts=new Set(p.choices.map(c=>c.text)); if(ok!==1||p.choices.length!==4||texts.size!==4){bad++;console.log(li,"choices",ok,p.choices.length,texts.size,(p.review||"").slice(0,60));} }
  else { if(!Number.isInteger(p.a)||p.a<=0){bad++;console.log(li,"bad a",p.a,(p.review||"").slice(0,70));} (p.hints||[]).forEach(h=>{ if(h.v===p.a||!Number.isFinite(h.v)){bad++;console.log(li,"hint",h.v,p.a,h.key,(p.review||"").slice(0,50));} }); }
  if(!p.steps||!p.steps.length){bad++;console.log(li,"no steps");}
  if(i<2) console.log(li,"|",(p.review||p.q).replace(/<[^>]+>/g,"").replace(/\s+/g," ").trim().slice(0,80),"->",p.type==="choice"?p.choices.find(c=>c.ok).text.replace(/<[^>]+>/g,"").slice(0,40):p.a);
}});
console.log("bad:",bad);
