import { AddIcon } from '@chakra-ui/icons';
import { Menu, MenuButton, MenuItem, MenuList, Text } from '@chakra-ui/react';
import { XYPosition, useReactFlow } from 'reactflow';
import { useNetStore } from '../../data/zustand/net';

export type ContextMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  coordinate: XYPosition;
};

const nodeTypes = ['hostNode', 'switchNode', 'controllerNode'];

const ContextMenu = (props: ContextMenuProps) => {
  const { createNode } = useNetStore();
  const { project } = useReactFlow();

  return (
    <Menu isOpen={props.isOpen}>
      <MenuButton
        display={'hidden'}
        style={{
          position: 'absolute',
          marginTop: props.coordinate.y,
          marginLeft: props.coordinate.x,
        }}
      />
      <MenuList>
        {nodeTypes.map((type, key) => (
          <MenuItem
            key={key}
            onClick={() => {
              createNode(type, project(props.coordinate));
              props.onClose();
            }}
          >
            <AddIcon />
            <Text marginLeft={2}>Add {type}</Text>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default ContextMenu;
