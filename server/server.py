#!/usr/bin/env python3

from flask import Flask, request, make_response
from flask_cors import CORS
from terminal.io import WebSocketIOV2
from topologyBuilder import TopologyBuilder
import base64
import simple_websocket
import json


tb = TopologyBuilder()

app = Flask(__name__)
CORS(app)

cmdqueue = {}

#API web server

# load topology
@app.route("/api/topology", methods=['POST'])
def initTopology():
    topo = request.get_json()
    tb.loadTopology(topo)
    return {"status": "ok"}

@app.route("/api/topology/start", methods=['POST'])
def startTopology():
    tb.startMininet()
    return {"status": "ok"}

@app.route("/api/topology/stop", methods=['POST'])
def stopTopology():
    tb.stopMininet()
    return {"status": "ok"}

@app.route("/api/shell/start", methods=['GET'])
def startShell():
    tb.wsShell()
    # tb.runCLI()
    return {"status": "ok"}

@app.route("/api/topology/download", methods=['GET'])
def downloadTopology():
    topoJson = base64.b64decode(request.args.get('json'))
    resp = make_response(topoJson)
    resp.headers['Content-Length'] = len(topoJson)
    resp.headers['Content-Disposition'] = f'attachment; filename=mininetbuilder.json'
    return resp

@app.route('/shell', websocket=True)
def wsshell():
    ws = simple_websocket.Server(request.environ)
    sid = request.args.get("sid")
    cmdqueue[sid] = []
    try:
        wsIo = WebSocketIOV2(ws)
        tb.wsShell(wsIo, cmdqueue.get(sid))
        while ws.connected:
            payload = ws.receive()
            payload = json.loads(payload)
            shell = payload.get('shell')
            data = payload.get('data')
            if cmdqueue.get(shell) == None:
                cmdqueue[shell] = []
            cmdqueue[shell].append(data)
        # remove cmdqueue shell after disconnect
        cmdqueue.pop(shell)
    except simple_websocket.ConnectionClosed:
        pass
    return ''



app.run(host = "0.0.0.0", port = 8080, debug = True)    #espongo a tutta la rete il web server