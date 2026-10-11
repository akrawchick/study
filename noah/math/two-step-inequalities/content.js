/* Noah · Math · Two-step inequalities (test Tue Oct 13, 2026) */
(function(){
"use strict";
const D = window.DRAW;
const ri = (a,b)=>a+Math.floor(Math.random()*(b-a+1));
const pick = a=>a[Math.floor(Math.random()*a.length)];
const nz = (a,b)=>{ let n=0; while(n===0) n=ri(a,b); return n; };
const shuffle = a=>{ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
const m = n => n<0 ? "−"+Math.abs(n) : String(n);
const par = n => n<0 ? "(−"+Math.abs(n)+")" : String(n);
const M = s => '<span class="m">'+s+'</span>';
const OPS = ["<",">","<=",">="];
const FLIP = {"<":">",">":"<","<=":">=",">=":"<="};
const STRICT = {"<":"<=","<=":"<",">":">=",">=":">"};
const SYM = {"<":"<",">":">","<=":"≤",">=":"≥"};
const sym = op => SYM[op];
const coef = a => a===1 ? "" : a===-1 ? "−" : m(a);
const lin = (a,b) => coef(a)+"x"+(b>=0 ? " + "+b : " − "+(-b));
const frac = (top,bot) => '<span class="frac"><span>'+top+'</span><span>'+bot+'</span></span>';
const ans = (op,n) => "x"+op+n;                       // canonical answer string
const show = (op,n) => "x "+sym(op)+" "+m(n);
const undoWord = b => b>0 ? "subtract "+b+" from both sides" : "add "+(-b)+" to both sides";
const flipNote = (a,opBefore) => a<0
  ? "You're dividing by a NEGATIVE ("+m(a)+"), so the symbol flips: "+sym(opBefore)+" becomes "+sym(FLIP[opBefore])+"."
  : m(a)+" is positive, so the symbol stays "+sym(opBefore)+".";
const wordsFor = op => ({"<":"less than",">":"greater than","<=":"less than or equal to",">=":"greater than or equal to"})[op];

function hintsFor(op,n,extra){
  const h = [
    {v:ans(FLIP[op],n),key:"flip",short:"symbol points the wrong way",msg:extra&&extra.neg ? "You divided by a negative, so the symbol has to flip. "+sym(extra.before)+" becomes "+sym(op)+"." : extra&&extra.right ? "Careful reading it backwards: "+m(n)+" "+sym(FLIP[op])+" x means x is "+wordsFor(op)+" "+m(n)+"." : "Only flip the symbol when you multiply or divide by a negative. Here you didn't, so it stays."},
    {v:ans(STRICT[op],n),key:"strict",short:"≤/≥ mixed up with </>",msg:"Keep the same kind of symbol. "+(op.length===2?"It has the line under it (or-equal-to), so the answer does too.":"No line under it, so the answer has no line either.")},
    {v:ans(op,-n),key:"sign",short:"sign slip",msg:"The number's sign is off. Check the division: same signs give positive, different signs give negative."},
    {v:ans(FLIP[op],-n),key:"sign",short:"sign and direction both off",msg:"Both the sign of the number and the direction are off. Redo the last step slowly."}
  ];
  if(extra && extra.undo!==undefined) h.push({v:ans(op,extra.undo),key:"undo",short:"added instead of subtracting (or vice versa)",msg:"To undo "+(extra.b>0?"+ "+extra.b+", subtract "+extra.b:"− "+(-extra.b)+", add "+(-extra.b))+". Do the opposite operation, to both sides."});
  if(extra && extra.step1!==undefined) h.push({v:ans(op,extra.step1),key:"divide",short:"stopped after step 1",msg:"Good first step. Now "+(extra.div?"divide":"multiply")+" both sides by "+m(extra.a)+(extra.a<0?" and flip the symbol":"")+"."});
  return h.filter(x=>x.v!==ans(op,n));
}

/* ---------- builders ---------- */
function mulForm(a,b,n,op){                 /* ax + b OP c  →  x op n */
  const c = a*n+b, opB = a<0 ? FLIP[op] : op;   // symbol as written
  const q = lin(a,b)+" "+sym(opB)+" "+m(c);
  const steps = ["Undo the "+(b>0?"+ "+b:"− "+(-b))+" first: "+undoWord(b)+". "+M(coef(a)+"x "+sym(opB)+" "+m(c-b)),
    "Divide both sides by "+m(a)+". "+flipNote(a,opB)+" "+M(show(op,n))];
  const check = "Check: try x = "+m(n+(op[0]===">"?1:-1))+". "+m(a)+par(n+(op[0]===">"?1:-1))+(b>0?" + "+b:" − "+(-b))+" = "+m(a*(n+(op[0]===">"?1:-1))+b)+", and that is "+wordsFor(opB.replace("=",""))+" "+m(c)+" ✓";
  return {q, a:ans(op,n), type:"ineq", steps, check, hints:hintsFor(op,n,{neg:a<0,before:opB,b,undo:(c+b)%a===0?(c+b)/a:undefined,step1:c-b,a,div:true})};
}
function divForm(a,b,k,op){                 /* x/a + b OP c  →  x op n, n = a*k */
  const n = a*k, c = k+b, opB = a<0 ? FLIP[op] : op;
  const q = frac("x",m(a))+" + "+(b>=0?b:"("+m(b)+")")+" "+sym(opB)+" "+m(c);
  const q2 = frac("x",m(a))+(b>=0?" + "+b:" − "+(-b))+" "+sym(opB)+" "+m(c);
  const steps = ["Undo the "+(b>0?"+ "+b:"− "+(-b))+" first: "+undoWord(b)+". "+M("x ÷ "+par(a)+" "+sym(opB)+" "+m(k)),
    "Multiply both sides by "+m(a)+". "+(a<0?"Multiplying by a NEGATIVE flips the symbol: "+sym(opB)+" becomes "+sym(op)+".":m(a)+" is positive, so the symbol stays.")+" "+M(show(op,n))];
  return {q:q2, a:ans(op,n), type:"ineq", steps, hints:hintsFor(op,n,{neg:a<0,before:opB,b,undo:(c+b)*a,step1:k,a,div:false})};
}
function rightForm(a,b,n,op){               /* c OP ax + b  →  x op n */
  const c = a*n+b;
  const opW = a<0 ? op : FLIP[op];         // symbol as written, with x on the right
  const opAfterDiv = a<0 ? FLIP[opW] : opW; // symbol after dividing (still "n ? x")
  const q = m(c)+" "+sym(opW)+" "+lin(a,b);
  const steps = ["x is on the right. That's fine, solve it where it is. Undo the "+(b>0?"+ "+b:"− "+(-b))+": "+undoWord(b)+". "+M(m(c-b)+" "+sym(opW)+" "+coef(a)+"x"),
    "Divide both sides by "+m(a)+". "+flipNote(a,opW)+" "+M(m(n)+" "+sym(opAfterDiv)+" x"),
    "Now read it with x first. "+m(n)+" "+sym(opAfterDiv)+" x means x is "+wordsFor(op)+" "+m(n)+": "+M(show(op,n))];
  return {q, a:ans(op,n), type:"ineq", steps, hints:hintsFor(op,n,{right:true,neg:a<0,before:opW,b,undo:(c+b)%a===0?(c+b)/a:undefined,step1:c-b,a,div:true})};
}

/* ---------- levels ---------- */
function genOne(){
  const op = pick(OPS), t = pick(["mul","mul","div","add"]);
  if(t==="add"){ const b = nz(-12,12), n = nz(-12,12), c = n+b; return {q:"x"+(b>0?" + "+b:" − "+(-b))+" "+sym(op)+" "+m(c), a:ans(op,n), type:"ineq", steps:[undoWord(b).replace(/^./,ch=>ch.toUpperCase())+". Adding or subtracting never flips the symbol. "+M(show(op,n))], hints:hintsFor(op,n,{b,undo:c+b})}; }
  if(t==="mul"){ const a = nz(-9,9), n = nz(-9,9), c = a*n, opB = a<0?FLIP[op]:op; return {q:coef(a)+"x "+sym(opB)+" "+m(c), a:ans(op,n), type:"ineq", steps:["Divide both sides by "+m(a)+". "+flipNote(a,opB)+" "+M(show(op,n))], hints:hintsFor(op,n,{neg:a<0,before:opB})}; }
  const a = nz(-9,9), k = nz(-9,9), n = a*k, opB = a<0?FLIP[op]:op;
  return {q:frac("x",m(a))+" "+sym(opB)+" "+m(k), a:ans(op,n), type:"ineq", steps:["Multiply both sides by "+m(a)+". "+(a<0?"Multiplying by a negative flips the symbol: "+sym(opB)+" becomes "+sym(op)+".":"Positive, so the symbol stays.")+" "+M(show(op,n))], hints:hintsFor(op,n,{neg:a<0,before:opB})};
}
function genTwoPos(){ return Math.random()<0.65 ? mulForm(ri(2,9), nz(-24,24), nz(-12,12), pick(OPS)) : divForm(ri(2,9), nz(-19,19), nz(-9,9), pick(OPS)); }
function genTwoNeg(){ return Math.random()<0.6 ? mulForm(-ri(1,9), nz(-24,24), nz(-12,12), pick(OPS)) : divForm(-ri(2,12), nz(-19,19), nz(-9,9), pick(OPS)); }
function genRight(){ return rightForm(pick([1,-1])*ri(2,15), nz(-20,20), nz(-10,10), pick(OPS)); }
function genGraph(){
  const p = Math.random()<0.5 ? mulForm(pick([1,-1])*ri(2,6), nz(-15,15), nz(-6,6), pick(OPS)) : divForm(pick([1,-1])*ri(2,4), nz(-10,10), nz(-3,3), pick(OPS));
  const [op,nStr] = [p.a.match(/^x(<=|>=|<|>)/)[1], p.a.replace(/^x(<=|>=|<|>)/,"")], n = +nStr;
  const desc = (o,v)=>(o.length===2?"closed":"open")+" circle at "+m(v)+", arrow pointing "+(o[0]===">"?"right":"left");
  const choices = shuffle([
    {text:D.numberLine(op,n), ok:true, review:desc(op,n)},
    {text:D.numberLine(FLIP[op],n), review:desc(FLIP[op],n), key:"flip", short:"arrow the wrong way", msg:"The answer is "+show(op,n)+", so shade the side with numbers "+wordsFor(op).replace(" or equal to","")+" "+m(n)+". Test a point: pick a number on your shaded side and plug it in."},
    {text:D.numberLine(STRICT[op],n), review:desc(STRICT[op],n), key:"circle", short:"open/closed circle", msg:(op.length===2?"≤ and ≥ include the number itself, so the circle is CLOSED (filled in).":"< and > don't include the number, so the circle is OPEN.")},
    {text:D.numberLine(op,-n||n+1), review:desc(op,-n||n+1), key:"sign", short:"wrong number", msg:"Right shape, wrong spot. The boundary is "+m(n)+". Check the sign in your last division."}
  ]);
  return {q:p.q, a:0, type:"choice", prompt:"Solve, then pick the graph.", choices, grid:true, review:p.q.replace(/<[^>]+>/g,""), steps:p.steps.concat(["Graph: "+(op.length===2?"closed":"open")+" circle at "+m(n)+" (the boundary), arrow toward the "+(op[0]===">"?"right, where numbers are bigger":"left, where numbers are smaller")+"."]), hints:[]};
}

/* ---------- word problems: pick the inequality ---------- */
const NAMES = ["Noah","Maya","Leo","Zoe","Sam","Ava","Eli","Mia"];
const KW = {
  "<=":[["at most","“At most” means that much or less: ≤."],["no more than","“No more than” means ≤ (it can equal, but not go over)."],["cannot spend more than","“Cannot be more than” means ≤."]],
  ">=":[["at least","“At least” means that much or more: ≥."],["a minimum of","“A minimum of” means ≥."],["needs at least","“At least” means that much or more: ≥."]],
  "<":[["less than","“Less than” means <, and it can't equal."],["below","“Below” means strictly less: <."],["under","“Under” means strictly less: <."]],
  ">":[["more than","“More than” means >, and it can't equal."],["above","“Above” means strictly greater: >."],["over","“Over” means strictly greater: >."]]
};
function ineqText(f){ /* f: {form, a, b, c, op} */
  const rhs = " "+sym(f.op)+" "+m(f.c);
  if(f.form==="div") return frac("x",m(f.a))+(f.b>=0?" + "+f.b:" − "+(-f.b))+rhs;
  if(f.form==="bminus") return m(f.b)+" − "+f.a+"x"+rhs;
  return lin(f.a,f.b)+rhs;
}
function plainText(f){
  const rhs = " "+sym(f.op)+" "+m(f.c);
  if(f.form==="div") return "x/"+(f.a<0?"("+m(f.a)+")":f.a)+(f.b>=0?" + "+f.b:" − "+(-f.b))+rhs;
  if(f.form==="bminus") return m(f.b)+" − "+f.a+"x"+rhs;
  return lin(f.a,f.b)+rhs;
}
function wordProblem(){
  const n = pick(NAMES), t = pick(["budget","gym","temp","diver","save","elevator","taxi","points","plant","number","number2"]);
  let story, f, kw, repeatMsg, oneMsg;
  const K = (op)=>{ const k = pick(KW[op]); kw = k; return k[0]; };
  if(t==="budget"){ const P = ri(3,9), G = ri(10,30), H = G + P*ri(3,8) + ri(0,P-1); f = {form:"mul",a:P,b:G,c:H,op:"<="}; story = n+" has $"+H+". "+n+" buys a game for $"+G+" and some card packs at $"+P+" each. Which inequality shows how many packs, x, "+n+" can buy if "+n+" spends "+K("<=")+" $"+H+"?"; repeatMsg = "$"+P+" is per pack, so it multiplies x. The $"+G+" game is bought once, so it stands alone."; }
  else if(t==="gym"){ const F = ri(10,40), Mo = ri(8,25), T = F + Mo*ri(3,10); f = {form:"mul",a:Mo,b:F,c:T,op:"<="}; story = "A gym charges a $"+F+" sign-up fee plus $"+Mo+" per month. "+n+" wants to spend "+K("<=")+" $"+T+". Which inequality shows how many months, x, "+n+" can join for?"; repeatMsg = "$"+Mo+" is per month, so it multiplies x. The $"+F+" fee is paid once."; }
  else if(t==="temp"){ const T = ri(-5,12), Dd = ri(2,6), L = T - Dd*ri(3,8) - ri(1,Dd-1); f = {form:"bminus",a:Dd,b:T,c:L,op:"<"}; story = "The temperature is "+m(T)+"° and it drops "+Dd+"° every hour. Which inequality shows after how many hours, x, the temperature will be "+K("<")+" "+m(L)+"°?"; repeatMsg = "The drop of "+Dd+"° happens every hour, so it multiplies x and is subtracted from the starting "+m(T)+"°."; }
  else if(t==="diver"){ const S = ri(5,20), Dd = ri(2,5), Mx = S + Dd*ri(3,8); f = {form:"bminus",a:Dd,b:-S,c:-Mx,op:">"}; story = "A diver is at −"+S+" meters and goes down "+Dd+" meters every minute. The diver must stay "+K(">")+" −"+Mx+" meters. Which inequality shows how many minutes, x, the diver can keep descending?"; repeatMsg = "Going down "+Dd+" meters every minute means subtracting "+Dd+"x from the starting depth of −"+S+"."; }
  else if(t==="save"){ const S = ri(20,80), E = ri(8,20), N = S + E*ri(4,10) + ri(1,E-1); f = {form:"mul",a:E,b:S,c:N,op:">="}; story = n+" has $"+S+" saved and earns $"+E+" each week. "+n+" needs "+K(">=")+" $"+N+" for a bike. Which inequality shows how many weeks, x, "+n+" must save?"; repeatMsg = "$"+E+" is each week, so it multiplies x. The $"+S+" is already saved."; }
  else if(t==="elevator"){ const W = ri(8,20)*100, Pp = ri(120,200), B = ri(20,60); f = {form:"mul",a:B,b:Pp,c:W,op:"<="}; story = "An elevator can hold "+K("<=")+" "+W+" pounds. A worker who weighs "+Pp+" pounds loads boxes that weigh "+B+" pounds each. Which inequality shows how many boxes, x, can ride with the worker?"; repeatMsg = B+" pounds is per box, so it multiplies x. The worker's "+Pp+" pounds is counted once."; }
  else if(t==="taxi"){ const F = ri(2,5), Mi = ri(2,4), T = F + Mi*ri(4,12); f = {form:"mul",a:Mi,b:F,c:T,op:"<="}; story = "A taxi charges $"+F+" to start plus $"+Mi+" per mile. "+n+" can pay "+K("<=")+" $"+T+". Which inequality shows how many miles, x, "+n+" can ride?"; repeatMsg = "$"+Mi+" is per mile, so it multiplies x. The $"+F+" starting charge is once."; }
  else if(t==="points"){ const P = ri(60,100), L = ri(3,8), N = P - L*ri(3,8) - ri(1,L-1); f = {form:"bminus",a:L,b:P,c:N,op:">"}; story = n+" starts a game with "+P+" points and loses "+L+" points for each wrong answer. To win, "+n+" must finish with "+K(">")+" "+N+" points. Which inequality shows how many wrong answers, x, "+n+" can afford?"; repeatMsg = "Losing "+L+" points per wrong answer means subtracting "+L+"x from the "+P+" starting points."; }
  else if(t==="plant"){ const H = ri(5,30), G = ri(2,6), T = H + G*ri(3,10) + ri(1,G-1); f = {form:"mul",a:G,b:H,c:T,op:">"}; story = "A plant is "+H+" cm tall and grows "+G+" cm each week. Which inequality shows after how many weeks, x, the plant will be "+K(">")+" "+T+" cm tall?"; repeatMsg = G+" cm is each week, so it multiplies x. The plant already has "+H+" cm."; }
  else if(t==="number"){ const a = ri(2,9), b = nz(-15,15), c = nz(-20,20), op = pick(OPS); f = {form:"mul",a,b,c,op}; story = (a===2?"Twice":a+" times")+" a number, "+(b>0?"increased by "+b:"decreased by "+(-b))+", is "+K(op)+" "+m(c)+". Which inequality matches?"; repeatMsg = "“"+(a===2?"Twice":a+" times")+" a number” is "+a+"x. Then the "+(b>0?"increase":"decrease")+" comes after."; }
  else { const a = pick([2,3,4,5,-2,-3,-4]), b = nz(-12,12), c = nz(-15,15), op = pick(OPS); f = {form:"div",a,b,c,op}; story = "A number divided by "+m(a)+", "+(b>0?"plus "+b:"minus "+(-b))+", is "+K(op)+" "+m(c)+". Which inequality matches?"; repeatMsg = "“Divided by "+m(a)+"” is x over "+m(a)+". Then the "+(b>0?"plus":"minus")+" comes after."; }

  const wrong = [];
  wrong.push({f:Object.assign({},f,{op:FLIP[f.op]}), key:"keyword", short:"symbol backwards", msg:kw[1]});
  if(f.form==="mul") wrong.push({f:Object.assign({},f,{a:f.b,b:f.a}), key:"swap", short:"swapped the numbers", msg:repeatMsg});
  else if(f.form==="bminus") wrong.push({f:Object.assign({},f,{form:"mul",a:f.a,b:f.b}), key:"sign", short:"added instead of subtracted", msg:repeatMsg});
  else wrong.push({f:Object.assign({},f,{form:"mul"}), key:"swap", short:"multiplied instead of divided", msg:repeatMsg});
  wrong.push(Math.random()<0.5 ? {f:Object.assign({},f,{op:STRICT[f.op]}), key:"strict", short:"≤/≥ vs </>", msg:kw[1]+(f.op.length===2?" The line under the symbol means “or equal to.”":" No line under the symbol, because it can't be equal.")} : {f:Object.assign({},f,{b:-f.b}), key:"sign", short:"wrong sign on the one-time amount", msg:repeatMsg});
  const seen = new Set([ineqText(f)]);
  const choices = [{text:ineqText(f), review:plainText(f), ok:true}].concat(wrong.filter(w=>{ const t2 = ineqText(w.f); if(seen.has(t2)) return false; seen.add(t2); return true; }).map(w=>({text:ineqText(w.f), review:plainText(w.f), key:w.key, short:w.short, msg:w.msg})));
  while(choices.length<4){ const alt = Object.assign({},f,{c:f.c+ri(1,9)*(Math.random()<0.5?1:-1)}); const t2 = ineqText(alt); if(!seen.has(t2)){ seen.add(t2); choices.push({text:t2, review:plainText(alt), key:"number", short:"wrong total", msg:"The number on the right is the limit from the story: "+m(f.c)+"."}); } }
  return {q:'<div class="story">'+story+'</div>', a:0, type:"choice", wide:true, prompt:"Pick the inequality that matches the story.", choices:shuffle(choices), review:story.replace(/<[^>]+>/g,""),
    steps:["Find the amount that repeats (per month, each hour, per box): that number multiplies x.", "Find the one-time amount: it's added (or subtracted) on its own.", "Find the comparison word: “"+kw[0]+"” means "+sym(f.op)+".", "Put it together: "+M(ineqText(f))], hints:[]};
}
function genMixed(){ return pick([genTwoPos,genTwoNeg,genRight,genGraph,wordProblem,wordProblem,genTwoNeg])(); }

const lesson = [
 {h:"Step 1 and step 2, same as equations", body:'<p>Solve an inequality exactly like an equation: undo the adding/subtracting first, then undo the multiplying/dividing. Do it to <strong>both sides</strong>.</p><div class="ex"><span class="m">4x + 24 > −28</span><span>Subtract 24 from both sides: 4x > −52</span><span>Divide both sides by 4: <strong>x > −13</strong></span></div><div class="trap"><b>Trap (from your self-check):</b> in 4x + 8 < −4, you undo the +8 by subtracting 8, not by adding 4. Ask: what cancels this out?</div>'},
 {h:"The one new rule: flip when you divide by a negative", body:'<p>Multiply or divide both sides by a <strong>negative</strong> number → the symbol flips. That\'s the only time it flips. Adding or subtracting never flips it.</p><div class="ex"><span class="m">−3x − 12 > 9</span><span>Add 12 to both sides: −3x > 21</span><span>Divide by −3 and FLIP: <strong>x < −7</strong></span></div><p class="sub">Why? 2 < 5 is true. Multiply both by −1: −2 and −5. Now −2 > −5. The order reversed.</p>'},
 {h:"When x is on the right", body:'<p>Solve it where it sits, then read it with x first. The symbol points the same way at the same thing.</p><div class="ex"><span class="m">−30 > 15x + 15</span><span>Subtract 15 from both sides: −45 > 15x</span><span>Divide by 15 (positive, no flip): −3 > x</span><span>Read it with x first: “−3 is greater than x” means <strong>x < −3</strong></span></div><div class="trap"><b>Trap:</b> don\'t just copy the symbol over. −3 > x and x > −3 are opposites. Picture the arrow: it points at the smaller thing.</div>'},
 {h:"Graphing on a number line", body:'<div class="rules"><div class="rule"><b>Circle</b>&lt; or &gt; → open circle (the number itself doesn\'t count).<br>≤ or ≥ → closed circle (it counts).</div><div class="rule"><b>Arrow</b>x &gt; … or x ≥ … → shade right (bigger numbers).<br>x &lt; … or x ≤ … → shade left (smaller numbers).</div></div><p style="margin-top:12px">x < −3</p>'+D.numberLine("<",-3)+'<p>x ≥ 2</p>'+D.numberLine(">=",2)+'<p class="sub">Test a point: pick any number on the shaded side and plug it into the original inequality. If it works, you shaded the right side.</p>'},
 {h:"Word problems: pick the inequality", body:'<p>Three things to find in the story:</p><ol class="sol" style="margin:0"><li><strong>What repeats?</strong> Per hour, each pack, every week. That number multiplies x.</li><li><strong>What happens once?</strong> A fee, a starting amount, a starting temperature. It stands alone, added or subtracted.</li><li><strong>The comparison word.</strong> See the table.</li></ol><div class="kw" style="margin-top:12px"><div><b>≤</b>at most, no more than, cannot exceed, maximum</div><div><b>≥</b>at least, a minimum of, no less than, needs at least</div><div><b>&lt;</b>less than, fewer than, below, under</div><div><b>&gt;</b>more than, greater than, above, over</div></div><div class="ex" style="margin-top:12px"><span>A gym charges a $20 fee plus $15 per month. Maya wants to spend at most $95.</span><span>Repeats: $15 per month → 15x. Once: $20 fee. “At most” → ≤.</span><span class="m">15x + 20 ≤ 95</span></div><div class="trap"><b>Trap:</b> “drops 3° every hour” is subtracting: 8 − 3x, not 8 + 3x. “Loses” and “goes down” mean minus.</div>'},
 {h:"Typing answers here", body:'<p>Type <strong>x &lt; -3</strong> or <strong>x >= 5</strong>. Use <strong>&lt;=</strong> and <strong>>=</strong> for ≤ and ≥. Writing it backwards like <strong>-3 > x</strong> also works.</p>'}
];

window.PRACTICE = {
  id:"noah-math-inequalities", student:"Noah",
  title:"Two-step inequalities", intro:"Solve, flip when you must, graph it, and pick the right inequality for a word problem. Test is Tuesday, Oct 13.",
  prompt:"Solve for x.", label:"", placeholder:"x < -3",
  setSize:10, passAt:8,
  mistakeNames:{flip:"Symbol pointing the wrong way",strict:"≤/≥ vs </> mixed up",sign:"Sign slips",undo:"Same operation instead of the opposite",divide:"Stopped after step 1",circle:"Open vs closed circle",keyword:"Comparison word read backwards",swap:"Repeating and one-time amounts swapped",number:"Wrong limit from the story"},
  levels:[
    {name:"One step, and the flip rule", desc:"−3x > 12 · x ÷ (−2) ≤ 4 · x + 5 < 2", gen:genOne},
    {name:"Two steps, no flip", desc:"4x + 24 > −28 · x ÷ 6 − 16 ≥ −8", gen:genTwoPos},
    {name:"Two steps with a flip", desc:"−3x − 12 > 9 · x ÷ (−4) + 10 ≥ −2", gen:genTwoNeg},
    {name:"x on the right", desc:"−30 > 15x + 15 · −41 < −5x − 6", gen:genRight},
    {name:"Graph it", desc:"Solve, then pick the number line", gen:genGraph},
    {name:"Word problems", desc:"Pick the inequality that matches the story", gen:wordProblem},
    {name:"Test run", desc:"Everything mixed, like the real test", gen:genMixed}
  ],
  lesson
};
})();
