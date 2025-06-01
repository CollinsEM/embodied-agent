// background

// var buffgeoBack = new THREE.BufferGeometry();
// buffgeoBack.fromGeometry( new THREE.IcosahedronGeometry(3000,2) );
// var back = new THREE.Mesh( buffgeoBack, new THREE.MeshBasicMaterial( { map:gradTexture([[0.75,0.6,0.4,0.25], ['#1B1D1E','#3D4143','#72797D', '#b0babf']]), side:THREE.BackSide, depthWrite: false, fog:false }  ));
// back.geometry.applyMatrix(new THREE.Matrix4().makeRotationZ(15*ToRad));
// scene.add( back );

// geometry
let geoCylinder = new THREE.CylinderGeometry( 0.5, 0.5, 1, 16 );
let geoCylinder2 = new THREE.CylinderGeometry( 0.5, 0.5, 1, 16 )
let geoSphere = new THREE.SphereGeometry( 1 , 20, 10 );
let geoSphere2 = new THREE.SphereGeometry( 0.5 , 10, 6 );
let geoBox = new THREE.BoxGeometry( 1, 1, 1 );

geoCylinder2.applyMatrix4( new THREE.Matrix4().makeRotationZ( Math.PI / 2 ) );

// material

const matSphere      = new THREE.MeshPhongMaterial( { map: basicTexture(0),
                                                      name:'sph',
                                                      transparent:true,
                                                      opacity:0.6,
                                                      shininess:120,
                                                      specular:0xffffff} );
const matHead        = new THREE.MeshPhongMaterial( { color: 0xe8b36d,
                                                      name:'sphHH',
                                                      shininess:60,
                                                      specular:0xffffff  } );
const matBox         = new THREE.MeshPhongMaterial( { map: basicTexture(2),
                                                      name:'box',
                                                      shininess:100,
                                                      specular:0xffffff  } );
const matBox2        = new THREE.MeshPhongMaterial( { map: basicTexture(2,1),
                                                      name:'box2',
                                                      shininess:100,
                                                      specular:0xffffff  } );
const matBox3        = new THREE.MeshPhongMaterial( { map: basicTexture(2,0),
                                                      name:'box3',
                                                      shininess:100,
                                                      specular:0xffffff  } );
const matSphereSleep = new THREE.MeshPhongMaterial( { map: basicTexture(1),
                                                      name:'ssph',
                                                      transparent:true,
                                                      opacity:0.8 } );
const matBoxSleep    = new THREE.MeshPhongMaterial( { map: basicTexture(3),
                                                      name:'sbox' } );
const matBoxSleep2   = new THREE.MeshPhongMaterial( { map: basicTexture(3,1),
                                                      name:'sbox2' } );
const matBoxSleep3   = new THREE.MeshPhongMaterial( { map: basicTexture(3,0),
                                                      name:'sbox3' } );
const matGround      = new THREE.MeshPhongMaterial( { color: 0x3D4143,
                                                      transparent:true,
                                                      opacity:0.5,
                                                      shininess: 10 } );

