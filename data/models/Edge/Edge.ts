import { Edge as ReactFlowEdge } from 'reactflow';
import { v4 } from 'uuid';
import { Node } from '../Node/Node';

export abstract class Edge {
  protected source: Node;
  protected target: Node;
  protected id: string;

  constructor({ source, target }: { source: Node; target: Node }) {
    this.source = source;
    this.target = target;
    this.id = v4();
  }

  abstract getReactFlowEdge(): ReactFlowEdge;

  getSource() {
    return this.source;
  }
  getTarget() {
    return this.target;
  }
}
