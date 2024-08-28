import * as THREE from 'three';
import * as ASSETS from './assets-utils.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { VertexNormalsHelper } from 'three/addons/helpers/VertexNormalsHelper.js';

class Monitor extends ASSETS.Asset {

	static name = 'Monitor';


	/* eslint-disable */
	static paramData = {
		
		aspectX:        { default: 16   , type: Number , min:   1, max: 40, prec: 0, folder: "Screen", name: "Aspect X"        },
		aspectY:        { default: 9    , type: Number , min:   1, max: 40, prec: 0, folder: "Screen", name: "Aspect Y"        },
		diagonal:       { default: 24   , type: 'in'   , min:   5, max: 40, prec: 1, folder: "Screen", name: "Diagonal Length" },
		screenThickness:{ default: 1.5  , type: 'cm'   , min: 0.2, max:  4, prec: 1, folder: "Screen", name: "Thickness"       },
		baseHeight:     { default: 7    , type: 'cm'   , min:   0, max: 20, prec: 1, folder: "Base"  , name: "Height"          },
		baseThickness:  { default: 2    , type: 'cm'   , min:  .5, max:  3, prec: 1, folder: "Base"  , name: "Thickness"       },
		baseWidth:      { default: 20   , type: 'cm'   , min:  10, max: 30, prec: 1, folder: "Base"  , name: "Width"           },
		baseDepth:      { default: 15   , type: 'cm'   , min:  10, max: 30, prec: 1, folder: "Base"  , name: "Depth"           },
		handleWidth:    { default: 4    , type: 'cm'   , min:   3, max: 10, prec: 1, folder: "Base"  , name: "Handle Width"    },

		bevelDetail:    { default: 2    , type: 'n'    , min:   1, max:  6, prec: 0, folder: "Complexity", name: "Bevels"      , exp: true},
		flat:	        { default: false, type: Boolean, chance: .3                , folder: "Complexity", name: "Flat"        },
		simple:         { default: false, type: Boolean, chance: .3                , folder: "Complexity", name: "Simple"      },

	};
	/* eslint-enable */

	constructor( params ) {

		super();

		this.isMonitor = true;

		this.generate( params );

	}


	generate( params ) {

		this.dispose();

		const simple = params.simple;

		const material = ASSETS.defaultMaterial.clone();
		material.flatShading = params.flat;

		const screenThickness = ASSETS.cm( params.screenThickness );
		const diagonal = ASSETS.cm( params.diagonal * 2.54 );
		const baseHeight = ASSETS.cm( params.baseHeight );
		const baseThickness = ASSETS.cm( params.baseThickness );
		const baseWidth = ASSETS.cm( params.baseWidth );
		const baseDepth = ASSETS.cm( params.baseDepth );
		const handleWidth = ASSETS.cm( params.handleWidth );

		const bevelDetail = params.bevelDetail;

		const aspect = params.aspectX / params.aspectY;
		const angle = Math.atan( aspect );
		const width = Math.sin( angle ) * diagonal;
		const height = Math.cos( angle ) * diagonal;

		const bodyGeom = new ASSETS.RoundedBoxGeometry(
			width + 0.002, height + 0.002, screenThickness,
			bevelDetail, .01 * !simple, [ 1, !simple, 1, 1, 1, 1 ], undefined, [ 1, 0, 1, 1, 1, 1 ],
		).translate(
			0, height/2 + baseHeight, 0
		);

		const bodyGeom2 = new ASSETS.RoundedBoxGeometry(
			width/3, height/3, 0.03,
			bevelDetail, .1 * !simple, [ 1, 0, 1, 1, 1, 1 ], undefined, [ 1, 0, 1, 1, 1, 1 ],
		).translate(
			0, height/2 + baseHeight, -screenThickness/2 - 0.015
		);

		const baseGeom = new ASSETS.RoundedBoxGeometry(
			baseWidth, baseThickness, baseDepth,
			bevelDetail, .1 * !simple, undefined, undefined, [ 1, 1, 1, 1, 0, 1 ],
		);

		const v1 = new THREE.Vector3( 0, baseThickness/4, -baseDepth/2 + baseThickness );
		const v2 = new THREE.Vector3( 0, baseHeight + height/2 - height/8, -screenThickness/2 - 0.015 );

		const handleLength = v1.distanceTo( v2 );

		const handleGeom = new ASSETS.RoundedBoxGeometry(
			handleWidth, handleLength, baseThickness,
			bevelDetail, 0.2 * !simple, [ 1, 1, 1, 1, 0, 0 ], undefined, [ 1, 1, 1, 1, 0, 0 ]
		).translate(
			0, handleLength/2, 0
		).rotateX(
			Math.atan2( v2.z-v1.z, v2.y - v1.y )
		).translate( v1 );

		const monitorGeometry = BufferGeometryUtils.mergeGeometries(
			[ bodyGeom, bodyGeom2, baseGeom, handleGeom ]
		);
		const body = new THREE.Mesh( monitorGeometry, material );
		body.name = 'body';
		this.add( body );

		const screenGeom = new THREE.PlaneGeometry(
			width + 0.002 * simple, height + 0.002 * simple
		).translate( 0, height/2 + baseHeight, screenThickness/2 + 0.0005*!simple );
		screenGeom.uvIndex = 1;
		const screen = new THREE.Mesh( screenGeom, material );
		screen.name = 'screen';

		this.add( screen );

		this.position.y = -( height + baseHeight )/2;

	} // Monitor.constructor


	dispose() {

		this.clear();

	} // Monitor.dispose

} // Monitor

export { Monitor };
