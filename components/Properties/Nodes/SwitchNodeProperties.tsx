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
  const [sliderValue, setSliderValue] = useState(5);
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <form>
      <VStack mb={5}>
        <FormControl>
          <FormLabel>Hostname:</FormLabel>
          <Input placeholder="Insert hostname..." />
        </FormControl>
        <FormControl>
          <FormLabel>DPID</FormLabel>
          <Input placeholder="Insert DPID..." />
        </FormControl>
        <FormControl>
          <Flex justifyItems={'center'} gap={2}>
            <Checkbox />
            <Text>Enable NetFlow</Text>
          </Flex>
        </FormControl>
        <FormControl>
          <Flex justifyItems={'center'} gap={2}>
            <Checkbox />
            <Text>Enable sFlow</Text>
          </Flex>
        </FormControl>
        <FormControl>
          <FormLabel>Switch Type:</FormLabel>
          <Select placeholder="Select option" defaultValue={'option1'}>
            <option value="option1">Default</option>
            <option value="option2">Open vSwitch Kernel Mode</option>
            <option value="option3">Indigo Virtual Switch</option>
            <option value="option4">Userspace Switch</option>
            <option value="option5">Userspace Switch inNamespace</option>
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>IP Address:</FormLabel>
          <Input placeholder="Insert ip idress..." />
        </FormControl>
        <FormControl>
          <FormLabel>DPCTL port:</FormLabel>
          <Input placeholder="Insert DPCTL port..." />
        </FormControl>
        <FormControl>
          <FormLabel>Start Command:</FormLabel>
          <Input placeholder="Insert start command..." />
        </FormControl>
        <FormControl>
          <FormLabel>Stop Command:</FormLabel>
          <Input placeholder="Insert stop command..." />
        </FormControl>
      </VStack>
    </form>
  );
};

export default SwitchNodeProperties;
