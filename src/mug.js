
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
				[ 0, mW/4 ], // 0a
				[ mBotS-2*mW, mW/4, mG ], // 1, concave bottom
				[ mBotS-mW, 0, mG ], // 2
			);
		else
			points.push([ 0, 0 ]); // 0b, flat bottom

		points.push(
			[ mBotS, 0, 2*mG ], // 3
			[ mTopS, mH, mG ], // 4
			[ mTopS-mW, mH, mG ], // 5
			[ mBotS-mW, mW, 2*mG ], // 6
			[ 0, mW ], // 7
		);


		var bodyShape = new ASSETS.RoundedShape( points );

		const POINTS = 6;
		var bodyGeometry = new THREE.LatheGeometry( bodyShape.getPoints( POINTS-1 ), mC );

		// set body uv
		var pos = bodyGeometry.getAttribute( 'position' ),
			uv = bodyGeometry.getAttribute( 'uv' );

		var v = new THREE.Vector3(); // temp
		var maxDist = mTopS+mH; // 7 to 5

		var outterRim = params.edges ? 3.5*POINTS+1 : 3;

		for ( var i=0; i<pos.count; i++ ) {

			var j = i % ( pos.count/( mC+1 ) ); // point index along the curve [0,6*POINTS+2)

			v.fromBufferAttribute( pos, i );

			var dist = ( v.x**2+v.z**2 )**0.5 + Math.abs( v.y ) + mW/6; // mW.6 is experimentally found

			var u = uv.getX( i )+0.5/mC;

			if ( j < outterRim ) {

				// outside the mug
				uv.setXY( i, u, 0.5-0.5*( 1-dist/maxDist ) );

			} else {

				// inside the mug
				uv.setXY( i, u, 0.5+0.5*( 1-dist/maxDist ) );

			}

		}

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

		// the handle has caps, remove them
		var capsCount = handleGeometry.groups[ 1 ].start; // number of vectors to remove

		var attr;
		handleGeometry.clearGroups();

		attr = handleGeometry.attributes.position;
		attr.array = attr.array.slice( 3*capsCount );
		attr.count -= capsCount;

		attr = handleGeometry.attributes.normal;
		attr.array = attr.array.slice( 3*capsCount );
		attr.count -= capsCount;

		attr = handleGeometry.attributes.uv;
		attr.array = attr.array.slice( 2*capsCount );
		attr.count -= capsCount;

		handleGeometry.deleteAttribute( 'uv' );
		handleGeometry.deleteAttribute( 'normal' );

		handleGeometry = mergeVertices( handleGeometry );


		var rows = hC+1;
		var perRow = handleGeometry.attributes.position.count/rows; // 9

		if ( params.edges ) {

			var k = 0.1*2/3;
			var uMap = [ 0.0, k, 2*k, 3*k, 0.5, 0.5+k, 0.5+2*k, 0.5+3*k, 1.0 ];

		} else {

			var uMap = [ 0.0, 0.2, 0.5, 0.7, 1.0 ];

		}

		// remove the last stripe
		handleGeometry.index.count -= 6*hC;
		handleGeometry.index.array = handleGeometry.index.array.slice( 0, handleGeometry.index.count );
		handleGeometry = mergeVertices( handleGeometry );

		// update position to close the shape
		var pos = handleGeometry.getAttribute( 'position' );
		for ( var i=0; i<rows; i++ ) {

			v.fromBufferAttribute( pos, 2*i );
			pos.setXYZ( ( perRow-1 )*rows+i, v.x, v.y, v.z );

		}

		handleGeometry.computeVertexNormals();

		var nor = handleGeometry.getAttribute( 'normal' );
		for ( var i=0; i<rows; i++ ) {

			v.fromBufferAttribute( nor, ( perRow-2 )*rows+i );
			nor.setXYZ( ( perRow-1 )*rows+i, v.x, v.y, -v.z );
			nor.setXYZ( 2*i, v.x, v.y, -v.z );

		}


		// attr is uv
		var uv = [];

		// first two lines
		for ( var i=0; i<rows; i++ ) {

			uv.push( uMap[ 0 ], i/( rows-1 ) );
			uv.push( uMap[ 1 ], i/( rows-1 ) );

		}

		// next lines
		for ( var j=2; j<perRow; j++ )
			for ( var i=0; i<rows; i++ ) {

				uv.push( uMap[ j ], i/( rows-1 ) );

			}

		handleGeometry.setAttribute( 'uv', new THREE.Float32BufferAttribute( uv, 2 ) );

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
