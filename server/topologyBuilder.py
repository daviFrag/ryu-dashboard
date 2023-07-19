from mininet.net import Mininet
from mininet.topo import Topo 

from mininet.log import lg
from mininet.cli import CLI
from mininet.clean import Cleanup
from mininet.node import Host, CPULimitedHost, IVSSwitch, UserSwitch, OVSKernelSwitch, RemoteController, OVSController, Controller
from mininet.link import Intf, TCLink
from mininet.util import netParse, ipAdd, quietRun
from nodes import DockerHost

from subprocess import call, Popen, PIPE

from re import match
from json import dumps
from os import listdir
import socket
from sys import maxsize
from array import array
from fcntl import ioctl
from struct import pack, unpack

from enum import Enum

try:
  from urllib.request import build_opener, HTTPHandler, Request
except ImportError:
  from urllib2 import build_opener, HTTPHandler, Request


class NodeType(Enum):
    HOST = "host"
    SWITCH = "switch"
    CONTROLLER = "controller"

class HostSubTypes(Enum):
    DEFAULT = "default"
    DOCKER = "docker"

class SwitchSubTypes(Enum):
    DEFAULT = "default"
    OVSKS = "OVSKernelSwitch"
    IVSS = "IVSSwitch"
    US = "UserSwitch"
    USN = "UserSwitchNamespace"

class ControllerSubTypes(Enum):
    REMOTE = "remote"
    OPENFLOWREF = "ofr"
    OVS = "ovs"


