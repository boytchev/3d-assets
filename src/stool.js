import * as THREE from 'three';
import * as ASSETS from './assets-utils.js';
<<<<<<< HEAD
=======
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { VertexNormalsHelper } from 'three/addons/helpers/VertexNormalsHelper.js';
>>>>>>> ea61773 (Better SmoothExtrudeGeometry)

class Stool extends ASSETS.Asset {

	static name = 'Stool';

	/* eslint-disable */
	static paramData = {

		legWidth:       { default: 10  , type: 'cm'  , min: 2 , max: 30 , prec: 2, folder: "Legs", name: "Width"     },
		legThickness:   { default: 10  , type: 'cm'  , min: 2 , max: 30 , prec: 2, folder: "Legs", name: "Thickness" },
		legRoundness:   { default: 0.04, type: 'cm'  , min: 0 , max: .1 , prec: 2, folder: "Legs", name: "Roundness" },
		legCount:       { default: 4   , type: 'n'   , min: 3 , max: 6  , prec: 0, folder: "Legs", name: "Count"     },
		legOffset:      { default: 10  , type: 'cm'  , min: 0 , max: 100, prec: 2, folder: "Legs", name: "Offset"    },
		legSpread:      { default: 50  , type: 'cm'  , min: 0 , max: 100, prec: 2, folder: "Legs", name: "Spread"    },
		legAngle:       { default: 0   , type: 'deg' , min: 0 , max: 90 , prec: 2, folder: "Legs", name: "Angle"     },
		legShape:       { default: .6  , type: Number, min: 0 , max: .9 , prec: 2, folder: "Legs", name: "Shape"     },
		seatSize:       { default: 50  , type: 'cm'  , min: 10, max: 100, prec: 2, folder: "Seat", name: "Size"      },
		seatHeight:     { default: 100 , type: 'cm'  , min: 10, max: 100, prec: 2, folder: "Seat", name: "Height"    },
		seatThickness:  { default: 10  , type: 'cm'  , min: 10, max: 100, prec: 2, folder: "Seat", name: "Thickness" },
                                                                        
		legDetail:      { default: 10  , type: 'n'   , min: 5 , max: 30 , prec: 0, folder: "Complexity", name: "Legs"      , exp: true},
		legRoundDetail: { default:  3  , type: 'n'   , min: 1 , max: 10 , prec: 0, folder: "Complexity", name: "Legs Bevel", exp: true},
		seatDetail:     { default: 30  , type: 'n'   , min: 6 , max: 50 , prec: 0, folder: "Complexity", name: "Seat"      , exp: true},

		flat:	{ default: false, type: Boolean, chance: .3, folder: "Complexity", name: "Flat"   },
		simple: { default: false, type: Boolean, chance: .3, folder: "Complexity", name: "Simple" },

<<<<<<< HEAD
=======
		legDetail: 10,
		seatDetail: 30,
		legRoundDetail: 3,

		flat: false,
		simple: false,
>>>>>>> ea61773 (Better SmoothExtrudeGeometry)
	};
	/* eslint-enable */

	constructor( params ) {

		super();

		this.isStool = true;

		this.generate( params );

	}


