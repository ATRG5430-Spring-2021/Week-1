// defining margins for content withing the SVG element
const margin = {t: 50, r:50, b: 50, l: 50};
// defining the size of the SVG element itself
const size = {w: 800, h: 800};
// selecting SVG
const svg = d3.select('svg');

// setting width and height of the SVG
svg.attr('width', size.w)
    .attr('height', size.h);

// loading geographic data in the form of geo.json
d3.json('data/maps/world.geo.json')
    .then(function (mapData) {

        // defining map size,
        // which should be smaller than the SVG by defined margins
        let mapSize = {
            w: size.w - margin.l - margin.r,
            h: size.h - margin.t - margin.b
        };

        // appending a group element to the SVG
        // this group will contain the map
        let g = svg.append('g')
            .classed('map', true) // giving it a CSS class named 'map'
            .attr('transform', 'translate('+margin.l+','+margin.t+')'); // moving the group from top and left by margins defined at the top

        // call the drawMap function to draw it
        drawMap(mapData, g, mapSize);
});


function drawMap (mapData, ele, size) {

    // Creating a geographic projection
    let projection = d3.geoMercator()
        .fitSize([size.w, size.h], mapData);

    // defining a geopath function to translate projections
    // into SVG paths
    let path = d3.geoPath(projection);

    // creating the paths from geographic data
    ele.selectAll('path')
        .data(mapData.features)
        .enter()
        .append('path')
        .attr('id', (d) => d.properties.brk_a3) // brk_a3 gives us the country id
        .attr('d', (d) => path(d));
}