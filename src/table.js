import * as THREE from 'three';
import * as ASSETS from './assets-utils.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { VertexNormalsHelper } from 'three/addons/helpers/VertexNormalsHelper.js';

class Table extends THREE.Group {

	static name = 'Table';

	static defaults = {
		legThickness: 10,
		legRoundness: 0.02,
		legOffset: 0,
		legSpread: 0,
		legAngle: 0,
		legFaceAngle: 0,
		legShape: .6,
		topWidth: 120,
		topDepth: 90,
		topHeight: 100,
		topThickness: 10,
		topRoundness: 0.05,

		legDetail: 10,
		legRoundDetail: 3,
		topRoundDetail: 3,

		flat: false,
		simple: false,
	};


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
			[ 0, legThickness/2 ],
			[ -legThickness/2, legThickness/2, legRoundness, .2,, params.legRoundDetail ],
			[ -legThickness/2, -legThickness/2, legRoundness, .4,, params.legRoundDetail ],
			[ legThickness/2, -legThickness/2, legRoundness, .6,, params.legRoundDetail ],
			[ legThickness/2, legThickness/2, legRoundness, .8,, params.legRoundDetail ],
			[ 0, legThickness/2 ], // fake vertex, later it will match the first vertex
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
			Math.max( width/2 - legThickness / 2 - legOffset - tableRad, legThickness/2 ),
			Math.max( depth/2 - legThickness / 2 - legOffset - tableRad, legThickness/2 ),
		];
		const legPositions = [
			new THREE.Vector2( -legPosition[ 0 ], -legPosition[ 1 ]),
			new THREE.Vector2( legPosition[ 0 ], -legPosition[ 1 ]),
			new THREE.Vector2( -legPosition[ 0 ], legPosition[ 1 ]),
			new THREE.Vector2( legPosition[ 0 ], legPosition[ 1 ]),
		];
		const legRotateDir = [ -1, 1, 1, -1 ];

		for ( let i = 0; i < 4; ++i ) {

			let geom = new ASSETS.SmoothExtrudeGeometry( legProfileShape, {
				curveSegments: 1,
				steps: params.legDetail,
				bevelEnabled: false,
				extrudePath: curve,
				caps: [ !simple, 1 ],
				uvMatrix: new THREE.Matrix3().makeScale( 0.79, 0.79 ).translate( 0.01, 0.01 ),
				topUVMatrix: new THREE.Matrix3().makeScale( 0.18, 0.18 ).translate( 0.81, 0.01 ),
				bottomUVMatrix: new THREE.Matrix3().makeScale( 0.18, 0.18 ).translate( 0.81, 0.2 ),
			} );
			geom.uvIndex = 0;

			const mesh = new THREE.Mesh( geom, material );
			mesh.name = "leg_" + i;
			mesh.rotation.y = ( i % 2 ) * Math.PI + legRotateDir[ i ]*legFaceAngle;
			mesh.position.x = legPositions[ i ].x;
			mesh.position.z = legPositions[ i ].y;
			this.add( mesh );

		}


		const uvXSize = 2 * width + 2 * thickness;
		const uvYSize = depth + 2 * thickness;
		const uvScale = 1 / Math.max( uvXSize, uvYSize );

		const topGeom = new ASSETS.RoundedBoxGeometry(
			width, thickness, depth,
			params.topRoundDetail,
			simple ? 0 : params.topRoundness,
			undefined,
			new THREE.Matrix3().makeScale( uvScale, uvScale )
		);
		topGeom.uvIndex = 1;

		const seat = new THREE.Mesh(
			topGeom,
			material
		);
		seat.name = "top";
		seat.position.y = height - thickness / 2;

		this.add( seat );

	} // Table.constructor


	dispose() {

		this.clear();

	} // Table.dispose


	// returns a set of random parameters
	static random() {

		return {

			legThickness: ASSETS.random( 2, 15 ),
			legRoundness: ASSETS.random( 0, .1 ),
			legOffset: ASSETS.random( 0, 100 ),
			legSpread: ASSETS.random( 0, 100 ),
			legAngle: ASSETS.random( 0, 90 ),
			legFaceAngle: ASSETS.random( 0, 360 ),
			legShape: ASSETS.random( 0, 1 ),

			topWidth: ASSETS.random( 20, 200 ),
			topDepth: ASSETS.random( 20, 200 ),
			topHeight: ASSETS.random( 10, 130 ),
			topThickness: ASSETS.random( 1, 10 ),
			topRoundness: ASSETS.random( 0, 0.2 ),

			legDetail: ASSETS.random( 1, 30, 0 ),
			legRoundDetail: ASSETS.random( 1, 10, 0 ),
			topRoundDetail: ASSETS.random( 1, 10, 0 ),

			flat: ASSETS.random( 0, 100 ) < 30,
			simple: ASSETS.random( 0, 100 ) < 30,
		};

	} // Table.random


} // Table

export { Table };
