import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  SlideOptions,
} from '@chakra-ui/react';

type PropertySideBarProps = {
  isOpen: boolean;
  onClose: () => void;
  placement?: SlideOptions['direction'] | 'start' | 'end';
};

export const PropertySideBar = ({
  isOpen,
  onClose,
  placement = 'right',
}: PropertySideBarProps) => {
  return (
    <Drawer placement={placement} onClose={onClose} isOpen={isOpen}>
      <DrawerContent>
        <DrawerHeader borderBottomWidth="1px">
          <DrawerCloseButton />
          Basic Drawer
        </DrawerHeader>
        <DrawerBody>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};
