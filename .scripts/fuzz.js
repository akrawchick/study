global.window={}; require(process.cwd()+"/engine/draw.js");
const files=["money","big-numbers","time"]; let bad=0;
const parseTime=s=>{const m=String(s).split(":");return +m[0]*60+ +m[1];};
const isTime=s=>/^\d{1,2}:\d{2}$/.test(s);
for(const f of files){
  window.PRACTICE=null; require(process.cwd()+"/julien/math/"+f+"/content.js"); const P=window.PRACTICE;
  P.levels.forEach((L,li)=>{
    for(let i=0;i<2000;i++){
      let p; try{ p=L.gen(); }catch(e){ bad++; console.log(f,li,"threw",e.message); break; }
      const t=p.type||"number";
      if(t==="time"){
        if(!isTime(p.a)){bad++;console.log(f,li,"bad time",p.a);}
        const av=parseTime(p.a);
        (p.hints||[]).forEach(h=>{ if(!isTime(h.v)||parseTime(h.v)===av){bad++;console.log(f,li,"hint",h.v,p.a,h.key);} });
      } else {
        if(!Number.isInteger(p.a)||p.a<0){bad++;console.log(f,li,"non-int",p.a,(p.review||p.q).slice(0,60));}
        (p.hints||[]).forEach(h=>{ if(h.v===p.a||isNaN(h.v)||h.v<0){bad++;console.log(f,li,"hint",h.v,p.a,h.key);} });
      }
      if(!p.steps||!p.steps.length){bad++;console.log(f,li,"no steps");}
      if(i===0) console.log(f,li,"|",(p.review||p.q).replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim().slice(0,90),"->",p.a);
    }
  });
}
console.log("bad:",bad);
