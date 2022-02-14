import "/style/reset.css";

import "/style/index.css";

import * as three from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { toMercator } from "@turf/projection";

import earcut from "earcut";

import turfunion from "@turf/union";

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

async function main() {

    let data;

    data = await getData();

    updateFrustum( data );

    data = union( data );

    drawMesh( data );

}

async function getData() {

    let output;

    /* File name */
    const FILE_NAMES = [
        "2020_ARTHUR_2020138N28281",
        "2020_BERTHA_2020148N32281",
        "2020_BETA_2020261N21265",
        "2020_CRISTOBAL_2020154N19269",
        "2020_DELTA_2020279N16284",
        "2020_DOLLY_2020174N39293",
        "2020_EDOUARD_2020186N30289",
        "2020_EPSILON_2020291N32305",
        "2020_ETA_2020306N15288",
        "2020_FAY_2020188N28271",
        "2020_ISAIAS_2020211N13306",
        "2020_KYLE_2020228N37286",
        "2020_LAURA_2020233N14313",
        "2020_OMAR_2020244N30279",
        "2020_PAULETTE_2020251N17319",
        "2020_RENE_2020251N15342",
        "2020_SALLY_2020256N25281",
        "2020_TEDDY_2020256N11329",
        "2020_THETA_2020314N28313",
        "2020_ZETA_2020299N18277",
    ];

    /* Load data */
    output = await Promise.all( FILE_NAMES.map( file_name => load( "/static/" + file_name + ".json" ) ) );

    async function load( url ) {

        let data;

        data = await fetch( url );
        data = await data.json();

        return data;

    }

    /* Clean data */
    output = clean( output );

    function clean( input ) {

        const output = [];

        input.forEach( item => {

            const features = item.data.storm.features;

            features.forEach( item => {

                const point_4326 = {
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: item.geometry.coordinates,
                    },
                    properties: {
                        radius: item.properties.windSpeed * 5000,
                    },
                };

                const point_3857 = toMercator( point_4326 );

                output.push( point_3857 );

            } );

        } );

        return output;

    }

    /* Deconstruct data */
    output = deconstruct( output );

    function deconstruct( input ) {

        const output = input.map( point => {

            const polygon = {
                type: "Feature",
                geometry: {
                    type: "Polygon",
                    coordinates: [
                        [], // linear ring，因为它用于表示图形的轮廓，而非孔，因此它以逆时针的顺序来存储position。
                    ],
                },
                properties: {},
            };

            let segments = 64; // 圆形的弧段数。
            const delta = Math.PI * 2 / segments;

            const center = point.geometry.coordinates;
            const radius = point.properties.radius;

            const linear_ring = polygon.geometry.coordinates[ 0 ];

            linear_ring.push( [
                Math.cos( delta * 0 ) * radius + center[ 0 ],
                Math.sin( delta * 0 ) * radius + center[ 1 ],
            ] );

            while ( --segments >= 0 ) {

                let theta = delta * segments;

                linear_ring.push( [
                    Math.cos( theta ) * radius + center[ 0 ],
                    Math.sin( theta ) * radius + center[ 1 ],
                ] );

            }

            return polygon;

        } );

        return output;

    }

    return output;

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
