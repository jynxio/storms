import { convert4326To3857 } from "./library/convertCoordinate";

const filenames = [
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

export default async function() {

    let data;

    data = await load();
    data = await clean( data );
    data = formatting( data );
    data = deconstruct( data, 64 );

    return data;

}

async function load() {

    const requests = [];

    for ( let i = 0; i < filenames.length; i++ ) {

        const request = fetch( "/static/" + filenames[ i ] + ".json" );

        requests.push( request );

    }

    const promiseall = await Promise.all( requests );

    const data = [];

    for ( let i = 0; i < promiseall.length; i++ ) {

        const jsondata = await promiseall[ i ].json();

        data.push( jsondata );

    }

    return data;

};

async function clean( input ) {

    const output = [];

    for( let i = 0; i < input.length; i++ ) {

        const features = input[ i ].data.storm.features;

        for ( let j = 0; j < features.length; j++ ) {

            const coordinate = features[ j ].geometry.coordinates;
            const radius = features[ j ].properties.windSpeed * 5000;
            const feature = { coordinate, radius };

            output.push( feature );

        }

    }

    return output;

}

function formatting( input ) {

    const output = [];

    for ( let i = 0; i < input.length; i++ ) {

        const radius = input[ i ].radius;

        const coordinate_4326 = input[ i ].coordinate;
        const coordinate_3857 = convert4326To3857( coordinate_4326[ 0 ], coordinate_4326[ 1 ] );

        const feature = { coordinate: coordinate_3857, radius: radius };

        output.push( feature );

    }

    return output;

}

/**
 * 根据圆心坐标与半径来计算出弧上的所有顶点的坐标。
 * @param   {Array}  input    - format方法的返回值。
 * @param   {number} segments - 圆弧的分段数。
 * @returns {Array}           - 数组，每个元素都是一个存储了顶点坐标的数组，顶点坐标的坐标系基于WebGL右手坐标系，其中
 *                              z恒定为0，比如[ [x, y, 0], [x, y, 0], ... ]。第一个顶点的位置在X轴上。
 */
function deconstruct( input, segments ) {

    const output = [];

    const  delta = Math.PI * 2 / segments;

    for ( let i = 0; i < input.length; i++ ) {

        const feature = input[ i ];

        const x = feature.coordinate[ 0 ];
        const y = feature.coordinate[ 1 ];
        const r = feature.radius;

        const positions = [];

        for ( let j = 0; j < segments; j++ ) {

            let theta = delta * j;

            const new_x = Math.cos( theta ) * r + x;
            const new_y = Math.sin( theta ) * r + y;
            const new_z = 0;

            positions.push( new_x, new_y, new_z );

        }

        const new_feature = {};

        new_feature.radius = r;
        new_feature.center = [ x, y ];
        new_feature.positions = positions;

        output.push( new_feature );

    }

    return output;

}
