import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  SlideOptions,
  useBreakpointValue,
} from '@chakra-ui/react';
import ControllerNodeProperties from '../Properties/Nodes/ControllerNodeProperties copy';

type PlacementType = SlideOptions['direction'] | 'start' | 'end';

type PropertySideBarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const PropertySideBar = ({ isOpen, onClose }: PropertySideBarProps) => {
  const respPlacement = useBreakpointValue<PlacementType>(
    {
      base: 'bottom',
      md: 'bottom',
      sm: 'bottom',
      xs: 'bottom',
      lg: 'right',
    },
    {
      // Breakpoint to use when mediaqueries cannot be used, such as in server-side rendering
      // (Defaults to 'base')
      fallback: 'lg',
    }
  );
  return (
    <Drawer
      placement={respPlacement}
      onClose={onClose}
      isOpen={isOpen}
      size={{ base: 'xs', xl: 'md' }}
    >
      <DrawerContent>
        <DrawerHeader borderBottomWidth="1px">
          <DrawerCloseButton />
          Properties
        </DrawerHeader>
        <DrawerBody>
          <ControllerNodeProperties />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};
