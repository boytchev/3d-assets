import * as THREE from 'three';
import * as ASSETS from './assets-utils.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { VertexNormalsHelper } from 'three/addons/helpers/VertexNormalsHelper.js';

class Stool extends THREE.Group {

	static name = 'Stool';

	static defaults = {
		legWidth: 10,
		legThickness: 10,
		legRoundness: 0.04,
		legCount: 4,
		legOffset: 10,
		legSpread: 50,
		legAngle: 0 / 180 * Math.PI,
		legShape: .6,
		size: 50,
		height: 100,
		thickness: 10,

		legDetail: 10,
		seatDetail: 30,
		legRoundDetail: 3,

		flat: false,
		simple: false,
	};


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
		const size = ASSETS.cm( params.size );
		const height = ASSETS.cm( params.height );
		const thickness = ASSETS.cm( params.thickness );

		const legProfileShape = new ASSETS.RoundedShape([
			[ 0, legThickness ],
			[ -legWidth, legThickness, legRoundness, .2,, params.legRoundDetail ],
			[ -legWidth, -legThickness, legRoundness, .4,, params.legRoundDetail ],
			[ legWidth, -legThickness, legRoundness, .6,, params.legRoundDetail ],
			[ legWidth, legThickness, legRoundness, .8,, params.legRoundDetail ],
			[ 0, legThickness ], // fake vertex, later it will match the first vertex
		]);

		const a = Math.cos( legAngle ) * legShape, b = Math.sin( legAngle ) * legShape;
		const top = height - thickness / 2 - legThickness * Math.sin( legAngle );

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
				uvMatrix: new THREE.Matrix3().makeScale( 0.48, 0.48 ).translate( Math.floor( i / 2 ) * 0.5 + 0.01, ( i % 2 ) * 0.5 + 0.01 )
			} );
			geom.uvIndex = 0;

			const mesh = new THREE.Mesh( geom, material );
			mesh.rotation.y = i * 2 * Math.PI / legCount;
			this.add( mesh );

		}

		const seatGeom = new ASSETS.UVCylinderGeometry( size, size, thickness, params.seatDetail, 1, false, {
			bodyUVMatrix: new THREE.Matrix3().makeScale( 0.98, 0.48 ).translate( .01, .01 ),
			topUVMatrix: new THREE.Matrix3().makeScale( 0.48, 0.48 ).translate( 0.01, 0.51 ),
			bottomUVMatrix: new THREE.Matrix3().makeScale( 0.48, 0.48 ).translate( 0.51, 0.51 ),
		} );
		seatGeom.uvIndex = 1;

		const seat = new THREE.Mesh(
			seatGeom,
			material
		);
		seat.position.y = height;

		this.add( seat );

	} // Stool.constructor


	dispose() {

		this.clear();

	} // Stool.dispose


	// returns a set of random parameters
	static random() {

		return {

			flat: ASSETS.random( 0, 100 ) < 30,
			simple: ASSETS.random( 0, 100 ) < 30,
		};

	} // Stool.random


} // Stool

export { Stool };
