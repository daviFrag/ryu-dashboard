'use client'

import { Box, Button, Flex, Heading, Link, Text } from '@chakra-ui/react';

export default function NotFound() {
  return (
    <Flex h="100vh" justifyContent="center" alignItems="center">
      <Box textAlign="center" py={10} px={6}>
        <Heading
          display="inline-block"
          as="h2"
          size="2xl"
          bgGradient="linear(to-r, purple.400, purple.600)"
          backgroundClip="text">
          404
        </Heading>
        <Text fontSize="18px" mt={3} mb={2}>
          Page Not Found
        </Text>
        <Text color={'gray.500'} mb={6}>
          The page you&apos;re looking for does not seem to exist
        </Text>

        <Link href='/'>
          <Button
            colorScheme="purple"
            bgGradient="linear(to-r, purple.400, purple.500, purple.600)"
            color="white"
            variant="solid">
            Go to Home
          </Button>
        </Link>
      </Box>
    </Flex>
  );
}