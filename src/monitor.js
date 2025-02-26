import * as THREE from 'three';
import * as ASSETS from './assets-utils.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import * as BP from './bin-packing.js';

class Monitor extends ASSETS.Asset {

	static name = 'Monitor';


	/* eslint-disable */
	static paramData = {

		aspectX:        { default: 16   , type: Number , min:   1, max: 40, prec: 0, folder: "Screen", name: "Aspect X"  },
		aspectY:        { default: 9    , type: Number , min:   1, max: 40, prec: 0, folder: "Screen", name: "Aspect Y"  },
		diagonal:       { default: 24   , type: 'in'   , min:   5, max: 40, prec: 1, folder: "Screen", name: "Diagonal"  },
		screenThickness:{ default: 1.5  , type: 'cm'   , min: 0.2, max:  4, prec: 1, folder: "Screen", name: "Thickness" },
		baseHeight:     { default: 7    , type: 'cm'   , min:   0, max: 20, prec: 1, folder: "Base"  , name: "Height"    },
		baseThickness:  { default: 2    , type: 'cm'   , min:  .5, max:  3, prec: 1, folder: "Base"  , name: "Thickness" },
		baseWidth:      { default: 20   , type: 'cm'   , min:  10, max: 30, prec: 1, folder: "Base"  , name: "Width"     },
		baseDepth:      { default: 15   , type: 'cm'   , min:  10, max: 30, prec: 1, folder: "Base"  , name: "Depth"     },
		handleWidth:    { default: 4    , type: 'cm'   , min:   3, max: 10, prec: 1, folder: "Base"  , name: "Handle"    },

		bevelDetail:    { default: 2    , type: 'n'    , min:   1, max:  6, prec: 0, folder: "Complexity", name: "Bevels", exp: true},
		flat:	        { default: false, type: Boolean, chance: .3                , folder: "Complexity", name: "Flat"  },
		simple:         { default: false, type: Boolean, chance: .3                , folder: "Complexity", name: "Simple"},

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


		const bodyGeomData = {
			x: width + 0.002, y: height + 0.002, z: screenThickness,
			faces: [ 1, !simple, 1, 1, 1, 1 ],
			roundFaces: [ 1, 0, 1, 1, 1, 1 ],
			segments: bevelDetail,
			roundness: .01 * !simple
		};
		const bodyGeom2Data = {
			x: Math.max( width/3, handleWidth ), y: height/3, z: 0.03,
			faces: [ 1, 0, 1, 1, 1, 1 ],
			roundFaces: [ 1, 0, 1, 1, 1, 1 ],
			segments: bevelDetail,
			roundness: .1 * !simple,
		};
		const baseGeomData = {
			x: baseWidth, y: baseThickness, z: baseDepth,
			faces: undefined,
			roundFaces: [ 1, 1, 1, 1, 0, 1 ],
			segments: bevelDetail,
			roundness: .1 * !simple,
		};

		const v1 = new THREE.Vector3( 0, baseThickness/4, -baseDepth/2 + baseThickness );
		const v2 = new THREE.Vector3( 0, baseHeight + height/2 - height/8, -screenThickness/2 - 0.015 );
		const handleLength = v1.distanceTo( v2 );
		const handleGeomData = {
			x: handleWidth, y: handleLength, z: baseThickness,
			faces: [ 1, 1, 1, 1, 0, 0 ],
			roundFaces: [ 1, 1, 1, 1, 0, 0 ],
			segments: bevelDetail,
			roundness: 0.2 * !simple
		};

		const l = [];
		l.push( ...ASSETS.RoundedBoxGeometry.getRectangles( bodyGeomData ) );
		l.push( ...ASSETS.RoundedBoxGeometry.getRectangles( bodyGeom2Data ) );
		l.push( ...ASSETS.RoundedBoxGeometry.getRectangles( baseGeomData ) );
		l.push( ...ASSETS.RoundedBoxGeometry.getRectangles( handleGeomData ) );
		let binPacker = BP.minimalPacking( l, diagonal/2 );
		binPacker.generateUV();

		const bodyGeom = new ASSETS.RoundedBoxGeometry( bodyGeomData )
			.translate(
				0, height/2 + baseHeight, 0
			);

		const bodyGeom2 = new ASSETS.RoundedBoxGeometry( bodyGeom2Data )
			.translate(
				0, height/2 + baseHeight, -screenThickness/2 - 0.015
			);

		const baseGeom = new ASSETS.RoundedBoxGeometry( baseGeomData );

		const handleGeom = new ASSETS.RoundedBoxGeometry( handleGeomData )
			.translate(
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
