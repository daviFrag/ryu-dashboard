import {
  Button,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Text,
} from '@chakra-ui/react';
import { XYPosition } from 'reactflow';

export type HostMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  pos: XYPosition;
};

const HostMenu = (props: HostMenuProps) => {
  return (
    <Popover isOpen={props.isOpen} placement="right">
      <PopoverTrigger>
        <Button
          disabled
          w={0}
          h={0}
          position="absolute"
          top={props.pos.y}
          left={props.pos.x}
        />
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton onClick={props.onClose} />
        <PopoverHeader fontWeight="bold">Properties</PopoverHeader>
        <PopoverBody>
          <Text>Controller</Text>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default HostMenu;
