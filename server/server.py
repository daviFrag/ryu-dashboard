#!/usr/bin/env python3

from threading import Thread

from flask import Flask, request, make_response
from flask_cors import CORS
from topologyBuilder import TopologyBuilder
import base64

tb = TopologyBuilder()

app = Flask(__name__)
CORS(app)

#API web server

# load topology
@app.route("/api/topology", methods=['POST'])
def initTopology():
    topo = request.get_json()
    tb.loadTopology(topo)
    tb.runCLI()
    return {"status": "ok"}

@app.route("/api/topology/start", methods=['POST'])
def startTopology():
    tb.startMininet()
    return {"status": "ok"}

@app.route("/api/topology/stop", methods=['POST'])
def stopTopology():
    tb.stopMininet()
    return {"status": "ok"}

@app.route("/api/topology/download", methods=['GET'])
def downloadTopology():
    topoJson = base64.b64decode(request.args.get('json'))
    resp = make_response(topoJson)
    resp.headers['Content-Length'] = len(topoJson)
    resp.headers['Content-Disposition'] = f'attachment; filename=mininetbuilder.json'
    return resp

app.run(host = "0.0.0.0", port = 8080, debug = True)    #espongo a tutta la rete il web server