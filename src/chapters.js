(function(global){
'use strict';

const characters = [
  ['aragorn','Aragorn'],['arwen','Arwen'],['bilbo','Bilbo Baggins'],['boromir','Boromir'],
  ['celeborn','Celeborn'],['denethor','Denethor'],['elrond','Elrond'],['eomer','Éomer'],
  ['eowyn','Éowyn'],['faramir','Faramir'],['frodo','Frodo Baggins'],['galadriel','Galadriel'],
  ['gandalf','Gandalf'],['gimli','Gimli'],['gollum','Gollum'],['legolas','Legolas'],
  ['merry','Meriadoc Brandybuck'],['pippin','Peregrin Took'],['sam','Samwise Gamgee'],
  ['saruman','Saruman'],['theoden','Théoden'],['treebeard','Treebeard']
].map(([id,name])=>({id,name}));

const loc=(placeId,characters,note)=>({placeId,characters,note});
const raw = [
  // Book I
  ['A Long-expected Party',[loc('party-field',['bilbo','frodo','gandalf'],'Bilbo and Frodo celebrate their shared birthday.'),loc('bag-end',['bilbo','frodo','gandalf'],'Bilbo leaves the Ring and departs Bag End.')]],
  ['The Shadow of the Past',[loc('bag-end',['frodo','sam','gandalf'],'Gandalf reveals the Ring’s history; Sam is discovered listening.')]],
  ['Three is Company',[loc('bag-end',['frodo','sam','pippin'],'The travellers leave Hobbiton.'),loc('woody-end',['frodo','sam','pippin'],'They meet Gildor’s wandering Elves.')]],
  ['A Short Cut to Mushrooms',[loc('bamfurlong',['frodo','sam','pippin'],'Farmer Maggot shelters the travellers.'),loc('bucklebury-ferry',['frodo','sam','pippin','merry'],'Merry meets them at the ferry.')]],
  ['A Conspiracy Unmasked',[loc('crickhollow',['frodo','sam','merry','pippin'],'The friends reveal their conspiracy and prepare to leave Buckland.')]],
  ['The Old Forest',[loc('old-forest',['frodo','sam','merry','pippin'],'The four hobbits lose their way in the forest.'),loc('old-man-willow',['frodo','sam','merry','pippin'],'Old Man Willow traps Merry and Pippin.')]],
  ['In the House of Tom Bombadil',[loc('tom-bombadils-house',['frodo','sam','merry','pippin'],'The hobbits rest as Tom tells them about the land.')]],
  ['Fog on the Barrow-downs',[loc('great-barrow',['frodo','sam','merry','pippin'],'A Barrow-wight captures the hobbits before Tom rescues them.')]],
  ['At the Sign of the Prancing Pony',[loc('prancing-pony',['frodo','sam','merry','pippin','aragorn'],'The hobbits meet Strider at the inn.')]],
  ['Strider',[loc('bree',['frodo','sam','merry','pippin','aragorn'],'Strider joins the hobbits after the attack on their rooms.')]],
  ['A Knife in the Dark',[loc('midgewater-marshes',['frodo','sam','merry','pippin','aragorn'],'The company crosses the marshes.'),loc('weathertop',['frodo','sam','merry','pippin','aragorn'],'The Nazgûl attack and wound Frodo.')]],
  ['Flight to the Ford',[loc('trollshaws',['frodo','sam','merry','pippin','aragorn'],'The travellers pass through the Trollshaws.'),loc('ford-of-bruinen',['frodo','sam','merry','pippin','aragorn'],'The company reaches the Ford ahead of the Ringwraiths.')]],
  // Book II
  ['Many Meetings',[loc('rivendell',['frodo','sam','merry','pippin','aragorn','gandalf','bilbo','elrond','arwen'],'Friends and allies reunite in Rivendell.')]],
  ['The Council of Elrond',[loc('rivendell',['frodo','sam','aragorn','gandalf','boromir','legolas','gimli','bilbo','elrond'],'The Council decides that the Ring must be destroyed.')]],
  ['The Ring Goes South',[loc('rivendell',['frodo','sam','merry','pippin','aragorn','gandalf','boromir','legolas','gimli'],'The Fellowship departs.'),loc('eregion',['frodo','sam','merry','pippin','aragorn','gandalf','boromir','legolas','gimli'],'The Fellowship crosses Hollin.'),loc('redhorn-pass',['frodo','sam','merry','pippin','aragorn','gandalf','boromir','legolas','gimli'],'Snow turns them back from Caradhras.')]],
  ['A Journey in the Dark',[loc('doors-of-durin',['frodo','sam','merry','pippin','aragorn','gandalf','boromir','legolas','gimli'],'The Fellowship enters Moria.'),loc('moria',['frodo','sam','merry','pippin','aragorn','gandalf','boromir','legolas','gimli'],'They travel through the dark halls.')]],
  ['The Bridge of Khazad-dûm',[loc('chamber-of-mazarbul',['frodo','sam','merry','pippin','aragorn','gandalf','boromir','legolas','gimli'],'The Fellowship is attacked beside Balin’s tomb.'),loc('bridge-of-khazad-dum',['frodo','sam','merry','pippin','aragorn','gandalf','boromir','legolas','gimli'],'Gandalf confronts the Balrog.')]],
  ['Lothlórien',[loc('dimrill-dale',['frodo','sam','merry','pippin','aragorn','boromir','legolas','gimli'],'The survivors leave Moria.'),loc('nimrodel',['frodo','sam','merry','pippin','aragorn','boromir','legolas','gimli'],'They meet the Galadhrim by the Nimrodel.'),loc('cerin-amroth',['frodo','sam','merry','pippin','aragorn','boromir','legolas','gimli'],'The company reaches the heart of Lórien.')]],
  ['The Mirror of Galadriel',[loc('caras-galadhon',['frodo','sam','merry','pippin','aragorn','boromir','legolas','gimli','galadriel','celeborn'],'The Fellowship rests; Frodo and Sam look into the Mirror.')]],
  ['Farewell to Lórien',[loc('caras-galadhon',['frodo','sam','merry','pippin','aragorn','boromir','legolas','gimli','galadriel','celeborn'],'The Galadhrim give the travellers boats and gifts.'),loc('the-tongue',['frodo','sam','merry','pippin','aragorn','boromir','legolas','gimli'],'The Fellowship sets out down the Anduin.')]],
  ['The Great River',[loc('sarn-gebir',['frodo','sam','merry','pippin','aragorn','boromir','legolas','gimli'],'Orcs attack the boats near the rapids.'),loc('argonath',['frodo','sam','merry','pippin','aragorn','boromir','legolas','gimli'],'The boats pass the Gates of the Kings.'),loc('parth-galen',['frodo','sam','merry','pippin','aragorn','boromir','legolas','gimli'],'The company camps below Amon Hen.')]],
  ['The Breaking of the Fellowship',[loc('amon-hen',['frodo','boromir','aragorn'],'Boromir confronts Frodo; Aragorn searches for him.'),loc('parth-galen',['sam','merry','pippin','aragorn','boromir','legolas','gimli'],'Orcs attack and the Fellowship scatters.'),loc('nen-hithoel',['frodo','sam'],'Frodo and Sam cross the lake toward Mordor.')]],
  // Book III
  ['The Departure of Boromir',[loc('parth-galen',['aragorn','boromir','legolas','gimli'],'The Three Hunters find Boromir and begin their pursuit.'),loc('falls-of-rauros',['boromir','aragorn','legolas','gimli'],'Boromir’s funeral boat passes toward Rauros.')]],
  ['The Riders of Rohan',[loc('eastemnet',['aragorn','legolas','gimli','eomer'],'The Three Hunters meet Éomer and the Riders.')]],
  ['The Uruk-hai',[loc('eastemnet',['merry','pippin','eomer'],'Éomer’s riders attack the Uruk-hai carrying the captives.'),loc('fangorn-forest',['merry','pippin'],'Merry and Pippin escape into Fangorn.')]],
  ['Treebeard',[loc('fangorn-forest',['merry','pippin','treebeard'],'Treebeard carries the hobbits through the forest.'),loc('derndingle',['merry','pippin','treebeard'],'The Entmoot gathers in Derndingle.')]],
  ['The White Rider',[loc('fangorn-forest',['aragorn','legolas','gimli','gandalf'],'The Three Hunters meet Gandalf the White.')]],
  ['The King of the Golden Hall',[loc('edoras',['aragorn','legolas','gimli','gandalf','theoden','eomer','eowyn'],'Gandalf frees Théoden from Wormtongue’s influence.')]],
  ['Helm’s Deep',[loc('helms-deep',['aragorn','legolas','gimli','gandalf','theoden','eomer'],'The defenders withstand Saruman’s army; Gandalf returns at dawn.')]],
  ['The Road to Isengard',[loc('helms-deep',['aragorn','legolas','gimli','gandalf','theoden','eomer'],'The victors leave the Hornburg.'),loc('isengard',['aragorn','legolas','gimli','gandalf','theoden','eomer','merry','pippin','treebeard'],'They find Isengard flooded and occupied by Ents.')]],
  ['Flotsam and Jetsam',[loc('isengard',['merry','pippin','aragorn','legolas','gimli','gandalf','theoden','eomer','treebeard'],'Merry and Pippin tell how the Ents overthrew Isengard.')]],
  ['The Voice of Saruman',[loc('orthanc',['aragorn','legolas','gimli','gandalf','theoden','eomer','merry','pippin','saruman','treebeard'],'Gandalf confronts Saruman at Orthanc.')]],
  ['The Palantír',[loc('dol-baran',['aragorn','legolas','gimli','gandalf','theoden','eomer','merry','pippin'],'Pippin looks into the palantír.'),loc('rohan',['gandalf','pippin'],'Gandalf and Pippin ride east toward Minas Tirith.')]],
  // Book IV
  ['The Taming of Sméagol',[loc('emyn-muil',['frodo','sam','gollum'],'Frodo and Sam capture Gollum in the rocky hills.')]],
  ['The Passage of the Marshes',[loc('dead-marshes',['frodo','sam','gollum'],'Gollum leads the hobbits across the haunted marshes.')]],
  ['The Black Gate Is Closed',[loc('morannon',['frodo','sam','gollum'],'The travellers see that the Black Gate cannot be entered.')]],
  ['Of Herbs and Stewed Rabbit',[loc('north-ithilien',['frodo','sam','gollum','faramir'],'Faramir’s Rangers encounter the travellers in Ithilien.')]],
  ['The Window on the West',[loc('henneth-annun',['frodo','sam','faramir'],'Faramir questions Frodo at the hidden refuge.')]],
  ['The Forbidden Pool',[loc('henneth-annun',['frodo','sam','gollum','faramir'],'Frodo saves Gollum at the forbidden pool.')]],
  ['Journey to the Cross-roads',[loc('cross-roads',['frodo','sam','gollum'],'The travellers reach the Cross-roads at sunset.')]],
  ['The Stairs of Cirith Ungol',[loc('morgul-vale',['frodo','sam','gollum'],'They watch the Morgul-host depart.'),loc('stairs-of-cirith-ungol',['frodo','sam','gollum'],'They climb toward the secret pass.')]],
  ['Shelob’s Lair',[loc('cirith-ungol',['frodo','sam','gollum'],'Shelob attacks in the tunnels above the pass.')]],
  ['The Choices of Master Samwise',[loc('cirith-ungol',['frodo','sam'],'Sam discovers that Frodo is alive and taken by Orcs.'),loc('tower-of-cirith-ungol',['frodo'],'Orcs carry Frodo into the tower.')]],
  // Book V
  ['Minas Tirith',[loc('minas-tirith',['gandalf','pippin','denethor','faramir'],'Gandalf and Pippin enter the City and meet Denethor.')]],
  ['The Passing of the Grey Company',[loc('helms-deep',['aragorn','legolas','gimli','theoden','eomer','merry'],'The Grey Company meets Aragorn at the Hornburg.'),loc('dunharrow',['aragorn','legolas','gimli','eowyn'],'Aragorn parts from Éowyn before taking the Dimholt road.'),loc('paths-of-the-dead',['aragorn','legolas','gimli'],'Aragorn takes the Paths of the Dead.')]],
  ['The Muster of Rohan',[loc('dunharrow',['theoden','eowyn','merry'],'Rohan musters; Merry secretly joins the ride east.')]],
  ['The Siege of Gondor',[loc('minas-tirith',['gandalf','pippin','denethor','faramir'],'The armies of Mordor besiege the City.'),loc('pelennor-fields',['theoden','eowyn','merry'],'The Rohirrim reach the Pelennor at dawn.')]],
  ['The Ride of the Rohirrim',[loc('druadan-forest',['theoden','eowyn','merry','eomer'],'The Rohirrim take the hidden road through the forest.'),loc('pelennor-fields',['theoden','eowyn','merry','eomer'],'The riders arrive before Minas Tirith.')]],
  ['The Battle of the Pelennor Fields',[loc('pelennor-fields',['aragorn','legolas','gimli','gandalf','theoden','eowyn','merry','eomer'],'The forces of Gondor and Rohan fight before the City.')]],
  ['The Pyre of Denethor',[loc('minas-tirith',['gandalf','pippin','denethor','faramir'],'Gandalf and Pippin save Faramir from the pyre.')]],
  ['The Houses of Healing',[loc('houses-of-healing',['aragorn','gandalf','eowyn','faramir','merry','pippin'],'Aragorn tends the wounded after the battle.')]],
  ['The Last Debate',[loc('minas-tirith',['aragorn','gandalf','legolas','gimli','eomer'],'The Captains decide to march on the Black Gate.')]],
  ['The Black Gate Opens',[loc('morannon',['aragorn','gandalf','legolas','gimli','pippin','eomer'],'The Captains of the West challenge Sauron at the Morannon.')]],
  // Book VI
  ['The Tower of Cirith Ungol',[loc('tower-of-cirith-ungol',['frodo','sam'],'Sam enters the tower and rescues Frodo.')]],
  ['The Land of Shadow',[loc('morgai',['frodo','sam'],'The hobbits struggle north through Mordor.')]],
  ['Mount Doom',[loc('mount-doom',['frodo','sam','gollum'],'The Ring is destroyed in the Sammath Naur.')]],
  ['The Field of Cormallen',[loc('morannon',['aragorn','gandalf','legolas','gimli','pippin','eomer'],'Sauron’s forces collapse at the Black Gate.'),loc('field-of-cormallen',['frodo','sam','aragorn','gandalf','legolas','gimli','merry','pippin','eomer','faramir'],'The Fellowship and their allies reunite in Ithilien.')]],
  ['The Steward and the King',[loc('minas-tirith',['aragorn','arwen','frodo','sam','merry','pippin','gandalf','legolas','gimli','faramir','eowyn','eomer','elrond','galadriel'],'Aragorn is crowned and weds Arwen.')]],
  ['Many Partings',[loc('edoras',['aragorn','arwen','frodo','sam','merry','pippin','gandalf','legolas','gimli','elrond','galadriel'],'The companions bid farewell to Théoden.'),loc('isengard',['frodo','sam','merry','pippin','gandalf','legolas','gimli','elrond','galadriel','treebeard'],'Their roads divide near Isengard.'),loc('dunland',['frodo','sam','merry','pippin','gandalf','elrond','galadriel','saruman'],'The travellers meet Saruman on the road through Dunland.'),loc('rivendell',['frodo','sam','merry','pippin','gandalf','bilbo','elrond'],'The hobbits return to Rivendell and Bilbo.')]],
  ['Homeward Bound',[loc('prancing-pony',['frodo','sam','merry','pippin','gandalf'],'The travellers hear unsettling news in Bree.')]],
  ['The Scouring of the Shire',[loc('bywater',['frodo','sam','merry','pippin'],'The hobbits lead the uprising at Bywater.'),loc('bag-end',['frodo','sam','merry','pippin','saruman'],'They confront Saruman at Bag End.')]],
  ['The Grey Havens',[loc('the-shire',['frodo','sam','merry','pippin'],'The Shire heals as the years pass.'),loc('mithlond',['frodo','sam','merry','pippin','gandalf','bilbo','elrond','galadriel'],'The Ring-bearers depart from the Grey Havens.'),loc('bag-end',['sam'],'Sam returns home.')]]
];

const bookCounts=[12,10,11,10,10,9];
let offset=0;
const chapters=[];
bookCounts.forEach((count,book)=>{
  raw.slice(offset,offset+count).forEach((entry,index)=>chapters.push({
    id:`lotr-b${book+1}-c${String(index+1).padStart(2,'0')}`,
    work:'lotr',book:book+1,chapter:index+1,title:entry[0],locations:entry[1]
  }));
  offset+=count;
});

global.ATLAS_DATA.characters=characters;
global.ATLAS_DATA.chapters=chapters;
})(typeof window === 'undefined' ? globalThis : window);
