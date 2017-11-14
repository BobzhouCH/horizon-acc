# -*- coding: utf-8 -*-
#
# Copyright 2015 Easystack <bo.wang@easystack.cn>
# Created on 2015-08-25

import copy
import digestUtil
import httpUtils
import sys
reload(sys)
sys.setdefaultencoding("utf-8")
import urllib

from django.conf import settings

config_files = {"p1_MerId": getattr(settings, 'YEEPAY_ID', None),
                "p8_Url": getattr(settings, 'YEEPAY_RETURN_URL', None),
                "keyValue": getattr(settings, 'YEEPAY_KEY', None),
                "requestURL": getattr(settings, 'YEEPAY_REQUEST_URL', None)
                }

default_params = {"p0_Cmd": "Buy",
                  "p4_Cur": "CNY",
                  "p5_Pid": "Test",
                  "p6_Pcat": "Recharge",
                  "p8_Url": "http://localhost:7080/WY/callback.jsp",
                  "p9_SAF": "0",
                  "pa_MP": None,
                  "pd_FrpId": None,
                  "pr_NeedResponse": "0"}


def formatString(text):
    if text == None:
        return ""
    else:
        return text.strip()


def getOnePar(parName):
    return config_files[parName]


def fillNoneKey(keyName, params):
    if keyName in params.keys():
        return params[keyName]
    else:
        return None


def getPayURL(kargs):
    print "#### getPayURL() ####"
    params = copy.deepcopy(default_params)
    params.update(kargs)
    p0_Cmd = formatString(params["p0_Cmd"])
    p1_MerId = getOnePar("p1_MerId")
    p2_Order = formatString(params["p2_Order"])
    p3_Amt = formatString(params["p3_Amt"])
    p4_Cur = formatString(params["p4_Cur"])
    p5_Pid = formatString(params["p5_Pid"])
    p6_Pcat = formatString(params["p6_Pcat"])  # 商品种类
    p7_Pdesc = formatString(params["p7_Pdesc"])  # 商品描述
    p8_Url = formatString(params["p8_Url"])
    if getOnePar("p8_Url"):
        p8_Url = getOnePar("p8_Url")
    p9_SAF = formatString(params["p9_SAF"])
    pa_MP = formatString(params["pa_MP"])
    pd_FrpId = formatString(params["pd_FrpId"])

    pm_Period = formatString(fillNoneKey("pm_Period", params))
    pn_Unit = formatString(fillNoneKey("pn_Unit", params))
    pr_NeedResponse = formatString(params["pr_NeedResponse"])
    pt_UserName = formatString(fillNoneKey("pt_UserName", params))
    pt_PostalCode = formatString(fillNoneKey("pt_PostalCode", params))
    pt_Address = formatString(fillNoneKey("pt_Address", params))
    pt_TeleNo = formatString(fillNoneKey("pt_TeleNo", params))
    pt_Mobile = formatString(fillNoneKey("pt_Mobile", params))
    pt_Email = formatString(fillNoneKey("pt_Email", params))
    keyValue = getOnePar("keyValue")

    strArr = [p0_Cmd, p1_MerId, p2_Order, p3_Amt, p4_Cur, p5_Pid, p6_Pcat, p7_Pdesc,
              p8_Url, p9_SAF, pa_MP, pd_FrpId, pm_Period, pn_Unit, pr_NeedResponse,
              pt_UserName, pt_PostalCode, pt_Address, pt_TeleNo, pt_Mobile, pt_Email]
    hmac = digestUtil.getHmac(strArr, keyValue)

    try:
        p0_Cmd = p0_Cmd.decode("utf-8").encode("gbk")
        p1_MerId = p1_MerId.decode("utf-8").encode("gbk")
        p2_Order = p2_Order.decode("utf-8").encode("gbk")
        p3_Amt = p3_Amt.decode("utf-8").encode("gbk")
        p4_Cur = p4_Cur.decode("utf-8").encode("gbk")
        p5_Pid = p5_Pid.decode("utf-8").encode("gbk")
        p6_Pcat = p6_Pcat.decode("utf-8").encode("gbk")
        p7_Pdesc = p7_Pdesc.decode("utf-8").encode("gbk")
        p8_Url = p8_Url.decode("utf-8").encode("gbk")
        p9_SAF = p9_SAF.decode("utf-8").encode("gbk")
        pa_MP = pa_MP.decode("utf-8").encode("gbk")
        pd_FrpId = pd_FrpId.decode("utf-8").encode("gbk")
        pm_Period = pm_Period.decode("utf-8").encode("gbk")
        pn_Unit = pn_Unit.decode("utf-8").encode("gbk")
        pr_NeedResponse = pr_NeedResponse.decode("utf-8").encode("gbk")
        pt_UserName = pt_UserName.decode("utf-8").encode("gbk")
        pt_PostalCode = pt_PostalCode.decode("utf-8").encode("gbk")
        pt_Address = pt_Address.decode("utf-8").encode("gbk")
        pt_TeleNo = pt_TeleNo.decode("utf-8").encode("gbk")
        pt_Mobile = pt_Mobile.decode("utf-8").encode("gbk")
        pt_Email = pt_Email.decode("utf-8").encode("gbk")
        hmac = hmac.decode("utf-8").encode("gbk")
    except Exception, e:
        print e

    requestURL = getOnePar("requestURL")

    payURL = requestURL + "?"
    payURL += "p0_Cmd=" + p0_Cmd
    payURL += "&p1_MerId=" + p1_MerId
    payURL += "&p2_Order=" + p2_Order
    payURL += "&p3_Amt=" + p3_Amt
    payURL += "&p4_Cur=" + p4_Cur
    payURL += "&p5_Pid=" + urllib.quote(p5_Pid)
    payURL += "&p6_Pcat=" + urllib.quote(p6_Pcat)
    payURL += "&p7_Pdesc=" + urllib.quote(p7_Pdesc)
    payURL += "&p8_Url=" + p8_Url
    payURL += "&p9_SAF=" + p9_SAF
    payURL += "&pa_MP=" + urllib.quote(pa_MP)
    payURL += "&pd_FrpId=" + pd_FrpId
    payURL += "&pm_Period=" + pm_Period
    payURL += "&pn_Unit=" + pn_Unit
    payURL += "&pr_NeedResponse=" + pr_NeedResponse
    payURL += "&pt_UserName=" + urllib.quote(pt_UserName)
    payURL += "&pt_PostalCode=" + pt_PostalCode
    payURL += "&pt_Address=" + urllib.quote(pt_Address)
    payURL += "&pt_TeleNo=" + pt_TeleNo
    payURL += "&pt_Mobile=" + pt_Mobile
    payURL += "&pt_Email=" + pt_Email
    payURL += "&hmac=" + hmac

    return payURL


