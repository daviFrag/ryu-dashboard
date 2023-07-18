import { enableMapSet, produce } from 'immer';
import {
  Edge,
  Node,
  applyEdgeChanges as applyReactEdgeChanges,
  applyNodeChanges as applyReactNodeChanges,
} from 'reactflow';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type NetNode = {
  type: string;
  subType?: string;
  hostName: string;
};

export type NetHostNode = NetNode & {
  type: 'host';
  ip: string;
  defaultRoute: string;
  sched: string;
  cpu?: number;
  cores?: number;
  startCommand?: string;
  stopCommand?: string;
  vlanInterfaces: VLANInterface[];
  externalInterfaces: string[];
};

export type NetSwitchNode = NetNode & {
  type: 'switch';
  subType: 'default' | 'ovk' | 'ivs' | 'user' | 'usern';
  enableNetFlow: boolean;
  enableSFlow: boolean;
  ip?: string;
  dpctl?: string;
  externalInterfaces: string[];
};

export type NetControllerNode = NetNode & {
  type: 'controller';
  subType: 'remote' | 'ofr' | 'ovs' | 'ryu';
  controllerPort: number;
  protocol: 'tcp' | 'ssl';
  ip: string;
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
}

enableMapSet();

export const useNetStore = create<NetState>()(
  devtools((set, get) => ({
    numNodes: 0,
    nodeMap: new Map<string, ReactFlowNode>(),
    linkMap: new Map<string, ReactFlowEdge>(),

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
      set((state) =>
        produce(state, (draft) => {
          draft.nodeMap.set(node.id, node);
          draft.numNodes = draft.numNodes + 1;
        })
      );
    },
  }))
);
