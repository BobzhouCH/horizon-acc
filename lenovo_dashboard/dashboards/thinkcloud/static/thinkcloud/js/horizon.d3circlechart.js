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

// TODO: extract color settings into stylesheets

horizon.d3_circle_chart = {
    WIDTH: 200,
    HEIGHT: 200,
    PADDING: 30,

    create_vis: function (chart, width, height) {
        return d3.select(chart).append("svg:svg").
            attr("class", "chart").
            attr('width', width).
            attr('height', height).
            append('g').attr('transform', "translate(" + (width / 2) + ", " + (height / 2 + 20) + ")");
    },

    create_color: function () {
        return d3.scale.ordinal().
            range(["#948FC5"]);
    },

    create_pie: function () {
        return d3.layout.pie().
            sort(null);
    },

    create_arc: function (radius) {
        return d3.svg.arc()
            .innerRadius(radius - (this.PADDING  + 30))
            .outerRadius(radius - this.PADDING);
    },


    init: function () {
        var self = this;

        // Circle Charts
        var circle_chart_data = $(".d3_circle_chart");
        self.chart = d3.selectAll(".d3_circle_chart");

        for (var i = 0; i < circle_chart_data.length; i++) {
            var data = $(circle_chart_data[i]).data("used");
            var label = $(circle_chart_data[i]).data("label");
            var info = $(circle_chart_data[i]).data("info");

            var dataset,
                sum = 0;
            if ($.isArray(data)) {
                dataset = data.map(function (x) {
                    var value = parseInt(x);
                    if (!isNan(value)) {
                        sum += value;
                    }
                    return value;
                });
            } else {
                dataset = [data];
                sum += data;
            }

            var chart = self.chart[0][i];
            // When true is passed in only show the number, not the actual pie chart
            if (isNaN(dataset[dataset.length - 1])) {
                self.circleChart(chart, dataset, label, info, false);
            } else {
                var unused = Math.max(0, (100 - sum));
                dataset.push(unused);
                self.circleChart(chart, dataset, label, info, true);
            }
        }
    },

    circleChart: function (chart, dataset, label, info, fill) {
        var self = this;
        var pie_data;

        var width = self.WIDTH,
            height = self.HEIGHT,
            radius = Math.min(width, height) / 2;

        if (fill) {
            pie_data = dataset;
        } else if (dataset[0] != 0) {
            pie_data = [3, 97];
        } else {
            pie_data = [100];
        }

        var vis = self.create_vis(chart, width, height);

        var color = self.create_color();
        var pie = self.create_pie();
        var arc = self.create_arc(radius);

        vis.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", radius - (this.PADDING  + 15))
            .attr("fill", "#F1F1F1");

        var path = vis.selectAll("path")
            .data(pie(pie_data))
            .enter().append("path")
            .attr("class", "circle-chart-arc")
            .style("opacity", function (d, i) {
                return i == pie_data.length - 1 ? 0 : 1;
            })
            .attr("fill", function (d, i) {
                return color(i);
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

        if (label) {
            vis.append("text")
                .attr("dy", "0em")
                .style("text-anchor", "middle")
                .attr("class", "circle-chart-inside")
                .text(function (d) {
                    return label;
                });
        }

        if (info) {
            vis.append("text")
                .attr("dy", "1.5em")
                .style("text-anchor", "middle")
                .attr("class", "circle-chart-data")
                .text(function (d) {
                    return info;
                });
        }
    },


};

horizon.addInitFunction(function () {
    horizon.d3_circle_chart.init();
})
