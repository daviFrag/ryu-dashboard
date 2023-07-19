import { FormControl, FormLabel, Input, VStack } from '@chakra-ui/react';
import { useNetStore } from '../../../data/zustand/net';

const EdgeProperties = () => {
  const { getSelectedElement, updateEdge } = useNetStore();
  const selectedElement = getSelectedElement();

  if (!selectedElement) return null;
  return (
    <form>
      <VStack mb={5}>
        <FormControl>
          <FormLabel>Source:</FormLabel>
          <Input value={selectedElement.data.src ?? ''} disabled={true} />
        </FormControl>
        <FormControl>
          <FormLabel>Target:</FormLabel>
          <Input value={selectedElement.data.dest ?? ''} disabled={true} />
        </FormControl>
      </VStack>
    </form>
  );
};

export default EdgeProperties;
