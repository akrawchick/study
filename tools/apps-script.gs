/* Krawchick Study — progress log + alerts.
   Lives in Google Apps Script attached to the "Study log" sheet. Deployed as a web app (execute as me, anyone can access).
   POST: a study page sends one JSON record per finished activity → appended as a row, and an alert email goes out if it was a poor result.
   GET ?k=KEY[&student=noah]: returns the rows as JSON for the report page and the Sunday brief. */
const KEY = "PASTE-KEY-HERE";
const COLS = ["ts","student","guide","title","kind","label","level","score","total","seconds","mistakes","device"];
const ALERT = {
  to: "alex@krawchick.com",
  minQuestions: 8,      // ignore tiny warm-ups
  below: 0.6,           // any set or quiz under 60% → alert
  testBelow: 0.7,       // a practice test or test run under 70% → alert
  perGuidePerHours: 12, // at most one alert per guide per 12 hours
  report: "https://study.krawchick.com/noah/report/?k=" + KEY
};

function doPost(e){
  try{
    const d = JSON.parse(e.postData.contents);
    sheet().appendRow(COLS.map(c => c==="ts" ? (d.ts || new Date().toISOString()) : (d[c] === undefined || d[c] === null ? "" : d[c])));
    try{ maybeAlert(d); }catch(err){ /* never let an alert problem block logging */ }
    return ContentService.createTextOutput("ok");
  }catch(err){ return ContentService.createTextOutput("bad: "+err); }
}
function doGet(e){
  const p = e.parameter || {};
  if((p.k||"") !== KEY) return ContentService.createTextOutput("no").setMimeType(ContentService.MimeType.TEXT);
  const v = sheet().getDataRange().getValues(); const head = v.shift();
  const rows = v.filter(r => !p.student || String(r[1]) === p.student)
    .map(r => { const o = {}; head.forEach((h,i)=>{ o[h] = r[i] instanceof Date ? r[i].toISOString() : r[i]; }); return o; });
  return ContentService.createTextOutput(JSON.stringify({rows})).setMimeType(ContentService.MimeType.JSON);
}
function sheet(){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName("log");
  if(!sh){ sh = ss.insertSheet("log"); sh.appendRow(COLS); sh.setFrozenRows(1); }
  return sh;
}
function maybeAlert(d){
  const total = Number(d.total), score = Number(d.score);
  if(!(total >= ALERT.minQuestions) || isNaN(score)) return;
  if(d.kind !== "set" && d.kind !== "quiz") return;
  const isTest = /practice test|test run|final/i.test(String(d.label||""));
  const pctv = score/total;
  if(!(pctv < (isTest ? ALERT.testBelow : ALERT.below))) return;
  const props = PropertiesService.getScriptProperties(), k = "alert:"+d.student+":"+d.guide, last = Number(props.getProperty(k)||0);
  if(Date.now() - last < ALERT.perGuidePerHours*3600*1000) return;
  props.setProperty(k, String(Date.now()));
  const when = Utilities.formatDate(new Date(d.ts||Date.now()), Session.getScriptTimeZone(), "EEE MMM d, h:mm a");
  const mins = Math.round(Number(d.seconds||0)/60);
  const subject = "Study alert: "+d.student+" "+score+"/"+total+" on "+d.title+(d.label?" ("+d.label+")":"");
  const html = "<p><b>"+d.student+"</b> just finished <b>"+d.title+"</b>"+(d.label?" · "+d.label:"")+" with <b>"+score+" of "+total+"</b> ("+Math.round(pctv*100)+"%)"+(isTest?" on a practice test":"")+".</p>"+
    "<p>"+when+" · about "+mins+" minute"+(mins===1?"":"s")+" of active work"+(d.device?" · "+d.device:"")+".</p>"+
    (d.mistakes ? "<p>Mistake patterns: "+d.mistakes+"</p>" : "")+
    (mins > 0 && mins < 2 ? "<p>Under two minutes with a low score usually means clicking through rather than working through.</p>" : "")+
    "<p><a href=\""+ALERT.report+"\">Open the full report</a></p>";
  MailApp.sendEmail({to: ALERT.to, subject: subject, htmlBody: html});
}

/* Run this once from the editor (Run ▸ testAlert) to grant the mail permission and send yourself a sample alert. */
function testAlert(){
  PropertiesService.getScriptProperties().deleteProperty("alert:Test:test");
  maybeAlert({ts:new Date().toISOString(), student:"Test", guide:"test", title:"Alert check", kind:"set", label:"Test run", level:7, score:3, total:10, seconds:90, mistakes:"Symbol pointing the wrong way ×3, Sign slips ×2", device:"Mac"});
  Logger.log("Alert email sent to "+ALERT.to);
}
