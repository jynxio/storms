import "/style/reset.css";

import "/style/index.css";

import * as three from "three";

/* ------------------------------------------------------------------------------------------------------ */
/* Renderer */
const renderer = new three.WebGLRenderer({ antialias: window.devicePixelRatio < 2 });

renderer.setPixelRatio( Math.min( window.devicePixelRatio ) );
renderer.setSize( window.innerWidth, window.innerHeight );

document.body.append( renderer.domElement );

/* Scene */
const scene = new three.Scene();

/* Camera */
const camera = new three.OrthographicCamera();

scene.add( camera );

/* Render */
renderer.setAnimationLoop( function loop() {

    renderer.render( scene, camera );

} );

/* ------------------------------------------------------------------------------------------------------ */
