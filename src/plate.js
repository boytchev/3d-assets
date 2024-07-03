
//	3D Assets: Plate



import * as THREE from 'three';
import * as ASSETS from './assets-utils.js';




class Plate extends THREE.Group {

	static name = 'Plate';

	static defaults = {

		plateHeight: 1.6, // cm
		plateSize: 18, // cm
		plateShape: 25, // degrees
		plateWidth: 0.3, // cm
		plateComplexity: 70, // pertentage

		edges: true,
		flat: false,
	};


	constructor( params ) {

		super( );

		this.generate( params );

	}


	generate( params ) {

		this.dispose( );

		var // plate primary parameters
			pH = ASSETS.cm( params.plateHeight ),
			pS = ASSETS.cm( params.plateSize ),
			pSh = ASSETS.slope( params.plateShape ),
			pW = ASSETS.cm( params.plateWidth ),

			// plate derivative parameters
			pBotS = pS/2*( 1-pSh ), // plate bottom size
			pTopS = pS/2; // plate top size

		// complexities
		var pC = Math.floor( ASSETS.mapExp( params.plateComplexity, 4, 140 ) );

		// edgess
		var pG = params.edges ? THREE.MathUtils.clamp( 0.01, 0, 0.48*pW ) : 0;


		// material
		var material = ASSETS.defaultMaterial.clone();
		material.flatShading = params.flat;

		// body

		var points = [ ];

		if ( params.edges )
			points.push(
				[ 0, pW/4 ], //0a
				[ pBotS-2*pW, pW/4, pG ], // 1, concave bottom
				[ pBotS-pW, 0, pG ], // 2
			);
		else
			points.push([ 0, 0 ]); // 0b, flat bottom

		points.push(
			[ pBotS, 0, 2*pG ], // 3
			[ pTopS, pH-pW/2, 2*pG ], // 4
			[ pTopS, pH, 2*pG ], // 5
			[ pTopS-pW, pH, 2*pG ], // 6
			[ pBotS-pW, pW, 2*pG ], // 7
			[ 0, pW ], // 8
		);


		var bodyShape = new ASSETS.RoundedShape( points, true );

		var bodyGeometry = new THREE.LatheGeometry( bodyShape.getPoints( 4 ), pC );

		// set uv
		var pos = bodyGeometry.getAttribute( 'position' ),
			uv = bodyGeometry.getAttribute( 'uv' );

		var v = new THREE.Vector3(); // temp
		var maxDist = pTopS+pH; // from 0b to 5

		for ( var i=0; i<pos.count; i++ ) {

			v.fromBufferAttribute( pos, i );

			var dist = ( v.x**2+v.z**2 )**0.5 + Math.abs( v.y );

			if ( uv.getY( i )<0.6 ) {

				// bottom of plate
				uv.setY( i, 0.5-0.5*( 1-dist/maxDist ) );

			} else {

				// top of plate
				uv.setY( i, 0.5+0.5*( 1-dist/maxDist ) );

			}

		}

		this.body = new THREE.Mesh( bodyGeometry, material );
		this.body.name = 'body';
		this.body.rotation.y = Math.PI/2 + Math.PI/pC;

		this.position.y = -pH/2;

		this.add( this.body );

	} // Plate.constructor


	dispose( ) {

		this.body?.geometry.dispose( );
		this.clear( );

	} // Plate.dispose


	// returns a set of random parameters
	static random( ) {

		return {
			plateHeight: ASSETS.random( 0.5, 5 ),
			plateSize: ASSETS.random( 6, 30 ),
			plateShape: ASSETS.random( 0, 35, 1 ),
			plateWidth: ASSETS.random( 0.3, 1, 3 ),
			plateComplexity: ASSETS.random( 0, 50 )+ASSETS.random( 0, 50 ),

			edges: ASSETS.random( 0, 100 ) > 30,
			flat: ASSETS.random( 0, 100 ) < 30,
		};

	} // Plate.random


} // Plate



export { Plate };
