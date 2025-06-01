"use strict";
let once = true;
var attach = 0;

//--------------------------------------------------------------------
// Fully rigged skeletal model with attached skin geometry
//
// TODO: Update the physical behavior of the agent to accurately
// model its interaction with the environment.
class Agent extends THREE.Group {
  constructor() {
    super();

    // create a stereo camera for POV
    
    this.effect = new StereoEffect();
    this.effect.setSize(500, 350);

    this.mixer  = undefined;
    this.bone   = {};
    this.body   = {};
    this.mesh   = {};
    this.joint  = {};
    this.isLoaded = false;
    this.numBodies = 0;
    
    // Load the xbot avatar assest

    // Online location of model file
    // const avatar = 'https://threejs.org/examples/models/gltf/Xbot.glb';

    // Local location of model file
    const avatar = 'models/gltf/Xbot.glb';
    
	  const loader = new THREE.GLTFLoader();
	  loader.load( avatar, function( gltf ) {
      let model = gltf.scene;
      agent.model = gltf.scene;
      let b = 0;
      //----------------------------------------------
		  model.traverse( function ( object ) {
			  if ( object.isMesh ) {
          // Extract rendered geometry objects
          object.castShadow = true;
          object.layers.enableAll();
          object.material.transparent = true;
          object.material.opacity = 0.35;
          object.visible = true;
        }
        else if ( object.isBone ) {
          // Extract virtual bone objects
          const name = object.name.substring(9);
          agent.bone[b++]  = object;
          agent.bone[name] = object;
        }
      } );

      //----------------------------------------------
      if (useAnimations) {
		    const animations = gltf.animations;
		    agent.mixer = new THREE.AnimationMixer( model );

		    const numAnimations = animations.length;

		    for ( let i = 0; i < numAnimations; ++ i ) {
          
			    let clip = animations[ i ];
          // console.log(clip);
			    const name = clip.name;

			    if ( baseActions[ name ] ) {

				    const action = agent.mixer.clipAction( clip );
				    activateAction( action );
				    baseActions[ name ].action = action;
				    allActions.push( action );

			    }
          else if ( additiveActions[ name ] ) {

				    // Make the clip additive and remove the reference frame

				    THREE.AnimationUtils.makeClipAdditive( clip );

				    if ( clip.name.endsWith( '_pose' ) ) {
					    clip = THREE.AnimationUtils.subclip( clip, clip.name, 2, 3, 30 );
				    }

				    const action = agent.mixer.clipAction( clip );
				    activateAction( action );
				    additiveActions[ name ].action = action;
				    allActions.push( action );

			    }
		    }
      }
      
      //----------------------------------------------
		  let skeleton = new THREE.SkeletonHelper( model );
		  skeleton.visible = true;
	    agent.add( skeleton );

      //----------------------------------------------
      // EYES
      // var eyeGeom = new THREE.SphereGeometry(3.0, 16, 8);
      // eyeGeom.scale(1.0, 1.0, 1.5);
      // var eyeMat = new THREE.MeshBasicMaterial({color: "white"});
      // var eyeL = new THREE.Mesh(eyeGeom, eyeMat);
      // var eyeR = new THREE.Mesh(eyeGeom, eyeMat);
      
      //----------------------------------------------
      // STEREO CAMERA
      agent.effect.setEyeSeparation(agent.bone[7].position.x -
                                    agent.bone[8].position.x );
      // agent.bone[7].add(eyeL);
      // agent.bone[8].add(eyeR);
      agent.bone[7].add(agent.effect.cameraL);
      agent.bone[8].add(agent.effect.cameraR);

      agent.effect.cameraL.rotateOnWorldAxis(yAxis, Math.PI);
      agent.effect.cameraL.translateZ(-3.0);
      agent.effect.cameraR.rotateOnWorldAxis(yAxis, Math.PI);
      agent.effect.cameraR.translateZ(-3.0);

      // const helpL = new THREE.CameraHelper(effect.cameraL);
      // const helpR = new THREE.CameraHelper(effect.cameraR);
      // scene.add(helpL);
      // scene.add(helpR);

      //----------------------------------------------
      agent.add( model );
      agent.isLoaded = true;
      if (usePhysics) agent.initPhysics();
	  } );
    
  }
  
