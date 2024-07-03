
//	3D Assets: Mug



import * as THREE from 'three';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import * as ASSETS from './assets-utils.js';



class Mug extends THREE.Group {

	static name = 'Mug';

	static defaults = {

		mugHeight: 10, // cm
		mugSize: 8, // cm
		mugShape: 0, // degrees
		mugWidth: 0.4, // cm
		mugComplexity: 70,

		handlePosition: 20, // %
		handleHeight: 6, // cm
		handleSize: 7, // cm
		handleShape: 20, // degrees
		handleWidth: 1.5, // cm
		handleThickness: 0.6, // cm
		handleComplexity: 70,

		edges: true,
		flat: false,
	};


	constructor( params ) {

		super( );

		this.generate( params );

	}


	generate( params ) {

		this.dispose( );

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
		var mC = Math.floor( ASSETS.mapExp( params.mugComplexity, 6, 100 ) ),
			hC = Math.floor( ASSETS.mapExp( params.handleComplexity, 3, 100 ) ),
			hC2 = Math.floor( ASSETS.mapExp( params.handleComplexity, 2, 12 ) );

		// edgess
		var mG = params.edges ? THREE.MathUtils.clamp( 0.01, 0, 0.48*mW ) : 0,
			hG = params.edges ? 0.48*Math.min( hW, hT ) : 0;


		// material
		var material = ASSETS.defaultMaterial.clone();
		material.flatShading = params.flat;

		// body

		var points = [];

		if ( params.edges )
			points.push(
				[ 0, mW/4 ],
				[ mBotS-2*mW, mW/4, mG ], // concave bottom
				[ mBotS-mW, 0, mG ],
			);
		else
			points.push([ 0, 0 ]); // flat bottom

		points.push(
			[ mBotS, 0, 2*mG ],
			[ mTopS, mH, mG ],
			[ mTopS-mW, mH, mG ],
			[ mBotS-mW, mW, 2*mG ],
			[ 0, mW ],
		);


		var bodyShape = new ASSETS.RoundedShape( points );

		var bodyGeometry = new THREE.LatheGeometry( bodyShape.getPoints( 6 ), mC );

		this.body = new THREE.Mesh( bodyGeometry, material );
		this.body.rotation.y = Math.PI/2 + Math.PI/mC;
		this.body.name = 'body';

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
			curveSegments: 1+0*hC2,
			steps: hC,
			bevelEnabled: false,
			extrudePath: handleCurve
		} );

		handleGeometry.deleteAttribute( 'uv' );

		// a hack to make handle normals good
		// otherwise the caps destroy some of the side normals
		var nor = handleGeometry.getAttribute( 'normal' );
		var pos = handleGeometry.getAttribute( 'position' );
		for ( var i=0; i<nor.count; i++ )
			if ( nor.getX( i ) >-0.9 || ( pos.getY( i )<hTopH-hT-0.001 && pos.getY( i )>hBotH+hT+0.001 ) )
			//if( nor.getX(i) >-0.99  )
				nor.setXYZ( i, 1, 0, 0 );
		handleGeometry = mergeVertices( handleGeometry );
		handleGeometry.computeVertexNormals();

		this.handle = new THREE.Mesh( handleGeometry, material );
		this.handle.name = 'handle';

		this.position.y = -mH/2;

		this.add( this.handle );

	} // Mug.constructor


	dispose( ) {

		this.body?.geometry.dispose( );
		this.handle?.geometry.dispose( );
		this.clear( );

	} // Mug.dispose


	// returns a set of random parameters
	static random( ) {

		return {
			mugHeight: ASSETS.random( 7, 20 ),
			mugSize: ASSETS.random( 6, 12 ),
			mugShape: ASSETS.random( -15, 15, 1 ),
			mugWidth: ASSETS.random( 0.3, 1, 3 ),

			handlePosition: ASSETS.random( -100, 100, 0 ),
			handleHeight: ASSETS.random( 3, 18 ),
			handleSize: ASSETS.random( 3, 10 ),
			handleShape: ASSETS.random( -40, 40, 1 ),
			handleWidth: ASSETS.random( 1, 2 ),
			handleThickness: ASSETS.random( 0.3, 1 ),

			mugComplexity: ASSETS.random( 0, 50 )+ASSETS.random( 0, 50 ),
			handleComplexity: ASSETS.random( 0, 50 )+ASSETS.random( 0, 50 ),

			edges: ASSETS.random( 0, 100 ) > 30,
			flat: ASSETS.random( 0, 100 ) < 30,
		};

	} // Mug.random


} // Mug



export { Mug };
