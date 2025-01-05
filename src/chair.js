import * as THREE from 'three';
import * as ASSETS from './assets-utils.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import * as BP from './bin-packing.js';

class Chair extends ASSETS.Asset {

	static name = 'Chair';

	/* eslint-disable */
	static paramData = {

		seatWidth: {default: 42, type: 'cm', min: 20, max: 100, prec: 1, folder: "Seat", name: "Width"},
		seatDepth: {default: 45, type: 'cm', min: 20, max: 100, prec: 1, folder: "Seat", name: "Depth"},
		seatHeight: {default: 45, type: 'cm', min: 20, max: 100, prec: 1, folder: "Seat", name: "Height"},
		seatThickness: {default: 2, type: 'cm', min: 2, max: 10, prec: 1, folder: "Seat", name: "Thickness"},

		backrestHeight: {default: 50, type: 'cm', min: 10, max: 100, prec: 1, folder: "Backrest", name: "Height"},
		backrestSidesThickness: {default: 4, type: 'cm', min: 1, max: 10, prec: 1, folder: "Backrest", name: "Thickness"},
		backrestAngle: {default: 5, type: 'deg', min: 0, max: 45, prec: 1, folder: "Backrest", name: "Angle"},

		cussionThickness: {default: 3, type: 'cm', min: 2, max: 15, prec: 1, folder: "Cussions", name: "Thickness"},
		cussionOffset: {default: 2, type: 'cm', min: 2, max: 5, prec: 1, folder: "Cussions", name: "Offset"},
		cussionRoundness: {default: 0.2, type: Number, min: 0, max: 0.2, prec: 2, folder: "Cussions", name: "Roundness"},
		upholstery: {default: false, type: Boolean, chance: .5, folder: "Cussions", name: "Upholstery"},

		legThickness: {default: 4, type: 'cm', min: 2, max: 10, prec: 1, folder: "Legs", name: "Thickness"},

		cussionDetail: {default: 2, type: 'n', min: 1, max: 10, prec: 0, folder: "Complexity", name: "Cussions", exp: true},
		flat: {default: false, type: Boolean, chance: .3, folder: "Complexity", name: "Simple"},
		simple: {default: false, type: Boolean, chance: .3, folder: "Complexity", name: "Flat"},

	};
	/* eslint-enable */


	constructor( params ) {

		super();

		this.isChair = true;

		this.generate( params );

	}


