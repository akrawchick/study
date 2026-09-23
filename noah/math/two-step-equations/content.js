/* Noah · Math · Two-step equations with positive and negative numbers */
(function(){
"use strict";

/* ---------- number helpers ---------- */
const ri = (a,b)=>a+Math.floor(Math.random()*(b-a+1));
const pick = a=>a[Math.floor(Math.random()*a.length)];
const nz = (a,b)=>{ let n=0; while(n===0) n=ri(a,b); return n; };
const m = n => n<0 ? "−"+Math.abs(n) : String(n);           // −4
const par = n => n<0 ? "(−"+Math.abs(n)+")" : String(n);      // (−4) for substitution
const M = s => '<span class="m">'+s+'</span>';
const coef = a => a===1 ? "" : a===-1 ? "−" : m(a);
const lin = (a,b) => coef(a)+"x"+(b>=0 ? " + "+b : " − "+(-b));   // 3x + 5, −2x − 7
const frac = (top,bot) => '<span class="frac"><span>'+top+'</span><span>'+bot+'</span></span>';
const signWord = n => n<0 ? "negative" : "positive";
const undoWord = b => b>0 ? "subtract "+b+" from both sides" : "add "+(-b)+" to both sides";
const divNote = (num,den) => (num<0) !== (den<0) ? "Different signs, so the answer is negative." : (num<0 && den<0 ? "Two negatives divide to a positive." : "");

/* ---------- Level 1: sign rules ---------- */
function genSigns(){
  const type = pick(["add","add","sub","sub","mul","div"]);
  if(type==="add"){
    let a, b; do { a = nz(-12,12); b = nz(-12,12); } while(a>0 && b>0);
    const q = m(a)+" + "+par(b), ans = a+b, steps = [];
    if((a<0)===(b<0)) steps.push("Same signs: add the sizes, "+Math.abs(a)+" + "+Math.abs(b)+" = "+(Math.abs(a)+Math.abs(b))+", and keep the sign. "+M(q+" = "+m(ans)));
    else steps.push("Different signs: subtract the sizes, "+Math.max(Math.abs(a),Math.abs(b))+" − "+Math.min(Math.abs(a),Math.abs(b))+" = "+Math.abs(ans)+", and keep the sign of the bigger number ("+m(Math.abs(a)>Math.abs(b)?a:b)+"). "+M(q+" = "+m(ans)));
    return {q:q+" = ?", a:ans, steps, hints:[{v:-ans,key:"sign",short:"sign slip",msg:"The size was right but the sign was off. The answer takes the sign of the number with the bigger size."},{v:Math.abs(a)+Math.abs(b)*( (a<0)===(b<0) ? 1 : 1),key:"addsize",short:"added sizes with different signs",msg:"With different signs you subtract the sizes, you don't add them."}].filter(h=>h.v!==ans)};
  }
  if(type==="sub"){
    let a, b; do { a = nz(-12,12); b = nz(-12,12); } while(a>0 && b>0 && a>b);
    const q = m(a)+" − "+par(b), ans = a-b;
    const steps = ["Subtracting is adding the opposite: "+M(m(a)+" − "+par(b)+" = "+m(a)+" + "+par(-b))];
    if((a<0)===(-b<0)) steps.push("Same signs: add the sizes and keep the sign. "+M("= "+m(ans)));
    else steps.push("Different signs: subtract the sizes and keep the sign of the bigger one. "+M("= "+m(ans)));
    return {q:q+" = ?", a:ans, steps, hints:[{v:-ans,key:"sign",short:"sign slip",msg:"Size right, sign off. Rewrite it as adding the opposite, then apply the sign rules."},{v:a+b,key:"minusneg",short:"forgot to flip the sign",msg:"Subtracting "+par(b)+" is the same as adding "+m(-b)+". Flip the sign of the number you subtract."}].filter(h=>h.v!==ans)};
  }
  if(type==="mul"){
    let a, b; do { a = nz(-9,9); b = nz(-9,9); } while(a>0 && b>0);
    const ans = a*b, q = par(a)+" × "+par(b);
    return {q:q+" = ?", a:ans, steps:["Multiply the sizes: "+Math.abs(a)+" × "+Math.abs(b)+" = "+Math.abs(ans)+".", ((a<0)===(b<0) ? "Same signs → positive. " : "Different signs → negative. ")+M(q+" = "+m(ans))], hints:[{v:-ans,key:"sign",short:"sign slip",msg:"Same signs give a positive, different signs give a negative."}]};
  }
  let b, k; do { b = nz(-9,9); k = nz(-9,9); } while(b>0 && k>0);
  const a = b*k, q = m(a)+" ÷ "+par(b);
  return {q:q+" = ?", a:k, steps:["Divide the sizes: "+Math.abs(a)+" ÷ "+Math.abs(b)+" = "+Math.abs(k)+".", ((a<0)===(b<0) ? "Same signs → positive. " : "Different signs → negative. ")+M(q+" = "+m(k))], hints:[{v:-k,key:"sign",short:"sign slip",msg:"Same signs give a positive, different signs give a negative."}]};
}

/* ---------- Level 2: one-step ---------- */
function genOneStep(){
  const type = pick(["add","sub","mul","div"]);
  let x;
  if(type==="add"){
    const b = nz(-12,12); do { x = nz(-12,12); } while(x>0 && b>0);
    const c = x+b, q = "x"+(b>0?" + "+b:" − "+(-b))+" = "+m(c);
    return {q, a:x, steps:["To undo "+(b>0?"+ "+b:"− "+(-b))+", "+undoWord(b)+".", M("x = "+m(c)+(b>0?" − "+b:" + "+(-b))+" = "+m(x))], check:"Check: "+m(x)+(b>0?" + "+b:" − "+(-b))+" = "+m(c)+" ✓", hints:[{v:-x,key:"sign",short:"sign slip",msg:"Recheck the sign when you combine "+m(c)+" and "+m(-b)+"."},{v:c+b,key:"undo",short:"added instead of subtracting",msg:"To undo adding "+b+", subtract "+b+". Do the opposite operation."}].filter(h=>h.v!==x)};
  }
  if(type==="sub"){
    const b = ri(1,12); do { x = nz(-12,12); } while(x>0);
    const c = x-b, q = "x − "+b+" = "+m(c);
    return {q, a:x, steps:["To undo − "+b+", add "+b+" to both sides.", M("x = "+m(c)+" + "+b+" = "+m(x))], check:"Check: "+m(x)+" − "+b+" = "+m(c)+" ✓", hints:[{v:-x,key:"sign",short:"sign slip",msg:m(c)+" + "+b+": different signs, so subtract the sizes and keep the sign of the bigger one."},{v:c-b,key:"undo",short:"subtracted instead of adding",msg:"To undo subtracting "+b+", add "+b+"."}].filter(h=>h.v!==x)};
  }
  if(type==="mul"){
    let a; do { a = nz(-9,9); x = nz(-9,9); } while(a===1 || (a>0 && x>0));
    const c = a*x, q = coef(a)+"x = "+m(c);
    return {q, a:x, steps:["To undo × "+par(a)+", divide both sides by "+m(a)+".", M("x = "+m(c)+" ÷ "+par(a)+" = "+m(x))+" "+divNote(c,a)], check:"Check: "+par(a)+" × "+par(x)+" = "+m(c)+" ✓", hints:[{v:-x,key:"sign",short:"sign slip",msg:m(c)+" ÷ "+par(a)+": "+((c<0)!==(a<0)?"different signs give a negative.":"same signs give a positive.")},{v:c-a,key:"undo",short:"subtracted instead of dividing",msg:coef(a)+"x means "+m(a)+" times x. Undo multiplying by dividing."}].filter(h=>h.v!==x)};
  }
  const a = ri(2,9), k = -ri(1,9);
  x = a*k;
  const q = frac("x",m(a))+" = "+m(k);
  return {q, a:x, steps:["To undo ÷ "+par(a)+", multiply both sides by "+m(a)+".", M("x = "+m(k)+" × "+par(a)+" = "+m(x))+" "+divNote(k,a)], check:"Check: "+m(x)+" ÷ "+par(a)+" = "+m(k)+" ✓", hints:[{v:-x,key:"sign",short:"sign slip",msg:m(k)+" × "+par(a)+": "+((k<0)!==(a<0)?"different signs give a negative.":"same signs give a positive.")},{v:(k%a===0)?k/a:NaN,key:"undo",short:"divided instead of multiplying",msg:"x is being divided by "+m(a)+". Undo that by multiplying."}].filter(h=>!isNaN(h.v) && h.v!==x)};
}

/* ---------- Two-step builders ---------- */
function twoStep(a,b,x,opts){
  opts = opts||{};
  const c = a*x+b;
  const left = opts.swapTerms ? m(b)+(a<0?" − ":" + ")+(Math.abs(a)===1?"":Math.abs(a))+"x" : lin(a,b);
  const q = opts.rightSide ? m(c)+" = "+left : left+" = "+m(c);
  const steps = [];
  if(opts.rightSide) steps.push("x is on the right. Flip the sides so x is on the left: "+M(left+" = "+m(c))+".");
  if(opts.swapTerms) steps.push(M(left)+" means "+M(lin(a,b))+". The "+m(a)+" belongs to the x.");
  steps.push("Undo the "+(b>0?"+ "+b:"− "+(-b))+" first: "+undoWord(b)+". "+M(coef(a)+"x = "+m(c)+(b>0?" − "+b:" + "+(-b))+" = "+m(c-b)));
  steps.push("Undo the × "+par(a)+": divide both sides by "+m(a)+". "+M("x = "+m(c-b)+" ÷ "+par(a)+" = "+m(x))+" "+(a<0?"Dividing by a negative flips the sign.":divNote(c-b,a)));
  const check = "Check: "+(a===-1?"−":a===1?"":m(a))+"("+m(x)+")"+(b>0?" + "+b:" − "+(-b))+" = "+m(a*x)+(b>0?" + "+b:" − "+(-b))+" = "+m(c)+" ✓";
  const hints = [
    {v:-x,key:"sign",short:"sign slip",msg:"Everything but the sign. "+m(c-b)+" ÷ "+par(a)+": "+((c-b<0)!==(a<0)?"different signs give a negative answer.":"same signs give a positive answer.")},
    {v:(c+b)%a===0 ? (c+b)/a : NaN,key:"undo",short:"added instead of subtracting (or vice versa)",msg:"To undo "+(b>0?"+ "+b+", subtract "+b:"− "+(-b)+", add "+(-b))+" on both sides. You did the same operation instead of the opposite."},
    {v:c-b,key:"divide",short:"stopped after step 1",msg:"Good first step: "+coef(a)+"x = "+m(c-b)+". Now divide both sides by "+m(a)+"."},
    {v:c%a===0 ? c/a-b : NaN,key:"order",short:"divided before undoing the + / −",msg:"Undo the adding or subtracting first, then the multiplying. Work backwards through the order of operations."},
    {v:(c-b)%Math.abs(a)===0 && a<0 ? (c-b)/Math.abs(a) : NaN,key:"sign",short:"divided by a positive instead of "+m(a),msg:"The coefficient is "+m(a)+", not "+Math.abs(a)+". Dividing by a negative flips the sign."}
  ].filter(h=>!isNaN(h.v) && h.v!==x);
  return {q, a:x, steps, check, hints};
}
function fracStep(a,b,k,opts){
  opts = opts||{};
  const x = a*k, c = k+b;
  const left = frac("x",m(a))+(b>0?" + "+b:" − "+(-b));
  const q = opts.rightSide ? m(c)+" = "+left : left+" = "+m(c);
  const steps = [];
  if(opts.rightSide) steps.push("Flip the sides so x is on the left: "+M(left+" = "+m(c))+".");
  steps.push("Undo the "+(b>0?"+ "+b:"− "+(-b))+" first: "+undoWord(b)+". "+M(frac("x",m(a))+" = "+m(c)+(b>0?" − "+b:" + "+(-b))+" = "+m(k)));
  steps.push("Undo the ÷ "+par(a)+": multiply both sides by "+m(a)+". "+M("x = "+m(k)+" × "+par(a)+" = "+m(x))+" "+divNote(k,a));
  const check = "Check: "+m(x)+" ÷ "+par(a)+" = "+m(k)+", and "+m(k)+(b>0?" + "+b:" − "+(-b))+" = "+m(c)+" ✓";
  const hints = [
    {v:-x,key:"sign",short:"sign slip",msg:m(k)+" × "+par(a)+": "+((k<0)!==(a<0)?"different signs give a negative.":"same signs give a positive.")},
    {v:(c+b)*a,key:"undo",short:"added instead of subtracting (or vice versa)",msg:"To undo "+(b>0?"+ "+b+", subtract "+b:"− "+(-b)+", add "+(-b))+" on both sides."},
    {v:k,key:"divide",short:"stopped after step 1",msg:"Good first step: x ÷ "+par(a)+" = "+m(k)+". Now multiply both sides by "+m(a)+"."},
    {v:(k%a===0)?k/a:NaN,key:"order",short:"divided instead of multiplying",msg:"x is divided by "+m(a)+", so undo it by multiplying, not dividing."}
  ].filter(h=>!isNaN(h.v) && h.v!==x);
  return {q, a:x, steps, check, hints};
}

/* ---------- Levels 3–6 ---------- */
function genBasic(hard){
  const A = hard?12:9, B = hard?25:12, X = hard?12:9;
  let a = ri(2,A), b = nz(-B,B), x; do { x = nz(-X,X); } while(x>0 && b>0 && Math.random()<0.7);
  return twoStep(a,b,x);
}
function genNegCoef(hard){
  const A = hard?12:9, B = hard?25:12, X = hard?12:9;
  const a = -ri(1,A), b = nz(-B,B), x = nz(-X,X);
  return twoStep(a,b,x,{swapTerms: b>0 && Math.random()<0.5});
}
function genFracFlip(hard){
  const A = hard?12:9, B = hard?25:12, K = hard?12:9;
  if(Math.random()<0.5){
    const a = ri(2,A), b = nz(-B,B); let k; do { k = nz(-K,K); } while(k>0 && b>0);
    return fracStep(a,b,k,{rightSide: Math.random()<0.3});
  }
  const a = nz(-A,A), b = nz(-B,B), x = nz(-K,K);
  return twoStep(a===1?2:a, b, x, {rightSide:true});
}
function genMixed(){ return pick([genBasic,genNegCoef,genFracFlip,genBasic,genNegCoef])(true); }

/* ---------- lesson ---------- */
const lesson = [
 {h:"Sign rules (the foundation)", body:
  '<div class="rules">'+
  '<div class="rule"><b>Adding, same signs</b>Add the sizes, keep the sign.<br>'+M("−7 + (−3) = −10")+'</div>'+
  '<div class="rule"><b>Adding, different signs</b>Subtract the sizes, keep the sign of the bigger one.<br>'+M("−7 + 3 = −4")+' &nbsp; '+M("7 + (−3) = 4")+'</div>'+
  '<div class="rule"><b>Subtracting</b>Add the opposite, then use the adding rules.<br>'+M("4 − (−6) = 4 + 6 = 10")+'<br>'+M("−4 − 6 = −4 + (−6) = −10")+'</div>'+
  '<div class="rule"><b>Multiplying and dividing</b>Same signs → positive. Different signs → negative.<br>'+M("(−4) × (−5) = 20")+' &nbsp; '+M("−20 ÷ 4 = −5")+'</div>'+
  '</div>'},
 {h:"The two-step recipe", body:
  '<p>An equation like '+M("3x + 5 = −7")+' was built by doing two things to x: multiply by 3, then add 5. To find x, <strong>undo them in reverse order</strong>.</p>'+
  '<ol class="sol" style="margin:0"><li><strong>Undo the adding or subtracting first.</strong> Whatever is added to the x-term, subtract it from both sides (and vice versa).</li>'+
  '<li><strong>Then undo the multiplying or dividing.</strong> Divide both sides by the number in front of x (or multiply, if x is divided by something).</li>'+
  '<li><strong>Check</strong> by plugging your answer back in.</li></ol>'+
  '<p class="sub">Why that order? It is the order of operations backwards. Building the equation went ×3 then +5; taking it apart goes −5 then ÷3.</p>'},
 {h:"Three worked examples", body:
  '<div class="ex"><span class="m">3x + 5 = −7</span><span>Subtract 5 from both sides: 3x = −7 − 5 = −12</span><span>Divide both sides by 3: x = −12 ÷ 3 = <strong>−4</strong></span><span class="sub">Check: 3(−4) + 5 = −12 + 5 = −7 ✓</span></div><br>'+
  '<div class="ex"><span class="m">4 − 3x = 19</span><span>4 − 3x is the same as −3x + 4. Subtract 4 from both sides: −3x = 15</span><span>Divide both sides by −3: x = 15 ÷ (−3) = <strong>−5</strong></span><span class="sub">Check: 4 − 3(−5) = 4 + 15 = 19 ✓</span></div><br>'+
  '<div class="ex"><span class="m">'+frac("x","2")+' − 6 = −1</span><span>Add 6 to both sides: x ÷ 2 = 5</span><span>Multiply both sides by 2: x = <strong>10</strong></span><span class="sub">Check: 10 ÷ 2 − 6 = 5 − 6 = −1 ✓</span></div>'},
 {h:"The three traps", body:
  '<div class="trap"><b>Trap 1: doing the same thing instead of the opposite.</b> To undo + 5 you subtract 5. To undo − 5 you add 5. Ask: what would cancel this out?</div><br>'+
  '<div class="trap"><b>Trap 2: the sign when dividing by a negative.</b> In −3x = 15, you divide by −3, not 3. Different signs give a negative: x = −5. Two negatives give a positive: −3x = −15 means x = 5.</div><br>'+
  '<div class="trap"><b>Trap 3: 4 − 3x looks different but isn\'t.</b> It means −3x + 4. The minus sign belongs to the 3x. Rewrite it that way before you start.</div>'},
 {h:"Always check", body:'<p>Plug your answer back into the original equation. If both sides match, you are done. If they don\'t, the mistake is almost always a sign, so redo the last step slowly.</p><p class="sub">Typing answers here: use a minus sign for negatives, like <strong>-4</strong>. Writing <strong>x = -4</strong> also works.</p>'}
];

window.PRACTICE = {
  id: "noah-math-two-step",
  student: "Noah",
  title: "Two-step equations",
  intro: "Solve for x with positive and negative numbers. One 10-problem set a day, and pass each level to unlock the next.",
  prompt: "Solve for x.",
  label: "x =",
  placeholder: "−4",
  setSize: 10,
  passAt: 8,
  mistakeNames: {sign:"Sign slips", undo:"Same operation instead of the opposite", divide:"Stopped after step 1", order:"Wrong order", addsize:"Added sizes with different signs", minusneg:"Subtracting a negative"},
  levels: [
    {name:"Sign rules", desc:"Add, subtract, multiply and divide with negatives", gen:genSigns},
    {name:"One-step with negatives", desc:"x + 5 = −3 · −4x = 20 · x ÷ 3 = −2", gen:genOneStep},
    {name:"Two-step basics", desc:"3x + 5 = −7 · 2x − 9 = −1", gen:()=>genBasic(false)},
    {name:"Negative coefficients", desc:"−2x + 7 = 15 · 4 − 3x = 19", gen:()=>genNegCoef(false)},
    {name:"Fractions and flipped sides", desc:"x ÷ 3 − 4 = −6 · 10 = −2x + 4", gen:()=>genFracFlip(false)},
    {name:"Mixed challenge", desc:"Everything, bigger numbers", gen:genMixed}
  ],
  lesson
};
/* Level 1 uses "= ?" prompts, not "solve for x" */
const signsGen = window.PRACTICE.levels[0].gen;
window.PRACTICE.levels[0].gen = function(){ const p = signsGen(); p.prompt = "Work it out."; p.label = "="; p.placeholder = "?"; return p; };
})();
