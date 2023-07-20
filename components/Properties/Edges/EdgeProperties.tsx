import {
  Flex,
  FormControl,
  FormLabel,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useNetStore } from '../../../data/zustand/net';

const EdgeProperties = () => {
  const { getSelectedElement, updateEdge } = useNetStore();
  const selectedElement = getSelectedElement();

  const [showTooltip, setShowTooltip] = useState(false);

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
        <FormControl>
          <FormLabel>Bandwidth: </FormLabel>
          <Flex justifyItems={'center'} alignItems={'center'} gap={2}>
            <NumberInput
              value={selectedElement.data.bw ?? ''}
              onChange={(value) => {
                let updatedEdge = JSON.parse(JSON.stringify(selectedElement));
                updatedEdge.data['bw'] = value;
                updateEdge(updatedEdge);
              }}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <Text>mbps</Text>
          </Flex>
        </FormControl>
        <FormControl>
          <FormLabel>Delay:</FormLabel>
          <Flex justifyItems={'center'} alignItems={'center'} gap={2}>
            <NumberInput
              value={selectedElement.data.delay ?? ''}
              onChange={(value) => {
                let updatedEdge = JSON.parse(JSON.stringify(selectedElement));
                updatedEdge.data['delay'] = value;
                updateEdge(updatedEdge);
              }}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <Text>ms</Text>
          </Flex>
        </FormControl>
        <FormControl>
          <FormLabel>Delay:</FormLabel>
          <Slider
            id="slider"
            defaultValue={0}
            min={0}
            max={100}
            // colorScheme="#FFF"
            value={(selectedElement.data.loss ?? 0) * 100}
            fill={'#4762af'}
            onChange={(v) => {
              let updatedEdge = JSON.parse(JSON.stringify(selectedElement));
              updatedEdge.data['loss'] = v / 100;
              updateEdge(updatedEdge);
            }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <SliderMark value={25} mt="1" ml="-2.5" fontSize="sm">
              25%
            </SliderMark>
            <SliderMark value={50} mt="1" ml="-2.5" fontSize="sm">
              50%
            </SliderMark>
            <SliderMark value={75} mt="1" ml="-2.5" fontSize="sm">
              75%
            </SliderMark>
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <Tooltip
              hasArrow
              bg="#4762af"
              color="white"
              placement="top"
              isOpen={showTooltip}
              label={`${(selectedElement.data.loss ?? 0) * 100}%`}
            >
              <SliderThumb />
            </Tooltip>
          </Slider>
        </FormControl>
      </VStack>
    </form>
  );
};

export default EdgeProperties;
