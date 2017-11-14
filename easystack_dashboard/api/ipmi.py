import os


class IPMI:
    def __init__(self, host, user, password):
        self.host = host
        self.user = user
        self.password = password

    def run_CLI(self, operator):
        ot = os.popen('ipmitool -H ' + self.host +
                      ' -U ' + self.user +
                      ' -P ' + self.password +
                      ' ' + operator)
        return ot.read()

    def get_result(self, operator):
        result = []
        for row in self.run_CLI(operator).split('\n'):
            if row:
                result.append(row.split('|'))
        return result


class GeneralInfo:
    def __init__(self, sensor_name, sensor_id, status, entity_id, value):
        self.sensor_name = sensor_name
        self.sensor_id = sensor_id
        self.status = status
        self.entity_id = entity_id
        self.value = value


class Event:
    def __init__(self, num, time, sensor, description):
        self.num = num
        self.time = time
        self.sensor = sensor
        self.description = description


def get_general_info(ipmi):
    IPMI_dic = eval(ipmi)
    ipmi = IPMI(IPMI_dic['ip'], IPMI_dic['user'], IPMI_dic['password'])
    infos = []
    for info in ipmi.get_result('sdr elist full'):
        infos.append(GeneralInfo(info[0], info[1], info[2], info[3], info[4]))
    return infos


def get_event(ipmi):
    IPMI_dic = eval(ipmi)
    events = []
    ipmi = IPMI(IPMI_dic['ip'], IPMI_dic['user'], IPMI_dic['password'])
    for event in ipmi.get_result('sel list'):
        events.append(Event(event[0], event[1] + ' ' + event[2],
                            event[3], event[4]))
    return events
