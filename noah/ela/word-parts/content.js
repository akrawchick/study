/* Noah · ELA (Mrs. Cox) · Module 1 Unit 3: Word Part Quiz on Word Part Lists 1-3 · plan Fri Oct 30 – quiz Thu Nov 5, 2026
   Source: Canvas page "Module 1 Unit 3 Overview" (posted 10/30) → "Word Part Lists 1-3" doc (Groups 1-3; Groups 4-12 are still blank). */
window.GUIDE = {
  id: "noah-ela-word-parts",
  student: "Noah",
  subject: "Word Parts",
  start: "2026-10-30",
  days: [
    {title:"Group 1: one, two, three", kind:"learn"},
    {title:"Group 2: four, five, ten, a hundred, many", kind:"learn"},
    {title:"Group 3: before, after, time, follow", kind:"learn"},
    {title:"Mix all three lists", kind:"connect"},
    {title:"Review day (no school)", kind:"review"},
    {title:"Last review", kind:"final"},
    {title:"Quiz day", kind:"test"}
  ],
  groups: [
    {key:"A", name:"Group 1"},
    {key:"B", name:"Group 2"},
    {key:"C", name:"Group 3"}
  ],

  /* day = which learn day (1-based) the card opens on. Meanings and example words are from Mrs. Cox's list. */
  terms: [
    {id:"uni",day:1,group:"A",kind:"idea",term:"uni",
     def:"one, as in unicycle and unicorn",
     short:"one (unicycle)",
     hook:"A unicycle has one wheel. A unicorn has one horn. Uni and mono both mean one."},
    {id:"mono",day:1,group:"A",kind:"idea",term:"mon / mono",
     def:"one, as in monocle and monopoly",
     short:"one (monocle)",
     hook:"A monocle is a single eyeglass lens. A monopoly is when one company owns it all, which is how you win the board game."},
    {id:"bi",day:1,group:"A",kind:"idea",term:"bi",
     def:"two, as in bicycle and biped",
     short:"two (bicycle)",
     hook:"A bicycle has two wheels. A biped walks on two feet, like you do."},
    {id:"du",day:1,group:"A",kind:"idea",term:"du",
     def:"two, as in duo, dual, and duet",
     short:"two (duet)",
     hook:"A duet is a song for two singers. Dual monitors are two screens. Du and bi both mean two."},
    {id:"tri",day:1,group:"A",kind:"idea",term:"tri",
     def:"three, as in trio and trilogy",
     short:"three (trilogy)",
     hook:"A trilogy is a set of three books or movies. A triangle has three angles, and a tricycle has three wheels."},

    {id:"quad",day:2,group:"B",kind:"idea",term:"quad",
     def:"four, as in quadricep",
     short:"four (quadricep)",
     hook:"Your quad (quadricep) is the big thigh muscle made of four parts. A quadrilateral has four sides; a four-wheeler is called a quad."},
    {id:"quint",day:2,group:"B",kind:"idea",term:"quint",
     def:"five, as in quintet",
     short:"five (quintet)",
     hook:"A quintet is a group of five musicians. Quintuplets are five babies born at once."},
    {id:"dec",day:2,group:"B",kind:"idea",term:"dec",
     def:"ten, as in decade",
     short:"ten (decade)",
     hook:"A decade is ten years. A decagon has ten sides, and decimals count by tens."},
    {id:"cent",day:2,group:"B",kind:"idea",term:"cent",
     def:"one hundred, as in century",
     short:"one hundred (century)",
     hook:"A century is 100 years, and a dollar is 100 cents. Cent is the biggest number on the list."},
    {id:"multi",day:2,group:"B",kind:"idea",term:"multi",
     def:"many, as in multilingual",
     short:"many (multilingual)",
     hook:"Multilingual means you speak many languages. A multiplayer game has many players. Multi isn't one number; it just means a lot."},

    {id:"ante",day:3,group:"C",kind:"idea",term:"ante",
     def:"before, as in antechamber",
     short:"before (antechamber)",
     hook:"An antechamber is the small room you walk through before the main room. Watch the spelling: ante with an E means before (anti with an I means against)."},
    {id:"pre",day:3,group:"C",kind:"idea",term:"pre",
     def:"before, as in prefix and prerequisite",
     short:"before (prefix)",
     hook:"A prefix comes before the rest of the word. A preview is what you see before the movie. Pre and ante both mean before."},
    {id:"post",day:3,group:"C",kind:"idea",term:"post",
     def:"after, as in postscript and postmortem",
     short:"after (postscript)",
     hook:"A P.S. (postscript) is what you write after you sign a letter. The postgame show comes after the game. Pre is before, post is after."},
    {id:"chrono",day:3,group:"C",kind:"idea",term:"chrono",
     def:"time, as in chronic and chronological",
     short:"time (chronological)",
     hook:"Chronological order is time order, like a timeline in social studies. Something chronic goes on for a long time, like a chronic cough."},
    {id:"seq",day:3,group:"C",kind:"idea",term:"seq / secut",
     def:"to follow, as in consequential",
     short:"to follow (consequential)",
     hook:"A sequel follows the first movie. A consequence follows what you did. Consecutive days follow one after another."}
  ],

  questions: [
    /* Day 1: Group 1 */
    {t:["uni"],d:1,q:"A unicycle has how many wheels?",a:["One","Two","Three","Four"],e:"Uni means one, so a unicycle has one wheel. It's the first word part on Mrs. Cox's Group 1 list."},
    {t:["uni","mono"],d:1,q:"Which two word parts both mean one?",a:["uni and mono","bi and du","uni and bi","mono and tri"],e:"Uni (unicorn) and mono (monocle) both mean one. Bi and du are the pair that mean two."},
    {t:["mono"],d:1,q:"A monocle is an eyeglass with how many lenses?",a:["One","Two","Three","Many"],e:"Mono means one, so a monocle has a single lens. Regular glasses have two."},
    {t:["mono"],d:1,q:"In the game Monopoly, you win by…",a:["Being the one player who owns everything","Teaming up with two friends","Owning three of each color","Letting many players share"],e:"Mono means one: a monopoly is when one owner controls it all."},
    {t:["bi"],d:1,q:"A biped is an animal that walks on…",a:["Two feet","One foot","Four feet","Many feet"],e:"Bi means two, so a biped walks on two feet. People and birds are bipeds."},
    {t:["bi"],d:1,q:"Which word part in “bicycle” tells you how many wheels it has?",a:["bi","cycle","uni","du"],e:"Bi means two. The cycle part means wheel or circle, so a bicycle is two wheels."},
    {t:["du"],d:1,q:"A duet is a song performed by…",a:["Two people","One person","Three people","Many people"],e:"Du means two, like duo and dual. A duet is for two singers."},
    {t:["du","bi"],d:1,q:"Which word part means the same thing as du?",a:["bi","uni","tri","mono"],e:"Du and bi both mean two (duet, bicycle)."},
    {t:["tri"],d:1,q:"A trilogy is a series of how many books or movies?",a:["Three","Two","Four","Ten"],e:"Tri means three. A trio is three people; a trilogy is three books or movies."},
    {t:["tri"],d:1,q:"Which word has a word part that means three?",a:["trio","duo","unicorn","biped"],e:"Trio starts with tri, which means three. Duo and biped mean two; unicorn means one."},

    /* Day 2: Group 2 */
    {t:["quad"],d:2,q:"The word part quad means…",a:["Four","Five","Two","Ten"],e:"Quad means four, as in quadricep, the thigh muscle with four parts."},
    {t:["quad"],d:2,q:"A quadrilateral is a shape with how many sides?",a:["Four","Three","Five","Ten"],e:"Quad means four, so a quadrilateral has four sides, like a square or rectangle."},
    {t:["quint"],d:2,q:"A quintet is a group of how many musicians?",a:["Five","Four","Three","Ten"],e:"Quint means five. Don't mix it up with quad (four): quint is one more."},
    {t:["quint","quad"],d:2,q:"Which pair is matched correctly?",a:["quad = 4, quint = 5","quad = 5, quint = 4","quad = 4, quint = 10","quad = 2, quint = 5"],e:"Quad is four (quadricep) and quint is five (quintet)."},
    {t:["dec"],d:2,q:"A decade is how many years?",a:["Ten","One hundred","Five","Four"],e:"Dec means ten, so a decade is ten years."},
    {t:["dec"],d:2,q:"A decagon is a shape with how many sides?",a:["Ten","Four","Five","One hundred"],e:"Dec means ten, so a decagon has ten sides."},
    {t:["cent"],d:2,q:"A century is how many years?",a:["One hundred","Ten","One thousand","Five"],e:"Cent means one hundred, so a century is 100 years. A decade (dec) is only ten."},
    {t:["cent"],d:2,q:"Why is a penny called a cent?",a:["It takes 100 of them to make a dollar","It is worth ten dollars","It is the first coin ever made","It has one face on it"],e:"Cent means one hundred. A cent is one hundredth of a dollar."},
    {t:["multi"],d:2,q:"Someone who is multilingual speaks…",a:["Many languages","One language","Two languages","No languages"],e:"Multi means many, so multilingual means speaking many languages."},
    {t:["multi"],d:2,q:"Which word part does NOT stand for one exact number?",a:["multi","dec","quint","cent"],e:"Multi just means many. Dec is 10, quint is 5, cent is 100."},

    /* Day 3: Group 3 */
    {t:["ante"],d:3,q:"An antechamber is a small room you walk through…",a:["Before the main room","After the main room","Instead of the main room","Under the main room"],e:"Ante means before. The antechamber comes before the main chamber."},
    {t:["ante","pre"],d:3,q:"Which two word parts both mean before?",a:["ante and pre","pre and post","ante and post","chrono and seq"],e:"Ante (antechamber) and pre (prefix) both mean before. Post means after."},
    {t:["pre"],d:3,q:"A prefix goes where in a word?",a:["Before the rest of the word","After the rest of the word","In the middle of the word","In a different sentence"],e:"Pre means before. Pre-, uni-, and bi- are all prefixes: they come at the start."},
    {t:["pre"],d:3,q:"A prerequisite is a class you have to take…",a:["Before another class","After another class","At the same time as another class","Instead of another class"],e:"Pre means before. A prerequisite is the class you have to finish first."},
    {t:["post"],d:3,q:"A postscript (P.S.) is written…",a:["After the rest of the letter","Before the rest of the letter","In place of the letter","On the envelope"],e:"Post means after. A P.S. comes after you sign the letter."},
    {t:["post","pre"],d:3,q:"Pregame is before the game. What is postgame?",a:["After the game","Before the game","During the game","The middle of the game"],e:"Pre means before and post means after. They're opposites."},
    {t:["chrono"],d:3,q:"Putting events in chronological order means putting them in order of…",a:["Time","Size","Importance","The alphabet"],e:"Chrono means time. A timeline shows events in chronological order."},
    {t:["chrono"],d:3,q:"A chronic cough is one that…",a:["Lasts a long time","Comes back after a meal","Happens only once","Makes your voice higher"],e:"Chrono means time. Chronic means something keeps going for a long time."},
    {t:["seq"],d:3,q:"The word part seq / secut means…",a:["To follow","Before","Time","Many"],e:"Seq / secut means to follow, as in consequential, sequel, and consecutive."},
    {t:["seq"],d:3,q:"A sequel is a movie that…",a:["Follows the first movie","Comes before the first movie","Is exactly the same as the first movie","Is made by many studios"],e:"Seq means to follow. The sequel follows the first movie."},
    {t:["seq"],d:3,q:"If you have practice on three consecutive days, those days are…",a:["One right after another","Spread out over a month","All on weekends","Before the season starts"],e:"Secut means to follow. Consecutive days follow each other in a row."},

    /* Connect day: mixing the three lists */
    {t:["bi","cent"],d:"C",q:"A bicentennial celebrates how many years?",a:["200","100","20","2"],e:"Bi = two and cent = one hundred, so bicentennial = two hundred years. Splitting a word into parts is the whole trick."},
    {t:["tri","multi"],d:"C",q:"Using the word parts, trilingual means you speak…",a:["Three languages","Many languages","Two languages","One language"],e:"Tri means three. Compare multilingual (multi = many)."},
    {t:["uni","bi","du","mono"],d:"C",q:"Which word does NOT have a word part meaning two?",a:["monocle","bicycle","duet","dual"],e:"Mono means one. Bicycle (bi), duet and dual (du) all mean two."},
    {t:["pre","post"],d:"C",q:"Which word part is the opposite of post?",a:["pre","chrono","seq","multi"],e:"Post means after and pre means before. (Ante means before too.)"},
    {t:["dec","cent"],d:"C",q:"Which is longer, a decade or a century?",a:["A century (100 years)","A decade (100 years)","They are the same length","A decade (10 years)"],e:"Dec = ten and cent = one hundred, so a century is ten decades."},
    {t:["chrono","seq"],d:"C",q:"Events that follow one another in time order are…",a:["Chronological and sequential","Multilingual and dual","Antechamber and postscript","Unicycle and trilogy"],e:"Chrono means time and seq means to follow. Both describe things in order."},
    {t:["multi"],d:"C",q:"A multicolored shirt has…",a:["Many colors","One color","Two colors","Ten colors"],e:"Multi means many. When a word part is new to you, try the meaning in the sentence and see if it makes sense."},
    {t:["quad","quint","tri"],d:"C",q:"Which list goes from smallest to largest?",a:["tri, quad, quint","quad, tri, quint","quint, quad, tri","tri, quint, quad"],e:"Tri = 3, quad = 4, quint = 5."},
    {t:["ante","pre","post"],d:"C",q:"Which word part does NOT mean before?",a:["post","ante","pre","None of these. They all mean before."],e:"Post means after. Ante and pre both mean before."},
    {t:[],d:"C",q:"What is the best way to figure out a new word with a word part in it?",a:["Split off the word part, use its meaning, and check that it fits the sentence","Skip the word","Guess from how long the word is","Pick the meaning of the last letter"],e:"That's what the word part lists are for. Bi + cent + ennial = two hundred years."}
  ],

  orders: [
    {q:"Put these number word parts from smallest to largest.",items:["uni (1)","bi (2)","tri (3)","quad (4)","quint (5)","dec (10)","cent (100)"],e:"uni 1, bi 2, tri 3, quad 4, quint 5, dec 10, cent 100. Mono and du are the twins of uni and bi."},
    {q:"Put these in the order they happen.",items:["Pregame warm-ups","The game","Postgame interviews"],e:"Pre means before and post means after."}
  ],

  bigPicture: {
    title:"Split the word, find the meaning",
    intro:"Most long English words are built from smaller parts. If you know what the part means, you can figure out a word you've never seen. That's what Mrs. Cox's word part quiz checks.",
    chain:["Spot the word part","Remember what it means","Use it to explain the whole word"],
    sections:[
      {h:"Numbers (Groups 1 and 2)",chain:["uni / mono = 1","bi / du = 2","tri = 3, quad = 4, quint = 5","dec = 10, cent = 100","multi = many"]},
      {h:"Time and order (Group 3)",chain:["ante / pre = before","post = after","chrono = time","seq / secut = to follow"]},
      {h:"Two parts at once",chain:["bi + cent","two + hundred","bicentennial = a 200-year anniversary"],
       note:"Practice with Mrs. Cox's Gimkit on the Unit 3 Overview too."}
    ]
  }
};
