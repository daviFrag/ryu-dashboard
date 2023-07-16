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
          <FormLabel>IP Address:</FormLabel>
          <Input placeholder="Insert ip idress..." />
        </FormControl>
        <FormControl>
          <FormLabel>Default Route:</FormLabel>
          <Input placeholder="Insert default route..." />
        </FormControl>
        <FormControl>
          <FormLabel>CPU Amount:</FormLabel>
          <Slider
            id="slider"
            defaultValue={5}
            min={0}
            max={100}
            // colorScheme="#FFF"
            fill={'#4762af'}
            onChange={(v) => setSliderValue(v)}
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
              label={`${sliderValue}%`}
            >
              <SliderThumb />
            </Tooltip>
          </Slider>
        </FormControl>
        <FormControl>
          <FormLabel>Cores:</FormLabel>
          <NumberInput defaultValue={1} min={1} max={8}>
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
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

export default HostNodeProperties;
