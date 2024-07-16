import * as THREE from 'three';
import * as ASSETS from './assets-utils.js';

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
		const uvX1 = 2*uvEmpty + seatCussionWidth + cussionThickness * 2;
		const uvX2 = 2*uvEmpty + Math.max( seatWidth * 2 + seatThickness * 2, uvX1 + 8 * backrestSidesThickness );
		const uvY1 = 2*uvEmpty + seatDepth + seatThickness * 2;
		const uvY2 = 2*uvEmpty + Math.max(
			uvY1 + seatCussionDepth + cussionThickness * 2,
			Math.max(
				uvY1 + backrestSidesThickness * 2 + backrestHeight,
				cussionThickness * 2 + backrestHeight * 2
			) );


		const uvBoundX = uvEmpty + Math.max(
			uvX2 + 2 * cussionThickness + backrestCussionWidth,
			uvEmpty + 2 * legThickness
		);
		const uvBoundY = uvEmpty + uvY2 + 4 * legThickness;

		const uvScale = 1 / Math.max( uvBoundX, uvBoundY );
		const uvMatrices = [
			uvRemap( uvEmpty, uvEmpty, uvScale ),
			uvRemap( uvEmpty, uvY1, uvScale ),
			uvRemap( uvEmpty, uvY2 + legThickness * 4, uvScale, 90 ),
			uvRemap( uvX1, uvY1, uvScale ),
			uvRemap( uvX1 + backrestSidesThickness * 4, uvY1, uvScale ),
			uvRemap( uvX2 + backrestCussionWidth + 2 * cussionThickness, uvEmpty, uvScale, -90 ),
		];

		{

			const scale = new THREE.Vector3( seatWidth, seatThickness, seatDepth );
			this.seat = new ASSETS.RoundedBoxGeometry(
				scale.x, scale.y, scale.z,
				undefined, undefined, undefined,
				uvMatrices[ 0 ]
			);
			const seat = new THREE.Mesh(
				this.seat,
				material
			);
			seat.position.y += seatHeight - seatThickness / 2;
			seat.castShadow = true;
			seat.receiveShadow = true;
			this.add( seat );

		}

		{ // seat cussion

			const scale = new THREE.Vector3(
				seatCussionWidth,
				cussionThickness,
				seatCussionDepth );
			this.cussion1 = new ASSETS.RoundedBoxGeometry(
				scale.x, scale.y, scale.z,
				simple ? undefined : cussionDetail,
				simple ? undefined : cussionRoundness,
				[ 1, 1, 1, 1, 0, 1 ],
				uvMatrices[ 1 ]
			);

			const cussion1 = new THREE.Mesh(
				this.cussion1,
				material
			);

			cussion1.position.set( 0, seatHeight + cussionThickness / 3, -cussionOffset / 4 );
			cussion1.castShadow = true;
			cussion1.receiveShadow = true;
			this.add( cussion1 );

		}

		{

			const scale = new THREE.Vector3( legThickness, seatHeight - seatThickness, legThickness );
			this.legs = [];
			const legPositions = [
				new THREE.Vector2( seatWidth / 2 - legThickness / 2, seatDepth / 2 - legThickness / 2 ),
				new THREE.Vector2( -seatWidth / 2 + legThickness / 2, seatDepth / 2 - legThickness / 2 ),
				new THREE.Vector2( seatWidth / 2 - legThickness / 2, -seatDepth / 2 + legThickness / 2 ),
				new THREE.Vector2( -seatWidth / 2 + legThickness / 2, -seatDepth / 2 + legThickness / 2 ),
			];
			for ( let i = 0; i < 4; ++i ) {

				this.legs[ i ] = new ASSETS.RoundedBoxGeometry(
					scale.x, scale.y, scale.z,
					undefined, undefined, undefined,
					uvMatrices[ 2 ]
				);

				const leg = new THREE.Mesh(
					this.legs[ i ],
					material
				);
				leg.position.set( legPositions[ i ].x, seatHeight / 2 - seatThickness / 2, legPositions[ i ].y );
				leg.castShadow = true;
				leg.receiveShadow = true;
				this.add( leg );

			}

		}

		{ // backrest

			const backrest = new THREE.Group();
			backrest.position.set(
				0,
				seatHeight - Math.sin( backrestAngle ) * backrestSidesThickness / 2,
				-seatDepth / 2 + backrestSidesThickness / 2
			);
			backrest.rotateX( -backrestAngle );

			const backrestScale = new THREE.Vector3( backrestSidesThickness, backrestHeight, backrestSidesThickness );

			{ // left

				this.backrestSideL = new ASSETS.RoundedBoxGeometry(
					backrestScale.x, backrestScale.y, backrestScale.z,
					undefined, undefined, undefined,
					uvMatrices[ 3 ]
				);
				const backrestL = new THREE.Mesh(
					this.backrestSideL,
					material
				);
				backrestL.position.set( seatWidth / 2 - backrestSidesThickness / 2 - 0.001, backrestHeight / 2, 0 );
				backrestL.castShadow = true;
				backrestL.receiveShadow = true;
				backrest.add( backrestL );

			}

			{ // right

				this.backrestSideR = new ASSETS.RoundedBoxGeometry(
					backrestScale.x, backrestScale.y, backrestScale.z,
					undefined, undefined, undefined,
					uvMatrices[ 4 ]
				);
				const backrestR = new THREE.Mesh(
					this.backrestSideR,
					material
				);
				backrestR.position.set( -seatWidth / 2 + backrestSidesThickness / 2 + 0.001, backrestHeight / 2, 0 );
				backrestR.castShadow = true;
				backrestR.receiveShadow = true;
				backrest.add( backrestR );

			}

			{ // backrest cussion

				const scale = new THREE.Vector3(
					backrestCussionWidth,
					backrestHeight,
					cussionThickness
				);

				this.cussion2 = new ASSETS.RoundedBoxGeometry(
					scale.x, scale.y, scale.z,
					simple ? undefined : cussionDetail,
					simple ? undefined : cussionRoundness,
					[ 1, 1, 1, 1, 0, 1 ],
					uvMatrices[ 5 ]
				);

				const backrestCussion = new THREE.Mesh(
					this.cussion2,
					material
				);

				backrestCussion.position.set( 0, backrestHeight / 2, 0 );
				backrestCussion.castShadow = true;
				backrestCussion.receiveShadow = true;
				backrest.add( backrestCussion );

			}

			this.add( backrest );

		}

		this.position.y = -( seatHeight+backrestHeight )/2;

	} // Chair.constructor


	dispose() {

		this.seat?.dispose();
		this.backrestSideL?.dispose();
		this.backrestSideR?.dispose();
		if ( this.legs )
			for ( let i = 0; i < 4; ++i )
				this.legs[ i ]?.dispose();
		this.cussion1?.dispose();
		this.cussion2?.dispose();
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
