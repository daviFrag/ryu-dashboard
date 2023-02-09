#!/usr/bin/env python3

import sys
import json
import os

from flask import Flask
from mininet.node import Controller
from mininet.node import Host
from mininet.node import Switch
from mininet.topo import Topo
from mininet.net import Mininet

#testing
from mininet.node import OVSKernelSwitch
from mininet.cli import CLI
from mininet.topolib import TreeTopo
from mininet.log import info, lg
#testing

#ATTRIBUTI D'ISTANZA
hostNodes = []
switchNodes = []
controllerNodes = []    #controller di tipo Ryu
middleboxNodes = []     #per semplicità solo NAT
linklist = []   #lista per link tra nodes

#mn = Mininet(TreeTopo(depth = 2, fanout = 2), switch = OVSKernelSwitch, waitConnected = True)

def ifconfigTest( net ):
	"Run ifconfig on all hosts in net."
	hosts = net.hosts
	for host in hosts:
		info( host.cmd( 'ifconfig' ) )

lg.setLogLevel('info')
info( "*** Initializing Mininet and kernel modules\n" )
OVSKernelSwitch.setup()
info( "*** Creating network\n" )
network = Mininet( TreeTopo( depth=2, fanout=2), switch=OVSKernelSwitch, waitConnected=True )
info( "*** Starting network\n" )
network.start()
info( "*** Running ping test\n" )
network.pingAll()
info( "*** Running ifconfig test\n" )
ifconfigTest( network )
info( "*** Stopping network\n" )
network.stop()

#topology = Topo()   #topologia scelta/creata

app = Flask(__name__)

#API web server
#decorator per testing
@app.route("/", methods=['GET', 'POST', 'PUT']) # decorator
def home(): # route handler function
    # returning a response
    return "Hello World!"

#funzione nodi generici
@app.route('/node', methods=['GET'])
def getListNodes():
    return "get list nodes"

#funzione per nodi specifici
@app.route('/node/<int:id>', methods=['GET'])
def getNode(id):
    return "get node details"

#funzione nodi generici
@app.route('/node', methods=['POST'])
def setNodes():
    return "set list nodes"

#funzione per nodi specifici
@app.route('/node/<int:id>', methods=['PUT'])
def setNode(id):
    return "update node"

#funzione per nodi specifici
@app.route('/node/<int:id>', methods=['DELETE'])
def deleteNode(id):
    return 'delete a node'

#funzione per visualizzare archi/link
@app.route('/link', methods=['GET'])
def getLinks():
    return "get links"

#funzione per visualizzare arco o link singolo
@app.route('/link/<int:id>', methods=['GET'])
def getLink(id):
    return "get link"

#funzione per aggiungere links tra nodi
@app.route('/link', methods=['POST'])
def setLinks():
    return "create/set links"

#funzione per aggiungere link tra nodi
@app.route('/link/<int:id>', methods=['POST'])
def setLink(id):
    return "set/create a link"

#funzione per creare topology predefinita
@app.route('/createDefaTopo', methods=['POST'])
def createDefaultTopo():
    return "create predefinite topology"

#funzione per ottenere info flusso pacchetti
@app.route('/packetFlow/<int:id>', methods=['GET'])
def getPacketFlow(id):
    return "get flow of packets"

#funzione per ottenere info middleboxes
@app.route('/middlebox', methods=['GET'])
def getMiddleboxes():
    return "get info middleboxes"

#funzione per ottenere info middlebox
@app.route('/middlebox/<int:id>', methods=['GET'])
def getMiddlebox(id):
    return "get info middlebox"

#funzione per uploadare nuova topology al server
@app.route('/uploadTopo', methods=['POST'])
def uploadTopo():
    return "upload of a topology"

#funzione per cancellare topology
@app.route('/deleteTopo', methods=['POST'])
def deleteTopo():
    return "delete topology"    

#funzione per creare topology con parametri
@app.route('/createTopo', methods=['POST'])
def createTopo():
    return "create topology"

#funzione per ottenere regole di forwarding di ryu
@app.route('/forwardingRule', methods=['GET'])
def getForwardingRules():
    return "get rules of forwarding"

#funzione per ottenere regola di forwarding di ryu
@app.route('/forwardingRule/<int:id>', methods=['GET'])
def getForwardingRule(id):
    return "get rule of forwarding"

#funzione per modificare regole forwarding di ryu
@app.route('/forwardingRule', methods=['POST'])
def setForwardingRules():
    return "modify rules of forwarding"

#funzione per modificare regola forwarding di ryu
@app.route('/forwardingRule/<int:id>', methods=['POST'])
def setForwardingRule(id):
    return "modify rule of forwarding"



app.run(host = "0.0.0.0", port = 8080, debug = True)    #espongo a tutta la rete il web server
