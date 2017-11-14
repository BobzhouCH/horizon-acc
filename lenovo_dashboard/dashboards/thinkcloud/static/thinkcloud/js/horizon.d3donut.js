/*
  Draw pie charts in d3.

  To use, a div is required with the class .d3_pie_chart_usage or
  .d3_pie_chart_distribution, and a data-used attribute in the div
  that stores the data used to fill the chart.

  Example (usage):
    <div class="d3_pie_chart_usage"
      data-used="{% widthratio current_val max_val 100 %}">
    </div>

  Example (distribution):
    <div class="d3_pie_chart_distribution"
      data-used="Controller=1|Compute=2|Object Storage=3|Block Storage=4">
    </div>
*/

//// Pie chart SVG internal dimensions
//var WIDTH = 100;
//var HEIGHT = 100;
//var RADIUS = 45;
//
//function create_vis(chart) {
//  return d3.select(chart).append("svg:svg")
//    .attr("class", "chart legacy-pie-chart")
//    .attr("viewBox", "0 0 " + WIDTH + " " + HEIGHT )
//    .append("g")
//    .attr("transform",
//      "translate(" + (WIDTH / 2) + "," + (HEIGHT / 2) + ")");
//}
//
//function create_arc() {
//  return d3.svg.arc()
//    .outerRadius(RADIUS)
//    .innerRadius(0);
//}
//
//function create_pie(param) {
//  return d3.layout.pie()
//    .sort(null)
//    .value(function(d){ return d[param]; });
//}

var width = 400,
    height = 250,
    radius = Math.min(width, height) / 2;

var color = d3.scale.ordinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

var arc = d3.svg.arc()
    .outerRadius(radius - 10)
    .innerRadius(radius - 50);

var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) { return d.population; });

var svg = d3.select("#servers_donut").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var Arr = [
        {"age":"<5","population":"2704659"},
        {"age":"5-13","population":"4499890"},
        {"age":"14-17","population":"2159981"},
        {"age":"18-24","population":"3853788"},
        {"age":"25-44","population":"14106543"},
        {"age":"45-64","population":"8819342"},
        {"age":"≥65","population":"612463"}
    ];

function type(d) {
    d.population = +d.population;
    return d;
}


horizon.d3_gauge_chart = {
  init: function() {
    type(Arr);
    var g = svg.selectAll(".arc")
      .data(pie(Arr))
      .enter().append("g")
      .attr("class", "arc");

    g.append("path")
      .attr("d", arc)
      .style("fill", function(d) { return color(d.data.age); });

    g.append("text")
      .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
      .attr("dy", ".35em")
      .text(function() { return Arr.age; });

    //var self = this;

    //// Gauge Charts
    //var gauge_chart_data = $(".d3_gauge_chart");
    //self.chart = d3.selectAll(".d3_gauge_chart");
    //
    //for (var i = 0; i < gauge_chart_data.length; i++) {
    //  var data = $(gauge_chart_data[i]).data("percent");
    //  // When true is passed in only show the number, not the actual pie chart
    //  if (data[1] === true) {
    //    self.data = data[0];
    //    self.gaugeChart(i, false);
    //  } else {
    //    var percent = Math.min(parseInt(data), 100);
    //    self.data = percent;
    //    self.gaugeChart(i, true);
    //  }
    //}
  }


  //
  //gaugeChart: function(i, fill) {
  //
  //
  //}
};

horizon.addInitFunction(function () {
  horizon.d3_gauge_chart.init();
});
