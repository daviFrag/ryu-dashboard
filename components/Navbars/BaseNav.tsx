import { Text } from '@chakra-ui/react';
import Nav from '../Layout/Nav';

const BaseNav = () => {
  return (
    <Nav>
      <Text fontWeight={'bold'} fontSize="lg">
        Dashboard
      </Text>
    </Nav>
  );
};

export default BaseNav;
