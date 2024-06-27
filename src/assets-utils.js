
//	Assets: Unitity functions and classes
//



import { DoubleSide, MathUtils, MeshPhysicalMaterial, Shape, Vector2 } from 'three';
//import { MeshPhysicalNodeMaterial } from 'three/nodes';
//import { marble } from "tsl-textures/marble.js";


// 2D curve with rounded vertices
// path = [vertex, vertex, vertex,...]
// where sharp vertex = [x,y]
// rounded vertex = [x,y,radius]
class RoundedShape extends Shape {

	constructor( path ) {

		super();

		var v = new Vector2(), // current point
			u = new Vector2();

		var len, r;

		for ( var i=0; i< path.length; i++ ) {

			var point = path[ i ];
			if ( point.length == 2 ) {

				// [x, y]
				v.set( ...point );
				if ( i == 0 )
					this.moveTo( v.x, v.y );
				else
					this.lineTo( v.x, v.y );

			} else {

				// [x, y, radius]
				var radius = point[ 2 ];

				function calc() {

					v = v.sub( u );
					len = v.length();
					r = Math.min( radius, 0.8*len );
					v.setLength( r );
					v.addVectors( u, v );

				}

				u.set( point[ 0 ], point[ 1 ]);
				calc();
				this.lineTo( v.x, v.y );

				v.set( path[ i+1 ][ 0 ], path[ i+1 ][ 1 ]);
				calc();
				this.quadraticCurveTo( u.x, u.y, v.x, v.y );

			}

		}

	}

} // class RoundedShape



// converts centimeters to meters
function cm( x ) {

	return x/100;

} // cm


// converts degrees to slope
function slope( x ) {

	return Math.sin( x*Math.PI/180 );

} // sope




// drfault material for assets
/*
var defaultMaterial = new MeshPhysicalNodeMaterial( {
		roughness: 0,
		metalness: 0.2,
		side: DoubleSide,
		colorNode: marble( {
			scale: 4,
			thinness: 12,
			noise: 0,
			color: new Color(0xd0e0ff),
			background: new Color(0xffffff),
			seed: 0
		} )
} );
*/
var defaultMaterial = new MeshPhysicalMaterial( {
	color: 'white',
	roughness: 0,
	metalness: 0.2,
	side: DoubleSide,
} );



// linear map between two intervals
function map( x, toMin=0, toMax=1, fromMin=0, fromMax=100 ) {

	x = MathUtils.mapLinear( x, fromMin, fromMax, toMin, toMax );

	return x;

}



// exponential map between two intervals
function mapExp( x, toMin, toMax, fromMin=0, fromMax=100 ) {

	x = map( x, 0, 1, fromMin, fromMax );
	x = 2**( x * Math.log2( toMax/toMin ) + Math.log2( toMin ) );

	return x;

}


function random (min, max, digits=2)
{
	var power = 10**digits;
	
	var x = MathUtils.randFloat( min, max );
	
	return Math.round( power*x)/power;
}


export { RoundedShape, cm, slope, defaultMaterial, map, mapExp, random };
