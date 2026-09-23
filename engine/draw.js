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
  return {coin, coins, clock, bars, COIN};
})();
