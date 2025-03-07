import * as THREE from 'three';
import * as ASSETS from './assets-utils.js';
import * as BP from './bin-packing.js';

class Table extends ASSETS.Asset {

	static name = 'Table';


	/* eslint-disable */
	static paramData = {

		legThickness: {default: 10, type: 'cm', min: 2, max: 15, prec: 1, folder: "Legs", name: "Thickness"},
		legRoundness: {default: 0.02, type: 'cm', min: 0, max: .1, prec: 3, folder: "Legs", name: "Roundness"},
		legOffset: {default: 0, type: 'cm', min: 0, max: 100, prec: 1, folder: "Legs", name: "Offset"},
		legSpread: {default: 0, type: 'cm', min: 0, max: 100, prec: 1, folder: "Legs", name: "Spread"},
		legAngle: {default: 0, type: 'deg', min: 0, max: 90, prec: 0, folder: "Legs", name: "Curve Angle"},
		legFaceAngle: {default: 0, type: 'deg', min: 0, max: 360, prec: 0, folder: "Legs", name: "Face Angle"},
		legShape: {default: .6, type: Number, min: 0, max: .9, prec: 2, folder: "Legs", name: "Shape"},

		topWidth: {default: 120, type: 'cm', min: 20, max: 200, prec: 1, folder: "Top", name: "Width"},
		topDepth: {default: 90, type: 'cm', min: 20, max: 200, prec: 1, folder: "Top", name: "Depth"},
		topHeight: {default: 100, type: 'cm', min: 10, max: 130, prec: 1, folder: "Top", name: "Height"},
		topThickness: {default: 10, type: 'cm', min: 1, max: 10, prec: 1, folder: "Top", name: "Thickness"},
		topRoundness: {default: 0.05, type: Number, min: 0, max: 0.2, prec: 3, folder: "Top", name: "Roundness"},

		legDetail: {default: 10, type: 'n', min: 1, max: 30, prec: 0, folder: "Complexity", name: "Legs"},
		legRoundDetail: {default: 3, type: 'n', min: 1, max: 10, prec: 0, folder: "Complexity", name: "Legs Bevel"},
		topRoundDetail: {default: 3, type: 'n', min: 1, max: 10, prec: 0, folder: "Complexity", name: "Top Bevel", exp: true},

		flat: {default: false, type: Boolean, chance: .3, folder: "Complexity", name: "Flat"},
		simple: {default: false, type: Boolean, chance: .3, folder: "Complexity", name: "Simple"},

	};
	/* eslint-enable */

	constructor( params ) {

		super();

		this.isTable = true;

		this.generate( params );

	}


	generate( params ) {

		this.dispose();

		const simple = params.simple;

		const material = ASSETS.defaultMaterial.clone();
		material.flatShading = params.flat;

		const legThickness = ASSETS.cm( params.legThickness );
		const legRoundness = simple ? 0 : params.legRoundness;
		const legOffset = ASSETS.cm( params.legOffset );
		const legSpread = ASSETS.cm( params.legSpread );
		const legAngle = -params.legAngle / 180 * Math.PI;
		const legFaceAngle = params.legFaceAngle / 180 * Math.PI;
		const legShape = params.legShape;
		const width = ASSETS.cm( params.topWidth );
		const depth = ASSETS.cm( params.topDepth );
		const height = ASSETS.cm( params.topHeight );
		const thickness = ASSETS.cm( params.topThickness );

		const legProfileShape = new ASSETS.RoundedShape([
			[ 0, legThickness / 2 ],
			[ -legThickness / 2, legThickness / 2, legRoundness, .2, , params.legRoundDetail ],
			[ -legThickness / 2, -legThickness / 2, legRoundness, .4, , params.legRoundDetail ],
			[ legThickness / 2, -legThickness / 2, legRoundness, .6, , params.legRoundDetail ],
			[ legThickness / 2, legThickness / 2, legRoundness, .8, , params.legRoundDetail ],
			[ 0, legThickness / 2 ], // fake vertex, later it will match the first vertex
		]);

		const a = Math.cos( legAngle ) * legShape, b = Math.sin( legAngle ) * legShape;
		const top = Math.min(
			height - thickness,
			height + legThickness / 2 * Math.sin( legAngle )
		);

		const curve = new THREE.CubicBezierCurve3(
			new THREE.Vector3(
				0,
				top * 1.0,
				0 ),
			new THREE.Vector3(
				( b ),
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

		const tableRad = ASSETS.RoundedBoxGeometry.computeCurveRadius( width, thickness, depth, simple ? 0 : params.topRoundness );
		const legPosition = [
			Math.max( width / 2 - legThickness / 2 - legOffset - tableRad, legThickness / 2 ),
			Math.max( depth / 2 - legThickness / 2 - legOffset - tableRad, legThickness / 2 ),
		];
		const legPositions = [
			new THREE.Vector2( -legPosition[ 0 ], -legPosition[ 1 ]),
			new THREE.Vector2( legPosition[ 0 ], -legPosition[ 1 ]),
			new THREE.Vector2( -legPosition[ 0 ], legPosition[ 1 ]),
			new THREE.Vector2( legPosition[ 0 ], legPosition[ 1 ]),
		];
		const legRotateDir = [ -1, 1, 1, -1 ];


		const topGeomData = {
			x: width, y: thickness, z: depth,
			faces: undefined,
			roundFaces: undefined,
			segments: params.topRoundDetail,
			roundness: simple ? 0 : params.topRoundness,
		};

		const l1 = [];
		l1.push( ...ASSETS.RoundedBoxGeometry.getRectangles( topGeomData ) );
		let binPacker = BP.minimalPacking( l1, 1 );
		binPacker.generateUV();

		const legData = {
			curveSegments: 1,
			steps: params.legDetail,
			bevelEnabled: false,
			extrudePath: curve,
			caps: [ !simple, 1 ],
			uvMatrix: new THREE.Matrix3().makeScale( 0.79, 0.79 ).translate( 0.01, 0.01 ),
			topUVMatrix: new THREE.Matrix3().makeScale( 0.18, 0.18 ).translate( 0.81, 0.01 ),
			bottomUVMatrix: new THREE.Matrix3().makeScale( 0.18, 0.18 ).translate( 0.81, 0.2 ),
		};
		const l2 = ASSETS.SmoothExtrudeGeometry.getRectangles( legProfileShape, legData );
		binPacker = BP.minimalPacking( l2, 1 );
		binPacker.generateUV();


		this.legs = [];
		for ( let i = 0; i < 4; ++i ) {

			let geom = new ASSETS.SmoothExtrudeGeometry( legProfileShape, legData );
			geom.uvIndex = 0;
			this.legs.push( geom );

			const mesh = new THREE.Mesh( geom, material );
			mesh.name = "leg_" + i;
			mesh.rotation.y = ( i % 2 ) * Math.PI + legRotateDir[ i ] * legFaceAngle;
			mesh.position.x = legPositions[ i ].x;
			mesh.position.z = legPositions[ i ].y;
			this.add( mesh );

		}

		const topGeom = new ASSETS.RoundedBoxGeometry( topGeomData );
		topGeom.uvIndex = 1;
		this.topGeom = topGeom;

		const seat = new THREE.Mesh(
			topGeom,
			material
		);
		seat.name = "top";
		seat.position.y = height - thickness / 2;

		this.add( seat );

		this.position.y = -height / 2;

	} // Table.constructor


	dispose() {

		this.topGeom?.dispose();
		if ( this.legs ) for ( const l of this.legs ) l.dispose();
		this.clear();

	} // Table.dispose

} // Table

export { Table };
