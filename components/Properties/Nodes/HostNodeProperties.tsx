import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
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
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tooltip,
  VStack,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useNetStore } from '../../../data/zustand/net';

const HostNodeProperties = () => {
  return (
    <>
      <Tabs maxH={'30vh'}>
        <TabList>
          <Tab>General</Tab>
          <Tab>VLAN Interfaces</Tab>
          <Tab>External Interfaces</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <GeneralForm />
          </TabPanel>
          <TabPanel>
            <VlanForm />
          </TabPanel>
          <TabPanel>
            <ExtForm />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};

const VlanForm = () => {
  return (
    <form>
      <FormControl>
        <FormLabel>
          <Grid templateColumns="repeat(2, 1fr)">
            <GridItem>IP Address</GridItem>
            <GridItem>VLAN ID</GridItem>
          </Grid>
        </FormLabel>
        <Flex gap={2}>
          <Input />
          <Input />
          <Button>x</Button>
        </Flex>
        <Flex gap={2}>
          <Input />
          <Input />
          <Button>+</Button>
        </Flex>
      </FormControl>
    </form>
  );
};

const ExtForm = () => {
  return (
    <form>
      <FormControl>
        <FormLabel>Interface name:</FormLabel>
        <Flex gap={2}>
          <Input />
          <Button>x</Button>
        </Flex>
        <Flex gap={2}>
          <Input />
          <Button>+</Button>
        </Flex>
      </FormControl>
    </form>
  );
};

const GeneralForm = () => {
  const { getSelectedElement, updateNode } = useNetStore();
  const [showTooltip, setShowTooltip] = useState(false);

  const selectedElement = getSelectedElement();

  if (!selectedElement) return null;

  return (
    <form>
      <VStack mb={5}>
        <FormControl>
          <FormLabel>Hostname:</FormLabel>
          <Input
            placeholder="Insert hostname..."
            value={selectedElement.data.hostname ?? ''}
            onChange={(e) => {
              let updatedNode = JSON.parse(JSON.stringify(selectedElement));
              updatedNode.data['hostname'] = e.currentTarget.value;
              updateNode(updatedNode);
            }}
          />
        </FormControl>
        <FormControl>
          <FormLabel>IP Address:</FormLabel>
          <Input
            placeholder="Insert ip idress..."
            value={selectedElement.data.ip ?? ''}
            onChange={(e) => {
              let updatedNode = JSON.parse(JSON.stringify(selectedElement));
              updatedNode.data['ip'] = e.currentTarget.value;
              updateNode(updatedNode);
            }}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Default Route:</FormLabel>
          <Input
            placeholder="Insert default route..."
            value={selectedElement.data.defaultRoute ?? ''}
            onChange={(e) => {
              let updatedNode = JSON.parse(JSON.stringify(selectedElement));
              updatedNode.data['defaultRoute'] = e.currentTarget.value;
              updateNode(updatedNode);
            }}
          />
        </FormControl>
        <FormControl>
          <FormLabel>CPU Amount:</FormLabel>
          <Slider
            id="slider"
            defaultValue={0}
            min={0}
            max={100}
            // colorScheme="#FFF"
            value={(selectedElement.data.cpu ?? 0) * 100}
            fill={'#4762af'}
            onChange={(v) => {
              let updatedNode = JSON.parse(JSON.stringify(selectedElement));
              updatedNode.data['cpu'] = v / 100;
              updateNode(updatedNode);
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
              label={`${(selectedElement.data.cpu ?? 0) * 100}%`}
            >
              <SliderThumb />
            </Tooltip>
          </Slider>
        </FormControl>
        <FormControl>
          <FormLabel>Cores:</FormLabel>
          <NumberInput defaultValue={0} min={0} max={8}>
            <NumberInputField
              value={selectedElement.data.cores ?? 0}
              onChange={(e) => {
                let updatedNode = JSON.parse(JSON.stringify(selectedElement));
                updatedNode.data['cores'] = e.currentTarget.value;
                updateNode(updatedNode);
              }}
            />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
        <FormControl>
          <FormLabel>Start Command:</FormLabel>
          <Input
            placeholder="Insert start command..."
            value={selectedElement.data.startCommand ?? ''}
            onChange={(e) => {
              let updatedNode = JSON.parse(JSON.stringify(selectedElement));
              updatedNode.data['startCommand'] = e.currentTarget.value;
              updateNode(updatedNode);
            }}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Stop Command:</FormLabel>
          <Input
            placeholder="Insert stop command..."
            value={selectedElement.data.stopCommand ?? ''}
            onChange={(e) => {
              let updatedNode = JSON.parse(JSON.stringify(selectedElement));
              updatedNode.data['stopCommand'] = e.currentTarget.value;
              updateNode(updatedNode);
            }}
          />
        </FormControl>
      </VStack>
    </form>
  );
};

export default HostNodeProperties;