	generate( params ) {

		this.dispose();

		const simple = params.simple;

		const material = ASSETS.defaultMaterial.clone();
		material.flatShading = params.flat;

		const size = ASSETS.cm( params.seatSize );
		const height = ASSETS.cm( params.seatHeight );
		const thickness = Math.min( height, ASSETS.cm( params.seatThickness ) );

		const legWidth = ASSETS.cm( params.legWidth );
		const legThickness = ASSETS.cm( params.legThickness );
<<<<<<< HEAD
		const legRoundness = simple ? 0 : params.legRoundness;
=======
		const legRoundness = params.simple ? 0 : params.legRoundness;
>>>>>>> ea61773 (Better SmoothExtrudeGeometry)
		const legCount = params.legCount;
		const legOffset = Math.min( size - legThickness, ASSETS.cm( params.legOffset ) );
		const legSpread = ASSETS.cm( params.legSpread );
		const legAngle = params.legAngle / 180 * Math.PI;
		const legShape = params.legShape;

		const legProfileShape = new ASSETS.RoundedShape([
			[ 0, legThickness ],
<<<<<<< HEAD
			[ -legWidth, legThickness, legRoundness, .2,, params.legRoundDetail ],
			[ -legWidth, -legThickness, legRoundness, .4,, params.legRoundDetail ],
			[ legWidth, -legThickness, legRoundness, .6,, params.legRoundDetail ],
			[ legWidth, legThickness, legRoundness, .8,, params.legRoundDetail ],
=======
			[ -legWidth, legThickness, legRoundness,,, params.legRoundDetail ],
			[ -legWidth, -legThickness, legRoundness,,, params.legRoundDetail ],
			[ legWidth, -legThickness, legRoundness,,, params.legRoundDetail ],
			[ legWidth, legThickness, legRoundness,,, params.legRoundDetail ],
>>>>>>> ea61773 (Better SmoothExtrudeGeometry)
			[ 0, legThickness ], // fake vertex, later it will match the first vertex
		]);

		const a = Math.cos( legAngle ) * legShape, b = Math.sin( legAngle ) * legShape;
		const top = height - thickness - legThickness * Math.sin( legAngle ) * ( legShape != 0. );

		const curve = new THREE.CubicBezierCurve3(
			new THREE.Vector3(
				-legOffset,
				top * 1.0,
				0 ),
			new THREE.Vector3(
				-( legOffset + b ),
				top * ( 1. - a ),
				0 ),
			new THREE.Vector3(
				-legSpread,
				top * legShape,
				0 ),
			new THREE.Vector3(
				-legSpread,
				0,
			)
		);


		for ( let i = 0; i < legCount; ++i ) {

			let geom = new ASSETS.SmoothExtrudeGeometry( legProfileShape, {
				curveSegments: 1,
				steps: params.legDetail,
				bevelEnabled: false,
				extrudePath: curve,
<<<<<<< HEAD
				caps: [ 1, 1 ],
				uvMatrix: new THREE.Matrix3().makeScale( 0.79, 0.79 ).translate( 0.01, 0.01 ),
				topUVMatrix: new THREE.Matrix3().makeScale( 0.18, 0.18 ).translate( 0.81, 0.01 ),
				bottomUVMatrix: new THREE.Matrix3().makeScale( 0.18, 0.18 ).translate( 0.81, 0.2 ),
			} );
			geom.uvIndex = 0;

			const mesh = new THREE.Mesh( geom, material );
			mesh.name = "leg_" + i;
			mesh.rotation.y = i * 2 * Math.PI / legCount;
=======
				caps: [ 0, 1 ],
			} );

			geom.uvIndex = 0;

			const mesh = new THREE.Mesh( geom, material );
>>>>>>> ea61773 (Better SmoothExtrudeGeometry)
			this.add( mesh );

		}

<<<<<<< HEAD
		const seatGeom = new ASSETS.UVCylinderGeometry( size, size, thickness, params.seatDetail, 1, false, {
			bodyUVMatrix: new THREE.Matrix3().makeScale( 0.98, 0.28 ).translate( .01, .01 ),
			topUVMatrix: new THREE.Matrix3().makeScale( 0.48, 0.48 ).translate( 0.01, 0.31 ),
			bottomUVMatrix: new THREE.Matrix3().makeScale( 0.48, 0.48 ).translate( 0.51, 0.31 ),
		} );
=======
		const seatGeom = new THREE.CylinderGeometry( size, size, thickness, params.seatDetail );
>>>>>>> ea61773 (Better SmoothExtrudeGeometry)
		seatGeom.uvIndex = 1;

		const seat = new THREE.Mesh(
			seatGeom,
			material
		);
		seat.name = "seat";
		seat.position.y = height - thickness / 2;

		this.add( seat );

		this.position.y = -height/2;

	} // Stool.constructor


	dispose() {

		this.clear();

	} // Stool.dispose

} // Stool

export { Stool };
