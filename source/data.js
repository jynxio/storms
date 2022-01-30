export default async function () {

    let data;

    data = await fetch( "/static/storm/track/2020_ARTHUR_2020138N28281.json" );
    data = await data.json();
    data = data.data.storm;

    // const features = 

    console.log( data );

}