  initPhysics() {
    //----------------------------------------------
    const sphRadius = ( attach < 2 ? 0.01 : 1.0 );
    const sphGeom   = new THREE.SphereGeometry( sphRadius, 32, 16 );
    const sphMat    = new THREE.MeshPhongMaterial( { color: 0xFF << attach*8, // 0xe8b36d,
                                                     name:'sphMat',
                                                     shininess:60,
                                                     specular:0xffffff  } );

    let conns = [];
    let b = 0, m = 0, j = 0;
		this.model.traverse( function ( object ) {
      if ( object.isBone ) {
        const parent = object.parent;
        const name = object.name.substring(9);
        conns.push([parent.name.substring(9), object.name.substring(9)]);
        // console.log(object, object.parent);
        // console.log(object.name,
        //             object.position.x,
        //             object.position.y,
        //             object.position.z);
        // console.log(object.parent.name,
        //             object.parent.position.x,
        //             object.parent.position.y,
        //             object.parent.position.z);
        var pos = new THREE.Vector3(0,0,0);
        object.getWorldPosition(pos);
        
        // console.log(parent, object);
        
        const move = !( name === "Hips" ||
                        name === "LeftEye" ||
                        name === "RightEye" ||
                        name === "LeftShoulder" ||
                        name === "RightShoulder" ||
                        name === "LeftToe_End" ||
                        name === "RightToe_End" );
        
        let body = world.add( { type: 'sphere',
                                size: [ sphRadius, sphRadius, sphRadius ],
                                // pos:  [ pos.x, pos.y, pos.z ],
                                move: true,
                                name: name + "Body",
                                mass: 1.0 } );
        
        body.setPosition(pos);
        
        agent.body[b]           = body;
        agent.body[name]        = body;
        agent.body[name+'Body'] = body;
        
        // if (once) console.log(body);
        
        // var sca = new THREE.Vector3(0,0,0);
        // object.getWorldScale(sca);
        
        const mesh = new THREE.Mesh( sphGeom, sphMat );
        mesh.name = name + "Mesh";
        mesh.position.copy( pos );
        agent.mesh[m]   = mesh;
        agent.mesh[name]= mesh;
        agent.mesh[name+'Mesh']= mesh;
        switch (attach) {
        case 0: scene.add( mesh );      break;
        case 1: object.attach( mesh );  break;
        case 2: object.add( mesh );     break;
        }
        // console.log(mesh);
        b++;
        m++;
      }
    });
    
    agent.numBodies = m;

    var itr = world.rigidBodies;
    while (itr !== null) {
      console.log(itr.name);
      itr = itr.next;
    }

    // var Spine = [ [ "Hips",   "Spine"         ],
    //               [ "Spine",  "Spine1"        ],
    //               [ "Spine1", "Spine2"        ],
    //               [ "Spine2", "LeftShoulder"  ],
    //               [ "Spine2", "RightShoulder" ] ];
    
    for (let i=0; i<conns.length; ++i) {
      const body1 = conns[i][0] + "Body";
      const body2 = conns[i][1] + "Body";
      const bone1 = this.bone[conns[i][0]];
      const bone2 = this.bone[conns[i][1]];
      if (body1 === "Body") continue;
      // console.log(body1, body2, bone1, bone2);
      const p1 = this.body[body1].getPosition();
      const p2 = this.body[body2].getPosition();
      const dp = p2.sub(p1);
      const dist = bone2.position.length();
      // console.log(body1, body2, bone1, bone2, p1, p2, dp, dist);
      var o = { type: 'jointDistance',
                body1: body1,
                body2: body2,
                min: dist/10,
                max: dist/10,
                spring: [10, 0.2],
                collision: true };
      world.add( o );
    }
    // this.model.traverse( function ( object ) {
    //   if ( object.isBone && object.parent.name !== 'Armature' ) {
    //     const parent = object.parent;
    //     const body1 = object.parent.name.substring(9) + "Body";
    //     const body2 = object.name.substring(9) + "Body";
    //     var o = { type: 'jointDistance',
    //               body1: body1,
    //               body2: body2,
    //               pos1: [0,-0.05,0],
    //               pos2: [0, 0.05,0],
    //               axe1: [0,1,0],
    //               axe2: [0,1,0],
    //               min: 0.01, max: 1.0,
    //               spring: [0.5, 0.2],
    //               collision: true };
    //     let joint = world.add( o );
    //     console.log(joint);
    //     agent.joint[j++] = joint;
    //   }
    // } );
  }
  
