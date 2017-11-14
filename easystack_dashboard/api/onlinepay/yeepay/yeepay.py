#
# Copyright 2015 Easystack <bo.wang@easystack.cn>
# Created on 2015-08-25

from easystack_dashboard.api.onlinepay import OnlinePay
import apis


class YeePay(OnlinePay):

    def get_pay_url(self, billing_trade_no, pay_value, subject, desc):
        return apis.getPayURL({"p2_Order": billing_trade_no,
                               "p3_Amt": pay_value,
                               "p6_Pcat": subject,
                               "p7_Pdesc": desc})

    def handle_reponse(self, request, data, notify_type):
        key_list = ["p1_MerId", "r0_Cmd", "r1_Code", "r2_TrxId", "r3_Amt", "r4_Cur",
                    "r5_Pid", "r6_Order", "r7_Uid", "r8_MP", "r9_BType"]
        valueArray = [data.get(key) for key in key_list]
        trade_status = int(data.get('r1_Code'))
        if apis.verifyCallbackHmac(valueArray, data.get('hmac')) and trade_status:
            tn = data.get('r6_Order')
            amount = float(data.get('r3_Amt'))
            return self.verify_update_payment(request, tn, amount, notify_type)
        return self.error(notify_type)