class RagDoll extends THREE.Group {
  constructor(px, py, pz, k) {
    super();
    this.bodies = [];
    this.joints = [];
    this.meshes = [];
    
    const spring = [0.2, 0.5];
    let b = 0, m = 0, j = 0;
    
    // Pelvis
    this.bodies[b++]= world.add({type:"box", size:[0.2,0.1,0.15], pos:[px,py-0.2,pz], move:true, name:'pelvis'+k });
    this.meshes[m++] = addThreeMesh([0.2,0.1,0.15], null, null, 0, 'cylinder');
    // Spine1
    this.bodies[b++] = world.add({type:"box", size:[0.2,0.1,0.15], pos:[px,py-0.1,pz], move:true,  name:'spine1_'+k });
    this.meshes[m++] = addThreeMesh([0.2,0.1,0.15], null, null, 0, 'cylinder');
    // Spine2
    this.bodies[b++] = world.add({type:"box", size:[0.2,0.1,0.15], pos:[px,py,pz], move:true, name:'spine2_'+k, noSleep:true });
    this.meshes[m++] = addThreeMesh([0.2,0.1,0.15], null, null, 0, 'cylinder');
    // Spine3
    this.bodies[b++] = world.add({type:"box", size:[0.2,0.1,0.15], pos:[px,py+0.1,pz], move:true,  name:'spine3_'+k });
    this.meshes[m++] = addThreeMesh([0.2,0.1,0.15], null, null, 0, 'cylinder');
    // Head
    this.bodies[b++] = world.add({type:"sphere", size:[0.1,0.1,0.1], pos:[px,py+0.3,pz], move:true,  name:'head'+k });
    this.meshes[m++] = addThreeMesh([0.1,0.1,0.1], null, null, 1, 'sphere');
    
    this.joints[j++] = world.add({type:"joint", body1:'pelvis'+k, body2:'spine1_'+k, pos1:[0,0.05,0], pos2:[0,-0.05,0], min:2, max:20, collision:collision, spring:spring });
    this.joints[j++] = world.add({type:"joint", body1:'spine1_'+k, body2:'spine2_'+k, pos1:[0,0.05,0], pos2:[0,-0.05,0], min:2, max:20, collision:collision, spring:spring });
    this.joints[j++] = world.add({type:"joint", body1:'spine2_'+k, body2:'spine3_'+k, pos1:[0,0.05,0], pos2:[0,-0.05,0], min:2, max:20, collision:collision, spring:spring });
    this.joints[j++] = world.add({type:"joint", body1:'spine3_'+k, body2:'head'+k,   pos1:[0,0.05,0], pos2:[0,-0.1,0], min:2, max:20, collision:collision, spring:spring });
    
    //arms
    
    this.bodies[b++] = world.add({type:"box", size:[0.2,0.1,0.1], pos:[px-0.2,py+0.08,pz], rot:[0,0,20], move:true,  name:'L_arm'+k });
    this.meshes[m++] = addThreeMesh([0.2,0.1,0.1], null, null, 3, 'cylinder2');
    
    this.bodies[b++] = world.add({type:"box", size:[0.2,0.08,0.08], pos:[px-0.4,py,pz], rot:[0,0,20], move:true,  name:'LF_arm'+k });
    this.meshes[m++] = addThreeMesh([0.2,0.08,0.08], null, null, 3, 'cylinder2');

    this.bodies[b++] = world.add({type:"box", size:[0.2,0.1,0.1], pos:[px+0.2,py+0.08,pz], rot:[0,0,-20], move:true,  name:'R_arm'+k });
    this.meshes[m++] = addThreeMesh([0.2,0.1,0.1], null, null, 3, 'cylinder2');
    
    this.bodies[b++] = world.add({type:"box", size:[0.2,0.08,0.08], pos:[px+0.4,py,pz], rot:[0,0,-20], move:true,  name:'RF_arm'+k });
    this.meshes[m++] = addThreeMesh([0.2,0.08,0.08], null, null, 3, 'cylinder2');

    this.joints[j++] = world.add({type:"joint", body1:'spine3_'+k, body2:'L_arm'+k, pos1:[-0.10,0,0], pos2:[0.10,0,0], axe1:[0,1,1], axe2:[0,1,1], collision:collision});
    this.joints[j++] = world.add({type:"joint", body1:'spine3_'+k, body2:'R_arm'+k, pos1:[0.10,0,0], pos2:[-0.10,0,0], axe1:[0,1,1], axe2:[0,1,1], collision:collision});

    this.joints[j++] = world.add({type:"joint", body1:'L_arm'+k, body2:'LF_arm'+k, pos1:[-0.10,0,0], pos2:[0.10,0,0], axe1:[0,1,0], axe2:[0,1,0], collision:collision});
    this.joints[j++] = world.add({type:"joint", body1:'R_arm'+k, body2:'RF_arm'+k, pos1:[0.10,0,0], pos2:[-0.10,0,0], axe1:[0,1,0], axe2:[0,1,0], collision:collision});

    // legs

    // this.bodies[b++] = world.add({type:"box", size:[10,20,10], pos:[px-6,py-40,pz], rot:[0,0,-20], move:true, name:'L_leg'+k });
    // this.meshes[m++] = addThreeMesh([10,20,10], null, null, 0, 'cylinder');
    // this.bodies[b++] = world.add({type:"box", size:[8,20,8], pos:[px-15,py-70,pz], rot:[0,0,-20], move:true, name:'LF_leg'+k });
    // this.meshes[m++] = addThreeMesh([8,20,8], null, null, 0, 'cylinder');

    // this.bodies[b++] = world.add({type:"box", size:[10,20,10], pos:[px+6,py-40,pz], rot:[0,0,20], move:true, name:'R_leg'+k });
    // this.meshes[m++] = addThreeMesh([10,20,10], null, null, 0, 'cylinder');
    // this.bodies[b++] = world.add({type:"box", size:[8,20,8], pos:[px+15,py-70,pz], rot:[0,0,20], move:true, name:'RF_leg'+k });
    // this.meshes[m++] = addThreeMesh([8,20,8], null, null, 0, 'cylinder');

    // this.joints[j++] = world.add({type:"joint", body1:'pelvis'+k, body2:'L_leg'+k, pos1:[-6,-5,0], pos2:[0,10,0], min:2, max:60, collision:collision }); 
    // this.joints[j++] = world.add({type:"joint", body1:'pelvis'+k, body2:'R_leg'+k, pos1:[6,-5,0], pos2:[0,10,0], min:2, max:60, collision:collision });

    // this.joints[j++] = world.add({type:"joint", body1:'L_leg'+k, body2:'LF_leg'+k, pos1:[0,-10,0], pos2:[0,10,0], axe1:[1,0,0], axe2:[1,0,0], min:2, max:60, collision:collision});
    // this.joints[j++] = world.add({type:"joint", body1:'R_leg'+k, body2:'RF_leg'+k, pos1:[0,-10,0], pos2:[0,10,0], axe1:[1,0,0], axe2:[1,0,0], min:2, max:60, collision:collision});
  }
  
}

