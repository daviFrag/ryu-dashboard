import {
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useNetStore } from '../../../data/zustand/net';

const SwitchNodeProperties = () => {
  return (
    <>
      <Tabs maxH={'30vh'}>
        <TabList>
          <Tab>General</Tab>
          <Tab>External Interfaces</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <GeneralForm />
          </TabPanel>
          <TabPanel>
            <ExtForm />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
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
  const [sliderValue, setSliderValue] = useState(5);
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
            disabled={true}
            onChange={(e) => {
              let updatedNode = JSON.parse(JSON.stringify(selectedElement));
              updatedNode.data['hostname'] = e.currentTarget.value;
              updateNode(updatedNode);
            }}
          />
        </FormControl>
        <FormControl>
          <Flex justifyItems={'center'} gap={2}>
            <Checkbox
              isChecked={selectedElement.data.netFlow}
              onChange={(e) => {
                let updatedNode = JSON.parse(JSON.stringify(selectedElement));
                updatedNode.data['netFlow'] = e.currentTarget.checked;
                console.log(e.currentTarget.checked);
                updateNode(updatedNode);
              }}
            />
            <Text>Enable NetFlow (experimental)</Text>
          </Flex>
        </FormControl>
        <FormControl>
          <Flex justifyItems={'center'} gap={2}>
            <Checkbox
              isChecked={selectedElement.data.sFlow}
              onChange={(e) => {
                let updatedNode = JSON.parse(JSON.stringify(selectedElement));
                updatedNode.data['sFlow'] = e.currentTarget.checked;
                updateNode(updatedNode);
              }}
            />
            <Text>Enable sFlow</Text>
          </Flex>
        </FormControl>
        <FormControl>
          <FormLabel>Switch Type:</FormLabel>
          <Select
            placeholder="Select option"
            value={selectedElement.data.subType ?? 'default'}
            onChange={(e) => {
              let updatedNode = JSON.parse(JSON.stringify(selectedElement));
              updatedNode.data['subType'] = e.currentTarget.value;
              updateNode(updatedNode);
            }}
          >
            <option value="default">Default</option>
            <option value="ovk">Open vSwitch Kernel Mode</option>
            <option value="ivs">Indigo Virtual Switch</option>
            <option value="user">Userspace Switch</option>
            <option value="usern">Userspace Switch inNamespace</option>
          </Select>
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
          <FormLabel>DPCTL port:</FormLabel>
          <Input
            placeholder="Insert DPCTL port..."
            value={selectedElement.data.dpctl ?? ''}
            onChange={(e) => {
              let updatedNode = JSON.parse(JSON.stringify(selectedElement));
              updatedNode.data['dpctl'] = e.currentTarget.value;
              updateNode(updatedNode);
            }}
          />
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

export default SwitchNodeProperties;
