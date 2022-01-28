import "/style/reset.css";

import "/style/index.css";

import * as three from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { triangulate } from "./library/earcut";

/* ------------------------------------------------------------------------------------------------------ */
/* Renderer */
const renderer = new three.WebGLRenderer( { antialias: window.devicePixelRatio < 2 } );

renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );

document.body.append( renderer.domElement );

/* Scene */
const scene = new three.Scene();

/* Camera */
const camera = new three.OrthographicCamera(
    - 50,
    + 50,
    + 50 * window.innerHeight / window.innerWidth,
    - 50 * window.innerHeight / window.innerWidth,
    0.01,
    10000
);

scene.add( camera );

/* Controls */
// const controls = new OrbitControls( camera, renderer.domElement );

// controls.enableDamping = true;
// controls.target = new three.Vector3( 0, 0, 0.01 );

/* Resize */
window.addEventListener( "resize", _ => {

    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

} );

/* ------------------------------------------------------------------------------------------------------ */
/* GeoJSON */
main();

async function main() {

    const p_1_url = "/static/p-1.json";
    const p_2_url = "/static/p-2.json";
    const p_3_url = "/static/p-3.json";

    const p_1_dirty_data = await fetch( p_1_url );
    const p_2_dirty_data = await fetch( p_2_url );
    const p_3_dirty_data = await fetch( p_3_url );

    const p_1_clean_data = await cleanData( p_1_dirty_data );
    const p_2_clean_data = await cleanData( p_2_dirty_data );
    const p_3_clean_data = await cleanData( p_3_dirty_data );

    const p_1 = createPolygon( p_1_clean_data );
    const p_2 = createPolygon( p_2_clean_data );
    const p_3 = createPolygon( p_3_clean_data );

    scene.add( p_1, p_2, p_3 );

    async function cleanData( dirty_data ) {

        const a = await dirty_data.json();

        const b = a.features[ 0 ].geometry.coordinates[ 0 ];

        const c = [];

        b.forEach( item => c.push( ...item, 0 ) );

        return c;

    }

}

function createPolygon( position ) {

    /* 创建Mesh实例 */
    const g = new three.BufferGeometry();
    const m = new three.MeshBasicMaterial( {
        side: three.DoubleSide,
        color: Math.round( Math.random() * 0xffffff ),
        transparent: true,
        opacity: 0.5,
    } );
    const p = new three.Mesh( g, m );

    /* 设置position属性 */
    const position_array = new Float32Array( position );
    const position_attribute = new three.BufferAttribute( position_array, 3 );

    g.setAttribute( "position", position_attribute );

    /* 设置index属性 */
    const index_array = new Uint16Array( triangulate( position_array, 3 ) );
    const index_attribute = new three.BufferAttribute( index_array, 1 );

    g.setIndex( index_attribute );
    g.index.needsUpdate = true;

    /* 更新包围盒属性 */
    g.computeBoundingSphere();
    g.computeBoundingBox()

    return p;

}

/* 移动相机 */
camera.position.z = 5;

/* ------------------------------------------------------------------------------------------------------ */
/* Render */
renderer.setAnimationLoop( function loop() {

    // controls.update();

    renderer.render( scene, camera );

} );
