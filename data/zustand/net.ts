import ELK from 'elkjs';
import { enableMapSet, produce } from 'immer';
import {
  Connection,
  Edge,
  Node,
  XYPosition,
  applyEdgeChanges as applyReactEdgeChanges,
  applyNodeChanges as applyReactNodeChanges,
} from 'reactflow';
import { v4 } from 'uuid';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type NetNode = {
  type: string;
  subType?: string;
  hostname: string;
  label: string;
};

export type NetHostNode = NetNode & {
  type: 'host';
  subType: 'default';
  ip?: string;
  numNode: number;
  defaultRoute?: string;
  sched: 'proc' | 'cfs' | 'rt';
  cpu?: number;
  cores?: number;
  startCommand?: string;
  stopCommand?: string;
  vlanInterfaces?: VLANInterface[];
  externalInterfaces?: string[];
};

export type NetSwitchNode = NetNode & {
  type: 'switch';
  subType: 'default' | 'ovk' | 'ivs' | 'user' | 'usern';
  numNode: number;
  netFlow: boolean;
  sFlow: boolean;
  ip?: string;
  dpctl?: string;
  externalInterfaces?: string[];
};

export type NetControllerNode = NetNode & {
  type: 'controller';
  subType: 'remote' | 'ofr' | 'ovs' | 'ryu';
  port?: string;
  protocol: 'tcp' | 'ssl';
  ip?: string;
};

export type NetLink = {
  src: string;
  dest: string;
  bw?: number;
  delay?: number;
  loss?: number;
};

export type VLANInterface = {
  ip: string;
  vlanId: number;
};

export type ReactFlowNode = Node;

export type ReactFlowHostNode = ReactFlowNode & {
  data: NetHostNode;
};
export type ReactFlowSwitchNode = ReactFlowNode & {
  data: NetSwitchNode;
};
export type ReactFlowControllerNode = ReactFlowNode & {
  data: NetControllerNode;
};

export type ReactFlowEdge = Edge;

export type ReactFlowLink = ReactFlowEdge & {
  data: NetLink;
};

export type NetTopology = {
  nodes: NetNode[];
  links: NetLink[];
};

interface NetState {
  numNodes: number;
  nodeMap: Map<string, ReactFlowNode>;
  linkMap: Map<string, ReactFlowEdge>;
  selectedElement:
    | {
        type: 'node' | 'edge';
        id: string;
      }
    | undefined;
  addNode: (node: ReactFlowNode) => void;
  addLink: (link: ReactFlowEdge) => void;
  getTopology: () => NetTopology;
  updateNode: (node: ReactFlowNode) => void;
  updateEdge: (edge: ReactFlowEdge) => void;
  setNodes: (nodes: ReactFlowNode[]) => void;
  setEdges: (edges: ReactFlowEdge[]) => void;
  getReactFlowNodes: () => ReactFlowNode[];
  getReactFlowEdges: () => ReactFlowEdge[];
  applyNodeChanges: (changes: any[]) => void;
  applyEdgeChanges: (changes: any[]) => void;
  setSelectedElement: (
    element:
      | {
          type: 'node' | 'edge';
          id: string;
        }
      | undefined
  ) => void;
  getSelectedElement: () => ReactFlowNode | ReactFlowEdge | undefined;
  getTopoJson: () => NetTopology;
  createHost: (position: XYPosition) => ReactFlowHostNode;
  createSwitch: (position: XYPosition) => ReactFlowSwitchNode;
  createController: (position: XYPosition) => ReactFlowControllerNode;
  createNode: (type: string, position: XYPosition) => ReactFlowNode;
  createEdge: (conn: Connection) => ReactFlowLink;
  rearrangeTopo: (algo: string) => Promise<void>;
}

enableMapSet();