function addThreeMesh(size, position, rotation, color, type) {
  var mesh, mat, m2;
  
  if(color===1){ mat = matSphere; }
  else if(color===2){mat = matBox2;}
  else if(color===3){mat = matBox3;}
  else{ mat = matBox;}

  if(type==='sphere'){
    mesh = new THREE.Mesh( geoSphere, mat );
    m2 = new THREE.Mesh( geoSphere2, matHead );
    m2.scale.set(1,1.4,1);
    m2.position.set(0,-0.3,0);
    mesh.add(m2);
  }
  else if(type==='cylinder'){mesh = new THREE.Mesh( geoCylinder, mat );}
  else if(type==='cylinder2'){mesh = new THREE.Mesh( geoCylinder2, mat );}
  else { mesh = new THREE.Mesh( geoBox, mat ); }
  mesh.scale.set( size[0], size[1], size[2] );
  if(position)mesh.position.set( position[0], position[1], position[2] );
  if(rotation)mesh.rotation.set( rotation[0]*ToRad, rotation[1]*ToRad, rotation[2]*ToRad );
  scene.add( mesh );
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}


function clearMesh(){
  var i=meshes.length;
  while (i--) scene.remove(meshes[ i ]);
  i = grounds.length;
  while (i--) scene.remove(grounds[ i ]);
  grounds = [];
  meshes = [];
}

function addStaticBox(size, position, rotation) {
  var matGround = new THREE.MeshPhongMaterial( { color: 0x3D4143,
                                                 transparent:true,
                                                 opacity:0.5,
                                                 shininess: 10 } );
  var mesh = new THREE.Mesh( new THREE.BoxGeometry( size[0], size[1], size[2] ), matGround );
  mesh.position.set( position[0], position[1], position[2] );
  mesh.rotation.set( rotation[0]*ToRad, rotation[1]*ToRad, rotation[2]*ToRad );
  scene.add( mesh );
  grounds.push(mesh);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
}

//----------------------------------
//  TEXTURES
//----------------------------------

function gradTexture(color) {
  var c = document.createElement("canvas");
  var ct = c.getContext("2d");
  var size = 1024;
  c.width = 16; c.height = size;
  var gradient = ct.createLinearGradient(0,0,0,size);
  var i = color[0].length;
  while(i--){ gradient.addColorStop(color[0][i],color[1][i]); }
  ct.fillStyle = gradient;
  ct.fillRect(0,0,16,size);
  var texture = new THREE.Texture(c);
  texture.needsUpdate = true;
  return texture;
}

