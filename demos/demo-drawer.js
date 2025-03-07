import * as THREE from "three";
import { uniform } from "three/tsl";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// 3D assets
import { Drawer } from "3d-assets/drawer.js";

// TSL textures
import { processedWood } from "tsl-textures/processed-wood.js";



// general setup, nothing interesting here

var scene = new THREE.Scene();
scene.background = new THREE.Color( 0x303030 );

var camera = new THREE.PerspectiveCamera( 30, innerWidth / innerHeight );
camera.position.set( 1, 2, 4 );

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

var drawerTextureOptions = {
		scale: 3,
		length: 7,
		angle: 91,
	}
	
var woodMaterial = new THREE.MeshLambertNodeMaterial({
	colorNode: processedWood( {scale:2, length:1, angle:90, color:new THREE.Color(0x6a4838), background:new THREE.Color(0x0)} )
});

var woodMaterial2 = new THREE.MeshLambertNodeMaterial({
		colorNode: processedWood( {
			angle:90,
			strength:0.4,
		color: new THREE.Color('black'),
		background: new THREE.Color('peru'),
		
		} )
});

var handleMaterial = new THREE.MeshPhysicalMaterial({
		color: 'gray',
		roughness: 0.1,
		metalness: 0.9,
});



// create assets
var drawer = new Drawer( {...Drawer.defaults, 		handleThickness: 1,
} );
	drawer.traverse( child=>{
		if( child.name.indexOf('handle')==0 )
			child.material = handleMaterial;
		else
		if( child.name.indexOf('body')==0 )
			child.material = woodMaterial2;
		else
		if( child.name.indexOf('drawer')==0 )
			child.material = new THREE.MeshLambertNodeMaterial({
										colorNode: processedWood( {
														...drawerTextureOptions,
														seed: Math.random()*10
													} ) // color node
								}); // material
	} ); // traverse
	
console.log(drawer)
scene.add( drawer );



function animationLoop( t ) {

	controls.update( );

	light.position.copy( camera.position );
	light.position.y += 0.1;

	renderer.render( scene, camera );

}

renderer.setAnimationLoop( animationLoop );
