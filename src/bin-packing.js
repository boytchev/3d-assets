
import { Vector2 } from 'three';


//______________________________________________________________________________
// Rect class
function Rect( x, y, width, height ) {

	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;

}

Rect.prototype.contains = function ( r ) {

	// Does this rectangle contain the specified rectangle?
	return this.x <= r.x &&
				 this.y <= r.y &&
				 this.x + this.width >= r.x + r.width &&
				 this.y + this.height >= r.y + r.height;

};

Rect.prototype.disjointFrom = function ( r ) {

	// Is this rectangle disjoint from the specified rectangle?
	return this.x + this.width <= r.x ||
				 this.y + this.height <= r.y ||
				 r.x + r.width <= this.x ||
				 r.y + r.height <= this.y;

};

Rect.prototype.intersects = function ( r ) {

	// Does this rectangle intersect the specified rectangle?
	return !this.disjointFrom( r );

};

Rect.prototype.copy = function () {

	// Create a copy of this rectangle.
	return new Rect( this.x, this.y, this.width, this.height );

};

//______________________________________________________________________________
// BinPacker class

// Uses MAXRECTS-BSSF-BNF bin packer algorithm from
// https://github.com/juj/RectangleBinPack
//
// MAXRECTS-BSSF-BNF stands for "Maximal Rectangles - Best Short Side Fit". It
// positions the rectangle against the short side of the free rectangle into
// which it fits most snugly.

function BinPacker( width, height ) {

	this.width = width;
	this.height = height;

	// TODO: Allow for flexible width or height. If a rectangle doesn't fit into
	//       the bin extend the width or height to accommodate it.

	// Array of rectangles representing the free space in the bin
	this.freeRectangles = [ new Rect( 0, 0, width, height ) ];

	// Array of rectangles positioned in the bin
	this.positionedRectangles = [];

	// Array of rectangles that couldn't fit in the bin
	this.unpositionedRectangles = [];

}

BinPacker.prototype.insert = function ( width, height ) {

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
	var r = BinPacker.findPosition( width, height, this.freeRectangles );

	// Unpositioned rectangle (it has no x-property if it's unpositioned)
	if ( r.x == undefined ) {

		this.unpositionedRectangles.push( r );
		return { positioned: false, rectangle: r };

	}

	// Split the free rectangles based on where the new rectangle is positioned
	var n = this.freeRectangles.length;
	for ( var i = 0; i < n; i++ ) {

		let new_rectangles;
		// splitRectangle() returns an array of sub-rectangles if the rectangle
		// was split (which is truthy) and false otherwise
		if ( new_rectangles = BinPacker.splitRectangle( this.freeRectangles[ i ], r ) ) {

			// remove the free rectangle that was split
			this.freeRectangles.splice( i, 1 );

			// append new free rectangles formed by the split															// split
			this.freeRectangles = this.freeRectangles.concat( new_rectangles );

			--i; --n;

		}

	}

	BinPacker.pruneRectangles( this.freeRectangles );

	this.positionedRectangles.push( r );

	return { positioned: true, rectangle: r };

};

BinPacker.findPosition = function ( width, height, F ) {

	// Decide where to position a rectangle (with side lengths specified by width
	// and height) within the bin. The bin's free space is defined in the array
	// of free rectangles, F.

	var bestRectangle = new Rect( undefined, undefined, width, height );

	var bestShortSideFit = Number.MAX_VALUE,
		bestLongSideFit = Number.MAX_VALUE;

	// Find the free rectangle into which this rectangle fits inside most snugly
	// (i.e., the one with the smallest amount of space leftover after positioning
	// the rectangle inside of it)
	for ( var i = 0; i < F.length; i++ ) {

		var f = F[ i ]; // the current free rectangle

		// Does the rectangle we are positioning fit inside the free rectangle?
		if ( f.width >= width && f.height >= height ) {

			var leftoverHorizontal = Math.abs( f.width - width ),
				leftoverVertical = Math.abs( f.height - height );

			var shortSideFit = Math.min( leftoverHorizontal, leftoverVertical ),
				longSideFit = Math.max( leftoverHorizontal, leftoverVertical );

			// Does this free rectangle have the smallest amount of space leftover
			// after positioning?
			if ( shortSideFit < bestShortSideFit ||
					( shortSideFit == bestShortSideFit && longSideFit < bestLongSideFit ) ) {

				// Position rectangle in the bottom-left corner of the free rectangle
				// (or top-left if the y-axis is inverted like in browsers)
				bestRectangle.x = f.x;
				bestRectangle.y = f.y;

				bestShortSideFit = shortSideFit;
				bestLongSideFit = longSideFit;

			}

		}

	}

	return bestRectangle;

};

