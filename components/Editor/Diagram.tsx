import { Flex, useDisclosure } from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  NodeMouseHandler,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
  ReactFlowProvider,
  XYPosition,
  addEdge,
  useOnSelectionChange,
  useReactFlow,
  useStoreApi,
} from 'reactflow';

import 'reactflow/dist/style.css';
import { Graph } from '../../data/models/Graph';
import { useNetStore } from '../../data/zustand/net';
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

const edgeTypes = {
  dataEdge: DataEdge,
};

const nodeTypes = {
  switchNode: SwitchNode,
  hostNode: HostNode,
  controllerNode: ControllerNode,
};

const Diagram = (props: DiagramProps) => {
  const {
    selectedElement,
    setNodes,
    setEdges,
    getReactFlowEdges,
    getReactFlowNodes,
    applyNodeChanges,
    applyEdgeChanges,
    setSelectedElement,
  } = useNetStore();
  const { fitView } = useReactFlow();

  const { resetSelectedElements } = useStoreApi().getState();

  // const [selectedElement, setSelectedElement] = useState<Node | Edge>();

  useOnSelectionChange({
    onChange: ({ nodes, edges }) => {
      if (nodes.length > 0)
        return setSelectedElement({ type: 'node', id: nodes[0].id });
      if (edges.length > 0)
        return setSelectedElement({ type: 'edge', id: edges[0].id });
      setSelectedElement(undefined);
    },
  });

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

  const {
    isOpen: isOpenMenu,
    onOpen: onOpenMenu,
    onClose: onCloseMenu,
  } = useDisclosure();
  const {
    isOpen: isOpenProperty,
    onOpen: onOpenProperty,
    onClose: onCloseProperty,
  } = useDisclosure();
  const [menuPos, setMenuPos] = useState<XYPosition>({ x: 0, y: 0 });

  const onNodesChange = useCallback<OnNodesChange>(
    (changes) => applyNodeChanges(changes),
    [applyNodeChanges]
  );
  const onEdgesChange = useCallback<OnEdgesChange>(
    (changes) => applyEdgeChanges(changes),
    [applyEdgeChanges]
  );

  const onConnect = useCallback<OnConnect>(
    (params) => setEdges(addEdge(params, getReactFlowEdges())),
    [getReactFlowEdges, setEdges]
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
  };

  const onNodeClick: NodeMouseHandler = (e, node) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = {
      x: e.clientX,
      y: e.clientY,
    };

    fitView({ nodes: [node], duration: 800, minZoom: 4, maxZoom: 6 });

    setMenuPos(pos);
    onOpenProperty();
  };

  useEffect(() => {
    (async () => {
      const g = new Graph(exampleTopology);
      const render = await g.getRender();
      setNodes(render.nodes);
      setEdges(render.edges);
    })();
  }, [setEdges, setNodes]);

  return (
    <Flex direction={'column'} h="100vh" w="100vw">
      <EditorNav saveFunc={async () => void 0} />
      <ReactFlow
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodes={getReactFlowNodes()}
        edges={getReactFlowEdges()}
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
      />
      {/* <HostMenu pos={menuPos} isOpen={isOpenHost} onClose={onCloseHost} /> */}
      <PropertySideBar
        isOpen={isOpenProperty}
        onClose={() => {
          fitView({ nodes: getReactFlowNodes(), duration: 800 });
          resetSelectedElements();
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