def queryByOrder(order):
    print "#### queryByOrder() ####"
    p0_Cmd = "QueryOrdDetail"
    p1_MerId = getOnePar("p1_MerId")
    p2_Order = order
    pd_Ver = "3.0"
    keyValue = getOnePar("keyValue")
    hmac = digestUtil.getHmac([p0_Cmd, p1_MerId, p2_Order, pd_Ver], keyValue)

    queryParams = {}
    queryParams.setdefault("p0_Cmd", p0_Cmd)
    queryParams.setdefault("p1_MerId", p1_MerId)
    queryParams.setdefault("p2_Order", p2_Order)
    queryParams.setdefault("hmac", hmac)
    queryURL = getOnePar("queryURL")
    print "queryParams: ", queryParams
    print "queryURL: ", queryURL
    queryResult = {}
    r0_Cmd = ""
    r1_Code = ""
    r2_TrxId = ""
    r3_Amt = ""
    r4_Cur = ""
    r5_Pid = ""
    r6_Order = ""
    r8_MP = ""
    rw_RefundRequestID = ""
    rx_CreateTime = ""
    ry_FinishTime = ""
    rz_RefundAmount = ""
    rb_PayStatus = ""
    rc_RefundCount = ""
    rd_RefundAmt = ""
    hmacFromYeepay = ""
    errorMsg = ""
    hmacError = ""
    responseList = []
    try:
        responseList = httpUtils.URLGet(queryURL, queryParams)
        print "responseList: ", responseList
    except Exception, e:
        print e

    if responseList == None:
        errorMsg = "No data returned!"
    else:
        for item in responseList:
            if item == "":
                continue
            i = item.index("=")
            j = len(item)
            if i >= 0:
                itemKey = item[0:i]
                itemValue = item[i + 1:j].decode()
                if itemKey == "r0_Cmd":
                    r0_Cmd = itemValue
                elif itemKey == "r1_Code":
                    r1_Code = itemValue
                elif itemKey == "r2_TrxId":
                    r2_TrxId = itemValue
                elif itemKey == "r3_Amt":
                    r3_Amt = itemValue
                elif itemKey == "r4_Cur":
                    r4_Cur = itemValue
                elif itemKey == "r5_Pid":
                    r5_Pid = itemValue
                elif itemKey == "r6_Order":
                    r6_Order = itemValue
                elif itemKey == "r8_MP":
                    r8_MP = itemValue
                elif itemKey == "rw_RefundRequestID":
                    rw_RefundRequestID = itemValue
                elif itemKey == "rx_CreateTime":
                    rx_CreateTime = itemValue
                elif itemKey == "ry_FinishTime":
                    ry_FinishTime = itemValue
                elif itemKey == "rz_RefundAmount":
                    rz_RefundAmount = itemValue
                elif itemKey == "rb_PayStatus":
                    rb_PayStatus = itemValue
                elif itemKey == "rc_RefundCount":
                    rc_RefundCount = itemValue
                elif itemKey == "rd_RefundAmt":
                    rd_RefundAmt = itemValue
                elif itemKey == "hmac":
                    hmacFromYeepay = itemValue
        stringArr = [r0_Cmd, r1_Code, r2_TrxId, r3_Amt, r4_Cur, r5_Pid, r6_Order, r8_MP,
                     rw_RefundRequestID, rx_CreateTime, ry_FinishTime, rz_RefundAmount,
                     rb_PayStatus, rc_RefundCount, rd_RefundAmt]
        localHmac = digestUtil.getHmac(stringArr, keyValue)
        if localHmac != hmacFromYeepay:
            hmacError = "Hmac不匹配! hmacFromYeepay: %s; localHmac: %s" % (
                hmacFromYeepay, localHmac)
            temp = ""
            for ele in stringArr:
                temp += ele

    queryResult["r0_Cmd"] = r0_Cmd
    queryResult["r1_Code"] = r1_Code
    queryResult["r2_TrxId"] = r2_TrxId
    queryResult["r3_Amt"] = r3_Amt
    queryResult["r4_Cur"] = r4_Cur
    queryResult["r5_Pid"] = r5_Pid
    queryResult["r6_Order"] = r6_Order
    queryResult["r8_MP"] = r8_MP
    queryResult["rw_RefundRequestID"] = rw_RefundRequestID
    queryResult["rx_CreateTime"] = rx_CreateTime
    queryResult["ry_FinishTime"] = ry_FinishTime
    queryResult["rz_RefundAmount"] = rz_RefundAmount
    queryResult["rb_PayStatus"] = rb_PayStatus
    queryResult["rc_RefundCount"] = rc_RefundCount
    queryResult["rd_RefundAmt"] = rd_RefundAmt
    queryResult["hamcError"] = hmacError
    queryResult["errorMsg"] = errorMsg
    print "query result: ", queryResult
    return queryResult


