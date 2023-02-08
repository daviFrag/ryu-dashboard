import sys
import json
import flask
import mininet
import os


app = flask(__name__)

#funzione nodi generici
@app.route('/node', methods=['GET'])
def node():
    return "get list nodes"

#funzione per nodi specifici
@app.route('/node/<int:id>', methods=['GET'])
def node(id):
    return "get node details"

#funzione nodi generici
@app.route('/node', methods=['POST'])
def node():
    return "set list nodes"

#funzione per nodi specifici
@app.route('/node/<int:id>', methods=['PUT'])
def node(id):
    return "update node"

#funzione per nodi specifici
@app.route('/node/<int:id>', methods=['DELETE'])
def node(id):
    return 'delete a node'

#funzione per visualizzare archi/link
@app.route('/link', methods=['GET'])
def link():
    return "get links"

#funzione per visualizzare arco o link singolo
@app.route('/link/<int:id>', methods=['GET'])
def link(id):
    return "get link"

#funzione per aggiungere link tra nodi
@app.route('/link', methods=['POST'])
def link():
    return "set/create a link"

#funzione per creare topology predefinita
@app.route('/createDefaTopo', methods=['POST'])
def createDefaultTopo():
    return "create predefinite topology"

#funzione per ottenere info flusso pacchetti
@app.route('/packetFlow/<int:id>', methods=['GET'])
def packetFlow(id):
    return "get flow of packets"

#funzione per ottenere info middleboxes
@app.route('/middlebox', methods=['GET'])
def middlebox():
    return "get info middleboxes"

#funzione per ottenere info middlebox
@app.route('/middlebox/<int:id>', methods=['GET'])
def middlebox(id):
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
def forwardingRule():
    return "get rules of forwarding"

#funzione per ottenere regola di forwarding di ryu
@app.route('/forwardingRule/<int:id>', methods=['GET'])
def forwardingRule(id):
    return "get rules of forwarding"

#funzione per modificare regole forwarding di ryu
@app.route('/forwardingRule', methods=['POST'])
def modifyForwRule():
    return "modify rules of forwarding"

#funzione per modificare regola forwarding di ryu
@app.route('/forwardingRule/<int:id>', methods=['POST'])
def forwardingRule(id):
    return "modify rule of forwarding"

#funzione per 
