/* Noah · Math 7 Plus · Unit 3: Angles, Triangles, Prisms (WCPSS accelerated lessons 1–15; no test date posted yet) */
(function(){
"use strict";
const D = window.DRAW;
const ri = (a,b)=>a+Math.floor(Math.random()*(b-a+1));
const pick = a=>a[Math.floor(Math.random()*a.length)];
const shuffle = a=>{ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
const M = s => '<span class="m">'+s+'</span>';
const story = s => '<div class="story">'+s+'</div>';
const deg = n => n+"°";
const NOTE = '<p class="sub" style="text-align:center;margin-top:4px">Not drawn to scale.</p>';

/* ---------- Level 1: angle basics, adjacent, complementary, supplementary ---------- */
function genBasics(){
  const t = pick(["type","type","comp","supp","supp","classify","line"]);
  if(t==="type"){
    const a = pick([ri(15,80), 90, ri(100,165), 180, ri(20,85), ri(95,170)]);
    const kind = a<90?"acute":a===90?"right":a<180?"obtuse":"straight";
    const why = {acute:"It's less than 90°, so it's acute.",right:"It's exactly 90° (the square corner), so it's a right angle.",obtuse:"It's more than 90° but less than 180°, so it's obtuse.",straight:"It's exactly 180°: a straight line, so it's a straight angle."}[kind];
    const choices = shuffle([["acute","less than 90°"],["right","exactly 90°"],["obtuse","between 90° and 180°"],["straight","exactly 180°"]].map(c=>({text:c[0]+" <span class=\"sub\">("+c[1]+")</span>", review:c[0], ok:c[0]===kind, key:"type", short:"angle type", msg:why})));
    return {q:D.angle(a, deg(a)), a:0, type:"choice", prompt:"What kind of angle is this?", choices, review:"a "+a+"° angle", steps:[why]};
  }
  if(t==="comp"){
    const a = ri(10,80), b = 90-a;
    return {q:story("Two angles are <b>complementary</b>. One measures <b>"+deg(a)+"</b>. What is the other?"), review:"complement of "+deg(a), a:b, suffix:"°", wide:true, prompt:"Complementary angles add up to 90°.",
      steps:["Complementary means the two angles make a right angle: they add to 90°.", "90 − "+a+" = "+M(deg(b))],
      hints:[{v:180-a,key:"ninety",short:"used 180 instead of 90",msg:"Complementary → 90°. Supplementary → 180°. Think: C comes before S, and 90 comes before 180."},{v:360-a,key:"ninety",short:"used 360",msg:"Complementary angles add to 90°, not 360°."}]};
  }
  if(t==="supp"){
    const a = ri(15,165), b = 180-a;
    const drawn = Math.random()<0.6;
    return {q:drawn ? D.onLine([a,b],[deg(a),"?"])+NOTE : story("Two angles are <b>supplementary</b>. One measures <b>"+deg(a)+"</b>. What is the other?"), review:"supplement of "+deg(a), a:b, suffix:"°", wide:!drawn, prompt:drawn?"Find the missing angle.":"Supplementary angles add up to 180°.",
      steps:[drawn?"The two angles sit together on a straight line, so they are supplementary: they add to 180°.":"Supplementary means the two angles make a straight line: they add to 180°.", "180 − "+a+" = "+M(deg(b))],
      hints:[{v:90-a,key:"ninety",short:"used 90 instead of 180",msg:"A straight line is 180°. Complementary (90°) is for a right angle."},{v:360-a,key:"ninety",short:"used 360",msg:"The two angles make a straight line: 180°, not a full turn."}].filter(h=>h.v>0)};
  }
  if(t==="classify"){
    const kind = pick(["comp","supp","neither","neither"]);
    let a = ri(10,80), b = kind==="comp" ? 90-a : kind==="supp" ? (a = ri(20,160), 180-a) : pick([90-a+ri(5,25), 180-a-ri(5,25)]);
    if(b<=0) b = 20;
    const sum = a+b, ans = sum===90?"complementary":sum===180?"supplementary":"neither";
    const choices = shuffle([{text:"Complementary",ok:ans==="complementary",key:"ninety",short:"complementary vs supplementary",msg:a+" + "+b+" = "+sum+". Complementary needs exactly 90."},{text:"Supplementary",ok:ans==="supplementary",key:"ninety",short:"complementary vs supplementary",msg:a+" + "+b+" = "+sum+". Supplementary needs exactly 180."},{text:"Neither",ok:ans==="neither",key:"ninety",short:"missed the pair",msg:a+" + "+b+" = "+sum+", which is exactly "+sum+"°."},{text:"Vertical",key:"vertical",short:"vertical isn't about a sum",msg:"Vertical angles are a position (across a crossing), and they're equal. This question is about what the two add up to: "+sum+"."}]);
    return {q:story("An angle measures <b>"+deg(a)+"</b> and another measures <b>"+deg(b)+"</b>. Are they complementary, supplementary, or neither?"), a:0, type:"choice", prompt:"Add them up.", choices, review:deg(a)+" and "+deg(b), steps:[a+" + "+b+" = "+M(sum), sum===90?"Exactly 90, so complementary.":sum===180?"Exactly 180, so supplementary.":"Not 90 and not 180, so neither."]};
  }
  const a = ri(20,70), b = ri(20,70), c = 180-a-b;
  return {q:D.onLine([a,b,c],[deg(a),deg(b),"?"])+NOTE, review:"three angles on a line: "+a+"°, "+b+"°, ?", a:c, suffix:"°", prompt:"Find the missing angle.",
    steps:["All the angles on one side of a straight line add to 180°.", a+" + "+b+" = "+(a+b)+", so 180 − "+(a+b)+" = "+M(deg(c))],
    hints:[{v:360-a-b,key:"ninety",short:"used 360",msg:"One side of a straight line is 180°."},{v:180-a,key:"missed",short:"left out one angle",msg:"There are three angles on the line. Subtract both known ones."},{v:180-b,key:"missed",short:"left out one angle",msg:"There are three angles on the line. Subtract both known ones."}].filter(h=>h.v!==c&&h.v>0)};
}

/* ---------- Level 2: vertical angles and multi-step ---------- */
function genVertical(){
  const t = pick(["vert","vert","supp","which","multi"]);
  const a = ri(25,155), b = 180-a;
  if(t==="vert"){
    return {q:D.cross(a,[deg(a),"","?",""])+NOTE, review:"intersecting lines, "+deg(a)+" given, vertical angle asked", a:a, suffix:"°", prompt:"Two lines cross. Find the missing angle.",
      steps:["The missing angle is directly across the crossing from the "+deg(a)+" angle. Across-from-each-other angles are vertical angles.", "Vertical angles are always equal: "+M(deg(a))],
      hints:[{v:b,key:"vertical",short:"gave the neighbor, not the vertical angle",msg:"That's the angle NEXT to it (supplementary). The one ACROSS from it is vertical, so it's equal: "+deg(a)+"."},{v:90-a,key:"ninety",short:"used 90",msg:"Across the crossing = vertical = equal."}].filter(h=>h.v!==a&&h.v>0)};
  }
  if(t==="supp"){
    return {q:D.cross(a,[deg(a),"?","",""])+NOTE, review:"intersecting lines, "+deg(a)+" given, neighbor asked", a:b, suffix:"°", prompt:"Two lines cross. Find the missing angle.",
      steps:["The missing angle is next to the "+deg(a)+" angle, and together they make a straight line.", "180 − "+a+" = "+M(deg(b))],
      hints:[{v:a,key:"vertical",short:"gave the vertical angle, not the neighbor",msg:"Equal angles are the ones ACROSS from each other. This one is NEXT to "+deg(a)+", so they add to 180."},{v:90-a,key:"ninety",short:"used 90",msg:"Angles that make a straight line add to 180."}].filter(h=>h.v!==b&&h.v>0)};
  }
  if(t==="which"){
    const choices = shuffle([
      {text:"Vertical angles are always equal.", ok:true},
      {text:"Vertical angles always add to 180°.", key:"vertical", short:"vertical vs supplementary", msg:"Angles that add to 180° are supplementary (next to each other on a line). Vertical angles are across from each other and equal."},
      {text:"Vertical angles always add to 90°.", key:"ninety", short:"vertical vs complementary", msg:"Nothing about crossing lines makes 90°. Vertical angles are equal."},
      {text:"Vertical angles are always 90°.", key:"vertical", short:"vertical means right", msg:"Vertical doesn't mean straight up and down. It means across from each other at a crossing, and those are equal."}
    ]);
    return {q:story("Two straight lines cross. Which statement about the <b>vertical angles</b> is true?"), a:0, type:"choice", prompt:"Pick the true statement.", choices, review:"vertical angles fact", steps:["When two lines cross, the angles across from each other are vertical angles, and they are equal. The angles next to each other add to 180°."]};
  }
  const a2 = ri(25,100), c = ri(20,55), x = 180-a2-c;   /* three angles on a line, unknown in the middle */
  return {q:D.onLine([a2,x,c],[deg(a2),"?",deg(c)])+NOTE, review:"line with "+a2+"°, ?, "+c+"°", a:x, suffix:"°", prompt:"Find the missing angle.",
    steps:["The three angles together make a straight line: 180°.", a2+" + "+c+" = "+(a2+c)+", so 180 − "+(a2+c)+" = "+M(deg(x))],
    hints:[{v:180-a2,key:"missed",short:"left out one angle",msg:"Subtract both known angles from 180."},{v:180-c,key:"missed",short:"left out one angle",msg:"Subtract both known angles from 180."},{v:360-a2-c,key:"ninety",short:"used 360",msg:"One side of a line is 180°."}].filter(h=>h.v!==x&&h.v>0)};
}

/* ---------- Level 3: write and solve an equation ---------- */
const lin = (k,b) => (k===1?"":k)+"x"+(b>0?" + "+b:b<0?" − "+(-b):"");
function genEquation(){
  const t = pick(["supp","supp","comp","vert","supp3"]);
  let x = ri(4,25), k = ri(2,5), b = ri(-10,25), total, rel, fig, other;
  if(t==="vert"){
    const k2 = pick([1,2,3].filter(v=>v!==k));
    /* make them equal: choose b2 so k*x+b = k2*x+b2 */
    const b2 = k*x+b-k2*x; const m1 = k*x+b; if(m1<=0||m1>=180) return genEquation();
    const e1 = lin(k,b), e2 = lin(k2,b2);
    return {q:D.cross(m1,["("+e1+")°","","("+e2+")°",""])+NOTE, review:"vertical angles ("+e1+")° and ("+e2+")°", a:x, label:"x =", prompt:"Write an equation, then solve for x.",
      steps:["These two angles are across from each other: vertical angles, so they're equal. Equation: "+M(e1+" = "+e2), "Get the x terms together: "+M(((k-k2)>0?(k-k2):-(k2-k))+"x"+(b>0?" + "+b:b<0?" − "+(-b):"")+" = "+b2)+(k-k2<0?" (or move them the other way)":""), "Solve: x = "+M(x)],
      check:"Check: both angles come out to "+m1+"°.",
      hints:[{v:(180-b-b2)/(k+k2),key:"relation",short:"used 180 for vertical angles",msg:"Vertical angles are equal, not supplementary. Set the two expressions equal."},{v:-x,key:"sign",short:"sign slip",msg:"Check the signs when you move terms across the equals sign."}].filter(h=>Number.isFinite(h.v)&&h.v!==x)};
  }
  total = t==="comp" ? 90 : 180; rel = t==="comp" ? "complementary" : "supplementary";
  if(t==="comp"){ k = ri(2,4); x = ri(3,15); }
  let e1 = k*x+b; if(e1<=0 || e1>=total-5) return genEquation();
  other = total-e1;
  if(t==="supp3"){
    const c = ri(20,60); other -= c; if(other<=0) return genEquation();
    fig = D.onLine([e1,other,c],["("+lin(k,b)+")°",deg(other),deg(c)])+NOTE;
    return {q:fig, review:"angles on a line: ("+lin(k,b)+")°, "+other+"°, "+c+"°", a:x, label:"x =", prompt:"Write an equation, then solve for x.",
      steps:["The three angles make a straight line, so they add to 180. Equation: "+M(lin(k,b)+" + "+other+" + "+c+" = 180"), "Combine the numbers: "+M(lin(k,b+other+c)+" = 180"), "Undo the "+(b+other+c>0?"+ "+(b+other+c):"− "+(-(b+other+c)))+": "+M(k+"x = "+(180-b-other-c)), "Divide by "+k+": "+M("x = "+x)],
      check:"Check: "+k+"("+x+")"+(b>0?" + "+b:b<0?" − "+(-b):"")+" = "+e1+", and "+e1+" + "+other+" + "+c+" = 180 ✓",
      hints:[{v:(180-b-other)/k,key:"missed",short:"left out one angle",msg:"All three angles are on the line. Include the "+c+"° too."},{v:(180-b-c)/k,key:"missed",short:"left out one angle",msg:"All three angles are on the line. Include the "+other+"° too."},{v:(90-b-other-c)/k,key:"relation",short:"used 90",msg:"A straight line is 180°."}].filter(h=>Number.isFinite(h.v)&&h.v!==x)};
  }
  fig = t==="comp" ? story("Two angles are <b>complementary</b>. One measures <b>("+lin(k,b)+")°</b> and the other measures <b>"+deg(other)+"</b>.") : (Math.random()<0.5 ? D.onLine([e1,other],["("+lin(k,b)+")°",deg(other)])+NOTE : story("Two angles are <b>supplementary</b>. One measures <b>("+lin(k,b)+")°</b> and the other measures <b>"+deg(other)+"</b>."));
  const wide = fig.indexOf("story")>=0;
  return {q:fig, review:rel+": ("+lin(k,b)+")° and "+deg(other), a:x, label:"x =", wide, prompt:"Write an equation, then solve for x.",
    steps:[rel.charAt(0).toUpperCase()+rel.slice(1)+" angles add to "+total+". Equation: "+M(lin(k,b)+" + "+other+" = "+total), "Combine the numbers: "+M(lin(k,b+other)+" = "+total), "Undo the "+(b+other>0?"+ "+(b+other):"− "+(-(b+other)))+": "+M(k+"x = "+(total-b-other)), "Divide by "+k+": "+M("x = "+x)],
    check:"Check: "+k+"("+x+")"+(b>0?" + "+b:b<0?" − "+(-b):"")+" = "+e1+", and "+e1+" + "+other+" = "+total+" ✓",
    hints:[{v:(t==="comp"?180:90)-b-other,key:"relation",short:"used the wrong total",msg:rel+" angles add to "+total+"°."},{v:((t==="comp"?180:90)-b-other)/k,key:"relation",short:"used the wrong total",msg:rel+" angles add to "+total+"°."},{v:(total+b-other)/k,key:"undo",short:"added instead of subtracting",msg:"To undo + "+(b+other)+", subtract it from both sides."},{v:total-b-other,key:"divide",short:"stopped before dividing",msg:"That's "+k+"x. Divide both sides by "+k+" to get x."},{v:e1,key:"answerx",short:"gave the angle, not x",msg:"That's the angle's measure. The question asks for x, the number inside the expression."}].filter(h=>Number.isFinite(h.v)&&h.v!==x)};
}

/* ---------- Level 4: can these sides make a triangle? ---------- */
function genInequality(){
  const t = pick(["yesno","yesno","range","quad"]);
  if(t==="yesno"){
    let a = ri(2,12), b = ri(2,12), c; const makes = Math.random()<0.5;
    if(makes){ c = ri(Math.abs(a-b)+1, a+b-1); } else { c = pick([a+b, a+b+ri(1,5)]); }
    const sides = shuffle([a,b,c]); const s = sides.slice().sort((p,q)=>p-q);
    const sum = s[0]+s[1], big = s[2];
    const choices = shuffle([
      {text:"Yes: "+s[0]+" + "+s[1]+" = "+sum+", and "+sum+" "+(makes?">":"is not >")+" "+big, ok:makes, key:"ineq", short:"triangle inequality", msg:"Add the two shortest sides and compare with the longest: "+s[0]+" + "+s[1]+" = "+sum+" vs "+big+". The sum must be GREATER than the longest side."},
      {text:"No: "+s[0]+" + "+s[1]+" = "+sum+", which is not greater than "+big, ok:!makes, key:"ineq", short:"triangle inequality", msg:"Add the two shortest sides: "+s[0]+" + "+s[1]+" = "+sum+". Compare with "+big+"."},
      {text:"Yes: any three lengths make a triangle", key:"ineq", short:"thinks any three sides work", msg:"Not always. If two short sides can't reach across the long side, they never meet. The two shorter sides must add to MORE than the longest."},
      {text:"No: the sides are all different lengths", key:"ineq", short:"thinks sides must match", msg:"Sides can all be different (that's a scalene triangle). The rule is about the sum of the two shorter sides."}
    ]);
    return {q:story("Can side lengths <b>"+sides.join(", ")+"</b> make a triangle?"), a:0, type:"choice", prompt:"Use the triangle rule.", choices, review:"sides "+sides.join(", "), steps:["Rule: the two shorter sides, added together, must be greater than the longest side.", s[0]+" + "+s[1]+" = "+sum+", and the longest side is "+big+".", makes ? sum+" > "+big+", so yes, they make a triangle." : sum+" is not greater than "+big+", so the two short sides can't reach: no triangle."+(sum===big?" (Equal means they lie flat on the long side.)":"")]};
  }
  if(t==="range"){
    const a = ri(3,12), b = ri(3,12), lo = Math.abs(a-b)+1, hi = a+b-1, ask = pick(["largest","smallest"]);
    const ans = ask==="largest" ? hi : lo;
    return {q:story("Two sides of a triangle are <b>"+a+"</b> and <b>"+b+"</b>. What is the <b>"+ask+"</b> whole number the third side could be?"), review:ask+" third side with "+a+" and "+b, a:ans, wide:true, prompt:"Think about the triangle rule both ways.",
      steps:[ask==="largest" ? "The third side has to be less than "+a+" + "+b+" = "+(a+b)+" (or the two known sides can't reach across it)." : "The third side plus the shorter known side has to beat the longer known side: third + "+Math.min(a,b)+" > "+Math.max(a,b)+", so third > "+Math.abs(a-b)+".", ask==="largest" ? "The largest whole number less than "+(a+b)+" is "+M(hi) : "The smallest whole number greater than "+Math.abs(a-b)+" is "+M(lo)],
      hints:[{v:ask==="largest"?a+b:Math.abs(a-b),key:"ineq",short:"forgot it must be strictly greater",msg:"It has to be strictly "+(ask==="largest"?"less than "+(a+b):"greater than "+Math.abs(a-b))+". Equal makes a flat line, not a triangle."},{v:ask==="largest"?lo:hi,key:"ineq",short:"gave the other end of the range",msg:"That's the "+(ask==="largest"?"smallest":"largest")+" it could be. The question asks for the "+ask+"."}].filter(h=>h.v!==ans)};
  }
  const choices = shuffle([
    {text:"Four sides can be pushed into different quadrilaterals, but three sides make only one triangle.", ok:true},
    {text:"Three sides can make many different triangles, but four sides make only one quadrilateral.", key:"rigid", short:"backwards", msg:"It's the other way around. A triangle is rigid: three fixed sides lock into one shape. A quadrilateral can be squashed (think of a square leaning into a rhombus)."},
    {text:"Both make exactly one shape.", key:"rigid", short:"quadrilaterals aren't rigid", msg:"Four sticks hinged at the corners can lean over into different shapes. Three sticks can't."},
    {text:"Neither makes a fixed shape.", key:"rigid", short:"triangles are rigid", msg:"Three fixed side lengths make exactly one triangle. That's why triangles show up in bridges and roof trusses."}
  ]);
  return {q:story("You have four sticks hinged at the ends, and three other sticks hinged at the ends. Which is true?"), a:0, type:"choice", prompt:"Think about which shape can be squashed.", choices, review:"rigid triangle vs quadrilateral", steps:["Three side lengths make exactly one triangle (rigid). Four side lengths can be rearranged into different quadrilaterals (a square can lean into a rhombus)."]};
}

/* ---------- Level 5: triangle angles and how many triangles ---------- */
function genTriangles(){
  const t = pick(["sum","sum","howmany","howmany","howmany"]);
  if(t==="sum"){
    const a = ri(25,80), b = ri(25,80), c = 180-a-b;
    return {q:D.tri([deg(a),deg(b),"?"])+NOTE, review:"triangle with "+deg(a)+" and "+deg(b), a:c, suffix:"°", prompt:"Find the missing angle.",
      steps:["The three angles of any triangle add to 180°.", a+" + "+b+" = "+(a+b)+", so 180 − "+(a+b)+" = "+M(deg(c))],
      hints:[{v:360-a-b,key:"relation",short:"used 360",msg:"A triangle's angles add to 180°, not 360°."},{v:90-a-b,key:"relation",short:"used 90",msg:"A triangle's angles add to 180°."},{v:180-a,key:"missed",short:"left out one angle",msg:"Subtract both known angles."},{v:180-b,key:"missed",short:"left out one angle",msg:"Subtract both known angles."}].filter(h=>h.v!==c&&h.v>0)};
  }
  const kind = pick(["sss-ok","sss-no","aaa","aaa-no","asa","sas"]);
  let text, ans, why;
  if(kind==="sss-ok"){ const a = ri(3,9), b = ri(3,9), c = ri(Math.abs(a-b)+1, a+b-1); text = "side lengths "+a+", "+b+", and "+c; ans = "one"; why = "Three sides that satisfy the triangle rule ("+Math.min(a,b,c)+" + middle > "+Math.max(a,b,c)+") lock into exactly one triangle. You can flip or turn it, but it's the same triangle."; }
  else if(kind==="sss-no"){ const a = ri(2,6), b = ri(2,6), c = a+b+ri(0,3); text = "side lengths "+a+", "+b+", and "+c; ans = "none"; why = a+" + "+b+" = "+(a+b)+", which is not greater than "+c+". The two short sides can't reach, so no triangle."; }
  else if(kind==="aaa"){ const a = ri(30,80), b = ri(30,80); text = "angle measures "+a+"°, "+b+"°, and "+(180-a-b)+"°"; ans = "many"; why = "The angles add to 180°, so triangles exist, but nothing fixes the size: a tiny one and a huge one can have the same three angles. More than one triangle."; }
  else if(kind==="aaa-no"){ const a = ri(40,90), b = ri(50,100), c = 180-a-b+ri(10,40); text = "angle measures "+a+"°, "+b+"°, and "+c+"°"; ans = "none"; why = a+" + "+b+" + "+c+" = "+(a+b+c)+", not 180°. A triangle's angles must add to exactly 180°, so no triangle."; }
  else if(kind==="asa"){ const a = ri(30,70), b = ri(30,70), s = ri(4,10); text = "angles of "+a+"° and "+b+"° with a side of length "+s+" between them"; ans = "one"; why = "Two angles and the side between them pin everything down: the third angle is forced ("+(180-a-b)+"°), and the side's length fixes the size. Exactly one triangle."; }
  else { const a = ri(3,9), b = ri(3,9), ang = ri(30,120); text = "sides of "+a+" and "+b+" with a "+ang+"° angle between them"; ans = "one"; why = "Two sides with the angle between them: the third side is forced to connect the two free ends. Exactly one triangle."; }
  const choices = shuffle([
    {text:"Exactly one triangle", ok:ans==="one", key:"unique", short:"how many triangles", msg:why},
    {text:"More than one triangle", ok:ans==="many", key:"unique", short:"how many triangles", msg:why},
    {text:"No triangle", ok:ans==="none", key:"unique", short:"how many triangles", msg:why}
  ]);
  choices.push({text:"Can't tell without drawing it", key:"unique", short:"reasoning without drawing", msg:why});
  return {q:story("How many different triangles have <b>"+text+"</b>?"), a:0, type:"choice", prompt:"Exactly one, more than one, or none?", choices, review:text, steps:[why]};
}

/* ---------- Levels 6–7: volume and surface area of right prisms ---------- */
function genVolume(){
  const t = pick(["rect","rect","tri","composite","basearea"]);
  if(t==="rect"){
    const l = ri(3,12), w = ri(2,9), h = ri(2,10), v = l*w*h;
    return {q:D.box(l,w,h,[l+" cm",w+" cm",h+" cm"]), review:"box "+l+" × "+w+" × "+h+" cm", a:v, suffix:"cm³", prompt:"Find the volume.",
      steps:["Volume of a prism = area of the base × height.", "Base: "+l+" × "+w+" = "+(l*w)+" cm². Height: "+h+" cm.", (l*w)+" × "+h+" = "+M(v+" cm³")],
      hints:[{v:l+w+h,key:"added",short:"added the dimensions",msg:"Volume multiplies: length × width × height."},{v:2*(l*w+l*h+w*h),key:"vs-sa",short:"found surface area instead",msg:"That's the surface area (the outside). Volume is the space inside: l × w × h."},{v:l*w,key:"divide",short:"stopped at the base area",msg:"That's the base area. Multiply by the height."}].filter(h=>h.v!==v)};
  }
  if(t==="tri"){
    const b = ri(4,12), hb = ri(3,10), H = ri(4,15), B = b*hb/2, v = B*H;
    if(B!==Math.floor(B)) return genVolume();
    return {q:story("A right prism has a <b>triangular</b> base. The triangle has a base of <b>"+b+" cm</b> and a height of <b>"+hb+" cm</b>. The prism is <b>"+H+" cm</b> tall. What is its volume?"), review:"triangular prism, base "+b+"×"+hb+"/2, height "+H, a:v, suffix:"cm³", wide:true, prompt:"Base area first, then × height.",
      steps:["Area of the triangle base: ½ × "+b+" × "+hb+" = "+B+" cm².", "Volume = base area × height = "+B+" × "+H+" = "+M(v+" cm³")],
      hints:[{v:b*hb*H,key:"half",short:"forgot the ½ for the triangle",msg:"A triangle's area is ½ × base × height. Without the ½ you've got a rectangular box."},{v:B,key:"divide",short:"stopped at the base area",msg:"That's the triangle's area. Multiply by the prism's height "+H+"."},{v:b+hb+H,key:"added",short:"added instead",msg:"Volume multiplies."}].filter(h=>h.v!==v)};
  }
  if(t==="composite"){
    const L = ri(6,12), W = ri(4,8), cut1 = ri(2,L-3), cut2 = ri(2,W-2), H = ri(2,8);
    const A = L*W - cut1*cut2, v = A*H;
    return {q:story("The base of a right prism is an <b>L-shape</b>: a <b>"+L+" by "+W+"</b> rectangle with a <b>"+cut1+" by "+cut2+"</b> corner cut out. The prism is <b>"+H+" cm</b> tall. What is its volume?"), review:"L-shaped base "+L+"×"+W+" minus "+cut1+"×"+cut2+", height "+H, a:v, suffix:"cm³", wide:true, prompt:"Find the base area by taking away the cut-out, then × height.",
      steps:["Base area: the full rectangle minus the corner. "+L+" × "+W+" = "+(L*W)+", and "+cut1+" × "+cut2+" = "+(cut1*cut2)+", so "+(L*W)+" − "+(cut1*cut2)+" = "+A+" cm².", "Volume = base area × height = "+A+" × "+H+" = "+M(v+" cm³")],
      hints:[{v:L*W*H,key:"missed",short:"forgot the cut-out",msg:"The corner is missing, so subtract "+cut1+" × "+cut2+" from the base before multiplying by the height."},{v:A,key:"divide",short:"stopped at the base area",msg:"That's the base area. Multiply by the height."},{v:(L*W+cut1*cut2)*H,key:"missed",short:"added the cut-out instead",msg:"The corner is removed, so subtract it."}].filter(h=>h.v!==v)};
  }
  const B = pick([12,15,18,20,24,30,36]), H = ri(3,12), v = B*H;
  return {q:story("A right prism has a base with an area of <b>"+B+" cm²</b> and a height of <b>"+H+" cm</b>. What is its volume?"), review:"base area "+B+", height "+H, a:v, suffix:"cm³", wide:true, prompt:"The base shape doesn't matter here.",
    steps:["Volume = base area × height, whatever shape the base is.", B+" × "+H+" = "+M(v+" cm³")],
    hints:[{v:B+H,key:"added",short:"added instead of multiplying",msg:"Stack "+H+" layers of "+B+" cm² each: multiply."},{v:B*H/2,key:"half",short:"halved it",msg:"The base area is already given, so no ½ here."}].filter(h=>h.v!==v)};
}
function genSurface(){
  const t = pick(["rect","rect","tri","cube"]);
  if(t==="cube"){ const s = ri(2,9), sa = 6*s*s; return {q:story("A cube has edges of <b>"+s+" cm</b>. What is its surface area?"), review:"cube, edge "+s, a:sa, suffix:"cm²", wide:true, prompt:"How many faces, and what's each one?", steps:["A cube has 6 identical square faces.", "Each face: "+s+" × "+s+" = "+(s*s)+" cm². Six of them: 6 × "+(s*s)+" = "+M(sa+" cm²")], hints:[{v:s*s*s,key:"vs-sa",short:"found volume instead",msg:"That's the volume (inside). Surface area is the six faces added up."},{v:s*s,key:"faces",short:"counted one face",msg:"There are 6 faces."},{v:4*s*s,key:"faces",short:"forgot the top and bottom",msg:"6 faces, not 4."}].filter(h=>h.v!==sa)}; }
  if(t==="rect"){
    const l = ri(3,10), w = ri(2,8), h = ri(2,9), sa = 2*(l*w+l*h+w*h);
    return {q:D.box(l,w,h,[l+" cm",w+" cm",h+" cm"]), review:"box "+l+" × "+w+" × "+h, a:sa, suffix:"cm²", prompt:"Find the surface area.",
      steps:["Picture the net: 6 rectangles in 3 matching pairs.", "Front/back: "+l+" × "+h+" = "+(l*h)+" each. Top/bottom: "+l+" × "+w+" = "+(l*w)+" each. Sides: "+w+" × "+h+" = "+(w*h)+" each.", "2 × ("+(l*h)+" + "+(l*w)+" + "+(w*h)+") = 2 × "+(l*h+l*w+w*h)+" = "+M(sa+" cm²")],
      hints:[{v:l*w*h,key:"vs-sa",short:"found volume instead",msg:"That's the volume (the inside). Surface area adds up the faces on the outside."},{v:l*w+l*h+w*h,key:"faces",short:"forgot to double",msg:"Each face has a matching one on the opposite side. Double it."},{v:2*(l*h+w*h),key:"faces",short:"forgot the top and bottom",msg:"Six faces: include the top and bottom ("+l+" × "+w+" each)."},{v:2*(l*w+l*h+w*h)-2*w*h,key:"faces",short:"left out a pair of faces",msg:"Count all three pairs of faces."}].filter(h=>h.v!==sa)};
  }
  const [a,b,c] = pick([[3,4,5],[6,8,10],[5,12,13],[9,12,15]]), H = ri(3,10), base = a*b/2, sa = 2*base + (a+b+c)*H;
  return {q:story("A right prism has a <b>right-triangle</b> base with legs <b>"+a+"</b> and <b>"+b+"</b> and a hypotenuse of <b>"+c+"</b> (all in cm). The prism is <b>"+H+" cm</b> tall. What is its surface area?"), review:"triangular prism "+a+"-"+b+"-"+c+" base, height "+H, a:sa, suffix:"cm²", wide:true, prompt:"Two triangles plus three rectangles.",
    steps:["The two triangle ends: ½ × "+a+" × "+b+" = "+base+" each, so "+(2*base)+" together.", "The three rectangular sides all have height "+H+". Their widths are the triangle's sides, so their total area is (perimeter) × height = ("+a+" + "+b+" + "+c+") × "+H+" = "+((a+b+c)*H)+".", (2*base)+" + "+((a+b+c)*H)+" = "+M(sa+" cm²")],
    hints:[{v:base*H,key:"vs-sa",short:"found volume instead",msg:"That's the volume. Surface area is the two triangles plus the three rectangles around the outside."},{v:base+(a+b+c)*H,key:"faces",short:"counted one triangle",msg:"There are two triangle ends."},{v:2*base+(a+b)*H,key:"faces",short:"missed the hypotenuse face",msg:"Three rectangles: one for each side of the triangle, including the "+c+" side."}].filter(h=>h.v!==sa)};
}

/* ---------- Level 8: volume or surface area? ---------- */
const SITUATIONS = [
  ["painting the outside of a toy chest","sa"],["wrapping a present","sa"],["how much water fills an aquarium","v"],["how much sand fits in a sandbox","v"],["buying tiles to cover the walls and floor of a pool","sa"],["how much cereal a box holds","v"],["covering a box with wallpaper","sa"],["how much concrete to pour for a rectangular step","v"],["how much cardboard it takes to make a box","sa"],["how much air is inside a tent","v"],["putting a label all the way around a can-shaped prism","sa"],["how many sugar cubes fit in a jar","v"]
];
function genWhich(){
  if(Math.random()<0.6){
    const s = pick(SITUATIONS), isV = s[1]==="v";
    const choices = shuffle([{text:"Volume",ok:isV,key:"vs-sa",short:"volume vs surface area",msg:isV?"":"This is about covering the outside: surface area."},{text:"Surface area",ok:!isV,key:"vs-sa",short:"volume vs surface area",msg:isV?"This is about how much fits INSIDE: volume.":""},{text:"Perimeter",key:"vs-sa",short:"perimeter",msg:"Perimeter is a distance around a flat shape. This is a 3-D situation."},{text:"Both are the same thing",key:"vs-sa",short:"volume vs surface area",msg:"Volume is the space inside (cubic units). Surface area is the covering on the outside (square units)."}]);
    return {q:story("Which do you need to figure out <b>"+s[0]+"</b>?"), a:0, type:"choice", prompt:"Inside, or outside?", choices, review:s[0], steps:[isV?"Filling or holding something means the space inside: volume, measured in cubic units.":"Covering, painting, or wrapping is about the outside faces: surface area, measured in square units."]};
  }
  const l = ri(3,8), w = ri(2,6), h = ri(2,6), isV = Math.random()<0.5;
  const ans = isV ? l*w*h : 2*(l*w+l*h+w*h);
  const q = isV ? "A toy box is <b>"+l+" ft</b> long, <b>"+w+" ft</b> wide, and <b>"+h+" ft</b> tall. How many cubic feet of blocks can it hold?" : "A toy box is <b>"+l+" ft</b> long, <b>"+w+" ft</b> wide, and <b>"+h+" ft</b> tall. How many square feet of paint cover the whole outside?";
  return {q:story(q), review:(isV?"volume":"surface area")+" of "+l+"×"+w+"×"+h+" box", a:ans, suffix:isV?"ft³":"ft²", wide:true, prompt:"Decide: inside or outside? Then compute.",
    steps:[isV?"“Can it hold” means the inside: volume.":"“Paint the outside” means the faces: surface area.", isV ? l+" × "+w+" × "+h+" = "+M(ans+" ft³") : "2 × ("+l+"×"+w+" + "+l+"×"+h+" + "+w+"×"+h+") = 2 × "+(l*w+l*h+w*h)+" = "+M(ans+" ft²")],
    hints:[{v:isV?2*(l*w+l*h+w*h):l*w*h,key:"vs-sa",short:"mixed up volume and surface area",msg:isV?"Holding blocks is about the inside: volume = l × w × h.":"Painting is about the outside: add up all six faces."},{v:l+w+h,key:"added",short:"added the dimensions",msg:"Neither volume nor surface area is a plain sum of the three lengths."}].filter(h=>h.v!==ans)};
}
function genMixed(){ return pick([genBasics,genVertical,genEquation,genInequality,genTriangles,genVolume,genSurface,genWhich,genEquation,genVolume])(); }

const lesson = [
 {h:"Angle words you need", body:'<div class="rules"><div class="rule"><b>Right angle</b>exactly 90° (the square corner)</div><div class="rule"><b>Straight angle</b>exactly 180° (a straight line)</div><div class="rule"><b>Acute / obtuse</b>less than 90° / between 90° and 180°</div><div class="rule"><b>Adjacent angles</b>next to each other, sharing a side</div><div class="rule"><b>Complementary</b>two angles that add to <strong>90°</strong></div><div class="rule"><b>Supplementary</b>two angles that add to <strong>180°</strong></div><div class="rule"><b>Vertical angles</b>across from each other where two lines cross: always <strong>equal</strong></div></div><p class="sub" style="margin-top:8px">Memory trick: C comes before S in the alphabet, and 90 comes before 180.</p>'},
 {h:"Two lines crossing", body:D.cross(60,["60°","120°","60°","120°"])+'<p>Across from each other: equal (vertical). Next to each other: add to 180° (they make a straight line). So one angle tells you all four.</p>'},
 {h:"Unknown angles: write the equation", body:'<p>When an angle is an expression like (3x + 10)°, the picture tells you the equation.</p><div class="ex"><span>(3x + 10)° and 50° make a straight line</span><span class="m">3x + 10 + 50 = 180</span><span class="m">3x + 60 = 180 → 3x = 120 → x = 40</span><span class="sub">Check: 3(40) + 10 = 130, and 130 + 50 = 180 ✓</span></div><div class="trap"><b>Trap:</b> the question usually asks for x, not the angle. Read it twice. And vertical angles use “=”, not 180.</div>'},
 {h:"Triangles: the two rules", body:'<div class="rules"><div class="rule"><b>Side rule (triangle inequality)</b>The two shorter sides must add to MORE than the longest side. 3, 4, 8: 3 + 4 = 7, not more than 8, so no triangle.</div><div class="rule"><b>Angle rule</b>The three angles always add to exactly 180°.</div></div><p style="margin-top:10px"><strong>How many triangles?</strong> Three sides that pass the side rule → exactly one. Two angles and the side between them → exactly one. Two sides and the angle between them → exactly one. Three angles only → more than one (any size). Angles that don\'t add to 180, or sides that fail the side rule → none.</p><p class="sub">Three hinged sticks are rigid; four hinged sticks can be squashed into different quadrilaterals.</p>'},
 {h:"Prisms: volume and surface area", body:'<div class="rules"><div class="rule"><b>Volume = base area × height</b>Whatever the base shape. Rectangle base: l × w × h. Triangle base: (½ × b × h) × height. L-shaped base: find the base area by cutting it into rectangles (or subtracting the missing corner), then × height. Units are cubic (cm³).</div><div class="rule"><b>Surface area = all the faces added up</b>Picture the net. A box has 3 pairs of matching rectangles: 2(lw + lh + wh). A triangular prism: 2 triangles + the 3 rectangles around (perimeter × height). Units are square (cm²).</div></div><div class="kw" style="margin-top:12px"><div><b>V</b>fills, holds, fits inside, how much water/sand/air</div><div><b>SA</b>paint, wrap, cover, cardboard, tiles, label</div></div>'},
 {h:"Typing answers here", body:'<p>Type just the number: <strong>35</strong> for 35°, <strong>120</strong> for 120 cm³. For “solve for x” problems, type the value of x. Multiple-choice questions are click-to-answer.</p>'}
];

window.PRACTICE = {
  id:"noah-math-angles", student:"Noah",
  title:"Angles, Triangles, Prisms", intro:"Math 7 Plus, Unit 3. Levels follow the class lessons, so jump to whichever one matches this week.",
  prompt:"Find the answer.", label:"", placeholder:"?",
  setSize:10, passAt:8,
  mistakeNames:{ninety:"90° vs 180° mixed up",vertical:"Vertical vs next-door angles",missed:"Left out an angle",relation:"Wrong total in the equation",undo:"Same operation instead of the opposite",divide:"Stopped one step early",answerx:"Gave the angle instead of x",sign:"Sign slips",type:"Angle type",ineq:"Triangle side rule",rigid:"Rigid triangles",unique:"How many triangles",added:"Added instead of multiplied",half:"Forgot the ½ for triangles",faces:"Miscounted faces","vs-sa":"Volume vs surface area"},
  levels:[
    {name:"Angle basics", desc:"Lessons 1–2: right, straight, complementary, supplementary", gen:genBasics},
    {name:"Crossing lines", desc:"Lessons 3–4: vertical angles, multi-step", gen:genVertical},
    {name:"Equations for angles", desc:"Lesson 5: (3x + 10)° and friends", gen:genEquation},
    {name:"Can these sides make a triangle?", desc:"Lessons 6–7: the side rule", gen:genInequality},
    {name:"How many triangles?", desc:"Lessons 8–10: angle sum, one / many / none", gen:genTriangles},
    {name:"Volume of prisms", desc:"Lessons 11–12: base area × height", gen:genVolume},
    {name:"Surface area", desc:"Lesson 13: picture the net", gen:genSurface},
    {name:"Volume or surface area?", desc:"Lessons 14–15: real situations", gen:genWhich},
    {name:"Test run", desc:"Everything mixed", gen:genMixed}
  ],
  lesson
};
})();
