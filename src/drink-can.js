
//	3D Assets: Drink Can



import * as THREE from 'three';
import * as ASSETS from './assets-utils.js';


var lidTexture;
function getLidTexture( ) {

	if ( !lidTexture ) {

		lidTexture = new THREE.TextureLoader().load( "../src/textures/drink-can-lid.jpg" );

	}

	return lidTexture;

}




class DrinkCan extends ASSETS.Asset {

	static name = 'Drink can';

	/* eslint-disable */
	static paramData = {

		canHeight:     { default:    12, type: 'cm'   , min: 5, max: 20, prec: 1 , folder: "Can"       , name: "Height" },
		canSize:       { default:     6, type: 'cm'   , min: 5, max:  8, prec: 1 , folder: "Can"       , name: "Size"   },

		neckHeight:    { default:   1.5, type: 'cm'   , min: 1, max:  3, prec: 1 , folder: "Neck"      , name: "Height" },
		neckSize:      { default:     5, type: 'cm'   , min: 4, max:  9, prec: 1 , folder: "Neck"      , name: "Size"   },

		canComplexity: { default:    50, type: 'n'    , min: 8, max: 120, prec: 1, folder: "Complexity", name: "Can"    , exp: true},
		hasTag:        { default:  true, type: Boolean, chance: .7               , folder: "Complexity", name: "3D tag" },
        flat:          { default: false, type: Boolean, chance: .3			     , folder: "Complexity", name: "Simple" },
		simple:        { default: false, type: Boolean, chance: .3               , folder: "Complexity", name: "Flat"   },

	};
	/* eslint-enable */

	constructor( params ) {

		super( );

		this.isDrinkCan = true;

		this.generate( params );

	}


	generate( params ) {

		this.dispose( );

		var // can primary parameters
			cH = ASSETS.cm( params.canHeight ),
			cS = ASSETS.cm( params.canSize )/2,

			// neck primary parameters
			nH = ASSETS.cm( params.neckHeight ),
			nS = Math.min( ASSETS.cm( params.neckSize )/2, cS ),

			// neck derivative parameters
			nK = 0.005, // 3 mm outer inset of neck and base
			nP = 0.0015, // 1.5 mm
			nL = 0.003, // 5 mm inner inset of neck and base

			// tag derivative paameters
			tS = 0.7*nS,	// tag size
			tW = 0.4*nS,	// tag width
			tP = 0.07*nS,
			tH = tW-2*tP,	// tag hole size
			tG = 0.4*tW, 		// roundness of tag

			// complexities
			cC = Math.floor( params.canComplexity ),
			tC = Math.floor( ASSETS.map( params.canComplexity, 4, 30, 8, 120 ) );

		// roundness of edges
		var cG = 0.001; // 1 mm

		// material
		var material = ASSETS.defaultMaterial.clone();
		material.flatShading = params.flat;

		// body

		var points;

		if ( params.simple )
			points = [
				// x,y		   rad txt
				[ 0, 0,					], // 0
				[ nS*0.95,				], // 1
				[ nS, 0, 				], // 2
				[ cS, nK, 		0, 0.15	], // 3
				[ cS, cH-nH,	0, 0.85, cS!=nS ], // 4
				[ nS, cH, 				], // 5
			];
		else
			points = [
				[ 0, 2*nL,					], // 0
				[ nS-2*nP, 2*nL, 	nS,		], // 1
				[ nS-2*nP, 0, 		cG,		], // 2
				[ nS-nP, 0,			cG,		], // 3
				//[ nS*0.7+0.3*cS, nK/2, nS, 	], // 4
				[ nS-nP, nK/2, 		nS, 	], // 4
				[ cS, nK, 			cG, 0.15 ], // 5
				[ cS, cH-nH, 		2*cG, ASSETS.AUTO, cS!=nS ], // 6
				[ nS, cH-2*nP, 		cG 		], // 7
				[ nS, cH, 			cG 		], // 8
				[ nS-nP, cH, 		cG 		], // 9
				[ nS-nP, cH-nL,		0,		], // 10
			];


		var bodyGeometry = new ASSETS.LatheUVGeometry( points, cC );

		this.body = new THREE.Mesh( bodyGeometry, material );
		this.body.name = 'body';
		this.body.geometry.uvIndex = 0;

		this.add( this.body );


		// lid with bump texture

		var lidMaterial = ASSETS.defaultMaterial.clone();
		lidMaterial.flatShading = params.flat;
		lidMaterial.bumpMap = getLidTexture();
		lidMaterial.bumpScale = params.simple ? 2.5 : 1.5;

		this.lid = new THREE.Mesh(
			new THREE.CircleGeometry( params.simple ? nS : nS-nP/2, cC ),
			lidMaterial
		);
		this.lid.name = 'lid';
		this.lid.geometry.uvIndex = 1;
		this.lid.rotation.set( -Math.PI/2, -Math.PI/2-0*Math.PI/cC, 0, 'YXZ' );

		this.lid.position.y = params.simple ? cH : cH-nL;
		this.add( this.lid );


		// tag

		if ( params.hasTag ) {

			// lid tag as 3D object
			var tMinY = -tH/2-tP,
				tMaxY = tMinY+tS,
				tMidY = ( tMinY+tMaxY )/2;

			var tagShape = new ASSETS.RoundedShape([
				[ tW/2, tMidY ],
				[ tW/2, tMaxY, tG ],
				[ -tW/2, tMaxY, tG ],
				[ -tW/2, tMinY, tG ],
				[ tW/2, tMinY, tG ],
				[ tW/2, tMidY ],
			]);

			var tagHole1 = new THREE.Shape();
			tagHole1.absarc( 0, 0, tH/2, 0, 2*Math.PI, !true );

			var tagHole2 = new THREE.Shape();
			tagHole2.absarc( 0, tMaxY-tH/2-tP, tH/2, 0, 2*Math.PI, !true );

			tagShape.holes = [ tagHole1, tagHole2 ];

			var tagGeometry = new THREE.ExtrudeGeometry( tagShape, {
				curveSegments: tC,
				steps: 1,
				depth: 0.001,
				bevelEnabled: false,
			} );

			var uv = tagGeometry.getAttribute( 'uv' );
			var pos = tagGeometry.getAttribute( 'position' );
			for ( var i=0; i<uv.count; i++ )
				uv.setXY( i,
					ASSETS.map( pos.getX( i ), 0, 1, -tW/2, tW/2 ),
					ASSETS.map( pos.getY( i ), 0, 1, tMinY, tMaxY )
				);

			tagGeometry.uvIndex = 2;

			this.tag = new THREE.Mesh( tagGeometry, material.clone() );
			this.tag.name = 'tag';
			this.tag.material.color.set( 1.1, 1.1, 1.1 );
			this.tag.position.x = tH*0.26;
			this.tag.position.y = cH+0.0005 - ( params.simple?0:nL );
			this.tag.rotation.set( Math.PI/2, Math.PI/2, 0, 'YXZ' );
			this.add( this.tag );

		}

		this.position.y = -cH/2;

	} // DrinkCan.constructor

	dispose( ) {

		this.body?.geometry.dispose( );
		this.lid?.geometry.dispose( );
		this.tag?.geometry.dispose( );
		this.clear( );

	} // DrinkCan.dispose


} // DrinkCan



export { DrinkCan };
