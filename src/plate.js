
//	3D Assets: Plate



import * as THREE from 'three';
import * as ASSETS from './assets-utils.js';




class Plate extends ASSETS.Asset {

	static name = 'Plate';

	/* eslint-disable */
	static paramData = {

		plateHeight:      { default:   1.6, type: 'cm'   , min: 0.5, max:  5 , folder: "Plate", name: "Height" },
		plateSize:        { default:    18, type: 'cm'   , min:   6, max: 30 , folder: "Plate", name: "Size"   },
		plateShape:       { default:    25, type: 'deg'  , min:   0, max: 35 , folder: "Plate", name: "Shape"  },
		plateWidth:       { default:   0.3, type: 'cm'   , min: 0.3, max:  1 , folder: "Plate", name: "Width"  },

		plateComplexity:  { default:    50, type: 'n'    , min:   4, max: 120, folder: "Complexity", name: "Plate" , exp: true},
        flat:             { default: false, type: Boolean, chance: .3	     , folder: "Complexity", name: "Simple"},
		simple:           { default: false, type: Boolean, chance: .3        , folder: "Complexity", name: "Flat"  },

	};
	/* eslint-enable */

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

} // Plate



export { Plate };
