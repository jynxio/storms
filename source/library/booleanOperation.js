import * as greinerhormann from "greiner-hormann";

/**
 * 融合多边形。
 * @param {Array} input - 一个数组，它存储了零或多个多边形的顶点坐标，比如[ position_0, position_1, ... ]，其中
 * position_0是[ x, y, z, x, y, z, ... ]，注意position_1必须和position_0相交，position_2必须前面的合体相交（即
 * position_0和position_1的合体会与position_2相交），以此类推。
 * @returns {Array} - 一个数组，它存储了一个多边形的顶点坐标，比如[ x, y, z, x, y, z, ... ]
 */
function union( ...input ) {

    if ( input.length === 0 ) return input;
    if ( input.length === 1 ) return input[ 0 ];

    let result = convert3dTo2d( input[ 0 ] );

    let index = 1;

    while ( index < input.length ) {

        const next = convert3dTo2d( input[ index ] );

        result = greinerhormann.union( result, next );
        result = result[ 0 ];

        index++;

    }

    return result;

}

/**
 * 聚类多边形，将相交的多边形聚合在一起。
 * @param {Array} input - 一个数组，它存储了零或多个圆形的几何信息，比如[ circle_1, circle_2, ... ]，其中circle_1是由
 * 圆心坐标和半径组成的键值对，比如{ center: [ 0, 0 ], radius: 100 }。
 * @returns {Array} - 一个数组，比如[ [ 0,1,2 ], [ 3,4,5 ] ]表示聚类出2个簇，[ 0,1,2 ]表示input[1]和input[0]相交，
 * input[2]和前面的合体相交（即input[0]和input[1]的合体会与input[2]相交），以此类推。
 */
function cluster( ...input ) {

    if ( input.length === 0 ) return [ [] ];
    if ( input.length === 1 ) return [ [ 0 ] ];

    const output = [];

    const isCluster = input.map( _ => false );

    for ( let i = 0; i < input.length; i++ ) {

        if ( isCluster[ i ] ) continue;

        isCluster[ i ] = true;

        const index = [ i ];

        output.push( index );

        for ( let j = 0; j < input.length; j++ ) {

            if ( isCluster[ j ] ) continue;

            const a = input[ j ];
            const a_center = a.center;
            const a_radius = a.radius;

            for ( let k = 0; k < index.length; k++ ) {

                const b = input[ index[ k ] ];
                const b_center = b.center;
                const b_radius = b.radius;

                const is_intersect = isIntersect( a_center, b_center, a_radius, b_radius );

                if ( !is_intersect ) continue;

                index.splice( k + 1, 0, j );

                isCluster[ j ] = true;

                break;

            }

        }

    }

    return output;

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

export { union, cluster };
