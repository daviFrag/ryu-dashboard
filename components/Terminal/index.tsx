import { Flex } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import Terminal, {
  ColorMode,
  TerminalInput,
  TerminalOutput,
} from 'react-terminal-ui';
import useWebSocket, { ReadyState } from 'react-use-websocket';

import './Terminal.css';

type Log = {
  cmd: string;
  output: string;
};

export type TerminalPanelProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const TerminalPanel = (props: TerminalPanelProps) => {
  if (!props.isOpen) return null;
  return <TerminalObj {...props} />;
};

let buffer = '';

const TerminalObj = ({ onClose }: TerminalPanelProps) => {
  const [lastCmd, setLastCmd] = useState<string>('');
  const [logs, setLogs] = useState<Log[]>([]);

  const { sendJsonMessage, readyState } = useWebSocket(
    'ws://localhost:7000/shell?sid=123',
    {
      onMessage(event) {
        const bufferCopy = buffer;
        if (event.data == '___STOP___') {
          setLogs((prev) => [...prev, { cmd: lastCmd, output: bufferCopy }]);
          buffer = '';
          return;
        }

        buffer += event.data;
      },
    }
  );

  // If the ws is closed close the terminal (on errors or on quit)
  useEffect(() => {
    if (readyState === ReadyState.CLOSED) onClose();
  }, [onClose, readyState]);

  return (
    <Terminal
      // prompt="mininet>"
      height="30vh"
      name=""
      colorMode={ColorMode.Dark}
      onInput={(terminalInput) => {
        if (terminalInput === 'clear') {
          setLogs([]);
          return;
        }
        setLastCmd(terminalInput);
        sendJsonMessage({ shell: '123', data: terminalInput });
      }}
      redBtnCallback={onClose}
    >
      <Flex direction="column">
        {logs.map((log, id) => (
          <div key={id}>
            <TerminalInput>{log.cmd}</TerminalInput>
            <TerminalOutput>{log.output}</TerminalOutput>
          </div>
        ))}
        <TerminalOutput>{buffer}</TerminalOutput>
      </Flex>
    </Terminal>
  );
};