export const useNetStore = create<NetState>()(
  devtools(
    (set, get) => ({
      numNodes: 0,
      nodeMap: new Map<string, ReactFlowNode>(),
      linkMap: new Map<string, ReactFlowEdge>(),
      selectedElement: undefined as
        | {
            type: 'node' | 'edge';
            id: string;
          }
        | undefined,

      getReactFlowNodes: () => Array.from(get().nodeMap.values()),
      getReactFlowEdges: () => Array.from(get().linkMap.values()),

      updateNode(node) {
        set((state) =>
          produce(state, (draft) => {
            draft.nodeMap.set(node.id, node);
          })
        );
      },

      updateEdge(edge) {
        set((state) =>
          produce(state, (draft) => {
            draft.linkMap.set(edge.id, edge);
          })
        );
      },

      setSelectedElement(element) {
        set((_) => ({
          selectedElement: element,
        }));
      },

      getSelectedElement() {
        const state = get();
        if (!state.selectedElement) return undefined;
        switch (state.selectedElement.type) {
          case 'edge':
            return state.linkMap.get(state.selectedElement?.id);
          case 'node':
            return state.nodeMap.get(state.selectedElement?.id);
          default:
            return undefined;
        }
      },

      getTopology() {
        const state = get();
        const topo: NetTopology = { nodes: [], links: [] };
        state.nodeMap.forEach((node) => topo.nodes.push(node.data));
        state.linkMap.forEach((edge) => topo.links.push(edge.data));

        return topo;
      },

      applyNodeChanges(changes) {
        set((state) =>
          produce(state, (draft) => {
            const nodes = applyReactNodeChanges(
              changes,
              state.getReactFlowNodes()
            );
            changes.forEach((c) => {
              const node = nodes.find((node) => c.id === node.id);
              if (node) {
                draft.nodeMap.set(node.id, node);
              }
            });
          })
        );
      },

      applyEdgeChanges(changes) {
        set((state) =>
          produce(state, (draft) => {
            const edges = applyReactEdgeChanges(
              changes,
              state.getReactFlowEdges()
            );
            changes.forEach((c) => {
              const edge = edges.find((edge) => c.id === edge.id);
              if (edge) {
                draft.linkMap.set(edge.id, edge);
              }
            });
          })
        );
      },

      async rearrangeTopo(algo: string = 'mrtree') {
        const state = get();
        const elk = new ELK();

        const graph = {
          id: 'root',
          layoutOptions: {
            'elk.algorithm': algo,
          },
          children: state.getReactFlowNodes().map((n) => ({
            ...JSON.parse(JSON.stringify(n)),
          })),
          edges: state.getReactFlowEdges().map((e) => ({
            ...JSON.parse(JSON.stringify(e)),
            sources: [e.source],
            targets: [e.target],
          })),
        };

        const g = await elk.layout(graph);

        const renderGraph: any = {
          nodes: !g.children
            ? []
            : g.children.map((node) => {
                return {
                  ...node,
                  position: {
                    x: node.x ?? 0,
                    y: node.y ?? 0,
                  },
                };
              }),
          edges: !g.edges
            ? []
            : g.edges.map((edge) => {
                return {
                  ...edge,
                };
              }),
        };

        state.setNodes(renderGraph.nodes);
        state.setEdges(renderGraph.edges);
      },

      setNodes(nodes) {
        set((state) => {
          const newNodeMap = new Map<string, ReactFlowNode>(
            nodes.map((node) => [node.id, node])
          );
          return {
            nodeMap: newNodeMap,
            numNodes: nodes.length,
          };
        });
      },

      setEdges(edges) {
        set((state) => {
          const newLinkMap = new Map<string, ReactFlowEdge>(
            edges.map((edge) => [edge.id, edge])
          );
          return {
            linkMap: newLinkMap,
          };
        });
      },

      addLink(link) {
        set((state) =>
          produce(state, (draft) => {
            draft.linkMap.set(link.id, link);
          })
        );
      },
      addNode(node) {
        let n = JSON.parse(JSON.stringify(node));
        set((state) =>
          produce(state, (draft) => {
            n.data.nodeNum = draft.numNodes++;
            draft.nodeMap.set(node.id, node);
          })
        );
      },

      getTopoJson() {
        const state = get();
        const topo = {
          nodes: state.getReactFlowNodes().map((node) => node.data),
          links: state.getReactFlowEdges().map((edge) => edge.data),
        };
        return topo;
      },

      createEdge(conn: Connection) {
        const state = get();
        const uuid = v4();
        conn.sourceHandle;
        const edgeData: NetLink = {
          src: state.nodeMap.get(conn.source ?? '')?.data.hostname,
          dest: state.nodeMap.get(conn.target ?? '')?.data.hostname,
        };
        const edge: ReactFlowLink = {
          id: uuid,
          type: 'dataEdge',
          target: conn.target ?? '',
          source: conn.source ?? '',
          sourceHandle: conn.sourceHandle,
          targetHandle: conn.targetHandle,
          data: edgeData,
        };

        state.addLink(edge);

        return edge;
      },

      createHost(position) {
        const state = get();
        const numNode = state.numNodes;
        const uuid = v4();
        const hostData: NetHostNode = {
          type: 'host',
          subType: 'default',
          numNode: numNode,
          sched: 'proc',
          hostname: 'h' + numNode,
          label: 'h' + numNode,
        };
        const host: ReactFlowHostNode = {
          id: uuid,
          type: 'hostNode',
          position: position,
          width: 100,
          height: 100,
          data: hostData,
        };

        state.addNode(host);

        return host;
      },

      createSwitch(position) {
        const state = get();
        const numNode = state.numNodes;
        const uuid = v4();
        const switchData: NetSwitchNode = {
          type: 'switch',
          numNode: numNode,
          subType: 'default',
          netFlow: false,
          sFlow: true,
          hostname: 's' + numNode,
          label: 's' + numNode,
        };
        const switchNode: ReactFlowSwitchNode = {
          id: uuid,
          type: 'switchNode',
          position: position,
          width: 100,
          height: 100,
          data: switchData,
        };

        state.addNode(switchNode);

        return switchNode;
      },

      createController(position) {
        const state = get();
        const numNode = state.numNodes;
        const uuid = v4();
        const controllerData: NetControllerNode = {
          type: 'controller',
          subType: 'ovs',
          ip: '127.0.0.1',
          port: '6633',
          protocol: 'tcp',
          hostname: 's' + numNode,
          label: 's' + numNode,
        };
        const controllerNode: ReactFlowControllerNode = {
          id: uuid,
          type: 'controllerNode',
          position: position,
          width: 100,
          height: 100,
          data: controllerData,
        };

        state.addNode(controllerNode);

        return controllerNode;
      },

      createNode(type, position) {
        const state = get();
        switch (type) {
          case 'hostNode':
            return state.createHost(position);
          case 'switchNode':
            return state.createSwitch(position);
          case 'controllerNode':
            return state.createController(position);
          default:
            // TODO: fix it
            return state.createHost(position);
        }
      },
    }),
    { serialize: { options: { map: true } } }
  )
);
