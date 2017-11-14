import logging
import datetime

LOG = logging.getLogger(__name__)



class APIResource(object):
    def __init__(self, id, name, **kwargs):
        self.id = id
        self.name = name
        self._payload = kwargs.copy()

    def __getattr__(self, name):
        return self._payload.get(name)

    def get_int(self, name):
        value = self._payload.get(name)

        if value is not None:
            return int(value)

        return None

    def get_float(self, name):
        value = self._payload.get(name)

        if value is not None:
            return float(value)

        return None

    def get_timestamp(self, name):
        value = self.get_int(name)

        if value is not None:
            return datetime.fromtimestamp(value)

        return None

    def to_dict(self):
        obj = self._payload.copy()
        return obj


class APIEntry(object):
    def __init__(self, attrs, fields=tuple()):
        self.__update_attrs(attrs, fields)

    def update(self, attrs, fields=tuple()):
        self.__update_attrs(attrs, fields)

    def __update_attrs(self, attrs, fields=tuple()):
        if len(fields) > 0:
            lookup_fields = [key.lower() for key in fields]
            values = dict()
            for key in attrs.keys():
                if key.lower() in lookup_fields:
                    values[key] = attrs[key]
        else:
            values = attrs

        self.__dict__.update(values)

    def __str__(self):
        return str(self.__dict__)

    def __repr__(self):
        return repr(self.__dict__)


class RasCategorySet(object):
    ras_support_offset = 0
    processor_event_offset = 1
    memory_event_offset = 2
    io_event_offset = 3
    power_event_offset = 4
    cooling_event_offset = 5
    storage_event_offset = 7
    redundancy_degrade_offset = 26
    predicted_failures_offset = 27
    redundancy_loss_offset = 28
    partial_loss_offset = 31

    def __init__(self, value):
        self.value = value

    def get_flag(self, offset):
        if self.value & (1 << offset) != 0:
            return True

        return False

    def set_flag(self, offset, flag):
        bit = 1 if flag else 0
        value = self.value
        value = value & ~(1 << offset) | (bit << offset)
        self.value = value
        return value

    def ras_support(self):
        return self.get_flag(self.ras_support_offset)

    def set_ras_support(self, flag):
        return self.set_flag(self.ras_support_offset, flag)

    def processor_event(self):
        return self.get_flag(self.processor_event_offset)

    def set_processor_event(self, flag):
        return self.set_flag(self.processor_event_offset, flag)

    def memory_event(self):
        return self.get_flag(self.memory_event_offset)

    def set_memory_event(self, flag):
        return self.set_flag(self.memory_event_offset, flag)

    def io_event(self):
        return self.get_flag(self.io_event_offset)

    def set_io_event(self, flag):
        return self.set_flag(self.io_event_offset, flag)

    def power_event(self):
        return self.get_flag(self.power_event_offset)

    def set_power_event(self, flag):
        return self.set_flag(self.power_event_offset, flag)

    def cooling_event(self):
        return self.get_flag(self.cooling_event_offset)

    def set_cooling_event(self, flag):
        return self.set_flag(self.cooling_event_offset, flag)

    def storage_event(self):
        return self.get_flag(self.storage_event_offset)

    def set_storage_event(self, flag):
        return self.set_flag(self.storage_event_offset, flag)

    def redundancy_degrade(self):
        return self.get_flag(self.redundancy_degrade_offset)

    def set_redundancy_degrade(self, flag):
        return self.set_flag(self.redundancy_degrade_offset, flag)

    def predicted_failures(self):
        return self.get_flag(self.predicted_failures_offset)

    def set_predicted_failures(self, flag):
        return self.set_flag(self.predicted_failures_offset, flag)

    def redundancy_loss(self):
        return self.get_flag(self.redundancy_loss_offset)

    def set_redundancy_loss(self, flag):
        return self.set_flag(self.redundancy_loss_offset, flag)

    def partial_loss(self):
        return self.get_flag(self.partial_loss_offset)

    def set_partial_loss(self, flag):
        return self.set_flag(self.partial_loss_offset, flag)


def filter_dict(origin, fields=tuple()):
    if len(fields) > 0:
        lookup_fields = [key.lower() for key in fields]
        filtered = dict()
        for key in origin.keys():
            if key.lower() in lookup_fields:
                filtered[key] = origin[key]
    else:
        filtered = origin.copy()

    return filtered

