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


		const l = [];
		l.push( ...ASSETS.RoundedBoxGeometry.getRectangles( seatWidth, seatThickness, seatDepth ) ); // seat

		l.push( ...ASSETS.RoundedBoxGeometry.getRectangles(
			seatCussionWidth + ( upholstery ? r1 / Math.sqrt( 3 ) : 0 ),
			upholstery ? 1. : cussionThickness,
			seatCussionDepth + ( upholstery ? r1 / Math.sqrt( 3 ) : 0 )
		) ); // cussion1

		l.push( ...ASSETS.RoundedBoxGeometry.getRectangles(
			legThickness, seatHeight - seatThickness, legThickness, [ 1, 1, 1, 1, 1, 0 ]) ); // legs

		l.push( ...ASSETS.RoundedBoxGeometry.getRectangles(
			backrestSidesThickness, backrestHeight, backrestSidesThickness, [ 1, 1, 1, 1, 0, 1 ]) ); // backrest

		l.push( ...ASSETS.RoundedBoxGeometry.getRectangles(
			( upholstery ? seatWidth : backrestCussionWidth ) + ( upholstery ? r2 / Math.sqrt( 3 ) : 0 ),
			backrestHeight + ( upholstery ? r2 / Math.sqrt( 3 ) : 0 ),
			upholstery ? 1 : cussionThickness,
			[ !upholstery, 1, !upholstery, !upholstery, 0, !upholstery ]) ); // cussion2
		l.forEach( ( rect ) => {

			rect.width += 0.01;
			rect.height += 0.01;

		} );

		//console.log( "packing", l.length, "rectangles" );
		console.time( 'test' );
		let repeat = true;
		let scale = 1;
		let binPacker;
		while ( repeat ) {

			binPacker = BP.BinPack();
			binPacker.binWidth( scale );
			binPacker.binHeight( scale );
			binPacker.addAll( l );
			if ( binPacker.unpositioned.length == 0 ) repeat = false;
			else scale *= 1.1;

		}

		console.timeEnd( 'test' );
		//console.log( "packed", binPacker.positioned.length, "failed", binPacker.unpositioned.length, 'scale', scale );

		const uvRemap = ( tx = 0, ty = 0, s = 1, r = 0 ) => {

			return new THREE.Matrix3().rotate( r / 180 * Math.PI ).translate( tx, ty ).scale( s, s );

		};

		const pack = binPacker.positioned;
		//console.log( pack );

		const uvMatrices = pack.map( ( rect ) => uvRemap( rect.x + 0.005, rect.y + 0.005, 1./scale, 0 ) );
		//console.log( uvMatrices );

		const seat = new ASSETS.RoundedBoxGeometry(
			seatWidth, seatThickness, seatDepth,
			undefined, undefined, undefined,
			uvMatrices.slice( 0, 6 )
		).translate(
			0, seatHeight - seatThickness / 2, 0
		);

		const r1 = ASSETS.RoundedBoxGeometry.computeCurveRadius(
			seatCussionWidth, upholstery ? 1 : cussionThickness, seatCussionDepth,
			simple ? undefined : cussionRoundness
		);
		const cussion1 = new ASSETS.RoundedBoxGeometry(
			seatCussionWidth + ( upholstery ? r1 / Math.sqrt( 3 ) : 0 ),
			upholstery ? 1. : cussionThickness,
			seatCussionDepth + ( upholstery ? r1 / Math.sqrt( 3 ) : 0 ),
			simple ? undefined : cussionDetail,
			simple ? undefined : cussionRoundness,
			[ !upholstery, !upholstery, !upholstery, !upholstery, 0, 1 ],
			uvMatrices.slice( 6, 12 )
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
				legThickness, seatHeight - seatThickness, legThickness,
				undefined, undefined,
				[ 1, 1, 1, 1, 1, 0 ],
				uvMatrices.slice( 12, 18 )
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

		if ( upholstery ) {

			backrestSideL = new ASSETS.RoundedBoxGeometry(
				seatWidth - 0.001, backrestHeight, backrestSidesThickness,
				undefined, undefined,
				[ 1, 1, 1, 1, 0, 1 ],
				uvMatrices.slice( 18, 24 )
			).translate( 0, backrestHeight / 2, 0 ).applyMatrix4( backrestMatrix );

		} else {

			const backrestScale = new THREE.Vector3( backrestSidesThickness, backrestHeight, backrestSidesThickness );
			backrestSideL = new ASSETS.RoundedBoxGeometry(
				backrestScale.x, backrestScale.y, backrestScale.z,
				undefined, undefined,
				[ 1, 1, 1, 1, 0, 1 ],
				uvMatrices.slice( 18, 24 )
			).translate(
				seatWidth / 2 - backrestSidesThickness / 2 - 0.001, backrestHeight / 2, 0
			).applyMatrix4( backrestMatrix );

			backrestSideR = new ASSETS.RoundedBoxGeometry(
				backrestScale.x, backrestScale.y, backrestScale.z,
				undefined, undefined,
				[ 1, 1, 1, 1, 0, 1 ],
				uvMatrices.slice( 18, 24 )
			).translate(
				-seatWidth / 2 + backrestSidesThickness / 2 + 0.001, backrestHeight / 2, 0
			).applyMatrix4( backrestMatrix );

		}

		const r2 = ASSETS.RoundedBoxGeometry.computeCurveRadius(
			upholstery ? seatWidth : backrestCussionWidth,
			backrestHeight,
			upholstery ? 1 : cussionThickness,
			simple ? undefined : cussionRoundness
		);
		const cussion2 = new ASSETS.RoundedBoxGeometry(
			( upholstery ? seatWidth : backrestCussionWidth ) + ( upholstery ? r2 / Math.sqrt( 3 ) : 0 ),
			backrestHeight + ( upholstery ? r2 / Math.sqrt( 3 ) : 0 ),
			upholstery ? 1 : cussionThickness,
			simple ? undefined : cussionDetail,
			simple ? undefined : cussionRoundness,
			[ !upholstery, 1, !upholstery, !upholstery, 0, !upholstery ],
			uvMatrices.slice( 24, 30 )
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
