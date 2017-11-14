/**
 * Copyright 2015 EasyStack Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

(function(){
'use strict';

angular.module('hz.dashboard.project.instance_firewall')
    .directive('editRulesRow', ['horizon.openstack-service-api.security-group', 'SecurityRuleCreateAction',
        function(securityAPI, SecurityRuleCreateAction) {
            return {
                restrict: 'A',
                scope: {
                    editRulesRow: '@',
                    duration: '@'
                },
                link: linkRules,
            };

            function portRangeConvertToString(min, max) {
                var oPortString;
                if (min == null || max == null) {
                    oPortString = gettext('Any');
                }
                else if (min == max) {
                    oPortString = min;
                }
                else {
                    oPortString = min + ' - ' + max;
                }
                return oPortString;
            }
            function transDirection(value) {
                if (value =='ingress') {
                    return gettext('ingress');
                }else if (value == 'egress') {
                    return gettext('egress');
                }else {
                    return gettext('ingress');
                }
            }
            function nullToString(value) {
                return (value == null) ? gettext('Any') : value;
            }
            function remoteToString(remote_ip_prefix, remote_group_name) {
              var remote = ' - ';
                if (remote_ip_prefix != null){
                    remote = gettext('CIDR') + ': ' + remote_ip_prefix;
                }
                if (remote_group_name != null){
                    remote = gettext('Security Groups') + ': ' + remote_group_name;
                }
                return remote;
            }

            function initRulesBtnsEvents(scope){
                if(document.listening)
                    return;
                document.listening = true;

                $(document).on('click', '.js-security-box .js-delect-iconbt', function(){
                    var securityId = $(this).attr('data-delectId');
                    var securityTr = $(this).closest('tr');
                    securityAPI.deleteSecurityGroupRule(securityId).success(function(response){
                        securityTr.remove();
                    });
                });

                $(document).on('click', '.js-ruleCreate-btn', function(){
                    var oRule = new SecurityRuleCreateAction(scope);
                    oRule.open({dataIndex:$(this).closest('.detail-row').attr('data-index'), dataInstanceId:$(this).closest('.detail-row').attr('data-instanceId')});
                });
            }

            // join the rules as a table.
            // @TODO(lzm): this needs to be moved into an html file.
            function renderRulesTable(data){
                var eleTableBody = "";
                for(var i=0; i<data.security_group_rules.length; i++){
                    var rule = data.security_group_rules[i];
                    eleTableBody +=
                        '<tr>' +
                          '<td eagle-eye="data_col">'+transDirection(rule.direction) +'</td>' +
                          '<td eagle-eye="data_col">'+nullToString(rule.ethertype)+'</td>' +
                          '<td eagle-eye="data_col">'+nullToString(rule.protocol)+'</td>' +
                          '<td eagle-eye="data_col">'+portRangeConvertToString(rule.port_range_min, rule.port_range_max)+'</td>' +
                          '<td eagle-eye="data_col">'+remoteToString(rule.remote_ip_prefix, rule.remote_group_name)+'</td>' +
                          '<td class="delect-icon-bt" eagle-eye="data_col"><i eagle-eye="delete_rule_button" class="js-delect-iconbt delect-iconbt" data-delectId="'+rule.id+'"></i></td>' +
                       '</tr>';
                }

                var eleTable =
                    '<table class="table table-bordered table-hover modern js-security-box">'+
                      '<thead>'+
                        '<tr><th colspan="100" class="bare" eagle-eye="data_col">'+
                          '<div class="clearfix">'+
                            '<div class="table_actions">'+
                              '<button class="btn btn-primary btn-action js-ruleCreate-btn">'+
                                '<i class="icon icon-add"></i>'+
                                ' <span eagle-eye="add_rule_button" class="ng-scope">'+gettext('Add Rule')+'</span>'+
                              '</button>'+
                            '</div>'+
                          '</div>'+
                        '</th></tr>'+
                        '<tr>'+
                          '<th eagle-eye="data_col">'+gettext("Direction")+'</th>'+
                          '<th eagle-eye="data_col">'+gettext("Ether Type")+'</th>'+
                          '<th eagle-eye="data_col">'+gettext("IP Protocol")+'</th>'+
                          '<th eagle-eye="data_col">'+gettext("Port Range")+'</th>'+
                          '<th eagle-eye="data_col">'+gettext("Remote")+'</th>'+
                          '<th eagle-eye="data_col">'+gettext("Actions")+'</th>'+
                        '</tr>'+
                      '</thead>'+
                      '<tbody>'+eleTableBody+'</tbody>'+
                    '</table>';
                return eleTable;
            } // end of renderRulesTable

            function linkRules(scope, element, attr) {
                function onClickDetails() {
                    var iconClasses = "chevron-right chevron-down";
                    element.toggleClass(iconClasses);
                    var summaryRow = element.closest('tr');
                    var detailCell = summaryRow.next('tr').find('.detail');
                    scope.newRule = {};
                    var duration = scope.duration ? parseInt(scope.duration) : 100;

                    detailCell.find('.detail-expanded').prepend('<img class="load-detail" src="/static/bootstrap/img/load.gif"  alt="" />');

                    if(!summaryRow.attr('data-editRules')){
                        summaryRow.attr('data-editRules', true);
                        // load rules data
                        securityAPI.getSecurityGroup(attr.editRulesRow).success(function(response){
                            var table = renderRulesTable(response);
                            detailCell.find('.detail-expanded').html(table);
                        });
                    }else{
                        detailCell.find('.detail-expanded').find('.load-detail').remove();
                    }

                    if (summaryRow.hasClass('expanded')) {
                        var options = {
                            duration: duration,
                            complete: function() {
                                summaryRow.toggleClass('expanded');
                            }
                        };

                        detailCell.find('.detail-expanded').slideUp(options);
                    } else {
                        summaryRow.toggleClass('expanded');

                        detailCell.find('.detail-expanded').slideDown(duration);
                    }
                } // end of onClickDetails

                element.on('click', onClickDetails);
                initRulesBtnsEvents(scope);
            } // end of linkRules

    }])

    .directive('switclableRule', function(){
        return {
            restrict: 'A',
            scope: true,
            link:function(scope, element, attr){
                element.on('click', 'li', function(){
                    element.find('li').removeClass('active');
                    $(this).addClass('active').siblings();
                    var securityRule = scope.SecurityGroupRules[$(this).attr('data-value')];
                    manageScopeInput(scope,securityRule);
                    var aShowBox = $(this).attr('data-show').split(',');
                    var GameRules = scope.GameRules;
                    for(var rule in GameRules){
                        GameRules[rule] = false;
                    }
                    for(var i=0; i<aShowBox.length; i++){
                        GameRules[aShowBox[i]] = true;
                    }
                    scope.$digest();
                    function manageScopeInput(scope,securityRule){
                      scope.securityRule.rule_menu = securityRule.ip_protocol;
                      scope.securityRule.from_port = securityRule.from_port;
                      scope.securityRule.to_port = securityRule.to_port;
                      scope.securityRule.port = securityRule.port;
                      // set to initial val
                      scope.securityRule.direction = '';
                      scope.securityRule.port_or_range = '';
                      scope.securityRule.remote = '';
                      if(scope.form.direction){
                        scope.form.direction.$dirty = false;
                      }
                      if(scope.form.port_or_range){
                        scope.form.port_or_range.$dirty = false;
                      }
                      if(scope.form.remote){
                        scope.form.remote.$dirty =false;
                      }
                    }
                });
            }
        };
    })
;

})();

