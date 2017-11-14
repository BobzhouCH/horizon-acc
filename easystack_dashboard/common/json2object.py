from models import PortForwarding


def get_portforwarding(pd):
    for key in PortForwarding(None, None, None, None, None).__dict__:
        if key not in pd:
            pd[key] = None

    return PortForwarding(
        id=pd['id'],
        outside_port=pd['outside_port'],
        inside_addr=pd['inside_addr'],
        inside_port=pd['inside_port'],
        protocol=pd['protocol']
    )
