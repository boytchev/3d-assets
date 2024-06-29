
//	Assets: Plate



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
				[ 0, pW/4 ],
				[ pBotS-2*pW, pW/4, pG ], // concave bottom
			);
		else
			points.push([ 0, 0 ]); // flat bottom

		points.push(
			[ pBotS-pW, 0, pG ],
			[ pBotS, 0, 2*pG ],
			[ pTopS, pH-pW/2, 2*pG ],
			[ pTopS, pH, 2*pG ],
			[ pTopS-pW, pH, 2*pG ],
			[ pBotS-pW, pW, 2*pG ],
			[ 0, pW ],
		);

		var bodyShape = new ASSETS.RoundedShape( points, true );

		var bodyGeometry = new THREE.LatheGeometry( bodyShape.getPoints( 6 ), pC );


		this.body = new THREE.Mesh( bodyGeometry, material );
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
