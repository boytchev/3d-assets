﻿
//	3D Assets: Online generators core
//
//	secret keystrokes:
//		[d]+[t]	toggle debug texture
//		[d]+[g]	toggle wireframe


import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import * as lil from "three/addons/libs/lil-gui.module.min.js";
import * as ASSETS from "../src/assets-utils.js";



var Asset; // current asset class
var asset; // current asset instance
var params = {}; // current asset parameters
var model = new THREE.Group(); // current wrapper (of the asset)
var filename; // asset filename, e.g. 'round-table'
var classname; // asset class name, e.g. 'RoundTable'
var gui; // the top-level GUI



// setting up the scene

var renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( innerWidth, innerHeight );
renderer.setAnimationLoop( animationLoop );
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
document.body.appendChild( renderer.domElement );

var scene = new THREE.Scene();
scene.background = new THREE.Color( 'white' );
scene.add( model );

var camera = new THREE.PerspectiveCamera( 30, innerWidth/innerHeight, 0.01, 10 );
camera.position.set( 0, 0, 0.5 );
camera.lookAt( scene.position );

var light = new THREE.DirectionalLight( 'white', 2.5 );
light.decay = 0;
light.offset = new THREE.Vector3(0.05,0.05,0.05);
scene.add( light );

var ambientLight = new THREE.AmbientLight( 'white', 1 );
scene.add( ambientLight );

var controls = new OrbitControls( camera, renderer.domElement );
controls.enableDamping = true;



// manage window resizes

window.addEventListener( "resize", onResize );

function onResize( /*event*/ ) {

	camera.aspect = innerWidth/innerHeight;
	camera.updateProjectionMatrix( );
	renderer.setSize( innerWidth, innerHeight );

}

onResize( );



// install an asset - create its instance, build GUI panel

function install( AssetClass ) {

	Asset = AssetClass;
	
	// process URL options
	var urlAddress = window.location.search.split( '#' )[ 0 ], // skip all after #
		urlParameters = new URLSearchParams( urlAddress ),
		url = {};

	for ( var [ key, value ] of urlParameters.entries() ) {

		if ( value == 'true' )
			url[ key ] = true;
		else
			if ( value == 'false' )
				url[ key ] = false;
			else
				url[ key ] = parseFloat( value );

	}

	for ( const [ key, value ] of Object.entries( Asset.defaults ) )
		if ( key[ 0 ]!='$' ) {

			if ( value.isColor )
				params[ key ] = new THREE.Color( url[ key ] ?? value );
			else
				params[ key ] = url[ key ] ?? value;

		}


	var name = Asset.name;
	filename = name.split( ' ' ).join( '-' ).toLowerCase();

	classname = name.split( ' ' );
	for ( var i=0; i<classname.length; i++ ) {

		classname[ i ] = classname[ i ].toLowerCase();
		classname[ i ] = classname[ i ][ 0 ].toUpperCase() + classname[ i ].slice( 1 );

	}

	classname = classname.join( '' );

	var title = `<big><em>${Asset.name}</em> generator</big>
			<small class="fullline">
				<span id="url" class="link">LINK</span> &middot; 
				<span id="code" class="link">CODE</span> &middot;
				<span id="gltf" class="link">GLTF</span> &middot;
				<span id="random" class="link">RANDOM</span>`;


	title += `</small>`;

	gui = new lil.GUI( { title: title } );
	gui.$title.style.marginBottom = "2em";
	gui.onChange( regenerateAsset );

	window.addEventListener( 'keydown', onKeyDown );

	document.getElementById( 'info' )?.setAttribute( 'href', `../docs/${filename}.html` );
	document.getElementById( 'url' )?.addEventListener( 'click', exportAsURL );
	document.getElementById( 'code' )?.addEventListener( 'click', exportAsCode );
	document.getElementById( 'gltf' )?.addEventListener( 'click', exportAsGLTF );
	document.getElementById( 'random' )?.addEventListener( 'click', randomizeAsset );

	// everything is ready, generate the asset
	regenerateAsset( );

	return gui;

} // install



// converts the params object into an array
// this is used for exporting links and code

function paramsToArray( ) {

	var array = [];
	for ( const [ key, value ] of Object.entries( params ) )
		if ( value instanceof THREE.Color )
			array.push( `${key}=${value.getHex()}` );
		else
			if ( value == true || value == false )
				array.push( `${key}=${value}` );
			else
				array.push( `${key}=${ASSETS.round( value )}` );

	return array;

} // paramsToArray



// capture keystrokes pairs to see when to activate special modes
//
//		dt = debug textures - toggles a debug texture over the model

var lastKey = '';

function onKeyDown( event ) {

	switch ( lastKey + event.key ) {
		case 'dt': toggleDebugTexture(); break;
		case 'dg': toggleDebugGeometry(); break;
	}

	lastKey = event.key;

} // onKeyDown



// debug texture mode - used to see whether UV coordinates are good

var debugTexture;
var debugTextureMode = false;