class TopologyBuilder:
    mn = Mininet(topo=None, waitConnected=True)
    ipBase = "10.0.0.1/8"
    switchDefaultType = SwitchSubTypes.OVSKS
    nflowTarget = "10.0.2.2:9996"
    nflowTimeout = "600"
    nflowAddId = False
    sFlowCollector = "10.0.2.2"
    sFlowSampling = "10"
    sFlowPolling = "10"

    def __init__(self):
        lg.setLogLevel('info')

        # Clean existing data
        cup = Cleanup()
        cup.cleanup()

        # Switch setup
        OVSKernelSwitch.setup()

        # Init topology
        self.mn.init()

    def reset(self):
        # Clean existing data
        cup = Cleanup()
        cup.cleanup()

        self.mn = Mininet(topo=None, waitConnected=True, build=False)

        # Switch setup
        OVSKernelSwitch.setup()

        # Init topology
        self.mn.init()


    def loadTopology(self, topo):
        # TODO: before adding nodes clean Mininet
        self.reset()

        for node in topo['nodes']:
            self.addNode(node)

        for link in topo.get("links"):
            self.addLink(link)

        # TODO: add VLAN interfaces

        # build mininet
        self.mn.build()

        # start mininet
        self.startMininet()

        # post configuration
        self.postConfiguration(topo['nodes'])


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
        if NodeType(node.get('type')) == NodeType.HOST:
            host = self.addHost(node)
            return host
        if NodeType(node.get('type')) == NodeType.SWITCH:
            switch = self.addSwitch(node)
            return switch
        if NodeType(node.get('type')) == NodeType.CONTROLLER:
            controller = self.addController(node)
            return controller
        
    def addHost(self, node):
        ip, defaultRoute = self.extractNodeProps(node)
        if HostSubTypes(node.get('subType')) == HostSubTypes.DEFAULT:
            newHost = None
            if node.get('cpu') != None or node.get('cores') != None:
                newhost = self.mn.addHost(node.get('hostname'),cls=CPULimitedHost, ip=ip, defaultRoute=defaultRoute)
                if node.get('cpu') != None:
                    newhost.setCPUFrac(f=node.get('cpu'), sched=node.get('sched'))
                if node.get('cores') != None:
                    newhost.setCPUs(cores=node.get('cores'))
            else:
                newHost = self.mn.addHost(node.get('hostname'),cls=Host, ip=ip, defaultRoute=defaultRoute)

            if node.get('externalInterfaces') != None:
                for extInterface in node.get('externalInterfaces'):
                    Intf(extInterface, node=node.get("hostname") )
            return newHost
        elif HostSubTypes(node['subType']) == HostSubTypes.DOCKER:
            raise ("Not implented!")
        else:
            # TODO: better to skip
            raise ("type not found")
        
    def strToTypeSwitch(self, type: SwitchSubTypes):
        if SwitchSubTypes(type) == SwitchSubTypes.DEFAULT:
            # If the default switch type is set to default it will loops forever
            if (self.switchDefaultType == SwitchSubTypes.DEFAULT):
                raise "Cannot set default as general switch type"
            self.strToTypeSwitch(self.switchDefaultType)
        elif SwitchSubTypes(type) == SwitchSubTypes.OVSKS:
            return OVSKernelSwitch
        elif SwitchSubTypes(type) == SwitchSubTypes.IVSS:
            return IVSSwitch
        elif SwitchSubTypes(type) == SwitchSubTypes.US or SwitchSubTypes(type) == SwitchSubTypes.USN:
            return UserSwitch
        else:
            print(type)
            raise Exception("Not valid switchType")
        
    def strToTypeController(self, type: ControllerSubTypes):
        if ControllerSubTypes(type) == ControllerSubTypes.REMOTE:
            return RemoteController
        elif ControllerSubTypes(type) == ControllerSubTypes.OVS:
            return OVSController
        elif ControllerSubTypes(type) == ControllerSubTypes.OPENFLOWREF:
            return Controller
        else:
            raise "Not valid controllerType"

    def addSwitch(self, node):
        switchType = self.strToTypeSwitch(node.get("subType"))
        switch = self.mn.addSwitch(node.get("hostname"), 
                          cls=switchType, 
                          inNamespace=SwitchSubTypes(node.get("subType")) == SwitchSubTypes.USN,
                          listenPort=node.get("dpctl"),
                          dpid=node.get("dpid"))
    
        if node.get('externalInterfaces') != None:
            for extInterface in node.get('externalInterfaces'):
                Intf(extInterface, node=node.get("hostname") )
        
        return switch
    
    def addController(self, node):
        controllerType = self.strToTypeController(node.get("subType"))
        return self.mn.addController(node.get("hostname"),
                                    controller=controllerType,
                                    ip=node.get("ip"),
                                    protocol=node.get("protocol"),
                                    port=int(node.get("port")))
    
    def addLink(self, link):
        src = link.get("src")
        dest = link.get("dest")

        bw = link.get("bandwidth")
        delay = link.get("delay")
        loss = link.get("loss")
        
        opts = {}

        if bw != None:
            opts["bw"] = bw
        if delay != None:
            opts["delay"] = delay
        if loss != None:
            opts["loss"] = loss    

        if (len(opts) > 0):
            return self.mn.addLink(src, dest, cls=TCLink, **opts)

        return self.mn.addLink(src, dest, cls=TCLink)
    
    def createVLANIntf(self, nodes):
        for node in nodes:
            if NodeType(node.get("type")) == NodeType.HOST:
                vlanInterfaces = node.get("vlanInterfaces")
                hostname = node.get("hostname")
                if vlanInterfaces != None and len(vlanInterfaces) > 0:
                    for vlanInterface in vlanInterfaces:
                        host = self.mn.getNodeByName(hostname)
                        # add VLANID to interface
                        host.cmd(f'ip link add link {hostname}-eth0 name {hostname}-eth0.{vlanInterface.get("VLAN_ID")} type vlan id {vlanInterface.get("VLAN_ID")}')
                        # set ip of VLAN
                        host.cmd(f'ip addr add {vlanInterface.get("ip")} dev {hostname}-eth0.{vlanInterface.get("VLAN_ID")}')
                        # bring vlan interface up
                        host.cmd(f'ip link set dev {hostname}-eth0.{vlanInterface.get("VLAN_ID")} up')

    def startCommandHosts(self, nodes):
        for node in nodes:
            if NodeType(node.get("type")) == NodeType.HOST:
                startCommand = node.get("startCommand")
                hostname = node.get("hostname")
                if startCommand != None:
                    host = self.mn.getNodeByName(hostname)
                    # TODO: check behaviour if a command is blocking
                    host.cmdPrint(startCommand)

    def setupNetflow(self, nodes):
        nflowSwitches = ''
        nFlowEnable = False
        for node in nodes:
            if NodeType(node.get("type")) == NodeType.SWITCH:
                if node.get("netFlow") == True:
                    nflowSwitches = nflowSwitches+' -- set Bridge '+node.get('hostname')+' netflow=@MininetBuilderNF'
                    nFlowEnable=True
        if nFlowEnable:
            nflowCmd = 'ovs-vsctl -- --id=@MininetBuilderNF create NetFlow '+ 'target=\\\"'+self.nflowTarget+'\\\" '+ 'active-timeout='+self.nflowTimeout
            if self.nflowAddId:
                nflowCmd = nflowCmd + ' add_id_to_interface=true'
            else:
                nflowCmd = nflowCmd + ' add_id_to_interface=false'
            
            call(nflowCmd+nflowSwitches, shell=True)
            self.mn.getNodeByName(node.get("hostname")).cmdPrint("curl 10.0.2.2:9996")

    # TODO: configure switch localy (check if sFlow is enabled)
    def configSFlow(self, net, collector, ifname, sampling, polling):
        lg.info("*** Enabling sFlow:\n")
        sflow = 'ovs-vsctl -- --id=@sflow create sflow agent=%s target=%s sampling=%s polling=%s --' % (ifname,collector,sampling,polling)
        for s in net.switches:
            sflow += ' -- set bridge %s sflow=@sflow' % s
        lg.info(' '.join([s.name for s in net.switches]) + "\n")
        call(sflow, shell=True)

    def sendTopoSFlow(self, net, agent, collector):
        lg.info("*** Sending topology\n")
        topo = {'nodes':{}, 'links':{}}
        for s in net.switches:
            topo['nodes'][s.name] = {'agent':agent, 'ports':{}}
        path = '/sys/devices/virtual/net/'
        for child in listdir(path):
            parts = match('(^.+)-(.+)', child)
            if parts == None: continue
            if parts.group(1) in topo['nodes']:
                ifindex = open(path+child+'/ifindex').read().split('\n',1)[0]
                topo['nodes'][parts.group(1)]['ports'][child] = {'ifindex': ifindex}
        i = 0
        for s1 in net.switches:
            j = 0
            for s2 in net.switches:
                if j > i:
                    intfs = s1.connectionsTo(s2)
                    for intf in intfs:
                        s1ifIdx = topo['nodes'][s1.name]['ports'][intf[0].name]['ifindex']
                        s2ifIdx = topo['nodes'][s2.name]['ports'][intf[1].name]['ifindex']
                        linkName = '%s-%s' % (s1.name, s2.name)
                        topo['links'][linkName] = {'node1': s1.name, 'port1': intf[0].name, 'node2': s2.name, 'port2': intf[1].name}
                j += 1
            i += 1

        opener = build_opener(HTTPHandler)
        request = Request('http://%s:8008/topology/json' % collector, data=dumps(topo).encode('utf-8'))
        request.add_header('Content-Type','application/json')
        request.get_method = lambda: 'PUT'
        try:
            url = opener.open(request)
        except:
            lg.info("Unable to send topology")

                
    def setupSFlow(self):
        (ifname, agent) = getIfInfo(self.sFlowCollector)
        self.configSFlow(self.mn,self.sFlowCollector,ifname,self.sFlowSampling,self.sFlowPolling)
        self.sendTopoSFlow(self.mn,agent,self.sFlowCollector)


    def postConfiguration(self, nodes):
        self.createVLANIntf(nodes)
        self.configureSwitches(nodes)
        self.setupNetflow(nodes)
        self.setupSFlow()
        self.startCommandHosts(nodes)

    def configureSwitches(self, nodes):
        for node in nodes:
            if (NodeType(node.get("type")) == NodeType.SWITCH):
                switch = self.mn.get(node.get("hostname"))
                switch.cmd(f"ifconfig {node.get('hostname')} {node.get('ip')}")



    def extractNodeProps(self, node):
        if node.get('defaultRoute') != None and len(node.get('defaultRoute')) > 0:
            defaultRoute = 'via '+node.get('defaultRoute')
        else:
            defaultRoute = 'None'
        if node.get('ip') != None:
            ip = node.get('ip')
        else:
            # TODO: set ip base in general config
            ipBaseNum, prefixLen = netParse( self.ipBase )
            ip = ipAdd(i=int(node.get('numNode')), prefixLen=prefixLen, ipBaseNum=ipBaseNum)
        return ip, defaultRoute
        
    # add custom docker host node
    def addDockerHost(self, name: str, **params):
        self.mn.addHost(name, cls=DockerHost, params=params)
    
    # start the CLI from the terminal
    def runCLI(self):
        CLI( self.mn )
        
    # start mininet
    def startMininet(self):
        self.mn.start()

    # stop mininet
    def stopMininet(self):
        self.mn.stop()

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

