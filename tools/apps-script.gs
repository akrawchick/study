/* Krawchick Study — progress log.
   Lives in Google Apps Script attached to the "Study log" sheet. Deployed as a web app (execute as me, anyone can access).
   POST: a study page sends one JSON record per finished activity → appended as a row.
   GET ?k=KEY[&student=noah]: returns the rows as JSON for the report page and the Sunday brief. */
const KEY = "PASTE-KEY-HERE";
const COLS = ["ts","student","guide","title","kind","label","level","score","total","seconds","mistakes","device"];

function doPost(e){
  try{
    const d = JSON.parse(e.postData.contents);
    sheet().appendRow(COLS.map(c => c==="ts" ? (d.ts || new Date().toISOString()) : (d[c] === undefined || d[c] === null ? "" : d[c])));
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
