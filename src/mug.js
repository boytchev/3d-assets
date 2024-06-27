
//	Assets: Mug



import * as THREE from 'three';
import * as ASSETS from './assets-utils.js';



class Mug extends THREE.Group {

	static name = 'Mug';

	static defaults = {

		mugHeight: 10, // cm
		mugSize: 8, // cm
		mugShape: 0, // degrees
		mugWidth: 0.4, // cm

		handlePosition: 20, // %
		handleHeight: 6, // cm
		handleSize: 7, // cm
		handleShape: 20, // degrees
		handleWidth: 1.5, // cm
		handleThickness: 0.6, // cm

		complexity: 70,
		complexityHandle: 70,
	};

	constructor( { params } ) {

		super( );


		var // mug primary parameters
			mH = ASSETS.cm( params.mugHeight ),
			mS = ASSETS.cm( params.mugSize ),
			mSh = ASSETS.slope( params.mugShape ),
			mW = ASSETS.cm( params.mugWidth ),

			// mug derivative parameters
			mBotS = mS/2*( 1-mSh ), // mug bottom size
			mTopS = mS/2*( 1+mSh ), // mug bottom size

			// handle primary parameters
			hH = Math.min( ASSETS.cm( params.handleHeight ), mH-0.02 ),
			hS = ASSETS.cm( params.handleSize ),
			hSh = ASSETS.slope( params.handleShape ),
			hW = ASSETS.cm( params.handleWidth )/2,
			hP = ASSETS.map( params.handlePosition, hH/2+0.01, mH-hH/2-0.01, -100, 100 ),
			hT = ASSETS.cm( params.handleThickness )/2,

			// handle derivative parameters
			hBotS = hS/2*( 1-hSh ), // handle bottom size
			hTopS = hS/2*( 1+hSh ), // handle top size
			hBotH = hP - hH/2, // handle bottom height
			hTopH = hP + hH/2; // handle top height


		// complexities
		var mC = Math.floor( ASSETS.mapExp( params.complexity, 6, 100 ) ),
			hC = Math.floor( ASSETS.mapExp( params.complexityHandle, 10, 100 ) ),
			hC2 = Math.floor( ASSETS.mapExp( params.complexityHandle, 2, 12 ) );

		// roundness
		var mG = THREE.MathUtils.clamp( 0.01, 0, 0.48*mW ),
			hG = 0.48*Math.min( hW, hT );


		// body

		var bodyShape = new ASSETS.RoundedShape([
			[ 0, mW ],
			[ mBotS-mW, mW, 2*mG ],
			[ mTopS-mW, mH, mG ],
			[ mTopS, mH, mG ],
			[ mBotS, 0, 2*mG ],
			[ mBotS-mW, 0, mG ],
			[ mBotS-2*mW, mW/4, mG ],
			[ 0, mW/4 ],
		]);

		var bodyGeometry = new THREE.LatheGeometry( bodyShape.getPoints( 6 ), mC );

		this.body = new THREE.Mesh( bodyGeometry, ASSETS.defaultMaterial );
		this.body.rotation.y = Math.PI/2 + Math.PI/mC;

		this.add( this.body );


		// handle

		var handleProfileShape = new ASSETS.RoundedShape([
			[ 0, hT ],
			[ -hW, hT, hG ],
			[ -hW, -hT, hG ],
			[ hW, -hT, hG ],
			[ hW, hT, hG ],
			[ 0, hT ],
		]);

		var apotem = Math.cos( Math.PI/mC ); // low-poly reduces size

		var hBotX = ASSETS.map( hBotH, mBotS, mTopS, 0, mH )*apotem-0.0013; // x of handle bottom
		var hTopX = ASSETS.map( hTopH, mBotS, mTopS, 0, mH )*apotem-0.0013; // x of handle top
		var hMaxX = Math.max( hBotX, hTopX );

		var handleCurve = new THREE.CubicBezierCurve3(
			new THREE.Vector3( hBotX, hBotH, 0 ),
			new THREE.Vector3( hMaxX+hBotS, hBotH, 0 ),
			new THREE.Vector3( hMaxX+hTopS, hTopH, 0 ),
			new THREE.Vector3( hTopX, hTopH, 0 ),
		 );

		var handleGeometry = new THREE.ExtrudeGeometry( handleProfileShape, {
			curveSegments: hC2,
			steps: hC,
			bevelEnabled: false,
			extrudePath: handleCurve
		} );

		this.handle = new THREE.Mesh( handleGeometry, ASSETS.defaultMaterial );

		this.add( this.handle );

		this.position.set( 0, -mH/2, 0 );

	} // Mug.constructor


	dispose( ) {

		this.body.geometry.dispose( );
		this.body.material.dispose( );

	} // Mug.dispose


	// returns a set of random parameters
	static random( ) {
		return {
			mugHeight: ASSETS.random(7,20),
			mugSize: ASSETS.random(6,12),
			mugShape: ASSETS.random(-15,15,1),
			mugWidth: ASSETS.random(0.3,1,3),

			handlePosition: ASSETS.random(-100,100,0),
			handleHeight: ASSETS.random(3,18),
			handleSize: ASSETS.random(3,10),
			handleShape: ASSETS.random(-40,40,1),
			handleWidth: ASSETS.random(1,2),
			handleThickness: ASSETS.random(0.3,1),

			complexity: ASSETS.random(0,50)+ASSETS.random(0,50),
			complexityHandle: ASSETS.random(0,50)+ASSETS.random(0,50),
		};
	} // Mug.random


} // Mug



export { Mug };
