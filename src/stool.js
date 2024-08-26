import * as THREE from 'three';
import * as ASSETS from './assets-utils.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { VertexNormalsHelper } from 'three/addons/helpers/VertexNormalsHelper.js';

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
		legAngle:       { default: 0   , type: 'deg' , min: 0 , max: 150, prec: 2, folder: "Legs", name: "Angle"     },
		legShape:       { default: .6  , type: Number, min: 0 , max: 1  , prec: 2, folder: "Legs", name: "Shape"     },
		seatSize:       { default: 50  , type: 'cm'  , min: 10, max: 100, prec: 2, folder: "Seat", name: "Size"      },
		seatHeight:     { default: 100 , type: 'cm'  , min: 10, max: 100, prec: 2, folder: "Seat", name: "Height"    },
		seatThickness:  { default: 10  , type: 'cm'  , min: 10, max: 100, prec: 2, folder: "Seat", name: "Thickness" },
                                                                        
		legDetail:      { default: 10  , type: 'n'   , min: 5 , max: 30 , prec: 0, folder: "Complexity", name: "Legs"     , exp: true},
		legRoundDetail: { default:  3  , type: 'n'   , min: 3 , max: 10 , prec: 0, folder: "Complexity", name: "LegsBevel", exp: true},
		seatDetail:     { default: 30  , type: 'n'   , min: 3 , max: 50 , prec: 0, folder: "Complexity", name: "Seat"     , exp: true},

		flat:	{ default: false, type: Boolean, chance: .3, folder: "Complexity", name: "Flat"   },
		simple: { default: false, type: Boolean, chance: .3, folder: "Complexity", name: "Simple" },

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

		const legWidth = ASSETS.cm( params.legWidth );
		const legThickness = ASSETS.cm( params.legThickness );
		const legRoundness = simple ? 0 : params.legRoundness;
		const legCount = params.legCount;
		const legOffset = ASSETS.cm( params.legOffset );
		const legSpread = ASSETS.cm( params.legSpread );
		const legAngle = params.legAngle / 180 * Math.PI;
		const legShape = params.legShape;
		const size = ASSETS.cm( params.seatSize );
		const height = ASSETS.cm( params.seatHeight );
		const thickness = ASSETS.cm( params.seatThickness );

		const legProfileShape = new ASSETS.RoundedShape([
			[ 0, legThickness ],
			[ -legWidth, legThickness, legRoundness, .2,, params.legRoundDetail ],
			[ -legWidth, -legThickness, legRoundness, .4,, params.legRoundDetail ],
			[ legWidth, -legThickness, legRoundness, .6,, params.legRoundDetail ],
			[ legWidth, legThickness, legRoundness, .8,, params.legRoundDetail ],
			[ 0, legThickness ], // fake vertex, later it will match the first vertex
		]);

		const a = Math.cos( legAngle ) * legShape, b = Math.sin( legAngle ) * legShape;
		const top = height - thickness - legThickness * Math.sin( legAngle );

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
				caps: [ 1, 1 ],
				uvMatrix: new THREE.Matrix3().makeScale( 0.79, 0.79 ).translate( 0.01, 0.01 ),
				topUVMatrix: new THREE.Matrix3().makeScale( 0.18, 0.18 ).translate( 0.81, 0.01 ),
				bottomUVMatrix: new THREE.Matrix3().makeScale( 0.18, 0.18 ).translate( 0.81, 0.2 ),
			} );
			geom.uvIndex = 0;

			const mesh = new THREE.Mesh( geom, material );
			mesh.name = "leg_" + i;
			mesh.rotation.y = i * 2 * Math.PI / legCount;
			this.add( mesh );

		}

		const seatGeom = new ASSETS.UVCylinderGeometry( size, size, thickness, params.seatDetail, 1, false, {
			bodyUVMatrix: new THREE.Matrix3().makeScale( 0.98, 0.28 ).translate( .01, .01 ),
			topUVMatrix: new THREE.Matrix3().makeScale( 0.48, 0.48 ).translate( 0.01, 0.31 ),
			bottomUVMatrix: new THREE.Matrix3().makeScale( 0.48, 0.48 ).translate( 0.51, 0.31 ),
		} );
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
