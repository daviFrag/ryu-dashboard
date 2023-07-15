import { useEffect, useState } from 'react';
import { Node } from 'reactflow';
import { v4 } from 'uuid';
import { Graph, Topology } from './app/graph/page';

export const useHasHydrated = () => {
  const [hasHydrated, setHasHydrated] = useState<boolean>(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  return hasHydrated;
};

const addSwitch = (switchName: string, graph: Graph, topo: Topology) => {
  const links = topo.links.filter((value) =>
    value.split('-')[0].includes(switchName)
  );

  var lastSwitch = null;
  if (graph.nodes.length > 0) {
    lastSwitch = graph.nodes[graph.nodes.length - 1];
  }

  graph.nodes.push({
    id: v4(),
    type: 'switchNode',
    position: { x: 0, y: 0 },
    data: { label: switchName },
  });

  links.forEach((value, index) => {
    graph.nodes.push({
      id: v4(),
      type: 'hostNode',
      position: { x: 0, y: index * 50 },
      data: { label: value },
    });
  });
};

export const buildTopo = (topo: Topology) => {
  const graph: Graph = { nodes: [], edges: [] };

  // Add controller
  topo.controllers.forEach((value, index) => {
    graph.nodes.push({
      id: v4(),
      type: 'controllerNode',
      position: { x: 0, y: index * 100 },
      data: { label: value },
    });
  });

  // Add switches
  topo.switches.forEach((value, index) => {
    graph.nodes.push({
      id: v4(),
      type: 'switchNode',
      position: { x: 0, y: index * 100 },
      data: { label: value },
    });
  });

  // Add hosts
  topo.hosts.forEach((value, index) => {
    graph.nodes.push({
      id: v4(),
      type: 'hostNode',
      position: { x: 0, y: index * 100 },
      data: { label: value },
    });
  });

  // Add links
  topo.links.forEach((value, index) => {
    graph.edges.push({
      id: v4(),
      type: 'dataEdge',
      target: '',
      source: '',
      data: { label: value },
    });
  });

  return graph;
};

export const createNodes = (nodes: string[]) => {
  return nodes.map<Node>((value, index) => ({
    id: index + '',
    type: 'hostNode',
    position: { x: 0, y: index * 100 },
    data: { label: value },
  }));
};
