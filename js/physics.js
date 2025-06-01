//oimo var
var meshes = [];
var world = null;
var dolls = null;
var joints = null;
var infos;
var type = 1;
var collision = true;
var bgColor = 0x252627;
var ToRad = 0.0174532925199432957;


function initOimoPhysics(){

}


function updateOimoPhysics() {

  if(world == null) return;

  world.step();

}

function populate(n) {
  var max = 1;
  if(n===1) type = 1
  else if(n===2) type = 2;

  // reset old
  clearMesh();
  world.clear();
  dolls = [];
  joints = [];

  // var ground = world.add({size:[300, 40, 300], pos:[0,-20,0]});
  // addStaticBox([300, 40, 300], [0,-20,0], [0,0,0]);

  var i = max;
  var j = 0;
  var k = 0;
  var l = 0;
  var m = 0;
  var px,py,pz;
  var spring = [2, 0.3];
  

  while (i--){
    l++;

    px = 0;
    py = 2;
    pz = 1;
    if(l>7){m++; l=0}

    // var doll = new RagDoll(px, py, pz, j++);
    // scene.add(doll);
    // dolls.push(doll);
  }
}

