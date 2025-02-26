
import { Matrix3 } from 'three';


// Rect class
class Rect {

	constructor( x, y, width, height, rotated = false ) {

		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		if ( rotated ) this.rotated = rotated;

	}

	set( x, y, width, height, rotated=false ) {

		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		if ( rotated ) this.rotated = rotated;

	}

	contains( r ) {

		// Does this rectangle contain the specified rectangle?
		return this.x <= r.x &&
			this.y <= r.y &&
			this.x + this.width >= r.x + r.width &&
			this.y + this.height >= r.y + r.height;

	}
	disjointFrom( r ) {

		// Is this rectangle disjoint from the specified rectangle?
		return this.x + this.width <= r.x ||
			this.y + this.height <= r.y ||
			r.x + r.width <= this.x ||
			r.y + r.height <= this.y;

	}
	intersects( r ) {

		// Does this rectangle intersect the specified rectangle?
		return !this.disjointFrom( r );

	}
	copy() {

		// Create a copy of this rectangle.
		return new Rect( this.x, this.y, this.width, this.height, this.rotated );

	}

}


function filterInPlace( a, condition ) {

	let j = 0;

	a.forEach( ( e, i ) => {

		if ( condition.call( null, e, i, a ) ) {

			if ( i!==j ) a[ j ] = e;
			j++;

		}

	} );

	a.length = j;
	return a;

}

/** BinPacker class
 *
 * Uses MAXRECTS-BSSF-BNF bin packer algorithm from
 * https://github.com/juj/RectangleBinPack
 *
 * MAXRECTS-BSSF-BNF stands for "Maximal Rectangles - Best Short Side Fit". It
 * positions the rectangle against the short side of the free rectangle into
 * which it fits most snugly.
 */
class BinPacker {

	constructor( width, height ) {

		this.width = width;
		this.height = height;

		// Array of rectangles representing the free space in the bin
		this.F = [ new Rect( 0, 0, width, height ) ];

		this.positioned = [];
		this.unpositioned = [];

	}

	static findPosition( width, height, F ) {

		let bestRect = new Rect( undefined, undefined, width, height );
		let bestShortSideFit = Number.MAX_VALUE, bestLongSideFit = Number.MAX_VALUE;

		// try to fit 'r' in a single free rectangle. Record if it is the best found fitting
		const fitRectIn = ( f, width, height ) => {

			// can fit
			if ( f.width >= width && f.height >= height ) {

				const leftoverHorizontal = Math.abs( f.width - width ), leftoverVertical = Math.abs( f.height - height );

				const shortSideFit = Math.min( leftoverHorizontal, leftoverVertical );
				const longSideFit = Math.max( leftoverHorizontal, leftoverVertical );

				// check heuristic
				if ( shortSideFit < bestShortSideFit ||
					( shortSideFit == bestShortSideFit && longSideFit < bestLongSideFit ) ) {

					// Position rectangle in the bottom-left corner of the free rectangle
					bestRect.set( f.x, f.y, width, height );

					bestShortSideFit = shortSideFit;
					bestLongSideFit = longSideFit;

				}

			}

		};

		// Find best fit
		for ( var i = 0; i < F.length; i++ ) {

			var f = F[ i ]; // the current free rectangle

			fitRectIn( f, width, height );
			fitRectIn( f, height, width );

		}

		if ( bestRect.width != width )
			bestRect.rotated = true;

		return bestRect;

	}

	static splitRectangle( f, r ) {

		var new_rectangles = [];
		let minF = { x: f.x, y: f.y };
		let maxF = { x: f.x + f.width, y: f.y + f.height };
		let minR = { x: r.x, y: r.y };
		let maxR = { x: r.x + r.width, y: r.y + r.height };

		const AABBRect = ( mx, my, Mx, My ) => {

			let w = Mx-mx, h = My-my;
			if ( w > 0 && h > 0 )
				new_rectangles.push( new Rect( mx, my, w, h ) );

		};

		/*
		 * +---+---+---+
		 * |   ! 4 !   |
		 * +...+---+...+
		 * | 1 |   | 2 |
		 * +...+---+...+
		 * |   ! 3 !   |
		 * +---+---+---+
		 */

		if ( minR.x <= maxF.x )
			AABBRect( minF.x, minF.y, minR.x, maxF.y ); // 1
		if ( maxR.x >= minF.x )
			AABBRect( maxR.x, minF.y, maxF.x, maxF.y ); // 2
		if ( minR.y <= maxF.y )
			AABBRect( minF.x, minF.y, maxF.x, minR.y ); // 3
		if ( maxR.y >= minF.y )
			AABBRect( minF.x, maxR.y, maxF.x, maxF.y ); // 4

		return new_rectangles;

	}

