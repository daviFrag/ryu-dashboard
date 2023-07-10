import { Node as ReactFlowNode } from 'reactflow';
import { v4 } from 'uuid';
import { Edge } from '../Edge/Edge';

export type NodeProps = {
  id: string;
  label: string;
  pos: NodePosition;
  edges?: Edge[];
};

export type NodePosition = {
  x: number;
  y: number;
};

export abstract class Node {
  id: string;
  label: string;
  pos: NodePosition;
  edges: Edge[];

  constructor(props: NodeProps) {
    this.id = props.id ?? v4();
    this.label = props.label;
    this.pos = props.pos;
    this.edges = props.edges ?? [];
  }

  abstract getReactFlowNode(): ReactFlowNode;

  setPos(pos: NodePosition) {
    this.pos = pos;
  }

  getPos() {
    return this.pos;
  }

  setEdges(edges: Edge[]): void {
    this.edges = edges;
  }

  addEdge(edge: Edge) {
    this.edges.push(edge);
  }

  getId(): string {
    return this.id;
  }
}
