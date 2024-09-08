
//	3D Assets: Mug



import * as THREE from 'three';
import * as ASSETS from './assets-utils.js';


class Mug extends ASSETS.Asset {

	static name = 'Mug';

	/* eslint-disable */
	static paramData = {
		mugHeight:        { default:    10, type: 'cm'   , min:    7, max:  20, folder: 'Mug', name: 'Height'        },
		mugSize:          { default:     8, type: 'cm'   , min:    6, max:  12, folder: 'Mug', name: 'Size'          },
		mugShape:         { default:     0, type: 'deg'  , min:  -15, max:  15, folder: 'Mug', name: 'Shape'         },
		mugWidth:         { default:   0.4, type: 'cm'   , min:  0.3, max:   1, folder: 'Mug', name: 'Width'         },

		handlePosition:   { default:    20, type: '%'    , min: -100, max: 100, folder: 'Handle', name: 'Position'   },
		handleHeight:     { default:     6, type: 'cm'   , min:    3, max:  18, folder: 'Handle', name: 'Height'     },
		handleSize:       { default:     7, type: 'cm'   , min:    3, max:  10, folder: 'Handle', name: 'Size'       },
		handleShape:      { default:    20, type: Number , min:  -80, max:  80, folder: 'Handle', name: 'Shape'      },
		handleWidth:      { default:   1.5, type: 'cm'   , min:    1, max:   2, folder: 'Handle', name: 'Width'      },
		handleThickness:  { default:   0.6, type: 'cm'   , min:  0.3, max:   1, folder: 'Handle', name: 'Thickness'  },

		mugComplexity:    { default:    50, type: 'n'    , min:    8, max: 100, folder: "Complexity", name: "Mug"    },
		handleComplexity: { default:    30, type: 'n'    , min:    5, max: 100, folder: "Complexity", name: "Handle" },

        flat:             { default: false, type: Boolean, chance: .3	      , folder: "Complexity", name: "Simple" },
		simple:           { default: false, type: Boolean, chance: .3         , folder: "Complexity", name: "Flat"   },

	};
	/* eslint-enable */

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

		var handleProfileShape = new ASSETS.RoundedShape([
			[ 0, hT ],
			[ -hW, hT, hG ],
			[ -hW, -hT, hG ],
			[ hW, -hT, hG ],
			[ hW, hT, hG ],
			[ 0, hT ], // fake vertex, later it will match the first vertex
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

		var handleGeometry = new ASSETS.SmoothExtrudeGeometry( handleProfileShape, {
			curveSegments: 1,
			steps: hC,
			bevelEnabled: false,
			extrudePath: handleCurve,
			caps: [ 0, 0 ]
		} );
		handleGeometry.uvIndex = 1;


		this.handle = new THREE.Mesh( handleGeometry, material );
		this.handle.name = 'handle';

		this.add( this.handle );


		this.position.y = -mH/2;


	} // Mug.constructor

	static random() {

		const res = super.random();
		res.mugComplexity = ASSETS.random( 0, 50, 0 ) + ASSETS.random( 0, 50, 0 );
		res.handleComplexity = ASSETS.random( 0, 50, 0 ) + ASSETS.random( 0, 50, 0 );
		return res;

	}

	dispose( ) {

		this.body?.geometry.dispose( );
		this.handle?.geometry.dispose( );
		this.clear( );

	} // Mug.dispose

} // Mug



export { Mug };
