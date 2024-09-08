import * as THREE from 'three';
import * as ASSETS from './assets-utils.js';

class WineGlass extends ASSETS.Asset {

	static name = 'Wine Glass';


	/* eslint-disable */
	static paramData = {
		baseSize:       { default:2.5, type: 'cm'   , min:   1, max:   3, prec: 1, folder: "Base", name: "Size"      },
		baseThickness:  { default: .3, type: 'cm'   , min:  .1, max:  .5, prec: 2, folder: "Base", name: "Thickness" },
		stemSize:       { default: .2, type: 'cm'   , min:  .1, max:  .4, prec: 2, folder: "Stem", name: "Size"      },
		stemHeight:     { default:  5, type: 'cm'   , min:   2, max:  10, prec: 1, folder: "Stem", name: "Height"    },
		bowlSize:       { default:  3, type: 'cm'   , min:   1, max:   4, prec: 1, folder: "Bowl", name: "Size"      },
		bowlHeight:     { default:  5, type: 'cm'   , min:   3, max:   7, prec: 1, folder: "Bowl", name: "Height"    },
		bowlShape:      { default: .4, type: '%'    , min:  .1, max:  .9, prec: 2, folder: "Bowl", name: "Shape"     },
		bowlThickness:  { default: .1, type: 'cm'   , min: .05, max:  .3, prec: 2, folder: "Bowl", name: "Thickness" },
		rimSize:        { default:2.1, type: 'cm'   , min:   1, max:   4, prec: 1, folder: "Bowl", name: "Rim Size"  },
		roundness:      { default:.02, type: Number , min:   0, max: .03, prec: 3, folder: "Bowl", name: "Bevel Size"}, 

		bevelDetail: { default:     6, type: 'n'    , min: 1, max: 10, prec: 0, folder: "Complexity", name: "Bevels" },
		latheDetail: { default:    30, type: 'n'    , min: 6, max: 50, prec: 0, folder: "Complexity", name: "Lathe" },

		flat:	{ default: false, type: Boolean, chance: .3              , folder: "Complexity", name: "Flat"   },
		simple: { default: false, type: Boolean, chance: .3              , folder: "Complexity", name: "Simple" },

	};
	/* eslint-enable */

	constructor( params ) {

		super();

		this.isWineGlass = true;

		this.generate( params );

	}


	generate( params ) {

		this.dispose();

		const simple = params.simple;

		const material = ASSETS.defaultMaterial.clone();
		material.flatShading = params.flat;

		const baseSize = ASSETS.cm( params.baseSize );
		const baseThickness = ASSETS.cm( params.baseThickness );
		const stemSize = ASSETS.cm( params.stemSize );
		const stemHeight = ASSETS.cm( params.stemHeight );
		const bowlSize = ASSETS.cm( params.bowlSize );
		const bowlHeight = ASSETS.cm( params.bowlHeight );
		const rimSize = ASSETS.cm( params.rimSize );
		const bowlThickness = ASSETS.cm( params.bowlThickness );
		const bevelDetail = params.bevelDetail;
		const latheDetail = params.latheDetail;
		const roundness = simple ? 0 : params.roundness;
		const shape = params.bowlShape;

		const AUTO = ASSETS.AUTO;

		const d = bevelDetail;
		/* eslint-disable */
		const points = [
			// x,y,		   rad tex
			[ 0, 0 					                                                                             ], // 0 bottom
			[ baseSize              , 0                            ,                ,   .1,                      ],
			[ baseSize*.9           , baseThickness                , roundness      ,  .14, true, d              ],
			[ stemSize              , baseThickness                , roundness      ,   .2, true, d              ],
			[ stemSize              , stemHeight/2                 , roundness      , AUTO, true, d              ],
			[ stemSize*1.2          , stemHeight                   , roundness      ,   .5, true, d              ],
			[ bowlSize              , stemHeight + bowlHeight*shape, roundness      , AUTO, true, d              ],
			[ rimSize               , stemHeight + bowlHeight      , bowlThickness/2,   .8, true, Math.ceil(d/2) ], // rim
			[ rimSize-bowlThickness , stemHeight + bowlHeight      , bowlThickness/2, AUTO, true, Math.ceil(d/2) ],
			[ bowlSize-bowlThickness, stemHeight + bowlHeight*shape, roundness      , AUTO, true, d              ],
			[ 0                     , stemHeight                   ,                                             ]
		];
		/* eslint-enable */

		var bodyGeometry = new ASSETS.LatheUVGeometry( points, latheDetail );
		bodyGeometry.uvIndex = 0;

		const body = new THREE.Mesh( bodyGeometry, material );
		body.name = 'body';

		this.add( body );
		this.position.y = -( stemHeight + bowlHeight ) /2;

	} // WineGlass.constructor


	dispose() {

		this.clear();

	} // WineGlass.dispose

} // WineGlass

export { WineGlass };
