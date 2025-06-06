let logPhysics;

const crossFadeControls = [];

var currentBaseAction = 'idle';
const allActions = [];
const baseActions = {
	idle: { weight: 1 },
	walk: { weight: 0 },
	run: { weight: 0 }
};
const additiveActions = {
	sneak_pose: { weight: 0 },
	sad_pose: { weight: 0 },
	agree: { weight: 0 },
	headShake: { weight: 0 }
};
var panelSettings;

//--------------------------------------------------------------------
// Initialize the TFJS-visor interface
//--------------------------------------------------------------------
function initVisor() {
  visor = tfvis.visor();
  // Debug info from the physics engine
  logPhysics = visor.surface({
    name: 'physics',
    tab: 'Console'
  });
  let base = visor.surface({
    name: 'Base Actions',
    tab: 'Controls'
  });
  let additive = visor.surface({
    name: 'Additive Action Weights',
    tab: 'Controls'
  });
  let speed = visor.surface({
    name: 'General Speed',
    tab: 'Controls'
  });
  // console.log(base);
  // console.log(panel);
  // console.log(speed);

	panelSettings = {
		'modify time scale': 1.0
	};

  const baseNames = [ "none", ...Object.keys( baseActions ) ];
  
  const baseSelect = document.createElement('select');
  baseNames.forEach( function(name) {
    const dom = document.createElement('option');
    dom.type = "radio";
    dom.name = "base actions";
    dom.id = name;
    dom.value = name;
    dom.label = name;
    baseSelect.appendChild(dom);
  } );
	baseSelect.addEventListener( 'change', function (event) {
    console.log(event.target.value);
    const name = event.target.value;
		const currentSettings = baseActions[ currentBaseAction ];
		const currentAction = currentSettings ? currentSettings.action : null;
		const nextAction = baseActions[ name ] ? baseActions[ name ].action : null;
		prepareCrossFade( currentAction, nextAction, 0.35 );
    switch (name) {
    case 'walk':
      groundVel = walkFactor*agent.mixer.timeScale; break;
    case 'run':
      groundVel = runFactor*agent.mixer.timeScale; break;
    default:
      groundVel = 0.0;
    }
  } );
  base.drawArea.appendChild(baseSelect);

  // const additiveSelect = document.createElement('select');
  Object.keys(additiveActions).forEach( function(name) {
    const dom = document.createElement('input');
    dom.type  = "range";
    dom.name  = name;
    dom.id    = name;
    dom.label = name;
    dom.min   = 0.0;
    dom.max   = 1.0;
    dom.value = 0.0;
    dom.step  = 0.01;
    const lbl = document.createElement('label');
    lbl.innerHTML = name;
    additive.drawArea.appendChild(dom);
    additive.drawArea.appendChild(lbl);
    additive.drawArea.appendChild(document.createElement('br'));
	  dom.addEventListener( 'change', function (event) {
      console.log(event.target.value);
      const weight = event.target.value;
			setWeight( additiveActions[name].action, weight );
			additiveActions[name].action.weight = weight;
      // const name = event.target.value;
		  // const currentSettings = additiveActions[ currentAdditiveAction ];
		  // const currentAction = currentSettings ? currentSettings.action : null;
		  // const nextAction = additiveActions[ name ] ? additiveActions[ name ].action : null;
		  // prepareCrossFade( currentAction, nextAction, 0.35 );
    } );
  } );
  visor.close();
}


