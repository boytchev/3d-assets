
//	Assets: Unitity functions and classes
//



import { BufferAttribute, BufferGeometry, LatheGeometry, MathUtils, Matrix3, MeshPhysicalMaterial, Shape, Vector2, Vector3 } from 'three';
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

// Generates a box with rounded corners.
// Built to replace the RoundedBoxGeometry three.js plugin
// but uses an index buffer
//
class RoundedBoxGeometry extends BufferGeometry {

	constructor( x, y, z, segments = 2, roundness = 0, faces = [ 1, 1, 1, 1, 1, 1 ], uvMatrix = new Matrix3() ) {

		super();
		const seg = roundness > 0 ? segments : 0;
		const detail = seg * 2 + 1;
		let planeCount = faces.reduce( ( a, b ) => a+b );
		const vertexCount = planeCount * ( detail + 1 ) * ( detail + 1 );
		const faceCount = planeCount * detail * detail;
		let perm;
		if ( x <= y && x <= z ) perm = [ 2, 0, 1 ];
		else if ( y <= x && y <= z ) perm = [ 0, 1, 2 ];
		else if ( z <= x && z <= y ) perm = [ 1, 2, 0 ];

		let size = [ x, y, z ];
		size = [ size[ perm[ 0 ] ], size[ perm[ 1 ] ], size[ perm[ 2 ] ] ];
		x = size[ 0 ];
		y = size[ 1 ];
		z = size[ 2 ];

		const minSize = Math.min( x, Math.min( y, z ) );
		const maxSize = Math.max( x, Math.max( y, z ) );
		const radius = Math.min( roundness * maxSize * .5, minSize * .5 );

		const vertices = new Float32Array( vertexCount * 3 );
		const normals = new Float32Array( vertexCount * 3 );
		const uvs = new Float32Array( vertexCount * 2 );

		const indices = new Uint16Array( faceCount * 6 );

		const uvRemapMatrix = ( tx, ty, sx, sy, r = 0 ) =>
			new Matrix3().scale( sx, sy ).rotate( r / 180 * Math.PI ).translate( tx, ty );

		let m = [
			uvRemapMatrix( y+x, 0, -x, y ).premultiply( uvMatrix ),
			uvRemapMatrix( y+x, y+z+y, -x, -y ).premultiply( uvMatrix ),

			uvRemapMatrix( y+x+y, y, -y, z ).premultiply( uvMatrix ),
			uvRemapMatrix( 0, y, y, z ).premultiply( uvMatrix ),

			uvRemapMatrix( 2*y + x, y, -z, x, 90 ).premultiply( uvMatrix ),
			uvRemapMatrix( y + x, y, -z, -x, 90 ).premultiply( uvMatrix ),
		];

		// count offset for writing
		let vertexOffset = 0;
		let indexOffset = 0;
		for ( let axis0 = 0; axis0 < 3; ++axis0 ) {

			// calculate replacements for x,y,z
			const axis1 = ( axis0 + 1 ) % 3;
			const axis2 = ( axis0 + 2 ) % 3;

			// vertex count for current face
			const faceVertices = ( detail + 1 ) * ( detail + 1 );
			const faceIndices = detail * detail;
			for ( let u = 0; u < 2; ++u ) {

				if ( !faces[ perm[ axis0 ] * 2 + u ]) continue;

				for ( let i = 0; i < detail + 1; ++i ) {

					for ( let j = 0; j < detail + 1; ++j ) {

						let k = i * ( detail + 1 ) + j + vertexOffset;

						const vertex = new Vector3();
						const d = Math.max( 1, seg );

						if ( i < detail / 2 )
							vertex.x = i * radius / d - size[ axis0 ] / 2;
						else
							vertex.x = size[ axis0 ] / 2 - radius + ( i-d-1 ) * radius / d;

						if ( j < detail / 2 )
							vertex.y = j * radius / d - size[ axis1 ] / 2;
						else
							vertex.y = size[ axis1 ] / 2 - radius + ( j-d-1 ) * radius / d;

						vertex.z = ( u - 0.5 ) * size[ axis2 ];

						const center = new Vector3(
							clamp( vertex.x, -size[ axis0 ]/2 + radius, size[ axis0 ]/2 - radius ),
							clamp( vertex.y, -size[ axis1 ]/2 + radius, size[ axis1 ]/2 - radius ),
							clamp( vertex.z, -size[ axis2 ]/2 + radius, size[ axis2 ]/2 - radius ),
						);

						if ( roundness != 0 ) {

							const normal = new Vector3().subVectors( vertex, center ).normalize();

							normals[ k * 3 + perm[ axis0 ] ] = normal.x;
							normals[ k * 3 + perm[ axis1 ] ] = normal.y;
							normals[ k * 3 + perm[ axis2 ] ] = normal.z;

							vertex.addVectors( center, normal.multiplyScalar( radius ) );

						} else {

							normals[ k * 3 + perm[ axis0 ] ] = 0;
							normals[ k * 3 + perm[ axis1 ] ] = 0;
							normals[ k * 3 + perm[ axis2 ] ] = 1;

						}

						vertices[ k * 3 + perm[ axis0 ] ] = vertex.x;
						vertices[ k * 3 + perm[ axis1 ] ] = vertex.y;
						vertices[ k * 3 + perm[ axis2 ] ] = vertex.z;

						let uv = new Vector2(
							( vertex.x + size[ axis0 ] / 2 ) / size[ axis0 ],
							( vertex.y + size[ axis1 ] / 2 ) / size[ axis1 ]
						);

						uv.applyMatrix3( m[ axis0 * 2 + u ]);

						uvs[ k * 2 ] = uv.x;
						uvs[ k * 2 + 1 ] = uv.y;

					}

				}

				for ( let i = 0; i < detail; ++i ) {

					for ( let j = 0; j < detail; ++j ) {

						let ki = i * detail + j + indexOffset;
						let kv = i * ( detail + 1 ) + j + vertexOffset;

						const norm = ( -u * 2 + 1 );
						indices[ ki * 6 + 5 * u + 0 * norm ] = kv;
						indices[ ki * 6 + 5 * u + 1 * norm ] = kv + 1;
						indices[ ki * 6 + 5 * u + 2 * norm ] = kv + detail + 1;
						indices[ ki * 6 + 5 * u + 3 * norm ] = kv + detail + 1;
						indices[ ki * 6 + 5 * u + 4 * norm ] = kv + 1;
						indices[ ki * 6 + 5 * u + 5 * norm ] = kv + detail + 2;

					}

				}

				// add to the offset
				vertexOffset += faceVertices;
				indexOffset += faceIndices;

			}

		}

		this.setAttribute( 'position', new BufferAttribute( vertices, 3 ) );
		this.setAttribute( 'normal', new BufferAttribute( normals, 3 ) );
		this.setAttribute( 'uv', new BufferAttribute( uvs, 2 ) );

		this.setIndex( new BufferAttribute( indices, 1 ) );

	}

}


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

function clamp( x, min, max ) {

	return MathUtils.clamp( x, min, max );

}


export { RoundedBoxGeometry, AUTO, RoundedShape, LatheUVGeometry, cm, clamp, percent, slope, defaultMaterial, map, mapExp, round, random };
