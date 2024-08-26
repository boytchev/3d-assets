import * as THREE from 'three';
import * as ASSETS from './assets-utils.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { VertexNormalsHelper } from 'three/addons/helpers/VertexNormalsHelper.js';

class Wardrobe extends ASSETS.Asset {

	static name = 'Wardrobe';


	/* eslint-disable */
	static paramData = {
			
		wings:            { default:    2, type: 'n'   , min:  1, max:   4, prec: 0, folder: "General", name: "Wings"},
		wingWidth:        { default:   40, type: 'cm'  , min: 20, max:  80, prec: 1, folder: "General", name: "Wing width"},
		height:           { default:  150, type: 'cm'  , min: 60, max: 210, prec: 1, folder: "General", name: "Height"},
		thickness:        { default:  1.5, type: 'cm'  , min: .2, max:   4, prec: 1, folder: "General", name: "Thickness"},
		depth:            { default:   40, type: 'cm'  , min: 20, max:  80, prec: 1, folder: "General", name: "Depth"},
		doorRoundness:    { default: .005, type: Number, min:  0, max: .05, prec: 3, folder: "Doors", name: "Roundness"},
		doorAngle:        { default:    0, type: 'deg' , min:  0, max:  90, prec: 0, folder: "Doors", name: "Openness"},

		handleThickness:  { default:  0.5, type: 'cm'  , min: .1, max:   1, prec: 2, folder: "Handles", name: "Thickness"},
		handleSize:       { default:   10, type: 'cm'  , min:  5, max:  15, prec: 1, folder: "Handles", name: "Size"},

		handleRoundDetail:{ default:    1, type: 'n'   , min:  1, max:   3, prec: 0, folder: "Complexity", name: "Handle Bevel"},
		doorRoundDetail:  { default:    1, type: 'n'   , min:  1, max:   4, prec: 0, folder: "Complexity", name: "Doors Bevel"},
		flat:	          { default: false, type: Boolean, chance: .3              , folder: "Complexity", name: "Flat"   },
		simple:           { default: false, type: Boolean, chance: .3              , folder: "Complexity", name: "Simple" },

	};
	/* eslint-enable */

	constructor( params ) {

		super();

		this.isWardrobe = true;

		this.generate( params );

	}


	generate( params ) {

		this.dispose();

		const simple = params.simple;

		const material = ASSETS.defaultMaterial.clone();
		material.flatShading = params.flat;

		const wings = params.wings;
		const wingWidth = ASSETS.cm( params.wingWidth );
		const height = ASSETS.cm( params.height );
		const thickness = ASSETS.cm( params.thickness );
		const depth = ASSETS.cm( params.depth );
		const doorAngle = params.doorAngle / 180 * Math.PI;

		const handleThickness = ASSETS.cm( params.handleThickness );
		const handleSize = ASSETS.cm( params.handleSize );

		const bottom = new ASSETS.RoundedBoxGeometry(
			wingWidth * wings, thickness, depth
		).translate( 0, thickness/2, 0 );

		const top = new ASSETS.RoundedBoxGeometry(
			wingWidth * wings, thickness, depth
		).translate( 0, height - thickness/2, 0 );

		const sideL = new ASSETS.RoundedBoxGeometry(
			thickness, height - 2*thickness, depth - thickness,
			undefined, undefined, [ 1, 1, 1, 1, 0, 0 ]
		).translate( -wingWidth/2 * wings + thickness / 2, height/2, -thickness/2 );

		const sideR = new ASSETS.RoundedBoxGeometry(
			thickness, height - 2*thickness, depth - thickness,
			undefined, undefined, [ 1, 1, 1, 1, 0, 0 ]
		).translate( wingWidth/2 * wings - thickness/2, height/2, -thickness/2 );

		const back = new ASSETS.RoundedBoxGeometry(
			wingWidth * wings - 2 * thickness, height - thickness, thickness
		).translate( 0, height/2, -depth/2+thickness/2 );

		const splitters = [];
		for ( let i = 0; i < wings-1; ++i ) {

			const splitter = new ASSETS.RoundedBoxGeometry(
				thickness, height - 2 * thickness, depth - 2 * thickness,
				undefined, undefined, [ 1, 1, 1, 1, 0, 0 ]
			).translate(
				-wingWidth * wings/2 + ( i+1 ) * wingWidth,
				height/2,
				0
			);
			splitters.push( splitter );

		}

		const bodyGeom = BufferGeometryUtils.mergeGeometries(
			[ top, bottom, sideL, sideR, back ].concat( splitters )
		);
		const body = new THREE.Mesh( bodyGeom, material );
		body.name = 'body';
		this.add( body );

		top.dispose();
		bottom.dispose();
		sideL.dispose();
		sideR.dispose();
		for ( let s of splitters ) s.dispose();

		const handleProfileShape = new ASSETS.RoundedShape([
			[ 0, handleThickness ],
			[ -handleThickness/2, handleThickness/2, handleThickness * .2, .2,, params.handleRoundDetail ],
			[ -handleThickness/2, -handleThickness/2, handleThickness * .2, .4,, params.handleRoundDetail ],
			[ handleThickness/2, -handleThickness/2, handleThickness * .2, .6,, params.handleRoundDetail ],
			[ handleThickness/2, handleThickness/2, handleThickness * .2, .8,, params.handleRoundDetail ],
			[ 0, handleThickness ], // fake vertex, later it will match the first vertex
		]);

		const handleCurve = new THREE.CubicBezierCurve3(
			new THREE.Vector3( 0, +handleSize / 2, 0 ),
			new THREE.Vector3( 0, +handleSize * 0.3, .02 ),
			new THREE.Vector3( 0, -handleSize * 0.3, .02 ),
			new THREE.Vector3( 0, -handleSize / 2, 0 )
		);

		for ( let i = 0; i < wings; ++i ) {

			const dir = -( i % 2 ) * 2 + 1;
			const doorGroup = new THREE.Group();
			doorGroup.name = 'Door_' + ( i+1 );
			const door = new THREE.Mesh(
				new ASSETS.RoundedBoxGeometry(
					wingWidth, height - 2 * thickness, thickness, params.doorRoundDetail, simple ? 0 : params.doorRoundness
				),
				material
			);
			door.position.set( dir * ( wingWidth / 2 - thickness/2 ), 0, 0 );
			doorGroup.add( door );
			door.name = "door_" + ( i+1 );

			if ( !simple ) {

				const handleGeometry = new ASSETS.SmoothExtrudeGeometry(
					handleProfileShape, {
						extrudePath: handleCurve,
						steps: 10,
						caps: [ 0, 0 ]
					}
				);
				handleGeometry.uvIndex = 1;

				const handle = new THREE.Mesh( handleGeometry, material );
				handle.name = "handle_" + ( i+1 );
				handle.position.set( dir * ( wingWidth - thickness/2 - handleThickness/2 ), 0, thickness/2 );
				doorGroup.add( handle );

			}

			doorGroup.rotation.y = -dir * doorAngle;
			doorGroup.position.set(
				-wingWidth * wings/2 + i * wingWidth + i % 2 * ( wingWidth ) + dir * thickness/2,
				height/2,
				depth/2 - thickness/2 );
			this.add( doorGroup );

		}

	} // Wardrobe.constructor


	dispose() {

		this.clear();

	} // Wardrobe.dispose

} // Wardrobe

export { Wardrobe };
