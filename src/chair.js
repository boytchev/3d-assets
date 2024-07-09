import * as THREE from 'three';
import * as ASSETS from './assets-utils.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

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
		cussionDetail: 3,

		flat: false,
		simple: false,
	};


	constructor( params ) {

		super();

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

		const cussionRoundness = params.cussionRoundness;
		const cussionDetail = params.cussionDetail;
		const simple = params.simple;

		const material = ASSETS.defaultMaterial.clone();
		material.flatShading = params.flat;

		this.box = new THREE.BoxGeometry( 1, 1, 1 );

		const seat = new THREE.Mesh(
			this.box,
			material
		);
		seat.scale.set( seatWidth, seatThickness, seatDepth );
		seat.position.y += seatHeight - seatThickness / 2;
		seat.castShadow = true;
		seat.receiveShadow = true;
		this.add( seat );

		{ // seat cussion

			const scale = new THREE.Vector3(
				seatWidth - cussionOffset,
				cussionThickness,
				seatDepth - cussionOffset / 2 );
			if ( !simple ) {

				this.cussion1 = new RoundedBoxGeometry(
					scale.x, scale.y, scale.z,
					cussionDetail, cussionRoundness
				);

			}

			const cussion1 = new THREE.Mesh(
				this.cussion1 ? this.cussion1 : this.box,
				material
			);

			if ( simple ) cussion1.scale.set( scale.x, scale.y, scale.z );
			cussion1.position.set( 0, seatHeight + cussionThickness / 3, -cussionOffset / 4 );
			cussion1.castShadow = true;
			cussion1.receiveShadow = true;
			this.add( cussion1 );

		}

		const legPositions = [
			new THREE.Vector2( seatWidth / 2 - legThickness / 2, seatDepth / 2 - legThickness / 2 ),
			new THREE.Vector2( -seatWidth / 2 + legThickness / 2, seatDepth / 2 - legThickness / 2 ),
			new THREE.Vector2( seatWidth / 2 - legThickness / 2, -seatDepth / 2 + legThickness / 2 ),
			new THREE.Vector2( -seatWidth / 2 + legThickness / 2, -seatDepth / 2 + legThickness / 2 ),
		];
		for ( let i = 0; i < 4; ++i ) {

			const leg = new THREE.Mesh(
				this.box,
				material
			);
			leg.scale.set( legThickness, seatHeight, legThickness );
			leg.position.set( legPositions[ i ].x, seatHeight / 2, legPositions[ i ].y );
			leg.castShadow = true;
			leg.receiveShadow = true;
			this.add( leg );

		}

		{ // backrest

			const backrest = new THREE.Group();
			backrest.position.set(
				0,
				seatHeight - Math.sin( backrestAngle ) * backrestSidesThickness / 2,
				-seatDepth / 2 + backrestSidesThickness / 2
			);
			backrest.rotateX( -backrestAngle );

			{ // left

				const backrestL = new THREE.Mesh(
					this.box,
					material
				);
				backrestL.scale.set( backrestSidesThickness, backrestHeight, backrestSidesThickness );
				backrestL.position.set( seatWidth / 2 - backrestSidesThickness / 2, backrestHeight / 2, 0 );
				backrestL.castShadow = true;
				backrestL.receiveShadow = true;
				backrest.add( backrestL );

			}

			{ // right

				const backrestR = new THREE.Mesh(
					this.box,
					material
				);
				backrestR.scale.set( backrestSidesThickness, backrestHeight, backrestSidesThickness );
				backrestR.position.set( -seatWidth / 2 + backrestSidesThickness / 2, backrestHeight / 2, 0 );
				backrestR.castShadow = true;
				backrestR.receiveShadow = true;
				backrest.add( backrestR );

			}

			{ // backrest cussion

				const scale = new THREE.Vector3(
					seatWidth - 2 * backrestSidesThickness,
					backrestHeight,
					cussionThickness
				);

				if ( !simple ) {

					this.cussion2 = new RoundedBoxGeometry(
						scale.x, scale.y, scale.z,
						cussionDetail,
						cussionRoundness
					);

				}

				const backrestCussion = new THREE.Mesh(
					this.cussion2 ? this.cussion2 : this.box,
					material
				);

				if ( simple ) backrestCussion.scale.set( scale.x, scale.y, scale.z );
				backrestCussion.position.set( 0, backrestHeight / 2, 0 );
				backrestCussion.castShadow = true;
				backrestCussion.receiveShadow = true;
				backrest.add( backrestCussion );

			}

			this.add( backrest );

		}

	} // Chair.constructor


	dispose() {

		this.box?.dispose();
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
			cussionDetail: ASSETS.random( 1, 10 ),

			flat: ASSETS.random( 0, 100 ) < 30,
			simple: ASSETS.random( 0, 100 ) < 30,
		};

	} // Chair.random


} // Chair

export { Chair };
