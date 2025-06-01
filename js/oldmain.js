"use strict";
let scene, renderer, camera, stats, clock;
let agent, world;
let grounds = [];

// Convenient shortcuts for the principal axes
const xAxis = new THREE.Vector3(1,0,0);
const yAxis = new THREE.Vector3(0,1,0);
const zAxis = new THREE.Vector3(0,0,1);
// Coefficients tuned for walking and running
const walkFactor = 1.60;
const runFactor  = 3.50;
// Listen for events from the browser
window.addEventListener( 'load', init );
window.addEventListener( 'resize', onWindowResize );
// Either use the physics engine or use key-frame animations
const usePhysics = false;
const useAnimations = !usePhysics;

//--------------------------------------------------------------------
// Initialize the application / simulation
//--------------------------------------------------------------------
function init() {

  if (usePhysics) {
    world = new OIMO.World( { info: true,
                              gravity: [0, -10, 0],
                              worldscale: 1 } );
    // Manually trigger the physics update
    //setInterval(updateOimoPhysics, 1000/60);
  }
  
  initGraphics();
  initVisor();
  initGround();
  
  agent = new Agent();
  scene.add( agent );
  
	createPanel();

  if (usePhysics) {
    world.play();
  }
  
	animate();

  // console.log(visor);

}
//--------------------------------------------------------------------
// Setup the THREE.js environment
//--------------------------------------------------------------------
function initGraphics() {
	const container = document.getElementById( 'container' );
	clock = new THREE.Clock();

	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0xa0a0a0 );
	// scene.fog = new THREE.Fog( 0xa0a0a0, 50, 100 );

	const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
	hemiLight.position.set( 0, 20, 0 );
	scene.add( hemiLight );

	const dirLight = new THREE.DirectionalLight( 0xffffff );
	dirLight.position.set( 3, 10, 10 );
	dirLight.castShadow = true;
	dirLight.shadow.camera.top = 2;
	dirLight.shadow.camera.bottom = - 2;
	dirLight.shadow.camera.left = - 2;
	dirLight.shadow.camera.right = 2;
	dirLight.shadow.camera.near = 0.1;
	dirLight.shadow.camera.far = 40;
	scene.add( dirLight );
  
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.shadowMap.enabled = true;
	container.appendChild( renderer.domElement );

	// camera
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.set( - 1, 2, 3 );

  // controls
	const controls = new THREE.OrbitControls( camera, renderer.domElement );
	// controls.enablePan = false;
	// controls.enableZoom = false;
	controls.target.set( 0, 1, 0 );
	controls.update();

	stats = new Stats();
	container.appendChild( stats.dom );
}
//--------------------------------------------------------------------
// Create the geometry for the ground plane.
//--------------------------------------------------------------------
function initGround() {
  const groundTex = 'textures/uv_grid_opengl.jpg';
  // const groundTex = 'https://threejs.org/examples/textures/uv_grid_opengl.jpg';
  const map = new THREE.TextureLoader().load( groundTex );
	map.wrapS = map.wrapT = THREE.RepeatWrapping;
	map.anisotropy = 16;
	const material = new THREE.MeshPhongMaterial( { map: map,
                                                  side: THREE.DoubleSide,
                                                  color: 0x999999,
                                                  depthWrite: false } );
  
	// ground plane
  const groundPlane = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100, 10, 10 ), material );
	groundPlane.rotation.x = - Math.PI / 2;
	groundPlane.receiveShadow = true;
  scene.add( groundPlane );

  if (usePhysics) {
    var groundPhysics = world.add( { type: 'box',
                                     size: [300, 20, 300],
                                     pos:[0,-10,0],
                                     move: false } );
  }

  for (let n=0; n<9; ++n) {
    const i = Math.floor(n/3);
    const j = n%3;
    grounds[n] = groundPlane.clone();
    grounds[n].translateX((i-1)*100);
    grounds[n].translateY((j-1)*100);
    scene.add( grounds[n] );
    grounds[n].visible=true;
  }

}
//--------------------------------------------------------------------
// Resize camera viewport when window is resized.
//--------------------------------------------------------------------
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}
//--------------------------------------------------------------------
// Animate the scene
//--------------------------------------------------------------------
let groundVel = 0.0;
let stime = 0;
//--------------------------------------------------------------------
function animate() {

	// Render loop
	requestAnimationFrame( animate );
	stats.update();
  
	// Get the time elapsed since the last frame
  const dt = clock.getDelta();
  stime += dt;
  
  for (let n=0; n<9; ++n) {
    grounds[n].translateY(groundVel * dt );
    if (grounds[n].position.z < -150) grounds[n].translateY(-300);
  }

  if (agent.isLoaded) {
    // Update the agent
    agent.update(stime, dt);
  }
  
  if (usePhysics) {
    if(world != null) world.step();
  }
  
  if (agent.isLoaded) {
    // Render POV into js-visor
    agent.render(scene);
  }

	renderer.render( scene, camera );
  
}

