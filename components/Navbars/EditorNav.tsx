import {
  ArrowRightIcon,
  CloseIcon,
  CopyIcon,
  EditIcon,
  ExternalLinkIcon,
} from '@chakra-ui/icons';
import {
  Box,
  Button,
  Flex,
  HStack,
  Spacer,
  Stack,
  Text,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react';
import { ReactNode, useEffect, useState } from 'react';
import { loadTopology } from '../../data/api';
import { useNetStore } from '../../data/zustand/net';
import { useHasHydrated } from '../../utils';
import Nav from '../Layout/Nav';

type EditorNavProps = {
  saveFunc: () => Promise<void>;
};

export default function EditorNav({ saveFunc }: EditorNavProps) {
  const { getTopoJson } = useNetStore();
  const hydrated = useHasHydrated();

  const [saveLoading, setSaveLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isOpenRun,
    onOpen: onOpenRun,
    onClose: onCloseRun,
  } = useDisclosure();
  const {
    isOpen: isOpenEdit,
    onOpen: onOpenEdit,
    onClose: onCloseEdit,
  } = useDisclosure();
  const {
    isOpen: isOpenSave,
    onOpen: onOpenSave,
    onClose: onCloseSave,
  } = useDisclosure();

  useEffect(() => {
    const isMac =
      typeof window !== 'undefined'
        ? navigator.platform.toUpperCase().indexOf('MAC') >= 0
        : false;

    async function onKeyDown(e: KeyboardEvent) {
      if (e.key.toLowerCase() === 's' && (isMac ? e.metaKey : e.ctrlKey)) {
        e.preventDefault();
        setSaveLoading(true);
        await saveFunc();
        setSaveLoading(false);
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [saveFunc]);

  return (
    <Nav p={2} bg="gray.200" justify="start">
      <Stack align="start" w="full">
        <HStack w="full">
          {/* <Image
            src={''}
            width={['30px']}
            className="mr-3"
            alt="Polyglot Logo"
          /> */}
          <ActionButton
            label="Save"
            // disabled={hydrated ? !checkSave : true}
            onClick={async () => {
              setSaveLoading(true);
              await saveFunc();
              setSaveLoading(false);
            }}
            icon={<CopyIcon w={6} h={6} color="blue.500" />}
            isLoading={saveLoading}
          />
          <ActionButton
            label="Deploy"
            // disabled={hydrated ? !checkSave : true}
            onClick={async () => {
              const topo = getTopoJson();
              await loadTopology(topo);
            }}
            icon={<CopyIcon w={6} h={6} color="blue.500" />}
            isLoading={saveLoading}
          />
          <DropDown
            name="File"
            options={[
              {
                name: 'Save',
                shortcut: 'Ctrl+S',
                icon: <CopyIcon mr={2} />,
                onClick: async () => {
                  setSaveLoading(true);
                  await saveFunc();
                  setSaveLoading(false);
                },
              },
              {
                name: 'Export JSON',
                shortcut: '',
                icon: <ExternalLinkIcon mr={2} />,
                onClick: onOpen,
              },
            ]}
          />
          <DropDown
            name="Run"
            options={[
              {
                name: 'Run on vscode',
                icon: <ArrowRightIcon mr={2} />,
                onClick: onOpenRun,
              },
            ]}
          />
          <DropDown
            name="Project"
            options={[
              {
                name: 'Edit Flow',
                icon: <EditIcon mr={2} />,
                onClick: onOpenEdit,
              },
            ]}
          />
          <Spacer />
          <Button
            leftIcon={<CloseIcon />}
            size="sm"
            colorScheme="red"
            variant="solid"
            // onClick={async () => {
            //   if (checkSave) onOpenSave();
            //   else {
            //     localStorage.removeItem('flow');
            //     await Router.push('/flows');
            //   }
            // }}
          >
            Leave editor
          </Button>
        </HStack>
      </Stack>
    </Nav>
  );
}

const ActionButton = ({
  label,
  disabled,
  onClick,
  icon,
  isLoading,
}: {
  label: string;
  disabled?: boolean;
  onClick?: () => void;
  icon: ReactNode;
  isLoading?: boolean;
}) => {
  return (
    <Tooltip label={label}>
      <Button
        isLoading={isLoading}
        disabled={disabled}
        padding={0}
        background="transparent"
        onClick={onClick}
      >
        {icon}
      </Button>
    </Tooltip>
  );
};

const DropDown = ({
  name,
  options,
}: {
  name: string;
  options: {
    name: string;
    shortcut?: string;
    icon?: React.ReactElement;
    onClick?: () => void;
  }[];
}) => {
  const { isOpen, onToggle, onClose } = useDisclosure();

  return (
    <Box>
      <Box
        width="100vw"
        height="100vh"
        position="absolute"
        left={0}
        top={0}
        onClick={onClose}
        zIndex={9}
        hidden={!isOpen}
      />
      <Button
        p={0}
        color="gray.600"
        bg={isOpen ? 'gray.300' : 'transparent'}
        _hover={{ bg: 'gray.300' }}
        onClick={() => onToggle()}
      >
        {name}
      </Button>
      <Box
        shadow={'lg'}
        position={'fixed'}
        bg="white"
        hidden={!isOpen}
        rounded="md"
        roundedTopLeft={'none'}
        zIndex={10}
      >
        {options.map((val, id) => (
          <Box
            key={id}
            color="black"
            bg={'transparent'}
            p={2}
            _hover={{ bg: 'gray.200' }}
            onClick={() => {
              val.onClick?.();
              onToggle();
            }}
          >
            <Flex align={'center'}>
              {val?.icon}
              <Text>{val.name}</Text>
              <Spacer minW={10} />
              <Text fontSize={'sm'} fontWeight={'semibold'} color="gray.500">
                {val.shortcut}
              </Text>
            </Flex>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
