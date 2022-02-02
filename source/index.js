import "/style/reset.css";

import "/style/index.css";

import * as three from "three";

import { triangulate } from "./library/earcut";

import * as martinez from "martinez-polygon-clipping";

import * as convertCoordinate from "./library/convertCoordinate";

import * as data from "./data";

/* Test */
data.init();

/* ------------------------------------------------------------------------------------------------------ */
/* Renderer */
const renderer = new three.WebGLRenderer({ antialias: window.devicePixelRatio < 2 });

renderer.setPixelRatio( Math.min( window.devicePixelRatio ) );
renderer.setSize( window.innerWidth, window.innerHeight );

document.body.append( renderer.domElement );

/* Scene */
const scene = new three.Scene();

/* Camera */
const camera = new three.OrthographicCamera(
    - 60,
    + 60,
    + 60 * window.innerHeight / window.innerWidth,
    - 60 * window.innerHeight / window.innerWidth,
    0.1 ,
    100,
);

scene.add( camera );

/* Resize */
window.addEventListener( "resize", _ => {

    renderer.setPixelRatio( Math.min( window.devicePixelRatio ) );
    renderer.setSize( window.innerWidth, window.innerHeight );

    camera.left   = - 60;
    camera.right  = + 60;
    camera.top    = + 60 * window.innerHeight / window.innerWidth;
    camera.bottom = - 60 * window.innerHeight / window.innerWidth;
    camera.updateProjectionMatrix();

} );

/* Render */
renderer.setAnimationLoop( function loop() {

    renderer.render( scene, camera );

} );

/* ------------------------------------------------------------------------------------------------------ */
/* 移动相机 */
camera.position.set( 0, 0, 5 );

/* 处理数据 */
async function fecthData( url ) {

    let data;

    data = await fetch( url );
    data = await data.json();
    data = data.features[ 0 ].geometry.coordinates; // 三维数组

    return data;

}

/* 创建多边形 */
function createPolygon( position, color ) {

    /* 创建多边形 */
    const geometry = new three.BufferGeometry();
    const material = new three.MeshBasicMaterial( { side: three.DoubleSide, color: color, wireframe: true } );
    const polygon = new three.Mesh( geometry, material );

    /* 设置多边形的顶点数据 */
    const node = new Float32Array( position );
    const node_attribute = new three.BufferAttribute( node, 3 );

    geometry.setAttribute( "position", node_attribute );

    /* 设置多边形的顶点连接顺序 */
    const index = new Uint16Array( triangulate( node, 3 ) );
    const index_attribute = new three.BufferAttribute( index, 1 );

    geometry.setIndex( index_attribute );
    geometry.index.needsUpdate = true;

    /*  */
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();

    return polygon;

}

/* 绘制多边形 */
drawPolygon();

async function drawPolygon() {

    /* 资源地址 */
    const p_1_data_url = "/static/p-1.json";
    const p_2_data_url = "/static/p-2.json";
    const p_3_data_url = "/static/p-3.json";

    /*  */
    const p_1_data = await fecthData( p_1_data_url );
    const p_2_data = await fecthData( p_2_data_url );
    const p_3_data = await fecthData( p_3_data_url );

    /*  */
    let union;

    union = merge( merge( p_1_data, p_2_data ), p_3_data );
    union = union[ 0 ][ 0 ];

    /*  */
    const position = [];

    for ( let i = 0; i < union.length; i++ ) {

        const x = union[ i ][ 0 ];
        const y = union[ i ][ 1 ];
        const z = 0;

        position.push( x, y, z );

    }

    /*  */
    const polygon = createPolygon( position, 0xff00ff );

    scene.add( polygon );

    // const p_1 = createPolygon( p_1_data, 0xff0000 );
    // const p_2 = createPolygon( p_2_data, 0x00ff00 );
    // const p_3 = createPolygon( p_3_data, 0x0000ff );

    // scene.add( p_1, p_2, p_3 );

}

/* ------------------------------------------------------------------------------------------------------ */
/* Test */
function merge( data_1, data_2 ) {

    let union;

    union = martinez.union( data_1, data_2 );

    return union;

}


