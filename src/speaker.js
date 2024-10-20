import * as THREE from 'three';
import * as ASSETS from './assets-utils.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

class Speaker extends ASSETS.Asset {

	static name = 'Speaker';

	/* eslint-disable */
	static paramData = {

		width: {default: 15, type: 'cm', },
		height: {default: 30, type: 'cm', },
		depth: {default: 20, type: 'cm', },

		flat:	{ default: false, type: Boolean, chance: .3, folder: "Complexity", name: "Flat"   },
		simple: { default: false, type: Boolean, chance: .3, folder: "Complexity", name: "Simple" },

	};
	/* eslint-enable */

	constructor( params ) {

		super();

		this.isSpeaker = true;

		this.generate( params );

	}


	generate( params ) {

		this.dispose();

		const simple = params.simple;

		const material = ASSETS.defaultMaterial.clone();
		material.flatShading = params.flat;

		const height = ASSETS.cm( params.height );
		const width = ASSETS.cm( params.width );
		const depth = ASSETS.cm( params.depth );

		const roundness = .01;

		const box = new ASSETS.RoundedBoxGeometry( width, height, depth,
			undefined, roundness, [ 1, 1, 1, 1, 1, 1 ],
			undefined, [ 0, 1, 1, 1, 0, 0 ], false,
			[ 1, 0, 1, 1, 1, 1 ]
		).translate( 0, height/2, 0 );


		const frontFrame = new THREE.Shape([
			new THREE.Vector2( -( width )/2+roundness, 0 ),
			new THREE.Vector2( -( width )/2+roundness, height ),
			new THREE.Vector2( ( width )/2-roundness, height ),
			new THREE.Vector2( ( width )/2-roundness, 0 ),
		]);


		const r2 = ( width - 2 * roundness );
		const r1 = r2 / 2;

		const hole1 = new THREE.Path();
		hole1.absarc( .0, .9 * height - r1 / 2, r1/2, 0, 2*Math.PI, !true );

		const hole2 = new THREE.Path();
		hole2.absarc( .0, r2/2 + .1 * height, r2/2, 0, 2*Math.PI, !true );

		frontFrame.holes = [ hole1, hole2 ];

		const front = new THREE.ShapeGeometry( frontFrame ).translate( 0, 0, depth/2 );



		const body = BufferGeometryUtils.mergeGeometries([ box, front ]);
		const bodyMesh = new THREE.Mesh( body, material );
		bodyMesh.name = 'body';

		this.add( bodyMesh );

		this.position.y -= height/2;


	} // Speaker.constructor


	dispose() {

		this.clear();

	} // Speaker.dispose

} // Speaker

export { Speaker };
