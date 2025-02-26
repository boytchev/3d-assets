import * as THREE from 'three';
import * as ASSETS from './assets-utils.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import * as BP from './bin-packing.js';

class Doorframe extends ASSETS.Asset {

	static name = 'Doorframe';


	/* eslint-disable */
	static paramData = {

		width:         { default:   90, type: 'cm'   , min: 50 , max: 100, prec: 1, folder: "General", name: "Width"},
		height:        { default:  210, type: 'cm'   , min: 150, max: 300, prec: 1, folder: "General", name: "Height"},
		thickness:     { default:    2, type: 'cm'   , min: .4 , max: 5  , prec: 1, folder: "General", name: "Thickness"},
		openness:      { default:    0, type: Number , min: 0  , max: 1  , prec: 2, folder: "General", name: "Openness" },
		roundness:     { default:    1, type: 'cm'   , min: 0  , max: 5  , prec: 1, folder: "General", name: "Roundness"},
		frameThickness:{ default:    7, type: 'cm'   , min: 3  , max: 10 , prec: 1, folder: "Frame", name: "Thickness"},
		wallThickness: { default:   15, type: 'cm'   , min: 10 , max: 30 , prec: 1, folder: "Frame", name: "Wall Thickness"},


		roundDetail:  {default:    1, type: 'n'   , min:  1, max:  10, prec: 0, folder: "Complexity", name: "Bevel"},
		hingeDetail:  {default:    8, type: 'n'   , min:  5, max:  30, prec: 0, folder: "Complexity", name: "Hinge"},

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
		const wallThickness = ASSETS.cm( params.wallThickness );
		const r = simple ? 0 : Math.min( ASSETS.cm( params.roundness ), thickness );
		const d = params.roundDetail;

		const hingeOffset = .01;
		const hingeData = {
			radiusTop: hingeOffset,
			radiusBottom: hingeOffset,
			height: .07,
			radialSegments: params.hingeDetail,
			heightSegments: 1
		};

		const handleCurve0 = new THREE.CubicBezierCurve3(
			new THREE.Vector3( 0, 0, 0 ),
			new THREE.Vector3( -.0, .06, 0 ),
			new THREE.Vector3( -.05, .05, 0 ),
			new THREE.Vector3( -.15, .04, 0 )
		);
		const handleCurve1 = new THREE.CubicBezierCurve3(
			new THREE.Vector3( 0, 0, 0 ),
			new THREE.Vector3( -.0, .06, 0 ),
			new THREE.Vector3( -.05, .05, 0 ),
			new THREE.Vector3( -.15, .04, 0 )
		);

		const handle0Data = { extrudePath: handleCurve0, steps: 10, caps: [ 0, 1 ] };
		const handle1Data = { extrudePath: handleCurve1, steps: 10, caps: [ 0, 1 ] };

		const leftData = {
			x: frameThickness, y: height + frameThickness, z: thickness,
			segments: d, roundness: r, faces: [ 0, 1, 1, 1, 0, 0 ],
			roundFaces: [ 0, 1, 1, 1, 0, 0 ],
			relativeRoundness: false
		};
		const topData = {
			x: width + 2 * frameThickness, y: frameThickness, z: thickness,
			segments: d, roundness: r, faces: [ 0, 1, 0, 0, 1, 1 ],
			roundFaces: [ 0, 1, 0, 0, 1, 1 ],
			relativeRoundness: false,
		};

		const door0Data = { x: width, y: height, z: thickness/2 };
		const door1Data = { x: width + frameThickness / 2, y: height + frameThickness / 4, z: thickness / 2 };

		const handleThickness = .02;
		const handleProfileShape = new ASSETS.RoundedShape([
			[ 0, handleThickness/2 ],
			[ -handleThickness/2, handleThickness/2, handleThickness * .2, .2,, params.handleRoundDetail ],
			[ -handleThickness/2, -handleThickness/2, handleThickness * .2, .4,, params.handleRoundDetail ],
			[ handleThickness/2, -handleThickness/2, handleThickness * .2, .6,, params.handleRoundDetail ],
			[ handleThickness/2, handleThickness/2, handleThickness * .2, .8,, params.handleRoundDetail ],
			[ 0, handleThickness/2 ], // fake vertex, later it will match the first vertex
		]);

		const leftMidData = {
			x: thickness, y: height, z: wallThickness,
			faces: [ 0, 0, 0, 1, 0, 0 ] };
		const rightMidData = {
			x: thickness, y: height, z: wallThickness,
			faces: [ 0, 0, 1, 0, 0, 0 ] };
		const topMidData = {
			x: width + 2*thickness, y: thickness, z: wallThickness,
			faces: [ 0, 0, 0, 0, 1, 0 ] };

		const doorList = [];
		doorList.push( ...ASSETS.RoundedBoxGeometry.getRectangles( door0Data ) );
		doorList.push( ...ASSETS.RoundedBoxGeometry.getRectangles( door1Data ) );
		doorList.push( ...ASSETS.SmoothExtrudeGeometry.getRectangles( handleProfileShape, handle0Data ) );
		doorList.push( ...ASSETS.SmoothExtrudeGeometry.getRectangles( handleProfileShape, handle1Data ) );
		doorList.push( ...ASSETS.UVCylinderGeometry.getRectangles( hingeData ) );
		let binPacker = BP.minimalPacking( doorList, 2 );
		binPacker.generateUV();

		const frameList = [];
		frameList.push( ... ASSETS.RoundedBoxGeometry.getRectangles( leftMidData ) );
		frameList.push( ... ASSETS.RoundedBoxGeometry.getRectangles( rightMidData ) );
		frameList.push( ... ASSETS.RoundedBoxGeometry.getRectangles( topMidData ) );
		const frameData = {};
		const frameWidth = width + 2 * frameThickness;
		const frameHeight = height + frameThickness;
		frameList.push( { width: frameWidth + 0.015, height: frameHeight + 0.015, src: frameData, i: 0 } );
		binPacker = BP.minimalPacking( frameList, 2 );
		binPacker.generateUV();

		const left = new ASSETS.RoundedBoxGeometry( leftData )
			.translate( -width/2 - frameThickness/2, frameThickness/2, 0 );
		const right = new ASSETS.RoundedBoxGeometry( leftData )
			.translate( width/2 + frameThickness/2, frameThickness/2, 0 );
		const top = new ASSETS.RoundedBoxGeometry( topData )
			.translate( 0, height/2 + frameThickness/2, 0 );

		const leftMid = new ASSETS.RoundedBoxGeometry( leftMidData )
			.translate( -width/2-thickness/2, 0, 0 );
		const rightMid = new ASSETS.RoundedBoxGeometry( rightMidData )
			.translate( width/2+thickness/2, 0, 0 );
		const topMid = new ASSETS.RoundedBoxGeometry( topMidData )
			.translate( 0, height/2+thickness/2, 0 );

		const planes = [
			new THREE.Plane( new THREE.Vector3( 1, 1, 0 ), 0 ).normalize().translate( new THREE.Vector3( 0, height/2 - width / 2, 0 ) ),
			new THREE.Plane( new THREE.Vector3( -1, 1, 0 ), 0 ).normalize().translate( new THREE.Vector3( 0, height/2-width/2, 0 ) ),
		];

		ASSETS.clampGeometry( left, planes[ 0 ], new THREE.Vector3( 0, -1, 0 ) );
		ASSETS.clampGeometry( right, planes[ 1 ], new THREE.Vector3( 0, -1, 0 ) );

		ASSETS.clampGeometry( top, planes[ 0 ], new THREE.Vector3( 1, 0, 0 ) );
		ASSETS.clampGeometry( top, planes[ 1 ], new THREE.Vector3( -1, 0, 0 ) );

		const frame0 = BufferGeometryUtils.mergeGeometries([
			left, right, top,
		]).translate( 0, 0, wallThickness/2 + thickness/2 );
		ASSETS.projectUVs( frame0, new THREE.Vector3( 0, 0, 1 ), undefined, new THREE.Vector2( frameWidth/2, frameHeight/2 ) );
		ASSETS.transformUVs( frame0, frameData.uvMatrix[ 0 ]);
		const frame1 = frame0.clone().rotateY( Math.PI );

		this.frame = BufferGeometryUtils.mergeGeometries([
			frame0, frame1, leftMid, rightMid, topMid
		]);

		const frameMesh = new THREE.Mesh( this.frame, material );
		frameMesh.name = 'frame';
		this.add( frameMesh );

		const door0 = new ASSETS.RoundedBoxGeometry( door0Data )
			.translate( width/2 + frameThickness/4 + hingeOffset, 0, thickness/2 );
		const door1 = new ASSETS.RoundedBoxGeometry( door1Data )
			.translate( width/2 + frameThickness/4 + hingeOffset, frameThickness/8, 0 );
		const hinge0 = new ASSETS.UVCylinderGeometry( hingeData ).translate( 0, height/4, 0 );
		const hinge1 = new ASSETS.UVCylinderGeometry( hingeData ).translate( 0, -height/4, 0 );


		const handleGeometry0 = new ASSETS.SmoothExtrudeGeometry( handleProfileShape, handle0Data )
			.rotateX( Math.PI/2 ).translate( width, 0, 0 );
		const handleGeometry1 = new ASSETS.SmoothExtrudeGeometry( handleProfileShape, handle1Data )
			.rotateX( -Math.PI / 2 ).translate( width, 0, 0 );

		this.door = BufferGeometryUtils.mergeGeometries([ door0, door1, hinge0, hinge1, handleGeometry0, handleGeometry1 ]);
		this.door.uvIndex = 1;

		const doorMesh = new THREE.Mesh( this.door, material );
		doorMesh.position.set( -width/2 - frameThickness/4 - hingeOffset, 0, -wallThickness/2 - 5/4*thickness );
		doorMesh.rotation.y = params.openness * Math.PI/2;
		doorMesh.name = 'door';
		this.add( doorMesh );


		frame0.dispose();
		frame1.dispose();
		leftMid.dispose();
		rightMid.dispose();
		topMid.dispose();
		left.dispose();
		right.dispose();
		top.dispose();

		door0.dispose();
		door1.dispose();
		hinge0.dispose();
		hinge1.dispose();
		handleGeometry0.dispose();
		handleGeometry1.dispose();

	} // Doorframe.constructor


	dispose() {

		this.door?.dispose();
		this.frame?.dispose();
		this.clear();

	} // Doorframe.dispose

} // Doorframe

export { Doorframe };