function basicTexture(n, p){
  var canvas = document.createElement( 'canvas' );
  canvas.width = canvas.height = 64;
  var ctx = canvas.getContext( '2d' );
  var colors = [];
  var grd;
  if(n===0){ // sphere
    colors[0] = "#C8CAC0";
    colors[1] = "#989A90";
  }
  if(n===1){ // sphere sleep
    colors[0] = "#989A90";
    colors[1] = "#585858";
  }
  if(n===2){ // box
    colors[0] = "#AA8058";
    colors[1] = "#FFAA58";
  }
  if(n===3){ // box sleep
    colors[0] = "#383838";
    colors[1] = "#585858";
  }

  if(p) grd=ctx.createLinearGradient(0,0,64,0);
  else grd=ctx.createLinearGradient(0,0,0,64);
  grd.addColorStop(0,colors[1]);
  grd.addColorStop(1,colors[0]);
  
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 64, 64);

  var tx = new THREE.Texture(canvas);
  tx.needsUpdate = true;
  return tx;
}

function initGeometry(material) {
  // const map = new THREE.TextureLoader().load( 'textures/uv_grid_opengl.jpg' );
	// map.wrapS = map.wrapT = THREE.RepeatWrapping;
	// map.anisotropy = 16;

	// const material = new THREE.MeshPhongMaterial( { map: map,
  //                                                 side: THREE.DoubleSide } );

	//
  var object;
	object = new THREE.Mesh( new THREE.SphereGeometry( .75, 20, 10 ), material );
	object.position.set( -3.00, 1.0, 2.00 );
	scene.add( object );

	object = new THREE.Mesh( new THREE.IcosahedronGeometry( .75, 2 ), material );
	object.position.set( -1.00, 1.0, 2.00 );
	scene.add( object );

	object = new THREE.Mesh( new THREE.OctahedronGeometry( .75, 2 ), material );
	object.position.set( 1.00, 1.0, 2.00 );
	scene.add( object );

	object = new THREE.Mesh( new THREE.TetrahedronGeometry( .75, 2 ), material );
	object.position.set( 3.00, 1.0, 2.00 );
	scene.add( object );

	//

	object = new THREE.Mesh( new THREE.PlaneGeometry( 1.00, 1.00, 4, 4 ), material );
	object.position.set( -3.00, 1.0, -2.0 );
	scene.add( object );

	object = new THREE.Mesh( new THREE.BoxGeometry( 1.00, 1.00, 1.00, 4, 4, 4 ), material );
	object.position.set( -1.00, 1.0, -2.0 );
	scene.add( object );

	object = new THREE.Mesh( new THREE.CircleGeometry( .50, 20, 0, Math.PI * 2 ), material );
	object.position.set( 1.00, 1.0, -2.0 );
	scene.add( object );

	object = new THREE.Mesh( new THREE.RingGeometry( .10, .50, 20, 5, 0, Math.PI * 2 ), material );
	object.position.set( 3.00, 1.0, -2.0 );
	scene.add( object );

	//

	object = new THREE.Mesh( new THREE.CylinderGeometry( .25, .75, 1.00, 40, 5 ), material );
	object.position.set( - 3.00, 1.0, 0.0 );
	scene.add( object );

	const points = [];

	for ( let i = 0; i < 50; i ++ ) {

    points.push( new THREE.Vector2( Math.sin( i * 0.2 ) * Math.sin( i * 0.1 ) * .15 + .50, ( i - 5 ) * .02 ) );

	}

	object = new THREE.Mesh( new THREE.LatheGeometry( points, 20 ), material );
	object.position.set( -1.0, 1, 0 );
	scene.add( object );

	object = new THREE.Mesh( new THREE.TorusGeometry( .50, .20, 20, 20 ), material );
	object.position.set( 1.0, 1, 0 );
	scene.add( object );

	object = new THREE.Mesh( new THREE.TorusKnotGeometry( .5, .1, 50, 20 ), material );
	object.position.set( 3.0, 1, 0 );
	scene.add( object );

}

