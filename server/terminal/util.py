from mininet.net import Mininet
from terminal.io import WebSocketIOV2
from terminal.cli import WSCLI

def shellWrapper(net: Mininet, stdout: WebSocketIOV2, cmdqueue):
    loop = True
    while loop:
        loop = False
        try:
            WSCLI(net, stdout=stdout, cmdqueue=cmdqueue)
        except Exception as e:
            loop = True
            stdout.write(f"Internal CLI error: \n{e}")
            stdout.write("___STOP___")
    #close websocket connection
    stdout.close()