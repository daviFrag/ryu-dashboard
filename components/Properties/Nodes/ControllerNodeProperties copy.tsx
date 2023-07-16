import {
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
} from '@chakra-ui/react';

const ControllerNodeProperties = () => {
  return (
    <form>
      <VStack mb={5}>
        <FormControl>
          <FormLabel>Name:</FormLabel>
          <Input placeholder="Insert name..." />
        </FormControl>
        <FormControl>
          <FormLabel>Controller port</FormLabel>
          <Input placeholder="Insert DPID..." />
        </FormControl>
        <FormControl>
          <FormLabel>Controller Type:</FormLabel>
          <Select placeholder="Select option" defaultValue={'option1'}>
            <option value="option1">Remote Controller</option>
            <option value="option2">In-Band Controller</option>
            <option value="option3">OpenFlow Reference</option>
            <option value="option4">OVS Controller</option>
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>Protocol:</FormLabel>
          <Select placeholder="Select option" defaultValue={'option1'}>
            <option value="option1">TCP</option>
            <option value="option2">SSL</option>
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>IP Address</FormLabel>
          <Input placeholder="Insert IP Address..." />
        </FormControl>
      </VStack>
    </form>
  );
};

export default ControllerNodeProperties;