def refundByTrxId(params):
    print "#### refundByTrxId() ####"
    p0_Cmd = formatString(params["p0_Cmd"])
    p1_MerId = getOnePar("p1_MerId")
    pb_TrxId = formatString(params["pb_TrxId"])
    p3_Amt = formatString(params["p3_Amt"])
    p4_Cur = formatString(params["p4_Cur"])
    p5_Desc = formatString(params["p5_Desc"])
    keyValue = getOnePar("keyValue")
    strArr = [p0_Cmd, p1_MerId, pb_TrxId, p3_Amt, p4_Cur, p5_Desc]
    hmac = digestUtil.getHmac(strArr, keyValue)
    print hmac
    refundParams = {}
    refundParams["p0_Cmd"] = p0_Cmd
    refundParams["p1_MerId"] = p1_MerId
    refundParams["pb_TrxId"] = pb_TrxId
    refundParams["p3_Amt"] = p3_Amt
    refundParams["p4_Cur"] = p4_Cur
    refundParams["p5_Desc"] = p5_Desc
    refundParams["hmac"] = hmac
    print "refundParams: ", refundParams
    refundURL = getOnePar("refundURL")
    refundResult = {}
    r0_Cmd = ""
    r1_Code = ""
    r2_TrxId = ""
    r3_Amt = ""
    r4_Cur = ""
    r4_Order = ""
    rf_fee = ""
    hmacFromYeepay = ""
    errorMsg = ""
    hmacError = ""
    responseList = []
    try:
        responseList = httpUtils.URLGet(refundURL, refundParams)
        print "responseList: ", responseList
    except Exception, e:
        print e

    payURL = refundURL + "?" + "p0_Cmd=" + p0_Cmd + \
        "&p1_MerId=" + p1_MerId + "&pb_TrxId=" + pb_TrxId + \
        "&p3_Amt=" + p3_Amt + "&p4_Cur=" + p4_Cur + \
        "&p5_Desc=" + p5_Desc + "&hmac=" + hmac
    print payURL

    if responseList == None or len(responseList) == 0:
        errorMsg = "No Data Returned!"
    else:
        for item in responseList:
            if item == "":
                continue
            i = item.index("=")
            j = len(item)
            if i >= 0:
                itemKey = item[0:i]
                itemValue = item[i + 1:j]
                if itemKey == "r0_Cmd":
                    r0_Cmd = itemValue
                elif itemKey == "r1_Code":
                    r1_Code = itemValue
                elif itemKey == "r2_TrxId":
                    r2_TrxId = itemValue
                elif itemKey == "r3_Amt":
                    r3_Amt = itemValue
                elif itemKey == "r4_Cur":
                    r4_Cur = itemValue
                elif itemKey == "r4_Order":
                    r4_Order = itemValue
                elif itemKey == "rf_fee":
                    rf_fee = itemValue
                elif itemKey == "hmac":
                    hmacFromYeepay = itemValue
        stringArr = [r0_Cmd, r1_Code, r2_TrxId, r3_Amt, r4_Cur]
        localHmac = digestUtil.getHmac(stringArr, keyValue)
        if localHmac != hmacFromYeepay:
            hmacError = "Hmac 不匹配！ hmacFromYeepay: %s; localHmac: %s" % (
                hmacFromYeepay, localHmac)
            temp = ""
            for item in stringArr:
                temp += item

    refundResult["r0_Cmd"] = r0_Cmd
    refundResult["r1_Code"] = r1_Code
    refundResult["r2_TrxId"] = r2_TrxId
    refundResult["r3_Amt"] = r3_Amt
    refundResult["r4_Cur"] = r4_Cur
    refundResult["r4_Order"] = r4_Order
    refundResult["rf_fee"] = rf_fee
    refundResult["hmac"] = hmac
    refundResult["hmacError"] = hmacError
    refundResult["errorMsg"] = errorMsg
    print "refundResult: ", refundResult
    return refundResult


