import { Flex } from '@chakra-ui/react';

type NavProps = {
  children?: React.ReactNode;
  p?: number;
  bg?: string;
  justify?: string;
};

export default function Nav({ children, p, bg, justify }: NavProps) {
  return (
    <Flex
      as="nav"
      align="center"
      justify={justify || 'space-between'}
      wrap="wrap"
      p={p || 4}
      bg={bg || 'black'}
      color={'white'}
    >
      {children}
    </Flex>
  );
}
