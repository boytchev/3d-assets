import * as THREE from 'three';
import * as ASSETS from './assets-utils.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

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
		const legRoundness = params.legRoundness;
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
			[ -legWidth, legThickness, legRoundness ],
			[ -legWidth, -legThickness, legRoundness ],
			[ legWidth, -legThickness, legRoundness ],
			[ legWidth, legThickness, legRoundness ],
			[ 0, legThickness ], // fake vertex, later it will match the first vertex
		]);

		for ( let i = 0; i < legCount; ++i ) {

			const angle = i * 2 * Math.PI / legCount;
			const x = Math.cos( angle ), y = Math.sin( angle );
			const a = Math.cos( legAngle ) * legShape, b = Math.sin( legAngle ) * legShape;

			const top = height - thickness / 2 - legThickness * Math.sin( legAngle );
			const curve = new THREE.CubicBezierCurve3(
				new THREE.Vector3(
					x * legOffset,
					top * 1.0,
					y * legOffset ),
				new THREE.Vector3(
					x * ( legOffset + b ),
					top * ( 1. - a ),
					y * ( legOffset + b ) ),
				new THREE.Vector3(
					x * legSpread,
					top * legShape,
					y * legSpread ),
				new THREE.Vector3(
					x * legSpread,
					0,
					y * legSpread )
			);

			let geom = new ASSETS.SmoothExtrudeGeometry( legProfileShape, {
				curveSegments: 1,
				steps: 10,
				bevelEnabled: false,
				extrudePath: curve
			} );

			//geom.deleteAttribute( 'uv' );
			//geom.deleteAttribute( 'normal' );
			//geom = BufferGeometryUtils.mergeVertices( geom );
			//geom.computeVertexNormals();
			geom.uvIndex = 0;

			this.add( new THREE.Mesh( geom, material ) );

		}

		const seatGeom = new THREE.CylinderGeometry( size, size, thickness, 30 );
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
