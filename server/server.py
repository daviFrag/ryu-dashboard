#!/usr/bin/env python3

from threading import Thread

from flask import Flask, request
from flask_cors import CORS
from topologyBuilder import TopologyBuilder

init_topo = {
    "hosts": [
        "h0",
        "h1",
        "h2",
        "h3",
        "h4",
    ],
    "switches": [
        "s0",
        "s1",
    ],
    "links": [
        "s0-s1",
        "h0-s0",
        "h1-s0",
        "h2-s0",
        "h3-s1",
        "h4-s1",
    ]
}

tb = TopologyBuilder()

app = Flask(__name__)
CORS(app)

#API web server
#decorator per testing
@app.route("/", methods=['GET', 'POST', 'PUT']) # decorator
def home(): # route handler function
    # returning a response
    return "Hello World!"

# load topology
@app.route("/topology", methods=['POST'])
def initTopology():
    topo = request.get_json()
    tb.loadTopology(topo)
    return tb.getTopoJSON()

@app.route("/topology/start", methods=['POST'])
def startTopology():
    tb.startMininet()
    return {"status": "ok"}

@app.route("/topology/stop", methods=['POST'])
def stopTopology():
    tb.stopMininet()
    return {"status": "ok"}

#funzione nodi generici
@app.route('/node', methods=['GET'])
def getListNodes():
    return tb.getNodesJSON()

#funzione per nodi specifici
@app.route('/node/<name>', methods=['GET'])
def getNode(name):
    return tb.getNodeJSON(name)

#funzione per impostare/aggiornare n nodi
@app.route('/node', methods=['POST'])
def addNodes():
    requestJSON = request.get_json()
    tb.setNodes(requestJSON)
    #coming soon

#funzione per nodi specifici
@app.route('/node/<name>', methods=['PUT'])
def addNode(name):
    requestJSON = request.get_json()
    return tb.setNode(requestJSON, name)

#funzione per nodi specifici
@app.route('/node/<name>', methods=['DELETE'])
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