	generate( params ) {

		this.dispose();

		const seatWidth = ASSETS.cm( params.seatWidth );
		const seatDepth = ASSETS.cm( params.seatDepth );
		const seatHeight = ASSETS.cm( params.seatHeight );
		const seatThickness = ASSETS.cm( params.seatThickness );
		const legThickness = ASSETS.cm( params.legThickness );
		const cussionThickness = ASSETS.cm( params.cussionThickness );
		const cussionOffset = ASSETS.cm( params.cussionOffset );
		const backrestHeight = ASSETS.cm( params.backrestHeight );
		const backrestSidesThickness = ASSETS.cm( params.backrestSidesThickness );
		const backrestAngle = params.backrestAngle / 180 * Math.PI;
		const seatCussionWidth = seatWidth - cussionOffset;
		const seatCussionDepth = seatDepth - cussionOffset / 2;
		const backrestCussionWidth = seatWidth - 2 * backrestSidesThickness;
		const upholstery = params.upholstery ? true : false;

		const cussionRoundness = params.cussionRoundness;
		const cussionDetail = params.cussionDetail;
		const simple = params.simple;

		const material = ASSETS.defaultMaterial.clone();
		material.flatShading = params.flat;

		// data for parts
		const seatData = {
			x: seatWidth, y: seatThickness, z: seatDepth,
		};
		const cussion1Data = {
			x: seatCussionWidth,
			y: upholstery ? 1. : cussionThickness,
			z: seatCussionDepth,
			faces: [ !upholstery, !upholstery, !upholstery, !upholstery, 0, 1 ],
			roundness: simple ? undefined : cussionRoundness,
		};
		const r1 = ASSETS.RoundedBoxGeometry.computeCurveRadius(
			cussion1Data.x, cussion1Data.y, cussion1Data.z, cussion1Data.roundness
		);
		if ( upholstery ) {

			cussion1Data.x += r1 / Math.sqrt( 3 );
			cussion1Data.z += r1 / Math.sqrt( 3 );

		}

		const legsData = {
			x: legThickness, y: seatHeight - seatThickness, z: legThickness,
			faces: [ 1, 1, 1, 1, 1, 0 ],
		};
		const cussion2Data = {
			x: ( upholstery ? seatWidth : backrestCussionWidth ),
			y: backrestHeight,
			z: upholstery ? 1 : cussionThickness,
			faces: [ !upholstery, 1, !upholstery, !upholstery, 0, !upholstery ],
			roundness: simple ? undefined : cussionRoundness,
		};
		const r2 = ASSETS.RoundedBoxGeometry.computeCurveRadius(
			cussion2Data.x, cussion2Data.y, cussion2Data.z, cussion2Data.roundness
		);
		if ( upholstery ) {

			cussion2Data.x += r2 / Math.sqrt( 3 );
			cussion2Data.y += r2 / Math.sqrt( 3 );

		}

		const backrestData = {
			x: upholstery ? seatWidth - 0.001 : backrestSidesThickness,
			y: backrestHeight,
			z: backrestSidesThickness,
			faces: [ 1, 1, 1, 1, 0, 1 ],
		};

		const l = [];

		l.push( ...ASSETS.RoundedBoxGeometry.getRectangles( seatData ) );
		l.push( ...ASSETS.RoundedBoxGeometry.getRectangles( cussion1Data ) );
		l.push( ...ASSETS.RoundedBoxGeometry.getRectangles( legsData ) );
		l.push( ...ASSETS.RoundedBoxGeometry.getRectangles( backrestData ) );
		l.push( ...ASSETS.RoundedBoxGeometry.getRectangles( cussion2Data ) );

		let binPacker = BP.minimalPacking( l, 1. );
		binPacker.generateUV();

		const seat = new ASSETS.RoundedBoxGeometry(
			seatData.x, seatData.y, seatData.z,
			undefined, undefined, undefined,
			seatData.uvMatrix
		).translate(
			0, seatHeight - seatThickness / 2, 0
		);

		const cussion1 = new ASSETS.RoundedBoxGeometry(
			cussion1Data.x, cussion1Data.y, cussion1Data.z,
			simple ? undefined : cussionDetail,
			simple ? undefined : cussionRoundness,
			cussion1Data.faces,
			cussion1Data.uvMatrix
		);
		if ( upholstery )
			cussion1.translate(
				0,
				seatHeight - 0.5 + r1 * ( 1 - 1 / Math.sqrt( 2 ) ),
				-cussionOffset / 4,
			);
		else
			cussion1.translate(
				0,
				seatHeight + cussionThickness * .5 - r1 + r1 / Math.sqrt( 3 ),
				-cussionOffset / 4
			);


		const legs = [];
		const legPositions = [
			new THREE.Vector2( seatWidth / 2 - legThickness / 2, seatDepth / 2 - legThickness / 2 ),
			new THREE.Vector2( -seatWidth / 2 + legThickness / 2, seatDepth / 2 - legThickness / 2 ),
			new THREE.Vector2( seatWidth / 2 - legThickness / 2, -seatDepth / 2 + legThickness / 2 ),
			new THREE.Vector2( -seatWidth / 2 + legThickness / 2, -seatDepth / 2 + legThickness / 2 ),
		];
		for ( let i = 0; i < 4; ++i ) {

			legs[ i ] = new ASSETS.RoundedBoxGeometry(
				legsData.x, legsData.y, legsData.z,
				undefined, undefined,
				legsData.faces,
				legsData.uvMatrix
			).translate(
				legPositions[ i ].x, seatHeight / 2 - seatThickness / 2, legPositions[ i ].y
			);

		}

		// backrest
		const backrestMatrix =
			new THREE.Matrix4().makeTranslation(
				0,
				seatHeight - Math.sin( backrestAngle ) * backrestSidesThickness / 2,
				-seatDepth / 2 + backrestSidesThickness / 2
			).multiply(
				new THREE.Matrix4().makeRotationX( -backrestAngle )
			);

		let backrestSideL = null;
		let backrestSideR = null;

		backrestSideL = new ASSETS.RoundedBoxGeometry(
			backrestData.x, backrestData.y, backrestData.z,
			undefined, undefined,
			backrestData.faces,
			backrestData.uvMatrix
		);

		if ( upholstery )
			backrestSideL.translate( 0, backrestHeight / 2, 0 ).applyMatrix4( backrestMatrix );
		else {

			backrestSideL.translate(
				seatWidth / 2 - backrestSidesThickness / 2 - 0.001, backrestHeight / 2, 0
			).applyMatrix4( backrestMatrix );

			backrestSideR = new ASSETS.RoundedBoxGeometry(
				backrestData.x, backrestData.y, backrestData.z,
				undefined, undefined,
				backrestData.faces,
				backrestData.uvMatrix
			).translate(
				-seatWidth / 2 + backrestSidesThickness / 2 + 0.001, backrestHeight / 2, 0
			).applyMatrix4( backrestMatrix );

		}

		const cussion2 = new ASSETS.RoundedBoxGeometry(
			cussion2Data.x, cussion2Data.y, cussion2Data.z,
			simple ? undefined : cussionDetail,
			simple ? undefined : cussionRoundness,
			cussion2Data.faces,
			cussion2Data.uvMatrix
		);
		if ( upholstery )
			cussion2.translate(
				0,
				backrestHeight / 2,
				-.5 + backrestSidesThickness / 2 + r2 * ( 1 - 1 / Math.sqrt( 2 ) )
			).applyMatrix4( backrestMatrix );
		else
			cussion2.translate(
				0,
				backrestHeight / 2,
				Math.max( 0, cussionThickness / 2 - backrestSidesThickness / 2 )
			).applyMatrix4( backrestMatrix );

		// merge geometries and create meshes
		this.frame = BufferGeometryUtils.mergeGeometries(
			[ seat, backrestSideL, backrestSideR ]
				.concat( legs ).filter( x => !!x )
		);
		this.frame.uvIndex = 0;

		const hasCussions = !upholstery || !simple;

		if ( hasCussions ) {

			this.cussions = BufferGeometryUtils.mergeGeometries([
				cussion1,
				cussion2
			]);
			this.cussions.uvIndex = 0;

		}

		const frame = new THREE.Mesh( this.frame, material );
		frame.name = "frame";
		this.add( frame );
		if ( hasCussions ) {

			const cussions = new THREE.Mesh( this.cussions, material );
			cussions.name = "cussions";
			this.add( cussions );

		}

		this.position.y = -( seatHeight + backrestHeight ) / 2;

		seat.dispose();
		backrestSideL.dispose();
		backrestSideL.dispose();
		for ( let i = 0; i < 4; ++i )
			legs[ i ].dispose();
		cussion1.dispose();
		cussion2.dispose();

	} // Chair.constructor


	dispose() {

		this.frame?.dispose();
		this.cussions?.dispose();
		this.clear();

	} // Chair.dispose

} // Chair

export { Chair };
