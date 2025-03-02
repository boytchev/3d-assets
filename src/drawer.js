import * as THREE from 'three';
import * as ASSETS from './assets-utils.js';
import * as BP from './bin-packing.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

class Drawer extends ASSETS.Asset {

	static name = 'Drawer';


	/* eslint-disable */
	static paramData = {

		width:            { default:    40, type: 'cm'  , min: 20, max:  80, prec: 1, folder: "General", name: "width"},
		thickness:        { default:   1.5, type: 'cm'  , min: .2, max:   2, prec: 1, folder: "General", name: "Thickness"},
		depth:            { default:    40, type: 'cm'  , min: 20, max:  80, prec: 1, folder: "General", name: "Depth"},
		roundness:        { default:     2, type: 'mm'  , min:  0, max:   5, prec: 1, folder: "General", name: "Roundness"},

		drawerHeight:     { default:    15, type: 'cm'  , min:  7, max:  60, prec: 1, folder: "Drawers", name: "Height"},
		drawerCount:      { default:     4, type: 'n'   , min:  1, max:  10, prec: 0, folder: "Drawers", name: "Drawers"},
		doorRoundness:    { default:   .02, type: Number, min:  0, max: .05, prec: 3, folder: "Drawers", name: "Roundness"},
		openness:         { default:     0, type: Number, min:  0, max:   1, prec: 2, folder: "Drawers", name: "Openness"},

		handleThickness:  { default:   0.5, type: 'cm'  , min: .1, max:   1, prec: 2, folder: "Handles", name: "Thickness"},
		handleSize:       { default:    10, type: 'cm'  , min:  5, max:  15, prec: 1, folder: "Handles", name: "Size"},
		handleHeight:     { default:   0.5, type: Number, min:0.1, max: 0.9, prec: 2, folder: "Handles", name: "Height"},

		handleRoundDetail:{ default:     1, type: 'n'   , min:  1, max:   3, prec: 0, folder: "Complexity", name: "Handle Bevel"},
		roundDetail:      { default:     1, type: 'n'   , min:  1, max:   4, prec: 0, folder: "Complexity", name: "Body Bevel"},
		doorRoundDetail:  { default:     1, type: 'n'   , min:  1, max:   4, prec: 0, folder: "Complexity", name: "Faces Bevel"},
		flat:	          { default: false, type: Boolean, chance: .3               , folder: "Complexity", name: "Flat"   },
		simple:           { default: false, type: Boolean, chance: .3               , folder: "Complexity", name: "Simple" },

	};
	/* eslint-enable */

	constructor( params ) {

		super();

		this.isDrawer = true;

		this.generate( params );

	}