  update(t, dt) {
    //console.log(t, dt);
    
	  // for ( let i = 0; i !== numAnimations; ++ i ) {
	  // 	 const action = allActions[ i ];
	  // 	 const clip = action.getClip();
	  // 	 const settings = baseActions[ clip.name ] || additiveActions[ clip.name ];
	  // 	 settings.weight = action.getEffectiveWeight();
	  // }

    if (usePhysics) {
      var mesh, body, bone;
      var pos, qua;
      var p = new THREE.Vector3();
      var q = new THREE.Vector3();
      var r = new THREE.Vector3();
      // var q = new THREE.Quaternion();
      for (let i=0; i<this.numBodies; ++i) {
        body = this.body[i];
        mesh = this.mesh[i];
        bone = this.bone[i];
        // if (once) console.log(i, body.position, mesh.position, bone.position, bone.scale);
        if(!body.sleeping){
          pos = body.getPosition(); p.set(pos.x, pos.y, pos.z);
          qua = body.getQuaternion();
          mesh.position.copy(pos);
          mesh.quaternion.copy(qua);
          // bone.position.copy(pos);
          // bone.quaternion.copy(qua);
          // bone.parent.getWorldPosition(q);
          // bone.position.subVectors(p, q);
          // if (once) console.log(p, q, r.subVectors(p, q), bone.position);
        }
      }
      once = false;
    }
    else if (this.mixer) {
	    // Update the animation mixer
	    this.mixer.update( dt );
    }
    
    // this.bone[1].rotation.x = 0.15+0.25*Math.sin(t);
    // this.bone.LeftUpLeg.rotation.x = Math.sin(t);
    // this.bone.LeftLeg.rotation.x = 1-Math.sin(t);
    // this.bone.LeftArm.rotation.x = Math.sin(t)-0.5;
    // this.bone.LeftArm.rotation.y = Math.sin(t)-0.5;
    // this.bone.LeftForeArm.rotation.y = Math.sin(t)-1;
    // this.bone.LeftForeArm.rotation.x = -Math.PI/2
    // this.bone.RightArm.rotation.y = 0.5-Math.sin(t);
    // this.bone.RightForeArm.rotation.x = -Math.PI/2;
    // this.bone.RightForeArm.rotation.y = 1-Math.sin(Math.PI+t);
  }
  // Render the agent in the scene
  render( scene ) {
    this.effect.render( scene );
  }
  
};

const boneKeys = [
  "Hips",
  "Spine",
  "Spine1",
  "Spine2",
  "Neck",
  "Head",
  "HeadTop_End",
  "LeftEye",
  "RightEye",
  "LeftShoulder",
  "LeftArm",
  "LeftForeArm",
  "LeftHand",
  "LeftHandThumb1",
  "LeftHandThumb2",
  "LeftHandThumb3",
  "LeftHandThumb4",
  "LeftHandIndex1",
  "LeftHandIndex2",
  "LeftHandIndex3",
  "LeftHandIndex4",
  "LeftHandMiddle1",
  "LeftHandMiddle2",
  "LeftHandMiddle3",
  "LeftHandMiddle4",
  "LeftHandRing1",
  "LeftHandRing2",
  "LeftHandRing3",
  "LeftHandRing4",
  "LeftHandPinky1",
  "LeftHandPinky2",
  "LeftHandPinky3",
  "LeftHandPinky4",
  "RightShoulder",
  "RightArm",
  "RightForeArm",
  "RightHand",
  "RightHandPinky1",
  "RightHandPinky2",
  "RightHandPinky3",
  "RightHandPinky4",
  "RightHandRing1",
  "RightHandRing2",
  "RightHandRing3",
  "RightHandRing4",
  "RightHandMiddle1",
  "RightHandMiddle2",
  "RightHandMiddle3",
  "RightHandMiddle4",
  "RightHandIndex1",
  "RightHandIndex2",
  "RightHandIndex3",
  "RightHandIndex4",
  "RightHandThumb1",
  "RightHandThumb2",
  "RightHandThumb3",
  "RightHandThumb4",
  "LeftUpLeg",
  "LeftLeg",
  "LeftFoot",
  "LeftToeBase",
  "LeftToe_End",
  "RightUpLeg",
  "RightLeg",
  "RightFoot",
  "RightToeBase",
  "RightToe_End"
];
