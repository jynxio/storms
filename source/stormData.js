import { toMercator } from "@turf/projection";

import ARTHUR from "/static/2020_ARTHUR_2020138N28281.json";

import BERTHA from "/static/2020_BERTHA_2020148N32281.json";

import BETA from "/static/2020_BETA_2020261N21265.json";

import CRISTOBAL from "/static/2020_CRISTOBAL_2020154N19269.json";

import DELTA from "/static/2020_DELTA_2020279N16284.json";

import DOLLY from "/static/2020_DOLLY_2020174N39293.json";

import EDOUARD from "/static/2020_EDOUARD_2020186N30289.json";

import EPSILON from "/static/2020_EPSILON_2020291N32305.json";

import ETA from "/static/2020_ETA_2020306N15288.json";

import FAY from "/static/2020_FAY_2020188N28271.json";

import ISAIAS from "/static/2020_ISAIAS_2020211N13306.json";

import KYLE from "/static/2020_KYLE_2020228N37286.json";

import LAURA from "/static/2020_LAURA_2020233N14313.json";

import OMAR from "/static/2020_OMAR_2020244N30279.json";

import PAULETTE from "/static/2020_PAULETTE_2020251N17319.json";

import RENE from "/static/2020_RENE_2020251N15342.json";

import SALLY from "/static/2020_SALLY_2020256N25281.json";

import TEDDY from "/static/2020_TEDDY_2020256N11329.json";

import THETA from "/static/2020_THETA_2020314N28313.json";

import ZETA from "/static/2020_ZETA_2020299N18277.json";

const data =  [
    ARTHUR,
    BERTHA,
    BETA,
    CRISTOBAL,
    DELTA,
    DOLLY,
    EDOUARD,
    EPSILON,
    ETA,
    FAY,
    ISAIAS,
    KYLE,
    LAURA,
    OMAR,
    PAULETTE,
    RENE,
    SALLY,
    TEDDY,
    THETA,
    ZETA,
];

export default function getData() {

    let output;

    /* Clean data */
    output = clean( data );

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
