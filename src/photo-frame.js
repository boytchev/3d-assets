import * as THREE from 'three';
import * as ASSETS from './assets-utils.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

class PhotoFrame extends ASSETS.Asset {

	static name = 'Photo Frame';


	/* eslint-disable */
	static paramData = {

		width:         { default: 21.0, type: 'cm'   , min: 10 , max: 100, prec: 1, folder: "General", name: "Width"},
		height:        { default: 29.7, type: 'cm'   , min: 10, max: 300, prec: 1, folder: "General", name: "Height"},
		thickness:     { default:    1, type: 'cm'   , min: .4 , max: 3  , prec: 1, folder: "General", name: "Thickness"},
		roundness:     { default:    1, type: 'cm'   , min: 0  , max: 3  , prec: 1, folder: "General", name: "Roundness"},
		frameThickness:{ default:    3, type: 'cm'   , min: 1  , max: 15 , prec: 1, folder: "General", name: "Frame"},

		roundDetail:  {default:    1, type: 'n'   , min:  1, max:  10, prec: 0, folder: "Complexity", name: "Bevel", exp: true},

		flat:	{ default: false, type: Boolean, chance: .3             , folder: "Complexity", name: "Flat"        },
		simple: { default: false, type: Boolean, chance: .3             , folder: "Complexity", name: "Simple"      },

	};
	/* eslint-enable */

	constructor( params ) {

		super();

		this.isPhotoFrame = true;

		this.generate( params );

	}


	generate( params ) {

		this.dispose();

		const simple = params.simple;

		const material = ASSETS.defaultMaterial.clone();
		material.flatShading = params.flat;

		const width = ASSETS.cm( params.width );
		const height = ASSETS.cm( params.height );
		const frameThickness = ASSETS.cm( params.frameThickness );
		const thickness = ASSETS.cm( params.thickness );
		const r = simple ? 0 : Math.min( ASSETS.cm( params.roundness ), thickness );
		const d = params.roundDetail;


		const left = new ASSETS.RoundedBoxGeometry(
			frameThickness, height + 2*frameThickness, thickness,
			d, r, [ 1, 1, 1, 1, 0, 0 ], undefined, [ 0, 1, 1, 1, 0, 0 ], false
		).translate( -width/2 - frameThickness/2, 0, 0 );

		const right = new ASSETS.RoundedBoxGeometry(
			frameThickness, height + 2*frameThickness, thickness,
			d, r, [ 1, 1, 1, 1, 0, 0 ], undefined, [ 0, 1, 1, 1, 0, 0 ], false
		).translate( width/2 + frameThickness/2, 0, 0 );

		const top = new ASSETS.RoundedBoxGeometry(
			width + 2*frameThickness, frameThickness, thickness,
			d, r, [ 1, 1, 0, 0, 1, 1 ], undefined, [ 0, 1, 0, 0, 1, 1 ], false
		).translate( 0, height/2 + frameThickness/2, 0 );

		const bottom = new ASSETS.RoundedBoxGeometry(
			width + 2*frameThickness, frameThickness, thickness,
			d, r, [ 1, 1, 0, 0, 1, 1 ], undefined, [ 0, 1, 0, 0, 1, 1 ], false
		).translate( 0, -height/2 - frameThickness/2, 0 );


		const planes = [
			new THREE.Plane( new THREE.Vector3( 1, 1, 0 ), 0 ).normalize().translate( new THREE.Vector3( 0, height/2 - width / 2, 0 ) ),
			new THREE.Plane( new THREE.Vector3( -1, 1, 0 ), 0 ).normalize().translate( new THREE.Vector3( 0, height/2-width/2, 0 ) ),

			new THREE.Plane( new THREE.Vector3( -1, 1, 0 ), 0 ).normalize().translate( new THREE.Vector3( 0, -height/2+width/2, 0 ) ),
			new THREE.Plane( new THREE.Vector3( 1, 1, 0 ), 0 ).normalize().translate( new THREE.Vector3( 0, -height/2 + width / 2, 0 ) ),
		];

		ASSETS.clampGeometry( left, planes[ 0 ], new THREE.Vector3( 0, -1, 0 ) );
		ASSETS.clampGeometry( left, planes[ 2 ], new THREE.Vector3( 0, 1, 0 ) );
		ASSETS.clampGeometry( right, planes[ 1 ], new THREE.Vector3( 0, -1, 0 ) );
		ASSETS.clampGeometry( right, planes[ 3 ], new THREE.Vector3( 0, 1, 0 ) );

		ASSETS.clampGeometry( top, planes[ 0 ], new THREE.Vector3( 1, 0, 0 ) );
		ASSETS.clampGeometry( top, planes[ 1 ], new THREE.Vector3( -1, 0, 0 ) );

		ASSETS.clampGeometry( bottom, planes[ 2 ], new THREE.Vector3( 1, 0, 0 ) );
		ASSETS.clampGeometry( bottom, planes[ 3 ], new THREE.Vector3( -1, 0, 0 ) );

		this.frame = BufferGeometryUtils.mergeGeometries([
			left, right, top, bottom
		]).translate( 0, 0, 0 );

		const pos = this.frame.getAttribute( 'position' ).array;
		const uv = this.frame.getAttribute( 'uv' ).array;
		for ( let i = 0; i < pos.length / 3; ++i ) {

			uv[ i * 2 + 0 ] = pos[ i * 3 + 0 ] / ( width + 2 * frameThickness ) + .5;
			uv[ i * 2 + 1 ] = pos[ i * 3 + 1 ] / ( height + 2 * frameThickness ) + .5;

		}

		this.frame.uvIndex = 0;

		const frameMesh = new THREE.Mesh( this.frame, material );
		frameMesh.name = 'frame';
		this.add( frameMesh );

		const plane = new THREE.PlaneGeometry( width, height ).translate( 0, 0, -thickness/2 );
		const planeMesh = new THREE.Mesh( plane, material );
		plane.uvIndex =1;
		this.add( planeMesh );


		left.dispose();
		right.dispose();
		top.dispose();

	} // PhotoFrame.constructor


	dispose() {

		this.door?.dispose();
		this.frame?.dispose();
		this.clear();

	} // PhotoFrame.dispose

} // PhotoFrame

export { PhotoFrame };
