/* English for the physics messages (cutting force, breakage, heat). Shared by G-vis and the simulators. */
(function(){if(!window.cncI18n)return;
const SUB=[
 [/Hög belastning \((\d+) %\): /g,'High tool load ($1 %): '],[/\. Nära gränsen\./g,'. Close to the limit.'],
 [/Spindeln orkar inte: ([\d,]+) kW behövs, maskinen har ([\d,]+) kW\./g,(m,a,b)=>`The spindle cannot keep up: ${a.replace(',','.')} kW needed, the machine has ${b.replace(',','.')} kW.`],
 [/Minska skärdjup, ingrepp eller matning\./g,'Reduce the depth of cut, width of cut or feed rate.'],[/Minska skärdjupet eller matningen, eller sänk varvtalet\./g,'Reduce the depth of cut or feed rate, or lower the spindle speed.'],[/Minska skärdjupet eller matningen\./g,'Reduce the depth of cut or feed rate.'],
 [/Spindelns vridmoment räcker inte: (\d+) Nm behövs vid S(\d+), maskinen ger (\d+) Nm\./g,'Not enough spindle torque: $1 Nm needed at S$2, the machine gives $3 Nm.'],[/Spindelns vridmoment räcker inte: (\d+) Nm behövs, maskinen ger (\d+) Nm\./g,'Not enough spindle torque: $1 Nm needed, the machine gives $2 Nm.'],
 [/Höj varvtalet eller minska ingreppet\./g,'Raise the spindle speed or reduce the width of cut.'],
 [/Matningen är för låg \(spåntjocklek ([\d,]+) mm\): verktyget gnider i stället för att skära\./g,(m,a)=>`The feed is too low (chip thickness ${a.replace(',','.')} mm): the tool rubs instead of cutting.`],
 [/Det blir varmt, ytan blir sämre/g,'It gets hot and the surface finish gets worse'],[/ och plasten kan smälta/g,' and the plastic can melt'],[/ och materialet kan deformationshärdna/g,' and the material can work-harden'],[/\. Öka matningen\./g,'. Increase the feed rate.'],
 [/Matningen ([\d,]+) mm\/varv är låg för spetsradien ([\d,]+) mm \(minst ungefär ([\d,]+)\): skäret gnider i stället för att skära/g,(m,a,b,c)=>`The feed ${a.replace(',','.')} mm/rev is low for the ${b.replace(',','.')} mm nose radius (at least about ${c.replace(',','.')}): the insert rubs instead of cutting`],
 [/^Varvtalet är för högt: v$/g,'Spindle speed too high: v'],[/^Skärhastigheten är för hög: v$/g,'Cutting speed too high: v'],[/^Varvtalet är lågt för (.+) \(v$/g,'Spindle speed is low for $1 (v'],[/^Skärhastigheten är låg för (.+) \(v$/g,'Cutting speed is low for $1 (v'],
 [/(\d+) m\/min \(riktvärde ([\d–]+)\)\. Verktyget blir varmt och slits fort/g,'$1 m/min (recommended $2). The tool runs hot and wears fast'],[/(\d+) m\/min \(riktvärde ([\d–]+)\)\. Skäret blir varmt och slits fort/g,'$1 m/min (recommended $2). The insert runs hot and wears fast'],[/, och spånen blir blå/g,', and the chips turn blue'],
 [/(\d+) m\/min\): materialet kladdar fast på skäret och ytan blir matt och sliten\./g,'$1 m/min): the material builds up on the cutting edge and the surface turns dull and torn.'],
 [/Ämnet blir cirka (\d+) °C, över de cirka (\d+) °C där (.+) börjar mjukna eller smälta\. Höj matningen, sänk varvtalet eller blås med luft\./g,'The part reaches about $1 °C, above the roughly $2 °C where $3 starts to soften or melt. Raise the feed, lower the spindle speed or use air blast.'],
 [/^Fräsen går av\.$/g,'The end mill breaks.'],[/^Borren går av\.$/g,'The drill breaks.'],[/^Verktyget går av\.$/g,'The tool breaks.'],[/^Skäret går av\.$/g,'The insert breaks.'],
 [/Böjspänningen ([\d\u2009 ]+) MPa av ungefär ([\d\u2009 ]+) N skärkraft på (\d+) mm utstick \((hårdmetall|snabbstål) tål omkring (\d+) MPa\)/g,(m,a,b,c,d,e)=>`Bending stress ${a} MPa from about ${b} N cutting force at ${c} mm stick-out (${d==='hårdmetall'?'carbide':'HSS'} takes about ${e} MPa)`],
 [/Vridmomentet ([\d,]+) Nm \(verktyget tål ungefär ([\d,]+) Nm\)/g,'Torque $1 Nm (the tool takes about $2 Nm)'],[/Skärkraften ([\d\u2009 ]+) N \(skäret tål ungefär ([\d\u2009 ]+) N\)/g,'Cutting force $1 N (the insert takes about $2 N)'],
 [/Minska matningen, skärdjupet eller ingreppet, eller korta utsticket\./g,'Reduce the feed, depth of cut or width of cut, or shorten the stick-out.'],[/Minska matningen, skärdjupet eller ingreppet\./g,'Reduce the feed, depth of cut or width of cut.'],[/Minska matningen \(F\), skärdjupet eller ingreppet och kör igen\./g,'Reduce the feed rate (F), depth of cut or width of cut and run again.'],
 [/^Krasch! (Fräsen|Borren|Verktyget|Skäret) \(T(\d+)\) gick av på rad (\d+)$/g,(m,a,t,l)=>`Crash! The ${({Fräsen:'end mill',Borren:'drill',Verktyget:'tool',Skäret:'insert'})[a]} (T${t}) broke on line ${l}`],
 [/^(Fräsen|Borren|Verktyget|Skäret) \(T(\d+)\) gick av på rad (\d+)$/g,(m,a,t,l)=>`The ${({Fräsen:'end mill',Borren:'drill',Verktyget:'tool',Skäret:'insert'})[a]} (T${t}) broke on line ${l}`],
 [/^Krasch! Spindeln är överbelastad$/g,'Crash! The spindle is overloaded'],[/^Krasch! Spindelns vridmoment räcker inte$/g,'Crash! Not enough spindle torque'],[/^Spindeln är överbelastad$/g,'The spindle is overloaded'],[/^Spindelns vridmoment räcker inte$/g,'Not enough spindle torque'],
 [/ skär utan varvtal\. Skriv S \(varv\/min\) och M3 före första skärande rörelsen, annars kan fysiken inte räknas\./g,' cuts without a spindle speed. Program S (rpm) and M3 before the first cutting move, or the physics cannot be calculated.']
];
window.cncI18n.add({sub:SUB});
})();
