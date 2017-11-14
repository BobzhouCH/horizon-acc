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

horizon.d3_progress_chart = {
    WIDTH: 250,
    HEIGHT: 30,

    create_vis: function (chart, width, height) {
        return d3.select(chart).append("svg:svg").
            attr("class", "chart progress-chart").
            attr('width', width).
            attr('height', height);
    },


    init: function () {
        var self = this;

        // Progress Charts
        var progress_data = $(".d3_progress_chart");
        self.chart = d3.selectAll(".d3_progress_chart");

        for (var i = 0; i < progress_data.length; i++) {
            var data = $(progress_data[i]).data("used");
            var chart = self.chart[0][i];
            // When true is passed in only show the number, not the actual pie chart
            if (data[1] === true) {
                var percent = data[0];
                self.progressChart(chart, percent, false);
            } else {
                var percent = Math.min(parseInt(data), 100);
                self.progressChart(chart, percent, true);
            }
        }
    },

    progressChart: function (chart, data, fill) {
        var self = this;
        var percent = data / 100;

        var width = self.WIDTH,
            height = self.HEIGHT,
            progress_width = width,
            progress_height = height;

        var vis = self.create_vis(chart, width, height);

        vis.append("rect")
            .attr("class", "progress-chart-bar")
            .attr("width", progress_width)
            .attr("height", progress_height)
            .attr("x", 0)
            .attr("y", 0);

        var x_pos = percent * progress_width;
        vis.transition().delay(300).ease('linear').duration(1000).
            select('.progress-chart-bar').attr("x", x_pos);
    }
};

horizon.addInitFunction(function () {
    horizon.d3_progress_chart.init();
})
