import * as THREE from 'three';
import * as ASSETS from './assets-utils.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import * as BP from './bin-packing.js';

class Speaker extends ASSETS.Asset {

	static name = 'Speaker';

	/* eslint-disable */
	static paramData = {

		width:         {default: 15, type: 'cm', min: 5, max: 20  ,prec: 2, folder: "Box", name: "Width"},
		height:        {default: 30, type: 'cm', min: 5, max: 100 ,prec: 2, folder: "Box", name: "Height"},
		depth:         {default: 20, type: 'cm', min: 5, max: 40  ,prec: 2, folder: "Box", name: "Depth"},
		speakerDepth:  {default:  2, type: 'cm', min: 1, max: 5  ,prec: 2, folder: "Speakers", name: "Depth"},
	
		speakerDetail: {default: 12, type: 'n' , min: 6, max: 20  ,prec: 0, folder: "Complexity", name: "Speakers"},
		bevelDetail:   {default:  2, type: 'n' , min: 1, max: 10  ,prec: 0, folder: "Complexity", name: "Bevel"},

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

		const width = ASSETS.cm( params.width );
		const height = Math.max( ASSETS.cm( params.height ), ( simple ? 1.9 : 1.7 ) * width );
		const depth = ASSETS.cm( params.depth );
		const speakerDepth = ASSETS.cm( params.speakerDepth );
		const roundness = simple ? 0 : .01;

		const boxData = {
			x: width, y: height, z: depth,
			faces: [ 1, 1, 1, 1, 1, 1 ],
			roundFaces: [ 0, 1, 1, 1, 0, 0 ],
			fillCenter: [ 1, 0, 1, 1, 1, 1 ],
		};

		const l = [];
		l.push( ...ASSETS.RoundedBoxGeometry.getRectangles( boxData ) );
		let binPacker = BP.minimalPacking( l, ( width + depth + height ) * .5 );
		binPacker.generateUV();

		const box = new ASSETS.RoundedBoxGeometry(
			boxData.x, boxData.y, boxData.z,
			params.bevelDetail, roundness, boxData.faces,
			boxData.uvMatrix, boxData.roundFaces, false,
			boxData.fillCenter
		).translate( 0, height/2, 0 );

		const frontFrame = new THREE.Shape([
			new THREE.Vector2( -( width )/2+roundness, 0 ),
			new THREE.Vector2( -( width )/2+roundness, height ),
			new THREE.Vector2( ( width )/2-roundness, height ),
			new THREE.Vector2( ( width )/2-roundness, 0 ),
		]);
		const r2 = ( width - 2 * roundness )/2;
		const r1 = r2 / 2;
		const s1Height = .9 * height - r1;
		const s2Height = .1 * height + r2;

		const hole1 = new THREE.Path();
		hole1.absarc( .0, s1Height, r1, 0, 2*Math.PI, !true );
		const hole2 = new THREE.Path();
		hole2.absarc( .0, s2Height, r2, 0, 2*Math.PI, !true );
		frontFrame.holes = [ hole1, hole2 ];

		const front = new THREE.ShapeGeometry( frontFrame, params.speakerDetail ).translate( 0, 0, depth/2 );
		ASSETS.transformUVs( front, new THREE.Matrix3().translate( width/2, 0 ) );
		ASSETS.transformUVs( front, boxData.uvMatrix[ 1 ]);

		const s1 = new ASSETS.LatheUVGeometry([
			[ 0, speakerDepth ],
			[ r1/2, speakerDepth, .02 ],
			[ r1 * .8, speakerDepth/4 ],
			[ r1 * .8, speakerDepth/2 ],
			[ r1 * .9, speakerDepth/2 ],
			[ r1 * .9, speakerDepth/4 ],
			[ r1, 0 ],
		], 2 * params.speakerDetail ).rotateX( -Math.PI/2 ).translate( 0, s1Height, depth/2 );
		ASSETS.projectUVs( s1, new THREE.Vector3( 0, 0, 1 ), undefined, new THREE.Vector2( width/2, 0 ) );
		ASSETS.transformUVs( s1, boxData.uvMatrix[ 1 ]);

		const s2 = new ASSETS.LatheUVGeometry([
			[ 0, speakerDepth ],
			[ r2/2, speakerDepth, .02 ],
			[ r2 * .8, speakerDepth/4 ],
			[ r2 * .8, speakerDepth/2 ],
			[ r2 * .9, speakerDepth/2 ],
			[ r2 * .9, speakerDepth/4 ],
			[ r2, 0 ],
		], 2 * params.speakerDetail ).rotateX( -Math.PI/2 ).translate( 0, s2Height, depth/2 );
		ASSETS.projectUVs( s2, new THREE.Vector3( 0, 0, 1 ), undefined, new THREE.Vector2( width/2, 0 ) );
		ASSETS.transformUVs( s2, boxData.uvMatrix[ 1 ]);

		const body = BufferGeometryUtils.mergeGeometries([ box, front, s1, s2 ]);
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
