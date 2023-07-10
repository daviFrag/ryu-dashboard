import { Edge as ReactFlowEdge } from 'reactflow';
import { Edge } from './Edge';

export class DataEdge extends Edge {
  getReactFlowEdge(): ReactFlowEdge {
    return {
      id: this.id,
      type: 'dataEdge',
      source: this.source.getId(),
      target: this.target.getId(),
    };
  }
}
