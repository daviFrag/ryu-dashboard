import { Node as ReactFlowNode } from 'reactflow';
import { Node } from './Node';

export class HostNode extends Node {
  getReactFlowNode(): ReactFlowNode {
    return {
      id: this.id + '',
      type: 'hostNode',
      position: this.pos,
      data: { label: this.label },
    };
  }
  getType(): string {
    return 'hostNode';
  }
}
