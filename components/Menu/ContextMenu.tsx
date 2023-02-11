import { AddIcon } from '@chakra-ui/icons';
import { Menu, MenuButton, MenuItem, MenuList, Text } from '@chakra-ui/react';
import { Node, useReactFlow, XYPosition } from 'reactflow';
import { v4 } from 'uuid';

export type ContextMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  coordinate: XYPosition;
  addNode: (node: Node) => void;
};

const nodeTypes = ['hostNode', 'switchNode', 'controllerNode'];

const ContextMenu = (props: ContextMenuProps) => {
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
              const uuid = v4();
              props.addNode({
                id: uuid,
                type: type,
                position: project(props.coordinate),
                data: { label: type },
              });
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