function toggleDebugTexture( ) {

	// load debug texture if not loaded
	if ( !debugTexture ) {

		debugTexture = new THREE.TextureLoader().load( '../assets/textures/uv_grid_opengl.jpg' );

	}

	debugTextureMode = !debugTextureMode;

	if ( debugTextureMode ) {
		
		// apply debug texture
		model.traverse( child => {

			if ( child.material ) {

				child.material.map = debugTexture;
				child.material.needsUpdate = true;

			}

		} );

	} else {

		// remove debug texture
		model.traverse( child => {

			if ( child.material?.map == debugTexture ) {

				child.material.map = null;
				child.material.needsUpdate = true;

			}

		} );

	} // if else debugTextureMode

} // toggleDebugTexture



// debug geometry mode - used to see whether the geometry is good

var debugGeometryMode = false;

function toggleDebugGeometry( ) {

	debugGeometryMode = !debugGeometryMode;

	// apply debug geometry
	model.traverse( child => {

		if ( child.material ) {

			child.material.color.set( debugGeometryMode ? 'gray' : 'white' );
			child.material.wireframe = debugGeometryMode;

		}

	} );

} // toggleDebugTexture



// export a link to the online generator with the current parameters

function exportAsURL( event ) {

	event.stopPropagation();

	var url = paramsToArray().join( '&' );
	url = window.location.href.split( '?' )[ 0 ].split( '#' )[ 0 ] + '?' + url;

	navigator.clipboard.writeText( url );

	alert( `URL for this ${Asset.name} is copied to the clipboard.` );

} // exportAtURL



// export the asset as a JS fragment with importmap, imports
// and asset creation with the current parameters

function exportAsCode( event ) {

	event.stopPropagation();

	var paramsStr = paramsToArray().join( `,\n	` );

	var js = `
<script type="importmap">
	{
		"imports": {
			"three": "https://cdn.jsdelivr.net/npm/three@latest/build/three.module.js",
			"three/nodes": "https://cdn.jsdelivr.net/npm/three@latest/examples/jsm/nodes/Nodes.js",
			"https://cdn.jsdelivr.net/npm/3d-assets@latest/src/"
		}
	}
</script>

import { ${classname} } from "3d-assets/${filename}.js";

var model = new ${classname} ({
	${paramsStr}
});

scene.add( model );
`;

	navigator.clipboard.writeText( js );

	alert( `Javascript code fragment for this ${asset.$name} is copied to the clipboard.` );

} // exportAsCode



// export the asset as a GLB model

var exporter = new GLTFExporter();
var exporterLink = document.createElement( 'a' );

function exportAsGLTF( event ) {

	event.stopPropagation();

	// get timestamp HHMMSS
	var now = new Date(),
		hh = ( now.getHours()+'' ).padStart( 2, '0' ),
		mm = ( now.getMinutes()+'' ).padStart( 2, '0' ),
		ss = ( now.getSeconds()+'' ).padStart( 2, '0' );

	// currently always export as GLB
	const binary = true; 

	// do he export
	exporter.parse(
		model.children[ 0 ],
		( gltf ) => {

			var type = binary ? 'application/octet-stream' : 'text/plain;charset=utf-8',
				data = binary ? gltf : JSON.stringify( gltf ),
				blob = new Blob([ data ], { type: type } );

			exporterLink.href = URL.createObjectURL( blob );
			exporterLink.download = `${filename}-${hh}${mm}${ss}.glb`;
			exporterLink.click();

		},
		( error ) => {

			throw error;

		},
		{ binary: binary }
	);

} // exportAsGLTF



// recreate the model with the current parameters

function regenerateAsset( ) {

	model.clear( );
	asset?.dispose( );

	asset = new Asset( params );
	model.add( asset );
	
	if( debugTextureMode ) { toggleDebugTexture( ); toggleDebugTexture( ); }
	if( debugGeometryMode ) { toggleDebugGeometry( ); toggleDebugGeometry( ); }
	
	updateModelStatistics();

} // regenerateAsset



// recreate the model with random parameters

function randomizeAsset( event ) {

	event.stopPropagation();
	
	// copy random values keeping the same object reference
	Object.assign( params, Asset.random() );

	regenerateAsset();

	// update the GUI because the parameters have changed
	for ( var c of gui.controllersRecursive() )
		c.updateDisplay();

} // randomizeAsset



// show the number of triangles in the model

function updateModelStatistics( ) {

	var stats = document.getElementById( 'model-statistics' );
	
	if( stats )
	{	
		// cannot use renderer.info.render.triangles, because in
		// debug geometry mode it gives 0 triangles (wireframe)
		
		var vertices = 0,
			triangles = 0;

		model.traverse( ( child )=>{

			var geo = child.geometry;
			if ( !geo ) return;

			var pos = geo.getAttribute( 'position' );
			var idx = geo.index;

			vertices += pos.count;
			triangles += idx ? idx.count/3 : pos.count/3;

		} );
		
		stats.innerHTML = `<em>${vertices}</em> V <em>${triangles}</em> T`;
	}
} // updateModelStatistics



// main animation loop

function animationLoop( /*t*/ ) {

	controls.update( );
	light.position.addVectors( camera.position, light.offset );
	renderer.render( scene, camera );

} // animationLoop



export { scene, model, install, params, light, ambientLight, updateModelStatistics };
