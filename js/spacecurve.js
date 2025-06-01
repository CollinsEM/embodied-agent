import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 10;

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls( camera, renderer.domElement );
// const loader = new GLTFLoader();

// Create a cube
const cubeGeom = new THREE.BoxGeometry( 1, 1, 1 );
// Create a green wireframe material for the cube
const cubeMat = new THREE.MeshBasicMaterial( { color: 0x00ff00,
                                               wireframe: true } );
// Create a mesh for the cube                                               
const cube = new THREE.Mesh( cubeGeom, cubeMat );
// Add the cube to the scene
// scene.add( cube );

// Create some points that will be rendered as a sequence of line segments
const points = [
  new THREE.Vector3( -1, -1, -1 ),
  new THREE.Vector3(  0, -1, -1 ),
  new THREE.Vector3(  0,  0, -1 ),
  new THREE.Vector3( -1,  0, -1 ),
  
  new THREE.Vector3( -1,  0,  0 ),
  new THREE.Vector3(  0,  0,  0 ),
  new THREE.Vector3(  0, -1,  0 ),
  new THREE.Vector3( -1, -1,  0 ),
  
  new THREE.Vector3( -1, -1,  1 ),
  new THREE.Vector3(  0, -1,  1 ),
  new THREE.Vector3(  0,  0,  1 ),
  new THREE.Vector3( -1,  0,  1 ),
  
  new THREE.Vector3( -1,  1,  1 ),
  new THREE.Vector3(  0,  1,  1 ),
  new THREE.Vector3(  0,  1,  0 ),
  new THREE.Vector3( -1,  1,  0 ),
  
  new THREE.Vector3( -1,  1, -1 ),
  new THREE.Vector3(  0,  1, -1 ),
  
  new THREE.Vector3(  1,  1, -1 ),
  new THREE.Vector3(  1,  0, -1 ),
  new THREE.Vector3(  1,  0,  0 ),
  new THREE.Vector3(  1,  1,  0 ),
  
];
// Create the geometry object for these points
const lineGeom = new THREE.BufferGeometry().setFromPoints( points );
// Create a blue LineBasicMaterial
const lineMat = new THREE.LineBasicMaterial( { color: 0x0000ff } );
// Create a line mesh
const line = new THREE.Line( lineGeom, lineMat );
// Add the line to the scene
scene.add( line );

function animate() {
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
	renderer.render( scene, camera );
}
