/* Namespace for core functionality related to Network Topology. */
horizon.network_topology = {
    model: null,
    fa_globe_glyph: '\uf0ac',
    fa_globe_glyph_width: 15,
    svg: '#topology_canvas',
    svg_container: '#topologyCanvasContainer',
    post_messages: '#topologyMessages',
    network_tmpl: {
        small: '#topology_template > .network_container_small',
        normal: '#topology_template > .network_container_normal'
    },
    router_tmpl: {
        small: '#topology_template > .router_small',
        normal: '#topology_template > .router_normal'
    },
    instance_tmpl: {
        small: '#topology_template > .instance_small',
        normal: '#topology_template > .instance_normal'
    },
    sidebar_width: {
        'collapsed': 65,
        'expand': 235
    },
    balloon_tmpl: null,
    balloon_device_tmpl: null,
    balloon_port_tmpl: null,
    network_index: {},
    balloon_id: null,
    reload_duration: 2000,
    draw_mode: 'normal',
    network_width: 0,
    previous_message: null,
    default_rows: 2,
    default_cols: 2,
    default_temp_cols: 2,
    group_length: 1,
    max_server_length: 4,
    element_properties: {
        normal: {
            network_spacing: 270,
            network_group_spacing: 30,
            network_min_width: 800,
            left_margin: 80,
            default_width: 90,
            margin: 20,
            device_y: 117.5,
            device_group_y: 46.5,
            port_group_width: 31.5,
            device_width: 90,
            device_height: 50,
            port_margin: 16,
            port_height: 6,
            port_width: 102.5,
            port_text_margin: {x: -6, y: 50},
            texts_bg_y: 32,
            type_y: 46,
            balloon_margin: {x: 12, y: -12}
        },
        small: {
            network_spacing: 100,
            network_min_width: 600,
            left_margin: 50,
            default_width: 20,
            margin: 30,
            device_y: 47.5,
            device_width: 20,
            device_height: 20,
            port_margin: 5,
            port_height: 3,
            port_width: 32.5,
            port_text_margin: {x: 0, y: 0},
            texts_bg_y: 0,
            type_y: 0,
            balloon_margin: {x: 12, y: -30}
        },
        cidr_margin: 5,
        device_name_max_size: 9,
        device_name_suffix: '..'
    },
    deviceStatus: {
        'ACTIVE': gettext("Active"),
        'DELETED': gettext("Deleted"),
        'BUILD': gettext('Build'),
        'SHUTOFF': gettext("Shutoff"),
        'SUSPENDED': gettext("Suspended"),
        'PAUSED': gettext("Paused"),
        'ERROR': gettext("Error"),
        'RESIZE': gettext("Resize"),
        'VERIFY_RESIZE': gettext("Confirm or Revert Migrate"),
        'REVERT_RESIZE': gettext("Revert Resize"),
        'REBOOT': gettext("Reboot"),
        'HARD_REBOOT': gettext("Hard Reboot"),
        'PASSWORD': gettext("Password"),
        'REBUILD': gettext("Rebuild"),
        'MIGRATING': gettext("Migrating"),
        'RESCUE': gettext("Rescue"),
        'SOFT_DELETED': gettext("Soft Delete"),
        'STOPPING': gettext("Stopping"),
        'PENDING': gettext("Pending"),
        "suspending": gettext("Suspending"),
        "powering-off": gettext("Powering Off"),
        "powering-on": gettext("Powering On"),
      },
    portStatus: {
        'ACTIVE': gettext("ACTIVE"),
        'DOWN': gettext('DOWN'),
    },
    init: function () {
        var self = this;
        $(self.svg_container).spin(horizon.conf.spinner_options.modal);
        if ($('#networktopology').length === 0) {
            return;
        }

        var color_category10 = ["#949494", "#79bcff", "#9ed05b", "#9999ff", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"];
        self.color = d3.scale.ordinal().range(color_category10);
        self.balloon_tmpl = Hogan.compile($('#balloon_container').html());
        self.balloon_device_tmpl = Hogan.compile($('#balloon_device').html());
        self.balloon_port_tmpl = Hogan.compile($('#balloon_port').html());

        $(document)
            .on('click', 'a.closeTopologyBalloon', function (e) {
                e.preventDefault();
                self.delete_balloon();
            })
            .on('click', '.topologyBalloon', function (e) {
                e.stopPropagation();
            })
            .on('click', 'a.vnc_window', function (e) {
                e.preventDefault();
                var vnc_window = window.open($(this).attr('href'), vnc_window, 'width=760,height=560');
                self.delete_balloon();
            })
            .click(function () {
                self.delete_balloon();
            });

        $('.toggleView > .btn').click(function () {
            self.draw_mode = $(this).data('value');
            $('g.network').remove();
            $.cookie('ntp_draw_mode', self.draw_mode);
            self.data_convert();
        });

        $(window)
            .on('message', function (e) {
                var message = $.parseJSON(e.originalEvent.data);
                if (self.previous_message !== message.message) {
                    horizon.alert(message.type, message.message);
                    horizon.autoDismissAlerts();
                    self.previous_message = message.message;
                    self.delete_post_message(message.iframe_id);
                    self.load_network_info();
                    //workaround
                    setTimeout(function () {
                        self.previous_message = null;
                    }, self.reload_duration);
                }
            });

        self.load_network_info();
    },

    load_network_info: function () {
        var self = this;
        if ($('#networktopology').length === 0) {
            return;
        }

        $.getJSON($('#networktopology').data('networktopology') + '?' + $.now(),
            function (data) {
                self.model = data;
                self.data_convert();
                setTimeout(function () {
                    self.load_network_info();
                }, self.reload_duration);
            }
        );
    },
    select_draw_mode: function () {
        var self = this;
        var draw_mode = $.cookie('ntp_draw_mode');
        if (draw_mode && (draw_mode === 'normal' || draw_mode === 'small')) {
            self.draw_mode = draw_mode;
        } else {
            if (self.model.networks.length *
                self.element_properties.normal.network_spacing > $('#topologyCanvas').width()) {
                self.draw_mode = 'small';
            } else {
                self.draw_mode = 'normal';
            }
            $.cookie('ntp_draw_mode', self.draw_mode);
        }
        $('.toggleView > .btn').each(function () {
            var $this = $(this);
            if ($this.data('value') === self.draw_mode) {
                $this.addClass('active');
            } else {
                $this.removeClass('active');
            }
        });
    },

    group_same_topology: function (self, networks) {
        var select_network_id_str = function (device) {
            var result = {};
            var keys = [];
            var temp_arr = [];
            $.each(device.ports, function (index, port) {
                var network_index = self.get_network_index(port.network_id);
                keys.push(network_index);
                result[network_index] = port.network_id;
            })

            $.each(keys.sort(), function (index, info) {
                temp_arr.push(result[info]);
            })
            return temp_arr.join(",")
        };
        var group_dict = function (array) {
            var dict = {};
            array.map(function (info, index) {
                var temp = select_network_id_str(info);
                if (dict[temp + "," + info.type]) {
                    dict[temp + "," + info.type].push(info);
                } else {
                    dict[temp + "," + info.type] = [];
                    dict[temp + "," + info.type].push(info);
                }
            });
            return dict;
        };
        $.each(networks, function (index_a, network) {
            network.group = group_dict(network.devices);
        });
        $.each(networks, function (index_a, network) {
            network.temp_group = [];
            $.each(network.group, function (index_b, devices) {
                if (devices.length <= horizon.network_topology.group_length) {
                    $.each(devices, function(index_c, device) {
                        var obj = new Object();
                        obj[index_b] = device;
                        network.temp_group.push(obj);
                    })
                } else {
                    var obj = new Object();
                    var device_origin_length = devices.length;
                    if (devices.length < horizon.network_topology.max_server_length) {
                        obj[index_b] = devices;
                        obj[index_b]['more_flag'] = false;
                    } else {
                        obj[index_b] = devices.slice(0, horizon.network_topology.max_server_length);
                        obj[index_b]['more_flag'] = true;
                    }
                    obj[index_b]['origin_length'] = device_origin_length;
                    network.temp_group.push(obj);
                }
            });
        });
    },

    data_convert: function () {
        var self = this;
        var model = self.model;
        $.each(model.networks, function (index, network) {
            self.network_index[network.id] = index;
        });
        self.select_draw_mode();
        var element_properties = self.element_properties[self.draw_mode];
        self.network_width = element_properties.left_margin;
        $.each([
            {model: model.routers, type: 'router'},
            {model: model.servers, type: 'instance'}
        ], function (index, devices) {
            var type = devices.type;
            var model = devices.model;
            $.each(model, function (index, device) {
                device.type = type;
                device.ports = self.select_port(device.id);
                var hasports = (device.ports.length <= 0) ? false : true;
                device.parent_network = (hasports) ?
                    self.select_main_port(device.ports).network_id : self.model.networks[0].id;
            });
        });
        $.each(model.networks, function (index, network) {
            network.devices = [];
            $.each([model.routers, model.servers], function (index, devices) {
                $.each(devices, function (index, device) {
                    if (network.id === device.parent_network) {
                        network.devices.push(device);
                    }
                });
            });
        });
        self.group_same_topology(self, model.networks);
        $.each(model.networks, function (index, network) {
            if (self.draw_mode == 'small') {
                $.each(network.devices, function (index, device) {
                    var width = element_properties.port_margin * (device.ports.length - 1);
                    device.width =
                        (self.draw_mode === 'normal' && width > element_properties.device_width) ? width :
                            element_properties.device_width;
                    device.pos_x = self.network_width;
                    device.port_height =
                        (self.draw_mode === 'small' && width > device.width) ? 1 :
                            element_properties.port_height;
                    device.port_margin =
                        (self.draw_mode === 'small' && width > device.width) ?
                        device.width / device.ports.length :
                            element_properties.port_margin;
                    self.network_width += device.width + element_properties.margin;
                });
            } else {
                $.each(network.temp_group, function (index_a, devices) {
                    $.each(devices, function (index_b, device) {
                        if (device instanceof Array) {
                            self.default_temp_cols = self.default_cols;
                            if (self.default_rows * self.default_temp_cols > device.length) {
                                if (self.default_cols >= device.length) {
                                    self.default_temp_cols = (device.length % self.default_rows == 0) ?
                                        Math.floor(device.length / self.default_rows) :
                                        (Math.floor(device.length / self.default_rows) + 1);
                                } else {
                                    if (self.default_cols * self.default_rows > device.length) {
                                        self.default_temp_cols = ((device.length % self.default_rows) == 0 ) ?
                                            (Math.floor(device.length / self.default_rows)) :
                                            (Math.floor(device.length / self.default_rows) + 1);
                                    }
                                }
                            }
                            // 说明相同网络拓扑的数量超过默认的分组数量
                            $.each(device, function (index_c, info) {
                                var temp_pos_x = element_properties.margin;
                                var temp_pos_y = element_properties.margin;
                                var current_row = Math.floor(index_c / self.default_temp_cols);
                                var current_col = index_c % self.default_temp_cols;
                                info.width = element_properties.device_width;
                                info.height = element_properties.device_height;
                                temp_pos_x += current_col * (element_properties.device_width + element_properties.margin);
                                temp_pos_y += current_row * (element_properties.device_height + element_properties.margin);
                                info.pos_x = temp_pos_x;
                                info.pos_y = temp_pos_y;
                                info.port_height = element_properties.port_height;
                                info.port_margin = element_properties.port_margin;
                            });
                            var single_width = element_properties.device_width;
                            var single_height = element_properties.device_height;
                            device.width = element_properties.margin * (self.default_temp_cols + 1)
                                + self.default_temp_cols * single_width + 2 * element_properties.port_height;
                            // the last margin reserved for statistic data
                            device.height = self.default_rows * single_height
                                + (self.default_rows + 1) * element_properties.margin + element_properties.margin
                                + 2 * element_properties.port_height;
                            device.pos_x = self.network_width;
                            device.port_height = element_properties.port_height;
                            device.port_margin = element_properties.port_margin;
                            device.ports = device[0].ports;
                            device.parent_network = network.id;
                            device.type = device[0].type ? device[0].type : 'instance';
                            self.network_width += device.width + element_properties.margin;
                        } else {
                            $.each(devices, function (index, device) {
                                var width = element_properties.port_margin * (device.ports.length - 1);
                                device.width =
                                    (width > element_properties.device_width) ? width :
                                        element_properties.device_width;
                                device.height = element_properties.device_height;
                                device.pos_x = self.network_width;
                                device.port_height = element_properties.port_height;
                                device.port_margin = element_properties.port_margin;
                                self.network_width += device.width + element_properties.margin;
                            });
                        }
                    });
                });
            }
        });
        self.network_width += element_properties.left_margin;
        self.network_width = (self.network_width > element_properties.network_min_width) ?
            self.network_width : element_properties.network_min_width;
        self.draw_topology();
    },

    device_status: function (status) {
        if (status == 'ACTIVE') {
            return window.STATIC_URL + 'lenovo/img/topology/success.png';
        } else if (status == 'SHUTOFF') {
            return window.STATIC_URL + 'lenovo/img/topology/stop.png';
        } else if (status == 'ERROR') {
            return window.STATIC_URL + 'lenovo/img/topology/error.png';
        } else {
            return window.STATIC_URL + 'lenovo/img/topology/warning.png';
        }
    },

    device_image: function (image_name, device_type) {
        if (device_type == 'instance') {
            var image_arr = ['linux', 'centos', 'debian', 'redhat', 'ubuntu', 'suse', 'windows'];
            var result = window.STATIC_URL + 'lenovo/img/topology/linux.png';
            if (image_name && image_name.trim().length > 0) {
                for (var i = 0; i < image_arr.length; i++) {
                    var reg = new RegExp(image_arr[i], "gi");
                    if (reg.test(image_name)) {
                        result = window.STATIC_URL + 'lenovo/img/topology/' + image_arr[i] + '.png';
                    }
                }
                ;
            }
            return result;
        } else {
            return window.STATIC_URL + 'lenovo/img/topology/router.png';
        }
    },

    //draw grouped servers/routers
    draw_topology_group: function (element_properties, own, d) {
        var self = this;
        $.each(d, function (index_a, info) {
            if (info instanceof Array) {
                d3.select(own).append("g").attr('class', 'ports');
                d3.select(own).append("g").attr('class', 'texts')
                    .append('text').attr('class', 'name');
                d3.select(own).append("rect").attr('class', 'frame')
                    .attr('width', info.width)
                    .attr('height', info.height)
                    .style('fill', '#fff')
                    .style('stroke', function () {
                        return self.get_network_color(info.parent_network);
                    })
                    .style('stroke-width', info.port_height);
                d3.select(own).append("g").attr('class', 'image_status')
                    .append('image').attr('class', 'image');
                d3.select(own).select('.image_status').append('image').attr('class', 'status');
                var device_single = d3.select(own).selectAll("g.device-single").data(info);
                var device_single_enter = device_single.enter()
                    .append("g")
                    .attr('class', 'device-single')
                    .each(function (detail, j) {
                        var single_template = self[detail.type + '_tmpl']['normal'];
                        this.appendChild(d3.select(single_template).node().cloneNode(true));
                    });

                device_single_enter
                    .on('mouseenter', function (detail) {
                        var $this = $(this);
                        self.show_balloon(detail, $this);
                        d3.event.stopPropagation();
                    })
                    .on('click', function () {
                        d3.event.stopPropagation();
                    });

                device_single
                    .attr('id', function (detail) {
                        return 'id_' + detail.id;
                    })
                    .attr('transform', function (detail, i) {
                        return 'translate(' + detail.pos_x + ',' + detail.pos_y + ')';
                    })
                    .select('.frame')
                    .attr('width', function (detail) {
                        return detail.width;
                    })
                    .attr('height', function (detail) {
                        return detail.height;
                    });
                device_single
                    .select('.texts_bg')
                    .attr('y', function (detail) {
                        return element_properties.texts_bg_y + detail.height - element_properties.device_height;
                    });
                device_single
                    .select('.type')
                    .attr('y', function (detail) {
                        return element_properties.type_y + detail.height - element_properties.device_height;
                    });
                device_single
                    .select('.name')
                    .text(function (detail) {
                        return self.string_truncate(detail.name);
                    });
                device_single
                    .select('.image_status')
                    .select('.image')
                    .attr('xlink:href', function (detail) {
                        return self.device_image(detail.image_name, detail.type);
                    });
                device_single
                    .select('.image_status')
                    .select('.status')
                    .attr('xlink:href', function (detail) {
                        return self.device_status(detail.status);
                    });
                device_single.each(function (detail) {
                    if (detail.status === 'BUILD') {
                        d3.select(this).classed('loading', true);
                    } else if (detail.task === 'deleting') {
                        d3.select(this).classed('loading', true);
                        if ('bl_' + detail.id === self.balloon_id) {
                            self.delete_balloon();
                        }
                    } else {
                        d3.select(this).classed('loading', false);
                        if ('bl_' + detail.id === self.balloon_id) {
                            var $this = $(this);
                            self.show_balloon(detail, $this);
                        }
                    }
                });

                device_single.exit().each(function (detail) {
                    d3.event.stopPropagation();
                    if ('bl_' + detail.id === self.balloon_id) {
                        self.delete_balloon();
                    }
                }).remove();
                var statics_text = d3.select(own).append("text");
                statics_text
                    .on('click', function () {
                        if (info.type == 'instance') {
                            window.location.href = WEBROOT + 'project/instances/';
                        } else {
                            window.location.href = WEBROOT + 'project/routers/';
                        }
                    });
                if (info.more_flag) {
                    statics_text
                        .attr('class', 'viewAll btn')
                        .attr('x', element_properties.margin)
                        .attr('y', info.height - element_properties.margin)
                        .text(function () {
                            return gettext("View All") + "(" + info.origin_length + ")";
                        });
                } else {
                    statics_text
                        .attr('class', 'viewAll btn')
                        .attr('x', element_properties.margin)
                        .attr('y', info.height - element_properties.margin)
                        .text(function () {
                            return gettext("View Details");
                        });
                }
            } else {
                $.each(d, function (index_a, info) {
                    var device_template = self[info.type + '_tmpl'][self.draw_mode];
                    own.appendChild(d3.select(device_template).node().cloneNode(true));
                });
            }
        });
    },

    draw_topology: function () {
        var self = this;
        $('g.network').remove();
        $(self.svg_container).spin(false);
        $(self.svg_container).removeClass('noinfo');
        if (self.model.networks.length <= 0) {
            $('g.network').remove();
            $(self.svg_container).addClass('noinfo');
            return;
        }
        var svg = d3.select(self.svg);
        var element_properties = self.element_properties[self.draw_mode];
        svg
            .attr('height', self.model.networks.length * (element_properties.network_spacing))
            .attr('width', self.network_width);

        var network = svg.selectAll('g.network')
            .data(self.model.networks);

        var network_enter = network.enter()
            .append('g')
            .attr('class', 'network')
            .each(function (d, i) {
                this.appendChild(d3.select(self.network_tmpl[self.draw_mode]).node().cloneNode(true));
                var $this = d3.select(this).select('.network-rect');
                if (d.url) {
                    $this
                        .on('mouseover', function () {
                            $this.transition().style('fill', function () {
                                return d3.rgb(self.get_network_color(d.id)).brighter(0.5);
                            });
                        })
                        .on('mouseout', function () {
                            $this.transition().style('fill', function () {
                                return self.get_network_color(d.id);
                            });
                        })
                        .on('click', function () {
                            window.location.href = d.url;
                        });
                } else {
                    $this.classed('nourl', true);
                }
            });

        network
            .attr('id', function (d) {
                return 'id_' + d.id;
            })
            .attr('transform', function (d, i) {
                return 'translate(' + 0 + ',' + element_properties.network_spacing * i + ')';
            })
            .select('.network-rect')
            .attr('width', function (d) {
                return self.network_width;
            })
            .attr('height', self.fa_globe_glyph_width)
            .style('fill', function (d) {
                return self.get_network_color(d.id);
            });
        network
            .select('.network-name')
            .attr('x', function (d) {
                return self.network_width / 2;
            })
            .text(function (d) {
                return d.name;
            });
        network
            .select('.network-cidr')
            .attr('x', function (d) {
                var padding = isExternalNetwork(d) ? self.fa_globe_glyph_width : 0;
                return self.network_width - self.element_properties.cidr_margin -
                    padding;
            })
            .text(function (d) {
                var cidr = $.map(d.subnets, function (n, i) {
                    return n.cidr;
                });
                return cidr.join(', ');
            });
        function isExternalNetwork(d) {
            return d['router:external'];
        }

        network
            .select('.network-type')
            .text(function (d) {
                return isExternalNetwork(d) ? self.fa_globe_glyph : '';
            })
            .attr('x', function (d) {
                return self.network_width - self.element_properties.cidr_margin;
            });

        $('[data-toggle="tooltip"]').tooltip({container: 'body'});

        network.exit().remove();

        var device = network.selectAll('g.device')
            .data(function (d) {
                if (self.draw_mode == 'small') {
                    return d.devices;
                } else {
                    return d.temp_group;
                }
            });

        var device_enter = device.enter()
            .append("g")
            .attr('class', 'device')
            .each(function (d, i) {
                if (self.draw_mode == 'small') {
                    var device_template = self[d.type + '_tmpl'][self.draw_mode];
                    this.appendChild(d3.select(device_template).node().cloneNode(true));
                } else {
                    var own = this;
                    self.draw_topology_group(element_properties, own, d);
                }
            });

        if (self.draw_mode == 'small') {
            device_enter
                .on('mouseenter', function (d) {
                    var $this = $(this);
                    self.show_balloon(d, $this);
                })
                .on('click', function () {
                    d3.event.stopPropagation();
                });
            device
                .attr('id', function (d) {
                    return 'id_' + d.id;
                })
                .attr('transform', function (d, i) {
                    return 'translate(' + d.pos_x + ',' + element_properties.device_y + ')';
                })
                .select('.frame')
                .attr('width', function (d) {
                    return d.width;
                });

            device
                .select('.name')
                .text(function (d) {
                    return self.string_truncate(d.name);
                });

            device.each(function (d) {
                if (d.status === 'BUILD') {
                    d3.select(this).classed('loading', true);
                } else if (d.task === 'deleting') {
                    d3.select(this).classed('loading', true);
                    if ('bl_' + d.id === self.balloon_id) {
                        self.delete_balloon();
                    }
                } else {
                    d3.select(this).classed('loading', false);
                    if ('bl_' + d.id === self.balloon_id) {
                        var $this = $(this);
                        self.show_balloon(d, $this);
                    }
                }
            });

            device.exit().each(function (d) {
                if ('bl_' + d.id === self.balloon_id) {
                    self.delete_balloon();
                }
            }).remove();
            var port = device.select('g.ports')
                .selectAll('g.port')
                .data(function (d) {
                    return d.ports;
                });

            var port_enter = port.enter()
                .append('g')
                .attr('class', 'port')
                .attr('id', function (d) {
                    return 'id_' + d.id;
                });

            port_enter
                .append('line')
                .attr('class', 'port_line');

            port_enter
                .append('text')
                .attr('class', 'port_text');

            device.select('g.ports').each(function (d, i) {
                this._portdata = {};
                this._portdata.ports_length = d.ports.length;
                this._portdata.parent_network = d.parent_network;
                this._portdata.device_width = d.width;
                this._portdata.port_height = d.port_height;
                this._portdata.port_margin = d.port_margin;
                this._portdata.left = 0;
                this._portdata.right = 0;
                $(this).mouseenter(function (e) {
                    e.stopPropagation();
                });
            });

            port.each(function (d, i) {
                var index_diff = self.get_network_index(this.parentNode._portdata.parent_network) -
                    self.get_network_index(d.network_id);
                this._index_diff = index_diff = (index_diff >= 0) ? ++index_diff : index_diff;
                this._direction = (this._index_diff < 0) ? 'right' : 'left';
                this._index = this.parentNode._portdata[this._direction]++;

            });

            port.attr('transform', function (d, i) {
                var y = (this._direction === 'left') ? 0 : element_properties.device_height;
                var ports_length = this.parentNode._portdata[this._direction];
                var distance = this.parentNode._portdata.port_margin;
                var x = (this.parentNode._portdata.device_width -
                    (ports_length - 1) * distance) / 2 + this._index * distance;
                return 'translate(' + x + ',' + y + ')';
            });

            port
                .select('.port_line')
                .attr('stroke-width', function (d, i) {
                    return this.parentNode.parentNode._portdata.port_height;
                })
                .attr('stroke', function (d, i) {
                    return self.get_network_color(d.network_id);
                })
                .attr('x1', 0).attr('y1', 0).attr('x2', 0)
                .attr('y2', function (d, i) {
                    var parent = this.parentNode;
                    var width = (Math.abs(parent._index_diff) - 1) * element_properties.network_spacing +
                        element_properties.port_width;
                    return (parent._direction === 'left') ? -1 * width : width;
                });

            port
                .select('.port_text')
                .attr('y', function (d) {
                    var parent = this.parentNode;
                    if (parent._direction === 'left') {
                        d3.select(this).classed('left', true);
                        return element_properties.port_text_margin.y * -1 + this.parentNode._index_diff * element_properties.port_margin;
                    } else {
                        d3.select(this).classed('left', false);
                        return element_properties.port_text_margin.y - this.parentNode._index_diff * element_properties.port_margin;
                    }
                })
                .attr('x', function (d) {
                    return element_properties.port_text_margin.x;
                })
                .text(function (d) {
                    var ip_label = [];
                    $.each(d.fixed_ips, function () {
                        ip_label.push(this.ip_address);
                    });
                    return ip_label.join(',');
                });

            port.exit().remove();
        } else {
            device_enter
                .on('mouseenter', function (d) {
                    var $this = $(this);
                    var arr = [];
                    $.each(d, function (index, info) {
                        arr.push(info);
                    });
                    if (arr.length == 1) {
                        if (!(arr[0] instanceof Array)) {
                            self.show_balloon(arr[0], $this);
                        }
                    }
                })
                .on('click', function () {
                    d3.event.stopPropagation();
                });
            device
                .attr('id', function (d) {
                    var arr = [];
                    var temp_id = 'id_';
                    $.each(d, function (index, info) {
                        arr.push(info);
                    });
                    if (arr.length == 1) {
                        temp_id += (arr[0].id != null && arr[0].id != '') ? arr[0].id : '';
                    }
                    return temp_id;
                })
                .attr('transform', function (d, i) {
                    var arr = [];
                    var pos_x = 0;
                    $.each(d, function (index, info) {
                        arr.push(info);
                    });
                    if (arr.length == 1) {
                        if (arr[0] instanceof Array) {
                            pos_y = element_properties.device_group_y;
                        } else {
                            pos_y = element_properties.device_y;
                        }
                        pos_x = arr[0].pos_x;
                    }
                    return 'translate(' + pos_x + ',' + pos_y + ')';
                })
                .select('.frame')
                .attr('width', function (d) {
                    var arr = [];
                    var width = 0;
                    $.each(d, function (index, info) {
                        arr.push(info);
                    });
                    if (arr.length == 1) {
                        width = arr[0].width;
                    }
                    return width;
                });

            device
                .select('.name')
                .text(function (d) {
                    var arr = [];
                    var name = '';
                    $.each(d, function (index, info) {
                        if (!(info instanceof Array)) {
                            arr.push(info);
                        }
                    });
                    if (arr.length == 1) {
                        name = arr[0].name;
                    }
                    return self.string_truncate(name);
                });

            var image_status = device.select('.image_status');

            image_status
                .select('.image')
                .attr('xlink:href', function (d) {
                    var arr = [];
                    $.each(d, function (index, info) {
                        arr.push(info);
                    });
                    if (arr.length == 1) {
                        if (!(arr[0] instanceof Array)) {
                            return self.device_image(arr[0].image_name, arr[0].type);
                        }
                    }
                });

            image_status
                .select('.status')
                .attr('xlink:href', function (d) {
                    var arr = [];
                    $.each(d, function (index, info) {
                        arr.push(info);
                    });
                    if (arr.length == 1) {
                        if (!(arr[0] instanceof Array)) {
                            return self.device_status(arr[0].status);
                        }
                    }
                });

            device.each(function (d) {
                var arr = [];
                $.each(d, function (index, info) {
                    arr.push(info);
                });
                if (arr.length == 1) {
                    if (arr[0].status === 'BUILD') {
                        d3.select(this).classed('loading', true);
                    } else if (arr[0].task === 'deleting') {
                        d3.select(this).classed('loading', true);
                        if ('bl_' + arr[0].id === self.balloon_id) {
                            self.delete_balloon();
                        }
                    } else {
                        d3.select(this).classed('loading', false);
                        if ('bl_' + arr[0].id === self.balloon_id) {
                            var $this = $(this);
                            self.show_balloon(arr[0], $this);
                        }
                    }
                }
            });

            device.exit().each(function (d) {
                var arr = [];
                $.each(d, function (index, info) {
                    arr.push(info);
                });
                if (arr.length == 1) {
                    if (!(arr[0] instanceof Array)) {
                        if ('bl_' + arr[0].id === self.balloon_id) {
                            self.delete_balloon();
                        }
                    }
                }
            }).remove();

            var port = device.select('g.ports')
                .selectAll('g.port')
                .data(function (d) {
                    var ports = [];
                    var result = [];
                    $.each(d, function (index, info) {
                        ports.push(info);
                    });
                    if (ports.length == 1) {
                        result = ports[0].ports;
                    }
                    return result;
                });

            var port_enter = port.enter()
                .append('g')
                .attr('class', 'port')
                .attr('id', function (d) {
                    return 'id_' + d.id;
                });

            port_enter
                .append('line')
                .attr('class', 'port_line');

            port_enter
                .append('text')
                .attr('class', 'port_text');

            device.select('g.ports').each(function (d, i) {
                var arr = [];
                $.each(d, function (index, info) {
                    arr.push(info);
                });
                if (arr.length == 1) {
                    if (arr[0] instanceof Array) {
                        this._group_status = true;
                    } else {
                        this._group_status = false;
                    }
                    this._portdata = {};
                    this._portdata.ports_length = arr[0].ports.length;
                    this._portdata.parent_network = arr[0].parent_network;
                    this._portdata.device_width = arr[0].width;
                    this._portdata.device_height = arr[0].height;
                    this._portdata.port_height = arr[0].port_height;
                    this._portdata.port_margin = arr[0].port_margin;
                    this._portdata.left = 0;
                    this._portdata.right = 0;
                }
                $(this).mouseenter(function (e) {
                    e.stopPropagation();
                });
            });

            port.each(function (d, i) {
                var index_diff = self.get_network_index(this.parentNode._portdata.parent_network) -
                    self.get_network_index(d.network_id);
                this._index_diff = index_diff = (index_diff >= 0) ? ++index_diff : index_diff;
                this._direction = (this._index_diff < 0) ? 'right' : 'left';
                this._index = this.parentNode._portdata[this._direction]++;

            });

            port.attr('transform', function (d, i) {
                var y = (this._direction === 'left') ? 0 : this.parentNode._portdata.device_height;
                var ports_length = this.parentNode._portdata[this._direction];
                var distance = this.parentNode._portdata.port_margin;
                var x = (this.parentNode._portdata.device_width -
                    (ports_length - 1) * distance) / 2 + this._index * distance;
                return 'translate(' + x + ',' + y + ')';
            });

            port
                .select('.port_line')
                .attr('stroke-width', function (d, i) {
                    return this.parentNode.parentNode._portdata.port_height;
                })
                .attr('stroke', function (d, i) {
                    return self.get_network_color(d.network_id);
                })
                .attr('x1', 0).attr('y1', 0).attr('x2', 0)
                .attr('y2', function (d, i) {
                    var parent = this.parentNode;
                    var width = 0;
                    if (parent.parentNode._group_status) {
                        width = (Math.abs(parent._index_diff) - 1) * element_properties.network_spacing +
                            element_properties.port_group_width;
                    } else {
                        width = (Math.abs(parent._index_diff) - 1) * element_properties.network_spacing +
                            element_properties.port_width;
                    }
                    return (parent._direction === 'left') ? -1 * width : width;
                });

            port
                .select('.port_text')
                .attr('y', function (d) {
                    var parent = this.parentNode;
                    if (parent._direction === 'left') {
                        d3.select(this).classed('left', true);
                        return element_properties.port_text_margin.y * -1 + this.parentNode._index_diff * element_properties.port_margin;
                    } else {
                        d3.select(this).classed('left', false);
                        return element_properties.port_text_margin.y - this.parentNode._index_diff * element_properties.port_margin;
                    }
                })
                .attr('x', function (d) {
                    return element_properties.port_text_margin.x;
                })
                .text(function (d) {
                    //if (!this.parentNode.parentNode._group_status) {
                    //    var ip_label = [];
                    //    $.each(d.fixed_ips, function () {
                    //        ip_label.push(this.ip_address);
                    //    });
                    //    return ip_label.join(',');
                    //}
                });

            port.exit().remove();
        }
    },
    get_network_color: function (network_id) {
        return this.color(this.get_network_index(network_id));
    },
    get_network_index: function (network_id) {
        return this.network_index[network_id];
    },
    select_port: function (device_id) {
        return $.map(this.model.ports, function (port, index) {
            if (port.device_id === device_id) {
                return port;
            }
        });
    },
    select_network: function (network_id) {
        return $.map(model.networks, function (network, index) {
            if (network.id === network_id) {
                return network;
            }
        });
    },
    //select main network-place for device
    select_main_port: function (ports) {
        var _self = this;
        var main_port_index = 0;
        var MAX_INT = 4294967295;
        var min_port_length = MAX_INT;
        $.each(ports, function (index, port) {
            var port_length = _self.sum_port_length(port.network_id, ports);
            if (port_length < min_port_length) {
                min_port_length = port_length;
                main_port_index = index;
            }
        });
        return ports[main_port_index];
    },
    sum_port_length: function (network_id, ports) {
        var self = this;
        var sum_port_length = 0;
        //base_index start from 0
        var base_index = self.get_network_index(network_id);
        $.each(ports, function (index, port) {
            var temp_index = self.get_network_index(port.network_id);
            if (!temp_index) {
                temp_index = 0
            }
            sum_port_length += base_index - temp_index;
        });
        return sum_port_length;
    },
    string_truncate: function (string) {
        var self = this;
        var str = string;
        var max_size = self.element_properties.device_name_max_size;
        var suffix = self.element_properties.device_name_suffix;
        var bytes = 0;
        for (var i = 0; i < str.length; i++) {
            bytes += str.charCodeAt(i) <= 255 ? 1 : 2;
            if (bytes > max_size) {
                str = str.substr(0, i) + suffix;
                break;
            }
        }
        return str;
    },
    delete_device: function (type, device_id) {
        var self = this;
        var message = {id: device_id};
        self.post_message(device_id, type, message);
    },
    delete_port: function (router_id, port_id) {
        var self = this;
        var message = {id: port_id};
        self.post_message(port_id, 'router/' + router_id + '/', message);
    },
    show_balloon: function (d, element) {
        var self = this;
        var element_properties = self.element_properties[self.draw_mode];
        if (self.balloon_id) {
            self.delete_balloon();
        }
        var balloon_tmpl = self.balloon_tmpl;
        var device_tmpl = self.balloon_device_tmpl;
        var port_tmpl = self.balloon_port_tmpl;
        var balloon_id = 'bl_' + d.id;
        var ports = [];
        $.each(d.ports, function (i, port) {
            var object = {};
            object.id = port.id;
            object.router_id = port.device_id;
            object.url = port.url;
            object.port_status = self.portStatus[port.status];
            object.port_status_css = (port.status === "ACTIVE") ? 'active' : 'down';
            var ip_address = '';
            try {
                ip_address = port.fixed_ips[0].ip_address;
            } catch (e) {
                ip_address = gettext('None');
            }
            var device_owner = '';
            try {
                device_owner = port.device_owner.replace('network:', '');
            } catch (e) {
                device_owner = gettext('None');
            }
            object.ip_address = ip_address;
            object.device_owner = device_owner;
            object.is_interface = (device_owner === 'router_interface');
            ports.push(object);
        });
        var html_data = {
            balloon_id: balloon_id,
            id: d.id,
            //url: d.url,
            name: d.name,
            type: d.type,
            delete_label: gettext("Delete"),
            status: self.deviceStatus[d.status],
            status_class: (d.status === "ACTIVE") ? 'active' : 'down',
            status_label: gettext("STATUS"),
            id_label: gettext("ID"),
            interfaces_label: gettext("Interfaces"),
            delete_interface_label: gettext("Delete Interface"),
            open_console_label: gettext("Open Console"),
            view_details_label: gettext("View Details")
        };
        if (d.type === 'router') {
            html_data.delete_label = gettext("Delete Router");
            html_data.view_details_label = gettext("View Router Details");
            html_data.port = ports;
            html_data.add_interface_url = d.url + 'addinterface';
            html_data.add_interface_label = gettext("Add Interface");
            html_data.show_detail_url = WEBROOT + 'project/routers/#/'+ d.id;
            html = balloon_tmpl.render(html_data, {
                table1: device_tmpl,
                table2: (ports.length > 0) ? port_tmpl : null
            });
        } else if (d.type === 'instance') {
            html_data.delete_label = gettext("Terminate Instance");
            html_data.view_details_label = gettext("View Instance Details");
            html_data.console_id = d.id;
            html_data.console = d.console;
            html_data.show_detail_url = WEBROOT + 'project/instances/#/'+ d.id;
            html = balloon_tmpl.render(html_data, {
                table1: device_tmpl
            });
        } else {
            return;
        }
        $(self.svg_container).append(html);
        var device_position = element.find('.frame');
        var collapsed = $.cookie('nav_collapse');
        var x = device_position.position().left +
            element_properties.device_width +
            element_properties.balloon_margin.x;
        if (collapsed) {
            x -= self.sidebar_width['collapsed'];
        }else {
            x -= self.sidebar_width['expand'];
        }
        var y =device_position.position().top +
            element_properties.balloon_margin.y- element_properties.device_height/2;
        $('#' + balloon_id).css({
            'left': x + 'px',
            'top': y + 'px'
        })
            .show();
        var $balloon = $('#' + balloon_id);
        if ($balloon.offset().left + $balloon.outerWidth() > $(window).outerWidth()) {
            $balloon
                .css({
                    'left': 0 + 'px'
                })
                .css({
                    'left': (device_position.position().left - $balloon.outerWidth() -
                    element_properties.balloon_margin.x + 'px')
                })
                .addClass('leftPosition');
        }
        $balloon.find('.delete-device').click(function (e) {
            var $this = $(this);
            $this.prop('disabled', true);
            d3.select('#id_' + $this.data('device-id')).classed('loading', true);
            self.delete_device($this.data('type'), $this.data('device-id'));
        });
        $balloon.find('.delete-port').click(function (e) {
            var $this = $(this);
            self.delete_port($this.data('router-id'), $this.data('port-id'));
        });
        self.balloon_id = balloon_id;
    },
    delete_balloon: function () {
        var self = this;
        if (self.balloon_id) {
            $('#' + self.balloon_id).remove();
            self.balloon_id = null;
        }
    },
    post_message: function (id, url, message) {
        var self = this;
        var iframe_id = 'ifr_' + id;
        var iframe = $('<iframe width="500" height="300" />')
            .attr('id', iframe_id)
            .attr('src', url)
            .appendTo(self.post_messages);
        iframe.on('load', function () {
            $(this).get(0).contentWindow.postMessage(
                JSON.stringify(message, null, 2), '*');
        });
    },
    delete_post_message: function (id) {
        $('#' + id).remove();
    }
};



