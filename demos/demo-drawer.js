
import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SimplexNoise } from "three/addons/math/SimplexNoise.js";

// 3D assets
import { Drawer } from "3d-assets/drawer.js";
import { Wardrobe } from "3d-assets/wardrobe.js";
import { RoundBox } from "3d-assets/round-box.js";

// TSL textures
import { processedWood } from "tsl-textures/processed-wood.js";
import { caveArt } from "tsl-textures/cave-art.js";



// general setup, nothing interesting here

var scene = new THREE.Scene();
scene.background = new THREE.Color( 0x3030310 );

var camera = new THREE.PerspectiveCamera( 30, innerWidth / innerHeight );
camera.position.set( 1, 1, 4 );

var renderer = new THREE.WebGPURenderer( { antialias: true } );
renderer.setSize( innerWidth, innerHeight );
renderer.setAnimationLoop( animationLoop );
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;
document.body.appendChild( renderer.domElement );

scene.add( new THREE.AmbientLight( "white", 0.05 ) );

var light = new THREE.SpotLight( 'white', 2, 0, 0.4, 1, 0.1 );
light.position.set( 1/2, 2, 2 );
light.castShadow = true;
light.shadow.intensity = 5;
light.shadow.bias = -0.003;
light.shadow.normalBias = 0.005;
light.shadow.blurSamples = 10;
light.shadow.radius = 1;

light.shadow.mapSize.width = 1024;
light.shadow.mapSize.height = 1024;
light.shadow.camera.near = 2;
light.shadow.camera.far = 4;
scene.add( light );

var simplex = new SimplexNoise( );



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



// define materials
{

	var lightWood = [];
	for ( var i=1; i<=4; i++ )
		lightWood[ i ] = new THREE.MeshLambertNodeMaterial( {
			shadowSide: THREE.DoubleSide,
			colorNode: processedWood( {
				scale: 3,
				length: 7,
				angle: 90,
				seed: i,
			} )
		} );

	var darkWood = new THREE.MeshLambertNodeMaterial( {
		colorNode: processedWood( {
			angle: 90,
			strength: 0.4,
			color: new THREE.Color( 'black' ),
			background: new THREE.Color( 'peru' ),
		} )
	} );

	var metalMaterial = new THREE.MeshPhysicalMaterial( {
		color: 'lightgray',
		roughness: 0.1,
		metalness: 0.9,
	} );

	var floorMaterial = new THREE.MeshPhysicalNodeMaterial( {
		roughness: 0.6,
		metalness: 0.2,
		colorNode: caveArt( {
			scale: 4,
			color: new THREE.Color( 'gray' ),
			thinness: 3
		} )
	} );

}



// create assets without any textures
// this is used to show them on the screen
// because TSL textures need some time

{	// drawer

	var drawer = new Drawer( { ...Drawer.defaults, handleThickness: 1 } );

	drawer.getObjectByName( 'body' ).material = darkWood;

	for ( var i=1; i<=4; i++ ) {

		drawer.getObjectByName( `handle_${i}` ).material = metalMaterial;
		drawer.getObjectByName( `drawer_${i}` ).material = lightWood[ i ];
		drawer[ i ] = drawer.getObjectByName( `Drawer_${i}` );

	}

	drawer.traverse( e=>{

		if ( e.isMesh ) {

			e.castShadow = true;
			e.receiveShadow = true;

		}

	} );

	drawer.position.set( -0.43, -0.515, -0.2 );

}



{ // wardrobe

	var wardrobe = new Wardrobe( { ...Wardrobe.defaults, handleThickness: 1 } );

	wardrobe.getObjectByName( 'body' ).material = darkWood;

	for ( var i=1; i<=2; i++ ) {

		wardrobe.getObjectByName( `handle_${i}` ).material = metalMaterial;
		wardrobe.getObjectByName( `door_${i}` ).material = lightWood[ i ];
		wardrobe[ i ] = wardrobe.getObjectByName( `Door_${i}` );

	}

	wardrobe.traverse( e=>{

		if ( e.isMesh ) {

			e.castShadow = true;
			e.receiveShadow = true;

		}

	} );

	wardrobe.position.set( 0.22, -0.515, -0.2 );

}



{ // floor

	var floor = new RoundBox( {
		...RoundBox.defaults,
		x: 2.5,
		y: 0.05,
		z: 1.5,
		r4: false,
		roundness: 0.41,
	} );


	floor.traverse( e=>{

		if ( e.isMesh ) {

			e.receiveShadow = true;
			e.material = floorMaterial;

		}

	} );

	floor.position.y = -0.54;

}



scene.add( drawer, wardrobe, floor );



//

function animationLoop( t ) {

	controls.update( );

	// pull and push drawers
	for ( var i=1; i<=4; i++ ) {

		drawer[ i ].position.z = ( 2-0.4*i )*Math.max( 0, 0.3*simplex.noise( i, t/2000 )-0.1 );

	}

	// open and close wardrobe
	for ( var i=1; i<=2; i++ ) {

		wardrobe[ i ].rotation.y = ( i-1.5 )*Math.max( 0, 3*simplex.noise( -i, t/4000 )+0.5 );

	}

	renderer.render( scene, camera );

}

