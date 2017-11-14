class PortForwarding():
    def __init__(self, id, outside_port, inside_addr, inside_port, protocol):
        self.id = id
        self.outside_port = outside_port
        self.inside_addr = inside_addr
        self.inside_port = inside_port
        self.protocol = protocol
