
//	Assets: Mug



import * as THREE from 'three';
import * as ASSETS from './assets-utils.js';



class Mug extends THREE.Group {
	
	static defaults = {
		$name: 'Mug',

		height: 10, // cm
		widthTop: 8, // cm
		widthBottom: 8, // cm
		thickness: 0.4, // cm
	};

	constructor ( {params} ) {
	
		super( );
		
		
		var T = ASSETS.cm(params.thickness),
			WT = ASSETS.cm(params.widthTop)/2,
			WB = ASSETS.cm(params.widthBottom)/2,
			H = ASSETS.cm(params.height);
		
		var G = 0.01;
			G = THREE.MathUtils.clamp( G, 0, 0.48*T );
		
		// mug body
		var shape = new ASSETS.RoundedShape( [
			[0,T],
			[WB-T,T,2*G],
			[WT-T,H,G],
			[WT,H,G],
			[WB,0,3*G],
			[0,0],			
		] );
		
		var geometry = new THREE.LatheGeometry( shape.getPoints(6), 60 );

		this.body = new THREE.Mesh( geometry, ASSETS.defaultMaterial );

		this.add( this.body );
		
		this.position.set( 0, -H/2, 0 );
		
	} // Mug.constructor
	
	
	dispose( ) {
		this.body.geometry.dispose( );
		this.body.material.dispose( );
	} // Mug.dispose
		
		
	random( ) {
		// TO DO
	} // Mug.random
	
	
} // Mug




export { Mug };
