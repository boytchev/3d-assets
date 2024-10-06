import * as THREE from 'three';
import * as ASSETS from './assets-utils.js';
import * as CSG from 'https://cdn.jsdelivr.net/npm/three-bvh-csg@0.0.16/+esm';

class Doorframe extends ASSETS.Asset {

	static name = 'Doorframe';


	/* eslint-disable */
	static paramData = {

		width:         { default:   90, type: 'cm'   , min: 50 , max: 100, prec: 1, folder: "General", name: "Width"},
		height:        { default:  210, type: 'cm'   , min: 150, max: 300, prec: 1, folder: "General", name: "Width"},
		double:        { default: true, type: Boolean, chance: .3                 , folder: "General", name: "double"},
		frameThickness:{ default:    5, type: 'cm'   , min: 3  , max: 10 , prec: 1, folder: "Frame", name:"Thickness"},
		thickness:     { default:    2, type: 'cm'   , min: .4 , max: 5  , prec: 1, folder: "General", name: "Thickness"},


		RoundDetail:  {default:    3, type: 'n'   , min:  1, max:  10, prec: 0, folder: "Complexity", name: "Legs Bevel"  },

		flat:	{ default: false, type: Boolean, chance: .3             , folder: "Complexity", name: "Flat"        },
		simple: { default: false, type: Boolean, chance: .3             , folder: "Complexity", name: "Simple"      },

	};
	/* eslint-enable */

	constructor( params ) {

		super();

		this.isDoorframe = true;

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



		const left = new ASSETS.RoundedBoxGeometry(
			frameThickness, height + frameThickness, thickness
		);//.translate( -width/2, 0, 0 );


		const plane = new THREE.BoxGeometry( 1, 1, 1 );//.rotateX( -Math.PI/2 );
		this.add( new THREE.Mesh( plane, material ) );


		const b1 = new CSG.Brush( left );
		const b2 = new CSG.Brush( plane );

		const evaluator = new CSG.Evaluator();
		evaluator.useGroups = false;
		const result = evaluator.evaluate( b1, b2, CSG.SUBTRACTION );

		console.log( result );
		this.add( result );

		const right = new ASSETS.RoundedBoxGeometry(
			frameThickness, height + frameThickness, thickness
		).translate( width/2, 0, 0 );

		//this.add( new THREE.Mesh( left, material ) );
		//this.add( new THREE.Mesh( right, material ) );

	} // Doorframe.constructor


	dispose() {

		this.topGeom?.dispose();
		if ( this.legs ) for ( const l of this.legs ) l.dispose();
		this.clear();

	} // Doorframe.dispose

} // Doorframe

export { Doorframe };
