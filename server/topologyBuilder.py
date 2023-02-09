from mininet.net import Mininet
from mininet.topo import Topo 

from mininet.node import OVSKernelSwitch
from mininet.log import info, lg
from mininet.node import Node
from mininet.cli import CLI

from enum import Enum

class NodeType(Enum):
    HOST = "host"
    SWITCH = "switch"
    CONTROLLER = "controller"


class TopologyBuilder:
    mn = Mininet(switch=OVSKernelSwitch, waitConnected=True)

    def __init__(self):
        lg.setLogLevel('info')
        OVSKernelSwitch.setup()
        self.mn.init()

    def __repr__(self) -> str:
        return f"{type(self).__name__}(hosts={self.hosts},switches={self.switches},controlles={self.controllers},links={self.links})"


    def loadTopology(self, topo):
        customTopo = Topo()

        # Adding hosts
        for host in topo["hosts"]:
            customTopo.addHost(host)

        # Adding switches
        for switch in topo["switches"]:
            customTopo.addSwitch(switch)

        # Adding links
        for link in topo["links"]:
            source = link.split("-")[0]
            target = link.split("-")[1]

            customTopo.addLink(source, target)
            
        self.mn.buildFromTopo(customTopo)

        print(self.getNodeJSON('h0'))

    #get node class
    def getNodeType(self, node):
        return node.__class__.__name__

    # get JSON rappresentation of a generic node
    def getNodeJSON(self, nodeName):
        node = self.mn.get(nodeName)
        return {"name": node.name, "type": self.getNodeType(node)}

    # add generic node
    def addNode(self, node):    #node è un tipo JSON (attributi di node + NodeType)
        if NodeType(node['type']) == NodeType.HOST:
            host = self.mn.addHost(node['name'])
            return host
        if NodeType(node['type']) == NodeType.SWITCH:
            switch = self.mn.addSwitch(node['name'])
            return switch
        if NodeType(node['type']) == NodeType.CONTROLLER:
            controller = self.mn.addController(node['name'])
            return controller

    def runCLI(self):
        CLI( self.mn )

    # delete a generic node
    def removeNode(self, nodeName):
        #cancello nodo da Mininet e poi da variabili istanza di TopologyBuilder
        if self.mn.__contains__(nodeName):  #se nodo esiste in mn true
            node = self.mn.get(nodeName)
            node.terminate()
            node.deleteIntfs(True)    #cancello tutte le network interfaces
            #cancella da mn il nodo
            self.mn.delNode(node)

