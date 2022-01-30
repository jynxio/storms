import "/style/reset.css";

import "/style/index.css";

import * as three from "three";

import { triangulate } from "./library/earcut";

import * as martinez from "martinez-polygon-clipping";

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

/* Resize */
window.addEventListener( "resize", _ => {

    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    camera.left   = - 100;
    camera.right  = + 100;
    camera.top    = + 100 * window.innerHeight / window.innerWidth;
    camera.bottom = - 100 * window.innerHeight / window.innerWidth;
    camera.updateProjectionMatrix();

} );

/* ------------------------------------------------------------------------------------------------------ */
/* GeoJSON */
main();

async function main() {

    const p_1_url = "/static/fake/p-1.json";
    const p_2_url = "/static/fake/p-2.json";
    const p_3_url = "/static/fake/p-3.json";

    const p_1_dirty_data = await fetch( p_1_url );
    const p_2_dirty_data = await fetch( p_2_url );
    const p_3_dirty_data = await fetch( p_3_url );

    const p_1_clean_data = await clean( p_1_dirty_data );
    const p_2_clean_data = await clean( p_2_dirty_data );
    const p_3_clean_data = await clean( p_3_dirty_data );

    const union_1_and_2 = merge( p_1_clean_data, p_2_clean_data );
    const union_1_and_2_and_3 = merge( union_1_and_2, p_3_clean_data );

    const union_position = [];

    union_1_and_2_and_3[ 0 ].forEach( item => {

        union_position.push( ...item, 0 );

    } );

    const union_polygon = createPolygon( union_position );

    scene.add( union_polygon );

    async function clean( dirty_data ) {

        const json_data  = await dirty_data.json();

        const coordinates_data = json_data.features[ 0 ].geometry.coordinates;

        return coordinates_data;

    }

    function merge( data_1, data_2 ) {

        const dirty_union = martinez.union( data_1, data_2 );

        const clean_union = dirty_union[ 0 ];

        return clean_union;

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
camera.position.z = 1;

/* ------------------------------------------------------------------------------------------------------ */
/* Render */
renderer.setAnimationLoop( function loop() {

    renderer.render( scene, camera );

} );
