/**
 * 坐标转换，将基于EPSG4326的坐标转换为基于ERPSG3857的坐标。
 * @param   {number} lon      - 经度（基于EPSG4326）。
 * @param   {number} lat      - 纬度（基于EPSG4326）。
 * @returns {Array<number>}   - 数组，第一个元素是x坐标（基于EPSG3857），第二个元素是y坐标（基于EPSG3857）。
 */
export function convert4326To3857( lon, lat ) {

    const earth_radius = 6378137;

    const x = lon * Math.PI / 180 * earth_radius;

    const temp = lat * Math.PI / 180;

    const y = earth_radius / 2 * Math.log( ( 1 + Math.sin( temp ) ) / ( 1 - Math.sin( temp ) ) );

    return [ x, y ];

}

/**
 * 坐标转换，将基于EPSG3857的坐标转换为基于ERPSG4326的坐标。
 * @param   {number}      x - x坐标（基于EPSG3857）。
 * @param   {number}      y - y坐标（基于EPSG3857）。数组
 * @returns {Array<number>} - 数组，第一个元素是经度（基于EPSG4326），第二个元素是纬度（基于EPSG4326）。
 */
export function convert3857To4326( x, y ) {

    const lon = x / 20037508.34 * 180;

    const temp = y / 20037508.34 * 180;

    const lat = 180 / Math.PI * ( 2 * Math.atan( Math.exp( temp * Math.PI / 180 ) ) - Math.PI / 2 );

    return [ lon, lat ];

}