BinPacker.splitRectangle = function ( f, r ) {

	// Splits the rectangle f into at most four sub-rectangles that are formed by
	// taking the geometric difference of f from r and identifying the largest
	// rectangles that can be formed from the resulting polygon. Returns these
	// sub-rectangles if the f was split and false otherwise.

	// If they are disjoint then no splitting can be done, return false
	if ( r.disjointFrom( f ) ) return false;

	var new_rectangles = [];

	// Does f contain r in terms of the x-axis?
	if ( r.x < f.x + f.width && f.x < r.x + r.width ) {

		// QUESTION: Does this make an assumption about how r is positioned relative
		//           to f? Couldn't it be that part of r could be outside of f in
		//           this first if-statement? It looks like this assumes r will be
		//           placed along one of the edges (which, in fact, is what this
		//           algorithm does).

		// TODO: Look into all of this in more depth. I don't fully understand why
		//       these conditionals are the way they are.

		// New rectangle is above r
		if ( f.y < r.y && r.y < f.y + f.height ) {

			var new_rectangle = f.copy();
			new_rectangle.height = r.y - new_rectangle.y;
			new_rectangles.push( new_rectangle );

		}

		// New rectangle is below r
		if ( r.y + r.height < f.y + f.height ) {

			var new_rectangle = f.copy();
			new_rectangle.y = r.y + r.height;
			new_rectangle.height = f.y + f.height - ( r.y + r.height );
			new_rectangles.push( new_rectangle );

		}

	}

	// Does f contain r in terms of the y-axis?
	if ( r.y < f.y + f.height && f.y < r.y + r.height ) {

		// New rectangle is to the left of r
		if ( f.x < r.x && r.x < f.x + f.width ) {

			var new_rectangle = f.copy();
			new_rectangle.width = r.x - new_rectangle.x;
			new_rectangles.push( new_rectangle );

		}

		// New rectangle is to the right of r
		if ( r.x + r.width < f.x + f.width ) {

			var new_rectangle = f.copy();
			new_rectangle.x = r.x + r.width;
			new_rectangle.width = f.x + f.width - ( r.x + r.width );
			new_rectangles.push( new_rectangle );

		}

	}

	return new_rectangles;

};

BinPacker.pruneRectangles = function ( F ) {

	// Go through the array of rectangles, F, and remove any that are
	// completely contained within another rectangle in F

	for ( var i = 0; i < F.length; i++ ) {

		for ( var j = i + 1; j < F.length; j++ ) {

			if ( F[ j ].contains( F[ i ]) ) {

				F.splice( i, 1 );
				--i;
				break;

			}

			if ( F[ i ].contains( F[ j ]) ) {

				F.splice( j, 1 );
				--j;

			}

		}

	}

};

function BinPack() {

	var binWidth = 800,
		binHeight = 800;

	var rectWidth = function ( d ) {

			return d.width;

		},
		rectHeight = function ( d ) {

			return d.height;

		};

	var sort = false;

	var binPacker = new BinPacker( binWidth, binHeight );

	var pack = {};

	pack.add = function ( d ) {

		var o = binPacker.insert( rectWidth( d ), rectHeight( d ) );
		o.rectangle.datum = d;
		return pack;

	};

	pack.addAll = function ( array ) {

		if ( sort ) array.sort( sort );
		array.forEach( function ( d, i ) {

			var o = binPacker.insert( rectWidth( d ), rectHeight( d ) );
			o.rectangle.datum = d;

		} );
		return pack;

	};

	pack.binWidth = function ( _ ) {

		if ( !arguments.length ) return binWidth;
		binWidth = _;
		binPacker = new BinPacker( binWidth, binHeight );
		return pack;

	};

	pack.binHeight = function ( _ ) {

		if ( !arguments.length ) return binHeight;
		binHeight = _;
		binPacker = new BinPacker( binWidth, binHeight );
		return pack;

	};

	pack.rectWidth = function ( _ ) {

		return arguments.length ? ( rectWidth = _, pack ) : rectWidth;

	};

	pack.rectHeight = function ( _ ) {

		return arguments.length ? ( rectHeight = _, pack ) : rectHeight;

	};

	pack.sort = function ( _ ) {

		return arguments.length ? ( sort = _, pack ) : sort;

	};

	Object.defineProperty( pack, "positioned", {
		get: function () {

			return binPacker.positionedRectangles;

		}
	} );

	Object.defineProperty( pack, "unpositioned", {
		get: function () {

			return binPacker.unpositionedRectangles;

		}
	} );

	return pack;

}

export { BinPack };