	generate( params ) {

		this.dispose();

		const simple = params.simple;

		const material = ASSETS.defaultMaterial.clone();
		material.flatShading = params.flat;

		const width = ASSETS.cm( params.width );
		const drawerHeight = ASSETS.cm( params.drawerHeight );
		const thickness = ASSETS.cm( params.thickness );

		const depth = ASSETS.cm( params.depth );

		const handleThickness = ASSETS.cm( params.handleThickness );
		const handleSize = ASSETS.cm( params.handleSize );
		const handleHeight = params.handleHeight;

		const height = drawerHeight * params.drawerCount + 2 * thickness;
		const drawerWidth = width - 2 * thickness - .02;

		const r = ASSETS.mm( params.roundness );
		const rd = params.roundDetail;
		const bottomData = {
			x: width, y: thickness, z: depth,
			roundness: r,
			segments: rd,
			roundFaces: [ 1, 1, 1, 1, 1, 0 ]
		};

		const topData = {
			x: width, y: thickness, z: depth,
			roundness: r,
			segments: rd,
			relativeRoundness: false,
			roundFaces: [ 1, 1, 1, 1, 0, 1 ]
		};

		const sideLData = {
			x: thickness, y: height - 2*thickness, z: depth - thickness,
			roundness: r,
			segments: rd,
			relativeRoundness: false,
			faces: [ 1, 1, 1, 1, 0, 0 ],
			roundFaces: [ 1, 1, 1, 0, 0, 0 ],
		};

		const sideRData = {
			x: thickness, y: height - 2*thickness, z: depth - thickness,
			roundness: r,
			segments: rd,
			relativeRoundness: false,
			faces: [ 1, 1, 1, 1, 0, 0 ],
			roundFaces: [ 1, 1, 0, 1, 0, 0 ],
		};

		const backData = {
			x: width - 2 * thickness, y: height - 2 * thickness, z: thickness,
			roundness: r,
			segments: rd,
			relativeRoundness: false,
		};

		const l = [];
		l.push( ...ASSETS.RoundedBoxGeometry.getRectangles( bottomData ) );
		l.push( ...ASSETS.RoundedBoxGeometry.getRectangles( topData ) );
		l.push( ...ASSETS.RoundedBoxGeometry.getRectangles( sideLData ) );
		l.push( ...ASSETS.RoundedBoxGeometry.getRectangles( sideRData ) );
		l.push( ...ASSETS.RoundedBoxGeometry.getRectangles( backData ) );

		const packer = BP.minimalPacking( l, 1 );
		packer.generateUV();


		const bottom = new ASSETS.RoundedBoxGeometry( bottomData ).translate( 0, thickness/2, 0 );

		const top = new ASSETS.RoundedBoxGeometry( topData ).translate( 0, height - thickness/2, 0 );

		const sideL = new ASSETS.RoundedBoxGeometry( sideLData ).translate( -width/2 + thickness / 2, height/2, -thickness/2 );

		const sideR = new ASSETS.RoundedBoxGeometry( sideRData ).translate( width/2 - thickness/2, height/2, -thickness/2 );

		const back = new ASSETS.RoundedBoxGeometry( backData ).translate( 0, height/2, -depth/2+thickness/2 );

		const bodyGeom = BufferGeometryUtils.mergeGeometries(
			[ top, bottom, sideL, sideR, back ]
		);
		this.bodyGeom = bodyGeom;
		const body = new THREE.Mesh( bodyGeom, material );
		body.name = 'body';
		this.add( body );

		top.dispose();
		bottom.dispose();
		sideL.dispose();
		sideR.dispose();

		const handleProfileShape = new ASSETS.RoundedShape([
			[ 0, handleThickness/2 ],
			[ -handleThickness/2, handleThickness/2, handleThickness * .2, .2,, params.handleRoundDetail ],
			[ -handleThickness/2, -handleThickness/2, handleThickness * .2, .4,, params.handleRoundDetail ],
			[ handleThickness/2, -handleThickness/2, handleThickness * .2, .6,, params.handleRoundDetail ],
			[ handleThickness/2, handleThickness/2, handleThickness * .2, .8,, params.handleRoundDetail ],
			[ 0, handleThickness/2 ], // fake vertex, later it will match the first vertex
		]);

		const handleCurve = new THREE.CubicBezierCurve3(
			new THREE.Vector3( 0, +handleSize / 2, 0 ),
			new THREE.Vector3( 0, +handleSize * 0.3, .2 * handleSize + handleThickness/2 ),
			new THREE.Vector3( 0, -handleSize * 0.3, .2 * handleSize + handleThickness/2 ),
			new THREE.Vector3( 0, -handleSize / 2, 0 )
		);

		{ // indivirual drawers

			const backData = {
				x: drawerWidth, y: drawerHeight - 2 * thickness, z: thickness,
				faces: [ 1, 1, 1, 1, 0, 1 ],
			};

			const bottomData = {
				x: drawerWidth, y: thickness, z: depth - 2 * thickness,
				faces: [ 1, 1, 1, 1, 1, 1 ]
			};

			const sideLData = {
				x: thickness, y: drawerHeight - 2 * thickness, z: depth - 3 * thickness,
				faces: [ 0, 0, 1, 1, 0, 1 ]
			};

			const sideRData = {
				x: thickness, y: drawerHeight - 2 * thickness, z: depth - 3 * thickness,
				faces: [ 0, 0, 1, 1, 0, 1 ]
			};

			const frontData = {
				x: width, y: drawerHeight, z: thickness,
				roundFaces: [ 1, 1, 1, 1, 1, 1 ],
				segments: params.doorRoundDetail,
				roundness: simple? 0: params.doorRoundness,
			};

			const l = [];
			l.push( ...ASSETS.RoundedBoxGeometry.getRectangles( bottomData ) );
			l.push( ...ASSETS.RoundedBoxGeometry.getRectangles( sideLData ) );
			l.push( ...ASSETS.RoundedBoxGeometry.getRectangles( sideRData ) );
			l.push( ...ASSETS.RoundedBoxGeometry.getRectangles( backData ) );
			l.push( ...ASSETS.RoundedBoxGeometry.getRectangles( frontData ) );

			const packer = BP.minimalPacking( l, depth+width/2 );
			packer.generateUV();

			this.drawers = [];
			for ( let i = 0; i < params.drawerCount; ++i ) {

				const baseHeight = thickness + i * drawerHeight;
				const open = params.openness * ( depth - 2 * thickness );
				const back = new ASSETS.RoundedBoxGeometry( backData ).translate( 0, drawerHeight/2, -depth/2 + thickness + thickness/2 );
				const bottom = new ASSETS.RoundedBoxGeometry( bottomData ).translate( 0, thickness/2, 0 );
				const sideL = new ASSETS.RoundedBoxGeometry( sideLData ).translate( -drawerWidth/2 + thickness/2, drawerHeight/2, thickness/2 );
				const sideR = new ASSETS.RoundedBoxGeometry( sideRData ).translate( drawerWidth/2 - thickness/2, drawerHeight/2, thickness/2 );
				const front = new ASSETS.RoundedBoxGeometry( frontData ).translate( 0, drawerHeight/2, depth/2 - thickness/2 );

				let meshes = [ back, bottom, sideL, sideR, front ];
				const drawerGeom = BufferGeometryUtils.mergeGeometries( meshes );
				drawerGeom.uvIndex = 1;
				this.drawers.push( drawerGeom );

				for ( const m of meshes ) m.dispose();

				const drawerGroup = new THREE.Group();
				drawerGroup.position.y = baseHeight;
				drawerGroup.position.z = open;
				drawerGroup.name = 'Drawer_' + ( i+1 );

				const drawer = new THREE.Mesh( drawerGeom, material );
				drawer.name = 'drawer_' + ( i+1 );
				drawerGroup.add( drawer );

				if ( !simple ) {

					const handleGeometry = new ASSETS.SmoothExtrudeGeometry(
						handleProfileShape, {
							extrudePath: handleCurve,
							steps: 10,
							caps: [ 0, 0 ]
						}
					).rotateZ( Math.PI /2 );

					handleGeometry.uvIndex = 2;
					const handle = new THREE.Mesh( handleGeometry, material );
					handle.position.set( 0, drawerHeight * handleHeight, depth/2 - handleThickness/2 );
					handle.name = 'handle_' + ( i+1 );

					drawerGroup.add( handle );
					this.drawers.push( handleGeometry );

				}

				this.add( drawerGroup );

			}

		}

		this.position.y -= height/2;

	} // Drawer.constructor


	dispose() {

		this.clear();
		this.bodyGeom?.dispose();
		if ( this.drawers ) for ( const x of this.drawers ) x.dispose();

	} // Drawer.dispose

} // Drawer

export { Drawer };
