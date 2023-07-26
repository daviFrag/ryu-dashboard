from array import array
from fcntl import ioctl
import socket
from struct import pack, unpack
from sys import maxsize


def getIfInfo(dst):
    is_64bits = maxsize > 2**32
    struct_size = 40 if is_64bits else 32
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    max_possible = 8 # initial value
    while True:
        bytes = max_possible * struct_size
        names = array('B')
        for i in range(0, bytes):
            names.append(0)
        outbytes = unpack('iL', ioctl(
            s.fileno(),
            0x8912,  # SIOCGIFCONF
            pack('iL', bytes, names.buffer_info()[0])
        ))[0]
        if outbytes == bytes:
            max_possible *= 2
        else:
            break
    s.connect((dst, 0))
    ip = s.getsockname()[0]
    for i in range(0, outbytes, struct_size):
        addr = socket.inet_ntoa(names[i+20:i+24])
        if addr == ip:
            name = names[i:i+16]
            try:
                name = name.tobytes().decode('utf-8')
            except AttributeError:
                name = name.tostring()
            name = name.split('\0', 1)[0]
            return (name,addr)
