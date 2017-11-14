(function() {
  'use strict';

  angular.module('hz.dashboard.project.billing')
  
  .directive('payWayToggleRadiu', function(){
      
       return {
            restrict: 'A',
            scope: {
                rePayid: '@?',
                invcodepay: '=?',
                chargeEnable: '=?'
            },
            link: function(scope, element, attrs){
                    element.find('li').on('click', function(){
                        $(this).addClass(attrs.payWayToggleRadiu).siblings('li').removeClass(attrs.payWayToggleRadiu);
                        if( $(this).attr('data-value') == 'invcode'){
                            scope.$apply(scope.invcodepay=true);
                        }else{
                            scope.$apply(scope.invcodepay=false);
                        }
                        if(scope.rePayid){
                            $('#'+scope.rePayid).val('');
                            $('.js-tooltip').addClass('none');
                            $('#pay-recharge').removeAttr('style');
                            scope.$apply(scope.chargeEnable=false);
                        }
                    });
            }
       };  
      
  })
  .directive('historyItemsDetail', ['horizon.openstack-service-api.billing', function(billingAPI) {
        
        return {
            restrict:'A',
            link: function(scope, element, attrs){
                element.on('click', function(){
                    var seft = $(this);
                    var summaryRow = element.closest('tr');
                    if(summaryRow.next('.detail-row-dis').length){
                        if(summaryRow.hasClass('hasCla')){
                            summaryRow.next('.detail-row-dis').find('.detail-expanded').slideUp('slow');
                            summaryRow.toggleClass('hasCla');
                        }else{
                            summaryRow.next('.detail-row-dis').find('.detail-expanded').slideDown('slow');
                            summaryRow.toggleClass('hasCla');
                        }
                    }else{
                        billingAPI.getBillingItem(attrs.historyItemsDetail).success(function(data){
                            var detailList = data.items;
                            summaryRow.addClass('hasCla');
                            if(!seft.attr('detail')){
                                seft.attr('detail', true);
                                var tr = "";
                                for(var i=0; i<detailList.length; i++){
                                    tr+='<tr><td>'+detailList[i].charge_fee+'</td><td>'+detailList[i].charge_from+'</td><td>'+detailList[i].charge_to+'</td><td>'+detailList[i].id+'</td><td>'+detailList[i].product_id+'</td></tr>';
                                }
                                var ele = '<tr class="detail-row-dis">\
                                               <td class="detail" colspan="100" style="padding:0;">\
                                               <div class="detail-expanded">\
                                                <table class="table">\
                                                    <tbody>'+tr+'</tbody>\
                                                </table>\
                                               </div>\
                                               </td>\
                                           </tr>';
                                summaryRow.after(ele);
                                setTimeout(function(){
                                    summaryRow.next('.detail-row-dis').find('.detail-expanded').slideDown('slow');
                                }, 400);
                            }
                        });
                    }
                });
            }
        };
        
  }])
  ;

})();