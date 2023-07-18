'use client';

import { Flex } from '@chakra-ui/react';
import { useEffect } from 'react';
import { Edge, Node } from 'reactflow';
import Diagram from '../../components/Editor/Diagram';
import { useHasHydrated } from '../../utils';

const initGraph = async () => {
  // await axios.post('http://localhost:7000/topology');
};

export type Topology = {
  hosts: string[];
  controllers: string[];
  switches: string[];
  links: string[];
};

export type Graph = {
  nodes: Node[];
  edges: Edge[];
};

const Graph = () => {
  const hasHydrated = useHasHydrated();

  useEffect(() => {
    (async () => {
      if (hasHydrated) await initGraph();
    })();
  }, [hasHydrated]);

  return (
    <Flex h="screen" w="screen">
      <Diagram />
    </Flex>
  );
};

export default Graph;
