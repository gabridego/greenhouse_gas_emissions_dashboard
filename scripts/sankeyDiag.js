const units = "billion t";

var sankey;
var svg;

var count = 0;

// inspired by https://github.com/observablehq/stdlib/blob/master/src/dom/uid.js
// Code here : https://github.com/observablehq/stdlib/blob/master/src/dom/uid.js
// Published with ISC license
function uid(name) {
  return new Id("O-" + (name == null ? "" : name + "-") + ++count);
}

class Id {
    constructor(id) {
        this.id = id;
        this.href = new URL(`#${id}`, location) + "";
    }
    toString() {
        return "url(" + this.href + ")";
    }
}
/// end of inspired code block


// inspired by https://observablehq.com/@d3/sankey-diagram (ISC license)
function format(d) {
    formatNumber = d3.format(",.0f");   // zero decimal places

    return formatNumber(d) + " " + units;
}

const colord3 = d3.scaleOrdinal(d3.schemeCategory10);

function color(d) {
    return colord3(d.name);
}

/*function sankey_zoomed(event) {
    const {transform} = event;
    const g = d3.select("#sankey_svg");
    g.attr("transform", transform);

    g.attr("stroke-width", 1 / transform.k);
}*/

function sankey(year, data) {
    const sankey = d3.sankey()
    .nodeId(d => d.name)
    // .nodeAlign(d3[`sankey${align[0].toUpperCase()}${align.slice(1)}`])
    .nodeWidth(15)
    .nodePadding(10)
    .extent([[1, 5], [width - 1, height - 5]]);

    return sankey({
        nodes: data.nodes.map(d => Object.assign({}, d)),
        links: data.links[year].map(d => Object.assign({}, d))
    });
}

function init_sankey() {
    var margin = {top: 10, right: 10, bottom: 10, left: 10};
    s_width = 1200 - margin.left - margin.right;
    s_height = 740 - margin.top - margin.bottom;

    // append the svg canvas to the page
    // Zoom management
    /*const sankey_zoom = d3.zoom()
    .scaleExtent([1, 8])
    .on("zoom", sankey_zoomed);*/
    svg = d3.select("#sankey_chart").append("svg")
    .attr("id", "sankey_svg")
    .attr("viewBox", [0, 0, 1010, 620])
    .attr("width", "100%")
    .attr("height", "100%")
    /*.call(sankey_zoom)
    .on("mousedown.zoom", null)*/
    .append("g")
    .attr("id", "sankey_zone")
    .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");
}

function update_sankey(year, data, currentFilter) {
    const {nodes, links} = sankey(year, data);
    svg.selectAll("*").remove();

    svg.append("g")
    .attr("stroke", "#000")
    .selectAll("rect")
    .data(nodes)
    .join("rect")
    .attr("x", d => d.x0)
    .attr("y", d => d.y0)
    .attr("height", d => d.y1 - d.y0)
    .attr("width", d => d.x1 - d.x0)
    .attr("fill", color)
    .append("title")
    .text(d => `${d.name}\n${format(d.value)}`);

    const link = svg.append("g")
    .attr("fill", "none")
    .attr("stroke-opacity", 0.5)
    .selectAll("g")
    .data(links)
    .join("g")
    .style("mix-blend-mode", "multiply");

    const gradient = link.append("linearGradient")
    .attr("id", d => (d.uid = uid("link")).id)
    .attr("gradientUnits", "userSpaceOnUse")
    .attr("x1", d => d.source.x1)
    .attr("x2", d => d.target.x0);

    gradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", d => color(d.source));

    gradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", d => color(d.target));

    link.append("path")
    .attr("d", d3.sankeyLinkHorizontal())
    .attr("stroke", d => d.uid)
    .attr("stroke-width", d => Math.max(1, d.width));

    link.append("title")
    .text(d => `${d.source.name} → ${d.target.name}\n${format(d.value)}`);

    svg.append("g")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
    .selectAll("text")
    .data(nodes)
    .join("text")
    .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
    .attr("y", d => (d.y1 + d.y0) / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
    .text(d => d.name);

    return svg.node()
}
