import { Node as ReactFlowNode } from 'reactflow';
import { Node } from './Node';

export class SwitchNode extends Node {
  getReactFlowNode(): ReactFlowNode {
    return {
      id: this.id + '',
      type: 'switchNode',
      position: this.pos,
      data: { label: this.label },
    };
  }
}
