import * as greinerhormann from "greiner-hormann";

/**
 * 融合多边形。
 * @param {Array} input - 一个数组，它存储了零或多个多边形的顶点坐标，比如[ position_1, position_2, ... ]，其中
 * position_1是[ x, y, z, x, y, z, ... ]，注意position_1必须和position_2相交，position_2必须和position_3相
 * 交，诸如此类。
 * @returns {Array} - 一个数组，它存储了一个多边形的顶点坐标，比如[ x, y, z, x, y, z, ... ]
 */
export default function( ...input ) {

    if ( input.length === 0 ) return input;
    if ( input.length === 1 ) return input[ 0 ];

    let union = convert3dTo2d( input[ 0 ] );

    let index = 1;

    while ( index < input.length ) {

        const next = convert3dTo2d( input[ index ] );

        union = greinerhormann.union( union, next );
        union = union[ 0 ];

        index++;

    }

    return union;

}

/**
 * 判断2个圆是否相交（相切不属于相交）
 * @param {Array} center_1 - 第一个圆的圆心坐标，比如[ x, y ]
 * @param {Array} center_2 - 另一个圆的圆心坐标，比如[ x, y ]
 * @param {number} radius_1 - 第一个圆的半径
 * @param {number} radius_2 -另一个圆的半径
 * @returns {boolean} - 若相交则返回true，否则返回false
 */
function isIntersect( center_1, center_2, radius_1, radius_2 ) {

    const [ x_1, y_1 ] = center_1;
    const [ x_2, y_2 ] = center_2;

    const distance = Math.hypot( x_1 - x_2, y_1 - y_2 );

    if ( distance < ( radius_1 + radius_2 ) ) return true;

    return false;

}

/**
 * 将3d坐标数据集转换为2d坐标数据集
 * @param {Array} input - 3d坐标数据集，比如[ x, y, z, x, y, z, ... ]
 * @returns {Array} - 2d坐标数据集，比如[ [ x, y ], [ x, y ], ... ]
 */
function convert3dTo2d( input ) {

    const output = [];

    let index = 0;

    while ( index < input.length ) {

        const x = input[ index + 0 ];
        const y = input[ index + 1 ];
        const pair = [ x, y ];

        output.push( pair );

        index += 3;

    }

    return output;

}

/**
 * 将2d坐标数据集转换为3d坐标数据集
 * @param {Array} input - 2d坐标数据集，比如[ [ x, y ], [ x, y ], ... ]
 * @returns {Array} - 3d坐标数据集，比如[ x, y, 0, x, y, 0, ... ]，其中z坐标始终为0
 */
function convert2dTo3d( input ) {

    const output = [];

    let index = 0;

    while ( index < input.length ) {

        const x = input[ index ][ 0 ];
        const y = input[ index ][ 1 ];

        output.push( x, y, 0 );

        index++;

    }

    return output;

}
