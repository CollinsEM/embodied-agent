#!/bin/bash

## tensorflow - tfjs
pushd /var/tmp/repos/tensorflow/tfjs
git pull
## Uncomment if rebuild needed
#cd tfjs-vis
#yarn
#yarn build
popd
cp /var/tmp/repos/tensorflow/tfjs/tfjs-vis/dist/tfjs-vis* ./

## three.js
pushd /var/tmp/repos/mrdoob/three.js
git pull
popd

cp /var/tmp/repos/mrdoob/three.js/build/three.min.js ./
cp /var/tmp/repos/mrdoob/three.js/examples/js/libs/stats.min.js ./
cp /var/tmp/repos/mrdoob/three.js/examples/js/controls/OrbitControls.js ./
cp /var/tmp/repos/mrdoob/three.js/examples/js/loaders/GLTFLoader.js ./

## dat.gui
pushd /var/tmp/repos/dataarts/dat.gui
git pull
popd
cp /var/tmp/repos/dataarts/dat.gui/build/dat.gui.min.js ./
