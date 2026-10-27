/* Small SVG drawings shared by the kids' practice content: coins, clocks, mini bar charts. */
window.DRAW = (function(){
  const COIN = {
    q:{name:"quarter",v:25,r:34,fill:"#D7DBE1",edge:"#8E949C",text:"#3D434C"},
    d:{name:"dime",v:10,r:26,fill:"#DDE1E6",edge:"#8E949C",text:"#3D434C"},
    n:{name:"nickel",v:5,r:31,fill:"#CFD4DA",edge:"#858B93",text:"#3D434C"},
    p:{name:"penny",v:1,r:28,fill:"#D9925E",edge:"#9C5A2C",text:"#4A2A12"}
  };
  function coin(k){
    const c = COIN[k];
    return '<svg class="'+k+'" viewBox="0 0 72 72" role="img" aria-label="'+c.name+'"><circle cx="36" cy="36" r="'+c.r+'" fill="'+c.fill+'" stroke="'+c.edge+'" stroke-width="3"/><circle cx="36" cy="36" r="'+(c.r-6)+'" fill="none" stroke="'+c.edge+'" stroke-width="1" opacity=".5"/><text x="36" y="40" text-anchor="middle" font-family="system-ui,sans-serif" font-size="'+(k==="d"?"11":"12")+'" font-weight="700" fill="'+c.text+'">'+c.name+'</text></svg>';
  }
  function coins(list){ return '<div class="coins">'+list.map(coin).join("")+'</div>'; }
  function clock(h,m){
    const mi = m*6, hr = (h%12)*30 + m*0.5;
    const pt = (deg,len)=>{ const a = (deg-90)*Math.PI/180; return 'x2="'+(100+len*Math.cos(a)).toFixed(1)+'" y2="'+(100+len*Math.sin(a)).toFixed(1)+'"'; };
    let s = '<svg class="clock" viewBox="0 0 200 200" role="img" aria-label="clock"><circle cx="100" cy="100" r="94" fill="#FFFDF7" stroke="#2C2C2A" stroke-width="4"/>';
    for(let i=0;i<60;i++){ const a=(i*6-90)*Math.PI/180, big=i%5===0, r1=big?80:86; s += '<line x1="'+(100+r1*Math.cos(a)).toFixed(1)+'" y1="'+(100+r1*Math.sin(a)).toFixed(1)+'" x2="'+(100+90*Math.cos(a)).toFixed(1)+'" y2="'+(100+90*Math.sin(a)).toFixed(1)+'" stroke="#2C2C2A" stroke-width="'+(big?3:1)+'"/>'; }
    for(let n=1;n<=12;n++){ const a=(n*30-90)*Math.PI/180; s += '<text x="'+(100+66*Math.cos(a)).toFixed(1)+'" y="'+(100+66*Math.sin(a)+7).toFixed(1)+'" text-anchor="middle" font-family="system-ui,sans-serif" font-size="20" font-weight="700" fill="#2C2C2A">'+n+'</text>'; }
    s += '<line x1="100" y1="100" '+pt(hr,44)+' stroke="#2C2C2A" stroke-width="8" stroke-linecap="round"/>';
    s += '<line x1="100" y1="100" '+pt(mi,70)+' stroke="#2742B8" stroke-width="5" stroke-linecap="round"/>';
    s += '<circle cx="100" cy="100" r="6" fill="#2C2C2A"/></svg>';
    return s;
  }
  function bars(items){
    const max = Math.max.apply(null, items.map(i=>i.n));
    return '<div class="minibars">'+items.map(i=>'<div><b>'+i.n+'</b><i style="height:'+Math.round(i.n/max*90)+'px;background:'+(i.color||"var(--accent)")+'"></i><span>'+i.label+'</span></div>').join("")+'</div>';
  }
  function numberLine(op,n,opts){
    opts = opts||{}; const lo = n-5, hi = n+5, W = 320, pad = 18, step = (W-2*pad)/10;
    const X = v => pad + (v-lo)*step;
    const right = op===">"||op===">=", closed = op==="<="||op===">=";
    let s = '<svg class="nline" viewBox="0 0 '+W+' 56" role="img" aria-label="number line"><line x1="4" y1="24" x2="'+(W-4)+'" y2="24" stroke="currentColor" stroke-width="2"/>';
    s += '<polygon points="4,24 12,19 12,29" fill="currentColor"/><polygon points="'+(W-4)+',24 '+(W-12)+',19 '+(W-12)+',29" fill="currentColor"/>';
    for(let v=lo; v<=hi; v++){ s += '<line x1="'+X(v)+'" y1="18" x2="'+X(v)+'" y2="30" stroke="currentColor" stroke-width="1.5"/><text x="'+X(v)+'" y="48" text-anchor="middle" font-size="12" fill="currentColor">'+String(v).replace("-","−")+'</text>'; }
    const col = opts.color||"#2742B8";
    s += '<line x1="'+X(n)+'" y1="24" x2="'+(right?W-10:10)+'" y2="24" stroke="'+col+'" stroke-width="6" stroke-linecap="round"/>';
    s += '<polygon points="'+(right?(W-4)+',24 '+(W-14)+',17 '+(W-14)+',31':'4,24 14,17 14,31')+'" fill="'+col+'"/>';
    s += '<circle cx="'+X(n)+'" cy="24" r="7" fill="'+(closed?col:"#FFFFFF")+'" stroke="'+col+'" stroke-width="3"/>';
    return s+'</svg>';
  }
  /* geometry figures for the angles unit: all use currentColor so they work in both themes */
  const P = (cx,cy,deg,r)=>[cx+r*Math.cos(-deg*Math.PI/180), cy+r*Math.sin(-deg*Math.PI/180)];
  const txt = (x,y,t,size)=>'<text x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" text-anchor="middle" dominant-baseline="middle" font-family="system-ui,sans-serif" font-size="'+(size||15)+'" font-weight="700" fill="currentColor">'+t+'</text>';
  const ray = (cx,cy,deg,r)=>{ const [x,y]=P(cx,cy,deg,r); return '<line x1="'+cx+'" y1="'+cy+'" x2="'+x.toFixed(1)+'" y2="'+y.toFixed(1)+'" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>'; };
  const arc = (cx,cy,a0,a1,r)=>{ const [x0,y0]=P(cx,cy,a0,r),[x1,y1]=P(cx,cy,a1,r); return '<path d="M'+x0.toFixed(1)+' '+y0.toFixed(1)+' A'+r+' '+r+' 0 '+((a1-a0)>180?1:0)+' 0 '+x1.toFixed(1)+' '+y1.toFixed(1)+'" fill="none" stroke="#2742B8" stroke-width="2.5"/>'; };
  /* rays at the given directions (degrees, counter-clockwise from east); labels[i] sits between rays i and i+1 */
  function fan(dirs, labels, opts){
    opts = opts||{}; const W = opts.w||320, H = opts.h||200, cx = opts.cx||160, cy = opts.cy||150, R = opts.r||120;
    let s = '<svg class="fig" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="angle diagram">';
    dirs.forEach(d=>{ s += ray(cx,cy,d,R); });
    labels.forEach((lab,i)=>{ if(!lab) return; const a0 = dirs[i], a1 = dirs[i+1]!==undefined?dirs[i+1]:dirs[0]+360; const mid = (a0+a1)/2; const [x,y] = P(cx,cy,mid, 52); s += arc(cx,cy,a0,a1,30+8*i) + txt(x,y,lab); });
    s += '<circle cx="'+cx+'" cy="'+cy+'" r="4" fill="currentColor"/></svg>';
    return s;
  }
  const angle = (a,label)=>fan([0,a],[label!==undefined?label:a+"°"],{h:a>100?210:170,cy:a>100?170:140});
  const onLine = (angles,labels)=>{ const dirs=[0]; let acc=0; angles.slice(0,-1).forEach(x=>{ acc+=x; dirs.push(acc); }); dirs.push(180); return fan(dirs,labels,{h:180,cy:150,cx:160,r:140}); };
  const cross = (a,labels)=>fan([0,a,180,180+a],labels,{h:260,cy:130,cx:160,r:120});
  function tri(labels, opts){
    const pts = (opts&&opts.pts)||[[40,180],[280,180],[120,40]];
    let s = '<svg class="fig" viewBox="0 0 320 210" role="img" aria-label="triangle"><polygon points="'+pts.map(p=>p.join(",")).join(" ")+'" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>';
    const off = [[28,-14],[-28,-14],[2,30]];
    labels.forEach((l,i)=>{ if(l) s += txt(pts[i][0]+off[i][0], pts[i][1]+off[i][1], l, 14); });
    if(opts&&opts.sides) opts.sides.forEach((l,i)=>{ if(!l) return; const a=pts[i], b=pts[(i+1)%3]; const mx=(a[0]+b[0])/2, my=(a[1]+b[1])/2; const nx=-(b[1]-a[1]), ny=(b[0]-a[0]); const n=Math.hypot(nx,ny); s += txt(mx+nx/n*16, my+ny/n*16, l, 13); });
    return s+'</svg>';
  }
  function box(l,w,h,labels){
    const d = 36; const x0=60,y0=70,W=150,Hh=90;
    let s = '<svg class="fig" viewBox="0 0 320 210" role="img" aria-label="rectangular prism">';
    const f = (x,y)=>'<rect x="'+x+'" y="'+y+'" width="'+W+'" height="'+Hh+'" fill="none" stroke="currentColor" stroke-width="2.5"/>';
    s += f(x0+d,y0-d) + f(x0,y0);
    [[x0,y0],[x0+W,y0],[x0,y0+Hh],[x0+W,y0+Hh]].forEach(p=>{ s += '<line x1="'+p[0]+'" y1="'+p[1]+'" x2="'+(p[0]+d)+'" y2="'+(p[1]-d)+'" stroke="currentColor" stroke-width="2.5"/>'; });
    s += txt(x0+W/2, y0+Hh+22, labels[0]) + txt(x0+W+d+14, y0+Hh-10, labels[1], 13) + txt(x0-26, y0+Hh/2, labels[2]);
    return s+'</svg>';
  }
  return {coin, coins, clock, bars, numberLine, fan, angle, onLine, cross, tri, box, COIN};
})();
