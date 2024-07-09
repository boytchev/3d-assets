
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
		plateComplexity: 50, // n

		simple: false,
		flat: false,
	};


	constructor( params ) {

		super( );

		this.isPlate = true;

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
		var pC = Math.floor( params.plateComplexity );

		// roundness of edges
		var pG = THREE.MathUtils.clamp( 0.02, 0, 0.96*pW );

		// material
		var material = ASSETS.defaultMaterial.clone();
		material.flatShading = params.flat;

		// body

		var points;

		if ( params.simple )
			points = [
				// x, y,			rad	tex
				[ 0, 0,						], // 0 bottom
				[ pBotS*0.9, 0,			 	], // 1
				[ pBotS, 0,				 	], // 1
				[ pTopS, pH-pW/2,		 	], // 2
				[ pTopS, pH,		0,	0.5	], // 3 rim
				[ pTopS-pW, pH,				], // 4
				[ pBotS-pW, pW,				], // 5
				[ 0, pW,					], // 6 top
			];
		else
			points = [
				// x, y,			rad	tex
				[ 0, pW/4, 					], // 0 bottom
				[ pBotS-2*pW, pW/4,	pG/2	], // 1
				[ pBotS-pW, 0,		pG/2	], // 2
				[ pBotS, 0,			pG 		], // 3
				[ pTopS, pH-pW/2,	pG 		], // 4
				[ pTopS, pH,		pG, 0.5	], // 5 rim
				[ pTopS-pW, pH,		pG		], // 6
				[ pBotS-pW, pW,		pG 		], // 7
				[ 0, pW,					], // 8 top
			];


		var bodyGeometry = new ASSETS.LatheUVGeometry( points, pC );

		this.body = new THREE.Mesh( bodyGeometry, material );
		this.body.name = 'body';

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
			plateComplexity: Math.floor( ASSETS.mapExp( Math.random(), 4, 120, 0, 1 ) ),

			simple: ASSETS.random( 0, 100 ) < 30,
			flat: ASSETS.random( 0, 100 ) < 30,
		};

	} // Plate.random


} // Plate



export { Plate };
