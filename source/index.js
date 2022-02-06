import "/style/reset.css";

import "/style/index.css";

import * as three from "three";

import { triangulate } from "./library/earcut";

import * as martinez from "martinez-polygon-clipping";

import * as greinerhormann from "greiner-hormann";

import getStormData from "./data";

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
/* Main */
main();

async function main() {

    /* 获取风暴数据 */
    const data = await getStormData();

    /* 计算风暴数据的极值 */
    const bound = calculateBound( data );

    /* 根据极值数据调整相机的视锥体和位置 */
    updateCamera( bound );

    /*  */
    union( data );

    /* 绘制多边形网格 */
    // for( let i = 0; i < data.length; i++ ) {

    //     const position = data[ i ].position;

    //     const polygon = createPolygon( position, Math.round( Math.random() * 0xffffff ) );

    //     scene.add( polygon );

    // }

}

/**
 * 计算风暴数据的极值
 * @param   {Array} data - getStormData方法的返回值
 * @returns {Array}      -极值数组，依次是x_min、x_max、y_min、y_max
 */
function calculateBound( data ) {

    let x_min = undefined;
    let x_max = undefined;
    let y_min = undefined;
    let y_max = undefined;

    for ( let i = 0; i < data.length; i++ ) {

        const position = data[ i ].position;

        for ( let j = 0; j < position.length; j += 3 ) {

            const x = position[ j + 0 ];
            const y = position[ j + 1 ];

            if ( x_min === undefined ) x_min = x;
            else x_min = Math.min( x_min, x );

            if ( x_max === undefined ) x_max = x;
            else x_max = Math.max( x_max, x );

            if ( y_min === undefined ) y_min = y;
            else y_min = Math.min( y_min, y );

            if ( y_max === undefined ) y_max = y;
            else y_max = Math.max( y_max, y );

        }

    }

    if ( x_min < 0 ) x_min = Math.floor( x_min );
    else x_min = Math.ceil( x_min );

    if ( x_max < 0 ) x_max = Math.floor( x_max );
    else x_max = Math.ceil( x_max );

    if ( y_min < 0 ) y_min = Math.floor( y_min );
    else y_min = Math.ceil( y_min );

    if ( y_max < 0 ) y_max = Math.floor( y_max );
    else y_max = Math.ceil( y_max );

    return [ x_min, x_max, y_min, y_max ];

}

/**
 * 调整相机的视锥体和位置
 * @param {Array} bound - calculateBound方法的返回值
 */
function updateCamera( bound ) {

    /* 调整相机的视锥体 */
    updateFrustum();

    function updateFrustum() {

        let bound_width = bound[ 1 ] - bound[ 0 ];
        let bound_height = bound[ 3 ] - bound[ 2 ];

        const bound_aspect = bound_width / bound_height;

        const viewport_width = window.innerWidth;
        const viewport_height = window.innerHeight;
        const viewport_aspect = viewport_width / viewport_height;

        const aspect_ratio = bound_aspect / viewport_aspect;

        if ( aspect_ratio > 1 ) bound_height *= aspect_ratio;
        else bound_width /= aspect_ratio;

        const camera_left = - bound_width / 2;
        const camera_right = + bound_width / 2;
        const camera_top = + bound_height / 2;
        const camera_bottom = - bound_height / 2;
        const camera_near = 0.1;
        const camera_far = 2;

        camera.left = camera_left;
        camera.right = camera_right;
        camera.top = camera_top;
        camera.bottom = camera_bottom;
        camera.near = camera_near;
        camera.far = camera_far;
        camera.updateProjectionMatrix();

    }

    /* 定义resize事件 */
    window.addEventListener( "resize", _ => {

        renderer.setPixelRatio( Math.min( window.devicePixelRatio ) );
        renderer.setSize( window.innerWidth, window.innerHeight );

        updateFrustum();

    } );

    /* 调整相机的位置 */
    const camera_x = ( bound[ 0 ] + bound[ 1 ] ) / 2;
    const camera_y = ( bound[ 2 ] + bound[ 3 ] ) / 2;
    const camera_z = 1;

    camera.position.set( camera_x, camera_y, camera_z );

}

/**
 * 将相交的多边形融合在一起
 * @param {Array} data - getStormData方法的返回值
 */
function union( data ) {

    const intersections = [];

    intersections.push( [ 0 ] );

    data.forEach( item => {

    } );

    function isIntersect( center_1, center_2, radius_1, radius_2 ) {

        const distance = Math.hypot(
            center_1[ 0 ] - center_2[ 0 ],
            center_1[ 1 ] - center_2[ 1 ],
        );

        if ( distance < ( radius_1 + radius_2 ) ) return true;

        return false;

    }

}

