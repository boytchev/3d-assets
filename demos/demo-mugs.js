import * as THREE from "three";
import * as NODES from "three/nodes";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import WebGPURenderer from "three/addons/renderers/webgpu/WebGPURenderer.js";
import * as lil from "three/addons/libs/lil-gui.module.min.js";

// 3D assets
import { Mug } from "3d-assets/mug.js";
import { Plate } from "3d-assets/plate.js";

// TSL textures
import { marble } from "tsl-textures/marble.js";
import { circles } from "tsl-textures/circles.js";
import { camouflage } from "tsl-textures/camouflage.js";
import { entangled } from "tsl-textures/entangled.js";



// general setup, nothing interesting here

var scene = new THREE.Scene();
scene.background = new THREE.Color( 0x303030 );

var camera = new THREE.PerspectiveCamera( 30, innerWidth / innerHeight );
camera.position.set( 1, 2, 4 );

var renderer = new WebGPURenderer( { antialias: true } );
renderer.setSize( innerWidth, innerHeight );
document.body.appendChild( renderer.domElement );

var light = new THREE.DirectionalLight( "white", 2 );
light.position.set( 1, 1, 1 );
scene.add( light );



// manage screen resizes

window.addEventListener( "resize", ( /*event*/ ) => {

	camera.aspect = innerWidth / innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( innerWidth, innerHeight );

} );



// manage user rotation

var controls = new OrbitControls( camera, renderer.domElement );
controls.maxDistance = 30;
controls.minDistance = 1;
controls.enableDamping = true;



// prepare TSL textures parameters

var marbleParams = {
	...marble.defaults,
	scale: 3,
	color: new THREE.Color( 'navy' ),
	seed: NODES.uniform( 0 )
};

var camouflageParams = {
	...camouflage.defaults,
	scale: 4,
	color: new THREE.Color( 'tomato' ),
	seed: NODES.uniform( 0 )
};

var circlesParams = {
	...circles.defaults,
	scale: 2,
	color: new THREE.Color( 'lightsalmon' ),
	variety: 0.15,
	seed: NODES.uniform( 0 )
};

var entangledParams = {
	...entangled.defaults,
	scale: 5,
	density: 15,
	color: new THREE.Color( 'white' ),
	background: new THREE.Color( 'black' ),
	seed: NODES.uniform( 0 )
};



// create TSL textures

var marbleTexture = marble( marbleParams ),
	camouflageTexture = camouflage( camouflageParams ),
	circlesTexture = circles( circlesParams ),
	entangledTexture = entangled( entangledParams );



// create assets - two mugs and two plates

var mug1 = new Mug( Mug.defaults );
mug1.position.set( 0, -0.3, 0.4 );
mug1.scale.setScalar( 5 );

var mug2 = new Mug( Mug.defaults );
mug2.position.set( 0, -0.3, -0.4 );
mug2.scale.setScalar( 5 );
mug2.rotation.y = Math.PI;

var plate1 = new Plate( Plate.defaults );
plate1.position.set( 0.8, -0.3, 0 );
plate1.scale.setScalar( 5 );

var plate2 = new Plate( Plate.defaults );
plate2.position.set( -0.8, -0.3, 0 );
plate2.scale.setScalar( 5 );

scene.add( mug1, mug2, plate1, plate2 );



// GUI controls

var guiParams = { textures: false, lowpoly: false };

var gui = new lil.GUI( );
gui.onChange( regenerateAssets );
gui.add( guiParams, 'textures' ).name( 'Textures' );
gui.add( guiParams, 'lowpoly' ).name( 'Lowpoly' );



// random timers to regenerate assets

function randomDuration() {

	return 2000*Math.random()+1000;

}

var timerMug1 = randomDuration();
var timerMug2 = randomDuration();
var timerPlate1 = randomDuration();
var timerPlate2 = randomDuration();



// regenerate all assets when use user toggles
// the texture of low-poly options in the GUI

function regenerateAssets() {

	randomizeMug1( 1e6 );
	randomizeMug2( 1e6 );
	randomizePlate1( 1e6 );
	randomizePlate2( 1e6 );

}



