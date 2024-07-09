
//	3D Assets: WineBottle



import * as THREE from 'three';
import * as ASSETS from './assets-utils.js';




class WineBottle extends THREE.Group {

	static name = 'Wine Bottle';

	static defaults = {

		bottleHeight: 25, // cm
		bottleSize: 6, // cm
		bottleBulge: 0, // %
		bottleComplexity: 50, // n

		puntHeight: 1, // cm

		neckHeight: 5.5, // cm
		neckSize: 2, // cm
		neckSmooth: 3.5, // cm

		topHeight: 0.4, // cm
		topSize: 0.2, // cm
		topOffset: 0.2, // cm

		opened: true,
		simple: false,
		flat: false,
	};


	constructor( params ) {

		super( );

		this.isWineBottle = true;

		this.generate( params );

	}


	generate( params ) {

		this.dispose( );

		var // bottle primary parameters
			bH = ASSETS.cm( params.bottleHeight ),
			bS = ASSETS.cm( params.bottleSize )/2,
			bW = ASSETS.cm( 0.2 ),

			// bottle derivative parameters

			bB = bS * ( 1 + ASSETS.percent( params.bottleBulge ) ); // bottle bulge

		var // punt primary parameters
			pH = ASSETS.cm( params.puntHeight );

		var // neck primary parameters
			nH = ASSETS.cm( params.neckHeight ),
			nS = ASSETS.cm( params.neckSize )/2,
			nSm = ASSETS.cm( params.neckSmooth );

		nH = Math.min( nH, bH-nSm-0.02 );

		var // top primary parameters
			tH = ASSETS.cm( params.topHeight ),
			tS = ASSETS.cm( params.topSize ),
			tO = ASSETS.cm( params.topOffset );



		// complexities
		var bC = Math.floor( params.bottleComplexity );

		// roundness of edges
		var pG = 0.015;

		// material
		var material = ASSETS.defaultMaterial.clone();
		material.flatShading = params.flat;

		// body

		var points;
		const AUTO = ASSETS.AUTO;

		if ( params.simple )
			points = [
				// x, y,			rad	tex act div
				[ 0, 0, 					], // 0 bottom
				[ bS*0.9, 0,		0, 0.1			], // 1 bottom rim
				[ bS, 0,		0, 0.1			], // 1 bottom rim
				[ bB, bH-nH-nSm,	nSm, AUTO, true, 3			], // 3
				[ nS, bH-nH,	0			], // 3
				[ nS, bH,		0, params.opened?AUTO:0.9 			], // 3

				[ nS-bW, bH,		0, AUTO, params.opened 			], // 3
				[ nS-bW, bH-nH,	0, AUTO, params.opened			], // 3
				[ bB-bW, bH-nH-nSm,	nSm, AUTO, params.opened, 3			], // 3
				[ bS-bW, bW,		0,	0.9, params.opened		], // 1 bottom rim
				[ bS*0.9-bW, bW,		0,	0.9, params.opened		], // 1 bottom rim
				[ 0, bW,		0,	AUTO, params.opened		], // 1 bottom rim


				[ nS*0.9, bH, 0, 1, !params.opened			 		], // 4
				[ 0, bH, 0, 1, !params.opened			 		], // 4
			];
		else
			points = [
				// x, y,			rad	tex act div
				[ 0, pH, 						], // 0 bottom
				[ 1*bS/5, pH, 		pH			], // 1
				[ 3*bS/5, 0, 		pH			], // 2
				[ bS, 0,			pG, 0.1			], // 3 bttom rim
				[ bB, bH-nH-nSm,	nSm, AUTO, true, 12	], // 3
				[ nS, bH-nH,		pG/2,	], // 3
				[ nS, bH-tO-tH,		pG/2,	], // 3
				[ nS+tS, bH-tO-tH,		pG/2,	], // 3
				[ nS+tS, bH-tO,		pG/2,	], // 3
				[ nS, bH-tO,		pG/2,	], // 3
				[ nS, bH,			0, params.opened?AUTO:0.9 			], // 3

				[ nS-bW, bH,		0, AUTO, params.opened	 		], // 4
				[ nS-bW, bH-nH,		0, AUTO, params.opened	 		], // 4
				[ bB-bW, bH-nH-nSm,	nSm, AUTO, params.opened, 12	], // 3
				[ bS-bW, bW,			pG, 0.9, params.opened			], // 3 bttom rim
				[ 3*bS/5+bW, bW, 		pH, AUTO, params.opened			], // 2
				[ 1*bS/5, pH+bW, 		pH, AUTO, params.opened			], // 1
				[ 0, pH+bW,				0, AUTO, params.opened		], // 3 bttom rim

				[ 0, bH,			0, 1, !params.opened	 		], // 4

			];


		var bodyGeometry = new ASSETS.LatheUVGeometry( points, bC );

		this.body = new THREE.Mesh( bodyGeometry, material );
		this.body.name = 'body';

		this.position.y = -bH/2;

		this.add( this.body );

	} // WineBottle.constructor


	dispose( ) {

		this.body?.geometry.dispose( );
		this.clear( );

	} // WineBottle.dispose


	// returns a set of random parameters
	static random( ) {

		return {
			bottleHeight: ASSETS.random( 15, 35 ),
			bottleSize: ASSETS.random( 5, 15 ),
			bottleBulge: Math.round( Math.max( 0, ( ASSETS.random( -100, 100 )+ASSETS.random( -100, 100 ) )/2 ) ),
			bottleComplexity: Math.floor( ASSETS.mapExp( Math.random(), 8, 120, 0, 1 ) ),

			puntHeight: ASSETS.random( 0, 3 ),

			neckHeight: ASSETS.random( 2, 15 ),
			neckSize: ASSETS.random( 1, 3 ),
			neckSmooth: ASSETS.random( 0.5, 15 ),

			topHeight: ASSETS.random( 0.3, 3 ),
			topSize: ASSETS.random( 0, 0.5 ),
			topOffset: ASSETS.random( 0, 1 ),

			opened: ASSETS.random( 0, 100 ) < 50,
			simple: ASSETS.random( 0, 100 ) < 30,
			flat: ASSETS.random( 0, 100 ) < 30,
		};

	} // WineBottle.random


} // WineBottle



export { WineBottle };
