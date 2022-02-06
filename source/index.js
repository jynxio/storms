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

    scene.add(
        createPolygon( data[ 0 ].position, 0xff0000 ),
        createPolygon( data[ 1 ].position, 0x00ff00 ),
        createPolygon( data[ 3 ].position, 0xffff00 ),
    );

    const position_1 = [];
    const position_2 = [];

    console.log( pair_all );

    function formatting() {}

}

function merge( data ) {

    const clone = JSON.parse( JSON.stringify( data ) );

    const intersections_index = [];

    for ( let i = 0; i < clone.length; i++ ) {

        if ( clone[ i ].isIntersectant ) continue;

        const a = clone[ i ];

        const a_x = a.center[ 0 ];
        const a_y = a.center[ 1 ];
        const a_r = a.radius;

        const intersection_index = [ i ];

        for ( let j = i + 1; j < clone.length; j++ ) {

            if ( clone[ j ].isIntersectant ) continue;

            const b = clone[ j ];

            const b_x = b.center[ 0 ];
            const b_y = b.center[ 1 ];
            const b_r = b.radius;

            /* 计算两点之间的距离 */
            const distance = Math.hypot( a_x - b_x, a_y - b_y );

            if ( distance >= ( a_r + b_r ) ) continue;

            a.isIntersectant = true;
            b.isIntersectant = true;

            intersection_index.push( j );

        }

        intersections_index.push( intersection_index );

    }

    const intersections_positions = [];

    for ( let i = 0; i < intersections_index.length; i++ ) {

        const intersection_index = intersections_index[ i ];

        const intersection_positions = [];

        for ( let i = 0; i < intersection_index.length; i++ ) {

            const position = data[ intersection_index[ i ] ].position;

            intersection_positions.push( position );

        }

        intersections_positions.push( union( intersection_positions ) );

    }

    return intersections_positions;

    function union( positions_array ) {

        let result = formatting( positions_array[ 0 ] );

        for ( let i = 1; i < positions_array.length; i++ ) {

            result = martinez.union( result, formatting( positions_array[ i ] ) );

        }

        return reverseFormatting( result[ 0 ] );

    }

    function formatting( position ) {

        const result = [];

        for ( let i = 0; i < position.length; i += 3 ) {

            const x = position[ i + 0 ];
            const y = position[ i + 1 ];

            result.push( [ x, y ] );

        }

        return [ [ result ] ];

    }

    function reverseFormatting( position ) {

        const result = [];

        const temp = position[ 0 ];

        for ( let i = 0; i < temp.length; i += 2 ) {

            const x = temp[ i ][ 0 ];
            const y = temp[ i ][ 1 ];
            const z = 0;

            result.push( x, y, z );

        }

        return result;

    }

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
