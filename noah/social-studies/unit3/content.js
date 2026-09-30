/* Noah · Unit 3: Age of Colonization · test date not announced yet (tbd), plan starts Thu Oct 1, 2026 */
window.GUIDE = {
  id: "noah-unit3",
  student: "Noah",
  subject: "Unit 3",
  start: "2026-10-01",
  tbd: true,               // no test date yet: the last day is a checkpoint. When the date is announced, remove this and stretch the schedule.
  days: [
    {title:"Building empires", kind:"learn"},
    {title:"People, land and religion", kind:"learn"},
    {title:"Trade goes global", kind:"learn"},
    {title:"The big picture", kind:"connect"},
    {title:"Review day 1", kind:"review"},
    {title:"Review day 2", kind:"final"},
    {title:"Checkpoint", kind:"test"}
  ],
  groups: [
    {key:"E", name:"Empires"},
    {key:"P", name:"People and land"},
    {key:"T", name:"Global trade"}
  ],

  /* day = which learn day (1-based) the card opens on. kind: person | place | idea. auto:false = no auto-generated questions. */
  terms: [
    {id:"colonization",day:1,group:"E",kind:"idea",term:"Colonization",
     def:"The claiming and settlement of foreign territories for the purpose of gaining resources for the mother country.",
     short:"Claiming foreign lands for resources",
     hook:"Colonization is the action; a colony is the place you end up with. The “mother country” is the one doing the claiming, like Spain or England."},
    {id:"colony",day:1,group:"E",kind:"idea",term:"Colony",
     def:"A territory that is under political control of another country",
     short:"Territory controlled by another country",
     hook:"Think of an ant colony far from the queen: it lives on its own land but still answers to her. The 13 colonies answered to England."},
    {id:"conquistador",day:1,group:"E",kind:"idea",term:"Conquistador",
     def:"A Spanish conqueror in the Americas",
     short:"Spanish conqueror in the Americas",
     hook:"Conquistador sounds like “conquer.” Famous ones: Cortés (took the Aztec Empire) and Pizarro (took the Inca Empire)."},
    {id:"encomienda",day:1,group:"E",kind:"idea",term:"Encomienda",
     def:"A system in which the Spanish king gave Spanish settlers the right to the labor of the Native Americans who lived in a particular area",
     short:"Spanish settlers given rights to Native labor",
     hook:"Encomienda comes from the Spanish word for “entrust.” The king “entrusted” Native people to settlers, who forced them to work. Spanish word = Spanish system."},

    {id:"indigenous",day:2,group:"P",kind:"idea",term:"Indigenous",
     def:"An original or native area where a person lives; the native populations of a country are called indigenous people.",
     short:"Native to a place; the original people",
     hook:"Indigenous = in the land first. The Aztec, Inca, and Taíno were indigenous to the Americas."},
    {id:"missionary",day:2,group:"P",kind:"idea",term:"Missionary",
     def:"A person sent to a foreign country to do religious work like convince people to join a religion or to help people that are sick, etc.",
     short:"Sent abroad to spread a religion",
     hook:"A missionary is on a mission for their religion."},
    {id:"resources",day:2,group:"P",kind:"idea",term:"Natural resources",plural:true,
     def:"Items that come from nature; they are not man made",
     short:"Useful things from nature, not man-made",
     hook:"Gold, silver, timber, furs, and farmland. Natural resources are what colonizers came for."},
    {id:"exploitation",day:2,group:"P",kind:"idea",term:"Exploitation",
     def:"The action of treating someone unfairly in order to benefit from their work and making use of and benefiting from natural resources",
     short:"Unfairly using people or resources for profit",
     hook:"Exploit = take advantage of. The encomienda system exploited indigenous people; mines exploited the land."},

    {id:"globalization",day:3,group:"T",kind:"idea",term:"Globalization",
     def:"The development of an increasingly integrated global economy through trade, finances, and communication.",
     short:"World economies becoming connected",
     hook:"Global = the whole globe. Your phone's parts come from many countries: that's globalization. It started with colonial trade routes."},
    {id:"dutch",day:3,group:"T",kind:"place",article:"the",term:"Dutch East India Company",
     def:"A company from the Netherlands that was primarily interested in trading with India for spices, indigo, and other natural resources",
     short:"Netherlands company trading in Asia for spices",
     hook:"Dutch = from the Netherlands. East India = where they went to trade for spices."},
    {id:"triangular",day:3,group:"T",kind:"place",article:"the",term:"Triangular Trade Route",
     def:"A massive trading system between Europe, Africa, and the Americas. Europe provided luxury items, guns, and alcohol to Africa and the Americas. Africa provided slaves to the Americas, and the Americas sent crops and furs to Europe thus creating The Triangular Trade Route.",
     short:"Three-way trade: Europe, Africa, the Americas",
     hook:"Three corners: Europe sends luxury items, guns, and alcohol; Africa → Americas (slaves); Americas → Europe (crops and furs)."},
    {id:"slavetrade",day:3,group:"T",kind:"place",article:"the",term:"Transatlantic Slave Trade",
     def:"The Transatlantic Slave Trade brought thousands of native Africans to the Americas to work as unpaid labor on large farms",
     short:"Enslaved Africans forced across the Atlantic",
     hook:"Trans-atlantic = across the Atlantic. Africa to the Americas, to work as unpaid labor on large farms."},
    {id:"middle",day:3,group:"T",kind:"place",article:"the",term:"Middle Passage",
     def:"The middle part of the Transatlantic Slave Trade from Africa to the Americas",
     short:"Africa-to-Americas part of the slave trade",
     hook:"Middle Passage = the middle part of the trip: Africa to the Americas."}
  ],

  /* Hand-written questions. a[0] is always the correct answer (the app shuffles). d = learn day it unlocks, or "C" for the connections day. */
  questions: [
    {t:["colonization"],d:1,q:"Why did countries practice colonization?",a:["To gain resources for the mother country","To give land back to native people","To stop trading with other countries","To escape the Scientific Revolution"],e:"Colonization was about claiming land to gain resources for the mother country."},
    {t:["colony"],d:1,q:"Which is the best example of a colony?",a:["A territory in the Americas ruled by Spain","An independent kingdom in Africa","A city in Spain","A trade company's ship"],e:"A colony is a territory under the political control of another country."},
    {t:["colonization","colony"],d:1,q:"Which pair is matched correctly?",a:["Colonization: the process. Colony: the territory.","Colony: the process. Colonization: the territory.","Colonization: a Spanish conqueror. Colony: a trade route.","Colony: a religious worker. Colonization: a company."],e:"Colonization is the claiming and settling; the colony is the land that results."},
    {t:["conquistador"],d:1,q:"A conquistador was a…",a:["Spanish conqueror in the Americas","Dutch trader in Asia","French missionary","Native American leader"],e:"Conquistadors, like Cortés and Pizarro, were Spanish conquerors."},
    {t:["encomienda"],d:1,q:"Under the encomienda system, the Spanish king gave settlers the right to…",a:["The labor of Native Americans in an area","Trade spices with the East Indies","Start their own church","Sail the Middle Passage"],e:"Encomienda gave settlers the right to Native Americans' labor."},
    {t:["encomienda","conquistador"],d:1,q:"Which country do conquistadors and the encomienda system both belong to?",a:["Spain","The Netherlands","England","The Ottoman Empire"],e:"Both are Spanish words for parts of Spain's empire in the Americas."},

    {t:["indigenous"],d:2,q:"Which group was indigenous to the Americas?",a:["The Aztec","Spanish conquistadors","Dutch traders","English colonists"],e:"Indigenous people are the original people of a place, like the Aztec in Mexico."},
    {t:["missionary"],d:2,q:"What was the main goal of a missionary?",a:["To spread their religion and help people","To conquer land for the king","To trade spices","To run a plantation"],e:"Missionaries were sent to do religious work, like converting people or caring for the sick."},
    {t:["resources"],d:2,q:"Which of these is NOT a natural resource?",a:["A musket","Silver","Timber","Furs"],e:"A musket is man-made. Silver, timber, and furs come from nature."},
    {t:["exploitation"],d:2,q:"Forcing people to work in mines for little or no pay so someone else gets rich is an example of…",a:["Exploitation","Globalization","Missionary","Colonization"],e:"Exploitation is treating someone unfairly to benefit from their work."},
    {t:["exploitation","encomienda"],d:2,q:"Why is the encomienda system an example of exploitation?",a:["Settlers profited from Native Americans' forced labor","Native Americans were paid well for their work","It gave land back to indigenous people","It was a fair trade deal"],e:"Settlers benefited from labor they forced indigenous people to do."},
    {t:["resources","colonization"],d:2,q:"What did colonizers want most from their colonies?",a:["Natural resources like gold, silver, and crops","New languages to learn","Religious freedom for native people","Fewer trade routes"],e:"Colonization was about gaining resources for the mother country."},

    {t:["globalization"],d:3,q:"Globalization means…",a:["Economies around the world becoming more connected","One country taking over another","Spreading a religion","Making items from nature"],e:"Globalization is an increasingly connected world economy through trade, finance, and communication."},
    {t:["dutch"],d:3,q:"Where was the Dutch East India Company from?",a:["The Netherlands","Spain","India","England"],e:"It was a company from the Netherlands that traded with India."},
    {t:["dutch"],d:3,q:"What was the Dutch East India Company mainly trading for?",a:["Spices, indigo, and other natural resources","Slaves","Gold","Printed books"],e:"It was primarily interested in trading with India for spices, indigo, and other natural resources."},
    {t:["triangular"],d:3,q:"Which three regions made up the Triangular Trade Route?",a:["Europe, Africa, and the Americas","Europe, Asia, and Australia","Africa, Asia, and the Americas","Spain, France, and England"],e:"The three corners were Europe, Africa, and the Americas."},
    {t:["triangular"],d:3,q:"On the Triangular Trade Route, what did the Americas send to Europe?",a:["Crops and furs","Slaves","Guns and alcohol","Spices from India"],e:"The Americas sent crops and furs to Europe. Europe provided luxury items, guns, and alcohol."},
    {t:["middle"],d:3,q:"The Middle Passage was the part of the Transatlantic Slave Trade from…",a:["Africa to the Americas","Europe to Africa","The Americas to Europe","Europe to India"],e:"The Middle Passage was the middle part of the Transatlantic Slave Trade, from Africa to the Americas."},
    {t:["slavetrade"],d:3,q:"In the Transatlantic Slave Trade, native Africans were brought to the Americas to…",a:["Work as unpaid labor on large farms","Trade spices with India","Become missionaries","Rule new colonies"],e:"They were brought to work as unpaid labor on large farms."},

    {t:["triangular","slavetrade","middle"],d:"C",q:"Which statement about the Middle Passage is correct?",a:["It was the middle part of the Transatlantic Slave Trade, from Africa to the Americas","It is another name for the Dutch East India Company","It went from Europe to India","It carried crops and furs to Europe"],e:"The Middle Passage was the middle part of the Transatlantic Slave Trade, from Africa to the Americas."},
    {t:["exploitation","slavetrade","resources"],d:"C",q:"Which statement is correct?",a:["Exploitation can mean treating people unfairly to benefit from their work AND benefiting from natural resources","Exploitation only means using natural resources","Exploitation means spreading a religion","Missionaries were Spanish conquerors"],e:"The definition covers both: treating people unfairly to benefit from their work, and benefiting from natural resources."},
    {t:["globalization","triangular","dutch"],d:"C",q:"Which is the best example of early globalization?",a:["The triangular trade connecting Europe, Africa, and the Americas","A farmer growing food only for his family","A king ruling a small city","A monk copying a book by hand"],e:"Trade routes that connected continents were the start of a connected world economy."},
    {t:["conquistador","missionary"],d:"C",q:"Conquistadors and missionaries both came to the Americas. What was different about their goals?",a:["Conquistadors wanted land and gold; missionaries wanted to spread religion","Conquistadors spread religion; missionaries wanted gold","Both only wanted to trade spices","Both were indigenous people"],e:"Conquistadors conquered; missionaries converted and cared for people."},
    {t:["dutch"],d:"C",q:"Three of these connect Europe, Africa, and the Americas. Which one doesn't belong?",a:["Dutch East India Company","Middle Passage","Triangular Trade Route","Transatlantic Slave Trade"],e:"The Dutch East India Company traded with India, not across the Atlantic."},
        {t:["colony","indigenous"],d:"C",q:"What usually happened to indigenous people when a colony was set up on their land?",a:["They lost land and control, and many were forced to work","They became rulers of the mother country","They were paid for their resources","Nothing changed for them"],e:"Colonization took land and power from indigenous people and often exploited their labor."},
    {t:["globalization"],d:"C",q:"Globalization happens through which three things?",a:["Trade, finances, and communication","Conquest, religion, and art","Farming, mining, and fishing","Guns, alcohol, and luxury items"],e:"Globalization is an increasingly integrated global economy through trade, finances, and communication."}
  ],

  /* Put-in-order questions. items are in the correct order (the app shuffles). */
  orders: [
    {q:"Follow the Triangular Trade Route. Put the legs in order, starting in Europe.",items:["Europe provides luxury items, guns, and alcohol","Africa provides slaves to the Americas (the Middle Passage)","The Americas send crops and furs to Europe"],e:"Europe → Africa → Americas → back to Europe."},
    {q:"Put the story of a Spanish colony in order.",items:["Conquistadors conquer indigenous empires","Spain claims the land as a colony","The king gives settlers encomiendas","Indigenous people are forced to work the land and mines"],e:"Conquest, then control, then the encomienda system, then exploitation of labor."}
  ],

  /* Shown on the connect day before the connections quiz. */
  bigPicture: {
    title:"One idea connects the whole unit",
    intro:"European countries claimed land around the world to get rich from its natural resources. That wealth came from exploiting people and land, and the trade it created started to connect the whole world.",
    chain:["Colonization (claim the land)","Exploitation (people and resources)","Globalization (a connected world)"],
    sections:[
      {h:"Spain takes the Americas",chain:["Conquistadors conquer","Colony is set up","Encomienda forces indigenous labor"],
       note:"Missionaries came too, to do religious work like convincing people to join a religion."},
      {h:"The Triangular Trade Route",chain:["Europe: luxury items, guns, alcohol","Africa: slaves to the Americas (the Middle Passage)","Americas: crops and furs to Europe"]},
      {h:"Trade with India",chain:["Dutch East India Company (Netherlands)","Trades with India","Spices, indigo, and other natural resources"]}
    ]
  }
};
