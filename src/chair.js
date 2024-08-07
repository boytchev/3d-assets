import * as THREE from 'three';
import * as ASSETS from './assets-utils.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

class Chair extends THREE.Group {

	static name = 'Chair';

	static defaults = {
		seatWidth: 42,
		seatDepth: 45,
		seatHeight: 45,
		seatThickness: 2,
		legThickness: 4,
		cussionThickness: 3,
		cussionOffset: 2,
		backrestHeight: 50,
		backrestSidesThickness: 4,
		backrestAngle: 5,

		cussionRoundness: 0.2,
		cussionDetail: 2,

		flat: false,
		simple: false,
	};


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

		const cussionRoundness = params.cussionRoundness;
		const cussionDetail = params.cussionDetail;
		const simple = params.simple;

		const material = ASSETS.defaultMaterial.clone();
		material.flatShading = params.flat;


		const uvRemap = ( tx = 0, ty = 0, s = 1, r = 0 ) => {

			return new THREE.Matrix3().rotate( r / 180 * Math.PI ).translate( tx, ty ).scale( s, s );

		};

		const uvEmpty = 0.03;
		const uvX1 = 2*uvEmpty + legThickness * 4;
		const uvY1 = 2*uvEmpty + seatDepth + seatThickness * 2;

		const uvY2 = 2 * uvEmpty + 2 * cussionThickness + backrestCussionWidth;

		const uvBoundX0 = 2*uvEmpty + 2 * seatWidth + 2 * seatThickness;
		const uvBoundY0 = uvEmpty + uvY1 + Math.max( backrestHeight + 2 * backrestSidesThickness, seatHeight + 2 * legThickness );

		const uvBoundX1 = 2 * uvEmpty + Math.max( 2 * backrestHeight + 2 * cussionThickness, 2 * seatCussionWidth + 2 * cussionThickness );
		const uvBoundY1 = 2 * uvEmpty + backrestCussionWidth + seatCussionDepth + 4 * cussionThickness;

		const uvScale0 = 1 / Math.max( uvBoundX0, uvBoundY0 );
		const uvScale1 = 1 / Math.max( uvBoundX1, uvBoundY1 );

		const uvMatrices = [
			uvRemap( uvEmpty, uvEmpty, uvScale0 ), // seat
			uvRemap( uvEmpty, uvY2, uvScale1 ), // cussion1
			uvRemap( uvEmpty, uvY1, uvScale0 ), // legs
			uvRemap( uvX1, uvY1, uvScale0 ), // backrestL
			uvRemap( uvX1 + backrestSidesThickness * 4, uvY1, uvScale0 ), // backrestR
			uvRemap( uvEmpty, uvEmpty, uvScale1 ), // cussion2
		];

		const seat = new ASSETS.RoundedBoxGeometry(
				 seatWidth, seatThickness, seatDepth,
			undefined, undefined, undefined,
			uvMatrices[ 0 ]
		).translate(
			0, seatHeight - seatThickness / 2, 0
		);

		const cussion1 = new ASSETS.RoundedBoxGeometry(
			seatCussionWidth, cussionThickness, seatCussionDepth,
			simple ? undefined : cussionDetail,
			simple ? undefined : cussionRoundness,
			[ 1, 1, 1, 1, 0, 1 ],
			uvMatrices[ 1 ]
		).translate(
			0, seatHeight + cussionThickness / 3, -cussionOffset / 4
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
				undefined, undefined, undefined,
				uvMatrices[ 2 ]
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

		const backrestScale = new THREE.Vector3( backrestSidesThickness, backrestHeight, backrestSidesThickness );

		const backrestSideL = new ASSETS.RoundedBoxGeometry(
			backrestScale.x, backrestScale.y, backrestScale.z,
			undefined, undefined, undefined,
			uvMatrices[ 3 ]
		).translate(
			seatWidth / 2 - backrestSidesThickness / 2 - 0.001, backrestHeight / 2, 0
		).applyMatrix4( backrestMatrix );


		const backrestSideR = new ASSETS.RoundedBoxGeometry(
			backrestScale.x, backrestScale.y, backrestScale.z,
			undefined, undefined, undefined,
			uvMatrices[ 4 ]
		).translate(
			-seatWidth / 2 + backrestSidesThickness / 2 + 0.001, backrestHeight / 2, 0
		).applyMatrix4( backrestMatrix );


		const cussion2 = new ASSETS.RoundedBoxGeometry(
			backrestCussionWidth, backrestHeight, cussionThickness,
			simple ? undefined : cussionDetail,
			simple ? undefined : cussionRoundness,
			[ 1, 1, 1, 1, 0, 1 ],
			uvMatrices[ 5 ]
		).translate(
			0, backrestHeight / 2, 0
		).applyMatrix4( backrestMatrix );

		// merge and create meshes
		this.frame = BufferGeometryUtils.mergeGeometries(
			[
				seat,
				backrestSideL,
				backrestSideR,
			].concat( legs )
		);
		this.frame.uvIndex = 0;

		this.cussions = BufferGeometryUtils.mergeGeometries([
			cussion1,
			cussion2
		]);
		this.cussions.uvIndex = 1;

		const frame = new THREE.Mesh( this.frame, material );
		frame.name = "frame";
		const cussions = new THREE.Mesh( this.cussions, material );
		cussions.name = "cussions";

		this.add( frame );
		this.add( cussions );

		this.position.y = -( seatHeight+backrestHeight )/2;

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


	// returns a set of random parameters
	static random() {

		return {
			seatWidth: ASSETS.random( 20, 100 ),
			seatDepth: ASSETS.random( 20, 100 ),
			seatHeight: ASSETS.random( 20, 100 ),
			seatThickness: ASSETS.random( 2, 10 ),
			legThickness: ASSETS.random( 2, 10 ),
			cussionThickness: ASSETS.random( 2, 15 ),
			cussionOffset: ASSETS.random( 2, 5 ),
			backrestHeight: ASSETS.random( 10, 100 ),
			backrestSidesThickness: ASSETS.random( 1, 10 ),
			backrestAngle: ASSETS.random( 0, 45 ),

			cussionRoundness: ASSETS.random( 0, 0.2 ),
			cussionDetail: ASSETS.round( ASSETS.random( 1, 10 ), 0 ),

			flat: ASSETS.random( 0, 100 ) < 30,
			simple: ASSETS.random( 0, 100 ) < 30,
		};

	} // Chair.random


} // Chair

export { Chair };
