
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import * as lil from "three/addons/libs/lil-gui.module.min.js";
//import WebGPURenderer from 'three/addons/renderers/webgpu/WebGPURenderer.js';



var params = {};



// setting up the scene

//var renderer = new WebGPURenderer( { antialias: true } );
var renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( innerWidth, innerHeight );
renderer.setAnimationLoop( animationLoop );
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
document.body.appendChild( renderer.domElement );

var scene = new THREE.Scene();
scene.background = new THREE.Color( 'white' );

var camera = new THREE.PerspectiveCamera( 30, innerWidth/innerHeight, 0.01, 10 );
camera.position.set( 0, 0, 0.5 );
camera.lookAt( scene.position );

var light = new THREE.DirectionalLight( 'white', 2.5 );
light.decay = 0;
scene.add( light );

var ambientLight = new THREE.AmbientLight( 'white', 1 );
scene.add( ambientLight );

var controls = new OrbitControls( camera, renderer.domElement );
controls.enableDamping = true;

// group that should hold the current model
var model = new THREE.Group();
scene.add( model );



// manage window resizes

window.addEventListener( "resize", onResize );

function onResize( /*event*/ ) {

	camera.aspect = innerWidth/innerHeight;

	camera.updateProjectionMatrix( );

	renderer.setSize( innerWidth, innerHeight );

}

onResize( );







function animationLoop( /*t*/ ) {

	controls.update( );
	light.position.copy( camera.position );
	light.position.x += 0.05;
	light.position.y += 0.05;
	light.position.z += 0.05;
	renderer.render( scene, camera );

}



function install( Asset ) {

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
	var filename = name.split( ' ' ).join( '-' ).toLowerCase();

	var funcname = name.split( ' ' );
	for ( var i=0; i<funcname.length; i++ ) {

		funcname[ i ] = funcname[ i ].toLowerCase();
		if ( i > 0 ) funcname[ i ] = funcname[ i ][ 0 ].toUpperCase() + funcname[ i ].slice( 1 );

	}

	funcname = funcname.join( '' );

	var title = `<big><em>${Asset.name}</em> generator</big>
			<small class="fullline">
				<span id="url" class="link">LINK</span> &middot; 
				<span id="code" class="link">CODE</span> &middot;
				<span id="gltf" class="link">GLTF</span> &middot;
				<span id="random" class="link">RANDOM</span>`;


	title += `</small>`;

	var gui = new lil.GUI( { title: title } );
	gui.$title.style.marginBottom = "2em";
	gui.onChange( regenerateAsset );

	//	document.getElementById( 'home' ).addEventListener( 'click', ( event )=>{
	//
	//		event.stopPropagation();
	//		goHome();
	//
	//	} );

	document.getElementById( 'info' )?.setAttribute( 'href', `../docs/${filename}.html` );

	document.getElementById( 'url' )?.addEventListener( 'click', ( event )=>{

		event.stopPropagation();
		//window.alert( "Export of a link is not implemented" );
		shareURL( event, name );

	} );

	document.getElementById( 'code' )?.addEventListener( 'click', ( event )=>{

		event.stopPropagation();
		window.alert( "Export of a code is not implemented" );
		//getCode( event, funcname, filename, tslTexture );

	} );

	document.getElementById( 'gltf' )?.addEventListener( 'click', ( event )=>{

		event.stopPropagation();
		window.alert( "Export of a GLTF is not implemented" );

	} );

	document.getElementById( 'random' )?.addEventListener( 'click', ( event )=>{

		event.stopPropagation();
		randomizeAsset();

	}	);

	onResize( );

	/*
	processParameters( ); // causes recalculation of dynamics

*/

	var object = new Asset( params );
	model.add( object );

	return gui;

	function regenerateAsset( ) {

		model.clear( );
		object.dispose( );
		object = new Asset( params );
		model.add( object );

	}

	function randomizeAsset( ) {

		model.clear( );
		object.dispose( );

		// copy random value keeping the same object reference
		Object.assign( params, Asset.random() );

		object = new Asset( params );
		model.add( object );

		for ( var c of gui.controllersRecursive() )
			c.updateDisplay();

	}

}





function shareURL( event, name ) {

	event.stopPropagation();

	var url = [];

	for ( const [ key, value ] of Object.entries( params ) )
		if ( value instanceof THREE.Color )
			url.push( `${key}=${value.getHex()}` );
		else
			url.push( `${key}=${value}` );

	url = url.join( '&' );

	url = window.location.href.split( '?' )[ 0 ].split( '#' )[ 0 ] + '?' + url;

	navigator.clipboard.writeText( url );

	alert( `URL for this ${name} copied to the clipboard.` );

}


/*
function getCode( event, name, filename, tslTexture ) {

	event.stopPropagation();

	var paramsStr = [];

	for ( const [ key, value ] of Object.entries( params ) )
		if ( value instanceof THREE.Color )
			paramsStr.push( `${key}: new THREE.Color(${value.getHex()})` );
		else
			paramsStr.push( `${key}: ${value}` );

	paramsStr = paramsStr.join( `,\n	` );

	var js = `
<script type="importmap">
	{
		"imports": {
			"three": "https://cdn.jsdelivr.net/npm/three@0.164.0/build/three.module.js",
			"three/nodes": "https://cdn.jsdelivr.net/npm/three@0.164.0/examples/jsm/nodes/Nodes.js",
			"tsl-textures/": "../src/"
		}
	}
</script>

import { ${name} } from "tsl-textures/${filename}.js";
`;
	if ( tslTexture.defaults.$normalNode )
		js += `
model.material.normalNode = ${name} ( {
	${paramsStr}
} );
`;
	else
		js += `model.material.colorNode = ${name} ( {
	${paramsStr}
} );
`;

	if ( tslTexture.opacity ) {

		js += `
model.material.transparent = true;
model.material.opacity = 1;
model.material.side = THREE.DoubleSide;
model.material.opacityNode = ${name}.opacity ( {
	${paramsStr}
} );
`;

	}


	navigator.clipboard.writeText( js );

	alert( `Javascript code fragment for this ${name} copied to the clipboard.` );

}
*/

//function goHome( /*event*/ ) {
//
//	window.location.assign( HOME_URL );
//
//}


//function goToWebPage( filename ) {
//
//	window.location.assign( `../docs/${filename}.html` );
//
//}


export { scene, model, install, params, light, ambientLight };