function _union( data ) {

    const position_0 = convert3dTo2d( data[ 0 ].position );
    const position_1 = convert3dTo2d( data[ 1 ].position );
    const position_2 = convert3dTo2d( data[ 2 ].position );
    const position_3 = convert3dTo2d( data[ 3 ].position );
    const position_6 = convert3dTo2d( data[ 6 ].position );
    const position_7 = convert3dTo2d( data[ 7 ].position );
    const position_9 = convert3dTo2d( data[ 9 ].position );
    const position_11 = convert3dTo2d( data[ 11 ].position );
    const position_12 = convert3dTo2d( data[ 12 ].position );
    const position_13 = convert3dTo2d( data[ 13 ].position );

    let test_2d;

    test_2d = greinerhormann.union( position_1, position_2 );
    test_2d = greinerhormann.union( test_2d[ 0 ], position_3 );
    test_2d = greinerhormann.union( test_2d[ 0 ], position_6 );
    test_2d = greinerhormann.union( test_2d[ 0 ], position_7 );
    test_2d = greinerhormann.union( test_2d[ 0 ], position_9 );
    test_2d = greinerhormann.union( test_2d[ 0 ], position_11 );
    test_2d = greinerhormann.union( test_2d[ 0 ], position_12 );
    test_2d = greinerhormann.union( test_2d[ 0 ], position_13 );

    const test_3d = convert2dTo3d( test_2d[ 0 ] );

    scene.add(
        createPolygon( test_3d, 0xff0000 ),
        // createPolygon( data[ 0 ].position, 0xff0000 ),
        // createPolygon( data[ 1 ].position, 0xffff00 ),
        // createPolygon( data[ 2 ].position, 0xffff00 ),
        // createPolygon( data[ 3 ].position, 0xffff00 ),
        // createPolygon( data[ 4 ].position, 0xffff00 ),
        // createPolygon( data[ 5 ].position, 0xffff00 ),
        // createPolygon( data[ 6 ].position, 0xffff00 ),
        // createPolygon( data[ 7 ].position, 0xffff00 ),
        // createPolygon( data[ 8 ].position, 0xffff00 ),
        // createPolygon( data[ 9 ].position, 0xff0000 ),
        // createPolygon( data[ 11 ].position, 0x00ff00 ),
        // createPolygon( data[ 12 ].position, 0x00ff00 ),
        // createPolygon( data[ 13 ].position, 0x00ff00 ),
        createPolygon( data[ 14 ].position, 0x00ff00 ),
    );

    console.log( test_2d );
    console.log( test_3d );

}

/**
     * 将存储2d坐标的二维数组转换为存储3d坐标的一维数组。
     * @param {Array<number>} position_2d 2d坐标对的集合，比如[ [ x, y ], [ x, y ], ... ]
     * @returns {Array<number>} - 3d坐标的集合，比如[ x, y, z, x, y, z, ... ]
     */
function convert2dTo3d( position_2d ) {

    const position_3d = [];

    for ( let i = 0; i < position_2d.length; i++ ) {

        const x = position_2d[ i ][ 0 ];
        const y = position_2d[ i ][ 1 ];
        const z = 0;

        position_3d.push( x, y, z );

    }

    return position_3d;

}

/**
     * 将存储3d坐标的一维数组转换为存储2d坐标的二维数组。
     * @param {Array<number>} position_3d - 3d坐标的集合，比如[ x, y, z, x, y, z, ... ]
     * @returns {Array<number>} - 2d坐标对的集合，是个二维数组，比如[ [ x, y ], [ x, y ], ... ]
     */
function  convert3dTo2d( position_3d ) {

    const position_2d = [];

    for ( let i = 0; i < position_3d.length; i += 3 ) {

        const x = position_3d[ i + 0 ];
        const y = position_3d[ i + 1 ];

        const pair = [ x, y ];

        position_2d.push( pair );

    }

    return position_2d;

}

/**
 * 创建多边形网格
 * @param   {Array<number>} position - 坐标数组，比如[x, y, z, x, y, z, ...]
 * @param   {number}        color    - 颜色，比如0xffffff
 * @returns {Object}                 - 多边形网格实例
 */
function createPolygon( position, color ) {

    /* 创建多边形网格 */
    const geometry = new three.BufferGeometry();
    const material = new three.MeshBasicMaterial( { side: three.DoubleSide, color: color, wireframe: false } );
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

    /* 更新：防止几何体被视锥体剔除误杀 */
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();

    return polygon;

}
