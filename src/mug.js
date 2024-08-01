
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
		mugComplexity: 50,

		handlePosition: 20, // %
		handleHeight: 6, // cm
		handleSize: 7, // cm
		handleShape: 20, // degrees
		handleWidth: 1.5, // cm
		handleThickness: 0.6, // cm
		handleComplexity: 30,

		simple: false,
		flat: false,
	};


	constructor( params ) {

		super( );

		this.isMug = true;

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
		var mC = Math.floor( params.mugComplexity ), // mug
			hC = Math.floor( params.handleComplexity ); // handle

		// edgess
		var mG = params.simple ? 0 : THREE.MathUtils.clamp( 0.01, 0, 0.48*mW ),
			hG = params.simple ? 0 : 0.48*Math.min( hW, hT );


		// material
		var material = ASSETS.defaultMaterial.clone();
		material.flatShading = params.flat;

		// body

		var points;

		if ( params.simple )
			points = [
				// x,y,		   rad tex
				[ 0, 0 					], // 0 bottom
				[ mBotS*0.9, 0			], // 1
				[ mBotS, 0,		0, 0.1	], // 2
				[ mTopS, mH,	0, 0.5	], // 3 rim
				[ mTopS-mW, mH			], // 4
				[ mBotS-mW, mW,	0, 0.9	], // 5
				[ mBotS-mW*1.1, mW,	0	], // 6
				[ 0, mW 				], // 7 top
			];
		else
			points = [
				// x,y,				rad	  tex
				[ 0, mW/4 						], // 0 bottom
				[ mBotS-2*mW, mW/4,	mG 			], // 1
				[ mBotS-mW, 0, 		mG 			], // 2
				[ mBotS, 0, 		2*mG, 0.1 	], // 3
				[ mTopS, mH, 		mG, 0.5 	], // 4 rim
				[ mTopS-mW, mH, 	mG 			], // 5
				[ mBotS-mW, mW, 	2*mG, 0.9 	], // 6
				[ 0, mW 						], // 7 top
			];

		var bodyGeometry = new ASSETS.LatheUVGeometry( points, mC );
		bodyGeometry.uvIndex = 0;

		// rotate UVs to compensate body rotation
		var uv = bodyGeometry.getAttribute( 'uv' );
		for ( var i=0; i<uv.count; i++ )
			uv.setX( i, uv.getX( i )+1/mC/2 );
		this.body = new THREE.Mesh( bodyGeometry, material );
		this.body.rotation.y = Math.PI/2 + Math.PI/mC;
		this.body.name = 'body';

		this.add( this.body );


		// handle

		var v = new THREE.Vector3();

		var handleProfileShape = new ASSETS.RoundedShape([
			[ 0, hT ],
			[ -hW, hT, hG ],
			[ -hW, -hT, hG ],
			[ hW, -hT, hG ],
			[ hW, hT, hG ],
			[ 0, hT-0.001 ], // fake vertex, later it will match the first vertex
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
			curveSegments: 1,
			steps: hC,
			bevelEnabled: false,
			extrudePath: handleCurve
		} );

		// the handle has caps, remove them
		var capsCount = handleGeometry.groups[ 1 ].start; // number of vectors to remove

		handleGeometry.clearGroups();

		var pos = handleGeometry.attributes.position;
		pos.array = pos.array.slice( 3*capsCount );
		pos.count -= capsCount;

		// smooth the handle

		handleGeometry.deleteAttribute( 'uv' );
		handleGeometry.deleteAttribute( 'normal' );

		handleGeometry = mergeVertices( handleGeometry );

		handleGeometry.uvIndex = 1;

		var rows = hC+1;
		var perRow = handleGeometry.attributes.position.count/rows; // 10

		if ( !params.simple ) {

			var k = 0.3/2,
				s = ( 1-2*k*2 )/6;
			var uMap = [ 0, k, k+s, k+2*s, k+3*s, 3*k+3*s, 3*k+4*s, 3*k+5*s, 3*k+6*s, 4*k+6*s, 4*k+6*s ];

		} else {

			var uMap = [ 0.0, 0.15, 0.35, 0.65, 0.85, 1.0 ];

		}


		handleGeometry.computeVertexNormals();

		var uv = [];

		// first two lines
		for ( var i=0; i<rows; i++ ) {

			uv.push( uMap[ 0 ], i/( rows-1 ) );
			uv.push( uMap[ 1 ], i/( rows-1 ) );

		}

		// next lines
		for ( var j=2; j<perRow; j++ )
			for ( var i=0; i<rows; i++ )
				uv.push( uMap[ j ], i/( rows-1 ) );


		handleGeometry.setAttribute( 'uv', new THREE.Float32BufferAttribute( uv, 2 ) );

		// fix the last column of vertices
		var pos = handleGeometry.getAttribute( 'position' );
		var nor = handleGeometry.getAttribute( 'normal' );
		for ( var i=0; i<rows; i++ ) {

			var j = rows*( perRow-1 )+i;

			v.fromBufferAttribute( pos, 2*i );
			pos.setXYZ( j, v.x, v.y, v.z );

			v.fromBufferAttribute( nor, 2*i );
			nor.setXYZ( j, v.x, v.y, v.z );

		}

		this.handle = new THREE.Mesh( handleGeometry, material );
		this.handle.name = 'handle';

		this.add( this.handle );


		this.position.y = -mH/2;


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
