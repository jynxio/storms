import "/style/reset.css";

import "/style/index.css";

import * as three from "three";

import { toMercator } from "@turf/projection";

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

getData();

async function getData() {

    /*  */
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
    let data;

    data = await Promise.all( FILE_NAMES.map( file_name => load( "/static/" + file_name + ".json" ) ) );

    async function load( url ) {

        let data;

        data = await fetch( url );
        data = await data.json();

        return data;

    }

    /* Clean data */
    data = clean( data );

    function ( input ) {

        const output = [];

        input.forEach( item => {

            const features = item.data.storm.features;

            features.forEach( item => {

                const center_4326 = item.geometry.coordinates;

                // TODO

            } );

        } );

    }

    function clean( input ) {

        const output = [];

        input.forEach( item => { // 数据粒度：json

            const features = item.data.storm.features;

            features.forEach( item => { // 数据粒度：GeoJSON Object

                const center_4326 = item.geometry.coordinates;
                const center_4326_geojson_object = {
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: center_4326,
                    },
                    properties: {},
                };
                const center_3857_geojson_object = toMercator( center_4326_geojson_object );

                /* 根据storm由Point数据解构为Polygon数据。 */
                const polygon_geojson_object = {
                    type: "Feature",
                    geometry: {
                        type: "Polygon",
                        coordinates: [ [] ], // 逆时针、linear ring
                    },
                    properties: {},
                };

                output.push( polygon_geojson_object );

                const dock = polygon_geojson_object.geometry.coordinates[ 0 ];
                const center_3857 = center_3857_geojson_object.geometry.coordinates;
                const radius = item.properties.windSpeed * 5000;

                let segments = 64; // 该参数控制圆形的弧段数。
                const delta = Math.PI * 2 / segments;

                dock.push( [
                    Math.cos( delta * 0 ) * radius + center_3857[ 0 ],
                    Math.sin( delta * 0 ) * radius + center_3857[ 1 ],
                ] );

                while( --segments >= 0 ) {

                    let theta = delta * segments;

                    dock.push( [
                        Math.cos( theta ) * radius + center_3857[ 0 ],
                        Math.sin( theta ) * radius + center_3857[ 1 ],
                    ] );

                }

            } );

        } );

        return output;

    }

}
