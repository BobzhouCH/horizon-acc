#
# Copyright 2015 Easystack <bo.wang@easystack.cn>
# Created on 2015-09-10
#

import yaml
import os
import collections


def get_notice():
    filename = os.path.join(
        os.path.dirname(__file__), 'notice.yaml').replace("\\", "/")
    try:
        input_stream = file(filename, 'r')
        cont = yaml.load(input_stream)
        return cont
    except Exception:
        return {}


def update_notice(data):
    filename = os.path.join(
        os.path.dirname(__file__), 'notice.yaml').replace("\\", "/")
    try:
        output_stream = file(filename, 'w')
        data = convert(data)
        yaml.dump(data, output_stream, default_flow_style=False)
        output_stream.close()
    except Exception:
        return False
        output_stream.close()
    return True


def convert(data):
    if isinstance(data, basestring):
        return str(data)
    elif isinstance(data, collections.Mapping):
        return dict(map(convert, data.iteritems()))
    elif isinstance(data, collections.Iterable):
        return type(data)(map(convert, data))
    else:
        return data
