import ELK, { ElkNode } from 'elkjs';
import { Edge as ReactFlowEdge, Node as ReactFlowNode } from 'reactflow';
import { v4 } from 'uuid';
import { DataEdge } from './Edge/DataEdge';
import { Edge } from './Edge/Edge';
import { ControllerNode } from './Node/ControllerNode';
import { HostNode } from './Node/HostNode';
import { Node } from './Node/Node';
import { SwitchNode } from './Node/SwitchNode';
import { Topology } from './Topology';

export type GraphProps = {
  nodes: Map<string, Node>;
  edges: Map<string, Edge>;
};

export class Graph {
  private nodes: Map<string, Node>;
  private edges: Map<string, Edge[]>;
  private topo: Topology;
  private n: number;
  private m: number;

  constructor(topo: Topology) {
    this.topo = topo;
    this.nodes = new Map<string, Node>();
    this.edges = new Map<string, Edge[]>();
    this.n = 0;
    this.m = 0;

    // add all controllers
    topo.controllers.forEach((name) => {
      this.nodes.set(
        name,
        new ControllerNode({ id: name, label: name, pos: { x: 0, y: 0 } })
      );
    });

    // add all hosts
    topo.hosts.forEach((name) => {
      this.nodes.set(
        name,
        new HostNode({ id: name, label: name, pos: { x: 0, y: 0 } })
      );
    });

    // add all switches
    topo.switches.forEach((name) => {
      this.nodes.set(
        name,
        new SwitchNode({ id: name, label: name, pos: { x: 0, y: 0 } })
      );
    });

    // add all links
    topo.links.forEach((link) => {
      const splittedLink = link.split('-');

      if (splittedLink.length != 2) return;

      const source = this.nodes.get(splittedLink[0]);
      const target = this.nodes.get(splittedLink[1]);

      // TODO: handle this error
      if (!source || !target) return;

      // let edgeList = this.edges.get(splittedLink[0]) ?? [];
      // edgeList.push();

      source.addEdge(new DataEdge({ source, target }));
      target.addEdge(new DataEdge({ target, source }));

      // this.edges.set(splittedLink[0], edgeList);
    });
  }

  // getRoots() {
  //   // let roots = [];
  //   // this.edges.forEach((edge, index) => {
  //   //   edge.
  //   // });
  // }

  getNodes() {
    return this.nodes;
  }

  getEdges() {
    return this.edges;
  }

  async getRender() {
    const elk = new ELK();

    const nodes: ElkNode[] = [];

    nodes.push(
      ...this.topo.switches.map((n) => ({
        id: n,
        type: 'switchNode',
        width: 100,
        height: 100,
        labels: [{ text: n }],
      }))
    );
    let currentIndex = nodes.length;
    nodes.push(
      ...this.topo.hosts.map((n) => ({
        id: n,
        type: 'hostNode',
        width: 100,
        height: 100,
        labels: [{ text: n }],
      }))
    );

    const graph = {
      id: 'root',
      layoutOptions: {
        'elk.algorithm': 'mrtree',
      },
      children: nodes,
      edges: this.topo.links.map((e) => ({
        id: v4(),
        sources: [e.split('-')[0]],
        targets: [e.split('-')[1]],
      })),
    };

    const g = await elk.layout(graph);

    const renderGraph: { nodes: ReactFlowNode[]; edges: ReactFlowEdge[] } = {
      nodes: !g.children
        ? []
        : g.children.map((node) => {
            return {
              ...node,
              position: {
                x: node.x ?? 0,
                y: node.y ?? 0,
              },
              data: {
                label: node.labels?.[0].text ?? '',
              },
            };
          }),
      edges: !g.edges
        ? []
        : g.edges.map((edge) => {
            return {
              id: edge.id,
              source: edge.sources[0],
              target: edge.targets[0],
            };
          }),
    };

    return renderGraph;
  }

  getReactFlowNodes() {
    const renderGraph: ReactFlowNode[] = [];
    this.nodes.forEach((node) => renderGraph.push(node.getReactFlowNode()));
    return renderGraph;
  }

  getReactFlowEdges() {
    const renderGraph: ReactFlowEdge[] = [];
    this.edges.forEach((edge) =>
      renderGraph.push(...edge.map((e) => e.getReactFlowEdge()))
    );
    return renderGraph;
  }
}
