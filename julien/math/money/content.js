/* Julien · Math · Money (camp store) */
(function(){
"use strict";
const D = window.DRAW;
const ri = (a,b)=>a+Math.floor(Math.random()*(b-a+1));
const pick = a=>a[Math.floor(Math.random()*a.length)];
const shuffle = a=>{ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
const V = {q:25,d:10,n:5,p:1}, NAME = {q:"quarter",d:"dime",n:"nickel",p:"penny"}, PL = {q:"quarters",d:"dimes",n:"nickels",p:"pennies"};
const cents = c => c+"¢";
const dollars = c => "$"+(c/100).toFixed(2);
const money = c => c<100 ? cents(c) : dollars(c);
const M = s => '<span class="m">'+s+'</span>';
const ITEMS = [["pencil",35],["sticker",60],["eraser",45],["trail mix",85],["compass",125],["water bottle",75],["flashlight",110],["camp badge",95],["map",150],["marshmallows",65],["whistle",55],["bandana",120]];

function countChain(counts){
  /* counts: {q,d,n,p} → steps counting biggest first */
  const steps = []; let run = 0;
  ["q","d","n","p"].forEach(k=>{
    const n = counts[k]||0; if(!n) return;
    const seq = []; for(let i=0;i<n;i++){ run += V[k]; seq.push(run); }
    steps.push((n===1?"One "+NAME[k]:n+" "+PL[k])+" ("+V[k]+"¢ each): "+M(seq.join(", ")));
  });
  return {steps, total:run};
}
function coinList(counts){ const l=[]; ["q","d","n","p"].forEach(k=>{ for(let i=0;i<(counts[k]||0);i++) l.push(k); }); return l; }
function countHints(counts,total){
  const h = [];
  if(counts.n) h.push({v:total+5*counts.n,key:"nickel",short:"nickel counted as 10¢",msg:"A nickel is 5¢. It's bigger than a dime, but worth less!"});
  if(counts.d) h.push({v:total-5*counts.d,key:"dime",short:"dime counted as 5¢",msg:"A dime is the smallest coin, but it's worth 10¢."});
  if(counts.q) h.push({v:total-5*counts.q,key:"quarter",short:"quarter counted as 20¢",msg:"A quarter is 25¢. Count quarters: 25, 50, 75, 100."});
  const n = coinList(counts).length; h.push({v:n,key:"count",short:"counted the coins, not the cents",msg:"That's how many coins there are. We want how many cents they add up to."});
  return h.filter(x=>x.v!==total && x.v>0);
}

/* Level 1: count coins under a dollar */
function genCount(){
  let counts, total;
  do { counts = {q:ri(0,2),d:ri(0,3),n:ri(0,2),p:ri(0,4)}; total = 25*counts.q+10*counts.d+5*counts.n+counts.p; }
  while(total<10 || total>=100 || coinList(counts).length<2 || coinList(counts).length>7);
  const c = countChain(counts);
  return {q:D.coins(shuffle(coinList(counts))), review:coinList(counts).map(k=>NAME[k]).join(", "), a:total, type:"money", unit:"cents", label:"", suffix:"¢", placeholder:"?",
    prompt:"How much money is this? Count the biggest coins first.",
    steps:c.steps.concat(["All together: "+M(cents(total))]), hints:countHints(counts,total)};
}

/* Level 2: write it the dollar way (and back) */
function genNotation(){
  if(Math.random()<0.7){
    const c = pick([ri(5,99), ri(5,99), ri(101,199), ri(5,9)]);
    const d = Math.floor(c/100), r = c%100;
    const steps = d===0
      ? [c+"¢ is less than 100¢, so it's 0 dollars and "+c+" cents.", "Write the dollar sign, a 0, a dot, then the cents with two spots: "+M(dollars(c))+(c<10?" (5 cents is 05, so the 5 sits in the second spot)":"")]
      : ["100¢ makes 1 dollar. "+c+"¢ is 1 dollar and "+r+" cents left over.", "Dollars, a dot, then the cents with two spots: "+M(dollars(c))];
    const hints = [
      {v:c*100,key:"dollars",short:"wrote cents as dollars",msg:"$"+c+".00 would be "+c+" whole dollars! "+c+"¢ is "+(d?"just over":"less than")+" a dollar."},
      {v:c*10,key:"shift",short:"cents in the wrong spot",msg:dollars(c*10)+" is "+Math.floor(c*10/100)+" dollars and "+(c*10)%100+" cents. Cents need exactly two spots after the dot: "+dollars(c)+"."}
    ];
    return {q:cents(c), a:c, type:"money", unit:"dollars", label:"$", placeholder:"0.00", prompt:"Write this amount the dollar way.", steps, hints:hints.filter(h=>h.v!==c)};
  }
  const c = pick([ri(5,99), ri(101,250)]);
  return {q:dollars(c), a:c, type:"money", unit:"cents", label:"", suffix:"¢", placeholder:"?", prompt:"How many cents is this?",
    steps:[c>=100 ? "Each dollar is 100¢. "+Math.floor(c/100)+" dollar"+(c>=200?"s":"")+" = "+Math.floor(c/100)*100+"¢, plus the "+(c%100)+" cents." : "The number after the dot is the cents.", "That's "+M(cents(c))],
    hints:[{v:Math.floor(c/100)*100+ (c%100)*10,key:"shift",short:"cents in the wrong spot",msg:"Look right after the dot: those two digits are the cents."}].filter(h=>h.v!==c)};
}

/* Level 3: coins over a dollar */
function genOver(){
  let counts, total;
  do { counts = {q:ri(3,6),d:ri(0,3),n:ri(0,2),p:ri(0,3)}; total = 25*counts.q+10*counts.d+5*counts.n+counts.p; }
  while(total<100 || total>250 || coinList(counts).length>10);
  const c = countChain(counts);
  const hints = countHints(counts,total).concat([{v:total*100,key:"dollars",short:"cents written as dollars",msg:"You counted right: "+total+"¢! Now write it the dollar way. 100¢ is $1.00, so "+total+"¢ is "+dollars(total)+"."}]);
  return {q:D.coins(shuffle(coinList(counts))), review:coinList(counts).map(k=>NAME[k]).join(", "), a:total, type:"money", unit:"dollars", label:"$", placeholder:"1.45",
    prompt:"How much money? Write it the dollar way.",
    steps:c.steps.concat(["That's "+total+"¢. 100¢ is one dollar, so "+total+"¢ = "+M(dollars(total))]), hints};
}

/* Level 4: making change by counting up */
function changeSteps(price,have){
  const steps = []; let at = price, sum = 0, parts = [];
  if(at%10){ const j = 10-at%10; steps.push("Start at "+money(at)+". Jump to the next ten: "+at+" → "+(at+j)+" is "+j+"¢."); parts.push(j); at += j; sum += j; }
  const nextDollar = Math.ceil(at/100)*100;
  if(at<nextDollar && nextDollar<=have){ const j = nextDollar-at; steps.push("Jump to the next dollar: "+at+" → "+nextDollar+" is "+j+"¢."); parts.push(j); at = nextDollar; sum += j; }
  if(at<have){ const j = have-at; steps.push("Then to "+money(have)+": "+j+"¢ more"+(j>=100?" (that's "+dollars(j)+")":"")+"."); parts.push(j); sum += j; }
  steps.push("Add the jumps: "+parts.join(" + ")+" = "+M(money(sum)));
  return steps;
}
function genChange(){
  const have = pick([100,100,200,200,50,150]);
  let item, price; do { item = pick(ITEMS); price = item[1]; } while(price>=have || have-price<5);
  const chg = have-price;
  const q = '<div class="story">You have <b>'+money(have)+'</b>. A '+item[0]+' costs <b>'+money(price)+'</b>. How much change do you get back?</div>';
  const hints = [
    {v:price,key:"price",short:"wrote the price",msg:"That's the price of the "+item[0]+". We want how much is left after you pay."},
    {v:have,key:"have",short:"wrote what you started with",msg:"That's what you started with. Some of it went to the "+item[0]+"!"},
    {v:have+price,key:"added",short:"added instead",msg:"Paying takes money away. Count up from the price to what you had."},
    {v:chg-10,key:"borrow",short:"ten short",msg:"Ten cents short. Count up in jumps: to the next ten, then to the dollar."},
    {v:chg+10,key:"borrow",short:"ten too many",msg:"Ten cents too many. Count up in jumps: to the next ten, then to the dollar."},
    {v:chg-100,key:"dollar",short:"forgot a dollar",msg:"Don't forget the whole dollar you still have after reaching "+dollars(Math.ceil(price/100)*100)+"."}
  ].filter(h=>h.v!==chg && h.v>0);
  return {q, review:"Change from "+money(have)+" for a "+money(price)+" "+item[0], a:chg, type:"money", label:"$", placeholder:"0.40", prompt:"Count up from the price.", wide:true, steps:changeSteps(price,have), hints};
}

/* Level 5: camp store stories */
function genStory(){
  const t = pick(["list","enough","howmany","pay","list"]);
  if(t==="list"){
    let counts, total; do { counts = {q:ri(1,3),d:ri(0,3),n:ri(0,1),p:ri(0,4)}; total = 25*counts.q+10*counts.d+5*counts.n+counts.p; } while(total<40||total>199);
    const parts = ["q","d","n","p"].filter(k=>counts[k]).map(k=>counts[k]+" "+(counts[k]===1?NAME[k]:PL[k]));
    const list = parts.length>1 ? parts.slice(0,-1).join(", ")+" and "+parts[parts.length-1] : parts[0];
    const c = countChain(counts);
    return {q:'<div class="story">In your pocket you have <b>'+list+'</b>. How much money do you have?</div>', review:list, a:total, type:"money", label:"$", placeholder:total<100?"0.00":"1.00", prompt:"Count the biggest coins first.", wide:true,
      steps:c.steps.concat(["All together: "+M(money(total))+(total>=100?" ("+total+"¢)":"")]), hints:countHints(counts,total)};
  }
  if(t==="enough"){
    const have = pick([100,200,200,150]); let item, price; do { item = pick(ITEMS); price = item[1]; } while(price>=have);
    const chg = have-price;
    return {q:'<div class="story">You have <b>'+money(have)+'</b>. You want a '+item[0]+' for <b>'+money(price)+'</b>. You have enough! How much will you have left?</div>', review:money(have)+" minus "+money(price), a:chg, type:"money", label:"$", placeholder:"0.75", prompt:"Count up from the price.", wide:true,
      steps:changeSteps(price,have), hints:[{v:price,key:"price",short:"wrote the price",msg:"That's the price. We want what's left after paying."},{v:have,key:"have",short:"wrote what you had",msg:"You spent some of it on the "+item[0]+"."}].filter(h=>h.v!==chg)};
  }
  if(t==="howmany"){
    const c = pick([["quarters",100,4,25],["dimes",100,10,10],["nickels",25,5,5],["pennies",10,10,1],["nickels",50,10,5],["quarters",200,8,25]]);
    return {q:'<div class="story">How many <b>'+c[0]+'</b> make <b>'+money(c[1])+'</b>?</div>', review:c[0]+" in "+money(c[1]), a:c[2], type:"number", label:"", placeholder:"?", prompt:"Count up by "+c[3]+"s.", wide:true,
      steps:["Each "+c[0].slice(0,-1)+" is "+c[3]+"¢. Count by "+c[3]+"s until you reach "+c[1]+"¢: "+M(Array.from({length:c[2]},(_,i)=>(i+1)*c[3]).join(", ")), "That took "+M(c[2]+" "+c[0])],
      hints:[{v:c[1],key:"copy",short:"wrote the cents",msg:"100¢ is how much money, not how many coins. Count how many "+c[0]+" it takes."}].filter(h=>h.v!==c[2])};
  }
  const price = pick([35,45,55,65,40,60,85,70]); const pay = price<50?50:100; const coinsUsed = pay===50 ? "2 quarters" : "4 quarters";
  const chg = pay-price;
  return {q:'<div class="story">A snack costs <b>'+cents(price)+'</b>. You pay with <b>'+coinsUsed+'</b>. How much change do you get?</div>', review:cents(price)+" paid with "+coinsUsed, a:chg, type:"money", unit:"cents", label:"", suffix:"¢", placeholder:"?", prompt:"First: how much are the quarters worth?", wide:true,
    steps:[coinsUsed+" = "+M(cents(pay))].concat(changeSteps(price,pay)), hints:[{v:price,key:"price",short:"wrote the price",msg:"That's the price. How much comes back?"},{v:pay,key:"have",short:"wrote what you paid",msg:"That's what you handed over. Some of it pays for the snack."}].filter(h=>h.v!==chg)};
}

const lesson = [
 {h:"Meet the coins", body:'<div class="cointable">'+["q","d","n","p"].map(k=>'<div>'+D.coin(k)+'<b>'+V[k]+'¢</b>'+NAME[k]+'</div>').join("")+'</div><p class="sub">Tricky one: the dime is the smallest coin but it beats the nickel and the penny.</p>'},
 {h:"Counting coins: biggest first", body:'<div class="ex"><span>2 quarters, 1 dime, 1 nickel, 3 pennies</span><span class="m">Quarters: 25, 50</span><span class="m">Dime: 60</span><span class="m">Nickel: 65</span><span class="m">Pennies: 66, 67, 68</span><span><strong>68¢</strong></span></div>'},
 {h:"Two ways to write money", body:'<div class="rules"><div class="rule"><b>The cents way</b>Just the number and ¢.<br><span class="m">56¢</span></div><div class="rule"><b>The dollar way</b>Dollar sign, dollars, a dot, then two spots for cents.<br><span class="m">$0.56</span> &nbsp; <span class="m">$1.25</span> &nbsp; <span class="m">$0.05</span></div></div><div class="trap"><b>Watch out:</b> $5.60 is five dollars and sixty cents. That\'s a lot more than 56¢! Cents always get exactly two spots after the dot.</div>'},
 {h:"Making change: count up", body:'<p>You don\'t have to subtract. Start at the price and count up to what you paid.</p><div class="ex"><span>You have $2.00. Trail mix costs 85¢.</span><span class="m">85 → 90 is 5¢</span><span class="m">90 → 100 is 10¢</span><span class="m">$1.00 → $2.00 is $1.00</span><span>5 + 10 = 15¢, plus $1.00 = <strong>$1.15</strong></span></div>'},
 {h:"Typing answers here", body:'<p>For cents, type the number: <strong>68</strong>. For the dollar way, type it with a dot: <strong>1.15</strong>. The $ or ¢ is already there for you.</p>'}
];

window.PRACTICE = {
  id:"julien-math-money", student:"Julien", kid:true,
  title:"Camp Store Money", intro:"Count coins, write money the right way, and make change. Pass a level to earn a sticker!",
  setSize:8, passAt:6, placeholder:"?",
  cheers:["Cha-ching!","Yes!","You got it!","Money master!","Way to go!","Boom!"],
  mistakeNames:{nickel:"Nickel counted as 10¢",dime:"Dime counted as 5¢",quarter:"Quarter counted wrong",count:"Counted coins instead of cents",dollars:"Cents written as dollars",shift:"Cents in the wrong spot",price:"Wrote the price instead of the change",have:"Wrote the starting amount",added:"Added instead of finding change",borrow:"Off by ten when counting up",dollar:"Forgot a whole dollar",copy:"Copied a number from the problem"},
  levels:[
    {name:"Count the coins", desc:"A handful of coins, under a dollar", gen:genCount, sticker:"🪙"},
    {name:"Write it the dollar way", desc:"56¢ is $0.56", gen:genNotation, sticker:"🏷️"},
    {name:"More than a dollar", desc:"Lots of quarters, written as dollars", gen:genOver, sticker:"💵"},
    {name:"Making change", desc:"Count up from the price", gen:genChange, sticker:"🧾"},
    {name:"Camp store stories", desc:"Real shopping problems", gen:genStory, sticker:"🏕️"}
  ],
  lesson
};
})();
