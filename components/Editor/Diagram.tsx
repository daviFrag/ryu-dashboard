import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';

const Diagram = () => {
  return (
    <ReactFlow>
      <Background />
      <Controls />
    </ReactFlow>
  );
};

export default Diagram;
