import {
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
} from '@chakra-ui/react';
import { useNetStore } from '../../../data/zustand/net';

const ControllerNodeProperties = () => {
  const { getSelectedElement, updateNode } = useNetStore();
  const selectedElement = getSelectedElement();

  if (!selectedElement) return null;
  return (
    <form>
      <VStack mb={5}>
        <FormControl>
          <FormLabel>Hostname:</FormLabel>
          <Input
            placeholder="Insert name..."
            value={selectedElement.data.hostname ?? ''}
            onChange={(e) => {
              let updatedNode = JSON.parse(JSON.stringify(selectedElement));
              updatedNode.data['hostname'] = e.currentTarget.value;
              updateNode(updatedNode);
            }}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Controller port</FormLabel>
          <Input
            placeholder="Insert controller port..."
            value={selectedElement.data.port ?? ''}
            onChange={(e) => {
              let updatedNode = JSON.parse(JSON.stringify(selectedElement));
              updatedNode.data['port'] = e.currentTarget.value;
              updateNode(updatedNode);
            }}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Controller Type:</FormLabel>
          <Select
            placeholder="Select option"
            value={selectedElement.data.subType ?? 'ofr'}
            onChange={(e) => {
              let updatedNode = JSON.parse(JSON.stringify(selectedElement));
              updatedNode.data['subType'] = e.currentTarget.value;
              updateNode(updatedNode);
            }}
          >
            <option value="ofr">OpenFlow Reference</option>
            <option value="remote">Remote Controller</option>
            <option value="ovs">OVS Controller</option>
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>Protocol:</FormLabel>
          <Select
            placeholder="Select option"
            value={selectedElement.data.protocol ?? 'tcp'}
            onChange={(e) => {
              let updatedNode = JSON.parse(JSON.stringify(selectedElement));
              updatedNode.data['protocol'] = e.currentTarget.value;
              updateNode(updatedNode);
            }}
          >
            <option value="tcp">TCP</option>
            <option value="ssl">SSL</option>
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>IP Address</FormLabel>
          <Input
            placeholder="Insert IP Address..."
            value={selectedElement.data.ip ?? ''}
            onChange={(e) => {
              let updatedNode = JSON.parse(JSON.stringify(selectedElement));
              updatedNode.data['ip'] = e.currentTarget.value;
              updateNode(updatedNode);
            }}
          />
        </FormControl>
      </VStack>
    </form>
  );
};

export default ControllerNodeProperties;
