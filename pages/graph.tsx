import { Flex } from '@chakra-ui/react';
import axios from 'axios';
import { useEffect } from 'react';
import Diagram from '../components/Editor/Diagram';
import { useHasHydrated } from '../utils';

const initGraph = async () => {
  await axios.post('http://localhost:7000/topology');
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
