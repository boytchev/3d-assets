
//	3D Assets: Drink Can



import * as THREE from 'three';
import * as ASSETS from './assets-utils.js';


var lidTexture;
function getLidTexture( ) {

	if ( !lidTexture ) {

		lidTexture = new THREE.TextureLoader().load( "../src/textures/drink-can-lid.jpg" );

	}

	return lidTexture;

}




class DrinkCan extends THREE.Group {

	static name = 'Drink can';

	static defaults = {

		canHeight: 12, // cm
		canSize: 6, // cm
		canComplexity: 70, // %

		neckHeight: 1.5, // cm
		neckSize: 5, // cm

		neckLid: true, //
		neckTag: true, //

		edges: true,
		flat: false,
	};


	constructor( params ) {

		super( );

		this.generate( params );

	}


	generate( params ) {

		this.dispose( );

		var // can primary parameters
			cH = ASSETS.cm( params.canHeight ),
			cS = ASSETS.cm( params.canSize )/2,

			// neck primary parameters
			nH = ASSETS.cm( params.neckHeight ),
			nS = Math.min( ASSETS.cm( params.neckSize )/2, cS ),

			// neck derivative parameters
			nK = 0.005, // 3 mm outer inset of neck and base
			nP = 0.0015, // 1.5 mm
			nL = 0.003, // 5 mm inner inset of neck and base

			// tag derivative paameters
			tS = 0.7*nS,	// tag size
			tW = nS/2.5,	// tag width
			tP = 1.5*nP,
			tH = tW-2*tP,	// tag hole size
			tG = tH/1.15, // roundness of tag

			// complexities
			cC = Math.floor( ASSETS.mapExp( params.canComplexity, 6, 100 ) ),
			tC = Math.floor( ASSETS.mapExp( params.canComplexity, 4, 20 ) );

		// edges
		var cG = params.edges ? 0.001 : 0; // 1 mm

		// material
		var material = ASSETS.defaultMaterial.clone();
		material.flatShading = params.flat;

		// body

		var points = [];

		if ( params.edges )
			points.push(
				[ 0, 2*nL ], // 0a
				[ nS-2*nP, 2*nL, nS ], // 1, concave bottom
				[ nS-2*nP, 0, cG ], // 2
				[ nS-nP, 0, cG ], // 3
				[ nS*0.7+0.3*cS, nK/2, nS ], // 4

			);
		else
			points.push(
				[ 0, 0 ], // 0b
				[ nS, 0 ], // 3b
			); // flat bottom

		points.push(
			[ cS, nK, cG ], // 5
		);

		if ( cS!=nS )
			points.push([ cS, cH-nH, 2*cG ]); // 6

		points.push(
			[ nS, cH-2*nP, cG ], // 7
			[ nS, cH, cG ], // 8
			[ nS-nP, cH, cG ], // 9
			[ nS-nP, cH-nL ], // 10
			//[ 0, cH-nL],
		);

		if ( !params.neckLid )
			points.push([ 0, cH-nL ]); // 11

		var bodyShape = new ASSETS.RoundedShape( points );

		var bodyGeometry = new THREE.LatheGeometry( bodyShape.getPoints( 6 ), cC );

		// fix body UVs
		var pos = bodyGeometry.getAttribute( 'position' ),
			uv = bodyGeometry.getAttribute( 'uv' );

		var v = new THREE.Vector3(); // temp

		var rows = cC+1;
		var perRow = pos.count / rows;

		var botIndex = params.edges ? 13 : 1;
		var topIndex = params.edges ? ( cS!=nS?55:48 ) : ( cS!=nS?5:4 );
		var botDist = new THREE.Vector3().fromBufferAttribute( pos, botIndex ).length();
		var botY = new THREE.Vector3().fromBufferAttribute( pos, botIndex ).y;

		for ( var i=0; i<pos.count; i++ ) {

			v.fromBufferAttribute( pos, i );
			var dist = v.length();

			var inRow = i % perRow;

			if ( inRow<=botIndex )
				uv.setY( i, 0.1*dist/botDist );
			else
				if ( inRow<=topIndex ) {

					var y = v.y;
					uv.setY( i, THREE.MathUtils.mapLinear( y, botY, cH, 0.1, 0.98 ) );

				} else {

					var y = v.y;
					uv.setY( i, THREE.MathUtils.mapLinear( y, cH, cH-nL, 0.98, 1 ) );

				}

		}

		this.body = new THREE.Mesh( bodyGeometry, material );
		this.body.name = 'body';

		this.add( this.body );


		// lid

		if ( params.neckLid ) {

			// flat lid with bump texture

			// material
			var lidMaterial = ASSETS.defaultMaterial.clone();
			lidMaterial.flatShading = params.flat;
			lidMaterial.bumpMap = getLidTexture();
			lidMaterial.bumpScale = 1.5;

			this.lid = new THREE.Mesh(
				new THREE.CircleGeometry( nS-nP/2, cC ),
				lidMaterial
			);
			this.lid.name = 'lid';
			this.lid.rotation.set( -Math.PI/2, -Math.PI/2-0*Math.PI/cC, 0, 'YXZ' );

			this.lid.position.y = cH-nL;
			this.add( this.lid );

		}

		// tag
		if ( params.neckTag ) {

			// lid tag as 3D object
			var tMinY = -tH/2-tP,
				tMaxY = tMinY+tS,
				tMidY = ( tMinY+tMaxY )/2;

			var tagShape = new ASSETS.RoundedShape([
				[ tW/2, tMidY ],
				[ tW/2, tMaxY, tG ],
				[ -tW/2, tMaxY, tG ],
				[ -tW/2, tMinY, tG ],
				[ tW/2, tMinY, tG ],
				[ tW/2, tMidY ],
			]);

			var tagHole1 = new THREE.Shape();
			tagHole1.absarc( 0, 0, tH/2, 0, 2*Math.PI, !true );

			var tagHole2 = new THREE.Shape();
			tagHole2.absarc( 0, tMaxY-tH/2-tP, tH/2, 0, 2*Math.PI, !true );

			tagShape.holes = [ tagHole1, tagHole2 ];

			var tagGeometry = new THREE.ExtrudeGeometry( tagShape, {
				curveSegments: tC,
				steps: 1,
				depth: 0.001,
				bevelEnabled: false,
				bevelThickness: 0.001,
				bevelSize: 0.001,
			} );

			var uv = tagGeometry.getAttribute( 'uv' );
			for ( var i=0; i<uv.count; i++ )
				uv.setXY( i, ( -uv.getX( i ) )*100+0.5, uv.getY( i )*57.15+0.2857 );

			this.tag = new THREE.Mesh( tagGeometry, material.clone() );
			this.tag.name = 'tag';
			this.tag.material.color.set( 1.1, 1.1, 1.1 );
			this.tag.position.x = tH*0.39;
			this.tag.position.y = cH-nL+0.0005;
			this.tag.rotation.set( Math.PI/2, Math.PI/2, 0, 'YXZ' );
			this.add( this.tag );

		}

		this.position.y = -cH/2;

	} // DrinkCan.constructor


	dispose( ) {

		this.body?.geometry.dispose( );
		this.lid?.geometry.dispose( );
		this.tag?.geometry.dispose( );
		this.clear( );

	} // DrinkCan.dispose


	// returns a set of random parameters
	static random( ) {

		return {
			canHeight: ASSETS.random( 5, 20 ),
			canSize: ASSETS.random( 5, 8 ),

			neckHeight: ASSETS.random( 1, 3 ),
			neckSize: ASSETS.random( 4, 9 ),

			canComplexity: ASSETS.random( 0, 50 )+ASSETS.random( 0, 50 ),

			edges: ASSETS.random( 0, 100 ) > 30,
			flat: ASSETS.random( 0, 100 ) < 30,

			canComplexity: ASSETS.random( 0, 50 )+ASSETS.random( 0, 50 ),
		};

	} // DrinkCan.random


} // DrinkCan



export { DrinkCan };