def refundQuery(params):
    print "##### refundQuery() #####"
    p0_Cmd = "RefundResults"
    p1_MerId = getOnePar("p1_MerId")
    p2_Order = formatString(params["p2_Order"])
    pb_TrxId = formatString(params["pb_TrxId"])
    keyValue = getOnePar("keyValue")
    hmac = digestUtil.getHmac([p0_Cmd, p1_MerId, p2_Order, pb_TrxId], keyValue)

    refundQueryParams = {}
    refundQueryParams["p0_Cmd"] = p0_Cmd
    refundQueryParams["p1_MerId"] = p1_MerId
    refundQueryParams["p2_Order"] = p2_Order
    refundQueryParams["pb_TrxId"] = pb_TrxId
    refundQueryParams["hmac"] = hmac
    refundQueryURL = getOnePar("refundQueryURL")
    refundQueryResult = {}
    r0_Cmd = ""
    r1_Code = ""
    r2_TrxId = ""
    r4_Order = ""
    refundStatus = ""
    refundFrpStatus = ""
    hmacFromYeepay = ""
    errorMsg = ""
    hmacError = ""
    responseList = []
    try:
        responseList = httpUtils.URLGet(refundQueryURL, refundQueryParams)
        print "responseList, ", responseList
    except Exception, e:
        print e

    if responseList == None or len(responseList) == 0:
        errorMsg = "No Data Returned!"
    else:
        for item in responseList:
            if item == "":
                continue
            else:
                i = item.index("=")
                j = len(item)
                if i >= 0:
                    itemKey = item[0:i]
                    itemValue = item[i + 1:j]
                    if itemKey == "r0_Cmd":
                        r0_Cmd = itemValue
                    elif itemKey == "r1_Code":
                        r1_Code = itemValue
                    elif itemKey == "r2_TrxId":
                        r2_TrxId = itemValue
                    elif itemKey == "r4_Order":
                        r4_Order = itemValue
                    elif itemKey == "refundStatus":
                        refundStatus = itemValue
                    elif itemKey == "refundFrpStatus":
                        refundFrpStatus = itemValue
                    elif itemKey == "hmac":
                        hmacFromYeepay = itemValue
        stringArr = [
            r0_Cmd, r1_Code, r2_TrxId, r4_Order, refundStatus, refundFrpStatus]
        localHmac = digestUtil.getHmac(stringArr, keyValue)
        if localHmac != hmacFromYeepay:
            hmacError = "Hmac 不匹配！ hmacFromYeepay: %s; localHmac: %s" % (
                hmacFromYeepay, localHmac)
            temp = ""
            for ele in stringArr:
                temp += ele
    refundQueryResult["r0_Cmd"] = r0_Cmd
    refundQueryResult["r1_Code"] = r1_Code
    refundQueryResult["r2_TrxId"] = r2_TrxId
    refundQueryResult["r4_Order"] = r4_Order
    refundQueryResult["refundStatus"] = refundStatus
    refundQueryResult["refundFrpStatus"] = refundFrpStatus
    refundQueryResult["hmac"] = hmacFromYeepay
    refundQueryResult["hmacError"] = hmacError
    refundQueryResult["errorMsg"] = errorMsg
    print "refundQueryResult: ", refundQueryResult
    return refundQueryResult


