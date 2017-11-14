#
# Copyright 2015 Easystack <bo.wang@easystack.cn>
# Created on 2015-08-25

from easystack_dashboard.api.onlinepay import OnlinePay
import apis


class AliPay(OnlinePay):

    def get_pay_url(self, billing_trade_no, pay_value, subject, desc):
        return apis.create_direct_pay_by_user(billing_trade_no,
                                              subject,
                                              desc,
                                              pay_value)

    def handle_reponse(self, request, data, notify_type):
        if apis.notify_verify(data):
            trade_status = data.get('trade_status')
            if trade_status in ['TRADE_SUCCESS', 'TRADE_FINISHED']:
                tn = data.get('out_trade_no')
                amount = float(data.get('total_fee'))
                return self.verify_update_payment(request, tn, amount, notify_type)
        return self.error(notify_type)