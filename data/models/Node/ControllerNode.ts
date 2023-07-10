import { Node as ReactFlowNode } from 'reactflow';
import { Node, NodeProps } from './Node';

export type ControllerNodeProps = NodeProps & {};

export class ControllerNode extends Node {
  constructor(props: ControllerNodeProps) {
    super(props);
  }
  getReactFlowNode(): ReactFlowNode {
    return {
      id: this.id + '',
      type: 'controllerNode',
      position: this.pos,
      data: { label: this.label },
    };
  }
}
