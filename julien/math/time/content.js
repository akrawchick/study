/* Julien · Math · Time: reading clocks and time jumps */
(function(){
"use strict";
const D = window.DRAW;
const ri = (a,b)=>a+Math.floor(Math.random()*(b-a+1));
const pick = a=>a[Math.floor(Math.random()*a.length)];
const M = s => '<span class="m">'+s+'</span>';
const story = s => '<div class="story">'+s+'</div>';
const fmt = (h,m)=>((h+11)%12+1)+":"+String(m).padStart(2,"0");
const norm = h => (h+11)%12+1;
const add = (h,m,mins)=>{ let t = h*60+m+mins; return [norm(Math.floor(t/60)), t%60]; };
const hourWord = (h,m)=> m===0 ? "The short hand points right at the "+h+"." : "The short hand is between the "+h+" and the "+norm(h+1)+", so the hour is still "+h+".";
const minuteWord = m => m===0 ? "The long hand points to the 12. That means 0 minutes, o'clock." : m===30 ? "The long hand points to the 6, halfway around. That's 30 minutes." : "The long hand points to the "+(m/5)+". Count by fives: "+Array.from({length:m/5},(_,i)=>(i+1)*5).join(", ")+". That's "+m+" minutes.";
function readHints(h,m){
  const hs = [];
  if(m>=30) hs.push({v:fmt(norm(h+1),m),key:"hour",short:"hour too far ahead",msg:"The short hand hasn't reached the "+norm(h+1)+" yet, so it's still "+h+"-something."});
  if(m>0 && m%5===0){ hs.push({v:fmt(h,m/5),key:"fives",short:"read the minutes as the number",msg:"The long hand on the "+(m/5)+" means "+m+" minutes, not "+(m/5)+". Count by fives."}); }
  hs.push({v:fmt(m===0?12:m/5, (h%12)*5),key:"swap",short:"hands mixed up",msg:"The SHORT hand is the hour. The LONG blue hand is the minutes."});
  const want = fmt(h,m);
  return hs.filter(x=>x.v!==want && /^\d{1,2}:\d{2}$/.test(x.v) && +x.v.split(":")[1]<60);
}
function readProblem(h,m){
  return {q:D.clock(h,m), review:"the clock showing "+fmt(h,m), a:fmt(h,m), type:"time", label:"", placeholder:"3:30", prompt:"What time is it?",
    steps:[minuteWord(m), hourWord(h,m), "So it's "+M(fmt(h,m))], hints:readHints(h,m)};
}
/* L1 */ function genOclock(){ return readProblem(ri(1,12), pick([0,30])); }
/* L2 */ function genFives(){ return readProblem(ri(1,12), pick([5,10,15,20,25,35,40,45,50,55,15,45])); }

function jumpSteps(h,m,addMins){
  const steps = []; let ch = h, cm = m, left = addMins;
  const hrs = Math.floor(left/60), mins = left%60;
  if(hrs){ [ch,cm] = add(ch,cm,hrs*60); steps.push("Add the hour"+(hrs>1?"s":"")+" first: "+fmt(h,m)+" + "+hrs+" hour"+(hrs>1?"s":"")+" = "+M(fmt(ch,cm))); left = mins; }
  if(left){
    if(cm+left>60){ const toHour = 60-cm; const [nh,nm] = add(ch,cm,toHour); steps.push("Jump to the next hour first: "+fmt(ch,cm)+" → "+fmt(nh,nm)+" is "+toHour+" minutes."); const rest = left-toHour; const [fh,fm] = add(nh,nm,rest); steps.push(left+" − "+toHour+" = "+rest+" minutes more: "+fmt(nh,nm)+" + "+rest+" = "+M(fmt(fh,fm))); ch=fh; cm=fm; }
    else { const [fh,fm] = add(ch,cm,left); steps.push("Add the minutes: "+fmt(ch,cm)+" + "+left+" minutes = "+M(fmt(fh,fm))); ch=fh; cm=fm; }
  }
  return steps;
}
function durText(mins){ const h = Math.floor(mins/60), m = mins%60; return (h?h+" hour"+(h>1?"s":""):"")+(h&&m?" and ":"")+(m?m+" minutes":""); }
const EVENTS = [["Our hike started at","We hiked for","What time did we finish?"],["Lunch started at","Lunch lasted","What time did lunch end?"],["The canoe trip began at","It lasted","What time did it end?"],["Story time started at","It went on for","When did story time end?"],["We left camp at","We walked for","What time did we arrive?"],["The campfire was lit at","It burned for","What time did it go out?"]];
function timeStory(h,m,mins){
  const e = pick(EVENTS), [eh,em] = add(h,m,mins), ans = fmt(eh,em);
  const hints = [];
  const hrs = Math.floor(mins/60), rest = mins%60;
  if(rest && m+rest>60) hints.push({v:fmt(norm(h+hrs+1),rest),key:"both",short:"moved the hour and kept the minutes",msg:"You moved the hour ahead AND wrote the "+rest+". Jump to the next hour first, then add only what's left."});
  if(rest && m+rest>60) hints.push({v:fmt(norm(h+hrs),(m+rest)%60),key:"hour",short:"forgot the hour changed",msg:"You went past :59, so the hour ticks up too!"});
  if(rest) hints.push({v:fmt(eh,m),key:"minutes",short:"forgot the minutes",msg:"Don't forget the "+rest+" minutes at the end."});
  hints.push({v:fmt(h,m),key:"copy",short:"copied the start time",msg:"That's when it started. Time moved on!"});
  return {q:story(e[0]+" <b>"+fmt(h,m)+"</b>. "+e[1]+" <b>"+durText(mins)+"</b>. "+e[2]), review:fmt(h,m)+" + "+durText(mins), a:ans, type:"time", label:"", placeholder:"3:30", wide:true, prompt:"Jump forward in time.",
    steps:jumpSteps(h,m,mins), hints:hints.filter(x=>x.v!==ans)};
}
/* L3: hours and halves */
function genHours(){ const h = ri(1,11), m = pick([0,0,30,15,45]); const d = pick([60,60,120,30,90,30]); return timeStory(h,m,d); }
/* L4: minutes past the hour */
function genCross(){ const h = ri(1,11), m = pick([20,25,30,35,40,45,50]); let d; do { d = pick([15,20,25,30,35,40,45,50]); } while(m+d<=60); return timeStory(h,m,d); }
/* L5: camp stories, mixed, including "how many minutes until" */
function genStories(){
  if(Math.random()<0.35){
    const h = ri(1,11), m = pick([0,5,10,15,20,25,30]), d = pick([10,15,20,25,30,35,40,45]); const [eh,em] = add(h,m,d);
    const q = story("It's <b>"+fmt(h,m)+"</b>. Swim time starts at <b>"+fmt(eh,em)+"</b>. How many minutes until swim time?");
    return {q, review:fmt(h,m)+" until "+fmt(eh,em), a:d, type:"number", label:"", suffix:"minutes", placeholder:"?", wide:true, prompt:"Count up from now.",
      steps:["Count up from "+fmt(h,m)+" by fives"+(em<m?" (jump to "+norm(h+1)+":00 first)":"")+": "+M(Array.from({length:d/5},(_,i)=>fmt.apply(null,add(h,m,(i+1)*5))).join(", ")), "That's "+(d/5)+" jumps of 5 = "+M(d+" minutes")],
      hints:[{v:d/5,key:"fives",short:"counted jumps, not minutes",msg:"You counted the jumps. Each jump is 5 minutes, so multiply by 5."},{v:em,key:"copy",short:"copied the minutes",msg:"That's the minute hand at swim time. We want how long from now until then."}].filter(x=>x.v!==d)};
  }
  const h = ri(1,10), m = pick([0,10,15,20,25,30,40,45]); const d = pick([75,90,105,135,45,60,135,150,35,40]);
  return timeStory(h,m,d);
}

const lesson = [
 {h:"Two hands, two jobs", body:'<div class="rules"><div class="rule"><b>Short hand = hour</b>It moves slowly. If it\'s between two numbers, the hour is the smaller one it already passed.</div><div class="rule"><b>Long hand = minutes</b>It points at a number, but you count by fives: 1 means 5, 2 means 10, 3 means 15…</div></div>'+D.clock(10,15)+'<p style="text-align:center">Long hand on the 3 → 15 minutes. Short hand just past 10 → <strong>10:15</strong></p>'},
 {h:"Count by fives around the clock", body:'<p class="m" style="text-align:center;font-size:20px">5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55</p><p>The 3 is 15 (quarter past). The 6 is 30 (half past). The 9 is 45 (quarter to).</p>'},
 {h:"Time jumps: hours first, then minutes", body:'<div class="ex"><span>4:15 + 1 hour and 30 minutes</span><span class="m">4:15 + 1 hour = 5:15</span><span class="m">5:15 + 30 minutes = 5:45</span></div>'},
 {h:"When the minutes go past the hour", body:'<p>Jump to the next o\'clock first, then add what\'s left.</p><div class="ex"><span>12:30 + 45 minutes</span><span class="m">12:30 → 1:00 is 30 minutes</span><span class="m">45 − 30 = 15 minutes more</span><span class="m">1:00 + 15 = 1:15</span></div><div class="trap"><b>Trap:</b> 12:30 + 45 is not 1:45 and not 12:75. Jump to 1:00 first!</div>'},
 {h:"Typing times here", body:'<p>Type the hour, a colon, then two digits: <strong>3:30</strong> or <strong>10:05</strong>. Typing <strong>330</strong> works too.</p>'}
];

window.PRACTICE = {
  id:"julien-math-time", student:"Julien", kid:true,
  title:"Clock Camp", intro:"Read clocks and jump forward in time. Pass a level to earn a sticker!",
  setSize:8, passAt:6, placeholder:"3:30", label:"",
  cheers:["Right on time!","Yes!","You got it!","Tick tock, rock!","Way to go!","Nice one!"],
  mistakeNames:{hour:"Hour off by one",fives:"Minutes not counted by fives",swap:"Hands mixed up",both:"Moved hour and kept minutes",minutes:"Forgot the minutes",copy:"Copied the start time"},
  levels:[
    {name:"O'clock and half past", desc:"Read the clock: 3:00, 4:30", gen:genOclock, sticker:"🕰️"},
    {name:"Count by fives", desc:"Read the clock to 5 minutes", gen:genFives, sticker:"🖐️"},
    {name:"Hour jumps", desc:"2:00 + 1 hour, 4:15 + 1 hour 30 minutes", gen:genHours, sticker:"⏰"},
    {name:"Past the hour", desc:"12:30 + 45 minutes", gen:genCross, sticker:"🚀"},
    {name:"Camp time stories", desc:"Longer jumps and “how many minutes until”", gen:genStories, sticker:"🌙"}
  ],
  lesson
};
})();
