import * as THREE from "three";
import { uniform } from "three/tsl";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// 3D assets
import { Drawer } from "3d-assets/drawer.js";
import { Wardrobe } from "3d-assets/wardrobe.js";

// TSL textures
import { processedWood } from "tsl-textures/processed-wood.js";



// general setup, nothing interesting here

var scene = new THREE.Scene();
scene.background = new THREE.Color( 0x303030 );

var camera = new THREE.PerspectiveCamera( 30, innerWidth / innerHeight );
camera.position.set( 1, 1.5, 3 );

var renderer = new THREE.WebGPURenderer( { antialias: true } );
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



// create TSL textures

function brightWood( ) {
	
	return new THREE.MeshLambertNodeMaterial({
		colorNode: processedWood({
			scale: 3,
			length: 7,
			angle: 91,
			seed: 10*Math.random(),
		})
	})
}
			
var darkWood = new THREE.MeshLambertNodeMaterial({
	colorNode: processedWood( {
		angle: 90,
		strength:0.4,
		color: new THREE.Color('black'),
		background: new THREE.Color('peru'),
	} )
});

var darkMetal = new THREE.MeshPhysicalMaterial({
		color: 'lightgray',
		roughness: 0.1,
		metalness: 0.9,
});



// create assets

var drawer = new Drawer( {
	...Drawer.defaults,
	handleThickness: 1,
} );

drawer.getObjectByName( 'body' ).material = darkWood;

for( var i=1; i<=4; i++ ) {
	drawer.getObjectByName(`drawer_${i}`).material = brightWood();
	drawer.getObjectByName(`handle_${i}`).material = darkMetal;
	drawer.getObjectByName(`Drawer_${i}`).position.z = 0.25-0.05*i;
}

scene.add( drawer );

var wardrobe =  new Wardrobe( {
	...Wardrobe.defaults,
	doorAngle: 75,
} );

wardrobe.getObjectByName( 'body' ).material = darkWood;

for( var i=1; i<=2; i++ ) {
	wardrobe.getObjectByName(`door_${i}`).material = brightWood();
	wardrobe.getObjectByName(`handle_${i}`).material = darkMetal;
	wardrobe.getObjectByName(`Door_${i}`).position.z = 0.25-0.05*i;
}

wardrobe.position.set( 0.8, -0.315, 0 );

scene.add( wardrobe );



function animationLoop( t ) {

	controls.update( );

	light.position.copy( camera.position );
	light.position.y += 0.1;

	renderer.render( scene, camera );

}

renderer.setAnimationLoop( animationLoop );
