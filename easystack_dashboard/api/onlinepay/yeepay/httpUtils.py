# -*- coding: utf-8 -*-
__author__ = 'Maggie'
__date__ = "2015/07/30"

import httplib
import urllib

def getUrl(map):
    url = ""
    if map == None or len(map.keys()) == 0:
        return ""
    for key in map.keys():
        if map[key] == None:
            str_value = ""
        else:
            str_value = str(map[key]).encode("gbk")
        url += (key+"="+str_value+"&")
    if url[-1] == "&":
        return url[:-1]
    else:
        return ""

def URLGet(strUrl, map):
    if "?" not in strUrl:
        strTotalURL = strUrl + "?" + getUrl(map)
    else:
        strTotalURL = strUrl + "&" + getUrl(map)
    httpClient = None
    try:
        httpClient = httplib.HTTPConnection(strUrl, timeout=30)
        httpClient.request("Get", strTotalURL)
        response = httpClient.getresponse()
        result = [response.status, response.reason, response.read()]
        return result
    except Exception, e:
        print e
    finally:
        if httpClient:
            httpClient.close()

def URLPost(strUrl, map):
    content = getUrl(map)
    if "?" not in strUrl:
        totalURL = strUrl + "?" + getUrl(map)
    else:
        totalURL = strUrl + "&" + getUrl(map)
    print "totalURL: ", totalURL
    headers = {"Content-type": "application/x-www-form-urlencoded;charset=GBK"}
    conn = httplib.HTTPConnection(strUrl)
    conn.request("POST", urllib.urlencode(content), headers)
    httpresp = conn.getresponse()
    result = [httpresp.status, httpresp.reason, httpresp.read()]
    conn.close()
    return result





