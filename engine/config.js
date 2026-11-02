/* Site-wide settings. `endpoint` is the Google Apps Script web app that logs progress to the family sheet.
   Leave it empty to keep progress on-device only. The read key is NOT stored here; it lives in the report bookmark. */
window.STUDY_CONFIG = { endpoint: "https://script.google.com/macros/s/AKfycbzjnGfKGbBzMrd3qASm94g1Uw2wmBGF0AeBWfZL6q7PvGumiViSQxk2lgBxEa2er-qr/exec" };

/* Header helper: every guide page shows "Student · Subject · Guide" so the subject is obvious at a glance.
   The subject comes from the folder name (noah/ela/word-parts → ELA). Engines call SITE.brand(student, guideTitle). */
window.SITE = (function(){
  const SUBJECTS = {"social-studies":["Social Studies","ss"], math:["Math","math"], ela:["ELA","ela"], science:["Science","sci"]};
  function subject(){ const seg = location.pathname.split("/").filter(Boolean); for(const s of seg){ if(SUBJECTS[s]) return SUBJECTS[s]; } return null; }
  function brand(student, title){
    const el = document.querySelector(".brand"); const sub = subject(); if(!el) return sub;
    const icon = el.querySelector(".icon");
    el.textContent = ""; if(icon) el.appendChild(icon);
    el.appendChild(document.createTextNode(student+" "));
    const s1 = document.createElement("span"); s1.textContent = "· "+(sub?sub[0]:"Study"); el.appendChild(s1);
    const s2 = document.createElement("span"); s2.className = "guidename"; s2.textContent = "· "+title; el.appendChild(s2);
    if(sub) el.classList.add(sub[1]);
    return sub;
  }
  return {subject, brand};
})();