// generate a new random mug 1 when the timer fires

function randomizeMug1( dT ) {

	timerMug1 -= dT;
	if ( timerMug1 > 0 ) return;
	timerMug1 = randomDuration();

	var params = Mug.random();
	params.mugComplexity = guiParams.lowpoly?0:70;
	params.handleComplexity = guiParams.lowpoly?0:70;
	params.edges = !guiParams.lowpoly;

	marbleParams.seed.value = 1000*Math.random();

	mug1.generate( params );
	mug1.position.set( 0, -0.3, 0.4 );
	mug1.body.material = new NODES.MeshStandardNodeMaterial( {
		roughness: 0.2,
		metalness: 0,
		colorNode: guiParams.textures?marbleTexture:null,
		flatShading: guiParams.lowpoly,
	} );

	mug1.handle.material = mug1.body.material;

}



// generate a new random mug 2 when the timer fires

function randomizeMug2( dT ) {

	timerMug2 -= dT;
	if ( timerMug2 > 0 ) return;
	timerMug2 = randomDuration();

	var params = Mug.random();
	params.mugComplexity = guiParams.lowpoly?0:70;
	params.handleComplexity = guiParams.lowpoly?0:70;
	params.edges = !guiParams.lowpoly;

	camouflageParams.seed.value = 1000*Math.random();

	mug2.generate( params );
	mug2.position.set( 0, -0.3, -0.4 );
	mug2.body.material = new NODES.MeshStandardNodeMaterial( {
		roughness: 0.5,
		metalness: 0.4,
		colorNode: guiParams.textures?camouflageTexture:null,
		flatShading: guiParams.lowpoly,
	} );

	mug2.handle.material = mug2.body.material;

}



// generate a new random plate 1 when the timer fires

function randomizePlate1( dT ) {

	timerPlate1 -= dT;
	if ( timerPlate1 > 0 ) return;
	timerPlate1 = randomDuration();

	var params = Plate.random();
	params.plateSize = Math.min( 20, params.plateSize );
	params.plateHeight = Math.max( 1, params.plateHeight );
	params.plateComplexity = guiParams.lowpoly?15:70;
	params.edges = !guiParams.lowpoly;

	circlesParams.seed.value = 1000*Math.random();

	plate1.generate( params );
	plate1.position.set( 0.8, -0.3, 0 );
	plate1.body.material = new NODES.MeshStandardNodeMaterial( {
		roughness: 0.5,
		metalness: 0.4,
		colorNode: guiParams.textures?circlesTexture:null,
		flatShading: guiParams.lowpoly,
	} );

}



// generate a new random plate 1 when the timer fires

function randomizePlate2( dT ) {

	timerPlate2 -= dT;
	if ( timerPlate2 > 0 ) return;
	timerPlate2 = randomDuration();

	var params = Plate.random();
	params.plateSize = Math.min( 20, params.plateSize );
	params.plateHeight = Math.max( 2, params.plateHeight );
	params.plateComplexity = guiParams.lowpoly?15:70;
	params.edges = !guiParams.lowpoly;

	plate2.generate( params );
	plate2.position.set( -0.8, -0.3, 0 );
	plate2.body.material = new NODES.MeshStandardNodeMaterial( {
		roughness: 0.5,
		metalness: 0.4,
		colorNode: guiParams.textures?entangledTexture:null,
		opacityNode: guiParams.textures?entangledTexture:null,
		transparent: true,
		side: THREE.DoubleSide,
		flatShading: guiParams.lowpoly,
	} );

}


var oldT = 0;

function animationLoop( t ) {

	var dT = t-oldT;
	oldT = t;

	randomizeMug1( dT );
	randomizeMug2( dT );
	randomizePlate1( dT );
	randomizePlate2( dT );

	// constantly animating the net plate
	entangledParams.seed.value = Math.sin( t/100000 );

	controls.update( );

	light.position.copy( camera.position );
	light.position.y += 0.1;

	renderer.render( scene, camera );

}

renderer.setAnimationLoop( animationLoop );
