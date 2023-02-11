import { Flex, useDisclosure } from '@chakra-ui/react';
import React, { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  Edge,
  MiniMap,
  Node,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
  ReactFlowProvider,
  XYPosition,
} from 'reactflow';

import 'reactflow/dist/style.css';
import DataEdge from '../Edges/DataEdge';
import ContextMenu from '../Menu/ContextMenu';
import HostMenu from '../Menu/HostMenu';
import ControllerNode from '../Nodes/ControllerNode';
import HostNode from '../Nodes/HostNode';
import SwitchNode from '../Nodes/SwitchNode';

export type OnPaneContextMenu = (event: React.MouseEvent) => void;

export type DiagramProps = {};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'controllerNode',
    position: { x: 0, y: 0 },
    data: { label: 'c0' },
  },
  {
    id: '2',
    type: 'switchNode',
    position: { x: 0, y: 100 },
    data: { label: 's0' },
  },
  {
    id: '3',
    type: 'hostNode',
    position: { x: -100, y: 200 },
    data: { label: 'h0' },
  },
  {
    id: '4',
    type: 'hostNode',
    position: { x: 100, y: 200 },
    data: { label: 'h1' },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    animated: true,
    type: 'dataEdge',
    data: {
      text: '',
      packets: 100,
    },
  },
  { id: 'e2-3', source: '2', target: '3' },
  { id: 'e2-4', source: '2', target: '4' },
];

const Diagram = (props: DiagramProps) => {
  const nodeTypes = useMemo(
    () => ({
      switchNode: SwitchNode,
      hostNode: HostNode,
      controllerNode: ControllerNode,
    }),
    []
  );

  const nodeColor = (node: Node) => {
    switch (node.type) {
      case 'switchNode':
        return '#6ede87';
      case 'hostNode':
        return '#6865A5';
      case 'controllerNode':
        return '#ff0072';
      default:
        return '##8B0000';
    }
  };

  const edgeTypes = useMemo(
    () => ({
      dataEdge: DataEdge,
    }),
    []
  );

  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const {
    isOpen: isOpenMenu,
    onOpen: onOpenMenu,
    onClose: onCloseMenu,
  } = useDisclosure();
  const {
    isOpen: isOpenHost,
    onOpen: onOpenHost,
    onClose: onCloseHost,
  } = useDisclosure();
  const [menuPos, setMenuPos] = useState<XYPosition>({ x: 0, y: 0 });

  const onNodesChange = useCallback<OnNodesChange>(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChange = useCallback<OnEdgesChange>(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const onConnect = useCallback<OnConnect>(
    (params) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const onPaneContextMenu = useCallback<OnPaneContextMenu>(
    (e) => {
      e.preventDefault();

      const rect = e.currentTarget.getBoundingClientRect();
      const pos = {
        x: e.clientX,
        y: e.clientY,
      };
      setMenuPos(pos);
      onOpenMenu();
    },
    [onOpenMenu]
  );

  const onPaneClick = (e: React.MouseEvent) => {
    e.preventDefault();

    onCloseMenu();
    onCloseHost();
  };

  const onNodeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = {
      x: e.clientX,
      y: e.clientY,
    };

    console.log(pos);

    setMenuPos(pos);
    onOpenHost();
  };

  const addNode = (n: Node) => setNodes((prev) => [...prev, n]);

  return (
    <Flex direction={'column'} h="100vh" w="full">
      <ReactFlow
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onConnect={onConnect}
        onPaneClick={onPaneClick}
        onPaneContextMenu={onPaneContextMenu}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap nodeColor={nodeColor} zoomable pannable />
      </ReactFlow>
      <ContextMenu
        coordinate={menuPos}
        isOpen={isOpenMenu}
        onClose={onCloseMenu}
        addNode={addNode}
      />
      <HostMenu pos={menuPos} isOpen={isOpenHost} onClose={onCloseHost} />
    </Flex>
  );
};

const DiagramWithProvider = (props: DiagramProps) => {
  return (
    <ReactFlowProvider>
      <Diagram {...props} />
    </ReactFlowProvider>
  );
};

export default DiagramWithProvider;
