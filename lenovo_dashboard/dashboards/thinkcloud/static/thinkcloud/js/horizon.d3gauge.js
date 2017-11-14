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

horizon.d3_gauge_chart = {
    WIDTH: 220,
    HEIGHT: 200,

    create_vis: function (chart, width, height) {
        return d3.select(chart).append("svg:svg").
            attr("class", "chart").
            attr('width', width).
            attr('height', height).
            append('g').attr('transform', "translate(" + (width / 2) + ", " + (height - 25) + ")");
    },


    init: function () {
        var self = this;

        // Gauge Charts
        var gauge_chart_data = $(".d3_gauge_chart");
        self.chart = d3.selectAll(".d3_gauge_chart");

        for (var i = 0; i < gauge_chart_data.length; i++) {
            var data = $(gauge_chart_data[i]).data("used");
            var label = $(gauge_chart_data[i]).data("value");
            var chart = self.chart[0][i];
            // When true is passed in only show the number, not the actual pie chart
            if (data[1] === true) {
                var percent = data[0];
                self.gaugeChart(chart, percent, label, false);
            } else {
                var percent = Math.min(parseInt(data), 100);
                self.gaugeChart(chart, percent, label, true);
            }
        }
    },

    gaugeChart: function (chart, data, label, fill) {
        var self = this;
        var percent = data / 100;

        var width = self.WIDTH;
        var height = self.HEIGHT;
        var radius = width / 2;
        var barWidth = 40 * width / 300;

        var chartInset = 10;
        var totalPercent = .75;
        var padRad = 0.025;

        /*
         Utility methods
         */
        percToDeg = function (perc) {
            return perc * 360;
        };

        percToRad = function (perc) {
            return degToRad(percToDeg(perc));
        };

        degToRad = function (deg) {
            return deg * Math.PI / 180;
        };

        var vis = self.create_vis(chart, width, height);
        vis.append('path').attr('class', "arc gauge-chart-filled");
        vis.append('path').attr('class', "arc gauge-chart-empty");

        var arc1 = d3.svg.arc().outerRadius(radius - chartInset).innerRadius(radius - chartInset - barWidth)
        var arc2 = d3.svg.arc().outerRadius(radius - chartInset).innerRadius(radius - chartInset - barWidth)

        var repaintGauge = function (percent) {
            var nextStart, arcStartRad, arcEndRad;

            nextStart = totalPercent;
            arcStartRad = percToRad(nextStart);
            arcEndRad = arcStartRad + percToRad(percent / 2);
            arc1.startAngle(arcStartRad).endAngle(arcEndRad);

            nextStart += percent / 2;
            arcStartRad = percToRad(nextStart);
            arcEndRad = arcStartRad + percToRad((1 - percent) / 2);
            arc2.startAngle(arcStartRad + padRad).endAngle(arcEndRad);

            vis.select(".gauge-chart-filled").attr('d', arc1);
            vis.select(".gauge-chart-empty").attr('d', arc2);
        };

        var Needle = (function () {

            /**
             * Helper function that returns the `d` value
             * for moving the needle
             **/
            var recalcPointerPos = function (percent) {
                var centerX, centerY, leftX, leftY, rightX, rightY, thetaRad, topX, topY;
                thetaRad = percToRad(percent / 2);
                centerX = 0;
                centerY = 0;
                topX = centerX - this.len * Math.cos(thetaRad);
                topY = centerY - this.len * Math.sin(thetaRad);
                leftX = centerX - this.radius * Math.cos(thetaRad - Math.PI / 2);
                leftY = centerY - this.radius * Math.sin(thetaRad - Math.PI / 2);
                rightX = centerX - this.radius * Math.cos(thetaRad + Math.PI / 2);
                rightY = centerY - this.radius * Math.sin(thetaRad + Math.PI / 2);
                return "M " + leftX + " " + leftY + " L " + topX + " " + topY + " L " + rightX + " " + rightY;
            };

            function Needle(vis, width, height) {
                this.vis = vis;
                this.len = width / 3;
                this.radius = this.len / 6;
            }

            Needle.prototype.render = function () {
                this.vis.append('circle').attr('class', 'gauge-needle-center').attr('cx', 0).attr('cy', 0).attr('r', this.radius);
                return this.vis.append('path').attr('class', 'gauge-needle').attr('d', recalcPointerPos.call(this, 0));
            };

            Needle.prototype.moveTo = function (percent) {
                var self = this;
                var oldValue = this.percent || 0;
                this.percent = percent;

                // Reset pointer position
                self.vis.transition().delay(100).ease('quad').duration(200).select('.gauge-needle').tween('reset-progress', function () {
                    return function (percentOfPercent) {
                        var progress = (1 - percentOfPercent) * oldValue;

                        repaintGauge(progress);
                        return d3.select(this).attr('d', recalcPointerPos.call(self, progress));
                    };
                });

                self.vis.transition().delay(300).ease('bounce').duration(1500).select('.gauge-needle').tween('progress', function () {
                    return function (percentOfPercent) {
                        var progress = percentOfPercent * percent;

                        repaintGauge(progress);
                        return d3.select(this).attr('d', recalcPointerPos.call(self, progress));
                    };
                });

            };

            return Needle;

        })();

        var needle = new Needle(vis, width, height);
        needle.render();
        needle.moveTo(percent);

        var drawIndication = function () {
            if (label != undefined) {
                vis.append("text")
                    .attr("class", "gauge-chart-data")
                    .style("text-anchor", "middle")
                    .text(label)
                    .style("font-size", "30px")
                    .style("font-weight", "700")
                    .style("fill", "#6699FF")
                    .attr("transform", function (d, i) {
                        //Just a calculation for x & y position
                        return "translate(" + (0) + "," + (-120) + ")";
                    });
            }
        };

        setTimeout(drawIndication, 1000);
    }

};

horizon.addInitFunction(function () {
    horizon.d3_gauge_chart.init();
})
