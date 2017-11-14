
$(document).ready(function () {
    'use strict';

    if ($.cookie("nav_collapse") == "true") {
        $("#more_wizard").hide();
    }

    $("#colla_button").click(function() {
        var leftPane = $("#js-leftPane");
        var sidebar = $("#sidebar");
        var nav_collapse = $.cookie("nav_collapse");
        var nav_toggle = $(this).find("a.toggle-nav-collapse");
        var more_wizard = $("#more_wizard");

        if (nav_collapse == "true") {
            leftPane.removeClass("sidebar-collapsed").addClass("sidebar-expanded");
            sidebar.removeClass("sidebar-collapsed").addClass("sidebar-expanded");
            nav_toggle.find("span.fa").removeClass("fa-angle-right").addClass("fa-angle-left");
            more_wizard.css("display","inline");
            $.cookie("nav_collapse", false);
            $.cookie("nav_collapse", false, {path: "/"});
        } else {
            leftPane.removeClass("sidebar-expanded").addClass("sidebar-collapsed");
            sidebar.removeClass("sidebar-expanded").addClass("sidebar-collapsed");
            nav_toggle.find("span.fa").removeClass("fa-angle-left").addClass("fa-angle-right");
            more_wizard.css("display","none");
            $.cookie("nav_collapse", true);
            $.cookie("nav_collapse", true, {path: "/"});
        }
    });

});

$(document).ready(function () {

    $("#more_wizard").click(function () {
        $("#shadow, #mbx_wizard").show();
        $("#shadow, #modCancel, #mbx_table tr a, #mbx_table tr button").click(function () {
            $("#shadow, #mbx_wizard").hide();
        });
    });

});
