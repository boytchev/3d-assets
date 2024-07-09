
//	Assets: Unitity functions and classes
//



import { LatheGeometry, MathUtils, MeshPhysicalMaterial, Shape, Vector2 } from 'three';
//import { MeshPhysicalNodeMaterial } from 'three/nodes';
//import { marble } from "tsl-textures/marble.js";


const AUTO = null;

// 2D curve with rounded vertices
// path = [vertex, vertex, vertex,...]
// where sharp vertex = [x,y,t]
// rounded vertex = [x,y,radius,texture]
class RoundedShape extends Shape {

	constructor( path ) {

		super();

		var v = new Vector2(), // current point
			u = new Vector2();

		var len, r;

		var firstTexture = null;

		for ( var i=0; i< path.length; i++ ) {

			var [ x, y, radius, texture, active, divisions ] = path[ i ];

			if ( texture == undefined ) texture = AUTO;
			if ( divisions == undefined ) divisions = 4;

			console.assert( active === true || active === undefined );

			if ( radius == 0 || radius == undefined ) {

				v.set( x, y );

				// [x, y]
				if ( i==0 ) {

					this.moveTo( x, y );
					firstTexture = texture;

				} else {

					this.lineTo( x, y );
					if ( firstTexture!==null ) {

						this.curves[ this.curves.length-1 ].v1.t = firstTexture;
						firstTexture = null;

					}

					this.curves[ this.curves.length-1 ].v2.t = texture;

				}

			} else {

				function calc() {

					v = v.sub( u );
					len = v.length();
					r = Math.min( radius, 0.8*len );
					v.setLength( r );
					v.addVectors( u, v );

				}

				u.set( x, y );
				calc();
				this.lineTo( v.x, v.y );
				if ( firstTexture!==null ) {

					this.curves[ this.curves.length-1 ].v1.t = firstTexture;
					firstTexture = null;

				}

				v.set( path[ i+1 ][ 0 ], path[ i+1 ][ 1 ]);
				calc();
				this.quadraticCurveTo( u.x, u.y, v.x, v.y );
				this.curves[ this.curves.length-1 ].v2.t = texture;
				this.curves[ this.curves.length-1 ].divisions = divisions;

			}

		} // for i

		//console.log( this.curves );

	} // RoundedShape.constructor

	getPoints( divisions ) {

		var points = [];

		for ( var i = 0, curves = this.curves; i < curves.length; i++ ) {

			var curve = curves[ i ];

			if ( curve.isLineCurve ) {

				points.push( curve.v1, curve.v2 );

			} else {

				var pts = curve.getPoints( curve.divisions ?? divisions );

				var midJ = Math.floor( pts.length/2 );

				for ( var j = 0; j < pts.length; j++ ) {

					const point = pts[ j ];

					if ( j==midJ ) point.t = curve.v2.t;

					points.push( point );

				} // for j

			} // if curve

		} // for i

		return points;

	} // RoundedShape.getPoints

} // class RoundedShape



// Lathe geometry with input = array of 2D points
// each point is [x, y, radius, uv, active], where
//		- x,y - 2D coordinates of point along the profile
//		- uv - texture coordinates (usually v)
//		- radius - curvature at this points

class LatheUVGeometry extends LatheGeometry {

	constructor( path, segments = 12, phiStart = 0, phiLength = Math.PI * 2 ) {

		path = path.filter( ( e ) => e.length<5 || e[ 4 ]===true );

		if ( path[ 0 ][ 3 ] == undefined ) path[ 0 ][ 3 ] = 0; // texture v=0
		if ( path[ path.length-1 ][ 3 ] == undefined ) path[ path.length-1 ][ 3 ] = 1; // texture v=1

		//console.table(path)

		// get all points (includes duplicates)
		var points = new RoundedShape( path ).getPoints( 4 );

		//console.table(points)

		// calculate lengths from beginning to each point
		var lengths = [ 0 ];
		for ( var i=1; i<points.length; i++ )
			lengths[ i ] = lengths[ i-1 ]+ points[ i ].distanceTo( points[ i-1 ]);

		//console.table(lengths)

		var j = 0; // next non-null uv index
		for ( var i=1; i<points.length-1; i++ ) {

			if ( points[ i ].t==undefined || points[ i ].t==null ) {

				if ( j<i ) {

					j = i+1;
					while ( points[ j ].t==undefined || points[ j ].t==null ) j++;

				}

				points[ i ].t = MathUtils.mapLinear(
					lengths[ i ],
					lengths[ i-1 ], lengths[ j ],
					points[ i-1 ].t, points[ j ].t );

			}

		}

		//console.table(points);

		var uniques = [ points[ 0 ] ];
		for ( var i=1; i<points.length; i++ ) {

			if ( ( points[ i ].x == points[ i-1 ].x )
				&& ( points[ i ].y == points[ i-1 ].y )
				&& ( points[ i ].t == points[ i-1 ].t )
			) continue;
			uniques.push( points[ i ]);

		}

		//console.table(uniques);

		super( uniques, segments, phiStart, phiLength );

		var uv = this.getAttribute( 'uv' );
		for ( var i=0; i<uv.count; i++ )
			uv.setY( i, uniques[ i%uniques.length ].t );

	} // LatheUVGeometry.constructor

} // LatheUVGeometry



// converts centimeters to meters
function cm( x ) {

	return x/100;

} // cm


// converts percentages to units
function percent( x ) {

	return x/100;

} // percent


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
	//side: DoubleSide,
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



function round( x, digits=3 ) {

	return Number( `${Math.round( `${x}e${digits}` )}e-${digits}` );

}


function random( min, max, digits=2 ) {

	var x = MathUtils.randFloat( min, max );

	return round( x, digits );

}


export { AUTO, RoundedShape, LatheUVGeometry, cm, percent, slope, defaultMaterial, map, mapExp, round, random };
