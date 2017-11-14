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

horizon.d3_doughnut_chart = {
    WIDTH: 430,
    HEIGHT: 190,
    LEGEND_OFFSET: 280,

    create_vis: function (chart, width, height) {
        var offset = this.LEGEND_OFFSET;
        return d3.select(chart).append("svg:svg")
            .attr("class", "chart doughnut-chart")
            .attr("width", width)
            .attr("height", height)
            .append("g").attr("transform", "translate(" + ((width - offset + 100) / 2) + ", " + (height / 2) + ")");
    },

    create_pie: function () {
        return d3.layout.pie()
            .value(function (d) {
                return d["value"];
            })
            .sort(null);
            //.padAngle(.03); // only support in d3 v3.5.1+
    },

    create_color: function () {
        return d3.scale.category10();
        //return d3.scale.ordinal().range(["#D95400", "#E87A2D", "#F39753", "#FFB883"]);
    },

    create_arc: function (outer, inner) {
        return d3.svg.arc()
            .outerRadius(outer)
            .innerRadius(inner);
    },

    init: function () {
        var self = this;

        // Circle Charts
        var doughnut_data = $(".d3_doughnut_chart");
        self.chart = d3.selectAll(".d3_doughnut_chart");

        for (var i = 0; i < doughnut_data.length; i++) {
            var dataset = $(doughnut_data[i]).data("series");
            var dataTotal = $(doughnut_data[i]).data("total");
            var totalText = $(doughnut_data[i]).data("total-text");
            var chart = self.chart[0][i];
            self.doughnutChart(chart, dataset, dataTotal, totalText);
        }
    },

    doughnutChart: function (chart, dataset, datatotal, totalText) {
        var self = this;

        var width = self.WIDTH,
            height = self.HEIGHT;

        var outerRadius = Math.min(width, height) / 2 - 10,
            innerRadius = outerRadius - 30;

        var vis = self.create_vis(chart, width, height);

        var color = self.create_color();
        var pie = self.create_pie();
        var arc = self.create_arc(innerRadius, outerRadius);

        var path = vis.selectAll("path")
            .data(pie(dataset))
            .enter().append("path")
            .attr("class", "circle-chart-arc")
            .attr("fill", function (d, i) {
                return color(d.data["name"] + ": " + dataset[i]["value"]);
            })
            .attr("d", arc);

        path.transition()
            .duration(1000)
            .attrTween("d", function (d) {
                var interpolate = d3.interpolate({startAngle: 0, endAngle: 0}, d);
                return function (t) {
                    return arc(interpolate(t));
                };
            });

        var drawRestData = function () {
            vis.selectAll("text")
                .data(pie(dataset))
                .enter()
                .append("text")
                .transition()
                .duration(200)
                .attr("transform", function (d, i) {
                    return "translate(" + arc.centroid(d) + ")";
                })
                .attr("dy", ".4em")
                .attr("text-anchor", "middle")
                .text(function (d) {
                    var value = d.data["value"];
                    if (value === 0) {
                        return "";
                    } else {
                        return value;
                    }
                })
                .style("fill", "#fff")
                .style("font-size", "10px");

            var legendRectSize = 20;
            var legendSpacing = 17;
            var legendHeight = legendRectSize + legendSpacing;

            var legend = vis.selectAll(".legend")
                .data(color.domain())
                .enter()
                .append("g")
                .attr("class", "legend")
                .attr("transform", function (d, i) {
                    //Just a calculation for x & y position
                    return "translate(" + (outerRadius + 90) + "," + ((i * legendHeight) - 65) + ")";
                });

            legend.append("rect")
                .attr("width", legendRectSize)
                .attr("height", legendRectSize)
                .attr("rx", 20)
                .attr("ry", 20)
                .style("fill", color)
                .style("stroke", color);

            legend.append("text")
                .attr("x", 30)
                .attr("y", 15)
                .text(function (d) {
                    return d;
                })
                .style("fill", "#333333")
                .style("font-size", "13px");

            if (datatotal != undefined) {
                vis.append("text")
                    .attr("class", "gauge-chart-data")
                    .style("text-anchor", "middle")
                    .text(datatotal)
                    .style("font-size", "30px")
                    .style("font-weight", "700")
                    .style("fill", "#333")
                    .attr("transform", function (d, i) {
                        //Just a calculation for x & y position
                        return "translate(" + (0) + "," + (0) + ")";
                    });
                vis.append("text")
                    .style("text-anchor", "middle")
                    .text(totalText)
                    .style("font-size", "13px")
                    .style("fill", "#333")
                    .attr("transform", function (d, i) {
                        //Just a calculation for x & y position
                        return "translate(" + (0) + "," + (20) + ")";
                    });
            }
        };

        setTimeout(drawRestData, 1000);
    }
};

horizon.addInitFunction(function () {
    horizon.d3_doughnut_chart.init();
})
