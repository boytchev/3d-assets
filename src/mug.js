
//	Assets: Mug



import * as THREE from 'three';
import * as ASSETS from './assets-utils.js';



class Mug extends THREE.Group {
	
	static defaults = {
		$name: 'Mug',

		height: 10, // cm
		wallWidth: 0.8, // cm
		radiusTop: 4, // cm
		radiusBottom: 4, // cm
	};

	constructor ( {params} ) {
	
		super( );
		
		var W = ASSETS.cm(params.wallWidth),
			RT = ASSETS.cm(params.radiusTop),
			RB = ASSETS.cm(params.radiusBottom),
			H = ASSETS.cm(params.height);
		
		var G = 0.01;
			G = THREE.MathUtils.clamp( G, 0, 0.48*W );
		
		// mug body
		var shape = new ASSETS.RoundedShape( [
			[0,W],
			[RB-W,W,2*G],
			[RT-W,H,G],
			[RT,H,G],
			[RB,0,3*G],
			[0,0],			
		] );
		
		var geometry = new THREE.LatheGeometry( shape.getPoints(6), 60 );

		this.body = new THREE.Mesh( geometry, ASSETS.defaultMaterial );

		this.add( this.body );
		
	} // Mug.constructor
	
	
	dispose( ) {
		this.body.geometry.dispose( );
		this.body.material.dispose( );
	} // Mug.dispose
		
} // Mug




export { Mug };
