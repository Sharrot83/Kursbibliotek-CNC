three.js r160 (oförändrade filer från npm-paketet three@0.160.0, MIT-licens, se LICENSE).
Används av svarvsimulatorn (courses/cnc-gront-kort/svarv.html) via importmap, så att sidan inte hämtar något från externa servrar.

three.module.min.js              <- three@0.160.0/build/three.module.min.js
addons/controls/OrbitControls.js <- three@0.160.0/examples/jsm/controls/OrbitControls.js

Byter man version: ersätt filerna och testa simulatorn. OrbitControls.js måste vara från samma version som three.module.min.js.
