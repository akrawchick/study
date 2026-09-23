/* Julien · Math · Bigger numbers: number-line jumps, carrying, borrowing, "how many more", which operation */
(function(){
"use strict";
const D = window.DRAW;
const ri = (a,b)=>a+Math.floor(Math.random()*(b-a+1));
const pick = a=>a[Math.floor(Math.random()*a.length)];
const M = s => '<span class="m">'+s+'</span>';
const eq = (a,op,b) => a+" "+op+" "+b+" = ?";
const tens = n => Math.floor(n/10)*10, ones = n => n%10;
const story = s => '<div class="story">'+s+'</div>';

function addSteps(a,b){
  const steps = []; let at = a;
  if(tens(b)){ at += tens(b); steps.push("Jump the tens first: "+a+" + "+tens(b)+" = "+M(at)); }
  if(ones(b)){
    const o = ones(b), toTen = 10-ones(at);
    if(ones(at) && o>=toTen && toTen<10){ steps.push("Now the ones: "+at+" + "+o+". Make a ten first: "+at+" + "+toTen+" = "+(at+toTen)+", then "+(o-toTen)+" more = "+M(at+o)); }
    else steps.push("Now the ones: "+at+" + "+o+" = "+M(at+o));
    at += o;
  }
  return steps;
}
function subSteps(a,b){
  const steps = []; let at = a;
  if(tens(b)){ at -= tens(b); steps.push("Jump back the tens first: "+a+" − "+tens(b)+" = "+M(at)); }
  if(ones(b)){
    const o = ones(b), down = ones(at);
    if(down && o>down){ steps.push("Now the ones: "+at+" − "+o+". Jump to "+(at-down)+" first (that's "+down+"), then "+(o-down)+" more: "+M(at-o)); }
    else steps.push("Now the ones: "+at+" − "+o+" = "+M(at-o));
    at -= o;
  }
  return steps;
}
const tensHints = (r)=>[{v:r+10,key:"tens",short:"tens jump too big",msg:"Check the tens jump. Count the tens carefully: 23 is 2 tens, so jump 20."},{v:r-10,key:"tens",short:"tens jump too small",msg:"Check the tens jump. Count the tens carefully."}].filter(h=>h.v>0);

/* L1: no regrouping */
function genJumps(){
  if(Math.random()<0.5){
    let a,b; do { a = ri(11,60); b = ri(11,38); } while(ones(a)+ones(b)>9 || a+b>99);
    return {q:eq(a,"+",b), a:a+b, steps:addSteps(a,b), hints:tensHints(a+b)};
  }
  let a,b; do { a = ri(30,99); b = ri(11,50); } while(b>=a || ones(b)>ones(a));
  return {q:eq(a,"−",b), a:a-b, steps:subSteps(a,b), hints:tensHints(a-b).concat([{v:a+b,key:"added",short:"added instead",msg:"That's a minus sign. Jump backwards!"}])};
}
/* L2: adding with a carry */
function genCarry(){
  let a,b; do { a = ri(15,79); b = ri(15,49); } while(ones(a)+ones(b)<10 || a+b>99);
  const r = a+b, noCarry = tens(a)+tens(b)+ (ones(a)+ones(b)-10);
  return {q:eq(a,"+",b), a:r, steps:addSteps(a,b).concat(["Check: the ones made "+(ones(a)+ones(b))+". That's a whole extra ten, and it's in there."]),
    hints:[{v:noCarry,key:"carry",short:"lost the extra ten",msg:"The ones made "+(ones(a)+ones(b))+". That's "+(ones(a)+ones(b)-10)+" ones AND one more ten. Don't lose the ten!"}].concat(tensHints(r)).filter(h=>h.v!==r)};
}
/* L3: subtracting with a borrow */
function genBorrow(){
  let a,b; do { a = ri(30,99); b = ri(12,59); } while(b>=a || ones(b)<=ones(a));
  const r = a-b, flip = (tens(a)-tens(b)) + (ones(b)-ones(a));
  return {q:eq(a,"−",b), a:r, steps:subSteps(a,b),
    hints:[{v:flip,key:"flip",short:"flipped the ones around",msg:"In the ones, "+ones(a)+" − "+ones(b)+" doesn't work, and flipping it to "+ones(b)+" − "+ones(a)+" is a trap. Jump back on the number line instead: it takes care of it."},{v:a+b,key:"added",short:"added instead",msg:"Minus means jump backwards."}].concat(tensHints(r)).filter(h=>h.v!==r)};
}
/* L4: how many more / fewer */
const ACTS = [["Hiking","#94600F"],["Swimming","#2742B8"],["Arts &amp; Crafts","#B8452A"],["Nature","#0F7A63"],["Campfire","#7F77DD"],["Fishing","#D4537E"]];
function genMore(){
  const [A,B] = [pick(ACTS), pick(ACTS)].sort(()=>Math.random()-0.5); if(A===B) return genMore();
  let x = ri(4,12), y = ri(2,12); if(x===y) y = x-1;
  const big = Math.max(x,y), small = Math.min(x,y), r = big-small;
  const bigName = x>y?A[0]:B[0], smallName = x>y?B[0]:A[0];
  const fewer = Math.random()<0.4;
  const question = fewer ? "How many <b>fewer</b> campers like "+smallName+" than "+bigName+"?" : "How many <b>more</b> campers like "+bigName+" than "+smallName+"?";
  return {q:D.bars([{label:A[0],n:x,color:A[1]},{label:B[0],n:y,color:B[1]}])+story(question), review:bigName+" "+big+", "+smallName+" "+small+": how many more?", a:r, wide:true, prompt:"Read the graph.",
    steps:["“How many "+(fewer?"fewer":"more")+"” is asking for the gap between the two bars. That's a subtraction question.", "Bigger take away smaller: "+big+" − "+small+" = "+M(r), "Check by counting up: "+small+" → "+big+" is "+r+" steps."],
    hints:[{v:x+y,key:"added",short:"added the bars",msg:"“How many more” means find the difference, so subtract the small bar from the big one."},{v:big,key:"copy",short:"copied a bar",msg:"That's how many like "+bigName+". We want how much taller that bar is than the other one."},{v:small,key:"copy",short:"copied a bar",msg:"That's how many like "+smallName+". We want the gap between the two bars."}].filter(h=>h.v!==r)};
}
/* L5: which operation */
const NAMES = ["Cora","Ben","Maya","Leo","Zoe","Sam"];
function genWhich(){
  const t = pick(["mul","mul","div","div","add","sub","cmp"]), n = pick(NAMES);
  if(t==="mul"){
    const a = ri(2,5), b = ri(2,6), r = a*b, s = pick([
      [n+" hiked <b>"+a+" miles</b> every day for <b>"+b+" days</b>. How many miles in all?", "miles"],
      ["There are <b>"+b+" tents</b>. Each tent holds <b>"+a+" campers</b>. How many campers in all?", "campers"],
      [n+" found <b>"+a+" pinecones</b> on each of <b>"+b+" trails</b>. How many pinecones?", "pinecones"]]);
    return {q:story(s[0]), review:s[0].replace(/<[^>]+>/g,""), a:r, wide:true, prompt:"What's happening in the story?", suffix:s[1],
      steps:["The same number, "+a+", again and again ("+b+" times). That's a multiplying story.", "Count it up: "+M(Array.from({length:b},()=>a).join(" + ")+" = "+r), "Or: "+b+" × "+a+" = "+M(r)],
      hints:[{v:a+b,key:"added",short:"added once",msg:"Adding "+a+" + "+b+" only counts once. It happens "+b+" times: "+Array.from({length:b},()=>a).join(" + ")+"."},{v:a,key:"copy",short:"copied a number",msg:"That's just one group. There are "+b+" groups of "+a+"."}].filter(h=>h.v!==r)};
  }
  if(t==="div"){
    const g = ri(2,6), per = ri(2,6), tot = g*per, s = pick([
      ["There are <b>"+tot+" campers</b>. Each tent holds <b>"+per+" campers</b>. How many tents are needed?", "tents", "Put the campers into tents of "+per+": "+Array.from({length:g},(_,i)=>(i+1)*per).join(", ")+". That's "+g+" tents."],
      [n+" has <b>"+tot+" cookies</b> to share with <b>"+per+" friends</b> equally. How many cookies does each friend get?", "each", "Deal them out, one to each friend, around and around. Each friend ends up with "+g+"."],
      ["<b>"+tot+" stickers</b> go on <b>"+per+" pages</b>, the same number on each page. How many on each page?", "each", "Split "+tot+" into "+per+" equal groups: "+per+" × "+g+" = "+tot+", so "+g+" on each page."]]);
    return {q:story(s[0]), review:s[0].replace(/<[^>]+>/g,""), a:g, wide:true, prompt:"What's happening in the story?", suffix:s[1],
      steps:["A big group being split into equal groups. That's a dividing (sharing) story.", s[2], tot+" ÷ "+per+" = "+M(g)],
      hints:[{v:tot,key:"copy",short:"copied the total",msg:"That's how many there are in all. The question asks how they get split up."},{v:tot*per,key:"multiplied",short:"multiplied instead",msg:"We're splitting up, not building up. Think: how many groups of "+per+" fit in "+tot+"?"},{v:tot-per,key:"subtracted",short:"subtracted once",msg:"Taking away "+per+" once only fills one tent. Keep going: "+Array.from({length:g},(_,i)=>(i+1)*per).join(", ")+"."}].filter(h=>h.v!==g)};
  }
  if(t==="add"){
    const a = ri(12,48), b = ri(11,39), r = a+b, s = n+" saw <b>"+a+" birds</b> in the morning and <b>"+b+" birds</b> in the afternoon. How many birds in all?";
    return {q:story(s), review:s.replace(/<[^>]+>/g,""), a:r, wide:true, prompt:"What's happening in the story?", suffix:"birds", steps:["Two groups being put together. That's an adding story."].concat(addSteps(a,b)), hints:[{v:Math.abs(a-b),key:"subtracted",short:"subtracted instead",msg:"“In all” means put the groups together."}].filter(h=>h.v!==r)};
  }
  if(t==="sub"){
    const a = ri(20,60), b = ri(5,a-5), r = a-b, s = n+" had <b>"+a+" marshmallows</b>. "+n+" roasted <b>"+b+"</b>. How many are left?";
    return {q:story(s), review:s.replace(/<[^>]+>/g,""), a:r, wide:true, prompt:"What's happening in the story?", suffix:"left", steps:["Some are taken away. That's a subtracting story."].concat(subSteps(a,b)), hints:[{v:a+b,key:"added",short:"added instead",msg:"Roasted ones are gone. Take them away."}].filter(h=>h.v!==r)};
  }
  const a = ri(8,30), b = ri(3,a-2), r = a-b, s = n+" has <b>"+a+" stickers</b>. Ben has <b>"+b+"</b>. How many more does "+n+" have?";
  return {q:story(s), review:s.replace(/<[^>]+>/g,""), a:r, wide:true, prompt:"What's happening in the story?", suffix:"more", steps:["“How many more” asks for the gap. That's a subtracting story.", a+" − "+b+" = "+M(r)], hints:[{v:a+b,key:"added",short:"added instead",msg:"“How many more” means find the difference: subtract."},{v:a,key:"copy",short:"copied a number",msg:"That's how many "+n+" has. How many MORE than Ben?"}].filter(h=>h.v!==r)};
}
/* L6: three-digit */
function genThree(){
  if(Math.random()<0.5){
    let a,b; do { a = ri(125,675); b = ri(115,399); } while(a+b>999 || (ones(a)+ones(b)<10 && (Math.floor(a/10)%10+Math.floor(b/10)%10)<10));
    const r = a+b, h = Math.floor(b/100)*100, t = Math.floor(b/10)%10*10, o = ones(b);
    const steps = ["Jump the hundreds: "+a+" + "+h+" = "+M(a+h)]; let at = a+h;
    if(t){ steps.push("Jump the tens: "+at+" + "+t+" = "+M(at+t)); at += t; }
    if(o){ steps.push("Jump the ones: "+at+" + "+o+" = "+M(at+o)); }
    const noCarry = (Math.floor(a/100)+Math.floor(b/100))%10*100 + ((Math.floor(a/10)%10+Math.floor(b/10)%10)%10)*10 + (ones(a)+ones(b))%10;
    return {q:eq(a,"+",b), a:r, steps, hints:[{v:noCarry,key:"carry",short:"lost a carried ten or hundred",msg:"When a column adds up past 9, the extra ten (or hundred) has to move over. Jumping on the number line keeps it for you."},{v:r+100,key:"hundreds",short:"hundreds off",msg:"Check the hundreds jump."},{v:r-100,key:"hundreds",short:"hundreds off",msg:"Check the hundreds jump."}].filter(h=>h.v!==r)};
  }
  let a,b; do { a = ri(300,950); b = ri(115,499); } while(b>=a || (ones(b)<=ones(a) && Math.floor(b/10)%10<=Math.floor(a/10)%10));
  const r = a-b, h = Math.floor(b/100)*100, t = Math.floor(b/10)%10*10, o = ones(b);
  const steps = ["Jump back the hundreds: "+a+" − "+h+" = "+M(a-h)]; let at = a-h;
  if(t){ steps.push("Jump back the tens: "+at+" − "+t+" = "+M(at-t)); at -= t; }
  if(o){ steps.push("Jump back the ones: "+at+" − "+o+" = "+M(at-o)); }
  const flip = Math.abs(Math.floor(a/100)-Math.floor(b/100))*100 + Math.abs(Math.floor(a/10)%10-Math.floor(b/10)%10)*10 + Math.abs(ones(a)-ones(b));
  return {q:eq(a,"−",b), a:r, steps, hints:[{v:flip,key:"flip",short:"flipped digits around",msg:"When the top digit is smaller, you can't just flip it. Jump back on the number line: hundreds, tens, then ones."},{v:a+b,key:"added",short:"added instead",msg:"Minus means jump backwards."}].filter(h=>h.v!==r)};
}

const lesson = [
 {h:"The number line is your friend", body:'<p>Big adding and subtracting is just jumping. Jump the <strong>tens</strong> first, then the <strong>ones</strong>.</p><div class="ex"><span class="m">54 + 23</span><span>Jump 20: 54 → 74</span><span>Jump 3: 74 → 77</span><span><strong>77</strong></span></div><br><div class="ex"><span class="m">72 − 31</span><span>Jump back 30: 72 → 42</span><span>Jump back 1: 42 → 41</span><span><strong>41</strong></span></div>'},
 {h:"When the ones spill over", body:'<p>Sometimes the ones make more than 9. Make a ten first, then finish.</p><div class="ex"><span class="m">47 + 38</span><span>Jump 30: 47 → 77</span><span>77 + 8: jump 3 to land on 80, then 5 more</span><span><strong>85</strong></span></div><div class="trap"><b>Trap:</b> 7 + 8 = 15, not 5. That extra ten is real. Keep it!</div>'},
 {h:"When you can\'t take the ones away", body:'<div class="ex"><span class="m">72 − 35</span><span>Jump back 30: 72 → 42</span><span>42 − 5: jump back 2 to land on 40, then 3 more</span><span><strong>37</strong></span></div><div class="trap"><b>Trap:</b> 2 − 5 doesn\'t work, and flipping it to 5 − 2 gives the wrong answer (43). Jumping back on the number line never falls in this trap.</div>'},
 {h:"“How many more?” is a subtraction question", body:'<p>When a question asks how many <strong>more</strong> or how many <strong>fewer</strong>, it wants the gap between two numbers. Take the smaller from the bigger.</p><div class="ex"><span>10 campers like Hiking. 4 like Nature. How many more like Hiking?</span><span class="m">10 − 4 = 6</span></div>'},
 {h:"Which kind of story is it?", body:'<div class="rules"><div class="rule"><b>Putting together</b>“in all”, “altogether” → add</div><div class="rule"><b>Taking away</b>“left”, “gave away” → subtract</div><div class="rule"><b>Same number again and again</b>“each day”, “each tent” → multiply (or add it over and over)</div><div class="rule"><b>Splitting into equal groups</b>“each gets”, “how many tents” → divide (or count up by the group size)</div></div>'}
];

window.PRACTICE = {
  id:"julien-math-big-numbers", student:"Julien", kid:true,
  title:"Number Trail", intro:"Add and subtract bigger numbers by jumping on the number line, and figure out what a story problem is really asking.",
  setSize:8, passAt:6, placeholder:"?", label:"",
  cheers:["Yes!","Nailed it!","Big brain!","You got it!","Way to go!","Trail blazer!"],
  mistakeNames:{tens:"Tens jump off",carry:"Lost the carried ten",flip:"Flipped the digits",added:"Added when it wasn't adding",subtracted:"Subtracted when it wasn't",multiplied:"Multiplied when it was sharing",copy:"Copied a number from the problem",hundreds:"Hundreds jump off"},
  levels:[
    {name:"Number-line jumps", desc:"Tens first, then ones", gen:genJumps, sticker:"🦘"},
    {name:"Adding with a carry", desc:"47 + 38, when the ones spill over", gen:genCarry, sticker:"🎒"},
    {name:"Subtracting with a borrow", desc:"72 − 35, jump back past the ten", gen:genBorrow, sticker:"⛺"},
    {name:"How many more?", desc:"Read two bars, find the gap", gen:genMore, sticker:"📊"},
    {name:"Which kind of story?", desc:"Add, subtract, multiply or share", gen:genWhich, sticker:"🧭"},
    {name:"Three-digit trail", desc:"375 + 248 and 642 − 279", gen:genThree, sticker:"🏔️"}
  ],
  lesson
};
})();