def verifyCallbackHmac(stringValue, hmacFromYeepay):
    print "##### verifyCallbackHmac() #####"
    keyValue = getOnePar("keyValue")
    sourceData = ""
    for item in stringValue:
        sourceData += item
    print "sourceData: ", sourceData
    localHmac = digestUtil.getHmac(stringValue, keyValue)
    if localHmac == hmacFromYeepay:
        return True
    else:
        return False


def cancelOrder(params):
    print "##### refundQuery() #####"
    p0_Cmd = formatString(params["p0_Cmd"])
    p1_MerId = getOnePar("p1_MerId")
    pb_TrxId = formatString(params["pb_TrxId"])
    pv_Ver = formatString(params["pv_Ver"])
    keyValue = getOnePar("keyValue")
    hmac = digestUtil.getHmac([p0_Cmd, p1_MerId, pb_TrxId, pv_Ver], keyValue)

    cancelParams = {}
    cancelParams["p0_Cmd"] = p0_Cmd
    cancelParams["p1_MerId"] = p1_MerId
    cancelParams["pb_TrxId"] = pb_TrxId
    cancelParams["hmac"] = hmac

    cancelOrderURL = getOnePar("cancelOrderURL")
    print "cancelParams: ", cancelParams
    print "cancelOrderURL: ", cancelOrderURL
    cancelResult = {}
    r0_Cmd = ""
    r1_Code = ""
    hmacFromYeepay = ""
    errorMsg = ""
    hmacError = ""
    responseList = []
    try:
        responseList = httpUtils.URLGet(cancelOrderURL, cancelParams)
        print "responseList, ", responseList
    except Exception, e:
        print e

    if responseList == None or len(responseList) == 0:
        errorMsg = "No Data Returned!"
    else:
        for item in responseList:
            if item == "":
                continue
            else:
                i = item.index("=")
                j = len(item)
                if i >= 0:
                    itemKey = item[0:i]
                    itemValue = item[i + 1:j]
                    if itemKey == "r0_Cmd":
                        r0_Cmd = itemValue
                    elif itemKey == "r1_Code":
                        r1_Code = itemValue
                    elif itemKey == "hmac":
                        hmacFromYeepay = itemValue

        stringArr = [r0_Cmd, r1_Code]
        localHmac = digestUtil.getHmac(stringArr, keyValue)
        if localHmac != hmacFromYeepay:
            hmacError = "Hmac 不匹配！ hmacFromYeepay: %s; localHmac: %s" % (
                hmacFromYeepay, localHmac)
            temp = ""
            for ele in stringArr:
                temp += ele
    cancelResult["r0_Cmd"] = r0_Cmd
    cancelResult["r1_Code"] = r1_Code
    cancelResult["hmacError"] = hmacError
    cancelResult["errorMsg"] = errorMsg
    print "cancelResult: ", cancelResult
    return cancelResult
