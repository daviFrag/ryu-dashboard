from mininet.net import Mininet
from mininet.topo import Topo 

from mininet.node import OVSKernelSwitch
from mininet.log import lg
from mininet.cli import CLI
from mininet.clean import Cleanup
from mininet.node import Node
from mininet.link import Intf

from enum import Enum

class NodeType(Enum):
    HOST = "host"
    SWITCH = "switch"
    CONTROLLER = "controller"


class TopologyBuilder:
    mn = Mininet(switch=OVSKernelSwitch, waitConnected=True)

    def __init__(self):
        lg.setLogLevel('info')

        # Clean existing data
        cup = Cleanup()
        cup.cleanup()

        # Switch setup
        OVSKernelSwitch.setup()

        # Init topology
        self.mn.init()


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
        return {
            "name": node.name,
            "intfs": self.getIntfsJSON(node.intfList()),
            "isSetup": node.isSetup,
            "type": self.getNodeType(node),
        }

    # get JSON rappresentation of all nodes
    def getNodesJSON(self):
        out ={
            "hosts": self.getHostsJSON(),
            "switches": self.getSwitchesJSON(),
            "controllers": self.getControllersJSON()
        }
        return out

    # get JSON rappresentation of all hosts
    def getHostsJSON(self):
        out = []
        for host in self.mn.hosts:
            out.append({
                "name": host.name,
                "intfs": self.getIntfsJSON(host.intfList()),
                "isSetup": host.isSetup,
            })
        return out

    # get JSON rappresentation of all switches
    def getSwitchesJSON(self):
        out = []
        for switch in self.mn.switches:
            out.append({
                "name": switch.name,
                "intfs": self.getIntfsJSON(switch.intfList()),
                "isSetup": switch.isSetup,
            })
        return out
    
    # get JSON rappresentation of all controllers
    def getControllersJSON(self):
        out = []
        for controller in self.mn.controllers:
            out.append({
                "name": controller.name,
                "intfs": self.getIntfsJSON(controller.intfList()),
                "isSetup": controller.isSetup,
            })
        return out
    
    # get JSON rappresentation of the interfaces of a node
    def getIntfsJSON(self, listIntfs):
        out = []
        for intf in listIntfs:
            out.append({
                "name": intf.name,
                "ip": intf.ip,
            })
        return out

    # get JSON rappresentation of links
    def getLinksJSON(self):
        out = []
        for link in self.mn.links:
            out.append({
                "intf1": {
                    "name": link.intf1.name,
                    "ip": link.intf1.ip,
                },
                "intf2": {
                    "name": link.intf2.name,
                    "ip": link.intf2.ip,
                }
            })
        return out

    # get JSON rappresentation of the entire topology
    def getTopoJSON(self):
        
        switchNodes = self.mn.switches
        controllerNodes = self.mn.controllers

        return {
            "hosts": self.getHostsJSON(),
            "switches": self.getSwitchesJSON(),
            "controllers": self.getControllersJSON(),
            "links": self.getLinksJSON(),
        }

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

    # delete a generic node
    def removeNode(self, nodeName):
        #cancello nodo da Mininet e poi da variabili istanza di TopologyBuilder
        if self.mn.__contains__(nodeName):  #se nodo esiste in mn true
            node = self.mn.get(nodeName)
            node.terminate()
            node.deleteIntfs(True)    #cancello tutte le network interfaces
            #cancella da mn il nodo
            self.mn.delNode(node)
    
    # start the CLI from the terminal
    def runCLI(self):
        CLI( self.mn )

    # insert or update node
    def setNode(self, node, name):
        if self.mn.__contains__(name):  #if true update node, else add node to topology
            nodeToUpdate = self.mn.get(name)
            print(nodeToUpdate.intf())
            for intf in node["intfs"]: #you can change only the ip of the interface
                # intfTemp = Intf(intf["name"],node=nodeToUpdate)
                # intfTemp.setIP(node["intfs"][intf.name].ip)
                try:
                    Intf(intf["name"],node=nodeToUpdate)
                except:
                    pass
                nodeToUpdate.setIP(intf["ip"], intf = intf["name"])

            nodeToUpdate.isSetup = node["isSetup"]
            #self.runCLI()
            return self.getNodeJSON(name)

        else:
            newNode = self.addNode(node)
            for intfData in node["intfs"]:
                try:
                    Intf(intfData["name"],node=newNode)
                except:
                    pass
                newNode.setIP(intfData["ip"], intf = intfData["name"])
                

            return self.getNodeJSON(name)

