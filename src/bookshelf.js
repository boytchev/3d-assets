import * as THREE from 'three';
import * as ASSETS from './assets-utils.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

class Bookshelf extends ASSETS.Asset {

	static name = 'Bookshelf';


	/* eslint-disable */
	static paramData = {
		
		width:        { default: 90, type: 'cm'  , min: 30, max: 120, prec: 1, folder: "General", name: "Width" },
		depth:        { default: 20, type: 'cm'  , min: 10, max:  40, prec: 1, folder: "General", name: "Depth" },
		thickness:    { default:  2, type: 'cm'  , min:  1, max:   3, prec: 1, folder: "General", name: "Thickness" },
		offset:       { default: 10, type: 'cm'  , min:  0, max:  30, prec: 1, folder: "General", name: "Legs" },
		roundness:    { default:  2, type: 'mm'  , min:  0, max:  20, prec: 3, folder: "General", name: "Roundness" },
		shelfHeight:  { default: 25, type: 'cm'  , min: 10, max:  50, prec: 1, folder: "Shelves", name: "Height" },
		shelvesCount: { default:  3, type:  'n'  , min:  1, max:  10, prec: 0, folder: "Shelves", name: "Count" },

		roundDetail:  {default:   1, type: 'n'   , min:  1, max:   4, prec: 0, folder: "Complexity", name: "Bevels" },
		flat:	{ default: false, type: Boolean, chance: .3             , folder: "Complexity", name: "Flat"        },
		simple: { default: false, type: Boolean, chance: .3             , folder: "Complexity", name: "Simple"      },

	};
	/* eslint-enable */

	constructor( params ) {

		super();

		this.isBookshelf = true;

		this.generate( params );

	}


	generate( params ) {

		this.dispose();

		const simple = params.simple;

		const material = ASSETS.defaultMaterial.clone();
		material.flatShading = params.flat;


		const width = ASSETS.cm( params.width );
		const shelfHeight = ASSETS.cm( params.shelfHeight );
		const shelvesCount = params.shelvesCount + 1;
		const depth = ASSETS.cm( params.depth );
		const thickness = ASSETS.cm( params.thickness );
		const offset = Math.min( ASSETS.cm( params.offset ), shelfHeight );
		const roundness = simple ? 0 : Math.min( thickness /2, ASSETS.mm( params.roundness ) );
		const detail = params.roundDetail;

		const height = ( shelvesCount-1 ) * ( shelfHeight ) + thickness + offset;

		const sideL = new ASSETS.RoundedBoxGeometry(
			thickness, height, depth,
			detail, roundness, undefined,
			undefined, [ 1, 1, 1, 0, 0, 1 ], false
		).translate( -width/2 + thickness/2, height/2, 0 );

		const sideR = new ASSETS.RoundedBoxGeometry(
			thickness, height, depth,
			detail, roundness, undefined,
			undefined, [ 1, 1, 0, 1, 0, 1 ], false
		).translate( width/2 - thickness/2, height/2, 0 );

		const back = new ASSETS.RoundedBoxGeometry(
			width - 2 * thickness, height, thickness,
			detail, roundness, [ 1, 1, 0, 0, 1, 1 ],
			undefined, [ 1, 0, 0, 0, 0, 1 ], false
		).translate( 0, height/2, -depth/2 +thickness/2 );

		const shelves = [];
		for ( let i = 0; i < shelvesCount; ++i ) {

			const shelf = new ASSETS.RoundedBoxGeometry(
				width - 2 * thickness, thickness, depth - thickness,
				detail, roundness, [ 0, 1, 0, 0, 1, 1 ],
				undefined, [ 0, 1, 0, 0, 1, 1 ], false
			).translate( 0, i * shelfHeight + offset + thickness/2, thickness/2 );
			shelves.push( shelf );

		}

		const bodyGeom = BufferGeometryUtils.mergeGeometries(
			[ sideL, sideR, back ].concat( shelves )
		);
		this.bodyGeom = bodyGeom;
		const body = new THREE.Mesh( bodyGeom, material );
		body.name = 'body';
		this.add( body );

		sideL.dispose();
		sideR.dispose();
		back.dispose();
		for ( const s of shelves ) s.dispose();

		this.position.y -= height/2;

	} // Bookshelf.constructor


	dispose() {

		this.topGeom?.dispose();
		if ( this.legs ) for ( const l of this.legs ) l.dispose();
		this.clear();

	} // Bookshelf.dispose

} // Bookshelf

export { Bookshelf };
