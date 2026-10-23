three.js r128 (oförändrade filer från npm-paketet three@0.128.0, MIT-licens, se LICENSE).
Används av G-kodsvisualiseraren (courses/cnc-gront-kort/rita.html) via vanliga <script>-taggar, så att sidan inte hämtar något från externa servrar.

three.min.js                          <- three@0.128.0/build/three.min.js
examples/js/controls/OrbitControls.js <- three@0.128.0/examples/js/controls/OrbitControls.js

Byter man version: ersätt filerna och testa visualiseraren. OrbitControls.js måste vara från samma version som three.min.js.
Obs: rita.html använder den gamla globala THREE-varianten (examples/js), som togs bort i three.js r148. Svarvsimulatorn använder r160 (assets/vendor/three-r160).
