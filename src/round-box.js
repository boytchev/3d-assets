import * as THREE from 'three';
import * as ASSETS from './assets-utils.js';

class RoundBox extends ASSETS.Asset {

	static name = 'RoundBox';


	/* eslint-disable */
	static paramData = {

		x: {default: 1, type: 'm', min: 0.1, max: 1, prec: 1, name: "x"},
		y: {default: 1, type: 'm', min: 0.1, max: 1, prec: 1, name: "y"},
		z: {default: 1, type: 'm', min: 0.1, max: 1, prec: 1, name: "z"},

		f0: {default: true, type: Boolean, chance: 1., folder: "Face", name: "Z-"},
		f1: {default: true, type: Boolean, chance: 1., folder: "Face", name: "Z+"},
		f2: {default: true, type: Boolean, chance: 1., folder: "Face", name: "X-"},
		f3: {default: true, type: Boolean, chance: 1., folder: "Face", name: "X+"},
		f4: {default: true, type: Boolean, chance: 1., folder: "Face", name: "Y-"},
		f5: {default: true, type: Boolean, chance: 1., folder: "Face", name: "Y+"},

		r0: {default: true, type: Boolean, chance: .7, folder: "Round", name: "Z-"},
		r1: {default: true, type: Boolean, chance: .7, folder: "Round", name: "Z+"},
		r2: {default: true, type: Boolean, chance: .7, folder: "Round", name: "X-"},
		r3: {default: true, type: Boolean, chance: .7, folder: "Round", name: "X+"},
		r4: {default: true, type: Boolean, chance: .7, folder: "Round", name: "Y-"},
		r5: {default: true, type: Boolean, chance: .7, folder: "Round", name: "Y+"},

		c0: {default: true, type: Boolean, chance: 1., folder: "Center", name: "Z-"},
		c1: {default: true, type: Boolean, chance: 1., folder: "Center", name: "Z+"},
		c2: {default: true, type: Boolean, chance: 1., folder: "Center", name: "X-"},
		c3: {default: true, type: Boolean, chance: 1., folder: "Center", name: "X+"},
		c4: {default: true, type: Boolean, chance: 1., folder: "Center", name: "Y-"},
		c5: {default: true, type: Boolean, chance: 1., folder: "Center", name: "Y+"},

		roundness: {default: .2, type: Number, min: 0, max: 1, name: "Roundness"},

		roundDetail:  {default:    3, type: 'n'   , min:  1, max:  10, prec: 0, folder: "Complexity", name: "Bevel"   , exp: true},

		flat:	{ default: false, type: Boolean, chance: .3             , folder: "Complexity", name: "Flat"        },
		simple: { default: false, type: Boolean, chance: .3             , folder: "Complexity", name: "Simple"      },

	};
	/* eslint-enable */

	constructor( params ) {

		super();

		this.isRoundBox = true;

		this.generate( params );

	}


	generate( params ) {

		this.dispose();

		const simple = params.simple;

		const material = ASSETS.defaultMaterial.clone();
		material.flatShading = params.flat;
		const f = [
			params.f0,
			params.f1,
			params.f2,
			params.f3,
			params.f4,
			params.f5,
		];

		const r = [
			params.r0,
			params.r1,
			params.r2,
			params.r3,
			params.r4,
			params.r5,
		];

		const c = [
			params.c0,
			params.c1,
			params.c2,
			params.c3,
			params.c4,
			params.c5,
		];

		params.segments = simple ? 0 : params.roundDetail;
		params.relativeRoundness = true;
		params.faces = f;
		params.roundFaces = r;
		params.fillCenter = c;

		this.box = new ASSETS.RoundedBoxGeometry( params );

		this.add( new THREE.Mesh( this.box, material ) );

	} // RoundBox.constructor


	dispose() {

		this.clear();
		this.box?.dispose();

	} // RoundBox.dispose

} // RoundBox

export { RoundBox };