	static pruneRectangles( F ) {

		// Go through the array of rectangles, F, and remove any that are
		// completely contained within another rectangle in F

		for ( var i = 0; i < F.length; i++ ) {

			for ( var j = i + 1; j < F.length; j++ ) {

				if ( F[ i ].d && F[ j ].d ) continue;
				if ( F[ j ].contains( F[ i ]) ) {

					F[ i ].d = true;
					break;

				}

				if ( F[ i ].contains( F[ j ]) ) {

					F[ j ].d = true;

				}

			}

		}

		filterInPlace( F, f => !f.d );

	}

	insert( width, height ) {

		// Insert a rectangle into the bin.
		//
		// If the rectangle was successfully positioned, add it to the array of
		// positioned rectangles and return an object with this information and the
		// rectangle object.
		//
		// If the rectangle couldn't be positioned in the bin, add it to the array of
		// unpositioned rectangles and return an object with this information and the
		// rectangle object (which as undefined x- and y-properties.

		// Find where to put the rectangle. Searches the array of free rectangles for
		// an open spot and returns one when it's found.
		var r = BinPacker.findPosition( width, height, this.F );

		// Unpositioned rectangle (it has no x-property if it's unpositioned)
		if ( r.x == undefined ) {

			this.unpositioned.push( r );
			return { positioned: false, rectangle: r };

		}

		// Split the free rectangles based on where the new rectangle is positioned
		var n = this.F.length;
		for ( var i = 0; i < n; i++ ) {

			if ( !this.F[ i ].intersects( r ) ) continue;
			let new_rectangles;
			// splitRectangle() returns an array of sub-rectangles if the rectangle
			// was split (which is truthy) and false otherwise
			new_rectangles = BinPacker.splitRectangle( this.F[ i ], r );
			if ( new_rectangles ) {


				// remove the free rectangle that was split
				this.F.splice( i, 1 );

				// append new free rectangles formed by the split															// split
				this.F = this.F.concat( new_rectangles );

				--i; --n;

			}

		}

		BinPacker.pruneRectangles( this.F );

		this.positioned.push( r );

		return { positioned: true, rectangle: r };

	}

}

class BinPack {

	binWidth;
	binHeight;
	padding;
	#packer;
	#sort;

	constructor( binWidth = 800, binHeight = 800, padding = 0.01 ) {

		this.binWidth = binWidth;
		this.binHeight = binHeight;
		this.padding = padding;
		this.#packer = new BinPacker( this.binWidth, this.binHeight );
		this.#sort = ( a, b ) => b.width * b.height - a.width * a.height;

	}

	/**
	 * @param { Array<Number> }array
	 */
	addAll( array ) {

		if ( this.#sort ) array.sort( this.#sort );
		array.forEach( function ( d, _ ) {

			var o = this.#packer.insert( d.width + this.padding, d.height + this.padding );
			o.rectangle.data = d;

		}, this );

	}

	add( r ) {

		let res = this.#packer.insert( r.width, r.height );
		res.data = r;

	}

	generateUV() {

		const uvRemap = ( tx = 0, ty = 0, s = 1, r = false, width = 0 ) => {

			let mat = new Matrix3();
			if ( r )
				mat = mat.rotate( .5 * Math.PI ).translate( 0, width );

			return mat.translate( tx, ty ).scale( s, s );

		};

		for ( const rect of this.positioned ) {

			rect.data.src.uvMatrix ??= [];
			if ( rect.rotated )
				rect.data.src.uvMatrix[ rect.data.i ] = uvRemap( rect.x + this.padding/2, rect.y - this.padding/2, 1./this.binWidth, true, rect.height );
			else rect.data.src.uvMatrix[ rect.data.i ] = uvRemap( rect.x + this.padding/2, rect.y + this.padding/2, 1./this.binWidth );
			rect.data.src.autouv = true;

		}

	}

	/**
	 * @param {(a: any, b: any) => boolean} f
	 */
	set sort( f ) {

		this.#sort = f;

	}

	get positioned() {

		return this.#packer.positioned;

	}
	get unpositioned() {

		return this.#packer.unpositioned;

	}

}

function minimalPacking( list, startSize, padding = 0.015, increment = 1.1 ) {

	let binPacker;
	let repeat = true;
	while ( repeat ) {

		binPacker = new BinPack( startSize, startSize, padding * startSize );
		binPacker.addAll( list );
		if ( binPacker.unpositioned.length == 0 ) repeat = false;
		else startSize *= increment;

	}

	return binPacker;

}

export { BinPack, minimalPacking };
