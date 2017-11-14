import datetime

def date2str(date):
    return date.strftime("%Y-%m-%d %H:%M:%S")


def str2date(string):
    return datetime.datetime.strptime(string, "%Y-%m-%d %H:%M:%S")


def str2datet(string):
    return datetime.datetime.strptime(string, "%Y-%m-%dT%H:%M:%S")


def str2datet_event(string):
    if '.' in string:
        string = string.split('.')[0]
    if "T" in string:
        return datetime.datetime.strptime(string, "%Y-%m-%dT%H:%M:%S")
    return datetime.datetime.strptime(string, "%Y-%m-%d %H:%M:%S")