function createPanel() {

	const panel = new dat.GUI( { width: 310 } );

	const folder1 = panel.addFolder( 'Base Actions' );
	const folder2 = panel.addFolder( 'Additive Action Weights' );
	const folder3 = panel.addFolder( 'General Speed' );

	panelSettings = {
		'modify time scale': 1.0
	};

	const baseNames = [ 'None', ...Object.keys( baseActions ) ];

	for ( let i = 0, l = baseNames.length; i !== l; ++ i ) {
		const name = baseNames[ i ];
		const settings = baseActions[ name ];
		panelSettings[ name ] = function () {

			const currentSettings = baseActions[ currentBaseAction ];
			const currentAction = currentSettings ? currentSettings.action : null;
			const action = settings ? settings.action : null;

			prepareCrossFade( currentAction, action, 0.35 );
      
      switch (name) {
      case 'walk':
        groundVel = walkFactor*agent.mixer.timeScale; break;
      case 'run':
        groundVel = runFactor*agent.mixer.timeScale; break;
      default:
        groundVel = 0.0;
      }

		};

		crossFadeControls.push( folder1.add( panelSettings, name ) );

	}

	for ( const name of Object.keys( additiveActions ) ) {

		const settings = additiveActions[ name ];

		panelSettings[ name ] = settings.weight;
		folder2.add( panelSettings, name, 0.0, 1.0, 0.01 ).listen()
      .onChange( function ( weight ) {
			  setWeight( settings.action, weight );
			  settings.weight = weight;
		  } );

	}

	folder3.add( panelSettings, 'modify time scale', 0.0, 1.5, 0.01 ).onChange( modifyTimeScale );

	folder1.open();
	folder2.open();
	folder3.open();

	crossFadeControls.forEach( function ( control ) {

		control.classList1 = control.domElement.parentElement.parentElement.classList;
		control.classList2 = control.domElement.previousElementSibling.classList;

		control.setInactive = function () {

			control.classList2.add( 'control-inactive' );

		};

		control.setActive = function () {

			control.classList2.remove( 'control-inactive' );

		};

		const settings = baseActions[ control.property ];

		if ( ! settings || ! settings.weight ) {

			control.setInactive();

		}

	} );

}

function activateAction( action ) {

	const clip = action.getClip();
	const settings = baseActions[ clip.name ] || additiveActions[ clip.name ];
	setWeight( action, settings.weight );
	action.play();

}

function modifyTimeScale( speed ) {

	agent.mixer.timeScale = speed;

  switch (currentBaseAction) {
  case 'walk':
    groundVel = walkFactor*agent.mixer.timeScale; break;
  case 'run':
    groundVel = runFactor*agent.mixer.timeScale; break;
  default:
    groundVel = 0.0;
  }
  
}

function prepareCrossFade( startAction, endAction, duration ) {

	// If the current action is 'idle', execute the crossfade immediately;
	// else wait until the current action has finished its current loop

	if ( currentBaseAction === 'idle' || ! startAction || ! endAction ) {

		executeCrossFade( startAction, endAction, duration );

	} else {

		synchronizeCrossFade( startAction, endAction, duration );

	}

	// Update control colors

	if ( endAction ) {

		const clip = endAction.getClip();
		currentBaseAction = clip.name;

	} else {

		currentBaseAction = 'None';

	}

	crossFadeControls.forEach( function ( control ) {

		const name = control.property;

		if ( name === currentBaseAction ) {

			control.setActive();

		} else {

			control.setInactive();

		}

	} );

}

function synchronizeCrossFade( startAction, endAction, duration ) {

	agent.mixer.addEventListener( 'loop', onLoopFinished );

	function onLoopFinished( event ) {

		if ( event.action === startAction ) {

			agent.mixer.removeEventListener( 'loop', onLoopFinished );

			executeCrossFade( startAction, endAction, duration );

		}

	}

}

function executeCrossFade( startAction, endAction, duration ) {

	// Not only the start action, but also the end action must get a weight of 1 before fading
	// (concerning the start action this is already guaranteed in this place)

	if ( endAction ) {

		setWeight( endAction, 1 );
		endAction.time = 0;

		if ( startAction ) {

			// Crossfade with warping

			startAction.crossFadeTo( endAction, duration, true );

		} else {

			// Fade in

			endAction.fadeIn( duration );

		}

	} else {

		// Fade out

		startAction.fadeOut( duration );

	}

}

// This function is needed, since animationAction.crossFadeTo() disables its start action and sets
// the start action's timeScale to ((start animation's duration) / (end animation's duration))

function setWeight( action, weight ) {
  
  if (action) {
	  action.enabled = true;
	  action.setEffectiveTimeScale( 1 );
	  action.setEffectiveWeight( weight );
  }
  
}

