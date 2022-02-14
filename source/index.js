import "/style/reset.css";

import "/style/index.css";

import * as three from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import earcut from "earcut";

import turfunion from "@turf/union";

import getData from "./stormData";

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

/* Controls */
const controls = new OrbitControls( camera, renderer.domElement );

controls.enableDamping = true;
controls.enableRotate = false;

/* Render */
renderer.setAnimationLoop( function loop() {

    controls.update();

    renderer.render( scene, camera );

} );

/* ------------------------------------------------------------------------------------------------------ */
main();

function main() {

    let data;

    data = getData();

    updateFrustum( data );

    data = union( data );

    drawMesh( data );

}

function updateFrustum( input ) {

    /* 计算数据的极值。 */
    const xs = [];
    const ys = [];

    input.forEach( polygon => {

        const positions = polygon.geometry.coordinates[ 0 ];

        positions.forEach( position => {

            const [ x, y ] = position;

            xs.push( x );
            ys.push( y );

        } );

    } );

    /* 更新相机的视野范围。 */
    const boundary = {};
    const viewport = {};

    main();

    window.addEventListener( "resize", _ => {

        main();

        renderer.setPixelRatio( Math.min( devicePixelRatio ) );
        renderer.setSize( viewport.width, viewport.height );

    } );

    function main() {

        boundary.left = Math.min( ...xs );
        boundary.right = Math.max( ...xs );
        boundary.top = Math.max( ...ys );
        boundary.bottom = Math.min( ...ys );
        boundary.width = ( boundary.right - boundary.left ) * 1.05;
        boundary.height = ( boundary.top - boundary.bottom ) * 1.05;
        boundary.aspect = boundary.width / boundary.height;

        viewport.width = innerWidth;
        viewport.height = innerHeight;
        viewport.aspect = viewport.width / viewport.height;

        const aspect_ratio = boundary.aspect / viewport.aspect;

        aspect_ratio > 1
        ? boundary.height *= aspect_ratio
        : boundary.width  /= aspect_ratio;

        camera.left = - boundary.width / 2;
        camera.right = boundary.width / 2;
        camera.top = boundary.height / 2;
        camera.bottom = - boundary.height / 2;
        camera.near = 0.1;
        camera.far = 2;
        camera.updateProjectionMatrix();
        camera.position.x = ( boundary.left + boundary.right ) / 2;
        camera.position.y = ( boundary.bottom + boundary.top ) / 2;
        camera.position.z = 1;

        controls.target.x = camera.position.x;
        controls.target.y = camera.position.y;
        controls.target.z = 0;
        controls.update();

    }

}

function drawMesh( input ) {

    if ( input.geometry.type !== "MultiPolygon" ) {

        console.error( "该函数只处理MultiPolygonn类型的GeoJSON。" );

        return;

    }

    input.geometry.coordinates.forEach( polygon_coordinates => {

        const color = Math.round( Math.random() * 0xffffff );
        const wireframe = false;

        scene.add( createMesh( polygon_coordinates, color, wireframe ) );

    } );

    input.geometry.coordinates.forEach( polygon_coordinates => {

        scene.add( createMesh( polygon_coordinates, 0xffffff, true ) );

    } );

    function createMesh( polygon_coordinates, color, wireframe ) {

        /* flatten数据 */
        const coordinates = polygon_coordinates;

        const vertex = [];
        const hole = [];
        const dimensions = 3;

        for ( let i = 0; i < coordinates.length; i++ ) {

            const linear_ring = coordinates[ i ];

            /* 处理轮廓数据。 */
            linear_ring.forEach( position => {

                const [ x, y ] = position;

                vertex.push( x, y, 0 );

            } );

            if ( i <= 0 ) continue;

            /* 处理孔数据。 */
            const previous_linear_ring = coordinates[ i - 1 ];

            hole.push(
                hole.length === 0
                ? previous_linear_ring.length
                : previous_linear_ring.length + hole[ hole.length - 1 ]
            );

        }

        /* 生成mesh */
        const geometry = new three.BufferGeometry();
        const material = new three.MeshBasicMaterial( { side: three.DoubleSide, color, wireframe } );
        const mesh = new three.Mesh( geometry, material );

        let position;
        position = new Float32Array( vertex );
        position = new three.BufferAttribute( position, 3 );

        geometry.setAttribute( "position", position );

        let index;
        index = new Uint16Array( earcut( vertex, hole.length === 0 ? null : hole, dimensions ) );
        index = new three.BufferAttribute( index, 1 );

        geometry.setIndex( index );
        geometry.index.needsUpdate = true;

        geometry.computeBoundingBox();
        geometry.computeBoundingSphere();

        return mesh;

    }

}

function union( input ) {

    let output = input[ 0 ];

    let index = 0;

    while ( ++index < input.length ) {

        output = turfunion( output, input[ index ] );

    }

    return output;

}
