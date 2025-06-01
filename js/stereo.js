const _eyeRight = /*@__PURE__*/ new THREE.Matrix4();
const _eyeLeft = /*@__PURE__*/ new THREE.Matrix4();
const _projectionMatrix = /*@__PURE__*/ new THREE.Matrix4();
const DEG2RAD = Math.PI / 180;

class StereoEffect {
	constructor( mountPoint ) {
		this.type = 'StereoCamera';

		this.aspect = 1.0;

		this.eyeSep = 0.064;

		this.cameraL = new THREE.PerspectiveCamera( 90, this.aspect, 0.1, 5000 );
		// this.cameraL.layers.enable( 1 );
		this.cameraL.layers.enableAll();
		// this.cameraL.matrixAutoUpdate = false;

		this.cameraR = new THREE.PerspectiveCamera( 90, this.aspect, 0.1, 5000 );
		// this.cameraR.layers.enable( 2 );
		this.cameraR.layers.enableAll();
		// this.cameraR.matrixAutoUpdate = false;

		this._cache = {
			focus: null,
			fov: null,
			aspect: null,
			near: null,
			far: null,
			zoom: null,
			eyeSep: null
		};
    
	  this.rendererL = new THREE.WebGLRenderer( { antialias: true } );
	  this.rendererL.setPixelRatio( window.devicePixelRatio );
	  // this.rendererL.setSize( window.innerWidth, window.innerHeight );
	  this.rendererL.outputEncoding = THREE.sRGBEncoding;
	  this.rendererL.shadowMap.enabled = true;
    
	  this.rendererR = new THREE.WebGLRenderer( { antialias: true } );
	  this.rendererR.setPixelRatio( window.devicePixelRatio );
	  // this.rendererR.setSize( window.innerWidth, window.innerHeight );
	  this.rendererR.outputEncoding = THREE.sRGBEncoding;
	  this.rendererR.shadowMap.enabled = true;
    
    //----------------------------------------------
    // TF-VISOR
    this.viewL = tfvis.visor().surface({ name: 'left-eye', tab: 'View' });
    this.viewR = tfvis.visor().surface({ name: 'right-eye', tab: 'View' });
    this.viewL.drawArea.appendChild(this.rendererL.domElement);
    this.viewR.drawArea.appendChild(this.rendererR.domElement);
  }
	setEyeSeparation( eyeSep ) {
		this.eyeSep = eyeSep;
  };
	setSize( width, height ) {
		this.rendererL.setSize( width, height );
		this.rendererR.setSize( width, height );
    this.aspect = width/height;
    this.cameraL.aspect = this.aspect;
    this.cameraR.aspect = this.aspect;
	};
	render( scene, camera ) {
		if ( scene && scene.matrixWorldAutoUpdate === true ) {
      scene.updateMatrixWorld();
    }
		if ( camera && camera.parent === null && camera.matrixWorldAutoUpdate === true ) {
      camera.updateMatrixWorld();
      this.update( camera );
    }
		this.rendererL.render( scene, this.cameraL );
		this.rendererR.render( scene, this.cameraR );
  };
	update( camera ) {

		const cache = this._cache;

		const needsUpdate = cache.focus !== camera.focus || cache.fov !== camera.fov ||
			cache.aspect !== camera.aspect * this.aspect || cache.near !== camera.near ||
			cache.far !== camera.far || cache.zoom !== camera.zoom || cache.eyeSep !== this.eyeSep;

		if ( needsUpdate ) {

			cache.focus = camera.focus;
			cache.fov = camera.fov;
			cache.aspect = camera.aspect * this.aspect;
			cache.near = camera.near;
			cache.far = camera.far;
			cache.zoom = camera.zoom;
			cache.eyeSep = this.eyeSep;

			// Off-axis stereoscopic effect based on
			// http://paulbourke.net/stereographics/stereorender/

			_projectionMatrix.copy( camera.projectionMatrix );
			const eyeSepHalf = cache.eyeSep / 2;
			const eyeSepOnProjection = eyeSepHalf * cache.near / cache.focus;
			const ymax = ( cache.near * Math.tan( DEG2RAD * cache.fov * 0.5 ) ) / cache.zoom;
			let xmin, xmax;

			// translate xOffset

			_eyeLeft.elements[ 12 ] = - eyeSepHalf;
			_eyeRight.elements[ 12 ] = eyeSepHalf;

			// for left eye

			xmin = - ymax * cache.aspect + eyeSepOnProjection;
			xmax = ymax * cache.aspect + eyeSepOnProjection;

			_projectionMatrix.elements[ 0 ] = 2 * cache.near / ( xmax - xmin );
			_projectionMatrix.elements[ 8 ] = ( xmax + xmin ) / ( xmax - xmin );

			this.cameraL.projectionMatrix.copy( _projectionMatrix );

			// for right eye

			xmin = - ymax * cache.aspect - eyeSepOnProjection;
			xmax = ymax * cache.aspect - eyeSepOnProjection;

			_projectionMatrix.elements[ 0 ] = 2 * cache.near / ( xmax - xmin );
			_projectionMatrix.elements[ 8 ] = ( xmax + xmin ) / ( xmax - xmin );

			this.cameraR.projectionMatrix.copy( _projectionMatrix );

		}

		this.cameraL.matrixWorld.copy( camera.matrixWorld ).multiply( _eyeLeft );
		this.cameraR.matrixWorld.copy( camera.matrixWorld ).multiply( _eyeRight );

	}
}
