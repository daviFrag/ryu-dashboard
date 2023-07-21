import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
} from '@chakra-ui/react';
import { useState } from 'react';
import Terminal, { ColorMode, TerminalOutput } from 'react-terminal-ui';

export default function TerminalPanel() {
  const [terminalLineData, setTerminalLineData] = useState([
    <TerminalOutput key={0}>
      Welcome to the React Terminal UI Demo!
    </TerminalOutput>,
  ]);

  return (
    <Drawer
      isOpen={true}
      onClose={() => {}}
      placement={'bottom'}
      size={{ base: 'xs', xl: 'md' }}
    >
      <DrawerContent>
        <DrawerHeader borderBottomWidth="1px">
          <DrawerCloseButton />
          Terminal
        </DrawerHeader>
        <DrawerBody>
          <Terminal
            height="30vh"
            name=""
            colorMode={ColorMode.Light}
            onInput={(terminalInput) =>
              console.log(`New terminal input received: '${terminalInput}'`)
            }
          >
            {terminalLineData}
          </Terminal>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
