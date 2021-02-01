const margin = {t: 50, r:50, b: 50, l: 50};
const size = {w: 800, h: 800};
const svg = d3.select('svg');

svg.attr('width', size.w)
    .attr('height', size.h);

const files = ['data/maps/world.geo.json', 'data/life-expectancy.json'];
const promises = [];
Promise.all([
    d3.json(files[0]),
    d3.json(files[1])
]).then(function (datasets) {
    let mapData = datasets[0],
        lifeExpData = datasets[1];

    let mapSize = {
            w: size.w - margin.l - margin.r,
            h: size.h - margin.t - margin.b
        };
    let g = svg.append('g')
        .classed('map', true)
        .attr('transform', 'translate('+margin.l+','+margin.t+')');
    let pathSelection = drawMap(mapData, g, mapSize);

    choroplethiseMap(pathSelection, lifeExpData);
});


function drawMap (mapData, ele, size) {

    let projection = d3.geoMercator()
        .fitSize([size.w, size.h], mapData);

    let geoPath = d3.geoPath(projection);

    let pathSelection = ele.selectAll('path')
        .data(mapData.features)
        .enter()
        .append('path')
        .attr('id', (d) => d.properties.brk_a3)
        .attr('d', (d) => geoPath(d));
    
    // returning the path selection (d3 selection)
    // for other functions to utilise the geo-data attached 
    return pathSelection;
}

function choroplethiseMap (pathSelection, data) {

    // creating a color scale to translate
    // lifeExpectancy age to respective colors
    const colorScale = d3.scaleSequential()
        // the domain is the [min, max] lifeExpectancy age
        .domain(d3.extent(data, d => +d.lifeExpectancy))
        // the range is the color-gradient from yellow-green-blue
        .interpolator(d3.interpolateYlGnBu);

    // time to fill the SVG path of the country with respective color
    pathSelection.style('fill', function(d) {
        // each path is related to a geographic country
        // we are filtering out the country's life expectancy data
        let country = data.filter(e => e.countryCode === d.properties.brk_a3);
        // this returns an array
        // if lifeExpectancy data exists for a country, the array will be non-empty
        if (country.length > 0) {
            // lifeExpectancy is measured for that country
            country = country[0];
            // translate lifeExpectancy to color
            return colorScale(country.lifeExpectancy);
        }

        // if no data exists, we return a light grey
        return '#aaaaaa';
    })
};