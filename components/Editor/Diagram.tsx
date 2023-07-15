import { Flex, useDisclosure } from '@chakra-ui/react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Edge,
  MiniMap,
  Node,
  NodeMouseHandler,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
  ReactFlowProvider,
  XYPosition,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  useReactFlow,
} from 'reactflow';

import 'reactflow/dist/style.css';
import { Graph } from '../../data/models/Graph';
import DataEdge from '../Edges/DataEdge';
import ContextMenu from '../Menu/ContextMenu';
import EditorNav from '../Navbars/EditorNav';
import ControllerNode from '../Nodes/ControllerNode';
import HostNode from '../Nodes/HostNode';
import SwitchNode from '../Nodes/SwitchNode';
import { PropertySideBar } from '../SideBar/PropertySideBar';

export type OnPaneContextMenu = (event: React.MouseEvent) => void;

export type DiagramProps = {};

const exampleTopology = {
  hosts: ['h0', 'h1', 'h2', 'h3', 'h4'],
  switches: ['s0', 's1', 's2', 's3', 's4', 's5'],
  controllers: [],
  links: [
    's0-s1',
    's1-s2',
    's2-s3',
    's3-s4',
    's0-s5',
    's0-h0',
    's0-h1',
    's0-h2',
    's1-h3',
    's1-h4',
  ],
};

const Diagram = (props: DiagramProps) => {
  const { fitView } = useReactFlow();

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

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

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
  const {
    isOpen: isOpenProperty,
    onOpen: onOpenProperty,
    onClose: onCloseProperty,
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

  const onNodeClick: NodeMouseHandler = (e, node) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = {
      x: e.clientX,
      y: e.clientY,
    };

    console.log(pos);
    fitView({ nodes: [node], duration: 800, minZoom: 4, maxZoom: 6 });

    setMenuPos(pos);
    onOpenProperty();
    onOpenHost();
  };

  const addNode = (n: Node) => setNodes((prev) => [...prev, n]);

  useEffect(() => {
    (async () => {
      const g = new Graph(exampleTopology);
      const render = await g.getRender();
      setNodes(render.nodes);
      setEdges(render.edges);
    })();
  }, []);

  return (
    <Flex direction={'column'} h="100vh" w="full">
      <EditorNav saveFunc={async () => void 0} />
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
      {/* <HostMenu pos={menuPos} isOpen={isOpenHost} onClose={onCloseHost} /> */}
      <PropertySideBar
        isOpen={isOpenProperty}
        onClose={() => {
          fitView({ nodes: nodes, duration: 800 });
          onCloseProperty();
        }}
      />
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
